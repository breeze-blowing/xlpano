const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { merge } = require('webpack-merge');
const commonConfig = require('./webpack-common');

const exampleConfig = {
    mode: "production",
    entry: "./example/index.ts",
    output: {
        filename: "bundle.js",
        path: path.join(__dirname, '../docs'),
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: "XLPano 示例",
            template: "./example/index.html"
        }),
    ],
};

module.exports = merge(commonConfig, exampleConfig);
