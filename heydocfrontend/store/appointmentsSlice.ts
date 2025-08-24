import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../lib/api';
import { Appointment } from '../lib/types';

interface AppointmentsState {
  appointments: Appointment[];
  selectedAppointment: Appointment | null;
  availableSlots: string[];
  dateAvailability: { [key: string]: boolean };
  loading: boolean;
  slotsLoading: boolean;
  error: string | null;
}

const initialState: AppointmentsState = {
  appointments: [],
  selectedAppointment: null,
  availableSlots: [],
  dateAvailability: {},
  loading: false,
  slotsLoading: false,
  error: null,
};

export const fetchAppointments = createAsyncThunk(
  'appointments/fetchAppointments',
  async (params?: { role?: 'doctor' | 'patient' }) => {
    const response = await api.get('/appointments/');
    return response.data;
  }
);

export const createAppointment = createAsyncThunk(
  'appointments/createAppointment',
  async (appointmentData: any, { rejectWithValue }) => {
    try {
      const response = await api.post('/appointments/', appointmentData);
      return response.data;
    } catch (error: any) {
      // Return the full error response data so the frontend can handle it properly
      return rejectWithValue(error.response?.data || error.message || 'Failed to create appointment');
    }
  }
);

export const cancelAppointment = createAsyncThunk(
  'appointments/cancelAppointment',
  async (appointmentId: number) => {
    await api.post(`/appointments/${appointmentId}/cancel/`);
    return appointmentId;
  }
);

export const fetchAvailableSlots = createAsyncThunk(
  'appointments/fetchAvailableSlots',
  async ({ doctorId, date }: { doctorId: number; date: string }) => {
    const response = await api.get(`/appointments/available-slots/?doctor_id=${doctorId}&date=${date}`);
    return response.data;
  }
);

export const checkDateAvailability = createAsyncThunk(
  'appointments/checkDateAvailability',
  async ({ doctorId, date, dates }: { doctorId: number; date?: string; dates?: string[] }) => {
    if (dates && dates.length > 0) {
      // Batch request for multiple dates
      const response = await api.get(`/appointments/check-date-availability/?doctor_id=${doctorId}&dates=${dates.join(',')}`);
      return { doctorId, dates, results: response.data };
    } else if (date) {
      // Single date request (backward compatibility)
      const response = await api.get(`/appointments/check-date-availability/?doctor_id=${doctorId}&date=${date}`);
      return { doctorId, date, results: response.data };
    }
    throw new Error('Either date or dates must be provided');
  }
);

const appointmentsSlice = createSlice({
  name: 'appointments',
  initialState,
  reducers: {
    setSelectedAppointment: (state, action) => {
      state.selectedAppointment = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch appointments
      .addCase(fetchAppointments.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAppointments.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload as { results?: Appointment[] } | Appointment[];
        const appointments = Array.isArray(payload) ? payload : payload.results || [];
        state.appointments = appointments;
      })
      .addCase(fetchAppointments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch appointments';
      })
      // Create appointment
      .addCase(createAppointment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAppointment.fulfilled, (state, action) => {
        state.loading = false;
        const newAppointment = action.payload as Appointment;
        state.appointments.unshift(newAppointment);
        state.error = null;
      })
      .addCase(createAppointment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to create appointment';
      })
      // Cancel appointment
      .addCase(cancelAppointment.fulfilled, (state, action) => {
        const index = state.appointments.findIndex(apt => apt.id === action.payload);
        if (index !== -1) {
          state.appointments[index].status_name = 'cancelled';
        }
      })
      // Fetch available slots
      .addCase(fetchAvailableSlots.pending, (state) => {
        state.slotsLoading = true;
      })
      .addCase(fetchAvailableSlots.fulfilled, (state, action) => {
        state.slotsLoading = false;
        state.availableSlots = (action.payload as any)?.available_slots || [];
      })
      .addCase(fetchAvailableSlots.rejected, (state, action) => {
        state.slotsLoading = false;
        state.availableSlots = [];
        state.error = action.error.message || 'Failed to fetch available slots';
      })
      // Check date availability
      .addCase(checkDateAvailability.fulfilled, (state, action) => {
        const payload = action.payload as any;
        const { doctorId } = action.meta.arg;
        
        if (payload.dates && Array.isArray(payload.results)) {
          // Handle batch response
          payload.results.forEach((result: any, index: number) => {
            const date = payload.dates[index];
            const key = `${doctorId}-${date}`;
            state.dateAvailability[key] = result?.available;
          });
        } else if (payload.date) {
          // Handle single date response
          const key = `${doctorId}-${payload.date}`;
          state.dateAvailability[key] = payload.results?.available;
        }
      });
  },
});

export const { setSelectedAppointment, clearError } = appointmentsSlice.actions;
export default appointmentsSlice.reducer;