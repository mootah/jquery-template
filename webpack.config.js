const path = require("path")
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
  subpage: ["./src/ts/subpage.ts", "./src/scss/subpage.scss"],
}

const app = {
  entry: entries,
  output: {
    publicPath: "/",
    path: path.resolve(__dirname, "dist"),
    filename: "js/[name].[contenthash].js",
  },
  // target: ["web", "es5"],
  target: "web", // for hot reload
  resolve: {
    extensions: [".ts", ".js"],
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  devtool: "source-map",
  watchOptions: {
    ignored: /node_modules/,
  },
  performance: {
    hints: false,
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
                plugins: [
                  require("autoprefixer")({ grid: true }),
                  require("@fullhuman/postcss-purgecss")({
                    keyframes: true,
                    content: ["./src/**/*.pug"],
                    safelist: [/^\-js\-/],
                  }),
                ],
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
        type: "javascript/auto",
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
              outputPath: "/images/",
              name: "[name].[width].[ext]",
            },
          },
        ],
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: "asset",
        generator: {
          filename: `./fonts/[name][ext]`,
        },
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
