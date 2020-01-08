"use strict"; // ES6

/*! modernizr 3.5.0 (arrow, blob) | MIT Licensed | https://modernizr.com/download/?-arrow-bloburls */
!function(window,document,undefined){function is(e,t){return typeof e===t}function testRunner(){let e,t,n,r,o,i,s;for(let l in tests)if(tests.hasOwnProperty(l)){if(e=[],t=tests[l],t.name&&(e.push(t.name.toLowerCase()),t.options&&t.options.aliases&&t.options.aliases.length))for(n=0;n<t.options.aliases.length;n++)e.push(t.options.aliases[n].toLowerCase());for(r=is(t.fn,"function")?t.fn():t.fn,o=0;o<e.length;o++)i=e[o],s=i.split("."),1===s.length?Modernizr[s[0]]=r:(!Modernizr[s[0]]||Modernizr[s[0]]instanceof Boolean||(Modernizr[s[0]]=new Boolean(Modernizr[s[0]])),Modernizr[s[0]][s[1]]=r),classes.push((r?"":"no-")+s.join("-"))}}function cssToDOM(e){return e.replace(/([a-z])-([a-z])/g,function(e,t,n){return t+n.toUpperCase()}).replace(/^-/,"")}function contains(e,t){return!!~(""+e).indexOf(t)}function createElement(){return"function"!=typeof document.createElement?document.createElement(arguments[0]):isSVG?document.createElementNS.call(document,"http://www.w3.org/2000/svg",arguments[0]):document.createElement.apply(document,arguments)}function fnBind(e,t){return function(){return e.apply(t,arguments)}}function testDOMProps(e,t,n){let r;for(let o in e)if(e[o]in t)return n===!1?e[o]:(r=t[e[o]],is(r,"function")?fnBind(r,n||t):r);return!1}function domToCSS(e){return e.replace(/([A-Z])/g,function(e,t){return"-"+t.toLowerCase()}).replace(/^ms-/,"-ms-")}function computedStyle(e,t,n){let r;if("getComputedStyle"in window){r=getComputedStyle.call(window,e,t);let o=window.console;if(null!==r)n&&(r=r.getPropertyValue(n));else if(o){let i=o.error?"error":"log";o[i].call(o,"getComputedStyle returning null, its possible modernizr test results are inaccurate")}}else r=!t&&e.currentStyle&&e.currentStyle[n];return r}function getBody(){let e=document.body;return e||(e=createElement(isSVG?"svg":"body"),e.fake=!0),e}function injectElementWithStyles(e,t,n,r){let o,i,s,l,d="modernizr",u=createElement("div"),a=getBody();if(parseInt(n,10))for(;n--;)s=createElement("div"),s.id=r?r[n]:d+(n+1),u.appendChild(s);return o=createElement("style"),o.type="text/css",o.id="s"+d,(a.fake?a:u).appendChild(o),a.appendChild(u),o.styleSheet?o.styleSheet.cssText=e:o.appendChild(document.createTextNode(e)),u.id=d,a.fake&&(a.style.background="",a.style.overflow="hidden",l=docElement.style.overflow,docElement.style.overflow="hidden",docElement.appendChild(a)),i=t(u,e),a.fake?(a.parentNode.removeChild(a),docElement.style.overflow=l,docElement.offsetHeight):u.parentNode.removeChild(u),!!i}function nativeTestProps(e,t){let n=e.length;if("CSS"in window&&"supports"in window.CSS){for(;n--;)if(window.CSS.supports(domToCSS(e[n]),t))return!0;return!1}if("CSSSupportsRule"in window){for(let r=[];n--;)r.push("("+domToCSS(e[n])+":"+t+")");return r=r.join(" or "),injectElementWithStyles("@supports ("+r+") { #modernizr { position: absolute; } }",function(e){return"absolute"==computedStyle(e,null,"position")})}return undefined}function testProps(e,t,n,r){function o(){s&&(delete mStyle.style,delete mStyle.modElem)}if(r=is(r,"undefined")?!1:r,!is(n,"undefined")){let i=nativeTestProps(e,n);if(!is(i,"undefined"))return i}for(let s,l,d,u,a,f=["modernizr","tspan","samp"];!mStyle.style&&f.length;)s=!0,mStyle.modElem=createElement(f.shift()),mStyle.style=mStyle.modElem.style;for(d=e.length,l=0;d>l;l++)if(u=e[l],a=mStyle.style[u],contains(u,"-")&&(u=cssToDOM(u)),mStyle.style[u]!==undefined){if(r||is(n,"undefined"))return o(),"pfx"==t?u:!0;try{mStyle.style[u]=n}catch(c){}if(mStyle.style[u]!=a)return o(),"pfx"==t?u:!0}return o(),!1}function testPropsAll(e,t,n,r,o){let i=e.charAt(0).toUpperCase()+e.slice(1),s=(e+" "+cssomPrefixes.join(i+" ")+i).split(" ");return is(t,"string")||is(t,"undefined")?testProps(s,t,r,o):(s=(e+" "+domPrefixes.join(i+" ")+i).split(" "),testDOMProps(s,t,n))}let tests=[],ModernizrProto={_version:"3.5.0",_config:{classPrefix:"",enableClasses:!0,enableJSClass:!0,usePrefixes:!0},_q:[],on:function(e,t){let n=this;setTimeout(function(){t(n[e])},0)},addTest:function(e,t,n){tests.push({name:e,fn:t,options:n})},addAsyncTest:function(e){tests.push({name:null,fn:e})}},Modernizr=function(){};Modernizr.prototype=ModernizrProto,Modernizr=new Modernizr,Modernizr.addTest("arrow",function(){try{eval("()=>{}")}catch(e){return!1}return!0});let classes=[],omPrefixes="Moz O ms Webkit",cssomPrefixes=ModernizrProto._config.usePrefixes?omPrefixes.split(" "):[];ModernizrProto._cssomPrefixes=cssomPrefixes;let atRule=function(e){let t,n=prefixes.length,r=window.CSSRule;if("undefined"==typeof r)return undefined;if(!e)return!1;if(e=e.replace(/^@/,""),t=e.replace(/-/g,"_").toUpperCase()+"_RULE",t in r)return"@"+e;for(let o=0;n>o;o++){let i=prefixes[o],s=i.toUpperCase()+"_"+t;if(s in r)return"@-"+i.toLowerCase()+"-"+e}return!1};ModernizrProto.atRule=atRule;let domPrefixes=ModernizrProto._config.usePrefixes?omPrefixes.toLowerCase().split(" "):[];ModernizrProto._domPrefixes=domPrefixes;let docElement=document.documentElement,isSVG="svg"===docElement.nodeName.toLowerCase(),modElem={elem:createElement("modernizr")};Modernizr._q.push(function(){delete modElem.elem});let mStyle={style:modElem.elem.style};Modernizr._q.unshift(function(){delete mStyle.style}),ModernizrProto.testAllProps=testPropsAll;let prefixed=ModernizrProto.prefixed=function(e,t,n){return 0===e.indexOf("@")?atRule(e):(-1!=e.indexOf("-")&&(e=cssToDOM(e)),t?testPropsAll(e,t,n):testPropsAll(e,"pfx"))},url=prefixed("URL",window,!1);url=url&&window[url],Modernizr.addTest("bloburls",url&&"revokeObjectURL"in url&&"createObjectURL"in url),testRunner(),delete ModernizrProto.addTest,delete ModernizrProto.addAsyncTest;for(let i=0;i<Modernizr._q.length;i++)Modernizr._q[i]();window.Modernizr=Modernizr}(window,document);

