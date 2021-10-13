const path = require('path');
const { merge } = require('webpack-merge');
const commonConfig = require('./webpack-common');

const prodConfig = {
    entry: "./src/index.ts",
    output: {
        filename: "index.js",
        path: path.join(__dirname, '../dist'),
        library: 'XLPano',
        libraryTarget: 'umd',
    },
};

module.exports = merge(commonConfig, prodConfig);
