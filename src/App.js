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

function App() {
  return (
    <div>
      <LoadingScreen />
      <NotFound />
      <InputField />
      <SelectField />
      <CheckboxField />
      <ActionButton />
      <DashboardLayout/>
      <AlertMessage />
    </div>
  );
}

export default App;
