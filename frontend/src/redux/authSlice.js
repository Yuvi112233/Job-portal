import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  loading: false,
  user: null,
  token: localStorage.getItem("token") || null, // Get token from localStorage on app load
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setUser: (state, action) => {
      state.user = action.payload;
    },
    setToken: (state, action) => {
      state.token = action.payload;
      localStorage.setItem("token", action.payload); // Save to localStorage
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem("token"); // Remove token on logout
    }
  },
});

export const { setLoading, setUser, setToken, logout } = authSlice.actions;
export default authSlice.reducer;
