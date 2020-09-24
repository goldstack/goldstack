# typescript-monorepo-starter

Starter project for using TypeScript and Lerna.

## Install

https://yarnpkg.com/advanced/editor-sdks

```
yarn dlx @yarnpkg/pnpify --sdk vscode
```

## Run with docker image

```
docker run --rm -v $(pwd):/workspace --workdir=/workspace/packages/website-javadelight goldstack/goldstack-docker-build yarn workspace @mxro/website-javadelight deploy prod
```

## Limitations

- `test` in root does not work yet.
- `coverageThreshold` not defined (does not seem to work for some reason)

## Notes

### Max ListenersExceededWarning on `compile:watch` command

When running the `compile:watch` command in the root, you may get the following warning:

```
(node:97874) MaxListenersExceededWarning: Possible EventEmitter memory leak detected. 11 SIGINT listeners added to [process]. Use emitter.setMaxListeners() to increase limit
```

This is nothing to worry about. It is caused by the command spawning a lot of subprocesses, since an individuall `nodemon` process is started for every package that is watched (see also [this question](https://stackoverflow.com/questions/9768444/possible-eventemitter-memory-leak-detected) on stackoverflow.
