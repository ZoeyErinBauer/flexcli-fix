// commands/create.js
import fs from 'fs';
import path from 'path';
import Handlebars from 'handlebars';
import { 
  gitignoreTemplate,
  packageJsonTemplate,
  rollupConfigTemplate,
  manifestJsonTemplate,
  configJsonTemplate,
  pluginJsTemplate
} from '../assets/templates.js';

import logger from '../utils/logger.js';

/**
 * Creates a basic workspace for a plugin.
 * @param {Object} answers - The user inputs from inquirer.
 */
export default async function createCommand(answers) {
  const { pluginPath, name, author, uuid, version, description, repo } = answers;

  try {
    const baseDir = path.resolve(pluginPath); 
    const pluginDir = path.join(baseDir, `${uuid}.plugin`);
    const srcDir = path.join(baseDir, 'src');

    fs.mkdirSync(pluginDir, { recursive: true });
    fs.mkdirSync(path.join(pluginDir, 'backend'), { recursive: true });
    fs.mkdirSync(path.join(pluginDir, 'logs'), { recursive: true });
    fs.mkdirSync(path.join(pluginDir, 'resources'), { recursive: true });
    fs.mkdirSync(path.join(pluginDir, 'ui'), { recursive: true });
    fs.mkdirSync(srcDir, { recursive: true });

    createFile(baseDir, '.gitignore', gitignoreTemplate);
    createFile(baseDir, 'package.json', packageJsonTemplate, { uuid });
    createFile(baseDir, 'rollup.config.mjs', rollupConfigTemplate, { uuid });
    createFile(pluginDir, 'manifest.json', manifestJsonTemplate, { name, author, uuid, version, description, repo });
    createFile(pluginDir, 'config.json', configJsonTemplate);
    createFile(srcDir, 'plugin.js', pluginJsTemplate);
  } catch (err) {
    logger.error(`Failed to create workspace: ${err.message}`);
  }
}

function createFile(basePath, filename, template, data = {}) {
  const compiledTemplate = Handlebars.compile(template);
  const content = compiledTemplate(data);
  fs.writeFileSync(path.join(basePath, filename), content, 'utf-8');
}
