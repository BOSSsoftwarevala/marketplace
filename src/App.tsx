import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { Toaster } from 'sonner';

// ===== PROVIDERS & CONTEXTS =====
import { AuthProvider } from '@/contexts/AuthContext';
import { SecurityProvider } from '@/contexts/SecurityContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { TranslationProvider } from '@/contexts/TranslationContext';
import { GlobalRealtimeProvider } from '@/contexts/RealtimeContext';
import { DemoTestModeProvider } from '@/contexts/DemoTestModeContext';
import { AnimationProvider } from '@/contexts/AnimationContext';
import { TooltipProvider } from '@radix-ui/react-tooltip';

// ===== COMPONENTS & UTILITIES =====
import { AdminQuickAccess } from '@/components/AdminQuickAccess';
import { QuickSupport } from '@/components/QuickSupport';
import { RequireAuth } from '@/components/RequireAuth';
import { RequireRole } from '@/components/RequireRole';
import { InteractivityGuard } from '@/components/InteractivityGuard';
import { BlockingClassCleanup } from '@/components/BlockingClassCleanup';
import { SystemNotificationsInitializer } from '@/components/SystemNotificationsInitializer';
import { GlobalOfferPopup } from '@/components/GlobalOfferPopup';
import { FloatingAIChatbotWrapper } from '@/components/FloatingAIChatbotWrapper';
import { ButtonAuditOverlay } from '@/components/ButtonAuditOverlay';

// ===== PAGES =====
// Public Pages
import { Index } from '@/pages/Index';
import { Auth } from '@/pages/Auth';
import { ClientPortal } from '@/pages/ClientPortal';
import { NotFound } from '@/pages/NotFound';

// Authentication Pages
import { RoleBasedLogin } from '@/pages/RoleBasedLogin';
import { EasyAuth } from '@/pages/EasyAuth';
import { Logout } from '@/pages/Logout';
import { OTPVerify } from '@/pages/OTPVerify';
import { DeviceVerify } from '@/pages/DeviceVerify';
import { IPVerify } from '@/pages/IPVerify';
import { ForgotPassword } from '@/pages/ForgotPassword';
import { ResetPassword } from '@/pages/ResetPassword';
import { AccountSuspension } from '@/pages/AccountSuspension';
import { AccessDenied } from '@/pages/AccessDenied';
import { SessionExpiredPage } from '@/pages/SessionExpiredPage';

// Admin Pages
import { MasterControlCenter } from '@/pages/MasterControlCenter';
import { MasterAdminSupreme } from '@/pages/MasterAdminSupreme';
import { BulkUserCreation } from '@/pages/BulkUserCreation';
import { RoleManagerPage } from '@/pages/RoleManagerPage';

// Manager Dashboards
import { LeadManager } from '@/pages/LeadManager';
import { TaskManager } from '@/pages/TaskManager';
import { DemoManagerDashboard } from '@/pages/DemoManagerDashboard';
import { ProductDemoManager } from '@/pages/ProductDemoManager';
import { FinanceManager } from '@/pages/FinanceManager';
import { LegalComplianceManager } from '@/pages/LegalComplianceManager';
import { MarketingManager } from '@/pages/MarketingManager';
import { PerformanceManager } from '@/pages/PerformanceManager';
import { RnDDashboard } from '@/pages/RnDDashboard';
import { HRDashboard } from '@/pages/HRDashboard';
import { SEODashboard } from '@/pages/SEODashboard';
import { SupportDashboard } from '@/pages/SupportDashboard';
import { SalesSupportDashboard } from '@/pages/SalesSupportDashboard';
import { ClientSuccessDashboard } from '@/pages/ClientSuccessDashboard';
import { IncidentCrisisDashboard } from '@/pages/IncidentCrisisDashboard';
import { AIOptimizationConsole } from '@/pages/AIOptimizationConsole';

// Specialized Dashboards
import { SafeAssistDashboard } from '@/pages/SafeAssistDashboard';
import { AssistManagerDashboard } from '@/pages/AssistManagerDashboard';
import { PromiseTrackerDashboard } from '@/pages/PromiseTrackerDashboard';
import { PromiseManagementDashboard } from '@/pages/PromiseManagementDashboard';

