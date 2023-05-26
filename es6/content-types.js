const mainContentType =
	"application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml";
const headerContentType =
	"application/vnd.openxmlformats-officedocument.wordprocessingml.header+xml";
const footerContentType =
	"application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml";
const slideContentType =
	"application/vnd.openxmlformats-officedocument.presentationml.slide+xml";
const mainWithMacroContentType =
	"application/vnd.ms-word.document.macroEnabled.main+xml";
const mainTemplateContentType =
	"application/vnd.openxmlformats-officedocument.wordprocessingml.template.main+xml";
const mainTemplateWithMacroContentType =
	"application/vnd.ms-word.template.macroEnabledTemplate.main+xml";
module.exports = {
	mainContentType,
	headerContentType,
	footerContentType,
	slideContentType,
	mainWithMacroContentType,
	mainTemplateContentType,
	mainTemplateWithMacroContentType,
	main: [
		mainContentType,
		mainWithMacroContentType,
		mainTemplateContentType,
		mainTemplateWithMacroContentType,
	],
};
