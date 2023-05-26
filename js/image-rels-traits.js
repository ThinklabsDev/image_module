"use strict";

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function _iterableToArrayLimit(arr, i) { var _i = null == arr ? null : "undefined" != typeof Symbol && arr[Symbol.iterator] || arr["@@iterator"]; if (null != _i) { var _s, _e, _x, _r, _arr = [], _n = !0, _d = !1; try { if (_x = (_i = _i.call(arr)).next, 0 === i) { if (Object(_i) !== _i) return; _n = !1; } else for (; !(_n = (_s = _x.call(_i)).done) && (_arr.push(_s.value), _arr.length !== i); _n = !0); } catch (err) { _d = !0, _e = err; } finally { try { if (!_n && null != _i["return"] && (_r = _i["return"](), Object(_r) !== _r)) return; } finally { if (_d) throw _e; } } return _arr; } }
function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }
var extensionRegex = /[^.]+\.([^.]+)/;
var imgify = require("./img-manager.js");
var normalizePath = require("./normalize-path.js");
var str2xml = require("docxtemplater").DocUtils.str2xml;
var drawingXmlContentType = "application/vnd.openxmlformats-officedocument.drawing+xml";
var xlsxdrawingType = "http://schemas.openxmlformats.org/officeDocument/2006/relationships/drawing";
var baseDrawingXlsx = "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>\n<xdr:wsDr xmlns:xdr=\"http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing\" xmlns:r=\"http://schemas.openxmlformats.org/officeDocument/2006/relationships\" xmlns:a=\"http://schemas.openxmlformats.org/drawingml/2006/main\">\n</xdr:wsDr>";
var _require = require("./sxml.js"),
  firstChild = _require.firstChild,
  appendChild = _require.appendChild;