// Role-Based Dashboards
import { SoftwareWalaOwnerDashboard } from '@/pages/SoftwareWalaOwnerDashboard';
import { ServerManagerDashboard } from '@/pages/ServerManagerDashboard';
import { SecurityCommandCenter } from '@/pages/SecurityCommandCenter';
import { APIManagerDashboard } from '@/pages/APIManagerDashboard';
import { MarketingManagerDashboard } from '@/pages/MarketingManagerDashboard';
import { SEOManagerDashboard } from '@/pages/SEOManagerDashboard';
import { LegalManagerDashboard } from '@/pages/LegalManagerDashboard';
import { AICEODashboard } from '@/pages/AICEODashboard';
import { AICEODashboardMain } from '@/pages/AICEODashboardMain';
import { AICEOLiveMonitor } from '@/pages/AICEOLiveMonitor';
import { AICEODecisionEngine } from '@/pages/AICEODecisionEngine';
import { AICEOApprovals } from '@/pages/AICEOApprovals';
import { AICEORiskCompliance } from '@/pages/AICEORiskCompliance';
import { AICEOPerformance } from '@/pages/AICEOPerformance';
import { AICEOPredictions } from '@/pages/AICEOPredictions';
import { AICEOReports } from '@/pages/AICEOReports';
import { AICEOLearning } from '@/pages/AICEOLearning';
import { AICEOSettings } from '@/pages/AICEOSettings';
import { ContinentSuperAdminDashboard } from '@/pages/ContinentSuperAdminDashboard';

// Super Admin System
import { SuperAdminSystemDashboard } from '@/pages/SuperAdminSystemDashboard';
import { SuperAdminUsers } from '@/pages/SuperAdminUsers';
import { SuperAdminAdmins } from '@/pages/SuperAdminAdmins';
import { SuperAdminRoles } from '@/pages/SuperAdminRoles';
import { SuperAdminGeography } from '@/pages/SuperAdminGeography';
import { SuperAdminModules } from '@/pages/SuperAdminModules';
import { SuperAdminRentals } from '@/pages/SuperAdminRentals';
import { SuperAdminRules } from '@/pages/SuperAdminRules';
import { SuperAdminApprovals } from '@/pages/SuperAdminApprovals';
import { SuperAdminSecurity } from '@/pages/SuperAdminSecurity';
import { SuperAdminSystemLock } from '@/pages/SuperAdminSystemLock';
import { SuperAdminActivityLog } from '@/pages/SuperAdminActivityLog';
import { SuperAdminAudit } from '@/pages/SuperAdminAudit';
import { RoleSwitchDashboard } from '@/pages/RoleSwitchDashboard';
import { SuperAdminLogin } from '@/pages/SuperAdminLogin';

// Franchise Pages
import { FranchiseLayout } from '@/pages/franchise/FranchiseLayout';
import { FranchiseDashboardPage } from '@/pages/franchise/FranchiseDashboardPage';
import { FranchiseProfile } from '@/pages/franchise/FranchiseProfile';
import { FranchiseWalletPage } from '@/pages/franchise/FranchiseWalletPage';
import { FranchiseLeadBoardPage } from '@/pages/franchise/FranchiseLeadBoardPage';
import { FranchiseAssignLead } from '@/pages/franchise/FranchiseAssignLead';
import { FranchiseDemoRequest } from '@/pages/franchise/FranchiseDemoRequest';
import { FranchiseDemoLibraryPage } from '@/pages/franchise/FranchiseDemoLibraryPage';
import { FranchiseSalesCenter } from '@/pages/franchise/FranchiseSalesCenter';
import { FranchisePerformancePage } from '@/pages/franchise/FranchisePerformancePage';
import { FranchiseSupportTicket } from '@/pages/franchise/FranchiseSupportTicket';
import { FranchiseInternalChatPage } from '@/pages/franchise/FranchiseInternalChatPage';
import { FranchiseTrainingCenter } from '@/pages/franchise/FranchiseTrainingCenter';
import { FranchiseSecurityPanel } from '@/pages/franchise/FranchiseSecurityPanel';
import { FranchiseSEOServices } from '@/pages/franchise/FranchiseSEOServices';
import { FranchiseTeamManagement } from '@/pages/franchise/FranchiseTeamManagement';
import { FranchiseCRM } from '@/pages/franchise/FranchiseCRM';
import { FranchiseHRM } from '@/pages/franchise/FranchiseHRM';
import { FranchiseLeadActivity } from '@/pages/franchise/FranchiseLeadActivity';
import { FranchiseLanding } from '@/pages/franchise/FranchiseLanding';
import { FranchiseDashboard } from '@/pages/franchise/FranchiseDashboard';

