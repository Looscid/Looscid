import Foundation

/// Native NIP-01 relay client over URLSessionWebSocketTask.
/// Foundation only. No third-party WebSocket or Nostr libraries.
///
/// Threading: public methods are safe to call from any thread. The onMessage and
/// onStateChange callbacks run on URLSession's delegate queue, so hop to the main
/// actor before touching UI state.
///
/// Memory: the receive loop holds self weakly, sockets are cancelled on close and
/// deinit, and subscriptions are dropped on close so nothing lingers in memory.

public enum RelayState: Equatable {
    case disconnected
    case connecting
    case connected
    case error(String)
}

public enum RelayError: Error, Equatable {
    case notConnected
    case invalidSubscriptionId
}

public struct NostrFilter: Codable, Equatable {
    public var ids: [String]?
    public var authors: [String]?
    public var kinds: [Int]?
    public var since: Int?
    public var until: Int?
    public var limit: Int?

    public init(ids: [String]? = nil, authors: [String]? = nil, kinds: [Int]? = nil,
                since: Int? = nil, until: Int? = nil, limit: Int? = nil) {
        self.ids = ids
        self.authors = authors
        self.kinds = kinds
        self.since = since
        self.until = until
        self.limit = limit
    }
}

public struct NostrEvent: Codable, Equatable {
    public let id: String
    public let pubkey: String
    public let created_at: Int
    public let kind: Int
    public let tags: [[String]]
    public let content: String
    public let sig: String
}

public enum RelayMessage: Equatable {
    case event(subscriptionId: String, event: NostrEvent)
    case eose(subscriptionId: String)
    case closed(subscriptionId: String, reason: String)
    case ok(eventId: String, accepted: Bool, message: String)
    case notice(String)
    case unknown

    /// Parses one inbound NIP-01 relay frame. Malformed frames become .unknown.
    public static func parse(_ text: String) -> RelayMessage {
        guard let data = text.data(using: .utf8),
              let array = try? JSONSerialization.jsonObject(with: data) as? [Any],
              let type = array.first as? String else { return .unknown }

        switch type {
        case "EVENT":
            guard array.count >= 3,
                  let sub = array[1] as? String,
                  let eventData = try? JSONSerialization.data(withJSONObject: array[2]),
                  let event = try? JSONDecoder().decode(NostrEvent.self, from: eventData) else { return .unknown }
            return .event(subscriptionId: sub, event: event)
        case "EOSE":
            guard array.count >= 2, let sub = array[1] as? String else { return .unknown }
            return .eose(subscriptionId: sub)
        case "CLOSED":
            guard array.count >= 2, let sub = array[1] as? String else { return .unknown }
            let reason = array.count >= 3 ? (array[2] as? String ?? "") : ""
            return .closed(subscriptionId: sub, reason: reason)
        case "OK":
            guard array.count >= 3,
                  let id = array[1] as? String,
                  let accepted = array[2] as? Bool else { return .unknown }
            let message = array.count >= 4 ? (array[3] as? String ?? "") : ""
            return .ok(eventId: id, accepted: accepted, message: message)
        case "NOTICE":
            let message = array.count >= 2 ? (array[1] as? String ?? "") : ""
            return .notice(message)
        default:
            return .unknown
        }
    }
}

public struct RetryPolicy: Equatable {
    public var maxAttempts: Int
    public var baseDelay: TimeInterval
    public var maxDelay: TimeInterval

    public static let standard = RetryPolicy(maxAttempts: 6, baseDelay: 1, maxDelay: 60)

    public init(maxAttempts: Int, baseDelay: TimeInterval, maxDelay: TimeInterval) {
        self.maxAttempts = maxAttempts
        self.baseDelay = baseDelay
        self.maxDelay = maxDelay
    }

    /// Exponential backoff: baseDelay * 2^attempt, capped at maxDelay.
    func delay(forAttempt attempt: Int) -> TimeInterval {
        min(maxDelay, baseDelay * pow(2, Double(min(attempt, 30))))
    }
}

public final class RelayConnection {
    public let url: URL
    public var retryPolicy: RetryPolicy
    public var onMessage: ((RelayMessage) -> Void)?
    public var onStateChange: ((RelayState) -> Void)?

    private enum Outcome {
        case ignore
        case stop
        case giveUp
        case retry(DispatchWorkItem, TimeInterval)
    }

    private let session: URLSession
    private let lock = NSLock()
    private var socket: URLSessionWebSocketTask?
    private var connectionState: RelayState = .disconnected
    private var subscriptions: [String: [NostrFilter]] = [:]
    private var attempt = 0
    private var retryWork: DispatchWorkItem?
    private var userClosed = true

    public init(url: URL, session: URLSession = .shared, retryPolicy: RetryPolicy = .standard) {
        self.url = url
        self.session = session
        self.retryPolicy = retryPolicy
    }

    deinit {
        retryWork?.cancel()
        socket?.cancel(with: .goingAway, reason: nil)
    }

    public var state: RelayState {
        locked { connectionState }
    }

    // MARK: - Lifecycle

    public func connect() {
        locked {
            userClosed = false
            attempt = 0
        }
        openSocket()
    }

