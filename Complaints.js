(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require(undefined));
	else if(typeof define === 'function' && define.amd)
		define(["jQuery"], factory);
	else if(typeof exports === 'object')
		exports["Complaints"] = factory(require(undefined));
	else
		root["Complaints"] = factory(root["$"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_0__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 4);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_0__;

/***/ }),
/* 1 */
/***/ (function(module, exports) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
// css base code, injected by the css-loader
module.exports = function () {
	var list = [];

	// return the list of modules as css string
	list.toString = function toString() {
		var result = [];
		for (var i = 0; i < this.length; i++) {
			var item = this[i];
			if (item[2]) {
				result.push("@media " + item[2] + "{" + item[1] + "}");
			} else {
				result.push(item[1]);
			}
		}
		return result.join("");
	};

	// import a list of modules into the list
	list.i = function (modules, mediaQuery) {
		if (typeof modules === "string") modules = [[null, modules, ""]];
		var alreadyImportedModules = {};
		for (var i = 0; i < this.length; i++) {
			var id = this[i][0];
			if (typeof id === "number") alreadyImportedModules[id] = true;
		}
		for (i = 0; i < modules.length; i++) {
			var item = modules[i];
			// skip already imported module
			// this implementation is not 100% perfect for weird media query combinations
			//  when a module is imported multiple times with different media queries.
			//  I hope this will never occur (Hey this way we have smaller bundles)
			if (typeof item[0] !== "number" || !alreadyImportedModules[item[0]]) {
				if (mediaQuery && !item[2]) {
					item[2] = mediaQuery;
				} else if (mediaQuery) {
					item[2] = "(" + item[2] + ") and (" + mediaQuery + ")";
				}
				list.push(item);
			}
		}
	};
	return list;
};

/***/ }),
/* 2 */
/***/ (function(module, exports) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
var stylesInDom = {},
	memoize = function(fn) {
		var memo;
		return function () {
			if (typeof memo === "undefined") memo = fn.apply(this, arguments);
			return memo;
		};
	},
	isOldIE = memoize(function() {
		return /msie [6-9]\b/.test(self.navigator.userAgent.toLowerCase());
	}),
	getHeadElement = memoize(function () {
		return document.head || document.getElementsByTagName("head")[0];
	}),
	singletonElement = null,
	singletonCounter = 0,
	styleElementsInsertedAtTop = [];

module.exports = function(list, options) {
	if(typeof DEBUG !== "undefined" && DEBUG) {
		if(typeof document !== "object") throw new Error("The style-loader cannot be used in a non-browser environment");
	}

	options = options || {};
	// Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
	// tags it will allow on a page
	if (typeof options.singleton === "undefined") options.singleton = isOldIE();

	// By default, add <style> tags to the bottom of <head>.
	if (typeof options.insertAt === "undefined") options.insertAt = "bottom";

	var styles = listToStyles(list);
	addStylesToDom(styles, options);

	return function update(newList) {
		var mayRemove = [];
		for(var i = 0; i < styles.length; i++) {
			var item = styles[i];
			var domStyle = stylesInDom[item.id];
			domStyle.refs--;
			mayRemove.push(domStyle);
		}
		if(newList) {
			var newStyles = listToStyles(newList);
			addStylesToDom(newStyles, options);
		}
		for(var i = 0; i < mayRemove.length; i++) {
			var domStyle = mayRemove[i];
			if(domStyle.refs === 0) {
				for(var j = 0; j < domStyle.parts.length; j++)
					domStyle.parts[j]();
				delete stylesInDom[domStyle.id];
			}
		}
	};
}

function addStylesToDom(styles, options) {
	for(var i = 0; i < styles.length; i++) {
		var item = styles[i];
		var domStyle = stylesInDom[item.id];
		if(domStyle) {
			domStyle.refs++;
			for(var j = 0; j < domStyle.parts.length; j++) {
				domStyle.parts[j](item.parts[j]);
			}
			for(; j < item.parts.length; j++) {
				domStyle.parts.push(addStyle(item.parts[j], options));
			}
		} else {
			var parts = [];
			for(var j = 0; j < item.parts.length; j++) {
				parts.push(addStyle(item.parts[j], options));
			}
			stylesInDom[item.id] = {id: item.id, refs: 1, parts: parts};
		}
	}
}

function listToStyles(list) {
	var styles = [];
	var newStyles = {};
	for(var i = 0; i < list.length; i++) {
		var item = list[i];
		var id = item[0];
		var css = item[1];
		var media = item[2];
		var sourceMap = item[3];
		var part = {css: css, media: media, sourceMap: sourceMap};
		if(!newStyles[id])
			styles.push(newStyles[id] = {id: id, parts: [part]});
		else
			newStyles[id].parts.push(part);
	}
	return styles;
}

function insertStyleElement(options, styleElement) {
	var head = getHeadElement();
	var lastStyleElementInsertedAtTop = styleElementsInsertedAtTop[styleElementsInsertedAtTop.length - 1];
	if (options.insertAt === "top") {
		if(!lastStyleElementInsertedAtTop) {
			head.insertBefore(styleElement, head.firstChild);
		} else if(lastStyleElementInsertedAtTop.nextSibling) {
			head.insertBefore(styleElement, lastStyleElementInsertedAtTop.nextSibling);
		} else {
			head.appendChild(styleElement);
		}
		styleElementsInsertedAtTop.push(styleElement);
	} else if (options.insertAt === "bottom") {
		head.appendChild(styleElement);
	} else {
		throw new Error("Invalid value for parameter 'insertAt'. Must be 'top' or 'bottom'.");
	}
}

function removeStyleElement(styleElement) {
	styleElement.parentNode.removeChild(styleElement);
	var idx = styleElementsInsertedAtTop.indexOf(styleElement);
	if(idx >= 0) {
		styleElementsInsertedAtTop.splice(idx, 1);
	}
}

function createStyleElement(options) {
	var styleElement = document.createElement("style");
	styleElement.type = "text/css";
	insertStyleElement(options, styleElement);
	return styleElement;
}

function createLinkElement(options) {
	var linkElement = document.createElement("link");
	linkElement.rel = "stylesheet";
	insertStyleElement(options, linkElement);
	return linkElement;
}

function addStyle(obj, options) {
	var styleElement, update, remove;

	if (options.singleton) {
		var styleIndex = singletonCounter++;
		styleElement = singletonElement || (singletonElement = createStyleElement(options));
		update = applyToSingletonTag.bind(null, styleElement, styleIndex, false);
		remove = applyToSingletonTag.bind(null, styleElement, styleIndex, true);
	} else if(obj.sourceMap &&
		typeof URL === "function" &&
		typeof URL.createObjectURL === "function" &&
		typeof URL.revokeObjectURL === "function" &&
		typeof Blob === "function" &&
		typeof btoa === "function") {
		styleElement = createLinkElement(options);
		update = updateLink.bind(null, styleElement);
		remove = function() {
			removeStyleElement(styleElement);
			if(styleElement.href)
				URL.revokeObjectURL(styleElement.href);
		};
	} else {
		styleElement = createStyleElement(options);
		update = applyToTag.bind(null, styleElement);
		remove = function() {
			removeStyleElement(styleElement);
		};
	}

	update(obj);

	return function updateStyle(newObj) {
		if(newObj) {
			if(newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap)
				return;
			update(obj = newObj);
		} else {
			remove();
		}
	};
}

var replaceText = (function () {
	var textStore = [];

	return function (index, replacement) {
		textStore[index] = replacement;
		return textStore.filter(Boolean).join('\n');
	};
})();

function applyToSingletonTag(styleElement, index, remove, obj) {
	var css = remove ? "" : obj.css;

	if (styleElement.styleSheet) {
		styleElement.styleSheet.cssText = replaceText(index, css);
	} else {
		var cssNode = document.createTextNode(css);
		var childNodes = styleElement.childNodes;
		if (childNodes[index]) styleElement.removeChild(childNodes[index]);
		if (childNodes.length) {
			styleElement.insertBefore(cssNode, childNodes[index]);
		} else {
			styleElement.appendChild(cssNode);
		}
	}
}

function applyToTag(styleElement, obj) {
	var css = obj.css;
	var media = obj.media;

	if(media) {
		styleElement.setAttribute("media", media)
	}

	if(styleElement.styleSheet) {
		styleElement.styleSheet.cssText = css;
	} else {
		while(styleElement.firstChild) {
			styleElement.removeChild(styleElement.firstChild);
		}
		styleElement.appendChild(document.createTextNode(css));
	}
}

function updateLink(linkElement, obj) {
	var css = obj.css;
	var sourceMap = obj.sourceMap;

	if(sourceMap) {
		// http://stackoverflow.com/a/26603875
		css += "\n/*# sourceMappingURL=data:application/json;base64," + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + " */";
	}

	var blob = new Blob([css], { type: "text/css" });

	var oldSrc = linkElement.href;

	linkElement.href = URL.createObjectURL(blob);

	if(oldSrc)
		URL.revokeObjectURL(oldSrc);
}


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(7);
if(typeof content === 'string') content = [[module.i, content, '']];
// add the styles to the DOM
var update = __webpack_require__(2)(content, {});
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../../node_modules/css-loader/index.js!../../node_modules/less-loader/index.js!./Complaints.less", function() {
			var newContent = require("!!../../node_modules/css-loader/index.js!../../node_modules/less-loader/index.js!./Complaints.less");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),
