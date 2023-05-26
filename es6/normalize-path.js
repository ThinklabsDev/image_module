module.exports = function normalizePath(path, relativeTo) {
	if (path.length > 0 && path[0] === "/") {
		return path;
	}
	const newPath = relativeTo.replace(/\/_rels\/.*/, "").split("/");
	path.split("/").forEach(function (part) {
		if (part === "..") {
			newPath.pop();
		} else {
			newPath.push(part);
		}
	});
	if (newPath[0] !== "") {
		newPath.unshift("");
	}
	return newPath.join("/");
};
