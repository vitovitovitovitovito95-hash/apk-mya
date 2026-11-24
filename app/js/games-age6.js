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
    var COLORS = ['🔴', '🔵', '🟢', '🟡', '🟣', '🟠'];
    var SHAPES = ['●', '▲', '■', '◆', '★', '⬟'];
    var ARROWS = ['⬆️', '➡️', '⬇️', '⬅️'];
    var OBJECTS = ['🍎', '⭐', '🐶', '🚗', '🦋', '⚽', '🍓', '🐠', '🌙', '🌸', '🐱', '🚀', '🍦', '🎈', '🧸', '🍀', '☀️', '📘'];
    var OUTLINE = { '●': '○', '▲': '△', '■': '□', '◆': '◇', '★': '☆', '⬟': '⬡' };
    // Ogni livello ha un indice di carico strettamente crescente.
    // I generatori sotto usano questi parametri direttamente, non solo come etichetta.
    NS.AGE6_DIFFICULTY = Array.from({ length: 15 }, function (_, i) { return ({
        level: i + 1,
        load: 100 + (i + 1) * 17,
        choices: i < 2 ? 2 : i < 5 ? 3 : 4,
        sequenceLength: 4 + Math.floor(i / 2),
        visualItems: 4 + Math.floor(i / 2),
        distractorSimilarity: 1 + i,
        memoryDelayMs: Math.max(1250, 4300 - i * 205),
        hintTier: i < 4 ? 3 : i < 9 ? 2 : 1,
        rules: i < 5 ? 1 : i < 10 ? 2 : 3
    }); });
    function dp(level) { return NS.AGE6_DIFFICULTY[NS.clamp(Number(level) || 1, 1, 15) - 1]; }
    function opt(answer, pool, count) { return NS.uniqueOptions(String(answer), pool.map(String), count); }
    function finish(id, level, q, metrics) {
        q = NS.attachDifficulty(q, id, level);
        var p = dp(level);
        q.meta.age6 = true;
        q.meta.age6Load = p.load;
        q.meta.age6Metrics = metrics || {};
        return q;
    }
    function posOptions(n, count, answer) {
        var a = [String(answer)];
        for (var i = 0; i < n && a.length < count; i++)
            if (String(i) !== String(answer))
                a.push(String(i));
        return NS.shuffle(a).map(function (v) { return ({ label: "Posizione ".concat(Number(v) + 1), value: v }); });
    }
    function tokenOptions(answer, pool, count) { return NS.uniqueOptions(answer, pool, count); }
    function qNumberMissing(level) {
        var p = dp(level);
        var seq = [], answer, hint, prompt = 'Qual è il numero successivo?';
        if (level === 1) {
            var s = NS.rnd(1, 6);
            seq = [s, s + 1, s + 2, s + 3];
            answer = s + 4;
            hint = 'Aggiungi 1.';
        }
        else if (level === 2) {
            var s = NS.rnd(0, 6);
            seq = [s, s + 2, s + 4, s + 6];
            answer = s + 8;
            hint = 'Aggiungi 2.';
        }
        else if (level === 3) {
            var s = NS.rnd(0, 5);
            seq = [s, s + 3, s + 6, s + 9, s + 12];
            answer = s + 15;
            hint = 'Aggiungi 3.';
        }
        else if (level === 4) {
            var s = NS.rnd(9, 15);
            seq = [s, s - 1, s - 2, s - 3, s - 4];
            answer = s - 5;
            hint = 'Togli 1.';
        }
        else if (level === 5) {
            var s = NS.rnd(14, 22);
            seq = [s, s - 2, s - 4, s - 6, s - 8];
            answer = s - 10;
            hint = 'Togli 2.';
        }
        else if (level === 6) {
            var s = NS.rnd(1, 5);
            seq = [s, s + 1, s + 3, s + 4, s + 6];
            answer = s + 7;
            hint = 'Gli aumenti sono +1, +2, +1, +2...';
        }
        else if (level === 7) {
            var s = NS.rnd(1, 5);
            seq = [s, s + 2, s + 5, s + 7, s + 10];
            answer = s + 12;
            hint = 'Gli aumenti sono +2, +3, +2, +3...';
        }
        else if (level === 8) {
            var s = NS.rnd(1, 4);
            seq = [s, s + 1, s + 3, s + 6, s + 10];
            answer = s + 15;
            hint = 'Aggiungi 1, poi 2, poi 3, poi 4, poi 5.';
        }
        else if (level === 9) {
            var s = NS.rnd(1, 5), full = [s, s + 2, s + 4, s + 6, s + 8, s + 10], idx_1 = NS.rnd(2, 4);
            answer = full[idx_1];
            seq = full.map(function (x, i) { return i === idx_1 ? '?' : x; });
            prompt = 'Quale numero manca?';
            hint = 'La regola è +2: controlla prima e dopo il buco.';
        }
        else if (level === 10) {
            var s = NS.rnd(1, 4), full = [s, s + 1, s + 3, s + 4, s + 6, s + 7], idx_2 = NS.rnd(2, 4);
            answer = full[idx_2];
            seq = full.map(function (x, i) { return i === idx_2 ? '?' : x; });
            prompt = 'Quale numero manca?';
            hint = 'Alterna +1 e +2.';
        }
        else if (level === 11) {
            var a = NS.rnd(1, 4), b = NS.rnd(7, 11);
            seq = [a, b, a + 1, b + 1, a + 2, b + 2, a + 3];
            answer = b + 3;
            hint = 'Ci sono due sequenze intrecciate: guarda le posizioni pari e dispari.';
        }
        else if (level === 12) {
            var s = NS.rnd(2, 5);
            seq = [s, s + 1, s + 2, s + 4, s + 5, s + 6, s + 8];
            answer = s + 9;
            hint = 'Fai +1, +1, +2 e ripeti.';
        }
        else if (level === 13) {
            var s = NS.rnd(16, 22);
            seq = [s, s - 1, s - 3, s - 4, s - 6, s - 7];
            answer = s - 9;
            hint = 'Togli 1, poi 2, poi 1, poi 2...';
        }
        else if (level === 14) {
            var a = NS.rnd(1, 3), b = NS.rnd(2, 4);
            seq = [a, b, a + b, a + 2 * b, 2 * a + 3 * b];
            answer = 3 * a + 5 * b;
            hint = 'Ogni numero è la somma dei due precedenti.';
        }
        else {
            var a = NS.rnd(1, 3), b = NS.rnd(8, 11);
            seq = [a, b, a + 2, b - 1, a + 4, b - 2, a + 6];
            answer = b - 3;
            hint = 'Due regole insieme: una sequenza sale di 2, l’altra scende di 1.';
        }
        var numeric = seq.filter(function (x) { return x !== '?'; }).map(Number);
        var near = __spreadArray([answer - 3, answer - 2, answer - 1, answer + 1, answer + 2, answer + 3], __read(numeric), false).filter(function (x) { return x >= 0; });
        return finish(1, level, { prompt: prompt, visual: "<div class=\"bigVisual\">".concat(seq.join(' · ')).concat(prompt.includes('successivo') ? ' · ?' : '', "</div>"), options: opt(answer, near, p.choices), answer: String(answer), hint: hint }, { sequenceLength: seq.length, rules: p.rules, choices: p.choices });
    }
    function qOdd(level) {
        var p = dp(level);
        var arr = [], idx = 0, hint = 'Confronta con calma tutti gli elementi.';
        var n = Math.min(9, 4 + Math.floor((level - 1) / 2));
        if (level <= 2) {
            var normal_1 = NS.pick(COLORS), odd = NS.pick(COLORS.filter(function (x) { return x !== normal_1; }));
            arr = Array(n).fill(normal_1);
            idx = NS.rnd(0, n - 1);
            arr[idx] = odd;
            hint = 'Cerca il colore diverso.';
        }
        else if (level <= 4) {
            var normal_2 = NS.pick(SHAPES), odd = NS.pick(SHAPES.filter(function (x) { return x !== normal_2; }));
            arr = Array(n).fill(normal_2);
            idx = NS.rnd(0, n - 1);
            arr[idx] = odd;
            hint = 'Cerca la forma diversa.';
        }
        else if (level <= 6) {
            var normal_3 = NS.pick(ARROWS), odd = NS.pick(ARROWS.filter(function (x) { return x !== normal_3; }));
            arr = Array(n).fill(normal_3);
            idx = NS.rnd(0, n - 1);
            arr[idx] = odd;
            hint = 'Guarda la direzione.';
        }
        else if (level <= 8) {
            var c = NS.pick(COLORS), s_1 = NS.pick(SHAPES), normal = c + s_1, odd = c + NS.pick(SHAPES.filter(function (x) { return x !== s_1; }));
            arr = Array(n).fill(normal);
            idx = NS.rnd(0, n - 1);
            arr[idx] = odd;
            hint = 'Il colore è uguale: cambia solo la forma.';
        }
        else if (level <= 10) {
            var c_1 = NS.pick(COLORS), s = NS.pick(SHAPES), normal = c_1 + s, odd = NS.pick(COLORS.filter(function (x) { return x !== c_1; })) + s;
            arr = Array(n).fill(normal);
            idx = NS.rnd(0, n - 1);
            arr[idx] = odd;
            hint = 'La forma è uguale: cambia solo il colore.';
        }
        else if (level <= 12) {
            var c = NS.pick(COLORS), s = NS.pick(SHAPES), a_1 = NS.pick(ARROWS), normal = c + s + a_1, odd = c + s + NS.pick(ARROWS.filter(function (x) { return x !== a_1; }));
            arr = Array(n).fill(normal);
            idx = NS.rnd(0, n - 1);
            arr[idx] = odd;
            hint = 'Controlla anche l’orientamento.';
        }
        else if (level <= 14) {
            var pairs = [['🔴', '●'], ['🔵', '▲'], ['🟢', '■'], ['🟡', '◆']], normal = [];
            for (var i = 0; i < n; i++) {
                var z_1 = pairs[i % pairs.length];
                normal.push(z_1[0] + z_1[1]);
            }
            arr = normal.slice();
            idx = NS.rnd(1, n - 2);
            var z = pairs[idx % pairs.length], wrong = pairs[(idx + 1) % pairs.length];
            arr[idx] = z[0] + wrong[1];
            hint = 'Ogni colore ha la sua forma: trova l’abbinamento che rompe la regola.';
        }
        else {
            var specs = [['🔴', '●', '⬆️'], ['🔵', '▲', '➡️'], ['🟢', '■', '⬇️'], ['🟡', '◆', '⬅️']];
            arr = [];
            for (var i = 0; i < n; i++) {
                var z_2 = specs[i % 4];
                arr.push(z_2[0] + z_2[1] + z_2[2]);
            }
            idx = NS.rnd(1, n - 2);
            var z_3 = specs[idx % 4], wrongArrow = NS.pick(ARROWS.filter(function (x) { return x !== z_3[2]; }));
            arr[idx] = z_3[0] + z_3[1] + wrongArrow;
            hint = 'Controlla insieme colore, forma e direzione.';
        }
        return finish(7, level, { prompt: "Qual è l’intruso?", visual: "<div class=\"pieceStrip\">".concat(arr.map(function (x, i) { return "<span><small>".concat(i + 1, "</small>").concat(x, "</span>"); }).join(''), "</div>"), options: posOptions(arr.length, p.choices, idx), answer: String(idx), hint: hint }, { items: arr.length, features: level <= 6 ? 1 : level <= 10 ? 2 : 3, choices: p.choices });
    }
    function qFigureSequence(level) {
        var p = dp(level);
        var seq, answer, hint, pool = __spreadArray(__spreadArray(__spreadArray([], __read(COLORS), false), __read(SHAPES), false), __read(ARROWS), false);
        var a = NS.pick(COLORS), b = NS.pick(COLORS.filter(function (x) { return x !== a; })), c = NS.pick(COLORS.filter(function (x) { return x !== a && x !== b; }));
        var s1 = NS.pick(SHAPES), s2 = NS.pick(SHAPES.filter(function (x) { return x !== s1; })), s3 = NS.pick(SHAPES.filter(function (x) { return x !== s1 && x !== s2; }));
        if (level === 1) {
            seq = [a, b, a, b];
            answer = a;
            hint = 'Alterna due colori.';
        }
        else if (level === 2) {
            seq = [a, a, b, a, a, b];
            answer = a;
            hint = 'Due uguali, poi uno diverso.';
        }
        else if (level === 3) {
            seq = [a, b, c, a, b];
            answer = c;
            hint = 'Ripeti tre colori nello stesso ordine.';
        }
        else if (level === 4) {
            seq = [s1, s2, s1, s2, s1];
            answer = s2;
            hint = 'Alterna due forme.';
        }
        else if (level === 5) {
            seq = [s1, s1, s2, s1, s1, s2, s1];
            answer = s1;
            hint = 'Due forme uguali, poi una diversa.';
        }
        else if (level === 6) {
            seq = ['⬆️', '➡️', '⬇️', '⬅️', '⬆️'];
            answer = '➡️';
            hint = 'La freccia gira di 90°.';
        }
        else if (level === 7) {
            seq = [a + s1, b + s1, a + s2, b + s2, a + s1];
            answer = b + s1;
            pool = COLORS.flatMap(function (x) { return [x + s1, x + s2]; });
            hint = 'Colore e forma cambiano con due ritmi diversi.';
        }
        else if (level === 8) {
            seq = [s1, s2, s2, s1, s2, s2, s1];
            answer = s2;
            hint = 'Un elemento, poi due uguali.';
        }
        else if (level === 9) {
            seq = [a + s1, a + s2, b + s1, b + s2, a + s1];
            answer = a + s2;
            pool = [a + s1, a + s2, b + s1, b + s2, c + s1, c + s2];
            hint = 'Ogni colore compare con entrambe le forme.';
        }
        else if (level === 10) {
            seq = [a, b, c, b, a, b, c];
            answer = b;
            hint = 'Il gruppo è simmetrico: A-B-C-B.';
        }
        else if (level === 11) {
            seq = [a + '⬆️', b + '➡️', a + '⬇️', b + '⬅️', a + '⬆️'];
            answer = b + '➡️';
            pool = COLORS.flatMap(function (x) { return ARROWS.map(function (r) { return x + r; }); });
            hint = 'Il colore alterna, la freccia ruota.';
        }
        else if (level === 12) {
            seq = [s1, a, s2, b, s3, c, s1];
            answer = a;
            pool = __spreadArray(__spreadArray([], __read(COLORS), false), __read(SHAPES), false);
            hint = 'Due sequenze sono intrecciate: forme nelle posizioni dispari, colori nelle pari.';
        }
        else if (level === 13) {
            seq = [a + s1, b + s2, c + s3, a + s1, b + s2];
            answer = c + s3;
            pool = [a + s1, b + s2, c + s3, a + s2, b + s3, c + s1];
            hint = 'Ripeti tre coppie colore-forma.';
        }
        else if (level === 14) {
            seq = [a + '⬆️', a + '➡️', b + '⬇️', b + '⬅️', c + '⬆️', c + '➡️'];
            answer = a + '⬇️';
            pool = COLORS.flatMap(function (x) { return ARROWS.map(function (r) { return x + r; }); });
            hint = 'Ogni colore dura due caselle; la freccia continua a girare.';
        }
        else {
            seq = [a + s1 + '⬆️', b + s2 + '➡️', c + s3 + '⬇️', a + s1 + '⬅️', b + s2 + '⬆️'];
            answer = c + s3 + '➡️';
            pool = [a + s1 + '➡️', b + s2 + '➡️', c + s3 + '➡️', c + s2 + '➡️', c + s3 + '⬇️'];
            hint = 'Segui insieme tre cicli: colore, forma e direzione.';
        }
        return finish(8, level, { prompt: 'Quale figura viene dopo?', visual: "<div class=\"pieceStrip\">".concat(seq.map(function (x) { return "<span>".concat(x, "</span>"); }).join(''), "<span>?</span></div>"), options: tokenOptions(answer, pool, p.choices), answer: answer, hint: hint }, { sequenceLength: seq.length, features: level <= 6 ? 1 : level <= 10 ? 2 : 3, choices: p.choices });
    }
    function qBlocks(level) {
        var p = dp(level), icon = '🧱';
        var prompt, visual, answer, hint, sub = '';
        if (level === 1) {
            answer = NS.rnd(2, 5);
            prompt = 'Quanti blocchi vedi?';
            visual = "<div class=\"bigVisual\">".concat(icon.repeat(answer), "</div>");
            hint = 'Conta uno alla volta.';
        }
        else if (level === 2) {
            answer = NS.rnd(5, 8);
            prompt = 'Quanti blocchi vedi?';
            visual = "<div class=\"bigVisual\">".concat(icon.repeat(answer), "</div>");
            hint = 'Conta lentamente da sinistra a destra.';
        }
        else if (level === 3) {
            var a = NS.rnd(2, 4), b = NS.rnd(2, 4);
            answer = a + b;
            prompt = 'Quanti blocchi in tutto?';
            visual = "<div class=\"blockGroups\"><div>".concat(icon.repeat(a), "</div><div>").concat(icon.repeat(b), "</div></div>");
            hint = "Somma ".concat(a, " e ").concat(b, ".");
        }
        else if (level === 4) {
            var a = NS.rnd(3, 7), b = a + NS.pick([-2, -1, 1, 2]);
            answer = a > b ? 'A' : 'B';
            prompt = 'Quale gruppo ha più blocchi?';
            visual = "<div class=\"compareGroups\"><div><b>A</b><span>".concat(icon.repeat(a), "</span></div><div><b>B</b><span>").concat(icon.repeat(b), "</span></div></div>");
            return finish(11, level, { prompt: prompt, visual: visual, options: [{ label: 'Gruppo A', value: 'A' }, { label: 'Gruppo B', value: 'B' }], answer: answer, hint: 'Conta i due gruppi e confronta.' }, { groups: 2, operation: 'compare' });
        }
        else if (level === 5) {
            var a = NS.rnd(3, 7), m = NS.rnd(1, 4);
            answer = m;
            prompt = 'Quanti blocchi sono nascosti?';
            visual = "<div class=\"bigVisual\">".concat(icon.repeat(a), " + \u2753 = ").concat(a + m, "</div>");
            hint = "Fai ".concat(a + m, " \u2212 ").concat(a, ".");
        }
        else if (level === 6) {
            var a = NS.rnd(2, 4), b = NS.rnd(2, 4), c = NS.rnd(1, 4);
            answer = a + b + c;
            prompt = 'Quanti blocchi in tre gruppi?';
            visual = "<div class=\"blockGroups\"><div>".concat(icon.repeat(a), "</div><div>").concat(icon.repeat(b), "</div><div>").concat(icon.repeat(c), "</div></div>");
            hint = 'Somma un gruppo alla volta.';
        }
        else if (level === 7) {
            var a = NS.rnd(4, 7), b = NS.rnd(4, 7), over = 1;
            answer = a + b - over;
            prompt = 'Conta senza contare due volte';
            visual = "<div class=\"bigVisual\">".concat(a, " blocchi + ").concat(b, " blocchi \u2212 ").concat(over, " comune</div>");
            hint = 'Un blocco appartiene a entrambi i gruppi.';
        }
        else if (level === 8) {
            var a = NS.rnd(5, 8), b = NS.rnd(5, 8), over = 2;
            answer = a + b - over;
            prompt = 'Conta senza contare due volte';
            visual = "<div class=\"bigVisual\">".concat(a, " + ").concat(b, " \u2212 ").concat(over, " comuni</div>");
            hint = 'Somma e togli i due blocchi contati due volte.';
        }
        else if (level === 9) {
            var a = NS.rnd(7, 11), b = NS.rnd(2, a - 2);
            answer = a - b;
            prompt = 'Quanti blocchi restano?';
            visual = "<div class=\"bigVisual\">".concat(icon.repeat(Math.min(a, 11)), "<br>Ne tolgo ").concat(b, "</div>");
            hint = "Fai ".concat(a, " \u2212 ").concat(b, ".");
        }
        else if (level === 10) {
            var rows = 2, cols = NS.rnd(3, 5);
            answer = rows * cols;
            prompt = 'Quanti blocchi nella griglia?';
            visual = "<div class=\"bigVisual\">".concat((icon.repeat(cols) + '<br>').repeat(rows), "</div>");
            hint = "Conta ".concat(cols, " nella prima riga e altri ").concat(cols, " nella seconda.");
        }
        else if (level === 11) {
            var rows = 3, cols = NS.rnd(2, 4);
            answer = rows * cols;
            prompt = 'Quanti blocchi nella griglia?';
            visual = "<div class=\"bigVisual\">".concat((icon.repeat(cols) + '<br>').repeat(rows), "</div>");
            hint = 'Conta riga per riga e somma.';
        }
        else if (level === 12) {
            var total = NS.rnd(10, 15), visible = NS.rnd(4, total - 3);
            answer = total - visible;
            prompt = 'Quanti blocchi sono coperti?';
            visual = "<div class=\"bigVisual\">".concat(visible, " visibili + \u2753 = ").concat(total, "</div>");
            hint = "Dal totale ".concat(total, " togli i ").concat(visible, " visibili.");
        }
        else if (level === 13) {
            var a = NS.rnd(5, 8), add = NS.rnd(2, 4), take = NS.rnd(1, 3);
            answer = a + add - take;
            prompt = 'Aggiungi e poi togli';
            sub = "Parti da ".concat(a, " blocchi, aggiungine ").concat(add, ", poi togline ").concat(take, ".");
            visual = "<div class=\"bigVisual\">".concat(a, " \uD83E\uDDF1  + ").concat(add, "  \u2212 ").concat(take, "</div>");
            hint = 'Fai un’operazione alla volta.';
        }
        else if (level === 14) {
            var a = NS.rnd(3, 6), b = NS.rnd(3, 6), hidden = NS.rnd(2, 4);
            answer = hidden;
            prompt = 'Trova il gruppo nascosto';
            visual = "<div class=\"bigVisual\">".concat(a, " + \u2753 + ").concat(b, " = ").concat(a + b + hidden, "</div>");
            hint = 'Somma prima i due gruppi visibili, poi confronta con il totale.';
        }
        else {
            var a = NS.rnd(4, 7), b = NS.rnd(3, 6), over = NS.rnd(1, 2), take = NS.rnd(1, 2);
            answer = a + b - over - take;
            prompt = 'Sfida finale dei blocchi';
            sub = "Due gruppi hanno ".concat(over, " in comune, poi togli ").concat(take, " blocco/i.");
            visual = "<div class=\"bigVisual\">".concat(a, " + ").concat(b, " \u2212 ").concat(over, " \u2212 ").concat(take, "</div>");
            hint = 'Somma, elimina i comuni, poi togli gli ultimi blocchi.';
        }
        return finish(11, level, { prompt: prompt, sub: sub, visual: visual, options: opt(answer, [answer - 3, answer - 2, answer - 1, answer + 1, answer + 2, answer + 3].filter(function (x) { return x >= 0; }), p.choices), answer: String(answer), hint: hint }, { steps: level <= 5 ? 1 : level <= 12 ? 2 : 3, choices: p.choices });
    }
    function qMemory(level) {
        var p = dp(level), count = Math.min(11, 3 + Math.floor((level + 1) / 2)), icons = NS.shuffle(OBJECTS).slice(0, count), delay = p.memoryDelayMs, id = 'mem6_' + Math.random().toString(36).slice(2);
        if (level <= 10) {
            var pos_1 = level <= 4 ? NS.rnd(0, Math.min(2, count - 1)) : NS.rnd(0, count - 1), answer_1 = icons[pos_1];
            return finish(14, level, { prompt: 'Memorizza la sequenza!', sub: "Tra poco ti chieder\u00F2 cosa c\u2019era in posizione ".concat(pos_1 + 1, "."), visual: "<div class=\"bigVisual\" id=\"".concat(id, "\">").concat(icons.join(' '), "</div>"), options: NS.uniqueOptions(answer_1, OBJECTS, p.choices), answer: answer_1, hint: 'Guarda la sequenza da sinistra a destra.', afterRender: function () { var opts = document.querySelector('.options'), el = document.getElementById(id); if (!el)
                    return; if (opts) {
                    opts.style.visibility = 'hidden';
                    opts.style.pointerEvents = 'none';
                } setTimeout(function () { if (!document.getElementById(id))
                    return; el.textContent = '❓ '.repeat(Math.min(icons.length, 10)); var h = document.querySelector('.question h3'); if (h)
                    h.textContent = "Cosa c\u2019era in posizione ".concat(pos_1 + 1, "?"); if (opts) {
                    opts.style.visibility = 'visible';
                    opts.style.pointerEvents = 'auto';
                } }, delay); } }, { items: count, delayMs: delay, targetCount: 1, choices: p.choices });
        }
        var pos = NS.rnd(0, count - 2), answer = icons[pos] + icons[pos + 1], pairs = [answer];
        while (pairs.length < p.choices) {
            var i = NS.rnd(0, count - 2), x = icons[i] + icons[i + 1];
            if (!pairs.includes(x))
                pairs.push(x);
            else {
                var x2 = NS.pick(OBJECTS) + NS.pick(OBJECTS);
                if (!pairs.includes(x2))
                    pairs.push(x2);
            }
        }
        return finish(14, level, { prompt: 'Memorizza la sequenza!', sub: "Ricorda le due immagini in posizione ".concat(pos + 1, " e ").concat(pos + 2, "."), visual: "<div class=\"bigVisual\" id=\"".concat(id, "\">").concat(icons.join(' '), "</div>"), options: NS.shuffle(pairs), answer: answer, hint: 'Dividi mentalmente la fila in piccoli gruppi.', afterRender: function () { var opts = document.querySelector('.options'), el = document.getElementById(id); if (!el)
                return; if (opts) {
                opts.style.visibility = 'hidden';
                opts.style.pointerEvents = 'none';
            } setTimeout(function () { if (!document.getElementById(id))
                return; el.textContent = '❓ '.repeat(Math.min(icons.length, 10)); var h = document.querySelector('.question h3'); if (h)
                h.textContent = "Quale coppia era in posizione ".concat(pos + 1, "-").concat(pos + 2, "?"); if (opts) {
                opts.style.visibility = 'visible';
                opts.style.pointerEvents = 'auto';
            } }, delay); } }, { items: count, delayMs: delay, targetCount: 2, choices: p.choices });
    }
    function englishPool(word, level, count) {
        var pool = NS.WORDS.filter(function (x) { return x.en !== word.en && x.lvl <= Math.min(4, 1 + Math.floor(level / 4)); });
        if (level >= 7) {
            var same = pool.filter(function (x) { return x.cat === word.cat; });
            if (same.length >= count)
                pool = same;
        }
        return NS.shuffle(pool).slice(0, count);
    }
    function qPicture(level, state) {
        var p = dp(level), wordLevel = Math.min(4, 1 + Math.floor((level - 1) / 4)), w = NS.selectEnglishWord(state, wordLevel * 3), others = englishPool(w, level, 6), choices = __spreadArray([w], __read(others), false).slice(0, p.choices);
        if (level <= 5) {
            var showItalian = level <= 3;
            return finish(16, level, { word: w, custom: "<button class=\"speak\" onclick=\"LogicLand.speakLine('".concat(NS.escapeHtml(w.en), "','en-GB')\">\uD83D\uDD0A Ascolta la parola</button>"), prompt: "Come si dice ".concat(w.emoji, " in inglese?"), sub: showItalian ? "In italiano: ".concat(w.it) : 'Scegli la parola inglese corretta.', options: NS.shuffle(choices).map(function (x) { return ({ label: x.en.toUpperCase(), value: x.en }); }), answer: w.en, answerLabel: w.en.toUpperCase(), hint: level <= 2 ? "Inizia con \u201C".concat(w.en[0].toUpperCase(), "\u201D.") : 'Guarda bene l’immagine.' }, { choices: p.choices, vocabBand: wordLevel, hints: showItalian ? 2 : 1 });
        }
        if (level <= 10) {
            return finish(16, level, { word: w, custom: "<button class=\"speak\" onclick=\"LogicLand.speakLine('".concat(NS.escapeHtml(w.en), "','en-GB')\">\uD83D\uDD0A Ascolta la parola</button>"), prompt: "Quale immagine significa \u201C".concat(w.en.toUpperCase(), "\u201D?"), sub: level <= 7 ? "Categoria: ".concat(w.cat) : '', options: NS.shuffle(choices).map(function (x) { return ({ label: "".concat(x.emoji).concat(level <= 7 ? '<br><small>' + x.it + '</small>' : ''), value: x.en }); }), answer: w.en, answerLabel: "".concat(w.emoji, " ").concat(w.it), hint: level <= 7 ? 'Usa anche la categoria.' : 'Ricorda la coppia parola-immagine.' }, { choices: p.choices, vocabBand: wordLevel, reverse: 1 });
        }
        var same = NS.WORDS.filter(function (x) { return x.en !== w.en && x.cat === w.cat && x.lvl <= 4; }), hardOthers = NS.shuffle(same.length >= 3 ? same : others).slice(0, p.choices - 1);
        return finish(16, level, { word: w, custom: "<button class=\"speak\" onclick=\"LogicLand.speakLine('".concat(NS.escapeHtml(w.en), "','en-GB')\">\uD83D\uDD0A Ascolta la parola</button>"), prompt: 'Scegli l’immagine corretta', sub: "Parola: ".concat(w.en.toUpperCase()).concat(level <= 12 ? ' • categoria ' + w.cat : ''), options: NS.shuffle(__spreadArray([w], __read(hardOthers), false)).map(function (x) { return ({ label: x.emoji, value: x.en }); }), answer: w.en, answerLabel: "".concat(w.en.toUpperCase(), " = ").concat(w.it), hint: level <= 12 ? 'Pensa alla categoria.' : 'Nessun indizio: richiama la parola dalla memoria.' }, { choices: p.choices, vocabBand: wordLevel, sameCategoryDistractors: hardOthers.filter(function (x) { return x.cat === w.cat; }).length });
    }
    function qMissingPiece(level) {
        var p = dp(level);
        var pattern, answer, hint, pool = __spreadArray(__spreadArray(__spreadArray([], __read(COLORS), false), __read(SHAPES), false), __read(ARROWS), false);
        var a = NS.pick(COLORS), b = NS.pick(COLORS.filter(function (x) { return x !== a; })), c = NS.pick(COLORS.filter(function (x) { return x !== a && x !== b; }));
        var s1 = NS.pick(SHAPES), s2 = NS.pick(SHAPES.filter(function (x) { return x !== s1; }));
        if (level === 1)
            pattern = [a, b, a, b, a, b];
        else if (level === 2)
            pattern = [a, a, b, a, a, b, a, a];
        else if (level === 3)
            pattern = [a, b, c, a, b, c, a, b];
        else if (level === 4)
            pattern = [s1, s2, s1, s2, s1, s2];
        else if (level === 5)
            pattern = [s1, s1, s2, s1, s1, s2, s1, s1];
        else if (level === 6)
            pattern = ['⬆️', '➡️', '⬇️', '⬅️', '⬆️', '➡️', '⬇️'];
        else if (level === 7) {
            pattern = [a + s1, b + s1, a + s2, b + s2, a + s1, b + s1];
            pool = [a + s1, b + s1, a + s2, b + s2, c + s1, c + s2];
        }
        else if (level === 8) {
            pattern = [a, b, b, a, b, b, a, b, b];
        }
        else if (level === 9) {
            pattern = [a + s1, a + s2, b + s1, b + s2, a + s1, a + s2];
            pool = [a + s1, a + s2, b + s1, b + s2, c + s1, c + s2];
        }
        else if (level === 10) {
            pattern = [a, b, c, b, a, b, c, b, a];
        }
        else if (level === 11) {
            pattern = [a + '⬆️', b + '➡️', a + '⬇️', b + '⬅️', a + '⬆️', b + '➡️'];
            pool = COLORS.flatMap(function (x) { return ARROWS.map(function (r) { return x + r; }); });
        }
        else if (level === 12) {
            pattern = [s1, a, s2, b, s1, c, s2, a];
            pool = __spreadArray(__spreadArray([], __read(COLORS), false), __read(SHAPES), false);
        }
        else if (level === 13) {
            pattern = [a + s1, b + s2, a + s1, b + s2, a + s1, b + s2, a + s1];
            pool = [a + s1, b + s2, a + s2, b + s1, c + s1, c + s2];
        }
        else if (level === 14) {
            pattern = [a + '⬆️', a + '➡️', b + '⬇️', b + '⬅️', c + '⬆️', c + '➡️', a + '⬇️'];
            pool = COLORS.flatMap(function (x) { return ARROWS.map(function (r) { return x + r; }); });
        }
        else {
            pattern = [a + s1 + '⬆️', b + s2 + '➡️', c + s1 + '⬇️', a + s2 + '⬅️', b + s1 + '⬆️', c + s2 + '➡️'];
            pool = [a + s1 + '⬆️', a + s2 + '⬅️', b + s1 + '⬆️', b + s2 + '➡️', c + s1 + '⬇️', c + s2 + '➡️'];
        }
        var idx;
        if (level <= 4)
            idx = pattern.length - 2;
        else if (level <= 9)
            idx = NS.rnd(1, pattern.length - 2);
        else
            idx = NS.rnd(2, pattern.length - 3);
        answer = pattern[idx];
        var shown = pattern.map(function (x, i) { return i === idx ? '❓' : x; });
        hint = level <= 4 ? 'Cerca il gruppo che si ripete.' : level <= 9 ? 'Controlla cosa viene prima e dopo il buco.' : 'Separa le caratteristiche: colore, forma e direzione.';
        return finish(21, level, { prompt: 'Quale pezzo manca?', visual: "<div class=\"pieceStrip\">".concat(shown.map(function (x) { return "<span>".concat(x, "</span>"); }).join(''), "</div>"), options: tokenOptions(answer, pool, p.choices), answer: answer, hint: hint }, { patternLength: pattern.length, internalGap: idx < pattern.length - 2 ? 1 : 0, features: level <= 6 ? 1 : level <= 10 ? 2 : 3, choices: p.choices });
    }
    function qCount(level) {
        var p = dp(level), icon = NS.pick(OBJECTS.slice(0, 8));
        var prompt, visual, answer, hint;
        if (level <= 3) {
            var max = [5, 8, 10][level - 1], n = NS.rnd(Math.max(2, max - 3), max);
            answer = n;
            prompt = 'Quanti oggetti vedi?';
            visual = "<div class=\"bigVisual countVisual\">".concat(icon.repeat(n), "</div>");
            hint = 'Conta uno alla volta.';
        }
        else if (level <= 5) {
            var a = NS.rnd(3, 8 + level), delta = level === 4 ? NS.pick([-3, -2, 2, 3]) : NS.pick([-2, -1, 1, 2]), b = Math.max(1, a + delta);
            answer = a > b ? 'A' : 'B';
            return finish(31, level, { prompt: 'Quale gruppo contiene più oggetti?', visual: "<div class=\"compareGroups\"><div><b>A</b><span>".concat(icon.repeat(Math.min(a, 14)), "</span></div><div><b>B</b><span>").concat(icon.repeat(Math.min(b, 14)), "</span></div></div>"), options: [{ label: 'Gruppo A', value: 'A' }, { label: 'Gruppo B', value: 'B' }], answer: answer, hint: 'Conta e confronta.' }, { groups: 2, closeness: Math.abs(a - b) });
        }
        else if (level <= 7) {
            var a = NS.rnd(3, 6), b = NS.rnd(2, 6);
            answer = a + b;
            prompt = 'Quanti oggetti in tutto?';
            visual = "<div class=\"blockGroups\"><div>".concat(icon.repeat(a), "</div><div>").concat(icon.repeat(b), "</div></div>");
            hint = 'Somma i due gruppi.';
        }
        else if (level <= 9) {
            var known = NS.rnd(4, 9), missing = NS.rnd(2, level === 8 ? 4 : 6), total = known + missing;
            answer = missing;
            prompt = 'Quanti oggetti sono nascosti?';
            visual = "<div class=\"bigVisual\">".concat(icon.repeat(Math.min(known, 10)), " + \u2753 = ").concat(total, "</div>");
            hint = "Fai ".concat(total, " \u2212 ").concat(known, ".");
        }
        else if (level <= 11) {
            var groups = level === 10 ? 2 : 3, each_1 = NS.rnd(2, 4);
            answer = groups * each_1;
            prompt = 'Conta i gruppi uguali';
            visual = "<div class=\"blockGroups\">".concat(Array.from({ length: groups }, function () { return "<div>".concat(icon.repeat(each_1), "</div>"); }).join(''), "</div>");
            hint = 'Conta un gruppo e aggiungi la stessa quantità per ogni gruppo.';
        }
        else if (level <= 13) {
            var total = NS.rnd(10, 16), take = NS.rnd(2, 5);
            answer = total - take;
            prompt = 'Quanti ne restano?';
            visual = "<div class=\"bigVisual\">".concat(total, " ").concat(icon, " \u2212 ").concat(take, "</div>");
            hint = 'Togli gli oggetti indicati dal totale.';
        }
        else if (level === 14) {
            var a = NS.rnd(4, 7), b = NS.rnd(3, 6), take = NS.rnd(1, 3);
            answer = a + b - take;
            prompt = 'Conta in due passaggi';
            visual = "<div class=\"bigVisual\">".concat(a, " + ").concat(b, " \u2212 ").concat(take, "</div>");
            hint = 'Prima somma i due gruppi, poi togli.';
        }
        else {
            var known = NS.rnd(5, 9), add = NS.rnd(2, 5), remove = NS.rnd(1, Math.min(4, known + add - 1)), final = known + add - remove;
            answer = remove;
            prompt = 'Sfida delle quantità';
            visual = "<div class=\"bigVisual\">".concat(known, " + ").concat(add, " \u2212 \u2753 = ").concat(final, "</div>");
            hint = 'Prima calcola quanto avresti, poi trova quanti sono stati tolti.';
        }
        return finish(31, level, { prompt: prompt, visual: visual, options: opt(answer, [answer - 3, answer - 2, answer - 1, answer + 1, answer + 2, answer + 3].filter(function (x) { return x >= 0; }), p.choices), answer: String(answer), hint: hint }, { steps: level <= 7 ? 1 : level <= 13 ? 2 : 3, choices: p.choices });
    }
    function qShadow(level) {
        var p = dp(level), count = level <= 3 ? 1 : level <= 8 ? 2 : level <= 12 ? 3 : 4, base = NS.shuffle(SHAPES).slice(0, count), answer = base.map(function (x) { return OUTLINE[x]; }).join(''), wrong = [];
        var reversed = base.slice().reverse().map(function (x) { return OUTLINE[x]; }).join('');
        if (reversed !== answer)
            wrong.push(reversed);
        var needed = Math.max(1, p.choices - 1);
        var attempts = 0;
        var _loop_1 = function () {
            var candidate = void 0;
            if (level <= 5)
                candidate = NS.shuffle(SHAPES).slice(0, count).map(function (s) { return OUTLINE[s]; }).join('');
            else {
                var x_1 = base.slice();
                x_1[NS.rnd(0, x_1.length - 1)] = NS.pick(SHAPES.filter(function (s) { return !x_1.includes(s); }));
                candidate = x_1.map(function (s) { return OUTLINE[s]; }).join('');
            }
            if (candidate !== answer && !wrong.includes(candidate))
                wrong.push(candidate);
        };
        while (wrong.length < needed && attempts++ < 80) {
            _loop_1();
        }
        return finish(32, level, { prompt: 'Qual è l’ombra corretta?', sub: count === 1 ? 'Abbina la figura alla sua sagoma.' : 'Mantieni forma e ordine di tutti i pezzi.', visual: "<div class=\"bigVisual\">".concat(base.join(''), " \u2192 ?</div>"), options: tokenOptions(answer, wrong, p.choices), answer: answer, hint: level <= 5 ? 'L’ombra cambia il riempimento, non la forma.' : 'Controlla anche l’ordine dei pezzi.' }, { pieces: count, choices: p.choices, nearDistractors: level >= 6 ? 1 : 0 });
    }
    function qTwins(level) {
        var _a;
        var p = dp(level), n = Math.min(11, 4 + Math.floor((level - 1) / 2));
        var pool;
        if (level <= 4)
            pool = COLORS.slice();
        else if (level <= 8)
            pool = COLORS.flatMap(function (c) { return SHAPES.slice(0, 3).map(function (s) { return c + s; }); });
        else if (level <= 12)
            pool = COLORS.slice(0, 4).flatMap(function (c) { return SHAPES.slice(0, 4).map(function (s) { return c + s; }); });
        else
            pool = COLORS.slice(0, 4).flatMap(function (c) { return SHAPES.slice(0, 3).flatMap(function (s) { return ARROWS.map(function (a) { return c + s + a; }); }); });
        var token = NS.pick(pool), arr = [], used = new Set([token]);
        while (arr.length < n - 2) {
            var x = NS.pick(pool);
            if (!used.has(x)) {
                used.add(x);
                arr.push(x);
            }
        }
        var i = NS.rnd(0, n - 2), j = NS.rnd(i + 1, n - 1);
        arr.splice(i, 0, token);
        arr.splice(j, 0, token);
        var answer = "".concat(i + 1, "-").concat(j + 1), pairs = [answer];
        while (pairs.length < p.choices) {
            var a = NS.rnd(1, n), b = NS.rnd(1, n);
            if (a === b)
                continue;
            if (a > b)
                _a = __read([b, a], 2), a = _a[0], b = _a[1];
            var z = "".concat(a, "-").concat(b);
            if (!pairs.includes(z))
                pairs.push(z);
        }
        return finish(33, level, { prompt: 'Dove sono le due figure gemelle?', visual: "<div class=\"pieceStrip\">".concat(arr.map(function (x, k) { return "<span><small>".concat(k + 1, "</small>").concat(x, "</span>"); }).join(''), "</div>"), options: NS.shuffle(pairs).map(function (x) { return ({ label: "Pezzi ".concat(x.replace('-', ' e ')), value: x }); }), answer: answer, hint: level <= 4 ? 'Cerca due colori identici.' : level <= 8 ? 'Devono avere stesso colore e stessa forma.' : 'Controlla ogni dettaglio.' }, { items: n, features: level <= 4 ? 1 : level <= 12 ? 2 : 3, choices: p.choices });
    }
    function qFirstEnglish(level, state) {
        var p = dp(level), wordBand = Math.min(8, Math.max(1, NS.levelBand(level))), w = NS.selectEnglishWord(state, level), others = englishPool(w, level, 10), choices = __spreadArray([w], __read(others), false).slice(0, p.choices);
        var sound = function (text, label) { return "<button class=\"speak\" onclick=\"LogicLand.speakLine('".concat(NS.escapeHtml(text), "','en-GB')\">\uD83D\uDD0A ").concat(label || 'Audio', "</button>"); };
        if (level <= 4)
            return finish(34, level, { word: w, prompt: "Come si dice \u201C".concat(w.it, "\u201D in inglese?"), visual: "<div class=\"bigVisual\">".concat(w.emoji, "</div>"), custom: sound(w.en, 'Ascolta la parola'), options: NS.shuffle(choices).map(function (x) { return ({ label: x.en.toUpperCase(), value: x.en }); }), answer: w.en, answerLabel: w.en.toUpperCase(), hint: level <= 2 ? "Inizia con ".concat(w.en[0].toUpperCase(), ".") : 'Guarda l’immagine.' }, { choices: p.choices, vocabBand: wordBand });
        if (level <= 8)
            return finish(34, level, { word: w, prompt: "Cosa significa \u201C".concat(w.en.toUpperCase(), "\u201D?"), visual: level <= 6 ? "<div class=\"bigVisual\">".concat(w.emoji, "</div>") : '', custom: sound(w.en, 'Ascolta la parola'), options: NS.shuffle(choices).map(function (x) { return ({ label: x.it, value: x.en }); }), answer: w.en, answerLabel: w.it, hint: level <= 6 ? 'Usa anche l’immagine.' : 'Richiama la parola dalla memoria.' }, { choices: p.choices, vocabBand: wordBand, translationDirection: 1 });
        if (level <= 11) {
            var same_1 = NS.WORDS.filter(function (x) { return x.cat === w.cat && x.en !== w.en && x.lvl <= Math.min(8, w.lvl + 1); }), mate = NS.pick(same_1.length ? same_1 : others);
            var wrong = others.filter(function (x) { return x.cat !== w.cat; });
            return finish(34, level, { word: w, prompt: 'Quale parola appartiene alla stessa famiglia?', sub: "".concat(w.en.toUpperCase(), " = ").concat(w.it, " \u2022 ").concat(w.cefr || 'A1'), custom: sound(w.en, 'Ascolta la parola'), options: NS.shuffle(__spreadArray([mate], __read(wrong), false).slice(0, p.choices)).map(function (x) { return ({ label: x.en.toUpperCase(), value: x.en }); }), answer: mate.en, answerLabel: mate.en.toUpperCase(), hint: "Pensa alla categoria \u201C".concat(w.cat, "\u201D.") }, { choices: p.choices, categorical: 1 });
        }
        var same = NS.WORDS.filter(function (x) { return x.cat === w.cat && x.en !== w.en && x.lvl <= Math.min(8, w.lvl + 1); }), group = NS.shuffle(__spreadArray([w], __read(same), false)).slice(0, 3), intruder = NS.pick(NS.WORDS.filter(function (x) { return x.cat !== w.cat && x.lvl <= Math.min(8, wordBand); })), arr = NS.shuffle(__spreadArray(__spreadArray([], __read(group), false), [intruder], false));
        return finish(34, level, { word: w, prompt: 'Quale parola inglese è l’intrusa?', sub: level <= 13 ? "Tre parole appartengono alla categoria \u201C".concat(w.cat, "\u201D.") : "Trova da sola la categoria comune. Livello ".concat(w.cefr || 'A1', "\u2013B1."), custom: sound(arr.map(function (x) { return x.en; }).join(' , '), 'Ascolta le parole'), options: arr.map(function (x) { return ({ label: "".concat(x.en.toUpperCase(), "<br><small>").concat(x.cefr || '', "</small>"), value: x.en }); }), answer: intruder.en, answerLabel: intruder.en.toUpperCase(), hint: level <= 13 ? 'Traduci le parole e usa la categoria.' : 'Traduci tutte le parole prima di scegliere.' }, { choices: 4, categorical: 2 });
    }
    function qDomino(level) {
        var p = dp(level), a = NS.pick(COLORS), b = NS.pick(COLORS.filter(function (x) { return x !== a; })), c = NS.pick(COLORS.filter(function (x) { return x !== a && x !== b; })), d = NS.pick(COLORS.filter(function (x) { return ![a, b, c].includes(x); }));
        var seq, answer, hint;
        if (level === 1) {
            seq = [a, b, a, b];
            answer = a;
            hint = 'Alterna due colori.';
        }
        else if (level === 2) {
            seq = [a, a, b, a, a, b];
            answer = a;
            hint = 'Due uguali, poi uno diverso.';
        }
        else if (level === 3) {
            seq = [a, b, c, a, b];
            answer = c;
            hint = 'Ripeti tre colori.';
        }
        else if (level === 4) {
            seq = [a, a, b, b, a, a];
            answer = b;
            hint = 'Due A, due B.';
        }
        else if (level === 5) {
            seq = [a, b, b, a, b, b, a];
            answer = b;
            hint = 'Un A e due B.';
        }
        else if (level === 6) {
            seq = [a, b, c, c, b, a, a];
            answer = b;
            hint = 'Il gruppo va avanti e poi torna indietro.';
        }
        else if (level === 7) {
            seq = [a, b, c, a, b, c, a];
            answer = b;
            hint = 'Ripeti A-B-C.';
        }
        else if (level === 8) {
            seq = [a, a, b, c, a, a, b];
            answer = c;
            hint = 'Ripeti A-A-B-C.';
        }
        else if (level === 9) {
            seq = [a, b, b, c, c, a, a, b];
            answer = b;
            hint = 'Ogni colore compare due volte, ma il primo inizia singolo.';
        }
        else if (level === 10) {
            seq = [a, b, c, d, a, b, c];
            answer = d;
            hint = 'Ripeti quattro colori.';
        }
        else if (level === 11) {
            seq = [a, b, c, b, a, b, c];
            answer = b;
            hint = 'Ripeti A-B-C-B.';
        }
        else if (level === 12) {
            seq = [a, a, b, b, c, c, a, a, b];
            answer = b;
            hint = 'Ogni colore compare due volte.';
        }
        else if (level === 13) {
            seq = [a, b, c, d, b, c, d, a, c, d, a];
            answer = b;
            hint = 'Ogni blocco parte dal colore successivo.';
        }
        else if (level === 14) {
            seq = [a, b, a, c, a, d, a, b, a, c];
            answer = a;
            hint = 'Un colore fisso si alterna con B-C-D.';
        }
        else {
            seq = [a, b, c, b, d, b, a, c, b, d, c, b];
            answer = a;
            hint = 'Segui due trame intrecciate: una cambia posizione per posizione, l’altra ogni due.';
        }
        return finish(35, level, { prompt: 'Quale tessera continua il domino?', visual: "<div class=\"bigVisual\">".concat(seq.join(' '), " ?</div>"), options: tokenOptions(answer, COLORS, p.choices), answer: answer, hint: hint }, { sequenceLength: seq.length, rules: p.rules, choices: p.choices });
    }
    Object.assign(NS.MathGames, { 1: qNumberMissing, 7: qOdd, 31: qCount });
    Object.assign(NS.VisualGames, { 8: qFigureSequence, 11: qBlocks, 14: qMemory, 21: qMissingPiece, 32: qShadow, 33: qTwins, 35: qDomino });
    Object.assign(NS.EnglishGames, { 16: qPicture, 34: qFirstEnglish });
    // v8.3: puzzles are generated from a valid completed Sudoku.  Each level
    // removes EXACTLY one extra clue (L1=2 gaps, ..., L15=16 gaps); only
    // removals that preserve a unique full solution are accepted.
    NS.MathGames[5] = function (level) {
        var e_1, _a;
        var n = level <= 4 ? 4 : 6, bw = n === 4 ? 2 : 3, bh = 2;
        var grid = Array.from({ length: n }, function (_, r) { return Array.from({ length: n }, function (_, c) { return ((r * bw + Math.floor(r / bh) + c) % n) + 1; }); });
        var mask = Array.from({ length: n }, function () { return Array(n).fill(false); });
        var target = 1 + level;
        function solutions() {
            var b = grid.map(function (row, r) { return row.map(function (v, c) { return mask[r][c] ? 0 : v; }); });
            var count = 0;
            function rec() {
                var e_2, _a;
                if (count >= 2)
                    return;
                var best = null, available = null;
                for (var r = 0; r < n; r++) {
                    var _loop_2 = function (c) {
                        if (!b[r][c]) {
                            var poss = [];
                            var _loop_3 = function (v) {
                                if (b[r].includes(v))
                                    return "continue";
                                if (b.some(function (row) { return row[c] === v; }))
                                    return "continue";
                                var boxHas = false;
                                for (var y = Math.floor(r / bh) * bh; y < Math.floor(r / bh) * bh + bh; y++)
                                    for (var x = Math.floor(c / bw) * bw; x < Math.floor(c / bw) * bw + bw; x++)
                                        if (b[y][x] === v)
                                            boxHas = true;
                                if (!boxHas)
                                    poss.push(v);
                            };
                            for (var v = 1; v <= n; v++) {
                                _loop_3(v);
                            }
                            if (!poss.length)
                                return { value: void 0 };
                            if (!best || poss.length < available.length) {
                                best = [r, c];
                                available = poss;
                            }
                        }
                    };
                    for (var c = 0; c < n; c++) {
                        var state_1 = _loop_2(c);
                        if (typeof state_1 === "object")
                            return state_1.value;
                    }
                }
                if (!best) {
                    count++;
                    return;
                }
                try {
                    for (var available_1 = __values(available), available_1_1 = available_1.next(); !available_1_1.done; available_1_1 = available_1.next()) {
                        var v = available_1_1.value;
                        b[best[0]][best[1]] = v;
                        rec();
                        b[best[0]][best[1]] = 0;
                        if (count >= 2)
                            return;
                    }
                }
                catch (e_2_1) { e_2 = { error: e_2_1 }; }
                finally {
                    try {
                        if (available_1_1 && !available_1_1.done && (_a = available_1.return)) _a.call(available_1);
                    }
                    finally { if (e_2) throw e_2.error; }
                }
            }
            rec();
            return count;
        }
        var coords = NS.shuffle(Array.from({ length: n * n }, function (_, i) { return [Math.floor(i / n), i % n]; }));
        var hidden = 0;
        try {
            for (var coords_1 = __values(coords), coords_1_1 = coords_1.next(); !coords_1_1.done; coords_1_1 = coords_1.next()) {
                var _b = __read(coords_1_1.value, 2), r = _b[0], c = _b[1];
                if (hidden >= target)
                    break;
                mask[r][c] = true;
                if (solutions() === 1)
                    hidden++;
                else
                    mask[r][c] = false;
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (coords_1_1 && !coords_1_1.done && (_a = coords_1.return)) _a.call(coords_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        if (hidden < target)
            throw new Error('Sudoku: cannot reach unique ' + target + ' gaps');
        var empty = coords.filter(function (_a) {
            var _b = __read(_a, 2), r = _b[0], c = _b[1];
            return mask[r][c];
        });
        var _c = __read(NS.pick(empty), 2), tr = _c[0], tc = _c[1], answer = grid[tr][tc];
        var visual = '<div class="sudokuPlay" style="grid-template-columns:repeat(' + n + ',1fr);max-width:' + (n * 55) + 'px">';
        for (var r = 0; r < n; r++)
            for (var c = 0; c < n; c++)
                visual += '<div class="sudokuTile ' + (r === tr && c === tc ? 'sudokuTarget' : '') + '" style="font-size:' + (n === 6 ? 19 : 26) + 'px;width:' + (100 / n) + '%;height:' + (100 / n) + '%">' + (r === tr && c === tc ? '?' : mask[r][c] ? '·' : grid[r][c]) + '</div>';
        visual += '</div>';
        return finish(5, level, { prompt: 'Sudoku: quale numero manca nella casella dorata?', sub: 'Griglia ' + n + '×' + n + ' · ' + hidden + ' caselle vuote. Ogni numero compare una volta per riga, colonna e riquadro.', visual: visual, options: NS.shuffle(Array.from({ length: n }, function (_, i) { return String(i + 1); })), answer: String(answer), hint: 'Controlla insieme riga, colonna e riquadro.' }, { size: n, holes: hidden, uniqueSolutions: 1 });
    };
    NS.VisualGames[9] = function (level) {
        var e_3, _a, e_4, _b;
        var n = level <= 4 ? 3 : level <= 8 ? 4 : level <= 12 ? 5 : 6;
        var colors = ['🔴', '🔵', '🟢', '🟡', '🟣'], shapes = ['●', '▲', '■', '◆', '★'];
        var off = NS.rnd(0, 4), sOff = NS.rnd(0, 4);
        function token(r, c) {
            var a = level <= 4 ? r : level <= 8 ? r + c : level <= 12 ? r + 2 * c : 2 * r + 3 * c;
            var b = level <= 4 ? c : level <= 8 ? 2 * r + c : level <= 12 ? 2 * r + c : 3 * r + 2 * c;
            return colors[(a + off) % 5] + shapes[(b + sOff) % 5];
        }
        var tr = n - 1, tc = n - 1, answer = token(tr, tc);
        // Each successive level hides one additional observation.  Preserve first
        // row and first column so the rule is still deducible from visible examples.
        var candidates = [];
        for (var r = 1; r < n; r++)
            for (var c = 1; c < n; c++)
                if (r !== tr || c !== tc)
                    candidates.push([r, c]);
        var blanks = Math.min(level, 1 + candidates.length);
        var hidden = new Set(NS.shuffle(candidates).slice(0, blanks - 1).map(function (_a) {
            var _b = __read(_a, 2), r = _b[0], c = _b[1];
            return r + ',' + c;
        }));
        var visual = '<div class="matrixPlay" style="grid-template-columns:repeat(' + n + ',1fr);max-width:' + (n * 64) + 'px">';
        for (var r = 0; r < n; r++)
            for (var c = 0; c < n; c++)
                visual += '<div class="matrixTile" style="width:' + (100 / n) + '%;height:' + (100 / n) + '%">' + (r === tr && c === tc ? '?' : hidden.has(r + ',' + c) ? '·' : token(r, c)) + '</div>';
        visual += '</div>';
        var pool = [];
        try {
            for (var colors_1 = __values(colors), colors_1_1 = colors_1.next(); !colors_1_1.done; colors_1_1 = colors_1.next()) {
                var a = colors_1_1.value;
                try {
                    for (var shapes_1 = (e_4 = void 0, __values(shapes)), shapes_1_1 = shapes_1.next(); !shapes_1_1.done; shapes_1_1 = shapes_1.next()) {
                        var b = shapes_1_1.value;
                        if (a + b !== answer)
                            pool.push(a + b);
                    }
                }
                catch (e_4_1) { e_4 = { error: e_4_1 }; }
                finally {
                    try {
                        if (shapes_1_1 && !shapes_1_1.done && (_b = shapes_1.return)) _b.call(shapes_1);
                    }
                    finally { if (e_4) throw e_4.error; }
                }
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (colors_1_1 && !colors_1_1.done && (_a = colors_1.return)) _a.call(colors_1);
            }
            finally { if (e_3) throw e_3.error; }
        }
        var close = pool.filter(function (x) { return x.startsWith(answer[0]) || x.endsWith(answer.slice(-1)); });
        var options = NS.uniqueOptions(answer, NS.shuffle(close).concat(NS.shuffle(pool)), Math.min(6, 2 + Math.floor((level - 1) / 3)));
        return finish(9, level, { prompt: 'Quale figura completa la matrice?', sub: 'Confronta le regole di colore e forma sulle righe e sulle colonne.', visual: visual, options: options, answer: answer, hint: 'Cerca prima l’andamento dei colori, poi quello delle forme.' }, { size: n, holes: blanks, ruleTier: 1 + Math.floor((level - 1) / 4), choices: options.length });
    };
})(window.LogicLand);
