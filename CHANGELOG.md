## 3.21.0

Add new feature for Powerpoint documents to add multiple images to one slide.

## 3.20.1

Add support to set the caption height for inline images (in pixels).

Only for inline images, it is now possible to set the height of a given image using following code :

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
                // The default height is 51 (in pixels)
                height: 80,
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

For block images, the caption is in a paragraph part of the document that will automatically expand the space depending on font-size, ...

## 3.20.0

Multiple bugfixes/features for captions :

-   Now, the `pStyle` for the caption and the `pStyle` for the image will be applied correctly, even for inline images.

-   Add feature to change the prefix for captions. For example, it is possible to do this :

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
                    pStyle: "Caption",
                    // This is to remove the prefix
                    prefix: "",
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

## 3.19.2

Add support for setting the pStyle of the generated paragraph using getProps.

## 3.19.1

Two bugfixes :

If an image has a Target="NULL" in its relationship, the image module will no more fail with an error.

When using the imagemodule together with the styling module, sometimes you could see the message on docx files :

```error
The tag {:styleshape style} is not allowed in an image description. Place the {:styleshape stylre} tag in a separate visible textbox on the slide."
```

This won't happen anymore with the image module on docx files.

## 3.19.0

Bugfix when used together with the xlsx module :

If the image is an image that uses the "description" tag, and is present inside a loop, the image is now correctly replaced.

This module requires version 3.12.0 of the xlsx module or higher

## 3.18.2

Bugfix error "Buffer is not defined" when using in browser in version 3.18.1 or 3.18.0

## 3.18.1

Bugfix error "No Media with relM Rid (null) found" when having an image that uses a `r:link` instead of a `r:embed`

## 3.18.0

Since this version, if you include twice the same image (for example a green check mark that is used 10 times in your generated document), the resulting docx will not duplicate the image internally, and instead it will reuse the same image.

It does so by doing comparisons between Buffers, ArrayBuffers, or Strings.

## 3.17.2

Bugfix for working well with xlsx module in some particular case.

If internally, the tag was using a <xdr:ext> tag but not a <a:ext> tag, the image size could not be changed or calculated when using the "replace-image" feature.

## 3.17.1

Bugfix to correctly calculate containerWidth when having a sectPr defined at the beginning of a paragraph.

Specifically, in the following case :

```txt
<w:p>
	<w:sectPr>
		xxxx
	</w:sectPr>
	<w:r><w:t>Paragraph</w:t></w:r>
</w:p>
```

Normally, only text before the sectPr should be part of that section, but it actually applies to the "Paragraph" part as well.

## 3.17.0

Remove option to set a dpi per image. Instead, one should change the `getSize` function to do some scaling.

Update calculation of containerWidth to work well with `w:cols` which have `w:space`.

## 3.16.4

Using getProps, it is now possible to add a link to an image.

## 3.16.3

Using getProps, it is now possible to return a dpi per image.

## 3.16.2

Throw specific error if the data returned by getImage() is not a string, a Buffer, or an ArrayBuffer.

## 3.16.1

Throw error if placing a `{:data}` tag in the description of an image.

Only tag starting with a % are allowed in the description of an image, such as `{%img}`.

{:data} tags are tags of the slide module and need to be placed inside a textbox, as visible text. This text will be removed by the slides module.

## 3.16.0

Add support for keeping an existing image, when using the "replacement module".

When using the replacement module, if the value of the tag is "true", it will keep the existing image unchanged.

For example, if the image has the description {%img}, if you set the data like this :

```js
doc.render({
    img: true,
});
```

It will keep the existing image.

## 3.15.6

Bugfix "Error: could not find extension for this image".

This happened for some jpeg files that didn't contain any metadata.

## 3.15.5

Avoid possible issue of "Maximum call stack size exceeded"

## 3.15.4

Throw error when using a Promise in getImage in sync mode.

## 3.15.3

Correctly store png files as ".png" extension, ".jpeg" as ".jpeg", ...

