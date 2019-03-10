const path = require("path");
const fs = require("fs");
const {promisify} = require('util');

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const unlink = promisify(fs.unlink);
const mkdir = promisify(fs.mkdir);

const Parcel = require("parcel-bundler");

const PostHTML = require('posthtml');
const MQPacker = require('css-mqpacker');
const PostCSS = require('postcss');

const templatePath = path.join(__dirname, "src", "pages");
const distPath = path.join(__dirname, "dist");
const startChar = 'a'.charCodeAt(0);

const separatePages = ["projects"];

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
	let lastUsed = -1;

	function cssPlugin(root) {
		root.walkRules(rule => {
			rule.selector = rule.selector.replace(/\.[\w_-]+/g, str => {
				const kls = str.substr(1);

				if (!classesList[kls] && !/^js-/.test(kls)) {
					lastUsed += 1;
					classesList[kls] = String.fromCharCode(startChar + lastUsed);
				}

				return '.' + classesList[kls]
			});
		});
	}

	await writeFile(
		cssFile.name,
		PostCSS([cssPlugin, MQPacker])
			.process(cssData, { from: cssFile.name })
			.css
	);

	Object
		.keys(classesList)
		.forEach((origin) => {
			jsData = jsData.replace(origin, classesList[origin]);
		});

	await writeFile(jsFile.name, jsData);

	function htmlPlugin(tree) {
		tree.match({ attrs: { class: true } }, i => ({
			tag: i.tag,
			content: i.content,
			attrs: {
				...i.attrs,
				class: i.attrs.class
					.split(' ')
					.map((kls) => {
						if (!classesList[kls] && !/^js-/.test(kls)) {
							process.stderr.write(`Unused class .${ kls }\n`);
							process.exit(1);
						}

						return classesList[kls];
					})
					.join(' ')
			}
		}));
	}

	assets
		.filter(i => i.type === "html")
		.forEach(async item => {
			const html = await readFile(item.name);
			const fileName = path
				.basename(item.name)
				.split(".")
				.slice(0, -1)
				.join(".");

			let filePath = item.name;

			if (separatePages.includes(fileName)) {
				await unlink(filePath);

				const fileDirPath = path.join(distPath, fileName);
				if (!fs.existsSync(fileDirPath)) {
					await mkdir(fileDirPath);
				}

				filePath = path.join(fileDirPath, "index.html");
			}

			await writeFile(
				filePath,
				PostHTML()
					.use(htmlPlugin)
					.process(html, { sync: true })
					.html
			);
		});
}

build()
	.catch((error) => {
		process.stderr.write(error.stack + '\n');
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
