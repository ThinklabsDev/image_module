function getAttribute(parsed, tagname, attr) {
	let result = null;
	const regex = new RegExp(`<.*${attr}="([^"]*)".*$`);
	parsed.some(function (p) {
		if (
			p.type === "tag" &&
			p.value.indexOf(`<${tagname} `) !== -1 &&
			regex.test(p.value)
		) {
			result = p.value.replace(regex, "$1");
			return true;
		}
		return false;
	});
	if (!result) {
		return null;
	}
	return result;
}

function getAttributes(parsed, tagname, attr) {
	const result = [];
	const regex = new RegExp(`<.*${attr}="([^"]*)".*$`);
	parsed.forEach(function (p) {
		if (
			p.type === "tag" &&
			p.value.indexOf(`<${tagname} `) !== -1 &&
			regex.test(p.value)
		) {
			result.push(p.value.replace(regex, "$1"));
		}
	});
	return result;
}

function removeSingleAttribute(partValue, attr) {
	const regex = new RegExp(`(<.*) ${attr}="[^"]*"(.*)$`);
	if (regex.test(partValue)) {
		return partValue.replace(regex, "$1$2");
	}
	return partValue;
}

function setSingleAttribute(partValue, attr, attrValue) {
	const regex = new RegExp(`(<.* ${attr}=")([^"]*)(".*)$`);
	if (regex.test(partValue)) {
		return partValue.replace(regex, `$1${attrValue}$3`);
	}
	let end = partValue.lastIndexOf("/>");
	if (end === -1) {
		end = partValue.lastIndexOf(">");
	}
	return (
		partValue.substr(0, end) + ` ${attr}="${attrValue}"` + partValue.substr(end)
	);
}

function setAttribute(parsed, tagname, attr, value) {
	const regex = new RegExp(`(<.* ${attr}=")([^"]+)(".*)$`);
	const found = parsed.some(function (p) {
		if (p.type === "tag" && p.value.indexOf("<" + tagname) !== -1) {
			if (regex.test(p.value)) {
				p.value = p.value.replace(regex, `$1${value}$3`);
			} else {
				let end = p.value.lastIndexOf("/>");
				if (end === -1) {
					end = p.value.lastIndexOf(">");
				}
				p.value =
					p.value.substr(0, end) + ` ${attr}="${value}"` + p.value.substr(end);
			}
			return true;
		}
		return false;
	});
	if (!found) {
		const err = new Error("Attribute not found");
		err.properties = {
			parsed,
			tagname,
			attr,
		};
		throw err;
	}
	return parsed;
}

function getSingleAttribute(value, attributeName) {
	const index = value.indexOf(`${attributeName}="`);
	if (index === -1) {
		return null;
	}
	const startIndex = value.substr(index).search(/["']/) + index;
	const endIndex = value.substr(startIndex + 1).search(/["']/) + startIndex;
	return value.substr(startIndex + 1, endIndex - startIndex);
}

module.exports = {
	getAttribute,
	getAttributes,
	getSingleAttribute,
	setAttribute,
	setSingleAttribute,
	removeSingleAttribute,
};
