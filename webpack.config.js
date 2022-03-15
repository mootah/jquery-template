const path = require("path")
const globule = require("globule")
const glob = require("glob")
const webpack = require("webpack")
const HtmlWebpackPlugin = require("html-webpack-plugin")
const { CleanWebpackPlugin } = require("clean-webpack-plugin")
const MiniCssExtractPlugin = require("mini-css-extract-plugin")
const Critters = require("critters-webpack-plugin")
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin")
const TerserPlugin = require("terser-webpack-plugin")

const pugsGlobPlugins = (entries, srcPath) => {
  return Object.keys(entries).map(
    (key) =>
      new HtmlWebpackPlugin({
        inject: "body",
        filename: `${key}.html`,
        template: `${srcPath}/${key}.pug`,
        chunks: [key],
      })
  )
}

const entries = {
  index: ["./src/ts/index.ts", "./src/scss/index.scss"],
  about: ["./src/ts/about.ts", "./src/scss/about.scss"],
}

const app = {
  entry: entries,
  output: {
    publicPath: "",
    path: path.resolve(__dirname, "dist"),
    filename: "js/[name].[contenthash].js",
  },
  target: ["web", "es5"],
  resolve: {
    extensions: [".ts", ".js"],
  },
  devtool: "source-map",
  watchOptions: {
    ignored: /node_modules/,
  },
  devServer: {
    static: "dist",
    open: true,
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.pug$/,
        use: [
          {
            loader: "pug-loader",
            options: {
              pretty: true,
              root: path.resolve(__dirname, "src"),
            },
          },
        ],
      },
      {
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
          "css-loader",
          {
            loader: "postcss-loader",
            options: {
              postcssOptions: {
                plugins: [require("autoprefixer")({ grid: true })],
              },
            },
          },
          {
            loader: "sass-loader",
            options: {
              implementation: require("sass"),
              sourceMap: true,
            },
          },
        ],
      },
      {
        test: /\.(png|jpe?g|jpeg|gif)$/,
        use: [
          {
            loader: "url-loader",
            options: {
              limit: 8192,
              fallback: require.resolve("responsive-loader"),
              adapter: require("responsive-loader/sharp"),
              sizes: [360, 640, 1080, 1920],
              placeholder: true,
              placeholderSize: 64,
              outputPath: "images/",
              name: "[name].[width].[ext]",
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin({
      cleanOnceBeforeBuildPatterns: ["**/*", "!README.md"],
    }),
    new MiniCssExtractPlugin({
      filename: "css/[name].[contenthash].css",
    }),
    new webpack.ProvidePlugin({
      $: "jquery",
      jQuery: "jquery",
      "window.jQuery": "jquery",
    }),
    ...pugsGlobPlugins(entries, "./src/pug"),
    new Critters({}),
  ],
  optimization: {
    minimizer: [new TerserPlugin(), new CssMinimizerPlugin()],
  },
}

module.exports = app
