const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');

module.exports = {
    mode: 'development',
    entry: './src/index.tsx',
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist'),
        publicPath: '/',
        assetModuleFilename: '[name][ext]',
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
                    options: { transpileOnly: true },
                },
                exclude: /node_modules/,
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'],
            },
            {
                test: /\.s[ac]ss$/i,
                use: [
                    'style-loader',
                    'css-loader',
                    {
                        loader: 'sass-loader',
                        options: {
                            implementation: require('sass'),
                            sassOptions: {
                                quietDeps: true, // ✅ Отключает устаревшие предупреждения
                            },
                        },
                    },
                ],
            },
            {
                test: /\.svg$/i,
                oneOf: [
                    {
                        resourceQuery: /url/, // Если `import logo from './logo.svg?url'`
                        type: 'asset/resource',
                    },
                    {
                        resourceQuery: /react/, // Если `import { ReactComponent as Logo } from './logo.svg?react'`
                        use: ['@svgr/webpack'],
                    },
                    {
                        use: ['@svgr/webpack'], // Обычный импорт без `?url` или `?react`
                    },
                ],
            },
            {
                test: /\.(png|jpg|jpeg|gif)$/i,
                type: 'asset/resource',
            },
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './public/index.html',
            filename: 'index.html', // ✅ Исправляет конфликт генерации
            inject: true, // Встраивает ссылки в `index.html`
        }),
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: 'public',
                    to: '',
                    globOptions: {
                        ignore: ['**/index.html'], // ✅ Предотвращает дублирование `index.html`
                    },
                },
            ],
        }),
        new webpack.ProvidePlugin({
            React: 'react',
        }),
    ],
    devServer: {
        historyApiFallback: true,
        hot: true,
        open: true,
        port: 3000,
        static: {
            directory: path.join(__dirname, 'public'),
            publicPath: '/',
        },
        server: 'https',
    },
};
