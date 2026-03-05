/**
 * Marketplace Service
 * Handles order confirmation and orchestrates the automated deployment pipeline:
 *   Order Confirmed → Product Manager scan → Approval → Server Manager deploy
 */

import { scanProduct, type ScanReport } from './ProductManagerService';
import { createDeployment, type DeploymentRecord } from './ServerManagerService';

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'scanning'
  | 'awaiting_approval'
  | 'deploying'
  | 'deployed'
  | 'rejected';

export interface MarketplaceOrder {
  id: string;
  productId: string;
  productName: string;
  productFeatures: string[];
  amount: number;
  status: OrderStatus;
  customDomain?: string;
  scanReport?: ScanReport;
  deployment?: DeploymentRecord;
  createdAt: string;
  updatedAt: string;
}

export interface OrderConfirmationResult {
  order: MarketplaceOrder;
  scanReport: ScanReport;
  deployment: DeploymentRecord;
}

/**
 * Confirm an order and automatically trigger:
 *  1. Product Manager scan
 *  2. Server Manager deployment creation (pending approval)
 *
 * Returns the updated order with scan report and deployment record.
 */
export async function confirmOrder(
  orderId: string,
  productId: string,
  productName: string,
  productFeatures: string[],
  amount: number,
  customDomain?: string
): Promise<OrderConfirmationResult> {
  const now = new Date().toISOString();

  let order: MarketplaceOrder = {
    id: orderId,
    productId,
    productName,
    productFeatures,
    amount,
    status: 'scanning',
    customDomain,
    createdAt: now,
    updatedAt: now,
  };

  // Step 1 – Product Manager: scan project
  const scanReport = await scanProduct(productId, productName, productFeatures);
  order = { ...order, scanReport, status: 'awaiting_approval', updatedAt: new Date().toISOString() };

  // Step 2 – Server Manager: create deployment environment (status = pending until approved)
  const deployment = await createDeployment(orderId, productId, productName, customDomain);
  order = { ...order, deployment, updatedAt: new Date().toISOString() };

  return { order, scanReport, deployment };
}

/**
 * Trigger an AI command that maps natural-language intents to pipeline actions.
 * Returns a human-readable result string.
 */
export async function handleAICommand(
  command: string,
  context: {
    productId?: string;
    productName?: string;
    productFeatures?: string[];
    orderId?: string;
  } = {}
): Promise<string> {
  const cmd = command.toLowerCase().trim();

  if (cmd.includes('scan')) {
    if (!context.productId || !context.productName) {
      return 'Please provide productId and productName to scan.';
    }
    const report = await scanProduct(
      context.productId,
      context.productName,
      context.productFeatures ?? []
    );
    return `Scan complete: ${report.summary}`;
  }

  if (cmd.includes('deploy')) {
    if (!context.orderId || !context.productId || !context.productName) {
      return 'Please provide orderId, productId, and productName to deploy.';
    }
    const dep = await createDeployment(
      context.orderId,
      context.productId,
      context.productName
    );
    return `Deployment created: ${dep.id} → ${dep.domain} (status: ${dep.status})`;
  }

  if (cmd.includes('lock')) {
    return `Lock command acknowledged for product ${context.productId ?? 'unknown'}. Use ProductManagerService.lockProduct() to persist.`;
  }

  return `Unknown command: "${command}". Supported: scan, deploy, lock.`;
}
