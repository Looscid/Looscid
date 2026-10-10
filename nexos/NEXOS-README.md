# Looscid OS (NexOS kernel)

Looscid OS is a hobby operating system for x86_64, written in Rust.
**NexOS** is its kernel; **Looscid OS** is the system layer that runs on top of it.

It boots on real BIOS hardware or in QEMU, drops you into the `looscid>` shell,
and comes with its own **App Store** and a set of built-in apps. Everything is
keyboard-only and reads well with a screen reader over the serial console.

Current version: **0.4** (the App Store release).

```
NexOS kernel v0.4.0 (x86_64) - booting Looscid OS
[ ok ] boot loader: GRUB 2.06
...
[ ok ] in-memory filesystem: 3 files
[ ok ] user mode: 9 programs registered, syscalls via int 0x80
[ ok ] App Store: 9 apps in the catalog, 7 installed
Welcome to Looscid OS.
Looscid OS shell ready. Type 'help' for commands.
Type home for your apps, or store for the App Store.
looscid> store install piano
Installing Piano 1.0, 7 KB.
Checking the package. OK.
Installed Piano. Open it with: piano
looscid> calc

Calculator 1.0
Type a sum like 12 * (3 + 4) and press Enter.
Type h for help, q to quit.
calc> 12 * (3 + 4)
= 84
```

## Features

**NexOS kernel**
- Boots with GRUB via Multiboot2; a small 32-bit stub sets up page tables and switches to 64-bit long mode
- GDT + TSS (separate kernel and user segments, a dedicated double-fault stack)
- IDT with handlers for breakpoint, invalid opcode, page fault, general protection fault and double fault
- 8259 PIC + PIT timer at 100 Hz (`uptime`)
- PS/2 keyboard input (US layout), plus keyboard input over the serial port
- Physical frame allocator built from the Multiboot2 memory map
- Paging: the kernel maps new pages through the live page tables (heap, user programs)
- 1 MiB kernel heap (`alloc`: `Box`, `Vec`, `String`)
- System calls through `int 0x80`: `exit`, `write`, `uptime_ms`, `getpid`, `read_key`, `beep`, `sleep_ms`
- Loads ELF programs into a user address window and runs them in ring 3. A crash in a program stops only that program, not the kernel
- PC speaker on PIT channel 2: boot chime (`beep`), background soundscapes driven by the timer interrupt, `mute`, and a `sound` status line
- CMOS real-time clock (timestamps for notes)
- A panic handler with a recursion lock that reports file and line

**Looscid OS**
- The `looscid>` shell: `help`, `clear`, `about`, `uptime`, `echo`, `mem`, `ls`, `cat`, `write`, `rm`, `home`, `store`, `apps`, `run`, `beep`, `mute`, `sound`, `theme`, `int3`, `reboot`. Typing an app's name (`notes`, `calc`, `clock`...) opens it
- **App Store** (`store`, or `s` from Home): a numbered, keyboard-driven catalog of apps that works offline. Commands: `list`, `info 8`, `install piano`, `uninstall piano`, `update`, `search music`, `installed`, `open piano`. Each also works straight from the shell (`store install piano`). A rising chime plays when an install finishes, a falling one on uninstall, and a low buzz on errors. Every status is said in words
- **Home** (`home`): your installed apps, numbered. Type a number to open one
- Built-in apps, all keyboard-only with the same keys (`h` help, `q` quit):
  - **Notes** (`notes`): write, list, read and delete notes. Each note is a file in `notes/`, so `cat notes/groceries` works in the shell
  - **Calculator** (`calc`): `12 * (3 + 4)`, `ans / 2`, `sqrt 16`, `2^10`, `10 % 3`, `pi`
  - **Clock** (`clock`): the time, `timer 30` / `timer 5m` with a spoken countdown, a stopwatch with laps, `alarm 7:30`, and an alarm chime
  - **System Info** (`sysinfo`): version, uptime, clock, memory, apps, files and sound in plain words
  - **Insomnia** (below) and **Hello** (the first ring-3 program)
- Apps you get from the App Store:
  - **Piano**: keys 1 to 8 play a scale on the PC speaker, `+`/`-` change octave, `s` plays Ode to Joy, `r` replays your last notes. Every note is said by name
  - **Guess the Number**: a ring-3 game. Find the number from 1 to 100 in 7 guesses; "higher" and "lower" come as words and as a rising or falling tone
