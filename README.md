# Usage

It is possible to retrieve data from any data source (synchronously or asynchronously).

For example :

-   from base64 data
-   from the filesystem
-   from a url like : `https://docxtemplater.com/xt-pro-white.png`
-   from an Amazon S3 stored image

The tag should be prefixed by `%` to be parsed as an image. So for example, you could use :`{%image}` which will take the data from the `image` key, or `{%secondImage}` to take the data from the `secondImage` key.

## Usage (nodejs)

The below example is in nodejs, to read the image data from the filesystem :

```js
const ImageModule = require("docxtemplater-image-module");

const imageOpts = {
    centered: false,
    getImage: function (tagValue, tagName) {
        return fs.readFileSync(tagValue);
    },
    getSize: function (img, tagValue, tagName) {
        // it also is possible to return a size in centimeters, like this : return [ "2cm", "3cm" ];
        return [150, 150];
    },
};

const zip = new PizZip(content);
const doc = new Docxtemplater(zip, {
    modules: [new ImageModule(imageOpts)],
});
doc.render({ image: "examples/image.png" });

const buffer = doc.getZip().generate({
    type: "nodebuffer",
    compression: "DEFLATE",
});

fs.writeFile("test.docx", buffer);
```

## Usage (browser)

In the browser, this shows how to get the image from a URL :

```html
<html>
    <script src="node_modules/docxtemplater/build/docxtemplater.js"></script>
    <script src="node_modules/pizzip/dist/pizzip.js"></script>
    <script src="node_modules/pizzip/vendor/FileSaver.js"></script>
    <script src="node_modules/pizzip/dist/pizzip-utils.js"></script>
    <script src="build/imagemodule.js"></script>
    <script>
        docxType =
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
        PizZipUtils.getBinaryContent(
            "examples/image-example.docx",
            function (error, content) {
                if (error) {
                    console.error(error);
                    return;
                }
                const imageOpts = {
                    centered: false,
                    getImage: function (tagValue, tagName) {
                        return new Promise(function (
                            resolve,
                            reject
                        ) {
                            PizZipUtils.getBinaryContent(
                                tagValue,
                                function (error, content) {
                                    if (error) {
                                        return reject(error);
                                    }
                                    return resolve(content);
                                }
                            );
                        });
                    },
                    getSize: function (img, tagValue, tagName) {
                        // FOR FIXED SIZE IMAGE :
                        return [150, 150];

                        // FOR IMAGE COMING FROM A URL (IF TAGVALUE IS AN ADDRESS) :
                        // To use this feature, you have to be using docxtemplater async
                        // (if you are calling render(), you are not using async).
                        return new Promise(function (
                            resolve,
                            reject
                        ) {
                            const image = new Image();
                            image.src = url;
                            image.onload = function () {
                                resolve([
                                    image.width,
                                    image.height,
                                ]);
                            };
                            image.onerror = function (e) {
                                console.log(
                                    "img, tagValue, tagName : ",
                                    img,
                                    tagValue,
                                    tagName
                                );
                                alert(
                                    "An error occured while loading " +
                                        tagValue
                                );
                                reject(e);
                            };
                        });
                    },
                };

                const zip = new PizZip(content);
                const doc = new docxtemplater(zip, {
                    modules: [new ImageModule(imageOpts)],
                });

                doc.renderAsync({
                    image: "examples/image.png",
                }).then(function () {
                    const out = doc.getZip().generate({
                        type: "blob",
                        mimeType: docxType,
                    });
                    saveAs(out, "generated.docx");
                });
            }
        );
    </script>
</html>
```

After installing the module, you can use a working demo by running `node sample.js`.

To understand what `img`, `tagValue`, `tagName` mean, lets take an example :

If your template is :

```txt
{%myImage}
```

and your data:

```json
{
    "myImage": "sampleImage.png"
}
```

-   **tagValue** will be equal to "sampleImage.png"
-   **tagName** will be equal to "myImage"
-   **img** will be what ever the `getImage` function returned

One of the most useful cases of this is to set the images to be the size of that image.

