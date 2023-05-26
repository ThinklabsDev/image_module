const TemplateCreator = require("./templates.js");
const Docxtemplater = require("docxtemplater");
const {
	utf8ToWord,
	traits,
	str2xml,
	xml2str,
	isContent,
	chunkBy,
	moduleWrapper,
} = Docxtemplater.DocUtils;

const { XTInternalError, XTRenderingError, XTTemplateError } =
	Docxtemplater.Errors;

const { getRawRotation } = require("./rotation-flip-utils.js");
const { toEMU } = require("./size-converter.js");
const { isStartingTag } = require("./tag.js");
const converter = require("./converter.js");
const getMaxDocPrId = require("./max-docprid.js");
const addImageTraits = require("./image-rels-traits.js");
const addLinkTrait = require("./link-trait.js");

const { setSingleAttribute, getSingleAttribute } = require("./attributes.js");
const { parse: lexParse, xmlparse } = require("docxtemplater/js/lexer.js");
const { parse } = require("docxtemplater/js/parser.js");
const verifyApiVersion = require("./api-verify.js");
const normalizePath = require("./normalize-path.js");
const RelationsManager = require("./relationship-manager.js");
const { isNaN, isFloat, isPositive } = require("./type-conditions.js");
const widthCollector = require("./get-widths.js");
const {
	firstDirectChild,
	firstDirectChildOrCreate,
	firstChild,
	getContent,
	getAttribute,
	dropSelf,
	findParent,
	findChilds,
	appendChild,
} = require("./sxml.js");
const pushArray = require("./push-array.js");

const imageTypes = [
	"http://schemas.openxmlformats.org/officeDocument/2006/relationships/image",
	"http://schemas.microsoft.com/office/2007/relationships/hdphoto",
	"http://purl.oclc.org/ooxml/officeDocument/relationships/image",
];

function getDefaultProps(props) {
	props.align ||= "center";
	props.alt ||= "";
	props.name ||= "Image";
	props.imageFit ||= "contain";
	props.rotation ||= 0;
	if (props.caption) {
		props.caption.prefix ??= [
			"Illustration ",
			{ seq: "SEQ Figure \\* ARABIC" },
		];
		if (typeof props.caption.prefix === "string") {
			props.caption.prefix = [props.caption.prefix];
		}
		props.caption.height ??= 51.0667; // Value calculated since v3.20.1
		props.caption.height = toEMU(props.caption.height + "px", props);
	}
	return props;
}

function getIncorrectPromiseError(part, options) {
	const err = new XTRenderingError(
		"imageBuffer is a promise, you probably should use doc.renderAsync() instead of doc.render()"
	);
	err.properties = {
		file: options.filePath,
		part,
		explanation:
			"The developper should change the call from doc.render() to doc.renderAsync()",
	};
	return err;
}

function magicExtension(input) {
	const signature = [];
	if (input instanceof ArrayBuffer) {
		const small = new Uint8Array(input.slice(0, 4));
		signature.push(small[0]);
		signature.push(small[1]);
		signature.push(small[2]);
		signature.push(small[3]);
	} else if (typeof input === "string") {
		signature.push(input.charCodeAt(0));
		signature.push(input.charCodeAt(1));
		signature.push(input.charCodeAt(2));
		signature.push(input.charCodeAt(3));
	} else if (input.copy) {
		signature.push(parseInt(input[0], 10));
		signature.push(parseInt(input[1], 10));
		signature.push(parseInt(input[2], 10));
		signature.push(parseInt(input[3], 10));
	} else {
		const err = new XTRenderingError(
			"Could not parse the image as a Buffer, string or ArrayBuffer"
		);
		err.properties = {
			explanation:
				"Could not parse the image as a Buffer, string or ArrayBuffer (object type : ${typeof input})",
			id: "image_not_parseable",
		};
		throw err;
	}

	if (arrComp(signature, [60, 115, 118, 103])) {
		return "svg";
	}
	if (arrComp(signature, [137, 80, 78, 71])) {
		return "png";
	}
	if (arrComp(signature, [255, 216, 255])) {
		return "jpeg";
	}

	if (arrComp(signature, [71, 73, 70, 56])) {
		return "gif";
	}

	if (arrComp(signature, [66, 77])) {
		return "bmp";
	}

	if (
		arrComp(signature, [77, 77, 0, 42]) ||
		arrComp(signature, [73, 73, 42, 0])
	) {
		return "tif";
	}
	throw new XTInternalError(
		`could not find extension for this image ${signature.join(",")}`
	);
}

function arrComp(arr1, arr2) {
	for (let i = 0, len = arr2.length; i < len; i++) {
		if (arr1[i] !== arr2[i]) {
			return false;
		}
	}
	return true;
}

const imgContainers = [
	"xdr:oneCellAnchor",
	"xdr:twoCellAnchor",
	"w:drawing",
	"p:pic",
];
const svgUnsupportedBase64 = require("./svg-unsupported.js");
const { isSVG, getSVGSize } = require("./svg.js");
const calculatePlaceholderPositions = require("./calculate-placeholder-positions.js");

const moduleName = "open-xml-templating/docxtemplater-image-module";
const moduleNameCentered =
	"open-xml-templating/docxtemplater-image-module-centered";
const moduleNameReplace =
	"open-xml-templating/docxtemplater-replace-image-module";
const moduleNameCell =
	"open-xml-templating/docxtemplater-pptx-cell-fill-image-module";

