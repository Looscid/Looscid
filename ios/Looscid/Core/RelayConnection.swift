import Foundation

/// Native Nostr relay client over URLSessionWebSocketTask.
/// Scaffold only: connects and sends raw JSON frames. No subscription management yet.
public final class RelayConnection {
    public let url: URL
    private var task: URLSessionWebSocketTask?
    private let session: URLSession

    public init(url: URL, session: URLSession = .shared) {
        self.url = url
        self.session = session
    }

    public func connect() {
        let t = session.webSocketTask(with: url)
        task = t
        t.resume()
    }

    public func send(_ text: String) async throws {
        guard let task else { throw URLError(.notConnectedToInternet) }
        try await task.send(.string(text))
    }

    public func receive() async throws -> String {
        guard let task else { throw URLError(.notConnectedToInternet) }
        let message = try await task.receive()
        switch message {
        case .string(let s): return s
        case .data(let d): return String(decoding: d, as: UTF8.self)
        @unknown default: return ""
        }
    }

    public func close() {
        task?.cancel(with: .normalClosure, reason: nil)
        task = nil
    }
}
