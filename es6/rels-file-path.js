module.exports = function getRelsFilePath(fileName) {
	const relsFileName =
		fileName.replace(/^.*?([a-zA-Z0-9]+)\.xml$/, "$1") + ".xml.rels";
	const path = fileName.split("/");
	path.pop();
	const prefix = path.join("/");
	return `${prefix}/_rels/${relsFileName}`;
};
