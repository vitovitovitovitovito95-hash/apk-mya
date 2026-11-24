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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
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
    var state = NS.loadState();
    var selectedCategory = 'Tutti';
    var current = null, round = 0, score = 0, lives = NS.STARTING_LIVES, question = null, locked = false, selectedAge = NS.clamp(Number(state.profile.age) || 6, NS.MIN_AGE, NS.MAX_AGE);
    NS.isLocked = function () { return locked; };
    NS.submitCustomAnswer = function (value) { return answer(value); };
    NS.toast = toast;
    function save() { NS.saveState(state); }
    function gameState(id) { return state.games[id] || { level: 1, wins: 0, best: 0, correct: 0, wrong: 0 }; }
    function beep(ok) {
        if (ok === void 0) { ok = true; }
        if (!state.settings.sound)
            return;
        if (NS.fx)
            NS.fx.play(ok ? 'good' : 'bad', true);
    }
    function topbar() { return "<div class=\"top\"><div class=\"toprow\"><div class=\"avatar\">".concat(NS.escapeHtml(state.profile.avatar || '🦊'), "</div><div class=\"brand\">LogicLand <b class=\"vTag\">v9.3</b><small>GIOCA \u2022 PENSA \u2022 IMPARA</small></div><div class=\"pill\">\u2B50 ").concat(state.economy.stars, "</div><div class=\"pill\">\uD83E\uDE99 ").concat(state.economy.coins, "</div></div></div>"); }
    function dailyMissionHtml() {
        NS.ensureDaily(state);
        var d = state.daily, games = Math.min(3, d.gamesCompleted), eng = Math.min(5, d.englishCorrect), done = games >= 3 && eng >= 5;
        if (done && !d.claimed) {
            d.claimed = true;
            state.economy.coins += 20;
            state.economy.stars += 2;
            save();
            setTimeout(function () { return toast('Missione giornaliera completata: +2 ⭐ e +20 🪙'); }, 250);
        }
        return "<div class=\"daily ".concat(done ? 'done' : '', "\">").concat(done ? '✅' : '🎯', " Missione di oggi: giochi ").concat(games, "/3 \u2022 parole inglesi ").concat(eng, "/5").concat(done ? ' • completata!' : '', "</div>");
    }
    // v9.3: copertine abbinate al gioco giusto (prima “Conta e Scegli” mostrava la copertina “Trova l’intruso”).
    var iconMap = { 1: 'math', 5: 'sudoku', 7: 'count', 8: 'matrix', 9: 'matrix', 11: 'puzzle', 14: 'memory', 16: 'english', 33: 'odd', 34: 'english', 51: 'tetris', 52: 'dodge', 53: 'unblock', 54: 'dots', 55: 'water', 56: 'checkers', 57: 'chess' };
    function cardImage(g) { return iconMap[g.id] && !g.v9 ? "<img class=\"gameArtwork\" src=\"img/".concat(iconMap[g.id], ".webp\" alt=\"\" loading=\"lazy\">") : "<div class=\"gameArtwork emojiArt art-".concat(g.world, "\"><span>").concat(g.icon, "</span></div>"); }
    // v9.2: i giochi più complessi si sbloccano con le stelle accumulate
    var UNLOCK = { 32: 5, 70: 5, 71: 5, 61: 5, 74: 5, 77: 5, 5: 12, 11: 12, 41: 12, 53: 12, 54: 12, 72: 12, 73: 12, 75: 12, 76: 12, 9: 20, 42: 20, 56: 20, 57: 30 };
    function needStars(g) { return state.settings.unlockAll ? 0 : Math.max(0, (UNLOCK[g.id] || 0) - state.economy.stars); }
    function lockedInfo(id) { var g = NS.GAMES.find(function (x) { return x.id === Number(id); }); toast("\uD83D\uDD12 ".concat(g.name, ": servono ancora ").concat(needStars(g), " \u2B50 (ne servono ").concat(UNLOCK[g.id], " in tutto). Completa altri livelli!")); }
    function gameCard(g, index) {
        var s = gameState(g.id), pct = Math.floor((Math.max(1, s.level) - 1) / NS.MAX_LEVEL * 100), delay = Math.min(14, index || 0) * 45;
        var worldIcon = { math: '🔢', logic: '🧠', visual: '👁️', english: '🇬🇧', arcade: '🎮', brain: '⚡', spanish: '🇪🇸' }[g.world] || '⭐';
        var lockN = needStars(g);
        return "<button class=\"card gameTile world-".concat(g.world).concat(g.v9 ? ' isNew' : '').concat(lockN ? ' locked' : '', "\" style=\"-webkit-animation-delay:").concat(delay, "ms;animation-delay:").concat(delay, "ms\" onclick=\"LogicLand.").concat(lockN ? 'lockedInfo' : 'startGame', "(").concat(g.id, ")\">").concat(cardImage(g)).concat(lockN ? "<span class=\"lockBadge\">\uD83D\uDD12 ".concat(UNLOCK[g.id], " \u2B50</span>") : '', "<span class=\"worldChip\">").concat(worldIcon, "</span>").concat(g.v9 ? '<span class="newChip">NUOVO</span>' : '', "<div class=\"gameTileCopy\"><h3>").concat(NS.escapeHtml(g.name), "</h3><p>").concat(NS.escapeHtml(g.desc), "</p><div class=\"gameTileProgress\"><span>Livello ").concat(s.level, " / ").concat(NS.MAX_LEVEL, "</span><span>\u2B50 ").concat(Math.min(3, s.best || 0), "</span></div><div class=\"miniTrack\"><i style=\"width:").concat(pct, "%\"></i></div></div></button>");
    }
    function selectCategory(category) { selectedCategory = category; renderHome(); }
    // v9.3: ogni partita ha un numero; i timer di una partita chiusa non toccano più lo schermo
    var playRun = 0;
    function renderHome(ageOverride) {
        var _a, _b, _c;
        playRun++;
        (_a = NS.stopEnglishAudio) === null || _a === void 0 ? void 0 : _a.call(NS);
        stopTimer();
        (_b = NS.stopArcade) === null || _b === void 0 ? void 0 : _b.call(NS);
        (_c = NS.stopPuzzle) === null || _c === void 0 ? void 0 : _c.call(NS);
        current = null;
        NS.ensureDaily(state);
        save();
        var name = NS.escapeHtml(state.profile.name || 'Esploratrice'), games = NS.GAMES;
        var categories = [['Tutti', 'Tutti'], ['Logica', 'logic'], ['Numeri', 'math'], ['Cervello', 'brain'], ['Figure', 'visual'], ['Inglese', 'english'], ['Spagnolo', 'spanish'], ['Abilità', 'arcade']];
        var visible = selectedCategory === 'Tutti' ? games : games.filter(function (g) { return g.world === selectedCategory; });
        var tabs = categories.map(function (c) { return "<button class=\"categoryTab ".concat(selectedCategory === c[1] ? 'active' : '', "\" onclick=\"LogicLand.selectCategory('").concat(c[1], "')\">").concat(c[0], "</button>"); }).join('');
        document.getElementById('app').innerHTML = topbar() + "<div class=\"wrap newHome\"><section class=\"hero newHero\"><div class=\"v9Ribbon\">\u2728 NOVIT\u00C0 9.3 \u00B7 5 nuovi giochi per la mente, Conta e Scegli tutto nuovo</div><h1>Ciao, ".concat(name, "! \uD83C\uDF08</h1><p>Esplora i mondi di LogicLand: scegli un gioco e continua la tua avventura!</p>").concat(dailyMissionHtml(), "</section><div class=\"homeHeading\"><h2>\uD83C\uDFB2 Scegli il tuo gioco</h2><span>").concat(games.length, " giochi \u00B7 15 livelli \u00B7 \u23F1\uFE0F a tempo</span></div><div class=\"categoryTabs\">").concat(tabs, "</div><div class=\"grid gameGallery\">").concat(visible.map(gameCard).join(''), "</div><div class=\"nav\"><button class=\"secondary\" style=\"flex:1\" onclick=\"LogicLand.renderParents()\">\uD83D\uDC68\u200D\uD83D\uDC69\u200D\uD83D\uDC67 Zona genitori</button><button class=\"secondary\" onclick=\"LogicLand.about()\">\u2139\uFE0F</button></div></div>");
    }
    function selectAge(age) { selectedAge = NS.clamp(Number(age), NS.MIN_AGE, NS.MAX_AGE); renderHome(selectedAge); }
    function lifeHtml() {
        return "<span class=\"lives\" id=\"lifeCounter\" aria-label=\"Vite\">".concat(Array.from({ length: NS.STARTING_LIVES }, function (_, i) { return i < lives ? '❤️' : '🖤'; }).join(''), "</span>");
    }
    function updateLivesUI() {
        var e = document.getElementById('lifeCounter');
        if (e)
            e.innerHTML = Array.from({ length: NS.STARTING_LIVES }, function (_, i) { return i < lives ? '❤️' : '🖤'; }).join('');
    }
    function gameShell(body, progressOverride) {
        if (progressOverride === void 0) { progressOverride = null; }
        var st = gameState(current.id), pct = progressOverride === null ? Math.min(100, round / NS.questionsFor(st.level) * 100) : NS.clamp(progressOverride, 0, 100);
        document.getElementById('app').innerHTML = topbar() + "<div class=\"wrap\"><div class=\"gameHead\"><button class=\"back\" onclick=\"LogicLand.renderHome(".concat(selectedAge, ")\">\u2190</button><div class=\"gameTitle\"><h2>").concat(current.icon, " ").concat(NS.escapeHtml(current.name), "</h2><div>Livello ").concat(st.level, "/").concat(NS.MAX_LEVEL, " \u2022 ").concat(NS.escapeHtml(current.group), "<br><small>").concat(NS.LEVEL_INFO && NS.LEVEL_INFO[current.id] ? NS.escapeHtml(NS.LEVEL_INFO[current.id][st.level - 1]) : NS.difficultyLabel(st.level), "</small></div></div><div class=\"gameStatus\">").concat(lifeHtml(), "<span class=\"badge\">").concat(current.arcade ? 'L' + st.level : score + '/' + NS.questionsFor(st.level) + ' ✓', "</span></div></div><div class=\"progress\"><i id=\"levelProgress\" style=\"width:").concat(pct, "%\"></i></div>").concat(body, "</div>");
    }
    function makeQuestion(id, level) { var fn = NS.MathGames[id] || NS.VisualGames[id] || NS.EnglishGames[id]; if (!fn)
        throw new Error("Generatore mancante per gioco ".concat(id)); return fn(level, state); }
    // v9: conto alla rovescia per ogni domanda (più breve a ogni livello). Allo scadere si perde una vita.
    var timerId = null, timerEnd = 0, timerTotal = 0;
    function stopTimer() { if (timerId) {
        clearInterval(timerId);
        timerId = null;
    } }
    function startTimer(extraMs) {
        stopTimer();
        var level = gameState(current.id).level;
        timerTotal = NS.secondsFor(level) * ({ 1: 2, 5: 2, 9: 2, 11: 2, 31: 1.5, 34: 1.5, 61: 1.5, 40: 2, 41: 2.5, 42: 2.5, 73: 1.5, 76: 2 }[current.id] || 1) * 1000;
        timerEnd = Date.now() + timerTotal + (extraMs || 0);
        var tick = function () {
            var bar = document.getElementById('qTimerBar'), label = document.getElementById('qTimerLabel');
            if (!bar || !current) {
                stopTimer();
                return;
            }
            var left = Math.max(0, timerEnd - Date.now()), frac = Math.min(1, left / timerTotal);
            bar.style.width = (frac * 100) + '%';
            bar.className = frac < .25 ? 'danger' : frac < .5 ? 'warn' : '';
            if (label)
                label.textContent = Math.ceil(Math.min(left, timerTotal) / 1000) + 's';
            if (left <= 0) {
                stopTimer();
                timeUp();
            }
        };
        tick();
        timerId = setInterval(tick, 100);
    }
    function timeUp() {
        if (locked)
            return;
        locked = true;
        beep(false);
        document.querySelectorAll('.opt').forEach(function (b) { if (String(b.dataset.value) === String(question.answer))
            b.classList.add('correct'); });
        var keepGoing = registerMistake('⏰ Tempo scaduto!');
        if (!keepGoing)
            return;
        var gs = gameState(current.id), right = question.answerLabel || NS.escapeHtml(question.answer);
        document.getElementById('feedback').innerHTML = "<div class=\"feedback bad\">\u23F0 Tempo scaduto! La risposta era ".concat(right, "<div class=\"hint\">Pi\u00F9 veloce la prossima volta! Hai ancora ").concat(lives, " ").concat(lives === 1 ? 'vita' : 'vite', ".</div></div><button class=\"nextBtn\" onclick=\"LogicLand.advance()\">").concat(round === NS.questionsFor(gs.level) - 1 ? 'Concludi il livello' : 'Prossima sfida →', "</button>");
    }
    function renderQuestion(x) {
        var opts = x.options ? "<div class=\"options\">".concat(x.options.map(function (o) { var _a, _b; var value = o && typeof o === 'object' ? ((_a = o.value) !== null && _a !== void 0 ? _a : o.label) : o; var label = o && typeof o === 'object' ? ((_b = o.label) !== null && _b !== void 0 ? _b : o.value) : o; return "<button class=\"opt\" data-value=\"".concat(NS.escapeHtml(value), "\" onclick=\"LogicLand.answer(this)\">").concat(label, "</button>"); }).join(''), "</div>") : '';
        gameShell("<div class=\"question\"><div class=\"qicon\">".concat(x.icon || current.icon, "</div><h3>").concat(x.prompt, "</h3>").concat(x.sub ? "<p>".concat(x.sub, "</p>") : '').concat(x.visual || '').concat(x.custom || '', "</div><div class=\"qTimer\"><span id=\"qTimerLabel\"></span><div><i id=\"qTimerBar\"></i></div></div>").concat(opts, "<div id=\"feedback\"></div>"));
        if (x.afterRender)
            setTimeout(x.afterRender, 50);
        startTimer((x.meta && x.meta.age6Metrics && x.meta.age6Metrics.exposureMs) || 0);
        if (x.autoSpeak && state.settings.sound !== false)
            setTimeout(function () { if (question === x)
                NS.speakLine(x.autoSpeak[0], x.autoSpeak[1]); }, 450);
    }
    function startGame(id) {
        var _a, _b;
        (_a = NS.stopEnglishAudio) === null || _a === void 0 ? void 0 : _a.call(NS);
        (_b = NS.stopArcade) === null || _b === void 0 ? void 0 : _b.call(NS);
        stopTimer();
        playRun++;
        current = NS.GAMES.find(function (g) { return g.id === Number(id); });
        if (!current)
            return;
        if (needStars(current)) {
            var id2 = current.id;
            current = null;
            return lockedInfo(id2);
        }
        selectedAge = current.age;
        round = 0;
        score = 0;
        lives = NS.STARTING_LIVES;
        locked = true;
        showLevelIntro();
    }
    // v9.2: schermata di inizio livello: che cosa cambia in questo livello.
    function showLevelIntro() {
        var gs = gameState(current.id), lv = gs.level, info = NS.LEVEL_INFO && NS.LEVEL_INFO[current.id] ? NS.LEVEL_INFO[current.id][lv - 1] : '', prev = lv > 1 && NS.LEVEL_INFO && NS.LEVEL_INFO[current.id] ? NS.LEVEL_INFO[current.id][lv - 2] : '';
        var isQ = !current.arcade, secs = isQ ? Math.round(NS.secondsFor(lv) * ({ 1: 2, 5: 2, 9: 2, 11: 2, 31: 1.5, 34: 1.5, 61: 1.5, 40: 2, 41: 2.5, 42: 2.5, 73: 1.5, 76: 2 }[current.id] || 1)) : 0;
        var stars = Array.from({ length: 15 }, function (_, i) { return "<i class=\"".concat(i < lv - 1 ? 'done' : i === lv - 1 ? 'now' : '', "\"></i>"); }).join('');
        gameShell("<div class=\"question levelIntro\"><div class=\"lvBadge\">".concat(lv, "</div><h3>Livello ").concat(lv, " di ").concat(NS.MAX_LEVEL, "</h3><div class=\"lvPath\">").concat(stars, "</div>").concat(info ? "<div class=\"lvNew\"><b>".concat(lv > 1 ? '🆕 Cosa cambia:' : '🎯 Obiettivo:', "</b> ").concat(NS.escapeHtml(info), "</div>") : '').concat(prev && prev !== info ? "<div class=\"lvPrev\">Prima: ".concat(NS.escapeHtml(prev), "</div>") : '', "<div class=\"lvStats\">").concat(isQ ? "<span>\u2753 ".concat(NS.questionsFor(lv), " domande</span><span>\u23F1\uFE0F ").concat(secs, "s a domanda</span>") : '<span>🎮 sfida interattiva</span>', "<span>\u2764\uFE0F 3 vite</span></div><button class=\"nextBtn\" onclick=\"LogicLand.beginLevel()\">\u25B6 Inizia</button></div>"), 0);
    }
    function beginLevel() { if (!current)
        return; locked = false; if (current.arcade)
        return startArcadeLevel(); nextQuestion(); }
    function nextQuestion() {
        if (round >= NS.questionsFor(gameState(current.id).level))
            return finishLevel();
        locked = false;
        question = makeQuestion(current.id, gameState(current.id).level);
        renderQuestion(question);
    }
    function registerMistake(message) {
        var gs = gameState(current.id);
        lives--;
        state.totals.wrong++;
        gs.wrong++;
        state.economy.streak = 0;
        gs.lastPlayed = new Date().toISOString();
        save();
        updateLivesUI();
        if (NS.fx) {
            NS.fx.heartLost();
            NS.fx.vibrate(60);
        }
        if (lives <= 0) {
            var run_1 = playRun;
            setTimeout(function () { if (run_1 === playRun && current)
                failLevel(message || 'Hai esaurito le vite.'); }, 180);
            return false;
        }
        toast("".concat(message || 'Errore', " Ti restano ").concat(lives, " ").concat(lives === 1 ? 'vita' : 'vite', " \u2764\uFE0F"));
        return true;
    }
    function answer(source) {
        var _a, _b;
        if (locked)
            return;
        var value = (_b = (_a = source === null || source === void 0 ? void 0 : source.dataset) === null || _a === void 0 ? void 0 : _a.value) !== null && _b !== void 0 ? _b : source, ok = String(value) === String(question.answer);
        locked = true;
        var fast = timerEnd - Date.now() > timerTotal / 2;
        stopTimer();
        document.querySelectorAll('.opt').forEach(function (b) { if (String(b.dataset.value) === String(question.answer))
            b.classList.add('correct'); });
        if (source && source.classList && !ok) {
            source.classList.add('wrong');
            if (NS.fx)
                NS.fx.shake(source);
        }
        if (ok && source && source.classList && NS.fx)
            NS.fx.burst(source);
        var gs = gameState(current.id);
        if (ok) {
            score++;
            state.totals.correct++;
            gs.correct++;
            state.economy.streak++;
            state.economy.coins += 2 + (gs.level > 7 ? 1 : 0) + (fast ? 1 : 0);
            state.economy.xp += 10;
            if (current.eng && question.word)
                NS.recordEnglishResult(state, question.word, true);
            beep(true);
            if (question.sayAfter) {
                var say_1 = question.sayAfter;
                setTimeout(function () { return NS.speakLine(say_1[0], say_1[1]); }, 350);
            }
            gs.lastPlayed = new Date().toISOString();
            save();
        }
        else {
            if (current.eng && question.word)
                NS.recordEnglishResult(state, question.word, false);
            beep(false);
            if (question.sayAfter) {
                var say_2 = question.sayAfter;
                setTimeout(function () { return NS.speakLine(say_2[0], say_2[1]); }, 450);
            }
            var keepGoing = registerMistake('Risposta sbagliata.');
            if (!keepGoing)
                return;
        }
        var feedback = document.getElementById('feedback'), right = question.answerLabel || NS.escapeHtml(question.answer), hint = state.settings.hints ? (question.hint || 'Osserva la regola e prova un passo alla volta.') : 'Riprova nella prossima sfida.';
        feedback.innerHTML = "<div class=\"feedback ".concat(ok ? 'good' : 'bad', "\">").concat(ok ? (fast ? '⚡ Velocissima! +1 🪙 bonus' : '🌟 Perfetto! Ottimo ragionamento.') : '💪 Attenzione: la risposta giusta è ' + right, "<div class=\"hint\">").concat(ok ? (state.economy.streak >= 3 ? 'Serie di ' + state.economy.streak + ' risposte corrette! 🔥' : 'Continua così!') : hint + " Hai ancora ".concat(lives, " ").concat(lives === 1 ? 'vita' : 'vite', "."), "</div></div><button class=\"nextBtn\" onclick=\"LogicLand.advance()\">").concat(round === NS.questionsFor(gs.level) - 1 ? 'Concludi il livello' : 'Prossima sfida →', "</button>");
    }
    function advance() { round++; nextQuestion(); }
    function failLevel(reason) {
        var _a, _b;
        stopTimer();
        (_a = NS.stopArcade) === null || _a === void 0 ? void 0 : _a.call(NS);
        (_b = NS.stopPuzzle) === null || _b === void 0 ? void 0 : _b.call(NS);
        locked = true;
        var gs = gameState(current.id);
        state.totals.sessions++;
        save();
        gameShell("<div class=\"question levelWin failLevel\"><div class=\"trophy\">\uD83D\uDC9B</div><h2>Livello da riprovare</h2><p>".concat(NS.escapeHtml(reason || 'Hai esaurito le tre vite.'), " Il livello termina quando vengono consumate tutte e <b>3 le vite</b>.</p><div class=\"lifeRule\">\u2764\uFE0F\u2764\uFE0F\u2764\uFE0F \u2192 ogni errore consuma una vita \u2192 a 0 vite si ricomincia</div><button class=\"nextBtn\" onclick=\"LogicLand.startGame(").concat(current.id, ")\">\u21BA Riprova livello ").concat(gs.level, "</button><button class=\"secondary\" style=\"width:100%;margin-top:9px\" onclick=\"LogicLand.renderHome(").concat(selectedAge, ")\">Torna al percorso</button></div>"), 0);
    }
    function finishLevel() {
        var _a, _b;
        stopTimer();
        (_a = NS.stopArcade) === null || _a === void 0 ? void 0 : _a.call(NS);
        (_b = NS.stopPuzzle) === null || _b === void 0 ? void 0 : _b.call(NS);
        var gs = gameState(current.id), old = gs.level, perfect = lives === NS.STARTING_LIVES, earned = perfect ? 3 : 2;
        gs.best = Math.max(gs.best || 0, earned);
        gs.wins = (gs.wins || 0) + 1;
        state.economy.stars += earned;
        state.economy.coins += 5 * earned;
        state.economy.xp += Math.max(20, score * 5);
        state.totals.sessions++;
        state.daily.gamesCompleted++;
        if (gs.level < NS.MAX_LEVEL)
            gs.level++;
        save();
        if (NS.fx) {
            if (state.settings.sound)
                NS.fx.play('win');
            setTimeout(function () { return NS.fx.confetti(perfect ? 64 : 40); }, 120);
        }
        var maxed = old >= NS.MAX_LEVEL;
        var mastery = maxed ? 'Hai completato anche il livello massimo! 🏅' : "Hai sbloccato il livello ".concat(gs.level, "!");
        var nextLabel = maxed ? '↺ Rigioca livello 15' : "Livello successivo ".concat(gs.level, " \u2192");
        gameShell("<div class=\"question levelWin\"><div class=\"trophy\">".concat(perfect ? '🏆' : '🎉', "</div><h2>Livello ").concat(old, " completato!</h2><p>").concat(current.arcade ? 'Sfida di abilità superata.' : "Hai risolto <b>".concat(score, " sfide su ").concat(NS.questionsFor(old), "</b>."), " ").concat(mastery, "</p><div class=\"reward\"><span>+").concat(earned, " \u2B50</span><span>+").concat(5 * earned, " \uD83E\uDE99</span></div><button class=\"nextBtn nextLevelButton\" onclick=\"LogicLand.startGame(").concat(current.id, ")\">").concat(nextLabel, "</button><button class=\"secondary\" style=\"width:100%;margin-top:9px\" onclick=\"LogicLand.renderHome(").concat(selectedAge, ")\">Torna al percorso</button></div>"), 100);
    }
    function startArcadeLevel() {
        var _a, _b, _c;
        var gs = gameState(current.id), profile = NS.arcadeProfile(gs.level), isTetris = current.arcade === 'tetris';
        var rules = isTetris
            ? "Completa <b>".concat(profile.tetris.targetLines, " righe</b>. Usa i pulsanti per spostare e ruotare i pezzi.")
            : current.arcade === 'dodge' ? "Supera <b>".concat(profile.dodge.targetObstacles, " ostacoli</b>. Tocca il campo o usa SU/GI\u00D9 per muovere la macchia.")
                : "Risolvi la sfida! Ogni livello richiede pi\u00F9 ragionamento.";
        var isBoardPuzzle = !!((_a = NS.PuzzleGames) === null || _a === void 0 ? void 0 : _a[current.arcade]);
        var intro = isBoardPuzzle ? '<div class="puzzleLifeMini">❤️❤️❤️ • Tre vite per completare il livello</div>' : "<div class=\"question arcadeIntro\"><div class=\"qicon\">".concat(current.icon, "</div><h3>").concat(NS.escapeHtml(current.name), " \u2022 Livello ").concat(gs.level, "</h3><p>").concat(rules, "</p><div class=\"lifeRule\">Hai \u2764\uFE0F\u2764\uFE0F\u2764\uFE0F: ogni errore consuma una vita. A 0 vite il livello termina.</div></div>");
        gameShell("".concat(intro, "<div id=\"arcadeMount\" class=\"arcadeMount\"></div><div id=\"arcadeProgressText\" class=\"arcadeProgressText\"></div>"), 0);
        var starter = ((_b = NS.ArcadeGames) === null || _b === void 0 ? void 0 : _b[current.arcade]) || ((_c = NS.PuzzleGames) === null || _c === void 0 ? void 0 : _c[current.arcade]);
        if (!starter)
            return failLevel('Modulo arcade non disponibile.');
        starter({ level: gs.level, mountId: 'arcadeMount', onMistake: function (msg) { return registerMistake(msg); }, onProgress: function (fraction, label) { var bar = document.getElementById('levelProgress'); if (bar)
                bar.style.width = Math.round(fraction * 100) + '%'; var t = document.getElementById('arcadeProgressText'); if (t)
                t.textContent = label; }, onSuccess: function () { score = lives === NS.STARTING_LIVES ? NS.questionsFor(gs.level) : NS.questionsFor(gs.level) - 1; state.totals.correct++; gs.correct++; beep(true); finishLevel(); } });
    }
    function accuracy(correct, wrong) { var t = correct + wrong; return t ? Math.round(correct / t * 100) : 0; }
    function worldStats(world) { var ids = NS.GAMES.filter(function (g) { return g.world === world; }).map(function (g) { return g.id; }); var c = 0, w = 0, lv = 0; ids.forEach(function (id) { var s = gameState(id); c += s.correct || 0; w += s.wrong || 0; lv += s.level || 1; }); return { acc: accuracy(c, w), avg: ids.length ? Math.round(lv / ids.length * 10) / 10 : 0 }; }
    function ageStats(age) { var ids = NS.GAMES.filter(function (g) { return g.age === age; }).map(function (g) { return g.id; }), avg = ids.length ? Math.round(ids.reduce(function (s, id) { return s + gameState(id).level; }, 0) / ids.length * 10) / 10 : 0; return { avg: avg, mastered: ids.filter(function (id) { return gameState(id).level >= NS.MAX_LEVEL; }).length, total: ids.length }; }
    function renderParents() {
        var learned = Object.values(state.english.words).filter(function (x) { return (x.box || 1) >= 4 && (x.correct || 0) >= 4; }).length, review = Object.values(state.english.words).filter(function (x) { return (x.wrong || 0) > 0 && (x.due || 0) <= Date.now(); }).length, acc = accuracy(state.totals.correct, state.totals.wrong), avg = Math.round(NS.GAMES.reduce(function (s, g) { return s + gameState(g.id).level; }, 0) / NS.GAMES.length * 10) / 10;
        var worlds = [['Matematica', 'math'], ['Logica', 'logic'], ['Visivo', 'visual'], ['English', 'english'], ['Abilità', 'arcade']];
        document.getElementById('app').innerHTML = topbar() + "<div class=\"wrap\"><div class=\"gameHead\"><button class=\"back\" onclick=\"LogicLand.renderHome(".concat(selectedAge, ")\">\u2190</button><div class=\"gameTitle\"><h2>\uD83D\uDC68\u200D\uD83D\uDC69\u200D\uD83D\uDC67 Zona genitori</h2><div>Progressi, et\u00E0, impostazioni e backup</div></div></div>\n      <div class=\"parentCard\"><h3>\uD83D\uDC67 Profilo</h3><div class=\"setting\"><label>Nome mostrato nell\u2019app</label><input id=\"profileName\" maxlength=\"18\" value=\"").concat(NS.escapeHtml(state.profile.name), "\"></div><div class=\"setting\"><label>Et\u00E0 / percorso consigliato</label><select id=\"profileAge\">").concat(Array.from({ length: NS.MAX_AGE - NS.MIN_AGE + 1 }, function (_, i) { return i + NS.MIN_AGE; }).map(function (a) { return "<option value=\"".concat(a, "\" ").concat(a === Number(state.profile.age) ? 'selected' : '', ">").concat(a, " anni</option>"); }).join(''), "</select></div><button class=\"primary\" style=\"width:100%;margin-top:10px\" onclick=\"LogicLand.saveProfile()\">Salva profilo</button></div>\n      <div class=\"parentCard\"><h3>\uD83D\uDCCA Progressi</h3><div class=\"statrow\"><span>Precisione generale</span><b>").concat(acc, "%</b></div><div class=\"bar\"><i style=\"width:").concat(acc, "%\"></i></div><div class=\"statrow\"><span>Livello medio</span><b>").concat(avg, "/").concat(NS.MAX_LEVEL, "</b></div><div class=\"statrow\"><span>Sessioni completate</span><b>").concat(state.totals.sessions, "</b></div><div class=\"statrow\"><span>Parole consolidate</span><b>").concat(learned, "</b></div><div class=\"statrow\"><span>Parole da ripassare ora</span><b>").concat(review, "</b></div><div class=\"worldProgress\">").concat(worlds.map(function (_a) {
            var _b = __read(_a, 2), label = _b[0], key = _b[1];
            var x = worldStats(key);
            return "<div class=\"worldMini\"><b>".concat(label, "</b><small>").concat(x.acc, "% corrette \u2022 liv. ").concat(x.avg, "</small></div>");
        }).join(''), "</div><div class=\"ageProgress\">").concat(Array.from({ length: NS.MAX_AGE - NS.MIN_AGE + 1 }, function (_, i) { return i + NS.MIN_AGE; }).map(function (age) { var x = ageStats(age); return "<div><b>".concat(age, " anni</b><span>liv. medio ").concat(x.avg, "/").concat(NS.MAX_LEVEL, " \u2022 completati ").concat(x.mastered, "/").concat(x.total, "</span></div>"); }).join(''), "</div></div>\n      <div class=\"parentCard\"><h3>\u2699\uFE0F Impostazioni</h3><div class=\"setting\"><label>Suoni</label><input type=\"checkbox\" id=\"soundSetting\" ").concat(state.settings.sound ? 'checked' : '', "></div><div class=\"setting\"><label>Mostra suggerimenti</label><input type=\"checkbox\" id=\"hintSetting\" ").concat(state.settings.hints ? 'checked' : '', "></div><div class=\"setting\"><label>Sblocca tutti i giochi (senza stelle)</label><input type=\"checkbox\" id=\"unlockSetting\" ").concat(state.settings.unlockAll ? 'checked' : '', "></div><div class=\"setting\"><label>Rotazione / adattamento tablet</label><span class=\"tiny\">Attiva automaticamente layout portrait / landscape</span></div><button class=\"secondary\" style=\"width:100%;margin-top:10px\" onclick=\"LogicLand.speakLine('apple','en-GB')\">\uD83D\uDD0A Prova pronuncia inglese: APPLE</button><button class=\"primary\" style=\"width:100%;margin-top:10px\" onclick=\"LogicLand.saveSettings()\">Salva impostazioni</button></div>\n      <div class=\"parentCard\"><h3>\uD83D\uDCBE Backup per cambio telefono</h3><p class=\"tiny\">Il codice include profilo, tutti i ").concat(NS.GAMES.length, " giochi, livelli, stelle, monete, statistiche e progresso dell\u2019inglese. I vecchi backup LLK2/LLK3/LLK4/LLK5 restano importabili.</p><textarea id=\"backup\" class=\"codebox\" placeholder=\"Qui comparir\u00E0 il codice di backup\"></textarea><div class=\"footerBtns\" style=\"margin-top:9px\"><button class=\"primary\" onclick=\"LogicLand.makeBackup()\">Crea / copia</button><button class=\"secondary\" onclick=\"LogicLand.restoreBackup()\">Ripristina</button></div></div>\n      <div class=\"parentCard\"><h3>\uD83E\uDDE9 Contenuti</h3><p class=\"tiny\"><b>").concat(NS.GAMES.length, " giochi</b> \u2022 <b>").concat(NS.MAX_LEVEL, " livelli per gioco</b> \u2022 ").concat(NS.GAMES.length * NS.MAX_LEVEL, " livelli complessivi \u2022 oltre ").concat(NS.WORDS.length, " vocaboli inglesi \u2022 ripasso dilazionato \u2022 offline \u2022 nessuna pubblicit\u00E0.</p><button class=\"danger\" style=\"width:100%\" onclick=\"LogicLand.resetProgress(this)\">Azzera tutti i progressi</button></div><p class=\"tiny\" style=\"text-align:center\">LogicLand Kids ").concat(NS.APP_VERSION, " \u2022 schema dati ").concat(NS.SCHEMA_VERSION, "</p></div>");
    }
    function saveProfile() { var name = document.getElementById('profileName').value.trim().slice(0, 18), age = Number(document.getElementById('profileAge').value); state.profile.name = name || 'Esploratrice'; state.profile.age = NS.clamp(age, NS.MIN_AGE, NS.MAX_AGE); selectedAge = state.profile.age; save(); toast('Profilo salvato ✅'); }
    function saveSettings() { state.settings.sound = document.getElementById('soundSetting').checked; state.settings.hints = document.getElementById('hintSetting').checked; state.settings.unlockAll = document.getElementById('unlockSetting').checked; save(); toast('Impostazioni salvate ✅'); }
    function makeBackup() {
        return __awaiter(this, void 0, void 0, function () { var code, box, _e_1; var _a; return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    code = NS.exportBackup(state), box = document.getElementById('backup');
                    box.value = code;
                    box.focus();
                    box.select();
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 5, , 6]);
                    if (!((_a = navigator.clipboard) === null || _a === void 0 ? void 0 : _a.writeText)) return [3 /*break*/, 3];
                    return [4 /*yield*/, navigator.clipboard.writeText(code)];
                case 2:
                    _b.sent();
                    return [3 /*break*/, 4];
                case 3:
                    document.execCommand('copy');
                    _b.label = 4;
                case 4:
                    toast('Backup copiato negli appunti ✅');
                    return [3 /*break*/, 6];
                case 5:
                    _e_1 = _b.sent();
                    toast('Backup creato: copialo e conservalo');
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        }); });
    }
    function restoreBackup() { var raw = document.getElementById('backup').value.trim(); if (!raw)
        return toast('Incolla prima il codice di backup'); try {
        state = NS.importBackup(raw);
        selectedAge = state.profile.age;
        save();
        toast('Backup ripristinato ✅');
        setTimeout(renderParents, 400);
    }
    catch (err) {
        toast(err.message || 'Codice di backup non valido');
    } }
    // v9.3: conferma con un secondo tocco (le finestre confirm() non funzionano su iPhone/pagine protette).
    var resetArmed = 0;
    function resetProgress(btn) { if (Date.now() - resetArmed > 5000) {
        resetArmed = Date.now();
        if (btn && btn.textContent !== undefined)
            btn.textContent = '⚠️ Tocca di nuovo per azzerare tutto';
        toast('Tocca di nuovo entro 5 secondi per confermare.');
        return;
    } resetArmed = 0; var profile = __assign({}, state.profile), settings = __assign({}, state.settings); state = NS.defaultState(); state.profile = profile; state.settings = settings; save(); renderParents(); toast('Progressi azzerati'); }
    function about() { toast("LogicLand Kids ".concat(NS.APP_VERSION, " \u2022 ").concat(NS.GAMES.length, " giochi \u2022 ").concat(NS.MAX_LEVEL, " livelli \u2022 6 anni \u2022 Android 6.0.1+ \u2022 audio inglese B1")); }
    function toast(msg) { var e = document.createElement('div'); e.className = 'toast'; e.textContent = msg; document.body.appendChild(e); setTimeout(function () { return e.remove(); }, 2400); }
    function applyTabletLayout() {
        var landscape = window.innerWidth > window.innerHeight;
        document.body.classList.toggle('landscape', landscape);
        document.body.classList.toggle('portrait', !landscape);
        document.body.classList.toggle('tablet', Math.max(window.innerWidth, window.innerHeight) >= 720);
    }
    function handleBack() { if (current) {
        renderHome();
        return true;
    } return false; }
    // v9.3: salvataggio nel cloud (solo versione web/iPhone): legge e sostituisce lo stato.
    NS.getState = function () { return state; };
    NS.applyExternalState = function (raw) { try {
        state = NS.normalizeState(raw);
        selectedAge = NS.clamp(Number(state.profile.age) || 6, NS.MIN_AGE, NS.MAX_AGE);
        if (!current)
            renderHome();
        return true;
    }
    catch (_e) {
        return false;
    } };
    Object.assign(NS, { beginLevel: beginLevel, lockedInfo: lockedInfo, renderHome: renderHome, handleBack: handleBack, selectAge: selectAge, selectCategory: selectCategory, startGame: startGame, answer: answer, advance: advance, renderParents: renderParents, saveProfile: saveProfile, saveSettings: saveSettings, makeBackup: makeBackup, restoreBackup: restoreBackup, resetProgress: resetProgress, about: about });
    applyTabletLayout();
    window.addEventListener('resize', applyTabletLayout);
    window.addEventListener('orientationchange', applyTabletLayout);
    renderHome();
    // iPhone/iPad nel browser: suggerisce come metterla sulla Home (così funziona come un'app, anche offline).
    try {
        var ios = /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
        var standalone = navigator.standalone === true || (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches);
        var seen = false;
        try {
            seen = localStorage.getItem('llk_ios_hint') === '1';
        }
        catch (_e) { }
        if (ios && !standalone && !seen && !window.LLK_NO_SW && /^https?:$/.test(location.protocol)) {
            setTimeout(function () {
                var d = document.createElement('div');
                d.className = 'iosHint';
                d.setAttribute('role', 'note');
                d.innerHTML = '📲 <b>Per averla come app:</b> tocca <b>Condividi</b> <span class="iosShare">⬆️</span> e poi <b>«Aggiungi alla schermata Home»</b>.<button type="button" aria-label="Chiudi">✕</button>';
                d.querySelector('button').addEventListener('click', function () { try {
                    localStorage.setItem('llk_ios_hint', '1');
                }
                catch (_e) { } d.remove(); });
                document.body.appendChild(d);
            }, 1200);
        }
    }
    catch (_e) { }
    // PWA (iPhone/iPad e browser): salva l'app per l'uso offline. Nell'APK (file://) non si attiva.
    try {
        if (!window.LLK_NO_SW && 'serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
            var r = navigator.serviceWorker.register('sw.js');
            if (r && r.catch)
                r.catch(function () { });
        }
    }
    catch (_e) { }
})(window.LogicLand);
