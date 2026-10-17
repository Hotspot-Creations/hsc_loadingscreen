# HSC Dynamic Loading Screen

A polished, fully configurable FiveM loading screen by Hotspot Creations. It uses FiveM's real loading progress, requires no framework, and has no build step or external web dependencies.

## Highlights

- Real FiveM loading percentage and progress messages
- Image slideshow with three included original SVG backgrounds
- Optional local MP4 video background with automatic image fallback
- Optional multi-track local music player with volume, mute, and keyboard controls
- Editable welcome, feature, rules, staff, tips, social links, colors, logo, and branding
- Responsive layout, reduced-motion support, and browser preview mode
- Compatible with QBCore, ESX, and standalone servers
- Customer-facing branding and media files remain editable

## Installation

1. Copy the `hsc_loadingscreen` folder into your server's `resources` directory.
2. Add `ensure hsc_loadingscreen` to `server.cfg`.
3. Restart the server or run `refresh`, then `ensure hsc_loadingscreen` in the server console.
4. Edit `web/config.js` to add the customer's branding and server information.

To hide FiveM's default bottom-right loading spinner, add this optional line to `server.cfg`:

```cfg
setr sv_showBusySpinnerOnLoadingScreen false
```

## Quick customization

All normal product settings are in `web/config.js`. Replace `web/assets/logo-placeholder.svg` with a custom SVG, PNG, or WebP logo and update the `server.logo` path. Add optional audio/video files to `web/media`.

See `CUSTOMIZATION.md` for every setting and media guidance.

## Browser preview

Open `web/index.html` in a browser. The page automatically simulates loading progress on local files and localhost. The actual FiveM client replaces this with real loading progress in-game.

## Controls

Controls appear only when music is enabled and at least one valid track is configured.

- `Space`: play or pause
- `M`: mute or unmute
- `Left Arrow` / `Right Arrow`: previous or next track

## Support checklist

- Confirm all paths in `web/config.js` match their filenames exactly.
- Keep video and music files compressed to reduce the join download.
- Use only media you own or are licensed to redistribute.
- Do not enable manual shutdown unless you also add code that closes the loading screen.

## Credits

Created by Hotspot Creations.
