const { str2xml } = require("docxtemplater").DocUtils;
function parseXML(zipFiles, path) {
	return str2xml(zipFiles[path].asText());
}
module.exports = function getMaxDocPrId(zip) {
	let max = 0;
	zip.file(/word\/(document|header[0-9]|footer[0-9]).xml/).map((f) => {
		const xml = parseXML(zip.files, f.name);
		Array.prototype.slice
			.call(xml.getElementsByTagName("wp:docPr"))
			.forEach((element) => {
				const prId = parseInt(element.getAttribute("id"), 10);
				if (prId > max) {
					max = prId;
				}
			});
	});
	return max;
};