// Reseller Pages
import { ResellerDashboard } from '@/pages/ResellerDashboard';
import { ResellerPortal } from '@/pages/ResellerPortal';
import { ResellerLanding } from '@/pages/ResellerLanding';

// Developer Pages
import { DeveloperRegistration } from '@/pages/DeveloperRegistration';
import { DevCommandCenter } from '@/pages/DevCommandCenter';

// Influencer Pages
import { InfluencerDashboard } from '@/pages/InfluencerDashboard';
import { InfluencerCommandCenter } from '@/pages/InfluencerCommandCenter';

// Product/Feature Pages
import { PrimeUserDashboard } from '@/pages/PrimeUserDashboard';

// Demo Pages
import { SimpleDemoList } from '@/pages/SimpleDemoList';
import { PublicDemos } from '@/pages/PublicDemos';
import { PremiumDemoShowcaseNew } from '@/pages/PremiumDemoShowcaseNew';
import { PremiumDemoShowcase } from '@/pages/PremiumDemoShowcase';
import { SimpleDemoView } from '@/pages/SimpleDemoView';
import { SimpleCheckout } from '@/pages/SimpleCheckout';
import { SimpleUserDashboard } from '@/pages/SimpleUserDashboard';
import { DemoLogin } from '@/pages/DemoLogin';
import { DemoDirectory } from '@/pages/DemoDirectory';

// Industry-Specific Demos
import { RestaurantPOSDemo } from '@/pages/demos/RestaurantPOSDemo';
import { RestaurantSmallDemo } from '@/pages/demos/RestaurantSmallDemo';
import { RestaurantMediumDemo } from '@/pages/demos/RestaurantMediumDemo';
import { RestaurantLargeDemo } from '@/pages/demos/RestaurantLargeDemo';
import { SchoolERPDemo } from '@/pages/demos/SchoolERPDemo';
import { SchoolSmallDemo } from '@/pages/demos/SchoolSmallDemo';
import { SchoolMediumDemo } from '@/pages/demos/SchoolMediumDemo';
import { SchoolLargeDemo } from '@/pages/demos/SchoolLargeDemo';
import { EducationDemoHub } from '@/pages/demos/EducationDemoHub';
import { SchoolSoftwareHomepage } from '@/pages/demos/SchoolSoftwareHomepage';
import { SchoolSoftwareDashboard } from '@/pages/demos/SchoolSoftwareDashboard';
import { HospitalHMSDemo } from '@/pages/demos/HospitalHMSDemo';
import { EcommerceStoreDemo } from '@/pages/demos/EcommerceStoreDemo';
import { HotelBookingDemo } from '@/pages/demos/HotelBookingDemo';
import { RealEstateDemo } from '@/pages/demos/RealEstateDemo';
import { AutomotiveDemo } from '@/pages/demos/AutomotiveDemo';
import { TravelDemo } from '@/pages/demos/TravelDemo';
import { FinanceDemo } from '@/pages/demos/FinanceDemo';
import { ManufacturingDemo } from '@/pages/demos/ManufacturingDemo';
import { GymDemo } from '@/pages/demos/GymDemo';
import { SalonDemo } from '@/pages/demos/SalonDemo';
import { LegalDemo } from '@/pages/demos/LegalDemo';
import { SecurityDemo } from '@/pages/demos/SecurityDemo';
import { TelecomDemo } from '@/pages/demos/TelecomDemo';
import { ChildcareDemo } from '@/pages/demos/ChildcareDemo';
import { PetCareDemo } from '@/pages/demos/PetCareDemo';
import { EventDemo } from '@/pages/demos/EventDemo';
import { CRMDemo } from '@/pages/demos/CRMDemo';
import { LogisticsDemo } from '@/pages/demos/LogisticsDemo';
import { SalesCRMDemo } from '@/pages/demos/SalesCRMDemo';
import { SalesCRMAuthPage } from '@/pages/demos/SalesCRMAuthPage';
import { RetailPOSDemo } from '@/pages/demos/RetailPOSDemo';

