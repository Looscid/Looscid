package com.looscid.app.core

import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.channels.BufferOverflow
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.Response
import okhttp3.WebSocket
import okhttp3.WebSocketListener
import org.json.JSONArray
import org.json.JSONObject
import kotlin.math.min
import kotlin.math.pow

/** Connection state, mirrors the iOS RelayState. */
sealed class RelayState {
    object Disconnected : RelayState()
    object Connecting : RelayState()
    object Connected : RelayState()
    data class Error(val message: String) : RelayState()
}

/** Subset of NIP-01 filter fields. Only non-null fields are serialized. */
data class NostrFilter(
    val ids: List<String>? = null,
    val authors: List<String>? = null,
    val kinds: List<Int>? = null,
    val since: Long? = null,
    val until: Long? = null,
    val limit: Int? = null,
) {
    fun toJson(): JSONObject = JSONObject().apply {
        ids?.let { put("ids", JSONArray(it)) }
        authors?.let { put("authors", JSONArray(it)) }
        kinds?.let { put("kinds", JSONArray(it)) }
        since?.let { put("since", it) }
        until?.let { put("until", it) }
        limit?.let { put("limit", it) }
    }
}

/** Inbound NIP-01 relay frame. */
sealed class RelayMessage {
    data class Event(val subscriptionId: String, val event: JSONObject) : RelayMessage()
    data class Eose(val subscriptionId: String) : RelayMessage()
    data class Closed(val subscriptionId: String, val reason: String) : RelayMessage()
    data class Ok(val eventId: String, val accepted: Boolean, val message: String) : RelayMessage()
    data class Notice(val message: String) : RelayMessage()
    object Unknown : RelayMessage()

    companion object {
        /** Parses one frame. Malformed input becomes Unknown and never throws. */
        fun parse(text: String): RelayMessage = try {
            val array = JSONArray(text)
            when (array.optString(0)) {
                "EVENT" -> Event(array.getString(1), array.getJSONObject(2))
                "EOSE" -> Eose(array.getString(1))
                "CLOSED" -> Closed(array.getString(1), array.optString(2, ""))
                "OK" -> Ok(array.getString(1), array.getBoolean(2), array.optString(3, ""))
                "NOTICE" -> Notice(array.optString(1, ""))
                else -> Unknown
            }
        } catch (e: Exception) {
            Unknown
        }
    }
}

/** Exponential backoff: baseDelayMs * 2^attempt, capped at maxDelayMs. */
data class RetryPolicy(
    val maxAttempts: Int = 6,
    val baseDelayMs: Long = 1_000L,
    val maxDelayMs: Long = 60_000L,
) {
    fun delayMs(attempt: Int): Long =
        min(maxDelayMs.toDouble(), baseDelayMs * 2.0.pow(min(attempt, 30))).toLong()
}

/**
 * Native NIP-01 relay client over OkHttp WebSocket.
 *
 * Lifecycle: create one instance per relay, call [connect], and call [close] from the
 * owning ViewModel's onCleared(). [close] cancels the internal scope, so no coroutine,
 * socket, or retry outlives the owner. The class holds no Context or Activity reference.
 *
 * Observe [state] and [messages] from Compose with collectAsStateWithLifecycle() and
 * LaunchedEffect, which stop collecting when the UI leaves the screen.
 */
