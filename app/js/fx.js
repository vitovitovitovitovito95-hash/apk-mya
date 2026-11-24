'use strict';
/* v9.0 — Effetti grafici e sonori leggeri (compatibili Android 6 / iOS Safari).
   - un solo AudioContext riutilizzato (prima ne veniva creato uno a ogni suono)
   - melodie brevi: risposta giusta, errore, livello completato
   - coriandoli DOM + CSS al completamento livello
   - vibrazione breve dove supportata
   Tutto si disattiva con "Suoni" off o con prefers-reduced-motion. */
(function (NS) {
    var ctx = null;
    function audio() {
        if (ctx)
            return ctx;
        var C = window.AudioContext || window.webkitAudioContext;
        if (!C)
            return null;
        try {
            ctx = new C();
        }
        catch (_e) {
            ctx = null;
        }
        return ctx;
    }
    function tone(c, freq, start, dur, type, vol) {
        var o = c.createOscillator(), g = c.createGain();
        o.type = type || 'sine';
        o.frequency.setValueAtTime(freq, c.currentTime + start);
        g.gain.setValueAtTime(0.0001, c.currentTime + start);
        g.gain.linearRampToValueAtTime(vol || 0.05, c.currentTime + start + 0.015);
        g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + start + dur);
        o.connect(g);
        g.connect(c.destination);
        o.start(c.currentTime + start);
        o.stop(c.currentTime + start + dur + 0.02);
    }
    var MELODIES = {
        good: [[660, 0, .1], [880, .08, .16]],
        bad: [[260, 0, .14, 'triangle'], [196, .11, .2, 'triangle']],
        win: [[523, 0, .12], [659, .1, .12], [784, .2, .12], [1047, .3, .32]],
        tap: [[520, 0, .05]]
    };
    function play(name, enabled) {
        if (enabled === false)
            return;
        var c = audio();
        if (!c)
            return;
        try {
            if (c.state === 'suspended' && c.resume)
                c.resume();
            (MELODIES[name] || MELODIES.tap).forEach(function (n) { return tone(c, n[0], n[1], n[2], n[3], name === 'bad' ? 0.06 : 0.045); });
        }
        catch (_e) { }
    }
    function reducedMotion() {
        try {
            return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        }
        catch (_e) {
            return false;
        }
    }
    function vibrate(ms) { try {
        if (navigator.vibrate)
            navigator.vibrate(ms);
    }
    catch (_e) { } }
    function confetti(amount) {
        if (reducedMotion())
            return;
        var colors = ['#ff5d73', '#ffb547', '#ffe066', '#4cd685', '#4aa8ff', '#8f7bff', '#ff8fd1'];
        var layer = document.createElement('div');
        layer.className = 'confettiLayer';
        var n = amount || 46;
        for (var i = 0; i < n; i++) {
            var p = document.createElement('i');
            var left = Math.random() * 100, delay = Math.random() * 0.35, dur = 1.6 + Math.random() * 1.2, size = 7 + Math.random() * 7;
            var drift = Math.round((Math.random() - 0.5) * 160);
            p.style.left = left + '%';
            p.style.width = size + 'px';
            p.style.height = (size * 0.55) + 'px';
            p.style.background = colors[i % colors.length];
            p.style.webkitAnimationDelay = p.style.animationDelay = delay + 's';
            p.style.webkitAnimationDuration = p.style.animationDuration = dur + 's';
            p.className = 'c' + (i % 3) + (drift < 0 ? ' l' : ' r');
            if (i % 4 === 0)
                p.style.borderRadius = '50%';
            layer.appendChild(p);
        }
        document.body.appendChild(layer);
        setTimeout(function () { if (layer.parentNode)
            layer.parentNode.removeChild(layer); }, 3400);
    }
    function burst(el) {
        if (!el || reducedMotion())
            return;
        var r = el.getBoundingClientRect(), layer = document.createElement('div');
        layer.className = 'sparkLayer';
        layer.style.left = (r.left + r.width / 2) + 'px';
        layer.style.top = (r.top + r.height / 2) + 'px';
        for (var i = 0; i < 8; i++) {
            var s = document.createElement('i');
            s.className = 'spark s' + i;
            s.textContent = i % 2 ? '✦' : '★';
            layer.appendChild(s);
        }
        document.body.appendChild(layer);
        setTimeout(function () { if (layer.parentNode)
            layer.parentNode.removeChild(layer); }, 900);
    }
    function shake(el) {
        if (!el)
            return;
        el.classList.remove('fxShake');
        void el.offsetWidth;
        el.classList.add('fxShake');
    }
    function heartLost() {
        var e = document.getElementById('lifeCounter');
        if (!e)
            return;
        e.classList.remove('heartHit');
        void e.offsetWidth;
        e.classList.add('heartHit');
    }
    NS.fx = { play: play, confetti: confetti, burst: burst, shake: shake, vibrate: vibrate, heartLost: heartLost, reducedMotion: reducedMotion };
})(window.LogicLand);
