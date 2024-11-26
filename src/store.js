import { configureStore, createSlice } from '@reduxjs/toolkit';

// Create auth slice
const authSlice = createSlice({
    name: 'auth',
    initialState: {
        token: null
    },
    reducers: {
        setToken: (state, action) => {
            state.token = action.payload;
        },
        clearToken: (state) => {
            state.token = null;
        }
    }
});

// Create store
const store = configureStore({
    reducer: {
        auth: authSlice.reducer,
    },
});

// Export actions and store
export const { setToken, clearToken } = authSlice.actions;
export default store;