import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AuthGuard from './components/layout/AuthGuard';
import DashboardLayout from './components/layout/DashboardLayout';
import LoginPage from './pages/auth/LoginPage';
import ConnectionTest from './pages/auth/ConnectionTest';
import DashboardPage from './pages/dashboard/DashboardPage';
import DriversPage from './pages/drivers/DriversPage';
import DriverDetailPage from './pages/drivers/DriverDetailPage';
import ApplicationsPage from './pages/drivers/applications/ApplicationsPage';
import ApplicationDetailPage from './pages/drivers/applications/ApplicationDetailPage';
import InspectionsPage from './pages/inspections/InspectionsPage';
import RidesPage from './pages/rides/RidesPage';
import RideDetailPage from './pages/rides/RideDetailPage';
import ComplaintsPage from './pages/complaints/ComplaintsPage';
import EarningsPage from './pages/earnings/EarningsPage';
import DiscountsPage from './pages/discounts/DiscountsPage';
import AccountingPage from './pages/accounting/AccountingPage';
import VehiclesPage from './pages/vehicles/VehiclesPage';
import RidersPage from './pages/riders/RidersPage';
import RiderDetailPage from './pages/riders/RiderDetailPage';
import SettingsPage from './pages/settings/SettingsPage';
import AuditLogsPage from './pages/audit-logs/AuditLogsPage';
import NotificationsPage from './pages/notifications/NotificationsPage';
import VipPage from './pages/vip/VipPage';
import VipBookingDetailPage from './pages/vip/VipBookingDetailPage';
import VipFleetDetailPage from './pages/vip/VipFleetDetailPage';
import AddVipVehiclePage from './pages/vip/AddVipVehiclePage';
import ContentPage from './pages/content/ContentPage';
import ContentEditorPage from './pages/content/ContentEditorPage';
import SosPage from './pages/sos/SosPage';
import SosDetailPage from './pages/sos/SosDetailPage';
import AdminProfilePage from './pages/admin/profile/AdminProfilePage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/test" element={<ConnectionTest />} />
          
          {/* Protected Routes Wrapper */}
          <Route element={<AuthGuard><DashboardLayout /></AuthGuard>}>
            <Route path="/dashboard" element={<DashboardPage />} />
            
            {/* Drivers Module */}
            <Route path="/drivers" element={<DriversPage />} />
            <Route path="/drivers/applications" element={<ApplicationsPage />} />
            <Route path="/drivers/applications/:id" element={<ApplicationDetailPage />} />
            <Route path="/drivers/inspections" element={<InspectionsPage />} />
            <Route path="/drivers/:id" element={<DriverDetailPage />} />

            {/* Inspections Root */}
            <Route path="/inspections" element={<InspectionsPage />} />

            {/* Rides Module */}
            <Route path="/rides" element={<RidesPage />} />
            <Route path="/rides/:id" element={<RideDetailPage />} />

            {/* Complaints Module */}
            <Route path="/complaints" element={<ComplaintsPage />} />

            {/* Earnings Module */}
            <Route path="/earnings" element={<EarningsPage />} />

            {/* Discounts Module */}
            <Route path="/discounts" element={<DiscountsPage />} />
            <Route path="/discounts/new" element={<DiscountsPage mode="new" />} />
            <Route path="/discounts/new/review" element={<DiscountsPage mode="new-review" />} />
            <Route path="/discounts/:id/edit" element={<DiscountsPage mode="edit" />} />
            <Route path="/discounts/:id/review" element={<DiscountsPage mode="review" />} />

            {/* Accounting Module */}
            <Route path="/accounting" element={<AccountingPage />} />

            {/* Vehicles Module */}
            <Route path="/vehicles" element={<VehiclesPage />} />

            {/* VIP Module */}
            <Route path="/vip" element={<VipPage />} />
            <Route path="/vip/bookings/:id" element={<VipBookingDetailPage />} />
            <Route path="/vip/fleet/:id" element={<VipFleetDetailPage />} />
            <Route path="/vip/fleet/new" element={<AddVipVehiclePage />} />

            {/* Riders Module */}
            <Route path="/riders" element={<RidersPage />} />
            <Route path="/riders/:id" element={<RiderDetailPage />} />

            {/* Settings Module */}
            <Route path="/settings" element={<SettingsPage />} />

            {/* Audit Logs Module */}
            <Route path="/audit-logs" element={<AuditLogsPage />} />
            
            {/* Content Module */}
            <Route path="/content" element={<ContentPage />} />
            <Route path="/content/new" element={<ContentEditorPage />} />
            <Route path="/content/edit/:id" element={<ContentEditorPage />} />

            {/* SOS Module */}
            <Route path="/sos" element={<SosPage />} />
            <Route path="/sos/:id" element={<SosDetailPage />} />

            {/* Other modules as placeholders */}
            <Route path="/notifications" element={<NotificationsPage />} />

            {/* Admin Profile */}
            <Route path="/admin/profile" element={<AdminProfilePage />} />
          </Route>

          {/* Fallback */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<div>404 - Page Not Found</div>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
