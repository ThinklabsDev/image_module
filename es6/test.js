const { expect } = require("chai");
const path = require("path");
const { times } = require("lodash");
const Errors = require("docxtemplater/js/errors.js");
const ImageModule = require("./index.js");
const fixDocPrCorruption = require("docxtemplater/js/modules/fix-doc-pr-corruption.js");
const expressionParser = require("docxtemplater/expressions.js");
const sxml = require("./sxml.js");
const imageSizes = {
	"image.png": [500, 555],
	"image2.png": [60, 60],
};

let SlidesModule;
try {
	SlidesModule = require("../../slides/es6/index.js");
} catch (e) {
	// eslint-disable-next-line no-console
	console.log(JSON.stringify({ msg: "Skipping Slides module tests" }));
	/* handle error */
}
const ddgLink = "https://ddg.gg";

const {
	shouldBeSame,
	expectToThrow,
	expectToThrowAsync,
	resolveSoon,
	rejectSoon,
	imageData,
	start,
	setExamplesDirectory,
	setStartFunction,
	createDoc,
	createDocV4,
	wrapMultiError,
} = require("docxtemplater/js/tests/utils.js");

let options, async, name, data, expectedName, v4;

function defaultNullGetter() {
	return "";
}

function nullGetter(part) {
	if (part.module === "open-xml-templating/docxtemplater-image-module") {
		return "d.jpeg";
	}
	if (
		part.module === "open-xml-templating/docxtemplater-image-module-centered"
	) {
		return "d.jpeg";
	}
	if (!part.module) {
		return "undefined";
	}
	if (part.module === "rawxml") {
		return "";
	}
	return "";
}

function asyncNullGetter(part) {
	return resolveSoon(nullGetter(part));
}

const base64ErrorImage =
	"data:image/png;base64,iVBORw0KGgoAAAA:::Z/d1kUm3SxkeAF/FdIjpOcw2vpKcRWCwsRPMFPsaIQSIoMr5pXDGNUFd9j8TOn7kRW71fvO5HTq6qqtnWtzh20IqE3YXtL0zyKwAROQLQ5l/c9gHjfKK6wMZjADE6s49Dver4/smEAc2CuqgwAYI5jU9NcxhHEy60sni9:86H9+vwG1yDHfK1jitgAAAABJRU5ErkJggg==";

const base64Image =
	"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAIAAAACUFjqAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH4QIJBywfp3IOswAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAAkUlEQVQY052PMQqDQBREZ1f/d1kUm3SxkeAF/FdIjpOcw2vpKcRWCwsRPMFPsaIQSIoMr5pXDGNUFd9j8TOn7kRW71fvO5HTq6qqtnWtzh20IqE3YXtL0zyKwAROQLQ5l/c9gHjfKK6wMZjADE6s49Dver4/smEAc2CuqgwAYI5jU9NcxhHEy60sni986H9+vwG1yDHfK1jitgAAAABJRU5ErkJggg==";

const base64svgimage =
	"data:image/svg+xml;base64,PHN2ZyBoZWlnaHQ9IjEwMCIgd2lkdGg9IjEwMCI+CiAgPGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iNDAiIHN0cm9rZT0iYmxhY2siIHN0cm9rZS13aWR0aD0iMyIgZmlsbD0icmVkIiAvPgo8L3N2Zz4g";

const base64sample =
	"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAACWCAMAAACsAjcrAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAACoUExURe0cJO0cUO0cdu1KUO1Kdu1Km+1ym+1yvfEcJPFKJPFKUPFKdvFym/FyvfGY3vMcJPNKJPNKUPNyUPNydvOYvfOY3vO73vO7//dKJPdyUPeYvfe7vfe73vfd3vfd//lyJPlyUPmYUPmYdvm7m/m7vfm73vnd3vnd//n///yYUPy7dvy7m/zd3vzd//z/vfz/3vz///+7dv/dm//dvf/d3v//vf//3v///08E53YAAALpSURBVHja7dhtd5owFMDxuNJBu05t3Uq3dbU6N4t7wnXV7//NFvJALg/2nL5AODv/vPBIALm/3IQkqv1/UhQQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBEiPkN3yTCl1/u6nqLpRKnqoHKq31bsWuuo0L8/qMnpzm9tzTxN3StzuyquHziCbxD8kLev+JJVDHVjl2F9ho7JnreWuDSIu8Fd0ANnqX48+rpZTpcZlZabK9g6RyNj2czU6C5Do02r15UPi42xCigtM+dpV1yrSbgGPl2NRGU1F4xWRTCuNqWte3wRI6GPmWxNSaYROILqLNB+iszTORIaKSDYyYzplo88NSPHNaAcD0f3mTp4oIvk1EQNVt/3p7yZE32i0PUEaLxL94LiItexLJpJMDHedsnTXAsn6gxTjOM4bPSs1n7GMRKTIGHbDyoh5QUW3tZ5VRPgU+pKJRKRIm8b7Fkgx2tO+IPt7VaPoMGPXvKmMJKSoGENtEN9PD79+113O7HZGHF2LHKWuh8USUqbIHjYhjxN3x+EJ8YWZeeFaa7dMxENkgK5vucB8iqxUXmcmxKvyN/qC6PJ9Wj7F96xy6JaBueHuBBLiy0V+YIlyjDHisrJQob2vf5iyqbWwG+5b62tATi7W7ZEfFWLaP66t8Oprp8xcMre1ba/fQUC2tv23qlLGMhIzanzXGzpkLiZwPweWkcztIiwdNMQO7afakqo6wWnZSRLWukOCzKNv5ewhRnKYUuL6Qt1fMCyIiex8NrtyAcqlYpiqQyRZ2K0+DxnNXFlXN1arvKOMLMIL6n1zVe/6VmXH4WeZ5yFK7J+Ps9X9u7xMzH8Pud9S1ZaUsV3X535l5kMp9iQHIPLfhrR62B2E/7WAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECA9Fb+ARIlecDZKMlmAAAAAElFTkSuQmCC";

function base64Parser(dataURL) {
	const stringBase64 = dataURL.replace(
		/^data:image\/(png|jpg|svg|svg\+xml);base64,/,
		""
	);
	const validBase64 =
		/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;

	if (!validBase64.test(stringBase64)) {
		throw new Error(
			"Error parsing base64 data, your data contains invalid characters"
		);
	}
	let binaryString;
	if (typeof window !== "undefined") {
		binaryString = window.atob(stringBase64);
	} else {
		binaryString = Buffer.from(stringBase64, "base64").toString("binary");
	}
	const len = binaryString.length;
	const bytes = new Uint8Array(len);
	for (let i = 0; i < len; i++) {
		const ascii = binaryString.charCodeAt(i);
		bytes[i] = ascii;
	}
	return bytes.buffer;
}
let sizeParsing = true;

expressionParser.filters.size = function (input, width, height) {
	return {
		data: input,
		size: [width, height],
	};
};

let docxOptions,
	modules,
	withSlideModule = false;

function getImage(tagValue) {
	if (async) {
		return resolveSoon(imageData[tagValue]);
	}
	return imageData[tagValue];
}

function getSize() {
	if (async) {
		return resolveSoon([150, 150]);
	}
	return [150, 150];
}

beforeEach(function () {
	v4 = true;
	async = false;
	sizeParsing = false;
	withSlideModule = false;
	options = {
		getImage,
		getSize,
		centered: false,
	};
	docxOptions = { nullGetter: defaultNullGetter };
	modules = [];

	this.loadAndCompile = function () {
		const imageModule = new ImageModule(options);
		if (sizeParsing) {
			docxOptions.parser = expressionParser;
		}

		modules.push(imageModule);
		if (withSlideModule) {
			modules.push(new SlidesModule());
		}

		if (v4) {
			this.doc = createDocV4(name, { modules, ...docxOptions });
		} else {
			this.doc = createDoc(name);
			this.doc.setOptions(docxOptions);
			modules.forEach((module) => {
				this.doc.attachModule(module);
			});
			this.doc.compile();
		}
	};

	this.loadAndRender = function () {
		this.myContext = new Error();
		this.loadAndCompile();
		if (async) {
			return this.doc.renderAsync(data).then(() => {
				shouldBeSame({ doc: this.doc, expectedName });
			});
		}
		this.renderedDoc = this.doc.render(data);
		const doc = this.renderedDoc;
		shouldBeSame({ doc, expectedName });
	};
});

