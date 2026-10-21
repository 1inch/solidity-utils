import path from 'path';
import { fileURLToPath } from 'node:url';

const dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * @category Docgen
 * @notice A helper method to get the path to the templates folder.
 * @returns The path to templates folder.
 */
export function oneInchTemplates(): string {
    return path.normalize(path.join(dirname, '../../docgen/templates'));
}
