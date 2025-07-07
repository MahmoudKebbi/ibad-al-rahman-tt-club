import logo from "./logo.svg";
import "./App.css";
import LoadingScreen from "./components/common/LoadingScreen";
import NotFound from "./pages/NotFound";
import Login from "./pages/auth/Login";
import { Routes } from "react-router-dom";
import { Route } from "react-router-dom";

function App() {

  return (
    <Routes>
      <Route path="/" element={<LoadingScreen />} />
      <Route path="/login" element={<Login />} />
      <Route path="*" element={<NotFound />} />
  </Routes>);
}

export default App;
