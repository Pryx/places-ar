const path = require('path');
const UglifyJS = require('uglifyjs-webpack-plugin');

module.exports = (env) => {
  const isProd = env && env.prod;
  const isCI = env && env.CI;

  let plugins = [];

  if (isProd) {
    plugins.push(new UglifyJS({
      uglifyOptions: {
        ecma: 6,
        compress: {
          warnings: false,
          conditionals: true,
          unused: true,
          comparisons: true,
          sequences: true,
          dead_code: true,
          evaluate: true,
          if_return: true,
          join_vars: true
        },
        output: {
          ecma: 6,
          comments: false,
          beautify: false
        }
      }
    }));
  }

  return {
    mode: isProd ? "production" : "development",
    entry: "main.js",
    context: path.resolve(__dirname, 'src', 'js',),
    devtool: 'source-map',
    output: {
      path: path.resolve(__dirname, 'src', 'js'),
      filename: 'places-ar.min.js'
    },
    plugins: plugins,
    module:{
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          loader: "eslint-loader",
          options: {
            quiet: isCI,
          }
        }
      ]
    },
    resolve: {
      modules: [
        path.resolve(__dirname, 'src', 'js'),
        path.resolve(__dirname, 'node_modules')
      ]
    },
    target: "web",
    profile: !isProd
  };
};