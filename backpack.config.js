// backpack.config.js
const { resolve } = require('path');

module.exports = {
    entry: resolve(__dirname, 'telegrambot/src/index.js'),
    webpack: (config, options, webpack) => {
        config.entry = resolve(__dirname, 'telegrambot/src/index.js');
        config.output.path = resolve(__dirname, "telegrambot/build/");
        // Perform customizations to config
        // Important: return the modified config
        // config.entry = resolve(__dirname, './index.js');
        return config;
    },
};