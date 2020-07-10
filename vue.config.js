module.exports = {
    devServer: {
        proxy: {
            '/.netlify': {
                target: 'http://localhost:9000',
                pathRewrite: { '^/.netlify/functions': '' },
            },
        },
    },
    productionSourceMap: false,
    transpileDependencies: ['vuetify'],
    configureWebpack: {
        optimization: {
            splitChunks: {
                minSize: 10000,
                maxSize: 230000,
            },
        },
    },
};
