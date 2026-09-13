import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginApi, registerApi, getMeApi } from '../services/api';

const AuthContext = createContext();

export const DEMO_PRESETS = [
  { role: "farmer", label: "Farmer", phone: "9876543210", pass: "farmer123", desc: "Ramesh Kumar (Farmer Portal)" },
  { role: "operator", label: "Scale Operator", phone: "9876543211", pass: "farmer123", desc: "Suresh Verma (Weighing & Queue)" },
  { role: "quality", label: "Quality Inspector", phone: "9876543212", pass: "farmer123", desc: "Anil Sharma (Grain Testing)" },
  { role: "supervisor", label: "Supervisor", phone: "9876543213", pass: "farmer123", desc: "Vikram Singh (Anti-Fraud & Approvals)" },
  { role: "admin", label: "Admin Officer", phone: "9876543214", pass: "farmer123", desc: "System Admin (Cross-Centre KPIs)" },
];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('access_token'));
  const [selectedCentreId, setSelectedCentreId] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      getMeApi(token)
        .then((res) => {
          setUser(res.data);
          if (res.data?.centre_id) {
            setSelectedCentreId(res.data.centre_id);
          }
        })
        .catch(() => {
          logout();
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (phone, password) => {
    const res = await loginApi(phone, password);
    const accessToken = res.data.access_token;
    const userData = res.data.user;
    localStorage.setItem('access_token', accessToken);
    setToken(accessToken);
    setUser(userData);
    if (userData?.centre_id) {
      setSelectedCentreId(userData.centre_id);
    }
    return userData;
  };

  const register = async (formData) => {
    const res = await registerApi(formData);
    const accessToken = res.data.access_token;
    const userData = res.data.user;
    localStorage.setItem('access_token', accessToken);
    setToken(accessToken);
    setUser(userData);
    if (userData?.centre_id) {
      setSelectedCentreId(userData.centre_id);
    }
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      login,
      register,
      logout,
      currentRole: user?.role || 'farmer',
      selectedCentreId,
      setSelectedCentreId
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
