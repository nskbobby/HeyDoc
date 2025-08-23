import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../lib/api';
import { DoctorProfile, Specialization } from '../lib/types';

interface DoctorsState {
  doctors: DoctorProfile[];
  selectedDoctor: DoctorProfile | null;
  specializations: Specialization[];
  loading: boolean;
  error: string | null;
  filters: {
    search: string;
    specialization: string;
    city: string;
    minFee: number;
    maxFee: number;
    rating: number;
  };
}

const initialState: DoctorsState = {
  doctors: [],
  selectedDoctor: null,
  specializations: [],
  loading: false,
  error: null,
  filters: {
    search: '',
    specialization: '',
    city: '',
    minFee: 0,
    maxFee: 1000,
    rating: 0,
  },
};

export const fetchDoctors = createAsyncThunk(
  'doctors/fetchDoctors',
  async (params?: any) => {
    const response = await api.get('/doctors/', { params });
    return response.data;
  }
);

export const fetchDoctorById = createAsyncThunk(
  'doctors/fetchDoctorById',
  async (id: number) => {
    const response = await api.get(`/doctors/${id}/`);
    return response.data;
  }
);

export const fetchSpecializations = createAsyncThunk(
  'doctors/fetchSpecializations',
  async () => {
    const response = await api.get('/doctors/specializations/');
    return response.data;
  }
);

const doctorsSlice = createSlice({
  name: 'doctors',
  initialState,
  reducers: {
    updateFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    clearSelectedDoctor: (state) => {
      state.selectedDoctor = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch doctors
      .addCase(fetchDoctors.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchDoctors.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload as { results?: DoctorProfile[] } | DoctorProfile[];
        state.doctors = (Array.isArray(payload) ? payload : payload.results) || [];
      })
      .addCase(fetchDoctors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch doctors';
      })
      // Fetch doctor by ID
      .addCase(fetchDoctorById.fulfilled, (state, action) => {
        state.selectedDoctor = action.payload as DoctorProfile;
      })
      // Fetch specializations
      .addCase(fetchSpecializations.fulfilled, (state, action) => {
        const payload = action.payload as { results?: Specialization[] } | Specialization[];
        const specializations = Array.isArray(payload) ? payload : payload.results || [];
        state.specializations = specializations;
      })
      .addCase(fetchSpecializations.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to fetch specializations';
      });
  },
});

export const { updateFilters, clearFilters, clearSelectedDoctor } = doctorsSlice.actions;
export default doctorsSlice.reducer;