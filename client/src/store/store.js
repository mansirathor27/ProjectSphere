
import authReducer from "./slices/authSlice";


export const store = configureStore({
  reducer: {
    auth: authReducer,
    
  },
});
