var path = require('path');

module.exports = {
    entry: {
        'kostyl': path.resolve(__dirname, './src/index.js')
    },
    output: {
        path: path.resolve(__dirname, './dist/'),
        filename: 'kostyl.js',
        library: 'Kostyl',
        libraryTarget: 'umd'
    },
    externals: {
        'jquery': {
            root: '$',
            commonjs2: 'jquery',
            commonjs: 'jquery',
            amd: 'jquery'
        },
        'underscore': {
            root: '_',
            commonjs2: 'underscore',
            commonjs: 'underscore',
            amd: 'underscore'
        }
    }
};
