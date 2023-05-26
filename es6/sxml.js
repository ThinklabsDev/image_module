const { setSingleAttribute, getSingleAttribute } = require("./attributes.js");
const pushArray = require("./push-array.js");

function canonicalizeState(state) {
	if (state.xml) {
		return state;
	}
	if (state instanceof Array) {
		return {
			xml: state,
			index: [0, state.length],
		};
	}
}

function findParent(state, tagName) {
	state = canonicalizeState(state);
	let leftIndex = -1;
	let rightIndex = -1;
	for (let i = state.index[0]; i >= 0; i--) {
		if (state.xml[i].tag === tagName && state.xml[i].position === "start") {
			leftIndex = i;
			break;
		}
	}
	for (let i = state.index[1]; i < state.xml.length; i++) {
		if (state.xml[i].tag === tagName && state.xml[i].position === "end") {
			rightIndex = i;
			break;
		}
	}
	if (leftIndex === -1 || rightIndex === -1) {
		return null;
	}
	return {
		xml: state.xml,
		index: [leftIndex, rightIndex],
	};
}

function getAttribute(state, attribute) {
	state = canonicalizeState(state);
	return getSingleAttribute(state.xml[state.index[0]].value, attribute);
}

// eslint-disable-next-line complexity
function findChilds(state, tagName, first = false) {
	state = canonicalizeState(state);
	if (tagName instanceof Array) {
		let childs = [state];
		tagName.forEach(function (tagName) {
			const subchilds = childs.map(function (child) {
				return findChilds(child, tagName);
			});
			childs = [];
			subchilds.forEach(function (subchild) {
				pushArray(childs, subchild);
			});
		});
		if (first) {
			return childs[0];
		}
		return childs;
	}
	const childs = [];
	let startChild = null;
	for (let i = state.index[0], len = state.index[1]; i < len; i++) {
		const part = state.xml[i];
		if (part.tag === tagName && part.position === "start") {
			startChild = i;
		}
		if (part.tag === tagName && part.position === "end") {
			childs.push({
				xml: state.xml,
				index: [startChild, i],
			});
			if (first) {
				return childs[0];
			}
		}
		if (part.tag === tagName && part.position === "selfclosing") {
			childs.push({
				xml: state.xml,
				index: [i, i],
			});
			if (first) {
				return childs[0];
			}
		}
	}
	if (first) {
		return null;
	}
	return childs;
}

/* eslint-disable-next-line complexity */
function findDirectChilds(state, tagName, first = false) {
	state = canonicalizeState(state);
	const childs = [];
	let startChild = null;
	let level = 0;
	for (let i = state.index[0], len = state.index[1]; i < len; i++) {
		const part = state.xml[i];
		if (part.position === "start" || part.position === "selfclosing") {
			level++;
		}
		if (level === 2 && part.tag === tagName) {
			if (part.position === "start") {
				startChild = i;
			}
			if (part.position === "end") {
				childs.push({
					xml: state.xml,
					index: [startChild, i],
				});
				if (first) {
					return childs[0];
				}
			}
			if (part.position === "selfclosing") {
				childs.push({
					xml: state.xml,
					index: [i, i],
				});
				if (first) {
					return childs[0];
				}
			}
		}
		if (part.position === "end" || part.position === "selfclosing") {
			level--;
		}
	}
	if (first) {
		return null;
	}
	return childs;
}

function firstDirectChild(state, tagName) {
	return findDirectChilds(state, tagName, true);
}

function firstDirectChildOrCreate(state, tagName) {
	let tag = firstDirectChild(state, tagName);
	if (tag === null) {
		appendChild(state, [selfClosing(tagName)]);
		tag = firstDirectChild(state, tagName);
	}
	return tag;
}

function firstChild(state, tagName) {
	return findChilds(state, tagName, true);
}

function getContent(state) {
	let content = "";
	for (let i = state.index[0] + 1, len = state.index[1]; i < len; i++) {
		const part = state.xml[i];
		if (part.type === "content") {
			content += part.value;
		}
	}
	return content;
}

function dropChildren(state) {
	state.xml.splice(state.index[0] + 1, state.index[1] - 1 - state.index[0]);
	state.index[1] = state.index[0] + 1;
}

function dropSelf(state) {
	state.xml.splice(state.index[0], state.index[1] + 1 - state.index[0]);
	state.index[1] = state.index[0] - 1;
}

function selfClosing(name) {
	return {
		type: "tag",
		value: `<${name}/>`,
		position: "selfclosing",
		tag: name,
	};
}

function create(tagName, attributes, child) {
	let startValue = `<${tagName}>`;
	Object.keys(attributes).forEach(function (attribute) {
		startValue = setSingleAttribute(
			startValue,
			attribute,
			attributes[attribute]
		);
	});

	let childXml = [];

	if (child != null && typeof child === "object") {
		childXml = child.xml;
	}
	if (typeof child === "string") {
		childXml = [
			{
				type: "content",
				value: child,
			},
		];
	}
	if (typeof child === "number") {
		childXml = [
			{
				type: "content",
				value: child.toString(),
			},
		];
	}

	return canonicalizeState(
		[
			{
				type: "tag",
				position: "start",
				value: startValue,
				tag: tagName,
			},
		]
			.concat(childXml)
			.concat([
				{
					type: "tag",
					position: "end",
					tag: tagName,
					value: `</${tagName}>`,
				},
			])
	);
}

function appendChild(parent, child) {
	parent = canonicalizeState(parent);
	child = canonicalizeState(child);
	const firstIndex = parent.index[0];
	let selfclosing = false;
	const tag = parent.xml[firstIndex].tag;
	const val = parent.xml[firstIndex].value;
	if (parent.xml[firstIndex].position === "selfclosing") {
		selfclosing = true;
		const lastChar = val[val.length - 1];
		if (lastChar === ">" && val[val.length - 2] === "/") {
			parent.xml[firstIndex].position = "start";
			parent.xml[firstIndex].value =
				parent.xml[firstIndex].value.substr(0, val.length - 2) + ">";
		}
		parent.index[1]++;
	}
	const length = child.xml.length;
	parent.xml.splice(
		parent.index[1],
		0,
		...child.xml,
		...(selfclosing
			? [
					{
						value: `</${tag}>`,
						type: "tag",
						position: "end",
						tag,
					},
			  ]
			: [])
	);
	parent.index[1] += length;
	return parent;
}

function getIndent(indent) {
	let str = "";
	for (let i = 0, len = indent; i < len; i++) {
		str += "  ";
	}
	return str;
}

function xml2string(state) {
	let str = "";
	state = canonicalizeState(state);
	let indent = 0;
	if (state.index[0] === -1) {
		throw new Error("Invalid state");
	}
	for (let i = state.index[0]; i < state.index[1]; i++) {
		const part = state.xml[i];
		if (part.position === "end") {
			indent--;
		}
		str += getIndent(indent);
		if (part.type === "delimiter") {
			switch (part.position) {
				case "start":
					str += "{";
					break;
				case "end":
					str += "}";
					break;
			}
		} else if (part.module) {
			str += `[[${part.module.toUpperCase()}:${part.value}]]`;
		} else {
			str += part.value;
		}
		str += "\n";
		if (part.position === "start") {
			indent++;
		}
	}
	return str;
}

module.exports = {
	getAttribute,
	findParent,
	findChilds,
	xml2string,
	create,
	appendChild,
	firstChild,
	firstDirectChild,
	firstDirectChildOrCreate,
	findDirectChilds,
	getContent,
	dropChildren,
	dropSelf,
	selfClosing,
};
