<p align="center">
  <img src="images/logo.png" alt="Plugin for updating logs in roku-log with vscode ide" width="200" height="200"/>
</p>

# Getting started

- in your projects `bsconfig.json` add `plugins: ["roku-log-vsc-extension-plugin"]`
- add a section to bsconfig.json, as follows:

```
"rokuLog": {
  strip: (true|false)
  insertPkgPath: (true|false)
}
```

## config
 - if strip is set to true, then all log calls will be removed from your app
 - insert_pkg_path is set to true, then the first parameter of the log message, will have the full file location added.