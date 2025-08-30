export interface Admin {
  id: number;
  name: string;
  email: string;
}

export interface Customer {
  id: number;
  name: string;
  email: string;
  mobile: string;
}

export interface Car {
  id: number;
  model: string;
  brand: string;
  price_per_day: number;
  available: boolean;
}

export interface Booking {
  id: number;
  customer_id?: number;
  car_id?: number;
  customer_name?: string;
  customer_mobile?: string;
  model: string;
  brand: string;
  start_date: string;
  end_date: string;
  status: string;
}

export interface LoginResponse {
  message: string;
  admin_id?: number;
  customer_id?: number;
  mobile?: string;
}