Previously all files where stored as ".png", regardless of actual data.

## 3.15.2

Bugfix of a bug that removed some images present in the document (that use the type : "http://purl.oclc.org/ooxml/officeDocument/relationships/image")

Previously those images would be removed from the template by mistake.

Now those images are kept as intended.

## 3.15.1

Bugfix when using together with xlsx module on multiple slides.

Fixes https://github.com/open-xml-templating/docxtemplater/issues/672

In previous versions, when entering multiple {%image} tags on multiple slides, the images would not appear at all.

Now all images appear correctly.

## 3.15.0

Add support for rotating pictures with the "rotation" attribute in getProps

Add support for flipping pictures horizontally or vertically with the "flipVertical" or "flipHorizontal" attribute in getProps

## 3.14.6

Bugfix to avoid using lodash, in previous versions, the following message would appear :

`Error: Cannot find module 'lodash'`

## 3.14.5

Bugfix to avoid corruption when inserting SVG.

The corruption was caused by a `<pic:cNvPr>` tag which didn't have a name attribute

## 3.14.4

When using the replace image module with an SVG image, the replacement would not show up on Microsoft Word.

Now, the svg image is dropped, thus showing the replaced png image

## 3.14.3

Add support to be able to customize the name and alt text of replaced images using `getProps`.

## 3.14.2

Update to make module compatible with docxtemplater@3.30.0

Fixes following error :

```
TypeError: Cannot read properties of undefined (reading 'droppedTagsInsidePlaceholder')
    at parse (js/parser.js:170:46)
```

## 3.14.1

Avoid corruption when using `img { display: block; margin:auto; }` with images inside `<li>` elements.

See : https://github.com/open-xml-templating/docxtemplater/issues/655

Now, images that are inside li elements will always be rendered as "inline-block" elements.

## 3.14.0

Add support for setting the `name` and `alt` attribute of the image programmatically using the `getProps` function.

## 3.13.6

Improve typescript typings (sizePixel, svgSize, getProps, getDxaWidth)

## 3.13.5

Add access to the "path" property of the image replacement module.

This allows to for example retrieve all placeholders and the linked images.

```js
const InspectModule = require("docxtemplater/js/inspect-module");

const imageOptions = {
    /* ... */
};
const imageModule = new ImageModule(imageOptions);
const iModule = InspectModule();
const zip = new PizZip(content);
const doc = new Docxtemplater(zip, {
    modules: [imageModule, iModule],
});
const tags = iModule.getStructuredTags();
// tags will be an array, you could filter for the module name :
// open-xml-templating/docxtemplater-replace-image-module
tags.forEach(function (part) {
    if (
        part.module ===
        "open-xml-templating/docxtemplater-replace-image-module"
    ) {
        console.log(
            "Tag",
            part.value,
            "which path is at ",
            part.path
        );
        const buffer = zip.file(part.path).asArrayBuffer();
        console.log(buffer.length);
    }
});
```

## 3.13.4

Bugfix on offset when replacing an image.

Previously, if the offset value was `[0, 100]` or `[100, 0]`, the fact that one value was zero made the offset not apply at all.

Now, the offset works even when one value is zero.

## 3.13.3

On Powerpoint documents, when using the replace-image feature, allow to set an offset to move the image a certain amount of pixels. This allows for example to keep an image centered (see below example)

```js
const doc = new Docxtemplater(zip, {
    modules: [
        new ImageModule({
            getImage: function () {
                // Usual getImage function
            },
            getSize: function () {
                return [200, 200];
            },
			getProps : function (a, b, c, d) {
				const { part, sizePixel } = d;
				if (
					part.module ===
						"open-xml-templating/docxtemplater-replace-image-module" &&
					part.width &&
					part.height
				) {
					return {
						offset: [
							part.width / 2 - sizePixel[0] / 2,
							part.height / 2 - sizePixel[1] / 2,
						],
					};
				}
			};
        }),
    ],
});
```

