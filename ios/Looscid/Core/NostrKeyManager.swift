import Foundation
import Security

/// Keychain-backed storage for the user's Nostr key.
/// The nsec never leaves this device. Signing (secp256k1 Schnorr) is not implemented yet.
public final class NostrKeyManager {
    public enum KeyError: Error, Equatable {
        case invalidNsec
        case keychain(OSStatus)
        case notImplemented
    }

    private let service = "com.looscid.nostr"
    private let account = "nsec"

    public init() {}

    /// Stores a 32-byte private key as hex in the device Keychain, this device only.
    public func store(privateKeyHex: String) throws {
        guard privateKeyHex.count == 64 else { throw KeyError.invalidNsec }
        let data = Data(privateKeyHex.utf8)
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: account,
            kSecValueData as String: data,
            kSecAttrAccessible as String: kSecAttrAccessibleWhenUnlockedThisDeviceOnly
        ]
        SecItemDelete(query as CFDictionary)
        let status = SecItemAdd(query as CFDictionary, nil)
        guard status == errSecSuccess else { throw KeyError.keychain(status) }
    }

    /// Loads the stored private key hex, or nil if none is stored.
    public func loadPrivateKeyHex() throws -> String? {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: account,
            kSecReturnData as String: true,
            kSecMatchLimit as String: kSecMatchLimitOne
        ]
        var item: CFTypeRef?
        let status = SecItemCopyMatching(query as CFDictionary, &item)
        if status == errSecItemNotFound { return nil }
        guard status == errSecSuccess, let data = item as? Data else { throw KeyError.keychain(status) }
        return String(decoding: data, as: UTF8.self)
    }

    /// Removes the stored key.
    public func deleteKey() throws {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: account
        ]
        let status = SecItemDelete(query as CFDictionary)
        guard status == errSecSuccess || status == errSecItemNotFound else { throw KeyError.keychain(status) }
    }

    /// TODO: bech32 decode nsec, derive x-only pubkey with secp256k1, encode npub.
    public func publicKeyNpub() throws -> String {
        throw KeyError.notImplemented
    }
}
