module.exports = {
    entry: "./interpreter/index.js",
    output: {
        filename: 'bundle.js',
        path: __dirname,
        library: 'VTOLVRJSONUtility',
        libraryTarget: 'window',
        libraryExport: 'default'
    }
}