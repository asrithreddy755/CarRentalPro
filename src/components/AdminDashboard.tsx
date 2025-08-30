import React, { useState, useEffect } from 'react';
import { Plus, Car, Users, Calendar, X, Check } from 'lucide-react';
import { api } from '../services/api';
import { Booking } from '../types';

interface AdminDashboardProps {
  adminId: number;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ adminId }) => {
  const [activeTab, setActiveTab] = useState<'cars' | 'bookings' | 'admins'>('bookings');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Car form state
  const [carForm, setCarForm] = useState({
    model: '',
    brand: '',
    price_per_day: ''
  });

  // Admin form state
  const [adminForm, setAdminForm] = useState({
    name: '',
    email: '',
    password: ''
  });

  useEffect(() => {
    if (activeTab === 'bookings') {
      fetchBookings();
    }
  }, [activeTab]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const data = await api.getAllBookings();
      setBookings(data);
    } catch (err) {
      setError('Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCar = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      await api.addCar(carForm.model, carForm.brand, parseFloat(carForm.price_per_day));
      setSuccess('Car added successfully!');
      setCarForm({ model: '', brand: '', price_per_day: '' });
    } catch (err) {
      setError('Failed to add car');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      await api.addAdmin(adminForm.name, adminForm.email, adminForm.password);
      setSuccess('Admin added successfully!');
      setAdminForm({ name: '', email: '', password: '' });
    } catch (err) {
      setError('Failed to add admin');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId: number) => {
    try {
      await api.cancelBooking(bookingId);
      setSuccess('Booking cancelled successfully!');
      fetchBookings();
    } catch (err) {
      setError('Failed to cancel booking');
    }
  };

  const handleCompleteBooking = async (bookingId: number) => {
    try {
      await api.completeBooking(bookingId);
      setSuccess('Booking marked as completed!');
      fetchBookings();
    } catch (err) {
      setError('Failed to complete booking');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'booked': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'canceled by customer': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Admin Dashboard</h2>
        
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('bookings')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'bookings'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Calendar className="inline h-4 w-4 mr-2" />
              Bookings
            </button>
            <button
              onClick={() => setActiveTab('cars')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'cars'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Car className="inline h-4 w-4 mr-2" />
              Add Cars
            </button>
            <button
              onClick={() => setActiveTab('admins')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'admins'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Users className="inline h-4 w-4 mr-2" />
              Add Admins
            </button>
          </nav>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-700">{error}</p>
          </div>
        )}
        
        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
            <p className="text-green-700">{success}</p>
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">All Bookings</h3>
            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-gray-600">Loading bookings...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Car
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Dates
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {bookings.map((booking) => (
                      <tr key={booking.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {booking.customer_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {booking.customer_mobile}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {booking.brand} {booking.model}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {booking.start_date} to {booking.end_date}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                            {booking.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          {booking.status.toLowerCase() === 'booked' && (
                            <>
                              <button
                                onClick={() => handleCompleteBooking(booking.id)}
                                className="inline-flex items-center px-3 py-1 bg-green-600 text-white text-xs rounded-md hover:bg-green-700 transition-colors"
                              >
                                <Check className="h-3 w-3 mr-1" />
                                Complete
                              </button>
                              <button
                                onClick={() => handleCancelBooking(booking.id)}
                                className="inline-flex items-center px-3 py-1 bg-red-600 text-white text-xs rounded-md hover:bg-red-700 transition-colors"
                              >
                                <X className="h-3 w-3 mr-1" />
                                Cancel
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {bookings.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No bookings found
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Add Cars Tab */}
        {activeTab === 'cars' && (
          <div className="max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Car</h3>
            <form onSubmit={handleAddCar} className="space-y-4">
              <div>
                <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-1">
                  Car Model
                </label>
                <input
                  type="text"
                  id="model"
                  value={carForm.model}
                  onChange={(e) => setCarForm({ ...carForm, model: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Camry"
                  required
                />
              </div>
              <div>
                <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-1">
                  Brand
                </label>
                <input
                  type="text"
                  id="brand"
                  value={carForm.brand}
                  onChange={(e) => setCarForm({ ...carForm, brand: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Toyota"
                  required
                />
              </div>
              <div>
                <label htmlFor="price_per_day" className="block text-sm font-medium text-gray-700 mb-1">
                  Price per Day (₹)
                </label>
                <input
                  type="number"
                  id="price_per_day"
                  step="0.01"
                  value={carForm.price_per_day}
                  onChange={(e) => setCarForm({ ...carForm, price_per_day: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 50.00"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Adding Car...' : 'Add Car'}
              </button>
            </form>
          </div>
        )}

        {/* Add Admins Tab */}
        {activeTab === 'admins' && (
          <div className="max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Admin</h3>
            <form onSubmit={handleAddAdmin} className="space-y-4">
              <div>
                <label htmlFor="admin_name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  id="admin_name"
                  value={adminForm.name}
                  onChange={(e) => setAdminForm({ ...adminForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter admin name"
                  required
                />
              </div>
              <div>
                <label htmlFor="admin_email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  id="admin_email"
                  value={adminForm.email}
                  onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter admin email"
                  required
                />
              </div>
              <div>
                <label htmlFor="admin_password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  id="admin_password"
                  value={adminForm.password}
                  onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Create admin password"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Adding Admin...' : 'Add Admin'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};