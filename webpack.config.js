module.exports = {
    entry: "./index.js",
    output: {
        filename: 'bundle.js',
        path: __dirname + '/dist',
        library: 'lib',
        libraryTarget: 'window',
        libraryExport: 'default'
    }
}