const slideContentType =
	"application/vnd.openxmlformats-officedocument.presentationml.slide+xml";

function hasColumnBreak(chunk) {
	return chunk.some(function (part) {
		if (part.tag === "w:br" && part.value.indexOf('w:type="column"') !== -1) {
			return true;
		}
	});
}

function getInnerDocxBlockCentered({
	part,
	left,
	right,
	postparsed,
	index,
	leftParts,
}) {
	if (hasColumnBreak(leftParts)) {
		part.hasColumnBreak = true;
	}

	const paragraphParts = postparsed.slice(left + 1, right);
	paragraphParts.forEach(function (p, i) {
		if (i === index - left - 1) {
			return;
		}
		if (isContent(p)) {
			const err = new XTTemplateError(
				"Centered Images should be placed in empty paragraphs, but there is text surrounding this tag"
			);
			err.properties = {
				part,
				offset: part.offset,
				explanation:
					"Centered Images should be placed in empty paragraphs, but there is text surrounding this tag",
				id: "centered_image_should_be_in_paragraph",
			};
			throw err;
		}
	});
	return part;
}

function getInnerPptx({ left, right, postparsed, index, part }) {
	let cx;
	let cy;
	let x;
	let y;
	this.placeholderIds[this.filePath].forEach(function (ph) {
		if (ph.lIndex[0] < part.lIndex && part.lIndex < ph.lIndex[1]) {
			cx = ph.cx;
			cy = ph.cy;
			x = ph.x;
			y = ph.y;
		}
	});

	part.ext = { cx, cy };
	part.offset = { x, y };
	part.extPx = {
		cx: converter.emuToPixel(cx, this.dpi),
		cy: converter.emuToPixel(cy, this.dpi),
	};
	part.containerWidth = part.extPx.cx;
	part.containerHeight = part.extPx.cy;
	part.offsetPx = {
		x: converter.emuToPixel(x, this.dpi),
		y: converter.emuToPixel(y, this.dpi),
	};

	const paragraphParts = postparsed.slice(left + 1, right);
	if (part.module === moduleNameCell) {
		return part;
	}
	paragraphParts.forEach(function (p, i) {
		if (i === index - left - 1) {
			return;
		}
		if (isContent(p)) {
			const err = new XTTemplateError(
				"Centered Images should be placed in empty paragraphs, but there is text surrounding this tag"
			);
			err.properties = {
				part,
				explanation:
					"Centered Images should be placed in empty paragraphs, but there is text surrounding this tag",
				id: "centered_image_should_be_in_paragraph",
			};
			throw err;
		}
	});
	return part;
}

function getSimpleId(part, options) {
	return options.filePath + "@" + part.lIndex.toString();
}

function getResolvedId(part, options) {
	return (
		options.filePath +
		"@" +
		part.lIndex.toString() +
		"-" +
		options.scopeManager.scopePathItem.join("-")
	);
}

function getImageFromAttribute(part, attributeName, options) {
	let hasImage;
	const attribute = getSingleAttribute(part.value, attributeName);
	const xmlparsed = xmlparse(`<t>${attribute}</t>`, {
		text: ["t"],
		other: this.docxtemplater.fileTypeConfig.tagsXmlLexedArray,
	});

	const lexResult = lexParse(xmlparsed, this.docxtemplater.options.delimiters);
	const lexed = lexResult.lexed;
	const catchSlidesRepeat =
		"pro-xml-templating/catch-slides-repeat-inside-image";

	const submodules = [
		moduleWrapper({
			name: "InnerImageModule",
			matchers: () => [
				[
					this.prefix.normal,
					moduleName,
					{
						location: "start",
						onMatch: (part) => {
							hasImage = part;
						},
					},
				],
			],
		}),
	];
	if (options.fileType === "pptx") {
		submodules.push(
			moduleWrapper({
				name: "CatchSlidesRepeatInsideImage",
				matchers: () => [[":", catchSlidesRepeat]],
			})
		);
	}

	const parsed = parse(lexed, submodules, options);
	const errors = [];
	parsed.forEach(function (part) {
		if (part.module === catchSlidesRepeat) {
			const err = new XTTemplateError(
				"Image descriptions can not contain tags starting with :, such as {:data}. Place your slides repeat tag in a separate visible textbox on the slide."
			);
			err.properties = {
				part,
				explanation: `The tag {:${part.value}} is not allowed in an image description. Place the {:${part.value}} tag in a separate visible textbox on the slide.`,
				id: "slides_module_tag_not_allowed_in_image_description",
			};
			errors.push(err);
		}
	});
	if (errors.length) {
		return {
			errors,
		};
	}
	if (!hasImage) {
		return;
	}
	const newAttribute = parsed
		.map(function (part) {
			if (part.text || part.module === moduleName) {
				return "";
			}
			return part.value;
		})
		.join("");

	part.value = setSingleAttribute(part.value, attributeName, newAttribute);
	return hasImage;
}

