package com.looscid.app.core

import org.json.JSONObject

/**
 * Reads Looscid backups: plaintext JSON or AES-GCM encrypted .looscid files.
 * Mirrors ios/Looscid/Core/BackupManager.swift.
 */
object BackupManager {
    data class Backup(val nsec: String?, val profileName: String?, val categories: List<String>)

    sealed class BackupError : Exception() {
        object NotABackup : BackupError()
        object PasswordRequired : BackupError()
        object WrongPassword : BackupError()
        object Damaged : BackupError()
        object NotImplemented : BackupError()
    }

    /** Parses plaintext JSON. Accepts a looscid_backup_data marker or recognizable keys. */
    fun parsePlaintext(text: String): Backup {
        val obj = try { JSONObject(text) } catch (e: Exception) { throw BackupError.NotABackup }
        if (obj.has("looscid_backup")) throw BackupError.PasswordRequired
        val hints = listOf("key", "nsec", "profile", "app", "dreams", "pubkey", "npub")
        if (!obj.has("looscid_backup_data") && hints.none { obj.has(it) }) throw BackupError.NotABackup
        val nsec = obj.optJSONObject("key")?.optString("nsec")?.takeIf { it.isNotEmpty() }
            ?: obj.optString("nsec").takeIf { it.isNotEmpty() }
        val profileName = obj.optJSONObject("profile")?.optString("name")?.takeIf { it.isNotEmpty() }
        val app = obj.optJSONObject("app")
        val categories = app?.keys()?.asSequence()?.toList()?.sorted() ?: emptyList()
        return Backup(nsec, profileName, categories)
    }

    /** TODO: decrypt .looscid (PBKDF2-SHA256 + AES-GCM, AAD "looscid-backup-v1"). */
    fun decryptLooscid(bytes: ByteArray, password: String): Backup = throw BackupError.NotImplemented
}
