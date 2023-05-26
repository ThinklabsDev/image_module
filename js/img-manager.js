"use strict";

module.exports = function (relM) {
  relM.getImageName = function (extension, id) {
    id = id || 0;
    var nameCandidate = "Copie_".concat(id, ".").concat(extension);
    if (relM.hasImage(relM.getFullPath(nameCandidate))) {
      return relM.getImageName(extension, id + 1);
    }
    return nameCandidate;
  };
  relM.getFullPath = function (imgName) {
    return "".concat(relM.ftprefix, "/media/").concat(imgName);
  };
  relM.hasImage = function (fileName) {
    return relM.zip.files[fileName] != null;
  };
  relM.addImage = function (imageData, extension, zipOptions) {
    var imageName = relM.getImageName(extension);
    var fileName = relM.getFullPath(imageName);
    relM.zip.file(fileName, imageData, zipOptions);
    relM.addExtensionRels("image/".concat(extension), extension);
    var absoluteTarget = "".concat(relM.fileType === "pptx" ? "/ppt" : "/word", "/media/").concat(imageName);
    relM.addOverride("image/".concat(extension), absoluteTarget);
    var target = "".concat(relM.fileType === "pptx" ? "../" : "", "media/").concat(imageName);
    return relM.addRelationship({
      Type: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/image",
      Target: target
    });
  };
  relM.getImageByRid = function (rId) {
    var relationships = relM.relsDoc.getElementsByTagName("Relationship");
    for (var i = 0, relationship; i < relationships.length; i++) {
      relationship = relationships[i];
      var cRId = relationship.getAttribute("Id");
      if (rId === cRId) {
        var path = relationship.getAttribute("Target");
        if (path.toLowerCase() === "null") {
          return null;
        }
        if (path[0] === "/") {
          return path.substr(1);
        }
        if (path.substr(0, 6) === "media/") {
          return "".concat(relM.ftprefix, "/").concat(path);
        }
        if (path.substr(0, 9) === "../media/") {
          return "".concat(relM.ftprefix, "/").concat(path.replace("../", ""));
        }
        var _err = new Error("Rid ".concat(rId, " is not an image"));
        _err.properties = {
          rId: rId
        };
        throw _err;
      }
    }
    var err = new Error("No Media with relM Rid (".concat(rId, ") found"));
    err.properties = {
      rId: rId
    };
    throw err;
  };
};