import ImageModule from "./index.js";
import { expectType, expectError } from "tsd";
const fs = require("fs");
import { docxtemplater_image_module_namespace } from "./index";
import childProcess from "child_process";

function getImage(tagValue: any, tagName: string) {
	expectType<string>(tagName);
	return fs.readFileSync(tagValue);
}

function getImageAsync(tagValue: any, tagName: string) {
	let result: Promise<Buffer> = new Promise(function (resolve) {
		resolve(fs.readFileSync(tagValue));
	});
	return result;
}

function getImageArrayBuffer() {
	return new ArrayBuffer(100);
}
function getSVGFallback(svg: string, sizepixel: number[]) {
	return fs.readFileSync("test.png");
}

function getSize(
	imgData: Buffer,
	data: any,
	tagValue: string,
	options: docxtemplater_image_module_namespace.SizeOptions
): [number, number] {
	expectType<string>(options.part.type);
	expectType<number>(options.part.containerWidth);
	return [200, 200];
}
function getSizeAsync(): Promise<[number, number]> {
	let result: Promise<[number, number]> = new Promise(function (resolve) {
		resolve([200, 200]);
	});
	return result;
}
new ImageModule({
	getImage,
	getSize,
});

new ImageModule({
	getImage: getImageArrayBuffer,
	getSize,
});

new ImageModule({
	getImage,
	getSize,
	centered: true,
	dpi: 12,
	getSVGFallback,
});

expectError(
	new ImageModule({
		getImage,
		getSize,
		centered: "yes",
	})
);

new ImageModule({
	getImage: getImageAsync,
	getSize: getSizeAsync,
	centered: true,
	dpi: 12,
	getSVGFallback,
});

const imageData: { [x: string]: string } = { xxx: "xxx" };

const async = true;

function resolveSoon(val: any): Promise<any> {
	return Promise.resolve(val);
}
function rejectSoon(val: any): Promise<any> {
	return Promise.reject();
}
const base64Image =
	"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAIAAAACUFjqAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH4QIJBywfp3IOswAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAAkUlEQVQY052PMQqDQBREZ1f/d1kUm3SxkeAF/FdIjpOcw2vpKcRWCwsRPMFPsaIQSIoMr5pXDGNUFd9j8TOn7kRW71fvO5HTq6qqtnWtzh20IqE3YXtL0zyKwAROQLQ5l/c9gHjfKK6wMZjADE6s49Dver4/smEAc2CuqgwAYI5jU9NcxhHEy60sni986H9+vwG1yDHfK1jitgAAAABJRU5ErkJggg==";

const base64svgimage =
	"data:image/svg+xml;base64,PHN2ZyBoZWlnaHQ9IjEwMCIgd2lkdGg9IjEwMCI+CiAgPGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iNDAiIHN0cm9rZT0iYmxhY2siIHN0cm9rZS13aWR0aD0iMyIgZmlsbD0icmVkIiAvPgo8L3N2Zz4g";

