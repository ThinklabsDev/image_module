"use strict";

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