// Other Pages
import { Dashboard } from '@/pages/Dashboard';
import { SettingsPage } from '@/pages/SettingsPage';
import { ChangePassword } from '@/pages/ChangePassword';
import { PendingApproval } from '@/pages/PendingApproval';
import { Homepage } from '@/pages/Homepage';
import { CategoryOnboarding } from '@/pages/CategoryOnboarding';
import { CareerPortal } from '@/pages/CareerPortal';
import { BootstrapAdmins } from '@/pages/BootstrapAdmins';
import { SectorsBrowse } from '@/pages/SectorsBrowse';
import { SubCategoryDemos } from '@/pages/SubCategoryDemos';
import { AutoDevEngine } from '@/pages/AutoDevEngine';
import { ServerManagementPortal } from '@/pages/ServerManagementPortal';
import { UserDashboard } from '@/pages/UserDashboard';
import { InternalChat } from '@/pages/InternalChat';
import { PersonalChat } from '@/pages/PersonalChat';
import { DemoCredentials } from '@/pages/DemoCredentials';
import { DemoOrderSystem } from '@/pages/DemoOrderSystem';
import { ValaControlCenter } from '@/pages/ValaControlCenter';
import { ValaControlHub } from '@/pages/ValaControlHub';
import { ValaOperationWorkspace } from '@/pages/ValaOperationWorkspace';
import { ValaRegionalWorkspace } from '@/pages/ValaRegionalWorkspace';
import { ValaAIHeadWorkspace } from '@/pages/ValaAIHeadWorkspace';
import { ValaMasterWorkspace } from '@/pages/ValaMasterWorkspace';
import { EnterpriseControlHub } from '@/pages/EnterpriseControlHub';
import { SecureDevManagerDashboard } from '@/pages/SecureDevManagerDashboard';
import { SecureHRManagerDashboard } from '@/pages/SecureHRManagerDashboard';
import { WireframeRoutes } from '@/pages/WireframeRoutes';
import { LeaderSecurityAssessment } from '@/pages/LeaderSecurityAssessment';
import { BulkActionsReference } from '@/pages/BulkActionsReference';
import { SecureInfluencerManagerDashboard } from '@/pages/SecureInfluencerManagerDashboard';
import { SecureResellerManagerDashboard } from '@/pages/SecureResellerManagerDashboard';
import { SecureSalesSupportManagerDashboard } from '@/pages/SecureSalesSupportManagerDashboard';
import { ProductDemoManagerPage } from '@/pages/ProductDemoManagerPage';
import { SecureTaskManagerDashboard } from '@/pages/SecureTaskManagerDashboard';
import { SecureLegalManagerDashboard } from '@/pages/SecureLegalManagerDashboard';
import { NotificationBuzzerConsole } from '@/pages/NotificationBuzzerConsole';
import { APIIntegrationDashboard } from '@/pages/APIIntegrationDashboard';
import { SystemSettings } from '@/pages/SystemSettings';
import { RoleManager } from '@/pages/RoleManager';
import { UserManager } from '@/pages/UserManager';
import { PermissionMatrix } from '@/pages/PermissionMatrix';
import { SecurityCenter } from '@/pages/SecurityCenter';
import { ProductManagerPage } from '@/pages/ProductManagerPage';
import { PrimeManager } from '@/pages/PrimeManager';
import { InfluencerManager } from '@/pages/InfluencerManager';
import { ComplianceCenter } from '@/pages/ComplianceCenter';
import { FranchiseManagement } from '@/pages/FranchiseManagement';
import { LiveTracking } from '@/pages/LiveTracking';
import { BossFortressAuth } from '@/pages/BossFortressAuth';
import { BossRegister } from '@/pages/BossRegister';

