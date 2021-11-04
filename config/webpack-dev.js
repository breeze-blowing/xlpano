const { merge } = require('webpack-merge');
const exampleConfig = require('./webpack-example');

const devConfig = {
    mode: "development",
    devServer: {
        static: '../docs',
        port: '8060',
    },
};

module.exports = merge(exampleConfig, devConfig);
