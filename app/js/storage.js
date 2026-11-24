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
(function (NS) {
    var KEY_V8 = 'logicland_kids_v8';
    var KEY_V7 = 'logicland_kids_v7';
    var KEY_V6 = 'logicland_kids_v6';
    var KEY_V5 = 'logicland_kids_v5';
    var KEY_V4 = 'logicland_kids_v4';
    var KEY_V3 = 'logicland_kids_v3';
    var KEY_V2 = 'logicland_kids_v2';
    var KEY_V1 = 'logicland_kids_v1';
    NS.defaultState = function () {
        return {
            schema: NS.SCHEMA_VERSION,
            profile: { name: 'Esploratrice', age: 6, avatar: '🦊' },
            settings: { sound: true, hints: true, animations: true },
            economy: { coins: 0, stars: 0, streak: 0, xp: 0 },
            totals: { correct: 0, wrong: 0, sessions: 0 },
            games: Object.fromEntries(NS.GAMES.map(function (g) { return [g.id, { level: 1, wins: 0, best: 0, correct: 0, wrong: 0, lastPlayed: null }]; })),
            english: { words: {} },
            daily: { date: NS.localDateKey(), gamesCompleted: 0, englishCorrect: 0, claimed: false },
            created: new Date().toISOString(),
            updated: new Date().toISOString()
        };
    };
    function migrateV1(v1) {
        var e_1, _a, e_2, _b;
        var _c;
        var out = NS.defaultState();
        if (!v1 || typeof v1 !== 'object')
            return out;
        out.economy.coins = Number(v1.coins || 0);
        out.economy.stars = Number(v1.stars || 0);
        out.economy.streak = Number(v1.streak || 0);
        out.totals.correct = Number(v1.totalCorrect || 0);
        out.totals.wrong = Number(v1.totalWrong || 0);
        try {
            for (var _d = __values(NS.GAMES), _f = _d.next(); !_f.done; _f = _d.next()) {
                var g = _f.value;
                var old = (_c = v1.games) === null || _c === void 0 ? void 0 : _c[g.id];
                if (old)
                    out.games[g.id] = __assign(__assign({}, out.games[g.id]), old);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_f && !_f.done && (_a = _d.return)) _a.call(_d);
            }
            finally { if (e_1) throw e_1.error; }
        }
        try {
            for (var _g = __values(Object.entries(v1.words || {})), _h = _g.next(); !_h.done; _h = _g.next()) {
                var _j = __read(_h.value, 2), word = _j[0], old = _j[1];
                out.english.words[word] = { correct: Number(old.right || 0), wrong: Number(old.wrong || 0), box: 1, due: Date.now(), lastSeen: Number(old.last || 0) };
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (_h && !_h.done && (_b = _g.return)) _b.call(_g);
            }
            finally { if (e_2) throw e_2.error; }
        }
        out.created = v1.created || out.created;
        out.updated = new Date().toISOString();
        return normalize(out);
    }
    function normalize(raw) {
        var e_3, _a;
        var _b;
        var base = NS.defaultState();
        if (!raw || typeof raw !== 'object')
            return base;
        var merged = __assign(__assign(__assign({}, base), raw), { profile: __assign(__assign({}, base.profile), (raw.profile || {})), settings: __assign(__assign({}, base.settings), (raw.settings || {})), economy: __assign(__assign({}, base.economy), (raw.economy || {})), totals: __assign(__assign({}, base.totals), (raw.totals || {})), games: Object.fromEntries(NS.GAMES.map(function (g) { var _a, _b; return [g.id, __assign(__assign({}, base.games[g.id]), (((_a = raw.games) === null || _a === void 0 ? void 0 : _a[g.id]) || ((_b = raw.games) === null || _b === void 0 ? void 0 : _b[String(g.id)]) || {}))]; })), english: __assign(__assign(__assign({}, base.english), (raw.english || {})), { words: __assign({}, (((_b = raw.english) === null || _b === void 0 ? void 0 : _b.words) || {})) }), daily: __assign(__assign({}, base.daily), (raw.daily || {})) });
        merged.profile.age = NS.clamp(Number(merged.profile.age) || 6, NS.MIN_AGE, NS.MAX_AGE);
        try {
            for (var _c = __values(NS.GAMES), _d = _c.next(); !_d.done; _d = _c.next()) {
                var g = _d.value;
                merged.games[g.id] = __assign(__assign({}, base.games[g.id]), (merged.games[g.id] || {}));
                merged.games[g.id].level = NS.clamp(Number(merged.games[g.id].level) || 1, 1, NS.MAX_LEVEL);
                merged.games[g.id].best = NS.clamp(Number(merged.games[g.id].best) || 0, 0, 3);
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
            }
            finally { if (e_3) throw e_3.error; }
        }
        merged.schema = NS.SCHEMA_VERSION;
        return merged;
    }
    NS.ensureDaily = function (state) {
        var _a;
        var today = NS.localDateKey();
        if (((_a = state.daily) === null || _a === void 0 ? void 0 : _a.date) !== today)
            state.daily = { date: today, gamesCompleted: 0, englishCorrect: 0, claimed: false };
        return state;
    };
    NS.loadState = function () {
        var e_4, _a;
        try {
            var current = JSON.parse(localStorage.getItem(KEY_V8) || 'null');
            if (current)
                return NS.ensureDaily(normalize(current));
            try {
                for (var _b = __values([KEY_V7, KEY_V6, KEY_V5, KEY_V4, KEY_V3, KEY_V2]), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var key = _c.value;
                    var old = JSON.parse(localStorage.getItem(key) || 'null');
                    if (old) {
                        var migrated = normalize(old);
                        localStorage.setItem(KEY_V8, JSON.stringify(migrated));
                        return NS.ensureDaily(migrated);
                    }
                }
            }
            catch (e_4_1) { e_4 = { error: e_4_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_4) throw e_4.error; }
            }
            var legacy = JSON.parse(localStorage.getItem(KEY_V1) || 'null');
            if (legacy) {
                var migrated = migrateV1(legacy);
                localStorage.setItem(KEY_V8, JSON.stringify(migrated));
                return NS.ensureDaily(migrated);
            }
        }
        catch (err) {
            console.warn('Storage load failed', err);
        }
        return NS.defaultState();
    };
    // v9.3: il salvataggio non deve mai bloccare l'app (iPhone in navigazione privata,
    // pagina ospitata in un riquadro protetto, memoria piena...).
    NS.saveState = function (state) {
        state.updated = new Date().toISOString();
        state.schema = NS.SCHEMA_VERSION;
        NS.ensureDaily(state);
        try {
            localStorage.setItem(KEY_V8, JSON.stringify(normalize(state)));
        }
        catch (err) {
            try {
                console.warn('Storage save failed', err);
            }
            catch (_e) { }
        }
        if (typeof NS.afterSave === 'function') {
            try {
                NS.afterSave(state);
            }
            catch (_e) { }
        }
    };
    NS.normalizeState = function (raw) { return NS.ensureDaily(normalize(raw)); };
    function checksum(json) { return Array.from(json).reduce(function (a, c) { return (a + c.charCodeAt(0)) % 65535; }, 0).toString(16); }
    NS.exportBackup = function (state) {
        var payload = { app: 'LogicLandKids', schema: NS.SCHEMA_VERSION, exportedAt: new Date().toISOString(), state: normalize(state) };
        var json = JSON.stringify(payload);
        return "LLK8.".concat(checksum(json), ".").concat(NS.safeB64Encode(json));
    };
    NS.importBackup = function (code) {
        var parts = String(code || '').trim().split('.');
        if (parts.length !== 3 || !['LLK2', 'LLK3', 'LLK4', 'LLK5', 'LLK6', 'LLK7', 'LLK8'].includes(parts[0]))
            throw new Error('Formato backup non riconosciuto');
        var json = NS.safeB64Decode(parts[2]);
        if (checksum(json) !== parts[1])
            throw new Error('Backup danneggiato o incompleto');
        var payload = JSON.parse(json);
        if (payload.app !== 'LogicLandKids' || !payload.state)
            throw new Error('Backup non valido');
        return NS.ensureDaily(normalize(payload.state));
    };
    NS.englishWordStats = function (state, word) { var base = { correct: 0, wrong: 0, box: 1, due: 0, lastSeen: 0 }; return __assign(__assign({}, base), (state.english.words[word] || {})); };
    NS.recordEnglishResult = function (state, word, ok) {
        var stat = NS.englishWordStats(state, word.en);
        if (ok) {
            stat.correct++;
            stat.box = NS.clamp(stat.box + 1, 1, 6);
            var intervals = [0, 1, 3, 7, 14, 30, 45];
            stat.due = Date.now() + intervals[stat.box] * NS.DAY_MS;
            state.daily.englishCorrect++;
        }
        else {
            stat.wrong++;
            stat.box = 1;
            stat.due = Date.now() + 10 * 60 * 1000;
        }
        stat.lastSeen = Date.now();
        state.english.words[word.en] = stat;
    };
    NS.selectEnglishWord = function (state, level) {
        var e_5, _a;
        var maxWordLevel = Math.min(8, NS.levelBand(level)), candidates = NS.WORDS.filter(function (w) { return w.lvl <= maxWordLevel; }), now = Date.now(), weighted = [];
        try {
            for (var candidates_1 = __values(candidates), candidates_1_1 = candidates_1.next(); !candidates_1_1.done; candidates_1_1 = candidates_1.next()) {
                var word = candidates_1_1.value;
                var s = NS.englishWordStats(state, word.en);
                var weight = 1;
                if (!s.lastSeen)
                    weight += 2;
                if (s.due <= now)
                    weight += 3;
                weight += Math.min(5, s.wrong * 2);
                weight -= Math.min(2, Math.floor(s.correct / 4));
                if ((word.cefr || '').startsWith('B1') && level < 11)
                    weight = Math.max(1, weight - 2);
                for (var i = 0; i < Math.max(1, weight); i++)
                    weighted.push(word);
            }
        }
        catch (e_5_1) { e_5 = { error: e_5_1 }; }
        finally {
            try {
                if (candidates_1_1 && !candidates_1_1.done && (_a = candidates_1.return)) _a.call(candidates_1);
            }
            finally { if (e_5) throw e_5.error; }
        }
        return weighted[NS.rnd(0, weighted.length - 1)];
    };
})(window.LogicLand);
