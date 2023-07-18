"use strict";

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
var TemplateCreator = require("./templates.js");
var Docxtemplater = require("docxtemplater");
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
var _require = require("./rotation-flip-utils.js"),
  getRawRotation = _require.getRawRotation;
var _require2 = require("./size-converter.js"),
  toEMU = _require2.toEMU;
var _require3 = require("./tag.js"),
  isStartingTag = _require3.isStartingTag;
var converter = require("./converter.js");
var getMaxDocPrId = require("./max-docprid.js");
var addImageTraits = require("./image-rels-traits.js");
var addLinkTrait = require("./link-trait.js");
var _require4 = require("./attributes.js"),
  setSingleAttribute = _require4.setSingleAttribute,
  getSingleAttribute = _require4.getSingleAttribute;
var _require5 = require("docxtemplater/js/lexer.js"),
  lexParse = _require5.parse,
  xmlparse = _require5.xmlparse;
var _require6 = require("docxtemplater/js/parser.js"),
  parse = _require6.parse;
var verifyApiVersion = require("./api-verify.js");
var normalizePath = require("./normalize-path.js");
var RelationsManager = require("./relationship-manager.js");
var _require7 = require("./type-conditions.js"),
  isNaN = _require7.isNaN,
  isFloat = _require7.isFloat,
  isPositive = _require7.isPositive;
var widthCollector = require("./get-widths.js");
var _require8 = require("./sxml.js"),
  firstDirectChild = _require8.firstDirectChild,
  firstDirectChildOrCreate = _require8.firstDirectChildOrCreate,
  firstChild = _require8.firstChild,
  getContent = _require8.getContent,
  getAttribute = _require8.getAttribute,
  dropSelf = _require8.dropSelf,
  findParent = _require8.findParent,
  findChilds = _require8.findChilds,
  appendChild = _require8.appendChild;
var pushArray = require("./push-array.js");
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
	if (arrComp(signature, [82, 73, 70, 70])) {
		return "jpg";
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
var svgUnsupportedBase64 = require("./svg-unsupported.js");
var _require9 = require("./svg.js"),
  isSVG = _require9.isSVG,
  getSVGSize = _require9.getSVGSize;
var calculatePlaceholderPositions = require("./calculate-placeholder-positions.js");
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
