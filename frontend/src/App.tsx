import { lazy, Suspense } from "react";
import { Toaster }          from "@/components/ui/toaster";
import { TooltipProvider }  from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider }    from "@/context/ThemeContext";
import { LanguageProvider } from "@/i18n";
import { AuthProvider }     from "@/context/AuthContext";
import { AppConfigProvider } from "@/context/AppConfigContext";
import { TillProvider }     from "@/context/TillContext";
import { OrderProvider }    from "@/context/OrderContext";
import { OfflineProvider }  from "@/sync/offline-context";
import { OfflineIndicator } from "@/sync/OfflineIndicator";
import { RouteFallback }    from "@/components/common/RouteFallback";
import ProtectedRoute          from "@/components/auth/ProtectedRoute";
import AdminProtectedRoute     from "@/components/auth/AdminProtectedRoute";
import ManagerProtectedRoute   from "@/components/auth/ManagerProtectedRoute";
import LoginPage            from "./pages/LoginPage";
const AdminLoginPage = lazy(() => import("./pages/admin/AdminLoginPage"));
import POSPage              from "./pages/POSPage";
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const ManagerPanel = lazy(() => import("./pages/admin/ManagerPanel"));
const AdminProducts = lazy(() => import("./pages/admin/AdminProducts"));
const AdminDeals = lazy(() => import("./pages/admin/AdminDeals"));
const AdminFoodTypes = lazy(() => import("./pages/admin/AdminFoodTypes"));
const AdminCategories = lazy(() => import("./pages/admin/AdminCategories"));
const AdminConfig = lazy(() => import("./pages/admin/AdminConfig"));
const AdminTillSetup = lazy(() => import("./pages/admin/AdminTillSetup"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminBranches = lazy(() => import("./pages/admin/AdminBranches"));
const AdminCities = lazy(() => import("./pages/admin/AdminCities"));
const AdminAreas = lazy(() => import("./pages/admin/AdminAreas"));
const AdminStates = lazy(() => import("./pages/admin/AdminStates"));
const AdminRoles = lazy(() => import("./pages/admin/AdminRoles"));
const AdminReports = lazy(() => import("./pages/admin/AdminReports"));
const AdminOrganisation = lazy(() => import("./pages/admin/AdminOrganisation"));
const AdminBrands = lazy(() => import("./pages/admin/AdminBrands"));
const KitchenPage = lazy(() => import("./pages/KitchenPage"));
const CustomerDisplayPage = lazy(() => import("./pages/CustomerDisplayPage"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <ThemeProvider>
        <AuthProvider>
          <AppConfigProvider>
            <OfflineProvider>
              <TooltipProvider>
                <Toaster />
                <OfflineIndicator />
                <BrowserRouter>
                <Suspense fallback={<RouteFallback />}>
                <Routes>

                  {/* ── Public ─────────────────────────────────────────────── */}
                  <Route path="/login"       element={<LoginPage />} />
                  <Route path="/admin/login" element={<AdminLoginPage />} />
                  <Route path="/kitchen"     element={<KitchenPage />} />
                  <Route path="/customer-display" element={<CustomerDisplayPage />} />

                  {/* ── POS — cashiers and above ────────────────────────────── */}
                  <Route
                    path="/"
                    element={
                      <ProtectedRoute>
                        <TillProvider>
                          <OrderProvider>
                            <POSPage />
                          </OrderProvider>
                        </TillProvider>
                      </ProtectedRoute>
                    }
                  />

                  {/* ── Manager Operations — branch_manager and above ────────── */}
                  {/* /manager       → Live branch operations panel              */}
                  {/* /manager/reports → Branch-level reporting                  */}
                  <Route
                    path="/manager"
                    element={
                      <ManagerProtectedRoute>
                        <ManagerPanel />
                      </ManagerProtectedRoute>
                    }
                  />
                  <Route
                    path="/manager/reports"
                    element={
                      <ManagerProtectedRoute>
                        <AdminReports />
                      </ManagerProtectedRoute>
                    }
                  />

                  {/* ── Admin Back-Office — org_admin / city_manager and above ─ */}
                  <Route path="/admin/dashboard"    element={<AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>} />
                  <Route path="/admin/products"     element={<AdminProtectedRoute><AdminProducts /></AdminProtectedRoute>} />
                  <Route path="/admin/deals"        element={<AdminProtectedRoute><AdminDeals /></AdminProtectedRoute>} />
                  <Route path="/admin/food-types"   element={<AdminProtectedRoute><AdminFoodTypes /></AdminProtectedRoute>} />
                  <Route path="/admin/categories"   element={<AdminProtectedRoute><AdminCategories /></AdminProtectedRoute>} />
                  <Route path="/admin/config"       element={<AdminProtectedRoute><AdminConfig /></AdminProtectedRoute>} />
                  <Route path="/admin/tills"        element={<AdminProtectedRoute><AdminTillSetup /></AdminProtectedRoute>} />
                  <Route path="/admin/users"        element={<AdminProtectedRoute><AdminUsers /></AdminProtectedRoute>} />
                  <Route path="/admin/branches"     element={<AdminProtectedRoute><AdminBranches /></AdminProtectedRoute>} />
                  <Route path="/admin/brands"       element={<AdminProtectedRoute><AdminBrands /></AdminProtectedRoute>} />
                  <Route path="/admin/cities"       element={<AdminProtectedRoute><AdminCities /></AdminProtectedRoute>} />
                  <Route path="/admin/areas"        element={<AdminProtectedRoute><AdminAreas /></AdminProtectedRoute>} />
                  <Route path="/admin/states"       element={<AdminProtectedRoute><AdminStates /></AdminProtectedRoute>} />
                  <Route path="/admin/roles"        element={<AdminProtectedRoute><AdminRoles /></AdminProtectedRoute>} />
                  <Route path="/admin/reports"      element={<AdminProtectedRoute><AdminReports /></AdminProtectedRoute>} />
                  <Route path="/admin/organisation" element={<AdminProtectedRoute><AdminOrganisation /></AdminProtectedRoute>} />

                  {/* Legacy redirect — old bookmark /admin/manager → /manager */}
                  <Route path="/admin/manager" element={<Navigate to="/manager" replace />} />

                  {/* /admin root → admin dashboard */}
                  <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

                  {/* 404 */}
                  <Route path="*" element={<NotFound />} />

                </Routes>
                </Suspense>
              </BrowserRouter>
              </TooltipProvider>
            </OfflineProvider>
          </AppConfigProvider>
        </AuthProvider>
      </ThemeProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
