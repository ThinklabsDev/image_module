const converter = require("./converter.js");

/*
 * cm centimeters
 * mm millimeters
 * in inches (1in = 96px = 2.54cm)
 * px * Pixels (px) are relative to the viewing device. For low-dpi devices, 1px is one device pixel (dot) of the display. For printers and high resolution screens 1px implies multiple device pixels.
 * pt points (1pt = 1/72 of 1in)
 * pc picas (1pc = 12 pt)
 */

const {
	pixelRegex,
	pointRegex,
	inchRegex,
	mmRegex,
	cmRegex,
	pcRegex,
	emuRegex,
} = require("./regex.js");

function toEMU(value, transformer) {
	if (value === "0") {
		return 0;
	}
	if (pixelRegex.test(value)) {
		return converter.pixelToEMU(parseFloat(value), transformer.dpi);
	}
	if (pointRegex.test(value)) {
		return converter.pointToEmu(parseFloat(value));
	}
	if (inchRegex.test(value)) {
		return converter.inchToEmu(parseFloat(value));
	}
	if (cmRegex.test(value)) {
		return converter.cmToEmu(parseFloat(value));
	}
	if (mmRegex.test(value)) {
		return converter.mmToEmu(parseFloat(value));
	}
	if (pcRegex.test(value)) {
		return converter.pcToEmu(parseFloat(value));
	}
	if (emuRegex.test(value)) {
		return parseFloat(value);
	}
	return null;
}

function toDXA(value, transformer) {
	const emu = toEMU(value, transformer);
	if (emu == null) {
		return null;
	}
	return Math.round(converter.emuToDXA(emu));
}

function toPoint(value, transformer) {
	const emu = toEMU(value, transformer);
	if (emu == null) {
		return null;
	}
	return converter.emuToPoint(emu);
}

function toPixel(value, transformer) {
	if (pixelRegex.test(value)) {
		return parseFloat(value);
	}
	const emu = toEMU(value, transformer);
	if (emu == null) {
		return null;
	}
	return converter.emuToPixel(emu, transformer.dpi);
}

module.exports = {
	toDXA,
	toPoint,
	toPixel,
	toEMU,
};
