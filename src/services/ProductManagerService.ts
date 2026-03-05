/**
 * Product Manager Service
 * Handles project scanning, lock/unlock, and deployment approval workflow.
 */

import { supabase } from '@/integrations/supabase/client';

export type Framework =
  | 'React'
  | 'Vue'
  | 'Angular'
  | 'Node.js'
  | 'Python'
  | 'PHP'
  | 'Laravel'
  | 'Django'
  | 'FastAPI'
  | 'Next.js'
  | 'Nuxt.js'
  | 'Unknown';

export type Database =
  | 'PostgreSQL'
  | 'MySQL'
  | 'MongoDB'
  | 'SQLite'
  | 'Redis'
  | 'None'
  | 'Unknown';

export type LockStatus = 'locked' | 'unlocked';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface ScanReport {
  productId: string;
  framework: Framework;
  dependencies: string[];
  database: Database;
  apiEndpoints: string[];
  scannedAt: string;
  summary: string;
}

export interface ProductScan {
  id: string;
  productId: string;
  report: ScanReport;
  createdAt: string;
}

export interface ProductDeploymentState {
  productId: string;
  lockStatus: LockStatus;
  approvalStatus: ApprovalStatus;
  rejectionReason?: string;
  lastScanAt?: string;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function detectFramework(name: string, features: string[]): Framework {
  const combined = (name + ' ' + features.join(' ')).toLowerCase();
  if (combined.includes('react') || combined.includes('next')) return 'React';
  if (combined.includes('vue') || combined.includes('nuxt')) return 'Vue';
  if (combined.includes('angular')) return 'Angular';
  if (combined.includes('django') || combined.includes('python')) return 'Python';
  if (combined.includes('laravel') || combined.includes('php')) return 'Laravel';
  if (combined.includes('node') || combined.includes('express')) return 'Node.js';
  return 'Unknown';
}

function detectDatabase(features: string[]): Database {
  const text = features.join(' ').toLowerCase();
  if (text.includes('postgres') || text.includes('supabase')) return 'PostgreSQL';
  if (text.includes('mysql') || text.includes('mariadb')) return 'MySQL';
  if (text.includes('mongo')) return 'MongoDB';
  if (text.includes('sqlite')) return 'SQLite';
  if (text.includes('redis')) return 'Redis';
  return 'Unknown';
}

function extractApiEndpoints(features: string[]): string[] {
  const endpoints: string[] = [];
  for (const f of features) {
    endpoints.push(`/api/${f.toLowerCase().replace(/\s+/g, '-')}`);
  }
  return endpoints.slice(0, 5);
}

// ─── Public API ─────────────────────────────────────────────────────────────

/**
 * Scan a product project and return a structured report.
 * In a real system this would invoke a Supabase Edge Function or CI job.
 */
export async function scanProduct(
  productId: string,
  productName: string,
  features: string[]
): Promise<ScanReport> {
  const framework = detectFramework(productName, features);
  const database = detectDatabase(features);
  const apiEndpoints = extractApiEndpoints(features);
  const dependencies = [
    framework !== 'Unknown' ? framework.toLowerCase() : 'custom',
    'typescript',
    database !== 'Unknown' && database !== 'None' ? database.toLowerCase() : null,
  ].filter(Boolean) as string[];

  const report: ScanReport = {
    productId,
    framework,
    dependencies,
    database,
    apiEndpoints,
    scannedAt: new Date().toISOString(),
    summary: `Detected ${framework} project with ${database} database and ${apiEndpoints.length} API endpoints.`,
  };

  // Persist scan result
  try {
    await supabase.from('product_scans').insert({
      product_id: productId,
      framework,
      database_type: database,
      dependencies,
      api_endpoints: apiEndpoints,
      scan_report: report as unknown as Record<string, unknown>,
      scanned_at: report.scannedAt,
    });
  } catch {
    // Table may not exist in dev; silently continue
  }

  return report;
}

/**
 * Lock a product to prevent deployment changes.
 */
export async function lockProduct(productId: string): Promise<void> {
  try {
    await supabase
      .from('products')
      .update({ lock_status: 'locked' })
      .eq('id', productId);
  } catch {
    // Table may not exist in dev; silently continue
  }
}

/**
 * Unlock a product to allow deployment changes.
 */
export async function unlockProduct(productId: string): Promise<void> {
  try {
    await supabase
      .from('products')
      .update({ lock_status: 'unlocked' })
      .eq('id', productId);
  } catch {
    // Table may not exist in dev; silently continue
  }
}

/**
 * Approve deployment of a product.
 */
export async function approveDeployment(productId: string): Promise<void> {
  try {
    await supabase
      .from('products')
      .update({ deployment_approval: 'approved' })
      .eq('id', productId);
  } catch {
    // Table may not exist in dev; silently continue
  }
}

/**
 * Reject deployment of a product with a reason.
 */
export async function rejectDeployment(productId: string, reason: string): Promise<void> {
  try {
    await supabase
      .from('products')
      .update({ deployment_approval: 'rejected', rejection_reason: reason })
      .eq('id', productId);
  } catch {
    // Table may not exist in dev; silently continue
  }
}
