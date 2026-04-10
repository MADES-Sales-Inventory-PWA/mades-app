import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Login from "./pages/Login";
import CreateAdmin from "./pages/CreateAdmin";
import AdminHome from "./pages/AdminHome";
import EmployeeHome from "./pages/EmployeeHome";

function App() {
  const [adminExists, setAdminExists] = useState(false);
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/users/admin-exists");
        const data = await response.json();
        setAdminExists(Boolean(data?.data?.exists));
      } catch {
        setAdminExists(false);
      } finally {
        setIsCheckingAdmin(false);
      }
    };

    checkAdmin();
  }, []);

  if (isCheckingAdmin) {
    return null;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            adminExists ? <Login /> : <Navigate to="/create-admin" replace />
          }
        />
        <Route
          path="/create-admin"
          element={adminExists ? <Navigate to="/" replace /> : <CreateAdmin onCreated={() => setAdminExists(true)} />}
        />
        <Route path="/inicio-admin" element={<AdminHome />} />
        <Route path="/inicio-employee" element={<EmployeeHome />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;