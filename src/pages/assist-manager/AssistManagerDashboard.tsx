/**
 * Assist Manager Dashboard
 * Wraps the full AM layout (sidebar + 13 screens). No auth-gated DashboardLayout
 * so demo-mode users see the complete UI immediately.
 */
import AMFullLayout from '@/components/assist-manager/AMFullLayout';

export default function AssistManagerDashboard() {
  return <AMFullLayout />;
}
