const path = require("path");

module.exports = function override(config) {
    config.module.rules.forEach((rule) => {
        if (rule.use) {
            rule.use.forEach((loader) => {
                if (
                    loader.loader &&
                    loader.loader.includes("source-map-loader")
                ) {
                    loader.exclude = [
                        ...(loader.exclude || []),
                        /html2pdf\.js/,
                    ];
                }
            });
        }
    });
    return config;
};
