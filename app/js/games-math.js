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
(function (NS) {
    function qSequence(level) {
        var seq = [], answer, rule;
        var band = NS.levelBand(level), mode = band === 1 ? NS.rnd(0, 1) : band === 2 ? NS.rnd(0, 2) : NS.rnd(0, 4);
        if (mode === 0) {
            var start = NS.rnd(0, 8 + level), step = NS.rnd(1, Math.max(2, Math.ceil(level / 2)));
            for (var i = 0; i < 5; i++)
                seq.push(start + i * step);
            answer = start + 5 * step;
            rule = "Aggiungi ".concat(step, " ogni volta.");
        }
        else if (mode === 1) {
            var start = NS.rnd(8, 22 + level * 2), step = NS.rnd(1, Math.max(2, Math.ceil(level / 3)));
            for (var i = 0; i < 5; i++)
                seq.push(start - i * step);
            answer = start - 5 * step;
            rule = "Togli ".concat(step, " ogni volta.");
        }
        else if (mode === 2) {
            var start = NS.rnd(1, 6), a = NS.rnd(1, 4), b = NS.rnd(2, 6);
            seq = [start];
            for (var i = 1; i < 6; i++)
                seq.push(seq[i - 1] + (i % 2 ? a : b));
            answer = seq.pop();
            rule = "Gli aumenti si alternano: +".concat(a, ", +").concat(b, ".");
        }
        else if (mode === 3) {
            var start = NS.rnd(1, 3), mul = NS.rnd(2, 3);
            seq = [start];
            for (var i = 1; i < 5; i++)
                seq.push(seq[i - 1] * mul);
            answer = seq[4] * mul;
            rule = "Moltiplica per ".concat(mul, ".");
        }
        else {
            var a = NS.rnd(1, 6), b = NS.rnd(1, 6);
            seq = [a, b];
            for (var i = 2; i < 6; i++)
                seq.push(seq[i - 1] + seq[i - 2]);
            answer = seq.pop();
            rule = 'Ogni numero è la somma dei due precedenti.';
        }
        return { prompt: 'Qual è il numero successivo?', visual: "<div class=\"bigVisual\">".concat(seq.join(' · '), " \u00B7 ?</div>"), options: NS.uniqueOptions(answer, [answer + 1, answer - 1, answer + 2, answer - 2, answer + 5, Math.max(0, answer - 5)]), answer: String(answer), hint: rule };
    }
    function qCalc(level) {
        var band = NS.levelBand(level), variant = NS.rnd(0, band >= 4 ? 3 : band >= 2 ? 2 : 1);
        if (variant === 0) {
            var ops = band === 1 ? ['+', '-'] : band === 2 ? ['+', '-', '×'] : ['+', '-', '×', '÷'];
            var op = NS.pick(ops);
            var a_1, b_1, answer_1;
            if (op === '+') {
                a_1 = NS.rnd(2, 15 + level * 5);
                b_1 = NS.rnd(2, 12 + level * 4);
                answer_1 = a_1 + b_1;
            }
            else if (op === '-') {
                a_1 = NS.rnd(10, 25 + level * 6);
                b_1 = NS.rnd(2, a_1);
                answer_1 = a_1 - b_1;
            }
            else if (op === '×') {
                a_1 = NS.rnd(2, Math.min(12, 3 + level));
                b_1 = NS.rnd(2, Math.min(12, 3 + level));
                answer_1 = a_1 * b_1;
            }
            else {
                b_1 = NS.rnd(2, Math.min(10, 2 + level));
                answer_1 = NS.rnd(2, Math.min(12, 3 + level));
                a_1 = b_1 * answer_1;
            }
            return { prompt: "Quanto fa ".concat(a_1, " ").concat(op, " ").concat(b_1, "?"), sub: 'Scegli il risultato corretto.', options: NS.uniqueOptions(answer_1, [answer_1 + 1, answer_1 - 1, answer_1 + 2, answer_1 - 2, answer_1 + 5]), answer: String(answer_1), hint: "Calcola ".concat(a_1, " ").concat(op, " ").concat(b_1, ".") };
        }
        if (variant === 1) {
            var total = NS.rnd(10, 30 + level * 5), known = NS.rnd(2, total - 2), answer_2 = total - known;
            return { prompt: 'Trova il numero nascosto', visual: "<div class=\"bigVisual\">".concat(known, " + \u2753 = ").concat(total, "</div>"), options: NS.uniqueOptions(answer_2, [answer_2 + 1, answer_2 - 1, total, known]), answer: String(answer_2), hint: "Fai ".concat(total, " \u2212 ").concat(known, ".") };
        }
        if (variant === 2) {
            var packs = NS.rnd(2, Math.min(10, 3 + level)), each = NS.rnd(2, Math.min(10, 3 + level)), answer_3 = packs * each;
            return { prompt: 'Mini-problema', sub: "Ci sono ".concat(packs, " scatole con ").concat(each, " figurine ciascuna. Quante figurine in tutto?"), options: NS.uniqueOptions(answer_3, [answer_3 + packs, answer_3 - each, packs + each, answer_3 + 1]), answer: String(answer_3), hint: "Ripeti ".concat(each, " per ").concat(packs, " volte.") };
        }
        var a = NS.rnd(2, 15), b = NS.rnd(2, 12), c = NS.rnd(2, 8), answer = a + b * c;
        return { prompt: 'Calcolo a due passaggi', visual: "<div class=\"bigVisual\">".concat(a, " + ").concat(b, " \u00D7 ").concat(c, "</div>"), sub: 'Prima esegui la moltiplicazione.', options: NS.uniqueOptions(answer, [(a + b) * c, a + b + c, answer + 2, answer - 2]), answer: String(answer), hint: "Prima ".concat(b, " \u00D7 ").concat(c, ", poi aggiungi ").concat(a, ".") };
    }
    function qPyramid(level) {
        var band = NS.levelBand(level);
        if (band <= 2) {
            var a_2 = NS.rnd(1, 8 + level * 2), b_2 = NS.rnd(1, 8 + level * 2), top_1 = a_2 + b_2;
            if (NS.rnd(0, 1) === 0)
                return { prompt: 'Quale numero va in cima?', visual: "<div class=\"bigVisual\">\u2753<br>\uD83D\uDD3A ".concat(a_2, " ").concat(b_2, "</div>"), sub: 'Il numero sopra è la somma dei due sotto.', options: NS.uniqueOptions(top_1, [top_1 + 1, top_1 - 1, Math.abs(a_2 - b_2), top_1 + 3]), answer: String(top_1), hint: "Somma ".concat(a_2, " + ").concat(b_2, ".") };
            var miss = NS.rnd(0, 1) === 0 ? 'a' : 'b', answer_4 = miss === 'a' ? a_2 : b_2;
            return { prompt: 'Quale numero manca alla base?', visual: "<div class=\"bigVisual\">".concat(top_1, "<br>\uD83D\uDD3A ").concat(miss === 'a' ? '❓' : a_2, " ").concat(miss === 'b' ? '❓' : b_2, "</div>"), sub: 'Il numero sopra è la somma dei due sotto.', options: NS.uniqueOptions(answer_4, [answer_4 + 1, answer_4 - 1, top_1, Math.abs(a_2 - b_2)]), answer: String(answer_4), hint: "Fai ".concat(top_1, " \u2212 ").concat(miss === 'a' ? b_2 : a_2, ".") };
        }
        var a = NS.rnd(1, 9 + level), b = NS.rnd(1, 9 + level), c = NS.rnd(1, 9 + level), ab = a + b, bc = b + c, top = ab + bc;
        var targets = [['ab', ab], ['bc', bc], ['b', b], ['top', top]], pick = NS.pick(targets), key = pick[0], answer = pick[1];
        var row2 = "".concat(key === 'ab' ? '❓' : ab, " &nbsp; ").concat(key === 'bc' ? '❓' : bc);
        var row3 = "".concat(a, " &nbsp; ").concat(key === 'b' ? '❓' : b, " &nbsp; ").concat(c);
        var topText = key === 'top' ? '❓' : top;
        return { prompt: 'Completa la piramide a 3 piani', visual: "<div class=\"bigVisual pyramidVisual\">".concat(topText, "<br>").concat(row2, "<br>").concat(row3, "</div>"), sub: 'Ogni casella è la somma delle due immediatamente sotto.', options: NS.uniqueOptions(answer, [answer + 1, Math.max(0, answer - 1), answer + 3, Math.max(0, answer - 3), top]), answer: String(answer), hint: 'Lavora dal piano dove conosci entrambi i numeri.' };
    }
    function qBalance(level) {
        var band = NS.levelBand(level), variant = NS.rnd(0, band >= 4 ? 2 : 1);
        var x = NS.rnd(1, 8 + level * 2);
        if (variant === 0) {
            var a = NS.rnd(1, 6 + level), b = x + a;
            return { prompt: 'Quanto vale ❓?', visual: "<div class=\"bigVisual\">\u2753 + ".concat(a, " \u2696\uFE0F ").concat(b, "</div>"), options: NS.uniqueOptions(x, [x + 1, x - 1, b, a]), answer: String(x), hint: "Trova il numero che, aggiunto a ".concat(a, ", d\u00E0 ").concat(b, ".") };
        }
        if (variant === 1) {
            var m_1 = NS.rnd(2, Math.min(6, 2 + band)), tot_1 = m_1 * x;
            return { prompt: 'Trova il peso nascosto', visual: "<div class=\"bigVisual\">".concat(m_1, " \u00D7 \u2753 \u2696\uFE0F ").concat(tot_1, "</div>"), options: NS.uniqueOptions(x, [x + 1, x - 1, m_1, tot_1 - m_1]), answer: String(x), hint: "Dividi ".concat(tot_1, " per ").concat(m_1, ".") };
        }
        var m = NS.rnd(2, 5), c = NS.rnd(1, 10), tot = m * x + c;
        return { prompt: 'Bilancia a due passaggi', visual: "<div class=\"bigVisual\">".concat(m, " \u00D7 \u2753 + ").concat(c, " \u2696\uFE0F ").concat(tot, "</div>"), options: NS.uniqueOptions(x, [x + 1, x - 1, m, tot - c]), answer: String(x), hint: "Prima togli ".concat(c, ", poi dividi per ").concat(m, ".") };
    }
    function qSudoku(level) {
        var _a;
        var symbols = level <= 5 ? ['1', '2', '3', '4'] : level <= 10 ? NS.shuffle(['🔴', '🔵', '🟢', '🟡']) : NS.shuffle(['▲', '■', '●', '◆']);
        var base = [[0, 1, 2, 3], [2, 3, 0, 1], [1, 0, 3, 2], [3, 2, 1, 0]], grid = base.map(function (r) { return r.map(function (v) { return symbols[v]; }); });
        if (NS.rnd(0, 1))
            _a = __read([grid[1], grid[0]], 2), grid[0] = _a[0], grid[1] = _a[1];
        var r = NS.rnd(0, 3), c = NS.rnd(0, 3), answer = grid[r][c];
        var html = '<div class="sudoku">' + grid.flatMap(function (row, ri) { return row.map(function (v, ci) { return "<div class=\"cell ".concat(ri === r && ci === c ? 'target' : '', "\">").concat(ri === r && ci === c ? '?' : v, "</div>"); }); }).join('') + '</div>';
        return { prompt: 'Quale simbolo completa il Sudoku?', sub: 'Ogni simbolo compare una sola volta in ogni riga e colonna.', visual: html, options: NS.shuffle(symbols), answer: String(answer), hint: 'Controlla prima la riga, poi la colonna.' };
    }
    function qCode(level) {
        var digits = level <= 5 ? 2 : 3, max = level <= 8 ? 6 : 9;
        var _loop_1 = function (tries) {
            var codes = [];
            while (codes.length < 4) {
                var c = Array.from({ length: digits }, function () { return NS.rnd(1, max); }).join('');
                if (!codes.includes(c))
                    codes.push(c);
            }
            var answer = NS.pick(codes), nums = answer.split('').map(Number), sum = nums.reduce(function (a, b) { return a + b; }, 0), firstParity = nums[0] % 2, lastCmp = nums.at(-1) > Math.floor(max / 2);
            var filtered = codes.filter(function (c) { var x = c.split('').map(Number); return x.reduce(function (a, b) { return a + b; }, 0) === sum && (x[0] % 2 === firstParity) && ((x.at(-1) > Math.floor(max / 2)) === lastCmp); });
            if (filtered.length === 1)
                return { value: { prompt: 'Scopri il codice segreto', visual: "<div class=\"bigVisual\">\uD83D\uDD10 ".concat('_ '.repeat(digits).trim(), "</div>"), sub: "Somma = ".concat(sum, " \u2022 prima cifra ").concat(firstParity ? 'dispari' : 'pari', " \u2022 ultima ").concat(lastCmp ? 'alta' : 'bassa'), options: NS.shuffle(codes), answer: answer, hint: 'Elimina un codice alla volta usando tutti gli indizi.' } };
        };
        for (var tries = 0; tries < 100; tries++) {
            var state_1 = _loop_1(tries);
            if (typeof state_1 === "object")
                return state_1.value;
        }
        return { prompt: 'Scopri il codice segreto', options: ['24', '35', '46', '57'], answer: '24', hint: 'Usa contemporaneamente somma e parità.' };
    }
    function qOdd(level) {
        var _a;
        var band = NS.levelBand(level), type = NS.rnd(0, band >= 3 ? 3 : 2);
        if (type === 0) {
            var base = NS.rnd(2, 8), arr_1 = [base * 2, base * 3, base * 4, base * 5], odd_1 = base * 4 + 1;
            arr_1.splice(NS.rnd(0, 4), 0, odd_1);
            return { prompt: "Qual è l'intruso?", sub: "Quasi tutti i numeri sono multipli di ".concat(base, "."), options: NS.shuffle(arr_1.map(String)), answer: String(odd_1), hint: "Controlla quali numeri si dividono per ".concat(base, ".") };
        }
        if (type === 1) {
            var normal_1 = NS.pick(['🔵', '🔺', '⭐', '🟩']), odd_2 = normal_1 === '🔵' ? '🔴' : normal_1 === '🔺' ? '🔻' : normal_1 === '⭐' ? '🌟' : '🟦', arr_2 = Array(5).fill(normal_1), idx_1 = NS.rnd(0, 4);
            arr_2[idx_1] = odd_2;
            return { prompt: 'Trova la figura diversa', visual: "<div class=\"bigVisual\">".concat(arr_2.join(' '), "</div>"), options: arr_2.map(function (_x, i) { return ({ label: "Posizione ".concat(i + 1), value: String(i) }); }), answer: String(idx_1), hint: 'Confronta forma, colore e orientamento.' };
        }
        if (type === 2) {
            var odds = NS.shuffle([5, 7, 9, 11, 13, 15, 17]).slice(0, 3), odd_3 = NS.pick([4, 6, 8, 10, 12, 14, 16]);
            var nums = __spreadArray([], __read(odds), false);
            nums.splice(NS.rnd(0, 3), 0, odd_3);
            return { prompt: 'Quale numero è diverso dagli altri?', sub: 'Tre sono dispari, uno è pari.', options: NS.shuffle(nums.map(String)), answer: String(odd_3), hint: 'Pari = divisibile per 2.' };
        }
        var groups = ['🍎🍎', '🚗🚗', '🐶🐶', '⭐⭐'], normal = NS.pick(groups), odd = normal + normal[0], arr = [normal, normal, normal, odd], idx = NS.rnd(0, 3);
        _a = __read([arr[3], arr[idx]], 2), arr[idx] = _a[0], arr[3] = _a[1];
        return { prompt: 'Quale gruppo non segue la stessa quantità?', visual: "<div class=\"bigVisual\">".concat(arr.map(function (x, i) { return "<span>".concat(i + 1, ":").concat(x, "</span>"); }).join(' &nbsp; '), "</div>"), options: arr.map(function (_x, i) { return ({ label: "Gruppo ".concat(i + 1), value: String(i) }); }), answer: String(idx), hint: 'Conta gli elementi in ogni gruppo.' };
    }
    NS.MathGames = { 1: qSequence, 2: qCalc, 3: qPyramid, 4: qBalance, 5: qSudoku, 6: qCode, 7: qOdd };
})(window.LogicLand);
