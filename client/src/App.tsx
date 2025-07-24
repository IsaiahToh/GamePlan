import { Route, Routes, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Header from "./components/header/Header";
import Settingsbar from "./components/header/Settingsbar";
import Sidebar from "./components/header/sidebar/Sidebar";
import { Toaster } from "react-hot-toast";
import {
  useDashboardContext,
  DashboardProvider,
} from "./context/DashboardContext";
import { TaskProvider } from "./context/TaskContext";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = !!localStorage.getItem("token");
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

// Use the context only INSIDE the provider!
function AppContent() {
  const { isSettingsbarOpen, isSidebarOpen } = useDashboardContext();
  return (
    <>
      <Toaster position="top-right" />
      <div className="flex flex-col h-full">
        <Header />
        <div className="flex flex-1">
          {isSidebarOpen && <Sidebar />}
          <main className="flex-1">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>
          {isSettingsbarOpen && <Settingsbar />}
        </div>
      </div>
    </>
  );
}

function App() {
  return (
    <TaskProvider>
      <DashboardProvider>
        <AppContent />
      </DashboardProvider>
    </TaskProvider>
  );
}

export default App;