/* 4 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_jquery__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_jquery___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_jquery__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__less_Complaints_less__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__less_Complaints_less___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1__less_Complaints_less__);
var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }




var i18n = {
    en: {
        title: 'Complaint sending',
        cancel: 'Cancel',
        submit: 'Send',
        UNKNOWN_LANGUAGE: 'Unknown language',
        TECHNICAL_ERROR: 'Technical error',
        PORN: 'Porn',
        WRONG_ANNOTATION: 'Wrong annotation',
        OUT_OF_COMPETENCE: 'Out of competence',
        OTHER: 'Other',
        cause_is_required: 'Cause is required',
        cause_is_not_found: 'Cause was not found',
        comment_is_required: 'Comment is required',
        comment: 'Comment',
        error_while_sending_complaint: 'Error. Please try again later.',
        title_completed: 'Message',
        text_completed: 'Complaint was successfully send, thank you.',
        close: 'Close'
    },
    ru: {
        title: 'РћС‚РїСЂР°РІРєР° Р¶Р°Р»РѕР±С‹',
        cancel: 'РћС‚РјРµРЅР°',
        submit: 'РћС‚РїСЂР°РІРёС‚СЊ',
        UNKNOWN_LANGUAGE: 'РќРµР·РЅР°РєРѕРјС‹Р№ СЏР·С‹Рє',
        TECHNICAL_ERROR: 'РўРµС…РЅРёС‡РµСЃРєР°СЏ РѕС€РёР±РєР°',
        PORN: 'РџРѕСЂРЅРѕ',
        WRONG_ANNOTATION: 'РћР±РЅРѕРІРёС‚СЊ Р°РЅРЅРѕС‚Р°С†РёСЋ',
        OUT_OF_COMPETENCE: 'РќРµРґРѕСЃС‚Р°С‚РѕС‡РЅРѕ РєРѕРјРїРµС‚РµРЅС†РёРё',
        OTHER: 'Р”СЂСѓРіРѕРµ',
        cause_is_required: 'РџСЂРёС‡РёРЅР° РѕР±СЏР·Р°С‚РµР»СЊРЅР° РґР»СЏ Р·Р°РїРѕР»РЅРµРЅРёСЏ',
        cause_is_not_found: 'РџСЂРёС‡РёРЅР° РЅРµ РЅР°Р№РґРµРЅР°',
        comment_is_required: 'РљРѕРјРјРµРЅС‚Р°СЂРёР№ РѕР±СЏР·Р°С‚РµР»РµРЅ РґР»СЏ Р·Р°РїРѕР»РЅРµРЅРёСЏ',
        comment: 'РљРѕРјРјРµРЅС‚Р°СЂРёР№',
        error_while_sending_complaint: 'РћС€РёР±РєР°. РџРѕР¶Р°Р»СѓР№СЃС‚Р° РїРѕРїСЂРѕР±СѓР№С‚Рµ РїРѕР·Р¶Рµ.',
        title_completed: 'РЎРѕРѕР±С‰РµРЅРёРµ',
        complaint_send: 'Р–Р°Р»РѕР±Р° РЅР° Р·Р°РґР°РЅРёРµ РѕС‚РїСЂР°РІР»РµРЅР°, СЃРїР°СЃРёР±Рѕ.',
        close: 'Р—Р°РєСЂС‹С‚СЊ'
    }
};

var translate = void 0,
    causes = [{
    "name": "UNKNOWN_LANGUAGE",
    "commentRequired": false
}, {
    "name": "TECHNICAL_ERROR",
    "commentRequired": true
}, {
    "name": "PORN",
    "commentRequired": false
}, {
    "name": "WRONG_ANNOTATION",
    "commentRequired": true
}, {
    "name": "OUT_OF_COMPETENCE",
    "commentRequired": true
}, {
    "name": "OTHER",
    "commentRequired": true
}],
    initialized = false;

function translateFactory() {
    var language = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'en';

    if (!i18n[language]) {
        throw 'Undefined language "' + language + '"';
    }
    return function (code) {
        return i18n[language][code] || code;
    };
}

function render(markup, data) {
    return markup.replace(/#\{([a-zA-Z0-9._]*)\}/g, function (match, fields) {
        var value = data;
        fields.split('.').forEach(function (field) {
            return value = value[field];
        });
        return value;
    });
}

// Cached regex to split keys for `delegate`.
var delegateEventSplitter = /^(\S+)\s*(.*)$/;

var ComplaintDTO = function () {
    function ComplaintDTO(_ref) {
        var namespace = _ref.namespace;

        _classCallCheck(this, ComplaintDTO);

        this._data = {
            client: 'yang',
            complaints: [{
                namespace: namespace,
                login: '',
                timestampUtc: Math.floor(Date.now() / 1000)
            }]
        };
    }

    _createClass(ComplaintDTO, [{
        key: 'getData',
        value: function getData() {
            return this._data;
        }
    }, {
        key: 'setCause',
        value: function setCause(cause) {
            this._data.complaints[0]['cause'] = cause;
            return this;
        }
    }, {
        key: 'setComment',
        value: function setComment(comment) {
            this._data.complaints[0]['comment'] = comment;
            return this;
        }
    }, {
        key: 'setMetaData',
        value: function setMetaData(metaData) {
            this._data.complaints[0]['metaData'] = metaData;
            return this;
        }
    }, {
        key: 'setRequestId',
        value: function setRequestId(requestId) {
            this._data['requestId'] = requestId;
        }
    }, {
        key: 'validate',
        value: function validate() {
            var _this = this;

            if (this._data.complaints[0]['comment']) return;
            if (!this._data.complaints[0]['cause']) return translate('cause_is_required');
            var foundCause = causes.find(function (cause) {
                return cause.name === _this._data.complaints[0]['cause'];
            });
            if (!foundCause) return translate('cause_is_not_found');
            if (foundCause.commentRequired) return translate('comment_is_required');
        }
    }]);

    return ComplaintDTO;
}();

var html = {
    popup: '\n<div class="modal-popup__frame modal-popup__frame_shown" id="complaints_base_h39sk">\n<div class="modal-popup complaint-popup">\n    <div class="modal-popup__header">#{title}</div>\n    <div class="alert alert_size_M alert_type_crit alert_position_static">\n        <div class="alert__content"></div>\n    </div>\n    <div class="modal-popup__body" style="max-height: 1181px;">\n        <span class="btn select-wrap">\n            <select class="select"></select>\n            <span class="select-focus"></span>\n        </span>\n        <textarea placeholder="#{comment}" rows="3" class="small-input comment" name="comment"></textarea>\n    </div>\n    <div class="modal-popup__footer">\n        <span class="link js-close">#{cancel}</span>\n        <button class="btn active js-submit"><span class="button__label">#{submit}</span></button>\n    </div>\n</div>\n</div>\n',
    option: '<option value="#{name}">#{label}</option>',
    completePopup: '\n<div class="modal-popup__frame modal-popup__frame_shown" id="complaints_base_h39sk">\n<div class="modal-popup complaint-popup">\n    <div class="modal-popup__header">#{title_completed}</div>\n    <div class="modal-popup__body">\n        #{complaint_send}\n    </div>\n    <div class="modal-popup__footer">\n        <span class="link js-close">#{close}</span>\n    </div>\n</div>\n</div>\n'
};

var Complaints = {

    events: {
        'click .js-close': 'close',
        'click .js-submit': 'submit'
    },

    uiSelectors: {
        select: '.select',
        comment: '.comment',
        alertContent: '.alert__content',
        alertBox: '.alert'
    },

    ui: {},

    initialize: function initialize(options) {
        this._complaintDto = new ComplaintDTO({
            namespace: options.namespace
        });
        this._setAPIUrl(options.api);
        this.language = options.language || 'ru';
        translate = translateFactory(options.language);
        initialized = true;
        this.ajax = options.ajax;
        if (!this.ajax) {
            throw 'ajax url is undefined.';
        }
    },
    open: function open(taskData, assignmentId) {
        if (!initialized) {
            throw 'Init Complaint first before open a popup.';
        }
        if (this.$el) {
            this.$el.remove();
            this._undelegateEvents();
        }
        this.$el = __WEBPACK_IMPORTED_MODULE_0_jquery___default()(render(html.popup, i18n[this.language]));
        this._ensureUi();

        this._fetchCauses().then(function () {
            var _this2 = this;

            __WEBPACK_IMPORTED_MODULE_0_jquery___default()('body').append(this.$el);
            this.ui.select.empty();
            causes.forEach(function (cause) {
                cause.label = translate(cause.name);
                _this2.ui.select.append(render(html.option, cause));
            });
            this._delegateEvents();

            this._complaintDto.setMetaData(taskData);
            this._complaintDto.setRequestId(assignmentId + '_' + +new Date());
        }.bind(this)).catch(function (error) {
            console.error('Error while fetch complaints.', error);
        });
    },
    submit: function submit() {
        var _this3 = this;

        this._complaintDto.setCause(this.ui.select.val()).setComment(this.ui.comment.val());
        var error = this._complaintDto.validate();
        if (error) {
            this._showError(error);
            return;
        }
        this._hideError();
        this.ajax({
            method: 'POST',
            dataType: 'json',
            contentType: 'application/json',
            data: JSON.stringify(this._complaintDto.getData()),
            url: this.url
        }).then(function () {
            _this3.close();
            _this3.showCompletePopup();
        }).catch(function () {
            _this3._showError(translate('error_while_sending_complaint'));
        });
    },
    close: function close() {
        this._undelegateEvents();
        this.$el.remove();
    },
    showCompletePopup: function showCompletePopup() {
        this.$el = __WEBPACK_IMPORTED_MODULE_0_jquery___default()(render(html.completePopup, i18n[this.language]));
        __WEBPACK_IMPORTED_MODULE_0_jquery___default()('body').append(this.$el);
        this._delegateEvents();
    },
    _setAPIUrl: function _setAPIUrl(apiOptions) {
        if (apiOptions.url) {
            this.url = apiOptions.url.replace('${assignmentId}', apiOptions.assignmentId || '');
            return;
        }
        this.url = apiOptions.origin + '/api/proxy/ya_requester_sportloto/v0/complaint/submit?assignmentId=' + encodeURIComponent(apiOptions.assignmentId);
    },
    _fetchCauses: function _fetchCauses() {
        if (causes) return Promise.resolve(causes);

        return Promise.resolve(__WEBPACK_IMPORTED_MODULE_0_jquery___default.a.ajax({
            url: '/front/complaint/causes'
        })).then(function (data) {
            causes = data;
        }, function () {
            console.error('Unable to fetch complaints');
        });
    },
    _ensureUi: function _ensureUi() {
        for (var name in this.uiSelectors) {
            if (!this.uiSelectors.hasOwnProperty(name)) continue;
            this.ui[name] = this.$el.find(this.uiSelectors[name]);
        }
    },
    _showError: function _showError(error) {
        console.log('error', error);
        this.ui.alertContent.empty().text(error);
        this.ui.alertBox.show();
    },
    _hideError: function _hideError() {
        this.ui.alertBox.hide();
    },


    // Stole from Backbone
    _delegateEvents: function _delegateEvents() {
        if (!this.events) return this;
        this._undelegateEvents();
        for (var key in this.events) {
            var method = this.events[key];
            if (!__WEBPACK_IMPORTED_MODULE_0_jquery___default.a.isFunction(method)) method = this[this.events[key]];
            if (!method) continue;

            var match = key.match(delegateEventSplitter);
            var eventName = match[1],
                selector = match[2];
            method = method.bind(this);
            eventName += '.delegateEvents' + this.cid;
            if (selector === '') {
                this.$el.on(eventName, method);
            } else {
                this.$el.on(eventName, selector, method);
            }
        }
    },
    _undelegateEvents: function _undelegateEvents() {
        this.$el.off('.delegateEvents' + this.cid);
    }
};

/* harmony default export */ __webpack_exports__["default"] = (Complaints);

