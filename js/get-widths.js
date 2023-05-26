"use strict";

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
var _require = require("./tag.js"),
  isStartingTag = _require.isStartingTag,
  isEndingTag = _require.isEndingTag;
var _require2 = require("./content-types.js"),
  main = _require2.main,
  headerContentType = _require2.headerContentType,
  footerContentType = _require2.footerContentType;
var RelationsManager = require("./relationship-manager.js");
var normalizePath = require("./normalize-path.js");
var _require3 = require("./size-converter.js"),
  toPixel = _require3.toPixel;
var _require4 = require("./attributes.js"),
  getAttributes = _require4.getAttributes,
  getAttribute = _require4.getAttribute,
  getSingleAttribute = _require4.getSingleAttribute;
var converter = require("./converter.js");

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