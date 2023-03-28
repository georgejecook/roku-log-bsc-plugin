# Getting started

[![build](https://img.shields.io/github/actions/workflow/status/georgejecook/roku-log-bsc-plugin/build.yml?branch=master)](https://github.com/georgejecook/roku-log-bsc-plugin/actions/workflows/build.yml)
[![GitHub](https://img.shields.io/github/release/georgejecook/roku-log-bsc-plugin.svg?style=flat-square)](https://github.com/georgejecook/roku-log-bsc-plugin/releases)
[![NPM Version](https://badge.fury.io/js/roku-log-bsc-plugin.svg?style=flat)](https://npmjs.org/package/roku-log-bsc-plugin)

- `npm i roku-log-bsc-plugin --save-dev`
- In your projects `bsconfig.json` add `plugins: ["roku-log-bsc-plugin"]`
- Add a section to bsconfig.json, as follows:

```json
  "rokuLog": {
    "strip": false,
    "insertPkgPath": true,
    "removeComments": true
  },
```

## Options

- `strip` - if true, then all log calls will be removed from your app
- `insertPkgPath` - if true, then the first parameter of the log message, will have the full file location added.
- `removeComments` - if true, then all comments are replaced with empty lines
