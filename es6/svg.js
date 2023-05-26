function partialAb2Str(buffer, length) {
	const bufView = new Uint8Array(buffer);
	let result = "";
	let addition = Math.min(length, Math.pow(2, 16) - 1);

	for (let i = 0; i < length; i += addition) {
		if (i + addition > length) {
			addition = length - i;
		}
		result += String.fromCharCode.apply(
			null,
			bufView.subarray(i, i + addition)
		);
	}
	return result;
}

function getImgString(imgBuffer) {
	return typeof imgBuffer === "string"
		? imgBuffer
		: imgBuffer.buffer
		? imgBuffer.toString()
		: partialAb2Str(imgBuffer, 4100);
}
function isSVG(imgBuffer) {
	if (!imgBuffer) {
		return false;
	}
	return getImgString(imgBuffer).substr(0, 4096).indexOf("<svg") !== -1;
}

function getSVGSize(imgBuffer) {
	const imgString = getImgString(imgBuffer);
	const wRegex = /width="?([0-9\.]+)/;
	const hRegex = /height="?([0-9\.]+)/;
	let matches;
	matches = wRegex.exec(imgString);
	const width = matches ? parseInt(matches[1], 10) : null;
	matches = hRegex.exec(imgString);
	const height = matches ? parseInt(matches[1], 10) : null;
	if (width == null || height == null) {
		return null;
	}
	return [width, height];
}

module.exports = { isSVG, getSVGSize };
