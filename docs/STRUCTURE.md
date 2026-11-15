# Repository structure

## Purpose

This page says where things live, so structure is decided once and not re-argued.

## Root layout

- `app/` is the GitHub Pages deploy root. It is served on the web.
- `server/` holds server code.
- `docs/` holds documentation.
- `ios/` holds the iOS app source.
- `android/` holds the Android app source.

`ios/` and `android/` sit at the root, not inside `app/`. Everything under `app/` is published by Pages, and mobile build trees must not be served.

## Deploy root

Anything added inside `app/` goes public and gets served. Keep `app/` exactly as it is today so nothing that works now breaks.

## App location

Each app lives in one folder at `app/os/apps/<slug>/`. The slug is lowercase. Each app is described by one manifest in the format documented in `app/os/APPS.md`. An app appears in exactly one place. It is never duplicated per platform.

## Platforms

There is one entry per app. Platform is a field on the entry, not a folder. Add `platforms = ios, android, web` to the manifest, listing only platforms that actually shipped. Add `platforms` to the key table in `app/os/APPS.md`.

A tile or search result must never promise a download that does not exist.

## Merged apps

Merged apps collapse to one folder named with the surviving slug. Keep the retired name only as an entry in the manifest's existing `aliases` key, so search for the old name still finds the app and old links resolve. Never keep two folders for one merged app.

## Why not platform-first

Block's Buzz (`github.com/block/buzz`) splits by surface into `mobile/`, `web/`, `desktop/` and `crates/`. That suits a single product, not this repo. This repo's `app/` is a host holding many small apps, so a platform-first split would put the same app in several trees and let them drift.

## Two app homes

`app/os/apps/<slug>/` holds the in-OS apps. `app/projects/<slug>/` holds the larger standalone projects.

A project can also be packaged as an OS app and then exists in both homes on purpose. The two copies are separate builds with separate content, not duplicates.

Suggestion: the slim in-OS build loads the project's core in an iframe or shares its logic, so there is one source of truth for behavior and only the shell differs.

## Accessibility

Every folder name and label is read aloud by a screen reader, so keep names lowercase, literal and free of symbols.

## Voice

User-facing wording is first person singular. Never use we, us or our.