class RelayConnection(
    val url: String,
    private val client: OkHttpClient = defaultClient,
    private val retryPolicy: RetryPolicy = RetryPolicy(),
) {
    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.IO)

    private val _state = MutableStateFlow<RelayState>(RelayState.Disconnected)
    val state: StateFlow<RelayState> = _state.asStateFlow()

    // Bounded buffer: a slow collector drops the oldest frames instead of growing memory.
    private val _messages = MutableSharedFlow<RelayMessage>(
        extraBufferCapacity = 256,
        onBufferOverflow = BufferOverflow.DROP_OLDEST,
    )
    val messages: SharedFlow<RelayMessage> = _messages.asSharedFlow()

    // Guarded by synchronized(this).
    private var socket: WebSocket? = null
    private var attempt = 0
    private var userClosed = true
    private val subscriptions = LinkedHashMap<String, List<NostrFilter>>()
    private var retryJob: kotlinx.coroutines.Job? = null

    fun connect() {
        synchronized(this) {
            userClosed = false
            attempt = 0
        }
        openSocket()
    }

    /** Sends CLOSE for each active subscription, shuts the socket, and stops retries. */
    fun close() {
        val toCancel: WebSocket?
        synchronized(this) {
            userClosed = true
            retryJob?.cancel()
            retryJob = null
            subscriptions.clear()
            toCancel = socket
            socket = null
        }
        toCancel?.close(NORMAL_CLOSURE, null)
        _state.value = RelayState.Disconnected
        scope.cancel()
    }

    /** Registers a subscription and sends REQ now if connected, otherwise on connect. */
    fun subscribe(id: String, filters: List<NostrFilter>) {
        require(id.length in 1..64) { "NIP-01 subscription id must be 1 to 64 characters" }
        val (ws, ready) = synchronized(this) {
            subscriptions[id] = filters
            socket to (_state.value == RelayState.Connected)
        }
        if (ready && ws != null) ws.send(reqFrame(id, filters))
    }

    /** Removes a subscription and sends CLOSE if connected. */
    fun unsubscribe(id: String) {
        val (ws, ready) = synchronized(this) {
            subscriptions.remove(id)
            socket to (_state.value == RelayState.Connected)
        }
        if (ready && ws != null) ws.send(JSONArray().put("CLOSE").put(id).toString())
    }

    /** Sends a raw client frame, for example an EVENT publish. */
    fun send(text: String): Boolean {
        val ws = synchronized(this) { if (_state.value == RelayState.Connected) socket else null }
        return ws?.send(text) ?: false
    }

    private fun openSocket() {
        val request = Request.Builder().url(url).build()
        val ws: WebSocket
        synchronized(this) {
            retryJob?.cancel()
            retryJob = null
            socket?.cancel()
            ws = client.newWebSocket(request, Listener(this))
            socket = ws
        }
        _state.value = RelayState.Connecting
    }

    private fun onOpen(ws: WebSocket) {
        val pending: Map<String, List<NostrFilter>>
        synchronized(this) {
            if (socket !== ws) return
            attempt = 0
            pending = LinkedHashMap(subscriptions)
        }
        _state.value = RelayState.Connected
        // Restore every active subscription after a reconnect.
        pending.forEach { (id, filters) -> ws.send(reqFrame(id, filters)) }
    }

    private fun onText(ws: WebSocket, text: String) {
        if (synchronized(this) { socket !== ws }) return
        _messages.tryEmit(RelayMessage.parse(text))
    }

    private fun onFailure(ws: WebSocket, error: Throwable) {
        val next: Long?
        synchronized(this) {
            if (socket !== ws) return
            socket = null
            if (userClosed) {
                next = null
            } else {
                val current = attempt
                attempt += 1
                next = if (current < retryPolicy.maxAttempts) retryPolicy.delayMs(current) else -1L
            }
        }
        val message = error.message ?: "Connection failed"
        when {
            next == null -> _state.value = RelayState.Disconnected
            next < 0L -> _state.value = RelayState.Error(message)
            else -> {
                _state.value = RelayState.Error(message)
                retryJob = scope.launch {
                    delay(next)
                    openSocket()
                }
            }
        }
    }

    private fun onClosed(ws: WebSocket) {
        synchronized(this) {
            if (socket !== ws) return
            socket = null
        }
        _state.value = RelayState.Disconnected
    }

    private fun reqFrame(id: String, filters: List<NostrFilter>): String {
        val array = JSONArray().put("REQ").put(id)
        filters.forEach { array.put(it.toJson()) }
        return array.toString()
    }

    /** Routes OkHttp callbacks back to the owning connection. Holds no strong Activity reference. */
    private class Listener(private val owner: RelayConnection) : WebSocketListener() {
        override fun onOpen(webSocket: WebSocket, response: Response) = owner.onOpen(webSocket)
        override fun onMessage(webSocket: WebSocket, text: String) = owner.onText(webSocket, text)
        override fun onFailure(webSocket: WebSocket, t: Throwable, response: Response?) =
            owner.onFailure(webSocket, t)
        override fun onClosed(webSocket: WebSocket, code: Int, reason: String) = owner.onClosed(webSocket)
    }

    companion object {
        private const val NORMAL_CLOSURE = 1000

        /** Shared client: one connection pool and thread pool for all relays. */
        val defaultClient: OkHttpClient by lazy {
            OkHttpClient.Builder()
                .pingInterval(30, java.util.concurrent.TimeUnit.SECONDS)
                .build()
        }
    }
}
