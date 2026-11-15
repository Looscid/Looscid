/* Looscid earcons: synthesized WebAudio sounds. No audio files, no network.
   Exposes window.LooscidEarcons:
     on, open, close, close_alt, key, keyEnter, keySpace, keyDelete.
   Typing ticks are intentionally hearable; keep them short and non-fatiguing. */
(function () {
  "use strict";

  var ac = null;

  function context() {
    if (!ac) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ac = new AC();
    }
    if (ac.state === "suspended" && ac.resume) { try { ac.resume(); } catch (e) {} }
    return ac;
  }

  // One oscillator through one gain node with a short exponential envelope.
  function tone(o) {
    var c = context();
    if (!c) return;
    var t0 = c.currentTime;
    var osc = c.createOscillator();
    var gain = c.createGain();
    osc.type = o.type;
    osc.frequency.setValueAtTime(o.f0, t0);
    if (o.f1 && o.f1 !== o.f0) osc.frequency.exponentialRampToValueAtTime(o.f1, t0 + o.dur);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(o.peak, t0 + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + o.dur);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start(t0);
    osc.stop(t0 + o.dur + 0.03);
  }

  var LooscidEarcons = {
    // activating
    on:        function () { tone({ type: "sine",     f0: 520, f1: 784, dur: 0.27,  peak: 0.12 }); },
    // closing
    close:     function () { tone({ type: "sine",     f0: 700, f1: 440, dur: 0.27,  peak: 0.12 }); },
    // closing blip
    close_alt: function () { tone({ type: "triangle", f0: 330, f1: 288, dur: 0.19,  peak: 0.09 }); },
    // typing ticks, hearable
    key:       function () { tone({ type: "square",   f0: 900, f1: 760, dur: 0.052, peak: 0.14 }); },
    keyEnter:  function () { tone({ type: "square",   f0: 760, f1: 620, dur: 0.074, peak: 0.13 }); },
    keySpace:  function () { tone({ type: "square",   f0: 640, f1: 560, dur: 0.062, peak: 0.08 }); },
    keyDelete: function () { tone({ type: "square",   f0: 520, f1: 460, dur: 0.050, peak: 0.11 }); }
  };

  // "open" is the same sound as "on"
  LooscidEarcons.open = LooscidEarcons.on;

  window.LooscidEarcons = LooscidEarcons;
  if (window.Looscid) window.Looscid.Earcons = LooscidEarcons;
})();
