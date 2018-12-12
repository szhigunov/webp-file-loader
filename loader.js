var path = require('path');
var parse  = require('url').parse;
var loaderUtils = require('loader-utils');
var validateOptions = require('schema-utils');
var imagemin = require('imagemin');
var imageminWebp = require('imagemin-webp');

var schema = require('./options.json');

console.log(parse)
module.exports = function loader(content) {
  if (!this.emitFile)
    throw new Error('File Loader\n\nemitFile is required from module system');

  const options = loaderUtils.getOptions(this) || {};
  var callback = this.async();

  validateOptions(schema, options, 'File Loader');

  
  const resourceParams = new URLSearchParams(parse(this.resource).search)

  console.log(resourceParams)

  const context =
    options.context ||
    this.rootContext ||
    (this.options && this.options.context);

  const url = loaderUtils.interpolateName(this, options.name, {
    context,
    content,
    regExp: options.regExp,
  });

  let outputPath = url;
  let webpOutputPath = path.basename(url, '.png') + '.webp';

  if (options.outputPath) {
    if (typeof options.outputPath === 'function') {
      outputPath = options.outputPath(url);
      webpOutputPath = options.outputPath(webpOutputPath);
    } else {
      outputPath = path.posix.join(options.outputPath, url);
      webpOutputPath = path.posix.join(options.outputPath, webpOutputPath);
    }
  }

  if (options.useRelativePath) {
    const filePath = this.resourcePath;

    const issuer = options.context
      ? context
      : this._module && this._module.issuer && this._module.issuer.context;

    const relativeUrl =
      issuer &&
      path
        .relative(issuer, filePath)
        .split(path.sep)
        .join('/');

    const relativePath = relativeUrl && `${path.dirname(relativeUrl)}/`;
    // eslint-disable-next-line no-bitwise
    if (~relativePath.indexOf('../')) {
      outputPath = path.posix.join(outputPath, relativePath, url);
      webpOutputPath = path.posix.join(outputPath, relativePath, webpOutputPath);
    } else {
      outputPath = path.posix.join(relativePath, url);
      webpOutputPath = path.posix.join(relativePath, webpOutputPath);
    }
  }

  let publicPath = `__webpack_public_path__ + ${JSON.stringify(outputPath)}`;

  if (options.publicPath) {
    if (typeof options.publicPath === 'function') {
      publicPath = options.publicPath(url);
    } else if (options.publicPath.endsWith('/')) {
      publicPath = options.publicPath + url;
    } else {
      publicPath = `${options.publicPath}/${url}`;
    }

    publicPath = JSON.stringify(publicPath);
  }

  // eslint-disable-next-line no-undefined
  if (options.emitFile === undefined || options.emitFile) {
    this.emitFile(outputPath, content);
    imagemin
      .buffer(content,{
        plugins: imageminWebp(options.webp || { quality: 65 })
      })
      .then((data) => {
        this.emitFile(webpOutputPath, data);
        callback(null, `module.exports = ${publicPath};`);
      })
      .catch(function(err){
        callback(err);
      });
  } else {
    // TODO revert to ES2015 Module export, when new CSS Pipeline is in place
    callback(null, `module.exports = ${publicPath};`);
  }
}

module.exports.raw = true;