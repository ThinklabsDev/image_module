module.exports = function (relM) {
	relM.addLink = (target) => {
		return relM.addRelationship({
			Type: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink",
			Target: target,
			TargetMode: "External",
		});
	};
	return relM;
};
