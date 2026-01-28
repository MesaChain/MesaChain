import type { StorybookConfig } from '@storybook/react-webpack5';
declare const require: any;

function getAbsolutePath(value: string) {
  const pkgPath = require.resolve(`${value}/package.json`);
  return pkgPath.replace(/[\\\/][^\\\/]*$/, "");
}
const config: StorybookConfig = {
  "stories": [
    "../stories/**/*.mdx",
    "../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  "addons": [
    getAbsolutePath('@storybook/addon-essentials'),
    getAbsolutePath('@storybook/addon-links'),
    getAbsolutePath('@storybook/addon-interactions')
  ],
  "framework": getAbsolutePath('@storybook/react-webpack5'),
  "staticDirs": [
    "..\\public"
  ]
};
export default config;
