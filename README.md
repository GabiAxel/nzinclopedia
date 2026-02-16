# Nzinclopedia

## Development and runtime requirements

- [NodeJS](https://nodejs.org/) (or a compatible runtime)

## NPM dependency installation

```shell
npm install
```

## Starting the development server

```shell
npm run dev
```

## Building for production

```shell
npm run build
```

If the deployment target is not the root path (/), set the environment variable `BASE_PATH` to the target deployment path, for example:

```shell
BASE_PATH=/nzinclopedia npm run build
```
