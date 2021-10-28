# Goldstack Bash Utilities

This library provides various convenience methods for working with files and folders as well as interacting with the shell.

It was originally a wrapper of [shelljs](https://www.npmjs.com/package/shelljs), but since [shelljs has poor support for bundling due to a custom way to load required scripts](https://github.com/shelljs/shelljs/issues/962#issuecomment-583136465) all shelljs commands have been replaced with other libraries or vanilla Node.js file operations.

