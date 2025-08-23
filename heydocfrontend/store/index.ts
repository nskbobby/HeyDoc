import { configureStore } from '@reduxjs/toolkit';
import authSlice from './authSlice';
import doctorsSlice from './doctorsSlice';
import appointmentsSlice from './appointmentsSlice';
import uiSlice from './uiSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    doctors: doctorsSlice,
    appointments: appointmentsSlice,
    ui: uiSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;