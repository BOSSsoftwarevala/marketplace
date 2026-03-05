// src/config/roleConfig.ts

/**
 * Role Definitions for BOSS Software
 *
 * This file contains the standardized role definitions, role hierarchy, and role validation mapping for all user roles.
 */

// Define roles
const roles = {
    ADMIN: 'Admin',
    EDITOR: 'Editor',
    VIEWER: 'Viewer',
};

// Define role hierarchy
const roleHierarchy = {
    [roles.ADMIN]: [roles.EDITOR, roles.VIEWER],  // Admin can manage both editor and viewer roles
    [roles.EDITOR]: [roles.VIEWER],  // Editor can manage viewer roles
    [roles.VIEWER]: [],  // Viewer has no roles to manage
};

// Validation mapping for roles
const roleValidation = {
    [roles.ADMIN]: (user) => user.isAdmin,
    [roles.EDITOR]: (user) => user.isEditor,
    [roles.VIEWER]: (user) => user.isViewer,
};

export { roles, roleHierarchy, roleValidation };