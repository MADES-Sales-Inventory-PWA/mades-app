import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState, type ReactElement } from "react";
import Login from "./pages/Login";
import CreateAdmin from "./pages/CreateAdmin";
import AdminHome from "./pages/AdminHome";
import EmployeeHome from "./pages/EmployeeHome";
import { getSession } from "./utils/auth";

function PrivateRoute({
  allowedRoleId,
  children,
}: {
  allowedRoleId: number;
  children: ReactElement;
}) {
  const session = getSession();

  if (!session?.token) {
    return <Navigate to="/" replace />;
  }

  if (Number(session.user?.roleId) !== allowedRoleId) {
    return <Navigate to="/" replace />;
  }

  return children;
}

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

  const currentSession = getSession();
  const currentRoleId = Number(currentSession?.user?.roleId);

  const homePathByRole =
    currentRoleId === 1
      ? "/inicio-admin"
      : currentRoleId === 2
        ? "/inicio-employee"
        : null;

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            adminExists
              ? homePathByRole
                ? <Navigate to={homePathByRole} replace />
                : <Login />
              : <Navigate to="/create-admin" replace />
          }
        />
        <Route
          path="/create-admin"
          element={adminExists ? <Navigate to="/" replace /> : <CreateAdmin onCreated={() => setAdminExists(true)} />}
        />
        <Route
          path="/inicio-admin"
          element={
            <PrivateRoute allowedRoleId={1}>
              <AdminHome />
            </PrivateRoute>
          }
        />
        <Route
          path="/inicio-employee"
          element={
            <PrivateRoute allowedRoleId={2}>
              <EmployeeHome />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;