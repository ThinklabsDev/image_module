"use strict";

var str2xml = require("docxtemplater").DocUtils.str2xml;
function parseXML(zipFiles, path) {
  return str2xml(zipFiles[path].asText());
}
module.exports = function getMaxDocPrId(zip) {
  var max = 0;
  zip.file(/word\/(document|header[0-9]|footer[0-9]).xml/).map(function (f) {
    var xml = parseXML(zip.files, f.name);
    Array.prototype.slice.call(xml.getElementsByTagName("wp:docPr")).forEach(function (element) {
      var prId = parseInt(element.getAttribute("id"), 10);
      if (prId > max) {
        max = prId;
      }
    });
  });
  return max;
};