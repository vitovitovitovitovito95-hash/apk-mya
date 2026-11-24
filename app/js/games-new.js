'use strict';
(function (NS) {
    // Real interactive, deterministic-in-difficulty activities for the 6-year-old track.
    var active = null;
    function stop() { if (active) {
        active.stopped = true;
        active = null;
    } }
    NS.stopPuzzle = stop;
    var COLOR = ['#ff506a', '#20baff', '#fac843', '#37ca77', '#a06dff', '#ff9637'];
    function root(opts) { stop(); var el = document.getElementById(opts.mountId); if (!el)
        return null; active = { stopped: false }; return el; }
    function title(el, heading, description, body) { el.innerHTML = '<div class="puzzleHeading"><strong>' + heading + '</strong><p>' + description + '</p></div>' + body + '<div class="puzzleHint" id="puzzleMsg" aria-live="polite"></div>'; }
    function say(el, txt) { var t = el.querySelector('#puzzleMsg'); if (t)
        t.textContent = txt; }
    function mistake(opts, msg) { return opts.onMistake ? opts.onMistake(msg) : true; }
    function ok(opts) { stop(); if (opts.onProgress)
        opts.onProgress(1, 'Completato!'); if (opts.onSuccess)
        opts.onSuccess(); }
    function profile(level, game) {
        var i = level - 1;
        return Object.assign({ level: level, load: 100 + level * 25 }, {
            unblock: { obstacles: Math.min(4, 1 + Math.floor(i / 3)), extraMoves: i + 2, blockSize: i >= 9 ? 3 : 2 },
            dots: { size: 4 + Math.floor(i / 3), pairs: Math.min(5, 2 + Math.floor(i / 3)), segments: (4 + Math.floor(i / 3)) * Math.min(5, 2 + Math.floor(i / 3)) },
            water: { colors: Math.min(5, 2 + Math.floor(i / 3)), capacity: i >= 5 ? 4 : 3, mixes: 4 + level * 2 },
            checkers: { captures: 1 + Math.floor(i / 5), decoys: i },
            chess: { steps: 1 + Math.floor(i / 5), blockers: Math.floor(i / 3), piece: Math.min(5, Math.floor(i / 2)) }
        }[game]);
    }
    NS.newGameProfile = profile;
    function unblock(opts) {
        var el = root(opts);
        if (!el)
            return;
        var cfg = profile(opts.level, 'unblock'), count = cfg.obstacles, blocks = [{ x: 0, y: 2, w: 2, h: 1, red: true }];
        for (var i = 0; i < count; i++)
            blocks.push({ x: 2 + i, y: 1, w: 1, h: cfg.blockSize, red: false });
        // Level-dependent harmless wooden blocks at the left edge add visual choice.
        if (opts.level >= 7)
            blocks.push({ x: 0, y: 4, w: 2, h: 1 });
        if (opts.level >= 12)
            blocks.push({ x: 0, y: 5, w: 2, h: 1 });
        var sel = 0, moves = 0, limit = 6 + count * 4 + Math.max(0, 15 - opts.level);
        function occupy(x, y, index) { return blocks.some(function (b, j) { return j !== index && x >= b.x && x < b.x + b.w && y >= b.y && y < b.y + b.h; }); }
        function move(dx, dy) {
            var b = blocks[sel];
            if (!b)
                return;
            if (b.w > b.h && dy || b.h > b.w && dx)
                return say(el, 'Sposta il blocco lungo la sua direzione.');
            var nx = b.x + dx, ny = b.y + dy;
            if (nx < 0 || ny < 0 || nx + b.w > 6 || ny + b.h > 6)
                return say(el, 'Questo blocco non può uscire dalla tavola.');
            for (var x = nx; x < nx + b.w; x++)
                for (var y = ny; y < ny + b.h; y++)
                    if (occupy(x, y, sel))
                        return say(el, 'C’è un altro blocco davanti.');
            b.x = nx;
            b.y = ny;
            moves++;
            if (opts.onProgress)
                opts.onProgress(Math.min(.95, (moves / limit) * .85), moves + ' mosse');
            if (blocks[0].x + blocks[0].w === 6) {
                ok(opts);
                return;
            }
            if (moves > limit) {
                if (!mistake(opts, 'Hai superato il limite di mosse.'))
                    return;
                blocks[0].x = 0;
                for (var t = 1; t <= count; t++)
                    blocks[t].y = 1;
                moves = 0;
                sel = 0;
                say(el, 'Riprova con un percorso più corto.');
            }
            render();
        }
        function render() {
            var h = '<div class="unblockBoard">';
            blocks.forEach(function (b, j) { h += '<button class="woodBlock ' + (b.red ? 'redWood ' : '') + (j === sel ? 'selectedWood' : '') + '" data-b="' + j + '" style="left:' + (b.x / 6 * 100) + '%;top:' + (b.y / 6 * 100) + '%;width:' + (b.w / 6 * 100) + '%;height:' + (b.h / 6 * 100) + '%" aria-label="Blocco ' + j + '">' + (b.red ? '➜' : '') + '</button>'; });
            h += '<span class="exitArrow">➜</span></div><div class="puzzleButtons"><button data-d="left">◀</button><button data-d="up">▲</button><button data-d="down">▼</button><button data-d="right">▶</button></div><div class="puzzleCount">Mosse: ' + moves + ' / ' + limit + '</div>';
            title(el, '🪵 Unlock Me', 'Tocca un blocco e muovilo con le frecce. Fai uscire il blocco rosso verso destra.', h);
            var items = el.querySelectorAll('[data-b]');
            for (var t = 0; t < items.length; t++)
                items[t].onclick = function () { sel = Number(this.getAttribute('data-b')); render(); };
            var bs = el.querySelectorAll('[data-d]');
            for (var t = 0; t < bs.length; t++)
                bs[t].onclick = function () { var d = this.getAttribute('data-d'); move(d === 'left' ? -1 : d === 'right' ? 1 : 0, d === 'up' ? -1 : d === 'down' ? 1 : 0); };
        }
        render();
        return active;
    }
    function dots(opts) {
        var el = root(opts);
        if (!el)
            return;
        var cfg = profile(opts.level, 'dots'), n = cfg.size, k = Math.min(cfg.pairs, n), ends = {}, cells = {}, activeColor = -1;
        for (var color = 0; color < k; color++) {
            ends['0,' + color] = color;
            ends[(n - 1) + ',' + color] = color;
        }
        var paths = Array.from({ length: k }, function () { return []; });
        function render() {
            var h = '<div class="dotsBoard" style="grid-template-columns:repeat(' + n + ',1fr)">';
            for (var y = 0; y < n; y++)
                for (var x = 0; x < n; x++) {
                    var key = x + ',' + y, c = ends[key], draw = null;
                    for (var p = 0; p < k; p++)
                        if (paths[p].some(function (q) { return q.x === x && q.y === y; }))
                            draw = p;
                    h += '<button class="dotCell" data-x="' + x + '" data-y="' + y + '" style="width:' + (100 / n) + '%;height:' + (100 / n) + '%">' + (c !== undefined ? '<b class="dotEnd" style="background:' + COLOR[c] + '"></b>' : draw !== null ? '<i class="dotPath" style="background:' + COLOR[draw] + '"></i>' : '') + '</button>';
                }
            h += '</div><p class="puzzleSmall">Tocca un punto colorato, poi le caselle vicine fino al punto dello stesso colore. I percorsi non si sovrappongono.</p>';
            title(el, '🔗 Connect the Dots', 'Collega tutte le coppie senza incrociare le linee.', h);
            var buttons = el.querySelectorAll('[data-x]');
            for (var i = 0; i < buttons.length; i++)
                buttons[i].onclick = function () { tap(+this.getAttribute('data-x'), +this.getAttribute('data-y')); };
        }
        function tap(x, y) {
            var key = x + ',' + y, c = ends[key];
            if (c !== undefined && paths[c].length === 0) {
                activeColor = c;
                paths[c] = [{ x: x, y: y }];
                render();
                return;
            }
            if (activeColor < 0) {
                say(el, 'Prima scegli un punto colorato.');
                return;
            }
            var path = paths[activeColor], last = path[path.length - 1];
            if (Math.abs(last.x - x) + Math.abs(last.y - y) !== 1) {
                say(el, 'Scegli una casella vicina.');
                return;
            }
            if (paths.some(function (pp) { return pp.some(function (q) { return q.x === x && q.y === y; }); }) || (c !== undefined && c !== activeColor)) {
                say(el, 'Le linee non possono sovrapporsi.');
                return;
            }
            path.push({ x: x, y: y });
            if (c === activeColor) {
                activeColor = -1;
            }
            if (opts.onProgress)
                opts.onProgress(paths.filter(function (p) { return p.length && ends[p[p.length - 1].x + ',' + p[p.length - 1].y] !== undefined && p.length > 1; }).length / k, 'Coppie collegate');
            if (paths.every(function (p, i) { return p.length > 1 && ends[p[p.length - 1].x + ',' + p[p.length - 1].y] === i; })) {
                ok(opts);
                return;
            }
            render();
        }
        render();
        return active;
    }
    function water(opts) {
        var el = root(opts);
        if (!el)
            return;
        var cfg = profile(opts.level, 'water'), cap = cfg.capacity, num = cfg.colors;
        var tubes = Array.from({ length: num + 2 }, function (_, i) { return i < num ? Array(cap).fill(i) : []; });
        var rng = (function () { var x = 9871 + opts.level * 313; return function (n) { x ^= x << 13; x ^= x >>> 17; x ^= x << 5; return (x >>> 0) % n; }; })();
        // Reverse-move generation, with a recorded reverse witness: therefore every puzzle is solvable.
        var witness = [];
        for (var t = 0; t < cfg.mixes; t++) {
            var available = [];
            for (var i = 0; i < tubes.length; i++) {
                var src = tubes[i];
                if (!src.length)
                    continue;
                var top = src[src.length - 1];
                if (src.length > 1 && src[src.length - 2] !== top)
                    continue;
                for (var j = 0; j < tubes.length; j++)
                    if (i !== j && tubes[j].length < cap && (!tubes[j].length || tubes[j][tubes[j].length - 1] !== top))
                        available.push([i, j]);
            }
            if (!available.length)
                break;
            var p = available[rng(available.length)], color = tubes[p[0]].pop();
            tubes[p[1]].push(color);
            witness.unshift([p[1], p[0]]);
        }
        var selected = -1, moves = 0, limit = cfg.mixes * 3 + 10;
        function done() { return tubes.every(function (a) { return !a.length || (a.length === cap && a.every(function (c) { return c === a[0]; })); }); }
        function tap(i) {
            if (selected < 0) {
                if (tubes[i].length) {
                    selected = i;
                    render();
                }
                return;
            }
            if (i === selected) {
                selected = -1;
                render();
                return;
            }
            var from = tubes[selected], to = tubes[i];
            if (!from.length || to.length >= cap) {
                say(el, 'Scegli una provetta con spazio disponibile.');
                return;
            }
            var c = from[from.length - 1];
            if (to.length && to[to.length - 1] !== c) {
                say(el, 'Puoi versare solo su un colore uguale o in una provetta vuota.');
                return;
            }
            var moved = 0;
            while (from.length && from[from.length - 1] === c && to.length < cap) {
                to.push(from.pop());
                moved++;
            }
            moves++;
            selected = -1;
            if (opts.onProgress)
                opts.onProgress(Math.min(.94, moves / limit), 'Versamenti: ' + moves);
            if (done()) {
                ok(opts);
                return;
            }
            if (moves > limit) {
                if (!mistake(opts, 'Hai esaurito i versamenti disponibili.'))
                    return;
                moves = 0;
                say(el, 'Ti resta una possibilità: prova a pianificare le mosse.');
            }
            render();
        }
        function render() {
            var h = '<div class="waterRack">';
            tubes.forEach(function (a, i) { h += '<button class="waterTube ' + (i === selected ? 'activeTube' : '') + '" data-tube="' + i + '" aria-label="Provetta ' + (i + 1) + '">'; for (var s = cap - 1; s >= 0; s--)
                h += '<span class="waterLayer" style="background:' + (a[s] !== undefined ? COLOR[a[s]] : 'transparent') + '"></span>'; h += '</button>'; });
            h += '</div><div class="puzzleCount">Versamenti: ' + moves + ' / ' + limit + ' • ' + num + ' colori</div>';
            title(el, '🧪 Water Sort Puzzle', 'Separa i colori: ogni provetta piena deve contenere un solo colore.', h);
            var b = el.querySelectorAll('[data-tube]');
            for (var k = 0; k < b.length; k++)
                b[k].onclick = function () { tap(+this.getAttribute('data-tube')); };
        }
        render();
        return active;
    }
    function checkers(opts) {
        var el = root(opts);
        if (!el)
            return;
        var cfg = profile(opts.level, 'checkers'), N = 8, chain = cfg.captures, own = { x: 1, y: 7 }, enemies = [], captured = 0, selected = true;
        for (var i = 0; i < chain; i++)
            enemies.push({ x: 2 + i * 2, y: 6 - i * 2 });
        var reserved = new Set(['1,7', '2,6', '3,5', '4,4', '5,3', '6,2', '7,1']);
        var decoys = [];
        for (var yy = 0; yy < 8; yy++)
            for (var xx = 0; xx < 8; xx++)
                if ((xx + yy) % 2 === 0 && !reserved.has(xx + ',' + yy) && decoys.length < cfg.decoys)
                    decoys.push({ x: xx, y: yy });
        function render() {
            var h = '<div class="chessBoard">';
            for (var y = 0; y < 8; y++)
                for (var x = 0; x < 8; x++) {
                    var piece = own.x === x && own.y === y ? '⚫' : enemies.some(function (e) { return e.x === x && e.y === y; }) ? '⚪' : decoys.some(function (e) { return e.x === x && e.y === y; }) ? '◌' : '';
                    h += '<button class="chessSquare ' + ((x + y) % 2 ? 'darkSq' : 'lightSq') + '" data-x="' + x + '" data-y="' + y + '">' + piece + '</button>';
                }
            h += '</div><p class="puzzleSmall">Muovi la pedina nera saltando in diagonale sopra le pedine bianche. Catture necessarie: ' + chain + '. Ignora le caselle con ◌.</p>';
            title(el, '♟ Dama Junior', 'Completa la sfida di cattura.', h);
            var b = el.querySelectorAll('[data-x]');
            for (var i = 0; i < b.length; i++)
                b[i].onclick = function () { tap(+this.getAttribute('data-x'), +this.getAttribute('data-y')); };
        }
        function tap(x, y) {
            if (x === own.x && y === own.y) {
                selected = true;
                return;
            }
            if (!selected)
                return;
            var dx = x - own.x, dy = y - own.y;
            if (Math.abs(dx) !== 2 || dy !== -2) {
                say(el, 'Per catturare salta di due caselle in diagonale.');
                if (!mistake(opts, 'Mossa di dama errata.'))
                    return;
                return;
            }
            var midx = own.x + dx / 2, midy = own.y - 1, ix = enemies.findIndex(function (e) { return e.x === midx && e.y === midy; });
            if (ix < 0) {
                say(el, 'Tra partenza e arrivo deve esserci una pedina bianca.');
                if (!mistake(opts, 'Non c’è una pedina da catturare.'))
                    return;
                return;
            }
            enemies.splice(ix, 1);
            own = { x: x, y: y };
            captured++;
            if (opts.onProgress)
                opts.onProgress(captured / chain, captured + '/' + chain + ' catture');
            if (captured >= chain) {
                ok(opts);
                return;
            }
            render();
        }
        render();
        return active;
    }
    function chess(opts) {
        var el = root(opts);
        if (!el)
            return;
        var level = opts.level, cfg = profile(level, 'chess');
        var pieces = [{ s: '♖', name: 'torre', move: 'Muove in linea retta, lungo righe o colonne.' },
            { s: '♗', name: 'alfiere', move: 'Muove in diagonale.' }, { s: '♘', name: 'cavallo', move: 'Salta a L: due caselle in una direzione e una nell’altra.' },
            { s: '♕', name: 'regina', move: 'Muove in linea retta o in diagonale.' }, { s: '♔', name: 're', move: 'Muove di una casella in ogni direzione.' }, { s: '♙', name: 'pedone', move: 'Muove in avanti di una casella.' }];
        var idx = Math.min(5, Math.floor((level - 1) / 3)), p = pieces[idx], turn = 0, stages = cfg.steps;
        var start = { x: idx === 5 ? 3 : 2, y: idx === 5 ? 6 : 4 }, pos = { x: start.x, y: start.y }, targets = [], block = [];
        for (var k = 0; k < stages; k++) {
            var candidates = [];
            for (var yy = 0; yy < 8; yy++)
                for (var xx = 0; xx < 8; xx++)
                    if (legal(pos, { x: xx, y: yy }))
                        candidates.push({ x: xx, y: yy });
            if (!candidates.length)
                break;
            var next = candidates[(level + k * 11) % candidates.length];
            targets.push(next);
            pos = next;
        }
        pos = start;
        stages = targets.length;
        function legal(a, b) {
            var dx = b.x - a.x, dy = b.y - a.y, ad = Math.abs(dx), bd = Math.abs(dy);
            if (!dx && !dy)
                return false;
            if (idx === 0)
                return (dx === 0 || dy === 0);
            if (idx === 1)
                return ad === bd;
            if (idx === 2)
                return (ad === 2 && bd === 1) || (ad === 1 && bd === 2);
            if (idx === 3)
                return dx === 0 || dy === 0 || ad === bd;
            if (idx === 4)
                return ad <= 1 && bd <= 1;
            return dx === 0 && dy === -1;
        }
        function render() {
            var target = targets[turn];
            var h = '<div class="chessBoard">';
            for (var y = 0; y < 8; y++)
                for (var x = 0; x < 8; x++) {
                    var mark = target && target.x === x && target.y === y, has = pos.x === x && pos.y === y;
                    h += '<button class="chessSquare ' + ((x + y) % 2 ? 'darkSq' : 'lightSq') + (mark ? ' targetSq' : '') + '" data-x="' + x + '" data-y="' + y + '">' + (has ? p.s : mark ? '★' : '') + '</button>';
                }
            h += '</div><p class="puzzleSmall">' + p.move + '<br>Porta il pezzo fino alla stella dorata. Passaggio ' + (turn + 1) + '/' + stages + '.</p>';
            title(el, '♜ Scacchi Junior', 'Impara a muovere il ' + p.name + '.', h);
            var b = el.querySelectorAll('[data-x]');
            for (var i = 0; i < b.length; i++)
                b[i].onclick = function () { tap(+this.getAttribute('data-x'), +this.getAttribute('data-y')); };
        }
        function tap(x, y) {
            var t = targets[turn];
            if (!t)
                return;
            if (!legal(pos, { x: x, y: y }) || t.x !== x || t.y !== y) {
                say(el, 'Osserva il movimento del pezzo e cerca la stella.');
                if (!mistake(opts, 'Mossa non corretta.'))
                    return;
                return;
            }
            pos = { x: x, y: y };
            turn++;
            if (opts.onProgress)
                opts.onProgress(turn / stages, turn + '/' + stages + ' tappe');
            if (turn >= stages) {
                ok(opts);
                return;
            }
            render();
        }
        render();
        return active;
    }
    NS.PuzzleGames = { unblock: unblock, dots: dots, water: water, checkers: checkers, chess: chess };
})(window.LogicLand);
