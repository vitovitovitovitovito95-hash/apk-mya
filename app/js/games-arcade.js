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
    var activeController = null;
    function stopActive() {
        var _a;
        try {
            (_a = activeController === null || activeController === void 0 ? void 0 : activeController.stop) === null || _a === void 0 ? void 0 : _a.call(activeController);
        }
        catch (_e) { }
        activeController = null;
    }
    NS.stopArcade = stopActive;
    var TETROMINOES = [
        [[1, 1, 1, 1]],
        [[1, 1], [1, 1]],
        [[0, 1, 0], [1, 1, 1]],
        [[1, 0, 0], [1, 1, 1]],
        [[0, 0, 1], [1, 1, 1]],
        [[0, 1, 1], [1, 1, 0]],
        [[1, 1, 0], [0, 1, 1]]
    ];
    function rotateMatrix(m) {
        var h = m.length, w = m[0].length;
        return Array.from({ length: w }, function (_, x) { return Array.from({ length: h }, function (_, y) { return m[h - 1 - y][x]; }); });
    }
    function boardScale(cols, rows, targetWidth) {
        var cell = Math.max(16, Math.floor(targetWidth / cols) - 2);
        return { cell: cell, w: cell * cols, h: cell * rows };
    }
    function startTetris(opts) {
        var _a;
        stopActive();
        var profile = NS.arcadeProfile(opts.level).tetris;
        var rows = 16, cols = 10;
        var board = Array.from({ length: rows }, function () { return Array(cols).fill(0); });
        var piece = null, lines = 0, timer = null, stopped = false;
        var el = document.getElementById(opts.mountId);
        if (!el)
            return null;
        function addGarbage() {
            var _loop_1 = function (r) {
                var hole = NS.rnd(0, cols - 1);
                board.shift();
                board.push(Array.from({ length: cols }, function (_, c) { return c === hole ? 0 : 8; }));
            };
            for (var r = 0; r < profile.garbageRows; r++) {
                _loop_1(r);
            }
        }
        addGarbage();
        function newPiece() {
            var _a;
            var idx = NS.rnd(0, profile.pieceTypes - 1);
            piece = { shape: TETROMINOES[idx].map(function (r) { return r.slice(); }), x: Math.floor((cols - TETROMINOES[idx][0].length) / 2), y: 0, type: idx + 1 };
            if (collides(piece.x, piece.y, piece.shape)) {
                var canContinue = (_a = opts.onMistake) === null || _a === void 0 ? void 0 : _a.call(opts, 'La torre ha raggiunto la cima!');
                if (!canContinue) {
                    stop();
                    return false;
                }
                board = Array.from({ length: rows }, function () { return Array(cols).fill(0); });
                addGarbage();
                piece = { shape: TETROMINOES[idx].map(function (r) { return r.slice(); }), x: Math.floor((cols - TETROMINOES[idx][0].length) / 2), y: 0, type: idx + 1 };
            }
            return true;
        }
        function collides(nx, ny, shape) {
            for (var r = 0; r < shape.length; r++)
                for (var c = 0; c < shape[r].length; c++)
                    if (shape[r][c]) {
                        var x = nx + c, y = ny + r;
                        if (x < 0 || x >= cols || y >= rows)
                            return true;
                        if (y >= 0 && board[y][x])
                            return true;
                    }
            return false;
        }
        function merge() {
            var _a, _b;
            piece.shape.forEach(function (row, r) { return row.forEach(function (v, c) {
                var y = piece.y + r, x = piece.x + c;
                if (v && y >= 0 && y < rows && x >= 0 && x < cols)
                    board[y][x] = piece.type;
            }); });
            var kept = board.filter(function (row) { return row.some(function (v) { return !v; }); });
            var cleared = rows - kept.length;
            if (cleared) {
                lines += cleared;
                board = __spreadArray(__spreadArray([], __read(Array.from({ length: cleared }, function () { return Array(cols).fill(0); })), false), __read(kept), false);
                (_a = opts.onProgress) === null || _a === void 0 ? void 0 : _a.call(opts, Math.min(1, lines / profile.targetLines), "".concat(lines, "/").concat(profile.targetLines, " righe"));
                if (lines >= profile.targetLines) {
                    render();
                    stop();
                    (_b = opts.onSuccess) === null || _b === void 0 ? void 0 : _b.call(opts);
                    return;
                }
            }
            newPiece();
        }
        function move(dx, dy) {
            if (stopped || !piece)
                return false;
            if (!collides(piece.x + dx, piece.y + dy, piece.shape)) {
                piece.x += dx;
                piece.y += dy;
                render();
                return true;
            }
            if (dy > 0)
                merge();
            return false;
        }
        function rotate() {
            var e_1, _a;
            if (stopped || !piece)
                return;
            var next = rotateMatrix(piece.shape);
            try {
                for (var _b = __values([0, -1, 1, -2, 2]), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var kick = _c.value;
                    if (!collides(piece.x + kick, piece.y, next)) {
                        piece.x += kick;
                        piece.shape = next;
                        render();
                        return;
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_1) throw e_1.error; }
            }
        }
        function hardDrop() {
            if (stopped || !piece)
                return;
            while (!collides(piece.x, piece.y + 1, piece.shape))
                piece.y++;
            merge();
            render();
        }
        function render() {
            var _a, _b, _c, _d, _f;
            if (!el || stopped)
                return;
            var view = board.map(function (row) { return row.slice(); });
            if (piece)
                piece.shape.forEach(function (row, r) { return row.forEach(function (v, c) {
                    var y = piece.y + r, x = piece.x + c;
                    if (v && y >= 0 && y < rows && x >= 0 && x < cols)
                        view[y][x] = piece.type;
                }); });
            var scale = boardScale(cols, rows, Math.min(window.innerWidth * 0.74, 360));
            var cells = view.flat().map(function (v) { return "<div class=\"tcell ".concat(v ? 'filled f' + v : '', "\"></div>"); }).join('');
            el.innerHTML = "<div class=\"arcadeInfo\"><b>Righe: ".concat(lines, "/").concat(profile.targetLines, "</b><span>Velocit\u00E0 ").concat(Math.round(1000 / profile.fallMs * 10) / 10, "\u00D7</span></div><div class=\"tetrisBoard\" style=\"width:").concat(scale.w, "px;height:").concat(scale.h, "px\">").concat(cells, "</div><div class=\"arcadeControls\"><button data-a=\"left\">\u2B05\uFE0F</button><button data-a=\"rotate\">\uD83D\uDD04</button><button data-a=\"right\">\u27A1\uFE0F</button><button data-a=\"down\">\u2B07\uFE0F</button><button data-a=\"drop\">\u23EC</button></div>");
            (_a = el.querySelector('[data-a="left"]')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', function () { return move(-1, 0); });
            (_b = el.querySelector('[data-a="right"]')) === null || _b === void 0 ? void 0 : _b.addEventListener('click', function () { return move(1, 0); });
            (_c = el.querySelector('[data-a="down"]')) === null || _c === void 0 ? void 0 : _c.addEventListener('click', function () { return move(0, 1); });
            (_d = el.querySelector('[data-a="rotate"]')) === null || _d === void 0 ? void 0 : _d.addEventListener('click', rotate);
            (_f = el.querySelector('[data-a="drop"]')) === null || _f === void 0 ? void 0 : _f.addEventListener('click', hardDrop);
        }
        function stop() { stopped = true; if (timer)
            clearInterval(timer); timer = null; window.removeEventListener('resize', render); window.removeEventListener('orientationchange', render); }
        if (newPiece()) {
            render();
            (_a = opts.onProgress) === null || _a === void 0 ? void 0 : _a.call(opts, 0, "0/".concat(profile.targetLines, " righe"));
            timer = setInterval(function () { return move(0, 1); }, profile.fallMs);
            window.addEventListener('resize', render);
            window.addEventListener('orientationchange', render);
        }
        activeController = { stop: stop };
        return activeController;
    }
    function startDodge(opts) {
        var _a, _b, _c;
        stopActive();
        var profile = NS.arcadeProfile(opts.level).dodge;
        var el = document.getElementById(opts.mountId);
        if (!el)
            return null;
        var W = 320, H = 420, player = { x: 42, y: H / 2 - 18, w: 34, h: 34 };
        var obstacles = [], passed = 0, lastSpawn = 0, lastTs = 0, raf = 0, stopped = false, invincibleUntil = 0;
        el.innerHTML = "<div class=\"arcadeInfo\"><b>Ostacoli: <span id=\"dodgePassed\">0</span>/".concat(profile.targetObstacles, "</b><span>Velocit\u00E0 ").concat(profile.speed.toFixed(1), "</span></div><div class=\"dodgeField\" id=\"dodgeField\"><div class=\"blobPlayer\" id=\"blobPlayer\">\u25CF</div></div><div class=\"arcadeControls dodgeControls\"><button data-m=\"up\">\u2B06\uFE0F SU</button><button data-m=\"down\">\u2B07\uFE0F GI\u00D9</button></div>");
        var field = el.querySelector('#dodgeField'), blob = el.querySelector('#blobPlayer'), counter = el.querySelector('#dodgePassed');
        function setPlayer() { blob.style.transform = "translate(".concat(player.x, "px,").concat(player.y, "px)"); }
        function movePlayer(d) { player.y = NS.clamp(player.y + d, 4, H - player.h - 4); setPlayer(); }
        (_a = el.querySelector('[data-m="up"]')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', function () { return movePlayer(-profile.playerStep); });
        (_b = el.querySelector('[data-m="down"]')) === null || _b === void 0 ? void 0 : _b.addEventListener('click', function () { return movePlayer(profile.playerStep); });
        function moveFromClientY(clientY) { var r = field.getBoundingClientRect(), y = (clientY - r.top) / r.height * H; player.y = NS.clamp(y - player.h / 2, 4, H - player.h - 4); setPlayer(); }
        field.addEventListener('pointerdown', function (e) { return moveFromClientY(e.clientY); });
        field.addEventListener('touchstart', function (e) { if (e.touches && e.touches[0]) {
            e.preventDefault();
            moveFromClientY(e.touches[0].clientY);
        } }, { passive: false });
        field.addEventListener('click', function (e) { return moveFromClientY(e.clientY); });
        setPlayer();
        function spawn() {
            var margin = 45, gap = profile.gapPx, gapTop = NS.rnd(margin, Math.max(margin, H - margin - gap));
            var id = 'ob_' + Math.random().toString(36).slice(2);
            var item = { id: id, x: W + 20, w: 34, gapTop: gapTop, gap: gap, passed: false };
            obstacles.push(item);
            var top = document.createElement('div'), bottom = document.createElement('div');
            top.className = 'dodgeObstacle';
            bottom.className = 'dodgeObstacle';
            top.dataset.id = id;
            bottom.dataset.id = id;
            top.style.cssText = "left:".concat(item.x, "px;top:0;height:").concat(gapTop, "px;width:").concat(item.w, "px");
            bottom.style.cssText = "left:".concat(item.x, "px;top:").concat(gapTop + gap, "px;height:").concat(H - gapTop - gap, "px;width:").concat(item.w, "px");
            field.appendChild(top);
            field.appendChild(bottom);
        }
        function overlap(ax, ay, aw, ah, bx, by, bw, bh) { return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by; }
        function hit(o) {
            var topHit = overlap(player.x, player.y, player.w, player.h, o.x, 0, o.w, o.gapTop);
            var by = o.gapTop + o.gap;
            var bottomHit = overlap(player.x, player.y, player.w, player.h, o.x, by, o.w, H - by);
            return topHit || bottomHit;
        }
        function removeDom(o) { field.querySelectorAll("[data-id=\"".concat(o.id, "\"]")).forEach(function (n) { return n.remove(); }); }
        function stop() { stopped = true; if (raf)
            cancelAnimationFrame(raf); raf = 0; window.removeEventListener('resize', setPlayer); window.removeEventListener('orientationchange', setPlayer); }
        function frame(ts) {
            var e_2, _a;
            var _b, _c, _d;
            if (stopped)
                return;
            if (!lastTs) {
                lastTs = ts;
                lastSpawn = ts;
            }
            var dt = Math.min(40, ts - lastTs);
            lastTs = ts;
            if (ts - lastSpawn >= profile.spawnMs) {
                spawn();
                lastSpawn = ts;
            }
            var _loop_2 = function (o) {
                o.x -= profile.speed * (dt / 16.67);
                field.querySelectorAll("[data-id=\"".concat(o.id, "\"]")).forEach(function (n) { return n.style.left = o.x + 'px'; });
                if (!o.passed && o.x + o.w < player.x) {
                    o.passed = true;
                    passed++;
                    counter.textContent = passed;
                    (_b = opts.onProgress) === null || _b === void 0 ? void 0 : _b.call(opts, Math.min(1, passed / profile.targetObstacles), "".concat(passed, "/").concat(profile.targetObstacles, " ostacoli"));
                    if (passed >= profile.targetObstacles) {
                        stop();
                        (_c = opts.onSuccess) === null || _c === void 0 ? void 0 : _c.call(opts);
                        return { value: void 0 };
                    }
                }
                if (ts > invincibleUntil && hit(o)) {
                    invincibleUntil = ts + 1100;
                    blob.classList.add('hit');
                    setTimeout(function () { return blob.classList.remove('hit'); }, 700);
                    var canContinue = (_d = opts.onMistake) === null || _d === void 0 ? void 0 : _d.call(opts, 'Hai toccato un ostacolo!');
                    if (!canContinue) {
                        stop();
                        return { value: void 0 };
                    }
                    obstacles.forEach(removeDom);
                    obstacles = [];
                    player.y = H / 2 - player.h / 2;
                    setPlayer();
                    lastSpawn = ts;
                    return "break";
                }
            };
            try {
                for (var obstacles_1 = __values(obstacles), obstacles_1_1 = obstacles_1.next(); !obstacles_1_1.done; obstacles_1_1 = obstacles_1.next()) {
                    var o = obstacles_1_1.value;
                    var state_1 = _loop_2(o);
                    if (typeof state_1 === "object")
                        return state_1.value;
                    if (state_1 === "break")
                        break;
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (obstacles_1_1 && !obstacles_1_1.done && (_a = obstacles_1.return)) _a.call(obstacles_1);
                }
                finally { if (e_2) throw e_2.error; }
            }
            obstacles = obstacles.filter(function (o) { if (o.x + o.w < -10) {
                removeDom(o);
                return false;
            } return true; });
            raf = requestAnimationFrame(frame);
        }
        (_c = opts.onProgress) === null || _c === void 0 ? void 0 : _c.call(opts, 0, "0/".concat(profile.targetObstacles, " ostacoli"));
        raf = requestAnimationFrame(frame);
        window.addEventListener('resize', setPlayer);
        window.addEventListener('orientationchange', setPlayer);
        activeController = { stop: stop };
        return activeController;
    }
    NS.ArcadeGames = { tetris: startTetris, dodge: startDodge };
})(window.LogicLand);
