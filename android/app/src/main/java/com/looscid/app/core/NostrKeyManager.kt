package com.looscid.app.core

/**
 * Nostr key storage backed by the Android Keystore.
 * Scaffold only. The private key is not stored or derived yet, and signing is not implemented.
 */
class NostrKeyManager {
    sealed class KeyError : Exception() {
        object InvalidNsec : KeyError()
        object NotImplemented : KeyError()
    }

    /** TODO: wrap the key with a Keystore AES key and persist the ciphertext. */
    fun store(privateKeyHex: String) {
        if (privateKeyHex.length != 64) throw KeyError.InvalidNsec
        throw KeyError.NotImplemented
    }

    /** TODO: decrypt the stored key with the Keystore AES key. */
    fun loadPrivateKeyHex(): String? = null

    /** TODO: bech32 decode nsec, derive x-only pubkey with secp256k1, encode npub. */
    fun publicKeyNpub(): String = throw KeyError.NotImplemented
}
