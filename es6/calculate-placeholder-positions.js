const { slideContentType } = require("./content-types.js");
const RelationsManager = require("./relationship-manager.js");
const { getSingleAttribute } = require("./attributes.js");
const { getAttribute, findParent, findChilds } = require("./sxml.js");

function updatePlaceholders(xml, filePath) {
	xml.forEach((tag, i) => {
		if (tag.type === "tag" && tag.tag === "p:ph") {
			const idx = getSingleAttribute(tag.value, "idx");
			const type = getSingleAttribute(tag.value, "type");
			const parent = findParent(
				{
					index: [i, i],
					xml,
				},
				"p:sp"
			);
			const off = findChilds(parent, ["a:xfrm", "a:off"]);
			const ext = findChilds(parent, ["a:xfrm", "a:ext"]);

			if (off.length === 0) {
				return;
			}

			const x = +getAttribute(off[0], "x");
			const y = +getAttribute(off[0], "y");
			const cx = +getAttribute(ext[0], "cx");
			const cy = +getAttribute(ext[0], "cy");

			this.placeholderIds[filePath].forEach(function (placeholder) {
				if (
					(placeholder.type == null || placeholder.type === type) &&
					(placeholder.idx == null || placeholder.idx === idx) &&
					placeholder.x == null
				) {
					placeholder.x = x;
					placeholder.y = y;
					placeholder.cx = cx;
					placeholder.cy = cy;
				}
			});
		}
	});
}

module.exports = function calculatePlaceholderPositions(parsed, options) {
	const { filePath, contentType } = options;
	if (this.fileType === "pptx" && slideContentType === contentType) {
		this.placeholderIds[filePath] = this.placeholderIds[filePath] || [];
		let lastIndex = null;
		let lastOffset = null;
		let idx;
		let type;
		let x, y, cx, cy;
		let lastI = null;
		const containerTags = ["p:sp", "p:graphicFrame", "p:pic"];
		parsed.forEach(({ tag, position, value, lIndex, offset }, i) => {
			if (containerTags.indexOf(tag) !== -1 && position === "start") {
				lastIndex = lIndex;
				lastOffset = offset;
				lastI = i;
			}
			if (tag === "p:ph" && position === "selfclosing") {
				idx = getSingleAttribute(value, "idx");
				type = getSingleAttribute(value, "type");
			}
			if (tag === "a:ext") {
				const xVal = parseInt(getSingleAttribute(value, "cx"), 10);
				if (typeof xVal === "number") {
					const yVal = parseInt(getSingleAttribute(value, "cy"), 10);
					cx = xVal;
					cy = yVal;
				}
			}
			if (tag === "a:off") {
				x = x || parseInt(getSingleAttribute(value, "x"), 10);
				y = y || parseInt(getSingleAttribute(value, "y"), 10);
			}
			if (containerTags.indexOf(tag) !== -1 && position === "end") {
				this.placeholderIds[filePath].push({
					lIndex: [lastIndex, lIndex],
					offset: [lastOffset, offset],
					idx,
					type,
					i: [lastI, i],
					cx,
					cy,
					x,
					y,
				});
				i = null;
				lastI = null;
				x = null;
				y = null;
				cx = null;
				cy = null;
				lastIndex = null;
				idx = null;
				type = null;
			}
		});
		const im = this.getRelationsManager(filePath);
		im.forEachRel((rel) => {
			if (
				rel.type ===
				"http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout"
			) {
				const layout = this.preparsed[rel.absoluteTarget];

				new RelationsManager(this, rel.absoluteTarget).forEachRel((rel) => {
					if (
						rel.type ===
						"http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster"
					) {
						updatePlaceholders.apply(this, [layout, filePath]);
						const master = this.preparsed[rel.absoluteTarget];
						updatePlaceholders.apply(this, [master, filePath]);
					}
				});
			}
		});
	}
};
