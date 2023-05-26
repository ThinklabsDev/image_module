const mDxa = 20; // same as twips (twentieths of a point). 1440 twips = 1 inch
const mPoint = 72;
const mEmu = 914400;
const mCm = 2.54; // 1 inch = 2.54cm
const mMm = 25.4; // 1 inch = 25.4mm
const mPc = 6; // 1 inch = 6 picas

function inchToDXA(inch) {
	return inch * mPoint * mDxa;
}

function emuToDXA(value) {
	return inchToDXA(emuToInch(value));
}

function emuToPoint(value) {
	return inchToPoint(emuToInch(value));
}

function inchToPoint(inch) {
	return inch * mPoint;
}

function pointToInch(point) {
	return point / mPoint;
}

function dxaToInch(dxa) {
	return dxa / mPoint / mDxa;
}

function inchToEmu(inch) {
	return inch * mEmu;
}

function cmToInch(cm) {
	return cm / mCm;
}

function mmToInch(cm) {
	return cm / mMm;
}

function cmToEmu(cm) {
	return inchToEmu(cmToInch(cm));
}
function mmToEmu(mm) {
	return inchToEmu(mmToInch(mm));
}
function pcToEmu(pc) {
	return inchToEmu(pc / mPc);
}

function emuToInch(emu) {
	return emu / mEmu;
}

function pixelToInch(pixel, dpi) {
	return pixel / dpi;
}

function inchToPixel(inch, dpi) {
	return inch * dpi;
}

function pixelToEMU(pixel, dpi) {
	return parseInt(pixelToInch(pixel, dpi) * mEmu, 10);
}

function emuToPixel(emu, dpi) {
	return parseInt(inchToPixel(emu / mEmu, dpi), 10);
}

function pixelToPoint(pixel, dpi) {
	return pixelToInch(pixel, dpi) * mPoint;
}

function pixelToHundrethOfAPoint(pixel, dpi) {
	return pixelToPoint(pixel * 100, dpi);
}

function pixelToDXA(pixel, dpi) {
	return parseInt(inchToDXA(pixelToInch(pixel, dpi)), 10);
}

function dxaToPixel(dxa, dpi) {
	return inchToPixel(dxaToInch(dxa), dpi);
}

function dxaToPoint(dxa) {
	return inchToPoint(dxaToInch(dxa));
}

function pointToDXA(point) {
	return parseInt(point * mDxa, 10);
}

function pointToEmu(point) {
	return inchToEmu(pointToInch(point));
}

function calculateDpi(pixel, dxa) {
	return pixel / dxaToInch(dxa);
}

function pointToPixel(point, dpi) {
	return dxaToPixel(pointToDXA(point), dpi);
}

module.exports = {
	calculateDpi,
	pixelToPoint,
	pixelToHundrethOfAPoint,
	pixelToDXA,
	pointToDXA,
	pointToPixel,
	pointToEmu,
	dxaToPixel,
	pixelToEMU,
	cmToEmu,
	mmToEmu,
	pcToEmu,
	emuToPixel,
	emuToInch,
	emuToPoint,
	emuToDXA,
	inchToPoint,
	inchToPixel,
	inchToDXA,
	inchToEmu,
	dxaToPoint,
};
