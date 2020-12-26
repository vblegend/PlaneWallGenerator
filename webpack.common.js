const path = require('path');
const webpack = require('webpack');
const {
    CleanWebpackPlugin
} = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');


module.exports = {
    entry: {
        examples: './examples/index.ts'
    },
    module: {
        rules: [{
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/
            }, {
                test: /\.css$/,
                use: [
                    'style-loader',
                    'css-loader?modules&importLoaders=1',
                    'typed-css-modules-loader'
                ]
            },
            {
                test: /\.js$/,
                // 值一个正则，符合这些正则的资源会用一个loade来处理
                use: {
                    loader: 'babel-loader'
                    // 使用bable-loader来处理
                },
                exclude: /node_module/
                // 排除在外
            }
        ]
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js']
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist')
    },
    plugins: [
        //
        new CleanWebpackPlugin({
            cleanStaleWebpackAssets: false
        }),
        // Index.html 模板化
        new HtmlWebpackPlugin({
            template: './examples/templates/template.index.html',
            chunks: ['vendors', 'common', 'examples'],
            filename: 'index.html',
            minify: {
                collapseWhitespace: false
            },
            hash: true
        }), new CopyWebpackPlugin({
            patterns: [{
                    from: path.resolve(__dirname, 'src/assets'),
                    to: path.resolve(__dirname, 'dist/assets')
                },
                {
                    from: path.resolve(__dirname, 'examples/assets'),
                    to: path.resolve(__dirname, 'dist/assets')
                }
            ]
        })
    ],
    optimization: {
        splitChunks: {
            // async异步代码分割 initial同步代码分割 all同步异步分割都开启
            chunks: 'all',
            // 字节 引入的文件大于30kb才进行分割
            minSize: 30000,
            //
            minRemainingSize: 0,
            // 50kb，尝试将大于50kb的文件拆分成n个50kb的文件
            maxSize: 500000,
            // 模块至少使用次数     
            minChunks: 1,
            // 同时加载的模块数量最多是5个，只分割出同时引入的前5个文件
            maxAsyncRequests: 30,
            // 首页加载的时候引入的文件最多3个
            maxInitialRequests: 30,
            // 缓存组和生成文件名称之间的连接符
            automaticNameDelimiter: '~',
            //
            enforceSizeThreshold: 50000,
            // 缓存组里面的filename生效，覆盖默认命名
            // name: true,
            // 缓存组，将所有加载模块放在缓存里面一起分割打包
            cacheGroups: {
                vendors: {
                    // 自定义打包模块
                    test: /[\\/]node_modules[\\/]/,
                    // 优先级，先打包到哪个组里面，值越大，优先级越高
                    priority: -10,
                    name: 'vendors',
                    // filename: 'vendors.js'
                    reuseExistingChunk: true
                },
                default: {
                    minChunks: 2,
                    // 默认代码打包模块
                    priority: -20,
                    // 模块嵌套引入时，判断是否复用已经被打包的模块
                    reuseExistingChunk: true,
                    name: 'common'
                    // filename: 'common.js'
                }
            }
        }
    }
};