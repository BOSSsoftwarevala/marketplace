import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  Rocket,
  Globe,
  Server,
  CheckCircle,
  Clock,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  HardDrive,
  Cpu,
  MemoryStick,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  createDeployment,
  advanceDeploymentStatus,
  type DeploymentRecord,
  type DeploymentStatus,
} from '@/services/ServerManagerService';

interface ServerDeploymentManagerProps {
  orderId: string;
  productId: string;
  productName: string;
}

const STATUS_STEPS: DeploymentStatus[] = [
  'creating_environment',
  'assigning_resources',
  'attaching_domain',
  'deploying',
  'deployed',
];

const STATUS_LABELS: Record<DeploymentStatus, string> = {
  pending: 'Queued',
  creating_environment: 'Creating Environment',
  assigning_resources: 'Assigning Resources',
  attaching_domain: 'Attaching Domain',
  deploying: 'Deploying',
  deployed: 'Deployed',
  failed: 'Failed',
  rolled_back: 'Rolled Back',
};

const STATUS_COLORS: Record<DeploymentStatus, string> = {
  pending: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  creating_environment: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  assigning_resources: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  attaching_domain: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  deploying: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  deployed: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  failed: 'bg-red-500/20 text-red-400 border-red-500/30',
  rolled_back: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
};

function statusProgress(status: DeploymentStatus): number {
  const idx = STATUS_STEPS.indexOf(status);
  if (idx === -1) return status === 'deployed' ? 100 : 0;
  return Math.round(((idx + 1) / STATUS_STEPS.length) * 100);
}

export function ServerDeploymentManager({
  orderId,
  productId,
  productName,
}: ServerDeploymentManagerProps) {
  const [deployment, setDeployment] = useState<DeploymentRecord | null>(null);
  const [customDomain, setCustomDomain] = useState('');
  const [isDeploying, setIsDeploying] = useState(false);

  // Simulate step-by-step progress for demo purposes
  const simulateProgress = useCallback(async (record: DeploymentRecord) => {
    const steps: Array<{ status: DeploymentStatus; message: string; delay: number }> = [
      { status: 'creating_environment', message: 'Creating isolated environment…', delay: 1200 },
      { status: 'assigning_resources', message: 'Allocating CPU, RAM, and storage…', delay: 1400 },
      { status: 'attaching_domain', message: `Attaching domain ${record.domain}…`, delay: 1200 },
      { status: 'deploying', message: 'Building and deploying containers…', delay: 2000 },
      { status: 'deployed', message: 'Deployment successful!', delay: 800 },
    ];

    for (const step of steps) {
      await new Promise<void>((resolve) => setTimeout(resolve, step.delay));
      await advanceDeploymentStatus(record.id, step.status, step.message);
      setDeployment((prev) =>
        prev
          ? {
              ...prev,
              status: step.status,
              statusMessage: step.message,
              logs: [...(prev.logs ?? []), `[INFO] ${step.message}`],
            }
          : prev
      );
    }
  }, []);

  const handleDeploy = async () => {
    setIsDeploying(true);
    try {
      const record = await createDeployment(
        orderId,
        productId,
        productName,
        customDomain.trim() || undefined
      );
      setDeployment(record);
      toast.success('Deployment started', { description: `Environment: ${record.environment.name}` });
      await simulateProgress(record);
      toast.success('Deployment complete!', { description: `Live at ${record.domain}` });
    } catch {
      toast.error('Deployment failed. Please try again.');
    } finally {
      setIsDeploying(false);
    }
  };

  const progress = deployment ? statusProgress(deployment.status) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Rocket className="h-5 w-5 text-cyan-400" />
          Server Deployment Manager
        </h2>
        <p className="text-slate-400 text-sm mt-0.5">{productName}</p>
      </div>

      {/* Deploy Controls */}
      {!deployment && (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-slate-300">Create Deployment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">
                Custom Domain (optional)
              </label>
              <Input
                placeholder="e.g. myapp.example.com"
                value={customDomain}
                onChange={(e) => setCustomDomain(e.target.value)}
                className="bg-slate-900 border-slate-600 text-sm"
              />
            </div>
            <Button onClick={handleDeploy} disabled={isDeploying} className="gap-1.5">
              <Rocket className="h-3.5 w-3.5" />
              {isDeploying ? 'Deploying…' : 'Deploy Software'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Deployment Status */}
      {deployment && (
        <>
          {/* Progress */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-slate-300">
                  Deployment Progress
                </CardTitle>
                <Badge className={STATUS_COLORS[deployment.status]}>
                  {deployment.status === 'deployed' && (
                    <CheckCircle className="h-3 w-3 mr-1" />
                  )}
                  {deployment.status === 'failed' && (
                    <AlertTriangle className="h-3 w-3 mr-1" />
                  )}
                  {['pending', 'creating_environment', 'assigning_resources', 'attaching_domain', 'deploying'].includes(
                    deployment.status
                  ) && <Clock className="h-3 w-3 mr-1" />}
                  {STATUS_LABELS[deployment.status]}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <Progress value={progress} className="flex-1 h-2" />
                <span className="text-xs text-slate-400 w-8 text-right">{progress}%</span>
              </div>
              <p className="text-sm text-slate-300">{deployment.statusMessage}</p>
            </CardContent>
          </Card>

          {/* Environment Info */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                <Server className="h-4 w-4 text-cyan-400" />
                Environment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-400 text-xs">Environment Name</p>
                  <p className="font-mono font-medium">{deployment.environment.name}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs">Type</p>
                  <Badge variant="outline" className="text-xs mt-0.5">
                    {deployment.environment.type}
                  </Badge>
                </div>

                <div className="flex items-start gap-2">
                  <Globe className="h-4 w-4 text-blue-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-slate-400 text-xs">Domain</p>
                    {deployment.status === 'deployed' ? (
                      <a
                        href={`https://${deployment.domain}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:underline flex items-center gap-1"
                      >
                        {deployment.domain}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      <p className="font-mono">{deployment.domain}</p>
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-slate-400 text-xs">Region</p>
                  <p>{deployment.environment.hostingRegion}</p>
                </div>
              </div>

              {/* Resource Allocation */}
              <div className="mt-4 pt-4 border-t border-slate-700">
                <p className="text-xs text-slate-400 mb-2">Resource Allocation</p>
                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div className="flex items-center gap-1.5">
                    <Cpu className="h-3.5 w-3.5 text-purple-400" />
                    <span>{deployment.environment.resources.cpu}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MemoryStick className="h-3.5 w-3.5 text-amber-400" />
                    <span>{deployment.environment.resources.ram}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <HardDrive className="h-3.5 w-3.5 text-emerald-400" />
                    <span>{deployment.environment.resources.storage}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Logs */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                <RefreshCw className="h-4 w-4 text-slate-400" />
                Deployment Logs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-slate-900/80 rounded-md p-3 font-mono text-xs space-y-1 max-h-48 overflow-y-auto">
                {deployment.logs.map((log, i) => (
                  <p key={i} className="text-slate-300 leading-relaxed">
                    {log}
                  </p>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* New Deployment Button */}
          {deployment.status === 'deployed' && (
            <Button
              variant="outline"
              onClick={() => setDeployment(null)}
              className="gap-1.5"
            >
              <Rocket className="h-3.5 w-3.5" />
              Create Another Deployment
            </Button>
          )}
        </>
      )}
    </div>
  );
}
