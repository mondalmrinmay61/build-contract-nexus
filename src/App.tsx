
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";

import Index from "./pages/Index";
import About from "./pages/About";
import HowItWorks from "./pages/HowItWorks";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "./context/AuthContext";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import NewProject from "./pages/projects/NewProject";
import ProjectDetail from "./pages/projects/ProjectDetail";
import BrowseProjects from "./pages/projects/BrowseProjects";
import UserProfile from "./pages/profile/UserProfile";
import WalletManagement from "./pages/wallet/WalletManagement";
import MessagesPage from "./pages/messages/MessagesPage";
import DisputesPage from "./pages/disputes/DisputesPage";
import DisputeDetailPage from "./pages/disputes/DisputeDetailPage";
import AdminDashboard from "./pages/admin/AdminDashboard";

const queryClient = new QueryClient();

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Index />} />
    <Route path="/about" element={<About />} />
    <Route path="/how-it-works" element={<HowItWorks />} />
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    
    <Route element={<ProtectedRoute />}>
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/projects/new" element={<NewProject />} />
      <Route path="/projects/:id" element={<ProjectDetail />} />
      <Route path="/projects/browse" element={<BrowseProjects />} />
      <Route path="/profile" element={<UserProfile />} />
      <Route path="/wallet" element={<WalletManagement />} />
      <Route path="/messages" element={<MessagesPage />} />
      <Route path="/disputes" element={<DisputesPage />} />
      <Route path="/disputes/:id" element={<DisputeDetailPage />} />
      <Route path="/admin" element={<AdminDashboard />} />
    </Route>
    
    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <AppRoutes />
        </AuthProvider>
      </TooltipProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
