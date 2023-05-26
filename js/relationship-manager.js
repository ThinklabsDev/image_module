"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
var normalizePath = require("./normalize-path.js");
var getRelsFilePath = require("./rels-file-path.js");
function maxArray(a) {
  return Math.max.apply(null, a);
}
var _require$DocUtils = require("docxtemplater").DocUtils,
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