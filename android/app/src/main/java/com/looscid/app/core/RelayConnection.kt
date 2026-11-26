package com.looscid.app.core

/**
 * Native Nostr relay client. Scaffold only: no WebSocket connection is opened yet.
 */
class RelayConnection(val url: String) {
    /** TODO: open a WebSocket to [url] (OkHttp or Ktor), send and receive raw JSON frames. */
    fun connect() = throw NotImplementedError("RelayConnection.connect")

    fun close() {}
}
