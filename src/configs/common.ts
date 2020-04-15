import { resolve } from 'path';
import { RuleSetRule } from 'webpack';
import { loader } from 'mini-css-extract-plugin';

export function getEnvironment() {
  const env = process.env.NODE_ENV || 'development';
  const develop = env === 'development';
  const test = env === 'test';
  const production = env === 'production';

  return {
    env,
    develop,
    test,
    production,
  };
}

export function setEnvironment(variables: Record<string, string>) {
  Object.keys(variables).forEach((key) => (process.env[key] = variables[key]));
}

export function getDefineVariables(variables: Record<string, string>) {
  return Object.entries(variables).reduce((obj, [name, value]) => {
    obj[`process.env.${name}`] = JSON.stringify(value);
    return obj;
  }, {});
}

export function isLocal(path: string) {
  if (path) {
    if (path.startsWith(':')) {
      return false;
    } else if (path.startsWith('http:')) {
      return false;
    } else if (path.startsWith('https:')) {
      return false;
    } else if (path.startsWith('data:')) {
      return false;
    }

    return true;
  }

  return false;
}

export function getStyleLoader() {
  return process.env.NODE_ENV !== 'production' ? 'style-loader' : loader;
}

export function getRules(baseDir: string): Array<RuleSetRule> {
  const styleLoader = getStyleLoader();

  return [
    {
      test: /\.(png|jpe?g|gif|mp4|mp3|svg|ogg|webp|wav)$/i,
      use: [
        {
          loader: 'file-loader',
          options: {
            esModule: false,
          },
        },
      ],
    },
    {
      test: /\.s[ac]ss$/i,
      use: [styleLoader, 'css-loader', 'sass-loader'],
    },
    {
      test: /\.css$/i,
      use: [styleLoader, 'css-loader'],
    },
    {
      test: /\.tsx?$/,
      loaders: [
        {
          loader: 'awesome-typescript-loader',
          options: {
            tsconfig: resolve(baseDir, 'tsconfig.json'),
          },
        },
      ],
    },
    {
      test: /\.codegen$/,
      use: [
        {
          loader: require.resolve('../loaders/codegen'),
        },
      ],
    },
    {
      enforce: 'pre',
      test: /\.js$/,
      loader: 'source-map-loader',
      exclude: resolve(baseDir, 'node_modules'),
    },
  ];
}