pdfMake.fonts = {
	OldLondon: {
		normal: 'OldLondon.ttf', bold: 'OldLondon.ttf', italics: 'OldLondon.ttf', bolditalics: 'OldLondon.ttf'
	},
	PTSerif: {
		normal: 'PTSerif-Regular.ttf', bold: 'PTSerif-Bold.ttf', italics: 'PTSerif-Italic.ttf', bolditalics: 'PTSerif-BoldItalic.ttf'
	}
}

/*****************************************************************************
 * FreeDeedPoll.org.uk
 *****************************************************************************/

// Check ()=>{} compatibility and nag if necessary
if(!Modernizr.arrow || !Modernizr.bloburls) alert('This website requires a modern web browser. Visit browsehappy.com or whatbrowser.org for instructions on upgrading to a modern web browser.');

// Convenience functions
// String#trim - returns string with leading/trailing whitespace removed
if(typeof(String.prototype.trim) === 'undefined') {
	String.prototype.trim = () => {
		return String(this).replace(/^\s+|\s+$/g, '');
	};
}

// Ready function - run when the application starts
const ready = () => {
	// Constants
	const body = document.querySelector('body');
	const sectionClasses = Array.prototype.map.call(document.querySelectorAll('main > section'), e => `section-${e['id']}`);
	const form = document.querySelector('form');
	const adult = document.getElementById('adult');
	const child = document.getElementById('child');
	const submit = document.getElementById('submit');

	// Functions
	const adultChildChanged = (e) => {
		form.classList.remove('for-child', 'for-adult');
		if(adult.checked){
			form.classList.add('for-adult');
		} else if(child.checked){
			form.classList.add('for-child');
		}
	};

	const formParams = () => {
		let params = {};
		const prefix = adult.checked ? '.adult-only' : '.child-only';
		form.querySelectorAll(`${prefix} input, ${prefix} select, ${prefix} textarea`).forEach(e => {
			if(e.type == 'radio' || e.type == 'checkbox'){
				params[e.name] = e.checked;
			} else {
				params[e.name] = e.value.trim();
			}
		});
		return params;
	};

	const validate = () => {
		const params = formParams();
		let errors = [];
		if(params.oldName == '') errors.push({ field: 'oldName', error: 'Old name is required.' })
		if(params.newName == '') errors.push({ field: 'newName', error: 'New name is required.' })
		if(params.newName == params.oldName) errors.push({ field: 'newName', error: 'New name must be different from old name.' })
		return (errors.length > 0 ? errors : false);
	};

	const generateDeedPoll = () => {
		let content = [{ text: "Deed of Change of Name", style: 'title' }, "\n\n"];
		const params = formParams();
		console.log(params);
		if(adult.checked){
			content.push(`BY THIS DEED OF CHANGE OF NAME made by myself the undersigned ${params.newName} of C, D in the County of E formerly known as ${params.oldName}, a British Citizen under section 37(1) of the British Nationality Act 1981\n\n`);
			content.push(`HEREBY DECLARE AS FOLLOWS:\n\n`);
			content.push(`I. I ABSOLUTELY and entirely renounce, relinquish and abandon the use of my said former name A and assume, adopt and determine to take and use from the date hereof the name of B in substitution for my former name of A\n\n`);
			content.push(`II. I SHALL AT ALL TIMES hereafter in all records, deeds documents and other writings and in all actions and proceedings as well as in all dealings and transactions and on all occasions whatsoever use and subscribe the said name of B as my name, in substitution for my former name of A so relinquished as aforesaid to the intent that I may hereafter be called known or distinguished not by the former name of A but by the name B\n\n`);
			content.push(`III. I AUTHORISE AND REQUIRE all persons at all times to designate, describe, and address me by the adopted name of B\n\n`);
			content.push(`IN WITNESS whereof I have hereunto subscribed my adopted and substituted name of B and also my said former name of A.\n\n`);
			content.push(`Notwithstanding the decision of Mr Justice Vaisey in re Parrott, Cox v Parrott, the applicant wishes the enrolment to proceed.\n\n`);
			content.push(`SIGNED AS A DEED THIS 16TH DAY OF OCTOBER IN THE YEAR 2017`);
		} else {
			// TODO: CHILD
		}
		let docDefinition = {
			defaultStyle: {
				font: 'PTSerif',
				fontSize: 12
			},
			styles: {
				title: {
					font: 'OldLondon',
					fontSize: 32,
					alignment: 'center'
				}
			},
			content: content
		};
		pdfMake.createPdf(docDefinition).open(({}, window));
	};

	const defaultHash = document.querySelector('nav a').href.split('#')[1];
	const hashChange = (e) => {
		if(!!e) e.preventDefault();
		let newHash = window.location.href.split('#')[1];
		if(!newHash) newHash = defaultHash;
		body.classList.remove(...sectionClasses);
		body.classList.add(`section-${newHash}`);
	};

	// Handle page switching and switch to first page
	window.addEventListener('hashchange', hashChange);
	hashChange();
	// Run adultChildChanged to trigger initial setup, then trigger on subsequent changes
	adultChildChanged();
	adult.addEventListener('change', adultChildChanged);
	child.addEventListener('change', adultChildChanged);
	// Undo validation errors/warnings when a field is changes
	document.querySelectorAll('input, textarea, select').forEach(el => {
		el.addEventListener('change', e => {
			e.target.title = '';
			e.target.parentNode.classList.remove('error', 'warning');
		});
	});
	// Generate PDF when requested
	submit.addEventListener('click', (e) => {
		e.preventDefault();
		const validationErrors = validate();
		if(!validationErrors) return generateDeedPoll();
		const prefix = adult.checked ? '.adult-only' : '.child-only';
		validationErrors.forEach(error => {
			const field = form.querySelector(`${prefix} [name='${error.field}']`);
			if(!field) return;
			field.title = error.error;
			field.parentNode.classList.add('error');
		});
	});
	// Mark form as loaded
	form.classList.remove('not-loaded');
	form.classList.add('loaded');
	// Focus on first field
	document.querySelector('input[type=text]').focus();
};

// When loaded, run ready()
if (document.attachEvent ? document.readyState === "complete" : document.readyState !== "loading") {
	ready();
} else {
	document.addEventListener('DOMContentLoaded', ready);
}