function testStart() {
	describe("{%image}", function () {
		it("should work with one image", function () {
			v4 = false;
			name = "image-example.docx";
			expectedName = "expected-one-image.docx";
			data = { image: "image.png" };
			this.loadAndRender();
		});
		it("should work with one image v4 constructor", function () {
			name = "image-example.docx";
			expectedName = "expected-one-image.docx";
			data = { image: "image.png" };
			this.loadAndRender();
		});

		it("should work with image from buffer", function () {
			name = "image-example.docx";
			expectedName = "expected-buffer.docx";
			imageData["17.png"] = Buffer.from(imageData["2.png"], "binary");
			data = { image: "17.png" };
			this.loadAndRender();
		});
		it("should work with jpeg without tif data (255,216,255,225)", function () {
			name = "image-example.docx";
			expectedName = "expected-cpf.docx";
			data = { image: "cpf.jpg" };
			this.loadAndRender();
		});
		it("should work with huge image", function () {
			name = "image-example.docx";
			expectedName = "expectedBig.docx";
			imageData["5.png"] = base64Parser("a".repeat(1000000));
			data = { image: "5.png" };
			this.loadAndCompile();
			this.doc.render();
		});
		it("should work without initial rels", function () {
			name = "without-rels.docx";
			expectedName = "expected-without-rels.docx";
			data = { image: "image.png" };
			this.loadAndRender();
		});

		it("should work with image tag == null", function () {
			name = "image-example.docx";
			expectedName = "expected-no-image.docx";
			data = {};
			this.loadAndRender();
		});

		it("should work with inline", function () {
			name = "image-inline-example.docx";
			expectedName = "expected-inline.docx";
			data = { firefox: "image.png" };
			this.loadAndRender();
		});

		it("should work with centering", function () {
			name = "image-example.docx";
			expectedName = "expected-centered.docx";
			options = {
				getImage,
				getSize,
				centered: true,
			};
			data = { image: "image.png" };
			this.loadAndRender();
		});

		it("should work with async and reject", function () {
			async = true;
			name = "image-example.docx";
			expectedName = "expected-image-example.docx";
			options = {
				getImage(image, tagValue) {
					return rejectSoon(new Error(`Error for tag '${tagValue}'`));
				},
				getSize,
				centered: true,
			};
			data = { image: "image.png" };
			const expectedError = {
				message: "Error for tag 'image'",
				name: "RenderingError",
				properties: {
					file: "word/document.xml",
					id: "img_getting_failed",
				},
			};
			return expectToThrowAsync(
				this.loadAndRender.bind(this),
				Errors.XTTemplateError,
				wrapMultiError(expectedError)
			);
		});

		it("should throw error when using array as value", function () {
			name = "image-example.docx";
			expectedName = "expected-centered.docx";
			options = {
				getImage(tagValue) {
					return tagValue;
				},
				getSize,
				centered: true,
			};
			data = { image: { x: "john" } };

			const expectedError = {
				message: "Could not parse the image as a Buffer, string or ArrayBuffer",
				name: "RenderingError",
				properties: {
					file: "word/document.xml",
					id: "image_not_parseable",
				},
			};

			expectToThrow(
				this.loadAndRender.bind(this),
				Errors.XTTemplateError,
				wrapMultiError(expectedError)
			);
		});

		it("should show error if using Promise in sync mode", function () {
			name = "image-example.docx";
			expectedName = "expected-image-example.docx";
			options = {
				getImage() {
					return resolveSoon(base64Parser(base64Image));
				},
				getSize,
			};
			data = { image: "image.png" };

			const expectedError = {
				message:
					"imageBuffer is a promise, you probably should use doc.renderAsync() instead of doc.render()",
				name: "RenderingError",
				properties: {
					file: "word/document.xml",
					part: {
						containerWidth: 576,
						lIndex: 16,
						offset: 0,
						endLindex: 16,
						module: "open-xml-templating/docxtemplater-image-module",
						raw: "%image",
						type: "placeholder",
						value: "image",
					},
				},
			};

			expectToThrow(
				this.loadAndRender.bind(this),
				Errors.XTTemplateError,
				wrapMultiError(expectedError)
			);
		});

		it("should work with centering in docx", function () {
			name = "double.docx";
			expectedName = "expected-centered-from-doc.docx";
			data = { double: "image.png" };
			this.loadAndRender();
		});

		it("should be possible to negate centering in docx, by using {%%image} and centered: true", function () {
			options = {
				getImage,
				getSize,
				centered: true,
			};
			name = "double-inside-text.docx";
			expectedName = "expected-uncentered-from-negation.docx";
			data = { double: "image.png" };
			this.loadAndRender();
		});

		it("should work with loops", function () {
			name = "image-loop-example.docx";
			expectedName = "expected-loop-centered.docx";
			options = {
				getImage,
				getSize,
				centered: true,
			};
			data = { images: ["image.png", "image2.png"] };
			this.loadAndRender();
		});

		it("should store the image file only once if it is repeated", function () {
			name = "image-loop-example.docx";
			expectedName = "expected-loop-repeated-images.docx";
			options = {
				getImage,
				getSize,
				centered: true,
			};
			data = {
				images: [
					"image.png",
					"image2.png",
					"image.png",
					"image2.png",
					"image.png",
					"image2.png",
					"image.png",
					"image2.png",
				],
			};
			this.loadAndRender();
		});

		it("should not corrupt image in table", function () {
			name = "image-in-table.docx";
			expectedName = "expected-table.docx";
			options = {
				getImage,
				getSize,
				centered: true,
			};
			data = {};
			this.loadAndRender();
		});

		it("should work with loops async", function () {
			async = true;
			name = "image-loop-example.docx";
			expectedName = "expected-loop-centered.docx";
			options = {
				getImage,
				getSize,
				centered: true,
			};
			data = { images: ["image.png", "image2.png"] };
			return this.loadAndRender();
		});

		it("should work with loops async and reject", function () {
			async = true;
			name = "image-loop-example.docx";
			expectedName = "expected-loop-centered.docx";
			options = {
				getImage(image, tagValue) {
					return rejectSoon(new Error(`Error for tag '${tagValue}'`));
				},
				getSize,
				centered: true,
			};
			data = { images: ["image.png", "image2.png"] };

			const expectedError = {
				name: "TemplateError",
				message: "Multi error",
				properties: {
					errors: [
						{
							message: "Error for tag '.'",
							name: "RenderingError",
							properties: {
								file: "word/document.xml",
								id: "img_getting_failed",
							},
						},
						{
							message: "Error for tag '.'",
							name: "RenderingError",
							properties: {
								file: "word/document.xml",
								id: "img_getting_failed",
							},
						},
					],
					id: "multi_error",
				},
			};
			return expectToThrowAsync(
				this.loadAndRender.bind(this),
				Errors.XTTemplateError,
				expectedError
			);
		});

		it("should work with image in header/footer", function () {
			name = "image-header-footer-example.docx";
			expectedName = "expected-header-footer.docx";
			data = { image: "image.png" };
			this.loadAndRender();
		});

		it("should work with image in header/footer async", function () {
			async = true;
			name = "image-header-footer-example.docx";
			expectedName = "expected-header-footer.docx";
			data = { image: "image.png" };
			return this.loadAndRender();
		});

		it("should work with PPTX documents", function () {
			name = "tag-image.pptx";
			expectedName = "expected-tag-image.pptx";
			data = { image: "image.png" };
			this.loadAndRender();
		});

		it("should work with PPTX documents async", function () {
			async = true;
			name = "tag-image.pptx";
			expectedName = "expected-tag-image.pptx";
			data = { image: "image.png" };
			return this.loadAndRender();
		});

		it("should work with PPTX documents centered", function () {
			name = "tag-image-centered.pptx";
			expectedName = "expected-tag-image-centered.pptx";
			data = { image: "image.png" };
			this.loadAndRender();
		});

		it("should work with PPTX slideLayouts", function () {
			name = "image-with-slidelayout.pptx";
			expectedName = "expected-tag-image-slide-layout.pptx";
			data = { image: "image.png" };
			this.loadAndRender();
		});

		it("should work even when extList tag present", function () {
			name = "tag-with-extlist.pptx";
			expectedName = "expected-rendered-extlist.pptx";
			data = { image: "image.png" };
			this.loadAndRender();
		});

		it("should work with auto resize", function () {
			name = "image-inline-example.docx";
			expectedName = "expected-inline-resize.docx";
			options = {
				getImage,
				getSize() {
					return [500, 555];
				},
			};
			data = { firefox: "image.png" };
			this.loadAndRender();
		});

		it("should work with size in cm or inches", function () {
			name = "image-inline-example.docx";
			expectedName = "expected-cm-size.docx";
			options = {
				getImage,
				getSize() {
					return ["2.54cm", "1in"];
				},
			};
			data = { firefox: "image.png" };
			this.loadAndRender();
		});

		it("should work with size in emus", function () {
			name = "image-inline-example.docx";
			expectedName = "expected-emu-size.docx";
			options = {
				getImage,
				getSize() {
					return ["457200emu", "914400emu"];
				},
			};
			data = { firefox: "image.png" };
			this.loadAndRender();
		});

		it("should work with base64 data", function () {
			name = "image-example.docx";
			options = {
				getImage(image) {
					return image;
				},
				getSize,
			};
			expectedName = "expected-base64.docx";
			data = { image: base64Parser(base64Image) };
			this.loadAndRender();
		});

		it("should work with base64 data async", function () {
			async = true;
			name = "image-example.docx";
			expectedName = "image-example-async.docx";
			options = {
				getSize() {
					return resolveSoon([300, 300]);
				},
				getImage() {
					return resolveSoon(base64Parser(base64Image));
				},
			};
			data = { image: "foobar.png" };
			return this.loadAndRender();
		});

		it("should work with svg sync and base64", function () {
			name = "image-example.docx";
			expectedName = "expected-svg-sync.docx";
			let svgSize = null;
			options = {
				getSize(a, b, c, d) {
					if (d.svgSize) {
						svgSize = d.svgSize;
					}
					return [300, 300];
				},
				getImage() {
					return base64Parser(base64svgimage);
				},
			};
			data = { image: "foobar.png" };
			this.loadAndRender();
			expect(svgSize).to.deep.equal([100, 100]);
		});

		it("should work with svg async and base64", function () {
			async = true;
			name = "image-example.docx";
			expectedName = "expected-svg-async.docx";
			let svgSize = null;
			options = {
				getSize(a, b, c, d) {
					if (d.svgSize) {
						svgSize = d.svgSize;
					}
					return resolveSoon([300, 300]);
				},
				getImage() {
					return resolveSoon(base64Parser(base64svgimage));
				},
			};
			data = { image: "foobar.png" };
			return this.loadAndRender().then(function () {
				expect(svgSize).to.deep.equal([100, 100]);
			});
		});

		it("should work with svg sync inline", function () {
			name = "image-inline-example.docx";
			expectedName = "expected-svg-inline-sync.docx";
			let svgSize = null;
			options = {
				getSize(a, b, c, d) {
					if (d.svgSize) {
						svgSize = d.svgSize;
					}
					expect(typeof a).to.equal("object");
					expect(b).to.equal("foobar");
					expect(c).to.equal("firefox");
					expect(d.svgSize).to.be.an("array");
					expect(d.part).to.be.an("object");
					return [300, 300];
				},
				getImage() {
					return base64Parser(base64svgimage);
				},
			};
			data = { firefox: "foobar" };
			this.loadAndRender();
			expect(svgSize).to.deep.equal([100, 100]);
		});

		it("should work async with two images", function () {
			async = true;
			name = "multi-image.docx";
			expectedName = "expected-multi-image-async.docx";
			let myTagName;
			options = {
				getSize() {
					return resolveSoon([300, 300]);
				},
				getImage(tagValue, tagName) {
					myTagName = tagName;
					return resolveSoon(imageData[tagValue]);
				},
			};
			data = { image1: "image.png", image2: "image2.png" };
			return this.loadAndRender().then(function () {
				expect(myTagName).to.be.deep.equal("image2");
			});
		});

		it("should work with docprid of 8 and 10", function () {
			name = "loop-with-already-existing-images.docx";
			expectedName = "expected-many-images.docx";
			docxOptions = { nullGetter };
			options = {
				getImage() {
					return base64Parser(base64Image);
				},
				getSize,
			};
			data = {
				images: times(19, () => 0),
			};
			this.loadAndRender();
		});

		it("should work when using svg", function () {
			name = "image-example.docx";
			expectedName = "expected-svg.docx";
			data = { image: "logo.svg" };
			this.loadAndRender();
		});

		it("should not suppress images", function () {
			name = "doc-with-vfill.docx";
			expectedName = "expected-doc-with-vfill.docx";
			data = {};
			this.loadAndRender();
		});

		it("should work to remove unused images", function () {
			name = "image-in-condition-to-remove.docx";
			expectedName = "expected-one-media.docx";
			this.loadAndRender();
			const files = this.doc
				.getZip()
				.file(/media/)
				.map((file) => file.name);
			expect(files).to.be.deep.equal(["word/media/image2.png"]);
		});

		it("should work to remove unused images in header/footer", function () {
			name = "image-in-header-footer-condition-to-remove.docx";
			expectedName = "expected-removed-header-footer.docx";
			this.loadAndRender();
			const files = this.doc
				.getZip()
				.file(/media/)
				.map((file) => file.name);
			expect(files.length).to.be.equal(3);
		});

		it("should work with angular expressions to set size", function () {
			sizeParsing = true;
			options = {
				getImage(tagValue) {
					if (tagValue.size && tagValue.data) {
						return imageData[tagValue.data];
					}
					return imageData[tagValue];
				},
				getSize(_, tagValue) {
					if (tagValue.size && tagValue.data) {
						return tagValue.size;
					}
					return [150, 150];
				},
			};
			data = { image: "logo.svg" };
			name = "image-example-sized.docx";
			expectedName = "expected-sized-image.docx";
			this.loadAndRender();
		});

		it("should work with inline image without dropping text", function () {
			name = "inline-image-with-close-text.docx";

			expectedName = "expected-inline-image-with-close-text.docx";
			options = {
				getSize() {
					return [200, 200];
				},
				getImage,
			};
			data = { image: "image.png" };
			this.loadAndRender();
		});

		it("should work with inline image inside inline loop", function () {
			name = "inline-image-inside-inline-loop.docx";

			expectedName = "expected-inline-images.docx";
			options = {
				getSize() {
					return [200, 200];
				},
				getImage,
			};
			data = { images: ["image.png", "image2.png", "2.png"] };
			this.loadAndRender();
		});
	});

	describe("Retrieve container width", function () {
		it("should be possible to set width to 100% in table", function () {
			name = "image-in-table.docx";
			expectedName = "expected-100pct-table.docx";
			data = { image: "image.png" };
			options = {
				getSize(a, b, c, d) {
					const width = d.part.containerWidth;
					expect(width).to.equal(288);
					if (width) {
						return [width, width];
					}
					return [100, 100];
				},
				getImage,
			};
			this.loadAndRender();
		});

		it("should work with centering", function () {
			name = "image-example.docx";
			expectedName = "expected-centered-100pct.docx";
			options = {
				centered: true,
				getImage,
				getSize(a, b, c, d) {
					const width = d.part.containerWidth;
					expect(width).to.equal(576);
					if (width) {
						return [width, width];
					}
					return [100, 100];
				},
			};
			data = { image: "image.png" };
			this.loadAndRender();
		});

		it("should be possible to set width to 100% in footer", function () {
			name = "image-header-footer-example.docx";
			expectedName = "expected-header-footer-100pct.docx";
			data = { image: "image.png" };
			const filePaths = [];
			options = {
				getImage,
				getSize(a, b, c, d) {
					const filePath = d.options.filePath;
					filePaths.push(filePath);
					const width = d.part.containerWidth;
					expect(width).to.equal(576);
					if (width) {
						return [width, 100];
					}
					return [100, 100];
				},
			};
			this.loadAndRender();
			expect(filePaths).to.deep.equal(["word/header1.xml", "word/footer1.xml"]);
		});

		it("should be possible to set width to 100% in document", function () {
			name = "image-example.docx";
			expectedName = "expected-image-100pct.docx";
			data = { image: "image.png" };
			options = {
				getImage,
				getSize(a, b, c, d) {
					const width = d.part.containerWidth;
					expect(width).to.equal(576);
					if (width) {
						return [width, width];
					}
					return [100, 100];
				},
			};
			this.loadAndRender();
		});

		it("should not regress without section", function () {
			name = "multi-footer-section.docx";
			expectedName = "expected-multi-footer-section.docx";
			data = { image: "image.png" };
			options = {
				getImage,
				getSize(a, b, c, d) {
					const width = d.part.containerWidth;
					expect(width).to.equal(576);
					const pct = 10 / 100;
					if (width) {
						return [Math.floor(width * pct), Math.floor(width * pct)];
					}
					return [100, 100];
				},
			};
			this.loadAndRender();
		});

		it("should not regress with office 365", function () {
			name = "office365.docx";
			expectedName = "expected-office365.docx";
			data = { image: "image.png" };
			this.loadAndRender();
		});

		it("should not regress when using {%image} inside table", function () {
			name = "table-with-placeholder.pptx";
			expectedName = "expected-image-from-table.pptx";
			data = { image: "image.png" };
			options = {
				getImage,
				getSize(a, tag) {
					return imageSizes[tag];
				},
			};
			return this.loadAndRender();
		});

		it("should not regress with tag inside document properties", function () {
			docxOptions = { nullGetter };
			name = "properties.docx";
			expectedName = "expected-properties.docx";
			data = { tag1: "John", tag2: "Doe" };
			this.loadAndRender();
		});

		it("should work inside textbox for docx", function () {
			name = "inside-textbox.docx";
			expectedName = "expected-inside-textbox.docx";
			data = { image: "image.png" };
			let calls = 0;
			options = {
				getImage,
				getSize(a, b, c, d) {
					calls++;
					const width = d.part.containerWidth;
					const height = d.part.containerHeight;
					expect(width).to.equal(188);
					expect(height).to.equal(113);
					if (width && height) {
						return [width, height];
					}
					return [100, 100];
				},
			};
			this.loadAndRender();
			expect(calls).to.equal(1);
		});

		if (typeof window === "undefined") {
			it("should work with tag in textbox with v:rect tag", function () {
				name = "tag-in-textbox.docx";
				expectedName = "expected-tag-in-textbox.docx";

				options = {
					getImage,
					getSize(img, value, tagName, context) {
						const sizeOf = require("image-size");
						let b;
						if (typeof img === "string") {
							b = Buffer.from(img, "binary");
						}
						const sizeObj = sizeOf(b);
						const maxWidth = context.part.containerWidth;
						const maxHeight =
							context.part.containerHeight || context.part.containerWidth;

						const widthRatio = sizeObj.width / maxWidth;
						const heightRatio = sizeObj.height / maxHeight;
						if (widthRatio < 1 && heightRatio < 1) {
							/*
							 * Do not scale up images that are
							 * smaller than maxWidth,maxHeight
							 */
							return [sizeObj.width, sizeObj.height];
						}
						let finalWidth, finalHeight;
						if (widthRatio > heightRatio) {
							/*
							 * Width will be equal to maxWidth
							 * because width is the most "limiting"
							 */
							finalWidth = maxWidth;
							finalHeight = sizeObj.height / widthRatio;
						} else {
							/*
							 * Height will be equal to maxHeight
							 * because height is the most "limiting"
							 */
							finalHeight = maxHeight;
							finalWidth = sizeObj.width / heightRatio;
						}

						return [Math.round(finalWidth), Math.round(finalHeight)];
					},
				};
				data = { image: "2.png" };
				return this.loadAndRender();
			});
		}

		it("should retrieve size from v:shape", function () {
			name = "vshape-textbox.docx";
			expectedName = "expected-vshape-textbox.docx";
			data = { logo: "image.png" };
			let calls = 0;
			options = {
				getImage,
				getSize(a, b, c, d) {
					calls++;
					const width = d.part.containerWidth;
					const height = d.part.containerHeight;
					expect(width).to.equal(119);
					expect(height).to.equal(73);
					if (width && height) {
						return [width, height];
					}
					return [100, 100];
				},
			};
			this.loadAndRender();
			expect(calls).to.equal(1);
		});

		it("should work inside textbox for pptx", function () {
			name = "inside-textbox.pptx";
			expectedName = "expected-inside-textbox.pptx";
			let calls = 0;
			options = {
				getImage,
				getSize(a, b, c, d) {
					calls++;
					const width = d.part.containerWidth;
					const height = d.part.containerHeight;
					if (d.part.value === "im_table") {
						return imageSizes[b];
					}
					const expectedWidth = 201,
						expectedHeight = 303;
					expect(width).to.equal(expectedWidth);
					expect(height).to.equal(expectedHeight);
					if (width && height) {
						return [width, height];
					}
					return [100, 100];
				},
			};
			data = { im_textbox: "image.png", im_table: "image2.png" };
			this.loadAndRender();
			expect(calls).to.equal(2);
		});

		it("should work inside multi column document", function () {
			name = "columns-of-different-sizes.docx";
			expectedName = "expected-columns-of-different-sizes.docx";
			let calls = 0;
			options = {
				getImage,
				getSize(a, b, c, d) {
					calls++;
					const width = d.part.containerWidth;
					let expectedWidth = 192;
					if (d.part.value === "image2") {
						expectedWidth = 384;
					}
					expect(width).to.equal(expectedWidth);
					if (width) {
						return [width, width];
					}
					return [100, 100];
				},
			};
			data = { image1: "image.png", image2: "image2.png" };
			this.loadAndRender();
			expect(calls).to.equal(2);
		});

		it("should work calculate containerWidth/containerHeight even if section is defined on top of paragraph", function () {
			name = "image-in-sectpr-full-width.docx";
			expectedName = "expected-image-in-sectpr-full-width.docx";
			data = {
				image01: base64sample,
			};
			options = {
				getImage(data) {
					return base64Parser(data);
				},
				getSize(a, b, c, d) {
					return [d.part.containerWidth, 500];
				},
			};
			return this.loadAndRender();
		});
	});

	describe("Captions", function () {
		it("should be possible to add some caption block", function () {
			name = "double.docx";
			data = { double: "image.png" };

			expectedName = "expected-named-image.docx";
			options = {
				getImage,
				getSize() {
					return [200, 200];
				},
				getProps() {
					return { caption: { text: "My custom <apple>" } };
				},
			};
			this.loadAndRender();
		});

		it("should be possible to add some caption inline", function () {
			name = "image-example.docx";
			data = { image: "image.png" };

			expectedName = "expected-inline-caption.docx";
			options = {
				getImage,
				getSize() {
					return [200, 200];
				},
				getProps() {
					return { caption: { text: "My custom <apple>" } };
				},
			};
			this.loadAndRender();
		});

		it("should work with inline", function () {
			name = "image-inline-example.docx";
			expectedName = "expected-inline-caption-surrounded.docx";
			options = {
				getImage,
				getProps() {
					return { caption: { text: "My custom <apple>" } };
				},
				getSize() {
					return [200, 200];
				},
			};
			data = { firefox: "image.png" };
			this.loadAndRender();
		});

		it("should work with two images", function () {
			name = "multi-image.docx";
			expectedName = "expected-multi-image-caption.docx";
			options = {
				getImage,
				getSize() {
					return [300, 300];
				},
				getProps() {
					return { caption: { text: "My custom <apple>" } };
				},
			};
			data = { image1: "image.png", image2: "image2.png" };
			this.loadAndRender();
		});

		it("should work without caption", function () {
			name = "image-inline-example.docx";
			expectedName = "expected-inline-no-caption.docx";
			options = {
				getImage,
				getProps() {
					return null;
				},
				getSize() {
					return [200, 200];
				},
			};
			data = { firefox: "image.png" };
			this.loadAndRender();
		});

		it("should work and remove the prefix", function () {
			name = "image-inline-example.docx";
			expectedName = "expected-inline-caption-noprefix.docx";
			options = {
				getImage,
				getProps() {
					return {
						caption: {
							prefix: "",
							text: "My custom <apple>",
							pStyle: "Caption",
							align: "right",
						},
						pStyle: "Heading1",
					};
				},
				getSize() {
					return [200, 200];
				},
			};
			data = { firefox: "image.png" };
			this.loadAndRender();
		});

		it("should be possible to change height for inline", function () {
			name = "image-inline-example.docx";
			expectedName = "expected-inline-caption-height.docx";
			options = {
				getImage,
				getProps() {
					return {
						caption: {
							prefix: "",
							text: "Foobar",
							height: 100,
						},
						pStyle: "Heading1",
					};
				},
				getSize() {
					return [200, 200];
				},
			};
			data = { firefox: "image.png" };
			this.loadAndRender();
		});
	});

	describe("Replace images", function () {
		it("should work with docx using name property", function () {
			name = "named-image.docx";
			expectedName = "expected-image-from-named-image.docx";
			data = { image: "image2.png" };
			return this.loadAndRender();
		});

		it("should be possible to keep an existing image when using true as the value", function () {
			name = "named-image.docx";
			expectedName = "expected-kept-original-image.docx";
			data = { image: true };
			return this.loadAndRender();
		});

		it("should be possible to keep an existing image when using true as the value", function () {
			async = true;
			name = "named-image.docx";
			expectedName = "expected-kept-original-image.docx";
			data = { image: true };
			return this.loadAndRender();
		});

		it("should work with docx and update description", function () {
			name = "named-image.docx";
			expectedName = "expected-image-from-named-image-descr.docx";
			data = { image: "image2.png" };
			options = {
				getProps(a, b, tagName) {
					return {
						name: `mypicture {%${tagName}}`,
						alt: 'some ";^>description',
					};
				},
				getImage,
				getSize,
			};
			return this.loadAndRender();
		});

		it("should work in header of docx and keep current size using title property", function () {
			name = "image-header-with-title.docx";
			expectedName = "expected-image-header-with-title.docx";
			data = { image: "image2.png", image2: "image.png" };
			const parts = [];
			options = {
				getImage,
				getSize(a, b, c, d) {
					const copy = { ...d.part };
					delete copy.expanded;
					parts.push(copy);
					if (d.part.width && d.part.height) {
						return [d.part.width, d.part.height];
					}
					return [100, 100];
				},
			};
			this.loadAndRender();
			const firstPart = parts[0];
			expect(firstPart).to.deep.equal({
				containerHeight: undefined,
				containerWidth: 601.7333333333333,
				cx: "1581150",
				cy: "1581150",
				height: 166,
				lIndex: 10,
				module: "open-xml-templating/docxtemplater-replace-image-module",
				path: "media/image3.jpg",
				rId: "R8f2c0f336bf24f3b",
				type: "placeholder",
				value: "image",
				width: 166,
			});
		});

		it("should work with pptx using name property", function () {
			name = "named-image.pptx";
			expectedName = "expected-image-from-named-image.pptx";
			data = { image: "image2.png" };
			return this.loadAndRender();
		});

		it("should work with pptx using name property with multiple w:ext", function () {
			name = "named-image-multi-ext.pptx";
			expectedName = "expected-image-from-named-image-multi-ext.pptx";
			data = { image: "image2.png" };
			options = {
				getImage,
				getSize(a, b, c, d) {
					if (d.part.width && d.part.height) {
						return [d.part.width, d.part.height];
					}
					return [100, 100];
				},
			};
			return this.loadAndRender();
		});

		it("should work with docx and keep current size using name property", function () {
			name = "named-image.pptx";
			expectedName = "expected-image-from-named-image-without-size-change.pptx";
			data = { image: "image2.png" };
			options = {
				getImage,
				getSize(a, b, c, d) {
					if (d.part.width && d.part.height) {
						return [d.part.width, d.part.height];
					}
					return [100, 100];
				},
			};
			return this.loadAndRender();
		});

		it("should work asynchronously using name property", function () {
			async = true;
			name = "named-image.docx";
			expectedName = "expected-image-from-named-image.docx";
			data = { image: resolveSoon("image2.png") };
			return this.loadAndRender();
		});

		it("should work with loop async using name property", function () {
			async = true;
			docxOptions.paragraphLoop = false;
			name = "loop-image-caption.docx";
			modules.push(fixDocPrCorruption);
			expectedName = "expected-loop-image-caption.docx";
			data = {
				loop: resolveSoon([
					{ image: "image.png" },
					{ image: resolveSoon("image2.png") },
				]),
			};
			return this.loadAndRender();
		});

		it("should work with image-with-alt-text.docx", function () {
			name = "image-with-alt-text.docx";
			expectedName = "expected-image-with-alt-text.docx";
			data = {
				image: "image.png",
			};
			return this.loadAndRender();
		});

		it("should be possible to resize existing image and center it", function () {
			name = "resize-center.pptx";
			expectedName = "expected-resize-center.pptx";
			data = { image: "image.png" };

			options = {
				getProps(a, b, c, d) {
					const { part, sizePixel } = d;
					if (
						part.module ===
							"open-xml-templating/docxtemplater-replace-image-module" &&
						part.width &&
						part.height &&
						sizePixel
					) {
						return {
							offset: [
								part.width / 2 - sizePixel[0] / 2,
								part.height / 2 - sizePixel[1] / 2,
							],
						};
					}
				},
				getImage,
				getSize,
			};
			return this.loadAndRender();
		});

		it("should be possible to move image", function () {
			name = "resize-center.pptx";
			expectedName = "expected-resize-moved.pptx";
			data = { image: "image.png" };
			options = {
				getImage,
				getSize,
				getProps(a, b, c, d) {
					const { part, sizePixel } = d;
					if (
						part.module ===
							"open-xml-templating/docxtemplater-replace-image-module" &&
						part.width &&
						part.height &&
						sizePixel
					) {
						return {
							offset: [part.width / 2 - sizePixel[0] / 2, 0],
						};
					}
				},
			};
			return this.loadAndRender();
		});

		it("should be possible to rotate image", function () {
			name = "resize-center.pptx";
			expectedName = "expected-resize-rotated.pptx";
			data = { image: "image.png" };
			options = {
				getImage,
				getSize,
				getProps(a, b, c, d) {
					const { part, sizePixel } = d;
					if (
						part.module ===
							"open-xml-templating/docxtemplater-replace-image-module" &&
						part.width &&
						part.height &&
						sizePixel
					) {
						return {
							rotation: 180,
						};
					}
				},
			};
			return this.loadAndRender();
		});

		it("should be possible to flip image", function () {
			name = "resize-center.pptx";
			expectedName = "expected-resize-flipped.pptx";
			data = { image: "image.png" };
			options = {
				getImage,
				getSize,
				getProps(a, b, c, d) {
					const { part, sizePixel } = d;
					if (
						part.module ===
							"open-xml-templating/docxtemplater-replace-image-module" &&
						part.width &&
						part.height &&
						sizePixel
					) {
						return {
							flipVertical: true,
							flipHorizontal: true,
						};
					}
				},
			};
			return this.loadAndRender();
		});

		it("should be possible to add link to existing image for pptx", function () {
			name = "resize-center.pptx";
			expectedName = "expected-resize-with-link.pptx";
			data = { image: "image.png" };
			options = {
				getImage,
				getSize,
				getProps() {
					return {
						link: ddgLink,
					};
				},
			};
			return this.loadAndRender();
		});

		it("should be possible to add link to existing image for docx", function () {
			name = "named-image.docx";
			expectedName = "expected-replaced-image-link.docx";
			data = { image: "image2.png" };
			options = {
				getProps() {
					return {
						link: ddgLink,
					};
				},
				getImage,
				getSize,
			};
			return this.loadAndRender();
		});

		it("should work with PNG + SVG file", function () {
			name = "png-with-svg-replacement.docx";
			expectedName = "expected-png-with-svg-replacement.docx";
			data = {
				image: "image.png",
			};
			return this.loadAndRender();
		});
	});

	describe("Alignments", function () {
		it("should be possible to left align image", function () {
			name = "double.docx";
			data = { double: "image.png" };

			expectedName = "expected-left-aligned.docx";

			options = {
				getImage,
				getProps() {
					return { align: "left" };
				},
				getSize() {
					return [200, 200];
				},
			};
			this.loadAndRender();
		});

		it("should be possible to right align image", function () {
			name = "double.docx";
			data = { double: "image.png" };
			async = true;

			expectedName = "expected-right-aligned.docx";
			options = {
				getImage,
				getProps() {
					return { align: "right" };
				},
				getSize() {
					return [200, 200];
				},
			};
			return this.loadAndRender();
		});
	});

	describe("Errors", function () {
		it("should fail if the shape has other text inside it", function () {
			name = "shape-with-other-text.pptx";
			options = {
				getSize,
				getImage() {
					return base64Parser(base64Image);
				},
			};
			data = {};
			const expectedError = {
				name: "TemplateError",
				message:
					"Centered Images should be placed in empty paragraphs, but there is text surrounding this tag",
				properties: {
					file: "ppt/slides/slide1.xml",
					id: "centered_image_should_be_in_paragraph",
					part: {
						containerHeight: 456,
						containerWidth: 1104,
						ext: {
							cx: 10515600,
							cy: 4351338,
						},
						extPx: {
							cx: 1104,
							cy: 456,
						},
						lIndex: 67,
						offset: {
							x: 838200,
							y: 1825625,
						},
						offsetPx: {
							x: 88,
							y: 191,
						},
						endLindex: 67,
						module: "open-xml-templating/docxtemplater-image-module",
						raw: "%image",
						type: "placeholder",
						value: "image",
					},
				},
			};
			expectToThrow(
				this.loadAndRender.bind(this),
				Errors.XTTemplateError,
				wrapMultiError(expectedError)
			);
		});

		it("should fail with centered if text inside paragraph", function () {
			options = {
				getSize() {
					return [300, 300];
				},
				getImage() {
					return base64Parser(base64svgimage);
				},
				centered: true,
			};
			name = "image-inline-example.docx";
			data = { firefox: "foobar" };
			const expectedError = {
				name: "TemplateError",
				message:
					"Centered Images should be placed in empty paragraphs, but there is text surrounding this tag",
				properties: {
					file: "word/document.xml",
					id: "centered_image_should_be_in_paragraph",
					part: {
						containerWidth: 576,
						endLindex: 32,
						lIndex: 32,
						module: "open-xml-templating/docxtemplater-image-module-centered",
						offset: 24,
						raw: "%firefox",
						type: "placeholder",
						value: "firefox",
					},
				},
			};
			expectToThrow(
				this.loadAndRender.bind(this),
				Errors.XTTemplateError,
				wrapMultiError(expectedError)
			);
		});

		it("should fail if in pptx, the image is inside a loop", function () {
			name = "within-loop.pptx";
			options = {
				getSize,
				getImage() {
					return base64Parser(base64Image);
				},
			};
			data = {
				image: true,
			};
			const expectedError = {
				name: "TemplateError",
				message: "Image tag should not be placed inside a loop",
				properties: {
					expandTo: ["p:sp", "p:graphicFrame"],
					file: "ppt/slides/slide1.xml",
					id: "image_tag_no_access_to_p_sp",
					index: 19,
					postparsedLength: 39,
					xtag: "image",
					rootError: {
						message: 'No tag "p:sp,p:graphicFrame" was found at the left',
					},
				},
			};
			expectToThrow(
				this.loadAndRender.bind(this),
				Errors.XTTemplateError,
				wrapMultiError(expectedError)
			);
		});

		it("should fail in docx when placing block image inside inline loop", function () {
			name = "block-image-inside-inline-loop.docx";
			options = {
				getSize,
				getImage() {
					return base64Parser(base64Image);
				},
			};
			data = {
				image: true,
			};
			const expectedError = {
				name: "TemplateError",
				message: "Block Image tag should not be placed inside an inline loop",
				properties: {
					expandTo: "w:p",
					file: "word/document.xml",
					id: "image_tag_no_access_to_w_p",
					index: 0,
					postparsedLength: 1,
					xtag: ".",
					rootError: {
						message: 'No tag "w:p" was found at the left',
					},
				},
			};
			expectToThrow(
				this.loadAndRender.bind(this),
				Errors.XTTemplateError,
				wrapMultiError(expectedError)
			);
		});
	});

	describe("SVG fallback", function () {
		const childProcess = require("child_process");
		if (childProcess.spawnSync) {
			it("should be possible to declare svg fallback to transform SVG to png", function () {
				async = true;
				name = "image-example.docx";
				expectedName = "expected-svg-async-with-fallback.docx";
				options = {
					getSize() {
						return resolveSoon([50, 50]);
					},
					getSVGFallback(svgFile, sizePixel) {
						return new Promise(function (resolve, reject) {
							const result = childProcess.spawnSync(
								"gm",
								["convert", "SVG:-", "-resize", sizePixel.join("x"), "PNG:-"],
								{
									input: Buffer.from(svgFile),
								}
							);
							if (result.status !== 0) {
								/* eslint-disable-next-line no-console */
								console.error(
									JSON.stringify({
										"result.stderr": result.stderr.toString(),
									})
								);
								reject(new Error("Error while executing graphicsmagick"));
							}
							return resolve(Buffer.from(result.stdout));
						});
					},
					getImage() {
						return resolveSoon(base64Parser(base64svgimage));
					},
				};
				data = { image: "foobar.png" };
				return this.loadAndRender();
			});
		}

		if (typeof window !== "undefined") {
			it.skip("should be possible to declare svg fallback to transform SVG to png", function () {
				async = true;
				name = "image-example.docx";
				expectedName = "expected-chrome-svg-async-with-fallback.docx";
				options = {
					getSize() {
						return resolveSoon([50, 50]);
					},
					getImage() {
						return resolveSoon(base64Parser(base64svgimage));
					},
				};
				options.getSVGFallback = function (svgFile, sizePixel) {
					function arrayBufferToString(buffer) {
						let binary = "";
						const bytes = new Uint8Array(buffer);
						const len = bytes.byteLength;
						for (let i = 0; i < len; i++) {
							binary += String.fromCharCode(bytes[i]);
						}
						return binary;
					}

					return new Promise(function (resolve, reject) {
						function svgUrlToPng(svgUrl) {
							const svgImage = document.createElement("img");
							svgImage.style.position = "absolute";
							svgImage.style.top = "-9999px";
							document.body.appendChild(svgImage);
							const width = sizePixel[0];
							const height = sizePixel[1];
							svgImage.width = width;
							svgImage.height = height;
							svgImage.onload = function () {
								const canvas = document.createElement("canvas");
								canvas.width = width;
								canvas.height = height;
								const canvasCtx = canvas.getContext("2d");
								canvasCtx.drawImage(svgImage, 0, 0, width, height);
								const imgData = canvas.toDataURL("image/png");
								resolve(base64Parser(imgData));
							};
							svgImage.onerror = function () {
								reject(new Error("Could not transform svg to png"));
							};
							svgImage.src = "data:image/svg+xml;utf8," + svgUrl;
						}
						svgUrlToPng(
							arrayBufferToString(svgFile).replace(
								"<svg",
								"<svg xmlns='http://www.w3.org/2000/svg'"
							)
						);
					});
				};
				data = { image: "foobar.png" };
				return this.loadAndRender();
			});
		}
	});

	if (SlidesModule) {
		describe("Slides module and async", function () {
			it("should work with images after slide condition asynchronously", function () {
				withSlideModule = true;
				sizeParsing = true;
				name = "image-after-condition.pptx";
				expectedName = "expected-image-after-condition.pptx";
				async = true;
				data = {
					image: "image.png",
					image2: "image2.png",
				};
				return this.loadAndRender();
			});
			it("should work with images inside slide loop asynchronously", function () {
				withSlideModule = true;
				sizeParsing = true;
				name = "image-within-loop.pptx";
				expectedName = "expected-image-within-loop.pptx";
				async = true;
				data = {
					loop: [
						{
							image: resolveSoon("image.png"),
							name: "Henri",
						},
						{
							image: "money.png",
							name: resolveSoon("Abigail"),
						},
						{
							image: resolveSoon("2.png"),
							name: resolveSoon("Jane"),
						},
					],
					image2: "image2.png",
				};
				return this.loadAndRender();
			});
		});

		describe("Errors with slides module", function () {
			it("should show error if putting a {:data} tag inside an image description", function () {
				withSlideModule = true;
				sizeParsing = true;
				name = "image-with-column-description.pptx";
				expectedName = "expected.pptx";
				async = true;
				data = {};
				const expectedError = {
					name: "TemplateError",
					message:
						"Image descriptions can not contain tags starting with :, such as {:data}. Place your slides repeat tag in a separate visible textbox on the slide.",
					properties: {
						part: {
							type: "placeholder",
							module: "pro-xml-templating/catch-slides-repeat-inside-image",
							value: "slds",
							offset: 0,
							endLindex: 3,
							lIndex: 3,
							raw: ":slds",
						},
						id: "slides_module_tag_not_allowed_in_image_description",
						file: "ppt/slides/slide1.xml",
					},
				};

				expectToThrow(
					this.loadAndRender.bind(this),
					Errors.XTTemplateError,
					wrapMultiError(expectedError)
				);
			});
		});
	}

	describe("DPI", function () {
		it("should be possible to change dpi", function () {
			name = "image-example.docx";
			expectedName = "expected-dpi.docx";
			data = { image: "image.png" };
			/* This particular dpi will make the insertion algorithm behave like the copy/paste behavior of Microsoft Word.
			 *
			 * With Microsoft Word, an image of width 320px is inserted into Word as a width:102.75pt
			 * The px to point conversion is as follows :
			 * pt = px / dpi * mPoint
			 * dpi = px * mPoint / pt
			 * dpi = 320 * 72 / 102.75
			 */
			options.dpi = 224.23;
			this.loadAndRender();
		});
	});

	if (typeof window === "undefined") {
		describe("Getting DPI from jpeg", function () {
			it("should be possible to change dpi", function () {
				const ExifImage = require("exif").ExifImage;
				async = true;
				function scaleWithExif(result, image) {
					return new Promise(function (resolve) {
						if (typeof image === "string") {
							image = Buffer.from(image, "binary");
						}
						try {
							// eslint-disable-next-line no-new
							new ExifImage({ image }, function (error, exifData) {
								if (error) {
									resolve(result);
								} else {
									const image = exifData.image;
									const unit = image.ResolutionUnit;
									const res = image.XResolution;
									let scaleFactor = 1;
									if (unit === 1) {
										scaleFactor = 1;
									} else if (unit === 2) {
										// dots per inch conversion
										scaleFactor = 96 / res;
									} else if (unit === 3) {
										// cm to inch conversion + dots per inch conversion
										scaleFactor = 96 / res / 2.54;
									}
									resolve([result[0] * scaleFactor, result[1] * scaleFactor]);
								}
							});
						} catch (error) {
							resolve(result);
						}
					});
				}
				options = {
					getSize(image) {
						const sizeOf = require("image-size");
						if (typeof image === "string") {
							const buffer = Buffer.from(image, "binary");
							const sizeObj = sizeOf(buffer);
							if (sizeObj.width && sizeObj.height) {
								return scaleWithExif([sizeObj.width, sizeObj.height], image);
							}
						}
						throw new Error("Error");
					},
					getImage(tagValue) {
						return resolveSoon(imageData[tagValue]);
					},
				};
				name = "image-example.docx";
				expectedName = "expected-jpeg.docx";
				data = { image: "d.jpeg" };
				return this.loadAndRender();
			});
		});
	}

	describe("Regressions", function () {
		it("should work with template with purl type", function () {
			name = "purl.docx";
			expectedName = "expected-purl.docx";
			data = { Name: "John" };
			return this.loadAndRender();
		});

		it("should work with hyperlink containing /media/", function () {
			name = "link-with-media.docx";
			expectedName = "expected-link-with-media.docx";
			data = {};
			return this.loadAndRender();
		});

		it("should not remove cid image", function () {
			name = "instr-text-includepicture.docx";
			expectedName = "expected-instr-text-includepicture.docx";
			data = {};
			return this.loadAndRender();
		});

		it("should work with image inside slide master", function () {
			name = "slidemaster.pptx";
			expectedName = "expected-slidemaster.pptx";
			data = {
				image: "image.png",
				image2: "image2.png",
				image3: base64Parser(base64Image),
				image4: "foobar.png",
			};
			return this.loadAndRender();
		});

		it("should fail if image contains invalid characters", function () {
			name = "image-example.docx";
			options = {
				getImage(image) {
					return image;
				},
				getSize,
			};
			expectedName = "expected-base64.docx";
			let error;
			try {
				data = { image: base64Parser(base64ErrorImage) };
			} catch (e) {
				error = e;
			}
			expect(error.message).to.equal(
				"Error parsing base64 data, your data contains invalid characters"
			);
		});

		it("should work with a:blip with r:link attribute", function () {
			// Most images use <a:blip r:embed="rId1">
			// This sample uses <a:blip r:link="rId1">, because the image is external
			name = "image-link.docx";
			expectedName = "expected-image-link-2.docx";
			data = {
				image: "image.png",
			};
			return this.loadAndRender();
		});

		it('should work with image that has a Target="NULL"', function () {
			name = "image-with-null.docx";
			expectedName = "expected-image-with-null.docx";
			data = { image: "image.png" };
			return this.loadAndRender();
		});
	});

	describe("nullGetter", function () {
		it("should work asynchronously", function () {
			async = true;
			docxOptions = { nullGetter: asyncNullGetter };
			name = "image-loop-example.docx";
			expectedName = "expected-loop-null-getter.docx";
			options = {
				getImage,
				getSize,
				centered: true,
			};
			data = { images: ["", "image2.png"] };
			return this.loadAndRender();
		});
	});

	describe("Alt text", function () {
		it("should be possible to set name and alt text", function () {
			name = "double.docx";
			data = { double: "image.png" };

			expectedName = "expected-image-description.docx";

			options = {
				getImage,
				getProps() {
					return { name: "mypicture", alt: 'some ";^>description' };
				},
				getSize() {
					return [200, 200];
				},
			};
			this.loadAndRender();
		});
	});

	describe("Hyperlinks", function () {
		it("should work", function () {
			name = "double.docx";
			data = { double: "image.png" };

			expectedName = "expected-image-link.docx";

			options = {
				getImage,
				getProps() {
					return { link: ddgLink };
				},
				getSize() {
					return [200, 200];
				},
			};
			this.loadAndRender();
		});

		it("should work with PPTX documents", function () {
			name = "tag-image.pptx";
			expectedName = "expected-image-link.pptx";
			data = { image: "image.png" };
			options = {
				getImage,
				getProps() {
					return { link: ddgLink };
				},
				getSize() {
					return [200, 200];
				},
			};
			this.loadAndRender();
		});
	});

	describe("Flipping", function () {
		it("should work vertically", function () {
			name = "double.docx";
			data = { double: "image.png" };

			expectedName = "expected-image-flipped-vertical.docx";

			options = {
				getImage,
				getProps() {
					return { flipVertical: true };
				},
				getSize() {
					return [200, 200];
				},
			};
			this.loadAndRender();
		});

		it("should work horizontally", function () {
			name = "double.docx";
			data = { double: "image.png" };

			expectedName = "expected-image-flipped-horizontal.docx";

			options = {
				getImage,
				getProps() {
					return { flipHorizontal: true };
				},
				getSize() {
					return [200, 200];
				},
			};
			this.loadAndRender();
		});
	});

	describe("Rotation", function () {
		it("should work", function () {
			name = "double.docx";
			data = { double: "image.png" };

			expectedName = "expected-image-rotated.docx";

			options = {
				getImage,
				getProps() {
					return { rotation: 90 };
				},
				getSize() {
					return [200, 200];
				},
			};
			this.loadAndRender();
		});

		it("should work with PPTX documents", function () {
			name = "tag-image.pptx";
			expectedName = "expected-tag-image-rotated.pptx";
			data = { image: "image.png" };
			options = {
				getImage,
				getProps() {
					return { rotation: 90 };
				},
				getSize() {
					return [200, 200];
				},
			};
			this.loadAndRender();
		});
	});

	describe("Width calculation inside cols", function () {
		it("should work with images-inside-cols", function () {
			name = "images-inside-cols.docx";
			expectedName = "expected-images-inside-cols.docx";
			data = {
				list: [
					{
						address: "Foobar street",
						image01: base64sample,
						image02: base64sample,
						image03: base64sample,
					},
					{
						address: "Baz street",
						image01: base64sample,
						image02: base64sample,
						image03: base64sample,
					},
					{
						address: "Bang avenue",
						image01: base64sample,
						image02: base64sample,
					},
				],
			};
			options = {
				getImage(data) {
					return base64Parser(data);
				},
				getSize(a, b, c, d) {
					return [d.part.containerWidth, 100];
				},
			};
			return this.loadAndRender();
		});
	});

	describe("Pptx Image Fill cell", function () {
		it("should work with image-table background ('contain' mode)", function () {
			name = "image-table-fill.pptx";
			expectedName = "expected-image-table-fill.pptx";
			data = { image: "image.png" };
			let width, height;
			options = {
				getImage,
				getSize(a, b, c, d) {
					width = d.part.containerWidth;
					height = d.part.containerHeight;
					return [500, 555];
				},
			};
			this.loadAndRender();
			expect(width).to.equal(118);
			expect(height).to.equal(298);
		});

		it("should work with image-table background", function () {
			name = "image-table-multi-fill.pptx";
			expectedName = "expected-image-table-multi-fill.pptx";
			data = {
				image: "image.png",
				image2: "image2.png",
				image3: "image2.png",
				image4: "image.png",
			};
			options = {
				getImage,
				getSize(a, tag) {
					return imageSizes[tag];
				},
			};
			return this.loadAndRender();
		});

		it("should work with image-table background", function () {
			name = "image-table-multi-fill.pptx";
			expectedName = "expected-image-table-bg-multi-fill.pptx";
			data = {
				image: "image.png",
				image2: "image2.png",
				image3: "image2.png",
				image4: "image.png",
			};
			options = {
				getImage,
				getSize(a, tag) {
					return imageSizes[tag];
				},
				getProps() {
					return {
						imageFit: "fill",
					};
				},
			};
			return this.loadAndRender();
		});

		it("should work with image-table inside loop", function () {
			name = "image-table-loop.pptx";
			expectedName = "expected-image-table-loop.pptx";
			v4 = true;
			data = {
				users: [
					{
						image: "image2.png",
						name: "John",
					},
					{
						image: "image.png",
						name: "Jack",
					},
					{
						image: "image.png",
						name: "Mary",
					},
				],
			};
			options = {
				getImage,
				getSize(a, tag) {
					return imageSizes[tag];
				},
			};
			return this.loadAndRender();
		});

		it("should work with image-table inside loop asynchronously", function () {
			async = true;
			name = "image-table-loop.pptx";
			expectedName = "expected-image-table-loop.pptx";
			data = {
				users: [
					{
						image: "image2.png",
						name: "John",
					},
					{
						image: "image.png",
						name: "Jack",
					},
					{
						image: "image.png",
						name: "Mary",
					},
				],
			};
			options = {
				getImage,
				getSize(a, tag) {
					return imageSizes[tag];
				},
			};
			return this.loadAndRender();
		});

		it("should work with image-table-fill with no <a:tcPr> tag", function () {
			name = "image-table-fill-no-tcpr.pptx";
			expectedName = "expected-image-table-fill-no-tcpr.pptx";
			data = { image: "image.png" };
			options = {
				getImage,
				getSize(a, tag) {
					return imageSizes[tag];
				},
			};
			return this.loadAndRender();
		});
	});

	describe("sxml.xml2string", function () {
		it("should work with complex indents", function () {
			const x = [
				{
					type: "content",
					value: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
					<p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p14="http://schemas.microsoft.com/office/powerpoint/2010/main" xmlns:p15="http://schemas.microsoft.com/office/powerpoint/2012/main" xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006"><p:cSld><p:spTree><p:nvGrpSpPr>`,
					position: "outsidetag",
					lIndex: 0,
				},
				{
					type: "tag",
					position: "selfclosing",
					text: false,
					value: '<p:cNvPr id="1" name=""/>',
					tag: "p:cNvPr",
					lIndex: 1,
				},
				{
					type: "content",
					value:
						"        <p:cNvGrpSpPr/>        <p:nvPr/>      </p:nvGrpSpPr>      <p:grpSpPr>",
					position: "outsidetag",
					lIndex: 2,
				},
				{
					type: "tag",
					position: "start",
					text: false,
					value: "<a:xfrm>",
					tag: "a:xfrm",
					lIndex: 3,
				},
				{
					type: "tag",
					position: "selfclosing",
					text: false,
					value: '<a:off x="0" y="0"/>',
					tag: "a:off",
					lIndex: 5,
				},
				{
					type: "tag",
					position: "selfclosing",
					text: false,
					value: '<a:ext cx="0" cy="0"/>',
					tag: "a:ext",
					lIndex: 7,
				},
				{
					type: "content",
					value:
						'          <a:chOff x="0" y="0"/>          <a:chExt cx="0" cy="0"/>',
					position: "outsidetag",
					lIndex: 8,
				},
				{
					type: "tag",
					position: "end",
					text: false,
					value: "</a:xfrm>",
					tag: "a:xfrm",
					lIndex: 9,
				},
				{
					type: "content",
					value: "      </p:grpSpPr>",
					position: "outsidetag",
					lIndex: 10,
				},
				{
					type: "tag",
					position: "start",
					text: false,
					value: "<p:sp>",
					tag: "p:sp",
					lIndex: 11,
				},
				{
					type: "content",
					value: "<p:nvSpPr>",
					position: "outsidetag",
					lIndex: 12,
				},
				{
					type: "tag",
					position: "start",
					text: false,
					value: '<p:cNvPr id="41" name="TextShape 1">',
					tag: "p:cNvPr",
					lIndex: 13,
				},
				{
					type: "tag",
					position: "end",
					text: false,
					value: "</p:cNvPr>",
					tag: "p:cNvPr",
					lIndex: 14,
				},
				{
					type: "content",
					value: '<p:cNvSpPr txBox="1"/><p:nvPr/></p:nvSpPr><p:spPr>',
					position: "outsidetag",
					lIndex: 15,
				},
				{
					type: "tag",
					position: "start",
					text: false,
					value: "<a:xfrm>",
					tag: "a:xfrm",
					lIndex: 16,
				},
				{
					type: "tag",
					position: "selfclosing",
					text: false,
					value: '<a:off x="2971800" y="2514600"/>',
					tag: "a:off",
					lIndex: 17,
				},
				{
					type: "tag",
					position: "selfclosing",
					text: false,
					value: '<a:ext cx="4114800" cy="346320"/>',
					tag: "a:ext",
					lIndex: 18,
				},
				{
					type: "tag",
					position: "end",
					text: false,
					value: "</a:xfrm>",
					tag: "a:xfrm",
					lIndex: 19,
				},
				{
					type: "content",
					value: '<a:prstGeom prst="rect"><a:avLst/></a:prstGeom>',
					position: "outsidetag",
					lIndex: 20,
				},
				{
					type: "tag",
					position: "selfclosing",
					text: false,
					value: "<a:noFill/>",
					tag: "a:noFill",
					lIndex: 21,
				},
				{
					type: "content",
					value: '<a:ln w="0">',
					position: "outsidetag",
					lIndex: 22,
				},
				{
					type: "tag",
					position: "selfclosing",
					text: false,
					value: "<a:noFill/>",
					tag: "a:noFill",
					lIndex: 23,
				},
				{
					type: "content",
					value: "</a:ln></p:spPr>",
					position: "outsidetag",
					lIndex: 24,
				},
				{
					type: "tag",
					position: "start",
					text: false,
					value: "<p:txBody>",
					tag: "p:txBody",
					lIndex: 25,
				},
				{
					type: "content",
					value:
						'<a:bodyPr lIns="90000" rIns="90000" tIns="45000" bIns="45000"><a:noAutofit/></a:bodyPr>',
					position: "outsidetag",
					lIndex: 26,
				},
				{
					type: "tag",
					position: "start",
					text: false,
					value: "<a:p>",
					tag: "a:p",
					lIndex: 27,
				},
				{
					type: "tag",
					position: "start",
					text: false,
					value: "<a:r>",
					tag: "a:r",
					lIndex: 28,
				},
				{
					type: "tag",
					position: "start",
					text: false,
					value:
						'<a:rPr b="0" lang="de-DE" sz="1800" spc="-1" strike="noStrike">',
					tag: "a:rPr",
					lIndex: 29,
				},
				{
					type: "content",
					value: '<a:latin typeface="Arial"/>',
					position: "outsidetag",
					lIndex: 30,
				},
				{
					type: "tag",
					position: "end",
					text: false,
					value: "</a:rPr>",
					tag: "a:rPr",
					lIndex: 31,
				},
				{
					type: "tag",
					position: "start",
					text: true,
					value: "<a:t>",
					tag: "a:t",
					lIndex: 32,
				},
				{
					type: "delimiter",
					position: "start",
					offset: 0,
					lIndex: 33,
				},
				{
					type: "content",
					value: "%image",
					position: "insidetag",
					lIndex: 34,
				},
				{
					type: "delimiter",
					position: "end",
					offset: 7,
					lIndex: 35,
				},
				{
					type: "tag",
					position: "end",
					text: true,
					value: "</a:t>",
					tag: "a:t",
					lIndex: 36,
				},
				{
					type: "tag",
					position: "end",
					text: false,
					value: "</a:r>",
					tag: "a:r",
					lIndex: 37,
				},
				{
					type: "tag",
					position: "start",
					text: false,
					value:
						'<a:endParaRPr b="0" lang="de-DE" sz="1800" spc="-1" strike="noStrike">',
					tag: "a:endParaRPr",
					lIndex: 38,
				},
				{
					type: "content",
					value: '<a:latin typeface="Arial"/>',
					position: "outsidetag",
					lIndex: 39,
				},
				{
					type: "tag",
					position: "end",
					text: false,
					value: "</a:endParaRPr>",
					tag: "a:endParaRPr",
					lIndex: 40,
				},
				{
					type: "tag",
					position: "end",
					text: false,
					value: "</a:p>",
					tag: "a:p",
					lIndex: 41,
				},
				{
					type: "tag",
					position: "end",
					text: false,
					value: "</p:txBody>",
					tag: "p:txBody",
					lIndex: 42,
				},
				{
					type: "tag",
					position: "end",
					text: false,
					value: "</p:sp>",
					tag: "p:sp",
					lIndex: 43,
				},
				{
					type: "content",
					value:
						'</p:spTree></p:cSld><mc:AlternateContent><mc:Choice Requires="p14"><p:transition spd="slow" p14:dur="2000"></p:transition></mc:Choice><mc:Fallback><p:transition spd="slow"></p:transition></mc:Fallback></mc:AlternateContent></p:sld>',
					position: "outsidetag",
					lIndex: 44,
				},
			];

			const stringified = sxml.xml2string(x);
			expect(stringified).to
				.equal(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
					<p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p14="http://schemas.microsoft.com/office/powerpoint/2010/main" xmlns:p15="http://schemas.microsoft.com/office/powerpoint/2012/main" xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006"><p:cSld><p:spTree><p:nvGrpSpPr>
<p:cNvPr id="1" name=""/>
        <p:cNvGrpSpPr/>        <p:nvPr/>      </p:nvGrpSpPr>      <p:grpSpPr>
<a:xfrm>
  <a:off x="0" y="0"/>
  <a:ext cx="0" cy="0"/>
            <a:chOff x="0" y="0"/>          <a:chExt cx="0" cy="0"/>
</a:xfrm>
      </p:grpSpPr>
<p:sp>
  <p:nvSpPr>
  <p:cNvPr id="41" name="TextShape 1">
  </p:cNvPr>
  <p:cNvSpPr txBox="1"/><p:nvPr/></p:nvSpPr><p:spPr>
  <a:xfrm>
    <a:off x="2971800" y="2514600"/>
    <a:ext cx="4114800" cy="346320"/>
  </a:xfrm>
  <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
  <a:noFill/>
  <a:ln w="0">
  <a:noFill/>
  </a:ln></p:spPr>
  <p:txBody>
    <a:bodyPr lIns="90000" rIns="90000" tIns="45000" bIns="45000"><a:noAutofit/></a:bodyPr>
    <a:p>
      <a:r>
        <a:rPr b="0" lang="de-DE" sz="1800" spc="-1" strike="noStrike">
          <a:latin typeface="Arial"/>
        </a:rPr>
        <a:t>
          {
            %image
          }
        </a:t>
      </a:r>
      <a:endParaRPr b="0" lang="de-DE" sz="1800" spc="-1" strike="noStrike">
        <a:latin typeface="Arial"/>
      </a:endParaRPr>
    </a:p>
  </p:txBody>
</p:sp>
</p:spTree></p:cSld><mc:AlternateContent><mc:Choice Requires="p14"><p:transition spd="slow" p14:dur="2000"></p:transition></mc:Choice><mc:Fallback><p:transition spd="slow"></p:transition></mc:Fallback></mc:AlternateContent></p:sld>
`);
		});
	});
}

if (path.resolve) {
	setExamplesDirectory(path.resolve(__dirname, "..", "examples"));
}
setStartFunction(testStart);
start();
