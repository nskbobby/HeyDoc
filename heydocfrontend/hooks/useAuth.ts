import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { setUser } from '../store/authSlice';
import api from '../lib/api';

export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated, loading } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    
    if (token && !user) {
      // Fetch user profile
      api.get('/auth/profile/')
        .then(response => {
          dispatch(setUser(response.data));
        })
        .catch(() => {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
        });
    }
  }, [dispatch, user]);

  return {
    user,
    isAuthenticated,
    loading,
  };
};