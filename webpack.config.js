const webpack = require('webpack');
const config = require('sapper/config/webpack.js');
const pkg = require('./package.json');

const mode = process.env.NODE_ENV;
const dev = mode === 'development';

/** css modules **/
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const getCSSModuleLocalIdent = require('react-dev-utils/getCSSModuleLocalIdent');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const safePostCssParser = require('postcss-safe-parser');

const sassRegex = /\.(scss|sass)$/;
const sassModuleRegex = /\.module\.(scss|sass)$/;

const getStyleLoaders = (cssOptions, isServer = false) => {
	const loaders = [];

	if (isServer) {
		loaders.push({
			loader: MiniCssExtractPlugin.loader,
			options: Object.assign(
				{},
				{ publicPath: '../' },
			),
		});
	}

	if (!isServer) {
		if (dev) {
			loaders.push('style-loader')
		}
		else {
			loaders.push({
				loader: MiniCssExtractPlugin.loader,
				options: Object.assign(
					{},
					{ publicPath: '../' },
				),
			});
		}
	}

	loaders.push(
		{
			loader: require.resolve('css-loader'),
			options: cssOptions,
		},

		{
			// Options for PostCSS as we reference these options twice
			// Adds vendor prefixing based on your specified browser support in
			// package.json
			loader: require.resolve('postcss-loader'),
			options: {
				// Necessary for external CSS imports to work
				// https://github.com/facebook/create-react-app/issues/2677
				ident: 'postcss',
				plugins: () => [
					require('postcss-flexbugs-fixes'),
					require('postcss-preset-env')({
						autoprefixer: {
							flexbox: 'no-2009',
						},
						stage: 3,
					}),
				],
			},
		},

		require.resolve("sass-loader")
	);

	return loaders;
};


const incstr = require('incstr');

const createUniqueIdGenerator = () => {
	const index = {};

	const generateNextId = incstr.idGenerator({
		// Removed "d" letter to avoid accidental "ad" construct.
		// @see https://medium.com/@mbrevda/just-make-sure-ad-isnt-being-used-as-a-class-name-prefix-or-you-might-suffer-the-wrath-of-the-558d65502793
		alphabet: 'abcefghijklmnopqrstuvwxyz0123456789',
	});

	return name => {
		if (index[name]) {
			return index[name];
		}

		let nextId;

		do {
			// Class name cannot start with a number.
			nextId = generateNextId();
		} while (/^[0-9]/.test(nextId));

		index[name] = generateNextId();

		return index[name];
	};
};

const uniqueIdGenerator = createUniqueIdGenerator();

const generateScopedName = (context, localIdentName, localName) => {
	const componentName = context.resourcePath.split('/').slice(-2, -1);

	return uniqueIdGenerator(componentName) + '_' + uniqueIdGenerator(localName);
};
// noinspection WebpackConfigHighlighting
/** end css modules **/


module.exports = {
	client: {
		entry: config.client.entry(),
		output: config.client.output(),
		resolve: {
			extensions: ['.js', '.json', '.html'],
			mainFields: ['svelte', 'module', 'browser', 'main']
		},
		module: {
			rules: [
				{
					test: /\.html$/,
					use: {
						loader: 'svelte-loader',
						options: {
							dev,
							hydratable: true,
							hotReload: true,
						}
					}
				},


				{
					test: sassRegex,
					exclude: sassModuleRegex,
					use: getStyleLoaders({ importLoaders: 2 }),
				},
				// Adds support for CSS Modules, but using SASS
				// using the extension .module.scss or .module.sass
				{
					test: sassModuleRegex,
					use: getStyleLoaders(
						{
							importLoaders: 2,
							modules: true,
							getLocalIdent: dev ? getCSSModuleLocalIdent : generateScopedName,
						}
					),
				},
			]
		},
		mode,
		plugins: [
			dev && new webpack.HotModuleReplacementPlugin(),
			new webpack.DefinePlugin({
				'process.browser': true,
				'process.env.NODE_ENV': JSON.stringify(mode)
			}),

			!dev && new MiniCssExtractPlugin({
				// Options similar to the same options in webpackOptions.output
				// both options are optional
				filename: '../client/[name].css',
			}),
		].filter(Boolean),
		devtool: dev && 'inline-source-map'
	},

	server: {
		entry: config.server.entry(),
		output: config.server.output(),
		target: 'node',
		resolve: {
			extensions: ['.js', '.json', '.html'],
			mainFields: ['svelte', 'module', 'browser', 'main']
		},
		externals: Object.keys(pkg.dependencies).concat('encoding'),
		module: {
			rules: [
				{
					test: /\.html$/,
					use: {
						loader: 'svelte-loader',
						options: {
							css: false,
							generate: 'ssr',
							dev,
						}
					}
				},


				{
					test: sassRegex,
					exclude: sassModuleRegex,
					use: getStyleLoaders({ importLoaders: 2 }, true),
				},
				// Adds support for CSS Modules, but using SASS
				// using the extension .module.scss or .module.sass
				{
					test: sassModuleRegex,
					use: getStyleLoaders(
						{
							importLoaders: 2,
							modules: true,
							getLocalIdent: dev ? getCSSModuleLocalIdent : generateScopedName,
						},
						true
					),
				},
			]
		},
		mode: process.env.NODE_ENV,
		performance: {
			hints: false // it doesn't matter if server.js is large
		},

		plugins: [
			new MiniCssExtractPlugin({
				// Options similar to the same options in webpackOptions.output
				// both options are optional
				filename: `../client/css/main.css`,
			}),
		],

		optimization: {
			minimizer: [
				new OptimizeCSSAssetsPlugin({
					cssProcessorOptions: {
						parser: safePostCssParser,
						map: dev
							? {
								inline: false,
								annotation: true,
							}
							: false,
					},
				}),
			],
		},
	},

	serviceworker: {
		entry: config.serviceworker.entry(),
		output: config.serviceworker.output(),
		mode: process.env.NODE_ENV
	}
};
