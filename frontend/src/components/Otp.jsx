import React, { useEffect, useRef, useState } from "react";
import { userAuthStore } from "../store/userAuthStore";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const OtpPage = ({ email }) => {
  const { verifyOTP, verifyingOtpLoading } = userAuthStore();
  const otpDigitcount = 6;
  const [otpSize, setOtpSize] = useState(new Array(otpDigitcount).fill(""));
  const refArr = useRef([]);
  const navigate = useNavigate();

  useEffect(() => {
    refArr.current[0]?.focus();
  }, []);

  const handleChange = (e, index) => {
    const checkNum = e.target.value;
    if (isNaN(checkNum)) return;
    const arr = [...otpSize];
    arr[index] = e.target.value.slice(-1);
    setOtpSize(arr);

    if (checkNum && index < otpDigitcount - 1) {
      refArr.current[index + 1]?.focus();
    }
  };
  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && index > 0 && !e.target.value) {

      refArr.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const enteredOtp = otpSize.join("");
    if (enteredOtp.length !== otpDigitcount) {
      return toast.error(`Please enter all ${otpDigitcount} digits`);
    }
    try {
      const result = await verifyOTP({ email, otp: enteredOtp });

      if (result?.success) {
        toast.success("OTP verified successfully!");
      } else {
        toast.error(result?.message || "Invalid OTP");
        setOtpSize(new Array(otpDigitcount).fill(""));
        inputRefs.current[0]?.focus();
      }
    } catch (error) {
      toast.error(error.message || "Verification failed");
    } finally {
      // handleforgetButton();
    }
  };

  return (
    <div className="flex flex-col justify-center items-center p-6 sm:p-12 w-full mx-auto">
      <div className="flex gap-2">
        {otpSize.map((val, index) => (
          <input
            key={index}
            type="number"
            value={val}
            onChange={(e) => handleChange(e, index)}
            ref={(el) => (refArr.current[index] = el)}
            onKeyDown={(e) => handleKeyDown(e, index)}
             inputMode="numeric"
             style={{ MozAppearance: "textfield" }}
            className="w-10 h-10 sm:w-14 sm:h-14 text-center text-lg font-semibold border-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        ))}
      </div>

      <button
        className="btn btn-primary w-full sm:w-auto mt-4 mx-auto"
        onClick={handleVerify}
        disabled={verifyingOtpLoading}
      >
        {verifyingOtpLoading ? "Verifying..." : "Verify OTP"}
      </button>
    </div>
  );
};

export default OtpPage;
