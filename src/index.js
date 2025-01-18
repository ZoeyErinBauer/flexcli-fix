#!/usr/bin/env node

// index.js
import { Command } from 'commander';
import WebSocketClient from './utils/websocket_client.js';
import linkCommand from './commands/link.js';
import restartCommand from './commands/restart.js';
import unlinkCommand from './commands/unlink.js';
import debugCommand from './commands/debug.js';
import listCommand from './commands/list.js';
import packCommand from './commands/pack.js';
import installCommand from './commands/install.js';
import uninstallCommand from './commands/uninstall.js';
import logger from './utils/logger.js';

const program = new Command();

program
  .version('1.0.0')
  .option('--port <number>', 'WebSocket server port', '60109');

// 定义 'plugin' 命令
const plugin = program.command('plugin').description('Plugin operations');

plugin
  .command('link')
  .description('Link a plugin')
  .requiredOption('--path <path>', 'Path to the folder')
  .requiredOption('--uuid <uuid>', 'UUID string')
  .option('--debug <debug>', 'Debug mode (true/false)', 'false')
  .action(async (options) => {
    try {
      const port = program.opts().port;
      const wsClient = new WebSocketClient(port);
      await wsClient.connect();
      await linkCommand(wsClient, options);
      wsClient.close();
    } catch (error) {
      logger.error(`Error executing link command: ${error.message}`);
    }
  });

plugin
  .command('restart')
  .description('Restart a plugin')
  .requiredOption('--uuid <uuid>', 'UUID string')
  .action(async (options) => {
    try {
      const port = program.opts().port;
      const wsClient = new WebSocketClient(port);
      await wsClient.connect();
      await restartCommand(wsClient, options);
      wsClient.close();
    } catch (error) {
      logger.error(`Error executing restart command: ${error.message}`);
    }
  });

plugin
  .command('unlink')
  .description('Unlink a plugin')
  .requiredOption('--uuid <uuid>', 'UUID string')
  .option('--silent', 'Silent mode', false)
  .action(async (options) => {
    try {
      const port = program.opts().port;
      const wsClient = new WebSocketClient(port);
      await wsClient.connect();
      await unlinkCommand(wsClient, options);
      wsClient.close();
    } catch (error) {
      logger.error(`Error executing unlink command: ${error.message}`);
    }
  });

plugin
  .command('debug')
  .description('Debug a plugin')
  .requiredOption('--uuid <uuid>', 'UUID string')
  .action(async (options) => {
    try {
      const port = program.opts().port;
      const wsClient = new WebSocketClient(port);
      await wsClient.connect();
      await debugCommand(wsClient, options);
    } catch (error) {
      logger.error(`Error executing debug command: ${error.message}`);
    }
  });

plugin
  .command('list')
  .description('List all plugins')
  .action(async () => {
    try {
      const port = program.opts().port;
      const wsClient = new WebSocketClient(port);
      await wsClient.connect();
      await listCommand(wsClient);
      wsClient.close();
    } catch (error) {
      logger.error(`Error executing list command: ${error.message}`);
    }
  });

  plugin
  .command('pack')
  .description('Pack a plugin')
  .requiredOption('--path <path>', 'Path to the plugin directory')
  .action(async (options) => {
    try {
      const port = program.opts().port;
      await packCommand(null, options);
    } catch (error) {
      logger.error(`Error executing pack command: ${error.message}`);
    }
  });

  plugin
  .command('install')
  .description('Install a plugin')
  .requiredOption('--path <path>', 'Path to the .flexplugin file')
  .action(async (options) => {
    try {
      if (!options.path.endsWith('.flexplugin')) {
        logger.error('Invalid file extension. Please provide a .flexplugin file.');
        return;
      }
      const port = program.opts().port;
      const wsClient = new WebSocketClient(port);
      await wsClient.connect();
      await installCommand(wsClient, options);
      wsClient.close();
    } catch (error) {
      logger.error(`Error executing install command: ${error.message}`);
    }
  });

  plugin
  .command('uninstall')
  .description('Uninstall a plugin')
  .requiredOption('--uuid <uuid>', 'Plugin UUID')
  .action(async (options) => {
    try {
      const port = program.opts().port;
      const wsClient = new WebSocketClient(port);
      await wsClient.connect();
      await uninstallCommand(wsClient, options);
      wsClient.close();
    } catch (error) {
      logger.error(`Error executing uninstall command: ${error.message}`);
    }
  });

program.parse(process.argv);
