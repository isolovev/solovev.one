const path = require("path");
const fs = require("fs");

const readDirRecursive = require("recursive-readdir");
const zopfli = require('@gfx/zopfli');
const brotli = require('iltorb');
const pQueue = require('p-queue');
const chalk = require('chalk');

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

const queue = new pQueue({ concurrency: 2 });

readDirRecursive(path.join(__dirname, "dist"))
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
