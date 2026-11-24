'use strict';
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
/* v9.2 — Scala dei livelli riprogettata gioco per gioco.
   Ogni gioco ha una TABELLA di 15 livelli scritta a mano: ogni livello cambia almeno una
   caratteristica concreta (regola, numero di elementi, caratteristiche da confrontare,
   tipo di domanda, numero e somiglianza delle risposte). Niente “salto di +3 livelli”:
   il livello 1 è il livello 1, il 15 è davvero il più difficile.
   Ogni domanda espone meta.age6Metrics.rank: un vettore che cresce in ordine
   lessicografico da un livello al successivo (verificato da tests/v92_levels_test.js). */
(function (NS) {
    var rnd = function (a, b) { return NS.rnd(a, b); }, pick = function (a) { return NS.pick(a); }, sh = function (a) { return NS.shuffle(a); };
    var CH = [3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 6, 6, 6, 6];
    var nc = function (l) { return CH[l - 1]; };
    NS.LEVEL_INFO = NS.LEVEL_INFO || {};
    function q(id, l, question, metric) {
        var o = NS.attachDifficulty(question, id, l);
        o.meta.age6 = true;
        o.meta.age6Load = NS.AGE6_DIFFICULTY[l - 1].load;
        o.meta.age6Metrics = metric;
        o.meta.v92 = true;
        return o;
    }
    // Opzioni numeriche: a livelli alti i distrattori sono “errori plausibili” passati dal generatore.
    function numOpts(answer, count, near) {
        var vals = [answer];
        (near || []).concat(sh([answer + 1, answer - 1, answer + 2, answer - 2, answer + 3, answer - 3, answer + 5, answer - 5, answer + 10, answer - 10]))
            .forEach(function (v) { v = Math.round(v); if (v >= 0 && vals.indexOf(v) < 0 && vals.length < count)
            vals.push(v); });
        var d = 11;
        while (vals.length < count) {
            if (vals.indexOf(answer + d) < 0)
                vals.push(answer + d);
            d++;
        }
        return sh(vals).map(String);
    }
    /* ===== Gettoni grafici: forma colorata + direzione + taglia (usati da 7, 8, 33) ===== */
    var HEX = ['#ff3b4f', '#2f80ff', '#1fb26b', '#ffb400', '#9b5cff', '#ff7a1a'];
    var SHP = ['●', '▲', '■', '◆', '★', '⬟'];
    function tok(t, f) {
        var shape = f >= 2 ? SHP[t[1]] : '●', dir = f >= 3 ? '<i class="tkDir" style="-webkit-transform:rotate(' + (t[2] * 90) + 'deg);transform:rotate(' + (t[2] * 90) + 'deg)">➜</i>' : '';
        return '<span class="tk' + (f >= 4 && t[3] ? ' tkBig' : '') + '" style="color:' + HEX[t[0]] + '">' + shape + dir + '</span>';
    }
    var key = function (t, f) { return t.slice(0, f).join('-'); };
    var randT = function () { return [rnd(0, 5), rnd(0, 5), rnd(0, 3), rnd(0, 1)]; };
    function nearT(t, f, only) { var ft = only !== undefined ? only : rnd(0, f - 1), size = [6, 6, 4, 2][ft], v = t.slice(); var x = t[ft]; while (x === t[ft])
        x = rnd(0, size - 1); v[ft] = x; return v; }
    function tiles(list, numbered, extra) { return '<div class="tkStrip">' + list.map(function (h, i) { return '<span class="tkCell' + (extra && extra[i] ? ' ' + extra[i] : '') + '">' + (numbered ? '<small>' + (i + 1) + '</small>' : '') + h + '</span>'; }).join('') + '</div>'; }
    /* ========== 1. Numero Mancante ========== */
    var T1 = [
        ['step', 5, 'Aggiungi sempre 2'], ['step', 5, 'Salti più grandi (+3, +4, +5)'], ['down', 6, 'Sequenze che scendono'],
        ['stepHole', 6, 'Il numero mancante è in mezzo'], ['bigHole', 6, 'Salti da 7 a 11, numero in mezzo'], ['alt', 7, 'Due salti che si alternano'],
        ['altMix', 7, 'Sali e scendi a turno'], ['altHole', 8, 'Salti alternati con buco in mezzo'], ['grow', 7, 'Il salto cresce: +1, +2, +3…'],
        ['double', 6, 'Ogni numero è il doppio'], ['growHole', 8, 'Salto che cresce, buco in mezzo'], ['inter', 9, 'Due sequenze intrecciate'],
        ['fib', 7, 'Ogni numero = somma dei due precedenti'], ['mulAdd', 7, '×2 e +k a turno'], ['fibHole', 8, 'Somma dei due precedenti, buco in mezzo']
    ];
    NS.LEVEL_INFO[1] = T1.map(function (r) { return r[2]; });
    function g1(l) {
        var _a = __read(T1[l - 1], 2), kind = _a[0], n = _a[1];
        var seq = [], hide = -1, rule = '', near = [];
        var a = rnd(1, 5);
        if (kind === 'step') {
            var s = l === 1 ? 2 : rnd(3, 5);
            for (var i = 0; i <= n; i++)
                seq.push(a + i * s);
            rule = 'Aggiungi sempre ' + s + '.';
            near = [seq[n] + 1, seq[n] - s];
        }
        else if (kind === 'down') {
            var s = rnd(2, 3), st = s * n + rnd(3, 9);
            for (var i = 0; i <= n; i++)
                seq.push(st - i * s);
            rule = 'Togli sempre ' + s + '.';
            near = [seq[n] + s, seq[n] - 1];
        }
        else if (kind === 'stepHole' || kind === 'bigHole') {
            var s = kind === 'stepHole' ? rnd(4, 6) : rnd(7, 11), st = kind === 'bigHole' ? rnd(5, 20) : a;
            for (var i = 0; i < n; i++)
                seq.push(st + i * s);
            hide = rnd(1, n - 2);
            rule = 'Ogni volta +' + s + '.';
            near = [seq[hide] + s, seq[hide] - 1, seq[hide] + 1];
        }
        else if (kind === 'alt' || kind === 'altHole') {
            var x = rnd(1, 2), y = rnd(3, 5);
            var v = a;
            seq = [v];
            for (var i = 1; i <= n; i++) {
                v += i % 2 ? x : y;
                seq.push(v);
            }
            if (kind === 'altHole') {
                seq.pop();
                hide = rnd(2, n - 2);
            }
            rule = 'Alterna +' + x + ' e +' + y + '.';
            near = [x, y].map(function (d) { return (hide >= 0 ? seq[hide - 1] : seq[n - 1]) + d; });
        }
        else if (kind === 'altMix') {
            var x = rnd(3, 5), y = rnd(1, 2);
            var v = a + 5;
            seq = [v];
            for (var i = 1; i <= n; i++) {
                v += i % 2 ? x : -y;
                seq.push(v);
            }
            rule = 'Alterna +' + x + ' e −' + y + '.';
            near = [seq[n - 1] + x, seq[n - 1] - y].filter(function (z) { return z !== seq[n]; });
        }
        else if (kind === 'grow' || kind === 'growHole') {
            var v = a, d = kind === 'grow' ? 1 : rnd(2, 3);
            var d0 = d;
            seq = [v];
            for (var i = 1; i <= n; i++) {
                v += d;
                seq.push(v);
                d++;
            }
            if (kind === 'growHole') {
                seq.pop();
                hide = rnd(3, n - 2);
            }
            rule = 'Il salto cresce di 1 ogni volta (+' + d0 + ', +' + (d0 + 1) + ', +' + (d0 + 2) + '…).';
            var t = hide >= 0 ? hide : n;
            near = [seq[t - 1] + (seq[t - 1] - seq[t - 2]), seq[t] + 1];
        }
        else if (kind === 'double') {
            var v = rnd(1, 3);
            for (var i = 0; i <= n; i++) {
                seq.push(v);
                v *= 2;
            }
            rule = 'Ogni numero è il doppio del precedente.';
            near = [seq[n - 1] + (seq[n - 1] - seq[n - 2]), seq[n] + 2, seq[n - 1] * 3];
        }
        else if (kind === 'inter') {
            var up = rnd(2, 4), dn = rnd(1, 3);
            var x = a, y = dn * 6 + rnd(8, 14);
            for (var i = 0; i <= n; i++) {
                seq.push(i % 2 ? y : x);
                if (i % 2)
                    y -= dn;
                else
                    x += up;
            }
            rule = 'Due sequenze intrecciate: una sale di ' + up + ', l’altra scende di ' + dn + '.';
            near = [seq[n - 1] + up, seq[n - 1] - dn, seq[n - 2]];
        }
        else if (kind === 'fib' || kind === 'fibHole') {
            var x = rnd(1, 3), y = rnd(1, 4);
            seq = [x, y];
            while (seq.length <= n)
                seq.push(seq[seq.length - 1] + seq[seq.length - 2]);
            if (kind === 'fibHole') {
                seq.pop();
                hide = rnd(2, n - 3);
            }
            rule = 'Ogni numero è la somma dei due prima.';
            var t = hide >= 0 ? hide : n;
            near = [seq[t - 1] * 2, seq[t] + 1, seq[t - 1] + 1];
        }
        else if (kind === 'mulAdd') {
            var k = rnd(1, 3);
            var v = rnd(1, 2);
            for (var i = 0; i <= n; i++) {
                seq.push(v);
                v = i % 2 ? v + k : v * 2;
            }
            rule = 'A turno: ×2 e poi +' + k + '.';
            near = [seq[n - 1] + k, seq[n - 1] * 2 + k, seq[n] + 1];
        }
        var answer;
        if (hide < 0) {
            answer = seq[n];
            seq = seq.slice(0, n);
        }
        else
            answer = seq[hide];
        var shown = seq.map(function (v, i) { return i === hide ? '<b class="seqHole">?</b>' : String(v); }).join(' · ') + (hide < 0 ? ' · <b class="seqHole">?</b>' : '');
        return q(1, l, { prompt: hide < 0 ? 'Qual è il numero che viene dopo?' : 'Quale numero manca?', visual: '<div class="bigVisual seqVisual">' + shown + '</div>',
            options: numOpts(answer, nc(l), near.filter(function (x) { return x !== answer; })), answer: String(answer), hint: rule }, { terms: 3 + l, rank: [l], kind: kind, hiddenInternal: hide >= 0 ? 1 : 0, choices: nc(l) });
    }
    /* ========== 7. Chi è l'intruso? ========== */
    var T7 = [[4, 1, 1], [5, 1, 1], [6, 2, 2], [6, 2, 1], [7, 2, 1], [8, 3, 2], [8, 3, 1], [9, 3, 1], [10, 3, 1], [10, 4, 1], [11, 4, 1], [12, 4, 1], [13, 4, 1], [14, 4, 1], [15, 4, 1]];
    var FEAT = ['colore', 'forma', 'direzione', 'grandezza'];
    NS.LEVEL_INFO[7] = T7.map(function (_a) {
        var _b = __read(_a, 3), n = _b[0], f = _b[1], d = _b[2];
        return n + ' figure · ' + f + ' ' + (f > 1 ? 'caratteristiche' : 'caratteristica') + ' · ' + (d === 1 && f > 1 ? 'cambia UN solo dettaglio' : 'differenza evidente');
    });
    function g7(l) {
        var _a = __read(T7[l - 1], 3), n = _a[0], f = _a[1], d = _a[2], base = randT();
        var odd;
        if (d === 1)
            odd = nearT(base, f, l >= 13 ? rnd(2, 3) : undefined);
        else {
            odd = randT();
            while (key(odd, f) === key(base, f) || (f > 1 && odd.slice(0, f).filter(function (v, i) { return v === base[i]; }).length > f - d))
                odd = randT();
        }
        var idx = rnd(0, n - 1), list = [];
        for (var i = 0; i < n; i++)
            list.push(tok(i === idx ? odd : base, f));
        var others = sh(Array.from({ length: n }, function (_, i) { return i; }).filter(function (i) { return i !== idx; }));
        // a livelli alti i distrattori sono le posizioni vicine all'intruso
        var nearPos = l >= 8 ? others.sort(function (x, y) { return Math.abs(x - idx) - Math.abs(y - idx); }) : others;
        var opts = sh([idx].concat(nearPos.slice(0, nc(l) - 1)));
        return q(7, l, { prompt: 'Quale figura è diversa dalle altre?', sub: d === 1 && f > 1 ? 'Cambia un solo dettaglio: ' + FEAT.slice(0, f).join(', ') + '.' : '', visual: tiles(list, true),
            options: opts.map(function (v) { return ({ label: 'Posizione ' + (v + 1), value: String(v) }); }), answer: String(idx), answerLabel: 'Posizione ' + (idx + 1), hint: 'Controlla una caratteristica alla volta: ' + FEAT.slice(0, f).join(', ') + '.' }, { visibleItems: n, featureCount: f, rank: [f, 4 - d, n], choices: nc(l) });
    }
    /* ========== 33. Coppie Gemelle ========== */
    var T33 = [[4, 1, 0], [5, 1, 0], [5, 2, 0], [6, 2, .3], [7, 2, .5], [7, 3, .3], [8, 3, .5], [9, 3, .6], [10, 3, .7], [10, 4, .6], [11, 4, .7], [12, 4, .8], [13, 4, .85], [14, 4, .9], [15, 4, .95]];
    NS.LEVEL_INFO[33] = T33.map(function (_a) {
        var _b = __read(_a, 3), n = _b[0], f = _b[1], s = _b[2];
        return n + ' figure · ' + f + ' ' + (f > 1 ? 'caratteristiche' : 'caratteristica') + (s ? ' · ' + Math.round(s * 100) + '% quasi uguali' : '');
    });
    function g33(l) {
        var _a = __read(T33[l - 1], 3), n = _a[0], f = _a[1], share = _a[2], twin = randT(), seen = {}, others = [];
        seen[key(twin, f)] = 1;
        var guard = 0;
        while (others.length < n - 2 && guard++ < 4000) {
            var t = Math.random() < share ? nearT(twin, f) : randT(), k = key(t, f);
            if (seen[k])
                continue;
            seen[k] = 1;
            others.push(t);
        }
        var list = sh(others);
        var i = rnd(0, list.length);
        list.splice(i, 0, twin);
        var j = rnd(0, list.length);
        while (j === i)
            j = rnd(0, list.length);
        list.splice(j, 0, twin);
        var pos = [];
        list.forEach(function (t, k) { if (t === twin)
            pos.push(k + 1); });
        var answer = pos.join('-'), pool = [];
        for (var a = 1; a <= n; a++)
            for (var b = a + 1; b <= n; b++)
                if (a + '-' + b !== answer)
                    pool.push(a + '-' + b);
        var tricky = pool.filter(function (p) { var s = p.split('-').map(Number); return s.indexOf(pos[0]) >= 0 || s.indexOf(pos[1]) >= 0; });
        var opts = sh([answer].concat(sh(l >= 6 ? tricky : pool).concat(sh(pool)).filter(function (v, k, a) { return a.indexOf(v) === k; }).slice(0, nc(l) - 1)));
        return q(33, l, { prompt: 'Dove sono le due figure identiche?', sub: share ? 'Molte figure si somigliano: controlla tutti i dettagli.' : '', visual: tiles(list.map(function (t) { return tok(t, f); }), true),
            options: opts.map(function (v) { return ({ label: 'Pezzi ' + v.replace('-', ' e '), value: v }); }), answer: answer, answerLabel: 'Pezzi ' + pos[0] + ' e ' + pos[1], hint: 'Prendi una figura e cercane una identica, dettaglio per dettaglio.' }, { items: n, features: f, rank: [f, Math.round(share * 100), n], options: opts.length });
    }
    /* ========== 8. Sequenze di Figure (cicli indipendenti per colore, forma, direzione) ========== */
    // c/s = schema del ciclo (indici), d = passo di rotazione della freccia (0 = nessuna), miss = 0/1/2 caselle nascoste
    var T8 = [
        { c: [0, 1], len: 5, miss: 0 }, { c: [0, 1, 2], len: 6, miss: 0 }, { c: [0, 1, 2], len: 7, miss: 1 },
        { c: [0, 1], s: [0, 1], len: 7, miss: 0 }, { c: [0, 1], s: [0, 1, 2], len: 8, miss: 0 }, { c: [0, 1, 2], s: [0, 1], len: 8, miss: 1 },
        { c: [0, 1, 2], s: [0, 1, 2, 3], len: 9, miss: 1 }, { c: [0, 0, 1], s: [0, 1, 2], len: 10, miss: 1 },
        { c: [0, 1], s: [0, 1, 2], d: 1, len: 9, miss: 0 }, { c: [0, 1, 2], s: [0, 1], d: 1, len: 10, miss: 1 }, { c: [0, 1, 2, 3], s: [0, 1, 2], d: 1, len: 11, miss: 1 },
        { c: [0, 1, 1], s: [0, 1, 2, 3], d: 1, len: 12, miss: 1 }, { c: [0, 1, 2], s: [0, 1, 2, 3], d: 2, len: 11, miss: 2 }, { c: [0, 1, 2, 3], s: [0, 1, 2], d: 2, len: 12, miss: 2 },
        { c: [0, 0, 1, 2], s: [0, 1, 1], d: 1, len: 13, miss: 2 }
    ];
    NS.LEVEL_INFO[8] = T8.map(function (t) { var f = t.d ? 3 : t.s ? 2 : 1; return t.len + ' figure · ' + (f === 1 ? 'colori' : f === 2 ? 'colore e forma con cicli diversi' : 'colore, forma e freccia che ruota') + (t.miss ? ' · ' + (t.miss === 2 ? 'due caselle coperte' : 'pezzo mancante in mezzo') : ''); });
    function g8(l) {
        var t = T8[l - 1], f = t.d ? 3 : t.s ? 2 : 1, cols = sh([0, 1, 2, 3, 4, 5]), shps = sh([0, 1, 2, 3, 4, 5]), d0 = rnd(0, 3);
        var at = function (i) { return [cols[t.c[i % t.c.length]], t.s ? shps[t.s[i % t.s.length]] : 0, t.d ? (d0 + i * t.d) % 4 : 0, 0]; };
        var total = t.miss ? t.len : t.len + 1, seq = Array.from({ length: total }, function (_, i) { return at(i); });
        var ask = t.miss ? rnd(Math.max(2, t.c.length), t.len - 2) : t.len, blank = -1;
        if (t.miss === 2) {
            blank = ask + (rnd(0, 1) ? 1 : -1);
            if (blank >= t.len)
                blank = ask - 1;
        }
        var answerT = seq[ask], answer = key(answerT, 4);
        var shown = seq.slice(0, t.len).map(function (x, i) { return i === ask ? '<b class="seqHole">?</b>' : i === blank ? '<span class="tkBlank"></span>' : tok(x, f); });
        if (!t.miss)
            shown.push('<b class="seqHole">?</b>');
        // distrattori: stessa figura con UNA caratteristica sbagliata (presi dal ciclo stesso)
        var pool = [], seen = {};
        seen[answer] = 1;
        var addP = function (x) { var k = key(x, 4); if (!seen[k]) {
            seen[k] = 1;
            pool.push(x);
        } };
        for (var i = 0; i < total + 4; i++) {
            var x = at(i);
            if (f >= 2)
                addP([x[0], answerT[1], answerT[2], 0]);
            if (f >= 2)
                addP([answerT[0], x[1], answerT[2], 0]);
            if (f >= 3)
                addP([answerT[0], answerT[1], x[2], 0]);
            addP(x);
        }
        for (var k = 0; k < 6; k++)
            addP([k, answerT[1], answerT[2], 0]);
        var opts = sh([answerT].concat(sh(pool).slice(0, nc(l) - 1)));
        return q(8, l, { prompt: t.miss ? 'Quale figura va al posto del ?' : 'Quale figura viene dopo?', sub: f >= 2 ? 'Colore' + (f >= 3 ? ', forma e freccia' : ' e forma') + ' seguono cicli DIVERSI: seguili separatamente.' : '', visual: tiles(shown, false),
            options: opts.map(function (x) { return ({ label: '<span class="optTok">' + tok(x, f) + '</span>', value: key(x, 4) }); }), answer: answer, answerLabel: tok(answerT, f), hint: f === 1 ? 'Trova il gruppo di colori che si ripete.' : 'Guarda prima solo i colori, poi solo le forme' + (f >= 3 ? ', poi come gira la freccia.' : '.') }, { presentedItems: 3 + l, features: f, rank: [f, t.miss, t.len], tiles: t.len });
    }
    /* ========== 14. Memoria Visiva ========== */
    var T14 = [[3, 4000, 1], [4, 3800, 1], [5, 3600, 1], [5, 3200, 2], [6, 3200, 2], [6, 2800, 3], [7, 2800, 3], [8, 2600, 3], [8, 2300, 4], [9, 2300, 4], [10, 2200, 4], [10, 1900, 4], [11, 1900, 4], [12, 1800, 4], [12, 1500, 4]];
    var OBJ = ['🍎', '🐶', '🚗', '🦋', '⭐', '⚽', '🍓', '🐠', '🌙', '🌸', '🐱', '🚀', '🍦', '🎈', '🧸', '🍀', '☀️', '📘', '🍋', '🎲', '🐸', '🍩', '🎸', '🦊'];
    NS.LEVEL_INFO[14] = T14.map(function (_a) {
        var _b = __read(_a, 3), n = _b[0], ms = _b[1], t = _b[2];
        return n + ' oggetti · ' + (ms / 1000).toFixed(1) + ' s per guardarli · ' + ['', 'domanda: posizione', '+ “quale NON c’era?”', '+ “quale era in mezzo?”', '+ “quale è venuto prima?”'][t];
    });
    function g14(l) {
        var _a = __read(T14[l - 1], 3), n = _a[0], ms = _a[1], types = _a[2], imgs = sh(OBJ).slice(0, n), type = rnd(1, types);
        var ask, answer, opts;
        if (type === 1) {
            var p = rnd(0, n - 1);
            answer = imgs[p];
            ask = 'Quale oggetto era nella casella ' + (p + 1) + '?';
            opts = [answer].concat(sh(imgs.filter(function (x) { return x !== answer; })).slice(0, nc(l) - 2)).concat(sh(OBJ.filter(function (x) { return imgs.indexOf(x) < 0; })).slice(0, 1));
        }
        else if (type === 2) {
            answer = pick(OBJ.filter(function (x) { return imgs.indexOf(x) < 0; }));
            ask = 'Quale oggetto NON c’era?';
            opts = [answer].concat(sh(imgs).slice(0, nc(l) - 1));
        }
        else if (type === 3) {
            var p_1 = rnd(1, n - 2);
            answer = imgs[p_1];
            ask = 'Quale oggetto era tra ' + imgs[p_1 - 1] + ' e ' + imgs[p_1 + 1] + '?';
            opts = [answer].concat(sh(imgs.filter(function (x) { return x !== answer && x !== imgs[p_1 - 1] && x !== imgs[p_1 + 1]; })).slice(0, nc(l) - 1));
        }
        else {
            var cand = sh(imgs).slice(0, Math.min(nc(l), n));
            answer = cand.reduce(function (a, b) { return imgs.indexOf(a) < imgs.indexOf(b) ? a : b; });
            ask = 'Quale di questi era PRIMA (nella casella col numero più piccolo)?';
            opts = cand;
        }
        opts = sh(opts.filter(function (v, i, a) { return a.indexOf(v) === i; }));
        var id = 'm92_' + Math.random().toString(36).slice(2);
        return q(14, l, { prompt: 'Memorizza gli oggetti!', sub: 'Hai ' + (ms / 1000).toFixed(1) + ' secondi.',
            visual: '<div class="memoryBoard grid" id="' + id + '">' + imgs.map(function (o, i) { return '<span><small>' + (i + 1) + '</small>' + o + '</span>'; }).join('') + '</div><div class="memoryTimer"><i style="-webkit-animation-duration:' + ms + 'ms;animation-duration:' + ms + 'ms"></i></div>',
            options: opts.map(function (v) { return ({ label: '<span class="optEmoji">' + v + '</span>', value: v }); }), answer: answer, answerLabel: answer, hint: 'Prova a dire i nomi degli oggetti in ordine mentre li guardi.',
            afterRender: function () {
                var el = document.getElementById(id), opt = document.querySelector('.options');
                if (!el)
                    return;
                if (opt) {
                    opt.style.visibility = 'hidden';
                    opt.style.pointerEvents = 'none';
                }
                setTimeout(function () {
                    if (!document.getElementById(id))
                        return;
                    var sp = el.querySelectorAll('span');
                    for (var s = 0; s < sp.length; s++) {
                        sp[s].className = 'hidden';
                        sp[s].innerHTML = '<small>' + (s + 1) + '</small>❓';
                    }
                    var t = el.nextSibling;
                    if (t && t.style)
                        t.style.visibility = 'hidden';
                    var h = document.querySelector('.question h3');
                    if (h)
                        h.textContent = ask;
                    if (opt) {
                        opt.style.visibility = 'visible';
                        opt.style.pointerEvents = 'auto';
                    }
                }, ms);
            } }, { memoryItems: n, exposureMs: ms, questionTypes: types, qType: type, rank: [types, n, 5000 - ms] });
    }
    /* ========== 31. Conta e Scegli (v9.3): 15 tipi di domanda, 7 temi, oggetti quasi uguali, riquadri, conta a memoria ========== */
    // Emoji solo fino a Unicode 8 (Android 6). t = da contare, s = quasi uguale (trappola), o = altri oggetti del tema.
    var TH31 = [
        { t: '🐟', s: '🐠', o: ['🐙', '🦀', '🐢', '🐬', '🐳'] }, { t: '🍎', s: '🍏', o: ['🍐', '🍊', '🍋', '🍓', '🍇'] },
        { t: '🚗', s: '🚙', o: ['🚌', '🚲', '🚜', '🚑', '🚂'] }, { t: '⭐', s: '🌟', o: ['🌙', '☀️', '☁️', '⚡', '❄️'] },
        { t: '⚽', s: '🏐', o: ['🏀', '🎾', '⚾', '🏈', '🎱'] }, { t: '🐶', s: '🐺', o: ['🐱', '🐭', '🐰', '🐻', '🐸'] },
        { t: '🌷', s: '🌹', o: ['🌻', '🌼', '🍀', '🌵', '🍄'] }
    ];
    // [tipo, bersagli min, max, tipi di altri oggetti, ms per guardare (solo “a memoria”)]
    var T31 = [['count', 4, 5, 0], ['count', 5, 7, 1], ['count', 6, 9, 3], ['sum2', 3, 5, 1], ['plus', 6, 9, 2], ['diff', 5, 9, 1], ['similar', 6, 9, 2], ['ops2', 7, 10, 2],
        ['region', 6, 9, 2], ['sum2sim', 4, 7, 2], ['flash', 6, 9, 2, 3500], ['diffsim', 6, 10, 2], ['missing', 7, 11, 2], ['flashOps', 7, 10, 2, 3000], ['regionMix', 4, 7, 2]];
    var INFO31 = { count: ['Conta gli oggetti', 'Conta solo un tipo (c’è un altro oggetto)', 'Conta solo un tipo tra 4 oggetti diversi'], sum2: 'Conta DUE tipi e somma', plus: 'Conta e poi aggiungi', diff: 'Quanti in PIÙ? (confronta due gruppi)',
        similar: 'Attenzione agli oggetti quasi uguali (🐟 e 🐠)', ops2: 'Conta, aggiungi e togli', region: 'Conta solo dentro il riquadro giusto', sum2sim: 'Due tipi insieme + oggetti quasi uguali', flash: 'Guarda 3,5 secondi e conta A MEMORIA',
        diffsim: 'Quanti in più, tra oggetti quasi uguali', missing: 'Quanti MANCANO per arrivare al numero?', flashOps: 'A memoria (3 s) e poi un’operazione', regionMix: 'Due riquadri, due oggetti diversi da sommare' };
    NS.LEVEL_INFO[31] = T31.map(function (r, i) { var t = INFO31[r[0]]; return (Array.isArray(t) ? t[[0, 1, 2][i]] : t) + ' · ' + r[1] + '–' + r[2] + ' da contare'; });
    function g31(l) {
        var _a = __read(T31[l - 1], 5), kind = _a[0], lo = _a[1], hi = _a[2], nd = _a[3], flash = _a[4], th = pick(TH31), T = th.t, S = th.s, O = sh(th.o), two = O[0], n = rnd(lo, hi);
        var cells = [], put = function (e, k, b) { for (var i = 0; i < k; i++)
            cells.push({ e: e, b: b === undefined ? -1 : b }); };
        var fill = function (k, list, b) { for (var i = 0; i < k; i++)
            cells.push({ e: list[i % list.length], b: b === undefined ? -1 : b }); };
        var spec = { terms: [[T, -1, 1]], add: 0, to: null }, prompt = 'Quanti ' + T + ' ci sono?', text = '', boxes = false;
        switch (kind) {
            case 'count':
                put(T, n);
                if (nd)
                    fill(rnd(3, 2 + 2 * nd), O.slice(0, nd));
                text = nd ? 'Conta SOLO i ' + T + '.' : '';
                break;
            case 'sum2': {
                var m = rnd(lo, hi);
                put(T, n);
                put(two, m);
                fill(rnd(2, 4), [O[1]]);
                spec.terms = [[T, -1, 1], [two, -1, 1]];
                prompt = 'Quanti ' + T + ' e ' + two + ' in tutto?';
                text = 'Conta i due gruppi e sommali.';
                break;
            }
            case 'plus': {
                var a = rnd(2, 5);
                put(T, n);
                fill(rnd(3, 6), O.slice(0, nd));
                spec.add = a;
                text = 'Poi ne arrivano altri ' + a + '.';
                prompt = 'Quanti ' + T + ' alla fine?';
                break;
            }
            case 'diff': {
                var m = rnd(Math.max(1, n - 5), n - 1);
                put(T, n);
                put(two, m);
                fill(rnd(2, 3), [O[1]]);
                spec.terms = [[T, -1, 1], [two, -1, -1]];
                prompt = 'Quanti ' + T + ' in PIÙ rispetto ai ' + two + '?';
                text = 'Conta i due gruppi e fai la differenza.';
                break;
            }
            case 'similar':
                put(T, n);
                put(S, rnd(3, 6));
                fill(rnd(2, 4), O.slice(0, nd));
                text = 'Attenzione: ' + S + ' NON è ' + T + '!';
                break;
            case 'ops2': {
                var a = rnd(2, 5), b = rnd(2, Math.min(5, n));
                put(T, n);
                put(S, rnd(2, 3));
                fill(rnd(2, 4), O.slice(0, nd));
                spec.add = a - b;
                text = 'Poi ne aggiungi ' + a + ' e ne togli ' + b + '.';
                prompt = 'Quanti ' + T + ' alla fine?';
                break;
            }
            case 'region':
                boxes = true;
                put(T, n, 0);
                put(T, rnd(3, 6), 1);
                fill(rnd(2, 4), O.slice(0, nd), 0);
                fill(rnd(2, 4), O.slice(0, nd), 1);
                spec.terms = [[T, 0, 1]];
                prompt = 'Quanti ' + T + ' nel riquadro GIALLO?';
                text = 'Quelli nel riquadro blu non contano.';
                break;
            case 'sum2sim': {
                var m = rnd(lo, hi);
                put(T, n);
                put(two, m);
                put(S, rnd(3, 5));
                fill(rnd(1, 3), [O[1]]);
                spec.terms = [[T, -1, 1], [two, -1, 1]];
                prompt = 'Quanti ' + T + ' e ' + two + ' in tutto?';
                text = 'Non contare ' + S + '.';
                break;
            }
            case 'flash':
                put(T, n);
                put(S, rnd(2, 3));
                fill(rnd(3, 5), O.slice(0, nd));
                prompt = 'Quanti ' + T + ' c’erano?';
                text = 'Hai ' + (flash / 1000).toFixed(1).replace('.', ',') + ' secondi per guardare, poi si coprono!';
                break;
            case 'diffsim': {
                var m = rnd(Math.max(2, n - 5), n - 1);
                put(T, n);
                put(S, m);
                fill(rnd(2, 4), O.slice(0, nd));
                spec.terms = [[T, -1, 1], [S, -1, -1]];
                prompt = 'Quanti ' + T + ' in PIÙ rispetto ai ' + S + '?';
                text = 'Sono quasi uguali: guarda bene!';
                break;
            }
            case 'missing': {
                var goal = pick([10, 12, 15, 20].filter(function (g) { return g > n + 1; }));
                put(T, n);
                put(S, rnd(2, 4));
                fill(rnd(2, 4), O.slice(0, nd));
                spec.to = goal;
                prompt = 'Quanti ' + T + ' MANCANO per arrivare a ' + goal + '?';
                text = 'Conta i ' + T + ', poi pensa: quanto manca a ' + goal + '?';
                break;
            }
            case 'flashOps': {
                var a = rnd(2, 6), b = rnd(1, 4);
                put(T, n);
                put(S, rnd(2, 3));
                fill(rnd(3, 5), O.slice(0, nd));
                spec.add = a - b;
                prompt = 'Quanti ' + T + ' alla fine?';
                text = 'Guarda ' + (flash / 1000).toFixed(1).replace('.', ',') + ' s. Poi: ne arrivano ' + a + ' e ne vanno via ' + b + '.';
                break;
            }
            default: {
                boxes = true;
                var m = rnd(lo, hi);
                put(T, n, 0);
                put(two, rnd(2, 5), 0);
                put(S, rnd(1, 3), 0);
                put(two, m, 1);
                put(T, rnd(2, 5), 1);
                put(S, rnd(1, 2), 1);
                spec.terms = [[T, 0, 1], [two, 1, 1]];
                prompt = 'Quanti ' + T + ' nel GIALLO + quanti ' + two + ' nel BLU?';
                text = 'Conta in ogni riquadro solo l’oggetto indicato.';
            }
        }
        var cnt = function (e, b) { return cells.filter(function (c) { return c.e === e && (b < 0 || c.b === b); }).length; };
        var sum = spec.terms.reduce(function (a, t) { return a + t[2] * cnt(t[0], t[1]); }, 0), ans = spec.to !== null ? spec.to - sum : sum + spec.add;
        var span = function (c) { return '<span>' + c.e + '</span>'; }, id = 'c31_' + Math.random().toString(36).slice(2);
        var visual;
        if (boxes)
            visual = '<div class="cntBoxes" id="' + id + '">' + [0, 1].map(function (b) { return '<div class="cntBox b' + b + '"><b>' + (b ? 'BLU' : 'GIALLO') + '</b><div class="countGrid">' + sh(cells.filter(function (c) { return c.b === b; })).map(span).join('') + '</div></div>'; }).join('') + '</div>';
        else {
            var cols = cells.length > 16 ? 6 : cells.length > 9 ? 5 : 4;
            visual = '<div class="countGrid" id="' + id + '" style="max-width:' + (cols * 48) + 'px">' + sh(cells).map(span).join('') + '</div>';
        }
        var near = [ans + 1, ans - 1, cells.length, sum, cnt(T, -1), cnt(T, -1) + cnt(S, -1), spec.to !== null ? sum : ans + 2];
        var o = q(31, l, { prompt: prompt, sub: text, visual: visual, options: numOpts(ans, nc(l), near.filter(function (x) { return x !== ans; })), answer: String(ans),
            hint: boxes ? 'Prima guarda solo il riquadro giusto, poi conta.' : kind.indexOf('flash') === 0 ? 'Raggruppa a 2 a 2 mentre guardi: è più veloce.' : 'Tocca con lo sguardo un oggetto alla volta e conta sottovoce.' }, { countedItems: n, kind: kind, items: cells.length, exposureMs: flash || 0, rank: [l, n] });
        o.meta.c31 = spec;
        if (flash)
            o.afterRender = function () {
                var el = document.getElementById(id), opt = document.querySelector('.options');
                if (!el)
                    return;
                if (opt) {
                    opt.style.visibility = 'hidden';
                    opt.style.pointerEvents = 'none';
                }
                setTimeout(function () { if (!document.getElementById(id))
                    return; el.className += ' covered'; var sp = el.querySelectorAll('span'); for (var i = 0; i < sp.length; i++)
                    sp[i].textContent = '❓'; if (opt) {
                    opt.style.visibility = 'visible';
                    opt.style.pointerEvents = 'auto';
                } }, flash);
            };
        return o;
    }
    /* ========== 11. Blocchi Logici (blocchi di Dienes: colore, forma, grandezza; E / NON / OPPURE) ========== */
    var BC = [['rosso', '#ff3b4f'], ['blu', '#2f80ff'], ['giallo', '#ffc21a'], ['verde', '#1fb26b']];
    var BS = ['cerchio', 'quadrato', 'triangolo', 'rettangolo'], BZ = ['piccolo', 'grande'];
    // form: f=trova l'unico, c=conta. conds: lista di [attributo, negato] ; or: prime due condizioni in OPPURE
    var T11 = [
        { n: 3, f: 'f', c: [['c', 0]] }, { n: 4, f: 'f', c: [['s', 0]] }, { n: 4, f: 'f', c: [['c', 0], ['s', 0]] }, { n: 5, f: 'f', c: [['c', 0], ['z', 0]] },
        { n: 6, f: 'f', c: [['c', 1], ['z', 0]] }, { n: 7, f: 'f', c: [['c', 0], ['s', 0], ['z', 0]] }, { n: 7, f: 'f', c: [['s', 0], ['c', 1], ['z', 0]] },
        { n: 8, f: 'c', c: [['c', 0]] }, { n: 8, f: 'c', c: [['c', 0], ['s', 0]] }, { n: 9, f: 'c', c: [['s', 0], ['z', 1]] },
        { n: 9, f: 'c', c: [['c', 0], ['z', 0], ['s', 1]] }, { n: 10, f: 'c', c: [['c', 1], ['s', 1]] }, { n: 11, f: 'c', c: [['c', 0], ['s', 0]], or: 1 },
        { n: 11, f: 'c', c: [['c', 0], ['s', 0], ['z', 0]], or: 1 }, { n: 12, f: 'c', c: [['c', 1], ['s', 1], ['z', 0]] }
    ];
    NS.LEVEL_INFO[11] = T11.map(function (t) { return t.n + ' blocchi · ' + (t.f === 'f' ? 'trova quello giusto' : 'contali') + ' · ' + t.c.length + ' ' + (t.c.length > 1 ? 'condizioni' : 'condizione') + (t.c.some(function (c) { return c[1]; }) ? ' con NON' : '') + (t.or ? ' con OPPURE' : ''); });
    function blockHtml(b, num) {
        var col = BC[b.c][1], sz = b.z ? 46 : 28, shape = BS[b.s];
        var st;
        if (shape === 'triangolo')
            st = 'width:0;height:0;border-left:' + (sz / 2 + 2) + 'px solid transparent;border-right:' + (sz / 2 + 2) + 'px solid transparent;border-bottom:' + sz + 'px solid ' + col;
        else
            st = 'background:' + col + ';width:' + (shape === 'rettangolo' ? Math.round(sz * 1.6) : sz) + 'px;height:' + (shape === 'rettangolo' ? Math.round(sz * 0.75) : sz) + 'px' + (shape === 'cerchio' ? ';border-radius:50%' : ';border-radius:4px');
        return '<span class="dCell">' + (num ? '<small>' + num + '</small>' : '') + '<i class="dBlock" style="' + st + '"></i></span>';
    }
    function chip(attr, b, neg) {
        var label = attr === 'c' ? '<i class="sw" style="background:' + BC[b.c][1] + '"></i>' + BC[b.c][0] : attr === 's' ? blockHtml({ c: 3, s: b.s, z: 0 }).replace('dCell', 'dMini') + BS[b.s] : (b.z ? '⬛ ' : '▪️ ') + BZ[b.z];
        return '<span class="dChip' + (neg ? ' neg' : '') + '">' + (neg ? '<b>NON</b> ' : '') + label + '</span>';
    }
    function g11(l) {
        var t = T11[l - 1], ref = { c: rnd(0, l >= 7 ? 3 : 2), s: rnd(0, 3), z: rnd(0, 1) };
        var test = function (b) { var r = t.c.map(function (_a) {
            var _b = __read(_a, 2), a = _b[0], neg = _b[1];
            return (b[a] === ref[a]) !== !!neg;
        }); return t.or ? ((r[0] || r[1]) && r.slice(2).every(Boolean)) : r.every(Boolean); };
        var blocks, count, guard = 0;
        do {
            blocks = Array.from({ length: t.n }, function () { return ({ c: rnd(0, l >= 7 ? 3 : 2), s: rnd(0, 3), z: rnd(0, 1) }); });
            count = blocks.filter(test).length;
            guard++;
        } while (guard < 3000 && (t.f === 'f' ? count !== 1 : (count < 1 || count > t.n - 2)));
        var conds = t.c.map(function (_a, i) {
            var _b = __read(_a, 2), a = _b[0], neg = _b[1];
            return chip(a, ref, neg) + (i < t.c.length - 1 ? (t.or && i === 0 ? '<b class="dJoin or">OPPURE</b>' : '<b class="dJoin">E</b>') : '');
        });
        var condHtml = '<div class="dConds">' + (t.or && t.c.length > 2 ? '<span class="dGroup">' + conds[0] + conds[1] + '</span>' + conds.slice(2).join('') : conds.join('')) + '</div>';
        var board = '<div class="dBoard">' + blocks.map(function (b, i) { return blockHtml(b, i + 1); }).join('') + '</div>';
        var options, answer, answerLabel;
        if (t.f === 'f') {
            var idx_1 = blocks.findIndex(test);
            answer = String(idx_1 + 1);
            answerLabel = 'Blocco ' + answer;
            var near = blocks.map(function (b, i) { return [i, t.c.filter(function (_a) {
                    var _b = __read(_a, 2), a = _b[0], neg = _b[1];
                    return (b[a] === ref[a]) !== !!neg;
                }).length]; }).filter(function (x) { return x[0] !== idx_1; }).sort(function (x, y) { return y[1] - x[1]; }).map(function (x) { return String(x[0] + 1); });
            options = sh([answer].concat(near.slice(0, nc(l) - 1))).map(function (v) { return ({ label: 'Blocco ' + v, value: v }); });
        }
        else {
            answer = String(count);
            answerLabel = answer;
            var loose = blocks.filter(function (b) { return t.c.slice(0, 1).every(function (_a) {
                var _b = __read(_a, 2), a = _b[0], neg = _b[1];
                return (b[a] === ref[a]) !== !!neg;
            }); }).length;
            options = numOpts(count, nc(l), [loose, count + 1, count - 1]);
        }
        return q(11, l, { prompt: t.f === 'f' ? 'Trova il blocco con queste caratteristiche:' : 'Quanti blocchi hanno queste caratteristiche?', sub: t.or ? 'OPPURE = basta una delle due. E = servono entrambe.' : '', visual: condHtml + board, options: options, answer: answer, answerLabel: answerLabel,
            hint: t.c.some(function (c) { return c[1]; }) ? 'NON significa: tutti tranne quello. Controlla una condizione alla volta.' : 'Controlla ogni blocco: colore, poi forma, poi grandezza.' }, { blocks: t.n, conditions: t.c.length, rank: [t.n, t.c.length + t.c.filter(function (c) { return c[1]; }).length + (t.or ? 2 : 0) + (t.f === 'c' ? 2 : 0)] });
    }
    /* ========== 32. Ombra Giusta ========== */
    var OUT = { '●': '○', '▲': '△', '■': '□', '◆': '◇', '★': '☆', '⬟': '⬡' }, SH6 = Object.keys(OUT);
    NS.LEVEL_INFO[32] = Array.from({ length: 15 }, function (_, i) { return (i + 2) + ' pezzi in fila · ' + (i >= 9 ? 'ombra al CONTRARIO (specchio)' : 'ombra nello stesso ordine') + ' · ' + CH[i] + ' risposte quasi uguali'; });
    function shadowLabel(v) { var ch = Array.from(v), parts = []; for (var i = 0; i < ch.length; i += 4)
        parts.push('<i>' + ch.slice(i, i + 4).join('') + '</i>'); return '<span class="optShadow sl' + (ch.length <= 5 ? 1 : ch.length <= 8 ? 2 : 3) + '">' + parts.join('') + '</span>'; }
    function g32(l) {
        var len = l + 1, mirror = l >= 10, items = Array.from({ length: len }, function () { return pick(SH6); }), target = (mirror ? items.slice().reverse() : items).map(function (s) { return OUT[s]; });
        var answer = target.join('');
        var pool = [];
        if (mirror)
            pool.push(items.map(function (s) { return OUT[s]; }).join(''));
        var _loop_1 = function (k) {
            var alt = target.slice(), at = rnd(0, len - 1);
            alt[at] = OUT[pick(SH6.filter(function (s) { return OUT[s] !== target[at]; }))];
            pool.push(alt.join(''));
            if (len > 2 && k % 3 === 0) {
                var sw = target.slice(), x = rnd(0, len - 2);
                var tmp = sw[x];
                sw[x] = sw[x + 1];
                sw[x + 1] = tmp;
                pool.push(sw.join(''));
            }
        };
        for (var k = 0; k < 30; k++) {
            _loop_1(k);
        }
        var opts = [answer];
        pool.forEach(function (p) { if (opts.indexOf(p) < 0 && opts.length < nc(l))
            opts.push(p); });
        return q(32, l, { prompt: mirror ? 'Qual è l’ombra allo SPECCHIO?' : 'Qual è l’ombra corretta?', sub: mirror ? 'Allo specchio l’ordine si inverte: l’ultimo pezzo diventa il primo.' : 'Stessi pezzi, stesso ordine.', visual: '<div class="bigVisual shadowRow">' + items.join(' ') + '</div>',
            // v9.3: file lunghe divise in gruppi da 4 e caratteri più piccoli, così restano dentro lo schermo
            options: sh(opts).map(function (v) { return ({ label: shadowLabel(v), value: v }); }), answer: answer, answerLabel: shadowLabel(answer), hint: 'Confronta un pezzo alla volta, da sinistra a destra.',
            afterRender: len >= 7 ? function () { var o = document.querySelector('.options'); if (o)
                o.className += ' oneCol'; } : null }, { pieces: len, mirror: mirror ? 1 : 0, rank: [len] });
    }
    /* ========== 40. Somme di Oggetti ========== */
    var TH = ['🍪', '🧁', '⚽', '🎈', '🌟', '🍬', '🐟', '🧸', '🍓', '🌼'];
    var T40 = ['Due gruppi (fino a 8)', 'Due gruppi più grandi (da 9 a 12)', 'Tre gruppi da sommare', 'Togliere: quanti restano?', 'Aggiungi e togli',
        'Cestini uguali (2 × …)', 'Tre cestini uguali', 'Cestini uguali + extra', 'Cestini, extra e togli', 'Zampe di un animale',
        'Zampe di due animali diversi', 'Zampe e ruote di tre gruppi', 'Regali e caramelle in tre passaggi', 'Dividi in parti uguali', 'Problema in tre passaggi con × e −'];
    NS.LEVEL_INFO[40] = T40;
    var grp = function (ic, n) { return '<span class="objGroup">' + new Array(n + 1).join(ic) + '</span>'; }, op = function (s) { return '<b class="objOp">' + s + '</b>'; };
    var basket = function (ic, n, b) { return '<span class="objBasket">' + (b || '🧺') + grp(ic, n).replace('objGroup', 'objGroup in') + '</span>'; };
    function g40(l) {
        var ic = pick(TH);
        var html = '', ans, text, near = [];
        var LEGS = [['🐞', 6, 'zampe'], ['🐕', 4, 'zampe'], ['🐔', 2, 'zampe'], ['🕷️', 8, 'zampe'], ['🐙', 8, 'braccia']];
        switch (l) {
            case 1: {
                var a = rnd(1, 4), b = rnd(1, 4);
                ans = a + b;
                html = grp(ic, a) + op('+') + grp(ic, b);
                text = 'Quanti ' + ic + ' in tutto?';
                near = [a, b];
                break;
            }
            case 2: {
                var a = rnd(5, 7), b = rnd(4, 5);
                ans = a + b;
                html = grp(ic, a) + op('+') + grp(ic, b);
                text = 'Quanti ' + ic + ' in tutto?';
                near = [ans - 1, ans + 1];
                break;
            }
            case 3: {
                var a = rnd(2, 5), b = rnd(2, 5), c = rnd(2, 5);
                ans = a + b + c;
                html = grp(ic, a) + op('+') + grp(ic, b) + op('+') + grp(ic, c);
                text = 'Somma i tre gruppi.';
                near = [a + b, b + c];
                break;
            }
            case 4: {
                var a = rnd(7, 11), b = rnd(2, 5);
                ans = a - b;
                html = grp(ic, a) + op('−') + grp(ic, b);
                text = 'Ne togli ' + b + '. Quanti restano?';
                near = [a + b, a];
                break;
            }
            case 5: {
                var a = rnd(6, 10), b = rnd(3, 6), c = rnd(2, 5);
                ans = a + b - c;
                html = grp(ic, a) + op('+') + grp(ic, b) + op('−') + grp(ic, c);
                text = 'Aggiungi, poi togli.';
                near = [a + b + c, a + b, a - b + c];
                break;
            }
            case 6: {
                var e = rnd(3, 5);
                ans = 2 * e;
                html = basket(ic, e) + op('+') + basket(ic, e);
                text = '2 cestini con ' + e + ' ' + ic + ' ciascuno.';
                near = [e + 2, ans + e];
                break;
            }
            case 7: {
                var e = rnd(3, 5);
                ans = 3 * e;
                html = basket(ic, e) + op('+') + basket(ic, e) + op('+') + basket(ic, e);
                text = '3 cestini uguali.';
                near = [2 * e, 4 * e, e + 3];
                break;
            }
            case 8: {
                var k = rnd(3, 4), e = rnd(3, 5), x = rnd(2, 5);
                ans = k * e + x;
                for (var i = 0; i < k; i++)
                    html += (i ? op('+') : '') + basket(ic, e);
                html += op('+') + grp(ic, x);
                text = k + ' cestini da ' + e + ' e altri ' + x + '.';
                near = [k * e, k + e + x, (k + 1) * e];
                break;
            }
            case 9: {
                var k = rnd(3, 4), e = rnd(4, 6), x = rnd(2, 5), y = rnd(3, 6);
                ans = k * e + x - y;
                for (var i = 0; i < k; i++)
                    html += (i ? op('+') : '') + basket(ic, e);
                html += op('+') + grp(ic, x) + op('−') + grp(ic, y);
                text = k + ' cestini da ' + e + ', più ' + x + ', meno ' + y + '.';
                near = [k * e + x, k * e - y, ans + 2 * y];
                break;
            }
            case 10: {
                var A = pick(LEGS), n = rnd(3, 5);
                ans = n * A[1];
                html = grp(A[0], n);
                text = 'Ogni ' + A[0] + ' ha ' + A[1] + ' ' + A[2] + '. Quante ' + A[2] + ' in tutto?';
                near = [n + A[1], ans - A[1]];
                break;
            }
            case 11: {
                var _a = __read(sh(LEGS.slice(0, 4)).slice(0, 2), 2), A = _a[0], B = _a[1], na = rnd(2, 4), nb = rnd(2, 3);
                ans = na * A[1] + nb * B[1];
                html = grp(A[0], na) + op('+') + grp(B[0], nb);
                text = 'Ogni ' + A[0] + ' ha ' + A[1] + ' zampe, ogni ' + B[0] + ' ne ha ' + B[1] + '. Quante zampe in tutto?';
                near = [(na + nb) * A[1], (na + nb) * B[1], na * B[1] + nb * A[1]];
                break;
            }
            case 12: {
                var P = [['🐕', 4], ['🐔', 2], ['🚲', 2], ['🚗', 4], ['🛺', 3]], _b = __read(sh(P).slice(0, 3), 3), A = _b[0], B = _b[1], C = _b[2], na = rnd(2, 3), nb = rnd(2, 3), nc2 = rnd(1, 3);
                ans = na * A[1] + nb * B[1] + nc2 * C[1];
                html = grp(A[0], na) + op('+') + grp(B[0], nb) + op('+') + grp(C[0], nc2);
                text = 'Conta zampe e ruote: ' + A[0] + '=' + A[1] + ', ' + B[0] + '=' + B[1] + ', ' + C[0] + '=' + C[1] + '.';
                near = [na * A[1] + nb * B[1], ans + C[1], ans - B[1]];
                break;
            }
            case 13: {
                var bags = rnd(3, 4), per = rnd(4, 6), g = rnd(2, 5), e = rnd(2, 4);
                ans = bags * per - g - e;
                for (var i = 0; i < bags; i++)
                    html += (i ? op('+') : '') + basket(ic, per, '🎁');
                text = bags + ' pacchi con ' + per + ' ' + ic + '. Ne regali ' + g + ' e ne mangi ' + e + '. Quanti restano?';
                near = [bags * per - g, bags * per - e, bags * per];
                break;
            }
            case 14: {
                var kids = rnd(2, 4), each = rnd(3, 5);
                ans = each;
                html = grp(ic, kids * each) + op('÷') + grp('🧒', kids);
                text = (kids * each) + ' ' + ic + ' divisi in parti uguali tra ' + kids + ' bambini. Quanti a testa?';
                near = [kids, each + 1, each - 1, kids * each - kids];
                break;
            }
            default: {
                var a = rnd(3, 4), pa = rnd(3, 5), b = rnd(2, 3), pb = rnd(2, 4), e = rnd(3, 6);
                ans = a * pa + b * pb - e;
                for (var i = 0; i < a; i++)
                    html += (i ? op('+') : '') + basket(ic, pa, '📦');
                html += op('+');
                for (var i = 0; i < b; i++)
                    html += (i ? op('+') : '') + basket(ic, pb, '🛍️');
                html += op('−') + grp(ic, e);
                text = a + ' scatole da ' + pa + ' e ' + b + ' sacchetti da ' + pb + '. Ne usi ' + e + '. Quanti restano?';
                near = [a * pa + b * pb, ans + e + 1, a * pa - e];
            }
        }
        var steps = [1, 1, 2, 1, 2, 1, 2, 3, 4, 1, 2, 3, 3, 1, 4][l - 1], concept = [1, 1, 1, 2, 2, 3, 3, 3, 3, 4, 4, 4, 5, 6, 7][l - 1];
        return q(40, l, { prompt: 'Somme di oggetti', sub: text, visual: '<div class="objSum">' + html + '</div>', options: numOpts(ans, nc(l), near.filter(function (x) { return x !== ans; })), answer: String(ans),
            hint: concept <= 2 ? 'Conta ogni gruppo, scrivi i numeri e poi calcola.' : concept === 3 ? 'Gruppi uguali: conta un gruppo e ripetilo tante volte.' : concept === 4 ? 'Ogni animale porta le sue zampe: somma gruppo per gruppo.' : concept === 6 ? 'Distribuisci uno a testa finché finiscono.' : 'Fai un passaggio alla volta: prima il totale, poi togli.' }, { operations: steps, concept: concept, rank: [concept, steps, ans > 99 ? 99 : ans] });
    }
    /* ========== 41. Equazioni con Figure ========== */
    var FR = ['🍎', '🍌', '🍒', '🍇', '🍓', '🍐', '🍊', '🍋', '🥝', '🍑'];
    var T41 = [[1, 'A+A', 5], [1, 'A+A+A', 6], [2, 'A,B', 6], [2, 'A,B', 9], [3, 'catena', 6], [3, 'catena', 9], [3, 'somma', 8], [3, 'meno', 9], [3, 'meno', 12], [3, 'per', 5], [3, 'per2', 6], [3, 'coppie', 6], [3, 'coppie', 10], [4, 'quattro', 6], [4, 'quattro×', 5]];
    NS.LEVEL_INFO[41] = T41.map(function (_a) {
        var _b = __read(_a, 3), u = _b[0], k = _b[1], m = _b[2];
        return u + ' ' + (u > 1 ? 'frutti misteriosi' : 'frutto misterioso') + ' · ' + ({ 'A+A': 'una riga', 'A+A+A': 'tre uguali', 'A,B': 'due righe', 'catena': 'tre righe a catena', 'somma': 'trova la somma', 'meno': 'con la sottrazione', 'per': 'con la moltiplicazione', 'per2': 'moltiplicazione da dedurre', 'coppie': 'tre coppie intrecciate', 'quattro': 'quattro righe', 'quattro×': 'quattro righe con ×' })[k] + ' · valori fino a ' + m;
    });
    function eqRow(parts, res) { return '<div class="eqRow">' + parts.join(' ') + ' <b>=</b> <span class="eqRes">' + res + '</span></div>'; }
    function g41(l) {
        var _a = __read(T41[l - 1], 3), u = _a[0], k = _a[1], m = _a[2], F = sh(FR).slice(0, 4), _b = __read(F, 4), A = _b[0], B = _b[1], C = _b[2], D = _b[3], r = function () { return rnd(1, m); };
        var a = r(), b = r(), c = r(), d = r(), rows = [], ask, ans, near = [];
        switch (k) {
            case 'A+A':
                rows = [eqRow([A, '+', A], 2 * a)];
                ask = A;
                ans = a;
                near = [2 * a, a + 1];
                break;
            case 'A+A+A':
                rows = [eqRow([A, '+', A, '+', A], 3 * a)];
                ask = A;
                ans = a;
                near = [3 * a, a + 3];
                break;
            case 'A,B':
                rows = [eqRow([A, '+', A], 2 * a), eqRow([A, '+', B], a + b)];
                ask = B;
                ans = b;
                near = [a + b, a];
                break;
            case 'catena':
                rows = [eqRow([A, '+', A, '+', A], 3 * a), eqRow([A, '+', B], a + b), eqRow([B, '+', C], b + c)];
                ask = C;
                ans = c;
                near = [b + c, b, a];
                break;
            case 'somma':
                rows = [eqRow([A, '+', A], 2 * a), eqRow([B, '+', B, '+', A], 2 * b + a), eqRow([C, '+', B], c + b)];
                ask = A + ' + ' + B + ' + ' + C;
                ans = a + b + c;
                near = [2 * a + 2 * b + a, a + b, c + b + a + 1];
                break;
            case 'meno':
                a = rnd(1, Math.floor(m / 2));
                b = a + rnd(1, m - a);
                c = rnd(Math.ceil(b / 2), Math.ceil(b / 2) + m);
                rows = [eqRow([A, '+', A], 2 * a), eqRow([B, '−', A], b - a), eqRow([C, '+', C, '−', B], 2 * c - b)];
                ask = C + ' + ' + B;
                ans = c + b;
                near = [2 * c - b, c, b - a + c];
                break;
            case 'per':
                a = rnd(2, m);
                b = rnd(2, m);
                rows = [eqRow([A, '+', A], 2 * a), eqRow([A, '×', B], a * b)];
                ask = B + ' + ' + A;
                ans = a + b;
                near = [a * b, a + b + 1, 2 * a];
                break;
            case 'per2':
                a = rnd(2, 5);
                b = rnd(2, 5);
                c = rnd(1, m);
                rows = [eqRow([A, '+', A, '+', A], 3 * a), eqRow([A, '×', B], a * b), eqRow([B, '+', C], b + c)];
                ask = A + ' × ' + C;
                ans = a * c;
                near = [a + c, a * b, c * b];
                break;
            case 'coppie':
                rows = sh([eqRow([A, '+', B], a + b), eqRow([B, '+', C], b + c), eqRow([A, '+', C], a + c)]);
                ask = A;
                ans = a;
                near = [b, c, a + b - c, (a + b + c)];
                break;
            case 'quattro':
                rows = [eqRow([A, '+', B], a + b), eqRow([B, '+', C], b + c), eqRow([A, '+', C], a + c), eqRow([C, '+', D, '+', D], c + 2 * d)];
                ask = A + ' + ' + D;
                ans = a + d;
                near = [a + c, c + d, 2 * d + a];
                break;
            default:
                a = rnd(1, m);
                b = rnd(1, m);
                c = rnd(1, m);
                d = rnd(2, 4);
                rows = [eqRow([A, '+', B], a + b), eqRow([B, '+', C], b + c), eqRow([A, '+', C], a + c), eqRow([D, '×', D], d * d)];
                ask = A + ' × ' + D;
                ans = a * d;
                near = [a + d, a * d + d, b * d];
        }
        return q(41, l, { prompt: 'Quanto vale ' + ask + '?', sub: 'Ogni frutto vale sempre lo stesso numero.', visual: '<div class="eqBox">' + rows.join('') + '<div class="eqRow ask">' + ask + ' <b>=</b> <span class="eqRes">?</span></div></div>',
            options: numOpts(ans, nc(l), near.filter(function (x) { return x !== ans; })), answer: String(ans),
            hint: k === 'coppie' || k.indexOf('quattro') === 0 ? 'Somma le tre righe con le coppie: ottieni il DOPPIO di tutti e tre i frutti.' : k.indexOf('per') === 0 ? '× vuol dire “volte”: 3 × 4 = 4 + 4 + 4.' : 'Trova un frutto alla volta e usalo nella riga dopo.' }, { equations: rows.length, unknowns: u, rank: [u, { 'A+A': 0, 'A+A+A': 1, 'A,B': 0, 'catena': 0, 'somma': 1, 'meno': 2, 'per': 3, 'per2': 4, 'coppie': 5, 'quattro': 0, 'quattro×': 1 }[k], m] });
    }
    /* ========== 42. Piramide dei Numeri ========== */
    // [base, cosa chiedere (top/corner/center), mattoni centrali nascosti, valore massimo]
    var T42 = [[2, 'top', 0, 5], [2, 'corner', 0, 6], [3, 'top', 0, 5], [3, 'top', 2, 6], [3, 'corner', 0, 6], [3, 'corner', 2, 7], [3, 'center', 2, 7], [4, 'top', 0, 6], [4, 'top', 2, 7], [4, 'top', 5, 7], [4, 'corner', 0, 7], [4, 'corner', 3, 8], [4, 'center', 3, 8], [4, 'center', 5, 9], [4, 'center', 5, 12]];
    NS.LEVEL_INFO[42] = T42.map(function (_a) {
        var _b = __read(_a, 4), b = _b[0], a = _b[1], h = _b[2], m = _b[3];
        return 'Base di ' + b + ' · ' + (a === 'top' ? 'trova la cima' : a === 'corner' ? 'trova un numero della base (all’indietro)' : 'trova il numero CENTRALE della base') + (h ? ' · ' + h + ' mattoni nascosti' : '') + ' · numeri fino a ' + m;
    });
    function g42(l) {
        var _a = __read(T42[l - 1], 4), base = _a[0], ask = _a[1], hideN = _a[2], m = _a[3], b = Array.from({ length: base }, function () { return rnd(1, m); }), rows = [b];
        var _loop_2 = function () {
            var p = rows[rows.length - 1];
            rows.push(p.slice(0, -1).map(function (v, i) { return v + p[i + 1]; }));
        };
        while (rows[rows.length - 1].length > 1) {
            _loop_2();
        }
        var top = rows.length - 1, askCell = ask === 'top' ? [top, 0] : ask === 'corner' ? [0, rnd(0, 1) ? 0 : base - 1] : [0, rnd(1, base - 2)];
        var mids = [];
        for (var r = 1; r < top; r++)
            for (var c = 0; c < rows[r].length; c++)
                mids.push(r + ',' + c);
        var hidden = {};
        sh(mids).slice(0, hideN).forEach(function (k2) { return hidden[k2] = 1; });
        var ans = rows[askCell[0]][askCell[1]];
        var html = '<div class="pyramid">';
        for (var r = top; r >= 0; r--) {
            html += '<div class="pyrRow">';
            for (var c = 0; c < rows[r].length; c++) {
                var isA = r === askCell[0] && c === askCell[1], h = hidden[r + ',' + c];
                html += '<span class="pyrCell' + (isA ? ' ask' : h ? ' blank' : '') + '">' + (isA ? '?' : h ? '' : rows[r][c]) + '</span>';
            }
            html += '</div>';
        }
        html += '</div>';
        var near = ask === 'top' ? [rows[top - 1] ? rows[top - 1].reduce(function (x, y) { return x + y; }, 0) : ans + 1, b.reduce(function (x, y) { return x + y; }, 0)] : [ans + 1, ans * 2, rows[1] ? rows[1][Math.min(askCell[1], rows[1].length - 1)] : ans + 2];
        return q(42, l, { prompt: ask === 'top' ? 'Quale numero va in cima?' : 'Quale numero manca nella base?', sub: 'Ogni mattone è la somma dei due mattoni sotto di lui.', visual: html,
            options: numOpts(ans, nc(l), near.filter(function (x) { return x !== ans; })), answer: String(ans),
            hint: ask === 'top' ? 'Riempi una fila alla volta partendo dal basso.' : 'Lavora all’indietro: il numero che cerchi = mattone sopra − il suo vicino.' }, { baseSize: base, hiddenBlocks: hideN, rank: [base, { top: 0, corner: 1, center: 2 }[ask], hideN, m] });
    }
    /* ========== 5. Sudoku Junior: griglie diverse ogni volta + buchi crescenti ========== */
    var H5 = [3, 4, 5, 6, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];
    NS.LEVEL_INFO[5] = H5.map(function (h, i) { return 'Griglia ' + (i < 4 ? '4×4' : '6×6') + ' · ' + h + ' caselle vuote'; });
    function g5(l) {
        var n = l <= 4 ? 4 : 6, bw = n === 4 ? 2 : 3, bh = 2, target = H5[l - 1];
        var _loop_3 = function (attempt) {
            var e_1, _a;
            var perm = sh(Array.from({ length: n }, function (_, i) { return i + 1; }));
            // permuta righe dentro le fasce e colonne dentro i riquadri: griglia sempre diversa
            var rowOrder = [], colOrder = [];
            sh(Array.from({ length: n / bh }, function (_, i) { return i; })).forEach(function (band) { return sh(Array.from({ length: bh }, function (_, i) { return band * bh + i; })).forEach(function (r) { return rowOrder.push(r); }); });
            sh(Array.from({ length: n / bw }, function (_, i) { return i; })).forEach(function (st) { return sh(Array.from({ length: bw }, function (_, i) { return st * bw + i; })).forEach(function (c) { return colOrder.push(c); }); });
            var g = rowOrder.map(function (r) { return colOrder.map(function (c) { return perm[((r * bw + Math.floor(r / bh) + c) % n)]; }); });
            var mask = g.map(function (row) { return row.map(function () { return false; }); });
            var count = function () {
                var bd = g.map(function (row, r) { return row.map(function (v, c) { return mask[r][c] ? 0 : v; }); });
                var cnt = 0;
                (function rec() {
                    var e_2, _a;
                    if (cnt >= 2)
                        return;
                    var best = null, av = null;
                    for (var r = 0; r < n; r++) {
                        var _loop_4 = function (c) {
                            if (!bd[r][c]) {
                                var ps = [];
                                var _loop_5 = function (v) {
                                    if (bd[r].indexOf(v) >= 0)
                                        return "continue";
                                    if (bd.some(function (row) { return row[c] === v; }))
                                        return "continue";
                                    var box = false;
                                    for (var y = Math.floor(r / bh) * bh; y < Math.floor(r / bh) * bh + bh; y++)
                                        for (var x = Math.floor(c / bw) * bw; x < Math.floor(c / bw) * bw + bw; x++)
                                            if (bd[y][x] === v)
                                                box = true;
                                    if (!box)
                                        ps.push(v);
                                };
                                for (var v = 1; v <= n; v++) {
                                    _loop_5(v);
                                }
                                if (!ps.length)
                                    return { value: void 0 };
                                if (!best || ps.length < av.length) {
                                    best = [r, c];
                                    av = ps;
                                }
                            }
                        };
                        for (var c = 0; c < n; c++) {
                            var state_2 = _loop_4(c);
                            if (typeof state_2 === "object")
                                return state_2.value;
                        }
                    }
                    if (!best) {
                        cnt++;
                        return;
                    }
                    try {
                        for (var av_1 = __values(av), av_1_1 = av_1.next(); !av_1_1.done; av_1_1 = av_1.next()) {
                            var v = av_1_1.value;
                            bd[best[0]][best[1]] = v;
                            rec();
                            bd[best[0]][best[1]] = 0;
                            if (cnt >= 2)
                                return;
                        }
                    }
                    catch (e_2_1) { e_2 = { error: e_2_1 }; }
                    finally {
                        try {
                            if (av_1_1 && !av_1_1.done && (_a = av_1.return)) _a.call(av_1);
                        }
                        finally { if (e_2) throw e_2.error; }
                    }
                })();
                return cnt;
            };
            var hid = 0;
            try {
                for (var _b = (e_1 = void 0, __values(sh(Array.from({ length: n * n }, function (_, i) { return [Math.floor(i / n), i % n]; })))), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var _d = __read(_c.value, 2), r = _d[0], c = _d[1];
                    if (hid >= target)
                        break;
                    mask[r][c] = true;
                    if (count() === 1)
                        hid++;
                    else
                        mask[r][c] = false;
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_1) throw e_1.error; }
            }
            if (hid < target)
                return "continue";
            var empty = [];
            mask.forEach(function (row, r) { return row.forEach(function (v, c) { if (v)
                empty.push([r, c]); }); });
            var _e = __read(pick(empty), 2), tr = _e[0], tc = _e[1], ans = g[tr][tc];
            var vis = '<div class="sudokuPlay" style="grid-template-columns:repeat(' + n + ',1fr);width:100%;max-width:' + (n * 55) + 'px">';
            for (var r = 0; r < n; r++)
                for (var c = 0; c < n; c++)
                    vis += '<div class="sudokuTile ' + (r === tr && c === tc ? 'sudokuTarget' : '') + ((c + 1) % bw === 0 && c < n - 1 ? ' sdR' : '') + ((r + 1) % bh === 0 && r < n - 1 ? ' sdB' : '') + '" style="font-size:' + (n === 6 ? 19 : 26) + 'px;width:' + (100 / n) + '%;min-height:' + (n === 6 ? 42 : 52) + 'px">' + (r === tr && c === tc ? '?' : mask[r][c] ? '&nbsp;' : g[r][c]) + '</div>';
            vis += '</div>';
            return { value: q(5, l, { prompt: 'Quale numero va nella casella dorata?', sub: 'Griglia ' + n + '×' + n + ' · ' + hid + ' caselle vuote. Ogni numero una sola volta per riga, colonna e riquadro.', visual: vis,
                    options: sh(Array.from({ length: n }, function (_, i) { return String(i + 1); })), answer: String(ans), hint: 'Guarda insieme riga, colonna e riquadro della casella dorata.' }, { size: n, holes: hid, uniqueSolutions: 1, rank: [n, hid] }) };
        };
        for (var attempt = 0; attempt < 30; attempt++) {
            var state_1 = _loop_3(attempt);
            if (typeof state_1 === "object")
                return state_1.value;
        }
        throw new Error('Sudoku v9.2: generazione fallita');
    }
    /* ========== 9. Matrici: nessuna modifica alla logica v8.3 (già 15 passi), solo info livello ========== */
    NS.LEVEL_INFO[9] = Array.from({ length: 15 }, function (_, i) { var l = i + 1, n = l <= 4 ? 3 : l <= 8 ? 4 : l <= 12 ? 5 : 6; return 'Matrice ' + n + '×' + n + ' · ' + l + ' ' + (l > 1 ? 'caselle coperte' : 'casella coperta') + ' · regola ' + (l <= 4 ? 'semplice' : l <= 8 ? 'diagonale' : l <= 12 ? 'doppia' : 'intrecciata'); });
    NS.MathGames[1] = g1;
    NS.MathGames[7] = g7;
    NS.MathGames[5] = g5;
    NS.MathGames[31] = g31;
    NS.MathGames[40] = g40;
    NS.MathGames[41] = g41;
    NS.MathGames[42] = g42;
    NS.VisualGames[8] = g8;
    NS.VisualGames[11] = g11;
    NS.VisualGames[14] = g14;
    NS.VisualGames[32] = g32;
    NS.VisualGames[33] = g33;
    NS.V92 = { g1: g1, g5: g5, g7: g7, g8: g8, g11: g11, g14: g14, g31: g31, g32: g32, g33: g33, g40: g40, g41: g41, g42: g42, tok: tok, T8: T8, T7: T7 };
})(window.LogicLand);
