module.exports = function pushArray(array1, array2) {
	if (!array2) {
		return;
	}
	for (let i = 0, len = array2.length; i < len; i++) {
		array1.push(array2[i]);
	}
};
