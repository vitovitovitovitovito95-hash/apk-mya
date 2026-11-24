'use strict';
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
window.LogicLand = window.LogicLand || {};
(function (NS) {
    NS.APP_VERSION = '9.1.0';
    NS.SCHEMA_VERSION = 8;
    NS.MIN_AGE = 6;
    NS.MAX_AGE = 6;
    NS.MAX_LEVEL = 15;
    NS.QUESTIONS_PER_LEVEL = 5;
    // v9: più domande per livello (6 → 8), contenuti partono 3 livelli più avanti,
    // e un tempo massimo per risposta che si accorcia a ogni livello (30s → 9s).
    NS.questionsFor = function (level) { return 6 + Math.floor((NS.clamp(Number(level) || 1, 1, 15) - 1) / 5); };
    NS.contentLevel = function (level) { return Math.min(15, (NS.clamp(Number(level) || 1, 1, 15)) + 3); };
    NS.secondsFor = function (level) { return Math.max(9, Math.round(31.5 - NS.clamp(Number(level) || 1, 1, 15) * 1.5)); };
    NS.STARTING_LIVES = 3;
    NS.MAX_ERRORS_PER_LEVEL = 2;
    NS.DAY_MS = 86400000;
    NS.LEVEL_PROFILES = Array.from({ length: NS.MAX_LEVEL }, function (_, i) {
        var level = i + 1;
        return {
            level: level,
            score: level * 100,
            stage: Math.ceil(level / 3),
            withinStage: (level - 1) % 3 + 1,
            choices: Math.min(6, 2 + Math.ceil(level / 4)),
            visibleItems: 3 + Math.floor((level + 1) / 2),
            memoryItems: 3 + Math.floor(level / 2),
            numericMax: 10 + level * level,
            steps: 1 + Math.floor((level - 1) / 3),
            simultaneousRules: 1 + Math.floor((level - 1) / 4),
            distractorSimilarity: level,
            hintStrength: Math.max(1, 6 - Math.ceil(level / 3))
        };
    });
    NS.ARCADE_PROFILES = Array.from({ length: NS.MAX_LEVEL }, function (_, i) {
        var level = i + 1;
        return {
            level: level,
            tetris: {
                targetLines: 2 + level,
                fallMs: Math.max(200, 820 - (level - 1) * 44),
                pieceTypes: Math.min(7, 3 + Math.floor((level + 1) / 2)),
                garbageRows: Math.floor((level + 1) / 3)
            },
            dodge: {
                targetObstacles: 6 + Math.floor(level * 1.5),
                speed: 2.6 + (level - 1) * 0.26,
                spawnMs: Math.max(520, 1300 - (level - 1) * 55),
                gapPx: Math.max(80, 160 - (level - 1) * 5.5),
                playerStep: Math.min(34, 22 + Math.floor(level / 2))
            }
        };
    });
    NS.arcadeProfile = function (level) {
        return NS.ARCADE_PROFILES[NS.clamp(Number(level) || 1, 1, NS.MAX_LEVEL) - 1];
    };
    NS.levelProfile = function (level) {
        return NS.LEVEL_PROFILES[NS.clamp(Number(level) || 1, 1, NS.MAX_LEVEL) - 1];
    };
    NS.difficultyLabel = function (level) {
        var p = NS.levelProfile(level);
        return "Difficolt\u00E0 ".concat(p.level, "/").concat(NS.MAX_LEVEL, " \u2022 ").concat(p.simultaneousRules, " ").concat(p.simultaneousRules === 1 ? 'regola' : 'regole', " \u2022 ").concat(p.steps, " ").concat(p.steps === 1 ? 'passaggio' : 'passaggi');
    };
    NS.attachDifficulty = function (question, gameId, level) {
        var q = question || {}, p = NS.levelProfile(level);
        q.meta = __assign(__assign({}, (q.meta || {})), { gameId: Number(gameId), level: p.level, difficultyScore: p.score, stage: p.stage, steps: p.steps, rules: p.simultaneousRules });
        q.difficulty = p;
        return q;
    };
    NS.escapeHtml = function (value) {
        return String(value).replace(/[&<>"']/g, function (ch) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]); });
    };
    NS.shuffle = function (input) {
        var _a;
        var a = __spreadArray([], __read(input), false);
        for (var i = a.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            _a = __read([a[j], a[i]], 2), a[i] = _a[0], a[j] = _a[1];
        }
        return a;
    };
    NS.rnd = function (a, b) { return Math.floor(Math.random() * (b - a + 1)) + a; };
    NS.clamp = function (n, min, max) { return Math.max(min, Math.min(max, n)); };
    NS.pick = function (arr) { return arr[NS.rnd(0, arr.length - 1)]; };
    NS.uniqueOptions = function (answer, pool, count) {
        if (count === void 0) { count = 4; }
        var all = __spreadArray([String(answer)], __read(NS.shuffle(pool.map(String).filter(function (x) { return x !== String(answer); }))), false);
        return NS.shuffle(__spreadArray([], __read(new Set(all)), false).slice(0, count));
    };
    NS.levelBand = function (level) {
        if (level <= 2)
            return 1;
        if (level <= 4)
            return 2;
        if (level <= 6)
            return 3;
        if (level <= 8)
            return 4;
        if (level <= 10)
            return 5;
        if (level <= 12)
            return 6;
        if (level <= 14)
            return 7;
        return 8;
    };
    NS.localDateKey = function (date) {
        if (date === void 0) { date = new Date(); }
        var y = date.getFullYear();
        var m = String(date.getMonth() + 1).padStart(2, '0');
        var d = String(date.getDate()).padStart(2, '0');
        return "".concat(y, "-").concat(m, "-").concat(d);
    };
    NS.daysBetween = function (a, b) {
        var x = new Date(a + 'T12:00:00');
        var y = new Date(b + 'T12:00:00');
        return Math.round((y - x) / NS.DAY_MS);
    };
    NS.safeB64Encode = function (text) { return btoa(unescape(encodeURIComponent(text))); };
    NS.safeB64Decode = function (text) { return decodeURIComponent(escape(atob(text))); };
})(window.LogicLand);