    /// Ends the session, drops all subscriptions, and stops any pending retry.
    public func close() {
        let t: URLSessionWebSocketTask? = locked {
            userClosed = true
            retryWork?.cancel()
            retryWork = nil
            subscriptions.removeAll()
            let current = socket
            socket = nil
            return current
        }
        t?.cancel(with: .normalClosure, reason: nil)
        setState(.disconnected)
    }

    // MARK: - NIP-01 subscriptions

    /// Registers a subscription and sends REQ now if connected, otherwise on connect.
    public func subscribe(id: String, filters: [NostrFilter]) async throws {
        try Self.validateSubscriptionId(id)
        let (t, ready): (URLSessionWebSocketTask?, Bool) = locked {
            subscriptions[id] = filters
            return (socket, connectionState == .connected)
        }
        guard ready, let t else { return }
        try await t.send(.string(try reqFrame(id: id, filters: filters)))
    }

    /// Removes a subscription and sends CLOSE if connected.
    public func unsubscribe(id: String) async throws {
        try Self.validateSubscriptionId(id)
        let (t, ready): (URLSessionWebSocketTask?, Bool) = locked {
            subscriptions.removeValue(forKey: id)
            return (socket, connectionState == .connected)
        }
        guard ready, let t else { return }
        try await t.send(.string(try Self.encodeFrame(["CLOSE", id])))
    }

    /// Sends a raw client frame (for example an EVENT publish) on the open socket.
    public func send(_ text: String) async throws {
        guard let t = locked({ connectionState == .connected ? socket : nil }) else {
            throw RelayError.notConnected
        }
        try await t.send(.string(text))
    }

    // MARK: - Socket management

    private func openSocket() {
        let t: URLSessionWebSocketTask = locked {
            retryWork?.cancel()
            retryWork = nil
            socket?.cancel(with: .goingAway, reason: nil)
            let fresh = session.webSocketTask(with: url)
            socket = fresh
            return fresh
        }
        setState(.connecting)
        t.resume()
        // A successful pong confirms the socket is actually open.
        t.sendPing { [weak self] error in
            guard let self else { return }
            if let error {
                self.handleFailure(error, from: t)
            } else {
                self.handleOpened(t)
            }
        }
    }

    private func handleOpened(_ t: URLSessionWebSocketTask) {
        let pending: [String: [NostrFilter]]? = locked {
            guard socket === t else { return nil }
            attempt = 0
            connectionState = .connected
            return subscriptions
        }
        guard let pending else { return }
        onStateChange?(.connected)
        // Restore every active subscription after a reconnect.
        for (id, filters) in pending {
            if let frame = try? reqFrame(id: id, filters: filters) {
                t.send(.string(frame)) { _ in }
            }
        }
        receiveLoop(t)
    }

    private func receiveLoop(_ t: URLSessionWebSocketTask) {
        t.receive { [weak self] result in
            guard let self else { return }
            switch result {
            case .success(let message):
                guard self.isCurrent(t) else { return }
                let text: String
                switch message {
                case .string(let s): text = s
                case .data(let d): text = String(decoding: d, as: UTF8.self)
                @unknown default: text = ""
                }
                let handler = self.locked { self.onMessage }
                handler?(RelayMessage.parse(text))
                self.receiveLoop(t)
            case .failure(let error):
                self.handleFailure(error, from: t)
            }
        }
    }

    private func handleFailure(_ error: Error, from t: URLSessionWebSocketTask) {
        let outcome: Outcome = locked {
            guard socket === t else { return .ignore }
            socket = nil
            if userClosed { return .stop }
            let current = attempt
            attempt += 1
            guard current < retryPolicy.maxAttempts else { return .giveUp }
            let work = DispatchWorkItem { [weak self] in self?.openSocket() }
            retryWork = work
            return .retry(work, retryPolicy.delay(forAttempt: current))
        }
        switch outcome {
        case .ignore:
            return
        case .stop:
            setState(.disconnected)
        case .giveUp:
            setState(.error(error.localizedDescription))
        case .retry(let work, let delay):
            setState(.error(error.localizedDescription))
            DispatchQueue.global().asyncAfter(deadline: .now() + delay, execute: work)
        }
    }

    // MARK: - Helpers

    private func setState(_ newState: RelayState) {
        let callback: ((RelayState) -> Void)? = locked {
            connectionState = newState
            return onStateChange
        }
        callback?(newState)
    }

    private func isCurrent(_ t: URLSessionWebSocketTask) -> Bool {
        locked { socket === t }
    }

    private func locked<T>(_ body: () -> T) -> T {
        lock.lock()
        defer { lock.unlock() }
        return body()
    }

    private func reqFrame(id: String, filters: [NostrFilter]) throws -> String {
        var parts: [Any] = ["REQ", id]
        for filter in filters {
            parts.append(try Self.jsonObject(filter))
        }
        return try Self.encodeFrame(parts)
    }

    private static func validateSubscriptionId(_ id: String) throws {
        // NIP-01: subscription ids are 1 to 64 characters.
        guard (1...64).contains(id.count) else { throw RelayError.invalidSubscriptionId }
    }

    private static func jsonObject<T: Encodable>(_ value: T) throws -> Any {
        try JSONSerialization.jsonObject(with: JSONEncoder().encode(value))
    }

    private static func encodeFrame(_ parts: [Any]) throws -> String {
        let data = try JSONSerialization.data(withJSONObject: parts)
        return String(decoding: data, as: UTF8.self)
    }
}
