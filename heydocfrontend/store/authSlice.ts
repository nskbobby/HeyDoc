import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../lib/api';
import { User, LoginData, RegisterData } from '../lib/types';
import { addNotification } from './uiSlice';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: true, // Start with loading=true to prevent flash of unauthenticated state
  error: null,
};

export const login = createAsyncThunk(
  'auth/login',
  async (loginData: LoginData) => {
    const response = await api.post('/auth/login/', loginData);
    const data = response.data as { access: string; refresh: string; user: User };
    localStorage.setItem('access_token', data.access);
    localStorage.setItem('refresh_token', data.refresh);
    return data.user;
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (registerData: RegisterData) => {
    const response = await api.post('/auth/register/', registerData);
    const data = response.data as { access: string; refresh: string; user: User };
    localStorage.setItem('access_token', data.access);
    localStorage.setItem('refresh_token', data.refresh);
    return data.user;
  }
);

export const logout = createAsyncThunk(
  'auth/logout', 
  async (router: { push: (url: string) => void } | undefined, thunkAPI) => {
    const { rejectWithValue, dispatch } = thunkAPI;
    try {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      
      // Show success notification
      dispatch(addNotification({
        type: 'success',
        message: 'Logout successful'
      }));
      
      // Small delay to show the toast before redirect
      setTimeout(() => {
        if (router) {
          router.push('/');
        } else if (typeof window !== 'undefined') {
          window.location.href = '/';
        }
      }, 500);
      
    } catch (error) {
      return rejectWithValue('Logout failed');
    }
  }
);

export const initializeAuth = createAsyncThunk(
  'auth/initialize',
  async (_, { rejectWithValue }) => {
    // Check if we're in browser environment
    if (typeof window === 'undefined') {
      return null;
    }
    
    const token = localStorage.getItem('access_token');
    const refreshToken = localStorage.getItem('refresh_token');
    
    if (token) {
      try {
        // First try to get user data with current token
        const response = await api.get('/auth/user/');
        return response.data as User;
      } catch (error: any) {
        // If token is invalid, try to refresh if we have a refresh token
        if (error.response?.status === 401 && refreshToken) {
          try {
            const refreshResponse = await api.post('/auth/token/refresh/', {
              refresh: refreshToken
            });
            const newToken = (refreshResponse.data as any).access;
            localStorage.setItem('access_token', newToken);
            
            // Try getting user data with new token
            const userResponse = await api.get('/auth/user/');
            return userResponse.data as User;
          } catch (refreshError) {
            // Refresh failed, clear tokens
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            return rejectWithValue('Session expired');
          }
        } else {
          // No refresh token or other error, clear tokens
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          return rejectWithValue('Authentication failed');
        }
      }
    }
    return null;
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (profileData: Partial<User>) => {
    const response = await api.patch('/auth/user/', profileData);
    return response.data as User;
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    clearAuth: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Login failed';
      })
      // Register
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Registration failed';
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
      })
      // Initialize auth
      .addCase(initializeAuth.pending, (state) => {
        state.loading = true;
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.user = action.payload;
          state.isAuthenticated = true;
        }
      })
      .addCase(initializeAuth.rejected, (state) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
      })
      // Update profile
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update profile';
      });
  },
});

export const { clearError, setUser, setLoading, clearAuth } = authSlice.actions;
export default authSlice.reducer;