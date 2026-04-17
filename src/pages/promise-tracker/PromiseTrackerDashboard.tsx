/**
 * Promise Tracker Dashboard
 * Wraps the full PT layout (sidebar + 14 screens). No auth-gated DashboardLayout
 * so demo-mode users see the complete UI immediately.
 */
import PTFullLayout from '@/components/promise-tracker/PTFullLayout';

export default function PromiseTrackerDashboard() {
  return <PTFullLayout />;
}
