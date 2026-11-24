'use strict';
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
/* v9.2 — Lingue: inglese (16, 34) e spagnolo (60, 61) con la stessa scala in 15 livelli.
   Ogni livello cambia il TIPO di esercizio o toglie un aiuto (italiano, immagine, testo scritto):
   leggere → ascoltare → solo ascolto; parola → frase → significato della frase.
   Le parole di ogni livello appartengono a una fascia di vocabolario nuova (15 fasce). */
(function (NS) {
    var rnd = function (a, b) { return NS.rnd(a, b); }, pick = function (a) { return NS.pick(a); }, sh = function (a) { return NS.shuffle(a); };
    var CH = [3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 6, 6, 6, 6], nc = function (l) { return CH[l - 1]; };
    var CAT = { animals: 'animali', food: 'cibo', colors: 'colori', nature: 'natura', home: 'casa', school: 'scuola', family: 'famiglia', numbers: 'numeri', body: 'corpo', clothes: 'vestiti', actions: 'azioni', feelings: 'emozioni', places: 'luoghi', time: 'tempo', transport: 'trasporti' };
    var L = {
        en: { voice: 'en-GB', name: 'inglese', flag: '🇬🇧', w: function (x) { return x.en; }, list: function () { return NS.WORDS; }, sent: function () { return NS.SENTENCES; }, fill: function (s, w) { return s.s.replace('___', w.en); } },
        es: { voice: 'es-ES', name: 'spagnolo', flag: '🇪🇸', w: function (x) { return x.es; }, list: function () { return NS.WORDS_ES; }, sent: function () { return NS.SENTENCES_ES; }, fill: function (s, w) { return s.s.replace('___', NS.esBare(w)); } }
    };
    function tier(lang, l) {
        var C = L[lang], ranked = C.list().slice().sort(function (a, b) { return a.lvl - b.lvl || C.w(a).length - C.w(b).length || C.w(a).localeCompare(C.w(b)); });
        var lo = Math.floor((l - 1) * ranked.length / 15), hi = Math.floor(l * ranked.length / 15);
        return ranked.slice(lo, Math.max(lo + 1, hi));
    }
    function q(id, l, question, metric) {
        var o = NS.attachDifficulty(question, id, l);
        o.meta.age6 = true;
        o.meta.age6Load = NS.AGE6_DIFFICULTY[l - 1].load;
        o.meta.age6Metrics = metric;
        o.meta.v92 = true;
        return o;
    }
    function audioBtns(text, voice, hideText) {
        var t = NS.jsArg ? NS.jsArg(text) : NS.escapeHtml(text);
        return '<div class="speakRow"><button class="speak big" onclick="LogicLand.speakLine(\'' + t + '\',\'' + voice + '\')">🔊 ' + (hideText ? 'Ascolta' : 'Ascolta') + '</button><button class="speak slow" onclick="LogicLand.speakSlow()">🐢 Lento</button></div>';
    }
    // distrattori: stessa categoria a livelli alti (più difficile), parole “vicine” nel vocabolario
    // Parole senza un'immagine chiara (ieri/oggi/domani…, colori resi male dagli emoji su Android 6):
    // non vengono usate nelle modalità in cui si sceglie un'IMMAGINE.
    var NOPIC = { gold: 1, silver: 1, grey: 1, pink: 1 };
    var picOk = function (x) { return x.cat !== 'time' && !NOPIC[x.en]; };
    function others(lang, word, l, count, pic) {
        var e_1, _a;
        var C = L[lang], all = C.list().filter(function (x) { return C.w(x) !== C.w(word) && x.emoji !== word.emoji && (!pic || picOk(x)); });
        var same = sh(all.filter(function (x) { return x.cat === word.cat; })), near = sh(all.filter(function (x) { return x.cat !== word.cat && Math.abs(x.lvl - word.lvl) <= 1; })), rest = sh(all);
        var order = l >= 6 ? same.concat(near, rest) : near.concat(same, rest), out = [], seen = {};
        seen[C.w(word)] = 1;
        seen['e' + word.emoji] = 1;
        seen['i' + word.it] = 1;
        try {
            for (var order_1 = __values(order), order_1_1 = order_1.next(); !order_1_1.done; order_1_1 = order_1.next()) {
                var x = order_1_1.value;
                if (out.length >= count)
                    break;
                if (seen[C.w(x)] || seen['e' + x.emoji] || seen['i' + x.it])
                    continue;
                seen[C.w(x)] = 1;
                seen['e' + x.emoji] = 1;
                seen['i' + x.it] = 1;
                out.push(x);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (order_1_1 && !order_1_1.done && (_a = order_1.return)) _a.call(order_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return out;
    }
    function choose(lang, l, state, pic) {
        var t = tier(lang, l);
        if (pic && t.some(picOk))
            t = t.filter(picOk);
        var due = lang === 'en' ? t.filter(function (w) { var s = state && state.english && state.english.words && state.english.words[w.en]; return s && s.wrong > 0 && s.due <= Date.now(); }) : [];
        return pick(due.length && rnd(0, 2) ? due : t);
    }
    /* --- 16 / 60: Abbina parola e immagine --- */
    var MODES_A = [
        ['it2w', 'Italiano + immagine → scegli la parola'], ['it2w', 'Italiano + immagine → scegli la parola'], ['it2w', 'Italiano + immagine → scegli la parola'],
        ['img2w', 'Solo immagine → scegli la parola'], ['img2w', 'Solo immagine → scegli la parola'],
        ['w2img', 'Parola scritta + audio → scegli l’immagine'], ['w2img', 'Parola scritta + audio → scegli l’immagine'], ['w2img', 'Parola scritta + audio → scegli l’immagine'],
        ['wonly2img', 'Solo parola scritta (senza audio) → immagine'], ['wonly2img', 'Solo parola scritta (senza audio) → immagine'],
        ['ear2img', 'SOLO ASCOLTO → scegli l’immagine'], ['ear2img', 'SOLO ASCOLTO → scegli l’immagine'], ['ear2img', 'SOLO ASCOLTO → scegli l’immagine'],
        ['ear2it', 'SOLO ASCOLTO → scegli il significato in italiano'], ['ear2it', 'SOLO ASCOLTO → scegli il significato in italiano']
    ];
    function match(lang, id) {
        return function (l, state) {
            var mode = MODES_A[l - 1][0], pic = mode !== 'it2w' && mode !== 'ear2it', C = L[lang], w = choose(lang, l, state, pic), ws = [w].concat(others(lang, w, l, nc(l) - 1, pic)), txt = C.w(w);
            var prompt, sub = '', opts, custom = '', auto = null;
            if (mode === 'it2w') {
                prompt = 'Come si dice in ' + C.name + '?';
                sub = '<span class="bigEmoji">' + w.emoji + '</span> ' + w.it;
                opts = ws.map(function (x) { return ({ label: C.w(x).toUpperCase(), value: C.w(x) }); });
            }
            else if (mode === 'img2w') {
                prompt = 'Come si dice in ' + C.name + '?';
                sub = '<span class="bigEmoji">' + w.emoji + '</span>';
                opts = ws.map(function (x) { return ({ label: C.w(x).toUpperCase(), value: C.w(x) }); });
            }
            else if (mode === 'w2img') {
                prompt = 'Quale immagine è “' + txt.toUpperCase() + '”?';
                custom = audioBtns(txt, C.voice);
                auto = [txt, C.voice];
                opts = ws.map(function (x) { return ({ label: '<span class="optEmoji">' + x.emoji + '</span>', value: C.w(x) }); });
            }
            else if (mode === 'wonly2img') {
                prompt = 'Quale immagine è “' + txt.toUpperCase() + '”?';
                sub = 'Senza audio: leggi la parola.';
                opts = ws.map(function (x) { return ({ label: '<span class="optEmoji">' + x.emoji + '</span>', value: C.w(x) }); });
            }
            else if (mode === 'ear2img') {
                prompt = '👂 Ascolta e tocca l’immagine giusta';
                custom = audioBtns(txt, C.voice, true);
                auto = [txt, C.voice];
                opts = ws.map(function (x) { return ({ label: '<span class="optEmoji">' + x.emoji + '</span>', value: C.w(x) }); });
            }
            else {
                prompt = '👂 Ascolta: che cosa significa?';
                custom = audioBtns(txt, C.voice, true);
                auto = [txt, C.voice];
                opts = ws.map(function (x) { return ({ label: x.it.toUpperCase(), value: C.w(x) }); });
            }
            var o = q(id, l, { word: w, prompt: prompt, sub: sub, custom: custom, options: sh(opts), answer: txt, answerLabel: txt.toUpperCase() + ' = ' + w.it + ' ' + w.emoji, hint: l <= 5 ? 'Ricorda la prima lettera della parola.' : l <= 10 ? 'Pensa alla categoria: ' + CAT[w.cat] + '.' : 'Ascolta di nuovo, anche con 🐢 Lento.' }, { vocabularyMinBand: l, alternatives: opts.length, mode: mode, rank: [['it2w', 'img2w', 'w2img', 'wonly2img', 'ear2img', 'ear2it'].indexOf(mode), l] });
            o.autoSpeak = auto;
            o.sayAfter = [txt, C.voice];
            o.lang = lang;
            return o;
        };
    }
    /* --- 34 / 61: Parole, frasi, categorie e ascolto --- */
    var MODES_B = [
        ['w2it', 'Leggi e ascolta → significato'], ['w2it', 'Leggi e ascolta → significato'], ['w2it', 'Leggi e ascolta → significato'],
        ['it2w', 'Dall’italiano → scrivi la parola giusta (parole simili)'], ['it2w', 'Dall’italiano → parola giusta (parole simili)'],
        ['fill', 'Completa la frase'], ['fill', 'Completa la frase (frasi più lunghe)'], ['fill', 'Completa la frase (frasi difficili)'],
        ['odd', 'Quale parola NON è del gruppo? (con categoria)'], ['odd', 'Quale parola NON è del gruppo? (con categoria)'], ['oddNoCat', 'Quale parola NON è del gruppo? (trova tu la categoria)'],
        ['ear2w', 'SOLO ASCOLTO → scegli la parola scritta'], ['ear2w', 'SOLO ASCOLTO → scegli la parola scritta'],
        ['earSent', 'SOLO ASCOLTO di una frase → significato'], ['earSent', 'SOLO ASCOLTO di frasi lunghe → significato']
    ];
    function words(lang, id) {
        return function (l, state) {
            var C = L[lang], mode = MODES_B[l - 1][0];
            var w = choose(lang, l, state), prompt, sub = '', opts, answer, label, custom = '', auto = null, say = null, meta = {};
            if (mode === 'w2it') {
                var ws = [w].concat(others(lang, w, l, nc(l) - 1));
                answer = C.w(w);
                prompt = 'Che cosa significa “' + answer.toUpperCase() + '”?';
                custom = audioBtns(answer, C.voice);
                auto = [answer, C.voice];
                opts = ws.map(function (x) { return ({ label: x.it.toUpperCase(), value: C.w(x) }); });
                label = answer.toUpperCase() + ' = ' + w.it;
            }
            else if (mode === 'it2w') {
                answer = C.w(w);
                var all = C.list().filter(function (x) { return C.w(x) !== answer; }), first_1 = answer.replace(/^(el|la|los|las) /, '')[0];
                var look = sh(all.filter(function (x) { return C.w(x).replace(/^(el|la|los|las) /, '')[0] === first_1; })).concat(others(lang, w, l, 8));
                var ws_1 = [w];
                look.forEach(function (x) { if (ws_1.length < nc(l) && ws_1.indexOf(x) < 0)
                    ws_1.push(x); });
                prompt = 'Come si dice “' + w.it.toUpperCase() + '”?';
                sub = 'Attenzione: molte parole iniziano con la stessa lettera.';
                opts = ws_1.map(function (x) { return ({ label: C.w(x).toUpperCase(), value: C.w(x) }); });
                label = answer.toUpperCase();
                say = [answer, C.voice];
            }
            else if (mode === 'fill' || mode === 'earSent') {
                var maxL_1 = mode === 'fill' ? [3, 5, 8][l - 6] : l === 14 ? 5 : 8, minL_1 = mode === 'fill' ? [1, 3, 5][l - 6] : l === 14 ? 1 : 5;
                var pool = C.sent().filter(function (s) { return s.lvl >= minL_1 && s.lvl <= maxL_1; });
                if (!pool.length)
                    pool = C.sent();
                var s_1 = pick(pool), sw = C.list().filter(function (x) { return x.en === s_1.a; })[0];
                w = sw;
                meta.sentence = 1;
                if (mode === 'fill') {
                    answer = lang === 'es' ? NS.esBare(sw) : sw.en;
                    var ws = [sw].concat(others(lang, sw, l, nc(l) + 4));
                    prompt = 'Completa la frase';
                    sub = '<span class="sentence">' + NS.escapeHtml(s_1.s).replace('___', '<b class="seqHole">___</b>') + '</span><br><small>' + s_1.it + '</small>';
                    opts = ws.map(function (x) { var v = lang === 'es' ? NS.esBare(x) : x.en; return { label: v.toUpperCase(), value: v }; }).filter(function (o, i, a) { return a.findIndex(function (z) { return z.value === o.value; }) === i; }).slice(0, nc(l));
                    label = answer.toUpperCase();
                    say = [C.fill(s_1, sw), C.voice];
                }
                else {
                    var full = C.fill(s_1, sw);
                    answer = s_1.it;
                    var its = sh(C.sent().filter(function (x) { return x.it !== s_1.it; })).slice(0, nc(l) - 1).map(function (x) { return x.it; });
                    prompt = '👂 Ascolta la frase: che cosa significa?';
                    custom = audioBtns(full, C.voice, true);
                    auto = [full, C.voice];
                    opts = [s_1.it].concat(its).map(function (v) { return ({ label: v, value: v }); });
                    label = s_1.it;
                    say = [full, C.voice];
                }
            }
            else if (mode === 'odd' || mode === 'oddNoCat') {
                var group = sh(C.list().filter(function (x) { return x.cat === w.cat && x !== w; })).slice(0, nc(l) - 2).concat([w]);
                var intr = pick(C.list().filter(function (x) { return x.cat !== w.cat && Math.abs(x.lvl - w.lvl) <= 2; }));
                answer = C.w(intr);
                prompt = 'Quale parola NON appartiene al gruppo?';
                sub = mode === 'odd' ? 'Gruppo: ' + CAT[w.cat] : 'Trova tu che cosa hanno in comune le altre.';
                opts = group.concat([intr]).map(function (x) { return ({ label: C.w(x).toUpperCase(), value: C.w(x) }); });
                label = answer.toUpperCase() + ' (' + intr.it + ')';
                w = intr;
                say = [answer, C.voice];
            }
            else {
                answer = C.w(w);
                var ws = [w].concat(others(lang, w, l, nc(l) - 1));
                prompt = '👂 Ascolta e scegli la parola scritta';
                custom = audioBtns(answer, C.voice, true);
                auto = [answer, C.voice];
                opts = ws.map(function (x) { return ({ label: C.w(x).toUpperCase(), value: C.w(x) }); });
                label = answer.toUpperCase() + ' = ' + w.it;
            }
            opts = opts.filter(function (o, i, a) { return a.findIndex(function (z) { return z.value === o.value; }) === i; });
            var o = q(id, l, { word: w, prompt: prompt, sub: sub, custom: custom, options: sh(opts), answer: answer, answerLabel: label, hint: mode === 'fill' ? 'Leggi la traduzione italiana sotto la frase.' : mode.indexOf('ear') === 0 ? 'Usa 🐢 Lento per sentire meglio.' : 'Pensa al significato di ogni parola.' }, Object.assign({ vocabularyMinBand: l, alternatives: opts.length, mode: mode, rank: [['w2it', 'it2w', 'fill', 'odd', 'oddNoCat', 'ear2w', 'earSent'].indexOf(mode), l], tierFree: (meta.sentence || mode === 'odd' || mode === 'oddNoCat') ? 1 : 0 }, meta));
            o.autoSpeak = auto;
            o.sayAfter = say || [C.w(w), C.voice];
            o.lang = lang;
            return o;
        };
    }
    NS.LEVEL_INFO[16] = MODES_A.map(function (m, i) { return 'Vocabolario fascia ' + (i + 1) + '/15 · ' + m[1] + ' · ' + CH[i] + ' risposte'; });
    NS.LEVEL_INFO[60] = NS.LEVEL_INFO[16].slice();
    NS.LEVEL_INFO[34] = MODES_B.map(function (m, i) { return 'Fascia ' + (i + 1) + '/15 · ' + m[1] + ' · ' + CH[i] + ' risposte'; });
    NS.LEVEL_INFO[61] = NS.LEVEL_INFO[34].slice();
    NS.EnglishGames[16] = match('en', 16);
    NS.EnglishGames[34] = words('en', 34);
    NS.EnglishGames[60] = match('es', 60);
    NS.EnglishGames[61] = words('es', 61);
    NS.V92Lang = { tier: tier, MODES_A: MODES_A, MODES_B: MODES_B };
})(window.LogicLand);
