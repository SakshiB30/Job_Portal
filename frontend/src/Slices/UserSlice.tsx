import { getItem, removeItem, setItem } from "../Services/LocalStorageService";
import { createSlice } from "@reduxjs/toolkit";

const normalizeUser = (value: any) => value?.user || value;

const UserSlice = createSlice({
  name: "user",
  initialState: normalizeUser(getItem("user")) || null,
  reducers: {
    setUser: (state, action) => {   
        setItem("user", normalizeUser(action.payload));
        state = getItem("user");
        return state;
    },
    removeUser: (state) => {
        removeItem("user");
        state = null;
        return state;
    },
    updateFollowing: (state, action) => {
      if (state) {
        const updated = { ...state, following: action.payload };
        setItem("user", updated);
        return updated;
      }
      return state;
    }
  },
});

export const { setUser, removeUser, updateFollowing } = UserSlice.actions;
export default UserSlice.reducer;

