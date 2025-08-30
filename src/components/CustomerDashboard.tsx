import React, { useState, useEffect } from 'react';
import { IndianRupee, Car, Calendar, X } from 'lucide-react';
import { api } from '../services/api';
import { Booking } from '../types';

interface CustomerDashboardProps {
  customerId: number;
}

// Helper function to check if a car is available for the selected dates
function isCarAvailableForDates(car: any, start: string, end: string) {
  if (!car.bookings) return true;
  const startDate = new Date(start);
  const endDate = new Date(end);
  return car.bookings.every((booking: any) => {
    const bookedStart = new Date(booking.start_date);
    const bookedEnd = new Date(booking.end_date);
    // No overlap if booking ends before start or starts after end
    return endDate < bookedStart || startDate > bookedEnd;
  });
}

export const CustomerDashboard: React.FC<CustomerDashboardProps> = ({ customerId }) => {
  const [activeTab, setActiveTab] = useState<'book' | 'bookings'>('book');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [cars, setCars] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showBookingForm, setShowBookingForm] = useState(false);

  // Booking form state
  const [bookingForm, setBookingForm] = useState({
    car_id: 0,
    start_date: '',
    end_date: ''
  });

  useEffect(() => {
    fetchCars();
  }, []);

  useEffect(() => {
    if (activeTab === 'bookings') {
      fetchBookings();
    }
  }, [activeTab]);

  const fetchCars = async () => {
    try {
      const response = await fetch('http://localhost:5000/cars_with_bookings');
      const data = await response.json();
      setCars(data);
    } catch {
      setError('Failed to fetch cars');
    }
  };

  const fetchBookings = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.getCustomerBookings(customerId);
      setBookings(response);
    } catch {
      setError('Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleBookCar = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await api.rentCar(customerId, bookingForm.car_id, bookingForm.start_date, bookingForm.end_date);
      setSuccess('Car booked successfully!');
      setBookingForm({ car_id: 0, start_date: '', end_date: '' });
      setShowBookingForm(false);
      fetchCars(); // Refresh car list after booking
      if (activeTab === 'bookings') {
        fetchBookings();
      }
    } catch (err) {
      setError('Failed to book car');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId: number) => {
    try {
      await api.customerCancelBooking(bookingId);
      setSuccess('Booking cancelled successfully!');
      fetchBookings();
      fetchCars(); // Refresh car list after cancellation
    } catch (err) {
      setError('Failed to cancel booking');
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

  const selectedCar = cars.find(car => car.id === bookingForm.car_id);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Customer Dashboard</h2>
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('book')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'book'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Car className="inline h-4 w-4 mr-2" />
              Available Cars
            </button>
            <button
              onClick={() => setActiveTab('bookings')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'bookings'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Calendar className="inline h-4 w-4 mr-2" />
              My Bookings
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
        {/* Available Cars Tab */}
        {activeTab === 'book' && (
          <div>
            {/* Date selection before showing cars */}
            <div className="flex space-x-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={bookingForm.start_date}
                  onChange={e => setBookingForm({ ...bookingForm, start_date: e.target.value })}
                  className="border rounded px-2 py-1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  value={bookingForm.end_date}
                  onChange={e => setBookingForm({ ...bookingForm, end_date: e.target.value })}
                  className="border rounded px-2 py-1"
                />
              </div>
            </div>
            {showBookingForm ? (
              <div className="max-w-md bg-gray-50 p-6 rounded-lg">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Book Your Car</h4>
                {selectedCar && (
                  <div className="mb-4 p-3 bg-white rounded border">
                    <div className="font-medium">{selectedCar.brand} {selectedCar.model}</div>
                    <div className="text-sm text-gray-600">₹{selectedCar.price_per_day}/day</div>
                  </div>
                )}
                <form onSubmit={handleBookCar} className="space-y-4">
                  <div>
                    <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      id="start_date"
                      value={bookingForm.start_date}
                      onChange={(e) => setBookingForm({ ...bookingForm, start_date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="end_date" className="block text-sm font-medium text-gray-700 mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      id="end_date"
                      value={bookingForm.end_date}
                      onChange={(e) => setBookingForm({ ...bookingForm, end_date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowBookingForm(false)}
                      className="flex-1 py-2 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                      {loading ? 'Booking...' : 'Book Now'}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              bookingForm.start_date && bookingForm.end_date ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {cars
                    .filter(car => isCarAvailableForDates(car, bookingForm.start_date, bookingForm.end_date))
                    .map(car => (
                      <div key={car.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                          <div className="p-3 bg-blue-100 rounded-lg">
                            <Car className="h-6 w-6 text-blue-600" />
                          </div>
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            Available
                          </span>
                        </div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">
                          {car.brand} {car.model}
                        </h4>
                        <div className="flex items-center mb-4">
                          <IndianRupee className="h-4 w-4 text-gray-400 mr-1" />
                              <span className="text-lg font-bold text-gray-900">{car.price_per_day}</span>
                        </div>
                        <button
                          onClick={() => {
                            setBookingForm({ ...bookingForm, car_id: car.id });
                            setShowBookingForm(true);
                          }}
                          className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        >
                          Book This Car
                        </button>
                      </div>
                    ))}
                  {cars.filter(car => isCarAvailableForDates(car, bookingForm.start_date, bookingForm.end_date)).length === 0 && (
                    <div>No cars available for selected dates.</div>
                  )}
                </div>
              ) : (
                <div>Please select start and end dates to see available cars.</div>
              )
            )}
          </div>
        )}
        {/* My Bookings Tab */}
        {activeTab === 'bookings' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">My Bookings</h3>
            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-gray-600">Loading your bookings...</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {bookings.map((booking) => (
                  <div key={booking.id} className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">
                          {booking.brand} {booking.model}
                        </h4>
                        <p className="text-sm text-gray-600">
                          Booking #{booking.id}
                        </p>
                      </div>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                    </div>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>{booking.start_date} to {booking.end_date}</span>
                      </div>
                    </div>
                    {booking.status.toLowerCase() === 'booked' && (
                      <button
                        onClick={() => handleCancelBooking(booking.id)}
                        className="w-full py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                      >
                        Cancel Booking
                      </button>
                    )}
                  </div>
                ))}
                {bookings.length === 0 && (
                  <div className="col-span-full text-center py-8 text-gray-500">
                    <Car className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No bookings found</p>
                    <p className="text-sm">Book your first car from the Available Cars tab!</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};