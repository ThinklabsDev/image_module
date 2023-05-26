const pixelRegex = /^-?([\d.]+px|0)$/;
const pointRegex = /^-?([\d.]+)pt$/;
const percentRegex = /^-?[\d.]+%$/;
const numberRegex = /^-?[\d.]+$/;
const inchRegex = /^-?[\d.]+in$/;
const mmRegex = /^-?[\d.]+mm$/;
const cmRegex = /^-?[\d.]+cm$/;
const pcRegex = /^-?[\d.]+pc$/;
const emuRegex = /^-?[\d.]+emu$/;
function getFontSize(value) {
	return parseInt(parseFloat(value) * 2, 10);
}

const sizeRegex = /^[\d.]+(px|pt|mm|em|rem|vh)$/;

module.exports = {
	pixelRegex,
	percentRegex,
	pointRegex,
	sizeRegex,
	numberRegex,
	inchRegex,
	mmRegex,
	cmRegex,
	pcRegex,
	emuRegex,
	getFontSize,
};
