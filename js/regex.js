"use strict";

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