// Initialize React Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 1000 * 60 * 5 }, // 5 minutes
  },
});

/**
 * ULTRA MARKETPLACE ROUTER
 * 
 * Clean, consolidated routing architecture
 * No merge conflicts | Production-ready
 */
const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <DemoTestModeProvider>
        <AnimationProvider>
          <TooltipProvider>
            <Toaster position="top-right" />
            <BrowserRouter>
              <SecurityProvider>
                <NotificationProvider>
                  <TranslationProvider>
                    <GlobalRealtimeProvider>
                      <InteractivityGuard />
                      <BlockingClassCleanup />
                      <SystemNotificationsInitializer />
                      <GlobalOfferPopup />
                      <FloatingAIChatbotWrapper />
                      <Routes>
                        {/* PUBLIC ROUTES */}
                        <Route path="/" element={<Index />} />
                        <Route path="/demos" element={<Index />} />
                        <Route path="/explore" element={<Navigate to="/demos" replace />} />
                        <Route path="/products" element={<Index />} />
                        <Route path="/pricing" element={<SimpleDemoList />} />
                        <Route path="/demos/public" element={<PublicDemos />} />
                        <Route path="/showcase" element={<PremiumDemoShowcaseNew />} />
                        <Route path="/auth" element={<Auth />} />
                        <Route path="/client-portal" element={<ClientPortal />} />
                        <Route path="/get-started" element={<ClientPortal />} />

                        {/* AUTHENTICATION */}
                        <Route path="/login" element={<RoleBasedLogin />} />
                        <Route path="/role-login" element={<RoleBasedLogin />} />
                        <Route path="/boss/login" element={<SuperAdminLogin />} />
                        <Route path="/easy-login" element={<EasyAuth />} />
                        <Route path="/quick-signup" element={<EasyAuth />} />
                        <Route path="/register" element={<Navigate to="/auth" replace />} />
                        <Route path="/logout" element={<Logout />} />
                        <Route path="/otp-verify" element={<OTPVerify />} />
                        <Route path="/device-verify" element={<DeviceVerify />} />
                        <Route path="/ip-verify" element={<IPVerify />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        <Route path="/reset-password" element={<ResetPassword />} />
                        <Route path="/account-suspension" element={<AccountSuspension />} />
                        <Route path="/access-denied" element={<AccessDenied />} />
                        <Route path="/session-expired" element={<SessionExpiredPage />} />
                        <Route path="/boss-fortress" element={<BossFortressAuth />} />
                        <Route path="/boss-register" element={<BossRegister />} />

                        {/* PROTECTED ROUTES */}
                        <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
                        <Route path="/profile" element={<RequireAuth><SettingsPage /></RequireAuth>} />
                        <Route path="/settings" element={<RequireAuth><SettingsPage /></RequireAuth>} />
                        <Route path="/change-password" element={<RequireAuth><ChangePassword /></RequireAuth>} />
                        <Route path="/user-dashboard" element={<RequireAuth><SimpleUserDashboard /></RequireAuth>} />
                        <Route path="/user/dashboard" element={<RequireAuth><UserDashboard /></RequireAuth>} />
                        <Route path="/internal-chat" element={<RequireAuth><InternalChat /></RequireAuth>} />
                        <Route path="/personal-chat" element={<RequireAuth><PersonalChat /></RequireAuth>} />
                        <Route path="/dev-manager" element={<RequireAuth><SecureDevManagerDashboard /></RequireAuth>} />
                        <Route path="/hr-manager" element={<RequireAuth><SecureHRManagerDashboard /></RequireAuth>} />
                        <Route path="/server-portal" element={<RequireAuth><ServerManagementPortal /></RequireAuth>} />

                        {/* ROLE-BASED - BOSS OWNER */}
                        <Route path="/owner" element={<RequireRole allowed={["boss_owner"]}><SoftwareWalaOwnerDashboard /></RequireRole>} />
                        <Route path="/owner/*" element={<RequireRole allowed={["boss_owner"]}><SoftwareWalaOwnerDashboard /></RequireRole>} />
                        <Route path="/softwarewala" element={<RequireRole allowed={["boss_owner"]}><SoftwareWalaOwnerDashboard /></RequireRole>} />
                        <Route path="/master-admin" element={<RequireRole allowed={["boss_owner"]}><MasterControlCenter /></RequireRole>} />
                        <Route path="/master-admin/*" element={<RequireRole allowed={["boss_owner"]}><MasterControlCenter /></RequireRole>} />
                        <Route path="/master-admin-supreme" element={<RequireRole allowed={["boss_owner"]}><MasterAdminSupreme /></RequireRole>} />
                        <Route path="/admin/bulk-users" element={<RequireRole allowed={["boss_owner"]}><BulkUserCreation /></RequireRole>} />
                        <Route path="/admin/role-manager" element={<RequireRole allowed={["boss_owner"]}><RoleManagerPage /></RequireRole>} />

                        {/* ROLE-BASED - SPECIALIZED MANAGERS */}
                        <Route path="/server-manager" element={<RequireRole allowed={["boss_owner", "server_manager"]}><ServerManagerDashboard /></RequireRole>} />
                        <Route path="/server-manager/*" element={<RequireRole allowed={["boss_owner", "server_manager"]}><ServerManagerDashboard /></RequireRole>} />
                        <Route path="/security-command" element={<RequireRole allowed={["boss_owner"]}><SecurityCommandCenter /></RequireRole>} />
                        <Route path="/security-command/*" element={<RequireRole allowed={["boss_owner"]}><SecurityCommandCenter /></RequireRole>} />
                        <Route path="/api-manager" element={<RequireRole allowed={["boss_owner", "ai_manager"]}><APIManagerDashboard /></RequireRole>} />
                        <Route path="/api-manager/*" element={<RequireRole allowed={["boss_owner", "ai_manager"]}><APIManagerDashboard /></RequireRole>} />
                        <Route path="/marketing-manager" element={<RequireRole allowed={["boss_owner", "marketing_manager"]}><MarketingManagerDashboard /></RequireRole>} />
                        <Route path="/marketing-manager/*" element={<RequireRole allowed={["boss_owner", "marketing_manager"]}><MarketingManagerDashboard /></RequireRole>} />
                        <Route path="/seo-manager" element={<RequireRole allowed={["boss_owner", "seo_manager"]}><SEOManagerDashboard /></RequireRole>} />
                        <Route path="/seo-manager/*" element={<RequireRole allowed={["boss_owner", "seo_manager"]}><SEOManagerDashboard /></RequireRole>} />
                        <Route path="/legal-manager" element={<RequireRole allowed={["boss_owner", "legal_compliance"]}><LegalManagerDashboard /></RequireRole>} />
                        <Route path="/legal-manager/*" element={<RequireRole allowed={["boss_owner", "legal_compliance"]}><LegalManagerDashboard /></RequireRole>} />

                        {/* ROLE-BASED - AI CEO */}
                        <Route path="/ai-ceo" element={<RequireRole allowed={["boss_owner", "ceo"]}><AICEODashboard /></RequireRole>}>
                          <Route index element={<AICEODashboardMain />} />
                          <Route path="live-monitor" element={<AICEOLiveMonitor />} />
                          <Route path="decision-engine" element={<AICEODecisionEngine />} />
                          <Route path="approvals" element={<AICEOApprovals />} />
                          <Route path="risk" element={<AICEORiskCompliance />} />
                          <Route path="performance" element={<AICEOPerformance />} />
                          <Route path="predictions" element={<AICEOPredictions />} />
                          <Route path="reports" element={<AICEOReports />} />
                          <Route path="learning" element={<AICEOLearning />} />
                          <Route path="settings" element={<AICEOSettings />} />
                        </Route>

                        {/* FRANCHISE */}
                        <Route path="/franchise" element={<RequireRole allowed={["franchise", "super_admin"]}><FranchiseLayout><FranchiseDashboardPage /></FranchiseLayout></RequireRole>} />
                        <Route path="/franchise/dashboard" element={<RequireRole allowed={["franchise", "super_admin"]}><FranchiseLayout><FranchiseDashboardPage /></FranchiseLayout></RequireRole>} />
                        <Route path="/franchise/profile" element={<RequireRole allowed={["franchise", "super_admin"]}><FranchiseLayout><FranchiseProfile /></FranchiseLayout></RequireRole>} />
                        <Route path="/franchise/wallet" element={<RequireRole allowed={["franchise", "super_admin"]}><FranchiseLayout><FranchiseWalletPage /></FranchiseLayout></RequireRole>} />
                        <Route path="/franchise/lead-board" element={<RequireRole allowed={["franchise", "super_admin"]}><FranchiseLayout><FranchiseLeadBoardPage /></FranchiseLayout></RequireRole>} />
                        <Route path="/franchise/assign-lead" element={<RequireRole allowed={["franchise", "super_admin"]}><FranchiseLayout><FranchiseAssignLead /></FranchiseLayout></RequireRole>} />
                        <Route path="/franchise/demo-request" element={<RequireRole allowed={["franchise", "super_admin"]}><FranchiseLayout><FranchiseDemoRequest /></FranchiseLayout></RequireRole>} />
                        <Route path="/franchise/demo-library" element={<RequireRole allowed={["franchise", "super_admin"]}><FranchiseLayout><FranchiseDemoLibraryPage /></FranchiseLayout></RequireRole>} />
                        <Route path="/franchise/sales-center" element={<RequireRole allowed={["franchise", "super_admin"]}><FranchiseLayout><FranchiseSalesCenter /></FranchiseLayout></RequireRole>} />
                        <Route path="/franchise/performance" element={<RequireRole allowed={["franchise", "super_admin"]}><FranchiseLayout><FranchisePerformancePage /></FranchiseLayout></RequireRole>} />
                        <Route path="/franchise/support-ticket" element={<RequireRole allowed={["franchise", "super_admin"]}><FranchiseLayout><FranchiseSupportTicket /></FranchiseLayout></RequireRole>} />
                        <Route path="/franchise/internal-chat" element={<RequireRole allowed={["franchise", "super_admin"]}><FranchiseLayout><FranchiseInternalChatPage /></FranchiseLayout></RequireRole>} />
                        <Route path="/franchise/training-center" element={<RequireRole allowed={["franchise", "super_admin"]}><FranchiseLayout><FranchiseTrainingCenter /></FranchiseLayout></RequireRole>} />
                        <Route path="/franchise/security-panel" element={<RequireRole allowed={["franchise", "super_admin"]}><FranchiseLayout><FranchiseSecurityPanel /></FranchiseLayout></RequireRole>} />
                        <Route path="/franchise/seo-services" element={<RequireRole allowed={["franchise", "super_admin"]}><FranchiseLayout><FranchiseSEOServices /></FranchiseLayout></RequireRole>} />
                        <Route path="/franchise/team-management" element={<RequireRole allowed={["franchise", "super_admin"]}><FranchiseLayout><FranchiseTeamManagement /></FranchiseLayout></RequireRole>} />
                        <Route path="/franchise/crm" element={<RequireRole allowed={["franchise", "super_admin"]}><FranchiseLayout><FranchiseCRM /></FranchiseLayout></RequireRole>} />
                        <Route path="/franchise/hrm" element={<RequireRole allowed={["franchise", "super_admin"]}><FranchiseLayout><FranchiseHRM /></FranchiseLayout></RequireRole>} />
                        <Route path="/franchise/lead-activity" element={<RequireRole allowed={["franchise", "super_admin"]}><FranchiseLayout><FranchiseLeadActivity /></FranchiseLayout></RequireRole>} />

                        {/* ALL OTHER ROUTES */}
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                      <AdminQuickAccess />
                      <QuickSupport />
                      <ButtonAuditOverlay enabled={import.meta.env.DEV} />
                    </GlobalRealtimeProvider>
                  </TranslationProvider>
                </NotificationProvider>
              </SecurityProvider>
            </BrowserRouter>
          </TooltipProvider>
        </AnimationProvider>
      </DemoTestModeProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
