// commands/link.js
import logger from '../utils/logger.js';
import path from 'path';
/**
 * Handles the 'install' command.
 * @param {WebSocketClient} wsClient - The WebSocket client instance.
 * @param {Object} options - The command options.
 */
export default async function installCommand(wsClient, options) {
  const pluginPath = path.resolve(options.path);

  const cmd = {
    cmd: 'plugin',
    operation: 'install',
    path: pluginPath,
  }

  try {
    const response = await wsClient.sendCommand(cmd);
    if (response.payload.result === 'success') {
      logger.info(`Install command successful: ${JSON.stringify(response, null, 2)}`);
    } else {
      logger.error(`Install command failed: ${JSON.stringify(response, null, 2)}`);
    }
  } catch (error) {
    logger.error(`Error in install command: ${error.message}`);
  }
}