function equal8(a, b) {
  var ua = new Uint8Array(a.buffer, a.byteOffset, a.byteLength);
  var ub = new Uint8Array(b.buffer, b.byteOffset, b.byteLength);
  return compare(ua, ub);
}
function equal16(a, b) {
  var ua = new Uint16Array(a.buffer, a.byteOffset, a.byteLength / 2);
  var ub = new Uint16Array(b.buffer, b.byteOffset, b.byteLength / 2);
  return compare(ua, ub);
}
function equal32(a, b) {
  var ua = new Uint32Array(a.buffer, a.byteOffset, a.byteLength / 4);
  var ub = new Uint32Array(b.buffer, b.byteOffset, b.byteLength / 4);
  return compare(ua, ub);
}
function compare(a, b) {
  for (var i = a.length; i > -1; i -= 1) {
    if (a[i] !== b[i]) {
      return false;
    }
  }
  return true;
}
function aligned16(a) {
  return a.byteOffset % 2 === 0 && a.byteLength % 2 === 0;
}
function aligned32(a) {
  return a.byteOffset % 4 === 0 && a.byteLength % 4 === 0;
}
function equal(a, b) {
  if (a instanceof ArrayBuffer) {
    a = new Uint8Array(a, 0);
  }
  if (b instanceof ArrayBuffer) {
    b = new Uint8Array(b, 0);
  }
  if (a.byteLength !== b.byteLength) {
    return false;
  }
  if (aligned32(a) && aligned32(b)) {
    return equal32(a, b);
  }
  if (aligned16(a) && aligned16(b)) {
    return equal16(a, b);
  }
  return equal8(a, b);
}
module.exports = function (relM) {
  imgify(relM);
  relM.loadImageRels = function () {
    var iterable = relM.relsDoc.getElementsByTagName("Relationship");
    return Array.prototype.reduce.call(iterable, function (max, relationship) {
      var id = relationship.getAttribute("Id");
      if (/^rId[0-9]+$/.test(id)) {
        return Math.max(max, parseInt(id.substr(3), 10));
      }
      return max;
    }, 0);
  };
  relM.addImageRels = function (name, data) {
    var path, realImageName;
    relM.addedImages.some(function (im) {
      var isEqual = false;
      if (typeof Buffer !== "undefined" && data instanceof Buffer && im.data instanceof Buffer) {
        isEqual = Buffer.compare(data, im.data) === 0;
      } else if (data instanceof ArrayBuffer && im.data instanceof ArrayBuffer) {
        isEqual = equal(data, im.data);
      } else if (im.data === data) {
        isEqual = true;
      }
      if (isEqual) {
        realImageName = im.realImageName;
        return true;
      }
    });
    if (realImageName) {
      path = "".concat(relM.prefix, "/media/").concat(realImageName);
    } else {
      var i = 0;
      do {
        realImageName = i === 0 ? name : name + "(".concat(i, ")");
        path = "".concat(relM.prefix, "/media/").concat(realImageName);
        i++;
      } while (relM.zip.files[path] != null);
      relM.addedImages.push({
        data: data,
        realImageName: realImageName
      });
    }
    relM.zip.file(path, data, {
      binary: true
    });
    var extension = path.replace(extensionRegex, "$1");
    relM.addExtensionRels("image/".concat(extension), extension);
    relM.addExtensionRels("application/vnd.openxmlformats-package.relationships+xml", "rels");
    var relationships = relM.relsDoc.getElementsByTagName("Relationships")[0];
    var mediaPrefix = relM.fileType === "pptx" || relM.fileType === "xlsx" ? "../media" : "media";
    var relationshipChilds = relationships.getElementsByTagName("Relationship");
    for (var j = 0, len = relationshipChilds.length; j < len; j++) {
      var c = relationshipChilds[j];
      if (c.getAttribute("Target") === "".concat(mediaPrefix, "/").concat(realImageName)) {
        return c.getAttribute("Id");
      }
    }
    return relM.addRelationship({
      Type: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/image",
      Target: "".concat(mediaPrefix, "/").concat(realImageName)
    });
  };
  relM.addDrawingXML = function () {
    var zipFiles = relM.zip.files;
    var fileName;
    var i;
    i = 0;
    do {
      i++;
      fileName = "xl/drawings/drawing".concat(i, ".xml");
    } while (zipFiles[fileName] || relM.xmlDocs[fileName]);
    relM.drawingFile = fileName;
    var id = relM.addRelationship({
      Type: xlsxdrawingType,
      Target: "/".concat(fileName)
    });
    relM.addOverride(drawingXmlContentType, "/".concat(fileName));
    relM.xmlDocs[fileName] = str2xml(baseDrawingXlsx);
    relM.drawingId = id;
    relM.drawing = fileName;
  };
  relM.getDrawingPath = function (id) {
    return normalizePath(relM.getRelationship(id).target, "xl/drawings").substr(1);
  };
  relM.setDrawingId = function (id) {
    var target = normalizePath(relM.getRelationship(id).target, "xl/drawings");
    relM.drawingFile = target.substr(1);
  };
  relM.getOneCellAnchor = function (col, offsetY, row, offsetX, rId, extentX, extentY) {
    return "<xdr:oneCellAnchor xmlns:xdr=\"http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing\" xmlns:r=\"http://schemas.openxmlformats.org/officeDocument/2006/relationships\" xmlns:a=\"http://schemas.openxmlformats.org/drawingml/2006/main\">\n\t\t<xdr:from>\n\t\t<xdr:col>".concat(col, "</xdr:col>\n\t\t<xdr:colOff>").concat(offsetY, "</xdr:colOff>\n\t\t<xdr:row>").concat(row, "</xdr:row>\n\t\t<xdr:rowOff>").concat(offsetX, "</xdr:rowOff>\n\t\t</xdr:from>\n\t\t<xdr:ext cx=\"").concat(extentX, "\" cy=\"").concat(extentY, "\"/>\n\t\t<xdr:pic>\n\t\t<xdr:nvPicPr>\n\t\t<xdr:cNvPr descr=\"image-1\" id=\"4\" name=\"image-1\" title=\"image-1\"/>\n\t\t<xdr:cNvPicPr>\n\t\t<a:picLocks noChangeAspect=\"1\"/>\n\t\t</xdr:cNvPicPr>\n\t\t</xdr:nvPicPr>\n\t\t<xdr:blipFill>\n\t\t<a:blip r:embed=\"").concat(rId, "\"/>\n\t\t<a:stretch>\n\t\t<a:fillRect/>\n\t\t</a:stretch>\n\t\t</xdr:blipFill>\n\t\t<xdr:spPr>\n\t\t<a:xfrm>\n\t\t<a:off x=\"0\" y=\"0\"/>\n\t\t<a:ext cx=\"").concat(extentX, "\" cy=\"").concat(extentY, "\"/>\n\t\t</a:xfrm>\n\t\t<a:prstGeom prst=\"rect\">\n\t\t<a:avLst/>\n\t\t</a:prstGeom>\n\t\t</xdr:spPr>\n\t\t</xdr:pic>\n\t\t<xdr:clientData/>\n\t\t</xdr:oneCellAnchor>");
  };
  relM.addXLSXImage = function (part, _ref, rId) {
    var _ref2 = _slicedToArray(_ref, 2),
      extentX = _ref2[0],
      extentY = _ref2[1];
    var offsetX = 0;
    var offsetY = 0;
    var col = part.colNum - 1;
    var row = part.row - 1;
    var oneCellAnchor = relM.getOneCellAnchor(col, offsetY, row, offsetX, rId, extentX, extentY);
    if (this.mainDoc) {
      var _root = this.mainDoc.getElementsByTagName("xdr:wsDr")[0];
      _root.appendChild(str2xml(oneCellAnchor).childNodes[0]);
      return;
    }
    var dx = this.mod.docxtemplater.compiled[this.fileName].postparsed;
    var root = firstChild(dx, "xdr:wsDr");
    if (root) {
      appendChild(root, [{
        type: "content",
        value: oneCellAnchor
      }]);
    }
  };
  return relM;
};