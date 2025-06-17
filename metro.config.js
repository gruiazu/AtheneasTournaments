// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..'); // Ajusta si tu estructura es diferente

const config = getDefaultConfig(projectRoot);

// 1. Ignorar la carpeta 'functions'
config.resolver.blacklistRE = [
  /functions\/.*/,
];
// Alternativa más moderna (blocklist)
config.resolver.blockList = [
  /functions\/.*/,
];

// 2. Asegurarse de que Metro no se salga del directorio del proyecto
config.watchFolders = [projectRoot];

module.exports = config;