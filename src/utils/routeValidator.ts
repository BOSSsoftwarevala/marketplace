// @ts-nocheck
// routeValidator.ts

// Utility functions for route validation

/**
 * Validates a given route.
 * @param route - The route to validate.
 * @returns true if valid, false otherwise.
 */
export function validateRoute(route: string): boolean {
    const routePattern = /^\/([a-zA-Z0-9-_]+(\/|$))*$/;
    return routePattern.test(route);
}

/**
 * Checks for duplicate routes in an array of routes.
 * @param routes - Array of routes to check.
 * @returns An array of duplicate routes.
 */
export function detectDuplicateRoutes(routes: string[]): string[] {
    const seen = new Set();
    const duplicates = new Set();

    for (const route of routes) {
        if (seen.has(route)) {
            duplicates.add(route);
        } else {
            seen.add(route);
        }
    }
    return Array.from(duplicates);
}

/**
 * Organizes routes by their base paths.
 * @param routes - Array of routes to organize.
 * @returns An object grouping routes by their base paths.
 */
export function organizeRoutes(routes: string[]): Record<string, string[]> {
    const organized: Record<string, string[]> = {};

    for (const route of routes) {
        const basePath = route.split('/')[1] || 'root';
        if (!organized[basePath]) {
            organized[basePath] = [];
        }
        organized[basePath].push(route);
    }
    return organized;
}