import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";

// Auth Pages
import LoginPage from "./pages/auth/LoginPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";

// Dashboard Layouts
import DashboardLayout from "./components/layout/DashboardLayout";


import ManageStudents from "./pages/admin/ManageStudents";
import ManageTeachers from "./pages/admin/ManageTeachers";

import { useDispatch, useSelector } from "react-redux";
import { ToastContainer } from "react-toastify";
import { Loader } from "lucide-react";
import { getUser } from "./store/slices/authSlice";
import { getAllUsers } from "./store/slices/adminSlice";

const App = () => {

  const {authUser, isCheckingAuth} = useSelector(state => state.auth);
  const dispatch = useDispatch();

  useEffect(()=>{
    dispatch(getUser());
  },[dispatch]);

  useEffect(()=>{
    if(authUser?.role === "Admin"){
      dispatch(getAllUsers());
    }
  }, [authUser])

 const ProtectedRoute = ({ children, allowedRoles }) => {
  if (!authUser) {
    return <Navigate to="/login" replace />;
  }

  if (
    allowedRoles?.length &&
    authUser?.role &&
    !allowedRoles.includes(authUser.role)
  ) {
    const redirectPath =
      authUser.role === "Admin"
        ? "/admin"
        : authUser.role === "Teacher"
        ? "/teacher"
        : "/student";

    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

  if(isCheckingAuth && !authUser){
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader className="size-10 animate-spin"/>
      </div>
    );
  }
  return (
    <BrowserRouter>
    <Routes>
      {/* Auth Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* Admin Routes */}
      <Route path ="/admin" element={
        <ProtectedRoute allowedRoles={["Admin"]}>
          <DashboardLayout userRole={"Admin"}/>
        </ProtectedRoute>
      }
      >
        
        <Route path="students" element={<ManageStudents/>}/>
        <Route path="teachers" element={<ManageTeachers/>}/>
        
      </Route>
    </Routes>
    <ToastContainer theme="dark"/>
    </BrowserRouter>
  );
};

export default App;
