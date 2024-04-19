import path from 'path';

/**
 * @category Docgen
 * @notice A helper method to get the path to the templates folder.
 * @returns The the path to templates folder.
 */
export function oneInchTemplates(): string {
    return path.normalize(path.join(__dirname, '../../docgen/templates'));
}
