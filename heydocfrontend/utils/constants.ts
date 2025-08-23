export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login/',
    REGISTER: '/auth/register/',
    REFRESH: '/auth/token/refresh/',
    PROFILE: '/auth/profile/',
  },
  DOCTORS: {
    LIST: '/doctors/',
    DETAIL: (id: number) => `/doctors/${id}/`,
    SPECIALIZATIONS: '/doctors/specializations/',
    AVAILABILITY: (id: number) => `/doctors/${id}/availability/`,
  },
  APPOINTMENTS: {
    LIST: '/appointments/',
    CREATE: '/appointments/',
    DETAIL: (id: number) => `/appointments/${id}/`,
    CANCEL: (id: number) => `/appointments/${id}/cancel/`,
    AVAILABLE_SLOTS: '/appointments/available-slots/',
  },
  LOCATIONS: {
    COUNTRIES: '/locations/countries/',
    STATES: '/locations/states/',
    CITIES: '/locations/cities/',
    AREAS: '/locations/areas/',
  },
  REVIEWS: {
    LIST: '/reviews/',
    CREATE: '/reviews/',
    DETAIL: (id: number) => `/reviews/${id}/`,
  },
  NOTIFICATIONS: {
    LIST: '/notifications/',
    MARK_READ: (id: number) => `/notifications/${id}/read/`,
    MARK_ALL_READ: '/notifications/mark-all-read/',
  },
};

export const APPOINTMENT_STATUS = {
  SCHEDULED: 'scheduled',
  CONFIRMED: 'confirmed',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  NO_SHOW: 'no_show',
};

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
  REFUNDED: 'refunded',
};

export const GENDER_OPTIONS = [
  { value: 'M', label: 'Male' },
  { value: 'F', label: 'Female' },
  { value: 'O', label: 'Other' },
];

export const BLOOD_GROUP_OPTIONS = [
  { value: 'A+', label: 'A+' },
  { value: 'A-', label: 'A-' },
  { value: 'B+', label: 'B+' },
  { value: 'B-', label: 'B-' },
  { value: 'AB+', label: 'AB+' },
  { value: 'AB-', label: 'AB-' },
  { value: 'O+', label: 'O+' },
  { value: 'O-', label: 'O-' },
];