const normalizePath = require("./normalize-path.js");
const getRelsFilePath = require("./rels-file-path.js");

function maxArray(a) {
	return Math.max.apply(null, a);
}
const { str2xml, xml2str } = require("docxtemplater").DocUtils;

const ftname = {
	docx: "document",
	pptx: "presentation",
	xlsx: "workbook",
};

const ftprefix = {
	docx: "word",
	pptx: "ppt",
	xlsx: "xl",
};

const rels = {
	getPrefix(fileType) {
		return ftprefix[fileType];
	},
	getFileTypeName(fileType) {
		return ftname[fileType];
	},
};

function setAttributes(tag, attributes) {
	Object.keys(attributes).forEach(function (key) {
		const value = attributes[key];
		tag.setAttribute(key, value);
	});
}

class RelationsManager {
	constructor(mod, fileName) {
		const { zip, fileType, xmlDocuments } = mod;
		if (!zip) {
			throw new Error("zip empty");
		}
		if (!fileName) {
			throw new Error("filename empty");
		}
		this.zip = zip;
		this.fileName = fileName;
		if (this.fileName.indexOf("docProps/") === 0) {
			return;
		}
		this.fileType = fileType;
		if (Object.keys(xmlDocuments).length === 0) {
			throw new Error("xmlDocs empty");
		}
		this.xmlDocs = xmlDocuments;
		this.xmlDocuments = xmlDocuments;
		if (this.xmlDocuments[fileName]) {
			this.mainDoc = this.xmlDocuments[fileName];
		}
		this.contentTypeDoc = this.xmlDocs["[Content_Types].xml"];
		this.prefix = rels.getPrefix(fileType);
		this.ftprefix = ftprefix[this.fileType];
		this.fileTypeName = rels.getFileTypeName(fileType);
		this.endFileName = fileName.replace(/^.*?([a-zA-Z0-9]+)\.xml$/, "$1");
		this.dirname = fileName.replace(/\/[^\/]+$/g, "");
		this.mod = mod;
		const relsFilePath = getRelsFilePath(fileName);
		this.relsDoc =
			xmlDocuments[relsFilePath] ||
			this.createEmptyRelsDoc(xmlDocuments, relsFilePath);
	}
	forEachRel(functor) {
		const rels = this.relsDoc.getElementsByTagName("Relationship");
		for (let i = 0, len = rels.length; i < len; i++) {
			const rel = rels[i];
			const target = rel.getAttribute("Target");
			const id = rel.getAttribute("Id");
			const type = rel.getAttribute("Type");
			const targetMode = rel.getAttribute("TargetMode");
			let absoluteTarget;
			if (targetMode === "External") {
				absoluteTarget = "";
			} else {
				absoluteTarget = normalizePath(target, this.dirname).substr(1);
			}
			functor({ target, absoluteTarget, targetMode, id, type });
		}
	}
	getNextRid() {
		const RidArray = [0];
		const iterable = this.relsDoc.getElementsByTagName("Relationship");
		for (let i = 0, tag; i < iterable.length; i++) {
			tag = iterable[i];
			const id = tag.getAttribute("Id");
			if (/^rId[0-9]+$/.test(id)) {
				RidArray.push(parseInt(id.substr(3), 10));
			}
		}
		return maxArray(RidArray) + 1;
	}
	/*
	 * Add an extension type in the [Content_Types.xml], is used if for example
	 * you want word to be able to read png files (for every extension you add
	 * you need a contentType)
	 */
	addExtensionRels(contentType, extension) {
		const defaultTags = this.contentTypeDoc.getElementsByTagName("Default");
		const extensionRegistered = Array.prototype.some.call(
			defaultTags,
			function (tag) {
				return tag.getAttribute("Extension") === extension;
			}
		);
		if (extensionRegistered) {
			return;
		}
		const types = this.contentTypeDoc.getElementsByTagName("Types")[0];
		const newTag = this.contentTypeDoc.createElement("Default");
		setAttributes(newTag, {
			ContentType: contentType,
			Extension: extension,
		});
		types.appendChild(newTag);
	}
	addOverride(contentType, partName) {
		const overrideTags = this.contentTypeDoc.getElementsByTagName("Override");
		const overrideRegistered = Array.prototype.some.call(
			overrideTags,
			function (tag) {
				return tag.getAttribute("PartName") === partName;
			}
		);
		if (overrideRegistered) {
			return;
		}
		const types = this.contentTypeDoc.getElementsByTagName("Types")[0];
		const newTag = this.contentTypeDoc.createElement("Override");
		setAttributes(newTag, {
			ContentType: contentType,
			PartName: partName,
		});
		types.appendChild(newTag);
	}
	createEmptyRelsDoc(xmlDocuments, relsFileName) {
		const mainRels = this.prefix + "/_rels/" + this.fileTypeName + ".xml.rels";
		this.addOverride(
			"application/vnd.openxmlformats-package.relationships+xml",
			"/" + relsFileName
		);
		const doc = xmlDocuments[mainRels];
		if (!doc) {
			const err = new Error("Could not copy from empty relsdoc");
			err.properties = {
				mainRels,
				relsFileName,
				files: Object.keys(this.zip.files),
			};
			throw err;
		}
		const relsDoc = str2xml(xml2str(doc));
		const relationships = relsDoc.getElementsByTagName("Relationships")[0];
		let relationshipChilds = relationships.getElementsByTagName("Relationship");
		while (relationshipChilds.length > 0) {
			relationships.removeChild(relationshipChilds[0]);
			relationshipChilds = relationships.getElementsByTagName("Relationship");
		}

		xmlDocuments[relsFileName] = relsDoc;
		return relsDoc;
	}
	setAttributes(tag, attributes) {
		return setAttributes(tag, attributes);
	}
	getRelationship(searchedId) {
		return this.findRelationship({ Id: searchedId });
	}
	getRelationshipFullTarget(Id) {
		return this.findRelationship({ Id }).absoluteTarget;
	}
	findRelationship(filter) {
		let match = null;
		this.forEachRel((candidate) => {
			if (filter.Type && filter.Type === candidate.type) {
				match = candidate;
			}
			if (filter.Id && filter.Id === candidate.id) {
				match = candidate;
			}
		});
		return match;
	}
	addRelationship(obj) {
		const relationships = this.relsDoc.getElementsByTagName("Relationships")[0];
		const newTag = this.relsDoc.createElement("Relationship");
		const id = obj.Id || `rId${this.getNextRid()}`;
		this.setAttributes(newTag, {
			Id: id,
			...obj,
		});
		relationships.appendChild(newTag);
		return id;
	}
}
module.exports = RelationsManager;
