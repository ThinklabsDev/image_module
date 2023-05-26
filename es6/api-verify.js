module.exports = function (docxtemplater, requiredAPIVersion) {
	if (docxtemplater.verifyApiVersion) {
		return docxtemplater.verifyApiVersion(requiredAPIVersion);
	}
	throw new Error(
		"The api version of docxtemplater is not defined, you probably have to update docxtemplater with npm install --save docxtemplater"
	);
};