/***/ }),
/* 5 */,
/* 6 */,
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(1)();
// imports


// module
exports.push([module.i, "#complaints_base_h39sk {\n  margin: 0;\n  padding: 0;\n  border: 0;\n  vertical-align: baseline;\n  font-size: 15px;\n  line-height: 22px;\n  font-family: Arial, sans-serif;\n  color: #000;\n}\n#complaints_base_h39sk .btn,\n#complaints_base_h39sk .btn.active {\n  padding: 0;\n  margin: 0;\n  border: none;\n  background: transparent;\n  -moz-appearance: none;\n  font: inherit;\n}\n#complaints_base_h39sk .btn::-moz-focus-inner,\n#complaints_base_h39sk .btn.active::-moz-focus-inner {\n  padding: 0;\n  border: none;\n}\n#complaints_base_h39sk .small-input {\n  padding: 0;\n  margin: 0;\n  border: none;\n  background: transparent;\n  font: inherit;\n}\n#complaints_base_h39sk .small-input:focus {\n  outline: none;\n}\n#complaints_base_h39sk .select-wrap:after {\n  position: relative;\n  display: inline-block;\n  vertical-align: middle;\n  margin-top: -0.2em;\n  background: 50% no-repeat;\n}\n#complaints_base_h39sk .btn {\n  position: relative;\n  vertical-align: baseline;\n  user-select: none;\n  color: #000;\n  border-radius: 3px;\n  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.07);\n  font-size: 15px;\n  line-height: 22px;\n  padding: 5px 15px;\n  background: rgba(0, 0, 0, 0.3);\n  background: linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.4));\n}\n#complaints_base_h39sk .btn,\n#complaints_base_h39sk .btn.active {\n  display: inline-block;\n  white-space: nowrap;\n  text-decoration: none;\n  box-sizing: border-box;\n  cursor: pointer;\n  user-select: none;\n  vertical-align: baseline;\n}\n#complaints_base_h39sk .btn:before {\n  content: \"\";\n  position: absolute;\n  top: 1px;\n  right: 1px;\n  bottom: 1px;\n  left: 1px;\n  border-radius: 2px;\n}\n#complaints_base_h39sk .btn .button-content {\n  position: relative;\n  display: block;\n}\n#complaints_base_h39sk input[type=file]:active + .btn,\n#complaints_base_h39sk .btn:active {\n  box-shadow: inset 0 2px 1px -1px rgba(0, 0, 0, 0.4), 0 1px 0 rgba(255, 255, 255, 0.2);\n}\n#complaints_base_h39sk input[type=file]:active + .btn:before,\n#complaints_base_h39sk .btn:active:before {\n  box-shadow: inset 0 1px 3px -1px rgba(0, 0, 0, 0.5);\n}\n#complaints_base_h39sk input[type=file]:active + .btn .button-content,\n#complaints_base_h39sk .btn:active .button-content {\n  top: 1px;\n}\n#complaints_base_h39sk .btn:after {\n  content: \"\";\n  position: absolute;\n  top: 0;\n  right: 0;\n  bottom: 0;\n  left: 0;\n}\n#complaints_base_h39sk input[type=file]:focus + .btn,\n#complaints_base_h39sk .btn:focus {\n  outline: 0;\n}\n#complaints_base_h39sk input[type=file]:focus + .btn:after,\n#complaints_base_h39sk .btn:focus:after {\n  z-index: 9;\n  box-shadow: 0 0 6px 2px rgba(255, 204, 0, 0.7), inset 0 0 0 1px rgba(193, 154, 0, 0.2);\n  border-radius: inherit;\n}\n#complaints_base_h39sk .btn:before {\n  background: #f7f7f7;\n  background: linear-gradient(#fff, #eee);\n}\n#complaints_base_h39sk input[type=file]:hover + .btn,\n#complaints_base_h39sk .btn:hover {\n  background: rgba(0, 0, 0, 0.31);\n  background: linear-gradient(rgba(0, 0, 0, 0.22), rgba(0, 0, 0, 0.4));\n}\n#complaints_base_h39sk input[type=file]:hover + .btn:before,\n#complaints_base_h39sk .btn:hover:before {\n  background: #fbfaf9;\n  background: linear-gradient(#fff, #f6f5f3);\n}\n#complaints_base_h39sk .btn.active {\n  position: relative;\n  vertical-align: baseline;\n  user-select: none;\n  color: #000;\n  border-radius: 3px;\n  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.07);\n  font-size: 15px;\n  line-height: 22px;\n  padding: 5px 15px;\n  background: rgba(83, 56, 0, 0.47);\n  background: linear-gradient(rgba(96, 64, 0, 0.4), rgba(70, 47, 0, 0.54));\n}\n#complaints_base_h39sk .btn.active:before {\n  content: \"\";\n  position: absolute;\n  top: 1px;\n  right: 1px;\n  bottom: 1px;\n  left: 1px;\n  border-radius: 2px;\n}\n#complaints_base_h39sk .btn.active .button-content {\n  position: relative;\n  display: block;\n}\n#complaints_base_h39sk input[type=file]:active + .btn.active,\n#complaints_base_h39sk .btn.active:active {\n  box-shadow: inset 0 2px 1px -1px rgba(0, 0, 0, 0.4), 0 1px 0 rgba(255, 255, 255, 0.2);\n}\n#complaints_base_h39sk input[type=file]:active + .btn.active:before,\n#complaints_base_h39sk .btn.active:active:before {\n  box-shadow: inset 0 1px 3px -1px rgba(0, 0, 0, 0.5);\n}\n#complaints_base_h39sk input[type=file]:active + .btn.active .button-content,\n#complaints_base_h39sk .btn.active:active .button-content {\n  top: 1px;\n}\n#complaints_base_h39sk .btn.active:after {\n  content: \"\";\n  position: absolute;\n  top: 0;\n  right: 0;\n  bottom: 0;\n  left: 0;\n}\n#complaints_base_h39sk input[type=file]:focus + .btn.active,\n#complaints_base_h39sk .btn.active:focus {\n  outline: 0;\n}\n#complaints_base_h39sk input[type=file]:focus + .btn.active:after,\n#complaints_base_h39sk .btn.active:focus:after {\n  z-index: 9;\n  box-shadow: 0 0 6px 2px rgba(255, 204, 0, 0.7), inset 0 0 0 1px rgba(193, 154, 0, 0.2);\n  border-radius: inherit;\n}\n#complaints_base_h39sk .btn.active:before {\n  background: #ffd630;\n  background: linear-gradient(#ffdf60, #fc0);\n}\n#complaints_base_h39sk input[type=file]:hover + .btn.active,\n#complaints_base_h39sk .btn.active:hover {\n  background: rgba(0, 0, 0, 0.31);\n  background: linear-gradient(rgba(0, 0, 0, 0.22), rgba(0, 0, 0, 0.4));\n}\n#complaints_base_h39sk input[type=file]:hover + .btn.active:before,\n#complaints_base_h39sk .btn.active:hover:before {\n  background: #fd5;\n  background: linear-gradient(#ffe681, #ffd428);\n}\n#complaints_base_h39sk .small-input {\n  width: 400px;\n  box-sizing: border-box;\n  border: 1px solid transparent;\n  padding: 5px 10px;\n  line-height: 16px;\n  min-height: 28px;\n  font-size: 13px;\n  border-color: rgba(0, 0, 0, 0.27);\n  border-top-color: rgba(0, 0, 0, 0.38);\n  border-bottom-color: rgba(0, 0, 0, 0.16);\n  background: #fff;\n  background: linear-gradient(#fff, #fff);\n  background-clip: padding-box;\n  background-size: 16px 16px;\n  box-shadow: 0 1px 0 rgba(255, 255, 255, 0.2), inset 0 1px 1px rgba(0, 0, 0, 0.1);\n  -webkit-appearance: none;\n}\n#complaints_base_h39sk .small-input {\n  position: relative;\n  display: inline-block;\n  vertical-align: top;\n  box-sizing: border-box;\n  max-width: 100%;\n  cursor: text;\n  vertical-align: baseline;\n}\n#complaints_base_h39sk .small-input:focus {\n  outline: none;\n  border-color: rgba(94, 76, 2, 0.42);\n  border-top-color: rgba(78, 62, 2, 0.515);\n  border-bottom-color: rgba(117, 93, 0, 0.335);\n  box-shadow: 0 0 6px 2px rgba(255, 204, 0, 0.7), 0 1px 0 rgba(255, 255, 255, 0.2), inset 0 1px 1px rgba(0, 0, 0, 0.1);\n}\n#complaints_base_h39sk .small-input:focus {\n  z-index: 9;\n}\n#complaints_base_h39sk .link {\n  cursor: pointer;\n  color: #22c;\n  text-decoration: none;\n  text-decoration: underline;\n}\n#complaints_base_h39sk .link:hover {\n  color: #d00;\n}\n#complaints_base_h39sk .isle.fly {\n  background: #fff;\n  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.15), 0 8px 30px -5px rgba(0, 0, 0, 0.5);\n}\n#complaints_base_h39sk .select {\n  position: relative;\n  display: block;\n  z-index: 10;\n  -webkit-appearance: none;\n  -moz-appearance: menuitem;\n  -moz-appearance: window;\n  cursor: pointer;\n  width: 100%;\n  border: none;\n  padding: 0;\n  margin: 0;\n  font: inherit;\n  color: inherit;\n  background: transparent;\n  padding: 5px 27px 5px 15px;\n}\n#complaints_base_h39sk .select:focus {\n  outline: none;\n}\n#complaints_base_h39sk .select,\n#complaints_base_h39sk x::-moz-focus-inner {\n  color: transparent;\n  text-shadow: 0 0 0 #000;\n}\n#complaints_base_h39sk .select,\n#complaints_base_h39sk x::-moz-focus-inner {\n  padding: 6px 23px 6px 11px;\n}\n#complaints_base_h39sk .select,\n#complaints_base_h39sk x:-o-prefocus {\n  box-sizing: content-box;\n  margin-right: -15px;\n  padding-top: 7px;\n  padding-bottom: 7px;\n}\n#complaints_base_h39sk .select-wrap {\n  padding: 0;\n}\n#complaints_base_h39sk .select-wrap,\n#complaints_base_h39sk x:-o-prefocus {\n  overflow: hidden;\n  vertical-align: middle;\n}\n#complaints_base_h39sk .select-wrap:after {\n  position: absolute;\n  top: 50%;\n  right: 12px;\n  bottom: auto;\n  left: auto;\n  margin-right: -2px;\n  border-bottom: 2px solid;\n  border-right: 2px solid;\n  margin-top: -0.33em;\n  color: #000;\n  transform: scale(0.75) rotate(45deg);\n}\n#complaints_base_h39sk .select-wrap:after {\n  width: 6px;\n  height: 6px;\n}\n#complaints_base_h39sk select:focus + .select-focus {\n  position: absolute;\n  top: 0;\n  right: 0;\n  bottom: 0;\n  left: 0;\n  z-index: 9;\n  box-shadow: 0 0 6px 2px rgba(255, 204, 0, 0.7), inset 0 0 0 1px rgba(193, 154, 0, 0.2);\n  border-radius: inherit;\n}\n#complaints_base_h39sk.modal-popup__frame.modal-popup__frame_shown {\n  opacity: 1;\n}\n#complaints_base_h39sk .button__label {\n  position: relative;\n}\n#complaints_base_h39sk.modal-popup__frame {\n  position: fixed;\n  left: 0;\n  top: 0;\n  width: 100%;\n  height: 100%;\n  z-index: 10000;\n  opacity: 0;\n  transition: opacity .3s;\n  background: rgba(0, 0, 0, 0.4);\n}\n#complaints_base_h39sk.modal-popup__frame_shown .modal-popup {\n  transform: translateY(-50%);\n  opacity: 1;\n}\n#complaints_base_h39sk .modal-popup {\n  width: 460px;\n  max-width: calc(82%);\n  position: relative;\n  top: 50%;\n  transform: translateY(-400px);\n  opacity: 0;\n  transition: opacity .3s,transform .3s;\n  background-color: #fff;\n  text-align: left;\n  margin: 0 auto;\n  will-change: opacity;\n}\n#complaints_base_h39sk .modal-popup__header {\n  font-size: 17px;\n  overflow: hidden;\n  text-overflow: ellipsis;\n}\n#complaints_base_h39sk .modal-popup__footer,\n#complaints_base_h39sk .modal-popup__header {\n  background-color: #f3f1ed;\n  box-sizing: border-box;\n  white-space: nowrap;\n}\n#complaints_base_h39sk .modal-popup__body,\n#complaints_base_h39sk .modal-popup__footer,\n#complaints_base_h39sk .modal-popup__header {\n  position: relative;\n  box-sizing: border-box;\n  padding: 18px;\n}\n#complaints_base_h39sk .modal-popup__footer {\n  text-align: right;\n}\n#complaints_base_h39sk .modal-popup__footer .btn {\n  margin-left: 20px;\n}\n#complaints_base_h39sk .complaint-popup .alert {\n  display: none;\n}\n#complaints_base_h39sk .alert {\n  background: indianred;\n}\n#complaints_base_h39sk .alert_type_crit .alert__content {\n  color: #fff;\n}\n#complaints_base_h39sk .alert_size_M .alert__content {\n  font-size: 13px;\n  line-height: 18px;\n  padding-right: 46px;\n}\n#complaints_base_h39sk .alert__content {\n  text-align: center;\n  padding: 14px 18px;\n}\n#complaints_base_h39sk .select-wrap {\n  width: 100%;\n  margin-bottom: 20px;\n}\n#complaints_base_h39sk .comment.small-input {\n  width: 100%;\n  resize: none;\n  display: block;\n  color: #333;\n}\n", ""]);

// exports


/***/ })
/******/ ]);
});
