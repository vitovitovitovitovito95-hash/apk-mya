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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
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
(function (NS) {
    var e_1, _a, e_2, _b;
    var COLORS = ['🔴', '🔵', '🟢', '🟡', '🟣', '🟠'];
    var SHAPES = ['●', '▲', '■', '◆', '★', '⬟'];
    var ARROWS = ['⬆️', '➡️', '⬇️', '⬅️'];
    var OBJECTS = ['🍎', '⭐', '🐶', '🚗', '🦋', '⚽', '🍓', '🐠'];
    var OUTLINE = { '●': '○', '▲': '△', '■': '□', '◆': '◇', '★': '☆', '⬟': '⬡' };
    function finish(id, level, q) { return NS.attachDifficulty(q, id, level); }
    function opt(answer, pool, count) {
        if (count === void 0) { count = 4; }
        return NS.uniqueOptions(String(answer), pool.map(String), count);
    }
    function qCountChoose(level) {
        var p = NS.levelProfile(level), icon = NS.pick(OBJECTS), mode = level <= 5 ? 0 : level <= 10 ? NS.rnd(0, 1) : NS.rnd(1, 2);
        if (mode === 0) {
            var n = Math.min(18, 2 + level + NS.rnd(0, 2));
            return finish(31, level, { prompt: 'Quanti oggetti vedi?', visual: "<div class=\"bigVisual countVisual\">".concat(icon.repeat(n), "</div>"), options: opt(n, [n - 2, n - 1, n + 1, n + 2, n + 3].filter(function (x) { return x > 0; }), p.choices), answer: String(n), hint: 'Conta uno alla volta, toccandoli con lo sguardo.' });
        }
        if (mode === 1) {
            var a = NS.rnd(2, 7 + level), b = NS.rnd(2, 7 + level);
            if (a === b)
                return qCountChoose(level);
            var answer = a > b ? 'A' : 'B';
            return finish(31, level, { prompt: 'Quale gruppo contiene più oggetti?', visual: "<div class=\"compareGroups\"><div><b>A</b><span>".concat(icon.repeat(Math.min(a, 18)), "</span></div><div><b>B</b><span>").concat(icon.repeat(Math.min(b, 18)), "</span></div></div>"), options: [{ label: 'Gruppo A', value: 'A' }, { label: 'Gruppo B', value: 'B' }], answer: answer, hint: 'Puoi contare i due gruppi e poi confrontare i numeri.' });
        }
        var known = NS.rnd(3, 8 + level), missing = NS.rnd(2, 5 + Math.floor(level / 2)), total = known + missing;
        return finish(31, level, { prompt: 'Quanti oggetti sono nascosti?', visual: "<div class=\"bigVisual\">".concat(icon.repeat(Math.min(known, 12)), " + \u2753 = ").concat(total, "</div>"), options: opt(missing, [missing - 2, missing - 1, missing + 1, missing + 2, total].filter(function (x) { return x >= 0; }), p.choices), answer: String(missing), hint: "Fai ".concat(total, " \u2212 ").concat(known, ".") });
    }
    function qShadow(level) {
        var p = NS.levelProfile(level), count = level <= 5 ? 1 : level <= 10 ? 2 : 3, base = NS.shuffle(SHAPES).slice(0, count), answer = base.map(function (x) { return OUTLINE[x]; }).join('');
        var wrong = [];
        for (var i = 0; i < 8; i++) {
            var x = NS.shuffle(SHAPES).slice(0, count).map(function (s) { return OUTLINE[s]; }).join('');
            if (x !== answer)
                wrong.push(x);
        }
        return finish(32, level, { prompt: 'Qual è l’ombra corretta?', sub: count === 1 ? 'Abbina la figura alla sua sagoma.' : 'Mantieni forma e ordine di tutti i pezzi.', visual: "<div class=\"bigVisual\">".concat(base.join(''), " \u2192 ?</div>"), options: opt(answer, wrong, p.choices), answer: answer, hint: 'L’ombra cambia il riempimento, non la forma.' });
    }
    function qTwins(level) {
        var p = NS.levelProfile(level), n = Math.min(10, 4 + Math.floor(level / 2)), pool = level <= 5 ? COLORS : level <= 10 ? __spreadArray(__spreadArray([], __read(COLORS), false), __read(SHAPES), false) : __spreadArray(__spreadArray(__spreadArray([], __read(COLORS), false), __read(SHAPES), false), __read(ARROWS), false);
        var arr = NS.shuffle(pool).slice(0, n), token = NS.pick(arr), i = NS.rnd(0, n - 1), j = NS.rnd(0, n - 1);
        while (j === i)
            j = NS.rnd(0, n - 1);
        arr[i] = token;
        arr[j] = token;
        // Make every other token unique relative to the twin token.
        var used = new Set([token]);
        for (var k = 0; k < n; k++) {
            if (k === i || k === j)
                continue;
            var candidates = pool.filter(function (x) { return !used.has(x); });
            if (!candidates.length)
                candidates = pool.filter(function (x) { return x !== token; });
            arr[k] = NS.pick(candidates);
            used.add(arr[k]);
        }
        var a = Math.min(i, j) + 1, b = Math.max(i, j) + 1, answer = "".concat(a, "-").concat(b), pairs = [answer];
        while (pairs.length < Math.min(6, p.choices)) {
            var x = NS.rnd(1, n), y = NS.rnd(1, n);
            if (x === y)
                continue;
            var z = "".concat(Math.min(x, y), "-").concat(Math.max(x, y));
            if (!pairs.includes(z))
                pairs.push(z);
        }
        return finish(33, level, { prompt: 'Dove sono le due figure gemelle?', visual: "<div class=\"pieceStrip\">".concat(arr.map(function (x, k) { return "<span><small>".concat(k + 1, "</small>").concat(x, "</span>"); }).join(''), "</div>"), options: NS.shuffle(pairs).map(function (x) { return ({ label: "Pezzi ".concat(x.replace('-', ' e ')), value: x }); }), answer: answer, hint: 'Confronta forma, colore e orientamento: devono essere identici.' });
    }
    function englishDistractors(word, count) {
        if (count === void 0) { count = 5; }
        var same = NS.WORDS.filter(function (x) { return x.en !== word.en && (x.cat === word.cat || x.lvl === word.lvl); });
        return NS.shuffle(same.length >= count ? same : NS.WORDS.filter(function (x) { return x.en !== word.en; })).slice(0, count);
    }
    function wordChoices(correct, others, count) {
        return NS.shuffle(__spreadArray([correct], __read(NS.shuffle(others.filter(function (x) { return x.en !== correct.en; })).slice(0, Math.max(1, count - 1))), false));
    }
    function qFirstEnglish(level, state) {
        var p = NS.levelProfile(level), w = NS.selectEnglishWord(state, Math.min(level, 9)), others = englishDistractors(w, 6), mode = level <= 4 ? 0 : level <= 9 ? 1 : 2;
        if (mode === 0)
            return finish(34, level, { word: w, prompt: "Come si dice \u201C".concat(w.it, "\u201D in inglese?"), visual: "<div class=\"bigVisual\">".concat(w.emoji, "</div>"), options: wordChoices(w, others, p.choices).map(function (x) { return ({ label: x.en.toUpperCase(), value: x.en }); }).concat([]), answer: w.en, answerLabel: w.en.toUpperCase(), hint: "La parola indica ".concat(w.it, ".") });
        if (mode === 1)
            return finish(34, level, { word: w, prompt: "Cosa significa \u201C".concat(w.en.toUpperCase(), "\u201D?"), visual: "<div class=\"bigVisual\">".concat(w.emoji, "</div>"), options: wordChoices(w, others, p.choices).map(function (x) { return ({ label: x.it, value: x.en }); }), answer: w.en, answerLabel: w.it, hint: 'Guarda l’immagine e ricorda la parola.' });
        var candidates = wordChoices(w, others, Math.max(3, p.choices));
        return finish(34, level, { word: w, prompt: 'Scegli la parola inglese corretta', sub: "Categoria: ".concat(w.cat, " \u2022 Italiano: ").concat(w.it), options: candidates.map(function (x) { return ({ label: x.en.toUpperCase(), value: x.en }); }), answer: w.en, answerLabel: w.en.toUpperCase(), hint: 'Usa insieme categoria e significato.' });
    }
    function qColorDomino(level) {
        var p = NS.levelProfile(level), a = NS.pick(COLORS), b = NS.pick(COLORS.filter(function (x) { return x !== a; })), c = NS.pick(COLORS.filter(function (x) { return x !== a && x !== b; }));
        var seq, answer, hint;
        if (level <= 3) {
            seq = [a, b, a, b, a];
            answer = b;
            hint = 'Alterna due colori.';
        }
        else if (level <= 6) {
            seq = [a, a, b, a, a, b, a, a];
            answer = b;
            hint = 'Due uguali e uno diverso.';
        }
        else if (level <= 9) {
            seq = [a, b, c, a, b, c, a];
            answer = b;
            hint = 'Si ripete un gruppo di tre.';
        }
        else if (level <= 12) {
            seq = [a, b, b, c, c, a, a, b, b];
            answer = c;
            hint = 'Ogni colore compare due volte, poi cambia.';
        }
        else {
            var d = NS.pick(COLORS.filter(function (x) { return ![a, b, c].includes(x); }));
            seq = [a, b, c, d, b, c, d, a, c, d, a];
            answer = b;
            hint = 'La sequenza scorre su quattro colori saltando il primo a ogni blocco.';
        }
        return finish(35, level, { prompt: 'Quale tessera continua il domino?', visual: "<div class=\"bigVisual\">".concat(seq.join(' '), " ?</div>"), options: opt(answer, COLORS, p.choices), answer: answer, hint: hint });
    }
    function qMysteryOperation(level) {
        var p = NS.levelProfile(level);
        var f, label;
        if (level <= 3) {
            var k_1 = level + 1;
            f = function (x) { return x + k_1; };
            label = "+".concat(k_1);
        }
        else if (level <= 6) {
            var k_2 = 2 + Math.floor((level - 4) / 2);
            f = function (x) { return x * k_2; };
            label = "\u00D7".concat(k_2);
        }
        else if (level <= 9) {
            var k_3 = level - 5;
            f = function (x) { return 2 * x + k_3; };
            label = "\u00D72 poi +".concat(k_3);
        }
        else if (level <= 12) {
            var k_4 = level - 8;
            f = function (x) { return 3 * x - k_4; };
            label = "\u00D73 poi \u2212".concat(k_4);
        }
        else {
            var k_5 = level - 11;
            f = function (x) { return x * x + k_5; };
            label = "quadrato poi +".concat(k_5);
        }
        var x1 = NS.rnd(1, 5 + Math.floor(level / 3)), x2 = x1 + 1, x3 = x2 + 1, answer = f(x3);
        return finish(36, level, { prompt: 'Quale numero manca?', sub: 'Scopri la stessa trasformazione usata negli esempi.', visual: "<div class=\"bigVisual\">".concat(x1, " \u2192 ").concat(f(x1), " &nbsp; ").concat(x2, " \u2192 ").concat(f(x2), " &nbsp; ").concat(x3, " \u2192 ?</div>"), options: opt(answer, [answer - 3, answer - 2, answer - 1, answer + 1, answer + 2, answer + 3].filter(function (x) { return x >= 0; }), p.choices), answer: String(answer), hint: "Regola: ".concat(label, ".") });
    }
    function qDirections(level) {
        var p = NS.levelProfile(level), start = NS.rnd(0, 3), turns = [];
        var dir = start, steps = Math.min(5, p.steps + Math.floor(p.withinStage / 2));
        for (var i = 0; i < steps; i++) {
            var delta = level <= 4 ? 1 : NS.pick(level <= 9 ? [1, 3] : [1, 2, 3]);
            turns.push(delta);
            dir = (dir + delta) % 4;
        }
        var text = turns.map(function (t) { return t === 1 ? '↻90°' : t === 2 ? '↻180°' : '↺90°'; }).join('  ');
        return finish(37, level, { prompt: 'In quale direzione finisce la freccia?', visual: "<div class=\"bigVisual\">".concat(ARROWS[start], " &nbsp; ").concat(text, " &nbsp; \u2192 ?</div>"), options: NS.shuffle(ARROWS), answer: ARROWS[dir], hint: 'Applica le rotazioni una alla volta, da sinistra a destra.' });
    }
    function qEnglishMemory(level, state) {
        var p = NS.levelProfile(level), w = NS.selectEnglishWord(state, level), others = englishDistractors(w, 6), mode = level <= 5 ? 0 : level <= 10 ? 1 : 2;
        if (mode === 0)
            return finish(38, level, { word: w, prompt: 'Ricorda la coppia', sub: "".concat(w.emoji, " = ").concat(w.en.toUpperCase(), ". Quale parola hai appena visto?"), options: wordChoices(w, others, p.choices).map(function (x) { return ({ label: x.en.toUpperCase(), value: x.en }); }), answer: w.en, answerLabel: w.en.toUpperCase(), hint: "Era associata a ".concat(w.emoji, ".") });
        if (mode === 1)
            return finish(38, level, { word: w, prompt: 'Quale immagine appartiene alla parola?', visual: "<div class=\"bigVisual\">".concat(w.en.toUpperCase(), "</div>"), options: wordChoices(w, others, p.choices).map(function (x) { return ({ label: "".concat(x.emoji, " ").concat(x.it), value: x.en }); }), answer: w.en, answerLabel: "".concat(w.emoji, " ").concat(w.it), hint: 'Richiama mentalmente la coppia parola-immagine.' });
        var sameCat = NS.WORDS.filter(function (x) { return x.cat === w.cat && x.en !== w.en; }), second = NS.pick(sameCat.length ? sameCat : others);
        return finish(38, level, { word: w, prompt: 'Quale coppia appartiene alla stessa categoria?', sub: "Categoria nascosta: ".concat(w.en.toUpperCase(), " + ?"), options: wordChoices(second, others.filter(function (x) { return x.cat !== w.cat; }), p.choices).map(function (x) { return ({ label: x.en.toUpperCase(), value: x.en }); }), answer: second.en, answerLabel: second.en.toUpperCase(), hint: "".concat(w.en, " significa ").concat(w.it, ": pensa alla sua categoria.") });
    }
    function qFractions(level) {
        var p = NS.levelProfile(level), den = level <= 4 ? 2 : level <= 8 ? NS.pick([2, 3, 4]) : level <= 12 ? NS.pick([3, 4, 5, 6]) : NS.pick([4, 5, 6, 8]), num = NS.rnd(1, den - 1), answer = "".concat(num, "/").concat(den);
        var filled = '🟦'.repeat(num) + '⬜'.repeat(den - num), pool = [];
        for (var d = 2; d <= 8; d++)
            for (var n = 1; n < d; n++)
                pool.push("".concat(n, "/").concat(d));
        if (level <= 9)
            return finish(39, level, { prompt: 'Quale frazione è colorata?', visual: "<div class=\"bigVisual fractionVisual\">".concat(filled, "</div>"), options: opt(answer, pool, p.choices), answer: answer, hint: "Conta ".concat(den, " parti uguali e ").concat(num, " parti colorate.") });
        var den2 = den;
        var num2 = NS.rnd(1, den2 - 1);
        while (num2 === num)
            num2 = NS.rnd(1, den2 - 1);
        var a = num / den, b = num2 / den2, ans = a > b ? 'A' : 'B';
        return finish(39, level, { prompt: 'Quale frazione è maggiore?', visual: "<div class=\"compareGroups\"><div><b>A</b><span>".concat('🟦'.repeat(num)).concat('⬜'.repeat(den - num), "</span><small>").concat(num, "/").concat(den, "</small></div><div><b>B</b><span>").concat('🟩'.repeat(num2)).concat('⬜'.repeat(den2 - num2), "</span><small>").concat(num2, "/").concat(den2, "</small></div></div>"), options: [{ label: 'A', value: 'A' }, { label: 'B', value: 'B' }], answer: ans, hint: 'Con lo stesso denominatore, è maggiore la frazione con più parti colorate.' });
    }
    function qCoordinates(level) {
        var p = NS.levelProfile(level), n = Math.min(7, 3 + Math.floor((level - 1) / 3)), r = NS.rnd(0, n - 1), c = NS.rnd(0, n - 1), answer = String.fromCharCode(65 + r) + (c + 1);
        var cells = '';
        for (var y = 0; y < n; y++)
            for (var x = 0; x < n; x++)
                cells += "<i>".concat(y === r && x === c ? '⭐' : '', "</i>");
        var pool = [];
        for (var y = 0; y < n; y++)
            for (var x = 0; x < n; x++)
                pool.push(String.fromCharCode(65 + y) + (x + 1));
        return finish(40, level, { prompt: 'In quale coordinata si trova la stella?', sub: 'Le righe sono lettere; le colonne sono numeri.', visual: "<div class=\"coordWrap\"><div class=\"robotgrid\" style=\"grid-template-columns:repeat(".concat(n, ",36px)\">").concat(cells, "</div></div>"), options: opt(answer, pool, p.choices), answer: answer, hint: "Riga ".concat(String.fromCharCode(65 + r), ", colonna ").concat(c + 1, ".") });
    }
    function qAnalogy(level) {
        var e_3, _a, e_4, _b;
        var p = NS.levelProfile(level), shape = NS.pick(SHAPES), shape2 = NS.pick(SHAPES.filter(function (x) { return x !== shape; })), c1 = NS.pick(COLORS), c2 = NS.pick(COLORS.filter(function (x) { return x !== c1; }));
        var A, B, C, answer, hint, pool = [];
        if (level <= 5) {
            A = c1 + shape;
            B = c2 + shape;
            C = c1 + shape2;
            answer = c2 + shape2;
            hint = 'Cambia il colore, ma conserva la forma.';
        }
        else if (level <= 10) {
            A = c1 + shape;
            B = c1 + shape2;
            C = c2 + shape;
            answer = c2 + shape2;
            hint = 'Applica a C lo stesso cambio di forma visto tra A e B.';
        }
        else {
            var ar = NS.pick(ARROWS), idx = ARROWS.indexOf(ar), rot = 1 + ((level - 11) % 3);
            A = c1 + ARROWS[idx];
            B = c2 + ARROWS[(idx + rot) % 4];
            C = c1 + ARROWS[(idx + 1) % 4];
            answer = c2 + ARROWS[(idx + 1 + rot) % 4];
            hint = 'Cambia colore e ruota della stessa quantità.';
        }
        try {
            for (var _c = __values(COLORS.slice(0, 4)), _d = _c.next(); !_d.done; _d = _c.next()) {
                var c = _d.value;
                try {
                    for (var _e = (e_4 = void 0, __values(__spreadArray(__spreadArray([], __read(SHAPES.slice(0, 4)), false), __read(ARROWS), false))), _f = _e.next(); !_f.done; _f = _e.next()) {
                        var s = _f.value;
                        pool.push(c + s);
                    }
                }
                catch (e_4_1) { e_4 = { error: e_4_1 }; }
                finally {
                    try {
                        if (_f && !_f.done && (_b = _e.return)) _b.call(_e);
                    }
                    finally { if (e_4) throw e_4.error; }
                }
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
            }
            finally { if (e_3) throw e_3.error; }
        }
        return finish(41, level, { prompt: 'A sta a B come C sta a…', visual: "<div class=\"bigVisual\">".concat(A, " : ").concat(B, " = ").concat(C, " : ?</div>"), options: opt(answer, pool, p.choices), answer: answer, hint: hint });
    }
    function qEnglishCategories(level, state) {
        var p = NS.levelProfile(level), w = NS.selectEnglishWord(state, level), same = NS.WORDS.filter(function (x) { return x.cat === w.cat && x.en !== w.en; }), mate = NS.pick(same.length ? same : englishDistractors(w)), wrong = NS.shuffle(NS.WORDS.filter(function (x) { return x.cat !== w.cat; })).slice(0, 6);
        if (level <= 7)
            return finish(42, level, { word: w, prompt: 'Quale parola appartiene alla stessa categoria?', sub: "".concat(w.en.toUpperCase(), " (").concat(w.it, ")"), options: wordChoices(mate, wrong, p.choices).map(function (x) { return ({ label: "".concat(x.en.toUpperCase(), " ").concat(x.emoji), value: x.en }); }), answer: mate.en, answerLabel: mate.en.toUpperCase(), hint: "Pensa alla categoria \u201C".concat(w.cat, "\u201D.") });
        var group = NS.shuffle(__spreadArray([w, mate], __read(same.filter(function (x) { return x.en !== mate.en; })), false)).slice(0, 3), intruder = NS.pick(wrong), arr = NS.shuffle(__spreadArray(__spreadArray([], __read(group), false), [intruder], false));
        return finish(42, level, { word: w, prompt: 'Quale parola è l’intrusa?', sub: 'Tre parole appartengono alla stessa categoria.', options: arr.map(function (x) { return ({ label: x.en.toUpperCase(), value: x.en }); }), answer: intruder.en, answerLabel: intruder.en.toUpperCase(), hint: 'Traduci le parole e cerca quella di una categoria diversa.' });
    }
    function qMultiStepProblems(level) {
        var p = NS.levelProfile(level), a = NS.rnd(5, 15 + level * 2), b = NS.rnd(2, 8 + level), c = NS.rnd(1, 6 + Math.floor(level / 2));
        var text, answer;
        if (level <= 5) {
            answer = a + b - c;
            text = "Hai ".concat(a, " figurine, ne ricevi ").concat(b, " e poi ne regali ").concat(c, ". Quante ne restano?");
        }
        else if (level <= 10) {
            var packs = NS.rnd(2, 3 + Math.floor(level / 3)), each = NS.rnd(3, 8), gift = NS.rnd(1, Math.min(6, packs * each - 1));
            answer = packs * each - gift;
            text = "Hai ".concat(packs, " pacchetti da ").concat(each, " figurine. Ne regali ").concat(gift, ". Quante restano?");
        }
        else {
            var groups = NS.rnd(2, 5), each = NS.rnd(4, 9), extra = NS.rnd(2, 8), share = NS.pick([2, 3]);
            var total = groups * each + extra, usable = total - total % share;
            answer = usable / share;
            text = "Ci sono ".concat(groups, " scatole da ").concat(each, " oggetti e altri ").concat(extra, ". Ne usi ").concat(usable, " e li dividi tra ").concat(share, " bambini. Quanti a testa?");
        }
        return finish(43, level, { prompt: 'Problema a più passaggi', sub: text, options: opt(answer, [answer - 3, answer - 2, answer - 1, answer + 1, answer + 2, answer + 3].filter(function (x) { return x >= 0; }), p.choices), answer: String(answer), hint: "Servono ".concat(p.steps, " passaggi: scrivi un risultato intermedio alla volta.") });
    }
    function qDoubleMatrix(level) {
        var e_5, _a, e_6, _b;
        var p = NS.levelProfile(level), cs = NS.shuffle(COLORS).slice(0, 3), ss = NS.shuffle(SHAPES).slice(0, 3), tok = function (r, c) { return cs[r] + ss[c]; };
        var grid, answer, pool = [];
        try {
            for (var cs_1 = __values(cs), cs_1_1 = cs_1.next(); !cs_1_1.done; cs_1_1 = cs_1.next()) {
                var c = cs_1_1.value;
                try {
                    for (var ss_1 = (e_6 = void 0, __values(ss)), ss_1_1 = ss_1.next(); !ss_1_1.done; ss_1_1 = ss_1.next()) {
                        var s = ss_1_1.value;
                        pool.push(c + s);
                    }
                }
                catch (e_6_1) { e_6 = { error: e_6_1 }; }
                finally {
                    try {
                        if (ss_1_1 && !ss_1_1.done && (_b = ss_1.return)) _b.call(ss_1);
                    }
                    finally { if (e_6) throw e_6.error; }
                }
            }
        }
        catch (e_5_1) { e_5 = { error: e_5_1 }; }
        finally {
            try {
                if (cs_1_1 && !cs_1_1.done && (_a = cs_1.return)) _a.call(cs_1);
            }
            finally { if (e_5) throw e_5.error; }
        }
        if (level <= 5) {
            grid = [[tok(0, 0), tok(0, 1)], [tok(1, 0), '?']];
            answer = tok(1, 1);
        }
        else if (level <= 10) {
            grid = [[tok(0, 0), tok(1, 1), tok(2, 2)], [tok(1, 2), tok(2, 0), tok(0, 1)], [tok(2, 1), tok(0, 2), '?']];
            answer = tok(1, 0);
        }
        else {
            grid = [[tok(0, 0), tok(1, 1), tok(2, 2)], [tok(2, 1), tok(0, 2), tok(1, 0)], [tok(1, 2), tok(2, 0), '?']];
            answer = tok(0, 1);
        }
        var cls = grid.length === 2 ? 'matrix' : 'matrix3 compact';
        return finish(44, level, { prompt: 'Completa la matrice a doppia regola', sub: 'Colore e forma seguono schemi indipendenti.', visual: "<div class=\"".concat(cls, "\">").concat(grid.flat().map(function (x) { return "<i>".concat(x, "</i>"); }).join(''), "</div>"), options: opt(answer, pool, p.choices), answer: answer, hint: 'Controlla prima solo i colori, poi solo le forme.' });
    }
    function qImpossibleTile(level) {
        var p = NS.levelProfile(level), n = Math.min(10, 5 + Math.floor(level / 3)), baseC = NS.pick(COLORS), baseS = NS.pick(SHAPES), oddC = NS.pick(COLORS.filter(function (x) { return x !== baseC; })), oddS = NS.pick(SHAPES.filter(function (x) { return x !== baseS; })), idx = NS.rnd(0, n - 1), arr = [];
        for (var i = 0; i < n; i++) {
            if (level <= 5)
                arr.push(i === idx ? oddC : baseC);
            else if (level <= 10)
                arr.push(i === idx ? baseC + oddS : baseC + baseS);
            else
                arr.push(i === idx ? oddC + oddS : baseC + baseS);
        }
        return finish(45, level, { prompt: 'Quale tassello non può appartenere al gruppo?', visual: "<div class=\"pieceStrip\">".concat(arr.map(function (x, i) { return "<span><small>".concat(i + 1, "</small>").concat(x, "</span>"); }).join(''), "</div>"), options: Array.from({ length: n }, function (_, i) { return ({ label: "Tassello ".concat(i + 1), value: String(i) }); }), answer: String(idx), hint: level <= 5 ? 'Cerca il colore diverso.' : level <= 10 ? 'Il colore è uguale: controlla la forma.' : 'Controlla contemporaneamente colore e forma.' });
    }
    var SENTENCE_BANK = [
        ['I', 'like', 'red', 'apples'], ['The', 'dog', 'can', 'run'], ['My', 'book', 'is', 'blue'], ['We', 'go', 'to', 'school'], ['The', 'cat', 'is', 'sleeping'], ['I', 'drink', 'cold', 'water'], ['My', 'family', 'is', 'happy'], ['The', 'bird', 'can', 'fly']
    ];
    function qSentenceOrder(level, state) {
        var p = NS.levelProfile(level), base = NS.pick(SENTENCE_BANK), extra = level >= 11 ? ['today'] : [], words = __spreadArray(__spreadArray([], __read(base), false), __read(extra), false), answer = words.join(' '), wrong = [];
        for (var i = 0; i < 10; i++) {
            var x = NS.shuffle(words).join(' ');
            if (x !== answer && !wrong.includes(x))
                wrong.push(x);
        }
        var refWord = NS.WORDS.find(function (w) { return answer.toLowerCase().includes(w.en); }) || NS.selectEnglishWord(state, level);
        return finish(46, level, { word: refWord, prompt: 'Quale frase è nell’ordine corretto?', sub: "Parole: ".concat(NS.shuffle(words).join(' • ')), options: opt(answer, wrong, p.choices), answer: answer, answerLabel: answer, hint: 'In inglese di solito viene prima chi compie l’azione, poi il verbo.' });
    }
    function qConditions(level) {
        var p = NS.levelProfile(level), names = ['Anna', 'Luca', 'Mia', 'Leo'], items = ['🍎', '📘', '⚽', '🎈'];
        if (level <= 5) {
            var a_1 = NS.pick(names), b_1 = NS.pick(names.filter(function (x) { return x !== a_1; })), item = NS.pick(items), answer_1 = a_1;
            return finish(47, level, { prompt: 'Chi può avere l’oggetto?', sub: "Solo ".concat(a_1, " ha ").concat(item, ". ").concat(b_1, " non ha ").concat(item, "."), options: opt(a_1, __spreadArray([b_1], __read(names.filter(function (x) { return x !== a_1 && x !== b_1; })), false), p.choices), answer: answer_1, hint: 'Usa la frase positiva: dice direttamente chi possiede l’oggetto.' });
        }
        if (level <= 10) {
            var a = names[0], b = names[1], c = names[2];
            return finish(47, level, { prompt: 'Chi è sicuramente davanti?', sub: "".concat(a, " \u00E8 davanti a ").concat(b, ". ").concat(b, " \u00E8 davanti a ").concat(c, "."), options: opt(a, [b, c, names[3]], p.choices), answer: a, hint: 'Se A è davanti a B e B davanti a C, A è davanti a entrambi.' });
        }
        var answer = 'Mia';
        return finish(47, level, { prompt: 'Chi soddisfa tutte le condizioni?', sub: 'Anna ha il libro ma non la palla. Luca ha la palla ma non il libro. Mia ha sia libro sia palla. Serve qualcuno con ENTRAMBI.', options: NS.shuffle(['Anna', 'Luca', 'Mia', 'Leo']), answer: answer, hint: '“Entrambi” significa che devono essere vere due condizioni nello stesso momento.' });
    }
    function qConstrainedPaths(level) {
        var p = NS.levelProfile(level), paths = ['A-B-C-D', 'A-C-B-D', 'A-B-D-C', 'A-D-B-C', 'A-C-D-B'];
        var rule, answer;
        if (level <= 5) {
            rule = 'Devi passare da B prima di C e finire in D.';
            answer = 'A-B-C-D';
        }
        else if (level <= 10) {
            rule = 'Devi visitare C prima di B, B prima di D e finire in D.';
            answer = 'A-C-B-D';
        }
        else {
            rule = 'Devi visitare B, poi D, e C deve essere l’ultima tappa.';
            answer = 'A-B-D-C';
        }
        return finish(48, level, { prompt: 'Quale percorso rispetta tutti i vincoli?', sub: rule, visual: '<div class="bigVisual">A 🏠 &nbsp; B ⭐ &nbsp; C 🔑 &nbsp; D 🏁</div>', options: NS.shuffle(__spreadArray([answer], __read(NS.shuffle(paths.filter(function (x) { return x !== answer; })).slice(0, Math.max(p.choices, 4) - 1)), false)), answer: answer, hint: 'Controlla i vincoli uno alla volta ed elimina i percorsi che ne violano anche uno solo.' });
    }
    function qMultiRulePattern(level) {
        var e_7, _a, e_8, _b;
        var p = NS.levelProfile(level), cs = NS.shuffle(COLORS).slice(0, 4), ss = NS.shuffle(SHAPES).slice(0, 4), rules = Math.min(4, p.simultaneousRules), tokens = [];
        var answer;
        for (var i_1 = 0; i_1 < 6; i_1++) {
            var c_1 = cs[i_1 % Math.min(cs.length, Math.max(2, rules))], s_1 = ss[Math.floor(i_1 / Math.max(1, 4 - rules)) % ss.length], rot_1 = level >= 11 ? ARROWS[i_1 % 4] : '';
            tokens.push(c_1 + s_1 + rot_1);
        }
        var i = 6, c = cs[i % Math.min(cs.length, Math.max(2, rules))], s = ss[Math.floor(i / Math.max(1, 4 - rules)) % ss.length], rot = level >= 11 ? ARROWS[i % 4] : '';
        answer = c + s + rot;
        var pool = [];
        try {
            for (var cs_2 = __values(cs), cs_2_1 = cs_2.next(); !cs_2_1.done; cs_2_1 = cs_2.next()) {
                var x = cs_2_1.value;
                try {
                    for (var ss_2 = (e_8 = void 0, __values(ss)), ss_2_1 = ss_2.next(); !ss_2_1.done; ss_2_1 = ss_2.next()) {
                        var y = ss_2_1.value;
                        pool.push(x + y + (level >= 11 ? NS.pick(ARROWS) : ''));
                    }
                }
                catch (e_8_1) { e_8 = { error: e_8_1 }; }
                finally {
                    try {
                        if (ss_2_1 && !ss_2_1.done && (_b = ss_2.return)) _b.call(ss_2);
                    }
                    finally { if (e_8) throw e_8.error; }
                }
            }
        }
        catch (e_7_1) { e_7 = { error: e_7_1 }; }
        finally {
            try {
                if (cs_2_1 && !cs_2_1.done && (_a = cs_2.return)) _a.call(cs_2);
            }
            finally { if (e_7) throw e_7.error; }
        }
        return finish(49, level, { prompt: 'Quale pezzo continua il pattern?', sub: "Il livello combina ".concat(rules, " ").concat(rules === 1 ? 'regola' : 'regole', " contemporaneamente."), visual: "<div class=\"pieceStrip\">".concat(tokens.map(function (x) { return "<span>".concat(x, "</span>"); }).join(''), "<span>?</span></div>"), options: opt(answer, pool, p.choices), answer: answer, hint: 'Analizza separatamente colore, forma, quantità e orientamento.' });
    }
    function qEnglishLogic(level, state) {
        var p = NS.levelProfile(level), w = NS.selectEnglishWord(state, level), others = englishDistractors(w, 8), same = NS.WORDS.filter(function (x) { return x.cat === w.cat && x.en !== w.en; }), mate = NS.pick(same.length ? same : others);
        if (level <= 5)
            return finish(50, level, { word: w, prompt: 'English clue', sub: "I am ".concat(w.emoji, ". In Italian I am \u201C").concat(w.it, "\u201D. What am I in English?"), options: wordChoices(w, others, p.choices).map(function (x) { return ({ label: x.en.toUpperCase(), value: x.en }); }), answer: w.en, answerLabel: w.en.toUpperCase(), hint: "Traduci \u201C".concat(w.it, "\u201D.") });
        if (level <= 10)
            return finish(50, level, { word: w, prompt: 'English logic', sub: "".concat(w.en.toUpperCase(), " and ? belong to the same group."), options: wordChoices(mate, others.filter(function (x) { return x.cat !== w.cat; }), p.choices).map(function (x) { return ({ label: "".concat(x.en.toUpperCase(), " ").concat(x.emoji), value: x.en }); }), answer: mate.en, answerLabel: mate.en.toUpperCase(), hint: "Pensa alla categoria di ".concat(w.en, ": ").concat(w.cat, ".") });
        var intruder = NS.pick(others.filter(function (x) { return x.cat !== w.cat; })), group = NS.shuffle(__spreadArray(__spreadArray([w, mate], __read(same.filter(function (x) { return x.en !== mate.en; }).slice(0, 2)), false), [intruder], false));
        return finish(50, level, { word: w, prompt: 'Find the odd word out', sub: 'Four words belong together; one does not.', options: group.map(function (x) { return ({ label: x.en.toUpperCase(), value: x.en }); }), answer: intruder.en, answerLabel: intruder.en.toUpperCase(), hint: 'Traduci tutte le parole e cerca quella di categoria diversa.' });
    }
    Object.assign(NS.MathGames, { 31: qCountChoose, 36: qMysteryOperation, 39: qFractions, 43: qMultiStepProblems });
    Object.assign(NS.VisualGames, { 32: qShadow, 33: qTwins, 35: qColorDomino, 37: qDirections, 40: qCoordinates, 41: qAnalogy, 44: qDoubleMatrix, 45: qImpossibleTile, 49: qMultiRulePattern });
    Object.assign(NS.EnglishGames, { 34: qFirstEnglish, 38: qEnglishMemory, 42: qEnglishCategories, 46: qSentenceOrder, 50: qEnglishLogic });
    Object.assign(NS.VisualGames, { 47: qConditions, 48: qConstrainedPaths });
    try {
        // Every generator, old and new, is normalized through the same 15-step
        // difficulty contract. Tests verify that the score strictly increases L1→L15.
        for (var _c = __values([NS.MathGames, NS.VisualGames, NS.EnglishGames]), _d = _c.next(); !_d.done; _d = _c.next()) {
            var registry = _d.value;
            var _loop_1 = function (id, fn) {
                if (fn._progressWrapped)
                    return "continue";
                var wrapped = function (level, state) { return NS.attachDifficulty(fn(level, state), Number(id), level); };
                wrapped._progressWrapped = true;
                registry[id] = wrapped;
            };
            try {
                for (var _e = (e_2 = void 0, __values(Object.entries(registry))), _f = _e.next(); !_f.done; _f = _e.next()) {
                    var _g = __read(_f.value, 2), id = _g[0], fn = _g[1];
                    _loop_1(id, fn);
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (_f && !_f.done && (_b = _e.return)) _b.call(_e);
                }
                finally { if (e_2) throw e_2.error; }
            }
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
        }
        finally { if (e_1) throw e_1.error; }
    }
})(window.LogicLand);
