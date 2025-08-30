const API_BASE = 'http://localhost:5000';

export const api = {
  // Admin APIs
  adminLogin: async (email: string, password: string) => {
    const response = await fetch(`${API_BASE}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return response.json();
  },

  addAdmin: async (name: string, email: string, password: string) => {
    const response = await fetch(`${API_BASE}/admin/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    return response.json();
  },

  addCar: async (model: string, brand: string, price_per_day: number) => {
    const response = await fetch(`${API_BASE}/admin/add_car`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, brand, price_per_day }),
    });
    return response.json();
  },

  getAllBookings: async () => {
    const response = await fetch(`${API_BASE}/admin/bookings`);
    return response.json();
  },

  cancelBooking: async (bookingId: number) => {
    const response = await fetch(`${API_BASE}/admin/cancel_booking/${bookingId}`, {
      method: 'PUT',
    });
    return response.json();
  },

  completeBooking: async (bookingId: number) => {
    const response = await fetch(`${API_BASE}/admin/complete_booking/${bookingId}`, {
      method: 'PUT',
    });
    return response.json();
  },

  // Customer APIs
  customerRegister: async (name: string, email: string, password: string, mobile: string) => {
    const response = await fetch(`${API_BASE}/customer/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, mobile }),
    });
    return response.json();
  },

  customerLogin: async (email: string, password: string) => {
    const response = await fetch(`${API_BASE}/customer/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return response.json();
  },

  rentCar: async (customer_id: number, car_id: number, start_date: string, end_date: string) => {
    const response = await fetch(`${API_BASE}/customer/rent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customer_id, car_id, start_date, end_date }),
    });
    return response.json();
  },

  getCustomerBookings: async (customerId: number) => {
    const response = await fetch(`${API_BASE}/customer/bookings/${customerId}`);
    return response.json();
  },

  customerCancelBooking: async (bookingId: number) => {
    const response = await fetch(`${API_BASE}/customer/cancel_booking/${bookingId}`, {
      method: 'PUT',
    });
    return response.json();
  },
};