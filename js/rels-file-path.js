"use strict";

module.exports = function getRelsFilePath(fileName) {
  var relsFileName = fileName.replace(/^.*?([a-zA-Z0-9]+)\.xml$/, "$1") + ".xml.rels";
  var path = fileName.split("/");
  path.pop();
  var prefix = path.join("/");
  return "".concat(prefix, "/_rels/").concat(relsFileName);
};