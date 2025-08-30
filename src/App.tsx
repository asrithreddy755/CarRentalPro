import React, { useState } from 'react';
import { Shield, User, UserPlus } from 'lucide-react';
import { Layout } from './components/Layout';
import { LoginForm } from './components/LoginForm';
import { CustomerRegister } from './components/CustomerRegister';
import { AdminDashboard } from './components/AdminDashboard';
import { CustomerDashboard } from './components/CustomerDashboard';
import { api } from './services/api';

type AppState = 
  | { view: 'welcome' }
  | { view: 'admin-login' }
  | { view: 'customer-login' }
  | { view: 'customer-register' }
  | { view: 'admin-dashboard'; adminId: number; adminName: string }
  | { view: 'customer-dashboard'; customerId: number; customerName: string };

function App() {
  const [state, setState] = useState<AppState>({ view: 'welcome' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleAdminLogin = async (email: string, password: string) => {
    setLoading(true);
    setError('');
    try {
      const response = await api.adminLogin(email, password);
      if (response.admin_id) {
        setState({ 
          view: 'admin-dashboard', 
          adminId: response.admin_id,
          adminName: email.split('@')[0] // Use email prefix as name
        });
      } else {
        setError(response.error || 'Login failed');
      }
    } catch (err) {
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const handleCustomerLogin = async (email: string, password: string) => {
    setLoading(true);
    setError('');
    try {
      const response = await api.customerLogin(email, password);
      if (response.customer_id) {
        setState({ 
          view: 'customer-dashboard', 
          customerId: response.customer_id,
          customerName: email.split('@')[0] // Use email prefix as name
        });
      } else {
        setError(response.error || 'Login failed');
      }
    } catch (err) {
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const handleCustomerRegister = async (name: string, email: string, password: string, mobile: string) => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const response = await api.customerRegister(name, email, password, mobile);
      if (response.message) {
        setSuccess(response.message);
        // Clear form and show success message
      } else {
        setError(response.error || 'Registration failed');
      }
    } catch (err) {
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setState({ view: 'welcome' });
    setError('');
    setSuccess('');
  };

  const getUserType = (): 'admin' | 'customer' | null => {
    if (state.view === 'admin-dashboard') return 'admin';
    if (state.view === 'customer-dashboard') return 'customer';
    return null;
  };

  const getUserName = (): string => {
    if (state.view === 'admin-dashboard') return state.adminName;
    if (state.view === 'customer-dashboard') return state.customerName;
    return '';
  };

  return (
    <Layout 
      userType={getUserType()} 
      userName={getUserName()}
      onLogout={handleLogout}
    >
      {/* Welcome Screen */}
      {state.view === 'welcome' && (
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Welcome to CarRental Pro
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Your premier destination for hassle-free car rentals
            </p>
            <div className="w-24 h-1 bg-blue-600 mx-auto rounded-full"></div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white p-8 rounded-lg shadow-md border-2 border-gray-100 hover:border-blue-200 transition-colors">
              <div className="p-4 bg-blue-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Admin Portal</h3>
              <p className="text-gray-600 mb-6">
                Manage your fleet, bookings, and administrators with our comprehensive admin dashboard
              </p>
              <button
                onClick={() => setState({ view: 'admin-login' })}
                className="w-full py-3 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                Admin Login
              </button>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-md border-2 border-gray-100 hover:border-emerald-200 transition-colors">
              <div className="p-4 bg-emerald-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <User className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Customer Login</h3>
              <p className="text-gray-600 mb-6">
                Access your account to view available cars, make bookings, and manage your rentals
              </p>
              <button
                onClick={() => setState({ view: 'customer-login' })}
                className="w-full py-3 px-6 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-semibold"
              >
                Customer Login
              </button>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-md border-2 border-gray-100 hover:border-orange-200 transition-colors">
              <div className="p-4 bg-orange-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <UserPlus className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">New Customer</h3>
              <p className="text-gray-600 mb-6">
                Create your customer account to start booking cars and enjoy our rental services, resister for free
              </p>
              <button
                onClick={() => setState({ view: 'customer-register' })}
                className="w-full py-3 px-6 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-semibold"
              >
                Register Now
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-emerald-50 rounded-lg p-8 text-left">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Why Choose CarRental Pro?</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Wide Selection</h4>
                    <p className="text-gray-600">Choose from our extensive fleet of well-maintained vehicles</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Competitive Pricing</h4>
                    <p className="text-gray-600">Best rates in the market with transparent pricing</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Easy Booking</h4>
                    <p className="text-gray-600">Simple online booking process with instant confirmation</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-semibold text-gray-900">24/7 Support</h4>
                    <p className="text-gray-600">Round-the-clock customer support for your peace of mind</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Admin Login */}
      {state.view === 'admin-login' && (
        <LoginForm
          userType="admin"
          onLogin={handleAdminLogin}
          onBack={() => setState({ view: 'welcome' })}
          loading={loading}
          error={error}
        />
      )}

      {/* Customer Login */}
      {state.view === 'customer-login' && (
        <LoginForm
          userType="customer"
          onLogin={handleCustomerLogin}
          onBack={() => setState({ view: 'welcome' })}
          loading={loading}
          error={error}
        />
      )}

      {/* Customer Registration */}
      {state.view === 'customer-register' && (
        <CustomerRegister
          onRegister={handleCustomerRegister}
          onBack={() => setState({ view: 'welcome' })}
          loading={loading}
          error={error}
          success={success}
        />
      )}

      {/* Admin Dashboard */}
      {state.view === 'admin-dashboard' && (
        <AdminDashboard adminId={state.adminId} />
      )}

      {/* Customer Dashboard */}
      {state.view === 'customer-dashboard' && (
        <CustomerDashboard customerId={state.customerId} />
      )}
    </Layout>
  );
}

export default App;