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
const currentSections = [];
const filePaths = [];
let myTagName = "";
let svgSize = [100, 100];
