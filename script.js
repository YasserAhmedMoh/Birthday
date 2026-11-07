/* ==========================================================
   A birthday surprise for Mira 💗
   Plain JavaScript, no libraries.
   ========================================================== */
(() => {
  'use strict';

  /* ---------- Settings you can change ---------- */
  const CONFIG = {
    // The secret code is stored only as a hash, so it never appears in the source.
    // To change it: open the site, press F12 → Console, type  mira.secretFor('NEWCODE')
    // and paste the number you get here.
    secretHash: 2986045287030540,

    // Leave empty to use the built-in soft music-box melody (no file needed).
    // Or put an mp3 in the repo (e.g. "music.mp3") and write its name here.
    musicFile: '',
  };

  /* ---------- Helpers ---------- */
  const $ = (sel, root = document) => root.querySelector(sel);
  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const isSmall = () => window.innerWidth < 640;

  const HEART_SVG = '<svg viewBox="0 0 24 24"><path d="M12 21s-7.5-4.6-9.6-9.3C.9 8.3 3.1 4.5 6.8 4.5c2.1 0 3.6 1.1 5.2 3 1.6-1.9 3.1-3 5.2-3 3.7 0 5.9 3.8 4.4 7.2C19.5 16.4 12 21 12 21z"/></svg>';
  const SPARK_SVG = '<svg viewBox="0 0 24 24"><path d="M12 0c.6 5.6 2.9 10 12 12-9.1 2-11.4 6.4-12 12-.6-5.6-2.9-10-12-12C9.1 10 11.4 5.6 12 0z"/></svg>';

  /* ---------- Secret code hashing ---------- */
  function cyrb53(str, seed = 0) {
    let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
    for (let i = 0, ch; i < str.length; i++) {
      ch = str.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
    h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
    h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return 4294967296 * (2097151 & h2) + (h1 >>> 0);
  }
  // Accept Arabic-Indic digits too (١٢٣ / ۱۲۳), so an Arabic keyboard works.
  const normalizeCode = (s) => String(s)
    .trim()
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06F0))
    .replace(/\s+/g, '');
  const secretFor = (code) => cyrb53('mira:' + normalizeCode(code), 2026);
  window.mira = { secretFor };

  /* ==========================================================
     Screens
     ========================================================== */
  const screens = {
    gate: $('#screen-gate'),
    envelope: $('#screen-envelope'),
    surprise: $('#screen-surprise'),
    final: $('#screen-final'),
  };

  function showScreen(name) {
    Object.entries(screens).forEach(([key, el]) => {
      const active = key === name;
      el.classList.toggle('is-active', active);
      el.setAttribute('aria-hidden', active ? 'false' : 'true');
      if (active) el.scrollTop = 0;
    });
    document.body.dataset.scene = name;
  }

  /* ==========================================================
     Floating hearts, stars & sparkles (background)
     ========================================================== */
  const sky = $('#sky');
  const COLORS_FLOAT = ['#f7a9c5', '#ee80a8', '#ffc2d8', '#d3c2fb', '#c9b3f7', '#ffd0bb', '#ffffff', '#f3c77b'];

  function buildFloaters() {
    const layers = sky.querySelectorAll('.float-layer');
    const perLayer = isSmall() ? [5, 5, 4] : [10, 9, 7];
    layers.forEach((layer, li) => {
      layer.innerHTML = '';
      for (let i = 0; i < perLayer[li]; i++) {
        const f = document.createElement('div');
        f.className = 'floater';
        const kind = Math.random();
        const base = [10, 16, 24][li];
        const size = rand(base * 0.75, base * 1.35);
        const dur = rand(16, 30) - li * 3;
        f.style.cssText = [
          `--x:${rand(0, 100).toFixed(2)}%`,
          `--size:${size.toFixed(1)}px`,
          `--dur:${dur.toFixed(1)}s`,
          `--delay:${(-rand(0, dur)).toFixed(1)}s`,
          `--sway:${rand(10, 34).toFixed(0)}px`,
          `--rot:${rand(-80, 80).toFixed(0)}deg`,
          `--op:${rand(0.45, 0.9).toFixed(2)}`,
          `--c:${pick(COLORS_FLOAT)}`,
        ].join(';');
        const inner = document.createElement('span');
        if (kind < 0.62) inner.innerHTML = HEART_SVG;
        else if (kind < 0.85) inner.innerHTML = SPARK_SVG;
        else inner.innerHTML = '<span class="glyph">✦</span>';
        f.appendChild(inner);
        layer.appendChild(f);
      }
    });
  }
  buildFloaters();
  let lastSmall = isSmall();
  window.addEventListener('resize', () => {
    if (isSmall() !== lastSmall) { lastSmall = isSmall(); buildFloaters(); }
  });

  /* Hearts react to the mouse (parallax), desktop only */
  if (finePointer && !reducedMotion) {
    let tx = 0, ty = 0, cx = 0, cy = 0, rafId = 0;
    const step = () => {
      cx += (tx - cx) * 0.06;
      cy += (ty - cy) * 0.06;
      sky.style.setProperty('--px', cx.toFixed(3));
      sky.style.setProperty('--py', cy.toFixed(3));
      rafId = (Math.abs(tx - cx) > 0.001 || Math.abs(ty - cy) > 0.001) ? requestAnimationFrame(step) : 0;
    };
    window.addEventListener('pointermove', (e) => {
      tx = (e.clientX / window.innerWidth - 0.5) * -2;
      ty = (e.clientY / window.innerHeight - 0.5) * -2;
      if (!rafId) rafId = requestAnimationFrame(step);
    }, { passive: true });
  }

  /* Tiny random twinkles */
  const sparkleLayer = $('#sparkleLayer');
  function twinkle(x, y, size, color) {
    const s = document.createElement('div');
    s.className = 'twinkle';
    s.style.left = x + 'px';
    s.style.top = y + 'px';
    s.style.setProperty('--s', size + 'px');
    s.style.setProperty('--c', color);
    s.innerHTML = SPARK_SVG;
    sparkleLayer.appendChild(s);
    s.addEventListener('animationend', () => s.remove(), { once: true });
  }
  if (!reducedMotion) {
    setInterval(() => {
      if (document.hidden) return;
      twinkle(rand(0, window.innerWidth), rand(0, window.innerHeight), rand(8, 18), pick(['#ffffff', '#fff3c4', '#ffd6e6', '#efe6ff']));
    }, isSmall() ? 900 : 550);
  }

  /* Soft sparkle trail behind the cursor (desktop) */
  if (finePointer && !reducedMotion) {
    let last = 0;
    window.addEventListener('pointermove', (e) => {
      const now = performance.now();
      if (now - last < 70) return;
      last = now;
      const t = document.createElement('span');
      t.className = 'trail';
      t.textContent = Math.random() < 0.55 ? '♥' : '✦';
      t.style.left = e.clientX + 'px';
      t.style.top = e.clientY + 'px';
      t.style.setProperty('--s', rand(8, 13) + 'px');
      t.style.setProperty('--dx', rand(-14, 14) + 'px');
      t.style.setProperty('--c', pick(['#ee80a8', '#f7a9c5', '#c9b3f7', '#f3c77b']));
      sparkleLayer.appendChild(t);
      t.addEventListener('animationend', () => t.remove(), { once: true });
    }, { passive: true });
  }

  /* ==========================================================
     Canvas effects: confetti, hearts, stars
     ========================================================== */
  const fx = (() => {
    const canvas = $('#fx');
    const ctx = canvas.getContext('2d');
    const parts = [];
    const spawners = [];
    let W = 0, H = 0, raf = 0;

    const PALETTE = ['#f7a9c5', '#ee80a8', '#de5b8c', '#ffd1df', '#d3c2fb', '#b9a2f5', '#ffd9c4', '#f3c77b', '#ffffff'];
    const PINKS = ['#ff8fb8', '#f7a9c5', '#ee80a8', '#de5b8c', '#ffc2d8', '#ff6f9f'];

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener('resize', resize);

    function heartPath(s) {
      const h = s / 2;
      ctx.beginPath();
      ctx.moveTo(0, h * 0.75);
      ctx.bezierCurveTo(-h * 1.5, -h * 0.2, -h * 0.65, -h * 1.25, 0, -h * 0.45);
      ctx.bezierCurveTo(h * 0.65, -h * 1.25, h * 1.5, -h * 0.2, 0, h * 0.75);
      ctx.closePath();
    }
    function starPath(s) {
      const r = s / 2, ir = r * 0.32;
      ctx.beginPath();
      for (let i = 0; i < 8; i++) {
        const rad = i % 2 === 0 ? r : ir;
        const a = (Math.PI / 4) * i - Math.PI / 2;
        ctx.lineTo(Math.cos(a) * rad, Math.sin(a) * rad);
      }
      ctx.closePath();
    }

    function make(o) {
      const angle = o.angle + rand(-o.spread / 2, o.spread / 2);
      const speed = rand(o.speed[0], o.speed[1]);
      return {
        x: o.x, y: o.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        g: o.gravity,
        drag: o.drag,
        size: rand(o.size[0], o.size[1]),
        rot: rand(0, Math.PI * 2),
        vr: rand(-0.2, 0.2),
        tilt: rand(0, Math.PI * 2),
        vt: rand(0.05, 0.18),
        wob: rand(0, Math.PI * 2),
        life: rand(o.life[0], o.life[1]),
        max: 0,
        shape: pick(o.shapes),
        color: pick(o.colors),
      };
    }

    function burst(opts) {
      const o = Object.assign({
        x: W / 2, y: H / 2, count: 80,
        angle: -Math.PI / 2, spread: Math.PI * 2,
        speed: [4, 10], gravity: 0.16, drag: 0.985,
        size: [6, 11], life: [110, 190],
        shapes: ['rect', 'rect', 'circle', 'heart'],
        colors: PALETTE,
      }, opts);
      const n = Math.round(o.count * (isSmall() ? 0.6 : 1) * (reducedMotion ? 0.3 : 1));
      for (let i = 0; i < n; i++) {
        const p = make(o);
        p.max = p.life;
        parts.push(p);
      }
      start();
    }

    function rain(opts) {
      const o = Object.assign({
        duration: 3000, perFrame: 2,
        shapes: ['rect', 'rect', 'circle', 'heart'],
        colors: PALETTE, size: [6, 11], gravity: 0.05, speed: [1, 3],
      }, opts);
      spawners.push({ until: performance.now() + o.duration, o });
      start();
    }

    function start() { if (!raf) raf = requestAnimationFrame(tick); }

    function tick(now) {
      ctx.clearRect(0, 0, W, H);

      for (let s = spawners.length - 1; s >= 0; s--) {
        const sp = spawners[s];
        if (now > sp.until) { spawners.splice(s, 1); continue; }
        const per = Math.max(1, Math.round(sp.o.perFrame * (isSmall() ? 0.6 : 1) * (reducedMotion ? 0.3 : 1)));
        for (let k = 0; k < per; k++) {
          const p = make({
            x: rand(0, W), y: -20, angle: Math.PI / 2, spread: 0.6,
            speed: sp.o.speed, gravity: sp.o.gravity, drag: 0.995,
            size: sp.o.size, life: [H / 1.2, H / 0.9],
            shapes: sp.o.shapes, colors: sp.o.colors,
          });
          p.max = p.life;
          parts.push(p);
        }
      }

      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        p.vx *= p.drag;
        p.vy = p.vy * p.drag + p.g;
        p.wob += 0.06;
        p.x += p.vx + Math.sin(p.wob) * 0.5;
        p.y += p.vy;
        p.rot += p.vr;
        p.tilt += p.vt;
        p.life -= 1;
        if (p.life <= 0 || p.y > H + 40) { parts.splice(i, 1); continue; }

        const alpha = Math.min(1, p.life / 35);
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color;
        switch (p.shape) {
          case 'rect':
            ctx.scale(1, Math.cos(p.tilt));
            ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
            break;
          case 'circle':
            ctx.beginPath();
            ctx.arc(0, 0, p.size / 3, 0, Math.PI * 2);
            ctx.fill();
            break;
          case 'heart':
            ctx.rotate(-p.rot * 0.8);       // hearts stay mostly upright
            heartPath(p.size * 1.25);
            ctx.fill();
            break;
          case 'star':
            starPath(p.size * 1.3);
            ctx.fill();
            break;
        }
        ctx.restore();
      }

      if (parts.length || spawners.length) raf = requestAnimationFrame(tick);
      else { raf = 0; ctx.clearRect(0, 0, W, H); }
    }

    return { burst, rain, PINKS };
  })();

  const centerOf = (el) => {
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  };

  /* ==========================================================
     Music (soft music-box lullaby, made with Web Audio)
     ========================================================== */
  const music = (() => {
    const btn = $('#musicBtn');
    let ctx = null, master = null, bus = null, timer = null;
    let nextBar = 0, bar = 0, playing = false, audioEl = null, useFile = !!CONFIG.musicFile;

    const BPM = 80;
    const BEAT = 60 / BPM;
    const EIGHTH = BEAT / 2;
    const BAR = BEAT * 3;                     // gentle waltz, 3/4
    // F – Am – B♭ – C – Dm – B♭ – Gm – C
    const PROG = [[53, 4], [57, 3], [58, 4], [48, 4], [50, 3], [58, 4], [55, 3], [48, 4]];
    const MELODY = [
      [[81, 2], [79, 1]], [[76, 2], [72, 1]], [[74, 2], [77, 1]], [[76, 3]],
      [[77, 2], [76, 1]], [[74, 2], [72, 1]], [[70, 1], [74, 1], [79, 1]], [[76, 2], [79, 1]],
    ];
    const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);

    function impulse(seconds, decay) {
      const rate = ctx.sampleRate, len = Math.floor(rate * seconds);
      const buf = ctx.createBuffer(2, len, rate);
      for (let c = 0; c < 2; c++) {
        const d = buf.getChannelData(c);
        for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
      }
      return buf;
    }

    function init() {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return false;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0;
      const comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -18;
      comp.ratio.value = 3;
      bus = ctx.createGain();
      bus.gain.value = 1;
      const tone = ctx.createBiquadFilter();
      tone.type = 'lowpass';
      tone.frequency.value = 5200;
      const verb = ctx.createConvolver();
      verb.buffer = impulse(3.2, 2.4);
      const wet = ctx.createGain();
      wet.gain.value = 0.5;
      bus.connect(tone);
      tone.connect(master);
      tone.connect(verb);
      verb.connect(wet);
      wet.connect(master);
      master.connect(comp);
      comp.connect(ctx.destination);
      return true;
    }

    function bell(midi, t, vel, len) {
      const f = mtof(midi);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(vel, t + 0.006);
      g.gain.exponentialRampToValueAtTime(0.0001, t + len);
      g.connect(bus);
      const partials = [[1, 1], [2, 0.28], [3.01, 0.07]];
      partials.forEach(([mul, amp]) => {
        const o = ctx.createOscillator();
        const og = ctx.createGain();
        o.type = 'sine';
        o.frequency.value = f * mul;
        og.gain.value = amp;
        o.connect(og);
        og.connect(g);
        o.start(t);
        o.stop(t + len + 0.05);
      });
    }

    function pad(notes, t, len) {
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 1100;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(0.03, t + 0.9);
      g.gain.setValueAtTime(0.03, t + len - 0.6);
      g.gain.linearRampToValueAtTime(0.0001, t + len + 0.4);
      lp.connect(g);
      g.connect(bus);
      notes.forEach((m, i) => {
        const o = ctx.createOscillator();
        o.type = 'triangle';
        o.frequency.value = mtof(m);
        o.detune.value = i % 2 ? 5 : -5;
        o.connect(lp);
        o.start(t);
        o.stop(t + len + 0.5);
      });
    }

    function scheduleBar(i, t) {
      const [root, third] = PROG[i % 8];
      const arp = [root, root + 7, root + 12, root + 12 + third, root + 19, root + 12 + third];
      arp.forEach((m, k) => bell(m, t + k * EIGHTH + rand(0, 0.012), k === 0 ? 0.1 : 0.06, 1.8));
      pad([root + 12, root + 12 + third, root + 19], t, BAR);
      const loop = Math.floor(i / 8);
      if (loop % 3 !== 0) {
        let beat = 0;
        MELODY[i % 8].forEach(([m, b]) => {
          bell(m, t + beat * BEAT + rand(0, 0.01), 0.14, Math.max(1.6, b * BEAT + 1));
          beat += b;
        });
      }
    }

    function scheduler() {
      while (nextBar < ctx.currentTime + 0.35) {
        scheduleBar(bar, nextBar);
        nextBar += BAR;
        bar++;
      }
    }

    function setUI() {
      btn.classList.toggle('is-playing', playing);
      btn.setAttribute('aria-pressed', String(playing));
      btn.setAttribute('aria-label', playing ? 'Mute music' : 'Play music');
    }

    function fadeAudioEl(to, ms, done) {
      const from = audioEl.volume, t0 = performance.now();
      const stepFade = (now) => {
        const k = Math.min(1, (now - t0) / ms);
        audioEl.volume = from + (to - from) * k;
        if (k < 1) requestAnimationFrame(stepFade); else if (done) done();
      };
      requestAnimationFrame(stepFade);
    }

    function start() {
      btn.classList.remove('is-idle');
      if (useFile) {
        if (!audioEl) {
          audioEl = new Audio(CONFIG.musicFile);
          audioEl.loop = true;
          audioEl.volume = 0;
          audioEl.addEventListener('error', () => { useFile = false; if (playing) { playing = false; start(); } });
        }
        playing = true;
        setUI();
        audioEl.play().then(() => fadeAudioEl(0.45, 1500)).catch(() => { useFile = false; playing = false; start(); });
        return;
      }
      if (!ctx && !init()) return;
      if (ctx.state === 'suspended') ctx.resume();
      if (!timer) {
        nextBar = ctx.currentTime + 0.12;
        timer = setInterval(scheduler, 60);
        scheduler();
      }
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.setTargetAtTime(0.55, ctx.currentTime, 0.9);
      playing = true;
      setUI();
    }

    function stop() {
      playing = false;
      setUI();
      if (useFile && audioEl) {
        fadeAudioEl(0, 500, () => { if (!playing) audioEl.pause(); });
        return;
      }
      if (!ctx) return;
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.setTargetAtTime(0, ctx.currentTime, 0.2);
      setTimeout(() => {
        if (playing) return;
        clearInterval(timer);
        timer = null;
        ctx.suspend();
      }, 1100);
    }

    let userMuted = false;
    btn.classList.add('is-idle');
    btn.addEventListener('click', () => {
      if (playing) { userMuted = true; stop(); }
      else { userMuted = false; start(); }
    });

    document.addEventListener('visibilitychange', () => {
      if (!playing) return;
      if (useFile && audioEl) { document.hidden ? audioEl.pause() : audioEl.play().catch(() => {}); return; }
      if (ctx) document.hidden ? ctx.suspend() : ctx.resume();
    });

    // Called on the first real interaction (the unlock) – only if not muted.
    function autoStart() { if (!userMuted && !playing) start(); }

    return { autoStart };
  })();

  /* ==========================================================
     1. Gate
     ========================================================== */
  const gateCard = $('#gateCard');
  const gateForm = $('#gateForm');
  const codeInput = $('#code');
  const gateError = $('#gateError');
  const unlockBtn = $('#unlockBtn');
  const gift = $('#gift');
  let unlocking = false;

  function wrongCode() {
    if (gateCard.animate) {
      gateCard.animate([
        { transform: 'translateX(0)' }, { transform: 'translateX(-9px) rotate(-.6deg)' },
        { transform: 'translateX(9px) rotate(.6deg)' }, { transform: 'translateX(-7px)' },
        { transform: 'translateX(6px)' }, { transform: 'translateX(-3px)' }, { transform: 'translateX(0)' },
      ], { duration: 520, easing: 'ease-in-out' });
    }
    gateError.classList.remove('show');
    void gateError.offsetWidth;
    gateError.textContent = 'Oops! Wrong password, try again sweetheart 💕';
    gateError.classList.add('show');
    codeInput.value = '';
    codeInput.focus();
    if (navigator.vibrate) navigator.vibrate([60, 40, 60]);
  }

  async function unlock() {
    unlocking = true;
    music.autoStart();                    // first interaction → music may begin
    codeInput.blur();
    gateError.classList.remove('show');
    unlockBtn.querySelector('.btn-label').textContent = 'Unlocking… ✨';
    gateCard.classList.add('unlocking');
    gift.classList.add('open');

    await wait(260);
    const c = centerOf(gift);
    fx.burst({ x: c.x, y: c.y, count: 46, shapes: ['star', 'heart', 'circle'], speed: [3, 9], gravity: 0.07, size: [7, 13] });

    await wait(900);
    gateCard.classList.add('unlocked');
    await wait(500);
    showScreen('envelope');
    setTimeout(() => $('#envelope').focus({ preventScroll: true }), 1600);
  }

  gateForm.addEventListener('submit', (e) => {
    e.preventDefault();                   // Enter key submits the form too
    if (unlocking) return;
    if (secretFor(codeInput.value) === CONFIG.secretHash) unlock();
    else wrongCode();
  });
  codeInput.addEventListener('input', () => gateError.classList.remove('show'));

  // Focus the input on desktop only (avoid popping the phone keyboard)
  if (finePointer) setTimeout(() => codeInput.focus({ preventScroll: true }), 700);

  /* ==========================================================
     2. Envelope
     ========================================================== */
  const envelope = $('#envelope');
  const envStage = $('.envelope-stage');
  const envScene = $('.envelope-scene');
  let opened = false;

  envelope.addEventListener('click', async () => {
    if (opened) return;
    opened = true;
    music.autoStart();

    const seal = centerOf($('.env-seal'));
    envelope.classList.add('opening');
    fx.burst({ x: seal.x, y: seal.y, count: 34, shapes: ['star', 'heart'], speed: [2, 7], gravity: 0.05, size: [7, 12], life: [70, 120] });

    await wait(320);
    envelope.classList.add('flap-open');

    await wait(950);
    envelope.classList.add('flap-behind');
    await wait(40);
    envelope.classList.add('letter-out');
    const top = envelope.getBoundingClientRect();
    fx.burst({ x: top.left + top.width / 2, y: top.top, count: 40, angle: -Math.PI / 2, spread: Math.PI * 0.9, shapes: ['heart'], colors: fx.PINKS, speed: [3, 8], gravity: 0.06, size: [9, 16], life: [90, 150] });

    await wait(1300);
    envScene.classList.add('leaving');
    envStage.classList.add('leaving');
    await wait(450);
    envStage.classList.add('gone');
    await wait(450);
    playSurprise();
  });

  /* ==========================================================
     3. Birthday surprise
     ========================================================== */
  const card = $('#letterCard');
  const arHeadline = $('#arHeadline');
  const arMessage = $('#arMessage');
  const messageText = arMessage.dataset.text;
  const headlineText = arHeadline.textContent.trim();
  let timeline = [];
  let typing = null;

  // Split the headline into words (never letters, so Arabic letters stay joined)
  function prepareHeadline() {
    const words = headlineText.split(/\s+/);
    arHeadline.setAttribute('aria-label', headlineText);
    arHeadline.innerHTML = words.map((w, i) => {
      const isHeart = /❤|♥|💗/.test(w);
      return `<span class="w${isHeart ? ' w-heart' : ''}" style="--i:${i}" aria-hidden="true">${w}</span>`;
    }).join(' ');
    return words.length;
  }

  const later = (ms, fn) => timeline.push(setTimeout(fn, ms));
  function clearTimeline() {
    timeline.forEach(clearTimeout);
    timeline = [];
    if (typing) { cancelAnimationFrame(typing.raf); clearTimeout(typing.t); typing = null; }
  }

  function resetSurprise() {
    clearTimeline();
    card.className = 'letter-card';
    arHeadline.classList.remove('reveal', 'shimmer');
    arMessage.textContent = '';
    const secret = $('#secret');
    secret.hidden = true;
    secret.classList.remove('show');
    moreBtn.setAttribute('aria-expanded', 'false');
    moreBtn.textContent = 'One more surprise? 🎁';
    $('#cakeCaption').textContent = 'make a wish, then tap the candles ✨';
    candlesBusy = false;
  }

  function typeMessage(onDone) {
    const textNode = document.createTextNode('');
    const caret = document.createElement('span');
    caret.className = 'caret';
    caret.setAttribute('aria-hidden', 'true');
    arMessage.textContent = '';
    arMessage.append(textNode, caret);

    const chars = Array.from(messageText);   // keeps emoji intact
    let i = 0;
    const finish = () => {
      textNode.data = messageText;
      caret.classList.add('done');
      arMessage.removeEventListener('click', finish);
      if (typing) { clearTimeout(typing.t); typing = null; }
      onDone();
    };
    arMessage.addEventListener('click', finish);   // tap to skip

    if (reducedMotion) { finish(); return; }

    const tickType = () => {
      i++;
      textNode.data = chars.slice(0, i).join('');
      if (i >= chars.length) { finish(); return; }
      const ch = chars[i - 1];
      const delay = /[.،!؟]/.test(ch) ? 330 : ch === ' ' ? 45 : rand(26, 44);
      typing.t = setTimeout(tickType, delay);
    };
    typing = { t: setTimeout(tickType, 200), raf: 0 };
  }

  function playSurprise() {
    resetSurprise();
    const words = prepareHeadline();
    showScreen('surprise');

    // The big moment ✨
    later(650, () => {
      card.classList.add('lit');
      arHeadline.classList.add('reveal');
      const W = window.innerWidth, H = window.innerHeight;
      fx.burst({ x: W * 0.1, y: H * 0.9, angle: -Math.PI / 3, spread: 0.9, count: 90, speed: [9, 17], gravity: 0.2 });
      fx.burst({ x: W * 0.9, y: H * 0.9, angle: -Math.PI * 2 / 3, spread: 0.9, count: 90, speed: [9, 17], gravity: 0.2 });
      if (navigator.vibrate) navigator.vibrate([30, 60, 30]);
    });
    later(1500, () => fx.rain({ duration: 3200, perFrame: 2 }));

    const headlineDone = 650 + words * 300 + 900;
    later(headlineDone - 200, () => arHeadline.classList.add('shimmer'));
    later(headlineDone, () => card.classList.add('show-en'));
    later(headlineDone + 700, () => card.classList.add('show-cake'));
    later(headlineDone + 1300, () => card.classList.add('candles-lit'));
    later(headlineDone + 1500, () => {
      typeMessage(() => {
        later(400, () => card.classList.add('show-actions'));
      });
    });

    setTimeout(() => arHeadline.focus({ preventScroll: true }), 700);
  }

  /* Blow out the candles */
  const cake = $('#cake');
  let candlesBusy = false;
  cake.addEventListener('click', async () => {
    if (candlesBusy || !card.classList.contains('candles-lit')) return;
    candlesBusy = true;
    card.classList.add('candles-out');
    $('#cakeCaption').textContent = 'your wish is on its way 🌙';
    const c = centerOf(cake);
    await wait(500);
    fx.burst({ x: c.x, y: c.y - 30, count: 40, shapes: ['star'], colors: ['#f3c77b', '#fff3c4', '#ffffff', '#ffd1df'], speed: [2, 7], gravity: 0.04, size: [8, 14] });
    await wait(3200);
    card.classList.remove('candles-out');
    $('#cakeCaption').textContent = 'make another wish? ✨';
    candlesBusy = false;
  });

  /* Send a little hug 🤗 */
  const hugBtn = $('#hugBtn');
  const toastLayer = $('#toastLayer');
  const HUG_LINES = ['Big warm hug! 🤗', 'Another one! 💞', 'Squeeeeze! 🫶', 'Hugs forever 💗', 'Sending all the love 💕', 'One more for luck 🍀'];
  let hugs = 0;
  hugBtn.addEventListener('click', () => {
    const c = centerOf(hugBtn);
    fx.burst({ x: c.x, y: c.y, count: 55, shapes: ['heart', 'heart', 'heart', 'circle'], colors: fx.PINKS, speed: [3, 12], gravity: 0.09, size: [10, 20], life: [80, 140] });

    hugBtn.classList.remove('squish');
    void hugBtn.offsetWidth;
    hugBtn.classList.add('squish');
    if (card.animate) {
      card.animate([
        { transform: 'scale(1)' }, { transform: 'scale(.965, .955)', offset: 0.35 },
        { transform: 'scale(1.015)', offset: 0.65 }, { transform: 'scale(1)' },
      ], { duration: 700, easing: 'cubic-bezier(.34, 1.56, .64, 1)' });
    }

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = HUG_LINES[hugs % HUG_LINES.length];
    toast.style.left = c.x + 'px';
    toast.style.top = (c.y - 54) + 'px';
    toastLayer.appendChild(toast);
    toast.addEventListener('animationend', () => toast.remove(), { once: true });
    hugs++;
  });
  hugBtn.addEventListener('animationend', () => hugBtn.classList.remove('squish'));

  /* One more surprise? 🎁 */
  const moreBtn = $('#moreBtn');
  moreBtn.addEventListener('click', () => {
    const secret = $('#secret');
    if (!secret.hidden) {
      secret.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'center' });
      return;
    }
    secret.hidden = false;
    requestAnimationFrame(() => requestAnimationFrame(() => secret.classList.add('show')));
    moreBtn.setAttribute('aria-expanded', 'true');
    moreBtn.textContent = 'You found it! 💝';
    const c = centerOf(moreBtn);
    fx.burst({ x: c.x, y: c.y, count: 44, shapes: ['star', 'rect', 'heart'], speed: [3, 10], gravity: 0.12 });
    setTimeout(() => secret.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'center' }), 350);
  });

  /* ==========================================================
     4. Final screen
     ========================================================== */
  $('#toFinal').addEventListener('click', () => {
    clearTimeline();
    showScreen('final');
    setTimeout(() => {
      fx.rain({ duration: 4500, perFrame: 1, shapes: ['heart'], colors: fx.PINKS, size: [10, 18], gravity: 0.03, speed: [1, 2.5] });
    }, 600);
    setTimeout(() => $('#finalTitle').focus({ preventScroll: true }), 900);
  });

  $('#replayBtn').addEventListener('click', () => playSurprise());
})();
