import { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import SignupPage from "./pages/SignupPage";
import LoginPage from "./pages/LoginPage";

import ProfilePage from "./pages/ProfilePage";
import { userAuthStore } from "./store/userAuthStore";
import { Loader } from "lucide-react";
import {Toaster} from "react-hot-toast"
import { useThemeStore } from "./store/useThemeStore";
import SettingPage from "./pages/SettingPage";
import ForgotPass from "./pages/ForgotPass";
import PageNotFound from "./pages/PageNotFound";

function App() {
  const { checkUrl, authUser, isCheckingAuth } = userAuthStore();
const {theme} = useThemeStore()

  useEffect(() => {
    checkUrl();
  }, [checkUrl]);


  if (isCheckingAuth && !authUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    );
  }

  

  return (
    <div data-theme={theme} >
      <Navbar />
      <Routes>
        <Route
          path="/"
          element={authUser ? <HomePage /> : <Navigate to="/login" />}
        />

        <Route
          path="/signup"
          element={!authUser ? <SignupPage /> : <Navigate to="/" />}
        />

        <Route
          path="/login"
          element={!authUser ? <LoginPage /> : <Navigate to="/" />}
        />
        
        <Route path="/settings" element={<SettingPage />} />
        
        <Route
          path="/profile"
          element={authUser ? <ProfilePage /> : <Navigate to="/login" />}
        />
        <Route
          path="/forgot"
          element={ <ForgotPass/>}
        />
          <Route
          path="*"
          element={ <PageNotFound/>}
        />

      </Routes>
      <Toaster/>
    </div>
  );
}

export default App;
