function getXML(props) {
	const { rotation, flipVertical, flipHorizontal } = props;
	const values = [];

	if (rotation !== 0) {
		values.push(`rot="${getRawRotation(rotation)}"`);
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
	return ` ${values.join(" ")}`;
}

function getRawRotation(rotation) {
	return rotation * 60000;
}

module.exports = { getXML, getRawRotation };
