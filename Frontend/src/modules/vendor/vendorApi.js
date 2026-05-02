const BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api') + '/vendor';

export const vendorApi = {
    register: async (data) => {
        const response = await fetch(`${BASE_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return response.json();
    },

    login: async (email, password) => {
        const response = await fetch(`${BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        return response.json();
    },

    updateOnboarding: async (step, data, token) => {
        const response = await fetch(`${BASE_URL}/onboarding/${step}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });
        return response.json();
    },

    getProfile: async (token) => {
        const response = await fetch(`${BASE_URL}/me`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.json();
    },

    uploadMedia: async (file, token) => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await fetch(`${BASE_URL}/upload`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });
        return response.json();
    },

    getStats: async (token) => {
        const response = await fetch(`${BASE_URL}/stats`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return response.json();
    },

    getLeads: async (token) => {
        const response = await fetch(`${BASE_URL}/leads`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return response.json();
    },

    updateLeadStatus: async (id, status, token) => {
        const response = await fetch(`${BASE_URL}/leads/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status })
        });
        return response.json();
    },

    getBookings: async (token) => {
        const response = await fetch(`${BASE_URL}/bookings`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return response.json();
    },

    getReviews: async (token) => {
        const response = await fetch(`${BASE_URL}/reviews`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return response.json();
    },

    replyToReview: async (id, reply, token) => {
        const response = await fetch(`${BASE_URL}/reviews/${id}/reply`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ reply })
        });
        return response.json();
    },

    getNotifications: async (token) => {
        const response = await fetch(`${BASE_URL}/notifications`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return response.json();
    },

    markNotificationRead: async (id, token) => {
        const response = await fetch(`${BASE_URL}/notifications/${id}/read`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return response.json();
    },

    getSubscriptionPlans: async (token) => {
        const response = await fetch(`${BASE_URL}/subscription/plans`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return response.json();
    },

    createSubscriptionOrder: async (data, token) => {
        const response = await fetch(`${BASE_URL}/subscription/order`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });
        return response.json();
    },

    verifySubscriptionPayment: async (data, token) => {
        const response = await fetch(`${BASE_URL}/subscription/verify`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });
        return response.json();
    }
};
