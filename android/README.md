# Looscid Android

Native Kotlin and Jetpack Compose client for Looscid. Local-first, accessible, zero bloat.

This folder is the Android app in the Looscid monorepo. It mirrors the layout of ios/ so both clients share the same screens and vocabulary.

## Layout

```
android/
  settings.gradle.kts
  build.gradle.kts
  app/
    build.gradle.kts
    src/main/
      AndroidManifest.xml
      java/com/looscid/app/
        LooscidApp.kt
        MainActivity.kt
        core/
          NostrKeyManager.kt
          RelayConnection.kt
          BackupManager.kt
        ui/
          LooscidTabs.kt
          RestoreScreen.kt
```

## Principles

- Keys: the Nostr key is stored with the Android Keystore (hardware-backed where available). It never leaves the device except as signatures.
- Accessibility: Compose semantics on every interactive element (roles, state, content descriptions), touch targets of at least 48dp, progress and results announced via live regions. No information is conveyed by color alone.
- Navigation: a bottom NavigationBar with Feed, Dreams, Relays, Settings.

## Status

Scaffold only. Key derivation, relay subscriptions, and backup decryption are not implemented. Nothing has been compiled yet.

## Build

Requires Android Studio with JDK 17 and the Android SDK (compileSdk 35, minSdk 26).
