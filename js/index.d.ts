export namespace docxtemplater_image_module_namespace {
	type integer = number;

	interface Part {
		type: string;
		value: string;
		module: string;
		raw: string;
		offset: integer;
		lIndex: integer;
		num: integer;
		inverted?: boolean;
		width?: number;
		height?: number;
		endLIndex?: integer;
		expanded?: Part[];
		subparsed?: Part[];
		containerWidth: number;
		containerHeight?: number;
	}

	interface SizeOptions {
		part: Part;
		options: any;
		sizePixel?: [number, number];
		svgSize?: [number, number];
	}

	type ZipInput =
		| null
		| string
		| number[]
		| Uint8Array
		| ArrayBuffer
		| Blob
		| NodeJS.ReadableStream
		| Promise<
				| null
				| string
				| number[]
				| Uint8Array
				| ArrayBuffer
				| Blob
				| NodeJS.ReadableStream
		  >;

	interface Section {
		width: integer;
		leftMargin: integer;
		rightMargin: integer;
		cols: integer;
	}

	interface ImageOptions {
		getImage(data: any, tagValue: string): ZipInput;
		getSize(
			imgData: Buffer | string,
			data: any,
			tagValue: string,
			options: SizeOptions
		):
			| [number, number]
			| [string, string]
			| Promise<[number, number] | [string, string]>;
		getProps?(
			imgData: Buffer | string,
			data: any,
			tagValue: string,
			options: SizeOptions
		):
			| {
					caption?: {
						text: string;
						pStyle?: string;
					};
					name?: string;
					alt?: string;
					link?: string;
					pStyle?: string;
					align?: string;
					offset?: [integer, integer];
			  }
			| null
			| undefined;
		centered?: boolean;
		dpi?: number;
		getSVGFallback?(svg: string, sizepixel: number[]): ZipInput;
	}
}

declare class docxtemplater_image_module {
	constructor(options: docxtemplater_image_module_namespace.ImageOptions);
}

export default docxtemplater_image_module;
