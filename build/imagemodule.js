/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./es6/api-verify.js":
/*!***************************!*\
  !*** ./es6/api-verify.js ***!
  \***************************/
/***/ ((module) => {

module.exports = function (docxtemplater, requiredAPIVersion) {
  if (docxtemplater.verifyApiVersion) {
    return docxtemplater.verifyApiVersion(requiredAPIVersion);
  }
  throw new Error("The api version of docxtemplater is not defined, you probably have to update docxtemplater with npm install --save docxtemplater");
};

/***/ }),

/***/ "./es6/attributes.js":
/*!***************************!*\
  !*** ./es6/attributes.js ***!
  \***************************/
/***/ ((module) => {

function getAttribute(parsed, tagname, attr) {
  var result = null;
  var regex = new RegExp("<.*".concat(attr, "=\"([^\"]*)\".*$"));
  parsed.some(function (p) {
    if (p.type === "tag" && p.value.indexOf("<".concat(tagname, " ")) !== -1 && regex.test(p.value)) {
      result = p.value.replace(regex, "$1");
      return true;
    }
    return false;
  });
  if (!result) {
    return null;
  }
  return result;
}
function getAttributes(parsed, tagname, attr) {
  var result = [];
  var regex = new RegExp("<.*".concat(attr, "=\"([^\"]*)\".*$"));
  parsed.forEach(function (p) {
    if (p.type === "tag" && p.value.indexOf("<".concat(tagname, " ")) !== -1 && regex.test(p.value)) {
      result.push(p.value.replace(regex, "$1"));
    }
  });
  return result;
}
function removeSingleAttribute(partValue, attr) {
  var regex = new RegExp("(<.*) ".concat(attr, "=\"[^\"]*\"(.*)$"));
  if (regex.test(partValue)) {
    return partValue.replace(regex, "$1$2");
  }
  return partValue;
}
function setSingleAttribute(partValue, attr, attrValue) {
  var regex = new RegExp("(<.* ".concat(attr, "=\")([^\"]*)(\".*)$"));
  if (regex.test(partValue)) {
    return partValue.replace(regex, "$1".concat(attrValue, "$3"));
  }
  var end = partValue.lastIndexOf("/>");
  if (end === -1) {
    end = partValue.lastIndexOf(">");
  }
  return partValue.substr(0, end) + " ".concat(attr, "=\"").concat(attrValue, "\"") + partValue.substr(end);
}
function setAttribute(parsed, tagname, attr, value) {
  var regex = new RegExp("(<.* ".concat(attr, "=\")([^\"]+)(\".*)$"));
  var found = parsed.some(function (p) {
    if (p.type === "tag" && p.value.indexOf("<" + tagname) !== -1) {
      if (regex.test(p.value)) {
        p.value = p.value.replace(regex, "$1".concat(value, "$3"));
      } else {
        var end = p.value.lastIndexOf("/>");
        if (end === -1) {
          end = p.value.lastIndexOf(">");
        }
        p.value = p.value.substr(0, end) + " ".concat(attr, "=\"").concat(value, "\"") + p.value.substr(end);
      }
      return true;
    }
    return false;
  });
  if (!found) {
    var err = new Error("Attribute not found");
    err.properties = {
      parsed: parsed,
      tagname: tagname,
      attr: attr
    };
    throw err;
  }
  return parsed;
}
function getSingleAttribute(value, attributeName) {
  var index = value.indexOf("".concat(attributeName, "=\""));
  if (index === -1) {
    return null;
  }
  var startIndex = value.substr(index).search(/["']/) + index;
  var endIndex = value.substr(startIndex + 1).search(/["']/) + startIndex;
  return value.substr(startIndex + 1, endIndex - startIndex);
}
module.exports = {
  getAttribute: getAttribute,
  getAttributes: getAttributes,
  getSingleAttribute: getSingleAttribute,
  setAttribute: setAttribute,
  setSingleAttribute: setSingleAttribute,
  removeSingleAttribute: removeSingleAttribute
};

/***/ }),

/***/ "./es6/calculate-placeholder-positions.js":
/*!************************************************!*\
  !*** ./es6/calculate-placeholder-positions.js ***!
  \************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var _require = __webpack_require__(/*! ./content-types.js */ "./es6/content-types.js"),
  slideContentType = _require.slideContentType;
var RelationsManager = __webpack_require__(/*! ./relationship-manager.js */ "./es6/relationship-manager.js");
var _require2 = __webpack_require__(/*! ./attributes.js */ "./es6/attributes.js"),
  getSingleAttribute = _require2.getSingleAttribute;
var _require3 = __webpack_require__(/*! ./sxml.js */ "./es6/sxml.js"),
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

/***/ }),

/***/ "./es6/content-types.js":
/*!******************************!*\
  !*** ./es6/content-types.js ***!
  \******************************/
/***/ ((module) => {

var mainContentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml";
var headerContentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.header+xml";
var footerContentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml";
var slideContentType = "application/vnd.openxmlformats-officedocument.presentationml.slide+xml";
var mainWithMacroContentType = "application/vnd.ms-word.document.macroEnabled.main+xml";
var mainTemplateContentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.template.main+xml";
var mainTemplateWithMacroContentType = "application/vnd.ms-word.template.macroEnabledTemplate.main+xml";
module.exports = {
  mainContentType: mainContentType,
  headerContentType: headerContentType,
  footerContentType: footerContentType,
  slideContentType: slideContentType,
  mainWithMacroContentType: mainWithMacroContentType,
  mainTemplateContentType: mainTemplateContentType,
  mainTemplateWithMacroContentType: mainTemplateWithMacroContentType,
  main: [mainContentType, mainWithMacroContentType, mainTemplateContentType, mainTemplateWithMacroContentType]
};

/***/ }),

/***/ "./es6/converter.js":
/*!**************************!*\
  !*** ./es6/converter.js ***!
  \**************************/
/***/ ((module) => {

var mDxa = 20; // same as twips (twentieths of a point). 1440 twips = 1 inch
var mPoint = 72;
var mEmu = 914400;
var mCm = 2.54; // 1 inch = 2.54cm
var mMm = 25.4; // 1 inch = 25.4mm
var mPc = 6; // 1 inch = 6 picas

function inchToDXA(inch) {
  return inch * mPoint * mDxa;
}
function emuToDXA(value) {
  return inchToDXA(emuToInch(value));
}
function emuToPoint(value) {
  return inchToPoint(emuToInch(value));
}
function inchToPoint(inch) {
  return inch * mPoint;
}
function pointToInch(point) {
  return point / mPoint;
}
function dxaToInch(dxa) {
  return dxa / mPoint / mDxa;
}
function inchToEmu(inch) {
  return inch * mEmu;
}
function cmToInch(cm) {
  return cm / mCm;
}
function mmToInch(cm) {
  return cm / mMm;
}
function cmToEmu(cm) {
  return inchToEmu(cmToInch(cm));
}
function mmToEmu(mm) {
  return inchToEmu(mmToInch(mm));
}
function pcToEmu(pc) {
  return inchToEmu(pc / mPc);
}
function emuToInch(emu) {
  return emu / mEmu;
}
function pixelToInch(pixel, dpi) {
  return pixel / dpi;
}
function inchToPixel(inch, dpi) {
  return inch * dpi;
}
function pixelToEMU(pixel, dpi) {
  return parseInt(pixelToInch(pixel, dpi) * mEmu, 10);
}
function emuToPixel(emu, dpi) {
  return parseInt(inchToPixel(emu / mEmu, dpi), 10);
}
function pixelToPoint(pixel, dpi) {
  return pixelToInch(pixel, dpi) * mPoint;
}
function pixelToHundrethOfAPoint(pixel, dpi) {
  return pixelToPoint(pixel * 100, dpi);
}
function pixelToDXA(pixel, dpi) {
  return parseInt(inchToDXA(pixelToInch(pixel, dpi)), 10);
}
function dxaToPixel(dxa, dpi) {
  return inchToPixel(dxaToInch(dxa), dpi);
}
function dxaToPoint(dxa) {
  return inchToPoint(dxaToInch(dxa));
}
function pointToDXA(point) {
  return parseInt(point * mDxa, 10);
}
function pointToEmu(point) {
  return inchToEmu(pointToInch(point));
}
function calculateDpi(pixel, dxa) {
  return pixel / dxaToInch(dxa);
}
function pointToPixel(point, dpi) {
  return dxaToPixel(pointToDXA(point), dpi);
}
module.exports = {
  calculateDpi: calculateDpi,
  pixelToPoint: pixelToPoint,
  pixelToHundrethOfAPoint: pixelToHundrethOfAPoint,
  pixelToDXA: pixelToDXA,
  pointToDXA: pointToDXA,
  pointToPixel: pointToPixel,
  pointToEmu: pointToEmu,
  dxaToPixel: dxaToPixel,
  pixelToEMU: pixelToEMU,
  cmToEmu: cmToEmu,
  mmToEmu: mmToEmu,
  pcToEmu: pcToEmu,
  emuToPixel: emuToPixel,
  emuToInch: emuToInch,
  emuToPoint: emuToPoint,
  emuToDXA: emuToDXA,
  inchToPoint: inchToPoint,
  inchToPixel: inchToPixel,
  inchToDXA: inchToDXA,
  inchToEmu: inchToEmu,
  dxaToPoint: dxaToPoint
};

/***/ }),

/***/ "./es6/get-widths.js":
/*!***************************!*\
  !*** ./es6/get-widths.js ***!
  \***************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }
function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
var _require = __webpack_require__(/*! ./tag.js */ "./es6/tag.js"),
  isStartingTag = _require.isStartingTag,
  isEndingTag = _require.isEndingTag;
var _require2 = __webpack_require__(/*! ./content-types.js */ "./es6/content-types.js"),
  main = _require2.main,
  headerContentType = _require2.headerContentType,
  footerContentType = _require2.footerContentType;
var RelationsManager = __webpack_require__(/*! ./relationship-manager.js */ "./es6/relationship-manager.js");
var normalizePath = __webpack_require__(/*! ./normalize-path.js */ "./es6/normalize-path.js");
var _require3 = __webpack_require__(/*! ./size-converter.js */ "./es6/size-converter.js"),
  toPixel = _require3.toPixel;
var _require4 = __webpack_require__(/*! ./attributes.js */ "./es6/attributes.js"),
  getAttributes = _require4.getAttributes,
  getAttribute = _require4.getAttribute,
  getSingleAttribute = _require4.getSingleAttribute;
var converter = __webpack_require__(/*! ./converter.js */ "./es6/converter.js");

// eslint-disable-next-line complexity
function collectSectionsWidth(parsed, mainRels, sections) {
  var section = null;
  var inParagraph = false;
  var _loop = function _loop() {
    var part = parsed[i];
    if (isStartingTag(part, "w:sectPr")) {
      section = [];
    }
    if (section) {
      section.push(part);
    }
    if (part.position === "start" && part.tag === "w:p") {
      inParagraph = true;
    }
    if (isEndingTag(part, "w:p")) {
      inParagraph = false;
      if (sections.length && sections[sections.length - 1].lIndex == null) {
        sections[sections.length - 1].lIndex = part.lIndex;
      }
    }
    if (isEndingTag(part, "w:sectPr")) {
      var content = section.map(function (_ref) {
        var value = _ref.value;
        return value;
      }).join("");
      var width = parseInt(getAttribute(section, "w:pgSz", "w:w"), 10);
      var height = parseInt(getAttribute(section, "w:pgSz", "w:h"), 10);
      var leftMargin = parseInt(getAttribute(section, "w:pgMar", "w:left"), 10);
      var rightMargin = parseInt(getAttribute(section, "w:pgMar", "w:right"), 10);
      var headerRefs = getAttributes(section, "w:headerReference", "r:id");
      var footerRefs = getAttributes(section, "w:footerReference", "r:id");
      var headerFiles = [],
        footerFiles = [];
      headerRefs.forEach(function (ref) {
        var rel = mainRels.getRelationship(ref);
        headerFiles.push(normalizePath(rel.target, mainRels.dirname));
      });
      footerRefs.forEach(function (ref) {
        var rel = mainRels.getRelationship(ref);
        footerFiles.push(normalizePath(rel.target, mainRels.dirname));
      });
      var cols = parseInt(getAttribute(section, "w:cols", "w:num"), 10) || 1;
      var colsWidth = getAttributes(section, "w:col", "w:w");
      if (colsWidth.length === 0) {
        var space = parseInt(getAttribute(section, "w:cols", "w:space"), 10) || 0;
        var calculatedWidth = (width - leftMargin - rightMargin - space * (cols - 1)) / cols;
        for (var _i = 0; _i < cols; _i++) {
          colsWidth.push(calculatedWidth);
        }
      }
      sections.push({
        xmlContent: content,
        lIndex: inParagraph ? null : part.lIndex,
        parsed: section,
        cols: cols,
        colsWidth: colsWidth,
        width: width,
        height: height,
        leftMargin: leftMargin,
        rightMargin: rightMargin,
        part: part,
        headerFiles: headerFiles,
        footerFiles: footerFiles
      });
      section = null;
    }
  };
  for (var i = 0; i < parsed.length; i++) {
    _loop();
  }
}
function collectCellsWidth(parsed) {
  var cells = [];
  var inCell = false;
  var width = 0;
  var startLIndex;
  for (var i = 0; i < parsed.length; i++) {
    var part = parsed[i];
    if (isStartingTag(part, "w:tc")) {
      inCell = true;
      width = 0;
      startLIndex = part.lIndex;
    }
    if (inCell && isStartingTag(part, "w:tcW")) {
      width = parseInt(getSingleAttribute(part.value, "w:w"), 10);
    }
    if (isEndingTag(part, "w:tc")) {
      inCell = false;
      cells.push({
        width: width,
        startLIndex: startLIndex,
        endLIndex: part.lIndex
      });
    }
  }
  return cells;
}
function collectParagraphs(parsed) {
  var paragraphs = [];
  var level = [];
  var _loop2 = function _loop2() {
    var part = parsed[i];
    if (isStartingTag(part, "w:p")) {
      level.push({
        parts: [],
        startLIndex: part.lIndex
      });
    }
    level.forEach(function (sublevel) {
      sublevel.parts.push(part);
    });
    if (isEndingTag(part, "w:p")) {
      paragraphs.push(_objectSpread(_objectSpread({}, level.pop()), {}, {
        endLIndex: part.lIndex
      }));
    }
  };
  for (var i = 0; i < parsed.length; i++) {
    _loop2();
  }
  return paragraphs;
}
function collectRuns(parsed) {
  var runs = [];
  var runParts = [];
  var inRun = false;
  var startLIndex;
  for (var i = 0; i < parsed.length; i++) {
    var part = parsed[i];
    if (isStartingTag(part, "w:r")) {
      inRun = true;
      startLIndex = part.lIndex;
      runParts = [];
    }
    if (inRun) {
      runParts.push(part);
    }
    if (isEndingTag(part, "w:r")) {
      inRun = false;
      runs.push({
        startLIndex: startLIndex,
        endLIndex: part.lIndex,
        parts: runParts
      });
      runParts = [];
    }
  }
  return runs;
}
function collectPicts(parsed) {
  var picts = [];
  var inPict = false;
  var width = 0,
    height = 0;
  var startLIndex;
  for (var i = 0; i < parsed.length; i++) {
    var part = parsed[i];
    if (isStartingTag(part, "w:pict")) {
      inPict = true;
      width = 0;
      height = 0;
      startLIndex = part.lIndex;
    }
    if (inPict && (isStartingTag(part, "v:shape") || isStartingTag(part, "v:rect"))) {
      var style = getSingleAttribute(part.value, "style");
      var parsedStyle = style.split(";").map(function (rule) {
        var parts = rule.split(":");
        return {
          key: parts[0],
          value: parts[1]
        };
      });
      for (var j = 0, len = parsedStyle.length; j < len; j++) {
        var _parsedStyle$j = parsedStyle[j],
          key = _parsedStyle$j.key,
          value = _parsedStyle$j.value;
        if (key === "width") {
          width = value;
        }
        if (key === "height") {
          height = value;
        }
      }
    }
    if (isEndingTag(part, "w:pict")) {
      inPict = false;
      picts.push({
        width: width,
        height: height,
        startLIndex: startLIndex,
        endLIndex: part.lIndex
      });
    }
  }
  return picts;
}
function collectTextBoxDimensions(parsed) {
  var textBoxes = [];
  var inTextBox = false;
  var width = 0,
    height = 0;
  var startLIndex;
  for (var i = 0; i < parsed.length; i++) {
    var part = parsed[i];
    if (isStartingTag(part, "w:drawing")) {
      inTextBox = true;
      width = 0;
      height = 0;
      startLIndex = part.lIndex;
    }
    if (inTextBox && isStartingTag(part, "wp:extent")) {
      width = parseInt(getSingleAttribute(part.value, "cx"), 10);
      height = parseInt(getSingleAttribute(part.value, "cy"), 10);
    }
    if (isEndingTag(part, "w:drawing")) {
      inTextBox = false;
      textBoxes.push({
        width: width,
        height: height,
        startLIndex: startLIndex,
        endLIndex: part.lIndex
      });
    }
  }
  return textBoxes;
}
function getSectionWidth(dpi, sections, lIndex, contentType, columnNum) {
  for (var i = 0, len = sections.length; i < len; i++) {
    var currentSection = sections[i];
    var colsWidth = currentSection.colsWidth;
    var calculatedWidth = colsWidth[columnNum];
    if (main.indexOf(contentType) === -1) {
      return converter.dxaToPixel(calculatedWidth, dpi);
    }
    var lastSectionIndex = sections[i - 1] ? sections[i - 1].lIndex : -1;
    if (lastSectionIndex < lIndex && lIndex < currentSection.lIndex) {
      return converter.dxaToPixel(calculatedWidth, dpi);
    }
  }
  throw new Error("No section found");
}
function getCellWidth(dpi, cells, lIndex) {
  for (var i = 0, len = cells.length; i < len; i++) {
    var cell = cells[i];
    if (cell.startLIndex < lIndex && lIndex < cell.endLIndex) {
      return converter.dxaToPixel(cell.width, dpi);
    }
  }
  return false;
}
function getPictDimensions(dpi, picts, lIndex) {
  for (var i = 0, len = picts.length; i < len; i++) {
    var pict = picts[i];
    if (pict.startLIndex < lIndex && lIndex < pict.endLIndex) {
      return [toPixel(pict.width, {
        dpi: dpi
      }), toPixel(pict.height, {
        dpi: dpi
      })];
    }
  }
  return false;
}
function getTextBoxDimensions(dpi, textBoxes, lIndex) {
  for (var i = 0, len = textBoxes.length; i < len; i++) {
    var textBox = textBoxes[i];
    if (textBox.startLIndex < lIndex && lIndex < textBox.endLIndex) {
      return [converter.emuToPixel(textBox.width, dpi), converter.emuToPixel(textBox.height, dpi)];
    }
  }
  return false;
}
function WidthCollector(module) {
  var data = {
    sections: module.sections
  };
  return {
    data: data,
    collect: function collect(parsed, _ref2) {
      var contentType = _ref2.contentType,
        filePath = _ref2.filePath;
      if (main.indexOf(contentType) !== -1) {
        var mainRels = new RelationsManager(module.docxtemplater, filePath);
        collectSectionsWidth(parsed, mainRels, data.sections);
      }
      data.runs = collectRuns(parsed);
      data.paragraphs = collectParagraphs(parsed);
      data.cells = collectCellsWidth(parsed);
      data.textBoxes = collectTextBoxDimensions(parsed);
      data.picts = collectPicts(parsed);
    },
    getHeaderFooterSize: function getHeaderFooterSize(file) {
      for (var i = 0, len = data.sections.length; i < len; i++) {
        var sect = data.sections[i];
        if (sect.headerFiles.indexOf(file) !== -1 || sect.footerFiles.indexOf(file) !== -1) {
          return sect;
        }
      }
    },
    getNextWSect: function getNextWSect(lIndex) {
      if (!data.sections || data.sections.length === 0) {
        // default section
        return {
          width: 11906,
          leftMargin: 1701,
          rightMargin: 850
        };
      }
      var filePath = "/" + module.filePath;
      for (var i = 0, len = data.sections.length; i < len; i++) {
        var section = data.sections[i];
        if (section.lIndex > lIndex || section.headerFiles.indexOf(filePath) !== -1 || section.footerFiles.indexOf(filePath) !== -1) {
          return section;
        }
      }
      throw new Error("Section not found for ".concat(lIndex));
    },
    getRun: function getRun(lIndex) {
      if (!data.runs || data.runs.length === 0) {
        return null;
      }
      for (var i = 0, len = data.runs.length; i < len; i++) {
        var run = data.runs[i];
        if (run.startLIndex < lIndex && lIndex < run.endLIndex) {
          return run;
        }
      }
    },
    getParagraph: function getParagraph(lIndex) {
      if (!data.paragraphs || data.paragraphs.length === 0) {
        return null;
      }
      for (var i = 0, len = data.paragraphs.length; i < len; i++) {
        var paragraph = data.paragraphs[i];
        if (paragraph.startLIndex < lIndex && lIndex < paragraph.endLIndex) {
          return paragraph;
        }
      }
    },
    getDimensions: function getDimensions(part, options) {
      if (module.docxtemplater.fileType !== "docx") {
        return [null, null];
      }
      var containerWidth, containerHeight;
      var contentType = options.contentType;
      if ([headerContentType, footerContentType].concat(_toConsumableArray(main)).indexOf(contentType) === -1) {
        return [null, null];
      }
      var dpi = module.dpi;
      var dimension = getTextBoxDimensions(dpi, data.textBoxes, part.lIndex) || getPictDimensions(dpi, data.picts, part.lIndex, dpi);
      if (dimension) {
        containerWidth = dimension[0];
        containerHeight = dimension[1];
      } else {
        containerWidth = getCellWidth(dpi, data.cells, part.lIndex) || getSectionWidth(dpi, data.sections, part.lIndex, contentType, module.columnNum);
      }
      return [containerWidth, containerHeight];
    }
  };
}
module.exports = WidthCollector;

/***/ }),

/***/ "./es6/image-rels-traits.js":
/*!**********************************!*\
  !*** ./es6/image-rels-traits.js ***!
  \**********************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/* provided dependency */ var Buffer = __webpack_require__(/*! buffer */ "./node_modules/buffer/index.js")["Buffer"];
function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function _iterableToArrayLimit(arr, i) { var _i = null == arr ? null : "undefined" != typeof Symbol && arr[Symbol.iterator] || arr["@@iterator"]; if (null != _i) { var _s, _e, _x, _r, _arr = [], _n = !0, _d = !1; try { if (_x = (_i = _i.call(arr)).next, 0 === i) { if (Object(_i) !== _i) return; _n = !1; } else for (; !(_n = (_s = _x.call(_i)).done) && (_arr.push(_s.value), _arr.length !== i); _n = !0); } catch (err) { _d = !0, _e = err; } finally { try { if (!_n && null != _i["return"] && (_r = _i["return"](), Object(_r) !== _r)) return; } finally { if (_d) throw _e; } } return _arr; } }
function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }
var extensionRegex = /[^.]+\.([^.]+)/;
var imgify = __webpack_require__(/*! ./img-manager.js */ "./es6/img-manager.js");
var normalizePath = __webpack_require__(/*! ./normalize-path.js */ "./es6/normalize-path.js");
var str2xml = (__webpack_require__(/*! docxtemplater */ "./node_modules/docxtemplater/js/docxtemplater.js").DocUtils.str2xml);
var drawingXmlContentType = "application/vnd.openxmlformats-officedocument.drawing+xml";
var xlsxdrawingType = "http://schemas.openxmlformats.org/officeDocument/2006/relationships/drawing";
var baseDrawingXlsx = "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>\n<xdr:wsDr xmlns:xdr=\"http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing\" xmlns:r=\"http://schemas.openxmlformats.org/officeDocument/2006/relationships\" xmlns:a=\"http://schemas.openxmlformats.org/drawingml/2006/main\">\n</xdr:wsDr>";
var _require = __webpack_require__(/*! ./sxml.js */ "./es6/sxml.js"),
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

/***/ }),

/***/ "./es6/img-manager.js":
/*!****************************!*\
  !*** ./es6/img-manager.js ***!
  \****************************/
/***/ ((module) => {

module.exports = function (relM) {
  relM.getImageName = function (extension, id) {
    id = id || 0;
    var nameCandidate = "Copie_".concat(id, ".").concat(extension);
    if (relM.hasImage(relM.getFullPath(nameCandidate))) {
      return relM.getImageName(extension, id + 1);
    }
    return nameCandidate;
  };
  relM.getFullPath = function (imgName) {
    return "".concat(relM.ftprefix, "/media/").concat(imgName);
  };
  relM.hasImage = function (fileName) {
    return relM.zip.files[fileName] != null;
  };
  relM.addImage = function (imageData, extension, zipOptions) {
    var imageName = relM.getImageName(extension);
    var fileName = relM.getFullPath(imageName);
    relM.zip.file(fileName, imageData, zipOptions);
    relM.addExtensionRels("image/".concat(extension), extension);
    var absoluteTarget = "".concat(relM.fileType === "pptx" ? "/ppt" : "/word", "/media/").concat(imageName);
    relM.addOverride("image/".concat(extension), absoluteTarget);
    var target = "".concat(relM.fileType === "pptx" ? "../" : "", "media/").concat(imageName);
    return relM.addRelationship({
      Type: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/image",
      Target: target
    });
  };
  relM.getImageByRid = function (rId) {
    var relationships = relM.relsDoc.getElementsByTagName("Relationship");
    for (var i = 0, relationship; i < relationships.length; i++) {
      relationship = relationships[i];
      var cRId = relationship.getAttribute("Id");
      if (rId === cRId) {
        var path = relationship.getAttribute("Target");
        if (path.toLowerCase() === "null") {
          return null;
        }
        if (path[0] === "/") {
          return path.substr(1);
        }
        if (path.substr(0, 6) === "media/") {
          return "".concat(relM.ftprefix, "/").concat(path);
        }
        if (path.substr(0, 9) === "../media/") {
          return "".concat(relM.ftprefix, "/").concat(path.replace("../", ""));
        }
        var _err = new Error("Rid ".concat(rId, " is not an image"));
        _err.properties = {
          rId: rId
        };
        throw _err;
      }
    }
    var err = new Error("No Media with relM Rid (".concat(rId, ") found"));
    err.properties = {
      rId: rId
    };
    throw err;
  };
};

/***/ }),

/***/ "./es6/index.js":
/*!**********************!*\
  !*** ./es6/index.js ***!
  \**********************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function _iterableToArrayLimit(arr, i) { var _i = null == arr ? null : "undefined" != typeof Symbol && arr[Symbol.iterator] || arr["@@iterator"]; if (null != _i) { var _s, _e, _x, _r, _arr = [], _n = !0, _d = !1; try { if (_x = (_i = _i.call(arr)).next, 0 === i) { if (Object(_i) !== _i) return; _n = !1; } else for (; !(_n = (_s = _x.call(_i)).done) && (_arr.push(_s.value), _arr.length !== i); _n = !0); } catch (err) { _d = !0, _e = err; } finally { try { if (!_n && null != _i["return"] && (_r = _i["return"](), Object(_r) !== _r)) return; } finally { if (_d) throw _e; } } return _arr; } }
function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
var TemplateCreator = __webpack_require__(/*! ./templates.js */ "./es6/templates.js");
var Docxtemplater = __webpack_require__(/*! docxtemplater */ "./node_modules/docxtemplater/js/docxtemplater.js");
var _Docxtemplater$DocUti = Docxtemplater.DocUtils,
  utf8ToWord = _Docxtemplater$DocUti.utf8ToWord,
  traits = _Docxtemplater$DocUti.traits,
  str2xml = _Docxtemplater$DocUti.str2xml,
  xml2str = _Docxtemplater$DocUti.xml2str,
  isContent = _Docxtemplater$DocUti.isContent,
  chunkBy = _Docxtemplater$DocUti.chunkBy,
  moduleWrapper = _Docxtemplater$DocUti.moduleWrapper;
var _Docxtemplater$Errors = Docxtemplater.Errors,
  XTInternalError = _Docxtemplater$Errors.XTInternalError,
  XTRenderingError = _Docxtemplater$Errors.XTRenderingError,
  XTTemplateError = _Docxtemplater$Errors.XTTemplateError;
var _require = __webpack_require__(/*! ./rotation-flip-utils.js */ "./es6/rotation-flip-utils.js"),
  getRawRotation = _require.getRawRotation;
var _require2 = __webpack_require__(/*! ./size-converter.js */ "./es6/size-converter.js"),
  toEMU = _require2.toEMU;
var _require3 = __webpack_require__(/*! ./tag.js */ "./es6/tag.js"),
  isStartingTag = _require3.isStartingTag;
var converter = __webpack_require__(/*! ./converter.js */ "./es6/converter.js");
var getMaxDocPrId = __webpack_require__(/*! ./max-docprid.js */ "./es6/max-docprid.js");
var addImageTraits = __webpack_require__(/*! ./image-rels-traits.js */ "./es6/image-rels-traits.js");
var addLinkTrait = __webpack_require__(/*! ./link-trait.js */ "./es6/link-trait.js");
var _require4 = __webpack_require__(/*! ./attributes.js */ "./es6/attributes.js"),
  setSingleAttribute = _require4.setSingleAttribute,
  getSingleAttribute = _require4.getSingleAttribute;
var _require5 = __webpack_require__(/*! docxtemplater/js/lexer.js */ "./node_modules/docxtemplater/js/lexer.js"),
  lexParse = _require5.parse,
  xmlparse = _require5.xmlparse;
var _require6 = __webpack_require__(/*! docxtemplater/js/parser.js */ "./node_modules/docxtemplater/js/parser.js"),
  parse = _require6.parse;
var verifyApiVersion = __webpack_require__(/*! ./api-verify.js */ "./es6/api-verify.js");
var normalizePath = __webpack_require__(/*! ./normalize-path.js */ "./es6/normalize-path.js");
var RelationsManager = __webpack_require__(/*! ./relationship-manager.js */ "./es6/relationship-manager.js");
var _require7 = __webpack_require__(/*! ./type-conditions.js */ "./es6/type-conditions.js"),
  isNaN = _require7.isNaN,
  isFloat = _require7.isFloat,
  isPositive = _require7.isPositive;
var widthCollector = __webpack_require__(/*! ./get-widths.js */ "./es6/get-widths.js");
var _require8 = __webpack_require__(/*! ./sxml.js */ "./es6/sxml.js"),
  firstDirectChild = _require8.firstDirectChild,
  firstDirectChildOrCreate = _require8.firstDirectChildOrCreate,
  firstChild = _require8.firstChild,
  getContent = _require8.getContent,
  getAttribute = _require8.getAttribute,
  dropSelf = _require8.dropSelf,
  findParent = _require8.findParent,
  findChilds = _require8.findChilds,
  appendChild = _require8.appendChild;
var pushArray = __webpack_require__(/*! ./push-array.js */ "./es6/push-array.js");
var imageTypes = ["http://schemas.openxmlformats.org/officeDocument/2006/relationships/image", "http://schemas.microsoft.com/office/2007/relationships/hdphoto", "http://purl.oclc.org/ooxml/officeDocument/relationships/image"];
function getDefaultProps(props) {
  props.align || (props.align = "center");
  props.alt || (props.alt = "");
  props.name || (props.name = "Image");
  props.imageFit || (props.imageFit = "contain");
  props.rotation || (props.rotation = 0);
  if (props.caption) {
    var _props$caption, _props$caption$prefix, _props$caption2, _props$caption2$heigh;
    (_props$caption$prefix = (_props$caption = props.caption).prefix) !== null && _props$caption$prefix !== void 0 ? _props$caption$prefix : _props$caption.prefix = ["Illustration ", {
      seq: "SEQ Figure \\* ARABIC"
    }];
    if (typeof props.caption.prefix === "string") {
      props.caption.prefix = [props.caption.prefix];
    }
    (_props$caption2$heigh = (_props$caption2 = props.caption).height) !== null && _props$caption2$heigh !== void 0 ? _props$caption2$heigh : _props$caption2.height = 51.0667; // Value calculated since v3.20.1
    props.caption.height = toEMU(props.caption.height + "px", props);
  }
  return props;
}
function getIncorrectPromiseError(part, options) {
  var err = new XTRenderingError("imageBuffer is a promise, you probably should use doc.renderAsync() instead of doc.render()");
  err.properties = {
    file: options.filePath,
    part: part,
    explanation: "The developper should change the call from doc.render() to doc.renderAsync()"
  };
  return err;
}
function magicExtension(input) {
  var signature = [];
  if (input instanceof ArrayBuffer) {
    var small = new Uint8Array(input.slice(0, 4));
    signature.push(small[0]);
    signature.push(small[1]);
    signature.push(small[2]);
    signature.push(small[3]);
  } else if (typeof input === "string") {
    signature.push(input.charCodeAt(0));
    signature.push(input.charCodeAt(1));
    signature.push(input.charCodeAt(2));
    signature.push(input.charCodeAt(3));
  } else if (input.copy) {
    signature.push(parseInt(input[0], 10));
    signature.push(parseInt(input[1], 10));
    signature.push(parseInt(input[2], 10));
    signature.push(parseInt(input[3], 10));
  } else {
    var err = new XTRenderingError("Could not parse the image as a Buffer, string or ArrayBuffer");
    err.properties = {
      explanation: "Could not parse the image as a Buffer, string or ArrayBuffer (object type : ${typeof input})",
      id: "image_not_parseable"
    };
    throw err;
  }
  if (arrComp(signature, [60, 115, 118, 103])) {
    return "svg";
  }
  if (arrComp(signature, [137, 80, 78, 71])) {
    return "png";
  }
  if (arrComp(signature, [255, 216, 255])) {
    return "jpeg";
  }
  if (arrComp(signature, [71, 73, 70, 56])) {
    return "gif";
  }
  if (arrComp(signature, [66, 77])) {
    return "bmp";
  }
  if (arrComp(signature, [77, 77, 0, 42]) || arrComp(signature, [73, 73, 42, 0])) {
    return "tif";
  }
  throw new XTInternalError("could not find extension for this image ".concat(signature.join(",")));
}
function arrComp(arr1, arr2) {
  for (var i = 0, len = arr2.length; i < len; i++) {
    if (arr1[i] !== arr2[i]) {
      return false;
    }
  }
  return true;
}
var imgContainers = ["xdr:oneCellAnchor", "xdr:twoCellAnchor", "w:drawing", "p:pic"];
var svgUnsupportedBase64 = __webpack_require__(/*! ./svg-unsupported.js */ "./es6/svg-unsupported.js");
var _require9 = __webpack_require__(/*! ./svg.js */ "./es6/svg.js"),
  isSVG = _require9.isSVG,
  getSVGSize = _require9.getSVGSize;
var calculatePlaceholderPositions = __webpack_require__(/*! ./calculate-placeholder-positions.js */ "./es6/calculate-placeholder-positions.js");
var moduleName = "open-xml-templating/docxtemplater-image-module";
var moduleNameCentered = "open-xml-templating/docxtemplater-image-module-centered";
var moduleNameReplace = "open-xml-templating/docxtemplater-replace-image-module";
var moduleNameCell = "open-xml-templating/docxtemplater-pptx-cell-fill-image-module";
var slideContentType = "application/vnd.openxmlformats-officedocument.presentationml.slide+xml";
function hasColumnBreak(chunk) {
  return chunk.some(function (part) {
    if (part.tag === "w:br" && part.value.indexOf('w:type="column"') !== -1) {
      return true;
    }
  });
}
function getInnerDocxBlockCentered(_ref) {
  var part = _ref.part,
    left = _ref.left,
    right = _ref.right,
    postparsed = _ref.postparsed,
    index = _ref.index,
    leftParts = _ref.leftParts;
  if (hasColumnBreak(leftParts)) {
    part.hasColumnBreak = true;
  }
  var paragraphParts = postparsed.slice(left + 1, right);
  paragraphParts.forEach(function (p, i) {
    if (i === index - left - 1) {
      return;
    }
    if (isContent(p)) {
      var err = new XTTemplateError("Centered Images should be placed in empty paragraphs, but there is text surrounding this tag");
      err.properties = {
        part: part,
        offset: part.offset,
        explanation: "Centered Images should be placed in empty paragraphs, but there is text surrounding this tag",
        id: "centered_image_should_be_in_paragraph"
      };
      throw err;
    }
  });
  return part;
}
function getInnerPptx(_ref2) {
  var left = _ref2.left,
    right = _ref2.right,
    postparsed = _ref2.postparsed,
    index = _ref2.index,
    part = _ref2.part;
  var cx;
  var cy;
  var x;
  var y;
  this.placeholderIds[this.filePath].forEach(function (ph) {
    if (ph.lIndex[0] < part.lIndex && part.lIndex < ph.lIndex[1]) {
      cx = ph.cx;
      cy = ph.cy;
      x = ph.x;
      y = ph.y;
    }
  });
  part.ext = {
    cx: cx,
    cy: cy
  };
  part.offset = {
    x: x,
    y: y
  };
  part.extPx = {
    cx: converter.emuToPixel(cx, this.dpi),
    cy: converter.emuToPixel(cy, this.dpi)
  };
  part.containerWidth = part.extPx.cx;
  part.containerHeight = part.extPx.cy;
  part.offsetPx = {
    x: converter.emuToPixel(x, this.dpi),
    y: converter.emuToPixel(y, this.dpi)
  };
  var paragraphParts = postparsed.slice(left + 1, right);
  if (part.module === moduleNameCell) {
    return part;
  }
  paragraphParts.forEach(function (p, i) {
    if (i === index - left - 1) {
      return;
    }
    if (isContent(p)) {
      var err = new XTTemplateError("Centered Images should be placed in empty paragraphs, but there is text surrounding this tag");
      err.properties = {
        part: part,
        explanation: "Centered Images should be placed in empty paragraphs, but there is text surrounding this tag",
        id: "centered_image_should_be_in_paragraph"
      };
      throw err;
    }
  });
  return part;
}
function getSimpleId(part, options) {
  return options.filePath + "@" + part.lIndex.toString();
}
function getResolvedId(part, options) {
  return options.filePath + "@" + part.lIndex.toString() + "-" + options.scopeManager.scopePathItem.join("-");
}
function getImageFromAttribute(part, attributeName, options) {
  var _this = this;
  var hasImage;
  var attribute = getSingleAttribute(part.value, attributeName);
  var xmlparsed = xmlparse("<t>".concat(attribute, "</t>"), {
    text: ["t"],
    other: this.docxtemplater.fileTypeConfig.tagsXmlLexedArray
  });
  var lexResult = lexParse(xmlparsed, this.docxtemplater.options.delimiters);
  var lexed = lexResult.lexed;
  var catchSlidesRepeat = "pro-xml-templating/catch-slides-repeat-inside-image";
  var submodules = [moduleWrapper({
    name: "InnerImageModule",
    matchers: function matchers() {
      return [[_this.prefix.normal, moduleName, {
        location: "start",
        onMatch: function onMatch(part) {
          hasImage = part;
        }
      }]];
    }
  })];
  if (options.fileType === "pptx") {
    submodules.push(moduleWrapper({
      name: "CatchSlidesRepeatInsideImage",
      matchers: function matchers() {
        return [[":", catchSlidesRepeat]];
      }
    }));
  }
  var parsed = parse(lexed, submodules, options);
  var errors = [];
  parsed.forEach(function (part) {
    if (part.module === catchSlidesRepeat) {
      var err = new XTTemplateError("Image descriptions can not contain tags starting with :, such as {:data}. Place your slides repeat tag in a separate visible textbox on the slide.");
      err.properties = {
        part: part,
        explanation: "The tag {:".concat(part.value, "} is not allowed in an image description. Place the {:").concat(part.value, "} tag in a separate visible textbox on the slide."),
        id: "slides_module_tag_not_allowed_in_image_description"
      };
      errors.push(err);
    }
  });
  if (errors.length) {
    return {
      errors: errors
    };
  }
  if (!hasImage) {
    return;
  }
  var newAttribute = parsed.map(function (part) {
    if (part.text || part.module === moduleName) {
      return "";
    }
    return part.value;
  }).join("");
  part.value = setSingleAttribute(part.value, attributeName, newAttribute);
  return hasImage;
}
var ImageModule = /*#__PURE__*/function () {
  function ImageModule(options) {
    _classCallCheck(this, ImageModule);
    this.rms = {};
    this.templates = new TemplateCreator();
    this.sections = [];
    this.preparsed = {};
    this.columnNum = 0;
    this.addedImages = [];
    this.replaceImages = {};
    this.requiredAPIVersion = "3.36.0";
    this.placeholderIds = {};
    this.name = "ImageModule";
    this.supportedFileTypes = ["docx", "pptx", "xlsx"];
    options = options || {};
    options.centered = options.centered || false;
    this.options = options;
    options.getSVGFallback = options.getSVGFallback || svgUnsupportedBase64;
    this.imgManagers = {};
    this.resolved = {};
    this.W = {};
    this.dpi = this.options.dpi;
    this.drawingPart = {};
    this.renderedXmlImages = {};
    if (options.getImage == null) {
      throw new XTInternalError('You should pass "getImage" to the imagemodule constructor');
    }
    if (options.getSize == null) {
      throw new XTInternalError('You should pass "getSize" to the imagemodule constructor');
    }
    this.prefix = {
      normal: "%",
      centered: "%%"
    };
    this.imageNumber = 1;
  }
  _createClass(ImageModule, [{
    key: "clone",
    value: function clone() {
      return new ImageModule(this.options);
    }
  }, {
    key: "on",
    value: function on(event) {
      var _this2 = this;
      var fileType = this.fileType;
      if (fileType === "xlsx") {
        return;
      }
      if (event !== "syncing-zip") {
        return;
      }
      // This is needed for subsection-module for example (tested by subsection module)
      this.xmlDocuments = this.zip.file(/\.xml\.rels/).map(function (file) {
        return file.name;
      }).reduce(function (xmlDocuments, fileName) {
        if (xmlDocuments[fileName]) {
          return xmlDocuments;
        }
        var content = _this2.zip.files[fileName].asText();
        xmlDocuments[fileName] = str2xml(content);
        return xmlDocuments;
      }, this.xmlDocuments);
      var relsFiles = Object.keys(this.xmlDocuments).filter(function (fileName) {
        return /\.xml\.rels/.test(fileName);
      });
      var imageFilesToKeep = [];
      relsFiles.forEach(function (relf) {
        var xmldoc = _this2.xmlDocuments[relf];
        var associatedXml = relf.replace(/_rels\/|\.rels/g, "");
        var ridsInRenderedXmlFiles = [];
        var associatedFile = _this2.zip.files[associatedXml];
        if (associatedFile) {
          var text = "";
          if (_this2.xmlDocuments[associatedXml]) {
            text = xml2str(_this2.xmlDocuments[associatedXml]);
          } else {
            text = associatedFile.asText();
          }
          var lexed = _this2.Lexer.xmlparse(text, {
            text: [],
            other: ["a:blip", "asvg:svgBlip", "v:imagedata", "o:OLEObject", "v:fill", "a14:imgLayer"]
          });
          lexed.forEach(function (part) {
            var type = part.type,
              value = part.value,
              position = part.position,
              tag = part.tag;
            if (type === "tag" && ["start", "selfclosing"].indexOf(position) !== -1) {
              if (["v:imagedata", "o:OLEObject", "v:fill"].indexOf(tag) !== -1) {
                ridsInRenderedXmlFiles.push(getSingleAttribute(value, "r:id"));
              } else {
                ridsInRenderedXmlFiles.push(getSingleAttribute(value, "r:embed"));
              }
            }
          });
        }
        if (ridsInRenderedXmlFiles.length === 0) {
          return;
        }
        var rels = xmldoc.getElementsByTagName("Relationship");
        for (var i = 0, len = rels.length; i < len; i++) {
          var rel = rels[i];
          var target = rel.getAttribute("Target");
          var type = rel.getAttribute("Type");
          var targetMode = rel.getAttribute("TargetMode");
          var normalized = normalizePath(target, relf);
          if (targetMode === "External") {
            continue;
          }
          if (imageTypes.indexOf(type) !== -1) {
            if (associatedFile) {
              var rId = rel.getAttribute("Id");
              if (ridsInRenderedXmlFiles.indexOf(rId) === -1) {
                continue;
              }
            }
            imageFilesToKeep.push(normalized);
          }
        }
      });
      this.zip.file(/\/media\//).forEach(function (file) {
        if (imageFilesToKeep.indexOf("/".concat(file.name)) === -1) {
          _this2.zip.remove(file.name);
        }
      });
      relsFiles.forEach(function (relf) {
        var xmldoc = _this2.xmlDocuments[relf];
        var rels = xmldoc.getElementsByTagName("Relationship");
        var len = rels.length;
        for (var i = 0; i < len; i++) {
          var rel = rels[i];
          var target = rel.getAttribute("Target");
          var targetMode = rel.getAttribute("TargetMode");
          var normalized = normalizePath(target, relf);
          var type = rel.getAttribute("Type");
          if (target.toLowerCase() === "null") {
            continue;
          }
          if (targetMode !== "External" && imageTypes.indexOf(type) !== -1 && imageFilesToKeep.indexOf(normalized) === -1) {
            rel.parentNode.removeChild(rel);
            rels = xmldoc.getElementsByTagName("Relationship");
            i = -1;
            len = rels.length;
          }
        }
      });
    }
  }, {
    key: "optionsTransformer",
    value: function optionsTransformer(options, docxtemplater) {
      var _this$fileTypeConfig$;
      this.docxtemplater = docxtemplater;
      verifyApiVersion(docxtemplater, this.requiredAPIVersion);
      this.fileTypeConfig = docxtemplater.fileTypeConfig;
      this.fileType = docxtemplater.fileType;
      if (["pptx", "xlsx", "docx"].indexOf(this.fileType) !== -1) {
        this.dpi = this.dpi || 96;
      }
      this.zip = docxtemplater.zip;
      this.maxDocPrId = getMaxDocPrId(this.zip);
      var relsFiles = this.zip.file(/\.xml\.rels/).concat(docxtemplater.zip.file(/\[Content_Types\].xml/)).map(function (file) {
        return file.name;
      });
      options.xmlFileNames = options.xmlFileNames.concat(relsFiles);
      (_this$fileTypeConfig$ = this.fileTypeConfig.tagsXmlLexedArray).push.apply(_this$fileTypeConfig$, ["a:xfrm", "a:ext", "a:off", "drawing", "p:graphicFrame", "p:ph", "p:pic", "p:sp", "a:blip", "asvg:svgBlip", "xdr:pic", "xdr:wsDr", "xdr:cNvPr", "xdr:from", "a:solidFill", "a:noFill", "a:srgbClr", "a:lnTlToBr", "a:lnBlToTr", "a:lnB", "a:lnT", "a:lnR", "a:lnL", "xdr:to", "xdr:col", "xdr:colOff", "xdr:row", "xdr:rowOff", "v:shape", "v:rect", "w:col", "w:cols", "w:drawing", "w:footerReference", "w:headerReference", "w:pgMar", "w:pgSz", "w:pict", "w:sectPr", "a:tcPr", "a:tbl", "a:tblGrid", "a:gridCol", "a:tc", "w:tc", "w:tcW", "wp:docPr", "p:cNvPr", "wp:extent", "xdr:ext"].concat(imgContainers));
      return options;
    }
  }, {
    key: "set",
    value: function set(options) {
      if (options.Lexer) {
        this.Lexer = options.Lexer;
      }
      if (options.xmlDocuments) {
        this.xmlDocuments = options.xmlDocuments;
      }
    }
  }, {
    key: "matchers",
    value: function matchers(options) {
      this.filePath = options.filePath;
      var _this$prefix = this.prefix,
        normal = _this$prefix.normal,
        centered = _this$prefix.centered;
      if (this.options.centered) {
        normal = this.prefix.centered;
        centered = this.prefix.normal;
      }
      var W = this.W[options.filePath];
      var _W$getDimensions = W.getDimensions(options, options),
        _W$getDimensions2 = _slicedToArray(_W$getDimensions, 2),
        containerWidth = _W$getDimensions2[0],
        containerHeight = _W$getDimensions2[1];
      return [[centered, moduleNameCentered, {
        containerWidth: containerWidth,
        containerHeight: containerHeight
      }], [normal, moduleName, {
        containerWidth: containerWidth,
        containerHeight: containerHeight
      }]];
    }
  }, {
    key: "preparse",
    value: function preparse(parsed, options) {
      var _this3 = this;
      if (options.contentType === slideContentType) {
        findChilds(parsed, "a:tbl").forEach(function (table) {
          var tblGrid = firstDirectChild(table, "a:tblGrid");
          if (!tblGrid) {
            return;
          }
          var gridCols = findChilds(tblGrid, "a:gridCol").map(function (gridCol) {
            return +getAttribute(gridCol, "w");
          });
          findChilds(parsed, "a:tr").forEach(function (tr) {
            var height = +getAttribute(tr, "h");
            findChilds(tr, "a:tc").forEach(function (tc, indexTc) {
              var width = gridCols[indexTc];
              var part = tc.xml[tc.index[0]];
              part.containerWidth = converter.emuToPixel(width, _this3.dpi);
              part.containerHeight = converter.emuToPixel(height, _this3.dpi);
            });
          });
        });
      }
      this.preparsed[options.filePath] = parsed;
      this.W[options.filePath] = this.W[options.filePath] || widthCollector(this);
      var W = this.W[options.filePath];
      W.collect(parsed, options);
    }
  }, {
    key: "getRelationsManager",
    value: function getRelationsManager(filePath) {
      // The check of this.fileType === "pptx" is to avoid a bug with the slides module
      if (!this.rms[filePath] || this.fileType === "pptx") {
        this.rms[filePath] = addLinkTrait(addImageTraits(new RelationsManager(this, filePath)));
        this.rms[filePath].addedImages = this.addedImages;
      }
      return this.rms[filePath];
    }
  }, {
    key: "upsertDrawing",
    value: function upsertDrawing(options) {
      var imgManager = this.getRelationsManager(options.filePath);
      if (imgManager.drawingId) {
        return;
      }
      var part = this.drawingPart[options.filePath];
      if (part) {
        imgManager.setDrawingId(getSingleAttribute(part.value, "r:id"));
        return;
      }
      imgManager.addDrawingXML();
    }
  }, {
    key: "postparsePptxCell",
    value: function postparsePptxCell(parsed) {
      var insideTableCell = false;
      for (var i = 0, len = parsed.length; i < len; i++) {
        var part = parsed[i];
        if (part.type === "tag" && part.tag === "a:tc") {
          insideTableCell = part.position === "start";
        }
        if (part.module === moduleName && insideTableCell) {
          part.module = moduleNameCell;
          parsed.splice(i, 1);
          var aTc = findParent({
            xml: parsed,
            index: [i, i]
          }, "a:tc");
          var tcPart = aTc.xml[aTc.index[0]];
          part.containerWidth = tcPart.containerWidth;
          part.containerHeight = tcPart.containerHeight;
          var tcProps = firstDirectChildOrCreate(aTc, "a:tcPr");
          appendChild(tcProps, [part]);
          var solidFill = firstDirectChild(tcProps, "a:solidFill");
          if (solidFill) {
            dropSelf(solidFill);
          }
          var noFill = firstDirectChild(tcProps, "a:noFill");
          if (noFill) {
            dropSelf(noFill);
          }
          len = parsed.length;
        }
      }
      return parsed;
    }
  }, {
    key: "postparse",
    value: function postparse(parsed, options) {
      var _this4 = this;
      this.filePath = options.filePath;
      var fileType = options.fileType;
      if (fileType === "xlsx") {
        parsed.forEach(function (part) {
          if (part.tag === "drawing") {
            _this4.drawingPart[options.filePath] = part;
          }
        });
      }
      var expandToNormal,
        expandToCentered,
        getInner,
        getInnerCentered,
        errorNormal = {},
        errorCentered = {};
      switch (fileType) {
        case "pptx":
          getInner = getInnerPptx;
          getInnerCentered = getInnerPptx;
          expandToNormal = ["p:sp", "p:graphicFrame"];
          expandToCentered = ["p:sp", "p:graphicFrame"];
          errorNormal = {
            message: "Image tag should not be placed inside a loop",
            id: "image_tag_no_access_to_p_sp",
            explanation: function explanation(part) {
              return "The image tag \"".concat(part.value, "\" should not be placed inside a loop, it should be the only text in a given shape");
            }
          };
          errorCentered = errorNormal;
          break;
        case "docx":
          getInnerCentered = getInnerDocxBlockCentered;
          expandToCentered = "w:p";
          errorCentered = {
            message: "Block Image tag should not be placed inside an inline loop",
            id: "image_tag_no_access_to_w_p",
            explanation: function explanation(part) {
              return "The block image tag \"".concat(part.value, "\" should not be placed inside an inline loop, it can be placed in a block loop (paragraphLoop)");
            }
          };
          break;
      }
      calculatePlaceholderPositions.apply(this, [parsed, options]);
      this.postparsePptxCell(parsed);
      var postparsed = {
        postparsed: parsed,
        errors: []
      };
      if (fileType === "pptx") {
        postparsed = traits.expandToOne(postparsed, {
          moduleName: moduleName,
          getInner: getInner.bind(this),
          expandTo: expandToNormal,
          error: errorNormal
        });
      }
      if (fileType === "docx" || fileType === "pptx") {
        postparsed = traits.expandToOne(postparsed, {
          moduleName: moduleNameCentered,
          getInner: getInnerCentered.bind(this),
          expandTo: expandToCentered,
          error: errorCentered
        });
      }
      var chunks = chunkBy(postparsed.postparsed, function (part) {
        if (part.type === "tag" && imgContainers.indexOf(part.tag) !== -1) {
          return part.position;
        }
      });
      var pp = [];
      if (chunks.length === 1) {
        return postparsed;
      }
      chunks.forEach(function (chunk) {
        if (imgContainers.indexOf(chunk[0].tag) === -1) {
          pushArray(pp, chunk);
          return;
        }
        var imgManager = _this4.getRelationsManager(options.filePath);
        var cx, cy;
        var hasImage;
        var rId;
        var imagePath;
        var blipChild = firstChild(chunk, ["a:blip"]);
        if (blipChild) {
          rId = getAttribute(blipChild, "r:embed");
          if (rId) {
            imagePath = imgManager.getImageByRid(rId);
          }
        }
        chunk.forEach(function (part) {
          if (["a:ext", "wp:extent", "xdr:ext"].indexOf(part.tag) !== -1) {
            cx = getSingleAttribute(part.value, "cx") || cx;
            cy = getSingleAttribute(part.value, "cy") || cy;
          }
          if (isStartingTag(part, "wp:docPr") || isStartingTag(part, "p:cNvPr") || isStartingTag(part, "xdr:cNvPr")) {
            hasImage = getImageFromAttribute.bind(_this4)(part, "name", options);
            if (!hasImage) {
              hasImage = getImageFromAttribute.bind(_this4)(part, "title", options);
            }
            if (!hasImage) {
              hasImage = getImageFromAttribute.bind(_this4)(part, "descr", options);
            }
          }
        });
        if (hasImage) {
          var rowOffStart;
          var colOffStart;
          var row;
          var col;
          var twoCellAnchor = firstChild(chunk, "xdr:twoCellAnchor");
          if (twoCellAnchor) {
            col = +getContent(firstChild(chunk, ["xdr:from", "xdr:col"]));
            row = +getContent(firstChild(chunk, ["xdr:from", "xdr:row"]));
            colOffStart = +getContent(firstChild(chunk, ["xdr:from", "xdr:colOff"]));
            rowOffStart = +getContent(firstChild(chunk, ["xdr:from", "xdr:rowOff"]));
          }
          if (hasImage.errors) {
            pushArray(postparsed.errors, hasImage.errors);
          } else {
            var _this4$replaceImages, _options$filePath;
            var type = "placeholder";
            var image = _objectSpread(_objectSpread({
              lIndex: chunk[0].lIndex,
              type: type
            }, twoCellAnchor ? {
              twoCellAnchor: twoCellAnchor,
              col: col,
              row: row,
              colOffStart: colOffStart,
              rowOffStart: rowOffStart
            } : {}), {}, {
              cx: cx,
              cy: cy,
              width: converter.emuToPixel(cx, _this4.dpi),
              height: converter.emuToPixel(cy, _this4.dpi),
              value: hasImage.value,
              module: moduleNameReplace,
              rId: rId,
              expanded: chunk,
              path: imagePath
            });
            pp.push(image);
            (_this4$replaceImages = _this4.replaceImages)[_options$filePath = options.filePath] || (_this4$replaceImages[_options$filePath] = []);
            _this4.replaceImages[options.filePath].push(image);
          }
        } else {
          pushArray(pp, chunk);
        }
      });
      postparsed.postparsed = pp;
      postparsed.errors = postparsed.errors || [];
      return postparsed;
    }
  }, {
    key: "resolve",
    value: function resolve(part, options) {
      var _this5 = this;
      if (!part.type === "placeholder" || [moduleName, moduleNameCentered, moduleNameReplace, moduleNameCell].indexOf(part.module) === -1) {
        return null;
      }
      var tagValue = options.scopeManager.getValue(part.value, {
        part: part
      });
      var resolvedId = getResolvedId(part, options);
      return Promise.resolve(tagValue).then(function (val) {
        if (!val) {
          return Promise.resolve(options.nullGetter(part));
        }
        return val;
      }).then(function (tagValue) {
        if (!tagValue) {
          _this5.resolved[resolvedId] = null;
          return {
            value: ""
          };
        }
        return Promise.resolve(_this5.options.getImage(tagValue, part.value))["catch"](function (e) {
          var err = new XTRenderingError(e.message);
          err.properties = {
            id: "img_getting_failed",
            explanation: "Could not get value for image '".concat(part.value, "'")
          };
          throw err;
        }).then(function (imgBuffer) {
          if (!imgBuffer) {
            if (tagValue === true) {
              _this5.resolved[resolvedId] = true;
            } else {
              _this5.resolved[resolvedId] = null;
            }
            return {
              value: ""
            };
          }
          var sizePixel;
          var svgFallback;
          if (isSVG(imgBuffer)) {
            sizePixel = _this5.options.getSize(imgBuffer, tagValue, part.value, {
              svgSize: getSVGSize(imgBuffer),
              part: part,
              options: options
            });
            svgFallback = Promise.resolve(sizePixel).then(function (size) {
              if (!size || size.length !== 2) {
                return;
              }
              return _this5.options.getSVGFallback(imgBuffer, size);
            });
          } else {
            sizePixel = _this5.options.getSize(imgBuffer, tagValue, part.value, {
              part: part,
              options: options
            });
          }
          return Promise.all([Promise.resolve(sizePixel), Promise.resolve(svgFallback)]).then(function (_ref3) {
            var _ref4 = _slicedToArray(_ref3, 2),
              sizePixel = _ref4[0],
              svgFallback = _ref4[1];
            var resolved = {
              sizePixel: sizePixel,
              imgBuffer: imgBuffer,
              tagValue: tagValue,
              svgFallback: svgFallback
            };
            if (_this5.options.getProps) {
              var _props$dpi;
              var props = _this5.options.getProps(imgBuffer, tagValue, part.value, {
                part: part,
                options: options,
                sizePixel: sizePixel
              });
              (_props$dpi = props.dpi) !== null && _props$dpi !== void 0 ? _props$dpi : props.dpi = _this5.dpi;
              resolved = _objectSpread(_objectSpread({}, getDefaultProps(props)), resolved);
            }
            if (isSVG(imgBuffer)) {
              resolved.type = "svg";
            }
            _this5.resolved[resolvedId] = resolved;
          });
        });
      })["catch"](function (e) {
        _this5.resolved[resolvedId] = null;
        throw e;
      });
    }
    // eslint-disable-next-line complexity
  }, {
    key: "getValues",
    value: function getValues(part, options) {
      var resolvedId = getResolvedId(part, options);
      if (this.resolved[resolvedId] === null) {
        return null;
      }
      if (this.resolved[resolvedId]) {
        return this.resolved[resolvedId];
      }
      var tagValue = options.scopeManager.getValue(part.value, {
        part: part
      });
      if (!tagValue) {
        tagValue = options.nullGetter(part);
        if (!tagValue) {
          return null;
        }
      }
      var imgBuffer;
      try {
        imgBuffer = this.options.getImage(tagValue, part.value);
      } catch (e) {
        var err = new XTRenderingError(e.message);
        err.properties = {
          id: "img_getting_failed",
          explanation: "Could not get value for image '".concat(part.value, "'")
        };
        throw err;
      }
      if (!imgBuffer) {
        if (tagValue === true) {
          return true;
        }
        return null;
      }
      if (isSVG(imgBuffer)) {
        var _sizePixel = this.options.getSize(imgBuffer, tagValue, part.value, {
          svgSize: getSVGSize(imgBuffer),
          part: part,
          options: options
        });
        var svgFallback = this.options.getSVGFallback(imgBuffer);
        return {
          type: "svg",
          imgBuffer: imgBuffer,
          svgFallback: svgFallback,
          tagValue: tagValue,
          sizePixel: _sizePixel
        };
      }
      var sizePixel = this.options.getSize(imgBuffer, tagValue, part.value, {
        part: part,
        options: options
      });
      var result = {
        type: "image",
        imgBuffer: imgBuffer,
        sizePixel: sizePixel,
        tagValue: tagValue,
        offsetPixel: [0, 0]
      };
      if (this.options.getProps) {
        var props = this.options.getProps(imgBuffer, tagValue, part.value, {
          part: part,
          options: options,
          sizePixel: sizePixel
        });
        result = _objectSpread(_objectSpread({}, props), result);
      }
      return result;
    }
    // eslint-disable-next-line complexity
  }, {
    key: "render",
    value: function render(part, options) {
      if (part.tag === "w:sectPr") {
        this.columnNum = 0;
      }
      if (hasColumnBreak([part])) {
        this.columnNum++;
      }
      var fileType = this.fileType;
      if (fileType === "xlsx" && part.type === "tag" && part.tag === "worksheet" && part.position === "end" && !this.drawingPart[options.filePath]) {
        var _imgManager = this.getRelationsManager(options.filePath);
        if (_imgManager.drawingId) {
          return {
            value: "<drawing r:id=\"".concat(_imgManager.drawingId, "\"/>").concat(part.value)
          };
        }
      }
      if (!part.type === "placeholder" || [moduleName, moduleNameCentered, moduleNameReplace, moduleNameCell].indexOf(part.module) === -1) {
        return null;
      }
      if (part.hasColumnBreak) {
        this.columnNum++;
      }
      this.filePath = options.filePath;
      var other = this.docxtemplater.mapper[options.filePath].from;
      var W = this.W[other];
      var _W$getDimensions3 = W.getDimensions(part, options),
        _W$getDimensions4 = _slicedToArray(_W$getDimensions3, 2),
        containerWidth = _W$getDimensions4[0],
        containerHeight = _W$getDimensions4[1];
      part.containerWidth = containerWidth || part.containerWidth;
      part.containerHeight = containerHeight || part.containerHeight;
      var simpleId = getSimpleId(part, options);
      if (part.module === moduleNameReplace && fileType === "xlsx" && part.twoCellAnchor && this.renderedXmlImages[simpleId] && !options.calledByXlsx) {
        return {
          value: this.renderedXmlImages[simpleId].join("")
        };
      }
      var values = this.getValues(part, options);
      if (values === null) {
        return {
          value: ""
        };
      }
      if (values === true) {
        if (part.module === moduleNameReplace) {
          return {
            value: part.expanded.map(function (_ref5) {
              var value = _ref5.value;
              return value;
            }).join("")
          };
        }
        return {
          value: ""
        };
      }
      if (values.offset) {
        values.offsetPixel = values.offset;
      }
      values.runBefore = part.hasColumnBreak ? '<w:r><w:br w:type="column"/></w:r>' : "";
      var imgBuffer = values.imgBuffer,
        sizePixel = values.sizePixel,
        tagValue = values.tagValue,
        type = values.type,
        svgFallback = values.svgFallback,
        offsetPixel = values.offsetPixel;
      var errMsg = "Size for image is not valid (it should be an array of two numbers, such as [ 1024, 1024 ])";
      if (!sizePixel || sizePixel.length !== 2) {
        var e = new XTRenderingError(errMsg);
        e.properties = {
          tagValue: tagValue
        };
        throw e;
      }
      sizePixel.forEach(function (size) {
        if ((!isFloat(size) || !isPositive(size)) && typeof size !== "string") {
          var _e2 = new XTRenderingError(errMsg);
          _e2.properties = {
            sizePixel: sizePixel,
            tagValue: tagValue
          };
          throw _e2;
        }
      });
      var imgManager = this.getRelationsManager(options.filePath);
      if (values.link) {
        values.ridLink = imgManager.addLink(values.link);
      }
      if (fileType === "xlsx" && part.module !== moduleNameReplace) {
        this.upsertDrawing(options);
        var drawingFile = imgManager.drawingFile;
        imgManager = this.getRelationsManager(drawingFile);
      }
      var transformer = {
        dpi: this.dpi
      };
      var size = this.convertSize(sizePixel, transformer);
      var offset = [0, 0];
      if (offsetPixel) {
        offset = this.convertSize(offsetPixel, transformer);
      }
      if (size[0] === null || size[1] === null) {
        var _errMsg = "Size for image is not valid (it should be an array of two numbers, such as [ 1024, 1024 ])";
        var _e3 = new XTRenderingError(_errMsg);
        _e3.properties = {
          sizePixel: sizePixel,
          tagValue: tagValue
        };
        throw _e3;
      }
      if (type === "svg") {
        var rIdSvg = imgManager.addImageRels(this.getNextImageName("svg"), imgBuffer);
        if (svgFallback && typeof svgFallback.then === "function") {
          return {
            errors: [getIncorrectPromiseError(part, options)]
          };
        }
        var rIdBinary;
        try {
          rIdBinary = imgManager.addImageRels(this.getNextImageName(magicExtension(svgFallback)), svgFallback);
        } catch (e) {
          return {
            errors: [e]
          };
        }
        return this.getRenderedPart(type, part, [rIdBinary, rIdSvg], size, values);
      }
      if (imgBuffer && typeof imgBuffer.then === "function") {
        return {
          errors: [getIncorrectPromiseError(part, options)]
        };
      }
      var rId;
      try {
        rId = imgManager.addImageRels(this.getNextImageName(magicExtension(imgBuffer)), imgBuffer);
      } catch (e) {
        return {
          errors: [e]
        };
      }
      if (part.module === moduleNameReplace) {
        if (fileType === "xlsx" && part.twoCellAnchor) {
          var col = part.col,
            row = part.row,
            colOffStart = part.colOffStart,
            rowOffStart = part.rowOffStart;
          var value = imgManager.getOneCellAnchor(col, colOffStart, row, rowOffStart, rId, size[0], size[1]);
          var _simpleId = getSimpleId(part, options);
          if (options.calledByXlsx) {
            var _this$renderedXmlImag;
            (_this$renderedXmlImag = this.renderedXmlImages)[_simpleId] || (_this$renderedXmlImag[_simpleId] = []);
            this.renderedXmlImages[_simpleId].push(value);
          } else if (this.renderedXmlImages[_simpleId]) {
            return {
              value: this.renderedXmlImages[_simpleId].join("")
            };
          }
          return {
            value: value
          };
        }
        return {
          value: part.expanded
          // eslint-disable-next-line complexity
          .map(function (p) {
            if (isStartingTag(p, "a:ext") || isStartingTag(p, "wp:extent") || isStartingTag(p, "xdr:ext")) {
              var val = p.value;
              val = setSingleAttribute(val, "cx", size[0]);
              return setSingleAttribute(val, "cy", size[1]);
            }
            if (isStartingTag(p, "a:off")) {
              var _val = p.value;
              var x = +getSingleAttribute(_val, "x");
              var y = +getSingleAttribute(_val, "y");
              if (offset[0] !== 0 || offset[1] !== 0) {
                _val = setSingleAttribute(_val, "x", x + offset[0]);
                _val = setSingleAttribute(_val, "y", y + offset[1]);
                return _val;
              }
            }
            if (isStartingTag(p, "a:xfrm")) {
              var _val2 = p.value;
              if (values.rotation) {
                _val2 = setSingleAttribute(_val2, "rot", getRawRotation(values.rotation));
              }
              if (values.flipVertical) {
                _val2 = setSingleAttribute(_val2, "flipV", "1");
              }
              if (values.flipHorizontal) {
                _val2 = setSingleAttribute(_val2, "flipH", "1");
              }
              return _val2;
            }
            if (isStartingTag(p, "wp:docPr")) {
              var newVal = p.value;
              if (values.name != null) {
                newVal = setSingleAttribute(newVal, "name", utf8ToWord(values.name));
              }
              if (values.alt != null) {
                newVal = setSingleAttribute(newVal, "descr", utf8ToWord(values.alt));
              }
              if (values.ridLink) {
                return "".concat(newVal.replace("/>", ">"), "\n\t\t\t\t\t\t\t\t<a:hlinkClick xmlns:a=\"http://schemas.openxmlformats.org/drawingml/2006/main\" tooltip=\"\" r:id=\"").concat(values.ridLink, "\"/>\n\t\t\t\t\t\t\t\t</wp:docPr>");
              }
              return newVal;
            }
            if (isStartingTag(p, "p:cNvPr")) {
              if (values.ridLink) {
                return "".concat(p.value.replace("/>", ">"), "\n\t\t\t\t\t\t\t\t<a:hlinkClick xmlns:a=\"http://schemas.openxmlformats.org/drawingml/2006/main\" tooltip=\"\" r:id=\"").concat(values.ridLink, "\"/>\n\t\t\t\t\t\t\t</p:cNvPr>");
              }
            }
            if (isStartingTag(p, "a:blip")) {
              return setSingleAttribute(p.value, "r:embed", rId);
            }
            if (isStartingTag(p, "asvg:svgBlip")) {
              return "";
            }
            return p.value;
          }).join("")
        };
      }
      if (fileType === "xlsx") {
        imgManager.addXLSXImage(part, size, rId);
        return {
          value: ""
        };
      }
      return this.getRenderedPart(type, part, rId, size, values);
    }
  }, {
    key: "convertSize",
    value: function convertSize(sizePixel, obj) {
      var xSize = sizePixel[0];
      var ySize = sizePixel[1];
      if (typeof xSize === "number") {
        xSize += "px";
      }
      if (typeof ySize === "number") {
        ySize += "px";
      }
      return [toEMU(xSize, obj), toEMU(ySize, obj)];
    }
  }, {
    key: "getRenderedPart",
    value: function getRenderedPart(type, part, rId, size, values) {
      if (isNaN(rId)) {
        throw new XTInternalError("rId is NaN, aborting");
      }
      var centered = part.module === moduleNameCentered;
      var newText;
      var props = getDefaultProps(_objectSpread(_objectSpread({
        dpi: this.dpi
      }, values), {}, {
        size: size,
        type: type,
        part: part
      }));
      var fileType = this.fileType;
      switch (fileType) {
        case "pptx":
          newText = this.getRenderedPartPptx(part, rId, size, centered, props);
          break;
        case "docx":
          newText = this.getRenderedPartDocx(type, rId, size, centered, props);
          // the part.raw != null is necessary to not add <w:t> when the render
          // happens from the HTML module
          if (centered === false && part.raw != null) {
            newText = "</w:t>".concat(newText, "<w:t xml:space=\"preserve\">");
          }
          break;
        default:
      }
      return {
        value: newText
      };
    }
  }, {
    key: "getRenderedPartPptx",
    value: function getRenderedPartPptx(part, rId, size, centered, props) {
      if (part.module === moduleNameCell) {
        var left;
        var right;
        var top;
        var bottom;
        left = 0;
        right = 0;
        top = 0;
        bottom = 0;
        if (props.imageFit === "fill") {
          left = 0;
          right = 0;
          top = 0;
          bottom = 0;
        }
        if (props.imageFit === "contain") {
          var imageAspectRatio = size[1] && size[0] ? size[1] / size[0] : 1;
          var containerAspectRatio = part.containerHeight && part.containerWidth ? part.containerHeight / part.containerWidth : 1;
          var ratio = imageAspectRatio / containerAspectRatio;
          if (ratio === 1) {
            // 1% is default
            left = 1;
            right = 1;
            top = 1;
            bottom = 1;
          } else if (ratio < 1) {
            ratio *= 0.98;
            left = 1;
            right = 1;
            var toRemove = (1 - ratio) / 2;
            top = 100 * toRemove;
            bottom = 100 * toRemove;
          } else {
            ratio = 1 / ratio;
            ratio *= 0.98;
            top = 1;
            bottom = 1;
            var _toRemove = (1 - ratio) / 2;
            left = 100 * _toRemove;
            right = 100 * _toRemove;
          }
        }
        var alpha = 100;
        return "<a:blipFill>\n\t\t\t\t<a:blip r:embed=\"".concat(rId, "\" >\n\t\t\t\t\t<a:alphaModFix amt=\"").concat(alpha * 1000, "\"/>\n\t\t\t\t</a:blip>\n\t\t\t\t<a:stretch>\n\t\t\t\t\t<a:fillRect l=\"").concat(Math.round(left * 1000), "\" t=\"").concat(Math.round(top * 1000), "\" r=\"").concat(Math.round(right * 1000), "\" b=\"").concat(Math.round(bottom * 1000), "\"/>\n\t\t\t\t</a:stretch>\n\t\t\t</a:blipFill>\n\t\t\t");
      }
      var offset = {
        x: part.offset.x,
        y: part.offset.y
      };
      var cellCX = part.ext.cx;
      var cellCY = part.ext.cy;
      var imgW = size[0];
      var imgH = size[1];
      if (centered) {
        offset.x += parseInt(cellCX / 2 - imgW / 2, 10);
        offset.y += parseInt(cellCY / 2 - imgH / 2, 10);
      }
      return this.templates.getPptxImageXml(rId, [imgW, imgH], offset, props);
    }
  }, {
    key: "getRenderedPartDocx",
    value: function getRenderedPartDocx(type, rId, size, centered, props) {
      var docPrId = ++this.maxDocPrId;
      if (type === "svg") {
        return centered ? this.templates.getImageSVGXmlCentered(rId[0], rId[1], size, docPrId, props) : this.templates.getImageSVGXml(rId[0], rId[1], size, docPrId, props);
      }
      var value = centered ? this.templates.getImageXmlCentered(rId, size, docPrId, props) : this.templates.getImageXml(rId, size, docPrId, props);
      if (props.caption && !centered) {
        this.maxDocPrId++;
      }
      return value;
    }
  }, {
    key: "getNextImageName",
    value: function getNextImageName(extension) {
      var name = "image_generated_".concat(this.imageNumber, ".").concat(extension);
      this.imageNumber++;
      return name;
    }
  }]);
  return ImageModule;
}();
module.exports = ImageModule;

/***/ }),

/***/ "./es6/link-trait.js":
/*!***************************!*\
  !*** ./es6/link-trait.js ***!
  \***************************/
/***/ ((module) => {

module.exports = function (relM) {
  relM.addLink = function (target) {
    return relM.addRelationship({
      Type: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink",
      Target: target,
      TargetMode: "External"
    });
  };
  return relM;
};

/***/ }),

/***/ "./es6/max-docprid.js":
/*!****************************!*\
  !*** ./es6/max-docprid.js ***!
  \****************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var str2xml = (__webpack_require__(/*! docxtemplater */ "./node_modules/docxtemplater/js/docxtemplater.js").DocUtils.str2xml);
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

/***/ }),

/***/ "./es6/normalize-path.js":
/*!*******************************!*\
  !*** ./es6/normalize-path.js ***!
  \*******************************/
/***/ ((module) => {

module.exports = function normalizePath(path, relativeTo) {
  if (path.length > 0 && path[0] === "/") {
    return path;
  }
  var newPath = relativeTo.replace(/\/_rels\/.*/, "").split("/");
  path.split("/").forEach(function (part) {
    if (part === "..") {
      newPath.pop();
    } else {
      newPath.push(part);
    }
  });
  if (newPath[0] !== "") {
    newPath.unshift("");
  }
  return newPath.join("/");
};

/***/ }),

/***/ "./es6/push-array.js":
/*!***************************!*\
  !*** ./es6/push-array.js ***!
  \***************************/
/***/ ((module) => {

module.exports = function pushArray(array1, array2) {
  if (!array2) {
    return;
  }
  for (var i = 0, len = array2.length; i < len; i++) {
    array1.push(array2[i]);
  }
};

/***/ }),

/***/ "./es6/regex.js":
/*!**********************!*\
  !*** ./es6/regex.js ***!
  \**********************/
/***/ ((module) => {

var pixelRegex = /^-?([\d.]+px|0)$/;
var pointRegex = /^-?([\d.]+)pt$/;
var percentRegex = /^-?[\d.]+%$/;
var numberRegex = /^-?[\d.]+$/;
var inchRegex = /^-?[\d.]+in$/;
var mmRegex = /^-?[\d.]+mm$/;
var cmRegex = /^-?[\d.]+cm$/;
var pcRegex = /^-?[\d.]+pc$/;
var emuRegex = /^-?[\d.]+emu$/;
function getFontSize(value) {
  return parseInt(parseFloat(value) * 2, 10);
}
var sizeRegex = /^[\d.]+(px|pt|mm|em|rem|vh)$/;
module.exports = {
  pixelRegex: pixelRegex,
  percentRegex: percentRegex,
  pointRegex: pointRegex,
  sizeRegex: sizeRegex,
  numberRegex: numberRegex,
  inchRegex: inchRegex,
  mmRegex: mmRegex,
  cmRegex: cmRegex,
  pcRegex: pcRegex,
  emuRegex: emuRegex,
  getFontSize: getFontSize
};

/***/ }),

/***/ "./es6/relationship-manager.js":
/*!*************************************!*\
  !*** ./es6/relationship-manager.js ***!
  \*************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
var normalizePath = __webpack_require__(/*! ./normalize-path.js */ "./es6/normalize-path.js");
var getRelsFilePath = __webpack_require__(/*! ./rels-file-path.js */ "./es6/rels-file-path.js");
function maxArray(a) {
  return Math.max.apply(null, a);
}
var _require$DocUtils = (__webpack_require__(/*! docxtemplater */ "./node_modules/docxtemplater/js/docxtemplater.js").DocUtils),
  str2xml = _require$DocUtils.str2xml,
  xml2str = _require$DocUtils.xml2str;
var ftname = {
  docx: "document",
  pptx: "presentation",
  xlsx: "workbook"
};
var ftprefix = {
  docx: "word",
  pptx: "ppt",
  xlsx: "xl"
};
var rels = {
  getPrefix: function getPrefix(fileType) {
    return ftprefix[fileType];
  },
  getFileTypeName: function getFileTypeName(fileType) {
    return ftname[fileType];
  }
};
function _setAttributes(tag, attributes) {
  Object.keys(attributes).forEach(function (key) {
    var value = attributes[key];
    tag.setAttribute(key, value);
  });
}
var RelationsManager = /*#__PURE__*/function () {
  function RelationsManager(mod, fileName) {
    _classCallCheck(this, RelationsManager);
    var zip = mod.zip,
      fileType = mod.fileType,
      xmlDocuments = mod.xmlDocuments;
    if (!zip) {
      throw new Error("zip empty");
    }
    if (!fileName) {
      throw new Error("filename empty");
    }
    this.zip = zip;
    this.fileName = fileName;
    if (this.fileName.indexOf("docProps/") === 0) {
      return;
    }
    this.fileType = fileType;
    if (Object.keys(xmlDocuments).length === 0) {
      throw new Error("xmlDocs empty");
    }
    this.xmlDocs = xmlDocuments;
    this.xmlDocuments = xmlDocuments;
    if (this.xmlDocuments[fileName]) {
      this.mainDoc = this.xmlDocuments[fileName];
    }
    this.contentTypeDoc = this.xmlDocs["[Content_Types].xml"];
    this.prefix = rels.getPrefix(fileType);
    this.ftprefix = ftprefix[this.fileType];
    this.fileTypeName = rels.getFileTypeName(fileType);
    this.endFileName = fileName.replace(/^.*?([a-zA-Z0-9]+)\.xml$/, "$1");
    this.dirname = fileName.replace(/\/[^\/]+$/g, "");
    this.mod = mod;
    var relsFilePath = getRelsFilePath(fileName);
    this.relsDoc = xmlDocuments[relsFilePath] || this.createEmptyRelsDoc(xmlDocuments, relsFilePath);
  }
  _createClass(RelationsManager, [{
    key: "forEachRel",
    value: function forEachRel(functor) {
      var rels = this.relsDoc.getElementsByTagName("Relationship");
      for (var i = 0, len = rels.length; i < len; i++) {
        var rel = rels[i];
        var target = rel.getAttribute("Target");
        var id = rel.getAttribute("Id");
        var type = rel.getAttribute("Type");
        var targetMode = rel.getAttribute("TargetMode");
        var absoluteTarget = void 0;
        if (targetMode === "External") {
          absoluteTarget = "";
        } else {
          absoluteTarget = normalizePath(target, this.dirname).substr(1);
        }
        functor({
          target: target,
          absoluteTarget: absoluteTarget,
          targetMode: targetMode,
          id: id,
          type: type
        });
      }
    }
  }, {
    key: "getNextRid",
    value: function getNextRid() {
      var RidArray = [0];
      var iterable = this.relsDoc.getElementsByTagName("Relationship");
      for (var i = 0, tag; i < iterable.length; i++) {
        tag = iterable[i];
        var id = tag.getAttribute("Id");
        if (/^rId[0-9]+$/.test(id)) {
          RidArray.push(parseInt(id.substr(3), 10));
        }
      }
      return maxArray(RidArray) + 1;
    }
    /*
     * Add an extension type in the [Content_Types.xml], is used if for example
     * you want word to be able to read png files (for every extension you add
     * you need a contentType)
     */
  }, {
    key: "addExtensionRels",
    value: function addExtensionRels(contentType, extension) {
      var defaultTags = this.contentTypeDoc.getElementsByTagName("Default");
      var extensionRegistered = Array.prototype.some.call(defaultTags, function (tag) {
        return tag.getAttribute("Extension") === extension;
      });
      if (extensionRegistered) {
        return;
      }
      var types = this.contentTypeDoc.getElementsByTagName("Types")[0];
      var newTag = this.contentTypeDoc.createElement("Default");
      _setAttributes(newTag, {
        ContentType: contentType,
        Extension: extension
      });
      types.appendChild(newTag);
    }
  }, {
    key: "addOverride",
    value: function addOverride(contentType, partName) {
      var overrideTags = this.contentTypeDoc.getElementsByTagName("Override");
      var overrideRegistered = Array.prototype.some.call(overrideTags, function (tag) {
        return tag.getAttribute("PartName") === partName;
      });
      if (overrideRegistered) {
        return;
      }
      var types = this.contentTypeDoc.getElementsByTagName("Types")[0];
      var newTag = this.contentTypeDoc.createElement("Override");
      _setAttributes(newTag, {
        ContentType: contentType,
        PartName: partName
      });
      types.appendChild(newTag);
    }
  }, {
    key: "createEmptyRelsDoc",
    value: function createEmptyRelsDoc(xmlDocuments, relsFileName) {
      var mainRels = this.prefix + "/_rels/" + this.fileTypeName + ".xml.rels";
      this.addOverride("application/vnd.openxmlformats-package.relationships+xml", "/" + relsFileName);
      var doc = xmlDocuments[mainRels];
      if (!doc) {
        var err = new Error("Could not copy from empty relsdoc");
        err.properties = {
          mainRels: mainRels,
          relsFileName: relsFileName,
          files: Object.keys(this.zip.files)
        };
        throw err;
      }
      var relsDoc = str2xml(xml2str(doc));
      var relationships = relsDoc.getElementsByTagName("Relationships")[0];
      var relationshipChilds = relationships.getElementsByTagName("Relationship");
      while (relationshipChilds.length > 0) {
        relationships.removeChild(relationshipChilds[0]);
        relationshipChilds = relationships.getElementsByTagName("Relationship");
      }
      xmlDocuments[relsFileName] = relsDoc;
      return relsDoc;
    }
  }, {
    key: "setAttributes",
    value: function setAttributes(tag, attributes) {
      return _setAttributes(tag, attributes);
    }
  }, {
    key: "getRelationship",
    value: function getRelationship(searchedId) {
      return this.findRelationship({
        Id: searchedId
      });
    }
  }, {
    key: "getRelationshipFullTarget",
    value: function getRelationshipFullTarget(Id) {
      return this.findRelationship({
        Id: Id
      }).absoluteTarget;
    }
  }, {
    key: "findRelationship",
    value: function findRelationship(filter) {
      var match = null;
      this.forEachRel(function (candidate) {
        if (filter.Type && filter.Type === candidate.type) {
          match = candidate;
        }
        if (filter.Id && filter.Id === candidate.id) {
          match = candidate;
        }
      });
      return match;
    }
  }, {
    key: "addRelationship",
    value: function addRelationship(obj) {
      var relationships = this.relsDoc.getElementsByTagName("Relationships")[0];
      var newTag = this.relsDoc.createElement("Relationship");
      var id = obj.Id || "rId".concat(this.getNextRid());
      this.setAttributes(newTag, _objectSpread({
        Id: id
      }, obj));
      relationships.appendChild(newTag);
      return id;
    }
  }]);
  return RelationsManager;
}();
module.exports = RelationsManager;

/***/ }),

/***/ "./es6/rels-file-path.js":
/*!*******************************!*\
  !*** ./es6/rels-file-path.js ***!
  \*******************************/
/***/ ((module) => {

module.exports = function getRelsFilePath(fileName) {
  var relsFileName = fileName.replace(/^.*?([a-zA-Z0-9]+)\.xml$/, "$1") + ".xml.rels";
  var path = fileName.split("/");
  path.pop();
  var prefix = path.join("/");
  return "".concat(prefix, "/_rels/").concat(relsFileName);
};

/***/ }),

/***/ "./es6/rotation-flip-utils.js":
/*!************************************!*\
  !*** ./es6/rotation-flip-utils.js ***!
  \************************************/
/***/ ((module) => {

function getXML(props) {
  var rotation = props.rotation,
    flipVertical = props.flipVertical,
    flipHorizontal = props.flipHorizontal;
  var values = [];
  if (rotation !== 0) {
    values.push("rot=\"".concat(getRawRotation(rotation), "\""));
  }
  if (flipVertical) {
    values.push('flipV="1"');
  }
  if (flipHorizontal) {
    values.push('flipH="1"');
  }
  if (values.length === 0) {
    return "";
  }
  return " ".concat(values.join(" "));
}
function getRawRotation(rotation) {
  return rotation * 60000;
}
module.exports = {
  getXML: getXML,
  getRawRotation: getRawRotation
};

/***/ }),

/***/ "./es6/size-converter.js":
/*!*******************************!*\
  !*** ./es6/size-converter.js ***!
  \*******************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var converter = __webpack_require__(/*! ./converter.js */ "./es6/converter.js");

/*
 * cm centimeters
 * mm millimeters
 * in inches (1in = 96px = 2.54cm)
 * px * Pixels (px) are relative to the viewing device. For low-dpi devices, 1px is one device pixel (dot) of the display. For printers and high resolution screens 1px implies multiple device pixels.
 * pt points (1pt = 1/72 of 1in)
 * pc picas (1pc = 12 pt)
 */

var _require = __webpack_require__(/*! ./regex.js */ "./es6/regex.js"),
  pixelRegex = _require.pixelRegex,
  pointRegex = _require.pointRegex,
  inchRegex = _require.inchRegex,
  mmRegex = _require.mmRegex,
  cmRegex = _require.cmRegex,
  pcRegex = _require.pcRegex,
  emuRegex = _require.emuRegex;
function toEMU(value, transformer) {
  if (value === "0") {
    return 0;
  }
  if (pixelRegex.test(value)) {
    return converter.pixelToEMU(parseFloat(value), transformer.dpi);
  }
  if (pointRegex.test(value)) {
    return converter.pointToEmu(parseFloat(value));
  }
  if (inchRegex.test(value)) {
    return converter.inchToEmu(parseFloat(value));
  }
  if (cmRegex.test(value)) {
    return converter.cmToEmu(parseFloat(value));
  }
  if (mmRegex.test(value)) {
    return converter.mmToEmu(parseFloat(value));
  }
  if (pcRegex.test(value)) {
    return converter.pcToEmu(parseFloat(value));
  }
  if (emuRegex.test(value)) {
    return parseFloat(value);
  }
  return null;
}
function toDXA(value, transformer) {
  var emu = toEMU(value, transformer);
  if (emu == null) {
    return null;
  }
  return Math.round(converter.emuToDXA(emu));
}
function toPoint(value, transformer) {
  var emu = toEMU(value, transformer);
  if (emu == null) {
    return null;
  }
  return converter.emuToPoint(emu);
}
function toPixel(value, transformer) {
  if (pixelRegex.test(value)) {
    return parseFloat(value);
  }
  var emu = toEMU(value, transformer);
  if (emu == null) {
    return null;
  }
  return converter.emuToPixel(emu, transformer.dpi);
}
module.exports = {
  toDXA: toDXA,
  toPoint: toPoint,
  toPixel: toPixel,
  toEMU: toEMU
};

/***/ }),

/***/ "./es6/svg-unsupported.js":
/*!********************************!*\
  !*** ./es6/svg-unsupported.js ***!
  \********************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/* provided dependency */ var Buffer = __webpack_require__(/*! buffer */ "./node_modules/buffer/index.js")["Buffer"];
var base64url = "iVBORw0KGgoAAAANSUhEUgAAAGQAAAAyCAYAAACqNX6+AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH4gYMDgEcVUoaNQAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAHvklEQVR42u2aW0hU3RvGn22TM6NlmWmm5llCi7TSDlZWKGGpHShRwkpMO6CpeUg6WaaF2okIs6iMJI0gq5uIiMLqwtTy0IVaoeKJKLRSc0ZNff5XDd/+m6j58XVgPTAX693PWu/a6zdr7T1rlkSSEPptpCeGQAAREkAEECEBRAAREkAEECEBRAAREkCEBBABREgAEUCE/gog7e3tiIuLg52dHQwMDDB79mykpqaivb0dABAQEAAfH58f1q2uroYkSXj06JEu1tbWhsTERMycORMqlQpmZmbw9PREVlYWNBrNn0WEv0ABAQGcM2cOX758SY1Gw+rqah49epRnz54lSd67d4+SJLG+vn5Q3fj4eNrY2LC/v58k2dTURGtra65YsYLPnz+nRqNhW1sbi4uLuWfPHl6+fJl/kv5zIN3d3VQoFLx+/fqQnm/fvtHc3JzJycmyeG9vL83MzJiSkqKLrV+/ntbW1tRqtfwb9J8DGRgY4KRJkxgaGsre3t4hfUlJSbS2ttbNBJIsKCignp4eGxsbSZIdHR1UKBRMT0/n36JfsmTl5eXR0NCQJiYmXLt2LTMyMvjmzRuZ5+3btwTAhw8f6mJr1qyhr6+vrlxRUUEAvHPnjgAyVrW2tjIvL4+RkZF0cnKiQqHghQsXZB4vLy8GBQWRJFtaWjhu3Djevn17EJC7d+/K6pmYmBAAAdDPz08AGa36+/u5bds2GhgYsK+vTxfPzc2lUqlkW1sbjx8/TlNTU9ky933JysjI+GG7Gzdu/OOA/Ba/Q/T09LB06VJotVpotVpdfNOmTVCpVLhx4wZycnKwdetWjB8/Xnd94sSJ8PPzQ3Z2Nnp6ev6OHyK/4i3Ly8uLBQUFbGpqokajYVFREZ2dnenj4zPIv3v3bhobGxMAq6qqBl1vbGyklZUVFyxYwMePH7O1tZVdXV0sKyujm5sb/f39xZI1nJ49e8bAwEBaWVlRrVbT3t6eMTExbGtrG+R99eoVAdDT03PI9j5+/Mi4uDg6OTlRqVRyypQpnDdvHg8fPsz379//UUAkcXJRbJ0ICSACiJAAIoAICSACiNC/qJCQEISHhwsgY5G/vz9iY2PFDBFL1j/k5uaGU6dOyWLBwcGy6ebj44OIiAhs2bIF5ubmMDU1RXR0NPr7+3Wehw8fYv78+TA0NISTkxMyMzN110eaIzw8HEFBQTAzM4OJiQmSkpIwMDAwKk9vby8SExMxffp0KJVKeHh44MmTJ7Lc39sJDg6GkZERVq5cidDQUNy/fx/nzp2DJEmQJAk1NTUgiTNnzsDR0REqlQouLi64cuWKrL3u7m5ERETAyMgIlpaW2LFjB75+/fpzm4uurq48efKkLBYUFMTt27fryt7e3tTT0+O1a9fY0dHB4uJiGhkZ8erVqyTJzs5OqtVqnj9/nl1dXayvr+f+/ftZXl4+qhwAmJGRwc+fP7OwsJBTp07l6dOnR+VJTEzkjBkzWFRUxE+fPvHIkSNUKpWsq6uTtSNJEi9evMjOzk5d3M/PjzExMbJ+pqSk0MXFhcXFxezq6mJhYSFNTU158+ZNnSc2NpYODg4sKytja2srY2JiCEB2fyPeXBzpYG3YsEHm2bx5M0NDQ0mStbW1BMCGhgaOJYeHh4fMc/LkSVpaWo7Yo9VqqVQqmZubK/O4ubnJBtrb25urVq0a1M//B6LVamloaMhHjx4NgvR9t1qj0VClUvHWrVuycwKWlpbDAlGMZb1zcnKSlY2NjdHc3AwAsLOzw+rVq7F48WIEBwdj5cqV8Pb2hlqtHlUOd3d3WdnDwwMtLS3o6OiAkZHRsJ7m5mb09PRg4cKFMs+iRYtQVVUli82aNWvY/lRXV6Orqwu+vr7fVxjdx97eHgBQV1eH7u5uWb8UCgXmzp377z3U/7kmf5ckSUP6JUnC/fv3kZ+fD7VajYMHD8LR0XHQIIwlx0g8Q21mkxxUT19ff8Tj8Pr1a/T19aG/vx8DAwMgidra2lH3fURAjI2N8fnzZ1ns3bt3o25ckiQsX74caWlpqKyshIWFBXJyckaVo7S0dFDZwsJCNzuG8zg4OECpVKKkpETmKSkpgbOz87D3MH78eNkXxdnZGWq1Gg8ePBiyjr29PZRKpaxffX19KC8v/zkgy5YtQ35+PmpqatDe3o4TJ06goqJiVDBevHiBnTt3orKyEt3d3aioqEBzczMcHBxGlaO0tBSZmZlob2/H06dPkZGRgb17947Yo1KpEB0djUOHDqGkpARfvnxBamoqqqqqEBMTM+x92NjYoKKiQveGZGBggH379uHYsWO4efMmOjo60NDQgOzsbKSlpQEA1Go1du3ahQMHDqC8vByfPn1CQkICWlpafu4tq7OzkyEhIZw8eTItLS0ZFRXFgICAQQ/cpKQkWb3IyEiuW7eOJNnX18dLly7R1dWVarWatra2TE5O1p2zGmmOsLAwBgYG0tTUlMbGxkxISJAdhBiJp6enh/Hx8Zw2bRr19fXp7u7Ox48fy/r+o/shybq6Oi5ZsoQGBgYEwOrqapJkVlYWXVxcqK+vT1tbW0ZFRfHDhw+6ehqNhmFhYZwwYQKnT5/O8PBwrlu3btiH+m/9j6GPjw/c3d2Rnp4+Jo/YyxISQP4WiUMOYoYICSB/kP4Hf/a8wg1RhSwAAAAASUVORK5CYII=";
function base64Convert(stringBase64) {
  // For nodejs
  if (typeof Buffer !== "undefined" && Buffer.from) {
    return Buffer.from(stringBase64, "base64");
  }

  // For browsers :
  var binaryString = window.atob(stringBase64);
  var len = binaryString.length;
  var bytes = new Uint8Array(len);
  for (var i = 0; i < len; i++) {
    var ascii = binaryString.charCodeAt(i);
    bytes[i] = ascii;
  }
  return bytes.buffer;
}
module.exports = function () {
  return base64Convert(base64url);
};

/***/ }),

/***/ "./es6/svg.js":
/*!********************!*\
  !*** ./es6/svg.js ***!
  \********************/
/***/ ((module) => {

function partialAb2Str(buffer, length) {
  var bufView = new Uint8Array(buffer);
  var result = "";
  var addition = Math.min(length, Math.pow(2, 16) - 1);
  for (var i = 0; i < length; i += addition) {
    if (i + addition > length) {
      addition = length - i;
    }
    result += String.fromCharCode.apply(null, bufView.subarray(i, i + addition));
  }
  return result;
}
function getImgString(imgBuffer) {
  return typeof imgBuffer === "string" ? imgBuffer : imgBuffer.buffer ? imgBuffer.toString() : partialAb2Str(imgBuffer, 4100);
}
function isSVG(imgBuffer) {
  if (!imgBuffer) {
    return false;
  }
  return getImgString(imgBuffer).substr(0, 4096).indexOf("<svg") !== -1;
}
function getSVGSize(imgBuffer) {
  var imgString = getImgString(imgBuffer);
  var wRegex = /width="?([0-9\.]+)/;
  var hRegex = /height="?([0-9\.]+)/;
  var matches;
  matches = wRegex.exec(imgString);
  var width = matches ? parseInt(matches[1], 10) : null;
  matches = hRegex.exec(imgString);
  var height = matches ? parseInt(matches[1], 10) : null;
  if (width == null || height == null) {
    return null;
  }
  return [width, height];
}
module.exports = {
  isSVG: isSVG,
  getSVGSize: getSVGSize
};

/***/ }),

/***/ "./es6/sxml.js":
/*!*********************!*\
  !*** ./es6/sxml.js ***!
  \*********************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }
function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
var _require = __webpack_require__(/*! ./attributes.js */ "./es6/attributes.js"),
  setSingleAttribute = _require.setSingleAttribute,
  getSingleAttribute = _require.getSingleAttribute;
var pushArray = __webpack_require__(/*! ./push-array.js */ "./es6/push-array.js");
function canonicalizeState(state) {
  if (state.xml) {
    return state;
  }
  if (state instanceof Array) {
    return {
      xml: state,
      index: [0, state.length]
    };
  }
}
function findParent(state, tagName) {
  state = canonicalizeState(state);
  var leftIndex = -1;
  var rightIndex = -1;
  for (var i = state.index[0]; i >= 0; i--) {
    if (state.xml[i].tag === tagName && state.xml[i].position === "start") {
      leftIndex = i;
      break;
    }
  }
  for (var _i = state.index[1]; _i < state.xml.length; _i++) {
    if (state.xml[_i].tag === tagName && state.xml[_i].position === "end") {
      rightIndex = _i;
      break;
    }
  }
  if (leftIndex === -1 || rightIndex === -1) {
    return null;
  }
  return {
    xml: state.xml,
    index: [leftIndex, rightIndex]
  };
}
function getAttribute(state, attribute) {
  state = canonicalizeState(state);
  return getSingleAttribute(state.xml[state.index[0]].value, attribute);
}

// eslint-disable-next-line complexity
function findChilds(state, tagName) {
  var first = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
  state = canonicalizeState(state);
  if (tagName instanceof Array) {
    var _childs = [state];
    tagName.forEach(function (tagName) {
      var subchilds = _childs.map(function (child) {
        return findChilds(child, tagName);
      });
      _childs = [];
      subchilds.forEach(function (subchild) {
        pushArray(_childs, subchild);
      });
    });
    if (first) {
      return _childs[0];
    }
    return _childs;
  }
  var childs = [];
  var startChild = null;
  for (var i = state.index[0], len = state.index[1]; i < len; i++) {
    var part = state.xml[i];
    if (part.tag === tagName && part.position === "start") {
      startChild = i;
    }
    if (part.tag === tagName && part.position === "end") {
      childs.push({
        xml: state.xml,
        index: [startChild, i]
      });
      if (first) {
        return childs[0];
      }
    }
    if (part.tag === tagName && part.position === "selfclosing") {
      childs.push({
        xml: state.xml,
        index: [i, i]
      });
      if (first) {
        return childs[0];
      }
    }
  }
  if (first) {
    return null;
  }
  return childs;
}

/* eslint-disable-next-line complexity */
function findDirectChilds(state, tagName) {
  var first = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
  state = canonicalizeState(state);
  var childs = [];
  var startChild = null;
  var level = 0;
  for (var i = state.index[0], len = state.index[1]; i < len; i++) {
    var part = state.xml[i];
    if (part.position === "start" || part.position === "selfclosing") {
      level++;
    }
    if (level === 2 && part.tag === tagName) {
      if (part.position === "start") {
        startChild = i;
      }
      if (part.position === "end") {
        childs.push({
          xml: state.xml,
          index: [startChild, i]
        });
        if (first) {
          return childs[0];
        }
      }
      if (part.position === "selfclosing") {
        childs.push({
          xml: state.xml,
          index: [i, i]
        });
        if (first) {
          return childs[0];
        }
      }
    }
    if (part.position === "end" || part.position === "selfclosing") {
      level--;
    }
  }
  if (first) {
    return null;
  }
  return childs;
}
function firstDirectChild(state, tagName) {
  return findDirectChilds(state, tagName, true);
}
function firstDirectChildOrCreate(state, tagName) {
  var tag = firstDirectChild(state, tagName);
  if (tag === null) {
    appendChild(state, [selfClosing(tagName)]);
    tag = firstDirectChild(state, tagName);
  }
  return tag;
}
function firstChild(state, tagName) {
  return findChilds(state, tagName, true);
}
function getContent(state) {
  var content = "";
  for (var i = state.index[0] + 1, len = state.index[1]; i < len; i++) {
    var part = state.xml[i];
    if (part.type === "content") {
      content += part.value;
    }
  }
  return content;
}
function dropChildren(state) {
  state.xml.splice(state.index[0] + 1, state.index[1] - 1 - state.index[0]);
  state.index[1] = state.index[0] + 1;
}
function dropSelf(state) {
  state.xml.splice(state.index[0], state.index[1] + 1 - state.index[0]);
  state.index[1] = state.index[0] - 1;
}
function selfClosing(name) {
  return {
    type: "tag",
    value: "<".concat(name, "/>"),
    position: "selfclosing",
    tag: name
  };
}
function create(tagName, attributes, child) {
  var startValue = "<".concat(tagName, ">");
  Object.keys(attributes).forEach(function (attribute) {
    startValue = setSingleAttribute(startValue, attribute, attributes[attribute]);
  });
  var childXml = [];
  if (child != null && _typeof(child) === "object") {
    childXml = child.xml;
  }
  if (typeof child === "string") {
    childXml = [{
      type: "content",
      value: child
    }];
  }
  if (typeof child === "number") {
    childXml = [{
      type: "content",
      value: child.toString()
    }];
  }
  return canonicalizeState([{
    type: "tag",
    position: "start",
    value: startValue,
    tag: tagName
  }].concat(childXml).concat([{
    type: "tag",
    position: "end",
    tag: tagName,
    value: "</".concat(tagName, ">")
  }]));
}
function appendChild(parent, child) {
  var _parent$xml;
  parent = canonicalizeState(parent);
  child = canonicalizeState(child);
  var firstIndex = parent.index[0];
  var selfclosing = false;
  var tag = parent.xml[firstIndex].tag;
  var val = parent.xml[firstIndex].value;
  if (parent.xml[firstIndex].position === "selfclosing") {
    selfclosing = true;
    var lastChar = val[val.length - 1];
    if (lastChar === ">" && val[val.length - 2] === "/") {
      parent.xml[firstIndex].position = "start";
      parent.xml[firstIndex].value = parent.xml[firstIndex].value.substr(0, val.length - 2) + ">";
    }
    parent.index[1]++;
  }
  var length = child.xml.length;
  (_parent$xml = parent.xml).splice.apply(_parent$xml, [parent.index[1], 0].concat(_toConsumableArray(child.xml), _toConsumableArray(selfclosing ? [{
    value: "</".concat(tag, ">"),
    type: "tag",
    position: "end",
    tag: tag
  }] : [])));
  parent.index[1] += length;
  return parent;
}
function getIndent(indent) {
  var str = "";
  for (var i = 0, len = indent; i < len; i++) {
    str += "  ";
  }
  return str;
}
function xml2string(state) {
  var str = "";
  state = canonicalizeState(state);
  var indent = 0;
  if (state.index[0] === -1) {
    throw new Error("Invalid state");
  }
  for (var i = state.index[0]; i < state.index[1]; i++) {
    var part = state.xml[i];
    if (part.position === "end") {
      indent--;
    }
    str += getIndent(indent);
    if (part.type === "delimiter") {
      switch (part.position) {
        case "start":
          str += "{";
          break;
        case "end":
          str += "}";
          break;
      }
    } else if (part.module) {
      str += "[[".concat(part.module.toUpperCase(), ":").concat(part.value, "]]");
    } else {
      str += part.value;
    }
    str += "\n";
    if (part.position === "start") {
      indent++;
    }
  }
  return str;
}
module.exports = {
  getAttribute: getAttribute,
  findParent: findParent,
  findChilds: findChilds,
  xml2string: xml2string,
  create: create,
  appendChild: appendChild,
  firstChild: firstChild,
  firstDirectChild: firstDirectChild,
  firstDirectChildOrCreate: firstDirectChildOrCreate,
  findDirectChilds: findDirectChilds,
  getContent: getContent,
  dropChildren: dropChildren,
  dropSelf: dropSelf,
  selfClosing: selfClosing
};

/***/ }),

/***/ "./es6/tag.js":
/*!********************!*\
  !*** ./es6/tag.js ***!
  \********************/
/***/ ((module) => {

function isStartingTag(p, tag) {
  return ["start", "selfclosing"].indexOf(p.position) !== -1 && p.tag === tag;
}
function isEndingTag(p, tag) {
  return ["end"].indexOf(p.position) !== -1 && p.tag === tag;
}
module.exports = {
  isStartingTag: isStartingTag,
  isEndingTag: isEndingTag
};

/***/ }),

/***/ "./es6/templates.js":
/*!**************************!*\
  !*** ./es6/templates.js ***!
  \**************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
var utf8ToWord = (__webpack_require__(/*! docxtemplater */ "./node_modules/docxtemplater/js/docxtemplater.js").DocUtils.utf8ToWord);
var _require = __webpack_require__(/*! ./rotation-flip-utils.js */ "./es6/rotation-flip-utils.js"),
  getXML = _require.getXML;
function getPPr(props) {
  return "<w:pPr>\n\t\t\t\t".concat(props.align ? "<w:jc w:val=\"".concat(props.align, "\"/>") : "", "\n\t\t\t\t").concat(props.pStyle ? "<w:pStyle w:val=\"".concat(props.pStyle, "\"/>") : "", "\n\t\t\t</w:pPr>");
}
function docPrGenerator(docPrId, props) {
  var attrs = "id=\"".concat(docPrId, "\" name=\"").concat(utf8ToWord(props.name), "\" descr=\"").concat(utf8ToWord(props.alt), "\"");
  if (props.ridLink) {
    return "<wp:docPr ".concat(attrs, ">\n\t\t\t<a:hlinkClick xmlns:a=\"http://schemas.openxmlformats.org/drawingml/2006/main\" r:id=\"").concat(props.ridLink, "\"/>\n\t\t</wp:docPr>");
  }
  return "<wp:docPr ".concat(attrs, "/>");
}
function nvPrGenerator(docPrId, props) {
  var attrs = "id=\"".concat(docPrId, "\" name=\"").concat(utf8ToWord(props.name), "\" descr=\"").concat(utf8ToWord(props.alt), "\"");
  if (props.ridLink) {
    return "<p:cNvPr ".concat(attrs, ">\n\t\t\t<a:hlinkClick xmlns:a=\"http://schemas.openxmlformats.org/drawingml/2006/main\" tooltip=\"\" r:id=\"").concat(props.ridLink, "\"/>\n\t\t</p:cNvPr>");
  }
  return "<p:cNvPr ".concat(attrs, "/>");
}
module.exports = /*#__PURE__*/function () {
  function TemplateCreator() {
    _classCallCheck(this, TemplateCreator);
    this.captionNum = 1;
  }
  _createClass(TemplateCreator, [{
    key: "getImageSVGXmlCentered",
    value: function getImageSVGXmlCentered(rIdImg, rIdSvg, size, docPrId, props) {
      return "<w:p>\n\t\t\t".concat(getPPr(props), "\n\t\t\t").concat(props.runBefore, "\n\t\t\t<w:r>\n\t\t\t\t<w:rPr/>\n\t\t\t\t").concat(this.getImageSVGXml(rIdImg, rIdSvg, size, docPrId, props), "\n\t\t\t</w:r>\n\t\t\t</w:p>\n\t\t");
    }
  }, {
    key: "getImageSVGXml",
    value: function getImageSVGXml(rIdImg, rIdSvg, size, docPrId, props) {
      return "<w:drawing>\n\t\t  <wp:inline distT=\"0\" distB=\"0\" distL=\"0\" distR=\"0\">\n\t\t\t<wp:extent cx=\"".concat(size[0], "\" cy=\"").concat(size[1], "\"/>\n\t\t\t<wp:effectExtent l=\"0\" t=\"0\" r=\"0\" b=\"0\"/>\n\t\t\t").concat(docPrGenerator(docPrId, props), "\n\t\t\t<wp:cNvGraphicFramePr>\n\t\t\t  <a:graphicFrameLocks xmlns:a=\"http://schemas.openxmlformats.org/drawingml/2006/main\" noChangeAspect=\"1\"/>\n\t\t\t</wp:cNvGraphicFramePr>\n\t\t\t<a:graphic xmlns:a=\"http://schemas.openxmlformats.org/drawingml/2006/main\">\n\t\t\t  <a:graphicData uri=\"http://schemas.openxmlformats.org/drawingml/2006/picture\">\n\t\t\t\t<pic:pic xmlns:pic=\"http://schemas.openxmlformats.org/drawingml/2006/picture\">\n\t\t\t\t  <pic:nvPicPr>\n\t\t\t\t\t<pic:cNvPr id=\"1\" name=\"").concat(utf8ToWord(props.name), "\"/>\n\t\t\t\t\t<pic:cNvPicPr/>\n\t\t\t\t  </pic:nvPicPr>\n\t\t\t\t  <pic:blipFill>\n\t\t\t\t\t<a:blip r:embed=\"").concat(rIdImg, "\">\n\t\t\t\t\t  <a:extLst>\n\t\t\t\t\t\t<a:ext uri=\"{28A0092B-C50C-407E-A947-70E740481C1C}\">\n\t\t\t\t\t\t  <a14:useLocalDpi xmlns:a14=\"http://schemas.microsoft.com/office/drawing/2010/main\" val=\"0\"/>\n\t\t\t\t\t\t</a:ext>\n\t\t\t\t\t\t<a:ext uri=\"{96DAC541-7B7A-43D3-8B79-37D633B846F1}\">\n\t\t\t\t\t\t  <asvg:svgBlip xmlns:asvg=\"http://schemas.microsoft.com/office/drawing/2016/SVG/main\" r:embed=\"").concat(rIdSvg, "\"/>\n\t\t\t\t\t\t</a:ext>\n\t\t\t\t\t  </a:extLst>\n\t\t\t\t\t</a:blip>\n\t\t\t\t\t<a:stretch>\n\t\t\t\t\t  <a:fillRect/>\n\t\t\t\t\t</a:stretch>\n\t\t\t\t  </pic:blipFill>\n\t\t\t\t  <pic:spPr>\n\t\t\t\t\t<a:xfrm").concat(getXML(props), ">\n\t\t\t\t\t  <a:off x=\"0\" y=\"0\"/>\n\t\t\t\t\t  <a:ext cx=\"").concat(size[0], "\" cy=\"").concat(size[1], "\"/>\n\t\t\t\t\t</a:xfrm>\n\t\t\t\t\t<a:prstGeom prst=\"rect\">\n\t\t\t\t\t  <a:avLst/>\n\t\t\t\t\t</a:prstGeom>\n\t\t\t\t  </pic:spPr>\n\t\t\t\t</pic:pic>\n\t\t\t  </a:graphicData>\n\t\t\t</a:graphic>\n\t\t  </wp:inline>\n\t\t</w:drawing>").replace(/\t|\n/g, "");
    }
  }, {
    key: "getImageXmlWithCaption",
    value: function getImageXmlWithCaption(rId, size, docPrId, props) {
      var captionProps = props.caption;
      var height = captionProps.height;
      return "<w:drawing>\n\t\t\t<wp:inline distT=\"0\" distB=\"0\" distL=\"0\" distR=\"0\">\n\t\t\t\t<wp:extent cx=\"".concat(size[0], "\" cy=\"").concat(size[1] + height, "\"/>\n\t\t\t\t<wp:effectExtent l=\"0\" t=\"0\" r=\"0\" b=\"0\"/>\n\t\t\t\t").concat(docPrGenerator(docPrId, props), "\n\t\t\t\t<wp:cNvGraphicFramePr>\n\t\t\t\t\t<a:graphicFrameLocks xmlns:a=\"http://schemas.openxmlformats.org/drawingml/2006/main\" noChangeAspect=\"1\"/>\n\t\t\t\t</wp:cNvGraphicFramePr>\n\t\t\t\t<a:graphic xmlns:a=\"http://schemas.openxmlformats.org/drawingml/2006/main\">\n\t\t\t\t<a:graphicData uri=\"http://schemas.microsoft.com/office/word/2010/wordprocessingShape\">\n\t\t\t\t\t<wps:wsp xmlns:wps=\"http://schemas.microsoft.com/office/word/2010/wordprocessingShape\">\n\t\t\t\t\t<wps:cNvSpPr txBox=\"1\"/>\n\t\t\t\t\t<wps:spPr>\n\t\t\t\t\t\t<a:xfrm").concat(getXML(props), ">\n\t\t\t\t\t\t<a:off x=\"0\" y=\"0\"/>\n\t\t\t\t\t\t<a:ext cx=\"").concat(size[0], "\" cy=\"").concat(size[1] + height, "\"/>\n\t\t\t\t\t\t</a:xfrm>\n\t\t\t\t\t\t<a:prstGeom prst=\"rect\"/>\n\t\t\t\t\t</wps:spPr>\n\t\t\t\t\t<wps:txbx>\n\t\t\t\t\t\t<w:txbxContent>\n\t\t\t\t\t\t<w:p>\n\t\t\t\t\t\t\t").concat(getPPr(props), "\n\t\t\t\t\t\t\t<w:r>\n\t\t\t\t\t\t\t<w:rPr/>\n\t\t\t\t\t\t\t<w:drawing>\n\t\t\t\t\t\t\t\t<wp:inline distT=\"0\" distB=\"0\" distL=\"0\" distR=\"0\">\n\t\t\t\t\t\t\t\t<wp:extent cx=\"").concat(size[0], "\" cy=\"").concat(size[1], "\"/>\n\t\t\t\t\t\t\t\t<wp:effectExtent l=\"0\" t=\"0\" r=\"0\" b=\"0\"/>\n\t\t\t\t\t\t\t\t<wp:docPr id=\"").concat(docPrId + 1, "\" name=\"\" descr=\"\"/>\n\t\t\t\t\t\t\t\t<wp:cNvGraphicFramePr>\n\t\t\t\t\t\t\t\t\t<a:graphicFrameLocks xmlns:a=\"http://schemas.openxmlformats.org/drawingml/2006/main\" noChangeAspect=\"1\"/>\n\t\t\t\t\t\t\t\t</wp:cNvGraphicFramePr>\n\t\t\t\t\t\t\t\t<a:graphic xmlns:a=\"http://schemas.openxmlformats.org/drawingml/2006/main\">\n\t\t\t\t\t\t\t\t\t<a:graphicData uri=\"http://schemas.openxmlformats.org/drawingml/2006/picture\">\n\t\t\t\t\t\t\t\t\t<pic:pic xmlns:pic=\"http://schemas.openxmlformats.org/drawingml/2006/picture\">\n\t\t\t\t\t\t\t\t\t\t<pic:nvPicPr>\n\t\t\t\t\t\t\t\t\t\t<pic:cNvPr id=\"2\" name=\"\" descr=\"\"/>\n\t\t\t\t\t\t\t\t\t\t<pic:cNvPicPr>\n\t\t\t\t\t\t\t\t\t\t\t<a:picLocks noChangeAspect=\"1\" noChangeArrowheads=\"1\"/>\n\t\t\t\t\t\t\t\t\t\t</pic:cNvPicPr>\n\t\t\t\t\t\t\t\t\t\t</pic:nvPicPr>\n\t\t\t\t\t\t\t\t\t\t<pic:blipFill>\n\t\t\t\t\t\t\t\t\t\t<a:blip r:embed=\"").concat(rId, "\"/>\n\t\t\t\t\t\t\t\t\t\t<a:stretch>\n\t\t\t\t\t\t\t\t\t\t\t<a:fillRect/>\n\t\t\t\t\t\t\t\t\t\t</a:stretch>\n\t\t\t\t\t\t\t\t\t\t</pic:blipFill>\n\t\t\t\t\t\t\t\t\t\t<pic:spPr bwMode=\"auto\">\n\t\t\t\t\t\t\t\t\t\t<a:xfrm").concat(getXML(props), ">\n\t\t\t\t\t\t\t\t\t\t\t<a:off x=\"0\" y=\"0\"/>\n\t\t\t\t\t\t\t\t\t\t\t<a:ext cx=\"").concat(size[0], "\" cy=\"").concat(size[1], "\"/>\n\t\t\t\t\t\t\t\t\t\t</a:xfrm>\n\t\t\t\t\t\t\t\t\t\t<a:prstGeom prst=\"rect\">\n\t\t\t\t\t\t\t\t\t\t\t<a:avLst/>\n\t\t\t\t\t\t\t\t\t\t</a:prstGeom>\n\t\t\t\t\t\t\t\t\t\t</pic:spPr>\n\t\t\t\t\t\t\t\t\t</pic:pic>\n\t\t\t\t\t\t\t\t\t</a:graphicData>\n\t\t\t\t\t\t\t\t</a:graphic>\n\t\t\t\t\t\t\t\t</wp:inline>\n\t\t\t\t\t\t\t</w:drawing>\n\t\t\t\t\t\t\t</w:r>\n\t\t\t\t\t\t</w:p>\n\t\t\t\t\t\t<w:p>\n\t\t\t\t\t\t\t").concat(getPPr(captionProps), "\n\t\t\t\t\t\t\t").concat(this.getCaptionPrefix(captionProps), "\n\t\t\t\t\t\t\t<w:r>\n\t\t\t\t\t\t\t\t<w:t xml:space=\"preserve\">").concat(utf8ToWord(captionProps.text), "</w:t>\n\t\t\t\t\t\t\t</w:r>\n\t\t\t\t\t\t</w:p>\n\t\t\t\t\t\t</w:txbxContent>\n\t\t\t\t\t</wps:txbx>\n\t\t\t\t\t<wps:bodyPr anchor=\"t\" lIns=\"0\" tIns=\"0\" rIns=\"0\" bIns=\"0\">\n\t\t\t\t\t\t<a:noAutofit/>\n\t\t\t\t\t</wps:bodyPr>\n\t\t\t\t\t</wps:wsp>\n\t\t\t\t</a:graphicData>\n\t\t\t\t</a:graphic>\n\t\t\t</wp:inline>\n\t\t</w:drawing>");
    }
  }, {
    key: "getImageXml",
    value: function getImageXml(rId, size, docPrId, props) {
      if (props.caption) {
        return this.getImageXmlWithCaption(rId, size, docPrId, props);
      }
      return "<w:drawing>\n\t\t<wp:inline distT=\"0\" distB=\"0\" distL=\"0\" distR=\"0\">\n\t\t\t<wp:extent cx=\"".concat(size[0], "\" cy=\"").concat(size[1], "\"/>\n\t\t\t<wp:effectExtent l=\"0\" t=\"0\" r=\"0\" b=\"0\"/>\n\t\t\t").concat(docPrGenerator(docPrId, props), "\n\t\t\t<wp:cNvGraphicFramePr>\n\t\t\t\t<a:graphicFrameLocks xmlns:a=\"http://schemas.openxmlformats.org/drawingml/2006/main\" noChangeAspect=\"1\"/>\n\t\t\t</wp:cNvGraphicFramePr>\n\t\t\t<a:graphic xmlns:a=\"http://schemas.openxmlformats.org/drawingml/2006/main\">\n\t\t\t\t<a:graphicData uri=\"http://schemas.openxmlformats.org/drawingml/2006/picture\">\n\t\t\t\t\t<pic:pic xmlns:pic=\"http://schemas.openxmlformats.org/drawingml/2006/picture\">\n\t\t\t\t\t\t<pic:nvPicPr>\n\t\t\t\t\t\t\t<pic:cNvPr id=\"0\" name=\"\" descr=\"\"/>\n\t\t\t\t\t\t\t<pic:cNvPicPr>\n\t\t\t\t\t\t\t\t<a:picLocks noChangeAspect=\"1\" noChangeArrowheads=\"1\"/>\n\t\t\t\t\t\t\t</pic:cNvPicPr>\n\t\t\t\t\t\t</pic:nvPicPr>\n\t\t\t\t\t\t<pic:blipFill>\n\t\t\t\t\t\t\t<a:blip r:embed=\"").concat(rId, "\">\n\t\t\t\t\t\t\t\t<a:extLst>\n\t\t\t\t\t\t\t\t\t<a:ext uri=\"{28A0092B-C50C-407E-A947-70E740481C1C}\">\n\t\t\t\t\t\t\t\t\t\t<a14:useLocalDpi xmlns:a14=\"http://schemas.microsoft.com/office/drawing/2010/main\" val=\"0\"/>\n\t\t\t\t\t\t\t\t\t</a:ext>\n\t\t\t\t\t\t\t\t</a:extLst>\n\t\t\t\t\t\t\t</a:blip>\n\t\t\t\t\t\t\t<a:srcRect/>\n\t\t\t\t\t\t\t<a:stretch>\n\t\t\t\t\t\t\t\t<a:fillRect/>\n\t\t\t\t\t\t\t</a:stretch>\n\t\t\t\t\t\t</pic:blipFill>\n\t\t\t\t\t\t<pic:spPr bwMode=\"auto\">\n\t\t\t\t\t\t\t<a:xfrm").concat(getXML(props), ">\n\t\t\t\t\t\t\t\t<a:off x=\"0\" y=\"0\"/>\n\t\t\t\t\t\t\t\t<a:ext cx=\"").concat(size[0], "\" cy=\"").concat(size[1], "\"/>\n\t\t\t\t\t\t\t</a:xfrm>\n\t\t\t\t\t\t\t<a:prstGeom prst=\"rect\">\n\t\t\t\t\t\t\t\t<a:avLst/>\n\t\t\t\t\t\t\t</a:prstGeom>\n\t\t\t\t\t\t\t<a:noFill/>\n\t\t\t\t\t\t\t<a:ln>\n\t\t\t\t\t\t\t\t<a:noFill/>\n\t\t\t\t\t\t\t</a:ln>\n\t\t\t\t\t\t</pic:spPr>\n\t\t\t\t\t</pic:pic>\n\t\t\t\t</a:graphicData>\n\t\t\t</a:graphic>\n\t\t</wp:inline>\n\t</w:drawing>\n\t\t").replace(/\t|\n/g, "");
    }
  }, {
    key: "getCaptionPrefix",
    value: function getCaptionPrefix(captionProps) {
      var _this = this;
      return (captionProps.prefix || []).map(function (part) {
        if (typeof part === "string") {
          if (part === "") {
            return "";
          }
          return "<w:r><w:t xml:space=\"preserve\">".concat(utf8ToWord(part), "</w:t></w:r>");
        }
        if (typeof part.seq === "string") {
          return "<w:r>\n\t\t\t\t\t<w:fldChar w:fldCharType=\"begin\"/>\n\t\t\t\t\t</w:r>\n\t\t\t\t\t<w:r>\n\t\t\t\t\t<w:instrText xml:space=\"preserve\">".concat(part.seq, "</w:instrText>\n\t\t\t\t\t</w:r>\n\t\t\t\t\t<w:r>\n\t\t\t\t\t<w:fldChar w:fldCharType=\"separate\"/>\n\t\t\t\t\t</w:r>\n\t\t\t\t\t<w:r>\n\t\t\t\t\t<w:rPr>\n\t\t\t\t\t<w:noProof/>\n\t\t\t\t\t</w:rPr>\n\t\t\t\t\t<w:t>").concat(_this.captionNum++, "</w:t>\n\t\t\t\t\t</w:r>\n\t\t\t\t\t<w:r>\n\t\t\t\t\t<w:fldChar w:fldCharType=\"end\"/>\n\t\t\t\t\t</w:r>");
        }
      }).join("");
    }
  }, {
    key: "getImageXmlCentered",
    value: function getImageXmlCentered(rId, size, docPrId, props) {
      var caption = "";
      if (props.caption) {
        var captionProps = props.caption;
        caption = "<w:p>\n\t\t\t".concat(getPPr(captionProps), "\n\t\t\t").concat(this.getCaptionPrefix(captionProps), "\n\t\t\t<w:r>\n\t\t\t<w:t xml:space=\"preserve\">").concat(utf8ToWord(captionProps.text), "</w:t>\n\t\t\t</w:r>\n\t\t\t</w:p>");
      }
      return "<w:p>\n\t\t\t".concat(getPPr(props), "\n\t\t\t").concat(props.runBefore, "\n\t\t\t<w:r>\n\t\t\t\t<w:rPr/>\n\t\t\t\t<w:drawing>\n\t\t\t\t\t<wp:inline distT=\"0\" distB=\"0\" distL=\"0\" distR=\"0\">\n\t\t\t\t\t<wp:extent cx=\"").concat(size[0], "\" cy=\"").concat(size[1], "\"/>\n\t\t\t\t\t").concat(docPrGenerator(docPrId, props), "\n\t\t\t\t\t<wp:cNvGraphicFramePr>\n\t\t\t\t\t\t<a:graphicFrameLocks xmlns:a=\"http://schemas.openxmlformats.org/drawingml/2006/main\" noChangeAspect=\"1\"/>\n\t\t\t\t\t</wp:cNvGraphicFramePr>\n\t\t\t\t\t<a:graphic xmlns:a=\"http://schemas.openxmlformats.org/drawingml/2006/main\">\n\t\t\t\t\t\t<a:graphicData uri=\"http://schemas.openxmlformats.org/drawingml/2006/picture\">\n\t\t\t\t\t\t<pic:pic xmlns:pic=\"http://schemas.openxmlformats.org/drawingml/2006/picture\">\n\t\t\t\t\t\t\t<pic:nvPicPr>\n\t\t\t\t\t\t\t<pic:cNvPr id=\"0\" name=\"\" descr=\"\"/>\n\t\t\t\t\t\t\t<pic:cNvPicPr>\n\t\t\t\t\t\t\t\t<a:picLocks noChangeAspect=\"1\" noChangeArrowheads=\"1\"/>\n\t\t\t\t\t\t\t</pic:cNvPicPr>\n\t\t\t\t\t\t\t</pic:nvPicPr>\n\t\t\t\t\t\t\t<pic:blipFill>\n\t\t\t\t\t\t\t<a:blip r:embed=\"").concat(rId, "\"/>\n\t\t\t\t\t\t\t<a:stretch>\n\t\t\t\t\t\t\t\t<a:fillRect/>\n\t\t\t\t\t\t\t</a:stretch>\n\t\t\t\t\t\t\t</pic:blipFill>\n\t\t\t\t\t\t\t<pic:spPr bwMode=\"auto\">\n\t\t\t\t\t\t\t<a:xfrm").concat(getXML(props), ">\n\t\t\t\t\t\t\t\t<a:off x=\"0\" y=\"0\"/>\n\t\t\t\t\t\t\t\t<a:ext cx=\"").concat(size[0], "\" cy=\"").concat(size[1], "\"/>\n\t\t\t\t\t\t\t</a:xfrm>\n\t\t\t\t\t\t\t<a:prstGeom prst=\"rect\">\n\t\t\t\t\t\t\t\t<a:avLst/>\n\t\t\t\t\t\t\t</a:prstGeom>\n\t\t\t\t\t\t\t<a:noFill/>\n\t\t\t\t\t\t\t<a:ln w=\"9525\">\n\t\t\t\t\t\t\t\t<a:noFill/>\n\t\t\t\t\t\t\t\t<a:miter lim=\"800000\"/>\n\t\t\t\t\t\t\t\t<a:headEnd/>\n\t\t\t\t\t\t\t\t<a:tailEnd/>\n\t\t\t\t\t\t\t</a:ln>\n\t\t\t\t\t\t\t</pic:spPr>\n\t\t\t\t\t\t</pic:pic>\n\t\t\t\t\t\t</a:graphicData>\n\t\t\t\t\t</a:graphic>\n\t\t\t\t\t</wp:inline>\n\t\t\t\t</w:drawing>\n\t\t\t</w:r>\n\t\t</w:p>\n\t\t").concat(caption, "\n\t\t").replace(/\t|\n/g, "");
    }
  }, {
    key: "getPptxImageXml",
    value: function getPptxImageXml(rId, size, offset, props) {
      return "<p:pic>\n\t\t\t<p:nvPicPr>\n\t\t\t\t".concat(nvPrGenerator(6, props), "\n\t\t\t\t<p:cNvPicPr>\n\t\t\t\t\t<a:picLocks noChangeAspect=\"1\" noChangeArrowheads=\"1\"/>\n\t\t\t\t</p:cNvPicPr>\n\t\t\t\t<p:nvPr/>\n\t\t\t</p:nvPicPr>\n\t\t\t<p:blipFill>\n\t\t\t\t<a:blip r:embed=\"").concat(rId, "\" cstate=\"print\">\n\t\t\t\t\t<a:extLst>\n\t\t\t\t\t\t<a:ext uri=\"{28A0092B-C50C-407E-A947-70E740481C1C}\">\n\t\t\t\t\t\t\t<a14:useLocalDpi xmlns:a14=\"http://schemas.microsoft.com/office/drawing/2010/main\" val=\"0\"/>\n\t\t\t\t\t\t</a:ext>\n\t\t\t\t\t</a:extLst>\n\t\t\t\t</a:blip>\n\t\t\t\t<a:srcRect/>\n\t\t\t\t<a:stretch>\n\t\t\t\t\t<a:fillRect/>\n\t\t\t\t</a:stretch>\n\t\t\t</p:blipFill>\n\t\t\t<p:spPr bwMode=\"auto\">\n\t\t\t\t<a:xfrm").concat(getXML(props), ">\n\t\t\t\t\t<a:off x=\"").concat(offset.x, "\" y=\"").concat(offset.y, "\"/>\n\t\t\t\t\t<a:ext cx=\"").concat(size[0], "\" cy=\"").concat(size[1], "\"/>\n\t\t\t\t</a:xfrm>\n\t\t\t\t<a:prstGeom prst=\"rect\">\n\t\t\t\t\t<a:avLst/>\n\t\t\t\t</a:prstGeom>\n\t\t\t\t<a:noFill/>\n\t\t\t\t<a:ln>\n\t\t\t\t\t<a:noFill/>\n\t\t\t\t</a:ln>\n\t\t\t\t<a:effectLst/>\n\t\t\t\t<a:extLst>\n\t\t\t\t\t<a:ext uri=\"{909E8E84-426E-40DD-AFC4-6F175D3DCCD1}\">\n\t\t\t\t\t\t<a14:hiddenFill xmlns:a14=\"http://schemas.microsoft.com/office/drawing/2010/main\">\n\t\t\t\t\t\t\t<a:solidFill>\n\t\t\t\t\t\t\t\t<a:schemeClr val=\"accent1\"/>\n\t\t\t\t\t\t\t</a:solidFill>\n\t\t\t\t\t\t</a14:hiddenFill>\n\t\t\t\t\t</a:ext>\n\t\t\t\t\t<a:ext uri=\"{91240B29-F687-4F45-9708-019B960494DF}\">\n\t\t\t\t\t\t<a14:hiddenLine xmlns:a14=\"http://schemas.microsoft.com/office/drawing/2010/main\" w=\"9525\">\n\t\t\t\t\t\t\t<a:solidFill>\n\t\t\t\t\t\t\t\t<a:schemeClr val=\"tx1\"/>\n\t\t\t\t\t\t\t</a:solidFill>\n\t\t\t\t\t\t\t<a:miter lim=\"800000\"/>\n\t\t\t\t\t\t\t<a:headEnd/>\n\t\t\t\t\t\t\t<a:tailEnd/>\n\t\t\t\t\t\t</a14:hiddenLine>\n\t\t\t\t\t</a:ext>\n\t\t\t\t\t<a:ext uri=\"{AF507438-7753-43E0-B8FC-AC1667EBCBE1}\">\n\t\t\t\t\t\t<a14:hiddenEffects xmlns:a14=\"http://schemas.microsoft.com/office/drawing/2010/main\">\n\t\t\t\t\t\t\t<a:effectLst>\n\t\t\t\t\t\t\t\t<a:outerShdw dist=\"35921\" dir=\"2700000\" algn=\"ctr\" rotWithShape=\"0\">\n\t\t\t\t\t\t\t\t\t<a:schemeClr val=\"bg2\"/>\n\t\t\t\t\t\t\t\t</a:outerShdw>\n\t\t\t\t\t\t\t</a:effectLst>\n\t\t\t\t\t\t</a14:hiddenEffects>\n\t\t\t\t\t</a:ext>\n\t\t\t\t</a:extLst>\n\t\t\t</p:spPr>\n\t\t</p:pic>\n\t\t").replace(/\t|\n/g, "");
    }
  }]);
  return TemplateCreator;
}();

/***/ }),

/***/ "./es6/type-conditions.js":
/*!********************************!*\
  !*** ./es6/type-conditions.js ***!
  \********************************/
/***/ ((module) => {

/* eslint-disable no-self-compare */
function isNaN(number) {
  return !(number === number);
}
/* eslint-enable no-self-compare */

function isFloat(input) {
  return typeof input === "number";
}
function isPositive(number) {
  return number > 0;
}
module.exports = {
  isNaN: isNaN,
  isFloat: isFloat,
  isPositive: isPositive
};

/***/ }),

/***/ "./node_modules/base64-js/index.js":
/*!*****************************************!*\
  !*** ./node_modules/base64-js/index.js ***!
  \*****************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";


exports.byteLength = byteLength
exports.toByteArray = toByteArray
exports.fromByteArray = fromByteArray

var lookup = []
var revLookup = []
var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array

var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
for (var i = 0, len = code.length; i < len; ++i) {
  lookup[i] = code[i]
  revLookup[code.charCodeAt(i)] = i
}

// Support decoding URL-safe base64 strings, as Node.js does.
// See: https://en.wikipedia.org/wiki/Base64#URL_applications
revLookup['-'.charCodeAt(0)] = 62
revLookup['_'.charCodeAt(0)] = 63

function getLens (b64) {
  var len = b64.length

  if (len % 4 > 0) {
    throw new Error('Invalid string. Length must be a multiple of 4')
  }

  // Trim off extra bytes after placeholder bytes are found
  // See: https://github.com/beatgammit/base64-js/issues/42
  var validLen = b64.indexOf('=')
  if (validLen === -1) validLen = len

  var placeHoldersLen = validLen === len
    ? 0
    : 4 - (validLen % 4)

  return [validLen, placeHoldersLen]
}

// base64 is 4/3 + up to two characters of the original data
function byteLength (b64) {
  var lens = getLens(b64)
  var validLen = lens[0]
  var placeHoldersLen = lens[1]
  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
}

function _byteLength (b64, validLen, placeHoldersLen) {
  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
}

function toByteArray (b64) {
  var tmp
  var lens = getLens(b64)
  var validLen = lens[0]
  var placeHoldersLen = lens[1]

  var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen))

  var curByte = 0

  // if there are placeholders, only get up to the last complete 4 chars
  var len = placeHoldersLen > 0
    ? validLen - 4
    : validLen

  var i
  for (i = 0; i < len; i += 4) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 18) |
      (revLookup[b64.charCodeAt(i + 1)] << 12) |
      (revLookup[b64.charCodeAt(i + 2)] << 6) |
      revLookup[b64.charCodeAt(i + 3)]
    arr[curByte++] = (tmp >> 16) & 0xFF
    arr[curByte++] = (tmp >> 8) & 0xFF
    arr[curByte++] = tmp & 0xFF
  }

  if (placeHoldersLen === 2) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 2) |
      (revLookup[b64.charCodeAt(i + 1)] >> 4)
    arr[curByte++] = tmp & 0xFF
  }

  if (placeHoldersLen === 1) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 10) |
      (revLookup[b64.charCodeAt(i + 1)] << 4) |
      (revLookup[b64.charCodeAt(i + 2)] >> 2)
    arr[curByte++] = (tmp >> 8) & 0xFF
    arr[curByte++] = tmp & 0xFF
  }

  return arr
}

function tripletToBase64 (num) {
  return lookup[num >> 18 & 0x3F] +
    lookup[num >> 12 & 0x3F] +
    lookup[num >> 6 & 0x3F] +
    lookup[num & 0x3F]
}

function encodeChunk (uint8, start, end) {
  var tmp
  var output = []
  for (var i = start; i < end; i += 3) {
    tmp =
      ((uint8[i] << 16) & 0xFF0000) +
      ((uint8[i + 1] << 8) & 0xFF00) +
      (uint8[i + 2] & 0xFF)
    output.push(tripletToBase64(tmp))
  }
  return output.join('')
}

function fromByteArray (uint8) {
  var tmp
  var len = uint8.length
  var extraBytes = len % 3 // if we have 1 byte left, pad 2 bytes
  var parts = []
  var maxChunkLength = 16383 // must be multiple of 3

  // go through the array every three bytes, we'll deal with trailing stuff later
  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
    parts.push(encodeChunk(uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)))
  }

  // pad the end with zeros, but make sure to not forget the extra bytes
  if (extraBytes === 1) {
    tmp = uint8[len - 1]
    parts.push(
      lookup[tmp >> 2] +
      lookup[(tmp << 4) & 0x3F] +
      '=='
    )
  } else if (extraBytes === 2) {
    tmp = (uint8[len - 2] << 8) + uint8[len - 1]
    parts.push(
      lookup[tmp >> 10] +
      lookup[(tmp >> 4) & 0x3F] +
      lookup[(tmp << 2) & 0x3F] +
      '='
    )
  }

  return parts.join('')
}


/***/ }),

/***/ "./node_modules/buffer/index.js":
/*!**************************************!*\
  !*** ./node_modules/buffer/index.js ***!
  \**************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */
/* eslint-disable no-proto */



const base64 = __webpack_require__(/*! base64-js */ "./node_modules/base64-js/index.js")
const ieee754 = __webpack_require__(/*! ieee754 */ "./node_modules/ieee754/index.js")
const customInspectSymbol =
  (typeof Symbol === 'function' && typeof Symbol['for'] === 'function') // eslint-disable-line dot-notation
    ? Symbol['for']('nodejs.util.inspect.custom') // eslint-disable-line dot-notation
    : null

exports.Buffer = Buffer
exports.SlowBuffer = SlowBuffer
exports.INSPECT_MAX_BYTES = 50

const K_MAX_LENGTH = 0x7fffffff
exports.kMaxLength = K_MAX_LENGTH

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Print warning and recommend using `buffer` v4.x which has an Object
 *               implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * We report that the browser does not support typed arrays if the are not subclassable
 * using __proto__. Firefox 4-29 lacks support for adding new properties to `Uint8Array`
 * (See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438). IE 10 lacks support
 * for __proto__ and has a buggy typed array implementation.
 */
Buffer.TYPED_ARRAY_SUPPORT = typedArraySupport()

if (!Buffer.TYPED_ARRAY_SUPPORT && typeof console !== 'undefined' &&
    typeof console.error === 'function') {
  console.error(
    'This browser lacks typed array (Uint8Array) support which is required by ' +
    '`buffer` v5.x. Use `buffer` v4.x if you require old browser support.'
  )
}

function typedArraySupport () {
  // Can typed array instances can be augmented?
  try {
    const arr = new Uint8Array(1)
    const proto = { foo: function () { return 42 } }
    Object.setPrototypeOf(proto, Uint8Array.prototype)
    Object.setPrototypeOf(arr, proto)
    return arr.foo() === 42
  } catch (e) {
    return false
  }
}

Object.defineProperty(Buffer.prototype, 'parent', {
  enumerable: true,
  get: function () {
    if (!Buffer.isBuffer(this)) return undefined
    return this.buffer
  }
})

Object.defineProperty(Buffer.prototype, 'offset', {
  enumerable: true,
  get: function () {
    if (!Buffer.isBuffer(this)) return undefined
    return this.byteOffset
  }
})

function createBuffer (length) {
  if (length > K_MAX_LENGTH) {
    throw new RangeError('The value "' + length + '" is invalid for option "size"')
  }
  // Return an augmented `Uint8Array` instance
  const buf = new Uint8Array(length)
  Object.setPrototypeOf(buf, Buffer.prototype)
  return buf
}

/**
 * The Buffer constructor returns instances of `Uint8Array` that have their
 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
 * returns a single octet.
 *
 * The `Uint8Array` prototype remains unmodified.
 */

function Buffer (arg, encodingOrOffset, length) {
  // Common case.
  if (typeof arg === 'number') {
    if (typeof encodingOrOffset === 'string') {
      throw new TypeError(
        'The "string" argument must be of type string. Received type number'
      )
    }
    return allocUnsafe(arg)
  }
  return from(arg, encodingOrOffset, length)
}

Buffer.poolSize = 8192 // not used by this implementation

function from (value, encodingOrOffset, length) {
  if (typeof value === 'string') {
    return fromString(value, encodingOrOffset)
  }

  if (ArrayBuffer.isView(value)) {
    return fromArrayView(value)
  }

  if (value == null) {
    throw new TypeError(
      'The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' +
      'or Array-like Object. Received type ' + (typeof value)
    )
  }

  if (isInstance(value, ArrayBuffer) ||
      (value && isInstance(value.buffer, ArrayBuffer))) {
    return fromArrayBuffer(value, encodingOrOffset, length)
  }

  if (typeof SharedArrayBuffer !== 'undefined' &&
      (isInstance(value, SharedArrayBuffer) ||
      (value && isInstance(value.buffer, SharedArrayBuffer)))) {
    return fromArrayBuffer(value, encodingOrOffset, length)
  }

  if (typeof value === 'number') {
    throw new TypeError(
      'The "value" argument must not be of type number. Received type number'
    )
  }

  const valueOf = value.valueOf && value.valueOf()
  if (valueOf != null && valueOf !== value) {
    return Buffer.from(valueOf, encodingOrOffset, length)
  }

  const b = fromObject(value)
  if (b) return b

  if (typeof Symbol !== 'undefined' && Symbol.toPrimitive != null &&
      typeof value[Symbol.toPrimitive] === 'function') {
    return Buffer.from(value[Symbol.toPrimitive]('string'), encodingOrOffset, length)
  }

  throw new TypeError(
    'The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' +
    'or Array-like Object. Received type ' + (typeof value)
  )
}

/**
 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
 * if value is a number.
 * Buffer.from(str[, encoding])
 * Buffer.from(array)
 * Buffer.from(buffer)
 * Buffer.from(arrayBuffer[, byteOffset[, length]])
 **/
Buffer.from = function (value, encodingOrOffset, length) {
  return from(value, encodingOrOffset, length)
}

// Note: Change prototype *after* Buffer.from is defined to workaround Chrome bug:
// https://github.com/feross/buffer/pull/148
Object.setPrototypeOf(Buffer.prototype, Uint8Array.prototype)
Object.setPrototypeOf(Buffer, Uint8Array)

function assertSize (size) {
  if (typeof size !== 'number') {
    throw new TypeError('"size" argument must be of type number')
  } else if (size < 0) {
    throw new RangeError('The value "' + size + '" is invalid for option "size"')
  }
}

function alloc (size, fill, encoding) {
  assertSize(size)
  if (size <= 0) {
    return createBuffer(size)
  }
  if (fill !== undefined) {
    // Only pay attention to encoding if it's a string. This
    // prevents accidentally sending in a number that would
    // be interpreted as a start offset.
    return typeof encoding === 'string'
      ? createBuffer(size).fill(fill, encoding)
      : createBuffer(size).fill(fill)
  }
  return createBuffer(size)
}

/**
 * Creates a new filled Buffer instance.
 * alloc(size[, fill[, encoding]])
 **/
Buffer.alloc = function (size, fill, encoding) {
  return alloc(size, fill, encoding)
}

function allocUnsafe (size) {
  assertSize(size)
  return createBuffer(size < 0 ? 0 : checked(size) | 0)
}

/**
 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
 * */
Buffer.allocUnsafe = function (size) {
  return allocUnsafe(size)
}
/**
 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
 */
Buffer.allocUnsafeSlow = function (size) {
  return allocUnsafe(size)
}

function fromString (string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') {
    encoding = 'utf8'
  }

  if (!Buffer.isEncoding(encoding)) {
    throw new TypeError('Unknown encoding: ' + encoding)
  }

  const length = byteLength(string, encoding) | 0
  let buf = createBuffer(length)

  const actual = buf.write(string, encoding)

  if (actual !== length) {
    // Writing a hex string, for example, that contains invalid characters will
    // cause everything after the first invalid character to be ignored. (e.g.
    // 'abxxcd' will be treated as 'ab')
    buf = buf.slice(0, actual)
  }

  return buf
}

function fromArrayLike (array) {
  const length = array.length < 0 ? 0 : checked(array.length) | 0
  const buf = createBuffer(length)
  for (let i = 0; i < length; i += 1) {
    buf[i] = array[i] & 255
  }
  return buf
}

function fromArrayView (arrayView) {
  if (isInstance(arrayView, Uint8Array)) {
    const copy = new Uint8Array(arrayView)
    return fromArrayBuffer(copy.buffer, copy.byteOffset, copy.byteLength)
  }
  return fromArrayLike(arrayView)
}

function fromArrayBuffer (array, byteOffset, length) {
  if (byteOffset < 0 || array.byteLength < byteOffset) {
    throw new RangeError('"offset" is outside of buffer bounds')
  }

  if (array.byteLength < byteOffset + (length || 0)) {
    throw new RangeError('"length" is outside of buffer bounds')
  }

  let buf
  if (byteOffset === undefined && length === undefined) {
    buf = new Uint8Array(array)
  } else if (length === undefined) {
    buf = new Uint8Array(array, byteOffset)
  } else {
    buf = new Uint8Array(array, byteOffset, length)
  }

  // Return an augmented `Uint8Array` instance
  Object.setPrototypeOf(buf, Buffer.prototype)

  return buf
}

function fromObject (obj) {
  if (Buffer.isBuffer(obj)) {
    const len = checked(obj.length) | 0
    const buf = createBuffer(len)

    if (buf.length === 0) {
      return buf
    }

    obj.copy(buf, 0, 0, len)
    return buf
  }

  if (obj.length !== undefined) {
    if (typeof obj.length !== 'number' || numberIsNaN(obj.length)) {
      return createBuffer(0)
    }
    return fromArrayLike(obj)
  }

  if (obj.type === 'Buffer' && Array.isArray(obj.data)) {
    return fromArrayLike(obj.data)
  }
}

function checked (length) {
  // Note: cannot use `length < K_MAX_LENGTH` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= K_MAX_LENGTH) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                         'size: 0x' + K_MAX_LENGTH.toString(16) + ' bytes')
  }
  return length | 0
}

function SlowBuffer (length) {
  if (+length != length) { // eslint-disable-line eqeqeq
    length = 0
  }
  return Buffer.alloc(+length)
}

Buffer.isBuffer = function isBuffer (b) {
  return b != null && b._isBuffer === true &&
    b !== Buffer.prototype // so Buffer.isBuffer(Buffer.prototype) will be false
}

Buffer.compare = function compare (a, b) {
  if (isInstance(a, Uint8Array)) a = Buffer.from(a, a.offset, a.byteLength)
  if (isInstance(b, Uint8Array)) b = Buffer.from(b, b.offset, b.byteLength)
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
    throw new TypeError(
      'The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array'
    )
  }

  if (a === b) return 0

  let x = a.length
  let y = b.length

  for (let i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i]
      y = b[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function isEncoding (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'latin1':
    case 'binary':
    case 'base64':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function concat (list, length) {
  if (!Array.isArray(list)) {
    throw new TypeError('"list" argument must be an Array of Buffers')
  }

  if (list.length === 0) {
    return Buffer.alloc(0)
  }

  let i
  if (length === undefined) {
    length = 0
    for (i = 0; i < list.length; ++i) {
      length += list[i].length
    }
  }

  const buffer = Buffer.allocUnsafe(length)
  let pos = 0
  for (i = 0; i < list.length; ++i) {
    let buf = list[i]
    if (isInstance(buf, Uint8Array)) {
      if (pos + buf.length > buffer.length) {
        if (!Buffer.isBuffer(buf)) buf = Buffer.from(buf)
        buf.copy(buffer, pos)
      } else {
        Uint8Array.prototype.set.call(
          buffer,
          buf,
          pos
        )
      }
    } else if (!Buffer.isBuffer(buf)) {
      throw new TypeError('"list" argument must be an Array of Buffers')
    } else {
      buf.copy(buffer, pos)
    }
    pos += buf.length
  }
  return buffer
}

function byteLength (string, encoding) {
  if (Buffer.isBuffer(string)) {
    return string.length
  }
  if (ArrayBuffer.isView(string) || isInstance(string, ArrayBuffer)) {
    return string.byteLength
  }
  if (typeof string !== 'string') {
    throw new TypeError(
      'The "string" argument must be one of type string, Buffer, or ArrayBuffer. ' +
      'Received type ' + typeof string
    )
  }

  const len = string.length
  const mustMatch = (arguments.length > 2 && arguments[2] === true)
  if (!mustMatch && len === 0) return 0

  // Use a for loop to avoid recursion
  let loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'ascii':
      case 'latin1':
      case 'binary':
        return len
      case 'utf8':
      case 'utf-8':
        return utf8ToBytes(string).length
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return len * 2
      case 'hex':
        return len >>> 1
      case 'base64':
        return base64ToBytes(string).length
      default:
        if (loweredCase) {
          return mustMatch ? -1 : utf8ToBytes(string).length // assume utf8
        }
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}
Buffer.byteLength = byteLength

function slowToString (encoding, start, end) {
  let loweredCase = false

  // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
  // property of a typed array.

  // This behaves neither like String nor Uint8Array in that we set start/end
  // to their upper/lower bounds if the value passed is out of range.
  // undefined is handled specially as per ECMA-262 6th Edition,
  // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
  if (start === undefined || start < 0) {
    start = 0
  }
  // Return early if start > this.length. Done here to prevent potential uint32
  // coercion fail below.
  if (start > this.length) {
    return ''
  }

  if (end === undefined || end > this.length) {
    end = this.length
  }

  if (end <= 0) {
    return ''
  }

  // Force coercion to uint32. This will also coerce falsey/NaN values to 0.
  end >>>= 0
  start >>>= 0

  if (end <= start) {
    return ''
  }

  if (!encoding) encoding = 'utf8'

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'latin1':
      case 'binary':
        return latin1Slice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

// This property is used by `Buffer.isBuffer` (and the `is-buffer` npm package)
// to detect a Buffer instance. It's not possible to use `instanceof Buffer`
// reliably in a browserify context because there could be multiple different
// copies of the 'buffer' package in use. This method works even for Buffer
// instances that were created from another copy of the `buffer` package.
// See: https://github.com/feross/buffer/issues/154
Buffer.prototype._isBuffer = true

function swap (b, n, m) {
  const i = b[n]
  b[n] = b[m]
  b[m] = i
}

Buffer.prototype.swap16 = function swap16 () {
  const len = this.length
  if (len % 2 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 16-bits')
  }
  for (let i = 0; i < len; i += 2) {
    swap(this, i, i + 1)
  }
  return this
}

Buffer.prototype.swap32 = function swap32 () {
  const len = this.length
  if (len % 4 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 32-bits')
  }
  for (let i = 0; i < len; i += 4) {
    swap(this, i, i + 3)
    swap(this, i + 1, i + 2)
  }
  return this
}

Buffer.prototype.swap64 = function swap64 () {
  const len = this.length
  if (len % 8 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 64-bits')
  }
  for (let i = 0; i < len; i += 8) {
    swap(this, i, i + 7)
    swap(this, i + 1, i + 6)
    swap(this, i + 2, i + 5)
    swap(this, i + 3, i + 4)
  }
  return this
}

Buffer.prototype.toString = function toString () {
  const length = this.length
  if (length === 0) return ''
  if (arguments.length === 0) return utf8Slice(this, 0, length)
  return slowToString.apply(this, arguments)
}

Buffer.prototype.toLocaleString = Buffer.prototype.toString

Buffer.prototype.equals = function equals (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return true
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function inspect () {
  let str = ''
  const max = exports.INSPECT_MAX_BYTES
  str = this.toString('hex', 0, max).replace(/(.{2})/g, '$1 ').trim()
  if (this.length > max) str += ' ... '
  return '<Buffer ' + str + '>'
}
if (customInspectSymbol) {
  Buffer.prototype[customInspectSymbol] = Buffer.prototype.inspect
}

Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
  if (isInstance(target, Uint8Array)) {
    target = Buffer.from(target, target.offset, target.byteLength)
  }
  if (!Buffer.isBuffer(target)) {
    throw new TypeError(
      'The "target" argument must be one of type Buffer or Uint8Array. ' +
      'Received type ' + (typeof target)
    )
  }

  if (start === undefined) {
    start = 0
  }
  if (end === undefined) {
    end = target ? target.length : 0
  }
  if (thisStart === undefined) {
    thisStart = 0
  }
  if (thisEnd === undefined) {
    thisEnd = this.length
  }

  if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
    throw new RangeError('out of range index')
  }

  if (thisStart >= thisEnd && start >= end) {
    return 0
  }
  if (thisStart >= thisEnd) {
    return -1
  }
  if (start >= end) {
    return 1
  }

  start >>>= 0
  end >>>= 0
  thisStart >>>= 0
  thisEnd >>>= 0

  if (this === target) return 0

  let x = thisEnd - thisStart
  let y = end - start
  const len = Math.min(x, y)

  const thisCopy = this.slice(thisStart, thisEnd)
  const targetCopy = target.slice(start, end)

  for (let i = 0; i < len; ++i) {
    if (thisCopy[i] !== targetCopy[i]) {
      x = thisCopy[i]
      y = targetCopy[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

// Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
// OR the last index of `val` in `buffer` at offset <= `byteOffset`.
//
// Arguments:
// - buffer - a Buffer to search
// - val - a string, Buffer, or number
// - byteOffset - an index into `buffer`; will be clamped to an int32
// - encoding - an optional encoding, relevant is val is a string
// - dir - true for indexOf, false for lastIndexOf
function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
  // Empty buffer means no match
  if (buffer.length === 0) return -1

  // Normalize byteOffset
  if (typeof byteOffset === 'string') {
    encoding = byteOffset
    byteOffset = 0
  } else if (byteOffset > 0x7fffffff) {
    byteOffset = 0x7fffffff
  } else if (byteOffset < -0x80000000) {
    byteOffset = -0x80000000
  }
  byteOffset = +byteOffset // Coerce to Number.
  if (numberIsNaN(byteOffset)) {
    // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
    byteOffset = dir ? 0 : (buffer.length - 1)
  }

  // Normalize byteOffset: negative offsets start from the end of the buffer
  if (byteOffset < 0) byteOffset = buffer.length + byteOffset
  if (byteOffset >= buffer.length) {
    if (dir) return -1
    else byteOffset = buffer.length - 1
  } else if (byteOffset < 0) {
    if (dir) byteOffset = 0
    else return -1
  }

  // Normalize val
  if (typeof val === 'string') {
    val = Buffer.from(val, encoding)
  }

  // Finally, search either indexOf (if dir is true) or lastIndexOf
  if (Buffer.isBuffer(val)) {
    // Special case: looking for empty string/buffer always fails
    if (val.length === 0) {
      return -1
    }
    return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
  } else if (typeof val === 'number') {
    val = val & 0xFF // Search for a byte value [0-255]
    if (typeof Uint8Array.prototype.indexOf === 'function') {
      if (dir) {
        return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
      } else {
        return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
      }
    }
    return arrayIndexOf(buffer, [val], byteOffset, encoding, dir)
  }

  throw new TypeError('val must be string, number or Buffer')
}

function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
  let indexSize = 1
  let arrLength = arr.length
  let valLength = val.length

  if (encoding !== undefined) {
    encoding = String(encoding).toLowerCase()
    if (encoding === 'ucs2' || encoding === 'ucs-2' ||
        encoding === 'utf16le' || encoding === 'utf-16le') {
      if (arr.length < 2 || val.length < 2) {
        return -1
      }
      indexSize = 2
      arrLength /= 2
      valLength /= 2
      byteOffset /= 2
    }
  }

  function read (buf, i) {
    if (indexSize === 1) {
      return buf[i]
    } else {
      return buf.readUInt16BE(i * indexSize)
    }
  }

  let i
  if (dir) {
    let foundIndex = -1
    for (i = byteOffset; i < arrLength; i++) {
      if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
        if (foundIndex === -1) foundIndex = i
        if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
      } else {
        if (foundIndex !== -1) i -= i - foundIndex
        foundIndex = -1
      }
    }
  } else {
    if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength
    for (i = byteOffset; i >= 0; i--) {
      let found = true
      for (let j = 0; j < valLength; j++) {
        if (read(arr, i + j) !== read(val, j)) {
          found = false
          break
        }
      }
      if (found) return i
    }
  }

  return -1
}

Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
  return this.indexOf(val, byteOffset, encoding) !== -1
}

Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
}

Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
}

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  const remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  const strLen = string.length

  if (length > strLen / 2) {
    length = strLen / 2
  }
  let i
  for (i = 0; i < length; ++i) {
    const parsed = parseInt(string.substr(i * 2, 2), 16)
    if (numberIsNaN(parsed)) return i
    buf[offset + i] = parsed
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
}

function asciiWrite (buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length)
}

function base64Write (buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length)
}

function ucs2Write (buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
}

Buffer.prototype.write = function write (string, offset, length, encoding) {
  // Buffer#write(string)
  if (offset === undefined) {
    encoding = 'utf8'
    length = this.length
    offset = 0
  // Buffer#write(string, encoding)
  } else if (length === undefined && typeof offset === 'string') {
    encoding = offset
    length = this.length
    offset = 0
  // Buffer#write(string, offset[, length][, encoding])
  } else if (isFinite(offset)) {
    offset = offset >>> 0
    if (isFinite(length)) {
      length = length >>> 0
      if (encoding === undefined) encoding = 'utf8'
    } else {
      encoding = length
      length = undefined
    }
  } else {
    throw new Error(
      'Buffer.write(string, encoding, offset[, length]) is no longer supported'
    )
  }

  const remaining = this.length - offset
  if (length === undefined || length > remaining) length = remaining

  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
    throw new RangeError('Attempt to write outside buffer bounds')
  }

  if (!encoding) encoding = 'utf8'

  let loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'hex':
        return hexWrite(this, string, offset, length)

      case 'utf8':
      case 'utf-8':
        return utf8Write(this, string, offset, length)

      case 'ascii':
      case 'latin1':
      case 'binary':
        return asciiWrite(this, string, offset, length)

      case 'base64':
        // Warning: maxLength not taken into account in base64Write
        return base64Write(this, string, offset, length)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return ucs2Write(this, string, offset, length)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toJSON = function toJSON () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  end = Math.min(buf.length, end)
  const res = []

  let i = start
  while (i < end) {
    const firstByte = buf[i]
    let codePoint = null
    let bytesPerSequence = (firstByte > 0xEF)
      ? 4
      : (firstByte > 0xDF)
          ? 3
          : (firstByte > 0xBF)
              ? 2
              : 1

    if (i + bytesPerSequence <= end) {
      let secondByte, thirdByte, fourthByte, tempCodePoint

      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 0x80) {
            codePoint = firstByte
          }
          break
        case 2:
          secondByte = buf[i + 1]
          if ((secondByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
            if (tempCodePoint > 0x7F) {
              codePoint = tempCodePoint
            }
          }
          break
        case 3:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
              codePoint = tempCodePoint
            }
          }
          break
        case 4:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          fourthByte = buf[i + 3]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
              codePoint = tempCodePoint
            }
          }
      }
    }

    if (codePoint === null) {
      // we did not generate a valid codePoint so insert a
      // replacement char (U+FFFD) and advance only 1 byte
      codePoint = 0xFFFD
      bytesPerSequence = 1
    } else if (codePoint > 0xFFFF) {
      // encode to utf16 (surrogate pair dance)
      codePoint -= 0x10000
      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
      codePoint = 0xDC00 | codePoint & 0x3FF
    }

    res.push(codePoint)
    i += bytesPerSequence
  }

  return decodeCodePointsArray(res)
}

// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
const MAX_ARGUMENTS_LENGTH = 0x1000

function decodeCodePointsArray (codePoints) {
  const len = codePoints.length
  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
  }

  // Decode in chunks to avoid "call stack size exceeded".
  let res = ''
  let i = 0
  while (i < len) {
    res += String.fromCharCode.apply(
      String,
      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
    )
  }
  return res
}

function asciiSlice (buf, start, end) {
  let ret = ''
  end = Math.min(buf.length, end)

  for (let i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i] & 0x7F)
  }
  return ret
}

function latin1Slice (buf, start, end) {
  let ret = ''
  end = Math.min(buf.length, end)

  for (let i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function hexSlice (buf, start, end) {
  const len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  let out = ''
  for (let i = start; i < end; ++i) {
    out += hexSliceLookupTable[buf[i]]
  }
  return out
}

function utf16leSlice (buf, start, end) {
  const bytes = buf.slice(start, end)
  let res = ''
  // If bytes.length is odd, the last 8 bits must be ignored (same as node.js)
  for (let i = 0; i < bytes.length - 1; i += 2) {
    res += String.fromCharCode(bytes[i] + (bytes[i + 1] * 256))
  }
  return res
}

Buffer.prototype.slice = function slice (start, end) {
  const len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len
    if (start < 0) start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0) end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start) end = start

  const newBuf = this.subarray(start, end)
  // Return an augmented `Uint8Array` instance
  Object.setPrototypeOf(newBuf, Buffer.prototype)

  return newBuf
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUintLE =
Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  let val = this[offset]
  let mul = 1
  let i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }

  return val
}

Buffer.prototype.readUintBE =
Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    checkOffset(offset, byteLength, this.length)
  }

  let val = this[offset + --byteLength]
  let mul = 1
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul
  }

  return val
}

Buffer.prototype.readUint8 =
Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUint16LE =
Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUint16BE =
Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUint32LE =
Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUint32BE =
Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
    ((this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    this[offset + 3])
}

Buffer.prototype.readBigUInt64LE = defineBigIntMethod(function readBigUInt64LE (offset) {
  offset = offset >>> 0
  validateNumber(offset, 'offset')
  const first = this[offset]
  const last = this[offset + 7]
  if (first === undefined || last === undefined) {
    boundsError(offset, this.length - 8)
  }

  const lo = first +
    this[++offset] * 2 ** 8 +
    this[++offset] * 2 ** 16 +
    this[++offset] * 2 ** 24

  const hi = this[++offset] +
    this[++offset] * 2 ** 8 +
    this[++offset] * 2 ** 16 +
    last * 2 ** 24

  return BigInt(lo) + (BigInt(hi) << BigInt(32))
})

Buffer.prototype.readBigUInt64BE = defineBigIntMethod(function readBigUInt64BE (offset) {
  offset = offset >>> 0
  validateNumber(offset, 'offset')
  const first = this[offset]
  const last = this[offset + 7]
  if (first === undefined || last === undefined) {
    boundsError(offset, this.length - 8)
  }

  const hi = first * 2 ** 24 +
    this[++offset] * 2 ** 16 +
    this[++offset] * 2 ** 8 +
    this[++offset]

  const lo = this[++offset] * 2 ** 24 +
    this[++offset] * 2 ** 16 +
    this[++offset] * 2 ** 8 +
    last

  return (BigInt(hi) << BigInt(32)) + BigInt(lo)
})

Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  let val = this[offset]
  let mul = 1
  let i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  let i = byteLength
  let mul = 1
  let val = this[offset + --i]
  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80)) return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  const val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  const val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset]) |
    (this[offset + 1] << 8) |
    (this[offset + 2] << 16) |
    (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
    (this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    (this[offset + 3])
}

Buffer.prototype.readBigInt64LE = defineBigIntMethod(function readBigInt64LE (offset) {
  offset = offset >>> 0
  validateNumber(offset, 'offset')
  const first = this[offset]
  const last = this[offset + 7]
  if (first === undefined || last === undefined) {
    boundsError(offset, this.length - 8)
  }

  const val = this[offset + 4] +
    this[offset + 5] * 2 ** 8 +
    this[offset + 6] * 2 ** 16 +
    (last << 24) // Overflow

  return (BigInt(val) << BigInt(32)) +
    BigInt(first +
    this[++offset] * 2 ** 8 +
    this[++offset] * 2 ** 16 +
    this[++offset] * 2 ** 24)
})

Buffer.prototype.readBigInt64BE = defineBigIntMethod(function readBigInt64BE (offset) {
  offset = offset >>> 0
  validateNumber(offset, 'offset')
  const first = this[offset]
  const last = this[offset + 7]
  if (first === undefined || last === undefined) {
    boundsError(offset, this.length - 8)
  }

  const val = (first << 24) + // Overflow
    this[++offset] * 2 ** 16 +
    this[++offset] * 2 ** 8 +
    this[++offset]

  return (BigInt(val) << BigInt(32)) +
    BigInt(this[++offset] * 2 ** 24 +
    this[++offset] * 2 ** 16 +
    this[++offset] * 2 ** 8 +
    last)
})

Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
  if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
}

Buffer.prototype.writeUintLE =
Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    const maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  let mul = 1
  let i = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUintBE =
Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    const maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  let i = byteLength - 1
  let mul = 1
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUint8 =
Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeUint16LE =
Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  return offset + 2
}

Buffer.prototype.writeUint16BE =
Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  this[offset] = (value >>> 8)
  this[offset + 1] = (value & 0xff)
  return offset + 2
}

Buffer.prototype.writeUint32LE =
Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  this[offset + 3] = (value >>> 24)
  this[offset + 2] = (value >>> 16)
  this[offset + 1] = (value >>> 8)
  this[offset] = (value & 0xff)
  return offset + 4
}

Buffer.prototype.writeUint32BE =
Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  this[offset] = (value >>> 24)
  this[offset + 1] = (value >>> 16)
  this[offset + 2] = (value >>> 8)
  this[offset + 3] = (value & 0xff)
  return offset + 4
}

function wrtBigUInt64LE (buf, value, offset, min, max) {
  checkIntBI(value, min, max, buf, offset, 7)

  let lo = Number(value & BigInt(0xffffffff))
  buf[offset++] = lo
  lo = lo >> 8
  buf[offset++] = lo
  lo = lo >> 8
  buf[offset++] = lo
  lo = lo >> 8
  buf[offset++] = lo
  let hi = Number(value >> BigInt(32) & BigInt(0xffffffff))
  buf[offset++] = hi
  hi = hi >> 8
  buf[offset++] = hi
  hi = hi >> 8
  buf[offset++] = hi
  hi = hi >> 8
  buf[offset++] = hi
  return offset
}

function wrtBigUInt64BE (buf, value, offset, min, max) {
  checkIntBI(value, min, max, buf, offset, 7)

  let lo = Number(value & BigInt(0xffffffff))
  buf[offset + 7] = lo
  lo = lo >> 8
  buf[offset + 6] = lo
  lo = lo >> 8
  buf[offset + 5] = lo
  lo = lo >> 8
  buf[offset + 4] = lo
  let hi = Number(value >> BigInt(32) & BigInt(0xffffffff))
  buf[offset + 3] = hi
  hi = hi >> 8
  buf[offset + 2] = hi
  hi = hi >> 8
  buf[offset + 1] = hi
  hi = hi >> 8
  buf[offset] = hi
  return offset + 8
}

Buffer.prototype.writeBigUInt64LE = defineBigIntMethod(function writeBigUInt64LE (value, offset = 0) {
  return wrtBigUInt64LE(this, value, offset, BigInt(0), BigInt('0xffffffffffffffff'))
})

Buffer.prototype.writeBigUInt64BE = defineBigIntMethod(function writeBigUInt64BE (value, offset = 0) {
  return wrtBigUInt64BE(this, value, offset, BigInt(0), BigInt('0xffffffffffffffff'))
})

Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    const limit = Math.pow(2, (8 * byteLength) - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  let i = 0
  let mul = 1
  let sub = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    const limit = Math.pow(2, (8 * byteLength) - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  let i = byteLength - 1
  let mul = 1
  let sub = 0
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (value < 0) value = 0xff + value + 1
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  return offset + 2
}

Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  this[offset] = (value >>> 8)
  this[offset + 1] = (value & 0xff)
  return offset + 2
}

Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  this[offset + 2] = (value >>> 16)
  this[offset + 3] = (value >>> 24)
  return offset + 4
}

Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  this[offset] = (value >>> 24)
  this[offset + 1] = (value >>> 16)
  this[offset + 2] = (value >>> 8)
  this[offset + 3] = (value & 0xff)
  return offset + 4
}

Buffer.prototype.writeBigInt64LE = defineBigIntMethod(function writeBigInt64LE (value, offset = 0) {
  return wrtBigUInt64LE(this, value, offset, -BigInt('0x8000000000000000'), BigInt('0x7fffffffffffffff'))
})

Buffer.prototype.writeBigInt64BE = defineBigIntMethod(function writeBigInt64BE (value, offset = 0) {
  return wrtBigUInt64BE(this, value, offset, -BigInt('0x8000000000000000'), BigInt('0x7fffffffffffffff'))
})

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
  if (offset < 0) throw new RangeError('Index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function copy (target, targetStart, start, end) {
  if (!Buffer.isBuffer(target)) throw new TypeError('argument should be a Buffer')
  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (targetStart >= target.length) targetStart = target.length
  if (!targetStart) targetStart = 0
  if (end > 0 && end < start) end = start

  // Copy 0 bytes; we're done
  if (end === start) return 0
  if (target.length === 0 || this.length === 0) return 0

  // Fatal error conditions
  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds')
  }
  if (start < 0 || start >= this.length) throw new RangeError('Index out of range')
  if (end < 0) throw new RangeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length) end = this.length
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start
  }

  const len = end - start

  if (this === target && typeof Uint8Array.prototype.copyWithin === 'function') {
    // Use built-in when available, missing from IE11
    this.copyWithin(targetStart, start, end)
  } else {
    Uint8Array.prototype.set.call(
      target,
      this.subarray(start, end),
      targetStart
    )
  }

  return len
}

// Usage:
//    buffer.fill(number[, offset[, end]])
//    buffer.fill(buffer[, offset[, end]])
//    buffer.fill(string[, offset[, end]][, encoding])
Buffer.prototype.fill = function fill (val, start, end, encoding) {
  // Handle string cases:
  if (typeof val === 'string') {
    if (typeof start === 'string') {
      encoding = start
      start = 0
      end = this.length
    } else if (typeof end === 'string') {
      encoding = end
      end = this.length
    }
    if (encoding !== undefined && typeof encoding !== 'string') {
      throw new TypeError('encoding must be a string')
    }
    if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
      throw new TypeError('Unknown encoding: ' + encoding)
    }
    if (val.length === 1) {
      const code = val.charCodeAt(0)
      if ((encoding === 'utf8' && code < 128) ||
          encoding === 'latin1') {
        // Fast path: If `val` fits into a single byte, use that numeric value.
        val = code
      }
    }
  } else if (typeof val === 'number') {
    val = val & 255
  } else if (typeof val === 'boolean') {
    val = Number(val)
  }

  // Invalid ranges are not set to a default, so can range check early.
  if (start < 0 || this.length < start || this.length < end) {
    throw new RangeError('Out of range index')
  }

  if (end <= start) {
    return this
  }

  start = start >>> 0
  end = end === undefined ? this.length : end >>> 0

  if (!val) val = 0

  let i
  if (typeof val === 'number') {
    for (i = start; i < end; ++i) {
      this[i] = val
    }
  } else {
    const bytes = Buffer.isBuffer(val)
      ? val
      : Buffer.from(val, encoding)
    const len = bytes.length
    if (len === 0) {
      throw new TypeError('The value "' + val +
        '" is invalid for argument "value"')
    }
    for (i = 0; i < end - start; ++i) {
      this[i + start] = bytes[i % len]
    }
  }

  return this
}

// CUSTOM ERRORS
// =============

// Simplified versions from Node, changed for Buffer-only usage
const errors = {}
function E (sym, getMessage, Base) {
  errors[sym] = class NodeError extends Base {
    constructor () {
      super()

      Object.defineProperty(this, 'message', {
        value: getMessage.apply(this, arguments),
        writable: true,
        configurable: true
      })

      // Add the error code to the name to include it in the stack trace.
      this.name = `${this.name} [${sym}]`
      // Access the stack to generate the error message including the error code
      // from the name.
      this.stack // eslint-disable-line no-unused-expressions
      // Reset the name to the actual name.
      delete this.name
    }

    get code () {
      return sym
    }

    set code (value) {
      Object.defineProperty(this, 'code', {
        configurable: true,
        enumerable: true,
        value,
        writable: true
      })
    }

    toString () {
      return `${this.name} [${sym}]: ${this.message}`
    }
  }
}

E('ERR_BUFFER_OUT_OF_BOUNDS',
  function (name) {
    if (name) {
      return `${name} is outside of buffer bounds`
    }

    return 'Attempt to access memory outside buffer bounds'
  }, RangeError)
E('ERR_INVALID_ARG_TYPE',
  function (name, actual) {
    return `The "${name}" argument must be of type number. Received type ${typeof actual}`
  }, TypeError)
E('ERR_OUT_OF_RANGE',
  function (str, range, input) {
    let msg = `The value of "${str}" is out of range.`
    let received = input
    if (Number.isInteger(input) && Math.abs(input) > 2 ** 32) {
      received = addNumericalSeparator(String(input))
    } else if (typeof input === 'bigint') {
      received = String(input)
      if (input > BigInt(2) ** BigInt(32) || input < -(BigInt(2) ** BigInt(32))) {
        received = addNumericalSeparator(received)
      }
      received += 'n'
    }
    msg += ` It must be ${range}. Received ${received}`
    return msg
  }, RangeError)

function addNumericalSeparator (val) {
  let res = ''
  let i = val.length
  const start = val[0] === '-' ? 1 : 0
  for (; i >= start + 4; i -= 3) {
    res = `_${val.slice(i - 3, i)}${res}`
  }
  return `${val.slice(0, i)}${res}`
}

// CHECK FUNCTIONS
// ===============

function checkBounds (buf, offset, byteLength) {
  validateNumber(offset, 'offset')
  if (buf[offset] === undefined || buf[offset + byteLength] === undefined) {
    boundsError(offset, buf.length - (byteLength + 1))
  }
}

function checkIntBI (value, min, max, buf, offset, byteLength) {
  if (value > max || value < min) {
    const n = typeof min === 'bigint' ? 'n' : ''
    let range
    if (byteLength > 3) {
      if (min === 0 || min === BigInt(0)) {
        range = `>= 0${n} and < 2${n} ** ${(byteLength + 1) * 8}${n}`
      } else {
        range = `>= -(2${n} ** ${(byteLength + 1) * 8 - 1}${n}) and < 2 ** ` +
                `${(byteLength + 1) * 8 - 1}${n}`
      }
    } else {
      range = `>= ${min}${n} and <= ${max}${n}`
    }
    throw new errors.ERR_OUT_OF_RANGE('value', range, value)
  }
  checkBounds(buf, offset, byteLength)
}

function validateNumber (value, name) {
  if (typeof value !== 'number') {
    throw new errors.ERR_INVALID_ARG_TYPE(name, 'number', value)
  }
}

function boundsError (value, length, type) {
  if (Math.floor(value) !== value) {
    validateNumber(value, type)
    throw new errors.ERR_OUT_OF_RANGE(type || 'offset', 'an integer', value)
  }

  if (length < 0) {
    throw new errors.ERR_BUFFER_OUT_OF_BOUNDS()
  }

  throw new errors.ERR_OUT_OF_RANGE(type || 'offset',
                                    `>= ${type ? 1 : 0} and <= ${length}`,
                                    value)
}

// HELPER FUNCTIONS
// ================

const INVALID_BASE64_RE = /[^+/0-9A-Za-z-_]/g

function base64clean (str) {
  // Node takes equal signs as end of the Base64 encoding
  str = str.split('=')[0]
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = str.trim().replace(INVALID_BASE64_RE, '')
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ''
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function utf8ToBytes (string, units) {
  units = units || Infinity
  let codePoint
  const length = string.length
  let leadSurrogate = null
  const bytes = []

  for (let i = 0; i < length; ++i) {
    codePoint = string.charCodeAt(i)

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (!leadSurrogate) {
        // no lead yet
        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        }

        // valid lead
        leadSurrogate = codePoint

        continue
      }

      // 2 leads in a row
      if (codePoint < 0xDC00) {
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
        leadSurrogate = codePoint
        continue
      }

      // valid surrogate pair
      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
    }

    leadSurrogate = null

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break
      bytes.push(codePoint)
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break
      bytes.push(
        codePoint >> 0x6 | 0xC0,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break
      bytes.push(
        codePoint >> 0xC | 0xE0,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x110000) {
      if ((units -= 4) < 0) break
      bytes.push(
        codePoint >> 0x12 | 0xF0,
        codePoint >> 0xC & 0x3F | 0x80,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else {
      throw new Error('Invalid code point')
    }
  }

  return bytes
}

function asciiToBytes (str) {
  const byteArray = []
  for (let i = 0; i < str.length; ++i) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str, units) {
  let c, hi, lo
  const byteArray = []
  for (let i = 0; i < str.length; ++i) {
    if ((units -= 2) < 0) break

    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(base64clean(str))
}

function blitBuffer (src, dst, offset, length) {
  let i
  for (i = 0; i < length; ++i) {
    if ((i + offset >= dst.length) || (i >= src.length)) break
    dst[i + offset] = src[i]
  }
  return i
}

// ArrayBuffer or Uint8Array objects from other contexts (i.e. iframes) do not pass
// the `instanceof` check but they should be treated as of that type.
// See: https://github.com/feross/buffer/issues/166
function isInstance (obj, type) {
  return obj instanceof type ||
    (obj != null && obj.constructor != null && obj.constructor.name != null &&
      obj.constructor.name === type.name)
}
function numberIsNaN (obj) {
  // For IE11 support
  return obj !== obj // eslint-disable-line no-self-compare
}

// Create lookup table for `toString('hex')`
// See: https://github.com/feross/buffer/issues/219
const hexSliceLookupTable = (function () {
  const alphabet = '0123456789abcdef'
  const table = new Array(256)
  for (let i = 0; i < 16; ++i) {
    const i16 = i * 16
    for (let j = 0; j < 16; ++j) {
      table[i16 + j] = alphabet[i] + alphabet[j]
    }
  }
  return table
})()

// Return not function with Error if BigInt not supported
function defineBigIntMethod (fn) {
  return typeof BigInt === 'undefined' ? BufferBigIntNotDefined : fn
}

function BufferBigIntNotDefined () {
  throw new Error('BigInt not supported')
}


/***/ }),

/***/ "./node_modules/docxtemplater/js/browser-versions/xmldom.js":
/*!******************************************************************!*\
  !*** ./node_modules/docxtemplater/js/browser-versions/xmldom.js ***!
  \******************************************************************/
/***/ ((module) => {

"use strict";


module.exports = {
  XMLSerializer: window.XMLSerializer,
  DOMParser: window.DOMParser,
  XMLDocument: window.XMLDocument
};

/***/ }),

/***/ "./node_modules/docxtemplater/js/collect-content-types.js":
/*!****************************************************************!*\
  !*** ./node_modules/docxtemplater/js/collect-content-types.js ***!
  \****************************************************************/
/***/ ((module) => {

"use strict";


var ctXML = "[Content_Types].xml";
function collectContentTypes(overrides, defaults, zip) {
  var partNames = {};
  for (var i = 0, len = overrides.length; i < len; i++) {
    var override = overrides[i];
    var contentType = override.getAttribute("ContentType");
    var partName = override.getAttribute("PartName").substr(1);
    partNames[partName] = contentType;
  }
  var _loop = function _loop() {
    var def = defaults[_i];
    var contentType = def.getAttribute("ContentType");
    var extension = def.getAttribute("Extension");
    // eslint-disable-next-line no-loop-func
    zip.file(/./).map(function (_ref) {
      var name = _ref.name;
      if (name.slice(name.length - extension.length) === extension && !partNames[name] && name !== ctXML) {
        partNames[name] = contentType;
      }
    });
  };
  for (var _i = 0, _len = defaults.length; _i < _len; _i++) {
    _loop();
  }
  return partNames;
}
module.exports = collectContentTypes;

/***/ }),

/***/ "./node_modules/docxtemplater/js/doc-utils.js":
/*!****************************************************!*\
  !*** ./node_modules/docxtemplater/js/doc-utils.js ***!
  \****************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function _iterableToArrayLimit(arr, i) { var _i = null == arr ? null : "undefined" != typeof Symbol && arr[Symbol.iterator] || arr["@@iterator"]; if (null != _i) { var _s, _e, _x, _r, _arr = [], _n = !0, _d = !1; try { if (_x = (_i = _i.call(arr)).next, 0 === i) { if (Object(_i) !== _i) return; _n = !1; } else for (; !(_n = (_s = _x.call(_i)).done) && (_arr.push(_s.value), _arr.length !== i); _n = !0); } catch (err) { _d = !0, _e = err; } finally { try { if (!_n && null != _i["return"] && (_r = _i["return"](), Object(_r) !== _r)) return; } finally { if (_d) throw _e; } } return _arr; } }
function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
var _require = __webpack_require__(/*! @xmldom/xmldom */ "./node_modules/docxtemplater/js/browser-versions/xmldom.js"),
  DOMParser = _require.DOMParser,
  XMLSerializer = _require.XMLSerializer;
var _require2 = __webpack_require__(/*! ./errors.js */ "./node_modules/docxtemplater/js/errors.js"),
  throwXmlTagNotFound = _require2.throwXmlTagNotFound;
var _require3 = __webpack_require__(/*! ./utils.js */ "./node_modules/docxtemplater/js/utils.js"),
  last = _require3.last,
  first = _require3.first;
function isWhiteSpace(value) {
  return /^[ \n\r\t]+$/.test(value);
}
function parser(tag) {
  return {
    get: function get(scope) {
      if (tag === ".") {
        return scope;
      }
      if (scope) {
        return scope[tag];
      }
      return scope;
    }
  };
}
var attrToRegex = {};
function setSingleAttribute(partValue, attr, attrValue) {
  var regex;
  // Stryker disable next-line all : because this is an optimisation
  if (attrToRegex[attr]) {
    regex = attrToRegex[attr];
  } else {
    regex = new RegExp("(<.* ".concat(attr, "=\")([^\"]*)(\".*)$"));
    attrToRegex[attr] = regex;
  }
  if (regex.test(partValue)) {
    return partValue.replace(regex, "$1".concat(attrValue, "$3"));
  }
  var end = partValue.lastIndexOf("/>");
  if (end === -1) {
    end = partValue.lastIndexOf(">");
  }
  return partValue.substr(0, end) + " ".concat(attr, "=\"").concat(attrValue, "\"") + partValue.substr(end);
}
function getSingleAttribute(value, attributeName) {
  var index = value.indexOf(" ".concat(attributeName, "=\""));
  if (index === -1) {
    return null;
  }
  var startIndex = value.substr(index).search(/["']/) + index;
  var endIndex = value.substr(startIndex + 1).search(/["']/) + startIndex;
  return value.substr(startIndex + 1, endIndex - startIndex);
}
function endsWith(str, suffix) {
  return str.indexOf(suffix, str.length - suffix.length) !== -1;
}
function startsWith(str, prefix) {
  return str.substring(0, prefix.length) === prefix;
}
function uniq(arr) {
  var hash = {},
    result = [];
  for (var i = 0, l = arr.length; i < l; ++i) {
    if (!hash[arr[i]]) {
      hash[arr[i]] = true;
      result.push(arr[i]);
    }
  }
  return result;
}
function chunkBy(parsed, f) {
  return parsed.reduce(function (chunks, p) {
    var currentChunk = last(chunks);
    var res = f(p);
    if (res === "start") {
      chunks.push([p]);
    } else if (res === "end") {
      currentChunk.push(p);
      chunks.push([]);
    } else {
      currentChunk.push(p);
    }
    return chunks;
  }, [[]]).filter(function (p) {
    return p.length > 0;
  });
}
var defaults = {
  errorLogging: "json",
  paragraphLoop: false,
  nullGetter: function nullGetter(part) {
    return part.module ? "" : "undefined";
  },
  xmlFileNames: ["[Content_Types].xml"],
  parser: parser,
  linebreaks: false,
  fileTypeConfig: null,
  delimiters: {
    start: "{",
    end: "}"
  }
};
function mergeObjects() {
  var resObj = {};
  var obj;
  for (var i = 0; i < arguments.length; i += 1) {
    obj = arguments[i];
    resObj = _objectSpread(_objectSpread({}, resObj), obj);
  }
  return resObj;
}
function xml2str(xmlNode) {
  var a = new XMLSerializer();
  return a.serializeToString(xmlNode).replace(/xmlns(:[a-z0-9]+)?="" ?/g, "");
}
function str2xml(str) {
  if (str.charCodeAt(0) === 65279) {
    // BOM sequence
    str = str.substr(1);
  }
  return new DOMParser().parseFromString(str, "text/xml");
}
var charMap = [["&", "&amp;"], ["<", "&lt;"], [">", "&gt;"], ['"', "&quot;"], ["'", "&apos;"]];
var charMapRegexes = charMap.map(function (_ref) {
  var _ref2 = _slicedToArray(_ref, 2),
    endChar = _ref2[0],
    startChar = _ref2[1];
  return {
    rstart: new RegExp(startChar, "g"),
    rend: new RegExp(endChar, "g"),
    start: startChar,
    end: endChar
  };
});
function wordToUtf8(string) {
  var r;
  for (var i = charMapRegexes.length - 1; i >= 0; i--) {
    r = charMapRegexes[i];
    string = string.replace(r.rstart, r.end);
  }
  return string;
}
function utf8ToWord(string) {
  // To make sure that the object given is a string (this is a noop for strings).
  string = string.toString();
  var r;
  for (var i = 0, l = charMapRegexes.length; i < l; i++) {
    r = charMapRegexes[i];
    string = string.replace(r.rend, r.start);
  }
  return string;
}

// This function is written with for loops for performance
function concatArrays(arrays) {
  var result = [];
  for (var i = 0; i < arrays.length; i++) {
    var array = arrays[i];
    for (var j = 0, len = array.length; j < len; j++) {
      result.push(array[j]);
    }
  }
  return result;
}
var spaceRegexp = new RegExp(String.fromCharCode(160), "g");
function convertSpaces(s) {
  return s.replace(spaceRegexp, " ");
}
function pregMatchAll(regex, content) {
  /* regex is a string, content is the content. It returns an array of all matches with their offset, for example:
  	 regex=la
  	 content=lolalolilala
  returns: [{array: {0: 'la'},offset: 2},{array: {0: 'la'},offset: 8},{array: {0: 'la'} ,offset: 10}]
  */
  var matchArray = [];
  var match;
  while ((match = regex.exec(content)) != null) {
    matchArray.push({
      array: match,
      offset: match.index
    });
  }
  return matchArray;
}
function isEnding(value, element) {
  return value === "</" + element + ">";
}
function isStarting(value, element) {
  return value.indexOf("<" + element) === 0 && [">", " ", "/"].indexOf(value[element.length + 1]) !== -1;
}
function getRight(parsed, element, index) {
  var val = getRightOrNull(parsed, element, index);
  if (val !== null) {
    return val;
  }
  throwXmlTagNotFound({
    position: "right",
    element: element,
    parsed: parsed,
    index: index
  });
}
function getRightOrNull(parsed, elements, index) {
  if (typeof elements === "string") {
    elements = [elements];
  }
  var level = 1;
  for (var i = index, l = parsed.length; i < l; i++) {
    var part = parsed[i];
    for (var j = 0, len = elements.length; j < len; j++) {
      var element = elements[j];
      if (isEnding(part.value, element)) {
        level--;
      }
      if (isStarting(part.value, element)) {
        level++;
      }
      if (level === 0) {
        return i;
      }
    }
  }
  return null;
}
function getLeft(parsed, element, index) {
  var val = getLeftOrNull(parsed, element, index);
  if (val !== null) {
    return val;
  }
  throwXmlTagNotFound({
    position: "left",
    element: element,
    parsed: parsed,
    index: index
  });
}
function getLeftOrNull(parsed, elements, index) {
  if (typeof elements === "string") {
    elements = [elements];
  }
  var level = 1;
  for (var i = index; i >= 0; i--) {
    var part = parsed[i];
    for (var j = 0, len = elements.length; j < len; j++) {
      var element = elements[j];
      if (isStarting(part.value, element)) {
        level--;
      }
      if (isEnding(part.value, element)) {
        level++;
      }
      if (level === 0) {
        return i;
      }
    }
  }
  return null;
}

// Stryker disable all : because those are functions that depend on the parsed
// structure based and we don't want minimal code here, but rather code that
// makes things clear.
function isTagStart(tagType, _ref3) {
  var type = _ref3.type,
    tag = _ref3.tag,
    position = _ref3.position;
  return type === "tag" && tag === tagType && (position === "start" || position === "selfclosing");
}
function isTagStartStrict(tagType, _ref4) {
  var type = _ref4.type,
    tag = _ref4.tag,
    position = _ref4.position;
  return type === "tag" && tag === tagType && position === "start";
}
function isTagEnd(tagType, _ref5) {
  var type = _ref5.type,
    tag = _ref5.tag,
    position = _ref5.position;
  return type === "tag" && tag === tagType && position === "end";
}
function isParagraphStart(part) {
  return isTagStartStrict("w:p", part) || isTagStartStrict("a:p", part);
}
function isParagraphEnd(part) {
  return isTagEnd("w:p", part) || isTagEnd("a:p", part);
}
function isTextStart(_ref6) {
  var type = _ref6.type,
    position = _ref6.position,
    text = _ref6.text;
  return type === "tag" && position === "start" && text;
}
function isTextEnd(_ref7) {
  var type = _ref7.type,
    position = _ref7.position,
    text = _ref7.text;
  return type === "tag" && position === "end" && text;
}
function isContent(_ref8) {
  var type = _ref8.type,
    position = _ref8.position;
  return type === "placeholder" || type === "content" && position === "insidetag";
}
function isModule(_ref9, modules) {
  var module = _ref9.module,
    type = _ref9.type;
  if (!(modules instanceof Array)) {
    modules = [modules];
  }
  return type === "placeholder" && modules.indexOf(module) !== -1;
}
// Stryker restore all

var corruptCharacters = /[\x00-\x08\x0B\x0C\x0E-\x1F]/;
// 00    NUL '\0' (null character)
// 01    SOH (start of heading)
// 02    STX (start of text)
// 03    ETX (end of text)
// 04    EOT (end of transmission)
// 05    ENQ (enquiry)
// 06    ACK (acknowledge)
// 07    BEL '\a' (bell)
// 08    BS  '\b' (backspace)
// 0B    VT  '\v' (vertical tab)
// 0C    FF  '\f' (form feed)
// 0E    SO  (shift out)
// 0F    SI  (shift in)
// 10    DLE (data link escape)
// 11    DC1 (device control 1)
// 12    DC2 (device control 2)
// 13    DC3 (device control 3)
// 14    DC4 (device control 4)
// 15    NAK (negative ack.)
// 16    SYN (synchronous idle)
// 17    ETB (end of trans. blk)
// 18    CAN (cancel)
// 19    EM  (end of medium)
// 1A    SUB (substitute)
// 1B    ESC (escape)
// 1C    FS  (file separator)
// 1D    GS  (group separator)
// 1E    RS  (record separator)
// 1F    US  (unit separator)
function hasCorruptCharacters(string) {
  return corruptCharacters.test(string);
}
function invertMap(map) {
  return Object.keys(map).reduce(function (invertedMap, key) {
    var value = map[key];
    invertedMap[value] = invertedMap[value] || [];
    invertedMap[value].push(key);
    return invertedMap;
  }, {});
}
function stableSort(arr, compare) {
  return arr.map(function (item, index) {
    return {
      item: item,
      index: index
    };
  }).sort(function (a, b) {
    return compare(a.item, b.item) || a.index - b.index;
  }).map(function (_ref10) {
    var item = _ref10.item;
    return item;
  });
}
module.exports = {
  endsWith: endsWith,
  startsWith: startsWith,
  isContent: isContent,
  isParagraphStart: isParagraphStart,
  isParagraphEnd: isParagraphEnd,
  isTagStart: isTagStart,
  isTagEnd: isTagEnd,
  isTextStart: isTextStart,
  isTextEnd: isTextEnd,
  isStarting: isStarting,
  isEnding: isEnding,
  isModule: isModule,
  uniq: uniq,
  chunkBy: chunkBy,
  last: last,
  first: first,
  mergeObjects: mergeObjects,
  xml2str: xml2str,
  str2xml: str2xml,
  getRightOrNull: getRightOrNull,
  getRight: getRight,
  getLeftOrNull: getLeftOrNull,
  getLeft: getLeft,
  pregMatchAll: pregMatchAll,
  convertSpaces: convertSpaces,
  charMapRegexes: charMapRegexes,
  hasCorruptCharacters: hasCorruptCharacters,
  defaults: defaults,
  wordToUtf8: wordToUtf8,
  utf8ToWord: utf8ToWord,
  concatArrays: concatArrays,
  invertMap: invertMap,
  charMap: charMap,
  getSingleAttribute: getSingleAttribute,
  setSingleAttribute: setSingleAttribute,
  isWhiteSpace: isWhiteSpace,
  stableSort: stableSort
};

/***/ }),

/***/ "./node_modules/docxtemplater/js/docxtemplater.js":
/*!********************************************************!*\
  !*** ./node_modules/docxtemplater/js/docxtemplater.js ***!
  \********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var _excluded = ["modules"];
function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }
function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
var DocUtils = __webpack_require__(/*! ./doc-utils.js */ "./node_modules/docxtemplater/js/doc-utils.js");
DocUtils.traits = __webpack_require__(/*! ./traits.js */ "./node_modules/docxtemplater/js/traits.js");
DocUtils.moduleWrapper = __webpack_require__(/*! ./module-wrapper.js */ "./node_modules/docxtemplater/js/module-wrapper.js");
var createScope = __webpack_require__(/*! ./scope-manager.js */ "./node_modules/docxtemplater/js/scope-manager.js");
var _require = __webpack_require__(/*! ./errors.js */ "./node_modules/docxtemplater/js/errors.js"),
  throwMultiError = _require.throwMultiError,
  throwResolveBeforeCompile = _require.throwResolveBeforeCompile,
  throwRenderInvalidTemplate = _require.throwRenderInvalidTemplate,
  throwRenderTwice = _require.throwRenderTwice;
var logErrors = __webpack_require__(/*! ./error-logger.js */ "./node_modules/docxtemplater/js/error-logger.js");
var collectContentTypes = __webpack_require__(/*! ./collect-content-types.js */ "./node_modules/docxtemplater/js/collect-content-types.js");
var ctXML = "[Content_Types].xml";
var relsFile = "_rels/.rels";
var commonModule = __webpack_require__(/*! ./modules/common.js */ "./node_modules/docxtemplater/js/modules/common.js");
var Lexer = __webpack_require__(/*! ./lexer.js */ "./node_modules/docxtemplater/js/lexer.js");
var defaults = DocUtils.defaults,
  str2xml = DocUtils.str2xml,
  xml2str = DocUtils.xml2str,
  moduleWrapper = DocUtils.moduleWrapper,
  concatArrays = DocUtils.concatArrays,
  uniq = DocUtils.uniq,
  stableSort = DocUtils.stableSort;
var _require2 = __webpack_require__(/*! ./errors.js */ "./node_modules/docxtemplater/js/errors.js"),
  XTInternalError = _require2.XTInternalError,
  throwFileTypeNotIdentified = _require2.throwFileTypeNotIdentified,
  throwFileTypeNotHandled = _require2.throwFileTypeNotHandled,
  throwApiVersionError = _require2.throwApiVersionError;
var currentModuleApiVersion = [3, 36, 0];
function dropUnsupportedFileTypesModules(dx) {
  dx.modules = dx.modules.filter(function (module) {
    if (module.supportedFileTypes) {
      if (!Array.isArray(module.supportedFileTypes)) {
        throw new Error("The supportedFileTypes field of the module must be an array");
      }
      var isSupportedModule = module.supportedFileTypes.indexOf(dx.fileType) !== -1;
      if (!isSupportedModule) {
        module.on("detached");
      }
      return isSupportedModule;
    }
    return true;
  });
}
var Docxtemplater = /*#__PURE__*/function () {
  function Docxtemplater(zip) {
    var _this = this;
    var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
      _ref$modules = _ref.modules,
      modules = _ref$modules === void 0 ? [] : _ref$modules,
      options = _objectWithoutProperties(_ref, _excluded);
    _classCallCheck(this, Docxtemplater);
    if (!Array.isArray(modules)) {
      throw new Error("The modules argument of docxtemplater's constructor must be an array");
    }
    this.targets = [];
    this.rendered = false;
    this.scopeManagers = {};
    this.compiled = {};
    this.modules = [commonModule()];
    this.setOptions(options);
    modules.forEach(function (module) {
      _this.attachModule(module);
    });
    if (arguments.length > 0) {
      if (!zip || !zip.files || typeof zip.file !== "function") {
        throw new Error("The first argument of docxtemplater's constructor must be a valid zip file (jszip v2 or pizzip v3)");
      }
      this.loadZip(zip);
      // remove the unsupported modules
      dropUnsupportedFileTypesModules(this);
      this.compile();
      this.v4Constructor = true;
    }
  }
  _createClass(Docxtemplater, [{
    key: "verifyApiVersion",
    value: function verifyApiVersion(neededVersion) {
      neededVersion = neededVersion.split(".").map(function (i) {
        return parseInt(i, 10);
      });
      if (neededVersion.length !== 3) {
        throwApiVersionError("neededVersion is not a valid version", {
          neededVersion: neededVersion,
          explanation: "the neededVersion must be an array of length 3"
        });
      }
      if (neededVersion[0] !== currentModuleApiVersion[0]) {
        throwApiVersionError("The major api version do not match, you probably have to update docxtemplater with npm install --save docxtemplater", {
          neededVersion: neededVersion,
          currentModuleApiVersion: currentModuleApiVersion,
          explanation: "moduleAPIVersionMismatch : needed=".concat(neededVersion.join("."), ", current=").concat(currentModuleApiVersion.join("."))
        });
      }
      if (neededVersion[1] > currentModuleApiVersion[1]) {
        throwApiVersionError("The minor api version is not uptodate, you probably have to update docxtemplater with npm install --save docxtemplater", {
          neededVersion: neededVersion,
          currentModuleApiVersion: currentModuleApiVersion,
          explanation: "moduleAPIVersionMismatch : needed=".concat(neededVersion.join("."), ", current=").concat(currentModuleApiVersion.join("."))
        });
      }
      if (neededVersion[1] === currentModuleApiVersion[1] && neededVersion[2] > currentModuleApiVersion[2]) {
        throwApiVersionError("The patch api version is not uptodate, you probably have to update docxtemplater with npm install --save docxtemplater", {
          neededVersion: neededVersion,
          currentModuleApiVersion: currentModuleApiVersion,
          explanation: "moduleAPIVersionMismatch : needed=".concat(neededVersion.join("."), ", current=").concat(currentModuleApiVersion.join("."))
        });
      }
      return true;
    }
  }, {
    key: "setModules",
    value: function setModules(obj) {
      this.modules.forEach(function (module) {
        module.set(obj);
      });
    }
  }, {
    key: "sendEvent",
    value: function sendEvent(eventName) {
      this.modules.forEach(function (module) {
        module.on(eventName);
      });
    }
  }, {
    key: "attachModule",
    value: function attachModule(module) {
      if (this.v4Constructor) {
        throw new XTInternalError("attachModule() should not be called manually when using the v4 constructor");
      }
      var moduleType = _typeof(module);
      if (moduleType === "function") {
        throw new XTInternalError("Cannot attach a class/function as a module. Most probably you forgot to instantiate the module by using `new` on the module.");
      }
      if (!module || moduleType !== "object") {
        throw new XTInternalError("Cannot attachModule with a falsy value");
      }
      if (module.requiredAPIVersion) {
        this.verifyApiVersion(module.requiredAPIVersion);
      }
      if (module.attached === true) {
        if (typeof module.clone === "function") {
          module = module.clone();
        } else {
          throw new Error("Cannot attach a module that was already attached : \"".concat(module.name, "\". The most likely cause is that you are instantiating the module at the root level, and using it for multiple instances of Docxtemplater"));
        }
      }
      module.attached = true;
      var wrappedModule = moduleWrapper(module);
      this.modules.push(wrappedModule);
      wrappedModule.on("attached");
      if (this.fileType) {
        dropUnsupportedFileTypesModules(this);
      }
      return this;
    }
  }, {
    key: "setOptions",
    value: function setOptions(options) {
      var _this2 = this;
      if (this.v4Constructor) {
        throw new Error("setOptions() should not be called manually when using the v4 constructor");
      }
      if (!options) {
        throw new Error("setOptions should be called with an object as first parameter");
      }
      this.options = {};
      Object.keys(defaults).forEach(function (key) {
        var defaultValue = defaults[key];
        _this2.options[key] = options[key] != null ? options[key] : defaultValue;
        _this2[key] = _this2.options[key];
      });
      this.delimiters.start = DocUtils.utf8ToWord(this.delimiters.start);
      this.delimiters.end = DocUtils.utf8ToWord(this.delimiters.end);
      if (this.zip) {
        this.updateFileTypeConfig();
      }
      return this;
    }
  }, {
    key: "loadZip",
    value: function loadZip(zip) {
      if (this.v4Constructor) {
        throw new Error("loadZip() should not be called manually when using the v4 constructor");
      }
      if (zip.loadAsync) {
        throw new XTInternalError("Docxtemplater doesn't handle JSZip version >=3, please use pizzip");
      }
      this.zip = zip;
      this.updateFileTypeConfig();
      this.modules = concatArrays([this.fileTypeConfig.baseModules.map(function (moduleFunction) {
        return moduleFunction();
      }), this.modules]);
      dropUnsupportedFileTypesModules(this);
      return this;
    }
  }, {
    key: "precompileFile",
    value: function precompileFile(fileName) {
      var currentFile = this.createTemplateClass(fileName);
      currentFile.preparse();
      this.compiled[fileName] = currentFile;
    }
  }, {
    key: "compileFile",
    value: function compileFile(fileName) {
      this.compiled[fileName].parse();
    }
  }, {
    key: "getScopeManager",
    value: function getScopeManager(to, currentFile, tags) {
      if (!this.scopeManagers[to]) {
        this.scopeManagers[to] = createScope({
          tags: tags,
          parser: this.parser,
          cachedParsers: currentFile.cachedParsers
        });
      }
      return this.scopeManagers[to];
    }
  }, {
    key: "resolveData",
    value: function resolveData(data) {
      var _this3 = this;
      var errors = [];
      if (!Object.keys(this.compiled).length) {
        throwResolveBeforeCompile();
      }
      return Promise.resolve(data).then(function (data) {
        _this3.setData(data);
        _this3.setModules({
          data: _this3.data,
          Lexer: Lexer
        });
        _this3.mapper = _this3.modules.reduce(function (value, module) {
          return module.getRenderedMap(value);
        }, {});
        return Promise.all(Object.keys(_this3.mapper).map(function (to) {
          var _this3$mapper$to = _this3.mapper[to],
            from = _this3$mapper$to.from,
            data = _this3$mapper$to.data;
          return Promise.resolve(data).then(function (data) {
            var currentFile = _this3.compiled[from];
            currentFile.filePath = to;
            currentFile.scopeManager = _this3.getScopeManager(to, currentFile, data);
            return currentFile.resolveTags(data).then(function (result) {
              currentFile.scopeManager.finishedResolving = true;
              return result;
            }, function (errs) {
              Array.prototype.push.apply(errors, errs);
            });
          });
        })).then(function (resolved) {
          if (errors.length !== 0) {
            if (_this3.options.errorLogging) {
              logErrors(errors, _this3.options.errorLogging);
            }
            throwMultiError(errors);
          }
          return concatArrays(resolved);
        });
      });
    }
  }, {
    key: "reorderModules",
    value: function reorderModules() {
      this.modules = stableSort(this.modules, function (m1, m2) {
        return (m2.priority || 0) - (m1.priority || 0);
      });
    }
  }, {
    key: "compile",
    value: function compile() {
      var _this4 = this;
      this.reorderModules();
      if (Object.keys(this.compiled).length) {
        return this;
      }
      this.options = this.modules.reduce(function (options, module) {
        return module.optionsTransformer(options, _this4);
      }, this.options);
      this.options.xmlFileNames = uniq(this.options.xmlFileNames);
      this.xmlDocuments = this.options.xmlFileNames.reduce(function (xmlDocuments, fileName) {
        var content = _this4.zip.files[fileName].asText();
        xmlDocuments[fileName] = str2xml(content);
        return xmlDocuments;
      }, {});
      this.setModules({
        zip: this.zip,
        xmlDocuments: this.xmlDocuments
      });
      this.getTemplatedFiles();
      // Loop inside all templatedFiles (ie xml files with content).
      // Sometimes they don't exist (footer.xml for example)
      this.templatedFiles.forEach(function (fileName) {
        if (_this4.zip.files[fileName] != null) {
          _this4.precompileFile(fileName);
        }
      });
      this.templatedFiles.forEach(function (fileName) {
        if (_this4.zip.files[fileName] != null) {
          _this4.compileFile(fileName);
        }
      });
      this.setModules({
        compiled: this.compiled
      });
      verifyErrors(this);
      return this;
    }
  }, {
    key: "getRelsTypes",
    value: function getRelsTypes() {
      var rootRels = this.zip.files[relsFile];
      var rootRelsXml = rootRels ? str2xml(rootRels.asText()) : null;
      var rootRelationships = rootRelsXml ? rootRelsXml.getElementsByTagName("Relationship") : [];
      var relsTypes = {};
      for (var i = 0, len = rootRelationships.length; i < len; i++) {
        var r = rootRelationships[i];
        relsTypes[r.getAttribute("Target")] = r.getAttribute("Type");
      }
      return relsTypes;
    }
  }, {
    key: "getContentTypes",
    value: function getContentTypes() {
      var contentTypes = this.zip.files[ctXML];
      var contentTypeXml = contentTypes ? str2xml(contentTypes.asText()) : null;
      var overrides = contentTypeXml ? contentTypeXml.getElementsByTagName("Override") : null;
      var defaults = contentTypeXml ? contentTypeXml.getElementsByTagName("Default") : null;
      return {
        overrides: overrides,
        defaults: defaults,
        contentTypes: contentTypes,
        contentTypeXml: contentTypeXml
      };
    }
  }, {
    key: "updateFileTypeConfig",
    value: function updateFileTypeConfig() {
      var _this5 = this;
      var fileType;
      if (this.zip.files.mimetype) {
        fileType = "odt";
      }
      this.relsTypes = this.getRelsTypes();
      var _this$getContentTypes = this.getContentTypes(),
        overrides = _this$getContentTypes.overrides,
        defaults = _this$getContentTypes.defaults,
        contentTypes = _this$getContentTypes.contentTypes,
        contentTypeXml = _this$getContentTypes.contentTypeXml;
      if (contentTypeXml) {
        this.filesContentTypes = collectContentTypes(overrides, defaults, this.zip);
        this.invertedContentTypes = DocUtils.invertMap(this.filesContentTypes);
        this.setModules({
          contentTypes: this.contentTypes,
          invertedContentTypes: this.invertedContentTypes
        });
      }
      this.modules.forEach(function (module) {
        fileType = module.getFileType({
          zip: _this5.zip,
          contentTypes: contentTypes,
          contentTypeXml: contentTypeXml,
          overrides: overrides,
          defaults: defaults,
          doc: _this5
        }) || fileType;
      });
      if (fileType === "odt") {
        throwFileTypeNotHandled(fileType);
      }
      if (!fileType) {
        throwFileTypeNotIdentified();
      }
      this.fileType = fileType;
      dropUnsupportedFileTypesModules(this);
      this.fileTypeConfig = this.options.fileTypeConfig || this.fileTypeConfig || Docxtemplater.FileTypeConfig[this.fileType]();
      return this;
    }
  }, {
    key: "renderAsync",
    value: function renderAsync(data) {
      var _this6 = this;
      return this.resolveData(data).then(function () {
        return _this6.render();
      });
    }
  }, {
    key: "render",
    value: function render(data) {
      var _this7 = this;
      if (this.rendered) {
        throwRenderTwice();
      }
      this.rendered = true;
      this.compile();
      if (this.errors.length > 0) {
        throwRenderInvalidTemplate();
      }
      if (data) {
        this.setData(data);
      }
      this.setModules({
        data: this.data,
        Lexer: Lexer
      });
      this.mapper = this.mapper || this.modules.reduce(function (value, module) {
        return module.getRenderedMap(value);
      }, {});
      Object.keys(this.mapper).forEach(function (to) {
        var _this7$mapper$to = _this7.mapper[to],
          from = _this7$mapper$to.from,
          data = _this7$mapper$to.data;
        var currentFile = _this7.compiled[from];
        currentFile.scopeManager = _this7.getScopeManager(to, currentFile, data);
        currentFile.render(to);
        _this7.zip.file(to, currentFile.content, {
          createFolders: true
        });
      });
      verifyErrors(this);
      this.sendEvent("syncing-zip");
      this.syncZip();
      return this;
    }
  }, {
    key: "syncZip",
    value: function syncZip() {
      var _this8 = this;
      Object.keys(this.xmlDocuments).forEach(function (fileName) {
        _this8.zip.remove(fileName);
        var content = xml2str(_this8.xmlDocuments[fileName]);
        return _this8.zip.file(fileName, content, {
          createFolders: true
        });
      });
    }
  }, {
    key: "setData",
    value: function setData(data) {
      this.data = data;
      return this;
    }
  }, {
    key: "getZip",
    value: function getZip() {
      return this.zip;
    }
  }, {
    key: "createTemplateClass",
    value: function createTemplateClass(path) {
      var content = this.zip.files[path].asText();
      return this.createTemplateClassFromContent(content, path);
    }
  }, {
    key: "createTemplateClassFromContent",
    value: function createTemplateClassFromContent(content, filePath) {
      var _this9 = this;
      var xmltOptions = {
        filePath: filePath,
        contentType: this.filesContentTypes[filePath],
        relsType: this.relsTypes[filePath]
      };
      Object.keys(defaults).concat(["filesContentTypes", "fileTypeConfig", "fileType", "modules"]).forEach(function (key) {
        xmltOptions[key] = _this9[key];
      });
      return new Docxtemplater.XmlTemplater(content, xmltOptions);
    }
  }, {
    key: "getFullText",
    value: function getFullText(path) {
      return this.createTemplateClass(path || this.fileTypeConfig.textPath(this)).getFullText();
    }
  }, {
    key: "getTemplatedFiles",
    value: function getTemplatedFiles() {
      var _this10 = this;
      this.templatedFiles = this.fileTypeConfig.getTemplatedFiles(this.zip);
      this.targets.forEach(function (target) {
        _this10.templatedFiles.push(target);
      });
      this.templatedFiles = uniq(this.templatedFiles);
      return this.templatedFiles;
    }
  }]);
  return Docxtemplater;
}();
function verifyErrors(doc) {
  var compiled = doc.compiled;
  doc.errors = concatArrays(Object.keys(compiled).map(function (name) {
    return compiled[name].allErrors;
  }));
  if (doc.errors.length !== 0) {
    if (doc.options.errorLogging) {
      logErrors(doc.errors, doc.options.errorLogging);
    }
    throwMultiError(doc.errors);
  }
}
Docxtemplater.DocUtils = DocUtils;
Docxtemplater.Errors = __webpack_require__(/*! ./errors.js */ "./node_modules/docxtemplater/js/errors.js");
Docxtemplater.XmlTemplater = __webpack_require__(/*! ./xml-templater.js */ "./node_modules/docxtemplater/js/xml-templater.js");
Docxtemplater.FileTypeConfig = __webpack_require__(/*! ./file-type-config.js */ "./node_modules/docxtemplater/js/file-type-config.js");
Docxtemplater.XmlMatcher = __webpack_require__(/*! ./xml-matcher.js */ "./node_modules/docxtemplater/js/xml-matcher.js");
module.exports = Docxtemplater;

/***/ }),

/***/ "./node_modules/docxtemplater/js/error-logger.js":
/*!*******************************************************!*\
  !*** ./node_modules/docxtemplater/js/error-logger.js ***!
  \*******************************************************/
/***/ ((module) => {

"use strict";


// The error thrown here contains additional information when logged with JSON.stringify (it contains a properties object containing all suberrors).
function replaceErrors(key, value) {
  if (value instanceof Error) {
    return Object.getOwnPropertyNames(value).concat("stack").reduce(function (error, key) {
      error[key] = value[key];
      if (key === "stack") {
        // This is used because in Firefox, stack is not an own property
        error[key] = value[key].toString();
      }
      return error;
    }, {});
  }
  return value;
}
function logger(error, logging) {
  // eslint-disable-next-line no-console
  console.log(JSON.stringify({
    error: error
  }, replaceErrors, logging === "json" ? 2 : null));
  if (error.properties && error.properties.errors instanceof Array) {
    var errorMessages = error.properties.errors.map(function (error) {
      return error.properties.explanation;
    }).join("\n");
    // eslint-disable-next-line no-console
    console.log("errorMessages", errorMessages);
    // errorMessages is a humanly readable message looking like this :
    // 'The tag beginning with "foobar" is unopened'
  }
}

module.exports = logger;

/***/ }),

/***/ "./node_modules/docxtemplater/js/errors.js":
/*!*************************************************!*\
  !*** ./node_modules/docxtemplater/js/errors.js ***!
  \*************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
var _require = __webpack_require__(/*! ./utils.js */ "./node_modules/docxtemplater/js/utils.js"),
  last = _require.last,
  first = _require.first;
function XTError(message) {
  this.name = "GenericError";
  this.message = message;
  this.stack = new Error(message).stack;
}
XTError.prototype = Error.prototype;
function XTTemplateError(message) {
  this.name = "TemplateError";
  this.message = message;
  this.stack = new Error(message).stack;
}
XTTemplateError.prototype = new XTError();
function XTRenderingError(message) {
  this.name = "RenderingError";
  this.message = message;
  this.stack = new Error(message).stack;
}
XTRenderingError.prototype = new XTError();
function XTScopeParserError(message) {
  this.name = "ScopeParserError";
  this.message = message;
  this.stack = new Error(message).stack;
}
XTScopeParserError.prototype = new XTError();
function XTInternalError(message) {
  this.name = "InternalError";
  this.properties = {
    explanation: "InternalError"
  };
  this.message = message;
  this.stack = new Error(message).stack;
}
XTInternalError.prototype = new XTError();
function XTAPIVersionError(message) {
  this.name = "APIVersionError";
  this.properties = {
    explanation: "APIVersionError"
  };
  this.message = message;
  this.stack = new Error(message).stack;
}
XTAPIVersionError.prototype = new XTError();
function throwApiVersionError(msg, properties) {
  var err = new XTAPIVersionError(msg);
  err.properties = _objectSpread({
    id: "api_version_error"
  }, properties);
  throw err;
}
function throwMultiError(errors) {
  var err = new XTTemplateError("Multi error");
  err.properties = {
    errors: errors,
    id: "multi_error",
    explanation: "The template has multiple errors"
  };
  throw err;
}
function getUnopenedTagException(options) {
  var err = new XTTemplateError("Unopened tag");
  err.properties = {
    xtag: last(options.xtag.split(" ")),
    id: "unopened_tag",
    context: options.xtag,
    offset: options.offset,
    lIndex: options.lIndex,
    explanation: "The tag beginning with \"".concat(options.xtag.substr(0, 10), "\" is unopened")
  };
  return err;
}
function getDuplicateOpenTagException(options) {
  var err = new XTTemplateError("Duplicate open tag, expected one open tag");
  err.properties = {
    xtag: first(options.xtag.split(" ")),
    id: "duplicate_open_tag",
    context: options.xtag,
    offset: options.offset,
    lIndex: options.lIndex,
    explanation: "The tag beginning with \"".concat(options.xtag.substr(0, 10), "\" has duplicate open tags")
  };
  return err;
}
function getDuplicateCloseTagException(options) {
  var err = new XTTemplateError("Duplicate close tag, expected one close tag");
  err.properties = {
    xtag: first(options.xtag.split(" ")),
    id: "duplicate_close_tag",
    context: options.xtag,
    offset: options.offset,
    lIndex: options.lIndex,
    explanation: "The tag ending with \"".concat(options.xtag.substr(0, 10), "\" has duplicate close tags")
  };
  return err;
}
function getUnclosedTagException(options) {
  var err = new XTTemplateError("Unclosed tag");
  err.properties = {
    xtag: first(options.xtag.split(" ")).substr(1),
    id: "unclosed_tag",
    context: options.xtag,
    offset: options.offset,
    lIndex: options.lIndex,
    explanation: "The tag beginning with \"".concat(options.xtag.substr(0, 10), "\" is unclosed")
  };
  return err;
}
function throwXmlTagNotFound(options) {
  var err = new XTTemplateError("No tag \"".concat(options.element, "\" was found at the ").concat(options.position));
  var part = options.parsed[options.index];
  err.properties = {
    id: "no_xml_tag_found_at_".concat(options.position),
    explanation: "No tag \"".concat(options.element, "\" was found at the ").concat(options.position),
    offset: part.offset,
    part: part,
    parsed: options.parsed,
    index: options.index,
    element: options.element
  };
  throw err;
}
function getCorruptCharactersException(_ref) {
  var tag = _ref.tag,
    value = _ref.value,
    offset = _ref.offset;
  var err = new XTRenderingError("There are some XML corrupt characters");
  err.properties = {
    id: "invalid_xml_characters",
    xtag: tag,
    value: value,
    offset: offset,
    explanation: "There are some corrupt characters for the field ".concat(tag)
  };
  return err;
}
function getInvalidRawXMLValueException(_ref2) {
  var tag = _ref2.tag,
    value = _ref2.value,
    offset = _ref2.offset;
  var err = new XTRenderingError("Non string values are not allowed for rawXML tags");
  err.properties = {
    id: "invalid_raw_xml_value",
    xtag: tag,
    value: value,
    offset: offset,
    explanation: "The value of the raw tag : '".concat(tag, "' is not a string")
  };
  return err;
}
function throwExpandNotFound(options) {
  var _options$part = options.part,
    value = _options$part.value,
    offset = _options$part.offset,
    _options$id = options.id,
    id = _options$id === void 0 ? "raw_tag_outerxml_invalid" : _options$id,
    _options$message = options.message,
    message = _options$message === void 0 ? "Raw tag not in paragraph" : _options$message;
  var part = options.part;
  var _options$explanation = options.explanation,
    explanation = _options$explanation === void 0 ? "The tag \"".concat(value, "\" is not inside a paragraph") : _options$explanation;
  if (typeof explanation === "function") {
    explanation = explanation(part);
  }
  var err = new XTTemplateError(message);
  err.properties = {
    id: id,
    explanation: explanation,
    rootError: options.rootError,
    xtag: value,
    offset: offset,
    postparsed: options.postparsed,
    expandTo: options.expandTo,
    index: options.index
  };
  throw err;
}
function throwRawTagShouldBeOnlyTextInParagraph(options) {
  var err = new XTTemplateError("Raw tag should be the only text in paragraph");
  var tag = options.part.value;
  err.properties = {
    id: "raw_xml_tag_should_be_only_text_in_paragraph",
    explanation: "The raw tag \"".concat(tag, "\" should be the only text in this paragraph. This means that this tag should not be surrounded by any text or spaces."),
    xtag: tag,
    offset: options.part.offset,
    paragraphParts: options.paragraphParts
  };
  throw err;
}
function getUnmatchedLoopException(part) {
  var location = part.location,
    offset = part.offset;
  var t = location === "start" ? "unclosed" : "unopened";
  var T = location === "start" ? "Unclosed" : "Unopened";
  var err = new XTTemplateError("".concat(T, " loop"));
  var tag = part.value;
  err.properties = {
    id: "".concat(t, "_loop"),
    explanation: "The loop with tag \"".concat(tag, "\" is ").concat(t),
    xtag: tag,
    offset: offset
  };
  return err;
}
function getUnbalancedLoopException(pair, lastPair) {
  var err = new XTTemplateError("Unbalanced loop tag");
  var lastL = lastPair[0].part.value;
  var lastR = lastPair[1].part.value;
  var l = pair[0].part.value;
  var r = pair[1].part.value;
  err.properties = {
    id: "unbalanced_loop_tags",
    explanation: "Unbalanced loop tags {#".concat(lastL, "}{/").concat(lastR, "}{#").concat(l, "}{/").concat(r, "}"),
    offset: [lastPair[0].part.offset, pair[1].part.offset],
    lastPair: {
      left: lastPair[0].part.value,
      right: lastPair[1].part.value
    },
    pair: {
      left: pair[0].part.value,
      right: pair[1].part.value
    }
  };
  return err;
}
function getClosingTagNotMatchOpeningTag(_ref3) {
  var tags = _ref3.tags;
  var err = new XTTemplateError("Closing tag does not match opening tag");
  err.properties = {
    id: "closing_tag_does_not_match_opening_tag",
    explanation: "The tag \"".concat(tags[0].value, "\" is closed by the tag \"").concat(tags[1].value, "\""),
    openingtag: first(tags).value,
    offset: [first(tags).offset, last(tags).offset],
    closingtag: last(tags).value
  };
  return err;
}
function getScopeCompilationError(_ref4) {
  var tag = _ref4.tag,
    rootError = _ref4.rootError,
    offset = _ref4.offset;
  var err = new XTScopeParserError("Scope parser compilation failed");
  err.properties = {
    id: "scopeparser_compilation_failed",
    offset: offset,
    xtag: tag,
    explanation: "The scope parser for the tag \"".concat(tag, "\" failed to compile"),
    rootError: rootError
  };
  return err;
}
function getScopeParserExecutionError(_ref5) {
  var tag = _ref5.tag,
    scope = _ref5.scope,
    error = _ref5.error,
    offset = _ref5.offset;
  var err = new XTScopeParserError("Scope parser execution failed");
  err.properties = {
    id: "scopeparser_execution_failed",
    explanation: "The scope parser for the tag ".concat(tag, " failed to execute"),
    scope: scope,
    offset: offset,
    xtag: tag,
    rootError: error
  };
  return err;
}
function getLoopPositionProducesInvalidXMLError(_ref6) {
  var tag = _ref6.tag,
    offset = _ref6.offset;
  var err = new XTTemplateError("The position of the loop tags \"".concat(tag, "\" would produce invalid XML"));
  err.properties = {
    xtag: tag,
    id: "loop_position_invalid",
    explanation: "The tags \"".concat(tag, "\" are misplaced in the document, for example one of them is in a table and the other one outside the table"),
    offset: offset
  };
  return err;
}
function throwUnimplementedTagType(part, index) {
  var errorMsg = "Unimplemented tag type \"".concat(part.type, "\"");
  if (part.module) {
    errorMsg += " \"".concat(part.module, "\"");
  }
  var err = new XTTemplateError(errorMsg);
  err.properties = {
    part: part,
    index: index,
    id: "unimplemented_tag_type"
  };
  throw err;
}
function throwMalformedXml() {
  var err = new XTInternalError("Malformed xml");
  err.properties = {
    explanation: "The template contains malformed xml",
    id: "malformed_xml"
  };
  throw err;
}
function throwResolveBeforeCompile() {
  var err = new XTInternalError("You must run `.compile()` before running `.resolveData()`");
  err.properties = {
    id: "resolve_before_compile",
    explanation: "You must run `.compile()` before running `.resolveData()`"
  };
  throw err;
}
function throwRenderInvalidTemplate() {
  var err = new XTInternalError("You should not call .render on a document that had compilation errors");
  err.properties = {
    id: "render_on_invalid_template",
    explanation: "You should not call .render on a document that had compilation errors"
  };
  throw err;
}
function throwRenderTwice() {
  var err = new XTInternalError("You should not call .render twice on the same docxtemplater instance");
  err.properties = {
    id: "render_twice",
    explanation: "You should not call .render twice on the same docxtemplater instance"
  };
  throw err;
}
function throwFileTypeNotIdentified() {
  var err = new XTInternalError("The filetype for this file could not be identified, is this file corrupted ?");
  err.properties = {
    id: "filetype_not_identified",
    explanation: "The filetype for this file could not be identified, is this file corrupted ?"
  };
  throw err;
}
function throwXmlInvalid(content, offset) {
  var err = new XTTemplateError("An XML file has invalid xml");
  err.properties = {
    id: "file_has_invalid_xml",
    content: content,
    offset: offset,
    explanation: "The docx contains invalid XML, it is most likely corrupt"
  };
  throw err;
}
function throwFileTypeNotHandled(fileType) {
  var err = new XTInternalError("The filetype \"".concat(fileType, "\" is not handled by docxtemplater"));
  err.properties = {
    id: "filetype_not_handled",
    explanation: "The file you are trying to generate is of type \"".concat(fileType, "\", but only docx and pptx formats are handled"),
    fileType: fileType
  };
  throw err;
}
module.exports = {
  XTError: XTError,
  XTTemplateError: XTTemplateError,
  XTInternalError: XTInternalError,
  XTScopeParserError: XTScopeParserError,
  XTAPIVersionError: XTAPIVersionError,
  // Remove this alias in v4
  RenderingError: XTRenderingError,
  XTRenderingError: XTRenderingError,
  getClosingTagNotMatchOpeningTag: getClosingTagNotMatchOpeningTag,
  getLoopPositionProducesInvalidXMLError: getLoopPositionProducesInvalidXMLError,
  getScopeCompilationError: getScopeCompilationError,
  getScopeParserExecutionError: getScopeParserExecutionError,
  getUnclosedTagException: getUnclosedTagException,
  getUnopenedTagException: getUnopenedTagException,
  getUnmatchedLoopException: getUnmatchedLoopException,
  getDuplicateCloseTagException: getDuplicateCloseTagException,
  getDuplicateOpenTagException: getDuplicateOpenTagException,
  getCorruptCharactersException: getCorruptCharactersException,
  getInvalidRawXMLValueException: getInvalidRawXMLValueException,
  getUnbalancedLoopException: getUnbalancedLoopException,
  throwApiVersionError: throwApiVersionError,
  throwFileTypeNotHandled: throwFileTypeNotHandled,
  throwFileTypeNotIdentified: throwFileTypeNotIdentified,
  throwMalformedXml: throwMalformedXml,
  throwMultiError: throwMultiError,
  throwExpandNotFound: throwExpandNotFound,
  throwRawTagShouldBeOnlyTextInParagraph: throwRawTagShouldBeOnlyTextInParagraph,
  throwUnimplementedTagType: throwUnimplementedTagType,
  throwXmlTagNotFound: throwXmlTagNotFound,
  throwXmlInvalid: throwXmlInvalid,
  throwResolveBeforeCompile: throwResolveBeforeCompile,
  throwRenderInvalidTemplate: throwRenderInvalidTemplate,
  throwRenderTwice: throwRenderTwice
};

/***/ }),

/***/ "./node_modules/docxtemplater/js/file-type-config.js":
/*!***********************************************************!*\
  !*** ./node_modules/docxtemplater/js/file-type-config.js ***!
  \***********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var loopModule = __webpack_require__(/*! ./modules/loop.js */ "./node_modules/docxtemplater/js/modules/loop.js");
var spacePreserveModule = __webpack_require__(/*! ./modules/space-preserve.js */ "./node_modules/docxtemplater/js/modules/space-preserve.js");
var rawXmlModule = __webpack_require__(/*! ./modules/rawxml.js */ "./node_modules/docxtemplater/js/modules/rawxml.js");
var expandPairTrait = __webpack_require__(/*! ./modules/expand-pair-trait.js */ "./node_modules/docxtemplater/js/modules/expand-pair-trait.js");
var render = __webpack_require__(/*! ./modules/render.js */ "./node_modules/docxtemplater/js/modules/render.js");
function DocXFileTypeConfig() {
  return {
    getTemplatedFiles: function getTemplatedFiles() {
      return [];
    },
    textPath: function textPath(doc) {
      return doc.targets[0];
    },
    tagsXmlTextArray: ["Company", "HyperlinkBase", "Manager", "cp:category", "cp:keywords", "dc:creator", "dc:description", "dc:subject", "dc:title", "cp:contentStatus", "w:t", "m:t", "vt:lpstr", "vt:lpwstr"],
    tagsXmlLexedArray: ["w:proofState", "w:tc", "w:tr", "w:tbl", "w:body", "w:document", "w:p", "w:r", "w:br", "w:rPr", "w:pPr", "w:spacing", "w:sdtContent", "w:drawing", "w:sectPr", "w:type", "w:headerReference", "w:footerReference", "w:bookmarkStart", "w:bookmarkEnd", "w:commentRangeStart", "w:commentRangeEnd", "w:commentReference"],
    droppedTagsInsidePlaceholder: ["w:p", "w:br", "w:bookmarkStart", "w:bookmarkEnd"],
    expandTags: [{
      contains: "w:tc",
      expand: "w:tr"
    }],
    onParagraphLoop: [{
      contains: "w:p",
      expand: "w:p",
      onlyTextInTag: true
    }],
    tagRawXml: "w:p",
    baseModules: [loopModule, spacePreserveModule, expandPairTrait, rawXmlModule, render],
    tagShouldContain: [{
      tag: "w:tbl",
      shouldContain: ["w:tr"],
      drop: true
    }, {
      tag: "w:tc",
      shouldContain: ["w:p"],
      value: "<w:p></w:p>"
    }, {
      tag: "w:sdtContent",
      shouldContain: ["w:p", "w:r", "w:commentRangeStart"],
      value: "<w:p></w:p>"
    }]
  };
}
function PptXFileTypeConfig() {
  return {
    getTemplatedFiles: function getTemplatedFiles() {
      return [];
    },
    textPath: function textPath(doc) {
      return doc.targets[0];
    },
    tagsXmlTextArray: ["Company", "HyperlinkBase", "Manager", "cp:category", "cp:keywords", "dc:creator", "dc:description", "dc:subject", "dc:title", "a:t", "m:t", "vt:lpstr", "vt:lpwstr"],
    tagsXmlLexedArray: ["p:sp", "a:tc", "a:tr", "a:tbl", "a:p", "a:r", "a:rPr", "p:txBody", "a:txBody", "a:off", "a:ext", "p:graphicFrame", "p:xfrm", "a16:rowId", "a:endParaRPr"],
    droppedTagsInsidePlaceholder: ["a:p", "a:endParaRPr"],
    expandTags: [{
      contains: "a:tc",
      expand: "a:tr"
    }],
    onParagraphLoop: [{
      contains: "a:p",
      expand: "a:p",
      onlyTextInTag: true
    }],
    tagRawXml: "p:sp",
    baseModules: [loopModule, expandPairTrait, rawXmlModule, render],
    tagShouldContain: [{
      tag: "a:tbl",
      shouldContain: ["a:tr"],
      drop: true
    }, {
      tag: "p:txBody",
      shouldContain: ["a:p"],
      value: "<a:p></a:p>"
    }, {
      tag: "a:txBody",
      shouldContain: ["a:p"],
      value: "<a:p></a:p>"
    }]
  };
}
module.exports = {
  docx: DocXFileTypeConfig,
  pptx: PptXFileTypeConfig
};

/***/ }),

/***/ "./node_modules/docxtemplater/js/filetypes.js":
/*!****************************************************!*\
  !*** ./node_modules/docxtemplater/js/filetypes.js ***!
  \****************************************************/
/***/ ((module) => {

"use strict";


var docxContentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml";
var docxmContentType = "application/vnd.ms-word.document.macroEnabled.main+xml";
var dotxContentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.template.main+xml";
var dotmContentType = "application/vnd.ms-word.template.macroEnabledTemplate.main+xml";
var headerContentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.header+xml";
var footnotesContentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.footnotes+xml";
var footerContentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml";
var pptxContentType = "application/vnd.openxmlformats-officedocument.presentationml.slide+xml";
var pptxSlideMaster = "application/vnd.openxmlformats-officedocument.presentationml.slideMaster+xml";
var pptxSlideLayout = "application/vnd.openxmlformats-officedocument.presentationml.slideLayout+xml";
var pptxPresentationContentType = "application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml";
var main = [docxContentType, docxmContentType, dotxContentType, dotmContentType];
var filetypes = {
  main: main,
  docx: [].concat(main, [headerContentType, footerContentType, footnotesContentType]),
  pptx: [pptxContentType, pptxSlideMaster, pptxSlideLayout, pptxPresentationContentType]
};
module.exports = filetypes;

/***/ }),

/***/ "./node_modules/docxtemplater/js/join-uncorrupt.js":
/*!*********************************************************!*\
  !*** ./node_modules/docxtemplater/js/join-uncorrupt.js ***!
  \*********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var _require = __webpack_require__(/*! ./doc-utils.js */ "./node_modules/docxtemplater/js/doc-utils.js"),
  startsWith = _require.startsWith,
  endsWith = _require.endsWith,
  isStarting = _require.isStarting,
  isEnding = _require.isEnding,
  isWhiteSpace = _require.isWhiteSpace;
var filetypes = __webpack_require__(/*! ./filetypes.js */ "./node_modules/docxtemplater/js/filetypes.js");
function addEmptyParagraphAfterTable(parts) {
  var lastNonEmpty = "";
  for (var i = 0, len = parts.length; i < len; i++) {
    var p = parts[i];
    if (isWhiteSpace(p)) {
      continue;
    }
    if (endsWith(lastNonEmpty, "</w:tbl>")) {
      if (!startsWith(p, "<w:p") && !startsWith(p, "<w:tbl") && !startsWith(p, "<w:sectPr")) {
        p = "<w:p/>".concat(p);
      }
    }
    lastNonEmpty = p;
    parts[i] = p;
  }
  return parts;
}

// eslint-disable-next-line complexity
function joinUncorrupt(parts, options) {
  var contains = options.fileTypeConfig.tagShouldContain || [];
  /* Before doing this "uncorruption" method here, this was done with the
   * `part.emptyValue` trick, however, there were some corruptions that were
   * not handled, for example with a template like this :
   *
   * ------------------------------------------------
   * | {-w:p falsy}My para{/falsy}   |              |
   * | {-w:p falsy}My para{/falsy}   |              |
   */
  var collecting = "";
  var currentlyCollecting = -1;
  if (filetypes.docx.indexOf(options.contentType) !== -1) {
    parts = addEmptyParagraphAfterTable(parts);
  }
  var startIndex = -1;
  for (var i = 0, len = parts.length; i < len; i++) {
    var part = parts[i];
    for (var j = 0, len2 = contains.length; j < len2; j++) {
      var _contains$j = contains[j],
        tag = _contains$j.tag,
        shouldContain = _contains$j.shouldContain,
        value = _contains$j.value,
        drop = _contains$j.drop;
      if (currentlyCollecting === j) {
        if (isEnding(part, tag)) {
          currentlyCollecting = -1;
          if (drop) {
            for (var k = startIndex; k <= i; k++) {
              parts[k] = "";
            }
          } else {
            for (var _k = startIndex; _k < i; _k++) {
              parts[_k] = "";
            }
            parts[i] = collecting + value + part;
          }
          break;
        }
        collecting += part;
        for (var _k2 = 0, len3 = shouldContain.length; _k2 < len3; _k2++) {
          var sc = shouldContain[_k2];
          if (isStarting(part, sc)) {
            currentlyCollecting = -1;
            // parts[i] = collecting;
            break;
          }
        }
        if (currentlyCollecting > -1) {
          // parts[i] = "";
        }
        break;
      }
      if (currentlyCollecting === -1 && isStarting(part, tag) &&
      // to verify that the part doesn't have multiple tags, such as <w:tc><w:p>
      part.substr(1).indexOf("<") === -1) {
        // self-closing tag such as <w:t/>
        if (part[part.length - 2] === "/") {
          parts[i] = "";
          break;
        } else {
          startIndex = i;
          currentlyCollecting = j;
          collecting = part;
          // parts[i] = "";
          break;
        }
      }
    }
  }
  return parts;
}
module.exports = joinUncorrupt;

/***/ }),

/***/ "./node_modules/docxtemplater/js/lexer.js":
/*!************************************************!*\
  !*** ./node_modules/docxtemplater/js/lexer.js ***!
  \************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function _iterableToArrayLimit(arr, i) { var _i = null == arr ? null : "undefined" != typeof Symbol && arr[Symbol.iterator] || arr["@@iterator"]; if (null != _i) { var _s, _e, _x, _r, _arr = [], _n = !0, _d = !1; try { if (_x = (_i = _i.call(arr)).next, 0 === i) { if (Object(_i) !== _i) return; _n = !1; } else for (; !(_n = (_s = _x.call(_i)).done) && (_arr.push(_s.value), _arr.length !== i); _n = !0); } catch (err) { _d = !0, _e = err; } finally { try { if (!_n && null != _i["return"] && (_r = _i["return"](), Object(_r) !== _r)) return; } finally { if (_d) throw _e; } } return _arr; } }
function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }
var _require = __webpack_require__(/*! ./errors.js */ "./node_modules/docxtemplater/js/errors.js"),
  getUnclosedTagException = _require.getUnclosedTagException,
  getUnopenedTagException = _require.getUnopenedTagException,
  getDuplicateOpenTagException = _require.getDuplicateOpenTagException,
  getDuplicateCloseTagException = _require.getDuplicateCloseTagException,
  throwMalformedXml = _require.throwMalformedXml,
  throwXmlInvalid = _require.throwXmlInvalid,
  XTTemplateError = _require.XTTemplateError;
var _require2 = __webpack_require__(/*! ./doc-utils.js */ "./node_modules/docxtemplater/js/doc-utils.js"),
  isTextStart = _require2.isTextStart,
  isTextEnd = _require2.isTextEnd,
  wordToUtf8 = _require2.wordToUtf8;
var DELIMITER_NONE = 0,
  DELIMITER_EQUAL = 1,
  DELIMITER_START = 2,
  DELIMITER_END = 3;
function inRange(range, match) {
  return range[0] <= match.offset && match.offset < range[1];
}
function updateInTextTag(part, inTextTag) {
  if (isTextStart(part)) {
    if (inTextTag) {
      throwMalformedXml();
    }
    return true;
  }
  if (isTextEnd(part)) {
    if (!inTextTag) {
      throwMalformedXml();
    }
    return false;
  }
  return inTextTag;
}
function getTag(tag) {
  var position = "";
  var start = 1;
  var end = tag.indexOf(" ");
  if (tag[tag.length - 2] === "/") {
    position = "selfclosing";
    if (end === -1) {
      end = tag.length - 2;
    }
  } else if (tag[1] === "/") {
    start = 2;
    position = "end";
    if (end === -1) {
      end = tag.length - 1;
    }
  } else {
    position = "start";
    if (end === -1) {
      end = tag.length - 1;
    }
  }
  return {
    tag: tag.slice(start, end),
    position: position
  };
}
function tagMatcher(content, textMatchArray, othersMatchArray) {
  var cursor = 0;
  var contentLength = content.length;
  var allMatches = {};
  for (var i = 0, len = textMatchArray.length; i < len; i++) {
    allMatches[textMatchArray[i]] = true;
  }
  for (var _i = 0, _len = othersMatchArray.length; _i < _len; _i++) {
    allMatches[othersMatchArray[_i]] = false;
  }
  var totalMatches = [];
  while (cursor < contentLength) {
    cursor = content.indexOf("<", cursor);
    if (cursor === -1) {
      break;
    }
    var offset = cursor;
    var nextOpening = content.indexOf("<", cursor + 1);
    cursor = content.indexOf(">", cursor);
    if (cursor === -1 || nextOpening !== -1 && cursor > nextOpening) {
      throwXmlInvalid(content, offset);
    }
    var tagText = content.slice(offset, cursor + 1);
    var _getTag = getTag(tagText),
      tag = _getTag.tag,
      position = _getTag.position;
    var text = allMatches[tag];
    if (text == null) {
      continue;
    }
    totalMatches.push({
      type: "tag",
      position: position,
      text: text,
      offset: offset,
      value: tagText,
      tag: tag
    });
  }
  return totalMatches;
}
function getDelimiterErrors(delimiterMatches, fullText) {
  var errors = [];
  var inDelimiter = false;
  var lastDelimiterMatch = {
    offset: 0
  };
  var xtag;
  delimiterMatches.forEach(function (delimiterMatch) {
    xtag = fullText.substr(lastDelimiterMatch.offset, delimiterMatch.offset - lastDelimiterMatch.offset);
    if (delimiterMatch.position === "start" && inDelimiter || delimiterMatch.position === "end" && !inDelimiter) {
      if (delimiterMatch.position === "start") {
        if (lastDelimiterMatch.offset + lastDelimiterMatch.length === delimiterMatch.offset) {
          xtag = fullText.substr(lastDelimiterMatch.offset, delimiterMatch.offset - lastDelimiterMatch.offset + lastDelimiterMatch.length + 4);
          errors.push(getDuplicateOpenTagException({
            xtag: xtag,
            offset: lastDelimiterMatch.offset
          }));
        } else {
          errors.push(getUnclosedTagException({
            xtag: wordToUtf8(xtag),
            offset: lastDelimiterMatch.offset
          }));
        }
        delimiterMatch.error = true;
      } else {
        if (lastDelimiterMatch.offset + lastDelimiterMatch.length === delimiterMatch.offset) {
          xtag = fullText.substr(lastDelimiterMatch.offset - 4, delimiterMatch.offset - lastDelimiterMatch.offset + 4 + lastDelimiterMatch.length);
          errors.push(getDuplicateCloseTagException({
            xtag: xtag,
            offset: lastDelimiterMatch.offset
          }));
        } else {
          errors.push(getUnopenedTagException({
            xtag: xtag,
            offset: delimiterMatch.offset
          }));
        }
        delimiterMatch.error = true;
      }
    } else {
      inDelimiter = !inDelimiter;
    }
    lastDelimiterMatch = delimiterMatch;
  });
  var delimiterMatch = {
    offset: fullText.length
  };
  xtag = fullText.substr(lastDelimiterMatch.offset, delimiterMatch.offset - lastDelimiterMatch.offset);
  if (inDelimiter) {
    errors.push(getUnclosedTagException({
      xtag: wordToUtf8(xtag),
      offset: lastDelimiterMatch.offset
    }));
    delimiterMatch.error = true;
  }
  return errors;
}
function compareOffsets(startOffset, endOffset) {
  if (startOffset === -1 && endOffset === -1) {
    return DELIMITER_NONE;
  }
  if (startOffset === endOffset) {
    return DELIMITER_EQUAL;
  }
  if (startOffset === -1 || endOffset === -1) {
    return endOffset < startOffset ? DELIMITER_START : DELIMITER_END;
  }
  return startOffset < endOffset ? DELIMITER_START : DELIMITER_END;
}
function splitDelimiters(inside) {
  var newDelimiters = inside.split(" ");
  if (newDelimiters.length !== 2) {
    var err = new XTTemplateError("New Delimiters cannot be parsed");
    err.properties = {
      id: "change_delimiters_invalid",
      explanation: "Cannot parser delimiters"
    };
    throw err;
  }
  var _newDelimiters = _slicedToArray(newDelimiters, 2),
    start = _newDelimiters[0],
    end = _newDelimiters[1];
  if (start.length === 0 || end.length === 0) {
    var _err = new XTTemplateError("New Delimiters cannot be parsed");
    _err.properties = {
      id: "change_delimiters_invalid",
      explanation: "Cannot parser delimiters"
    };
    throw _err;
  }
  return [start, end];
}
function getAllDelimiterIndexes(fullText, delimiters) {
  var indexes = [];
  var start = delimiters.start,
    end = delimiters.end;
  var offset = -1;
  var insideTag = false;
  while (true) {
    var startOffset = fullText.indexOf(start, offset + 1);
    var endOffset = fullText.indexOf(end, offset + 1);
    var position = null;
    var len = void 0;
    var compareResult = compareOffsets(startOffset, endOffset);
    if (compareResult === DELIMITER_EQUAL) {
      compareResult = insideTag ? DELIMITER_END : DELIMITER_START;
    }
    switch (compareResult) {
      case DELIMITER_NONE:
        return indexes;
      case DELIMITER_END:
        insideTag = false;
        offset = endOffset;
        position = "end";
        len = end.length;
        break;
      case DELIMITER_START:
        insideTag = true;
        offset = startOffset;
        position = "start";
        len = start.length;
        break;
    }
    // if tag starts with =, such as {=[ ]=}
    if (compareResult === DELIMITER_START && fullText[offset + start.length] === "=") {
      indexes.push({
        offset: startOffset,
        position: "start",
        length: start.length,
        changedelimiter: true
      });
      var nextEqual = fullText.indexOf("=", offset + start.length + 1);
      var nextEndOffset = fullText.indexOf(end, nextEqual + 1);
      indexes.push({
        offset: nextEndOffset,
        position: "end",
        length: end.length,
        changedelimiter: true
      });
      var _insideTag = fullText.substr(offset + start.length + 1, nextEqual - offset - start.length - 1);
      var _splitDelimiters = splitDelimiters(_insideTag);
      var _splitDelimiters2 = _slicedToArray(_splitDelimiters, 2);
      start = _splitDelimiters2[0];
      end = _splitDelimiters2[1];
      offset = nextEndOffset;
      continue;
    }
    indexes.push({
      offset: offset,
      position: position,
      length: len
    });
  }
}
function parseDelimiters(innerContentParts, delimiters) {
  var full = innerContentParts.map(function (p) {
    return p.value;
  }).join("");
  var delimiterMatches = getAllDelimiterIndexes(full, delimiters);
  var offset = 0;
  var ranges = innerContentParts.map(function (part) {
    offset += part.value.length;
    return {
      offset: offset - part.value.length,
      lIndex: part.lIndex
    };
  });
  var errors = getDelimiterErrors(delimiterMatches, full, ranges);
  var cutNext = 0;
  var delimiterIndex = 0;
  var parsed = ranges.map(function (p, i) {
    var offset = p.offset;
    var range = [offset, offset + innerContentParts[i].value.length];
    var partContent = innerContentParts[i].value;
    var delimitersInOffset = [];
    while (delimiterIndex < delimiterMatches.length && inRange(range, delimiterMatches[delimiterIndex])) {
      delimitersInOffset.push(delimiterMatches[delimiterIndex]);
      delimiterIndex++;
    }
    var parts = [];
    var cursor = 0;
    if (cutNext > 0) {
      cursor = cutNext;
      cutNext = 0;
    }
    delimitersInOffset.forEach(function (delimiterInOffset) {
      var value = partContent.substr(cursor, delimiterInOffset.offset - offset - cursor);
      if (delimiterInOffset.changedelimiter) {
        if (delimiterInOffset.position === "start") {
          if (value.length > 0) {
            parts.push({
              type: "content",
              value: value
            });
          }
        } else {
          cursor = delimiterInOffset.offset - offset + delimiterInOffset.length;
        }
        return;
      }
      if (value.length > 0) {
        parts.push({
          type: "content",
          value: value
        });
        cursor += value.length;
      }
      var delimiterPart = {
        type: "delimiter",
        position: delimiterInOffset.position,
        offset: cursor + offset
      };
      parts.push(delimiterPart);
      cursor = delimiterInOffset.offset - offset + delimiterInOffset.length;
    });
    cutNext = cursor - partContent.length;
    var value = partContent.substr(cursor);
    if (value.length > 0) {
      parts.push({
        type: "content",
        value: value
      });
    }
    return parts;
  }, this);
  return {
    parsed: parsed,
    errors: errors
  };
}
function isInsideContent(part) {
  // Stryker disable all : because the part.position === "insidetag" would be enough but we want to make the API future proof
  return part.type === "content" && part.position === "insidetag";
  // Stryker restore all
}

function getContentParts(xmlparsed) {
  return xmlparsed.filter(isInsideContent);
}
function decodeContentParts(xmlparsed) {
  var inTextTag = false;
  xmlparsed.forEach(function (part) {
    inTextTag = updateInTextTag(part, inTextTag);
    if (part.type === "content") {
      part.position = inTextTag ? "insidetag" : "outsidetag";
    }
    if (isInsideContent(part)) {
      part.value = part.value.replace(/>/g, "&gt;");
    }
  });
}
module.exports = {
  parseDelimiters: parseDelimiters,
  parse: function parse(xmlparsed, delimiters) {
    decodeContentParts(xmlparsed);
    var _parseDelimiters = parseDelimiters(getContentParts(xmlparsed), delimiters),
      delimiterParsed = _parseDelimiters.parsed,
      errors = _parseDelimiters.errors;
    var lexed = [];
    var index = 0;
    var lIndex = 0;
    xmlparsed.forEach(function (part) {
      if (isInsideContent(part)) {
        Array.prototype.push.apply(lexed, delimiterParsed[index].map(function (p) {
          if (p.type === "content") {
            p.position = "insidetag";
          }
          p.lIndex = lIndex++;
          return p;
        }));
        index++;
      } else {
        part.lIndex = lIndex++;
        lexed.push(part);
      }
    });
    return {
      errors: errors,
      lexed: lexed
    };
  },
  xmlparse: function xmlparse(content, xmltags) {
    var matches = tagMatcher(content, xmltags.text, xmltags.other);
    var cursor = 0;
    var parsed = matches.reduce(function (parsed, match) {
      var value = content.substr(cursor, match.offset - cursor);
      if (value.length > 0) {
        parsed.push({
          type: "content",
          value: value
        });
      }
      cursor = match.offset + match.value.length;
      delete match.offset;
      parsed.push(match);
      return parsed;
    }, []);
    var value = content.substr(cursor);
    if (value.length > 0) {
      parsed.push({
        type: "content",
        value: value
      });
    }
    return parsed;
  }
};

/***/ }),

/***/ "./node_modules/docxtemplater/js/merge-sort.js":
/*!*****************************************************!*\
  !*** ./node_modules/docxtemplater/js/merge-sort.js ***!
  \*****************************************************/
/***/ ((module) => {

"use strict";


function getMinFromArrays(arrays, state) {
  var minIndex = -1;
  for (var i = 0, l = arrays.length; i < l; i++) {
    if (state[i] >= arrays[i].length) {
      continue;
    }
    if (minIndex === -1 || arrays[i][state[i]].offset < arrays[minIndex][state[minIndex]].offset) {
      minIndex = i;
    }
  }
  return minIndex;
}
module.exports = function (arrays) {
  var totalLength = arrays.reduce(function (sum, array) {
    return sum + array.length;
  }, 0);
  arrays = arrays.filter(function (array) {
    return array.length > 0;
  });
  var resultArray = new Array(totalLength);
  var state = arrays.map(function () {
    return 0;
  });
  for (var i = 0; i < totalLength; i++) {
    var arrayIndex = getMinFromArrays(arrays, state);
    resultArray[i] = arrays[arrayIndex][state[arrayIndex]];
    state[arrayIndex]++;
  }
  return resultArray;
};

/***/ }),

/***/ "./node_modules/docxtemplater/js/module-wrapper.js":
/*!*********************************************************!*\
  !*** ./node_modules/docxtemplater/js/module-wrapper.js ***!
  \*********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var _require = __webpack_require__(/*! ./errors.js */ "./node_modules/docxtemplater/js/errors.js"),
  XTInternalError = _require.XTInternalError;
function emptyFun() {}
function identity(i) {
  return i;
}
module.exports = function (module) {
  var defaults = {
    set: emptyFun,
    matchers: function matchers() {
      return [];
    },
    parse: emptyFun,
    render: emptyFun,
    getTraits: emptyFun,
    getFileType: emptyFun,
    nullGetter: emptyFun,
    optionsTransformer: identity,
    postrender: identity,
    errorsTransformer: identity,
    getRenderedMap: identity,
    preparse: identity,
    postparse: identity,
    on: emptyFun,
    resolve: emptyFun
  };
  if (Object.keys(defaults).every(function (key) {
    return !module[key];
  })) {
    var err = new XTInternalError("This module cannot be wrapped, because it doesn't define any of the necessary functions");
    err.properties = {
      id: "module_cannot_be_wrapped",
      explanation: "This module cannot be wrapped, because it doesn't define any of the necessary functions"
    };
    throw err;
  }
  Object.keys(defaults).forEach(function (key) {
    module[key] = module[key] || defaults[key];
  });
  return module;
};

/***/ }),

/***/ "./node_modules/docxtemplater/js/modules/common.js":
/*!*********************************************************!*\
  !*** ./node_modules/docxtemplater/js/modules/common.js ***!
  \*********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
var wrapper = __webpack_require__(/*! ../module-wrapper.js */ "./node_modules/docxtemplater/js/module-wrapper.js");
var filetypes = __webpack_require__(/*! ../filetypes.js */ "./node_modules/docxtemplater/js/filetypes.js");
var coreContentType = "application/vnd.openxmlformats-package.core-properties+xml";
var appContentType = "application/vnd.openxmlformats-officedocument.extended-properties+xml";
var customContentType = "application/vnd.openxmlformats-officedocument.custom-properties+xml";
var settingsContentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.settings+xml";
var commonContentTypes = [settingsContentType, coreContentType, appContentType, customContentType];
var Common = /*#__PURE__*/function () {
  function Common() {
    _classCallCheck(this, Common);
    this.name = "Common";
  }
  _createClass(Common, [{
    key: "getFileType",
    value: function getFileType(_ref) {
      var doc = _ref.doc;
      var invertedContentTypes = doc.invertedContentTypes;
      if (!invertedContentTypes) {
        return;
      }
      var keys = Object.keys(filetypes);
      var ftCandidate;
      for (var i = 0, len = keys.length; i < len; i++) {
        var contentTypes = filetypes[keys[i]];
        for (var j = 0, len2 = contentTypes.length; j < len2; j++) {
          var ct = contentTypes[j];
          if (invertedContentTypes[ct]) {
            for (var k = 0, _len = invertedContentTypes[ct].length; k < _len; k++) {
              var target = invertedContentTypes[ct][k];
              if (doc.relsTypes[target] && ["http://purl.oclc.org/ooxml/officeDocument/relationships/officeDocument", "http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument"].indexOf(doc.relsTypes[target]) === -1) {
                continue;
              }
              ftCandidate = keys[i];
              doc.targets.push(target);
            }
          }
        }
      }
      for (var _j = 0, _len2 = commonContentTypes.length; _j < _len2; _j++) {
        var _ct = commonContentTypes[_j];
        if (invertedContentTypes[_ct]) {
          Array.prototype.push.apply(doc.targets, invertedContentTypes[_ct]);
        }
      }
      return ftCandidate;
    }
  }]);
  return Common;
}();
module.exports = function () {
  return wrapper(new Common());
};

/***/ }),

/***/ "./node_modules/docxtemplater/js/modules/expand-pair-trait.js":
/*!********************************************************************!*\
  !*** ./node_modules/docxtemplater/js/modules/expand-pair-trait.js ***!
  \********************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
var traitName = "expandPair";
var mergeSort = __webpack_require__(/*! ../merge-sort.js */ "./node_modules/docxtemplater/js/merge-sort.js");
var _require = __webpack_require__(/*! ../doc-utils.js */ "./node_modules/docxtemplater/js/doc-utils.js"),
  getLeft = _require.getLeft,
  getRight = _require.getRight;
var wrapper = __webpack_require__(/*! ../module-wrapper.js */ "./node_modules/docxtemplater/js/module-wrapper.js");
var _require2 = __webpack_require__(/*! ../traits.js */ "./node_modules/docxtemplater/js/traits.js"),
  getExpandToDefault = _require2.getExpandToDefault;
var _require3 = __webpack_require__(/*! ../errors.js */ "./node_modules/docxtemplater/js/errors.js"),
  getUnmatchedLoopException = _require3.getUnmatchedLoopException,
  getClosingTagNotMatchOpeningTag = _require3.getClosingTagNotMatchOpeningTag,
  getUnbalancedLoopException = _require3.getUnbalancedLoopException;
function getOpenCountChange(part) {
  switch (part.location) {
    case "start":
      return 1;
    case "end":
      return -1;
  }
}
function match(start, end) {
  return start != null && end != null && (start.part.location === "start" && end.part.location === "end" && start.part.value === end.part.value || end.part.value === "");
}
function transformer(traits) {
  var i = 0;
  var errors = [];
  while (i < traits.length) {
    var part = traits[i].part;
    if (part.location === "end") {
      if (i === 0) {
        traits.splice(0, 1);
        errors.push(getUnmatchedLoopException(part));
        return {
          traits: traits,
          errors: errors
        };
      }
      var endIndex = i;
      var startIndex = i - 1;
      var offseter = 1;
      if (match(traits[startIndex], traits[endIndex])) {
        traits.splice(endIndex, 1);
        traits.splice(startIndex, 1);
        return {
          errors: errors,
          traits: traits
        };
      }
      while (offseter < 50) {
        var startCandidate = traits[startIndex - offseter];
        var endCandidate = traits[endIndex + offseter];
        if (match(startCandidate, traits[endIndex])) {
          traits.splice(endIndex, 1);
          traits.splice(startIndex - offseter, 1);
          return {
            errors: errors,
            traits: traits
          };
        }
        if (match(traits[startIndex], endCandidate)) {
          traits.splice(endIndex + offseter, 1);
          traits.splice(startIndex, 1);
          return {
            errors: errors,
            traits: traits
          };
        }
        offseter++;
      }
      errors.push(getClosingTagNotMatchOpeningTag({
        tags: [traits[startIndex].part, traits[endIndex].part]
      }));
      traits.splice(endIndex, 1);
      traits.splice(startIndex, 1);
      return {
        traits: traits,
        errors: errors
      };
    }
    i++;
  }
  traits.forEach(function (_ref) {
    var part = _ref.part;
    errors.push(getUnmatchedLoopException(part));
  });
  return {
    traits: [],
    errors: errors
  };
}
function getPairs(traits) {
  var levelTraits = {};
  var errors = [];
  var pairs = [];
  var transformedTraits = [];
  for (var i = 0; i < traits.length; i++) {
    transformedTraits.push(traits[i]);
  }
  while (transformedTraits.length > 0) {
    var result = transformer(transformedTraits);
    errors = errors.concat(result.errors);
    transformedTraits = result.traits;
  }

  // Stryker disable all : because this check makes the function return quicker
  if (errors.length > 0) {
    return {
      pairs: pairs,
      errors: errors
    };
  }
  // Stryker restore all
  var countOpen = 0;
  for (var _i = 0; _i < traits.length; _i++) {
    var currentTrait = traits[_i];
    var part = currentTrait.part;
    var change = getOpenCountChange(part);
    countOpen += change;
    if (change === 1) {
      levelTraits[countOpen] = currentTrait;
    } else {
      var startTrait = levelTraits[countOpen + 1];
      if (countOpen === 0) {
        pairs = pairs.concat([[startTrait, currentTrait]]);
      }
    }
    countOpen = countOpen >= 0 ? countOpen : 0;
  }
  return {
    pairs: pairs,
    errors: errors
  };
}
var ExpandPairTrait = /*#__PURE__*/function () {
  function ExpandPairTrait() {
    _classCallCheck(this, ExpandPairTrait);
    this.name = "ExpandPairTrait";
  }
  _createClass(ExpandPairTrait, [{
    key: "clone",
    value: function clone() {
      return new ExpandPairTrait();
    }
  }, {
    key: "optionsTransformer",
    value: function optionsTransformer(options, docxtemplater) {
      this.expandTags = docxtemplater.fileTypeConfig.expandTags.concat(docxtemplater.options.paragraphLoop ? docxtemplater.fileTypeConfig.onParagraphLoop : []);
      return options;
    }
  }, {
    key: "postparse",
    value: function postparse(postparsed, _ref2) {
      var _this = this;
      var getTraits = _ref2.getTraits,
        _postparse = _ref2.postparse;
      var traits = getTraits(traitName, postparsed);
      traits = traits.map(function (trait) {
        return trait || [];
      });
      traits = mergeSort(traits);
      var _getPairs = getPairs(traits),
        pairs = _getPairs.pairs,
        errors = _getPairs.errors;
      var lastRight = 0;
      var lastPair = null;
      var expandedPairs = pairs.map(function (pair) {
        var expandTo = pair[0].part.expandTo;
        if (expandTo === "auto") {
          var result = getExpandToDefault(postparsed, pair, _this.expandTags);
          if (result.error) {
            errors.push(result.error);
          }
          expandTo = result.value;
        }
        if (!expandTo) {
          var _left = pair[0].offset;
          var _right = pair[1].offset;
          if (_left < lastRight) {
            errors.push(getUnbalancedLoopException(pair, lastPair));
          }
          lastPair = pair;
          lastRight = _right;
          return [_left, _right];
        }
        var left, right;
        try {
          left = getLeft(postparsed, expandTo, pair[0].offset);
        } catch (e) {
          errors.push(e);
        }
        try {
          right = getRight(postparsed, expandTo, pair[1].offset);
        } catch (e) {
          errors.push(e);
        }
        if (left < lastRight) {
          errors.push(getUnbalancedLoopException(pair, lastPair));
        }
        lastRight = right;
        lastPair = pair;
        return [left, right];
      });

      // Stryker disable all : because this check makes the function return quicker
      if (errors.length > 0) {
        return {
          postparsed: postparsed,
          errors: errors
        };
      }
      // Stryker restore all

      var currentPairIndex = 0;
      var innerParts;
      var newParsed = postparsed.reduce(function (newParsed, part, i) {
        var inPair = currentPairIndex < pairs.length && expandedPairs[currentPairIndex][0] <= i && i <= expandedPairs[currentPairIndex][1];
        var pair = pairs[currentPairIndex];
        var expandedPair = expandedPairs[currentPairIndex];
        if (!inPair) {
          newParsed.push(part);
          return newParsed;
        }
        if (expandedPair[0] === i) {
          innerParts = [];
        }
        if (pair[0].offset !== i && pair[1].offset !== i) {
          innerParts.push(part);
        }
        if (expandedPair[1] === i) {
          var basePart = postparsed[pair[0].offset];
          basePart.subparsed = _postparse(innerParts, {
            basePart: basePart
          });
          delete basePart.location;
          delete basePart.expandTo;
          newParsed.push(basePart);
          currentPairIndex++;
        }
        return newParsed;
      }, []);
      return {
        postparsed: newParsed,
        errors: errors
      };
    }
  }]);
  return ExpandPairTrait;
}();
module.exports = function () {
  return wrapper(new ExpandPairTrait());
};

/***/ }),

/***/ "./node_modules/docxtemplater/js/modules/loop.js":
/*!*******************************************************!*\
  !*** ./node_modules/docxtemplater/js/modules/loop.js ***!
  \*******************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }
function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }
function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function _iterableToArrayLimit(arr, i) { var _i = null == arr ? null : "undefined" != typeof Symbol && arr[Symbol.iterator] || arr["@@iterator"]; if (null != _i) { var _s, _e, _x, _r, _arr = [], _n = !0, _d = !1; try { if (_x = (_i = _i.call(arr)).next, 0 === i) { if (Object(_i) !== _i) return; _n = !1; } else for (; !(_n = (_s = _x.call(_i)).done) && (_arr.push(_s.value), _arr.length !== i); _n = !0); } catch (err) { _d = !0, _e = err; } finally { try { if (!_n && null != _i["return"] && (_r = _i["return"](), Object(_r) !== _r)) return; } finally { if (_d) throw _e; } } return _arr; } }
function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
var _require = __webpack_require__(/*! ../doc-utils.js */ "./node_modules/docxtemplater/js/doc-utils.js"),
  chunkBy = _require.chunkBy,
  last = _require.last,
  isParagraphStart = _require.isParagraphStart,
  isModule = _require.isModule,
  isParagraphEnd = _require.isParagraphEnd,
  isContent = _require.isContent,
  startsWith = _require.startsWith,
  isTagEnd = _require.isTagEnd,
  isTagStart = _require.isTagStart,
  getSingleAttribute = _require.getSingleAttribute,
  setSingleAttribute = _require.setSingleAttribute;
var filetypes = __webpack_require__(/*! ../filetypes.js */ "./node_modules/docxtemplater/js/filetypes.js");
var wrapper = __webpack_require__(/*! ../module-wrapper.js */ "./node_modules/docxtemplater/js/module-wrapper.js");
var moduleName = "loop";
function hasContent(parts) {
  return parts.some(function (part) {
    return isContent(part);
  });
}
function getFirstMeaningFulPart(parsed) {
  for (var i = 0, len = parsed.length; i < len; i++) {
    if (parsed[i].type !== "content") {
      return parsed[i];
    }
  }
  return null;
}
function isInsideParagraphLoop(part) {
  var firstMeaningfulPart = getFirstMeaningFulPart(part.subparsed);
  return firstMeaningfulPart != null && firstMeaningfulPart.tag !== "w:t";
}
function getPageBreakIfApplies(part) {
  return part.hasPageBreak && isInsideParagraphLoop(part) ? '<w:p><w:r><w:br w:type="page"/></w:r></w:p>' : "";
}
function isEnclosedByParagraphs(parsed) {
  return parsed.length && isParagraphStart(parsed[0]) && isParagraphEnd(last(parsed));
}
function getOffset(chunk) {
  return hasContent(chunk) ? 0 : chunk.length;
}
function addPageBreakAtEnd(subRendered) {
  var j = subRendered.parts.length - 1;
  if (subRendered.parts[j] === "</w:p>") {
    subRendered.parts.splice(j, 0, '<w:r><w:br w:type="page"/></w:r>');
  } else {
    subRendered.parts.push('<w:p><w:r><w:br w:type="page"/></w:r></w:p>');
  }
}
function addPageBreakAtBeginning(subRendered) {
  subRendered.parts.unshift('<w:p><w:r><w:br w:type="page"/></w:r></w:p>');
}
function isContinuous(parts) {
  return parts.some(function (part) {
    return isTagStart("w:type", part) && part.value.indexOf("continuous") !== -1;
  });
}
function isNextPage(parts) {
  return parts.some(function (part) {
    return isTagStart("w:type", part) && part.value.indexOf('w:val="nextPage"') !== -1;
  });
}
function addSectionBefore(parts, sect) {
  return ["<w:p><w:pPr>".concat(sect.map(function (_ref) {
    var value = _ref.value;
    return value;
  }).join(""), "</w:pPr></w:p>")].concat(parts);
}
function addContinuousType(parts) {
  var stop = false;
  var inSectPr = false;
  return parts.reduce(function (result, part) {
    if (stop === false && startsWith(part, "<w:sectPr")) {
      inSectPr = true;
    }
    if (inSectPr) {
      if (startsWith(part, "<w:type")) {
        stop = true;
      }
      if (stop === false && startsWith(part, "</w:sectPr")) {
        result.push('<w:type w:val="continuous"/>');
      }
    }
    result.push(part);
    return result;
  }, []);
}
function dropHeaderFooterRefs(parts) {
  return parts.filter(function (text) {
    return !startsWith(text, "<w:headerReference") && !startsWith(text, "<w:footerReference");
  });
}
function hasPageBreak(chunk) {
  return chunk.some(function (part) {
    return part.tag === "w:br" && part.value.indexOf('w:type="page"') !== -1;
  });
}
function hasImage(chunk) {
  return chunk.some(function (_ref2) {
    var tag = _ref2.tag;
    return tag === "w:drawing";
  });
}
function getSectPr(chunks) {
  var collectSectPr = false;
  var sectPrs = [];
  chunks.forEach(function (part) {
    if (isTagStart("w:sectPr", part)) {
      sectPrs.push([]);
      collectSectPr = true;
    }
    if (collectSectPr) {
      sectPrs[sectPrs.length - 1].push(part);
    }
    if (isTagEnd("w:sectPr", part)) {
      collectSectPr = false;
    }
  });
  return sectPrs;
}
function getSectPrHeaderFooterChangeCount(chunks) {
  var collectSectPr = false;
  var sectPrCount = 0;
  chunks.forEach(function (part) {
    if (isTagStart("w:sectPr", part)) {
      collectSectPr = true;
    }
    if (collectSectPr) {
      if (part.tag === "w:headerReference" || part.tag === "w:footerReference") {
        sectPrCount++;
        collectSectPr = false;
      }
    }
    if (isTagEnd("w:sectPr", part)) {
      collectSectPr = false;
    }
  });
  return sectPrCount;
}
function getLastSectPr(parsed) {
  var sectPr = [];
  var inSectPr = false;
  for (var i = parsed.length - 1; i >= 0; i--) {
    var part = parsed[i];
    if (isTagEnd("w:sectPr", part)) {
      inSectPr = true;
    }
    if (isTagStart("w:sectPr", part)) {
      sectPr.unshift(part.value);
      inSectPr = false;
    }
    if (inSectPr) {
      sectPr.unshift(part.value);
    }
    if (isParagraphStart(part)) {
      if (sectPr.length > 0) {
        return sectPr.join("");
      }
      break;
    }
  }
  return "";
}
var LoopModule = /*#__PURE__*/function () {
  function LoopModule() {
    _classCallCheck(this, LoopModule);
    this.name = "LoopModule";
    this.inXfrm = false;
    this.totalSectPr = 0;
    this.prefix = {
      start: "#",
      end: "/",
      dash: /^-([^\s]+)\s(.+)/,
      inverted: "^"
    };
  }
  _createClass(LoopModule, [{
    key: "optionsTransformer",
    value: function optionsTransformer(opts, docxtemplater) {
      this.docxtemplater = docxtemplater;
      return opts;
    }
  }, {
    key: "preparse",
    value: function preparse(parsed, _ref3) {
      var contentType = _ref3.contentType;
      if (filetypes.main.indexOf(contentType) !== -1) {
        this.sects = getSectPr(parsed);
      }
    }
  }, {
    key: "matchers",
    value: function matchers() {
      var module = moduleName;
      return [[this.prefix.start, module, {
        expandTo: "auto",
        location: "start",
        inverted: false
      }], [this.prefix.inverted, module, {
        expandTo: "auto",
        location: "start",
        inverted: true
      }], [this.prefix.end, module, {
        location: "end"
      }], [this.prefix.dash, module, function (_ref4) {
        var _ref5 = _slicedToArray(_ref4, 3),
          expandTo = _ref5[1],
          value = _ref5[2];
        return {
          location: "start",
          inverted: false,
          expandTo: expandTo,
          value: value
        };
      }]];
    }
  }, {
    key: "getTraits",
    value: function getTraits(traitName, parsed) {
      // Stryker disable all : because getTraits should disappear in v4
      if (traitName !== "expandPair") {
        return;
      }
      // Stryker restore all

      return parsed.reduce(function (tags, part, offset) {
        if (isModule(part, moduleName) && part.subparsed == null) {
          tags.push({
            part: part,
            offset: offset
          });
        }
        return tags;
      }, []);
    }
  }, {
    key: "postparse",
    value: function postparse(parsed, _ref6) {
      var basePart = _ref6.basePart;
      if (basePart && this.docxtemplater.fileType === "docx" && parsed.length > 0) {
        basePart.sectPrCount = getSectPrHeaderFooterChangeCount(parsed);
        this.totalSectPr += basePart.sectPrCount;
        var sects = this.sects;
        sects.some(function (sect, index) {
          if (basePart.lIndex < sect[0].lIndex) {
            if (index + 1 < sects.length && isContinuous(sects[index + 1])) {
              basePart.addContinuousType = true;
            }
            return true;
          }
          if (parsed[0].lIndex < sect[0].lIndex && sect[0].lIndex < basePart.lIndex) {
            if (isNextPage(sects[index])) {
              basePart.addNextPage = {
                index: index
              };
            }
            return true;
          }
        });
        basePart.lastParagrapSectPr = getLastSectPr(parsed);
      }
      if (!basePart || basePart.expandTo !== "auto" || basePart.module !== moduleName || !isEnclosedByParagraphs(parsed)) {
        return parsed;
      }
      basePart.paragraphLoop = true;
      var level = 0;
      var chunks = chunkBy(parsed, function (p) {
        if (isParagraphStart(p)) {
          level++;
          if (level === 1) {
            return "start";
          }
        }
        if (isParagraphEnd(p)) {
          level--;
          if (level === 0) {
            return "end";
          }
        }
        return null;
      });
      var firstChunk = chunks[0];
      var lastChunk = last(chunks);
      var firstOffset = getOffset(firstChunk);
      var lastOffset = getOffset(lastChunk);
      basePart.hasPageBreakBeginning = hasPageBreak(firstChunk);
      basePart.hasPageBreak = hasPageBreak(lastChunk);
      if (hasImage(firstChunk)) {
        firstOffset = 0;
      }
      if (hasImage(lastChunk)) {
        lastOffset = 0;
      }
      return parsed.slice(firstOffset, parsed.length - lastOffset);
    }
  }, {
    key: "resolve",
    value: function resolve(part, options) {
      if (!isModule(part, moduleName)) {
        return null;
      }
      var sm = options.scopeManager;
      var promisedValue = sm.getValueAsync(part.value, {
        part: part
      });
      var promises = [];
      function loopOver(scope, i, length) {
        var scopeManager = sm.createSubScopeManager(scope, part.value, i, part, length);
        promises.push(options.resolve({
          filePath: options.filePath,
          modules: options.modules,
          baseNullGetter: options.baseNullGetter,
          resolve: options.resolve,
          compiled: part.subparsed,
          tags: {},
          scopeManager: scopeManager
        }));
      }
      var errorList = [];
      return promisedValue.then(function (values) {
        return new Promise(function (resolve) {
          if (values instanceof Array) {
            Promise.all(values).then(resolve);
          } else {
            resolve(values);
          }
        }).then(function (values) {
          sm.loopOverValue(values, loopOver, part.inverted);
          return Promise.all(promises).then(function (r) {
            return r.map(function (_ref7) {
              var resolved = _ref7.resolved,
                errors = _ref7.errors;
              errorList.push.apply(errorList, _toConsumableArray(errors));
              return resolved;
            });
          }).then(function (value) {
            if (errorList.length > 0) {
              throw errorList;
            }
            return value;
          });
        });
      });
    }
    // eslint-disable-next-line complexity
  }, {
    key: "render",
    value: function render(part, options) {
      if (part.tag === "p:xfrm") {
        this.inXfrm = part.position === "start";
      }
      if (part.tag === "a:ext" && this.inXfrm) {
        this.lastExt = part;
        return part;
      }
      if (!isModule(part, moduleName)) {
        return null;
      }
      var totalValue = [];
      var errors = [];
      var heightOffset = 0;
      var self = this;
      var firstTag = part.subparsed[0];
      var tagHeight = 0;
      if ((firstTag === null || firstTag === void 0 ? void 0 : firstTag.tag) === "a:tr") {
        tagHeight = +getSingleAttribute(firstTag.value, "h");
      }
      heightOffset -= tagHeight;
      var a16RowIdOffset = 0;
      var insideParagraphLoop = isInsideParagraphLoop(part);

      // eslint-disable-next-line complexity
      function loopOver(scope, i, length) {
        heightOffset += tagHeight;
        var scopeManager = options.scopeManager.createSubScopeManager(scope, part.value, i, part, length);
        part.subparsed.forEach(function (pp) {
          if (isTagStart("a16:rowId", pp)) {
            var val = +getSingleAttribute(pp.value, "val") + a16RowIdOffset;
            a16RowIdOffset = 1;
            pp.value = setSingleAttribute(pp.value, "val", val);
          }
        });
        var subRendered = options.render(_objectSpread(_objectSpread({}, options), {}, {
          compiled: part.subparsed,
          tags: {},
          scopeManager: scopeManager
        }));
        if (part.hasPageBreak && i === length - 1 && insideParagraphLoop) {
          addPageBreakAtEnd(subRendered);
        }
        var isNotFirst = scopeManager.scopePathItem.some(function (i) {
          return i !== 0;
        });
        if (isNotFirst) {
          if (part.sectPrCount === 1) {
            subRendered.parts = dropHeaderFooterRefs(subRendered.parts);
          }
          if (part.addContinuousType) {
            subRendered.parts = addContinuousType(subRendered.parts);
          }
        } else if (part.addNextPage) {
          subRendered.parts = addSectionBefore(subRendered.parts, self.sects[part.addNextPage.index]);
        }
        if (part.addNextPage) {
          addPageBreakAtEnd(subRendered);
        }
        if (part.hasPageBreakBeginning && insideParagraphLoop) {
          addPageBreakAtBeginning(subRendered);
        }
        for (var _i2 = 0, len = subRendered.parts.length; _i2 < len; _i2++) {
          totalValue.push(subRendered.parts[_i2]);
        }
        Array.prototype.push.apply(errors, subRendered.errors);
      }
      var result = options.scopeManager.loopOver(part.value, loopOver, part.inverted, {
        part: part
      });
      // if the loop is showing empty content
      if (result === false) {
        if (part.lastParagrapSectPr) {
          if (part.paragraphLoop) {
            return {
              value: "<w:p><w:pPr>".concat(part.lastParagrapSectPr, "</w:pPr></w:p>")
            };
          }
          return {
            value: "</w:t></w:r></w:p><w:p><w:pPr>".concat(part.lastParagrapSectPr, "</w:pPr><w:r><w:t>")
          };
        }
        return {
          value: getPageBreakIfApplies(part) || "",
          errors: errors
        };
      }
      if (heightOffset !== 0) {
        var cy = +getSingleAttribute(this.lastExt.value, "cy");
        this.lastExt.value = setSingleAttribute(this.lastExt.value, "cy", cy + heightOffset);
      }
      return {
        value: options.joinUncorrupt(totalValue, _objectSpread(_objectSpread({}, options), {}, {
          basePart: part
        })),
        errors: errors
      };
    }
  }]);
  return LoopModule;
}();
module.exports = function () {
  return wrapper(new LoopModule());
};

/***/ }),

/***/ "./node_modules/docxtemplater/js/modules/rawxml.js":
/*!*********************************************************!*\
  !*** ./node_modules/docxtemplater/js/modules/rawxml.js ***!
  \*********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
var traits = __webpack_require__(/*! ../traits.js */ "./node_modules/docxtemplater/js/traits.js");
var _require = __webpack_require__(/*! ../doc-utils.js */ "./node_modules/docxtemplater/js/doc-utils.js"),
  isContent = _require.isContent;
var _require2 = __webpack_require__(/*! ../errors.js */ "./node_modules/docxtemplater/js/errors.js"),
  throwRawTagShouldBeOnlyTextInParagraph = _require2.throwRawTagShouldBeOnlyTextInParagraph,
  getInvalidRawXMLValueException = _require2.getInvalidRawXMLValueException;
var moduleName = "rawxml";
var wrapper = __webpack_require__(/*! ../module-wrapper.js */ "./node_modules/docxtemplater/js/module-wrapper.js");
function getInner(_ref) {
  var part = _ref.part,
    left = _ref.left,
    right = _ref.right,
    postparsed = _ref.postparsed,
    index = _ref.index;
  var paragraphParts = postparsed.slice(left + 1, right);
  paragraphParts.forEach(function (p, i) {
    if (i === index - left - 1) {
      return;
    }
    if (isContent(p)) {
      throwRawTagShouldBeOnlyTextInParagraph({
        paragraphParts: paragraphParts,
        part: part
      });
    }
  });
  return part;
}
var RawXmlModule = /*#__PURE__*/function () {
  function RawXmlModule() {
    _classCallCheck(this, RawXmlModule);
    this.name = "RawXmlModule";
    this.prefix = "@";
  }
  _createClass(RawXmlModule, [{
    key: "optionsTransformer",
    value: function optionsTransformer(options, docxtemplater) {
      this.fileTypeConfig = docxtemplater.fileTypeConfig;
      return options;
    }
  }, {
    key: "matchers",
    value: function matchers() {
      return [[this.prefix, moduleName]];
    }
  }, {
    key: "postparse",
    value: function postparse(postparsed) {
      return traits.expandToOne(postparsed, {
        moduleName: moduleName,
        getInner: getInner,
        expandTo: this.fileTypeConfig.tagRawXml,
        error: {
          message: "Raw tag not in paragraph",
          id: "raw_tag_outerxml_invalid",
          explanation: function explanation(part) {
            return "The tag \"".concat(part.value, "\" is not inside a paragraph, putting raw tags inside an inline loop is disallowed.");
          }
        }
      });
    }
  }, {
    key: "render",
    value: function render(part, options) {
      if (part.module !== moduleName) {
        return null;
      }
      var value;
      var errors = [];
      try {
        value = options.scopeManager.getValue(part.value, {
          part: part
        });
        if (value == null) {
          value = options.nullGetter(part);
        }
      } catch (e) {
        errors.push(e);
        return {
          errors: errors
        };
      }
      value = value ? value : "";
      if (typeof value === "string") {
        return {
          value: value
        };
      }
      return {
        errors: [getInvalidRawXMLValueException({
          tag: part.value,
          value: value,
          offset: part.offset
        })]
      };
    }
  }]);
  return RawXmlModule;
}();
module.exports = function () {
  return wrapper(new RawXmlModule());
};

/***/ }),

/***/ "./node_modules/docxtemplater/js/modules/render.js":
/*!*********************************************************!*\
  !*** ./node_modules/docxtemplater/js/modules/render.js ***!
  \*********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
var wrapper = __webpack_require__(/*! ../module-wrapper.js */ "./node_modules/docxtemplater/js/module-wrapper.js");
var _require = __webpack_require__(/*! ../errors.js */ "./node_modules/docxtemplater/js/errors.js"),
  getScopeCompilationError = _require.getScopeCompilationError;
var _require2 = __webpack_require__(/*! ../doc-utils.js */ "./node_modules/docxtemplater/js/doc-utils.js"),
  utf8ToWord = _require2.utf8ToWord,
  hasCorruptCharacters = _require2.hasCorruptCharacters;
var _require3 = __webpack_require__(/*! ../errors.js */ "./node_modules/docxtemplater/js/errors.js"),
  getCorruptCharactersException = _require3.getCorruptCharactersException;
var ftprefix = {
  docx: "w",
  pptx: "a"
};
var Render = /*#__PURE__*/function () {
  function Render() {
    _classCallCheck(this, Render);
    this.name = "Render";
    this.recordRun = false;
    this.recordedRun = [];
  }
  _createClass(Render, [{
    key: "optionsTransformer",
    value: function optionsTransformer(options, docxtemplater) {
      this.parser = docxtemplater.parser;
      this.fileType = docxtemplater.fileType;
      return options;
    }
  }, {
    key: "set",
    value: function set(obj) {
      if (obj.compiled) {
        this.compiled = obj.compiled;
      }
      if (obj.data != null) {
        this.data = obj.data;
      }
    }
  }, {
    key: "getRenderedMap",
    value: function getRenderedMap(mapper) {
      var _this = this;
      return Object.keys(this.compiled).reduce(function (mapper, from) {
        mapper[from] = {
          from: from,
          data: _this.data
        };
        return mapper;
      }, mapper);
    }
  }, {
    key: "postparse",
    value: function postparse(postparsed, options) {
      var _this2 = this;
      var errors = [];
      postparsed.forEach(function (p) {
        if (p.type === "placeholder") {
          var tag = p.value;
          try {
            options.cachedParsers[p.lIndex] = _this2.parser(tag, {
              tag: p
            });
          } catch (rootError) {
            errors.push(getScopeCompilationError({
              tag: tag,
              rootError: rootError,
              offset: p.offset
            }));
          }
        }
      });
      return {
        postparsed: postparsed,
        errors: errors
      };
    }
  }, {
    key: "render",
    value: function render(part, _ref) {
      var scopeManager = _ref.scopeManager,
        linebreaks = _ref.linebreaks,
        nullGetter = _ref.nullGetter;
      if (linebreaks) {
        this.recordRuns(part);
      }
      if (part.type !== "placeholder" || part.module) {
        return;
      }
      var value;
      try {
        value = scopeManager.getValue(part.value, {
          part: part
        });
      } catch (e) {
        return {
          errors: [e]
        };
      }
      if (value == null) {
        value = nullGetter(part);
      }
      if (hasCorruptCharacters(value)) {
        return {
          errors: [getCorruptCharactersException({
            tag: part.value,
            value: value,
            offset: part.offset
          })]
        };
      }
      return {
        value: linebreaks && typeof value === "string" ? this.renderLineBreaks(value) : utf8ToWord(value)
      };
    }
  }, {
    key: "recordRuns",
    value: function recordRuns(part) {
      if (part.tag === "".concat(ftprefix[this.fileType], ":r")) {
        this.recordedRun = [];
      } else if (part.tag === "".concat(ftprefix[this.fileType], ":rPr")) {
        if (part.position === "start") {
          this.recordRun = true;
          this.recordedRun = [part.value];
        }
        if (part.position === "end" || part.position === "selfclosing") {
          this.recordedRun.push(part.value);
          this.recordRun = false;
        }
      } else if (this.recordRun) {
        this.recordedRun.push(part.value);
      }
    }
  }, {
    key: "renderLineBreaks",
    value: function renderLineBreaks(value) {
      var _this3 = this;
      var p = ftprefix[this.fileType];
      var br = this.fileType === "docx" ? "<w:r><w:br/></w:r>" : "<a:br/>";
      var lines = value.split("\n");
      var runprops = this.recordedRun.join("");
      return lines.map(function (line) {
        return utf8ToWord(line);
      }).reduce(function (result, line, i) {
        result.push(line);
        if (i < lines.length - 1) {
          result.push("</".concat(p, ":t></").concat(p, ":r>").concat(br, "<").concat(p, ":r>").concat(runprops, "<").concat(p, ":t").concat(_this3.fileType === "docx" ? ' xml:space="preserve"' : "", ">"));
        }
        return result;
      }, []);
    }
  }]);
  return Render;
}();
module.exports = function () {
  return wrapper(new Render());
};

/***/ }),

/***/ "./node_modules/docxtemplater/js/modules/space-preserve.js":
/*!*****************************************************************!*\
  !*** ./node_modules/docxtemplater/js/modules/space-preserve.js ***!
  \*****************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
var wrapper = __webpack_require__(/*! ../module-wrapper.js */ "./node_modules/docxtemplater/js/module-wrapper.js");
var _require = __webpack_require__(/*! ../doc-utils.js */ "./node_modules/docxtemplater/js/doc-utils.js"),
  isTextStart = _require.isTextStart,
  isTextEnd = _require.isTextEnd,
  endsWith = _require.endsWith,
  startsWith = _require.startsWith;
var wTpreserve = '<w:t xml:space="preserve">';
var wTpreservelen = wTpreserve.length;
var wtEnd = "</w:t>";
var wtEndlen = wtEnd.length;
function isWtStart(part) {
  return isTextStart(part) && part.tag === "w:t";
}
function addXMLPreserve(chunk, index) {
  var tag = chunk[index].value;
  if (chunk[index + 1].value === "</w:t>") {
    return tag;
  }
  if (tag.indexOf('xml:space="preserve"') !== -1) {
    return tag;
  }
  return tag.substr(0, tag.length - 1) + ' xml:space="preserve">';
}
function isInsideLoop(meta, chunk) {
  return meta && meta.basePart && chunk.length > 1;
}
var SpacePreserve = /*#__PURE__*/function () {
  function SpacePreserve() {
    _classCallCheck(this, SpacePreserve);
    this.name = "SpacePreserveModule";
  }
  _createClass(SpacePreserve, [{
    key: "clone",
    value: function clone() {
      return new SpacePreserve();
    }
  }, {
    key: "postparse",
    value: function postparse(postparsed, meta) {
      var chunk = [],
        inTextTag = false,
        endLindex = 0,
        lastTextTag = 0;
      function isStartingPlaceHolder(part, chunk) {
        return part.type === "placeholder" && chunk.length > 1;
      }
      var result = postparsed.reduce(function (postparsed, part) {
        if (isWtStart(part)) {
          inTextTag = true;
          lastTextTag = chunk.length;
        }
        if (!inTextTag) {
          postparsed.push(part);
          return postparsed;
        }
        chunk.push(part);
        if (isInsideLoop(meta, chunk)) {
          endLindex = meta.basePart.endLindex;
          chunk[0].value = addXMLPreserve(chunk, 0);
        }
        if (isStartingPlaceHolder(part, chunk)) {
          chunk[lastTextTag].value = addXMLPreserve(chunk, lastTextTag);
          endLindex = part.endLindex;
        }
        if (isTextEnd(part) && part.lIndex > endLindex) {
          if (endLindex !== 0) {
            chunk[lastTextTag].value = addXMLPreserve(chunk, lastTextTag);
          }
          Array.prototype.push.apply(postparsed, chunk);
          chunk = [];
          inTextTag = false;
          endLindex = 0;
          lastTextTag = 0;
        }
        return postparsed;
      }, []);
      Array.prototype.push.apply(result, chunk);
      return result;
    }
  }, {
    key: "postrender",
    value: function postrender(parts) {
      var lastNonEmpty = "";
      var lastNonEmptyIndex = 0;
      for (var i = 0, len = parts.length; i < len; i++) {
        var index = i;
        var p = parts[i];
        if (p === "") {
          continue;
        }
        if (endsWith(lastNonEmpty, wTpreserve) && startsWith(p, wtEnd)) {
          parts[lastNonEmptyIndex] = lastNonEmpty.substr(0, lastNonEmpty.length - wTpreservelen) + "<w:t/>";
          p = p.substr(wtEndlen);
        }
        lastNonEmpty = p;
        lastNonEmptyIndex = index;
        parts[i] = p;
      }
      return parts;
    }
  }]);
  return SpacePreserve;
}();
module.exports = function () {
  return wrapper(new SpacePreserve());
};

/***/ }),

/***/ "./node_modules/docxtemplater/js/parser.js":
/*!*************************************************!*\
  !*** ./node_modules/docxtemplater/js/parser.js ***!
  \*************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArrayLimit(arr, i) { var _i = null == arr ? null : "undefined" != typeof Symbol && arr[Symbol.iterator] || arr["@@iterator"]; if (null != _i) { var _s, _e, _x, _r, _arr = [], _n = !0, _d = !1; try { if (_x = (_i = _i.call(arr)).next, 0 === i) { if (Object(_i) !== _i) return; _n = !1; } else for (; !(_n = (_s = _x.call(_i)).done) && (_arr.push(_s.value), _arr.length !== i); _n = !0); } catch (err) { _d = !0, _e = err; } finally { try { if (!_n && null != _i["return"] && (_r = _i["return"](), Object(_r) !== _r)) return; } finally { if (_d) throw _e; } } return _arr; } }
function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }
function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }
function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
var _require = __webpack_require__(/*! ./doc-utils.js */ "./node_modules/docxtemplater/js/doc-utils.js"),
  wordToUtf8 = _require.wordToUtf8;
var _require2 = __webpack_require__(/*! ./prefix-matcher.js */ "./node_modules/docxtemplater/js/prefix-matcher.js"),
  match = _require2.match,
  getValue = _require2.getValue,
  getValues = _require2.getValues;
function getMatchers(modules, options) {
  var matchers = [];
  for (var i = 0, l = modules.length; i < l; i++) {
    var _module = modules[i];
    if (_module.matchers) {
      var mmm = _module.matchers(options);
      if (!(mmm instanceof Array)) {
        throw new Error("module matcher returns a non array");
      }
      matchers.push.apply(matchers, _toConsumableArray(mmm));
    }
  }
  return matchers;
}
function getMatches(matchers, placeHolderContent, options) {
  var matches = [];
  for (var i = 0, len = matchers.length; i < len; i++) {
    var matcher = matchers[i];
    var _matcher = _slicedToArray(matcher, 2),
      prefix = _matcher[0],
      _module2 = _matcher[1];
    var properties = matcher[2] || {};
    if (options.match(prefix, placeHolderContent)) {
      var values = options.getValues(prefix, placeHolderContent);
      if (typeof properties === "function") {
        properties = properties(values);
      }
      if (!properties.value) {
        var _values = _slicedToArray(values, 2);
        properties.value = _values[1];
      }
      matches.push(_objectSpread({
        type: "placeholder",
        prefix: prefix,
        module: _module2,
        onMatch: properties.onMatch,
        priority: properties.priority
      }, properties));
    }
  }
  return matches;
}
function moduleParse(placeHolderContent, options) {
  var modules = options.modules;
  var startOffset = options.startOffset;
  var endLindex = options.lIndex;
  var moduleParsed;
  options.offset = startOffset;
  options.match = match;
  options.getValue = getValue;
  options.getValues = getValues;
  var matchers = getMatchers(modules, options);
  var matches = getMatches(matchers, placeHolderContent, options);
  if (matches.length > 0) {
    var bestMatch = null;
    matches.forEach(function (match) {
      match.priority = match.priority || -match.value.length;
      if (!bestMatch || match.priority > bestMatch.priority) {
        bestMatch = match;
      }
    });
    bestMatch.offset = startOffset;
    delete bestMatch.priority;
    bestMatch.endLindex = endLindex;
    bestMatch.lIndex = endLindex;
    bestMatch.raw = placeHolderContent;
    if (bestMatch.onMatch) {
      bestMatch.onMatch(bestMatch);
    }
    delete bestMatch.onMatch;
    delete bestMatch.prefix;
    return bestMatch;
  }
  for (var i = 0, l = modules.length; i < l; i++) {
    var _module3 = modules[i];
    moduleParsed = _module3.parse(placeHolderContent, options);
    if (moduleParsed) {
      moduleParsed.offset = startOffset;
      moduleParsed.endLindex = endLindex;
      moduleParsed.lIndex = endLindex;
      moduleParsed.raw = placeHolderContent;
      return moduleParsed;
    }
  }
  return {
    type: "placeholder",
    value: placeHolderContent,
    offset: startOffset,
    endLindex: endLindex,
    lIndex: endLindex
  };
}
var parser = {
  preparse: function preparse(parsed, modules, options) {
    function preparse(parsed, options) {
      return modules.forEach(function (module) {
        module.preparse(parsed, options);
      });
    }
    return {
      preparsed: preparse(parsed, options)
    };
  },
  parse: function parse(lexed, modules, options) {
    var inPlaceHolder = false;
    var placeHolderContent = "";
    var startOffset;
    var tailParts = [];
    var droppedTags = options.fileTypeConfig.droppedTagsInsidePlaceholder || [];
    return lexed.reduce(function lexedToParsed(parsed, token) {
      if (token.type === "delimiter") {
        inPlaceHolder = token.position === "start";
        if (token.position === "end") {
          options.parse = function (placeHolderContent) {
            return moduleParse(placeHolderContent, _objectSpread(_objectSpread(_objectSpread({}, options), token), {}, {
              startOffset: startOffset,
              modules: modules
            }));
          };
          parsed.push(options.parse(wordToUtf8(placeHolderContent)));
          Array.prototype.push.apply(parsed, tailParts);
          tailParts = [];
        }
        if (token.position === "start") {
          tailParts = [];
          startOffset = token.offset;
        }
        placeHolderContent = "";
        return parsed;
      }
      if (!inPlaceHolder) {
        parsed.push(token);
        return parsed;
      }
      if (token.type !== "content" || token.position !== "insidetag") {
        if (droppedTags.indexOf(token.tag) !== -1) {
          return parsed;
        }
        tailParts.push(token);
        return parsed;
      }
      placeHolderContent += token.value;
      return parsed;
    }, []);
  },
  postparse: function postparse(postparsed, modules, options) {
    function getTraits(traitName, postparsed) {
      return modules.map(function (module) {
        return module.getTraits(traitName, postparsed);
      });
    }
    var errors = [];
    function _postparse(postparsed, options) {
      return modules.reduce(function (postparsed, module) {
        var r = module.postparse(postparsed, _objectSpread(_objectSpread({}, options), {}, {
          postparse: function postparse(parsed, opts) {
            return _postparse(parsed, _objectSpread(_objectSpread({}, options), opts));
          },
          getTraits: getTraits
        }));
        if (r == null) {
          return postparsed;
        }
        if (r.errors) {
          Array.prototype.push.apply(errors, r.errors);
          return r.postparsed;
        }
        return r;
      }, postparsed);
    }
    return {
      postparsed: _postparse(postparsed, options),
      errors: errors
    };
  }
};
module.exports = parser;

/***/ }),

/***/ "./node_modules/docxtemplater/js/postrender.js":
/*!*****************************************************!*\
  !*** ./node_modules/docxtemplater/js/postrender.js ***!
  \*****************************************************/
/***/ ((module) => {

"use strict";


// convert string to array (typed, when possible)
// Stryker disable all : because this is a utility function that was copied
// from
// https://github.com/open-xml-templating/pizzip/blob/34a840553c604980859dc6d0dcd1f89b6e5527b3/es6/utf8.js#L33
// eslint-disable-next-line complexity
function string2buf(str) {
  var c,
    c2,
    mPos,
    i,
    bufLen = 0;
  var strLen = str.length;

  // count binary size
  for (mPos = 0; mPos < strLen; mPos++) {
    c = str.charCodeAt(mPos);
    if ((c & 0xfc00) === 0xd800 && mPos + 1 < strLen) {
      c2 = str.charCodeAt(mPos + 1);
      if ((c2 & 0xfc00) === 0xdc00) {
        c = 0x10000 + (c - 0xd800 << 10) + (c2 - 0xdc00);
        mPos++;
      }
    }
    bufLen += c < 0x80 ? 1 : c < 0x800 ? 2 : c < 0x10000 ? 3 : 4;
  }

  // allocate buffer
  var buf = new Uint8Array(bufLen);

  // convert
  for (i = 0, mPos = 0; i < bufLen; mPos++) {
    c = str.charCodeAt(mPos);
    if ((c & 0xfc00) === 0xd800 && mPos + 1 < strLen) {
      c2 = str.charCodeAt(mPos + 1);
      if ((c2 & 0xfc00) === 0xdc00) {
        c = 0x10000 + (c - 0xd800 << 10) + (c2 - 0xdc00);
        mPos++;
      }
    }
    if (c < 0x80) {
      /* one byte */
      buf[i++] = c;
    } else if (c < 0x800) {
      /* two bytes */
      buf[i++] = 0xc0 | c >>> 6;
      buf[i++] = 0x80 | c & 0x3f;
    } else if (c < 0x10000) {
      /* three bytes */
      buf[i++] = 0xe0 | c >>> 12;
      buf[i++] = 0x80 | c >>> 6 & 0x3f;
      buf[i++] = 0x80 | c & 0x3f;
    } else {
      /* four bytes */
      buf[i++] = 0xf0 | c >>> 18;
      buf[i++] = 0x80 | c >>> 12 & 0x3f;
      buf[i++] = 0x80 | c >>> 6 & 0x3f;
      buf[i++] = 0x80 | c & 0x3f;
    }
  }
  return buf;
}
// Stryker restore all

function postrender(parts, options) {
  for (var i = 0, l = options.modules.length; i < l; i++) {
    var _module = options.modules[i];
    parts = _module.postrender(parts, options);
  }
  var fullLength = 0;
  var newParts = options.joinUncorrupt(parts, options);
  var longStr = "";
  var lenStr = 0;
  var maxCompact = 65536;
  var uintArrays = [];
  for (var _i = 0, len = newParts.length; _i < len; _i++) {
    var part = newParts[_i];

    // This condition should be hit in the integration test at :
    // it("should not regress with long file (hit maxCompact value of 65536)", function () {
    // Stryker disable all : because this is an optimisation that won't make any tests fail
    if (part.length + lenStr > maxCompact) {
      var _arr = string2buf(longStr);
      fullLength += _arr.length;
      uintArrays.push(_arr);
      longStr = "";
    }
    // Stryker restore all

    longStr += part;
    lenStr += part.length;
    delete newParts[_i];
  }
  var arr = string2buf(longStr);
  fullLength += arr.length;
  uintArrays.push(arr);
  var array = new Uint8Array(fullLength);
  var j = 0;

  // Stryker disable all : because this is an optimisation that won't make any tests fail
  uintArrays.forEach(function (buf) {
    for (var _i2 = 0; _i2 < buf.length; ++_i2) {
      array[_i2 + j] = buf[_i2];
    }
    j += buf.length;
  });
  // Stryker restore all
  return array;
}
module.exports = postrender;

/***/ }),

/***/ "./node_modules/docxtemplater/js/prefix-matcher.js":
/*!*********************************************************!*\
  !*** ./node_modules/docxtemplater/js/prefix-matcher.js ***!
  \*********************************************************/
/***/ ((module) => {

"use strict";


var nbspRegex = new RegExp(String.fromCharCode(160), "g");
function replaceNbsps(str) {
  return str.replace(nbspRegex, " ");
}
function match(condition, placeHolderContent) {
  if (typeof condition === "string") {
    return replaceNbsps(placeHolderContent.substr(0, condition.length)) === condition;
  }
  if (condition instanceof RegExp) {
    return condition.test(replaceNbsps(placeHolderContent));
  }
}
function getValue(condition, placeHolderContent) {
  if (typeof condition === "string") {
    return replaceNbsps(placeHolderContent).substr(condition.length);
  }
  if (condition instanceof RegExp) {
    return replaceNbsps(placeHolderContent).match(condition)[1];
  }
}
function getValues(condition, placeHolderContent) {
  if (typeof condition === "string") {
    return [placeHolderContent, replaceNbsps(placeHolderContent).substr(condition.length)];
  }
  if (condition instanceof RegExp) {
    return replaceNbsps(placeHolderContent).match(condition);
  }
}
module.exports = {
  match: match,
  getValue: getValue,
  getValues: getValues
};

/***/ }),

/***/ "./node_modules/docxtemplater/js/render.js":
/*!*************************************************!*\
  !*** ./node_modules/docxtemplater/js/render.js ***!
  \*************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var _require = __webpack_require__(/*! ./errors.js */ "./node_modules/docxtemplater/js/errors.js"),
  throwUnimplementedTagType = _require.throwUnimplementedTagType;
function moduleRender(part, options) {
  var moduleRendered;
  for (var i = 0, l = options.modules.length; i < l; i++) {
    var _module = options.modules[i];
    moduleRendered = _module.render(part, options);
    if (moduleRendered) {
      return moduleRendered;
    }
  }
  return false;
}
function render(options) {
  var baseNullGetter = options.baseNullGetter;
  var compiled = options.compiled,
    scopeManager = options.scopeManager;
  options.nullGetter = function (part, sm) {
    return baseNullGetter(part, sm || scopeManager);
  };
  var errors = [];
  var parts = compiled.map(function (part, i) {
    options.index = i;
    var moduleRendered = moduleRender(part, options);
    if (moduleRendered) {
      if (moduleRendered.errors) {
        Array.prototype.push.apply(errors, moduleRendered.errors);
      }
      return moduleRendered;
    }
    if (part.type === "content" || part.type === "tag") {
      return part;
    }
    throwUnimplementedTagType(part, i);
  }).reduce(function (parts, _ref) {
    var value = _ref.value;
    if (value instanceof Array) {
      for (var i = 0, len = value.length; i < len; i++) {
        parts.push(value[i]);
      }
    } else if (value) {
      parts.push(value);
    }
    return parts;
  }, []);
  return {
    errors: errors,
    parts: parts
  };
}
module.exports = render;

/***/ }),

/***/ "./node_modules/docxtemplater/js/resolve.js":
/*!**************************************************!*\
  !*** ./node_modules/docxtemplater/js/resolve.js ***!
  \**************************************************/
/***/ ((module) => {

"use strict";


function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }
function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function moduleResolve(part, options) {
  var moduleResolved;
  for (var i = 0, l = options.modules.length; i < l; i++) {
    var _module = options.modules[i];
    moduleResolved = _module.resolve(part, options);
    if (moduleResolved) {
      return moduleResolved;
    }
  }
  return false;
}
function resolve(options) {
  var resolved = [];
  var baseNullGetter = options.baseNullGetter;
  var compiled = options.compiled,
    scopeManager = options.scopeManager;
  options.nullGetter = function (part, sm) {
    return baseNullGetter(part, sm || scopeManager);
  };
  options.resolved = resolved;
  var errors = [];
  return Promise.all(compiled.filter(function (part) {
    return ["content", "tag"].indexOf(part.type) === -1;
  }).reduce(function (promises, part) {
    var moduleResolved = moduleResolve(part, options);
    var result;
    if (moduleResolved) {
      result = moduleResolved.then(function (value) {
        resolved.push({
          tag: part.value,
          lIndex: part.lIndex,
          value: value
        });
      });
    } else if (part.type === "placeholder") {
      result = scopeManager.getValueAsync(part.value, {
        part: part
      }).then(function (value) {
        return value == null ? options.nullGetter(part) : value;
      }).then(function (value) {
        resolved.push({
          tag: part.value,
          lIndex: part.lIndex,
          value: value
        });
        return value;
      });
    } else {
      return;
    }
    promises.push(result["catch"](function (e) {
      if (e instanceof Array) {
        errors.push.apply(errors, _toConsumableArray(e));
      } else {
        errors.push(e);
      }
    }));
    return promises;
  }, [])).then(function () {
    return {
      errors: errors,
      resolved: resolved
    };
  });
}
module.exports = resolve;

/***/ }),

/***/ "./node_modules/docxtemplater/js/scope-manager.js":
/*!********************************************************!*\
  !*** ./node_modules/docxtemplater/js/scope-manager.js ***!
  \********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
var _require = __webpack_require__(/*! ./errors.js */ "./node_modules/docxtemplater/js/errors.js"),
  getScopeParserExecutionError = _require.getScopeParserExecutionError;
var _require2 = __webpack_require__(/*! ./utils.js */ "./node_modules/docxtemplater/js/utils.js"),
  last = _require2.last;
var _require3 = __webpack_require__(/*! ./doc-utils.js */ "./node_modules/docxtemplater/js/doc-utils.js"),
  concatArrays = _require3.concatArrays;
function find(list, fn) {
  var length = list.length >>> 0;
  var value;
  for (var i = 0; i < length; i++) {
    value = list[i];
    if (fn.call(this, value, i, list)) {
      return value;
    }
  }
  return undefined;
}
function _getValue(tag, meta, num) {
  var _this = this;
  var scope = this.scopeList[num];
  if (this.root.finishedResolving) {
    var w = this.resolved;
    var _loop = function _loop() {
      var lIndex = _this.scopeLindex[i];
      w = find(w, function (r) {
        return r.lIndex === lIndex;
      });
      w = w.value[_this.scopePathItem[i]];
    };
    for (var i = this.resolveOffset, len = this.scopePath.length; i < len; i++) {
      _loop();
    }
    return find(w, function (r) {
      return meta.part.lIndex === r.lIndex;
    }).value;
  }
  // search in the scopes (in reverse order) and keep the first defined value
  var result;
  var parser;
  if (!this.cachedParsers || !meta.part) {
    parser = this.parser(tag, {
      scopePath: this.scopePath
    });
  } else if (this.cachedParsers[meta.part.lIndex]) {
    parser = this.cachedParsers[meta.part.lIndex];
  } else {
    parser = this.cachedParsers[meta.part.lIndex] = this.parser(tag, {
      scopePath: this.scopePath
    });
  }
  try {
    result = parser.get(scope, this.getContext(meta, num));
  } catch (error) {
    throw getScopeParserExecutionError({
      tag: tag,
      scope: scope,
      error: error,
      offset: meta.part.offset
    });
  }
  if (result == null && num > 0) {
    return _getValue.call(this, tag, meta, num - 1);
  }
  return result;
}
function _getValueAsync(tag, meta, num) {
  var _this2 = this;
  var scope = this.scopeList[num];
  // search in the scopes (in reverse order) and keep the first defined value
  var parser;
  if (!this.cachedParsers || !meta.part) {
    parser = this.parser(tag, {
      scopePath: this.scopePath
    });
  } else if (this.cachedParsers[meta.part.lIndex]) {
    parser = this.cachedParsers[meta.part.lIndex];
  } else {
    parser = this.cachedParsers[meta.part.lIndex] = this.parser(tag, {
      scopePath: this.scopePath
    });
  }
  return Promise.resolve().then(function () {
    return parser.get(scope, _this2.getContext(meta, num));
  })["catch"](function (error) {
    throw getScopeParserExecutionError({
      tag: tag,
      scope: scope,
      error: error,
      offset: meta.part.offset
    });
  }).then(function (result) {
    if (result == null && num > 0) {
      return _getValueAsync.call(_this2, tag, meta, num - 1);
    }
    return result;
  });
}
var ScopeManager = /*#__PURE__*/function () {
  function ScopeManager(options) {
    _classCallCheck(this, ScopeManager);
    this.root = options.root || this;
    this.resolveOffset = options.resolveOffset || 0;
    this.scopePath = options.scopePath;
    this.scopePathItem = options.scopePathItem;
    this.scopePathLength = options.scopePathLength;
    this.scopeList = options.scopeList;
    this.scopeLindex = options.scopeLindex;
    this.parser = options.parser;
    this.resolved = options.resolved;
    this.cachedParsers = options.cachedParsers;
  }
  _createClass(ScopeManager, [{
    key: "loopOver",
    value: function loopOver(tag, functor, inverted, meta) {
      return this.loopOverValue(this.getValue(tag, meta), functor, inverted);
    }
  }, {
    key: "functorIfInverted",
    value: function functorIfInverted(inverted, functor, value, i, length) {
      if (inverted) {
        functor(value, i, length);
      }
      return inverted;
    }
  }, {
    key: "isValueFalsy",
    value: function isValueFalsy(value, type) {
      return value == null || !value || type === "[object Array]" && value.length === 0;
    }
  }, {
    key: "loopOverValue",
    value: function loopOverValue(value, functor, inverted) {
      if (this.root.finishedResolving) {
        inverted = false;
      }
      var type = Object.prototype.toString.call(value);
      if (this.isValueFalsy(value, type)) {
        return this.functorIfInverted(inverted, functor, last(this.scopeList), 0, 1);
      }
      if (type === "[object Array]") {
        for (var i = 0; i < value.length; i++) {
          this.functorIfInverted(!inverted, functor, value[i], i, value.length);
        }
        return true;
      }
      if (type === "[object Object]") {
        return this.functorIfInverted(!inverted, functor, value, 0, 1);
      }
      return this.functorIfInverted(!inverted, functor, last(this.scopeList), 0, 1);
    }
  }, {
    key: "getValue",
    value: function getValue(tag, meta) {
      var result = _getValue.call(this, tag, meta, this.scopeList.length - 1);
      if (typeof result === "function") {
        return result(this.scopeList[this.scopeList.length - 1], this);
      }
      return result;
    }
  }, {
    key: "getValueAsync",
    value: function getValueAsync(tag, meta) {
      var _this3 = this;
      return _getValueAsync.call(this, tag, meta, this.scopeList.length - 1).then(function (result) {
        if (typeof result === "function") {
          return result(_this3.scopeList[_this3.scopeList.length - 1], _this3);
        }
        return result;
      });
    }
  }, {
    key: "getContext",
    value: function getContext(meta, num) {
      return {
        num: num,
        meta: meta,
        scopeList: this.scopeList,
        resolved: this.resolved,
        scopePath: this.scopePath,
        scopePathItem: this.scopePathItem,
        scopePathLength: this.scopePathLength
      };
    }
  }, {
    key: "createSubScopeManager",
    value: function createSubScopeManager(scope, tag, i, part, length) {
      return new ScopeManager({
        root: this.root,
        resolveOffset: this.resolveOffset,
        resolved: this.resolved,
        parser: this.parser,
        cachedParsers: this.cachedParsers,
        scopeList: concatArrays([this.scopeList, [scope]]),
        scopePath: concatArrays([this.scopePath, [tag]]),
        scopePathItem: concatArrays([this.scopePathItem, [i]]),
        scopePathLength: concatArrays([this.scopePathLength, [length]]),
        scopeLindex: concatArrays([this.scopeLindex, [part.lIndex]])
      });
    }
  }]);
  return ScopeManager;
}();
module.exports = function (options) {
  options.scopePath = [];
  options.scopePathItem = [];
  options.scopePathLength = [];
  options.scopeLindex = [];
  options.scopeList = [options.tags];
  return new ScopeManager(options);
};

/***/ }),

/***/ "./node_modules/docxtemplater/js/traits.js":
/*!*************************************************!*\
  !*** ./node_modules/docxtemplater/js/traits.js ***!
  \*************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }
function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }
function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function _iterableToArrayLimit(arr, i) { var _i = null == arr ? null : "undefined" != typeof Symbol && arr[Symbol.iterator] || arr["@@iterator"]; if (null != _i) { var _s, _e, _x, _r, _arr = [], _n = !0, _d = !1; try { if (_x = (_i = _i.call(arr)).next, 0 === i) { if (Object(_i) !== _i) return; _n = !1; } else for (; !(_n = (_s = _x.call(_i)).done) && (_arr.push(_s.value), _arr.length !== i); _n = !0); } catch (err) { _d = !0, _e = err; } finally { try { if (!_n && null != _i["return"] && (_r = _i["return"](), Object(_r) !== _r)) return; } finally { if (_d) throw _e; } } return _arr; } }
function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
var _require = __webpack_require__(/*! ./doc-utils.js */ "./node_modules/docxtemplater/js/doc-utils.js"),
  getRightOrNull = _require.getRightOrNull,
  getRight = _require.getRight,
  getLeft = _require.getLeft,
  getLeftOrNull = _require.getLeftOrNull,
  chunkBy = _require.chunkBy,
  isTagStart = _require.isTagStart,
  isTagEnd = _require.isTagEnd,
  isContent = _require.isContent,
  last = _require.last,
  first = _require.first;
var _require2 = __webpack_require__(/*! ./errors.js */ "./node_modules/docxtemplater/js/errors.js"),
  XTTemplateError = _require2.XTTemplateError,
  throwExpandNotFound = _require2.throwExpandNotFound,
  getLoopPositionProducesInvalidXMLError = _require2.getLoopPositionProducesInvalidXMLError;
function lastTagIsOpenTag(tags, tag) {
  if (tags.length === 0) {
    return false;
  }
  var innerLastTag = last(tags).substr(1);
  return innerLastTag.indexOf(tag) === 0;
}
function getListXmlElements(parts) {
  /*
  Gets the list of closing and opening tags between two texts. It doesn't take
  into account tags that are opened then closed. Those that are closed then
  opened are kept
  	Example input :
  	[
  	{
  		"type": "placeholder",
  		"value": "table1",
  		...
  	},
  	{
  		"type": "placeholder",
  		"value": "t1data1",
  	},
  	{
  		"type": "tag",
  		"position": "end",
  		"text": true,
  		"value": "</w:t>",
  		"tag": "w:t",
  		"lIndex": 112
  	},
  	{
  		"type": "tag",
  		"value": "</w:r>",
  	},
  	{
  		"type": "tag",
  		"value": "</w:p>",
  	},
  	{
  		"type": "tag",
  		"value": "</w:tc>",
  	},
  	{
  		"type": "tag",
  		"value": "<w:tc>",
  	},
  	{
  		"type": "content",
  		"value": "<w:tcPr><w:tcW w:w="2444" w:type="dxa"/><w:tcBorders><w:top w:val="nil"/><w:left w:val="nil"/><w:bottom w:val="nil"/><w:right w:val="nil"/></w:tcBorders><w:shd w:val="clear" w:color="auto" w:fill="FFFFFF"/></w:tcPr>",
  	},
  	...
  	{
  		"type": "tag",
  		"value": "<w:r>",
  	},
  	{
  		"type": "tag",
  		"value": "<w:t xml:space="preserve">",
  	},
  	{
  		"type": "placeholder",
  		"value": "t1data4",
  	}
  ]
  	returns
  	[
  		{
  			"tag": "</w:t>",
  		},
  		{
  			"tag": "</w:r>",
  		},
  		{
  			"tag": "</w:p>",
  		},
  		{
  			"tag": "</w:tc>",
  		},
  		{
  			"tag": "<w:tc>",
  		},
  		{
  			"tag": "<w:p>",
  		},
  		{
  			"tag": "<w:r>",
  		},
  		{
  			"tag": "<w:t>",
  		},
  	]
  */

  var result = [];
  for (var i = 0; i < parts.length; i++) {
    var _parts$i = parts[i],
      position = _parts$i.position,
      value = _parts$i.value,
      tag = _parts$i.tag;
    // Stryker disable all : because removing this condition would also work but we want to make the API future proof
    if (!tag) {
      continue;
    }
    // Stryker restore all
    if (position === "end") {
      if (lastTagIsOpenTag(result, tag)) {
        result.pop();
      } else {
        result.push(value);
      }
    } else if (position === "start") {
      result.push(value);
    }
    // ignore position === "selfclosing"
  }

  return result;
}
function has(name, xmlElements) {
  for (var i = 0; i < xmlElements.length; i++) {
    var xmlElement = xmlElements[i];
    if (xmlElement.indexOf("<".concat(name)) === 0) {
      return true;
    }
  }
  return false;
}
function getExpandToDefault(postparsed, pair, expandTags) {
  var parts = postparsed.slice(pair[0].offset, pair[1].offset);
  var xmlElements = getListXmlElements(parts);
  var closingTagCount = xmlElements.filter(function (tag) {
    return tag[1] === "/";
  }).length;
  var startingTagCount = xmlElements.filter(function (tag) {
    return tag[1] !== "/" && tag[tag.length - 2] !== "/";
  }).length;
  if (closingTagCount !== startingTagCount) {
    return {
      error: getLoopPositionProducesInvalidXMLError({
        tag: first(pair).part.value,
        offset: [first(pair).part.offset, last(pair).part.offset]
      })
    };
  }
  var _loop = function _loop() {
    var _expandTags$i = expandTags[i],
      contains = _expandTags$i.contains,
      expand = _expandTags$i.expand,
      onlyTextInTag = _expandTags$i.onlyTextInTag;
    if (has(contains, xmlElements)) {
      if (onlyTextInTag) {
        var left = getLeftOrNull(postparsed, contains, pair[0].offset);
        var right = getRightOrNull(postparsed, contains, pair[1].offset);
        if (left === null || right === null) {
          return "continue";
        }
        var chunks = chunkBy(postparsed.slice(left, right), function (p) {
          return isTagStart(contains, p) ? "start" : isTagEnd(contains, p) ? "end" : null;
        });
        var firstChunk = first(chunks);
        var lastChunk = last(chunks);
        var firstContent = firstChunk.filter(isContent);
        var lastContent = lastChunk.filter(isContent);
        if (firstContent.length !== 1 || lastContent.length !== 1) {
          return "continue";
        }
      }
      return {
        v: {
          value: expand
        }
      };
    }
  };
  for (var i = 0, len = expandTags.length; i < len; i++) {
    var _ret = _loop();
    if (_ret === "continue") continue;
    if (_typeof(_ret) === "object") return _ret.v;
  }
  return {};
}
function getExpandLimit(part, index, postparsed, options) {
  var expandTo = part.expandTo || options.expandTo;
  // Stryker disable all : because this condition can be removed in v4 (the only usage was the image module before version 3.12.3 of the image module
  if (!expandTo) {
    return;
  }
  // Stryker restore all
  var right, left;
  try {
    left = getLeft(postparsed, expandTo, index);
    right = getRight(postparsed, expandTo, index);
  } catch (rootError) {
    if (rootError instanceof XTTemplateError) {
      throwExpandNotFound(_objectSpread({
        part: part,
        rootError: rootError,
        postparsed: postparsed,
        expandTo: expandTo,
        index: index
      }, options.error));
    }
    throw rootError;
  }
  return [left, right];
}
function expandOne(_ref, part, postparsed, options) {
  var _ref2 = _slicedToArray(_ref, 2),
    left = _ref2[0],
    right = _ref2[1];
  var index = postparsed.indexOf(part);
  var leftParts = postparsed.slice(left, index);
  var rightParts = postparsed.slice(index + 1, right + 1);
  var inner = options.getInner({
    postparse: options.postparse,
    index: index,
    part: part,
    leftParts: leftParts,
    rightParts: rightParts,
    left: left,
    right: right,
    postparsed: postparsed
  });
  if (!inner.length) {
    inner.expanded = [leftParts, rightParts];
    inner = [inner];
  }
  return {
    left: left,
    right: right,
    inner: inner
  };
}
function expandToOne(postparsed, options) {
  var errors = [];
  if (postparsed.errors) {
    errors = postparsed.errors;
    postparsed = postparsed.postparsed;
  }
  var limits = [];
  for (var i = 0, len = postparsed.length; i < len; i++) {
    var part = postparsed[i];
    if (part.type === "placeholder" && part.module === options.moduleName &&
    // The part.subparsed check is used to fix this github issue :
    // https://github.com/open-xml-templating/docxtemplater/issues/671
    !part.subparsed) {
      try {
        var limit = getExpandLimit(part, i, postparsed, options);
        if (!limit) {
          continue;
        }
        var _limit = _slicedToArray(limit, 2),
          left = _limit[0],
          right = _limit[1];
        limits.push({
          left: left,
          right: right,
          part: part,
          i: i,
          leftPart: postparsed[left],
          rightPart: postparsed[right]
        });
      } catch (error) {
        if (error instanceof XTTemplateError) {
          errors.push(error);
        } else {
          throw error;
        }
      }
    }
  }
  limits.sort(function (l1, l2) {
    if (l1.left === l2.left) {
      return l2.part.lIndex < l1.part.lIndex ? 1 : -1;
    }
    return l2.left < l1.left ? 1 : -1;
  });
  var maxRight = -1;
  var offset = 0;
  limits.forEach(function (limit, i) {
    var _postparsed;
    maxRight = Math.max(maxRight, i > 0 ? limits[i - 1].right : 0);
    if (limit.left < maxRight) {
      return;
    }
    var result;
    try {
      result = expandOne([limit.left + offset, limit.right + offset], limit.part, postparsed, options);
    } catch (error) {
      if (error instanceof XTTemplateError) {
        errors.push(error);
      } else {
        throw error;
      }
    }
    if (!result) {
      return;
    }
    offset += result.inner.length - (result.right + 1 - result.left);
    (_postparsed = postparsed).splice.apply(_postparsed, [result.left, result.right + 1 - result.left].concat(_toConsumableArray(result.inner)));
  });
  return {
    postparsed: postparsed,
    errors: errors
  };
}
module.exports = {
  expandToOne: expandToOne,
  getExpandToDefault: getExpandToDefault
};

/***/ }),

/***/ "./node_modules/docxtemplater/js/utils.js":
/*!************************************************!*\
  !*** ./node_modules/docxtemplater/js/utils.js ***!
  \************************************************/
/***/ ((module) => {

"use strict";


function last(a) {
  return a[a.length - 1];
}
function first(a) {
  return a[0];
}
module.exports = {
  last: last,
  first: first
};

/***/ }),

/***/ "./node_modules/docxtemplater/js/xml-matcher.js":
/*!******************************************************!*\
  !*** ./node_modules/docxtemplater/js/xml-matcher.js ***!
  \******************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var _require = __webpack_require__(/*! ./doc-utils.js */ "./node_modules/docxtemplater/js/doc-utils.js"),
  pregMatchAll = _require.pregMatchAll;
module.exports = function xmlMatcher(content, tagsXmlArray) {
  var res = {
    content: content
  };
  var taj = tagsXmlArray.join("|");
  var regexp = new RegExp("(?:(<(?:".concat(taj, ")[^>]*>)([^<>]*)</(?:").concat(taj, ")>)|(<(?:").concat(taj, ")[^>]*/>)"), "g");
  res.matches = pregMatchAll(regexp, res.content);
  return res;
};

/***/ }),

/***/ "./node_modules/docxtemplater/js/xml-templater.js":
/*!********************************************************!*\
  !*** ./node_modules/docxtemplater/js/xml-templater.js ***!
  \********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
var _require = __webpack_require__(/*! ./doc-utils.js */ "./node_modules/docxtemplater/js/doc-utils.js"),
  wordToUtf8 = _require.wordToUtf8,
  convertSpaces = _require.convertSpaces;
var xmlMatcher = __webpack_require__(/*! ./xml-matcher.js */ "./node_modules/docxtemplater/js/xml-matcher.js");
var Lexer = __webpack_require__(/*! ./lexer.js */ "./node_modules/docxtemplater/js/lexer.js");
var Parser = __webpack_require__(/*! ./parser.js */ "./node_modules/docxtemplater/js/parser.js");
var _render = __webpack_require__(/*! ./render.js */ "./node_modules/docxtemplater/js/render.js");
var postrender = __webpack_require__(/*! ./postrender.js */ "./node_modules/docxtemplater/js/postrender.js");
var resolve = __webpack_require__(/*! ./resolve.js */ "./node_modules/docxtemplater/js/resolve.js");
var joinUncorrupt = __webpack_require__(/*! ./join-uncorrupt.js */ "./node_modules/docxtemplater/js/join-uncorrupt.js");
function _getFullText(content, tagsXmlArray) {
  var matcher = xmlMatcher(content, tagsXmlArray);
  var result = matcher.matches.map(function (match) {
    return match.array[2];
  });
  return wordToUtf8(convertSpaces(result.join("")));
}
module.exports = /*#__PURE__*/function () {
  function XmlTemplater(content, options) {
    var _this = this;
    _classCallCheck(this, XmlTemplater);
    this.cachedParsers = {};
    this.content = content;
    Object.keys(options).forEach(function (key) {
      _this[key] = options[key];
    });
    this.setModules({
      inspect: {
        filePath: options.filePath
      }
    });
  }
  _createClass(XmlTemplater, [{
    key: "resolveTags",
    value: function resolveTags(tags) {
      var _this2 = this;
      this.tags = tags;
      var options = this.getOptions();
      var filePath = this.filePath;
      options.scopeManager = this.scopeManager;
      options.resolve = resolve;
      return resolve(options).then(function (_ref) {
        var resolved = _ref.resolved,
          errors = _ref.errors;
        errors.forEach(function (error) {
          // error properties might not be defined if some foreign error
          // (unhandled error not thrown by docxtemplater willingly) is
          // thrown.
          error.properties = error.properties || {};
          error.properties.file = filePath;
        });
        if (errors.length !== 0) {
          throw errors;
        }
        return Promise.all(resolved).then(function (resolved) {
          options.scopeManager.root.finishedResolving = true;
          options.scopeManager.resolved = resolved;
          _this2.setModules({
            inspect: {
              resolved: resolved,
              filePath: filePath
            }
          });
          return resolved;
        });
      });
    }
  }, {
    key: "getFullText",
    value: function getFullText() {
      return _getFullText(this.content, this.fileTypeConfig.tagsXmlTextArray);
    }
  }, {
    key: "setModules",
    value: function setModules(obj) {
      this.modules.forEach(function (module) {
        module.set(obj);
      });
    }
  }, {
    key: "preparse",
    value: function preparse() {
      this.allErrors = [];
      this.xmllexed = Lexer.xmlparse(this.content, {
        text: this.fileTypeConfig.tagsXmlTextArray,
        other: this.fileTypeConfig.tagsXmlLexedArray
      });
      this.setModules({
        inspect: {
          xmllexed: this.xmllexed
        }
      });
      var _Lexer$parse = Lexer.parse(this.xmllexed, this.delimiters),
        lexed = _Lexer$parse.lexed,
        lexerErrors = _Lexer$parse.errors;
      this.allErrors = this.allErrors.concat(lexerErrors);
      this.lexed = lexed;
      this.setModules({
        inspect: {
          lexed: this.lexed
        }
      });
      var options = this.getOptions();
      Parser.preparse(this.lexed, this.modules, options);
    }
  }, {
    key: "parse",
    value: function parse() {
      this.setModules({
        inspect: {
          filePath: this.filePath
        }
      });
      var options = this.getOptions();
      this.parsed = Parser.parse(this.lexed, this.modules, options);
      this.setModules({
        inspect: {
          parsed: this.parsed
        }
      });
      var _Parser$postparse = Parser.postparse(this.parsed, this.modules, options),
        postparsed = _Parser$postparse.postparsed,
        postparsedErrors = _Parser$postparse.errors;
      this.postparsed = postparsed;
      this.setModules({
        inspect: {
          postparsed: this.postparsed
        }
      });
      this.allErrors = this.allErrors.concat(postparsedErrors);
      this.errorChecker(this.allErrors);
      return this;
    }
  }, {
    key: "errorChecker",
    value: function errorChecker(errors) {
      var _this3 = this;
      errors.forEach(function (error) {
        // error properties might not be defined if some foreign
        // (unhandled error not thrown by docxtemplater willingly) is
        // thrown.
        error.properties = error.properties || {};
        error.properties.file = _this3.filePath;
      });
      this.modules.forEach(function (module) {
        errors = module.errorsTransformer(errors);
      });
    }
  }, {
    key: "baseNullGetter",
    value: function baseNullGetter(part, sm) {
      var _this4 = this;
      var value = this.modules.reduce(function (value, module) {
        if (value != null) {
          return value;
        }
        return module.nullGetter(part, sm, _this4);
      }, null);
      if (value != null) {
        return value;
      }
      return this.nullGetter(part, sm);
    }
  }, {
    key: "getOptions",
    value: function getOptions() {
      return {
        compiled: this.postparsed,
        cachedParsers: this.cachedParsers,
        tags: this.tags,
        modules: this.modules,
        parser: this.parser,
        contentType: this.contentType,
        relsType: this.relsType,
        baseNullGetter: this.baseNullGetter.bind(this),
        filePath: this.filePath,
        fileTypeConfig: this.fileTypeConfig,
        fileType: this.fileType,
        linebreaks: this.linebreaks
      };
    }
  }, {
    key: "render",
    value: function render(to) {
      this.filePath = to;
      var options = this.getOptions();
      options.resolved = this.scopeManager.resolved;
      options.scopeManager = this.scopeManager;
      options.render = _render;
      options.joinUncorrupt = joinUncorrupt;
      var _render2 = _render(options),
        errors = _render2.errors,
        parts = _render2.parts;
      if (errors.length > 0) {
        this.allErrors = errors;
        this.errorChecker(errors);
        return this;
      }
      this.content = postrender(parts, options);
      this.setModules({
        inspect: {
          content: this.content
        }
      });
      return this;
    }
  }]);
  return XmlTemplater;
}();

/***/ }),

/***/ "./node_modules/ieee754/index.js":
/*!***************************************!*\
  !*** ./node_modules/ieee754/index.js ***!
  \***************************************/
/***/ ((__unused_webpack_module, exports) => {

/*! ieee754. BSD-3-Clause License. Feross Aboukhadijeh <https://feross.org/opensource> */
exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = (e * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = (m * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = ((value * c) - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__("./es6/index.js");
/******/ 	window.ImageModule = __webpack_exports__;
/******/ 	
/******/ })()
;