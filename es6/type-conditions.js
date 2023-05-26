/* eslint-disable no-self-compare */
function isNaN(number) {
	return !(number === number);
}
/* eslint-enable no-self-compare */

function isFloat(input) {
	return typeof input === "number";
}

function isPositive(number) {
	return number > 0;
}

module.exports = {
	isNaN,
	isFloat,
	isPositive,
};
