import { configureStore } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage"; // Use local storage
import authReducer from "./slices/authSlice";


const persistConfig = {
  key: "auth", 
  storage, 
};

const persistedAuthReducer = persistReducer(persistConfig, authReducer);

export const store = configureStore({
  reducer: {
    auth: persistedAuthReducer,
    // TODO: Add reducers for other application components
  },
});

export const persistor = persistStore(store);

export default store;
