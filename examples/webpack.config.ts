import path from 'path'
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import { Configuration } from 'webpack'
import WebpackBar from 'webpackbar'
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin'
import { CleanWebpackPlugin } from 'clean-webpack-plugin'

const tsconfigPath = path.join(__dirname, 'src/tsconfig.json')

const config: Configuration = {
  devtool: 'source-map',

  entry: {
    main: './src/Http.tsx'
  },

  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].[hash].js'
  },

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loaders: [
          'cache-loader',
          {
            loader: 'thread-loader',
            options: {
              workers: 2
            }
          },
          {
            loader: 'babel-loader',
            options: {
              plugins: ['@babel/plugin-transform-runtime'],
              presets: [
                [
                  '@babel/preset-env',
                  {
                    useBuiltIns: 'entry',
                    corejs: 3
                  }
                ]
              ]
            }
          },
          {
            loader: 'ts-loader',
            options: {
              configFile: tsconfigPath,
              happyPackMode: true,
              transpileOnly: true
            }
          }
        ]
      }
    ]
  },

  plugins: [
    new WebpackBar(),
    new ForkTsCheckerWebpackPlugin({
      useTypescriptIncrementalApi: true,
      checkSyntacticErrors: true,
      tsconfig: tsconfigPath
    }),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'src/index.ejs'),
      title: 'Counter'
    }),
    new CleanWebpackPlugin()
  ],

  optimization: {
    splitChunks: {
      cacheGroups: {
        commons: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all'
        }
      }
    }
  },

  resolve: {
    extensions: ['.js', '.ts', '.tsx', '.json'],
    plugins: [new TsconfigPathsPlugin({ configFile: tsconfigPath })]
  },

  devServer: {
    historyApiFallback: {
      rewrites: [
        {
          from: /./,
          to: '/'
        }
      ]
    }
  },

  stats: 'errors-only'
}

export default config
