# Looscid apps

How apps are described, installed and written on Looscid OS. The same format
is meant for the NexOS edition (this repo) and the Linux edition later.

## The pieces

| Piece | Where | What it is |
|---|---|---|
| Manifest | `kernel/catalog/<id>.app` | A small text file that describes one app |
| Catalog | `store/<id>.app` in the filesystem | The manifests, unpacked from the OS image at boot |
| Installed list | `system/installed.txt` | One line per installed app: `<id> <version>` |
| Program registry | `kernel/src/user.rs` (`APPS`) | Maps a manifest's `entry` to code: a ring-3 ELF or a native kernel app |
| App Store | `kernel/src/apps/store.rs` | List, info, install, uninstall, update, search, installed, Home |
| Native app toolkit | `kernel/src/apps/ui.rs` | Shared helpers so every native app looks and sounds the same |
| Ring-3 app API | `userland/src/lib.rs` (crate `looscid`) | System call wrappers for user-mode apps |

There is no network yet, so the store is offline: every package in the
catalog ships inside the OS image. "Install" checks the package and adds it to
`system/installed.txt`; "uninstall" takes it off. The list lives in the
in-memory filesystem, so it lasts until you reboot. Once NexOS has a disk,
the same files will be saved there.

## Manifest format

Plain `key = value` lines. `#` starts a comment. Unknown keys are ignored, so
newer manifests still load on older systems.

```
# Looscid app manifest
id = piano
name = Piano
version = 1.0
category = Music
size_kb = 7
kind = native
entry = piano
preinstalled = no
removable = yes
aliases = keyboard piano, music
summary = Play notes on the PC speaker with the number keys.
description = A keyboard piano. Keys 1 to 8 play a scale, ...
keys = 1 to 8 notes, + and - octave, s song, r replay, h help, q quit
```

| Key | Required | Meaning |
|---|---|---|
| `id` | yes | Short lowercase name. It is also the command that opens the app |
| `name` | yes | Name shown to people |
| `version` | no (1.0) | Compared with `system/installed.txt` by `update` |
| `category` | no | One word: System, Productivity, Utilities, Music, Games, Wellness, Developer |
| `size_kb` | no | Size shown in the store. Ring-3 apps report their real ELF size |
| `kind` | no (native) | `native` (runs inside the kernel) or `elf` (ring-3 program) |
| `entry` | no (= id) | The program in the registry to start |
| `preinstalled` | no (no) | `yes` puts it on a fresh system |
| `removable` | no (yes) | `no` for system apps the store must not remove |
| `aliases` | no | Comma-separated other names that also open the app |
| `summary` | yes | One short line for lists |
| `description` | no | A few sentences for `info` |
| `keys` | no | One line saying which keys the app uses |

Write `summary`, `description` and `keys` as plain sentences. They are read
aloud by screen readers, so no ASCII art and no symbols that only make sense
visually.

## The apps in v0.4

| App | id | Kind | On a fresh system |
|---|---|---|---|
| App Store | `store` | native | preinstalled, can't be removed |
| Notes | `notes` | native | preinstalled |
| Calculator | `calc` | native | preinstalled |
| Clock (time, timer, stopwatch, alarm) | `clock` | native | preinstalled |
| System Info | `sysinfo` | native | preinstalled |
| Insomnia | `insomnia` | native | preinstalled |
| Hello | `hello` | ring 3 | preinstalled |
| Piano | `piano` | native | in the store |
| Guess the Number | `guess` | ring 3 | in the store |

## Rules every app follows

- Keyboard only. Every app works over the serial console with a screen reader.
- It opens with its name and version, one sentence, then "Type h for help, q to quit."
- `h` shows help, `q` quits, `Esc` also quits.
- Short plain lines. Every status is said in words ("Saved note 1, groceries.").
  Errors start with the word "Error" and play the error tone.
- When it closes it says so: "Closed Notes."
- Sounds go through the PC speaker helpers and respect `mute`.

## Sounds

| Sound | When | Notes |
|---|---|---|
| Install chime | an app finished installing, or updates applied | rising C6 E6 G6 C7 |
| Uninstall chime | an app was removed | falling G5, C5 |
| Error tone | anything went wrong | two low G3 buzzes |
| Alarm chime | a Clock timer or alarm finished | three rounds of quick A6 triple beeps |
| Click | a save or stop | one short E6 |

They live in `kernel/src/timer.rs` (`install_chime`, `uninstall_chime`,
`error_tone`, `alarm_chime`, `ok_click`).

## Writing a native app

1. Add `kernel/src/apps/<id>.rs` with `pub fn run()`. Use the toolkit:

```rust
use super::ui;

pub fn run() {
    ui::title("Notes", "1.0", "You have 2 notes.");
    loop {
        let Some(line) = ui::read_line("notes> ") else { break }; // Esc
        match line.as_str() {
            "" => {}
            l if ui::is_quit(l) => break,
            l if ui::is_help(l) => help(),
            other => ui::error(format_args!("unknown command \"{}\". Type h for help.", other)),
        }
    }
    ui::closed("Notes");
}
```

2. Add `pub mod <id>;` to `kernel/src/apps/mod.rs`.
3. Register it in `kernel/src/user.rs`:
   `App { name: "<id>", kind: AppKind::Native(crate::apps::<id>::run) }`
4. Write `kernel/catalog/<id>.app` and add it to `BUNDLED` in `apps/store.rs`.

## Writing a ring-3 app

Ring-3 apps live in `userland/` and use the `looscid` crate. They can't touch
kernel memory or hardware; everything goes through system calls.

```rust
#![no_std]
#![no_main]
use looscid::{beep, println, read_line, Buf};

#[no_mangle]
pub extern "C" fn _start() -> ! {
    looscid::title("Echo", "1.0", "Type something.");
    let mut line: Buf<64> = Buf::new();
    while read_line("> ", &mut line) && line.as_str() != "q" {
        println!("You said {}.", line.as_str());
        beep(880, 60);
    }
    looscid::exit(0)
}

#[panic_handler]
fn panic(_: &core::panic::PanicInfo) -> ! { looscid::exit(1) }
```

Add a `[[bin]]` in `userland/Cargo.toml`, embed the binary in
`kernel/build.rs` and `kernel/src/user.rs` (see `guess`), register it, and
write its manifest with `kind = elf`.

### System calls (`int 0x80`)

Call number in RAX, arguments in RDI and RSI, result in RAX.

| # | Call | Arguments | Returns |
|---|---|---|---|
| 0 | `exit` | code | never returns |
| 1 | `write` | pointer, length (UTF-8, up to 4 KB) | length written |
| 2 | `uptime_ms` | | milliseconds since boot |
| 3 | `getpid` | | process id (1 for now) |
| 4 | `read_key` | | one key byte: Enter 10, Backspace 8, Esc 27 |
| 5 | `beep` | frequency in Hz, milliseconds (up to 3000) | 0 |
| 6 | `sleep_ms` | milliseconds (up to 10000) | 0 |

## The Linux edition

The Linux edition will read the same `.app` manifests. `kind = elf` apps get
a Linux backend for the `looscid` crate (write to stdout, read from a raw
terminal, beep through the sound card), and native apps move to user space.
The store, the installed list and the app rules stay the same, so an app
written once runs on both editions.
