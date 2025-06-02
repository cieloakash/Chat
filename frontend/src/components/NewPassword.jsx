import React, { useEffect, useRef, useState } from "react";

import { Eye, EyeOff, Lock } from "lucide-react";
import { userAuthStore } from "../store/userAuthStore";
import { useNavigate } from "react-router-dom";

const NewPassword = () => {
  const navigate = useNavigate();
  const { updatePassword, forgetButton, handleforgetButton } = userAuthStore();
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  const [pass, setpass] = useState(false);
  const [confirmpass, setconfirmpass] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    updatePassword(formData);
  };

  useEffect(() => {
    if (forgetButton.password) {
      handleforgetButton();
      navigate("/");
    }
  }, [forgetButton.password]);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="form-control">
        <label className="label">
          <span className="label-text font-medium">Password</span>
        </label>
        <div className="relative flex items-center">
          <div className="absolute inset-y-0  pl-3 flex items-center pointer-events-none  left-0  z-10">
            <Lock className="h-5 w-5 text-base-content/40" />
          </div>
          <input
            type={pass ? "text" : "password"}
            className={`input input-bordered w-full pl-10`}
            placeholder="••••••••"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            onClick={() => setpass(!pass)}
          >
            {pass ? (
              <EyeOff className="h-5 w-5 text-base-content/40" />
            ) : (
              <Eye className="h-5 w-5 text-base-content/40" />
            )}
          </button>
        </div>
      </div>
      <div className="form-control">
        <label className="label">
          <span className="label-text font-medium">Confirm Password</span>
        </label>
        <div className="relative flex items-center">
          <div className="absolute inset-y-0  pl-3 flex items-center pointer-events-none  left-0  z-10">
            <Lock className="h-5 w-5 text-base-content/40" />
          </div>
          <input
            type={confirmpass ? "text" : "password"}
            className={`input input-bordered w-full pl-10`}
            placeholder="••••••••"
            value={formData.confirmPassword}
            onChange={(e) =>
              setFormData({ ...formData, confirmPassword: e.target.value })
            }
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            onClick={() => setconfirmpass(!confirmpass)}
          >
            {confirmpass ? (
              <EyeOff className="h-5 w-5 text-base-content/40" />
            ) : (
              <Eye className="h-5 w-5 text-base-content/40" />
            )}
          </button>
        </div>
      </div>

      <button type="submit" className="btn btn-primary w-full">
        Create
      </button>
    </form>
  );
};

export default NewPassword;