const ExifImage = require("exif").ExifImage;
function scaleWithExif(
	result: [number, number],
	image: string | Buffer
): Promise<[number, number]> {
	return new Promise(function (resolve) {
		if (typeof image === "string") {
			image = Buffer.from(image, "binary");
		}
		try {
			// eslint-disable-next-line no-new
			new ExifImage({ image }, function (error: any, exifData: any) {
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

function base64Parser(dataURL: string) {
	const stringBase64 = dataURL.replace(
		/^data:image\/(png|jpg|svg|svg\+xml);base64,/,
		""
	);
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

const parts = [];
let calls = 0;
const fnCalls = [];
const filePaths = [];
let myTagName = "";
let svgSize = [100, 100];
new ImageModule({
	getImage,
	getSize,
	centered: false,
});

new ImageModule({
	getImage,
	getSize,
	centered: true,
});

new ImageModule({
	getImage(image, tagValue) {
		return rejectSoon(new Error(`Error for tag '${tagValue}'`));
	},
	getSize,
	centered: true,
});

new ImageModule({
	getImage,
	getSize() {
		return [500, 555];
	},
});

new ImageModule({
	getImage,
	getSize() {
		return ["2.54cm", "1in"];
	},
});

new ImageModule({
	getImage,
	getSize() {
		return ["457200emu", "914400emu"];
	},
});

new ImageModule({
	getImage(image) {
		return image;
	},
	getSize,
});

new ImageModule({
	getSize() {
		return resolveSoon([300, 300]);
	},
	getImage() {
		return resolveSoon(base64Parser(base64Image));
	},
});

new ImageModule({
	getSize(a, b, c, d) {
		if (d.svgSize) {
			svgSize = d.svgSize;
		}
		return [300, 300];
	},
	getImage() {
		return base64Parser(base64svgimage);
	},
});

new ImageModule({
	getSize(a, b, c, d) {
		if (d.svgSize) {
			svgSize = d.svgSize;
		}
		return resolveSoon([300, 300]);
	},
	getImage() {
		return resolveSoon(base64Parser(base64svgimage));
	},
});

new ImageModule({
	getSize() {
		return resolveSoon([300, 300]);
	},
	getImage(tagValue, tagName) {
		myTagName = tagName;
		return resolveSoon(imageData[tagValue]);
	},
});

new ImageModule({
	getImage() {
		return base64Parser(base64Image);
	},
	getSize,
});

new ImageModule({
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
});

new ImageModule({
	getSize() {
		return [200, 200];
	},
	getImage,
});

new ImageModule({
	getSize(a, b, c, d) {
		const width = d.part.containerWidth;
		if (width) {
			return [width, width];
		}
		return [100, 100];
	},
	getImage,
});

new ImageModule({
	centered: true,
	getImage,
	getSize(a, b, c, d) {
		const width = d.part.containerWidth;
		if (width) {
			return [width, width];
		}
		return [100, 100];
	},
});

new ImageModule({
	getImage,
	getSize(a, b, c, d) {
		const filePath = d.options.filePath;
		filePaths.push(filePath);
		const width = d.part.containerWidth;
		if (width) {
			return [width, 100];
		}
		return [100, 100];
	},
});

new ImageModule({
	getImage,
	getSize(a, b, c, d) {
		const width = d.part.containerWidth;
		if (width) {
			return [width, width];
		}
		return [100, 100];
	},
});

new ImageModule({
	getImage,
	getSize(a, b, c, d) {
		const width = d.part.containerWidth;
		const pct = 10 / 100;
		if (width) {
			return [Math.floor(width * pct), Math.floor(width * pct)];
		}
		return [100, 100];
	},
});

new ImageModule({
	getImage,
	getSize(a, b, c, d) {
		calls++;
		const width = d.part.containerWidth;
		const height = d.part.containerHeight;
		if (width && height) {
			return [width, height];
		}
		return [100, 100];
	},
});

new ImageModule({
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
});

new ImageModule({
	getImage,
	getSize(a, b, c, d) {
		const width = d.part.containerWidth;
		const height = d.part.containerHeight;
		if (width && height) {
			return [width, height];
		}
		return [100, 100];
	},
});

new ImageModule({
	getImage,
	getSize(a, b, c, d) {
		calls++;
		const width = d.part.containerWidth;
		const height = d.part.containerHeight;
		let expectedWidth = 201,
			expectedHeight = 303;
		if (d.part.value === "im_table") {
			expectedWidth = 804;
			expectedHeight = 128;
		}
		if (width && height) {
			return [width, height];
		}
		return [100, 100];
	},
});

new ImageModule({
	getImage,
	getSize(a, b, c, d) {
		calls++;
		const width = d.part.containerWidth;
		let expectedWidth = 192;
		if (d.part.value === "image2") {
			expectedWidth = 384;
		}
		if (width) {
			return [width, width];
		}
		return [100, 100];
	},
});

new ImageModule({
	getImage,
	getSize() {
		return [200, 200];
	},
	getProps() {
		return { caption: { text: "My custom <apple>" } };
	},
});

new ImageModule({
	getImage,
	getProps() {
		return { caption: { text: "My custom <apple>" } };
	},
	getSize() {
		return [200, 200];
	},
});

new ImageModule({
	getImage,
	getSize() {
		return [300, 300];
	},
	getProps() {
		return { caption: { text: "My custom <apple>" } };
	},
});

new ImageModule({
	getImage,
	getProps() {
		return null;
	},
	getSize() {
		return [200, 200];
	},
});

new ImageModule({
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
});

new ImageModule({
	getImage,
	getSize(a, b, c, d) {
		if (d.part.width && d.part.height) {
			return [d.part.width, d.part.height];
		}
		return [100, 100];
	},
});

new ImageModule({
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
});

new ImageModule({
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
});

new ImageModule({
	getImage,
	getProps() {
		return { align: "left" };
	},
	getSize() {
		return [200, 200];
	},
});

new ImageModule({
	getImage,
	getProps() {
		return { align: "right" };
	},
	getSize() {
		return [200, 200];
	},
});

new ImageModule({
	getSize,
	getImage() {
		return base64Parser(base64Image);
	},
});

new ImageModule({
	getSize() {
		return [300, 300];
	},
	getImage() {
		return base64Parser(base64svgimage);
	},
	centered: true,
});

new ImageModule({
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
});

new ImageModule({
	getSize() {
		return resolveSoon([50, 50]);
	},
	getImage() {
		return resolveSoon(base64Parser(base64svgimage));
	},
});

new ImageModule({
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
});

new ImageModule({
	getImage,
	getProps() {
		return { name: "mypicture", alt: 'some ";^>description' };
	},
	getSize() {
		return [200, 200];
	},
});
