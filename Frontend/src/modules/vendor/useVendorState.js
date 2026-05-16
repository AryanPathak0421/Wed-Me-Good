import { useCallback, useEffect, useState } from 'react';
import { defaultVendorState } from './vendorStore';
import { vendorApi } from './vendorApi';

export const useVendorState = () => {
  const [vendorState, setVendorState] = useState(defaultVendorState);
  const [loading, setLoading] = useState(!!localStorage.getItem('vendorToken'));

  const fetchAllData = useCallback(async (token) => {
    setLoading(true);
    try {
      // Always fetch profile first to check status
      const profileRes = await vendorApi.getProfile(token);
      
      // Handle unauthorized / expired token
      if (profileRes.success === false && (profileRes.message === 'Invalid token.' || profileRes.message === 'Access denied. No token provided.')) {
        localStorage.removeItem('vendorToken');
        window.location.href = '/vendor/login';
        return;
      }

      const newState = { ...defaultVendorState };
      if (profileRes.success) {
        Object.assign(newState, profileRes.data);
        
        // Only fetch restricted data if vendor is Approved
        if (profileRes.data.status === 'Approved') {
          const [statsRes, leadsRes, bookingsRes, notesRes] = await Promise.all([
            vendorApi.getStats(token),
            vendorApi.getLeads(token),
            vendorApi.getBookings(token),
            vendorApi.getNotifications(token)
          ]);

          if (statsRes.success) newState.analytics = statsRes.data;
          if (leadsRes.success) newState.leads = leadsRes.data;
          if (bookingsRes.success) newState.bookings = bookingsRes.data;
          if (notesRes.success) newState.notifications = notesRes.data;
        }
      }

      setVendorState(newState);
    } catch (err) {
      console.error('Failed to fetch vendor data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('vendorToken');
    if (token) {
      fetchAllData(token);
    }
  }, [fetchAllData]);

  const updateVendorState = useCallback((patch) => {
    setVendorState((prev) => ({ ...prev, ...patch }));
  }, []);

  return { vendorState, setVendorState, updateVendorState, loading, refreshData: () => fetchAllData(localStorage.getItem('vendorToken')) };
};
