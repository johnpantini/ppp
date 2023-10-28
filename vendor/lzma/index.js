//! © 2015 Nathan Rugg <nmrugg@gmail.com> | MIT
var lzma;function load_lzma(){return require(require("path").join(__dirname,"src","lzma_worker.js")).LZMA_WORKER}lzma=load_lzma(),module.exports.compress=lzma.compress,module.exports.decompress=lzma.decompress;
