# Looscid iOS

Native Swift and SwiftUI client for Looscid. Local-first, accessible, zero bloat.

This folder is the iOS app in the Looscid monorepo. It mirrors the standalone repo Looscid/looscid-ios (DEV).

## Layout

```
ios/
  Package.swift
  Looscid/
    LooscidApp.swift
    Core/
      NostrKeyManager.swift
      RelayConnection.swift
      BackupManager.swift
    UI/
      ContentView.swift
      RestoreView.swift
  Tests/LooscidCoreTests/
    BackupManagerTests.swift
```

## Principles

- Keys: the Nostr key lives in the iOS Keychain (this device only). It never leaves the device except as signatures.
- Accessibility: standard SwiftUI controls so VoiceOver, Dynamic Type, and Switch Control work. Navigation is a TabView with Feed, Dreams, Relays, Settings. Results and progress are announced.
- No information is conveyed by color alone.

## Status

Scaffold only. Key derivation (bech32, secp256k1 Schnorr), relay subscriptions, and AES-GCM/PBKDF2 backup decryption are not implemented. Nothing has been compiled yet.

## Build

Requires Xcode 16 or later on macOS. Targets iOS 17 and later.
