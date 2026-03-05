import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  ScanSearch,
  Lock,
  Unlock,
  CheckCircle,
  XCircle,
  Package,
  Database,
  Globe,
  Cpu,
  AlertTriangle,
  Clock,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  scanProduct,
  lockProduct,
  unlockProduct,
  approveDeployment,
  rejectDeployment,
  type ScanReport,
  type LockStatus,
  type ApprovalStatus,
} from '@/services/ProductManagerService';

interface Product {
  id: string;
  name: string;
  features: string[];
}

interface ProductManagerDashboardProps {
  product: Product;
}

export function ProductManagerDashboard({ product }: ProductManagerDashboardProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [scanReport, setScanReport] = useState<ScanReport | null>(null);
  const [lockStatus, setLockStatus] = useState<LockStatus>('unlocked');
  const [approvalStatus, setApprovalStatus] = useState<ApprovalStatus>('pending');
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);

  // ── Actions ──────────────────────────────────────────────────────────────

  const handleScan = async () => {
    setIsScanning(true);
    try {
      const report = await scanProduct(product.id, product.name, product.features);
      setScanReport(report);
      toast.success('Scan complete', { description: report.summary });
    } catch {
      toast.error('Scan failed. Please try again.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleLock = async () => {
    await lockProduct(product.id);
    setLockStatus('locked');
    toast.success('Project locked – deployment changes are now blocked.');
  };

  const handleUnlock = async () => {
    await unlockProduct(product.id);
    setLockStatus('unlocked');
    toast.success('Project unlocked – deployment changes are allowed.');
  };

  const handleApprove = async () => {
    await approveDeployment(product.id);
    setApprovalStatus('approved');
    toast.success('Deployment approved.');
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a rejection reason.');
      return;
    }
    await rejectDeployment(product.id, rejectionReason);
    setApprovalStatus('rejected');
    setShowRejectInput(false);
    toast.error('Deployment rejected.', { description: rejectionReason });
  };

  // ── Helpers ───────────────────────────────────────────────────────────────

  const approvalColor: Record<ApprovalStatus, string> = {
    pending: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    approved: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    rejected: 'bg-red-500/20 text-red-400 border-red-500/30',
  };

  const lockColor: Record<LockStatus, string> = {
    locked: 'bg-red-500/20 text-red-400 border-red-500/30',
    unlocked: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Package className="h-5 w-5 text-purple-400" />
            Product Manager
          </h2>
          <p className="text-slate-400 text-sm mt-0.5">{product.name}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={lockColor[lockStatus]}>
            {lockStatus === 'locked' ? (
              <Lock className="h-3 w-3 mr-1" />
            ) : (
              <Unlock className="h-3 w-3 mr-1" />
            )}
            {lockStatus === 'locked' ? 'Locked' : 'Unlocked'}
          </Badge>
          <Badge className={approvalColor[approvalStatus]}>
            {approvalStatus === 'approved' && <CheckCircle className="h-3 w-3 mr-1" />}
            {approvalStatus === 'rejected' && <XCircle className="h-3 w-3 mr-1" />}
            {approvalStatus === 'pending' && <Clock className="h-3 w-3 mr-1" />}
            {approvalStatus.charAt(0).toUpperCase() + approvalStatus.slice(1)}
          </Badge>
        </div>
      </div>

      {/* Control Panel */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-slate-300">Control Panel</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              onClick={handleScan}
              disabled={isScanning}
              className="gap-1.5"
            >
              <ScanSearch className="h-3.5 w-3.5" />
              {isScanning ? 'Scanning…' : 'Scan Project'}
            </Button>

            {lockStatus === 'unlocked' ? (
              <Button size="sm" variant="destructive" onClick={handleLock} className="gap-1.5">
                <Lock className="h-3.5 w-3.5" />
                Lock Project
              </Button>
            ) : (
              <Button size="sm" variant="outline" onClick={handleUnlock} className="gap-1.5">
                <Unlock className="h-3.5 w-3.5" />
                Unlock Project
              </Button>
            )}

            <Button
              size="sm"
              variant="outline"
              onClick={handleApprove}
              disabled={approvalStatus === 'approved' || lockStatus === 'locked'}
              className="gap-1.5 border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10"
            >
              <CheckCircle className="h-3.5 w-3.5" />
              Approve Deployment
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowRejectInput(true)}
              disabled={approvalStatus === 'rejected'}
              className="gap-1.5 border-red-500/50 text-red-400 hover:bg-red-500/10"
            >
              <XCircle className="h-3.5 w-3.5" />
              Reject Deployment
            </Button>
          </div>

          {showRejectInput && (
            <div className="mt-4 space-y-2">
              <Textarea
                placeholder="Enter rejection reason…"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="bg-slate-900 border-slate-600 text-sm"
                rows={3}
              />
              <div className="flex gap-2">
                <Button size="sm" variant="destructive" onClick={handleReject}>
                  Confirm Reject
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setShowRejectInput(false);
                    setRejectionReason('');
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Scan Report */}
      {scanReport ? (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-slate-300 flex items-center gap-2">
              <ScanSearch className="h-4 w-4 text-purple-400" />
              Scan Report
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-slate-300">{scanReport.summary}</p>

            <div className="grid grid-cols-2 gap-4 text-sm">
              {/* Framework */}
              <div className="flex items-start gap-2">
                <Cpu className="h-4 w-4 text-blue-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-slate-400 text-xs">Framework</p>
                  <p className="font-medium">{scanReport.framework}</p>
                </div>
              </div>

              {/* Database */}
              <div className="flex items-start gap-2">
                <Database className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-slate-400 text-xs">Database</p>
                  <p className="font-medium">{scanReport.database}</p>
                </div>
              </div>
            </div>

            {/* Dependencies */}
            <div>
              <p className="text-xs text-slate-400 mb-1.5">Dependencies</p>
              <div className="flex flex-wrap gap-1.5">
                {scanReport.dependencies.map((dep) => (
                  <Badge
                    key={dep}
                    variant="outline"
                    className="text-xs bg-slate-900/50 border-slate-600"
                  >
                    {dep}
                  </Badge>
                ))}
              </div>
            </div>

            {/* API Endpoints */}
            <div>
              <p className="text-xs text-slate-400 mb-1.5 flex items-center gap-1">
                <Globe className="h-3.5 w-3.5" />
                API Endpoints
              </p>
              <div className="space-y-1">
                {scanReport.apiEndpoints.map((ep) => (
                  <p key={ep} className="text-xs font-mono bg-slate-900/70 rounded px-2 py-1">
                    {ep}
                  </p>
                ))}
              </div>
            </div>

            <p className="text-xs text-slate-500">
              Scanned at {new Date(scanReport.scannedAt).toLocaleString()}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-slate-800/50 border-slate-700 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-10 text-slate-500">
            <AlertTriangle className="h-8 w-8 mb-2" />
            <p className="text-sm">No scan report yet. Click "Scan Project" to analyse.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
