"use strict";

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