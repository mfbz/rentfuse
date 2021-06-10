/* eslint-disable */
const withCSS = require('@zeit/next-css');
const withLESS = require('@zeit/next-less');
const lessToJS = require('less-vars-to-js');
const fs = require('fs');
const path = require('path');

// Where the antd-custom.less file lives
const themeVariables = lessToJS(fs.readFileSync(path.resolve(__dirname, './src/styles/antd-custom.less'), 'utf8'));

module.exports = withCSS(
	withLESS({
		lessLoaderOptions: {
			javascriptEnabled: true,
			modifyVars: themeVariables, // make antd custom effective
		},
		webpack: (config, { isServer }) => {
			if (isServer) {
				const antStyles = /antd\/.*?\/style.*?/;
				const origExternals = [...config.externals];
				config.externals = [
					(context, request, callback) => {
						if (request.match(antStyles)) return callback();
						if (typeof origExternals[0] === 'function') {
							origExternals[0](context, request, callback);
						} else {
							callback();
						}
					},
					...(typeof origExternals[0] === 'function' ? [] : origExternals),
				];

				config.module.rules.unshift({
					test: antStyles,
					use: 'null-loader',
				});
			}
			return config;
		},
	}),
);
