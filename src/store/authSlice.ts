import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import api from '../api';
import { TOKEN_KEY, REFRESH_TOKEN_KEY } from '../utils/auth';

export interface AuthResponse {
  token: string;
  refresh: string;
}

export interface UserInfo {
  id: string;
  name: string;
}

export interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: UserInfo | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: AuthState = {
  token: localStorage.getItem(TOKEN_KEY),
  refreshToken: localStorage.getItem(REFRESH_TOKEN_KEY),
  user: null,
  status: 'idle',
  error: null,
};

export const login = createAsyncThunk<
  AuthResponse,
  { email: string; password: string },
  { rejectValue: string }
>('auth/login', async ({ email, password }, { rejectWithValue }) => {
  try {
    const response = await api.post<AuthResponse>('/yeshtery/token', {
      email,
      password,
      isEmployee: true,
    });
    return response.data;
  } catch (err: any) {
    if (err.response?.status === 400 || err.response?.status === 401) {
      return rejectWithValue('Invalid email or password.');
    }
    return rejectWithValue('An error occurred. Please try again.');
  }
});

export const fetchUser = createAsyncThunk<
  UserInfo,
  void,
  { rejectValue: string }
>('auth/fetchUser', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get<UserInfo>('/user/info');
    return response.data;
  } catch (err: any) {
    if (err.response?.status === 401 || err.response?.status === 403) {
      return rejectWithValue('unauthorized');
    }
    return rejectWithValue('Failed to load user information.');
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.token = null;
      state.refreshToken = null;
      state.user = null;
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<AuthResponse>) => {
        state.status = 'succeeded';
        state.token = action.payload.token;
        state.refreshToken = action.payload.refresh;
        localStorage.setItem(TOKEN_KEY, action.payload.token);
        localStorage.setItem(REFRESH_TOKEN_KEY, action.payload.refresh);
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      .addCase(fetchUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchUser.fulfilled, (state, action: PayloadAction<UserInfo>) => {
        state.status = 'succeeded';
        state.user = action.payload;
      })
      .addCase(fetchUser.rejected, (state, action) => {
        const err = action.payload;
        if (err === 'unauthorized') {
          state.token = null;
          state.refreshToken = null;
          state.user = null;
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(REFRESH_TOKEN_KEY);
          state.error = null;
        } else {
          state.error = err ?? null;
        }
        state.status = 'failed';
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;