- Apps are described by small text manifests, so new apps (and the Linux edition later) share one format. See [docs/APPS.md](docs/APPS.md)
- An in-memory filesystem (`ls`, `cat`, `write`, `rm`)
- `userland/hello`: the first ring-3 Looscid program, embedded in the kernel image
- **Insomnia** (`insomnia` or `run insomnia`): an app for when you can't sleep, ported from the [Insomnia OS](https://github.com/2three1y/insomnia-os) web toy. It opens on a small menu:
  - **1 Sheep**: a moon, gently twinkling stars and a fence. Press Space and a sheep hops over; the counter has notes at milestones (try reaching #404). `T` stops the twinkling.
  - **2 Thoughts**: the 4am notepad. Type a thought and press Enter; it is saved with the time to `thoughts.txt`, so `cat thoughts.txt` in the shell shows it. Tab reads every saved thought back on the serial console.
  - **3 Sounds**: soundscapes on the PC speaker: Rain, Fan, Crickets, Old PC and Brahms' Lullaby. `F`/`S` change the tempo, `I` changes the intensity (soft, medium, full). The speaker has one voice and no volume knob, so intensity changes how busy the sound is. The sound keeps playing while you count sheep or write.
  - **4 Goodnight**: a gentle chime and a calm screen: "Goodnight, friend. It's now safe to turn off your brain." Then back to the shell.
  - `M` turns sound on or off anywhere in the app, and `Esc` goes back (to the menu, then to the shell). A screen reader on serial hears every screen, every choice and every sheep as plain sentences, and none of the ASCII art.

## Accessibility

- **Keyboard only.** Nothing needs a mouse.
- **Screen-reader friendly serial console.** Everything printed to the screen is also printed to COM1, and the shell accepts typing from the serial line too. You can use the whole OS from a terminal with a screen reader (`make serial`). The serial output contains no ANSI escape codes, so nothing gets read aloud as noise.
- **High contrast.** Bright white on black by default. `theme light` switches to black on white.
- **Sound is optional.** The boot chime is short, and `mute` (or `M` in Insomnia) turns all sound off, soundscapes included.
- **Apps speak in words.** Every app opens with its name and the keys to use, says every result as a sentence, starts errors with "Error", and says "Closed" when it closes. Sounds (install, uninstall, error, alarm) always come with words too.

## Build and run

You need: a Rust **nightly** toolchain (`rust-toolchain.toml` selects it automatically via rustup), plus
`qemu-system-x86_64`, `grub-mkrescue` (`grub-pc-bin` + `grub-common`), `xorriso` and `mtools`.

```sh
# Debian / Ubuntu
sudo apt install qemu-system-x86 grub-pc-bin grub-common xorriso mtools
curl https://sh.rustup.rs -sSf | sh     # if you don't have rustup yet

make            # build userland + kernel + build/looscid.iso
make run        # boot in QEMU (VGA window, serial log in this terminal, PC speaker on your speakers)
make serial     # boot headless: serial console only (screen readers)
make wav        # headless, records the PC speaker to build/speaker.wav
make run AUDIO=none   # no sound (or AUDIO=sdl / alsa if PulseAudio isn't there)
./build.sh --qemu   # same as make run
```

The ISO also boots on BIOS PCs from a USB stick (`dd` it to the stick).

## Layout

```
nexos/
├── Cargo.toml            # workspace: kernel + userland
├── rust-toolchain.toml   # nightly + rust-src + llvm-tools
├── .cargo/config.toml    # target x86_64-unknown-none (built in, no custom JSON)
├── Makefile, build.sh    # build + ISO + QEMU
├── boot/grub.cfg         # GRUB menu entry (multiboot2)
├── docs/APPS.md          # app manifest format and app API
├── kernel/               # NexOS kernel
│   ├── linker.ld         # loaded at 1 MiB
│   ├── catalog/*.app     # App Store manifests, bundled into the image
│   └── src/
│       ├── boot.rs       # Multiboot2 header, 32-bit to 64-bit entry stub
│       ├── main.rs       # kernel_main, boot sequence, panic handler
│       ├── vga.rs        # 80x25 text console, scrolling, cursor, themes
│       ├── serial.rs     # COM1 output mirror + input
│       ├── console.rs    # print!/println! to screen + serial
│       ├── gdt.rs        # GDT, TSS
│       ├── interrupts.rs # IDT, exceptions, PIC, IRQ handlers
│       ├── memory.rs     # memory map, frame allocator, paging
│       ├── allocator.rs  # kernel heap
│       ├── timer.rs      # PIT, uptime, PC speaker
│       ├── input.rs      # keyboard decoding, input queue
│       ├── syscall.rs    # int 0x80 gate, enter/exit user mode
│       ├── user.rs       # ELF loader, program registry
│       ├── fs.rs         # in-memory filesystem
│       ├── apps/store.rs      # App Store, Home menu, installed list
│       ├── apps/ui.rs         # toolkit shared by every native app
│       ├── apps/notes.rs, calc.rs, clock.rs, sysinfo.rs, piano.rs
│       ├── apps/insomnia.rs   # the Insomnia app: menu, sheep, sounds screen, goodnight
│       ├── apps/thoughts.rs   # 4am Thoughts notepad (thoughts.txt)
│       ├── apps/soundscape.rs # PC-speaker soundscapes (timer-driven sequencer)
│       └── shell.rs      # the looscid> shell
└── userland/             # Looscid ring-3 programs
    ├── user.ld           # linked at 0x4000_0000
    ├── src/lib.rs        # `looscid` app API for ring-3 programs
    ├── src/main.rs       # `hello`
    └── src/bin/guess.rs  # Guess the Number
```

## Roadmap

See [ROADMAP.md](ROADMAP.md): first processes and a scheduler, then on-disk apps, then Looscid's workspace running as the first real app.

## License

MIT. See [LICENSE](LICENSE).

---

Built with Tab (https://tab.bot)
