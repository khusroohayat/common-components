const path = require('path');
const package = require('./package.json');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const WriteFilePlugin = require('write-file-webpack-plugin');
const isProduction = process.env.NODE_ENV === 'production';
const CleanWebpackPlugin = require('clean-webpack-plugin');
const htmlOutFile = isProduction ? 'index-prod.html' : 'index.html';
console.log(`
ENV: ${process.env.NODE_ENV}
`);

const config = {
    entry: {
        main: './main.js'
    },
    output: {
        filename: '[name]/index.js',
        path: path.resolve(__dirname, 'build'),
        publicPath: '/',
        hotUpdateChunkFilename: 'hot/[id].[hash].hot-update.js',
        hotUpdateMainFilename: 'hot/[hash].hot-update.json'
    },

    context: path.resolve(__dirname, 'src'),

    devServer: {
        hot: true,
        historyApiFallback: true,
        noInfo: false,
        contentBase: path.resolve(__dirname, 'build'),
        stats: 'errors-only',
        publicPath: '/'
    },
    devtool: 'cheap-module-source-map',
    module: {
        rules: [
            {
                test: /\.js$/,
                use: [
                    'babel-loader',
                ],
                exclude: /node_modules/
            },
            {
                test: /\.js$/, use: "eslint-loader", exclude: /node_modules/
            },
            {
                test: /\.css|.scss$/,
                use: [
                    'style-loader',
                    {
                        loader: 'css-loader',
                        options: {
                            modules: true,
                            importLoaders: 1, 
                            localIdentName: package.config.cssModulePattern
                        }
                    },
                    'sass-loader?sourceMap'
                ],
            }
        ],
    },
    plugins: [
        new CleanWebpackPlugin(['build'], {
            root: __dirname,
            verbose: true,
            dry: false
        }),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NamedModulesPlugin(),
        new CopyWebpackPlugin([
            // {output}/file.txt
            { from: htmlOutFile, to: 'index.html' },
            { from: './index.js' }

        ]),
        // enable HMR globally
        // prints more readable module names in the browser console on HMR updates
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify(isProduction ? 'production' : process.env.NODE_ENV),
        }),

    ],
};

if (isProduction) {
    config.devtool = 'source-map';
    config.externals = [
        {
            'react': {
                root: 'React',
                commonjs2: 'react',
                commonjs: 'react',
                amd: 'react'
            }
        },
        {
            'react-dom': {
                root: 'ReactDOM',
                commonjs2: 'react-dom',
                commonjs: 'react-dom',
                amd: 'react-dom'
            }
        }]
    config.plugins[1] = () => { };
} else {
    config.entry.main = ['./main.js'];
    config.entry.main.unshift(
        'react-hot-loader/patch',
        // activate HMR for React

        'webpack-dev-server/client?http://localhost:8080',
        // bundle the client for webpack-dev-server
        // and connect to the provided endpoint

        'webpack/hot/only-dev-server'
        // bundle the client for hot reloading
        // only- means to only hot reload for successful updates
    );
}

module.exports = config;