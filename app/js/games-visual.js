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
    function qShapes(level) {
        var band = NS.levelBand(level), mode = NS.rnd(0, Math.min(4, band));
        var seq = [], answer, hint;
        if (mode === 0) {
            var a_1 = NS.pick(COLORS), b = NS.pick(COLORS.filter(function (x) { return x !== a_1; }));
            seq = [a_1, b, a_1, b, a_1];
            answer = b;
            hint = 'I due colori si alternano.';
        }
        else if (mode === 1) {
            var a_2 = NS.pick(SHAPES), b_1 = NS.pick(SHAPES.filter(function (x) { return x !== a_2; })), c = NS.pick(SHAPES.filter(function (x) { return x !== a_2 && x !== b_1; }));
            seq = [a_2, b_1, c, a_2, b_1];
            answer = c;
            hint = 'Si ripete un gruppo di tre forme.';
        }
        else if (mode === 2) {
            var a_3 = NS.pick(COLORS), b = NS.pick(COLORS.filter(function (x) { return x !== a_3; }));
            seq = [a_3, a_3, b, a_3, a_3, b, a_3, a_3];
            answer = b;
            hint = 'Il terzo elemento di ogni gruppo cambia colore.';
        }
        else if (mode === 3) {
            var start_1 = NS.rnd(0, 3), step_1 = NS.pick([1, 3]);
            seq = Array.from({ length: 5 }, function (_, i) { return ARROWS[(start_1 + i * step_1) % 4]; });
            answer = ARROWS[(start_1 + 5 * step_1) % 4];
            hint = step_1 === 1 ? 'La freccia ruota di 90° a destra.' : 'La freccia ruota di 90° a sinistra.';
        }
        else {
            var a_4 = NS.pick(SHAPES), b = NS.pick(SHAPES.filter(function (x) { return x !== a_4; }));
            seq = [a_4, b, b, a_4, b, b, a_4];
            answer = b;
            hint = 'Osserva il blocco di tre: una forma, poi due uguali.';
        }
        return { prompt: 'Quale figura viene dopo?', visual: "<div class=\"bigVisual\">".concat(seq.join(' '), " ?</div>"), options: NS.uniqueOptions(answer, __spreadArray(__spreadArray(__spreadArray([], __read(COLORS), false), __read(SHAPES), false), __read(ARROWS), false)), answer: answer, hint: hint };
    }
    function qMatrix(level) {
        var band = NS.levelBand(level), colors = NS.shuffle(COLORS).slice(0, 3), shapes = NS.shuffle(SHAPES).slice(0, 3);
        if (band <= 2) {
            var s1 = shapes[0], s2 = shapes[1], c1 = colors[0], c2 = colors[1], token = function (s, c) { return "<span class=\"vtoken\" data-color=\"".concat(c, "\">").concat(c).concat(s, "</span>"); };
            var answer_1 = c2 + s2;
            return { prompt: 'Completa la matrice logica', sub: 'Nella colonna cambia la forma; nella riga cambia il colore.', visual: "<div class=\"matrix\"><i>".concat(token(s1, c1), "</i><i>").concat(token(s1, c2), "</i><i>").concat(token(s2, c1), "</i><i>?</i></div>"), options: NS.uniqueOptions(answer_1, [c1 + s1, c2 + s1, c1 + s2, colors[2] + s2]), answer: answer_1, hint: 'Prendi il colore della casella sopra e la forma della casella a sinistra.' };
        }
        var a = shapes[0], b = shapes[1], c = shapes[2], arr = [[a, b, c], [b, c, a], [c, a, '?']], answer = b;
        return { prompt: 'Completa la matrice 3×3', sub: 'Ogni riga contiene le stesse tre forme, ma spostate.', visual: "<div class=\"matrix3\">".concat(arr.flat().map(function (x) { return "<i>".concat(x, "</i>"); }).join(''), "</div>"), options: NS.shuffle([a, b, c, SHAPES.find(function (x) { return ![a, b, c].includes(x); })]), answer: answer, hint: 'Confronta l’ordine delle forme nelle tre righe.' };
    }
    function qMirror(level) {
        var band = NS.levelBand(level), orig = NS.pick(ARROWS), vertical = band <= 2 ? true : NS.rnd(0, 1) === 0;
        var mapH = { '⬅️': '➡️', '➡️': '⬅️', '⬆️': '⬆️', '⬇️': '⬇️' }, mapV = { '⬅️': '⬅️', '➡️': '➡️', '⬆️': '⬇️', '⬇️': '⬆️' };
        var answer = (vertical ? mapH : mapV)[orig];
        return { prompt: "Specchio ".concat(vertical ? 'verticale' : 'orizzontale', ": cosa vedi?"), visual: "<div class=\"bigVisual\">".concat(orig, " \uD83E\uDE9E ?</div>"), options: NS.shuffle(ARROWS), answer: answer, hint: vertical ? 'Destra e sinistra si scambiano.' : 'Alto e basso si scambiano.' };
    }
    function qBlocks(level) {
        var band = NS.levelBand(level), variant = NS.rnd(0, band >= 4 ? 2 : 1), a = NS.rnd(2, 5 + level), b = NS.rnd(2, 5 + level);
        if (variant === 0) {
            var answer_2 = a + b;
            return { prompt: 'Quanti blocchi ci sono in tutto?', visual: "<div class=\"blockGroups\"><div>".concat('🧱'.repeat(Math.min(a, 10)), "</div><div>").concat('🧱'.repeat(Math.min(b, 10)), "</div></div>"), sub: "Unisci un gruppo di ".concat(a, " e uno di ").concat(b, "."), options: NS.uniqueOptions(answer_2, [answer_2 + 1, answer_2 - 1, Math.abs(a - b), answer_2 + 2]), answer: String(answer_2), hint: "Somma ".concat(a, " + ").concat(b, ".") };
        }
        if (variant === 1) {
            var overlap = NS.rnd(1, Math.min(a, b)), answer_3 = a + b - overlap;
            return { prompt: 'Conta senza contare due volte', sub: "Due gruppi hanno ".concat(overlap, " ").concat(overlap === 1 ? 'blocco in comune' : 'blocchi in comune', "."), visual: "<div class=\"bigVisual\">".concat(a, " \uD83E\uDDF1 + ").concat(b, " \uD83E\uDDF1 \u2212 ").concat(overlap, " comuni</div>"), options: NS.uniqueOptions(answer_3, [a + b, answer_3 + 1, answer_3 - 1, a + b - overlap + 2]), answer: String(answer_3), hint: "Somma e poi togli ".concat(overlap, ".") };
        }
        var total = a + b, answer = b;
        return { prompt: 'Quanti blocchi sono nascosti?', visual: "<div class=\"bigVisual\">".concat(a, " visibili + \u2753 = ").concat(total, "</div>"), options: NS.uniqueOptions(answer, [answer + 1, answer - 1, total, a]), answer: String(answer), hint: "Fai ".concat(total, " \u2212 ").concat(a, ".") };
    }
    function qMaze(level) {
        var e_1, _a;
        var n = level <= 4 ? 4 : level <= 9 ? 5 : level <= 12 ? 6 : 7;
        for (var attempt = 0; attempt < 50; attempt++) {
            var grid = Array.from({ length: n }, function () { return Array(n).fill(0); });
            var walls = Math.min(n * n - 3, Math.floor((level + 2) * n / 4));
            for (var i = 0; i < walls; i++) {
                var r = NS.rnd(0, n - 1), c = NS.rnd(0, n - 1);
                if ((r === 0 && c === 0) || (r === n - 1 && c === n - 1))
                    continue;
                grid[r][c] = 1;
            }
            var q = [[0, 0, 0]], seen = new Set(['0,0']);
            var answer = -1;
            while (q.length) {
                var _b = __read(q.shift(), 3), r = _b[0], c = _b[1], d = _b[2];
                if (r === n - 1 && c === n - 1) {
                    answer = d;
                    break;
                }
                try {
                    for (var _c = (e_1 = void 0, __values([[1, 0], [-1, 0], [0, 1], [0, -1]])), _d = _c.next(); !_d.done; _d = _c.next()) {
                        var _e = __read(_d.value, 2), dr = _e[0], dc = _e[1];
                        var nr = r + dr, nc = c + dc, key = nr + ',' + nc;
                        if (nr >= 0 && nc >= 0 && nr < n && nc < n && !grid[nr][nc] && !seen.has(key)) {
                            seen.add(key);
                            q.push([nr, nc, d + 1]);
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
            }
            if (answer >= 0) {
                var html = "<div class=\"maze\" style=\"grid-template-columns:repeat(".concat(n, ",").concat(n >= 7 ? 26 : 30, "px)\">") + grid.flatMap(function (row, r) { return row.map(function (v, c) { return "<i class=\"".concat(v ? 'wall' : '', " ").concat(r === 0 && c === 0 ? 's' : '', " ").concat(r === n - 1 && c === n - 1 ? 'e' : '', "\" style=\"width:").concat(n >= 7 ? 26 : 30, "px;height:").concat(n >= 7 ? 26 : 30, "px\">").concat(r === 0 && c === 0 ? '🐭' : r === n - 1 && c === n - 1 ? '🧀' : '', "</i>"); }); }).join('') + '</div>';
                return { prompt: 'Qual è il cammino più corto?', sub: 'Conta il minimo numero di passi da 🐭 a 🧀.', visual: html, options: NS.uniqueOptions(answer, [answer + 1, answer + 2, Math.max(1, answer - 1), answer + 3]), answer: String(answer), hint: 'Puoi muoverti solo su, giù, destra o sinistra.' };
            }
        }
        return { prompt: 'Qual è il cammino più corto?', options: ['4', '5', '6', '7'], answer: '6', hint: 'Conta un passo per ogni casella.' };
    }
    function qLights(level) {
        var n = level <= 5 ? 3 : level <= 10 ? 4 : 5, press = NS.rnd(0, n - 1), before = Array(n).fill(0);
        [press - 1, press, press + 1].forEach(function (i) { if (i >= 0 && i < n)
            before[i] = 1; });
        return { prompt: 'Quale interruttore spegne tutte le luci?', sub: 'Premendo un interruttore cambiano quella luce e le vicine.', visual: "<div class=\"bigVisual\">".concat(before.map(function (x) { return x ? '💡' : '⚫'; }).join(' '), "</div>"), options: Array.from({ length: n }, function (_, i) { return ({ label: "Interruttore ".concat(i + 1), value: String(i) }); }), answer: String(press), hint: 'Cerca il centro del gruppo di luci accese.' };
    }
    function qMemory(level) {
        var pool = ['🍎', '🚗', '🐶', '⭐', '🌈', '⚽', '🎈', '🦋', '🍦', '🚀', '🐱', '🌙'], count = Math.min(8, 3 + Math.floor(level / 2)), icons = NS.shuffle(pool).slice(0, count), pos = NS.rnd(0, icons.length - 1), answer = icons[pos], id = 'mem_' + Math.random().toString(36).slice(2), delay = Math.max(1200, 3600 - level * 140);
        return { prompt: 'Memorizza la sequenza!', sub: "Tra poco ti chieder\u00F2 cosa c\u2019era in posizione ".concat(pos + 1, "."), visual: "<div class=\"bigVisual\" id=\"".concat(id, "\">").concat(icons.join(' '), "</div>"), options: NS.uniqueOptions(answer, pool), answer: answer, hint: 'Crea una piccola storia mentale con le immagini.', afterRender: function () { var opts = document.querySelector('.options'), el = document.getElementById(id); if (!el)
                return; if (opts) {
                opts.style.visibility = 'hidden';
                opts.style.pointerEvents = 'none';
            } setTimeout(function () { if (!document.getElementById(id))
                return; el.textContent = '❓ '.repeat(Math.min(icons.length, 6)); var h = document.querySelector('.question h3'); if (h)
                h.textContent = "Cosa c\u2019era in posizione ".concat(pos + 1, "?"); if (opts) {
                opts.style.visibility = 'visible';
                opts.style.pointerEvents = 'auto';
            } }, delay); } };
    }
    function simulateRobot(r, c, d, cmds, size) {
        var e_2, _a;
        if (size === void 0) { size = 4; }
        try {
            for (var cmds_1 = __values(cmds), cmds_1_1 = cmds_1.next(); !cmds_1_1.done; cmds_1_1 = cmds_1.next()) {
                var t = cmds_1_1.value;
                if (t === 'R')
                    d = (d + 1) % 4;
                else if (t === 'L')
                    d = (d + 3) % 4;
                else {
                    var delta = [[-1, 0], [0, 1], [1, 0], [0, -1]][d];
                    r = NS.clamp(r + delta[0], 0, size - 1);
                    c = NS.clamp(c + delta[1], 0, size - 1);
                }
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (cmds_1_1 && !cmds_1_1.done && (_a = cmds_1.return)) _a.call(cmds_1);
            }
            finally { if (e_2) throw e_2.error; }
        }
        return r + ',' + c;
    }
    function qRobot(level) {
        var e_3, _a;
        var size = level <= 10 ? 4 : 5, dirs = ARROWS, d = NS.rnd(0, 3), steps = Math.min(5, 1 + Math.floor((level - 1) / 3)), cmds = [];
        var r = Math.floor(size / 2), c = Math.floor(size / 2) - 1, rr = r, cc = c, dd = d;
        for (var i = 0; i < steps; i++) {
            var turn = steps === 1 ? 'F' : NS.pick(['F', 'F', 'R', 'L']);
            cmds.push(turn);
            if (turn === 'R')
                dd = (dd + 1) % 4;
            else if (turn === 'L')
                dd = (dd + 3) % 4;
            else {
                var z = [[-1, 0], [0, 1], [1, 0], [0, -1]][dd];
                rr = NS.clamp(rr + z[0], 0, size - 1);
                cc = NS.clamp(cc + z[1], 0, size - 1);
            }
        }
        var target = rr + ',' + cc, correct = cmds.join(','), options = [correct], candidates = ['F', 'R', 'L', 'F,F', 'R,F', 'L,F', 'F,R', 'F,L', 'F,F,F', 'R,F,F', 'L,F,F', 'F,R,F', 'F,L,F', 'R,F,L', 'L,F,R'];
        try {
            for (var _b = __values(NS.shuffle(candidates)), _c = _b.next(); !_c.done; _c = _b.next()) {
                var x = _c.value;
                if (options.length >= 4)
                    break;
                if (!options.includes(x) && simulateRobot(r, c, d, x.split(','), size) !== target)
                    options.push(x);
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_3) throw e_3.error; }
        }
        while (options.length < 4)
            options.push('R,R');
        var cells = '';
        for (var y = 0; y < size; y++)
            for (var x = 0; x < size; x++)
                cells += "<i>".concat(y === r && x === c ? dirs[d] : y === rr && x === cc ? '🎯' : '', "</i>");
        return { prompt: 'Quale programma porta il robot al bersaglio?', sub: 'F = avanti, R = gira a destra, L = gira a sinistra.', visual: "<div class=\"robotgrid\" style=\"grid-template-columns:repeat(".concat(size, ",42px)\">").concat(cells, "</div>"), options: NS.shuffle(options).map(function (x) { return ({ label: x.replaceAll(',', ' → '), value: x }); }), answer: correct, hint: 'Segui un comando alla volta e ricorda dove guarda il robot.' };
    }
    function qMissingPiece(level) {
        var band = NS.levelBand(level), mode = NS.rnd(0, Math.min(3, band - 1)), pool = __spreadArray(__spreadArray([], __read(COLORS), false), __read(SHAPES), false);
        var pattern;
        if (mode === 0) {
            var a_5 = NS.pick(COLORS), b = NS.pick(COLORS.filter(function (x) { return x !== a_5; }));
            pattern = [a_5, b, a_5, b, a_5, b];
        }
        else if (mode === 1) {
            var a_6 = NS.pick(SHAPES), b_2 = NS.pick(SHAPES.filter(function (x) { return x !== a_6; })), c = NS.pick(SHAPES.filter(function (x) { return x !== a_6 && x !== b_2; }));
            pattern = [a_6, b_2, c, a_6, b_2, c];
        }
        else if (mode === 2) {
            var a_7 = NS.pick(COLORS), b = NS.pick(COLORS.filter(function (x) { return x !== a_7; }));
            pattern = [a_7, a_7, b, a_7, a_7, b];
        }
        else {
            pattern = ['⬆️', '➡️', '⬇️', '⬅️', '⬆️', '➡️'];
        }
        var idx = NS.rnd(1, pattern.length - 2), answer = pattern[idx], shown = pattern.map(function (x, i) { return i === idx ? '❓' : x; });
        return { prompt: 'Quale pezzo manca?', sub: 'Osserva tutta la sequenza prima di scegliere.', visual: "<div class=\"pieceStrip\">".concat(shown.map(function (x) { return "<span>".concat(x, "</span>"); }).join(''), "</div>"), options: NS.uniqueOptions(answer, pool.concat(ARROWS)), answer: answer, hint: 'Cerca il gruppo che si ripete prima e dopo il punto mancante.' };
    }
    function qColorMatrix(level) {
        var colors = NS.shuffle(COLORS).slice(0, level <= 5 ? 2 : 3), hard = level >= 9;
        if (!hard) {
            var a_8 = colors[0], b_3 = colors[1], answer_4 = a_8;
            return { prompt: 'Completa la matrice di colori', visual: "<div class=\"matrix\"><i>".concat(a_8, "</i><i>").concat(b_3, "</i><i>").concat(b_3, "</i><i>?</i></div>"), options: NS.uniqueOptions(answer_4, COLORS), answer: answer_4, hint: 'Le diagonali hanno lo stesso colore.' };
        }
        var _a = __read(colors, 3), a = _a[0], b = _a[1], c = _a[2], grid = [[a, b, c], [b, c, a], [c, a, '?']], answer = b;
        return { prompt: 'Quale colore manca?', sub: 'Ogni riga usa gli stessi tre colori spostati di una posizione.', visual: "<div class=\"matrix3\">".concat(grid.flat().map(function (x) { return "<i>".concat(x, "</i>"); }).join(''), "</div>"), options: NS.uniqueOptions(answer, COLORS), answer: answer, hint: 'Confronta la prima e la seconda riga: l’ordine ruota.' };
    }
    function qShapeMatrix(level) {
        var shapes = NS.shuffle(SHAPES).slice(0, level <= 5 ? 2 : 3), hard = level >= 8;
        if (!hard) {
            var a_9 = shapes[0], b_4 = shapes[1], answer_5 = b_4;
            return { prompt: 'Completa la matrice di forme', visual: "<div class=\"matrix\"><i>".concat(a_9, "</i><i>").concat(b_4, "</i><i>").concat(a_9, "</i><i>?</i></div>"), options: NS.uniqueOptions(answer_5, SHAPES), answer: answer_5, hint: 'Ogni riga contiene le stesse due forme nello stesso ordine.' };
        }
        var _a = __read(shapes, 3), a = _a[0], b = _a[1], c = _a[2], grid = [[a, b, c], [c, a, b], [b, c, '?']], answer = a;
        return { prompt: 'Trova la forma mancante', sub: 'Le tre forme cambiano posizione a ogni riga.', visual: "<div class=\"matrix3\">".concat(grid.flat().map(function (x) { return "<i>".concat(x, "</i>"); }).join(''), "</div>"), options: NS.uniqueOptions(answer, SHAPES), answer: answer, hint: 'Ogni forma deve comparire una volta per riga e per colonna.' };
    }
    function qVisualOdd(level) {
        var band = NS.levelBand(level), kind = NS.rnd(0, Math.min(2, band - 1));
        var arr, idx = NS.rnd(0, 5), hint;
        if (kind === 0) {
            var normal_1 = NS.pick(COLORS), odd = NS.pick(COLORS.filter(function (x) { return x !== normal_1; }));
            arr = Array(6).fill(normal_1);
            arr[idx] = odd;
            hint = 'Uno solo ha un colore diverso.';
        }
        else if (kind === 1) {
            var normal_2 = NS.pick(SHAPES), odd = NS.pick(SHAPES.filter(function (x) { return x !== normal_2; }));
            arr = Array(6).fill(normal_2);
            arr[idx] = odd;
            hint = 'Uno solo ha una forma diversa.';
        }
        else {
            var normal = '➡️', odd = '⬅️';
            arr = Array(6).fill(normal);
            arr[idx] = odd;
            hint = 'Uno solo guarda nella direzione opposta.';
        }
        return { prompt: 'Dove si nasconde l’anomalia?', visual: "<div class=\"pieceStrip\">".concat(arr.map(function (x, i) { return "<span><small>".concat(i + 1, "</small>").concat(x, "</span>"); }).join(''), "</div>"), options: arr.map(function (_x, i) { return ({ label: "Pezzo ".concat(i + 1), value: String(i) }); }), answer: String(idx), hint: hint };
    }
    function qRotation(level) {
        var start = NS.rnd(0, 3), turns = level <= 5 ? 1 : level <= 10 ? NS.pick([1, 2]) : NS.pick([1, 2, 3]), clockwise = level <= 7 ? true : NS.rnd(0, 1) === 0;
        var delta = clockwise ? turns : -turns, answer = ARROWS[(start + delta + 8) % 4], degrees = turns * 90;
        return { prompt: 'Come finisce la rotazione?', sub: "Ruota la freccia di ".concat(degrees, "\u00B0 ").concat(clockwise ? 'in senso orario' : 'in senso antiorario', "."), visual: "<div class=\"bigVisual\">".concat(ARROWS[start], " \uD83D\uDD04 ?</div>"), options: NS.shuffle(ARROWS), answer: answer, hint: "Fai ".concat(turns, " ").concat(turns === 1 ? 'quarto di giro' : 'quarti di giro', " ").concat(clockwise ? 'a destra' : 'a sinistra', ".") };
    }
    function qSymmetry(level) {
        var horizontalPairs = [['◀', '▶'], ['◢', '◣'], ['◤', '◥'], ['↙', '↘']], verticalPairs = [['▲', '▼'], ['◢', '◤'], ['◣', '◥'], ['↗', '↘']], vertical = level >= 8 && NS.rnd(0, 1) === 1, pair = NS.pick(vertical ? verticalPairs : horizontalPairs), answer = pair[1];
        return { prompt: 'Completa la figura simmetrica', sub: "Immagina uno specchio ".concat(vertical ? 'orizzontale' : 'verticale', " sulla linea centrale."), visual: "<div class=\"symmetry\">".concat(pair[0], " <b>|</b> \u2753</div>"), options: NS.uniqueOptions(answer, ['◀', '▶', '▲', '▼', '◢', '◣', '◤', '◥', '↙', '↘', '↗']), answer: answer, hint: vertical ? 'La parte alta deve riflettersi in basso.' : 'La parte sinistra deve riflettersi a destra.' };
    }
    function qCompleteDrawing(level) {
        var band = NS.levelBand(level), a = NS.pick(SHAPES), b = NS.pick(SHAPES.filter(function (x) { return x !== a; })), c1 = NS.pick(COLORS), c2 = NS.pick(COLORS.filter(function (x) { return x !== c1; }));
        var token = function (c, s) { return c + s; };
        var seq, answer, hint;
        if (band <= 2) {
            seq = [token(c1, a), token(c1, b), token(c2, a), token(c2, b)];
            answer = token(c1, a);
            hint = 'Cambiano prima la forma e poi il colore.';
        }
        else {
            seq = [token(c1, a), token(c2, b), token(c1, b), token(c2, a), token(c1, a)];
            answer = token(c2, b);
            hint = 'Colore e forma seguono due alternanze diverse.';
        }
        return { prompt: 'Completa il disegno', visual: "<div class=\"pieceStrip\">".concat(seq.join(' '), " \u2753</div>"), options: NS.uniqueOptions(answer, [token(c1, a), token(c1, b), token(c2, a), token(c2, b)]), answer: answer, hint: hint };
    }
    function qSecretRule(level) {
        var band = NS.levelBand(level), rule = NS.rnd(0, band >= 4 ? 2 : 1);
        if (rule === 0) {
            var goodColor_1 = NS.pick(COLORS.slice(0, 4)), goodShape_1 = NS.pick(SHAPES.slice(0, 4)), answer_6 = goodColor_1 + goodShape_1, options_1 = [answer_6, NS.pick(COLORS.filter(function (x) { return x !== goodColor_1; })) + goodShape_1, goodColor_1 + NS.pick(SHAPES.filter(function (x) { return x !== goodShape_1; })), NS.pick(COLORS.filter(function (x) { return x !== goodColor_1; })) + NS.pick(SHAPES.filter(function (x) { return x !== goodShape_1; }))];
            return { prompt: 'Quale pezzo segue la regola segreta?', sub: "Regola: deve avere il colore ".concat(goodColor_1, " E la forma ").concat(goodShape_1, "."), options: NS.shuffle(options_1), answer: answer_6, hint: 'Controlla entrambe le caratteristiche, non soltanto una.' };
        }
        if (rule === 1) {
            var answer_7 = '★★★', options_2 = ['★', '★★', '★★★', '★★★★'];
            return { prompt: 'Quale gruppo segue la regola?', sub: 'Regola: il gruppo deve contenere esattamente 3 stelle.', options: NS.shuffle(options_2), answer: answer_7, hint: 'Conta con calma gli elementi.' };
        }
        var answer = '🔴▲', options = ['🔴▲', '🔴■', '🔵▲', '🔵■'];
        return { prompt: 'Scopri il pezzo corretto', sub: 'Regola: rosso + triangolo. Devi rispettare due condizioni.', options: NS.shuffle(options), answer: answer, hint: 'Cerca prima il colore, poi verifica la forma.' };
    }
    function qOverlap(level) {
        var a = NS.pick(['●', '▲', '■', '◆']), b = NS.pick(['★', '+', '×', '○']), answer = a + b, reverse = b + a;
        if (level <= 7)
            return { prompt: 'Qual è il risultato della sovrapposizione?', visual: "<div class=\"bigVisual\">".concat(a, " + ").concat(b, " \u2192 ?</div>"), sub: 'Il risultato deve contenere entrambi i simboli.', options: NS.uniqueOptions(answer, [a, b, reverse, a + a, b + b]), answer: answer, hint: 'Nessun simbolo scompare: uniscili nello stesso pezzo.' };
        var c = NS.pick(['●', '▲', '■']), combo = a + b + c, remove = NS.pick([a, b, c]), answer2 = combo.replace(remove, '');
        return { prompt: 'Quale figura resta?', visual: "<div class=\"bigVisual\">".concat(combo, " \u2212 ").concat(remove, " \u2192 ?</div>"), options: NS.uniqueOptions(answer2, [a + b, b + c, a + c, a, b, c]), answer: answer2, hint: "Togli soltanto ".concat(remove, " dalla figura composta.") };
    }
    function qPuzzle3(level) {
        var e_4, _a, e_5, _b;
        var colors = NS.shuffle(COLORS).slice(0, 3), shapes = NS.shuffle(SHAPES).slice(0, 3), combined = level >= 9;
        if (!combined) {
            var grid_1 = [[colors[0], colors[1], colors[2]], [colors[1], colors[2], colors[0]], [colors[2], colors[0], '?']], answer_8 = colors[1];
            return { prompt: 'Completa il puzzle 3×3', sub: 'Ogni riga e colonna usa i tre colori una volta sola.', visual: "<div class=\"matrix3\">".concat(grid_1.flat().map(function (x) { return "<i>".concat(x, "</i>"); }).join(''), "</div>"), options: NS.uniqueOptions(answer_8, COLORS), answer: answer_8, hint: 'Controlla contemporaneamente riga e colonna.' };
        }
        var tok = function (r, c) { return colors[r] + shapes[c]; }, grid = [[tok(0, 0), tok(1, 1), tok(2, 2)], [tok(1, 2), tok(2, 0), tok(0, 1)], [tok(2, 1), tok(0, 2), '?']], answer = tok(1, 0), pool = [];
        try {
            for (var colors_1 = __values(colors), colors_1_1 = colors_1.next(); !colors_1_1.done; colors_1_1 = colors_1.next()) {
                var c = colors_1_1.value;
                try {
                    for (var shapes_1 = (e_5 = void 0, __values(shapes)), shapes_1_1 = shapes_1.next(); !shapes_1_1.done; shapes_1_1 = shapes_1.next()) {
                        var s = shapes_1_1.value;
                        pool.push(c + s);
                    }
                }
                catch (e_5_1) { e_5 = { error: e_5_1 }; }
                finally {
                    try {
                        if (shapes_1_1 && !shapes_1_1.done && (_b = shapes_1.return)) _b.call(shapes_1);
                    }
                    finally { if (e_5) throw e_5.error; }
                }
            }
        }
        catch (e_4_1) { e_4 = { error: e_4_1 }; }
        finally {
            try {
                if (colors_1_1 && !colors_1_1.done && (_a = colors_1.return)) _a.call(colors_1);
            }
            finally { if (e_4) throw e_4.error; }
        }
        return { prompt: 'Completa il puzzle avanzato', sub: 'Colore e forma seguono due schemi contemporaneamente.', visual: "<div class=\"matrix3 compact\">".concat(grid.flat().map(function (x) { return "<i>".concat(x, "</i>"); }).join(''), "</div>"), options: NS.uniqueOptions(answer, pool, 4), answer: answer, hint: 'Controlla separatamente la sequenza dei colori e quella delle forme.' };
    }
    NS.VisualGames = { 8: qShapes, 9: qMatrix, 10: qMirror, 11: qBlocks, 12: qMaze, 13: qLights, 14: qMemory, 15: qRobot, 21: qMissingPiece, 22: qColorMatrix, 23: qShapeMatrix, 24: qVisualOdd, 25: qRotation, 26: qSymmetry, 27: qCompleteDrawing, 28: qSecretRule, 29: qOverlap, 30: qPuzzle3 };
})(window.LogicLand);
