const orgCopyConfig = require('@ionic/app-scripts/config/copy.config')
orgCopyConfig.copyIndexContent.src.push('{{SRC}}/favicon.ico')
orgCopyConfig.copyFonts.src.push('{{ROOT}}/node_modules/font-awesome/fonts/**/*.woff')
module.exports = orgCopyConfig
