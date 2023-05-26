"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
var utf8ToWord = require("docxtemplater").DocUtils.utf8ToWord;
var _require = require("./rotation-flip-utils.js"),
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