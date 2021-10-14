const path = require('path');
const { merge } = require('webpack-merge');
const commonConfig = require('./webpack-common');

const prodMinConfig = {
    mode: "production",
    entry: "./src/index.ts",
    output: {
        filename: "xlpano.min.js",
        path: path.join(__dirname, '../dist'),
        library: 'XLPano',
    },
};

module.exports = merge(commonConfig, prodMinConfig);
