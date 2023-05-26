"use strict";

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }
function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
var _require = require("./attributes.js"),
  setSingleAttribute = _require.setSingleAttribute,
  getSingleAttribute = _require.getSingleAttribute;
var pushArray = require("./push-array.js");
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