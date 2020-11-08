# Goldstack Project Root

The root of the project contains configuration shared across modules as well as various utility scripts for applying operations for all modules.

You can find the modules you have selected in the folder `packages/`.

Find further information here:

- [Project Configuration](https://docs.goldstack.party/docs/goldstack/configuration)
- [Getting Started](https://docs.goldstack.party/docs/goldstack/getting-started)
- [Security Hardening](https://docs.goldstack.party/docs/goldstack/security-hardening)

## Notes

### Max ListenersExceededWarning on `compile:watch` command

When running the `compile:watch` command in the root, you may get the following warning:

    (node:97874) MaxListenersExceededWarning: Possible EventEmitter memory leak detected. 11 SIGINT listeners added to [process]. Use emitter.setMaxListeners() to increase limit

This is nothing to worry about. It is caused by the command spawning a lot of subprocesses, since an individuall `nodemon` process is started for every package that is watched (see also [this question](https://stackoverflow.com/questions/9768444/possible-eventemitter-memory-leak-detected) on stackoverflow.
