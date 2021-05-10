var gitbook = window.gitbook;
var options = {};
var scrollFunc = function (e) {
	e = e || window.event;
	var func = function (isDown = true) {
		if (tocArray.length > 0) {
			let itemArray = []
			tocArray.map(v => {
				itemArray.push(v);
				for (const c of v.children) {
					itemArray.push(c);
					for (const c2 of c.children) {
						itemArray.push(c2);
					}
				}
			})
			for (let index = 0; index < itemArray.length; index++) {
				const tocItem = itemArray[index];
				const ele = document.getElementById(tocItem.url);
				const rect = ele.getBoundingClientRect();
				tocItem.$__top = rect.top;
			}
			itemArray.sort((a, b) => a.$__top - b.$__top);
			let idx = itemArray.findIndex(item => item.$__top >= 0);
			if (idx > -1) {
				let selectEle = document.getElementById(`menu-${idx}`);
				if(selectedElement != selectEle) {
					selectedElement && (selectedElement.style.backgroundColor = "#33000000");
					selectEle.style.backgroundColor = "#494949";
					selectedElement = selectEle;
				}
			}
		}
	}
	func();
	// if (e.wheelDelta) {  //第一步：先判断浏览器IE，谷歌滑轮事件               
	// 	if (e.wheelDelta > 0) { //当滑轮向上滚动时  
	// 		console.log("滑轮向上滚动");
	// 		func(false);
	// 	}
	// 	if (e.wheelDelta < 0) { //当滑轮向下滚动时  
	// 		console.log("滑轮向下滚动");
	// 		func();
	// 	}
	// } else if (e.detail) {  //Firefox滑轮事件  
	// 	if (e.detail > 0) { //当滑轮向上滚动时  
	// 		console.log("滑轮向上滚动");
	// 	}
	// 	if (e.detail < 0) { //当滑轮向下滚动时  
	// 		console.log("滑轮向下滚动");
	// 	}
	// }
}

gitbook.events.bind('start', function (e, config) {

	// Save config data
	options = config['page-toc-button'] || {};

});
var tocArray = [];
var selectedElement;

gitbook.events.on('page.change', function () {

	// Default config values
	var _maxTocDepth = 2;
	var _minTocSize = 2;

	// Read out config data
	if (options) {
		_maxTocDepth = options.maxTocDepth ? options.maxTocDepth : _maxTocDepth;
		_minTocSize = options.minTocSize ? options.minTocSize : _minTocSize;
	};

	// Search for headers
	var headerArray = $(".book .body-inner .markdown-section :header");
	tocArray.length = 0;
	// Init variables
	var tocSize = 0;
	let myElement;
	// For each header...
	for (i = 0; i < headerArray.length; i++) {

		var headerElement = headerArray[i];
		var header = $(headerElement);
		var headerId = header.attr("id");

		if ((typeof headerId !== typeof undefined) && (headerId !== false)) {
			if (!myElement) {
				myElement = true;
				window['ele'] = headerElement;
			}
			switch (headerElement.tagName) {
				case "H1":
					tocArray.push({
						name: header.text(),
						url: headerId,
						children: []
					});
					tocSize++;
					break;
				case "H2":
					if ((tocArray.length > 0) && (_maxTocDepth >= 1)) {
						tocArray[tocArray.length - 1].children.push({
							name: header.text(),
							url: headerId,
							children: []
						});
						tocSize++;
					};
					break;
				case "H3":
					if ((tocArray.length > 0) && (_maxTocDepth >= 2)) {
						if (tocArray[tocArray.length - 1].children.length > 0) {
							tocArray[tocArray.length - 1].children[tocArray[tocArray.length - 1].children.length - 1].children.push({
								name: header.text(),
								url: headerId,
								children: []
							});
							tocSize++;
						};
					};
					break;
				default:
					break;
			}
		}
	};

	// Cancel if not enough headers to show
	if ((tocSize == 0) || (tocSize < _minTocSize)) {
		return;
	}

	// Generate html for button and menu
	var html = "<div id=\"page-toc-menu\" class='page-toc-menu'><ul>";
	let itemIdx = 0;
	for (i = 0; i < tocArray.length; i++) {
		const tocItem = tocArray[i];
		html += "<li id=\"menu-"+itemIdx+"\"><a href='#" + tocItem.url + "'>" + tocItem.name + "</a></li>";
		++itemIdx;
		if (tocItem.children.length > 0) {
			html += "<ul>"
			for (j = 0; j < tocItem.children.length; j++) {
				const child = "<li id=\"menu-"+itemIdx+"\"><a href='#" + tocItem.children[j].url + "'>" + tocItem.children[j].name + "</a></li>";
				++itemIdx;
				html += child;
				if (tocItem.children[j].children.length > 0) {
					html += "<ul>"
					for (k = 0; k < tocItem.children[j].children.length; k++) {
						html += "<li id=\"menu-"+itemIdx+"\"><a href='#" + tocItem.children[j].children[k].url + "'>" + tocItem.children[j].children[k].name + "</a></li>";
						++itemIdx;
					}
					html += "</ul>"
				}
			}
			html += "</ul>"
		}
	}
	html += "</ul></div></div>";

	// Append generated html to page
	$(".book").append(html)
	document.getElementById('page-toc-menu').addEventListener('click',function(){
		setTimeout(() => {
			scrollFunc();
		}, 20);
	}, false);
	scrollFunc();
});

function scroll() {
	//console.log("打印log日志");实时看下效果
	console.log("开始滚动！");
}


//给页面绑定滑轮滚动事件  
if (document.addEventListener) {//firefox  
	document.addEventListener('DOMMouseScroll', scrollFunc, false);
	document.addEventListener('scroll', scrollFunc, false);
}
//滚动滑轮触发scrollFunc方法  //ie 谷歌  
window.onmousewheel = document.onmousewheel = scrollFunc;