For this, you will need to install the [npm package 'image-size'](https://www.npmjs.com/package/image-size) then, write:

```js
const sizeOf = require("image-size");
const imageOpts = {
    centered: false,
    getImage: function (tagValue) {
        return fs.readFileSync(tagValue, "binary");
    },
    getSize: function (img) {
        const sizeObj = sizeOf(img);
        console.log(sizeObj);
        return [sizeObj.width, sizeObj.height];
    },
};
const doc = new Docxtemplater(zip, {
    modules: new ImageModule(imageOpts),
});
```

# Replace an existing image

It is possible to replace an existing image in the document instead of adding a new image. This is possible since version 3.9.0 of the image module.

To replace an image, you can write `{%image1}` in the alt-text attribute, or the name of the image, and the image will be replaced. Note that the width will be updated depending on the getSize function.

To replace images in header or replace them in footers, you can use the "alt-text" property.

Inside Microsoft Word on Windows, you can update the alt-text by right clicking on the image :

![Alt text demo1|Step 1: Click Edit Alt Text](/img/alt-text1.png)

![Alt text demo2|Step 2: Change the alt text](/img/alt-text2.png)

It is possible to keep the size of the existing image by using the following function for getSize :

```js
const sizeOf = require("image-size");

const imageOpts = {
    getImage: function(tagValue) {
        // return usual value, using fs or any other method
    },
    getSize : function (image, data, tagValue, options) {
		const part = options.part;
		if (part.module === "open-xml-templating/docxtemplater-replace-image-module") {
			return [
				part.width,
				part.height
			]
		}

		// return usual value, using image-size or other method.
        const buffer = Buffer.from(image, "binary");
        const sizeObj = sizeOf(buffer);
        return [sizeObj.width, sizeObj.height];
    };
}
const doc = new Docxtemplater(zip, {modules: [new ImageModule(imageOpts)]});
```

# Base64 include

You can use base64 images with the following code

```js
const base64Regex =
    /^data:image\/(png|jpg|svg|svg\+xml);base64,/;
function base64Parser(dataURL) {
    if (
        typeof dataURL !== "string" ||
        !base64Regex.test(dataURL)
    ) {
        return false;
    }

    const validBase64 =
        /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;

    if (!validBase64.test(stringBase64)) {
        throw new Error(
            "Error parsing base64 data, your data contains invalid characters"
        );
    }

    const stringBase64 = dataURL.replace(base64Regex, "");

    // For nodejs, return a Buffer
    if (typeof Buffer !== "undefined" && Buffer.from) {
        return Buffer.from(stringBase64, "base64");
    }

    // For browsers, return a string (of binary content) :
    const binaryString = window.atob(stringBase64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        const ascii = binaryString.charCodeAt(i);
        bytes[i] = ascii;
    }
    return bytes.buffer;
}
const imageOpts = {
    getImage(tag) {
        return base64Parser(tag);
    },
    getSize() {
        return [100, 100];
    },
};
const doc = new Docxtemplater(zip, {
    modules: [new ImageModule(imageOpts)],
});
```

# Fetch image from url

It is possible to get images asynchronously by returning a Promise in the `getImage` function and use the [docxtemplater async api](/docs/async/).

Here is an example in node that allows you to retrieve values from an URL and use a fixed width, and keep the aspect ratio.

```js
const fs = require("fs");
const Docxtemplater = require("docxtemplater");
const https = require("https");
const http = require("http");
const Stream = require("stream").Transform;
const ImageModule = require("docxtemplater-image-module");
const PizZip = require("pizzip");

const content = fs.readFileSync("demo_template.docx");

const data = { image: "https://docxtemplater.com/xt-pro.png" };

const imageOpts = {
    getImage: function (tagValue, tagName) {
        console.log(tagValue, tagName);
        const base64Value = base64Parser(tagValue);
        if (base64Value) {
            return base64Value;
        }
        // tagValue is "https://docxtemplater.com/xt-pro-white.png"
        // tagName is "image"
        return new Promise(function (resolve, reject) {
            getHttpData(tagValue, function (err, data) {
                if (err) {
                    return reject(err);
                }
                resolve(data);
            });
        });
    },
    getSize: function (img, tagValue, tagName) {
        console.log(tagValue, tagName);
        // img is the value that was returned by getImage
        // This is to force the width to 600px, but keep the same aspect ratio
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
    },
};

const zip = new PizZip(content);
const doc = new Docxtemplater(zip, {
    modules: [new ImageModule(imageOpts)],
});

doc.renderAsync(data)
    .then(function () {
        const buffer = doc.getZip().generate({
            type: "nodebuffer",
            compression: "DEFLATE",
        });

        fs.writeFileSync("test.docx", buffer);
        console.log("rendered");
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
```

# Pixel to Inch conversions

Pixels and Inches are two very different units, conceptually.

Pixels represent not a physical length, but a logical length. Screens can be the same physical size (13 inches for example) and have different amount of pixels (640px or 1920px for example).

The images in the image-module are specified in pixels, and Word is a format that is made for print, Word stores all dimensions in inches (or fractions of inches).
The unit used for images is usually "DXA", where 1 inch is equal to 1440 DXAS. This unit is also called [a "twip"](https://en.wikipedia.org/wiki/Twip).

To translate pixels to inches, the image-module uses the concept of "dpi", or "dots per inches", which is a way to convert the image sizes returned by the "getSize" function which are in pixel unit, and convert them to inches.

This is done with the formula :

```txt
sizeInInch = sizeInPixel / dpi
```

By default, the dpi is set to 96, which means 96px will be translated to one inch.

You can change the dpi by setting it in the options, like this :

```js
const imageOpts = {
    getImage: function (tagValue) {
        // ...
    },
    getSize: function (img) {
        // ...
    },
    dpi: 120,
};

const doc = new Docxtemplater(zip, {
    modules: new ImageModule(imageOpts),
});
```

To have the image module scale the images in exactly the same way as Microsoft word does, you should use a dpi of 224.23.

# Centering images

You can center the images using `opts.centered = true` or by using `{%%image}` instead of `{%image}` in your documents

# Avoid images bigger than their container

If you include some images inside tables, it is possible that you get some images that are not shown completely because they are bigger than their container.

To fix this issue, you can do the following to never overflow the containerWidth and keep the aspect ratio

```js
const sizeOf = require("image-size");
const imageOpts = {
    // getImage: as usual
    getSize: function (img, value, tagName, context) {
        const sizeObj = sizeOf(img);
        const maxWidth = context.part.containerWidth;
        const maxHeight =
            context.part.containerHeight ||
            context.part.containerWidth;

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

const doc = new Docxtemplater(zip, {
    modules: new ImageModule(imageOpts),
});
```

# Size and path based on placeholder

You can customize the image loader using the template's placeholder name.

```js
const imageOpts = {
    getImage: function (tagValue, tagName) {
        if (tagName === "logo")
            return fs.readFileSync(
                __dirname + "/logos/" + tagValue
            );

        return fs.readFileSync(
            __dirname + "/images/" + tagValue
        );
    },
};
```

The same thing can be used to customize image size.

```js
const imageOpts = {
    getSize: function (img, tagValue, tagName) {
        if (tagName === "logo") return [100, 100];

        return [300, 300];
    },
};
```

# Size with angular-parser

You can also use angular expressions to set image sizes :

In your template, write :

```txt
(This will force the aspect ratio to 2/1)

{%image | size:200:100}

or, to keep the aspect ratio by specifying a max size

{%image | maxSize:200:100}
```

First argument is the width, second argument is the height.

In your code, you would write the following :

```js
const expressionParser = require("docxtemplater/expressions.js");
expressionParser.filters.size = function (input, width, height) {
    return {
        data: input,
        size: [width, height],
    };
};
// This one sets a max size, allowing to keep the aspect ratio of the image, but ensuring that the width and height do not exceed the limits specified
expressionParser.filters.maxSize = function (
    input,
    width,
    height
) {
    return {
        data: input,
        maxSize: [width, height],
    };
};

const imageOpts = {
    getImage: function (tagValue) {
        if (tagValue.size && tagValue.data) {
            return base64Parser(tagValue.data);
        }
        if (tagValue.maxSize && tagValue.data) {
            return base64Parser(tagValue.data);
        }
        return base64Parser(tagValue);
    },
    getSize: function (img, tagValue) {
        if (tagValue.size && tagValue.data) {
            return tagValue.size;
        }
        if (!tagValue.maxSize) {
            return [150, 150];
        }

        const maxWidth = tagValue.maxSize[0];
        const maxHeight = tagValue.maxSize[1];
        const sizeOf = require("image-size");
        const sizeObj = sizeOf(img);

        const widthRatio = sizeObj.width / maxWidth;
        const heightRatio = sizeObj.height / maxHeight;
        if (widthRatio < 1 && heightRatio < 1) {
            /*
             * Do not scale up images that are
             * smaller than maxWidth,maxHeight
             */
            return [sizeObj.width, sizeOf.height];
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
const doc = new Docxtemplater(zip, {
    modules: [new ImageModule(imageOpts)],
    parser: expressionParser,
});
```

# Max width and max height

It is quite likely that you would want to limit the width and the height of your images, to do this, you could use the following code in your getSize function

```js
const imageOpts = {
    getSize: function (img, tagValue, tagName) {
        // img is the value that was returned by getImage
        // This is to limit the width and height of the resulting image
        const maxWidth = 1000;
        const maxHeight = 800;
        const sizeOf = require("image-size");
        const sizeObj = sizeOf(img);
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
```

# Retrieve image from &lt;canvas&gt;

It is possible to retrieve image from a canvas value, by customizing the `getImage` option.

```js
const imageOpts = {
    getImage: function (tagValue, tagName) {
        const canvas = document.getElementById("myCanvas");
        const ctx = canvas.getContext("2d");
        ctx.beginPath();
        ctx.arc(100, 75, 50, 0, 2 * Math.PI);
        ctx.stroke();
        return base64Parser(canvas.toDataURL());
    },
};
```

Note that you can change that function so that depending on the tagvalue, either the image is loaded from canvas or from a URL.

# SVG support

SVGs can be added, but this format is only readable on newer Word version : Microsoft Word, PowerPoint, Outlook, and Excel on the Office 365 subscription.

See [this article](https://support.office.com/en-us/article/edit-svg-images-in-microsoft-office-2016-69f29d39-194a-4072-8c35-dbe5e7ea528c) for details about this feature.

When SVG is not supported in your reader (libreoffice, google-docs, Word 2013), you will see the image "SVG unsupported" instead.

You can configure the image that is shown as a fallback if SVG is not supported, by defining the getSVGFallback method. You can use this method to convert the SVG to png so that all docx readers are able to see the SVG. In the below example, I use graphicsmagick to do the conversion : `sudo apt-get install -y graphicsmagick`

```js
const imageOpts = {
    getSVGFallback: function (svgFile, sizePixel) {
        const result = require("child_process").spawnSync(
            "gm",
            [
                "convert",
                "SVG:-",
                "-resize",
                sizePixel.join("x"),
                "PNG:-",
            ],
            {
                input: new Buffer(svgFile),
            }
        );
        if (result.status !== 0) {
            /* eslint-disable-next-line no-console */
            console.error(
                JSON.stringify({
                    "result.stderr": result.stderr.toString(),
                })
            );
            throw new Error(
                "Error while executing graphicsmagick"
            );
        }
        return new Buffer(result.stdout);
    },
};
```

In the browser, you can use the following to transform the SVG's into PNG :

```js
const imageOpts = {
    getSVGFallback: function (svgFile, sizePixel) {
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
                    const canvas =
                        document.createElement("canvas");
                    canvas.width = width;
                    canvas.height = height;
                    const canvasCtx = canvas.getContext("2d");
                    canvasCtx.drawImage(
                        svgImage,
                        0,
                        0,
                        width,
                        height
                    );
                    const imgData =
                        canvas.toDataURL("image/png");
                    resolve(base64Parser(imgData));
                };
                svgImage.onerror = function () {
                    reject(
                        new Error(
                            "Could not transform svg to png"
                        )
                    );
                };
                svgImage.src =
                    "data:image/svg+xml;utf8," + svgUrl;
            }
            svgUrlToPng(
                arrayBufferToString(svgFile).replace(
                    "<svg",
                    "<svg xmlns='http://www.w3.org/2000/svg'"
                )
            );
        });
    },
};
```

# Adding Captions

For docx, it is possible to add captions with the following code :

```js
const imageOpts = {
    getProps: function (img, tagValue, tagName) {
        /*
         * If you don't want to change the props
         * for a given tagValue, you should write :
         *
         * return null;
         */
        return {
            caption: {
                text: "My custom caption",
            },
        };
    },
    getImage: function (tagValue, tagName) {
        return fs.readFileSync(tagValue);
    },
    getSize: function (img, tagValue, tagName) {
        return [150, 150];
    },
};
const doc = new Docxtemplater(zip, {
    modules: [new ImageModule(imageOpts)],
});
```

# Rotating / flipping image

The rotation attribute in return of the "getProps" function allows to rotate the image of a specified number of degrees (90 is quarter of a turn, clockwise)

It is possible to rotate or flip the image with the following code :

```js
const imageOpts = {
    getProps: function (img, tagValue, tagName) {
        /*
         * If you don't want to change the props
         * for a given tagValue, you should write :
         *
         * return null;
         */
        return {
            rotation: 90,
            // flipVertical: true,
            // flipHorizontal: true,
        };
    },
    getImage: function (tagValue, tagName) {
        return fs.readFileSync(tagValue);
    },
    getSize: function (img, tagValue, tagName) {
        return [150, 150];
    },
};
const doc = new Docxtemplater(zip, {
    modules: [new ImageModule(imageOpts)],
});
```

It is possible to take into account exif data in order to to the correct flipping/rotation.

Use following code for this :

```js
function getOrientation(result, image) {
    return new Promise(function (resolve) {
        if (typeof image === "string") {
            image = Buffer.from(image, "binary");
        }
        try {
            new ExifImage({ image }, function (error, exifData) {
                if (error) {
                    resolve(null);
                    console.log("Error: " + error.message);
                } else {
                    const image = exifData.image;
                    const orientation = image.Orientation;
                    switch (orientation) {
                        case 1:
                            return {};
                        case 2:
                            return { flipHorizontal: true };
                        case 3:
                            return { rotation: 180 };
                        case 4:
                            return { flipVertical: true };
                        case 5:
                            return {
                                rotation: 270,
                                flipHorizontal: true,
                            };
                        case 7:
                            return {
                                rotation: 90,
                                flipHorizontal: true,
                            };
                        case 8:
                            return { rotation: 90 };
                        default:
                    }
                }
            });
        } catch (error) {
            resolve(null);
        }
    });
}
const imageOpts = {
    getImage: function (tagValue) {
        // return usual value, using fs or any other method
    },
    getSize: function (image) {
        // return usual value
    },
    getProps: function (image) {
        return getOrientation(image);
    },
};
const doc = new Docxtemplater(zip, {
    modules: [new ImageModule(imageOpts)],
});
```

# Changing Alignment

For docx, it is possible to change the alignment of a block image with the following code :

```js
const imageOpts = {
    getProps: function (img, tagValue, tagName) {
        /*
         * If you don't want to change the props
         * for a given tagValue, you should write :
         *
         * return null;
         */
        return {
            align: "right",
        };
    },
    getImage: function (tagValue, tagName) {
        return fs.readFileSync(tagValue);
    },
    getSize: function (img, tagValue, tagName) {
        return [150, 150];
    },
};
const doc = new Docxtemplater(zip, {
    modules: [new ImageModule(imageOpts)],
});
```

# Changing name or alternative text

It is possible to customize the alternative text (the text shown on non-visual editors) using the getProps "alt" attribute. The "name" attribute is used to set the name of the image.

```js
const imageOpts = {
    getProps: function (img, tagValue, tagName) {
        /*
         * If you don't want to change the props
         * for a given tagValue, you should write :
         *
         * return null;
         */
        return {
            name: "myimage.png",
            alt: "A cat looking playfully at a mouse.",
        };
    },
    getImage: function (tagValue, tagName) {
        return fs.readFileSync(tagValue);
    },
    getSize: function (img, tagValue, tagName) {
        return [150, 150];
    },
};
const doc = new Docxtemplater(zip, {
    modules: [new ImageModule(imageOpts)],
});
```

# Adding a link to an image

It is possible to add a link to an image, by using the following

```js
const imageOpts = {
    getProps: function (img, tagValue, tagName) {
        /*
         * If you don't want to change the props
         * for a given tagValue, you should write :
         *
         * return null;
         */
        return {
            link: "https://duckduckgo.com/",
        };
    },
    getImage: function (tagValue, tagName) {
        return fs.readFileSync(tagValue);
    },
    getSize: function (img, tagValue, tagName) {
        return [150, 150];
    },
};
const doc = new Docxtemplater(zip, {
    modules: [new ImageModule(imageOpts)],
});
```

# Centered Images should be placed in empty paragraphs

For the imagereplacer to work, the image tag: `{%image}` needs to be in its own paragraph (`<w:p>` tag in Word), so that means that you have to put a new line after and before the tag.

The following template will throw that error :

```
Foo
Hello {%image}
Bar
```

And the following will work

```
Foo
Hello
{%image}
Bar
```

# Powerpoint notice

If you put images in a box that also contains some other text (content, title, or even whitespace , you will get an error :

To fix this error, you have to create a box that contains the `{%...}` and only this text, no other whitespace nor content.

For example, the following template will **fail**, because the shape containing the text `{%image}` also contains "Some content" and "Other content".

![Fail|Invalid template](/img/pptx_image_wrong.png)

For example, the following template will **succeed**, because there are 3 different shapes, and the shape containing the `{%image}` tag contains no other text. Note that the width/height of the generated image will be the same as the one from the shape.

![Succeed|Correct template](/img/pptx_image_right.png)

# Images inside loop for Powerpoint files

If you try to add a loop with an image inside it, like this :

```text
{#images}
{%src}
{/}
```

You will get an error message like this :

%%ERROR The image tag "src" should not be placed inside a loop, it should be the only text in a given shape

There are two ways to fix this issue, one uses table cells with a background image, the other uses the grid-table module

## Adding multiple images to Powerpoint presentations using table cell background

When placing the tag : {%image} in a table cell in a pptx document, the module sets the background-image of that cell.

This makes it possible to create a loop with multiple images inside a table :

![Pptx table with loop|Template pptx](/img/template_table_loop_pptx_images.png)
![Pptx table with loop|Generated pptx](/img/table_loop_pptx_images.png)

## Generating multiple images in one slide using the grid module

To include multiple images in a given slide, you need to have both the "Table" module, the "Slides" module and the "Image module".

You can generate multiple "slides" in a grid layout with following template :

![grid-template-pptx|Grid template for multiple slides](/img/grid-pptx.png)

companies is an array of objects representing each company.

It will generate output similar to this :

![grid-template-pptx-rendered|Generated document](/img/grid-pptx-rendered.png)

In your code, do the following

```js
const TableModule = require("docxtemplater-table-module");
const SlidesModule = require("docxtemplater-slides-module");
const ImageModule = require("docxtemplater-image-module");
const doc = new Docxtemplater(zip, {
    modules: [
        new TableModule.GridPptx(),
        new SlidesModule(),
        new ImageModule(imageOptions),
    ],
});

doc.render({
    companies: [
        {
            name: "first company",
            id: "first id",
            logo: "2",
            region: "france",
        },
        {
            name: "second company",
            id: "second",
            region: "germany",
        },
        {
            name: "third",
            id: "third id",
            logo: "4",
            region: "russia",
        },
        {
            name: "fourth",
            id: "fourth id",
            region: "italy",
        },
    ],
});
```

# Take into account XResolution (from the jpeg metadata)

JPEG images often have metadata about the XResolution, which means they can
have a specific dpi as metadata to the image. When copy-pasting a JPEG image
into Microsoft Word, Microsoft Word will read the XResolution of the image and
size the image accordingly.

With the image-module, usually the getSize function only will read the size of
the image in pixels, but not the metadata.

If you need docxtemplater to behave like Microsoft Word, you could use an Exif
extractor that will give you the XResolution. Here is an example of how you can
do that (you need to use async rendering)

```js
const ExifImage = require("exif").ExifImage;

function scaleWithExif(result, image) {
    return new Promise(function (resolve) {
        if (typeof image === "string") {
            image = Buffer.from(image, "binary");
        }
        try {
            new ExifImage({ image }, function (error, exifData) {
                if (error) {
                    resolve(null);
                    console.log("Error: " + error.message);
                } else {
                    const image = exifData.image;
                    const unit = image.ResolutionUnit;
                    const res = image.XResolution;
                    let scaleFactor;
                    if (unit === 1) {
                        scaleFactor = 1;
                    } else if (unit === 2) {
                        scaleFactor = 96 / res;
                    } else if (unit === 3) {
                        // dots per centimeter => dots per inch conversion
                        scaleFactor = 96 / res / 2.54;
                    }
                    console.log(JSON.stringify({ scaleFactor }));
                    console.log(JSON.stringify({ result }));
                    resolve([
                        result[0] * scaleFactor,
                        result[1] * scaleFactor,
                    ]);
                }
            });
        } catch (error) {
            resolve(null);
        }
    });
}
const imageOpts = {
    getImage: function (tagValue) {
        // return usual value, using fs or any other method
    },
    getSize: function (image) {
        const sizeOf = require("image-size");
        const buffer = Buffer.from(image, "binary");
        const sizeObj = sizeOf(buffer);
        return scaleWithExif(
            [sizeObj.width, sizeObj.height],
            image
        );
    },
};
const doc = new Docxtemplater(zip, {
    modules: [new ImageModule(imageOpts)],
});
doc.renderAsync(data).then(function () {
    console.log("rendered");
});
```