## 3.13.2

On Powerpoint documents, bugfix to correctly calculate size of images that are replaced using the "description" field

## 3.13.1

On Excel documents, bugfix to use correct width/height when replacing an image using the description field. Internally, we now convert the "twoCellAnchor" element into a "oneCellAnchor".

## 3.13.0

When used together with the xlsx module v3.9.0 or higher, Add possibility to replace images in Excel documents (using the description field).

## 3.12.5

Avoid removing hdphoto images from the template by mistake.

This was causing a corruption in the generated document

## 3.12.4

Bugfix slideMasters (and images in slideMasters) are now correctly templated

## 3.12.3

Avoid corrupting images that contain "instrText" and "INCLUDEPICTURE"

## 3.12.2

Add `<a:graphicFrameLocks xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" noChangeAspect="1" > to all images

## 3.12.1

Add support for returning containerWidth when having a `<v:rect>` element

## 3.12.0

Make module compatible with docxtemplater@3.28.0.
Please make sure to update docxtemplater to 3.28.0 at the same time you update this module.
The internal change made is the use of the new matchers API which fixes bugs that were triggered depending on the order of the modules that are attached to the instance.
Now the order of the modules should not matter as expected.

## 3.11.0

Make module compatible with docxtemplater@3.27.0.
Please make sure to update docxtemplater to 3.27.0 at the same time you update this module

## 3.10.0

Bugfix to correctly retrieve the width/height of the image when the image is in the header or footer when trying to replace an image.

Add support for other units for getSize (by default, the unit is in px when using integers).

You can now write :

```js
const doc = new Docxtemplater(zip, {
    modules: [
        new ImageModule({
            getImage: function () {
                // Usual getImage function
            },
            getSize: function () {
                return ["1cm", "1in"];
            },
        }),
    ],
});
```

The list of allowed units is :

-   `px` => the default unit
-   `in` => an inch, which is 2.54cm
-   `pt` => a point, which is 1/72th of an inch
-   `cm` => a centimeter
-   `mm` => a millimeter
-   `pc` => a pica, which is 1/12th of a point
-   `emu` => english metric unit, which is 1/914400th of an inch, and is the unit used by Word to store most sizes internally.

## 3.9.3

Throw TemplateError when having a centered image tag surrounded by text.
This makes it possible for the Error-location module to show the error correctly.

Also, throw TemplateError when having other text in a text shape for Powerpoint document

## 3.9.2

Allow to replace an existing image using the "title" property, which is the property accessible using "alt-text"

This allows to replace images in headers/footers, which do not have the name property.

## 3.9.1

Bugfix issue when using together with the subtemplate module.

The error message : "ParseError: Attribute name redefined" could appear

## 3.9.0

Add support to change an existing image by using {%image} in the "alt-text" name of the image.

## 3.8.14

Call nullGetter in async mode when the value returned by the parser is falsy.

## 3.8.13

Update typings for getImage to allow Uint8Array, ArrayBuffer, ...

## 3.8.12

Add typings for async mode (getSize can also return a Promise<number[]>, and getImage can return a Promise<Buffer>)
Add typings for options.part.containerWidth

## 3.8.11

Add internal clone method (to use image tags with the Subtemplate.Segment module)

## 3.8.10

Use @xmldom/xmldom instead of xmldom, see [this github issue](https://github.com/xmldom/xmldom/issues/271)

## 3.8.9

Generate files in built with correct filename
In previous versions, the filename was always `build/docxtemplater.js`.
Now the filename is `build/imagemodule.js`
The .min.js file is also created now.

## 3.8.8

Add typescript definitions for public API

## 3.8.7

Improve support for columns width, so that images inside columns which are of unequal width will render correctly.

For example, if you have a document with two columns, one of width of 2/3 of the document, and an other one of 1/3 of the document width, the containerWidth property will be correctly calculated.

Previously, the width would be in this case always splitted equally, so you have a wrong containerWidth in this case

## 3.8.6

Make width and height calculation work when a textbox is inside a v:shape, and the width and height are set in the style attribute

## 3.8.5

When having hyperlinks that contain "/media" in the target, the generated document would be corrupt. Now the document is not made corrupt anymore.

## 3.8.4

-   Add support for floating point numbers in getSize.
-   This version is compatible with version 3.25.4 of the HTML module
-   Add currentSection argument to getDxaWidth function

## 3.8.3

Update to retrieve containerHeight and containerWidth for pptx textboxes and pptx tables.

For docx tables, containerHeight cannot be retrieved because the height depends on the rendering of the fonts and the content of the table, so it cannot be retrieved.

## 3.8.2

Don't fail when placing the {%image} tag inside a table element.

## 3.8.1

Bugfix to make Image replacement work in async mode (you need access to both modules image and xlsx)

## 3.8.0

Add support for ImageModule together with XLSXModule to insert images with {%image} (you need access to both modules)

## 3.7.9

Do not fail when using the tag {%image} on "generic" shapes, eg those defined in the slideLayout

## 3.7.8

-   Do not console.log errors, as they are now properly handled by docxtemplater in async mode with loops (with docxtemplater 3.17.7)

-   Avoid corruption on XLSX file when it contains images (the images would be removed by the document)

## 3.7.7

Use SEQ Figure instead of SEQ Illustration for Captions

## 3.7.6

Declare supportedFileTypes, which allows to use this module with the new
docxtemplater constructor which was [introduced in docxtemplater 3.17](https://github.com/open-xml-templating/docxtemplater/blob/master/CHANGELOG.md#3170).

## 3.7.5

Better bugfix to remove unused images (works with other modules)

## 3.7.4

Bugfix `No section found` appeared :

-   when using document with tags inside properties (for Title, Subject, Keywords, ...)
-   when using a document generated from onedrive (online office version)

## 3.7.3

Add `getSVGFallback` option to allow to convert the svg to png in JS

## 3.7.2

Bugfix when using image module together with pptx-subtemplate module, the images were removed

## 3.7.1

Bugfix to allow to have inline loop of inline images

Improve error message when putting block image inside inline loop

## 3.7.0

(docx) Add support to add captions with `module.getProps` function.

(docx) Add support for aligning block images to the left or the right with `module.getProps` function.

## 3.6.1

Fix issue "No section found" when having an image in a footer

## 3.6.0

Add possibility to retrieve the containerWidth to be able to use 100% of the containerWidth for example

Add possibility to change deviceWidth and getDxaWidth to change the dpi

## 3.5.4

-   Bugfix : do not remove images inside `vfill`
-   Remove usage of `new Buffer`

## 3.5.3

Expect to have error when using centered image in a paragraph which contains other text.

When using centered: true option, images containing `%%` now will show up as normal images (uncentered).

## 3.5.2

Add part.extPx and part.offsetPx to be able to know the size of the placeholder in pptx in pixel unit.

## 3.5.1

Fix corruption when having centered image inside table and return no img

## 3.5.0

Change the way this.opts.centered works.

Before, you would have to write : `{%image}` for inline images and `{%%image}` for centered images, and if you used the `centered:true` option, you would only be able to write centered images (with any of `{%image}` or `{%%image}`). Now when you specify `opts.centered : true`, the standard behavior is just swapped ({%image} for centered images and {%%image} for inline images).

However, in the future, opts.centered : true will be removed and this means that you should rather just change the prefix, like this :

```js
function getImageModule() {
    const imageModule = new ImageModule(options);
    imageModule.prefix = {
        normal: "%%",
        centered: "%",
    };
    return imageModule;
}
const doc = new Docxtemplater(zip, {
    modules: [getImageModule()],
});
```

Also, this fixes a bug with SVG that were not shown when using "centered" images.

## 3.4.4

Bugfix for pptx. Before this release, if the document contained `<a:extLst>`, the error `Images should be placed in new Text Boxes, that are not part of any slide layout` was sometimes wrongfully thrown.

## 3.4.3

Bugfix in asyncmode, errors are now correctly thrown

## 3.4.2

Bugfix image module loops in async mode. Before this bugfix, images inside loops where sometimes always using the same image.

If you use the HTML module, you should update to 3.13.5 of the HTML module.

## 3.4.1

Bugfix SVG : async rendering should also work with base64 svgs

If you use the image module with the HTML module, please also update the HTML module to 3.14.4

## 3.4.0

Auto remove images that are no more needed when using slides module or when using a loop.

This makes the size of the generated docx smaller, and might make the rendering a little bit slower.

## 3.3.4

-   Update browser build to use XMLSerializer instead of xmldom

-   Use requiredAPIVersion

## 3.3.3

Make it possible to change prefix and normal prefix :

```js
function getImageModule() {
    const imageModule = new ImageModule(options);
    imageModule.prefix = {
        normal: ":image ",
        centered: ":centered ",
    };
    return imageModule;
}
const doc = new Docxtemplater(zip, {
    modules: [getImageModule()],
});
```

## 3.3.2

-   Move docxtemplater from devDependencies to dependencies

Explanation : On some versions of npm (notably 5.8.0), when having a package containing docxtemplater-image-module, the installation will generate a tree of node_modules that puts the module on a level where it has no access to docxtemplater. By explicitly asking it as a dependency, this issue is avoided.

## 3.3.1

-   Make module compatible with docxtemplater version 3.5 and below.

Explanation : Recently, the scopemanager API (internal API) has changed, this new version of the image module makes the module work with both versions newer than 3.6 and older than 3.6 of docxtemplater.

## 3.3.0

Add SVG support (but this format is only readable on newer Word version : Microsoft Word, PowerPoint, Outlook, and Excel on the Office 365 subscription).

## 3.2.8

Add meta context argument to custom parser with information about the tag for each types of tags

## 3.2.7

-   Fix issue "size is not defined"

## 3.2.6

-   Add clearer error message if getSize returns float or not an array of two integers

## 3.2.5

-   Add fallback to calling nullGetter if getValue returns falsey value

## 3.2.4

-   Fix "Maximum call stack size exceeeded" when using huge arraybuffers

## 3.2.3

-   Fix corruption error because of duplicate docPr. The shown error is usually : HRESULT 0x80004005 Location: Part: /word/document.xml, Line: 0, Column: 0

-   Add async support (by returning a `Promise` in the `getImage` function).

## 3.2.2

-   Fix error in browser "Buffer is not defined"

## 3.2.1

-   Fix regression in 3.2.0 : It should work with Buffer type

## 3.2.0

-   Throw error if using unsupported filetype (SVG)

-   Throw error if using image in a default box ("Images should be placed in new Text Boxes, that are not part of any slide layout")

## 3.1.6

Mark package as private in package.json

## 3.1.5

Fix corruption when reusing multiple times the docPrId

Reuse Target when possible

## 3.1.4

Do not add relationship for files docProps/app.xml and docProps/core.xml

## 3.1.3

Fix unit tests

## 3.1.2

Files are no longer corrupted when using the option "center"

## 3.1.1

The image module now throws an error if the given size is invalid.

## 3.1.0

-   Breaking : The image module no longer swallows error thrown by `options.getImage` and `options.getSize`. It is the implementors responsibility to not throw any errors, or the error will be passed. You can return a falsy value in getImage to not render an image at all.

## 3.0.2

-   Fix issue with PPTX : Before, you had to add to your options : {fileType: "pptx"} in the module options passed as argument in the constructor of the module. Now, the fileType is retrieved from the main docxtemplater.

## 3.0.1

-   Add support for PPTX.
-   Add centering of images with {%%image} syntax

## 3.0.0

-   This version is compatible with docxtemplater 3.0.
