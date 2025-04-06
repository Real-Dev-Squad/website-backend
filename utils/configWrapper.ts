// This file is a wrapper for the config module to make it work with ES modules
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const config = require('config');

export default config; 