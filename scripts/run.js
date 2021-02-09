const path = require('path');
const ProgramBuilder = require('brighterscript').ProgramBuilder;

let programBuilder = new ProgramBuilder();
let config = {
  "rootDir": "/home/george/hope/applicaster/zapp-roku-app/src",
  "stagingFolderPath": "/home/george/hope/applicaster/zapp-roku-app/build",
  "retainStagingFolder": true,
  "createPackage": false,
  "autoImportComponentScript": true,
  "files": [
    "manifest",
    "source/**/*.*",
    "components/**/*.*",
    "images/**/*.*",
    {
      "src": "../external/plugins-src/**/*.*",
      "dest": ""
    },
    {
      "src": "../external/plugins-core-src/**/*.*",
      "dest": ""
    },
    {
      "src": "../external/private-emmys-src/**/*.*",
      "dest": ""
    },
    {
      "src": "../external/private-oc-src/**/*.*",
      "dest": ""
    },
    {
      "src": "../external/plugins-src/**/*.*",
      "dest": ""
    },
    {
      "src": "../external/plugins-core-src/**/*.*",
      "dest": ""
    },
    {
      "src": "../external/private-emmys-src/**/*.*",
      "dest": ""
    },
    {
      "src": "../external/private-oc-src/**/*.*",
      "dest": ""
    },
    {
      "src": "!../external/plugins-src/**/*.spec.bs",
      "dest": ""
    },
    {
      "src": "!../external/plugins-core-src/**/*.spec.*",
      "dest": ""
    },
    {
      "src": "!../external/private-emmys-src/**/*.spec.*",
      "dest": ""
    },
    {
      "src": "!../external/private-oc-src/**/*.spec.*",
      "dest": ""
    },
    "!**/*.spec.*"
  ],
  "diagnosticFilters": [
    {
      "src": "**/roku_modules/**/*.*",
      "codes": [
        1107,
        1009,
        1001,
        1067
      ]
    },
    {
      "src": "**/Whitelist.xml",
      "codes": [
        1067
      ]
    },
    {
      "src": "components/maestro/generated/**/*.*",
      "codes": [
        1001
      ]
    },
    1013,
    {
      "src": "../external/plugins-src/components/YouboraAnalytics/*.*"
    },
    {
      "src": "../external/plugins-src/components/segment_analytics/*.*"
    },
    {
      "src": "../external/plugins-src/source/segment_analytics/SegmentAnalytics.brs"
    },
    {
      "src": "**/RALETrackerTask.*"
    }
  ],
  "plugins": [
    "/home/george/hope/open-source/roku-log/roku-log-bsc-plugin/dist/plugin.js",
    "/home/george/hope/open-source/maestro/maestro-roku-bsc-plugin/dist/plugin.js"
  ],
  "rooibos": {
    "isRecordingCodeCoverage": false,
    "testsFilePattern": null
  },
  "maestro": {
    "buildTimeImports": {
      "IAuthProvider": [
        "pkg:/source/AdobeAccessEnabler/AdobePrimetimeAuthPlugin.bs",
        "pkg:/source/gigya_auth_plugin_roku/ZGigyaAuthPlugin.bs"
      ],
      "IEntitlementsProvider": [
        "pkg:/source/applicaster_entitlements_plugin/ApplicasterEntitlementsPlugin.bs"
      ],
      "IBookmarksProvider": [],
      "IPlayerAnalytics": [
        "pkg:/source/YouboraAnalytics/YouboraVideoAnalytics.bs",
        "pkg:/source/segment_video_analytics/SegmentVideoAnalyticsPlugin.bs"
      ],
      "IAnalytics": [
        "pkg:/source/segment_analytics/SegmentAnalyticsPlugin.bs",
        "pkg:/source/google_analytics_roku/GoogleAnalyticsPlugin.bs"
      ]
    }
  },
  "rokuLog": {
    "strip": false,
    "insertPkgPath": true
  },
  "sourceMap": false
};
programBuilder.run(
  config
  // {
  // project: '/home/george/hope/open-source/maestro/swerve-app/bsconfig-dev.json'
  // project: path.join(__dirname, '../', 'test', 'stubProject', 'bsconfig.json')
  // }
).catch(e => {
  console.error(e);
});