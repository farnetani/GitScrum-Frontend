const appConfig = require('./src/app.config')
const CompressionPlugin = require('compression-webpack-plugin')

/** @type import('@vue/cli-service').ProjectOptions */
module.exports = {
    runtimeCompiler: true,

    configureWebpack: {
        plugins: [new CompressionPlugin({
            algorithm: 'gzip',
            cache: true,
            compressionOptions: {
                level: 9
            },
        })],
        // We provide the app's title in Webpack's name field, so that
        // it can be accessed in index.html to inject the correct title.
        name: appConfig.title,
        // Set up all the aliases we use in our app.
        resolve: {
            alias: require('./aliases.config').webpack,
        },
        performance: {
            // Only enable performance hints for production builds,
            // outside of tests.
            hints: false //process.env.NODE_ENV === 'production' && !process.env.VUE_APP_TEST && 'warning',
        },
        optimization: {
            splitChunks: {
                minSize: 10000,
                maxSize: 250000,
            },
            removeAvailableModules: false,
            minimize: true,
            minimizer: [],
            runtimeChunk: true,
        },
    },
    css: {
        // Enable CSS source maps.
        sourceMap: false,
    },
    // Configure Webpack's dev server.
    // https://cli.vuejs.org/guide/cli-service.html
    devServer: {
        ...(process.env.API_BASE_URL // Proxy API endpoints to the production base URL.
            ?
            {
                proxy: {
                    '/api': {
                        target: process.env.API_BASE_URL,
                    },
                },
            } // Proxy API endpoints a local mock API.
            :
            {
                before: require('./tests/mock-api'),
            }),

        compress: false,
        historyApiFallback: true,
        hot: true,
        open: true,
        overlay: true,
        port: 8080,
        stats: {
            normal: true,
        },
    },
}