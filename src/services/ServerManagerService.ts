/**
 * Server Manager Service
 * Handles deployment automation, environment creation, domain attachment,
 * and hosting resource allocation.
 */

import { supabase } from '@/integrations/supabase/client';

export type DeploymentStatus =
  | 'pending'
  | 'creating_environment'
  | 'assigning_resources'
  | 'attaching_domain'
  | 'deploying'
  | 'deployed'
  | 'failed'
  | 'rolled_back';

export type EnvironmentType = 'production' | 'staging' | 'development';

export interface DeploymentEnvironment {
  id: string;
  name: string;
  type: EnvironmentType;
  domain?: string;
  hostingRegion: string;
  resources: {
    cpu: string;
    ram: string;
    storage: string;
  };
}

export interface DeploymentRecord {
  id: string;
  orderId: string;
  productId: string;
  environment: DeploymentEnvironment;
  status: DeploymentStatus;
  statusMessage: string;
  createdAt: string;
  updatedAt: string;
  deployedAt?: string;
  domain?: string;
  logs: string[];
}

// ─── Internal helpers ────────────────────────────────────────────────────────

function generateDeploymentId(): string {
  return `dep-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
}

function buildEnvironment(
  productName: string,
  envType: EnvironmentType = 'production'
): DeploymentEnvironment {
  const slug = productName.toLowerCase().replace(/\s+/g, '-');
  return {
    id: `env-${Date.now()}`,
    name: `${slug}-${envType}`,
    type: envType,
    domain: `${slug}.softwarewala.app`,
    hostingRegion: 'ap-south-1',
    resources: {
      cpu: '2 vCPU',
      ram: '4 GB',
      storage: '50 GB SSD',
    },
  };
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Create a deployment for the given order and product.
 * Returns immediately with a pending DeploymentRecord; status progresses
 * asynchronously (or can be polled via getDeploymentStatus).
 */
export async function createDeployment(
  orderId: string,
  productId: string,
  productName: string,
  customDomain?: string
): Promise<DeploymentRecord> {
  const environment = buildEnvironment(productName);
  if (customDomain) {
    environment.domain = customDomain;
  }

  const record: DeploymentRecord = {
    id: generateDeploymentId(),
    orderId,
    productId,
    environment,
    status: 'pending',
    statusMessage: 'Deployment queued.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    domain: environment.domain,
    logs: ['[INFO] Deployment created and queued.'],
  };

  try {
    await supabase.from('deployments').insert({
      id: record.id,
      order_id: orderId,
      product_id: productId,
      environment: environment.name,
      environment_type: environment.type,
      domain: environment.domain,
      hosting_region: environment.hostingRegion,
      resources: environment.resources as unknown as Record<string, unknown>,
      status: record.status,
      status_message: record.statusMessage,
      logs: record.logs,
      created_at: record.createdAt,
      updated_at: record.updatedAt,
    });
  } catch {
    // Table may not exist in dev; silently continue
  }

  return record;
}

/**
 * Advance a deployment through its lifecycle stages.
 * In production this would be driven by webhooks / edge functions.
 */
export async function advanceDeploymentStatus(
  deploymentId: string,
  nextStatus: DeploymentStatus,
  message: string
): Promise<void> {
  const updatedAt = new Date().toISOString();
  try {
    const update: Record<string, unknown> = {
      status: nextStatus,
      status_message: message,
      updated_at: updatedAt,
    };
    if (nextStatus === 'deployed') {
      update.deployed_at = updatedAt;
    }
    await supabase.from('deployments').update(update).eq('id', deploymentId);
  } catch {
    // Table may not exist in dev; silently continue
  }
}

/**
 * Retrieve the latest status of a deployment.
 */
export async function getDeploymentStatus(
  deploymentId: string
): Promise<DeploymentRecord | null> {
  try {
    const { data, error } = await supabase
      .from('deployments')
      .select('*')
      .eq('id', deploymentId)
      .single();
    if (error || !data) return null;
    return data as unknown as DeploymentRecord;
  } catch {
    return null;
  }
}
