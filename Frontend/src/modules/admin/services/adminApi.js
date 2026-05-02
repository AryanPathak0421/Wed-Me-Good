const API_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/admin` : '/api/admin';

export const adminApi = {
    getVendors: async (token) => {
        const res = await fetch(`${API_URL}/vendors`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return await res.json();
    },

    updateVendorStatus: async (vendorId, status, token) => {
        const res = await fetch(`${API_URL}/vendors/${vendorId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status })
        });
        return await res.json();
    },

    getStats: async (token) => {
        const res = await fetch(`${API_URL}/stats`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return await res.json();
    },

    getSubscriptionPlans: async (token) => {
        const res = await fetch(`${API_URL}/subscription-plans`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return await res.json();
    },

    createSubscriptionPlan: async (data, token) => {
        const res = await fetch(`${API_URL}/subscription-plans`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });
        return await res.json();
    },

    updateSubscriptionPlan: async (id, data, token) => {
        const res = await fetch(`${API_URL}/subscription-plans/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });
        return await res.json();
    },

    deleteSubscriptionPlan: async (id, token) => {
        const res = await fetch(`${API_URL}/subscription-plans/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return await res.json();
    },

    // Category Management
    getCategories: async () => {
        const res = await fetch(`${API_URL}/categories`);
        return await res.json();
    },

    createCategory: async (data, token) => {
        const res = await fetch(`${API_URL}/categories`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });
        return await res.json();
    },

    updateCategory: async (id, data, token) => {
        const res = await fetch(`${API_URL}/categories/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });
        return await res.json();
    },

    deleteCategory: async (id, token) => {
        const res = await fetch(`${API_URL}/categories/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return await res.json();
    },

    getReviews: async (token) => {
        const res = await fetch(`${API_URL}/reviews`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return await res.json();
    },

    deleteReview: async (id, token) => {
        const res = await fetch(`${API_URL}/reviews/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return await res.json();
    },

    getAnalytics: async (token) => {
        const res = await fetch(`${API_URL}/analytics`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return await res.json();
    },

    getBookings: async (token) => {
        const res = await fetch(`${API_URL}/bookings`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return await res.json();
    },

    getPayments: async (token) => {
        const res = await fetch(`${API_URL}/payments`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return await res.json();
    }
};
