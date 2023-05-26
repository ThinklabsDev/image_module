/* eslint-disable no-console */

const fs = require("fs");
const Stream = require("stream").Transform;
const https = require("https");
const http = require("http");

const Docxtemplater = require("docxtemplater");
const PizZip = require("pizzip");

const ImageModule = require("./es6/index.js");

const content = fs.readFileSync("demo_template.docx");

const data = { image: "https://docxtemplater.com/xt-pro.png" };

const opts = {};
// This function should return a Promise<Buffer> or Promise<string>
opts.getImage = function (tagValue, tagName) {
	console.log({ tagValue, tagName });
	// tagValue is "https://docxtemplater.com/xt-pro.png" and tagName is "image"
	return new Promise(function (resolve, reject) {
		getHttpData(tagValue, function (err, data) {
			if (err) {
				return reject(err);
			}
			resolve(data);
		});
	});
};

// This function should return an array of 2 integers, like [150,150] for a width and height of 150px
opts.getSize = function (img) {
	// img is the value that was returned by getImage
	// This is to force the width to 600px, but keep the same aspect ration
	const sizeOf = require("image-size");
	const sizeObj = sizeOf(img);
	console.log(sizeObj);
	const forceWidth = 600;
	const ratio = forceWidth / sizeObj.width;
	return [
		forceWidth,
		// calculate height taking into account aspect ratio
		Math.round(sizeObj.height * ratio),
	];
};

const imageModule = new ImageModule(opts);
const zip = new PizZip(content);
const doc = new Docxtemplater(zip, { modules: [imageModule] });

doc
	.renderAsync(data)
	.then(function () {
		const buffer = doc
			.getZip()
			.generate({ type: "nodebuffer", compression: "DEFLATE" });

		fs.writeFileSync("demo_generated.docx", buffer);
	})
	.catch(function (error) {
		console.log("An error occured", error);
	});

// Returns a Promise<Buffer> of the image
function getHttpData(url, callback) {
	(url.substr(0, 5) === "https" ? https : http)
		.request(url, function (response) {
			if (response.statusCode !== 200) {
				return callback(
					new Error(
						`Request to ${url} failed, status code: ${response.statusCode}`
					)
				);
			}

			const data = new Stream();
			response.on("data", function (chunk) {
				data.push(chunk);
			});
			response.on("end", function () {
				callback(null, data.read());
			});
			response.on("error", function (e) {
				callback(e);
			});
		})
		.end();
}
