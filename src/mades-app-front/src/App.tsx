import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState, type ReactElement } from "react";
import Login from "./pages/Login";
import CreateAdmin from "./pages/CreateAdmin";
import HomePage from "./pages/HomePage";
import { getSession } from "./utils/auth";
import { constants } from "./constants/Constants";

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

function AppRoutes({
  adminExists,
  setAdminExists,
}: {
  adminExists: boolean;
  setAdminExists: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const session = getSession();
  const currentRoleId = Number(session?.user?.roleId);

  const homePathByRole =
    currentRoleId === constants.ADMIN_ROLE_ID
      ? constants.ADMIN_HOME_PATH
      : currentRoleId === constants.EMPLOYEE_ROLE_ID
        ? constants.EMPLOYEE_HOME_PATH
        : null;

  return (
    <Routes>
      <Route
        path="/"
        element={
          !adminExists ? (
            <Navigate to="/create-admin" replace />
          ) : homePathByRole ? (
            <Navigate to={homePathByRole} replace />
          ) : (
            <Login />
          )
        }
      />
      <Route
        path="/create-admin"
        element={
          adminExists
            ? <Navigate to="/" replace />
            : <CreateAdmin onCreated={() => setAdminExists(true)} />
        }
      />
      <Route
        path="/inicio-admin"
        element={
          <PrivateRoute allowedRoleId={constants.ADMIN_ROLE_ID}>
            <HomePage />
          </PrivateRoute>
        }
      />
      <Route
        path="/inicio-employee"
        element={
          <PrivateRoute allowedRoleId={constants.EMPLOYEE_ROLE_ID}>
            <HomePage />
          </PrivateRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
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

  return (
    <BrowserRouter>
      <AppRoutes adminExists={adminExists} setAdminExists={setAdminExists} />
    </BrowserRouter>
  );
}

export default App;