class ImageModule {
	constructor(options) {
		this.rms = {};
		this.templates = new TemplateCreator();
		this.sections = [];
		this.preparsed = {};
		this.columnNum = 0;
		this.addedImages = [];
		this.replaceImages = {};
		this.requiredAPIVersion = "3.36.0";
		this.placeholderIds = {};
		this.name = "ImageModule";
		this.supportedFileTypes = ["docx", "pptx", "xlsx"];
		options = options || {};
		options.centered = options.centered || false;
		this.options = options;
		options.getSVGFallback = options.getSVGFallback || svgUnsupportedBase64;
		this.imgManagers = {};
		this.resolved = {};
		this.W = {};
		this.dpi = this.options.dpi;
		this.drawingPart = {};
		this.renderedXmlImages = {};
		if (options.getImage == null) {
			throw new XTInternalError(
				'You should pass "getImage" to the imagemodule constructor'
			);
		}
		if (options.getSize == null) {
			throw new XTInternalError(
				'You should pass "getSize" to the imagemodule constructor'
			);
		}
		this.prefix = {
			normal: "%",
			centered: "%%",
		};
		this.imageNumber = 1;
	}
	clone() {
		return new ImageModule(this.options);
	}
	on(event) {
		const { fileType } = this;
		if (fileType === "xlsx") {
			return;
		}
		if (event !== "syncing-zip") {
			return;
		}
		// This is needed for subsection-module for example (tested by subsection module)
		this.xmlDocuments = this.zip
			.file(/\.xml\.rels/)
			.map((file) => file.name)
			.reduce((xmlDocuments, fileName) => {
				if (xmlDocuments[fileName]) {
					return xmlDocuments;
				}
				const content = this.zip.files[fileName].asText();
				xmlDocuments[fileName] = str2xml(content);
				return xmlDocuments;
			}, this.xmlDocuments);
		const relsFiles = Object.keys(this.xmlDocuments).filter(function (
			fileName
		) {
			return /\.xml\.rels/.test(fileName);
		});

		const imageFilesToKeep = [];
		relsFiles.forEach((relf) => {
			const xmldoc = this.xmlDocuments[relf];
			const associatedXml = relf.replace(/_rels\/|\.rels/g, "");
			const ridsInRenderedXmlFiles = [];
			const associatedFile = this.zip.files[associatedXml];
			if (associatedFile) {
				let text = "";

				if (this.xmlDocuments[associatedXml]) {
					text = xml2str(this.xmlDocuments[associatedXml]);
				} else {
					text = associatedFile.asText();
				}
				const lexed = this.Lexer.xmlparse(text, {
					text: [],
					other: [
						"a:blip",
						"asvg:svgBlip",
						"v:imagedata",
						"o:OLEObject",
						"v:fill",
						"a14:imgLayer",
					],
				});

				lexed.forEach(function (part) {
					const { type, value, position, tag } = part;
					if (
						type === "tag" &&
						["start", "selfclosing"].indexOf(position) !== -1
					) {
						if (["v:imagedata", "o:OLEObject", "v:fill"].indexOf(tag) !== -1) {
							ridsInRenderedXmlFiles.push(getSingleAttribute(value, "r:id"));
						} else {
							ridsInRenderedXmlFiles.push(getSingleAttribute(value, "r:embed"));
						}
					}
				});
			}
			if (ridsInRenderedXmlFiles.length === 0) {
				return;
			}
			const rels = xmldoc.getElementsByTagName("Relationship");
			for (let i = 0, len = rels.length; i < len; i++) {
				const rel = rels[i];
				const target = rel.getAttribute("Target");
				const type = rel.getAttribute("Type");
				const targetMode = rel.getAttribute("TargetMode");
				const normalized = normalizePath(target, relf);
				if (targetMode === "External") {
					continue;
				}
				if (imageTypes.indexOf(type) !== -1) {
					if (associatedFile) {
						const rId = rel.getAttribute("Id");
						if (ridsInRenderedXmlFiles.indexOf(rId) === -1) {
							continue;
						}
					}
					imageFilesToKeep.push(normalized);
				}
			}
		});

		this.zip.file(/\/media\//).forEach((file) => {
			if (imageFilesToKeep.indexOf(`/${file.name}`) === -1) {
				this.zip.remove(file.name);
			}
		});

