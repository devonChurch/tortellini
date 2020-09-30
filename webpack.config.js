const path = require("path");
const { promisify } = require("util");
const { exec } = require("child_process");
const execAsync = promisify(exec);
const webpack = require("webpack");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");

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
const getBuildName = async () => {
  const { stdout } = await execAsync("git branch --show-current");

  return stdout
    .toLowerCase()
    .replace(/\n/g, "")
    .replace(/[^a-z]/g, "-")
    .replace(/-{2,}/g, "-");
};

module.exports = async (_, args) => {
  const buildName = await getBuildName();

  console.log({ buildName });

  return {
    entry: path.resolve(DIR_SRC, "index"),

    output: {
      path: path.resolve(DIR_DIST, buildName),
    },

    plugins: [
      new CleanWebpackPlugin(),

      new HtmlWebpackPlugin(),

      new webpack.EnvironmentPlugin({
        BRANCH_NAME: buildName,
      }),
    ],
  };
};
