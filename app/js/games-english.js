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
    function distractWords(word, count) {
        if (count === void 0) { count = 3; }
        var sameBand = NS.WORDS.filter(function (x) { return x.id !== word.id && x.lvl <= Math.max(2, word.lvl + 1); });
        return NS.shuffle(sameBand).slice(0, count);
    }
    // Prefer bundled MP3 playback over Android TTS: both the S24 and Android 6
    // can lack a usable English voice even when Android TTS reports success.
    var playingAudio = null;
    var playbackSerial = 0;
    var BASE_AUDIO = 'audio/';
    // v9.3: UN SOLO lettore audio riutilizzato. Su iPhone/iPad (Safari) un lettore
    // "sbloccato" dal primo tocco può poi suonare anche le parole lette in automatico
    // (ascolto, frasi in sequenza); uno nuovo per ogni parola verrebbe bloccato.
    var player = null;
    function getPlayer() { if (!player && typeof Audio !== 'undefined') {
        player = new Audio();
        player.preload = 'auto';
    } return player; }
    var SILENT = 'data:audio/wav;base64,UklGRkQDAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YSADAACAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgA==';
    function unlockAudio() {
        document.removeEventListener('touchend', unlockAudio, true);
        document.removeEventListener('click', unlockAudio, true);
        try {
            var a = getPlayer();
            if (!a || playingAudio)
                return;
            a.src = SILENT;
            var r = a.play();
            if (r && r.catch)
                r.catch(function () { });
        }
        catch (_e) { }
    }
    if (typeof document !== 'undefined' && document.addEventListener) {
        document.addEventListener('touchend', unlockAudio, true);
        document.addEventListener('click', unlockAudio, true);
    }
    function ttsFallback(text, lang) {
        try {
            if ((lang || 'en-GB').indexOf('en') === 0 && window.LLKAndroid && typeof window.LLKAndroid.speak === 'function') {
                if (window.LLKAndroid.speak(String(text)))
                    return true;
            }
        }
        catch (_ignore) { }
        try {
            if (!('speechSynthesis' in window))
                return false;
            window.speechSynthesis.cancel();
            var utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = lang || 'en-GB';
            utterance.rate = (lang || 'en-GB').indexOf('it') === 0 ? .88 : .76;
            window.speechSynthesis.speak(utterance);
            return true;
        }
        catch (_ignore) {
            return false;
        }
    }
    NS.stopEnglishAudio = function () {
        playbackSerial++;
        if (playingAudio) {
            try {
                playingAudio.onended = null;
                playingAudio.onerror = null;
                playingAudio.pause();
            }
            catch (_ignore) { }
            playingAudio = null;
        }
    };
    function audioFiles(text, lang) {
        var l = (lang || 'en-GB').toLowerCase(), keyLang = l.indexOf('it') === 0 ? 'it' : l.indexOf('es') === 0 ? 'es' : 'en';
        var index = NS.AUDIO_INDEX || {};
        var norm = String(text || '').trim().toLowerCase();
        var direct = index[keyLang + '|' + norm];
        if (direct)
            return [BASE_AUDIO + direct];
        // Sentences composed dynamically, and lists of words at high levels:
        // concatenate the prerecorded word pronunciation files.
        if (keyLang === 'en' || keyLang === 'es') {
            var dot = index[keyLang + '|' + norm + '.'];
            if (dot)
                return [BASE_AUDIO + dot];
        }
        var parts = norm.match(/[a-zà-ÿñ]+(?:['’][a-zà-ÿ]+)?/g) || [];
        var files = [];
        for (var i = 0; i < parts.length; i++) {
            var f = index[keyLang + '|' + parts[i]];
            if (f)
                files.push(BASE_AUDIO + f);
        }
        return files;
    }
    NS.speakLine = function (text, lang, slow) {
        if (!text)
            return false;
        NS.lastSpoken = [text, lang];
        NS.stopEnglishAudio();
        var serial = playbackSerial;
        var files = audioFiles(text, lang);
        if (!files.length) {
            if (!ttsFallback(text, lang) && NS.toast)
                NS.toast('Audio non disponibile: prova a riavviare l’app.');
            return false;
        }
        var i = 0;
        function playNext() {
            if (serial !== playbackSerial)
                return;
            if (i >= files.length) {
                playingAudio = null;
                return;
            }
            var audio = getPlayer();
            if (!audio) {
                if (!ttsFallback(text, lang) && NS.toast)
                    NS.toast('Audio non disponibile su questo dispositivo.');
                return;
            }
            playingAudio = audio;
            audio.onended = function () { if (serial === playbackSerial) {
                i++;
                playNext();
            } };
            audio.onerror = function () {
                if (serial !== playbackSerial)
                    return;
                playingAudio = null;
                if (!ttsFallback(text, lang) && NS.toast)
                    NS.toast('Audio non disponibile su questo dispositivo.');
            };
            // versione web: l'audio arriva da pacchetti per lingua (NS.audioSource); nell'APK resta il file .mp3
            var src = files[i];
            if (typeof NS.audioSource === 'function') {
                var packed = NS.audioSource(src);
                if (packed === null) {
                    playingAudio = null;
                    NS.audioReady(src).then(function (ok) { if (serial !== playbackSerial)
                        return; if (ok)
                        playNext();
                    else if (!ttsFallback(text, lang) && NS.toast)
                        NS.toast('Audio non disponibile su questo dispositivo.'); });
                    return;
                }
                src = packed;
            }
            audio.src = src;
            try {
                audio.playbackRate = slow ? 0.72 : 1;
                if ('preservesPitch' in audio)
                    audio.preservesPitch = true;
            }
            catch (_r) { }
            try {
                var result = audio.play();
                if (result && typeof result.catch === 'function') {
                    result.catch(function () {
                        if (serial !== playbackSerial)
                            return;
                        playingAudio = null;
                        if (!ttsFallback(text, lang) && NS.toast)
                            NS.toast('Tocca nuovamente 🔊 per ascoltare.');
                    });
                }
            }
            catch (_error) {
                if (serial !== playbackSerial)
                    return;
                if (!ttsFallback(text, lang) && NS.toast)
                    NS.toast('Audio non disponibile su questo dispositivo.');
            }
        }
        playNext();
        return true;
    };
    NS.speak = NS.speakLine;
    NS.speakSlow = function () { if (NS.lastSpoken)
        NS.speakLine(NS.lastSpoken[0], NS.lastSpoken[1], true); };
    // testo sicuro dentro onclick="...('testo')": prima escape per JavaScript, poi per HTML
    NS.jsArg = function (text) { return NS.escapeHtml(String(text).replace(/\\/g, '\\\\').replace(/'/g, "\\'")); };
    function soundBtn(text, lang, label) {
        return "<button class=\"speak\" aria-label=\"".concat(label || 'Ascolta', "\" onclick=\"LogicLand.speakLine('").concat(NS.jsArg(text), "','").concat(lang || 'en-GB', "')\">\uD83D\uDD0A ").concat(label || 'Audio', "</button>");
    }
    function qPicture(level, state) {
        var w = NS.selectEnglishWord(state, level), reverse = level >= 9 && NS.rnd(0, 2) === 0, others = distractWords(w, Math.min(5, NS.levelProfile(level).choices));
        if (reverse) {
            var opts_1 = NS.shuffle(__spreadArray([w], __read(others), false)).slice(0, NS.levelProfile(level).choices).map(function (x) { return ({ label: "".concat(x.emoji, "<br><small>").concat(x.it, "</small>"), value: x.en }); });
            return { word: w, prompt: "Quale immagine significa \u201C".concat(w.en.toUpperCase(), "\u201D?"), sub: "Livello parola: ".concat(w.cefr || 'A1'), custom: soundBtn(w.en, 'en-GB', 'Ascolta la parola'), options: opts_1, answer: w.en, answerLabel: "".concat(w.en.toUpperCase(), " = ").concat(w.it), hint: "Pensa alla categoria: ".concat(w.cat, ".") };
        }
        var opts = NS.shuffle(__spreadArray([w], __read(others), false)).slice(0, NS.levelProfile(level).choices).map(function (x) { return ({ label: x.en.toUpperCase(), value: x.en }); });
        return { word: w, prompt: "Come si dice ".concat(w.emoji, " in inglese?"), sub: "In italiano: ".concat(w.it, " \u2022 livello ").concat(w.cefr || 'A1'), custom: soundBtn(w.en, 'en-GB', 'Ascolta la parola'), options: opts, answer: w.en, answerLabel: w.en.toUpperCase(), hint: "La parola comincia con \u201C".concat(w.en[0].toUpperCase(), "\u201D.") };
    }
    function qListen(level, state) {
        var w = NS.selectEnglishWord(state, level), others = distractWords(w, Math.min(5, NS.levelProfile(level).choices)), advanced = level >= 10 && NS.rnd(0, 1) === 1;
        var base = __spreadArray([w], __read(others), false).slice(0, NS.levelProfile(level).choices);
        var opts = advanced ? NS.shuffle(base).map(function (x) { return ({ label: x.en.toUpperCase(), value: x.en }); }) : NS.shuffle(base).map(function (x) { return ({ label: "".concat(x.emoji, "<br><small>").concat(x.it, "</small>"), value: x.en }); });
        return { word: w, prompt: advanced ? 'Ascolta e riconosci la parola scritta' : 'Ascolta la parola inglese', sub: 'Tocca l’altoparlante e scegli la risposta corretta.', custom: soundBtn(w.en, 'en-GB', 'Ascolta'), options: opts, answer: w.en, answerLabel: "".concat(w.en.toUpperCase(), " = ").concat(w.it), hint: 'Puoi ascoltarla più volte.', afterRender: function () { return setTimeout(function () { return NS.speakLine(w.en, 'en-GB'); }, 300); } };
    }
    function qBuildWord(level, state) {
        var w = NS.selectEnglishWord(state, level), answer = w.en.toUpperCase(), letters = NS.shuffle(answer.replaceAll(' ', '').split('')), id = 'bw_' + Math.random().toString(36).slice(2), showItalian = level < 11;
        return { word: w, prompt: "Costruisci la parola ".concat(w.emoji), sub: showItalian ? "In italiano: ".concat(w.it) : "Indizio: categoria \u201C".concat(w.cat, "\u201D \u2022 ").concat(w.cefr || 'A1'),
            visual: "<div class=\"wordline\" id=\"".concat(id, "_out\">_</div><div class=\"letters\">").concat(letters.map(function (ch, i) { return "<button class=\"letter\" id=\"".concat(id, "_").concat(i, "\" onclick=\"LogicLand.addLetter('").concat(id, "',").concat(i, ",'").concat(NS.escapeHtml(ch), "')\">").concat(NS.escapeHtml(ch), "</button>"); }).join(''), "</div><button class=\"secondary\" onclick=\"LogicLand.clearWord('").concat(id, "')\">\u21BA Ricomincia</button>"),
            custom: "".concat(soundBtn(w.en, 'en-GB', 'Ascolta la parola'), "<button class=\"nextBtn\" style=\"max-width:280px;margin:10px auto 0\" onclick=\"LogicLand.submitWord('").concat(id, "')\">Controlla parola</button>"), options: null, answer: answer.replaceAll(' ', ''), answerLabel: answer, hint: "La parola ha ".concat(answer.replaceAll(' ', '').length, " lettere."), afterRender: function () { NS.wordBuffers[id] = ''; } };
    }
    function qTranslate(level, state) {
        var w = NS.selectEnglishWord(state, level), others = distractWords(w, Math.min(5, NS.levelProfile(level).choices)), reverse = level >= 8 && NS.rnd(0, 1) === 1;
        if (reverse) {
            var opts_2 = NS.shuffle(__spreadArray([w], __read(others), false)).slice(0, NS.levelProfile(level).choices).map(function (x) { return ({ label: x.it.toUpperCase(), value: x.en }); });
            return { word: w, prompt: "Cosa significa \u201C".concat(w.en.toUpperCase(), "\u201D?"), visual: "<div class=\"bigVisual\">".concat(w.emoji, "</div>"), custom: soundBtn(w.en, 'en-GB', 'Ascolta la parola'), options: opts_2, answer: w.en, answerLabel: w.it.toUpperCase(), hint: 'Collega la parola alla sua immagine e categoria.' };
        }
        var opts = NS.shuffle(__spreadArray([w], __read(others), false)).slice(0, NS.levelProfile(level).choices).map(function (x) { return ({ label: x.en.toUpperCase(), value: x.en }); });
        return { word: w, prompt: "Traduci: \u201C".concat(w.it, "\u201D"), visual: "<div class=\"bigVisual\">".concat(w.emoji, "</div>"), custom: soundBtn(w.it, 'it-IT', 'Ascolta in italiano'), options: opts, answer: w.en, answerLabel: w.en.toUpperCase(), hint: 'Pensa alla parola già incontrata nei giochi precedenti.' };
    }
    function qSentence(level, state) {
        var sentenceLevel = Math.min(8, Math.max(1, NS.levelBand(level))), pool = NS.SENTENCES.filter(function (x) { return x.lvl <= sentenceLevel; }), useDynamic = level >= 11 && NS.rnd(0, 1) === 1;
        if (useDynamic) {
            var w_1 = NS.selectEnglishWord(state, level), wrong_1 = distractWords(w_1, 5).map(function (x) { return x.en; }), templates = ["I can see a ___ .", "This is my ___ .", "I like the ___ .", "Where is the ___ ?", "I use my ___ at school.", "We go to the ___ at the weekend."], s = NS.pick(templates);
            return { word: w_1, prompt: 'Completa la frase', visual: "<div class=\"bigVisual sentenceVisual\">".concat(NS.escapeHtml(s), "</div>"), sub: "Parola da usare: ".concat(w_1.it, " ").concat(w_1.emoji, " \u2022 ").concat(w_1.cefr || 'A1'), custom: soundBtn(s.replace('___', w_1.en), 'en-GB', 'Ascolta la frase'), options: NS.uniqueOptions(w_1.en, wrong_1, NS.levelProfile(level).choices), answer: w_1.en, answerLabel: w_1.en.toUpperCase(), hint: "Inserisci la parola inglese per \u201C".concat(w_1.it, "\u201D.") };
        }
        var item = NS.pick(pool), w = NS.WORDS.find(function (x) { return x.en === item.a; }) || NS.selectEnglishWord(state, level), wrong = distractWords(w, 5).map(function (x) { return x.en; });
        return { word: w, prompt: 'Completa la frase', visual: "<div class=\"bigVisual sentenceVisual\">".concat(NS.escapeHtml(item.s), "</div>"), sub: "".concat(item.it, " \u2022 livello ").concat(w.cefr || 'A1'), custom: soundBtn(item.s.replace('___', item.a), 'en-GB', 'Ascolta la frase'), options: NS.uniqueOptions(item.a, wrong, NS.levelProfile(level).choices), answer: item.a, answerLabel: item.a.toUpperCase(), hint: "La frase parla di \u201C".concat(w.it, "\u201D.") };
    }
    NS.wordBuffers = {};
    NS.addLetter = function (id, index, ch) { var _a; if ((_a = NS.isLocked) === null || _a === void 0 ? void 0 : _a.call(NS))
        return; var b = document.getElementById("".concat(id, "_").concat(index)); if (!b || b.disabled)
        return; b.disabled = true; b.style.opacity = .35; NS.wordBuffers[id] = (NS.wordBuffers[id] || '') + ch; var out = document.getElementById("".concat(id, "_out")); if (out)
        out.textContent = NS.wordBuffers[id] || '_'; };
    NS.clearWord = function (id) { var _a; if ((_a = NS.isLocked) === null || _a === void 0 ? void 0 : _a.call(NS))
        return; NS.wordBuffers[id] = ''; var out = document.getElementById("".concat(id, "_out")); if (out)
        out.textContent = '_'; document.querySelectorAll("[id^=\"".concat(id, "_\"]")).forEach(function (el) { if (el.tagName === 'BUTTON') {
        el.disabled = false;
        el.style.opacity = 1;
    } }); };
    NS.submitWord = function (id) { if (NS.submitCustomAnswer)
        NS.submitCustomAnswer(NS.wordBuffers[id] || ''); };
    NS.EnglishGames = { 16: qPicture, 17: qListen, 18: qBuildWord, 19: qTranslate, 20: qSentence };
})(window.LogicLand);