		relsFiles.forEach((relf) => {
			const xmldoc = this.xmlDocuments[relf];
			let rels = xmldoc.getElementsByTagName("Relationship");
			let len = rels.length;
			for (let i = 0; i < len; i++) {
				const rel = rels[i];
				const target = rel.getAttribute("Target");
				const targetMode = rel.getAttribute("TargetMode");
				const normalized = normalizePath(target, relf);
				const type = rel.getAttribute("Type");
				if (target.toLowerCase() === "null") {
					continue;
				}
				if (
					targetMode !== "External" &&
					imageTypes.indexOf(type) !== -1 &&
					imageFilesToKeep.indexOf(normalized) === -1
				) {
					rel.parentNode.removeChild(rel);
					rels = xmldoc.getElementsByTagName("Relationship");
					i = -1;
					len = rels.length;
				}
			}
		});
	}
	optionsTransformer(options, docxtemplater) {
		this.docxtemplater = docxtemplater;
		verifyApiVersion(docxtemplater, this.requiredAPIVersion);
		this.fileTypeConfig = docxtemplater.fileTypeConfig;
		this.fileType = docxtemplater.fileType;
		if (["pptx", "xlsx", "docx"].indexOf(this.fileType) !== -1) {
			this.dpi = this.dpi || 96;
		}
		this.zip = docxtemplater.zip;
		this.maxDocPrId = getMaxDocPrId(this.zip);

		const relsFiles = this.zip
			.file(/\.xml\.rels/)
			.concat(docxtemplater.zip.file(/\[Content_Types\].xml/))
			.map((file) => file.name);

		options.xmlFileNames = options.xmlFileNames.concat(relsFiles);

		this.fileTypeConfig.tagsXmlLexedArray.push(
			"a:xfrm",
			"a:ext",
			"a:off",
			"drawing",
			"p:graphicFrame",
			"p:ph",
			"p:pic",
			"p:sp",
			"a:blip",
			"asvg:svgBlip",
			"xdr:pic",
			"xdr:wsDr",
			"xdr:cNvPr",
			"xdr:from",
			"a:solidFill",
			"a:noFill",
			"a:srgbClr",
			"a:lnTlToBr",
			"a:lnBlToTr",
			"a:lnB",
			"a:lnT",
			"a:lnR",
			"a:lnL",
			"xdr:to",
			"xdr:col",
			"xdr:colOff",
			"xdr:row",
			"xdr:rowOff",
			"v:shape",
			"v:rect",
			"w:col",
			"w:cols",
			"w:drawing",
			"w:footerReference",
			"w:headerReference",
			"w:pgMar",
			"w:pgSz",
			"w:pict",
			"w:sectPr",
			"a:tcPr",
			"a:tbl",
			"a:tblGrid",
			"a:gridCol",
			"a:tc",
			"w:tc",
			"w:tcW",
			"wp:docPr",
			"p:cNvPr",
			"wp:extent",
			"xdr:ext",
			...imgContainers
		);
		return options;
	}
	set(options) {
		if (options.Lexer) {
			this.Lexer = options.Lexer;
		}
		if (options.xmlDocuments) {
			this.xmlDocuments = options.xmlDocuments;
		}
	}

	matchers(options) {
		this.filePath = options.filePath;
		let { normal, centered } = this.prefix;
		if (this.options.centered) {
			normal = this.prefix.centered;
			centered = this.prefix.normal;
		}

		const W = this.W[options.filePath];
		const [containerWidth, containerHeight] = W.getDimensions(options, options);

		return [
			[
				centered,
				moduleNameCentered,
				{
					containerWidth,
					containerHeight,
				},
			],
			[
				normal,
				moduleName,
				{
					containerWidth,
					containerHeight,
				},
			],
		];
	}
	preparse(parsed, options) {
		if (options.contentType === slideContentType) {
			findChilds(parsed, "a:tbl").forEach((table) => {
				const tblGrid = firstDirectChild(table, "a:tblGrid");
				if (!tblGrid) {
					return;
				}

				const gridCols = findChilds(tblGrid, "a:gridCol").map(function (
					gridCol
				) {
					return +getAttribute(gridCol, "w");
				});
				findChilds(parsed, "a:tr").forEach((tr) => {
					const height = +getAttribute(tr, "h");
					findChilds(tr, "a:tc").forEach((tc, indexTc) => {
						const width = gridCols[indexTc];
						const part = tc.xml[tc.index[0]];
						part.containerWidth = converter.emuToPixel(width, this.dpi);
						part.containerHeight = converter.emuToPixel(height, this.dpi);
					});
				});
			});
		}
		this.preparsed[options.filePath] = parsed;
		this.W[options.filePath] = this.W[options.filePath] || widthCollector(this);
		const W = this.W[options.filePath];
		W.collect(parsed, options);
	}
	getRelationsManager(filePath) {
		// The check of this.fileType === "pptx" is to avoid a bug with the slides module
		if (!this.rms[filePath] || this.fileType === "pptx") {
			this.rms[filePath] = addLinkTrait(
				addImageTraits(new RelationsManager(this, filePath))
			);
			this.rms[filePath].addedImages = this.addedImages;
		}
		return this.rms[filePath];
	}
	upsertDrawing(options) {
		const imgManager = this.getRelationsManager(options.filePath);
		if (imgManager.drawingId) {
			return;
		}
		const part = this.drawingPart[options.filePath];
		if (part) {
			imgManager.setDrawingId(getSingleAttribute(part.value, "r:id"));
			return;
		}
		imgManager.addDrawingXML();
	}
	postparsePptxCell(parsed) {
		let insideTableCell = false;
		for (let i = 0, len = parsed.length; i < len; i++) {
			const part = parsed[i];

			if (part.type === "tag" && part.tag === "a:tc") {
				insideTableCell = part.position === "start";
			}

			if (part.module === moduleName && insideTableCell) {
				part.module = moduleNameCell;
				parsed.splice(i, 1);
				const aTc = findParent({ xml: parsed, index: [i, i] }, "a:tc");
				const tcPart = aTc.xml[aTc.index[0]];
				part.containerWidth = tcPart.containerWidth;
				part.containerHeight = tcPart.containerHeight;
				const tcProps = firstDirectChildOrCreate(aTc, "a:tcPr");
				appendChild(tcProps, [part]);
				const solidFill = firstDirectChild(tcProps, "a:solidFill");
				if (solidFill) {
					dropSelf(solidFill);
				}
				const noFill = firstDirectChild(tcProps, "a:noFill");
				if (noFill) {
					dropSelf(noFill);
				}
				len = parsed.length;
			}
		}
		return parsed;
	}
	postparse(parsed, options) {
		this.filePath = options.filePath;
		const { fileType } = options;
		if (fileType === "xlsx") {
			parsed.forEach((part) => {
				if (part.tag === "drawing") {
					this.drawingPart[options.filePath] = part;
				}
			});
		}

		let expandToNormal,
			expandToCentered,
			getInner,
			getInnerCentered,
			errorNormal = {},
			errorCentered = {};

		switch (fileType) {
			case "pptx":
				getInner = getInnerPptx;
				getInnerCentered = getInnerPptx;
				expandToNormal = ["p:sp", "p:graphicFrame"];
				expandToCentered = ["p:sp", "p:graphicFrame"];
				errorNormal = {
					message: "Image tag should not be placed inside a loop",
					id: "image_tag_no_access_to_p_sp",
					explanation: (part) =>
						`The image tag "${part.value}" should not be placed inside a loop, it should be the only text in a given shape`,
				};
				errorCentered = errorNormal;
				break;
			case "docx":
				getInnerCentered = getInnerDocxBlockCentered;
				expandToCentered = "w:p";
				errorCentered = {
					message: "Block Image tag should not be placed inside an inline loop",
					id: "image_tag_no_access_to_w_p",
					explanation: (part) =>
						`The block image tag "${part.value}" should not be placed inside an inline loop, it can be placed in a block loop (paragraphLoop)`,
				};

				break;
		}

		calculatePlaceholderPositions.apply(this, [parsed, options]);

		this.postparsePptxCell(parsed);

		let postparsed = {
			postparsed: parsed,
			errors: [],
		};
		if (fileType === "pptx") {
			postparsed = traits.expandToOne(postparsed, {
				moduleName,
				getInner: getInner.bind(this),
				expandTo: expandToNormal,
				error: errorNormal,
			});
		}
		if (fileType === "docx" || fileType === "pptx") {
			postparsed = traits.expandToOne(postparsed, {
				moduleName: moduleNameCentered,
				getInner: getInnerCentered.bind(this),
				expandTo: expandToCentered,
				error: errorCentered,
			});
		}

		const chunks = chunkBy(postparsed.postparsed, function (part) {
			if (part.type === "tag" && imgContainers.indexOf(part.tag) !== -1) {
				return part.position;
			}
		});

		const pp = [];
		if (chunks.length === 1) {
			return postparsed;
		}
		chunks.forEach((chunk) => {
			if (imgContainers.indexOf(chunk[0].tag) === -1) {
				pushArray(pp, chunk);
				return;
			}
			const imgManager = this.getRelationsManager(options.filePath);
			let cx, cy;
			let hasImage;
			let rId;
			let imagePath;
			const blipChild = firstChild(chunk, ["a:blip"]);
			if (blipChild) {
				rId = getAttribute(blipChild, "r:embed");
				if (rId) {
					imagePath = imgManager.getImageByRid(rId);
				}
			}

			chunk.forEach((part) => {
				if (["a:ext", "wp:extent", "xdr:ext"].indexOf(part.tag) !== -1) {
					cx = getSingleAttribute(part.value, "cx") || cx;
					cy = getSingleAttribute(part.value, "cy") || cy;
				}

				if (
					isStartingTag(part, "wp:docPr") ||
					isStartingTag(part, "p:cNvPr") ||
					isStartingTag(part, "xdr:cNvPr")
				) {
					hasImage = getImageFromAttribute.bind(this)(part, "name", options);
					if (!hasImage) {
						hasImage = getImageFromAttribute.bind(this)(part, "title", options);
					}
					if (!hasImage) {
						hasImage = getImageFromAttribute.bind(this)(part, "descr", options);
					}
				}
			});

			if (hasImage) {
				let rowOffStart;
				let colOffStart;
				let row;
				let col;
				const twoCellAnchor = firstChild(chunk, "xdr:twoCellAnchor");
				if (twoCellAnchor) {
					col = +getContent(firstChild(chunk, ["xdr:from", "xdr:col"]));
					row = +getContent(firstChild(chunk, ["xdr:from", "xdr:row"]));
					colOffStart = +getContent(
						firstChild(chunk, ["xdr:from", "xdr:colOff"])
					);
					rowOffStart = +getContent(
						firstChild(chunk, ["xdr:from", "xdr:rowOff"])
					);
				}
				if (hasImage.errors) {
					pushArray(postparsed.errors, hasImage.errors);
				} else {
					const type = "placeholder";
					const image = {
						lIndex: chunk[0].lIndex,
						type,
						...(twoCellAnchor
							? {
									twoCellAnchor,
									col,
									row,
									colOffStart,
									rowOffStart,
							  }
							: {}),
						cx,
						cy,
						width: converter.emuToPixel(cx, this.dpi),
						height: converter.emuToPixel(cy, this.dpi),
						value: hasImage.value,
						module: moduleNameReplace,
						rId,
						expanded: chunk,
						path: imagePath,
					};

					pp.push(image);
					this.replaceImages[options.filePath] ||= [];
					this.replaceImages[options.filePath].push(image);
				}
			} else {
				pushArray(pp, chunk);
			}
		});

		postparsed.postparsed = pp;
		postparsed.errors = postparsed.errors || [];
		return postparsed;
	}
	resolve(part, options) {
		if (
			!part.type === "placeholder" ||
			[
				moduleName,
				moduleNameCentered,
				moduleNameReplace,
				moduleNameCell,
			].indexOf(part.module) === -1
		) {
			return null;
		}

		const tagValue = options.scopeManager.getValue(part.value, { part });
		const resolvedId = getResolvedId(part, options);
		return Promise.resolve(tagValue)
			.then(function (val) {
				if (!val) {
					return Promise.resolve(options.nullGetter(part));
				}
				return val;
			})
			.then((tagValue) => {
				if (!tagValue) {
					this.resolved[resolvedId] = null;
					return { value: "" };
				}
				return Promise.resolve(this.options.getImage(tagValue, part.value))
					.catch((e) => {
						const err = new XTRenderingError(e.message);
						err.properties = {
							id: "img_getting_failed",
							explanation: `Could not get value for image '${part.value}'`,
						};
						throw err;
					})
					.then((imgBuffer) => {
						if (!imgBuffer) {
							if (tagValue === true) {
								this.resolved[resolvedId] = true;
							} else {
								this.resolved[resolvedId] = null;
							}
							return { value: "" };
						}
						let sizePixel;
						let svgFallback;
						if (isSVG(imgBuffer)) {
							sizePixel = this.options.getSize(
								imgBuffer,
								tagValue,
								part.value,
								{
									svgSize: getSVGSize(imgBuffer),
									part,
									options,
								}
							);
							svgFallback = Promise.resolve(sizePixel).then((size) => {
								if (!size || size.length !== 2) {
									return;
								}
								return this.options.getSVGFallback(imgBuffer, size);
							});
						} else {
							sizePixel = this.options.getSize(
								imgBuffer,
								tagValue,
								part.value,
								{
									part,
									options,
								}
							);
						}
						return Promise.all([
							Promise.resolve(sizePixel),
							Promise.resolve(svgFallback),
						]).then(([sizePixel, svgFallback]) => {
							let resolved = {
								sizePixel,
								imgBuffer,
								tagValue,
								svgFallback,
							};
							if (this.options.getProps) {
								const props = this.options.getProps(
									imgBuffer,
									tagValue,
									part.value,
									{
										part,
										options,
										sizePixel,
									}
								);
								props.dpi ??= this.dpi;
								resolved = { ...getDefaultProps(props), ...resolved };
							}
							if (isSVG(imgBuffer)) {
								resolved.type = "svg";
							}
							this.resolved[resolvedId] = resolved;
						});
					});
			})
			.catch((e) => {
				this.resolved[resolvedId] = null;
				throw e;
			});
	}
	// eslint-disable-next-line complexity
	getValues(part, options) {
		const resolvedId = getResolvedId(part, options);
		if (this.resolved[resolvedId] === null) {
			return null;
		}
		if (this.resolved[resolvedId]) {
			return this.resolved[resolvedId];
		}
		let tagValue = options.scopeManager.getValue(part.value, { part });
		if (!tagValue) {
			tagValue = options.nullGetter(part);
			if (!tagValue) {
				return null;
			}
		}
		let imgBuffer;
		try {
			imgBuffer = this.options.getImage(tagValue, part.value);
		} catch (e) {
			const err = new XTRenderingError(e.message);
			err.properties = {
				id: "img_getting_failed",
				explanation: `Could not get value for image '${part.value}'`,
			};
			throw err;
		}
		if (!imgBuffer) {
			if (tagValue === true) {
				return true;
			}
			return null;
		}
		if (isSVG(imgBuffer)) {
			const sizePixel = this.options.getSize(imgBuffer, tagValue, part.value, {
				svgSize: getSVGSize(imgBuffer),
				part,
				options,
			});
			const svgFallback = this.options.getSVGFallback(imgBuffer);
			return {
				type: "svg",
				imgBuffer,
				svgFallback,
				tagValue,
				sizePixel,
			};
		}
		const sizePixel = this.options.getSize(imgBuffer, tagValue, part.value, {
			part,
			options,
		});
		let result = {
			type: "image",
			imgBuffer,
			sizePixel,
			tagValue,
			offsetPixel: [0, 0],
		};
		if (this.options.getProps) {
			const props = this.options.getProps(imgBuffer, tagValue, part.value, {
				part,
				options,
				sizePixel,
			});
			result = { ...props, ...result };
		}
		return result;
	}
	// eslint-disable-next-line complexity
	render(part, options) {
		if (part.tag === "w:sectPr") {
			this.columnNum = 0;
		}
		if (hasColumnBreak([part])) {
			this.columnNum++;
		}
		const { fileType } = this;
		if (
			fileType === "xlsx" &&
			part.type === "tag" &&
			part.tag === "worksheet" &&
			part.position === "end" &&
			!this.drawingPart[options.filePath]
		) {
			const imgManager = this.getRelationsManager(options.filePath);
			if (imgManager.drawingId) {
				return {
					value: `<drawing r:id="${imgManager.drawingId}"/>${part.value}`,
				};
			}
		}

		if (
			!part.type === "placeholder" ||
			[
				moduleName,
				moduleNameCentered,
				moduleNameReplace,
				moduleNameCell,
			].indexOf(part.module) === -1
		) {
			return null;
		}
		if (part.hasColumnBreak) {
			this.columnNum++;
		}
		this.filePath = options.filePath;
		const other = this.docxtemplater.mapper[options.filePath].from;

		const W = this.W[other];
		const [containerWidth, containerHeight] = W.getDimensions(part, options);
		part.containerWidth = containerWidth || part.containerWidth;
		part.containerHeight = containerHeight || part.containerHeight;

		const simpleId = getSimpleId(part, options);
		if (
			part.module === moduleNameReplace &&
			fileType === "xlsx" &&
			part.twoCellAnchor &&
			this.renderedXmlImages[simpleId] &&
			!options.calledByXlsx
		) {
			return { value: this.renderedXmlImages[simpleId].join("") };
		}
		const values = this.getValues(part, options);
		if (values === null) {
			return { value: "" };
		}
		if (values === true) {
			if (part.module === moduleNameReplace) {
				return {
					value: part.expanded
						.map(function ({ value }) {
							return value;
						})
						.join(""),
				};
			}
			return { value: "" };
		}
		if (values.offset) {
			values.offsetPixel = values.offset;
		}
		values.runBefore = part.hasColumnBreak
			? '<w:r><w:br w:type="column"/></w:r>'
			: "";
		const { imgBuffer, sizePixel, tagValue, type, svgFallback, offsetPixel } =
			values;
		const errMsg =
			"Size for image is not valid (it should be an array of two numbers, such as [ 1024, 1024 ])";
		if (!sizePixel || sizePixel.length !== 2) {
			const e = new XTRenderingError(errMsg);
			e.properties = {
				tagValue,
			};
			throw e;
		}
		sizePixel.forEach(function (size) {
			if ((!isFloat(size) || !isPositive(size)) && typeof size !== "string") {
				const e = new XTRenderingError(errMsg);
				e.properties = {
					sizePixel,
					tagValue,
				};
				throw e;
			}
		});

		let imgManager = this.getRelationsManager(options.filePath);

		if (values.link) {
			values.ridLink = imgManager.addLink(values.link);
		}
		if (fileType === "xlsx" && part.module !== moduleNameReplace) {
			this.upsertDrawing(options);
			const drawingFile = imgManager.drawingFile;
			imgManager = this.getRelationsManager(drawingFile);
		}
		const transformer = { dpi: this.dpi };
		const size = this.convertSize(sizePixel, transformer);
		let offset = [0, 0];
		if (offsetPixel) {
			offset = this.convertSize(offsetPixel, transformer);
		}
		if (size[0] === null || size[1] === null) {
			const errMsg =
				"Size for image is not valid (it should be an array of two numbers, such as [ 1024, 1024 ])";
			const e = new XTRenderingError(errMsg);
			e.properties = {
				sizePixel,
				tagValue,
			};
			throw e;
		}

		if (type === "svg") {
			const rIdSvg = imgManager.addImageRels(
				this.getNextImageName("svg"),
				imgBuffer
			);
			if (svgFallback && typeof svgFallback.then === "function") {
				return {
					errors: [getIncorrectPromiseError(part, options)],
				};
			}
			let rIdBinary;
			try {
				rIdBinary = imgManager.addImageRels(
					this.getNextImageName(magicExtension(svgFallback)),
					svgFallback
				);
			} catch (e) {
				return { errors: [e] };
			}
			return this.getRenderedPart(
				type,
				part,
				[rIdBinary, rIdSvg],
				size,
				values
			);
		}

		if (imgBuffer && typeof imgBuffer.then === "function") {
			return {
				errors: [getIncorrectPromiseError(part, options)],
			};
		}

		let rId;
		try {
			rId = imgManager.addImageRels(
				this.getNextImageName(magicExtension(imgBuffer)),
				imgBuffer
			);
		} catch (e) {
			return { errors: [e] };
		}

		if (part.module === moduleNameReplace) {
			if (fileType === "xlsx" && part.twoCellAnchor) {
				const { col, row, colOffStart, rowOffStart } = part;
				const value = imgManager.getOneCellAnchor(
					col,
					colOffStart,
					row,
					rowOffStart,
					rId,
					size[0],
					size[1]
				);
				const simpleId = getSimpleId(part, options);
				if (options.calledByXlsx) {
					this.renderedXmlImages[simpleId] ||= [];
					this.renderedXmlImages[simpleId].push(value);
				} else if (this.renderedXmlImages[simpleId]) {
					return { value: this.renderedXmlImages[simpleId].join("") };
				}
				return {
					value,
				};
			}

			return {
				value: part.expanded
					// eslint-disable-next-line complexity
					.map(function (p) {
						if (
							isStartingTag(p, "a:ext") ||
							isStartingTag(p, "wp:extent") ||
							isStartingTag(p, "xdr:ext")
						) {
							let val = p.value;
							val = setSingleAttribute(val, "cx", size[0]);
							return setSingleAttribute(val, "cy", size[1]);
						}
						if (isStartingTag(p, "a:off")) {
							let val = p.value;
							const x = +getSingleAttribute(val, "x");
							const y = +getSingleAttribute(val, "y");
							if (offset[0] !== 0 || offset[1] !== 0) {
								val = setSingleAttribute(val, "x", x + offset[0]);
								val = setSingleAttribute(val, "y", y + offset[1]);
								return val;
							}
						}
						if (isStartingTag(p, "a:xfrm")) {
							let val = p.value;
							if (values.rotation) {
								val = setSingleAttribute(
									val,
									"rot",
									getRawRotation(values.rotation)
								);
							}
							if (values.flipVertical) {
								val = setSingleAttribute(val, "flipV", "1");
							}
							if (values.flipHorizontal) {
								val = setSingleAttribute(val, "flipH", "1");
							}
							return val;
						}
						if (isStartingTag(p, "wp:docPr")) {
							let newVal = p.value;
							if (values.name != null) {
								newVal = setSingleAttribute(
									newVal,
									"name",
									utf8ToWord(values.name)
								);
							}
							if (values.alt != null) {
								newVal = setSingleAttribute(
									newVal,
									"descr",
									utf8ToWord(values.alt)
								);
							}
							if (values.ridLink) {
								return `${newVal.replace("/>", ">")}
								<a:hlinkClick xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" tooltip="" r:id="${
									values.ridLink
								}"/>
								</wp:docPr>`;
							}
							return newVal;
						}
						if (isStartingTag(p, "p:cNvPr")) {
							if (values.ridLink) {
								return `${p.value.replace("/>", ">")}
								<a:hlinkClick xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" tooltip="" r:id="${
									values.ridLink
								}"/>
							</p:cNvPr>`;
							}
						}
						if (isStartingTag(p, "a:blip")) {
							return setSingleAttribute(p.value, "r:embed", rId);
						}
						if (isStartingTag(p, "asvg:svgBlip")) {
							return "";
						}
						return p.value;
					})
					.join(""),
			};
		}

		if (fileType === "xlsx") {
			imgManager.addXLSXImage(part, size, rId);
			return {
				value: "",
			};
		}

		return this.getRenderedPart(type, part, rId, size, values);
	}
	convertSize(sizePixel, obj) {
		let xSize = sizePixel[0];
		let ySize = sizePixel[1];
		if (typeof xSize === "number") {
			xSize += "px";
		}
		if (typeof ySize === "number") {
			ySize += "px";
		}
		return [toEMU(xSize, obj), toEMU(ySize, obj)];
	}
	getRenderedPart(type, part, rId, size, values) {
		if (isNaN(rId)) {
			throw new XTInternalError("rId is NaN, aborting");
		}
		const centered = part.module === moduleNameCentered;
		let newText;
		const props = getDefaultProps({
			dpi: this.dpi,
			...values,
			size,
			type,
			part,
		});
		const { fileType } = this;
		switch (fileType) {
			case "pptx":
				newText = this.getRenderedPartPptx(part, rId, size, centered, props);
				break;
			case "docx":
				newText = this.getRenderedPartDocx(type, rId, size, centered, props);
				// the part.raw != null is necessary to not add <w:t> when the render
				// happens from the HTML module
				if (centered === false && part.raw != null) {
					newText = `</w:t>${newText}<w:t xml:space="preserve">`;
				}
				break;
			default:
		}
		return { value: newText };
	}
	getRenderedPartPptx(part, rId, size, centered, props) {
		if (part.module === moduleNameCell) {
			let left;
			let right;
			let top;
			let bottom;
			left = 0;
			right = 0;
			top = 0;
			bottom = 0;
			if (props.imageFit === "fill") {
				left = 0;
				right = 0;
				top = 0;
				bottom = 0;
			}
			if (props.imageFit === "contain") {
				const imageAspectRatio = size[1] && size[0] ? size[1] / size[0] : 1;
				const containerAspectRatio =
					part.containerHeight && part.containerWidth
						? part.containerHeight / part.containerWidth
						: 1;
				let ratio = imageAspectRatio / containerAspectRatio;
				if (ratio === 1) {
					// 1% is default
					left = 1;
					right = 1;
					top = 1;
					bottom = 1;
				} else if (ratio < 1) {
					ratio *= 0.98;
					left = 1;
					right = 1;
					const toRemove = (1 - ratio) / 2;
					top = 100 * toRemove;
					bottom = 100 * toRemove;
				} else {
					ratio = 1 / ratio;
					ratio *= 0.98;
					top = 1;
					bottom = 1;
					const toRemove = (1 - ratio) / 2;
					left = 100 * toRemove;
					right = 100 * toRemove;
				}
			}
			const alpha = 100;
			return `<a:blipFill>
				<a:blip r:embed="${rId}" >
					<a:alphaModFix amt="${alpha * 1000}"/>
				</a:blip>
				<a:stretch>
					<a:fillRect l="${Math.round(left * 1000)}" t="${Math.round(
				top * 1000
			)}" r="${Math.round(right * 1000)}" b="${Math.round(bottom * 1000)}"/>
				</a:stretch>
			</a:blipFill>
			`;
		}
		const offset = { x: part.offset.x, y: part.offset.y };
		const cellCX = part.ext.cx;
		const cellCY = part.ext.cy;
		const imgW = size[0];
		const imgH = size[1];

		if (centered) {
			offset.x += parseInt(cellCX / 2 - imgW / 2, 10);
			offset.y += parseInt(cellCY / 2 - imgH / 2, 10);
		}

		return this.templates.getPptxImageXml(rId, [imgW, imgH], offset, props);
	}
	getRenderedPartDocx(type, rId, size, centered, props) {
		const docPrId = ++this.maxDocPrId;
		if (type === "svg") {
			return centered
				? this.templates.getImageSVGXmlCentered(
						rId[0],
						rId[1],
						size,
						docPrId,
						props
				  )
				: this.templates.getImageSVGXml(rId[0], rId[1], size, docPrId, props);
		}
		const value = centered
			? this.templates.getImageXmlCentered(rId, size, docPrId, props)
			: this.templates.getImageXml(rId, size, docPrId, props);
		if (props.caption && !centered) {
			this.maxDocPrId++;
		}
		return value;
	}
	getNextImageName(extension) {
		const name = `image_generated_${this.imageNumber}.${extension}`;
		this.imageNumber++;
		return name;
	}
}

module.exports = ImageModule;
