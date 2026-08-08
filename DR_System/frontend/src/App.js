import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Signup from './pages/Signup';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import ConsumerDashboard from './pages/ConsumerDashboard';
import GridOperatorDashboard from './pages/GridOperatorDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import RealTimePrediction from './pages/RealTimePrediction';
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import HomeScreen from './pages/HomeScreen';
import Features from './pages/Features';
import About from './pages/About';
import Contact from './pages/Contact';

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

function AppContent() {
  const location = useLocation(); // Now this is inside the Router

  // Define routes where the footer should NOT be displayed
  const noFooterRoutes = ['/grid-operator-dashboard'];

  // Check if the current route is in the noFooterRoutes array
  const shouldShowFooter = !noFooterRoutes.includes(location.pathname);

  return (
    <div className="app-container">
      <Navbar />
      <div className="content-container">
        <Routes>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/features" element={<Features />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route 
            path="/admin-dashboard" 
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/consumer-dashboard" 
            element={
              <ProtectedRoute>
                <ConsumerDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/real-time-prediction" 
            element={
              <ProtectedRoute>
                <RealTimePrediction />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/grid-operator-dashboard" 
            element={
              <ProtectedRoute>
                <GridOperatorDashboard />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </div>
      {shouldShowFooter && <Footer />} {/* Conditionally render the Footer */}
    </div>
  );
}

export default App;