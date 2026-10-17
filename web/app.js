(function () {
    'use strict';

    const config = window.HSC_LOADING_CONFIG || {};
    const $ = (selector) => document.querySelector(selector);
    const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const state = {
        progress: 0,
        activeBackground: 0,
        backgroundLayer: 0,
        activeTip: 0,
        activePanel: 0,
        panels: [],
        panelTimer: null,
        track: 0,
        audio: new Audio(),
        musicReady: false,
        musicTracks: [],
        musicFailures: new Set(),
        musicGeneration: 0,
        musicTimeout: null,
        musicFallbackActive: false,
        musicPlayRequested: false,
        musicAutoplayBlocked: false
    };

    const elements = {
        backgroundA: $('#background-a'),
        backgroundB: $('#background-b'),
        video: $('#background-video'),
        status: $('#status-label'),
        socialLinks: $('#social-links'),
        logo: $('#server-logo'),
        shortName: $('#server-short-name'),
        name: $('#server-name'),
        tagline: $('#server-tagline'),
        description: $('#server-description'),
        loadingMessage: $('#loading-message'),
        percent: $('#progress-percent'),
        progress: $('#progress-track'),
        progressFill: $('#progress-fill'),
        tip: $('#tip-text'),
        panelContent: $('#panel-content'),
        panelTabs: $('#panel-tabs'),
        panelCount: $('#panel-count'),
        musicPlayer: $('#music-player'),
        previousTrack: $('#previous-track'),
        togglePlay: $('#toggle-play'),
        nextTrack: $('#next-track'),
        playIcon: $('#play-icon'),
        pauseIcon: $('#pause-icon'),
        trackTitle: $('#track-title'),
        musicStatus: $('#music-status'),
        toggleMute: $('#toggle-mute'),
        volumeIcon: $('#volume-icon'),
        muteIcon: $('#mute-icon'),
        volumeSlider: $('#volume-slider'),
        keyboardHint: $('#keyboard-hint'),
        poweredBy: $('#powered-by')
    };

    function safeText(value, fallback) {
        return typeof value === 'string' && value.trim() ? value.trim() : fallback;
    }

    function makeElement(tag, className, text) {
        const element = document.createElement(tag);
        if (className) element.className = className;
        if (text !== undefined) element.textContent = text;
        return element;
    }

    function setTheme() {
        const theme = config.theme || {};
        const root = document.documentElement;
        root.style.setProperty('--accent', safeText(theme.accent, '#ff3b30'));
        root.style.setProperty('--accent-secondary', safeText(theme.accentSecondary, '#ff8a3d'));
        root.style.setProperty('--text', safeText(theme.text, '#f7f8fb'));
        root.style.setProperty('--muted', safeText(theme.mutedText, '#a9aebb'));
        root.style.setProperty('--panel', safeText(theme.panel, '#0b0d12'));
        root.style.setProperty('--overlay-opacity', String(clamp(Number(theme.overlayOpacity) || 0.72, 0, 0.95)));
        document.body.classList.toggle('hide-grid', theme.showGrid === false);
        document.body.classList.toggle('hide-grain', theme.showGrain === false);
    }

    function setBrand() {
        const server = config.server || {};
        document.title = `${safeText(server.name, 'Your Server')} — Connecting`;
        elements.status.textContent = safeText(server.statusText, 'Establishing connection');
        elements.logo.src = safeText(server.logo, 'assets/logo-placeholder.svg');
        elements.logo.alt = `${safeText(server.name, 'Server')} logo`;
        elements.shortName.textContent = safeText(server.shortName, 'SERVER');
        elements.name.textContent = safeText(server.name, 'Your Server');
        elements.tagline.textContent = safeText(server.tagline, 'Your story starts here.');
        elements.description.textContent = safeText(server.description, 'A premium roleplay experience awaits.');

        const product = config.product || {};
        elements.poweredBy.textContent = safeText(product.creditText, 'Powered by Hotspot Creations');
        elements.poweredBy.hidden = product.showCredit === false;
    }

    function setSocials() {
        const socials = Array.isArray(config.socials) ? config.socials : [];
        elements.socialLinks.replaceChildren();

        socials.slice(0, 4).forEach((social) => {
            const hasUrl = typeof social.url === 'string' && /^https?:\/\//i.test(social.url);
            const item = makeElement(hasUrl ? 'a' : 'span', 'social-link');
            const label = makeElement('span', 'social-link__label', safeText(social.label, 'Link'));
            const value = makeElement('strong', 'social-link__value', safeText(social.value, 'Coming soon'));
            item.append(label, value);

            if (hasUrl) {
                item.href = social.url;
                item.target = '_blank';
                item.rel = 'noopener noreferrer';
            }

            elements.socialLinks.appendChild(item);
        });
    }

    function setBackgroundImage(layer, source) {
        if (!source) return;
        layer.style.backgroundImage = `url(${JSON.stringify(source)})`;
    }

    function startSlideshow() {
        const media = config.media || {};
        const backgrounds = Array.isArray(media.backgrounds) ? media.backgrounds.filter(Boolean) : [];
        if (!backgrounds.length) return;

        elements.video.classList.remove('is-visible');
        setBackgroundImage(elements.backgroundA, backgrounds[0]);
        elements.backgroundA.classList.add('is-visible');

        if (backgrounds.length < 2 || reducedMotion) return;
        const interval = Math.max(Number(media.backgroundInterval) || 9000, 3000);

        window.setInterval(() => {
            state.activeBackground = (state.activeBackground + 1) % backgrounds.length;
            state.backgroundLayer = state.backgroundLayer === 0 ? 1 : 0;
            const incoming = state.backgroundLayer === 0 ? elements.backgroundA : elements.backgroundB;
            const outgoing = state.backgroundLayer === 0 ? elements.backgroundB : elements.backgroundA;
            setBackgroundImage(incoming, backgrounds[state.activeBackground]);
            incoming.classList.add('is-visible');
            outgoing.classList.remove('is-visible');
        }, interval);
    }

    function setMedia() {
        const media = config.media || {};
        const video = media.video || {};

        if (video.enabled === true && safeText(video.source, '')) {
            elements.video.src = video.source;
            elements.video.addEventListener('canplay', () => {
                elements.video.classList.add('is-visible');
                elements.video.play().catch(startSlideshow);
            }, { once: true });
            elements.video.addEventListener('error', startSlideshow, { once: true });
            elements.video.load();
            window.setTimeout(() => {
                if (elements.video.readyState < 3) startSlideshow();
            }, 3500);
            return;
        }

        startSlideshow();
    }

    function setProgress(value) {
        const next = clamp(Number(value) || 0, 0, 100);
        state.progress = next;
        const rounded = Math.round(next);
        elements.percent.textContent = `${rounded}%`;
        elements.progressFill.style.width = `${next}%`;
        elements.progress.setAttribute('aria-valuenow', String(rounded));

        const messages = config.loading && Array.isArray(config.loading.messages)
            ? config.loading.messages.filter(Boolean)
            : [];
        if (messages.length) {
            const index = Math.min(Math.floor((next / 100) * messages.length), messages.length - 1);
            elements.loadingMessage.textContent = messages[index];
        }
    }

    function startTips() {
        const loading = config.loading || {};
        const tips = Array.isArray(loading.tips) ? loading.tips.filter(Boolean) : [];
        if (!tips.length) {
            $('.tip-card').hidden = true;
            return;
        }

        elements.tip.textContent = tips[0];
        if (tips.length < 2 || reducedMotion) return;

        window.setInterval(() => {
            state.activeTip = (state.activeTip + 1) % tips.length;
            elements.tip.classList.add('is-changing');
            window.setTimeout(() => {
                elements.tip.textContent = tips[state.activeTip];
                elements.tip.classList.remove('is-changing');
            }, 220);
        }, Math.max(Number(loading.tipInterval) || 7000, 3000));
    }

    function panelHeading(panel) {
        const fragment = document.createDocumentFragment();
        fragment.appendChild(makeElement('span', 'panel-eyebrow', safeText(panel.eyebrow, 'Server info')));
        fragment.appendChild(makeElement('h2', '', safeText(panel.title, 'Welcome')));
        return fragment;
    }

    function renderWelcome(panel) {
        const wrapper = makeElement('div', 'panel-body panel-body--welcome');
        wrapper.appendChild(panelHeading(panel));
        wrapper.appendChild(makeElement('p', 'panel-copy', safeText(panel.body, 'Welcome to the server.')));

        const stats = makeElement('div', 'stat-grid');
        (Array.isArray(panel.stats) ? panel.stats : []).slice(0, 3).forEach((stat) => {
            const item = makeElement('div', 'stat');
            item.append(
                makeElement('strong', '', safeText(stat.value, '—')),
                makeElement('span', '', safeText(stat.label, 'Info'))
            );
            stats.appendChild(item);
        });
        if (stats.childElementCount) wrapper.appendChild(stats);
        return wrapper;
    }

    function renderFeatures(panel) {
        const wrapper = makeElement('div', 'panel-body');
        wrapper.appendChild(panelHeading(panel));
        const list = makeElement('div', 'feature-list');
        (Array.isArray(panel.items) ? panel.items : []).slice(0, 4).forEach((feature, index) => {
            const item = makeElement('div', 'feature-item');
            item.append(
                makeElement('span', 'feature-item__number', String(index + 1).padStart(2, '0')),
                makeElement('div', 'feature-item__copy')
            );
            item.lastElementChild.append(
                makeElement('strong', '', safeText(feature.title, 'Feature')),
                makeElement('p', '', safeText(feature.text, 'Server feature description.'))
            );
            list.appendChild(item);
        });
        wrapper.appendChild(list);
        return wrapper;
    }

    function renderRules(panel) {
        const wrapper = makeElement('div', 'panel-body');
        wrapper.appendChild(panelHeading(panel));
        const list = makeElement('ol', 'rule-list');
        (Array.isArray(panel.items) ? panel.items : []).slice(0, 5).forEach((rule) => {
            list.appendChild(makeElement('li', '', safeText(rule, 'Follow the server rules.')));
        });
        wrapper.appendChild(list);
        return wrapper;
    }

    function renderTeam(panel) {
        const wrapper = makeElement('div', 'panel-body');
        wrapper.appendChild(panelHeading(panel));
        const list = makeElement('div', 'team-list');
        (Array.isArray(panel.members) ? panel.members : []).slice(0, 4).forEach((member) => {
            const item = makeElement('div', 'team-member');
            item.append(
                makeElement('span', 'team-member__avatar', safeText(member.initials, 'TM').slice(0, 3)),
                makeElement('div', 'team-member__copy')
            );
            item.lastElementChild.append(
                makeElement('strong', '', safeText(member.name, 'Team member')),
                makeElement('span', '', safeText(member.role, 'Staff'))
            );
            list.appendChild(item);
        });
        wrapper.appendChild(list);
        return wrapper;
    }

    const panelRenderers = {
        welcome: renderWelcome,
        features: renderFeatures,
        rules: renderRules,
        team: renderTeam
    };

    function showPanel(index, manual) {
        if (!state.panels.length) return;
        state.activePanel = (index + state.panels.length) % state.panels.length;
        const selected = state.panels[state.activePanel];
        const renderer = panelRenderers[selected.key] || renderWelcome;

        elements.panelContent.classList.add('is-changing');
        window.setTimeout(() => {
            elements.panelContent.replaceChildren(renderer(selected.data));
            elements.panelContent.classList.remove('is-changing');
        }, reducedMotion ? 0 : 170);

        elements.panelCount.textContent = `${String(state.activePanel + 1).padStart(2, '0')} / ${String(state.panels.length).padStart(2, '0')}`;
        Array.from(elements.panelTabs.children).forEach((button, buttonIndex) => {
            const active = buttonIndex === state.activePanel;
            button.classList.toggle('is-active', active);
            button.setAttribute('aria-selected', String(active));
        });

        if (manual) restartPanelTimer();
    }

    function restartPanelTimer() {
        window.clearInterval(state.panelTimer);
        const panels = config.panels || {};
        if (panels.autoRotate === false || state.panels.length < 2 || reducedMotion) return;
        state.panelTimer = window.setInterval(() => showPanel(state.activePanel + 1, false), Math.max(Number(panels.interval) || 8500, 4000));
    }

    function setPanels() {
        const panels = config.panels || {};
        state.panels = Object.keys(panelRenderers)
            .filter((key) => panels[key] && panels[key].enabled !== false)
            .map((key) => ({ key, data: panels[key] }));

        elements.panelTabs.replaceChildren();
        if (!state.panels.length) {
            $('.info-card').hidden = true;
            return;
        }

        state.panels.forEach((panel, index) => {
            const button = makeElement('button', 'panel-tab', safeText(panel.data.label, panel.key));
            button.type = 'button';
            button.role = 'tab';
            button.setAttribute('aria-selected', 'false');
            button.addEventListener('click', () => showPanel(index, true));
            elements.panelTabs.appendChild(button);
        });

        showPanel(0, false);
        restartPanelTimer();
    }

    // The HTMLAudioElement can play both packaged files and remote audio streams.
    // Sharing-page links (YouTube, Spotify, etc.) are NOT audio streams.
    function normalizeMusicTrack(entry, index) {
        const track = typeof entry === 'string' ? { source: entry } : entry;
        if (!track || typeof track !== 'object') return null;
        const source = safeText(track.source, safeText(track.url, safeText(track.link, '')));
        if (!source) return null;
        return {
            title: safeText(track.title, `Track ${index + 1}`),
            artist: safeText(track.artist, ''),
            source,
            fallbackSource: safeText(track.fallbackSource, safeText(track.fallbackUrl, ''))
        };
    }

    function isWebpageLink(source) {
        try {
            const url = new URL(source, window.location.href);
            const host = url.hostname.toLowerCase();
            const path = url.pathname.toLowerCase();
            return host === 'youtu.be'
                || host === 'youtube.com' || host.endsWith('.youtube.com')
                || host === 'open.spotify.com'
                || host === 'music.apple.com'
                || host === 'soundcloud.com' || host.endsWith('.soundcloud.com')
                || (host === 'drive.google.com' && path.includes('/file/'))
                || (host === 'dropbox.com' && !url.searchParams.has('raw') && url.searchParams.get('dl') !== '1');
        } catch (_) {
            return false;
        }
    }

    function setMusicStatus(message) {
        elements.musicStatus.textContent = message;
    }

    function clearMusicTimeout() {
        if (state.musicTimeout !== null) {
            window.clearTimeout(state.musicTimeout);
            state.musicTimeout = null;
        }
    }

    function updateMusicUI() {
        const playing = !state.audio.paused && !state.audio.ended;
        elements.playIcon.hidden = playing;
        elements.pauseIcon.hidden = !playing;
        elements.togglePlay.setAttribute('aria-label', playing ? 'Pause music' : 'Play music');
        elements.volumeIcon.hidden = state.audio.muted || state.audio.volume === 0;
        elements.muteIcon.hidden = !(state.audio.muted || state.audio.volume === 0);
        elements.toggleMute.setAttribute('aria-label', state.audio.muted ? 'Unmute music' : 'Mute music');
    }

    function requestMusicPlay() {
        const generation = state.musicGeneration;
        state.musicPlayRequested = true;
        const result = state.audio.play();
        if (result && typeof result.catch === 'function') {
            result.catch((error) => {
                if (generation !== state.musicGeneration || error.name === 'AbortError') return;
                if (error.name === 'NotAllowedError') {
                    state.musicPlayRequested = false;
                    state.musicAutoplayBlocked = true;
                    setMusicStatus('Click play to enable audio');
                    updateMusicUI();
                    return;
                }
                // The media error event generally provides the cause; if it does
                // not fire, use this rejection to move on to the next source.
                onMusicFailure(error.name || 'Playback failed');
            });
        }
    }

    function onMusicFailure(reason) {
        clearMusicTimeout();
        const track = state.musicTracks[state.track];
        if (!track) return;
        console.warn('[HSC Loading Screen] Audio failed:', reason, state.musicFallbackActive ? track.fallbackSource : track.source);

        // A local backup is useful when external hosts are slow or unavailable.
        if (!state.musicFallbackActive && track.fallbackSource) {
            state.musicFallbackActive = true;
            startMusicSource(track.fallbackSource);
            return;
        }

        state.musicFailures.add(state.track);
        if ((config.music || {}).skipOnError !== false
            && state.musicFailures.size < state.musicTracks.length) {
            const next = state.musicTracks.findIndex((_, index) =>
                index > state.track && !state.musicFailures.has(index));
            const wrapped = state.musicTracks.findIndex((_, index) => !state.musicFailures.has(index));
            selectMusicTrack(next >= 0 ? next : wrapped, state.musicPlayRequested, false);
            return;
        }

        state.musicPlayRequested = false;
        state.audio.pause();
        setMusicStatus(isWebpageLink(state.musicFallbackActive ? track.fallbackSource : track.source)
            ? 'Use a direct audio link, not a webpage'
            : 'Audio unavailable — check the link or host');
        updateMusicUI();
    }

    function startMusicSource(source) {
        clearMusicTimeout();
        const generation = ++state.musicGeneration;
        state.audio.pause();

        // These are webpage URLs, not media endpoints. Never try to load them
        // as audio; otherwise the browser fails silently.
        if (isWebpageLink(source)) {
            onMusicFailure('Webpage URL (not a direct audio stream)');
            return;
        }

        const isRemote = /^https?:\/\//i.test(source);
        if (isRemote && !/^https:\/\//i.test(source) && window.location.protocol === 'https:') {
            onMusicFailure('HTTP audio cannot load from an HTTPS page');
            return;
        }

        state.audio.src = source;
        state.audio.load();
        setMusicStatus(isRemote ? 'Connecting to audio link…' : 'Loading audio…');
        const music = config.music || {};
        const timeout = Math.max(3000, Math.min(60000, Number(music.loadTimeoutMs) || 15000));
        state.musicTimeout = window.setTimeout(() => {
            if (state.musicGeneration === generation && state.audio.readyState < 2) {
                onMusicFailure(`Timed out after ${timeout}ms`);
            }
        }, timeout);
        if (state.musicPlayRequested) requestMusicPlay();
        else setMusicStatus('Ready to play');
    }

    function selectMusicTrack(index, shouldPlay, resetFailures = true) {
        const tracks = state.musicTracks;
        if (!tracks.length) return;
        if (resetFailures) state.musicFailures.clear();
        state.track = ((index % tracks.length) + tracks.length) % tracks.length;
        state.musicFallbackActive = false;
        state.musicPlayRequested = shouldPlay;
        state.musicAutoplayBlocked = false;
        const track = tracks[state.track];
        elements.trackTitle.textContent = track.artist ? `${track.title} — ${track.artist}` : track.title;
        startMusicSource(track.source);
    }

    function toggleMusic() {
        if (state.audio.paused) {
            // Retry from the original link after a previous failure.
            if (state.musicFailures.has(state.track) || state.audio.error || !state.audio.src) {
                selectMusicTrack(state.track, true);
            } else {
                requestMusicPlay();
            }
        } else {
            state.musicPlayRequested = false;
            state.audio.pause();
            setMusicStatus('Paused');
        }
        updateMusicUI();
    }

    function setMusic() {
        const music = config.music || {};
        state.musicTracks = (Array.isArray(music.tracks) ? music.tracks : [])
            .map(normalizeMusicTrack).filter(Boolean);
        if (music.enabled === false || !state.musicTracks.length) return;

        state.musicReady = true;
        elements.musicPlayer.hidden = false;
        elements.keyboardHint.hidden = false;
        const configuredVolume = Number(music.volume);
        state.audio.volume = clamp(Number.isFinite(configuredVolume) ? configuredVolume : 0.35, 0, 1);
        state.audio.preload = 'auto';
        elements.volumeSlider.value = String(Math.round(state.audio.volume * 100));

        elements.togglePlay.addEventListener('click', toggleMusic);
        elements.previousTrack.addEventListener('click', () => selectMusicTrack(state.track - 1, state.musicPlayRequested));
        elements.nextTrack.addEventListener('click', () => selectMusicTrack(state.track + 1, state.musicPlayRequested));
        elements.toggleMute.addEventListener('click', () => {
            state.audio.muted = !state.audio.muted;
            updateMusicUI();
        });
        elements.volumeSlider.addEventListener('input', (event) => {
            state.audio.volume = clamp(Number(event.target.value) / 100, 0, 1);
            if (state.audio.volume > 0) state.audio.muted = false;
            updateMusicUI();
        });
        state.audio.addEventListener('play', updateMusicUI);
        state.audio.addEventListener('playing', () => {
            clearMusicTimeout();
            state.musicFailures.clear();
            state.musicAutoplayBlocked = false;
            setMusicStatus('Playing');
            updateMusicUI();
        });
        state.audio.addEventListener('pause', updateMusicUI);
        state.audio.addEventListener('canplay', () => {
            clearMusicTimeout();
            if (state.audio.paused && !state.musicPlayRequested && !state.musicAutoplayBlocked) {
                setMusicStatus('Ready to play');
            }
        });
        const watchBuffering = () => {
            if (!state.musicPlayRequested) return;
            setMusicStatus('Buffering…');
            clearMusicTimeout();
            const generation = state.musicGeneration;
            const timeout = Math.max(3000, Math.min(60000, Number(music.loadTimeoutMs) || 15000));
            state.musicTimeout = window.setTimeout(() => {
                if (generation === state.musicGeneration && state.audio.readyState < 3) {
                    onMusicFailure('Buffering timeout');
                }
            }, timeout);
        };
        state.audio.addEventListener('waiting', watchBuffering);
        state.audio.addEventListener('stalled', watchBuffering);
        state.audio.addEventListener('ended', () => selectMusicTrack(state.track + 1, true));
        state.audio.addEventListener('error', () => {
            // Ignore events from audio elements deliberately reset without a URL.
            if (!state.audio.getAttribute('src')) return;
            onMusicFailure(`Media error ${state.audio.error ? state.audio.error.code : 'unknown'}`);
        });

        selectMusicTrack(0, music.autoplay !== false);
        updateMusicUI();
    }

    function setKeyboardControls() {
        window.addEventListener('keydown', (event) => {
            if (!state.musicReady || event.repeat || event.altKey || event.ctrlKey || event.metaKey) return;
            if (event.target && event.target.closest('input, textarea, select, button, a, [contenteditable]')) return;
            if (event.code === 'Space') {
                event.preventDefault();
                toggleMusic();
            }
            if (event.key.toLowerCase() === 'm') {
                state.audio.muted = !state.audio.muted;
                updateMusicUI();
            }
            if (event.key === 'ArrowRight') selectMusicTrack(state.track + 1, state.musicPlayRequested);
            if (event.key === 'ArrowLeft') selectMusicTrack(state.track - 1, state.musicPlayRequested);
        });
    }

    function startBrowserPreview() {
        const localHosts = ['localhost', '127.0.0.1'];
        if (window.location.protocol !== 'file:' && !localHosts.includes(window.location.hostname)) return;
        let previewProgress = 0;
        window.setInterval(() => {
            previewProgress += previewProgress < 75 ? 0.8 : 0.25;
            if (previewProgress > 100) previewProgress = 0;
            setProgress(previewProgress);
        }, 80);
    }

    function listenForFiveM() {
        window.addEventListener('message', (event) => {
            const data = event.data || {};
            if (data.eventName !== 'loadProgress') return;
            setProgress(Number(data.loadFraction) * 100);
        });
    }

    setTheme();
    setBrand();
    setSocials();
    setMedia();
    setProgress(0);
    startTips();
    setPanels();
    setMusic();
    setKeyboardControls();
    listenForFiveM();
    startBrowserPreview();
}());
