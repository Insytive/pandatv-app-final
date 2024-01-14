import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const fetchFeeds = createAsyncThunk(
  "feeds/fetchFeeds",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("https://admin.pandatv.co.za/api/feeds");
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const loveFeed = createAsyncThunk(
  "feeds/loveFeed",
  async ({ id, userData }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `https://admin.pandatv.co.za/api/feeds/${id}/love`,
        { firebase_uid: userData.uid }
      );
      console.log(response.data);
      return { id, data: response.data };
    } catch (error) {
      console.log(error);
      return rejectWithValue(error.response.data);
    }
  }
);

export const unloveFeed = createAsyncThunk(
  "feeds/unloveFeed",
  async ({ id, userData }, { rejectWithValue }) => {
    try {
      const url = `https://admin.pandatv.co.za/api/feeds/${id}/unlove?firebase_uid=${encodeURIComponent(
        userData.uid
      )}`;

      const response = await axios.delete(url);

      console.log(response.data);

      return { id, data: response.data };
    } catch (error) {
      console.log(error);
      return rejectWithValue(error.response.data);
    }
  }
);

export const checkIfLovedByUser = createAsyncThunk(
  "feeds/checkIfLovedByUser",
  async ({ id, userData }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `https://admin.pandatv.co.za/api/feeds/${id}/is-loved-by-user`,
        {
          firebase_uid: userData.uid,
        }
      );

      return { id, lovedByUser: response.data.loved };
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const initialState = {
  feeds: [],
  loading: false,
  error: null,
  lovedByUser: false,
};

const feedsSlice = createSlice({
  name: "feeds",
  initialState,
  reducers: {
    toggleLike(state, action) {
      const { feedId } = action.payload;
      if (!state.feeds[feedId]) {
        state.feeds[feedId] = { likedByUser: true, comments: [] };
      } else {
        state.feeds[feedId].likedByUser = !state.feeds[feedId].likedByUser;
      }
    },
  },
  extraReducers: {
    [fetchFeeds.pending]: (state) => {
      state.loading = true;
    },
    [fetchFeeds.fulfilled]: (state, action) => {
      state.feeds = action.payload;
      state.loading = false;
    },
    [fetchFeeds.rejected]: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },

    // Like functionally
    [loveFeed.fulfilled]: (state, action) => {
      const { id } = action.payload;
      const feed = state.feeds.find((feed) => feed.id === id);
      if (feed) {
        feed.lovedByUser = true;
        // Increment loves_count
        feed.loves_count = (feed.loves_count || 0) + 1;
      }
    },
    [unloveFeed.fulfilled]: (state, action) => {
      const { id } = action.payload;
      const feed = state.feeds.find((feed) => feed.id === id);
      if (feed) {
        feed.lovedByUser = false;
        if (feed.loves_count > 0) {
          feed.loves_count -= 1;
        }
      }
    },

    [checkIfLovedByUser.fulfilled]: (state, action) => {
      const { id, lovedByUser } = action.payload;
      const feedIndex = state.feeds.findIndex((feed) => feed.id === id);
      if (feedIndex !== -1) {
        state.feeds[feedIndex].lovedByUser = lovedByUser;
      }
    },
  },
});

export const { addComment, removeComment, toggleLike, setLikes } =
  feedsSlice.actions;

export default feedsSlice.reducer;
