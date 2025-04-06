import axios from 'axios';
import API_ENDPOINTS from '../config/api.config';

// Create axios instance with default config
const apiClient = axios.create({
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add a request interceptor to include auth token in headers
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('cycleconnect_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
      console.log('Token added to request headers');
    } else {
      console.warn('No token found when making request to:', config.url);
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle common errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle unauthorized errors (token expired)
    if (error.response && error.response.status === 401) {
      console.error('Unauthorized error (401) detected');
      localStorage.removeItem('cycleconnect_token');
      // Redirect to login page if not already there
      if (!window.location.pathname.includes('/login')) {
        console.log('Redirecting to login page due to 401 error');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth services
export const AuthService = {
  register: (userData, cycleInfo, contacts) => {
    return apiClient.post(API_ENDPOINTS.AUTH.SIGNUP, {
      user: userData,
      cycleInfo: cycleInfo,
      contacts: contacts
    });
  },
  
  login: (email, password) => {
    return apiClient.post(API_ENDPOINTS.AUTH.LOGIN, { email, password });
  },
  
  logout: () => {
    localStorage.removeItem('cycleconnect_token');
    return apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
  },
  
  verifyToken: () => {
    return apiClient.get(API_ENDPOINTS.AUTH.VERIFY);
  }
};

// User services
export const UserService = {
  getUserProfile: () => {
    return apiClient.get(API_ENDPOINTS.USER.PROFILE);
  },
  
  updateUserProfile: (profileData) => {
    return apiClient.put(API_ENDPOINTS.USER.PROFILE, profileData);
  },
  
  updateCycleInfo: (cycleData) => {
    return apiClient.put(API_ENDPOINTS.USER.CYCLE_INFO, cycleData);
  },
  
  getTimelineData: () => {
    return apiClient.get(API_ENDPOINTS.USER.TIMELINE);
  }
};

// Cycle services
export const CycleService = {
  getAllCycles: () => {
    return apiClient.get(API_ENDPOINTS.CYCLE.GET_ALL);
  },
  
  getCurrentCycle: () => {
    return apiClient.get(API_ENDPOINTS.CYCLE.CURRENT);
  },
  
  getCyclePredictions: () => {
    return apiClient.get(API_ENDPOINTS.CYCLE.PREDICTIONS);
  },
  
  addCycleEntry: (cycleData) => {
    return apiClient.post(API_ENDPOINTS.CYCLE.GET_ALL, cycleData);
  },
  
  updateCycleEntry: (id, cycleData) => {
    return apiClient.put(`${API_ENDPOINTS.CYCLE.GET_ALL}/${id}`, cycleData);
  },
  
  deleteCycleEntry: (id) => {
    return apiClient.delete(`${API_ENDPOINTS.CYCLE.GET_ALL}/${id}`);
  }
};

// Contact services
export const ContactService = {
  getAllContacts: () => {
    return apiClient.get(API_ENDPOINTS.CONTACT.GET_ALL);
  },
  
  addContact: (contactData) => {
    return apiClient.post(API_ENDPOINTS.CONTACT.GET_ALL, contactData);
  },
  
  updateContact: (id, contactData) => {
    return apiClient.put(`${API_ENDPOINTS.CONTACT.GET_ALL}/${id}`, contactData);
  },
  
  deleteContact: (id) => {
    return apiClient.delete(`${API_ENDPOINTS.CONTACT.GET_ALL}/${id}`);
  },
  
  updateNotificationPreferences: (id, preferences) => {
    return apiClient.put(`${API_ENDPOINTS.CONTACT.GET_ALL}/${id}/notifications`, preferences);
  }
};

// Alert services
export const AlertService = {
  createAlert: (alertData) => {
    return apiClient.post(API_ENDPOINTS.ALERT.CREATE, alertData);
  },
  
  getAlerts: () => {
    return apiClient.get(API_ENDPOINTS.ALERT.CREATE);
  },
  
  getAlertStats: () => {
    return apiClient.get(API_ENDPOINTS.ALERT.STATS);
  },
  
  getAlertById: (id) => {
    return apiClient.get(`${API_ENDPOINTS.ALERT.CREATE}/${id}`);
  },
  
  updateAlert: (id, alertData) => {
    return apiClient.put(`${API_ENDPOINTS.ALERT.CREATE}/${id}`, alertData);
  },
  
  deleteAlert: (id) => {
    return apiClient.delete(`${API_ENDPOINTS.ALERT.CREATE}/${id}`);
  }
};

// Notification services
export const NotificationService = {
  sendNotification: (notificationData) => {
    return apiClient.post(API_ENDPOINTS.NOTIFICATION.SEND, notificationData);
  },
  
  sendTestNotification: (contactId, message) => {
    return apiClient.post(API_ENDPOINTS.NOTIFICATION.TEST, { contactId, message });
  }
};

// Calendar services
export const CalendarService = {
  getCalendarEvents: (filters = {}) => {
    return apiClient.get(API_ENDPOINTS.CALENDAR.GET_ALL, { params: filters });
  },
  
  createCalendarEvent: (eventData) => {
    // Ensure eventData contains startDate, endDate, category, title
    const requiredFields = ['startDate', 'endDate', 'category', 'title'];
    requiredFields.forEach(field => {
      if (!eventData[field]) {
        throw new Error(`${field} is required for calendar events`);
      }
    });
    
    // Validate start and end dates
    if (new Date(eventData.endDate) < new Date(eventData.startDate)) {
      throw new Error('End date must be after or equal to start date');
    }
    
    return apiClient.post(API_ENDPOINTS.CALENDAR.GET_ALL, eventData);
  },
  
  updateCalendarEvent: (id, eventData) => {
    // Validate start and end dates if both are provided
    if (eventData.startDate && eventData.endDate) {
      if (new Date(eventData.endDate) < new Date(eventData.startDate)) {
        throw new Error('End date must be after or equal to start date');
      }
    }
    
    return apiClient.put(`${API_ENDPOINTS.CALENDAR.GET_ALL}/${id}`, eventData);
  },
  
  deleteCalendarEvent: (id) => {
    return apiClient.delete(`${API_ENDPOINTS.CALENDAR.GET_ALL}/${id}`);
  }
};

// Export all services together
export const ApiServices = {
  AuthService,
  UserService,
  CycleService,
  ContactService,
  AlertService,
  NotificationService,
  CalendarService
};

export default ApiServices;
