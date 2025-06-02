import React, {  useEffect, useState } from "react";
import { userAuthStore } from "../store/userAuthStore";
import OtpPage from "../components/Otp";
import NewPassword from "../components/NewPassword";

const ForgotPass = () => {
  const { otpSend, otpLoading, forgetButton, handleforgetButton } =userAuthStore();
const [email,setEmail] = useState("")

  const handleEmailChange = (e)=>{
    setEmail(e.target.value)
  }
  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      const enteredEmail = email.toLocaleLowerCase().trim();
      setEmail(enteredEmail)
      otpSend({ email:enteredEmail });
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-6 sm:p-12">
      <div className="w-full max-w-md p-6 rounded-lg ">
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="label-text font-medium">
            Email
            <input
              type="email"
              placeholder="your@mail.com"
              required
              onChange={handleEmailChange}
              disabled={forgetButton?.otpSend}
              className="w-full mt-2 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 "
            />
          </label>

          {!forgetButton?.otpSend && (
            <button
              className="btn btn-primary w-full my-4"
              type="submit"
              disabled={otpLoading}
            >
              Send OTP
            </button>
          )}
        </form>

        {forgetButton?.otpSend && !forgetButton?.verifyotp && (
          <div className="mt-6">
            <OtpPage email={email} />
          </div>
        )}

        {forgetButton?.verifyotp && (
          <div className="mt-6">
            <NewPassword />
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPass;