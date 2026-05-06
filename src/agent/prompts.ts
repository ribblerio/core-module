import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const promptsDir = join(__dirname, '../../prompts');

export const ANALYST_V1 = readFileSync(join(promptsDir, 'analyst-v1.md'), 'utf-8');
export const ANALYST_PROMPT_VERSION = 'analyst-v1';
