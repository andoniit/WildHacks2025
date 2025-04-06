/**
 * API configuration file
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    SIGNUP: `${API_BASE_URL}/auth/signup`,
    LOGIN: `${API_BASE_URL}/auth/login`,
    LOGOUT: `${API_BASE_URL}/auth/logout`,
    VERIFY: `${API_BASE_URL}/auth/verify`,
  },
  // User endpoints
  USER: {
    PROFILE: `${API_BASE_URL}/users/profile`,
    CYCLE_INFO: `${API_BASE_URL}/users/cycle-info`,
    TIMELINE: `${API_BASE_URL}/users/timeline`,
  },
  // Cycle endpoints
  CYCLE: {
    GET_ALL: `${API_BASE_URL}/cycles`,
    CURRENT: `${API_BASE_URL}/cycles/current`,
    PREDICTIONS: `${API_BASE_URL}/cycles/predictions`,
  },
  // Contact endpoints
  CONTACT: {
    GET_ALL: `${API_BASE_URL}/contacts`,
  },
  // Alert endpoints
  ALERT: {
    CREATE: `${API_BASE_URL}/alerts`,
    STATS: `${API_BASE_URL}/alerts/stats`,
  },
  // Notification endpoints
  NOTIFICATION: {
    SEND: `${API_BASE_URL}/notifications/send`,
    TEST: `${API_BASE_URL}/notifications/test`,
  },
  // Calendar endpoints
  CALENDAR: {
    GET_ALL: `${API_BASE_URL}/calendar`,
  },
};

export default API_ENDPOINTS;
