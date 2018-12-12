var path = require('path');

module.exports = {
  mode: 'production',
  entry: './test/index.js',
  target: 'node',
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
            /*
              https://github.com/imagemin/imagemin-webp#imageminwebpoptionsbuffer
            */
            webp: {
              quality: 65
            },
            name: '[name].[hash:8].[ext]'
          }
        }]
      },
    ]
  }
}