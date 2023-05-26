module.exports = function (relM) {
	relM.getImageName = (extension, id) => {
		id = id || 0;
		const nameCandidate = `Copie_${id}.${extension}`;
		if (relM.hasImage(relM.getFullPath(nameCandidate))) {
			return relM.getImageName(extension, id + 1);
		}
		return nameCandidate;
	};
	relM.getFullPath = (imgName) => {
		return `${relM.ftprefix}/media/${imgName}`;
	};

	relM.hasImage = (fileName) => {
		return relM.zip.files[fileName] != null;
	};
	relM.addImage = (imageData, extension, zipOptions) => {
		const imageName = relM.getImageName(extension);
		const fileName = relM.getFullPath(imageName);
		relM.zip.file(fileName, imageData, zipOptions);
		relM.addExtensionRels(`image/${extension}`, extension);
		const absoluteTarget = `${
			relM.fileType === "pptx" ? "/ppt" : "/word"
		}/media/${imageName}`;
		relM.addOverride(`image/${extension}`, absoluteTarget);
		const target = `${relM.fileType === "pptx" ? "../" : ""}media/${imageName}`;
		return relM.addRelationship({
			Type: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/image",
			Target: target,
		});
	};

	relM.getImageByRid = (rId) => {
		const relationships = relM.relsDoc.getElementsByTagName("Relationship");
		for (let i = 0, relationship; i < relationships.length; i++) {
			relationship = relationships[i];
			const cRId = relationship.getAttribute("Id");
			if (rId === cRId) {
				const path = relationship.getAttribute("Target");
				if (path.toLowerCase() === "null") {
					return null;
				}
				if (path[0] === "/") {
					return path.substr(1);
				}
				if (path.substr(0, 6) === "media/") {
					return `${relM.ftprefix}/${path}`;
				}
				if (path.substr(0, 9) === "../media/") {
					return `${relM.ftprefix}/${path.replace("../", "")}`;
				}
				const err = new Error(`Rid ${rId} is not an image`);
				err.properties = { rId };
				throw err;
			}
		}
		const err = new Error(`No Media with relM Rid (${rId}) found`);
		err.properties = { rId };
		throw err;
	};
};
