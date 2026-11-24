'use strict';
/* v9.1 — Nuovi giochi di logica e somme (richiesta: più logica, più difficoltà).
   40 Somme di Oggetti · 41 Equazioni con Figure · 42 Piramide dei Numeri.
   I giochi 21 (Pezzo Mancante) e 35 (Domino) sono stati accorpati in 8 (Sequenze di Figure). */
(function (NS) {
    var FRUITS = ['🍎', '🍌', '🍒', '🍇', '🍓', '🍐', '🍊', '🍋', '🥝', '🍑'];
    var THINGS = ['🍪', '🧁', '⚽', '🎈', '🌟', '🐞', '🚗', '🧸', '🍬', '🐟'];
    function rnd(a, b) { return NS.rnd(a, b); }
    function sh(a) { return NS.shuffle(a); }
    function nChoices(l) { return Math.min(6, 3 + Math.floor((l - 1) / 4)); }
    function numChoices(answer, count, spread) {
        var vals = [answer], d = 1;
        var cands = sh([answer - 1, answer + 1, answer - 2, answer + 2, answer + spread, answer - spread, answer + 3, answer - 3, answer + 10, answer - 10]);
        cands.forEach(function (v) { if (v >= 0 && vals.indexOf(v) < 0 && vals.length < count)
            vals.push(v); });
        while (vals.length < count) {
            if (vals.indexOf(answer + d + 10) < 0)
                vals.push(answer + d + 10);
            d++;
        }
        return sh(vals.map(String));
    }
    function q(id, lv, question, metric) {
        var obj = NS.attachDifficulty(question, id, lv);
        obj.meta.age6 = true;
        obj.meta.age6Load = NS.AGE6_DIFFICULTY[lv - 1].load;
        obj.meta.age6Metrics = metric;
        obj.meta.v9 = true;
        return obj;
    }
    function group(icon, n) { var s = ''; for (var i = 0; i < n; i++)
        s += icon; return '<span class="objGroup">' + s + '</span>'; }
    function op(sym) { return '<b class="objOp">' + sym + '</b>'; }
    /* ---------- 40. Somme di Oggetti ---------- */
    function sums(l) {
        var icon = NS.pick(THINGS), html = '', answer, ops = 1, text, total = 0;
        if (l <= 3) { // due gruppi, stesso oggetto
            var a = rnd(1 + l, 3 + l), b = rnd(1 + l, 3 + l);
            answer = a + b;
            html = group(icon, a) + op('+') + group(icon, b);
            text = 'Quanti ' + icon + ' in tutto?';
            total = a + b;
        }
        else if (l <= 5) { // tre gruppi
            var x = rnd(2, 4 + l - 3), y = rnd(2, 5), z = rnd(2, 4 + l - 3);
            answer = x + y + z;
            ops = 2;
            html = group(icon, x) + op('+') + group(icon, y) + op('+') + group(icon, z);
            text = 'Somma tutti i gruppi.';
            total = answer;
        }
        else if (l <= 7) { // somma e sottrazione
            var p = rnd(5, 7 + l), r = rnd(3, 6), m = rnd(2, Math.min(p - 1, 4 + l - 5));
            answer = p + r - m;
            ops = 2;
            html = group(icon, p) + op('+') + group(icon, r) + op('−') + group(icon, m);
            text = 'Aggiungi, poi togli.';
            total = p + r + m;
        }
        else if (l <= 10) { // gruppi uguali = moltiplicazione come somma ripetuta
            var k = rnd(2, l <= 8 ? 3 : 4), each = rnd(2, l <= 9 ? 4 : 5), extra = rnd(1, 4);
            answer = k * each + extra;
            ops = k;
            html = '';
            for (var i = 0; i < k; i++)
                html += (i ? op('+') : '') + '<span class="objBasket">🧺' + group(icon, each) + '</span>';
            html += op('+') + group(icon, extra);
            text = k + ' cestini uguali e altri ' + extra + '. Quanti ' + icon + ' in tutto?';
            total = k * each + extra;
        }
        else if (l <= 13) { // oggetti con “valore”: ogni 🐞 ha 6 zampe ecc.
            var items = [['🐞', 6, 'zampe'], ['🐕', 4, 'zampe'], ['🐔', 2, 'zampe'], ['🖐️', 5, 'dita'], ['🚲', 2, 'ruote'], ['🚗', 4, 'ruote'], ['🕷️', 8, 'zampe']];
            var A = NS.pick(items), B = NS.pick(items.filter(function (t) { return t[2] === A[2] && t[0] !== A[0]; }).concat([A])).slice(0);
            var na = rnd(2, l <= 11 ? 3 : 4), nb = rnd(1, 3);
            if (B[0] === A[0])
                nb = 0;
            answer = na * A[1] + nb * B[1];
            ops = na + nb;
            html = group(A[0], na) + (nb ? op('+') + group(B[0], nb) : '');
            text = 'Ogni ' + A[0] + ' ha ' + A[1] + ' ' + A[2] + (nb ? ', ogni ' + B[0] + ' ne ha ' + B[1] : '') + '. Quante ' + A[2] + ' in tutto?';
            total = na + nb;
        }
        else { // problema in due passaggi con resto
            var bags = rnd(3, 4), per = rnd(3, 5), given = rnd(2, per * bags - 3), eat = 0;
            eat = rnd(1, Math.min(4, bags * per - given - 1));
            answer = bags * per - given - eat;
            ops = 3;
            html = '';
            for (var j = 0; j < bags; j++)
                html += (j ? op('+') : '') + '<span class="objBasket">🎁' + group(icon, per) + '</span>';
            text = 'Ci sono ' + bags + ' pacchi con ' + per + ' ' + icon + '. Ne regali ' + given + ' e ne usi ' + eat + '. Quanti ne restano?';
            total = bags * per;
        }
        return q(40, l, { prompt: 'Somme di oggetti', sub: text, visual: '<div class="objSum">' + html + '</div>', options: numChoices(answer, nChoices(l), l >= 8 ? 5 : 2), answer: String(answer),
            hint: l <= 7 ? 'Conta ogni gruppo e scrivi il numero, poi fai le operazioni.' : l <= 10 ? 'Gruppi uguali: conta un gruppo e ripeti tante volte quanti sono i gruppi.' : 'Prima calcola il totale, poi le operazioni una alla volta.' }, { operations: ops, objects: total });
    }
    /* ---------- 41. Equazioni con Figure ---------- */
    function row(parts, result) { return '<div class="eqRow">' + parts.join(' ') + ' <b>=</b> <span class="eqRes">' + result + '</span></div>'; }
    function equations(l) {
        var f = sh(FRUITS).slice(0, 4), A = f[0], B = f[1], C = f[2], D = f[3], rows = [], ask, answer, unknowns, max = l <= 4 ? 5 : l <= 9 ? 9 : 12;
        var a = rnd(1, max), b = rnd(1, max), c = rnd(1, max), d = rnd(1, max);
        if (l <= 2) {
            rows.push(row([A, '+', A], 2 * a));
            ask = A;
            answer = a;
            unknowns = 1;
        }
        else if (l <= 4) {
            rows.push(row([A, '+', A], 2 * a));
            rows.push(row([A, '+', B], a + b));
            ask = B;
            answer = b;
            unknowns = 2;
        }
        else if (l <= 6) {
            rows.push(row([A, '+', A, '+', A], 3 * a));
            rows.push(row([A, '+', B], a + b));
            rows.push(row([B, '+', C], b + c));
            ask = C;
            answer = c;
            unknowns = 3;
        }
        else if (l <= 8) {
            rows.push(row([A, '+', A], 2 * a));
            rows.push(row([B, '+', B, '+', A], 2 * b + a));
            rows.push(row([C, '+', B], c + b));
            ask = A + ' + ' + B + ' + ' + C;
            answer = a + b + c;
            unknowns = 3;
        }
        else if (l <= 10) {
            a = rnd(1, 6);
            b = a + rnd(1, 6);
            c = rnd(Math.ceil(b / 2), Math.ceil(b / 2) + 6);
            rows.push(row([A, '+', A], 2 * a));
            rows.push(row([B, '−', A], b - a));
            rows.push(row([C, '+', C, '−', B], 2 * c - b));
            ask = C + ' + ' + B;
            answer = c + b;
            unknowns = 3;
        }
        else if (l <= 12) {
            a = rnd(2, 5);
            b = rnd(2, 5);
            c = rnd(1, 9);
            rows.push(row([A, '+', A, '+', A], 3 * a));
            rows.push(row([A, '×', B], a * b));
            rows.push(row([B, '+', C], b + c));
            ask = A + ' × ' + C;
            answer = a * c;
            unknowns = 3;
        }
        else if (l <= 13) {
            rows.push(row([A, '+', B], a + b));
            rows.push(row([B, '+', C], b + c));
            rows.push(row([A, '+', C], a + c));
            ask = A;
            answer = a;
            unknowns = 3;
        }
        else {
            a = rnd(1, 6);
            b = rnd(1, 6);
            c = rnd(1, 6);
            d = rnd(1, 6);
            rows.push(row([A, '+', B], a + b));
            rows.push(row([B, '+', C], b + c));
            rows.push(row([A, '+', C], a + c));
            rows.push(row([C, '+', D, '+', D], c + 2 * d));
            ask = A + ' + ' + D;
            answer = a + d;
            unknowns = 4;
        }
        return q(41, l, { prompt: 'Quanto vale ' + ask + '?', sub: 'Ogni frutto vale sempre lo stesso numero.', visual: '<div class="eqBox">' + rows.join('') + '<div class="eqRow ask">' + ask + ' <b>=</b> <span class="eqRes">?</span></div></div>',
            options: numChoices(answer, nChoices(l), l >= 11 ? 4 : 2), answer: String(answer),
            hint: l <= 4 ? 'Parti dalla riga con un solo frutto ripetuto.' : l <= 10 ? 'Trova un frutto alla volta, poi usalo nella riga successiva.' : l <= 12 ? '× significa “volte”: 3 × 4 = 4+4+4.' : 'Somma tutte le righe: ottieni il doppio di ' + A + '+' + B + '+' + C + '.' }, { equations: rows.length, unknowns: unknowns });
    }
    /* ---------- 42. Piramide dei Numeri ---------- */
    function pyramid(l) {
        var base = l <= 3 ? 2 : l <= 9 ? 3 : 4, maxv = l <= 3 ? 5 : l <= 6 ? 6 : l <= 12 ? 8 : 9, b = [], i;
        for (i = 0; i < base; i++)
            b.push(rnd(1, maxv));
        var rowsArr = [b];
        while (rowsArr[rowsArr.length - 1].length > 1) {
            var prev = rowsArr[rowsArr.length - 1], next = [];
            for (i = 0; i < prev.length - 1; i++)
                next.push(prev[i] + prev[i + 1]);
            rowsArr.push(next);
        }
        var hidden = {}, ask; // chiave r,c (r=0 base)
        var top = rowsArr.length - 1;
        if (l <= 6 || (l >= 10 && l <= 11)) {
            ask = [top, 0];
        } // trova la cima
        else if (l <= 9 || l === 12) {
            ask = [0, rnd(0, base - 1)];
        } // trova un numero della base conoscendo la cima
        else {
            ask = [0, rnd(1, base - 2)];
        } // L13-15: base centrale, conoscendo cima e un lato
        hidden[ask[0] + ',' + ask[1]] = 1;
        // Nasconde i blocchi intermedi: bisogna ragionare su più passaggi.
        var middleHide = l <= 3 ? 0 : l <= 6 ? 1 : l <= 9 ? 2 : l <= 12 ? 3 : 5;
        var middles = [];
        for (var r = 1; r < top; r++)
            for (var c = 0; c < rowsArr[r].length; c++)
                middles.push([r, c]);
        if (ask[0] === 0) { // serve la cima visibile e un percorso: nascondo solo blocchi non indispensabili
            sh(middles).slice(0, Math.min(middleHide, middles.length)).forEach(function (m) { hidden[m[0] + ',' + m[1]] = 1; });
        }
        else
            sh(middles).slice(0, Math.min(middleHide, middles.length)).forEach(function (m) { hidden[m[0] + ',' + m[1]] = 1; });
        var answer = rowsArr[ask[0]][ask[1]];
        var html = '<div class="pyramid">';
        for (r = top; r >= 0; r--) {
            html += '<div class="pyrRow">';
            for (c = 0; c < rowsArr[r].length; c++) {
                var k = r + ',' + c, isAsk = r === ask[0] && c === ask[1];
                html += '<span class="pyrCell' + (isAsk ? ' ask' : hidden[k] ? ' blank' : '') + '">' + (isAsk ? '?' : hidden[k] ? '' : rowsArr[r][c]) + '</span>';
            }
            html += '</div>';
        }
        html += '</div>';
        return q(42, l, { prompt: ask[0] === top ? 'Quale numero va in cima?' : 'Quale numero manca nella base?', sub: 'Ogni mattone è la somma dei due mattoni sotto di lui.', visual: html,
            options: numChoices(answer, nChoices(l), l >= 7 ? 3 : 2), answer: String(answer),
            hint: ask[0] === top ? 'Riempi una fila alla volta partendo dal basso.' : 'Lavora all’indietro: sopra = sinistra + destra, quindi un numero = sopra − l’altro.' }, { baseSize: base, hiddenBlocks: Object.keys(hidden).length, reverse: ask[0] === 0 ? 1 : 0 });
    }
    /* ---------- 8. Sequenze di Figure (accorpa Pezzo Mancante e Domino) ---------- */
    var oldNext = NS.VisualGames[8], oldMissing = NS.VisualGames[21], oldDomino = NS.VisualGames[35];
    NS.VisualGames[8] = function (l, s) {
        var kind = l <= 3 ? 0 : rnd(0, 2), out = kind === 0 ? oldNext(l, s) : kind === 1 ? oldMissing(l, s) : oldDomino(l, s);
        out.meta.gameId = 8;
        if (out.meta.age6Metrics.presentedItems === undefined)
            out.meta.age6Metrics.presentedItems = out.meta.age6Metrics.tiles;
        return out;
    };
    NS.MathGames[40] = sums;
    NS.MathGames[41] = equations;
    NS.MathGames[42] = pyramid;
    NS.V9Logic = { sums: sums, equations: equations, pyramid: pyramid };
})(window.LogicLand);
