// assets/templates.js
import Handlebars from 'handlebars';

// 模板：.gitignore
export const gitignoreTemplate = `node_modules
logs
.vscode
.env
`;

// 模板：package.json
export const packageJsonTemplate = `{
  "scripts": {
    "build": "rollup -c",
    "dev": "npm-run-all plugin:unlink plugin:link -p plugin:watch plugin:debug",
    "plugin:watch": "rollup -c -w --watch.onEnd=\\"npm run plugin:restart\\"",
    "plugin:unlink": "flexcli plugin unlink --uuid {{uuid}} --silent",
    "plugin:link": "flexcli plugin link --path {{uuid}}.plugin --uuid {{uuid}} --start false",
    "plugin:restart": "flexcli plugin restart --uuid={{uuid}}",
    "plugin:debug": "flexcli plugin debug --uuid={{uuid}}",
    "plugin:validate": "flexcli plugin validate --path {{uuid}}.plugin",
    "plugin:pack": "flexcli plugin pack --path {{uuid}}.plugin",
    "plugin:install": "flexcli plugin install --path ./{{uuid}}.flexplugin --force"
  },
  "type": "commonjs",
  "devDependencies": {
    "@rollup/plugin-commonjs": "^28.0.0",
    "@rollup/plugin-node-resolve": "^15.2.2",
    "@rollup/plugin-terser": "^0.4.4",
    "@rollup/plugin-typescript": "^12.1.0",
    "@rollup/plugin-json": "^6.1.0",
    "glob": "^11.0.1",
    "npm-run-all": "^4.1.5",
    "rollup": "^4.0.2"
  },
  "dependencies": {
    "@eniac/flexdesigner": "^1.0.1",
  }
}
`;

// 模板：rollup.config.mjs
export const rollupConfigTemplate = `import commonjs from "@rollup/plugin-commonjs";
import nodeResolve from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";
import path from "node:path";
import url from "node:url";
import json from '@rollup/plugin-json';
import { glob } from 'glob'
const isWatching = !!process.env.ROLLUP_WATCH;
const flexPlugin = "{{uuid}}.plugin";

/**
 * @type {import('rollup').RollupOptions}
 */
const config = {
  input: "src/plugin.js",
  output: {
    file: \`\${flexPlugin}/backend/plugin.cjs\`,
    format: "cjs",
    sourcemap: isWatching,
    sourcemapPathTransform: (relativeSourcePath, sourcemapPath) => {
      return url.pathToFileURL(path.resolve(path.dirname(sourcemapPath), relativeSourcePath)).href;
    },
  },
  plugins: [
    json(),
    {
      name: "watch-externals",
      buildStart: function () {
        this.addWatchFile(\`\${flexPlugin}/manifest.json\`);
        const vueFiles = glob.sync(\`\${flexPlugin}/ui/*.vue\`);
        vueFiles.forEach((file) => {
          this.addWatchFile(file);
        });
      },
    },
    nodeResolve({
      browser: false,
      exportConditions: ["node"],
      preferBuiltins: true
    }),
    commonjs(),
    !isWatching && terser(),
    {
      name: "emit-module-package-file",
      generateBundle() {
        this.emitFile({ fileName: "package.json", source: \`{ "type": "module" }\`, type: "asset" });
      }
    }
  ],
  external: id => id.endsWith('.node')
};

export default config;
`;

// 模板：manifest.json
export const manifestJsonTemplate = `{
    "name": "{{name}}",
    "uuid": "{{uuid}}",
    "version": "{{version}}",
    "author": "{{author}}",
    "entry": "backend/plugin.cjs",
    "description": "{{description}}",
    "repo": "{{repo}}",
    "sdk": {
        "version": "1.0.0"
    },
    "software": {
        "minimumVersion": "1.0.0"
    },
    "os": [
        {
            "platform": "mac",
            "minimumVersion": "10.15"
        },
        {
            "platform": "windows",
            "minimumVersion": "10"
        }
    ],
    "device": [
        {
            "name": "flexbar",
            "version": "1.0.0"
        }
    ],
    "configPage": "",
    "keyLibrary": {
        "title": "$PluginName",
        "style": {
            "icon": "mdi mdi-puzzle"
        },
        "children": []
    },
    "local": {
        "en": {
            "PluginName": "{{name}}"
        }
    }
}
`;

// 模板：config.json
export const configJsonTemplate = `{}`;

// 模板：plugin.js
export const pluginJsTemplate = `const { plugin, logger, pluginPath, resourcesPath } = require("flexdesigner")

/**
 * Called when current active window changes
 * {
 *    "status": "changed",
 *    "oldWin": OldWindow,
 *    "newWin": NewWindow
 * }
 */
plugin.on('system.actwin', (payload) => {
    logger.info('Active window changed:', payload)
})

/**
 * Called when received message from UI send by this.$fd.sendToBackend
 * @param {object} payload message sent from UI
 */
plugin.on('ui.message', async (payload) => {
    logger.info('Received message from UI:', payload)
    return 'Hello from plugin backend!'
})

/**
 * Called when device status changes
 * @param {object} devices device status data
 * [
 *  {
 *    serialNumber: '',
 *    deviceData: {
 *       platform: '',
 *       profileVersion: '',
 *       firmwareVersion: '',
 *       deviceName: '',
 *       displayName: ''
 *    }
 *  }
 * ]
 */
plugin.on('device.status', (devices) => {
    logger.info('Device status changed:', devices)
})


/**
 * Called when a plugin key is loaded
 * @param {Object} payload alive key data
 * {
 *  serialNumber: '',
 *  keys: []
 * }
 */
plugin.on('plugin.alive', (payload) => {
    logger.info('Plugin alive:', payload)
})


/**
 * Called when user interacts with a key
 * @param {object} payload key data 
 * {
 *  serialNumber, 
 *  data
 * }
 */
plugin.on('plugin.data', (payload) => {
    logger.info('Received plugin.data:', payload)
})

// Connect to flexdesigner and start the plugin
plugin.start()
`;
