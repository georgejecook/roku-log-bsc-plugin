# Getting started

[![build](https://img.shields.io/github/workflow/status/georgejecook/roku-log-bsc-plugin/build.svg?logo=github)](https://github.com/georgejecook/roku-log-bsc-plugin/actions?query=workflow%3Abuild)
[![GitHub](https://img.shields.io/github/release/georgejecook/roku-log-bsc-plugin.svg?style=flat-square)](https://github.com/georgejecook/roku-log-bsc-plugin/releases)
[![NPM Version](https://badge.fury.io/js/roku-log-bsc-plugin.svg?style=flat)](https://npmjs.org/package/roku-log-bsc-plugin)

- in your projects `bsconfig.json` add `plugins: ["roku-log-vsc-extension-plugin"]`
- add a section to bsconfig.json, as follows:

```
"rokuLog": {
  strip: (true|false)
  insertPkgPath: (true|false)
}
```

## Config

- if strip is set to true, then all log calls will be removed from your app
- insert_pkg_path is set to true, then the first parameter of the log message, will have the full file location added.
