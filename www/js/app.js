/* Tankan app logic. Plain JavaScript, no build step, so the same www/ folder
   runs in a browser, inside Tauri (Windows) and inside Capacitor (Android). */
(function () {
  'use strict';
  var E = window.TKEngine, D = window.TKData;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var fmt = function (sec) { sec = Math.max(0, Math.ceil(sec)); return String(Math.floor(sec / 60)).padStart(2, '0') + ':' + String(sec % 60).padStart(2, '0'); };
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------- storage ---------------- */
  var store = {
    get: function (k, d) { try { var v = localStorage.getItem('tankan.' + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem('tankan.' + k, JSON.stringify(v)); } catch (e) { /* private mode */ } }
  };
  var settings = Object.assign({ name: '', theme: 'auto', size: '20', font: 'exam', clock: 'key', sound: false, anim: true, kb: true }, store.get('settings', {}));
  function saveSettings() { store.set('settings', settings); applySettings(); }
  function applySettings() {
    var dark = settings.theme === 'dark' || (settings.theme === 'auto' && window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    var root = document.documentElement.style;
    root.setProperty('--pfs', settings.size + 'px');
    root.setProperty('--pfont', settings.font === 'mono' ? 'Consolas, "Cascadia Mono", "Mangal", monospace' : settings.font === 'serif' ? 'Georgia, "Mangal", "Nirmala UI", serif' : 'Verdana, "Segoe UI", "Mangal", "Nirmala UI", "Noto Sans Devanagari", sans-serif');
    document.body.classList.toggle('noanim', !settings.anim);
  }
  function animOn() { return settings.anim && !reduce; }

  function toast(msg) { var t = $('#toast'); t.textContent = msg; t.classList.add('on'); clearTimeout(toast.h); toast.h = setTimeout(function () { t.classList.remove('on'); }, 2600); }

  /* ---------------- sound ---------------- */
  var actx = null;
  function click(freq) {
    if (!settings.sound) return;
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      var o = actx.createOscillator(), g = actx.createGain();
      o.type = 'square'; o.frequency.value = freq || 1400;
      g.gain.value = 0.015; g.gain.exponentialRampToValueAtTime(0.0001, actx.currentTime + 0.04);
      o.connect(g); g.connect(actx.destination); o.start(); o.stop(actx.currentTime + 0.045);
    } catch (e) { /* no audio */ }
  }

  /* ---------------- routing ---------------- */
  var VIEWS = ['home', 'exams', 'setup', 'test', 'result', 'practice', 'game', 'progress', 'settings', 'cert'];
  var current = 'home';
  function cleanHomeUrl() {
    if (location.hash && history.replaceState) {
      try { history.replaceState(null, '', location.pathname + location.search); } catch (e) { }
    }
  }
  function show(v) {
    current = v;
    VIEWS.forEach(function (n) { $('#view-' + n).classList.toggle('on', n === v); });
    var navKey = { setup: 'exams', test: 'exams', result: 'exams', cert: 'progress' }[v] || v;
    $$('[data-nav]').forEach(function (a) { a.classList.toggle('on', a.dataset.nav === navKey); });
    $('#menu').classList.remove('open');
    window.scrollTo(0, 0);
    if (window.TKGame) { v === 'game' ? TKGame.onShow() : TKGame.onHide(); }
    if (v === 'home') { cleanHomeUrl(); heroDemo(); } else { stopDemo(); }
    if (v === 'exams') renderExams();
    if (v === 'practice') renderLessons();
    if (v === 'progress') renderProgress();
    if (v === 'settings') fillSettings();
  }
  function route() {
    var raw = (location.hash || '').replace(/^#\/?/, '').trim();
    var h = raw;
    if (!h || h === 'home') {
      h = 'home';
      cleanHomeUrl();
    } else if (['exams', 'practice', 'game', 'progress', 'settings'].indexOf(h) < 0) {
      h = 'home';
      cleanHomeUrl();
    }
    if (T && T.running) cancelTest();
    show(h);
  }
  window.addEventListener('hashchange', route);
  window.addEventListener('popstate', route);
  $('#burger').addEventListener('click', function () { $('#menu').classList.toggle('open'); });
  // Menu clicks while the hash is unchanged (e.g. from the set-up screen) still need to navigate.
  document.addEventListener('click', function (e) {
    var homeLink = e.target.closest('[data-nav="home"], .logo');
    if (homeLink) {
      e.preventDefault();
      if (T && T.running && T.started && !confirm('Leave this test? Your attempt will not be saved.')) return;
      if (location.hash) {
        if (history.pushState) {
          try { history.pushState(null, '', location.pathname + location.search); } catch (err) { location.hash = ''; }
        } else {
          location.hash = '';
        }
      }
      if (T && T.running) cancelTest();
      show('home');
      return;
    }

    var a = e.target.closest('.nav a[href^="#/"]'); if (!a) return;
    if (T && T.running && T.started && !confirm('Leave this test? Your attempt will not be saved.')) { e.preventDefault(); return; }
    if (a.getAttribute('href') === location.hash) { e.preventDefault(); route(); }
  });

  /* ---------------- PWA install handling ---------------- */
  var deferredPrompt = null;
  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    deferredPrompt = e;
    $$('.pwa-install-btn').forEach(function (btn) { btn.classList.add('ready'); });
  });

  window.addEventListener('appinstalled', function () {
    deferredPrompt = null;
    toast('🎉 Tankan app installed!');
    $$('.pwa-install-btn').forEach(function (btn) {
      btn.classList.add('installed');
      btn.style.display = 'none';
    });
  });

  function triggerPwaInstall() {
    var isStandalone = (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) ||
      window.navigator.standalone === true;
    if (isStandalone) {
      toast('Tankan is already installed and running as an app.');
      return;
    }
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(function (choiceResult) {
        if (choiceResult && choiceResult.outcome === 'accepted') {
          toast('Installing Tankan...');
        }
        deferredPrompt = null;
      });
      return;
    }
    var isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
    if (isIos) {
      alert('To install Tankan on iPhone/iPad:\n1. Tap the Share button in Safari (icon with box and arrow up)\n2. Select "Add to Home Screen"');
    } else {
      toast('To install: click the Install icon (💻/📲) in your browser address bar or menu (⋮)');
    }
  }

  $$('.pwa-install-btn').forEach(function (btn) {
    btn.addEventListener('click', triggerPwaInstall);
  });

  /* ---------------- exam cards ---------------- */
  function chipsFor(x) {
    var c = [x.min + ' min'];
    c.push(x.kdph ? x.kdph.toLocaleString('en-IN') + ' KDPH' : x.wpm ? x.wpm + ' WPM' : 'No pass mark');
    if (x.err < 100) c.push('≤' + x.err + '% errors');
    var diff = x.difficulty || 'medium';
    var diffClass = diff === 'low' ? 'diff-low' : diff === 'hard' ? 'diff-hard' : 'diff-med';
    var diffLabel = diff === 'low' ? 'Low' : diff === 'hard' ? 'Hard' : 'Medium';
    var h = '<span class="chip ' + diffClass + '">● ' + diffLabel + '</span>';
    c.forEach(function (t) { h += '<span class="chip">' + esc(t) + '</span>'; });
    if (!x.backspace) h += '<span class="chip lock">🔒 Backspace</span>';
    return h;
  }
  function card(x) {
    return '<button class="xcard" data-exam="' + x.id + '"><span class="ico">' + x.icon + '</span><h3>' + esc(x.name) + '</h3><span class="sub">' + esc(x.sub) + '</span><div class="chips">' + chipsFor(x) + '</div></button>';
  }
  function allPresets() { return D.EXAMS.concat(D.QUICK); }

  var currentExamDiff = 'all';
  function renderExams() {
    var diff = currentExamDiff;
    var exams = D.EXAMS.filter(function (x) {
      if (diff === 'all') return true;
      return (x.difficulty || 'medium') === diff;
    });
    var quick = D.QUICK.filter(function (x) {
      if (diff === 'all') return true;
      return (x.difficulty || 'low') === diff;
    });
    $('#examList').innerHTML = exams.map(card).join('');
    var customCard = (diff === 'all' || diff === 'medium') ?
      '<button class="xcard" data-exam="custom"><span class="ico">✍️</span><h3>Your own test</h3><span class="sub">Any text, any duration</span><div class="chips"><span class="chip diff-med">● Custom</span><span class="chip">Paste a passage</span></div></button>' : '';
    $('#quickList').innerHTML = quick.map(card).join('') + customCard;

    if ($('#govHeader')) $('#govHeader').style.display = exams.length ? '' : 'none';
    if ($('#quickHeader')) $('#quickHeader').style.display = (quick.length || customCard) ? '' : 'none';
    var totalCount = exams.length + quick.length + (customCard ? 1 : 0);
    var label = diff === 'all' ? 'All' : diff === 'low' ? 'Low (Easy)' : diff === 'hard' ? 'Hard' : 'Medium';
    if ($('#examFilterCount')) $('#examFilterCount').innerHTML = 'Showing <strong>' + label + '</strong> tests (' + totalCount + ' available)';

    $$('#diffFilterTabs .diff-tab').forEach(function (btn) {
      btn.classList.toggle('active', btn.dataset.diff === diff);
    });
  }

  var diffFilterTabs = $('#diffFilterTabs');
  if (diffFilterTabs) {
    diffFilterTabs.addEventListener('click', function (e) {
      var btn = e.target.closest('.diff-tab');
      if (!btn) return;
      currentExamDiff = btn.dataset.diff || 'all';
      renderExams();
    });
  }

  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-exam]');
    if (!b) return;
    var id = b.dataset.exam;
    if (id === 'custom') openSetup({ id: 'custom', icon: '✍️', name: 'Your own test', sub: 'Custom', lang: 'en', pool: 'custom', min: 5, wpm: 0, err: 100, backspace: true, difficulty: 'medium', note: 'Paste any passage and set your own duration.' });
    else openSetup(allPresets().filter(function (x) { return x.id === id; })[0]);
  });

  /* ---------------- hero demo ---------------- */
  var demoTimer = null;
  function stopDemo() { clearTimeout(demoTimer); demoTimer = null; }
  function heroDemo() {
    stopDemo();
    var el = $('#demoPass'); if (!el) return;
    var text = 'The railway network of the country carries millions of passengers every day and moves a large share of its freight.';
    if (reduce) { el.innerHTML = '<span class="c">' + esc(text.slice(0, 80)) + '</span>'; $('#dWpm').textContent = '38'; return; }
    var typos = { 22: 'x', 71: 'm' }, shown = [], i = 0, t0 = Date.now(), errs = 0, good = 0;
    function render() {
      var h = '';
      shown.forEach(function (s) { h += '<span class="' + (s.bad ? 'x' : 'c') + '">' + esc(s.ch) + '</span>'; });
      el.innerHTML = h + '<span class="caret"></span>';
      var min = Math.max((Date.now() - t0) / 60000, 0.02);
      $('#dWpm').textContent = Math.round(Math.max(0, good / 5 - errs) / min);
      $('#dErr').textContent = errs;
      $('#dAcc').textContent = (good ? Math.max(0, Math.round(100 * (1 - errs * 5 / Math.max(good, 1)))) : 100) + '%';
    }
    function step() {
      if (current !== 'home') return;
      if (i >= text.length) { demoTimer = setTimeout(function () { shown = []; i = 0; errs = 0; good = 0; t0 = Date.now(); step(); }, 2600); return; }
      if (typos[i] && !shown.some(function (s) { return s.bad; }) && !step['d' + i]) {
        step['d' + i] = true; shown.push({ ch: typos[i], bad: true }); errs++; render();
        demoTimer = setTimeout(function () { shown.pop(); render(); demoTimer = setTimeout(step, 260); }, 520); return;
      }
      shown.push({ ch: text[i] }); i++; good++; render();
      demoTimer = setTimeout(step, 150 + Math.random() * 90);
    }
    Object.keys(step).forEach(function (k) { if (k[0] === 'd') delete step[k]; });
    step();
  }
  $('#quickStart').addEventListener('click', function () { openSetup(D.QUICK[2]); });

  /* ---------------- setup ---------------- */
  var S = null; // preset being set up
  var currentSetupDiff = 'medium';
  var DIFF_DESCS = {
    low: '<b id="setupDiffTitle">Low (Easy)</b>: Everyday vocabulary, shorter sentences, and simple punctuation. Ideal for building speed and confidence.',
    medium: '<b id="setupDiffTitle">Medium</b>: Standard government exam vocabulary, official terminology, and realistic sentence complexity.',
    hard: '<b id="setupDiffTitle">Hard</b>: Formal administrative & legal terminology, complex punctuation, numbers, and dense phrasing.'
  };

  function setSetupDifficulty(diff) {
    currentSetupDiff = (diff === 'easy' ? 'low' : diff) || 'medium';
    $$('#setupDiffTabs .diff-tab').forEach(function (btn) {
      btn.classList.toggle('active', btn.dataset.diff === currentSetupDiff);
    });
    var descEl = $('#setupDiffDesc');
    if (descEl) descEl.innerHTML = DIFF_DESCS[currentSetupDiff] || DIFF_DESCS.medium;
    fillPassageOptions();
    rules();
  }

  var setupDiffTabsEl = $('#setupDiffTabs');
  if (setupDiffTabsEl) {
    setupDiffTabsEl.addEventListener('click', function (e) {
      var btn = e.target.closest('.diff-tab');
      if (!btn) return;
      setSetupDifficulty(btn.dataset.diff);
    });
  }

  function fillPassageOptions() {
    var langEl = $('#sLang'), poolEl = $('#sPool'), passSel = $('#sPassageSelect');
    if (!langEl || !poolEl || !passSel) return;
    var lang = langEl.value;
    var poolType = poolEl.value;
    if (poolType === 'custom' || poolType === 'data') {
      passSel.innerHTML = '<option value="random">Generated dynamically</option>';
      passSel.disabled = true;
      return;
    }
    passSel.disabled = false;
    var pool = D.getPassagePool(lang, poolType, currentSetupDiff);
    var h = '<option value="random">🎲 Random passage (' + pool.length + ' available)</option>';
    for (var i = 0; i < pool.length; i++) {
      var snippet = pool[i].slice(0, 36).replace(/['"]/g, '') + '...';
      h += '<option value="' + i + '">Passage ' + (i + 1) + ': ' + esc(snippet) + '</option>';
    }
    var oldVal = passSel.value;
    passSel.innerHTML = h;
    if (oldVal && passSel.querySelector('option[value="' + oldVal + '"]')) {
      passSel.value = oldVal;
    } else {
      passSel.value = 'random';
    }
  }

  function openSetup(x, lesson) {
    S = Object.assign({}, x);
    $('#setupTitle').textContent = x.name + ' · ' + x.sub;
    $('#setupNote').textContent = x.note || '';
    $('#sName').value = settings.name || '';
    $('#sLang').value = x.lang;

    var initialDiff = (currentExamDiff !== 'all') ? currentExamDiff : (x.difficulty || 'medium');
    setSetupDifficulty(initialDiff);

    fillPoolOptions(x.lang, x.pool);
    fillPassageOptions();
    $('#sMin').value = x.min;
    $('#sWpm').value = x.kdph || x.wpm;
    var wpmLabel = $('#sWpmLabel') || $('#sWpm').previousElementSibling;
    if (wpmLabel) wpmLabel.textContent = x.kdph ? 'Passing speed (key depressions per hour)' : 'Passing speed (WPM)';
    $('#sBack').checked = x.backspace;
    $('#sBlind').checked = !!x.blindDefault;
    $('#sKb').checked = settings.kb && x.lang === 'en' && !x.kdph && x.min <= 5;
    $('#sRead').checked = true; $('#goTest').disabled = false;
    $('#sCustomWrap').classList.toggle('hide', x.pool !== 'custom');
    rules();
    show('setup');
  }

  function fillPoolOptions(lang, sel) {
    var o = lang === 'hi' ? [['hindi', 'General (हिंदी)'], ['custom', 'My own text']] : [['general', 'General'], ['legal', 'Legal'], ['data', 'Data entry'], ['custom', 'My own text']];
    $('#sPool').innerHTML = o.map(function (p) { return '<option value="' + p[0] + '">' + p[1] + '</option>'; }).join('');
    $('#sPool').value = o.some(function (p) { return p[0] === sel; }) ? sel : o[0][0];
  }

  function formCfg() {
    var wv = +$('#sWpm').value || 0;
    var c = Object.assign({}, S, {
      lang: $('#sLang').value, pool: $('#sPool').value, difficulty: currentSetupDiff,
      passageIndex: $('#sPassageSelect') ? $('#sPassageSelect').value : 'random',
      min: Math.max(1, Math.min(60, +$('#sMin').value || 1)),
      backspace: $('#sBack').checked, blind: $('#sBlind').checked, kb: $('#sKb').checked && $('#sLang').value === 'en',
      candidate: $('#sName').value.trim() || 'Candidate', custom: $('#sCustom').value
    });
    if (S.kdph) { c.kdph = wv; c.wpm = 0; } else { c.wpm = wv; c.kdph = 0; }
    return c;
  }

  function rules() {
    var c = formCfg();
    var diffLabel = c.difficulty === 'low' ? 'Low (Easy)' : c.difficulty === 'hard' ? 'Hard (Advanced)' : 'Medium (Standard)';
    var rows = [
      ['Language', c.lang === 'hi' ? 'हिंदी (Unicode)' : 'English'],
      ['Difficulty', diffLabel],
      ['Duration', c.min + ' minutes'],
      ['Passing speed', c.kdph ? c.kdph.toLocaleString('en-IN') + ' key depressions / hour' : c.wpm ? c.wpm + ' WPM net' : 'None, practice only'],
      ['Mistake limit', c.err < 100 ? c.err + '% of typed words' : 'None'],
      ['Backspace', c.backspace ? 'Allowed' : 'Locked'],
      ['Colours while typing', c.blind ? 'Hidden (blind mode)' : 'Shown']
    ];
    $('#rulesTable').innerHTML = rows.map(function (r) { return '<tr><td>' + r[0] + '</td><td>' + esc(r[1]) + '</td></tr>'; }).join('');
    $('#setupHint').textContent = c.lang === 'hi' ? 'Switch Windows to the Hindi InScript keyboard (Win + Space) before you start. The passage is compared as Unicode text.' : 'Sit straight, rest your wrists, and aim for accuracy first. Speed follows.';
    $('#sCustomWrap').classList.toggle('hide', c.pool !== 'custom');
  }

  ['sLang', 'sPool', 'sMin', 'sWpm', 'sBack', 'sBlind', 'sKb', 'sPassageSelect'].forEach(function (id) {
    var el = $('#' + id);
    if (!el) return;
    el.addEventListener('change', function () {
      if (id === 'sLang') { fillPoolOptions($('#sLang').value, null); fillPassageOptions(); if ($('#sLang').value === 'hi') $('#sKb').checked = false; }
      if (id === 'sPool') { fillPassageOptions(); }
      rules();
    });
  });

  $('#sRead').addEventListener('change', function () { $('#goTest').disabled = !this.checked; });
  $('#goTest').addEventListener('click', function () {
    var c = formCfg();
    if (c.pool === 'custom' && E.tokenize(c.custom).length < 40) { toast('Paste at least 40 words, or pick another passage type.'); return; }
    settings.name = $('#sName').value.trim(); store.set('settings', settings);
    c.passage = makePassage(c);
    beginWithCountdown(c);
  });

  function makePassage(c) {
    if (c.passage && c.reuse) return c.passage;
    var base = Math.max(c.wpm || 0, c.kdph ? c.kdph / 300 : 0, 40);
    var words = Math.ceil(c.min * base * 1.4);
    if (c.pool === 'custom') return c.custom.replace(/\s+/g, ' ').trim();
    if (c.pool === 'data') return D.dataEntry(words);
    var pool = D.getPassagePool(c.lang, c.pool, c.difficulty);
    if (c.passageIndex && c.passageIndex !== 'random') {
      var pIdx = parseInt(c.passageIndex, 10);
      if (!isNaN(pIdx) && pool[pIdx]) {
        var chosen = pool[pIdx];
        if (E.tokenize(chosen).length >= words) return chosen;
        return E.buildPassage([chosen].concat(pool), words);
      }
    }
    return E.buildPassage(pool, words);
  }

  /* ---------------- countdown ---------------- */
  function beginWithCountdown(c) {
    var box = $('#count'), n = 3;
    box.classList.remove('hide');
    (function tick() {
      var b = document.createElement('b'); b.textContent = n; box.innerHTML = ''; box.appendChild(b);
      if (n === 0) { box.classList.add('hide'); startTest(c); return; }
      n--; setTimeout(tick, animOn() ? 800 : 350);
    })();
  }

  /* ---------------- test runner ---------------- */
  var T = null;
  var inp = $('#tInput'), pass = $('#tPassage');
  function startTest(c) {
    var refChars = E.chars(c.passage);
    T = { cfg: c, passage: c.passage, refWords: E.tokenize(c.passage), refChars: refChars, started: false, running: true, done: false,
      keys: 0, wrong: 0, back: 0, prev: [], ok: 0, t0: 0, timeline: [], lastSec: -1, cur: -1, els: [] };
    show('test');
    var diffName = c.difficulty ? c.difficulty.charAt(0).toUpperCase() + c.difficulty.slice(1) : 'Medium';
    $('#tExam').textContent = c.name + ' · ' + c.sub + ' (' + diffName + ')';
    $('#tName').textContent = c.candidate;
    $('#tLive').classList.toggle('hide', !!c.blind);
    $('#tTimer').textContent = fmt(c.min * 60); $('#tTimer').classList.remove('low');
    $('#tBar').style.width = '0';
    $('#tMsg').textContent = c.backspace ? '' : '🔒 Backspace is locked for this test.';
    pass.innerHTML = T.refWords.map(function (w, i) { return '<span class="w" data-i="' + i + '">' + esc(w) + '</span>'; }).join(' ');
    pass.scrollTop = 0;
    T.els = $$('.w', pass);
    pass.setAttribute('lang', c.lang);
    inp.setAttribute('lang', c.lang === 'hi' ? 'hi' : 'en');
    inp.value = ''; inp.disabled = false; inp.readOnly = false;
    $('#kb').classList.toggle('hide', !c.kb);
    if (c.kb) { buildKb(); hintKey(); }
    paint();
    setTimeout(function () { inp.focus(); }, 30);
    if (settings.clock === 'start') beginClock();
    T.timer = setInterval(tick, 100);
  }
  function beginClock() { if (T.started) return; T.started = true; T.t0 = performance.now(); }
  function elapsed() { return T.started ? (performance.now() - T.t0) / 1000 : 0; }
  function liveChars() { return E.chars(inp.value).length; }

  function tick() {
    if (!T || T.done) return;
    var dur = T.cfg.min * 60, el = elapsed(), rem = dur - el;
    $('#tTimer').textContent = fmt(rem);
    $('#tTimer').classList.toggle('low', T.started && rem <= 30);
    $('#tBar').style.width = Math.min(100, el / dur * 100) + '%';
    var sec = Math.floor(el);
    if (T.started && sec !== T.lastSec) {
      T.lastSec = sec;
      var ch = liveChars();
      T.timeline.push({ t: sec, chars: ch });
      if (!T.cfg.blind) {
        $('#lWpm').textContent = sec >= 3 ? Math.round(ch / 5 / (el / 60)) : 0;
        $('#lWords').textContent = E.tokenize(inp.value).length;
        $('#lKeys').textContent = T.keys;
      }
    }
    if (T.started && rem <= 0) finishTest('time');
  }

  var paintQueued = false;
  function paint() { if (paintQueued) return; paintQueued = true; requestAnimationFrame(function () { paintQueued = false; doPaint(); }); }
  function doPaint() {
    if (!T) return;
    var val = inp.value, tw = E.tokenize(val), open = val.length > 0 && !/\s$/.test(val);
    var cur = open ? tw.length - 1 : tw.length;
    var blind = T.cfg.blind, ref = T.refWords, els = T.els;
    for (var i = 0; i < els.length; i++) {
      var cls = 'w';
      if (!blind) {
        if (i < cur) {
          var a = tw[i], b = ref[i];
          cls += a === b ? ' ok' : (E.loose(a) === E.loose(b) && E.loose(a) ? ' half' : ' bad');
        } else if (i === cur) {
          var part = open ? tw[cur] : '';
          cls += ' cur' + (ref[i].indexOf(part) === 0 ? '' : ' off');
        }
      }
      if (els[i].className !== cls) els[i].className = cls;
    }
    var c = els[Math.min(cur, els.length - 1)];
    if (c) {
      var top = c.offsetTop, h = pass.clientHeight;
      if (top < pass.scrollTop + 10) {
        pass.scrollTop = Math.max(0, top - h * 0.2);
      } else if (top > pass.scrollTop + h * 0.58) {
        pass.scrollTop = Math.max(0, top - h * 0.25);
      }
    }
  }

  function isCharEqual(a, b) {
    if (a === b) return true;
    if ((a === '\n' || a === ' ') && (b === ' ' || b === '\n')) return true;
    return false;
  }

  inp.addEventListener('input', function () {
    if (!T || T.done) return;
    if (!T.started) beginClock();
    var cur = E.chars(inp.value), prev = T.prev, d = cur.length - prev.length;
    var prevOk = T.ok, ok = 0, ref = T.refChars;
    while (ok < cur.length && ok < ref.length && isCharEqual(cur[ok], ref[ok])) ok++;
    if (d > 0) { T.keys += d; if (prevOk === prev.length && ok < cur.length) T.wrong++; }
    else if (d < 0) T.back += -d;
    T.ok = ok; T.prev = cur;
    paint();
    if (T.cfg.kb) hintKey();
    if (cur.length >= ref.length) finishTest('done');
  });
  var BLOCK_STRICT = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'PageUp', 'PageDown'];
  inp.addEventListener('keydown', function (e) {
    if (!T || T.done) return;
    var strict = !T.cfg.backspace;
    if (e.key === 'Tab') { e.preventDefault(); return; }
    if (e.key === 'Enter') {
      e.preventDefault();
      var start = inp.selectionStart, end = inp.selectionEnd;
      var val = inp.value;
      if (start > 0 && val.charAt(start - 1) === ' ') {
        inp.value = val.substring(0, start - 1) + '\n' + val.substring(end);
        inp.selectionStart = inp.selectionEnd = start;
      } else {
        inp.value = val.substring(0, start) + '\n' + val.substring(end);
        inp.selectionStart = inp.selectionEnd = start + 1;
      }
      inp.dispatchEvent(new Event('input'));
      return;
    }
    if (strict && (BLOCK_STRICT.indexOf(e.key) >= 0 || ((e.ctrlKey || e.metaKey) && 'zyaxv'.indexOf(e.key.toLowerCase()) >= 0))) { e.preventDefault(); return; }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'v') { e.preventDefault(); return; }
    click(e.key === 'Backspace' ? 700 : 1400);
    flashKey(e.key);
  });
  inp.addEventListener('keyup', function () { $$('.k.down').forEach(function (k) { k.classList.remove('down'); }); });
  inp.addEventListener('beforeinput', function (e) {
    if (!T) return;
    var t = e.inputType || '';
    if (/^insertFromPaste|^insertFromDrop/.test(t)) e.preventDefault();
    if (!T.cfg.backspace && /^delete|^history/.test(t)) e.preventDefault();
  });
  ['paste', 'drop', 'cut', 'copy', 'contextmenu'].forEach(function (ev) { inp.addEventListener(ev, function (e) { e.preventDefault(); }); });
  ['copy', 'contextmenu', 'cut'].forEach(function (ev) { pass.addEventListener(ev, function (e) { e.preventDefault(); }); });
  function toEnd() { if (T && !T.cfg.backspace) { var n = inp.value.length; inp.setSelectionRange(n, n); } }
  ['mouseup', 'click', 'select', 'focus'].forEach(function (ev) { inp.addEventListener(ev, toEnd); });

  function finishTest(reason) {
    if (!T || T.done) return;
    T.done = true; T.running = false; clearInterval(T.timer); inp.disabled = true;
    var dur = T.cfg.min * 60;
    var el = T.started ? Math.min(dur, reason === 'time' ? dur : elapsed()) : 0;
    var c = T.cfg;
    var rules_ = { targetWpm: c.wpm || 0, targetKdph: c.kdph || 0, maxErrPct: c.err < 100 ? c.err : null };
    if (c.mode === 'lesson') rules_ = { targetWpm: c.lesson.wpm, maxErrPct: 5 };
    var r = E.evaluate({ passage: T.passage, typed: inp.value, elapsedSec: el, keyDepressions: T.keys, wrongPresses: T.wrong, backspaces: T.back, rules: rules_ });
    r.timeline = T.timeline; r.cfg = c; r.rules = rules_; r.ts = Date.now();
    lastResult = r;
    if (r.typedWords > 0 || r.keyDepressions > 0) saveHistory(r);
    if (c.mode === 'lesson') saveLesson(c.lesson, r);
    showResult(r);
  }
  function cancelTest() { if (!T) return; T.done = true; T.running = false; clearInterval(T.timer); }
  $('#tSubmit').addEventListener('click', function () { if (T && T.started && !confirm('Submit the test now?')) return; if (T && !T.started) { toast('Type something first, or press Leave.'); return; } finishTest('submit'); });
  $('#tRestart').addEventListener('click', function () { if (!T) return; var c = Object.assign({}, T.cfg, { reuse: true }); cancelTest(); beginWithCountdown(c); });
  $('#tQuit').addEventListener('click', function () { if (T && T.started && !confirm('Leave this test? Your attempt will not be saved.')) return; cancelTest(); location.hash = T && T.cfg.mode === 'lesson' ? '#/practice' : '#/exams'; show(T && T.cfg.mode === 'lesson' ? 'practice' : 'exams'); });

  /* ---------------- on-screen keyboard ---------------- */
  var KROWS = [
    ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'Bksp'],
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']', '\\'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', "'"],
    ['Shift', 'z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/', 'Shift'],
    ['space']
  ];
  var FINGER = {}; (function () {
    var m = { 0: '`1qaz;/\'[]-=\\p0Bksp', 1: '2wsx9ol.', 2: '3edc8ik,', 3: '4rfv5tgb6yhn7ujm' };
    Object.keys(m).forEach(function (f) { var s = m[f]; for (var i = 0; i < s.length; i++) FINGER[s[i]] = f; });
    FINGER.space = 4; FINGER.Shift = 0; FINGER.Bksp = 0;
  })();
  var SHIFTED = { '~': '`', '!': '1', '@': '2', '#': '3', '$': '4', '%': '5', '^': '6', '&': '7', '*': '8', '(': '9', ')': '0', '_': '-', '+': '=', '{': '[', '}': ']', '|': '\\', ':': ';', '"': "'", '<': ',', '>': '.', '?': '/' };
  function buildKb() {
    var h = '';
    KROWS.forEach(function (row) {
      h += '<div class="r">';
      row.forEach(function (k) {
        var cls = 'k' + (k === 'space' ? ' sp1' : (k === 'Shift' || k === 'Bksp') ? ' w2' : '') + ((k === 'f' || k === 'j') ? ' home' : '');
        h += '<div class="' + cls + '" data-k="' + esc(k) + '" data-f="' + (FINGER[k] !== undefined ? FINGER[k] : '') + '">' + (k === 'space' ? '' : k === 'Bksp' ? '⌫' : esc(k.length === 1 ? k.toUpperCase() : k)) + '</div>';
      });
      h += '</div>';
    });
    $('#kb').innerHTML = h;
  }
  function kbEl(k) { return $('#kb [data-k="' + (window.CSS && CSS.escape ? CSS.escape(k) : k) + '"]'); }
  function hintKey() {
    $$('#kb .next').forEach(function (k) { k.classList.remove('next'); });
    if (!T) return;
    var ch, need;
    if (T.ok < T.prev.length) { need = 'Bksp'; }
    else { ch = T.refChars[T.prev.length]; if (ch === undefined) return; }
    var keys = [];
    if (need) keys = [need];
    else if (ch === ' ') keys = ['space'];
    else if (SHIFTED[ch]) keys = [SHIFTED[ch], 'Shift'];
    else if (ch.toLowerCase() !== ch.toUpperCase() && ch === ch.toUpperCase()) keys = [ch.toLowerCase(), 'Shift'];
    else keys = [ch];
    keys.forEach(function (k) { $$('#kb [data-k]').forEach(function (el) { if (el.dataset.k === k) el.classList.add('next'); }); });
  }
  function flashKey(key) {
    if (!T || !T.cfg.kb) return;
    var k = key === ' ' ? 'space' : key === 'Backspace' ? 'Bksp' : key.length === 1 ? key.toLowerCase() : key;
    if (SHIFTED[key]) k = SHIFTED[key];
    $$('#kb [data-k]').forEach(function (el) { if (el.dataset.k === k) el.classList.add('down'); });
  }

  /* ---------------- history ---------------- */
  var lastResult = null;
  function history() { return store.get('history', []); }
  function saveHistory(r) {
    var h = history(), c = r.cfg;
    h.push({ ts: r.ts, id: c.id, name: c.name + ' · ' + c.sub + (c.difficulty ? ' [' + c.difficulty.toUpperCase() + ']' : ''), lang: c.lang, mode: c.mode || 'exam', dur: c.min * 60, el: Math.round(r.elapsedSec), net: +r.net.toFixed(1), gross: +r.gross.toFixed(1), kdph: Math.round(r.kdph), acc: +r.wordAccuracy.toFixed(1), full: r.fullMistakes, half: r.halfMistakes, words: r.typedWords, pass: r.pass, cand: c.candidate, target: c.kdph ? c.kdph + ' KDPH' : c.wpm ? c.wpm + ' WPM' : '-' });
    if (h.length > 500) h = h.slice(-500);
    store.set('history', h);
  }

  /* ---------------- result ---------------- */
  function countUp(el, to, dec) {
    if (!animOn()) { el.textContent = to.toFixed(dec); return; }
    var t0 = performance.now();
    (function f(t) { var p = Math.min(1, (t - t0) / 800); el.textContent = (to * (1 - Math.pow(1 - p, 3))).toFixed(dec); if (p < 1) requestAnimationFrame(f); })(t0);
  }
  function showResult(r) {
    var c = r.cfg, dest = !!c.kdph && c.mode !== 'lesson';
    show('result');
    var st = $('#rStamp');
    st.className = 'stamp' + (r.pass ? ' pass' : '');
    var hasTarget = (r.rules.targetKdph || r.rules.targetWpm);
    st.innerHTML = r.pass ? (hasTarget ? 'PASS' : 'DONE') + '<small>' + esc(c.name) + '</small>' : 'NOT YET<small>' + esc(c.name) + '</small>';
    $('#rTitle').textContent = r.pass ? (hasTarget ? 'You cleared it.' : 'Test finished.') : 'Close, keep going.';
    var diffName = c.difficulty ? c.difficulty.charAt(0).toUpperCase() + c.difficulty.slice(1) : 'Medium';
    $('#rSub').textContent = c.candidate + ' · ' + c.name + ' ' + c.sub + ' (' + diffName + ') · ' + new Date(r.ts).toLocaleString();
    $('#rReasons').textContent = r.pass ? '' : r.reasons.join(' ');
    $('#rCert').classList.toggle('hide', !(r.pass && hasTarget && c.mode !== 'lesson'));
    var nextOk = c.mode === 'lesson' && r.pass && c.lesson.id < D.LESSONS.length;
    $('#rNext').classList.toggle('hide', !nextOk);
    var tiles = [
      [dest ? r.kdph : r.net, dest ? 'key depressions / hour' : 'net WPM', dest ? 0 : 1, true],
      [r.gross, 'gross WPM', 1], [r.wordAccuracy, 'word accuracy %', 1], [r.fullMistakes, 'full mistakes', 0], [r.halfMistakes, 'half mistakes', 0],
      [dest ? r.net : r.kdph, dest ? 'net WPM' : 'key depressions / hour', dest ? 1 : 0], [r.keyDepressions, 'key presses', 0], [r.backspaces, 'backspaces', 0], [r.typedWords, 'words typed', 0]
    ];
    $('#rTiles').innerHTML = tiles.map(function (t, i) { return '<div class="tile' + (t[3] ? ' big' : '') + '"><b data-v="' + t[0] + '" data-d="' + t[2] + '">0</b><span>' + t[1] + '</span></div>'; }).join('');
    $$('#rTiles b').forEach(function (b) { countUp(b, +b.dataset.v, +b.dataset.d); });
    $('#rWeakWrap').classList.toggle('hide', !r.weak.length);
    $('#rWeak').innerHTML = r.weak.map(function (w) { return '<span class="chip">' + (w.ch === ' ' ? 'space' : esc(w.ch)) + ' × ' + w.n + '</span>'; }).join('');
    $('#rReview').innerHTML = reviewHtml(r.ops);
    drawResultChart(r);
    if (r.pass && hasTarget && animOn()) confetti();
  }
  function reviewHtml(ops) {
    return ops.map(function (p) {
      switch (p.t) {
        case 'ok': return esc(p.typed);
        case 'half': return '<span class="h" title="Typed: ' + esc(p.typed) + '">' + esc(p.ref) + '</span>';
        case 'sub': return '<span class="s"><del>' + esc(p.typed) + '</del><ins>' + esc(p.ref) + '</ins></span>';
        case 'extra': return '<span class="e"><del>' + esc(p.typed) + '</del></span>';
        case 'skip': return '<span class="k2"><ins>' + esc(p.ref) + '</ins></span>';
        case 'partial': return '<span class="muted">' + esc(p.typed) + '</span>';
      }
      return '';
    }).join(' ');
  }
  $('#rAgain').addEventListener('click', function () { var c = Object.assign({}, lastResult.cfg, { reuse: true }); beginWithCountdown(c); });
  $('#rNew').addEventListener('click', function () {
    var c = Object.assign({}, lastResult.cfg, { reuse: false });
    if (c.mode === 'lesson') { startLesson(c.lesson); return; }
    c.passage = makePassage(c); beginWithCountdown(c);
  });
  $('#rNext').addEventListener('click', function () { startLesson(D.LESSONS[lastResult.cfg.lesson.id]); });
  $('#rCert').addEventListener('click', function () { showCert(lastResult); });

  /* ---------------- charts ---------------- */
  function css(v) { return getComputedStyle(document.documentElement).getPropertyValue(v).trim(); }
  function drawLines(cv, series, opts) {
    var dpr = window.devicePixelRatio || 1, w = cv.clientWidth || 800, h = cv.clientHeight || 220;
    cv.width = w * dpr; cv.height = h * dpr;
    var g = cv.getContext('2d'); g.scale(dpr, dpr); g.clearRect(0, 0, w, h);
    var L = 44, R = 14, Tp = 14, B = 28, pw = w - L - R, ph = h - Tp - B;
    var maxY = opts.line || 10, maxX = opts.maxX || 1;
    series.forEach(function (s) { s.pts.forEach(function (p) { if (p[1] > maxY) maxY = p[1]; if (p[0] > maxX) maxX = p[0]; }); });
    maxY = Math.ceil(maxY * 1.15 / 10) * 10;
    g.font = '12px ' + css('--sans'); g.textBaseline = 'middle';
    g.strokeStyle = css('--line'); g.fillStyle = css('--ink-2'); g.lineWidth = 1;
    for (var i = 0; i <= 4; i++) { var y = Tp + ph - ph * i / 4; g.beginPath(); g.moveTo(L, y); g.lineTo(w - R, y); g.stroke(); g.textAlign = 'right'; g.fillText(Math.round(maxY * i / 4), L - 8, y); }
    g.textAlign = 'center'; g.textBaseline = 'top';
    (opts.xTicks || []).forEach(function (t) { var x = L + pw * t[0] / maxX; g.fillText(t[1], x, h - B + 8); });
    if (opts.line) { var yl = Tp + ph - ph * opts.line / maxY; g.setLineDash([6, 5]); g.strokeStyle = css('--stamp'); g.beginPath(); g.moveTo(L, yl); g.lineTo(w - R, yl); g.stroke(); g.setLineDash([]); g.fillStyle = css('--stamp'); g.textAlign = 'left'; g.fillText(opts.lineLabel || '', L + 6, yl - 14); }
    series.forEach(function (s) {
      if (!s.pts.length) return;
      g.strokeStyle = s.color; g.lineWidth = s.w || 2.5; g.lineJoin = 'round'; g.beginPath();
      s.pts.forEach(function (p, i) { var x = L + pw * p[0] / maxX, y = Tp + ph - ph * p[1] / maxY; i ? g.lineTo(x, y) : g.moveTo(x, y); }); g.stroke();
      if (s.dots) s.pts.forEach(function (p) { g.fillStyle = s.color; g.beginPath(); g.arc(L + pw * p[0] / maxX, Tp + ph - ph * p[1] / maxY, 3.5, 0, 7); g.fill(); });
    });
  }
  function drawResultChart(r) {
    var tl = r.timeline, cum = [], win = [];
    tl.forEach(function (s, i) {
      if (s.t < 2) return;
      cum.push([s.t, s.chars / 5 / (s.t / 60)]);
      var back = tl[Math.max(0, i - 10)]; var dt = s.t - back.t;
      if (dt >= 3) win.push([s.t, (s.chars - back.chars) / 5 / (dt / 60)]);
    });
    var maxX = Math.max(10, Math.round(r.elapsedSec)), ticks = [];
    for (var m = 0; m <= maxX; m += maxX > 300 ? 120 : maxX > 120 ? 60 : 30) ticks.push([m, Math.floor(m / 60) + ':' + String(m % 60).padStart(2, '0')]);
    drawLines($('#rChart'), [{ pts: win, color: '#9fb2c4', w: 1.5 }, { pts: cum, color: '#15a6f0' }], { line: r.rules.targetWpm || (r.rules.targetKdph ? r.rules.targetKdph / 300 : 0), lineLabel: 'target', maxX: maxX, xTicks: ticks });
  }

  /* ---------------- confetti ---------------- */
  function confetti() {
    var cv = $('#confetti'), g = cv.getContext('2d'), w = cv.width = innerWidth, h = cv.height = innerHeight;
    var cols = ['#15a6f0', '#f6a31b', '#1f9d55', '#c8362f', '#ffffff'], ps = [];
    for (var i = 0; i < 140; i++) ps.push({ x: w / 2 + (Math.random() - .5) * 200, y: h * .35, vx: (Math.random() - .5) * 14, vy: -Math.random() * 13 - 3, s: 5 + Math.random() * 7, c: cols[i % 5], r: Math.random() * 6, vr: (Math.random() - .5) * .4 });
    var t0 = performance.now();
    (function f(t) {
      g.clearRect(0, 0, w, h);
      ps.forEach(function (p) { p.vy += .32; p.vx *= .992; p.x += p.vx; p.y += p.vy; p.r += p.vr; g.save(); g.translate(p.x, p.y); g.rotate(p.r); g.fillStyle = p.c; g.fillRect(-p.s / 2, -p.s / 3, p.s, p.s * .6); g.restore(); });
      if (t - t0 < 3200) requestAnimationFrame(f); else g.clearRect(0, 0, w, h);
    })(t0);
  }

  /* ---------------- lessons ---------------- */
  function lessonProgress() { return store.get('lessons', {}); }
  function renderLessons() {
    var lp = lessonProgress();
    $('#lessonGrid').innerHTML = D.LESSONS.map(function (l) {
      var open = l.id === 1 || (lp[l.id - 1] && lp[l.id - 1].stars >= 1), mine = lp[l.id];
      var stars = mine ? '★'.repeat(mine.stars) + '☆'.repeat(3 - mine.stars) : '☆☆☆';
      return '<button class="lcard' + (open ? '' : ' locked') + '" data-lesson="' + l.id + '"' + (open ? '' : ' aria-disabled="true"') + '><span class="em">' + (open ? l.emoji : '🔒') + '</span><h3>' + l.id + '. ' + l.title + '</h3><small>Reach ' + l.wpm + ' WPM</small><div class="stars">' + stars + '</div>' + (mine ? '<small>Best ' + mine.best + ' WPM</small>' : '') + '</button>';
    }).join('');
  }
  $('#lessonGrid').addEventListener('click', function (e) {
    var b = e.target.closest('[data-lesson]'); if (!b) return;
    if (b.classList.contains('locked')) { toast('Earn one star on the lesson before this one to unlock it.'); return; }
    startLesson(D.LESSONS[+b.dataset.lesson - 1]);
  });
  function lessonText(l) {
    var r = E.rng(Date.now() & 0xffffffff), words = Math.ceil(2 * (l.wpm + 12)), out = [];
    function pick(a) { return a[Math.floor(r() * a.length)]; }
    if (l.passage) return E.buildPassage(D.POOLS.general, words);
    if (l.words) { for (var i = 0; i < words; i++) out.push(pick(l.words)); return out.join(' '); }
    var keys = E.chars(l.keys);
    for (var j = 0; j < words; j++) { var n = 3 + Math.floor(r() * 4), w = ''; for (var k = 0; k < n; k++) w += pick(keys); out.push(w); }
    return out.join(' ');
  }
  function startLesson(l) {
    var c = { id: 'lesson-' + l.id, icon: l.emoji, name: 'Lesson ' + l.id, sub: l.title, lang: 'en', pool: 'general', min: 2, wpm: l.wpm, kdph: 0, err: 5, backspace: true, blind: false, kb: true, candidate: settings.name || 'Candidate', mode: 'lesson', lesson: l, passage: lessonText(l) };
    beginWithCountdown(c);
  }
  function saveLesson(l, r) {
    var lp = lessonProgress(), old = lp[l.id] || { best: 0, stars: 0 }, stars = 0;
    if (r.pass) { stars = 1; if (r.net >= l.wpm + 5) stars = 2; if (r.net >= l.wpm + 10 && r.wordAccuracy >= 98) stars = 3; }
    lp[l.id] = { best: Math.max(old.best, Math.round(r.net)), stars: Math.max(old.stars, stars) };
    store.set('lessons', lp);
  }

  /* ---------------- progress ---------------- */
  function streak(h) {
    var days = {}; h.forEach(function (x) { days[new Date(x.ts).toDateString()] = 1; });
    var d = new Date(), n = 0;
    if (!days[d.toDateString()]) d.setDate(d.getDate() - 1);
    while (days[d.toDateString()]) { n++; d.setDate(d.getDate() - 1); }
    return n;
  }
  function renderProgress() {
    var h = history(), last10 = h.slice(-10);
    var best = h.reduce(function (m, x) { return Math.max(m, x.net); }, 0);
    var avg = last10.length ? last10.reduce(function (s, x) { return s + x.net; }, 0) / last10.length : 0;
    var mins = Math.round(h.reduce(function (s, x) { return s + (x.el || 0); }, 0) / 60);
    var t = [[h.length, 'tests taken'], [best.toFixed(1), 'best net WPM'], [avg.toFixed(1), 'average, last 10'], [mins, 'minutes typed'], [streak(h), 'day streak 🔥']];
    $('#pTiles').innerHTML = t.map(function (x) { return '<div class="tile"><b>' + x[0] + '</b><span>' + x[1] + '</span></div>'; }).join('');
    var pts = h.slice(-30).map(function (x, i) { return [i + 1, x.net]; });
    drawLines($('#pChart'), [{ pts: pts, color: '#15a6f0', dots: true }], { maxX: Math.max(pts.length, 2), xTicks: pts.length ? [[1, 'older'], [pts.length, 'latest']] : [] });
    var rows = h.slice(-50).reverse().map(function (x) {
      return '<tr><td>' + new Date(x.ts).toLocaleDateString() + '</td><td>' + esc(x.name) + '</td><td>' + (x.lang === 'hi' ? 'हिंदी' : 'EN') + '</td><td><b>' + x.net + '</b></td><td>' + x.acc + '%</td><td>' + x.full + ' / ' + x.half + '</td><td><span class="tag ' + (x.pass ? 'p">Pass' : 'f">Not yet') + '</span></td><td><button class="btn alt sm" data-del="' + x.ts + '" aria-label="Delete">✕</button></td></tr>';
    }).join('');
    $('#pTable').innerHTML = '<tr><th>Date</th><th>Test</th><th>Lang</th><th>Net WPM</th><th>Accuracy</th><th>Full / half</th><th>Result</th><th></th></tr>' + (rows || '<tr><td colspan="8" class="muted">No tests yet. Take one and it will show up here.</td></tr>');
  }
  $('#pTable').addEventListener('click', function (e) {
    var b = e.target.closest('[data-del]'); if (!b) return;
    store.set('history', history().filter(function (x) { return String(x.ts) !== b.dataset.del; })); renderProgress();
  });
  function download(name, text, type) {
    try { var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type: type })); a.download = name; document.body.appendChild(a); a.click(); a.remove(); } catch (e) { /* fall through */ }
    if (navigator.clipboard) navigator.clipboard.writeText(text).then(function () { toast('Saved. A copy is also on your clipboard.'); }, function () { toast('Saved.'); });
  }
  $('#pCsv').addEventListener('click', function () {
    var h = history(), cols = ['ts', 'name', 'lang', 'net', 'gross', 'kdph', 'acc', 'full', 'half', 'words', 'pass', 'cand'];
    var csv = cols.join(',') + '\n' + h.map(function (x) { return cols.map(function (c) { var v = c === 'ts' ? new Date(x.ts).toISOString() : x[c]; return '"' + String(v).replace(/"/g, '""') + '"'; }).join(','); }).join('\n');
    download('tankan-history.csv', csv, 'text/csv');
  });
  $('#pJson').addEventListener('click', function () { download('tankan-backup.json', JSON.stringify({ history: history(), lessons: lessonProgress(), settings: settings }), 'application/json'); });
  $('#pImport').addEventListener('change', function () {
    var f = this.files[0]; if (!f) return; var fr = new FileReader();
    fr.onload = function () { try { var d = JSON.parse(fr.result); if (Array.isArray(d.history)) store.set('history', d.history); if (d.lessons) store.set('lessons', d.lessons); toast('Backup restored.'); renderProgress(); } catch (e) { toast('That file is not a Tankan backup.'); } };
    fr.readAsText(f);
  });
  $('#pClear').addEventListener('click', function () { if (confirm('Delete all saved results and lesson stars on this device?')) { store.set('history', []); store.set('lessons', {}); renderProgress(); } });

  /* ---------------- certificate ---------------- */
  function hash(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0).toString(16).toUpperCase().padStart(8, '0'); }
  function showCert(r) {
    var c = r.cfg, id = 'TK-' + hash(r.ts + c.candidate + r.net.toFixed(1) + c.id);
    $('#certBox').innerHTML = '<h2>Typing practice certificate</h2><p>This records that</p><div class="nm">' + esc(c.candidate) + '</div>' +
      '<p>completed the <b>' + esc(c.name) + ' (' + esc(c.sub) + ')</b> practice test of ' + c.min + ' minutes and met its passing speed.</p>' +
      '<table><tr><td>Net speed</td><td><b>' + r.net.toFixed(1) + ' WPM</b></td><td>Word accuracy</td><td><b>' + r.wordAccuracy.toFixed(1) + '%</b></td></tr>' +
      '<tr><td>Full mistakes</td><td>' + r.fullMistakes + '</td><td>Half mistakes</td><td>' + r.halfMistakes + '</td></tr>' +
      '<tr><td>Key depressions / hour</td><td>' + Math.round(r.kdph) + '</td><td>Date</td><td>' + new Date(r.ts).toLocaleDateString() + '</td></tr></table>' +
      '<p>Certificate no. <b>' + id + '</b></p><p class="fine">Generated by Tankan on this device for practice. It is not issued by SSC, RRB or any government body and does not replace an official skill test.</p>';
    show('cert');
  }
  $('#cPrint').addEventListener('click', function () { window.print(); });
  $('#cBack').addEventListener('click', function () { show('result'); });

  /* ---------------- settings ---------------- */
  function fillSettings() {
    $('#stName').value = settings.name; $('#stTheme').value = settings.theme; $('#stSize').value = settings.size; $('#stFont').value = settings.font;
    $('#stClock').value = settings.clock; $('#stSound').checked = settings.sound; $('#stAnim').checked = settings.anim;
  }
  [['stName', 'name'], ['stTheme', 'theme'], ['stSize', 'size'], ['stFont', 'font'], ['stClock', 'clock']].forEach(function (p) {
    $('#' + p[0]).addEventListener('input', function () { settings[p[1]] = this.value; saveSettings(); });
  });
  $('#stSound').addEventListener('change', function () { settings.sound = this.checked; saveSettings(); click(); });
  $('#stAnim').addEventListener('change', function () { settings.anim = this.checked; saveSettings(); });
  if (window.matchMedia) matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applySettings);

  /* ---------------- boot ---------------- */
  window.TK = { $: $, $$: $$, store: store, settings: settings, toast: toast, click: click, animOn: animOn, esc: esc };
  applySettings();
  $('#homeExams').innerHTML = D.EXAMS.slice(0, 8).map(card).join('');
  // Offline cache is for the browser/PWA only. The Windows app already ships its files, and a cache there would hide updates.
  var inTauri = !!(window.__TAURI_INTERNALS__ || window.__TAURI__) || location.hostname === 'tauri.localhost';
  if (inTauri) document.body.classList.add('is-tauri');
  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol) && !inTauri) navigator.serviceWorker.register('sw.js').catch(function () { });
  route();
})();
