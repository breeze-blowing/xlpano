const HtmlWebpackPlugin = require('html-webpack-plugin');
const { merge } = require('webpack-merge');
const commonConfig = require('./webpack-common');

const devConfig = {
    entry: "./example/index.ts",
    output: {
        filename: "bundle.js",
        path: __dirname + "/dist",
    },
    devServer: {
        static: './dist',
        port: '8000',
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: "XLPano 示例",
            template: "./example/index.html"
        }),
    ],
};

module.exports = merge(commonConfig, devConfig);
