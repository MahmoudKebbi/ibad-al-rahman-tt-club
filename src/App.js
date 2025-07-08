import logo from "./logo.svg";
import "./App.css";
import LoadingScreen from "./components/common/LoadingScreen";
import NotFound from "./pages/NotFound";

import ActionButton from "./components/common/ActionButton";
import InputField from "./components/common/InputField";
import SelectField from "./components/common/SelectField";
import CheckboxField from "./components/common/CheckboxField";
import DashboardLayout from "./components/layout/DashboardLayout";
import AlertMessage from "./components/common/AlertMessage";
import Login from "./pages/auth/Login";
import MembersManagement from "./pages/admin/MembersManagement";
import AdminDashboard from "./pages/admin/AdminDashboard";
import GuestDashboard from "./pages/guest/GuestDashboard";
import ContentCard from "./components/layout/ContentCard";
import StatusBadge from "./components/common/StatusBadge";
import StatsCard from "./components/dashboard/StatsCard";


// Trying out the new components

function App() {
  return (
    <div>
      <Login />
      <LoadingScreen />
      <NotFound />
      <InputField />
      <SelectField />
      <CheckboxField />
      <ActionButton />
      <DashboardLayout />
      <AlertMessage />
      <MembersManagement/>
      <AdminDashboard />
      <GuestDashboard />
    </div>
  );
}

export default App;
