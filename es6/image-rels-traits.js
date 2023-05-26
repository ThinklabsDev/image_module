const extensionRegex = /[^.]+\.([^.]+)/;
const imgify = require("./img-manager.js");
const normalizePath = require("./normalize-path.js");
const { str2xml } = require("docxtemplater").DocUtils;
const drawingXmlContentType =
	"application/vnd.openxmlformats-officedocument.drawing+xml";
const xlsxdrawingType =
	"http://schemas.openxmlformats.org/officeDocument/2006/relationships/drawing";
const baseDrawingXlsx = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<xdr:wsDr xmlns:xdr="http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
</xdr:wsDr>`;

const { firstChild, appendChild } = require("./sxml.js");

function equal8(a, b) {
	const ua = new Uint8Array(a.buffer, a.byteOffset, a.byteLength);
	const ub = new Uint8Array(b.buffer, b.byteOffset, b.byteLength);
	return compare(ua, ub);
}
function equal16(a, b) {
	const ua = new Uint16Array(a.buffer, a.byteOffset, a.byteLength / 2);
	const ub = new Uint16Array(b.buffer, b.byteOffset, b.byteLength / 2);
	return compare(ua, ub);
}
function equal32(a, b) {
	const ua = new Uint32Array(a.buffer, a.byteOffset, a.byteLength / 4);
	const ub = new Uint32Array(b.buffer, b.byteOffset, b.byteLength / 4);
	return compare(ua, ub);
}

function compare(a, b) {
	for (let i = a.length; i > -1; i -= 1) {
		if (a[i] !== b[i]) {
			return false;
		}
	}
	return true;
}

function aligned16(a) {
	return a.byteOffset % 2 === 0 && a.byteLength % 2 === 0;
}

function aligned32(a) {
	return a.byteOffset % 4 === 0 && a.byteLength % 4 === 0;
}

function equal(a, b) {
	if (a instanceof ArrayBuffer) {
		a = new Uint8Array(a, 0);
	}
	if (b instanceof ArrayBuffer) {
		b = new Uint8Array(b, 0);
	}
	if (a.byteLength !== b.byteLength) {
		return false;
	}
	if (aligned32(a) && aligned32(b)) {
		return equal32(a, b);
	}
	if (aligned16(a) && aligned16(b)) {
		return equal16(a, b);
	}
	return equal8(a, b);
}

module.exports = function (relM) {
	imgify(relM);
	relM.loadImageRels = () => {
		const iterable = relM.relsDoc.getElementsByTagName("Relationship");
		return Array.prototype.reduce.call(
			iterable,
			function (max, relationship) {
				const id = relationship.getAttribute("Id");
				if (/^rId[0-9]+$/.test(id)) {
					return Math.max(max, parseInt(id.substr(3), 10));
				}
				return max;
			},
			0
		);
	};
	relM.addImageRels = (name, data) => {
		let path, realImageName;
		relM.addedImages.some(function (im) {
			let isEqual = false;
			if (
				typeof Buffer !== "undefined" &&
				data instanceof Buffer &&
				im.data instanceof Buffer
			) {
				isEqual = Buffer.compare(data, im.data) === 0;
			} else if (
				data instanceof ArrayBuffer &&
				im.data instanceof ArrayBuffer
			) {
				isEqual = equal(data, im.data);
			} else if (im.data === data) {
				isEqual = true;
			}
			if (isEqual) {
				realImageName = im.realImageName;
				return true;
			}
		});
		if (realImageName) {
			path = `${relM.prefix}/media/${realImageName}`;
		} else {
			let i = 0;
			do {
				realImageName = i === 0 ? name : name + `(${i})`;
				path = `${relM.prefix}/media/${realImageName}`;
				i++;
			} while (relM.zip.files[path] != null);
			relM.addedImages.push({ data, realImageName });
		}

		relM.zip.file(path, data, { binary: true });
		const extension = path.replace(extensionRegex, "$1");
		relM.addExtensionRels(`image/${extension}`, extension);
		relM.addExtensionRels(
			"application/vnd.openxmlformats-package.relationships+xml",
			"rels"
		);
		const relationships = relM.relsDoc.getElementsByTagName("Relationships")[0];

		const mediaPrefix =
			relM.fileType === "pptx" || relM.fileType === "xlsx"
				? "../media"
				: "media";

		const relationshipChilds =
			relationships.getElementsByTagName("Relationship");

		for (let j = 0, len = relationshipChilds.length; j < len; j++) {
			const c = relationshipChilds[j];
			if (c.getAttribute("Target") === `${mediaPrefix}/${realImageName}`) {
				return c.getAttribute("Id");
			}
		}

		return relM.addRelationship({
			Type: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/image",
			Target: `${mediaPrefix}/${realImageName}`,
		});
	};
	relM.addDrawingXML = () => {
		const zipFiles = relM.zip.files;
		let fileName;
		let i;
		i = 0;
		do {
			i++;
			fileName = `xl/drawings/drawing${i}.xml`;
		} while (zipFiles[fileName] || relM.xmlDocs[fileName]);
		relM.drawingFile = fileName;
		const id = relM.addRelationship({
			Type: xlsxdrawingType,
			Target: `/${fileName}`,
		});
		relM.addOverride(drawingXmlContentType, `/${fileName}`);
		relM.xmlDocs[fileName] = str2xml(baseDrawingXlsx);
		relM.drawingId = id;
		relM.drawing = fileName;
	};
	relM.getDrawingPath = function (id) {
		return normalizePath(relM.getRelationship(id).target, "xl/drawings").substr(
			1
		);
	};
	relM.setDrawingId = function (id) {
		const target = normalizePath(
			relM.getRelationship(id).target,
			"xl/drawings"
		);
		relM.drawingFile = target.substr(1);
	};

	relM.getOneCellAnchor = function (
		col,
		offsetY,
		row,
		offsetX,
		rId,
		extentX,
		extentY
	) {
		return `<xdr:oneCellAnchor xmlns:xdr="http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
		<xdr:from>
		<xdr:col>${col}</xdr:col>
		<xdr:colOff>${offsetY}</xdr:colOff>
		<xdr:row>${row}</xdr:row>
		<xdr:rowOff>${offsetX}</xdr:rowOff>
		</xdr:from>
		<xdr:ext cx="${extentX}" cy="${extentY}"/>
		<xdr:pic>
		<xdr:nvPicPr>
		<xdr:cNvPr descr="image-1" id="4" name="image-1" title="image-1"/>
		<xdr:cNvPicPr>
		<a:picLocks noChangeAspect="1"/>
		</xdr:cNvPicPr>
		</xdr:nvPicPr>
		<xdr:blipFill>
		<a:blip r:embed="${rId}"/>
		<a:stretch>
		<a:fillRect/>
		</a:stretch>
		</xdr:blipFill>
		<xdr:spPr>
		<a:xfrm>
		<a:off x="0" y="0"/>
		<a:ext cx="${extentX}" cy="${extentY}"/>
		</a:xfrm>
		<a:prstGeom prst="rect">
		<a:avLst/>
		</a:prstGeom>
		</xdr:spPr>
		</xdr:pic>
		<xdr:clientData/>
		</xdr:oneCellAnchor>`;
	};

	relM.addXLSXImage = function (part, [extentX, extentY], rId) {
		const offsetX = 0;
		const offsetY = 0;
		const col = part.colNum - 1;
		const row = part.row - 1;
		const oneCellAnchor = relM.getOneCellAnchor(
			col,
			offsetY,
			row,
			offsetX,
			rId,
			extentX,
			extentY
		);

		if (this.mainDoc) {
			const root = this.mainDoc.getElementsByTagName("xdr:wsDr")[0];
			root.appendChild(str2xml(oneCellAnchor).childNodes[0]);
			return;
		}

		const dx = this.mod.docxtemplater.compiled[this.fileName].postparsed;
		const root = firstChild(dx, "xdr:wsDr");
		if (root) {
			appendChild(root, [
				{
					type: "content",
					value: oneCellAnchor,
				},
			]);
		}
	};

	return relM;
};
