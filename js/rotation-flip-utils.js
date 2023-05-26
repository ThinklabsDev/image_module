"use strict";

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