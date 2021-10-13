module.exports = {
    mode: "development",
    devtool: "source-map",
    resolve: {
        extensions: [".ts", ".tsx", ".js"]
    },
    module: {
        rules: [
            { test: /\.tsx?$/, use: "ts-loader", exclude: /node_modules/, },
            { enforce: "pre", test: /\.js$/, loader: "source-map-loader" },
            { test: /(\.vert$)|(\.frag$)/, use: 'raw-loader' },
            { test: /\.(png|svg|jpg|jpeg|gif)$/i, type: 'asset/resource' },
        ]
    },
};
