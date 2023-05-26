function isStartingTag(p, tag) {
	return ["start", "selfclosing"].indexOf(p.position) !== -1 && p.tag === tag;
}

function isEndingTag(p, tag) {
	return ["end"].indexOf(p.position) !== -1 && p.tag === tag;
}

module.exports = {
	isStartingTag,
	isEndingTag,
};
