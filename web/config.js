/*
 * HSC Loading Screen
 * Edit this file to rebrand the product. No build step is required.
 * Paths are relative to the web folder unless noted otherwise.
 */

window.HSC_LOADING_CONFIG = {
    server: {
        name: 'Hotspot Creations Demo Server',
        shortName: 'HSCDS',
        tagline: 'Your story starts here.',
        description: 'A premium roleplay experience built around community, quality, and unforgettable stories.',
        logo: 'assets/logo-placeholder.svg',
        statusText: 'Establishing connection'
    },

    theme: {
        accent: '#ff3b30',
        accentSecondary: '#ff8a3d',
        text: '#f7f8fb',
        mutedText: '#a9aebb',
        panel: '#0b0d12',
        overlayOpacity: 0.72,
        showGrid: true,
        showGrain: true
    },

    media: {
        // The slideshow is used by default and as a fallback if a video cannot play.
        backgrounds: [
            'assets/background-city.svg',
            'assets/background-waves.svg',
            'assets/background-grid.svg'
        ],
        backgroundInterval: 9000,
        video: {
            enabled: false,
            source: 'media/background.mp4'
        }
    },

    loading: {
        messages: [
            'Preparing your session',
            'Loading the city',
            'Syncing server resources',
            'Finalizing your connection'
        ],
        tips: [
            'Respect every player and help create scenes everyone can enjoy.',
            'Value your character’s life and give every scene room to develop.',
            'Use /report when you need staff assistance; avoid breaking character in public.',
            'Join the community Discord for announcements, support, and server updates.'
        ],
        tipInterval: 7000
    },

    panels: {
        autoRotate: true,
        interval: 8500,
        welcome: {
            enabled: true,
            label: 'Welcome',
            eyebrow: 'Welcome to the city',
            title: 'Build a life worth remembering.',
            body: 'Meet the community, create your character, and shape a story that is entirely your own.',
            stats: [
                { value: '24/7', label: 'Online' },
                { value: '100+', label: 'Careers' },
                { value: 'Active', label: 'Staff' }
            ]
        },
        features: {
            enabled: true,
            label: 'Features',
            eyebrow: 'Made for roleplay',
            title: 'A city with depth.',
            items: [
                { title: 'Player-owned businesses', text: 'Build, manage, and grow your own operation.' },
                { title: 'Meaningful progression', text: 'Careers and skills designed for long-term stories.' },
                { title: 'Community events', text: 'Regular scenes that bring the whole city together.' }
            ]
        },
        rules: {
            enabled: true,
            label: 'Rules',
            eyebrow: 'Before you enter',
            title: 'Keep the story first.',
            items: [
                'Respect players, staff, and every scene.',
                'No random or vehicle deathmatching.',
                'No metagaming, powergaming, or exploiting.',
                'Stay in character and value your life.'
            ]
        },
        team: {
            enabled: true,
            label: 'Team',
            eyebrow: 'Here to help',
            title: 'Meet the leadership.',
            members: [
                { name: 'Hotspot Creations', role: 'Founder', initials: 'HSC' },
                { name: 'Novastormog', role: 'Lead Developer', initials: 'NS' },
            ]
        }
    },

    socials: [
        { label: 'Discord', value: 'discord.gg/Nx5KUYFgt5', url: 'https://discord.gg/Nx5KUYFgt5' },
        { label: 'Store', value: 'hsc.tebex.io', url: 'https://hsc.tebex.io' }
    ],

    music: {
        // Automatically shows the player when at least one track is configured.
        enabled: true,
        autoplay: true,
        volume: 0.35, // 0.0 (silent) to 1.0 (full volume)
        loadTimeoutMs: 15000, // How long to wait for a slow/unavailable URL (3–60 seconds)
        skipOnError: true, // Skip to the next song when one cannot play
        tracks: [
            { title: 'Hotspot RP', artist: 'HSFM', source: 'https://r2.fivemanage.com/7xIwz7L68BPMGPfucaimh/Music/HotspotRP.mp3' },
            { title: 'Where Stories Begin', artist: 'HSFM', source: 'https://r2.fivemanage.com/7xIwz7L68BPMGPfucaimh/Music/WhereStoriesBegin.mp3' },
            { title: 'Welcome To Hotspot', artist: 'LucyLondon', source: 'https://r2.fivemanage.com/7xIwz7L68BPMGPfucaimh/Music/WelcometoHotspot(LucyLondonOriginal).mp3' }
        ]
    },

    product: {
        showCredit: true,
        creditText: 'Powered by Hotspot Creations'
    }
};
