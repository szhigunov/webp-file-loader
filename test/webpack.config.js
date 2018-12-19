var path = require('path');

module.exports = {
  mode: 'development',
  entry: './test/index.js',
  target: 'web',
  output: {
    path: path.resolve('./test/build'),
    filename: 'app.js'
  },
  module: {
    rules: [
      {
        test: /\.(jpe?g|png)$/i,
        use: [{
          loader: './index.js',
          options: {
            publicPath: './assets/',
            /*
              https://github.com/imagemin/imagemin-webp#imageminwebpoptionsbuffer
            */
            webp: {
              lossless: true
            },
            name: '[name].[hash:8].[ext]'
          }
        }]
      },
    ]
  }
}