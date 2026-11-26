import Foundation

/// Reads Looscid backups: plaintext JSON or AES-GCM encrypted .looscid files.
/// Scaffold only. Decryption (PBKDF2-SHA256 + AES-GCM, AAD "looscid-backup-v1") is not implemented yet.
public enum BackupManager {
    public enum BackupError: Error, Equatable {
        case notABackup
        case passwordRequired
        case wrongPassword
        case damaged
        case notImplemented
    }

    public struct Backup: Equatable {
        public var nsec: String?
        public var profileName: String?
        public var categories: [String]
    }

    /// Parses plaintext JSON. Accepts a top-level looscid_backup_data marker or recognizable keys.
    public static func parsePlaintext(_ data: Data) throws -> Backup {
        guard let obj = try? JSONSerialization.jsonObject(with: data) as? [String: Any] else {
            throw BackupError.notABackup
        }
        if obj["looscid_backup"] != nil { throw BackupError.passwordRequired }
        let hints = ["key", "nsec", "profile", "app", "dreams", "pubkey", "npub"]
        guard obj["looscid_backup_data"] != nil || hints.contains(where: { obj[$0] != nil }) else {
            throw BackupError.notABackup
        }
        var nsec: String?
        if let key = obj["key"] as? [String: Any] { nsec = key["nsec"] as? String }
        if nsec == nil { nsec = obj["nsec"] as? String }
        let profile = obj["profile"] as? [String: Any]
        let name = profile?["name"] as? String
        let app = obj["app"] as? [String: Any] ?? [:]
        return Backup(nsec: nsec, profileName: name, categories: app.keys.sorted())
    }

    /// TODO: decrypt .looscid (kdf PBKDF2-SHA256, cipher AES-GCM, AAD "looscid-backup-v1").
    public static func decryptLooscid(_ data: Data, password: String) throws -> Backup {
        throw BackupError.notImplemented
    }
}
