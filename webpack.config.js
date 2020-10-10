const path = require("path");
const webpack = require("webpack");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");

const PRODUCTION = "production";
const DEVELOPMENT = "development";
const { BRANCH_NAME_FULL = "local" } = process.env;
const DIR_SRC = path.resolve(__dirname, "src");
const DIR_DIST = path.resolve(__dirname, "dist");

/**
 * Extracts the unique part of a the current git branch.
 * @example "feature/my-new-thing" // "feature-my-new-thing"
 * @example "bugfix/my-issue" // "bugfix-my-issue"
 * @example "master" // "master"
 *
 * @note We use this as a build name identifier that adds the application code
 * to a nested folder. This way an application can have multiple builds associated
 * to it and we can toggle between them on a per environment basis.
 * @exmaple http://localhost:8000/feature-my-new-thing/index.html
 * @exmaple https://staging.app.com/bugfix-my-issue/index.html
 * @exmaple https://produciton.app.com/master/index.html
 *
 * @returns {String}
 */
const getBuildName = () =>
  BRANCH_NAME_FULL.toLowerCase()

    // Azure incorrectly pulls out the branch name by only getting the last segment
    // from a "/" delimiter.
    // @example feature/foo ---> "foo"
    // @example bugfix/bar ---> "bar"
    // Azure has decided not to fix this issue
    // @see https://github.com/microsoft/azure-pipelines-agent/issues/838
    // In our case we need to get the "full" branch reference then remove the excess.
    .replace(/refs\/heads\//g, "")

    .replace(/\n/g, "")
    .replace(/[^a-z]/g, "-")
    .replace(/-{2,}/g, "-");

module.exports = async (_, args) => {
  const MODE = args.mode;
  const IS_NOT_DEVELOPMENT = MODE !== DEVELOPMENT;
  const IS_DEVELOPMENT = !IS_NOT_DEVELOPMENT;

  const buildName = getBuildName();

  console.log({ BRANCH_NAME_FULL, DIR_SRC, DIR_DIST, buildName });

  return {
    entry: path.resolve(DIR_SRC, "index"),

    output: {
      path: path.resolve(DIR_DIST, buildName),
      filename: "[name]-[hash].js"
    },

    plugins: [
      new CleanWebpackPlugin(),

      new HtmlWebpackPlugin(),

      new webpack.EnvironmentPlugin({
        BUILD_NAME: buildName,
      }),

      // We need to simulate the Azure Pipeline deploy sequence where each environment
      // is populated with a custom configuration to the domain root. Here we copy
      // our config across into the `/dist/` folder to be picked up with the local
      // DevServer to emulate a environment agnostic run time initialisation.
      IS_DEVELOPMENT &&
        new CopyPlugin({
          patterns: [
            {
              from: path.resolve(DIR_SRC, "env.config.json"),
              to: path.resolve(DIR_DIST, BRANCH_NAME_FULL, "env.config.json"),
            },
          ],
        }),
    ].filter(Boolean),
  };
};
