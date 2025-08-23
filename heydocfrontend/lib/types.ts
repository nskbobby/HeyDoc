export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  date_of_birth?: string;
  gender?: 'M' | 'F' | 'O';
  profile_picture?: string;
  is_doctor: boolean;
  is_patient: boolean;
  created_at: string;
}

export interface Specialization {
  id: number;
  name: string;
  description?: string;
  icon?: string;
}

export interface Area {
  id: number;
  name: string;
  city_name: string;
  state_name: string;
  postal_code?: string;
}

export interface Clinic {
  id: number;
  name: string;
  address: string;
  area_name?: string;
  city_name?: string;
  phone?: string;
  email?: string;
  website?: string;
  is_primary: boolean;
}

export interface DoctorProfile {
  id: number;
  user: User;
  specializations: Specialization[];
  clinics?: Clinic[];
  primary_clinic?: Clinic;
  years_of_experience: number;
  consultation_fee: string;
  rating: string;
  total_reviews: number;
  is_verified: boolean;
  is_available: boolean;
  bio?: string;
}

export interface Appointment {
  id: number;
  patient: User;
  doctor: DoctorProfile;
  clinic?: Clinic;
  appointment_date: string;
  appointment_time: string;
  duration: number;
  status_name: string;
  consultation_fee: string;
  symptoms?: string;
  notes?: string;
  booking_id: string;
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  created_at: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  password_confirm: string;
  first_name: string;
  last_name: string;
  phone?: string;
  date_of_birth?: string;
  gender?: 'M' | 'F' | 'O';
  is_doctor?: boolean;
}