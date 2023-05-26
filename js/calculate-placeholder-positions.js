"use strict";

var _require = require("./content-types.js"),
  slideContentType = _require.slideContentType;
var RelationsManager = require("./relationship-manager.js");
var _require2 = require("./attributes.js"),
  getSingleAttribute = _require2.getSingleAttribute;
var _require3 = require("./sxml.js"),
  getAttribute = _require3.getAttribute,
  findParent = _require3.findParent,
  findChilds = _require3.findChilds;
function updatePlaceholders(xml, filePath) {
  var _this = this;
  xml.forEach(function (tag, i) {
    if (tag.type === "tag" && tag.tag === "p:ph") {
      var idx = getSingleAttribute(tag.value, "idx");
      var type = getSingleAttribute(tag.value, "type");
      var parent = findParent({
        index: [i, i],
        xml: xml
      }, "p:sp");
      var off = findChilds(parent, ["a:xfrm", "a:off"]);
      var ext = findChilds(parent, ["a:xfrm", "a:ext"]);
      if (off.length === 0) {
        return;
      }
      var x = +getAttribute(off[0], "x");
      var y = +getAttribute(off[0], "y");
      var cx = +getAttribute(ext[0], "cx");
      var cy = +getAttribute(ext[0], "cy");
      _this.placeholderIds[filePath].forEach(function (placeholder) {
        if ((placeholder.type == null || placeholder.type === type) && (placeholder.idx == null || placeholder.idx === idx) && placeholder.x == null) {
          placeholder.x = x;
          placeholder.y = y;
          placeholder.cx = cx;
          placeholder.cy = cy;
        }
      });
    }
  });
}
module.exports = function calculatePlaceholderPositions(parsed, options) {
  var _this2 = this;
  var filePath = options.filePath,
    contentType = options.contentType;
  if (this.fileType === "pptx" && slideContentType === contentType) {
    this.placeholderIds[filePath] = this.placeholderIds[filePath] || [];
    var lastIndex = null;
    var lastOffset = null;
    var idx;
    var type;
    var x, y, cx, cy;
    var lastI = null;
    var containerTags = ["p:sp", "p:graphicFrame", "p:pic"];
    parsed.forEach(function (_ref, i) {
      var tag = _ref.tag,
        position = _ref.position,
        value = _ref.value,
        lIndex = _ref.lIndex,
        offset = _ref.offset;
      if (containerTags.indexOf(tag) !== -1 && position === "start") {
        lastIndex = lIndex;
        lastOffset = offset;
        lastI = i;
      }
      if (tag === "p:ph" && position === "selfclosing") {
        idx = getSingleAttribute(value, "idx");
        type = getSingleAttribute(value, "type");
      }
      if (tag === "a:ext") {
        var xVal = parseInt(getSingleAttribute(value, "cx"), 10);
        if (typeof xVal === "number") {
          var yVal = parseInt(getSingleAttribute(value, "cy"), 10);
          cx = xVal;
          cy = yVal;
        }
      }
      if (tag === "a:off") {
        x = x || parseInt(getSingleAttribute(value, "x"), 10);
        y = y || parseInt(getSingleAttribute(value, "y"), 10);
      }
      if (containerTags.indexOf(tag) !== -1 && position === "end") {
        _this2.placeholderIds[filePath].push({
          lIndex: [lastIndex, lIndex],
          offset: [lastOffset, offset],
          idx: idx,
          type: type,
          i: [lastI, i],
          cx: cx,
          cy: cy,
          x: x,
          y: y
        });
        i = null;
        lastI = null;
        x = null;
        y = null;
        cx = null;
        cy = null;
        lastIndex = null;
        idx = null;
        type = null;
      }
    });
    var im = this.getRelationsManager(filePath);
    im.forEachRel(function (rel) {
      if (rel.type === "http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout") {
        var layout = _this2.preparsed[rel.absoluteTarget];
        new RelationsManager(_this2, rel.absoluteTarget).forEachRel(function (rel) {
          if (rel.type === "http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster") {
            updatePlaceholders.apply(_this2, [layout, filePath]);
            var master = _this2.preparsed[rel.absoluteTarget];
            updatePlaceholders.apply(_this2, [master, filePath]);
          }
        });
      }
    });
  }
};