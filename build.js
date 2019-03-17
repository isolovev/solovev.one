const path = require("path");
const fs = require("fs");
const {promisify} = require("util");

const readDirRecursive = require("recursive-readdir");
const zopfli = require('@gfx/zopfli');
const brotli = require('iltorb');
const pQueue = require('p-queue');
const chalk = require('chalk')

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const unlink = promisify(fs.unlink);

const Parcel = require("parcel-bundler");

const PostHTML = require("posthtml");
const MQPacker = require("css-mqpacker");
const postcssCustomProperties = require("postcss-custom-properties");
const PostCSS = require("postcss");

const templatePath = path.join(__dirname, "src", "pages");

const compressConfig = {
	gzip: {
		enabled: true,
		numiterations: 15,
		blocksplitting: true,
		blocksplittinglast: false,
		blocksplittingmax: 15,
	},
	brotli: {
		enabled: true,
		mode: 0,
		quality: 11,
		lgwin: 22,
		lgblock: 0,
		enable_dictionary: true,
		enable_transforms: false,
		greedy_block_split: false,
		enable_context_modeling: false,
	}
};

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
			const startSelector = `["'.]`;
			const endSelector = `["'\\s\\[):,+~>]`;

			jsData = jsData.replace(
				new RegExp(`(${startSelector})${origin}(${endSelector})`, "g"),
				`$1${classesList[origin]}$2`
			);
		});

	await writeFile(jsFile.name, jsData);

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

const queue = new pQueue({ concurrency: 2 });

build()
	.then(() => readDirRecursive(path.join(__dirname, "dist")))
	.then(async (files) => {
		console.log(chalk.bold('\n🗜️  Compressing bundled files...\n'));
		const start = new Date().getTime();

		try {
			files.forEach((file) => {
				queue.add(() => zopfliCompress(file, compressConfig.gzip));
				queue.add(() => brotliCompress(file, compressConfig.brotli));
			});

			await queue.onIdle();

			const end = new Date().getTime();
			console.log(chalk.bold.green(`\n✨  Compressed in ${((end - start) / 1000).toFixed(2)}s.\n`));
		} catch (error) {
			console.error(chalk.bold.red('❌  Compression error:\n'));
			process.stderr.write(error.stack + "\n");
			process.exit(1);
		}
	})
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

function zopfliCompress(file, config) {
	if (!config.enabled) {
		return Promise.resolve();
	}

	const stat = fs.statSync(file);

	if (!stat.isFile()) {
		return Promise.resolve();
	}

	if (config.threshold && stat.size < config.threshold) {
		return Promise.resolve();
	}

	return new Promise((resolve, reject) => {
		fs.readFile(file, (error, content) => {
			if (error) {
				return reject(error);
			}

			zopfli.gzip(content, config, (error, compressedContent) => {
				if (error) {
					return reject(error);
				}

				if (stat.size > compressedContent.length) {
					fs.writeFile(`${file}.gz`, compressedContent, () => resolve());
				} else {
					resolve();
				}
			});
		});
	});
}

function brotliCompress(file, config) {
	if (!config.enabled) {
		return Promise.resolve();
	}

	const stat = fs.statSync(file);

	if (!stat.isFile()) {
		return Promise.resolve();
	}

	if (config.threshold && stat.size < config.threshold) {
		return Promise.resolve();
	}

	return new Promise((resolve, reject) => {
		fs.readFile(file, (error, content) => {
			if (error) {
				return reject(error);
			}

			const compressedContent = brotli.compressSync(content, config);

			if (compressedContent !== null && stat.size > compressedContent.length) {
				fs.writeFile(`${file}.br`, compressedContent, () => resolve());
			} else {
				resolve();
			}
		});
	});
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
