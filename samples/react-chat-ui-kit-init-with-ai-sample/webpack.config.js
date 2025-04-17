const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

module.exports = {
    mode: 'development',
    entry: './src/index.tsx',
    output: {
        filename: '[name].js', // Отключаем хеширование
        path: path.resolve(__dirname, 'dist'),
        publicPath: '/',
        assetModuleFilename: '[name][ext]', // Оригинальные имена файлов
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
        modules: [path.resolve(__dirname, 'node_modules'), 'node_modules'],
    },
    module: {
        rules: [
            {
                test: /\.(ts|tsx)$/,
                use: {
                    loader: 'ts-loader',
                    options: {
                        transpileOnly: true
                    }
                },
                exclude: /node_modules/,
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'],
            },
            {
                test: /\.s[ac]ss$/i,
                use: ['style-loader', 'css-loader', 'sass-loader'],
            },
            {
                test: /\.svg$/i, // Все SVG → импортируются как React-компоненты
                use: [
                    {
                        loader: '@svgr/webpack',
                        options: {
                            icon: true,
                            esModule: true,
                        },
                    },
                ],
            },
            {
                test: /\.(png|jpg|jpeg|gif)$/i, // Поддержка изображений
                type: 'asset/resource',
            },
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './public/index.html',
        }),
    ],
    devServer: {
        historyApiFallback: true,
        hot: true,
        open: true,
        port: 3000,
        static: path.join(__dirname, 'public'),
    },
};
