// commands/pack.js
import fs from 'fs';
import path from 'path';
import archiver from 'archiver';  // 用于压缩文件夹
import logger from '../utils/logger.js';
import Ajv from 'ajv';  // JSON Schema 验证库
import manifestSchema from '../assets/manifest_schema.json' assert { type: 'json' };


const ajv = new Ajv();
const validateManifest = ajv.compile(manifestSchema);

/**
 * Handles the 'pack' command.
 * @param {WebSocketClient} wsClient - The WebSocket client instance.
 * @param {Object} options - The command options.
 */
export default async function packCommand(wsClient, options) {
  const { path: pluginPath } = options;
  const pluginDir = path.resolve(pluginPath);

  // Validate directory structure
  const requiredDirs = ['backend', 'resources', 'ui'];
  const requiredFile = 'manifest.json';
  
  if (!fs.existsSync(pluginDir)) {
    logger.error(`Plugin directory ${pluginDir} does not exist.`);
    return;
  }

  // Validate subdirectories
  const missingDirs = requiredDirs.filter((dir) => !fs.existsSync(path.join(pluginDir, dir)));
  if (missingDirs.length > 0) {
    logger.error(`Missing required directories: ${missingDirs.join(', ')}`);
    return;
  }

  // Validate manifest.json file
  const manifestPath = path.join(pluginDir, requiredFile);
  if (!fs.existsSync(manifestPath)) {
    logger.error(`Missing required file: ${requiredFile}`);
    return;
  }

  const manifestData = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
  const valid = validateManifest(manifestData);
  if (!valid) {
    logger.error(`Invalid manifest.json: ${ajv.errorsText(validateManifest.errors)}`);
    return;
  }
  
  const zipFilePath = path.join(path.dirname(pluginDir), `${manifestData.uuid}.flexplugin`);

  // Compress the plugin directory into a zip file using archiver
  try {
    logger.info(`Packing plugin directory: ${pluginDir}`);
    const output = fs.createWriteStream(zipFilePath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', () => {
      logger.info(`Plugin packed successfully to: ${zipFilePath}`);
    });

    archive.on('error', (err) => {
      logger.error(`Error while packing: ${err.message}`);
    });

    archive.pipe(output);

    // Append all files and directories inside the plugin directory
    archive.directory(pluginDir, false);

    await archive.finalize();
  } catch (error) {
    logger.error(`Error during packing: ${error.message}`);
  }
}
