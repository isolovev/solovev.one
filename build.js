const path = require("path");
const fs = require("fs");
const {promisify} = require("util");

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const copyFile = promisify(fs.copyFile);
const unlink = promisify(fs.unlink);

const Parcel = require("parcel-bundler");

const PostHTML = require("posthtml");
const MQPacker = require("css-mqpacker");
const postcssCustomProperties = require("postcss-custom-properties");
const PostCSS = require("postcss");
const Terser = require("terser");

const templatePath = path.join(__dirname, "src", "pages");

const shortCssClassName = generateCssClassName();

const mainBundler = new Parcel(
	[
		path.join(templatePath, "index.pug"),
		path.join(templatePath, "404.pug"),
		path.join(templatePath, "projects.pug"),
	],
	{
		sourceMaps: false,
		scopeHoist: true,
	}
);

async function build() {
	// noinspection JSUnresolvedFunction
	const bundlePages = await mainBundler.bundle();
	const assets = findAssets(bundlePages);

	const cssFile = assets.find((item) => item.type === "css");
	const jsFile = assets.find((item) => item.type === "js");

	let cssData = (await readFile(cssFile.name)).toString();
	let jsData = (await readFile(jsFile.name)).toString();

	await Promise.all([
		unlink(cssFile.name),
		unlink(jsFile.name),
	]);

	const classesList = {};

	function cssPlugin(root) {
		root.walkRules(rule => {
			rule.selector = rule.selector.replace(/\.[\w_-]+/g, str => {
				const origin = str.substr(1);

				if (!classesList[origin]) {
					classesList[origin] = shortCssClassName.next().value;
				}

				return `.${classesList[origin]}`;
			});
		});
	}

	const styles = await PostCSS([
		postcssCustomProperties({
			preserve: false,
		}),
		cssPlugin,
		MQPacker
	])
		.process(cssData, { from: cssFile.name });

	Object
		.keys(classesList)
		.forEach((origin) => {
			jsData = jsData
				.replace(new RegExp(`"\\.${origin}"`, "g"), `".${classesList[origin]}"`)
				.replace(new RegExp(`\(classList.\\w+\\(\("\.*",\\s\)*)\(["']${origin}["']\)`, "g"), `$1"${classesList[origin]}"`);
		});

	jsData = jsData
		.replace(/parcelRequire=function.*\(function \(require\) {/i, "(function(window,document){")
		.replace(/}\);$/, "})(window,document);");

	const minifyJS = Terser.minify(jsData, {
		toplevel: true
	});

	await writeFile(jsFile.name, minifyJS.code);
	await copyFile("./src/favicon.ico", "./dist/favicon.ico");

	function htmlPlugin(tree) {
		tree.match({ attrs: { class: true } }, i => ({
			tag: i.tag,
			content: i.content,
			attrs: {
				...i.attrs,
				class: i.attrs.class
					.split(" ")
					.map((kls) => classesList[kls])
					.join(" ")
			}
		}));

		tree.match({ tag: "link", attrs: { rel: "stylesheet" } }, () => {
			return {
				tag: "style",
				content: styles.css
			}
		});
	}

	assets
		.filter(i => i.type === "html")
		.forEach(async item => {
			const html = await readFile(item.name);

			await writeFile(
				item.name,
				PostHTML()
					.use(htmlPlugin)
					.process(html, { sync: true })
					.html
			);
		});
}

build()
	.catch((error) => {
		process.stderr.write(error.stack + "\n");
		process.exit(1);
	});

function findAssets(bundle) {
	return Array
		.from(bundle.childBundles)
		.reduce(
			(all, item) => all.concat(findAssets(item)),
			[{
				name: bundle.name,
				type: bundle.type,
			}]
		);
}

function* generateCssClassName() {
	const options = {
		alphabet: "abcefghijklmnopqrstuvwxyz0123456789-_",
		length: 1,
		index: 0
	};

	const getClassName = () => {
		let result = "";

		for (let i = options.length - 1; i >= 0; i--) {
			const x = Math.pow(options.alphabet.length, i);
			const n = Math.floor(options.index / x);
			result += options.alphabet[n % options.alphabet.length];
		}

		options.index++;
		if (options.index > Math.pow(options.alphabet.length, options.length) - 1) {
			options.length++;
			options.index = 0;
		}

		return result;
	};

	while (true) {
		let result = getClassName();

		while (/^[0-9-].*$/.test(result)) {
			result = getClassName();
		}

		yield result;
	}
}
