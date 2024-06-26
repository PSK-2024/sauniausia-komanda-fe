import { createAsyncThunk } from '@reduxjs/toolkit';
import authService from '../../api/authService';
import { User } from '../model/userModel';
import { fetchImageUrl } from '../../utils/imageUtils';
import axios from 'axios';
import api from '../../api/api';
import { BASE_URL, PATHS } from '../../api/paths';
import { toast } from 'react-toastify';

export const fetchUserData = createAsyncThunk<
  User,
  void,
  { rejectValue: string }
>('user/fetchUserData', async (_, { rejectWithValue }) => {
  try {
    const user: User = await authService.getUserData();

    if (!user) {
      return rejectWithValue('Invalid response from auth service');
    }

    user.image = await fetchImageUrl(user.image);

    return user;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return rejectWithValue('Failed to fetch user data');
    }
    throw error;
  }
});

export const updateUserData = createAsyncThunk<User, FormData>(
  'user/updateUserData',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await api.put(
        `${BASE_URL}${PATHS.USER_UPDATE_PATH}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      const user: User = response.data;
      user.image = await fetchImageUrl(user.image);
      toast.success('Profile was updated successfully!');
      return user;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status === 409) {
          toast.error(
            'Someone changed the record since you last read it. Please reload the data and try again.'
          );
          return rejectWithValue(
            'Conflict error: Someone changed the record since you last read it.'
          );
        }
        return rejectWithValue('Failed to update user data');
      }
      throw error;
    }
  }
);
