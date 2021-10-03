const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    mode: "development",
    entry: "./example/index.ts",
    output: {
        filename: "bundle.js",
        path: __dirname + "/dist"
    },
    devtool: "source-map",
    devServer: {
        static: './dist',
        port: '8000',
    },

    resolve: {
        extensions: [".ts", ".tsx", ".js"]
    },

    module: {
        rules: [
            { test: /\.tsx?$/, loader: "awesome-typescript-loader" },
            { enforce: "pre", test: /\.js$/, loader: "source-map-loader" },
            { test: /(\.vert$)|(\.frag$)/, use: 'raw-loader' }
        ]
    },

    externals: {
        "react": "React",
        "react-dom": "ReactDOM"
    },

    plugins: [
        new HtmlWebpackPlugin({
            title: "XLPano 示例",
            template: "./example/index.html"
        }),
    ],
};
