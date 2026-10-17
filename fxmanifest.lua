fx_version 'cerulean'
game 'gta5'

name 'hsc_loadingscreen'
author 'Hotspot Creations'
description 'A premium, configurable FiveM loading screen.'
version '1.0.1'

loadscreen 'web/index.html'
loadscreen_cursor 'yes'

files {
    'web/index.html',
    'web/style.css',
    'web/config.js',
    'web/app.js',
    'web/assets/*.svg',
    'web/media/*'
}

escrow_ignore {
    'web/config.js',
    'web/style.css',
    'web/assets/*',
    'web/media/*',
}
