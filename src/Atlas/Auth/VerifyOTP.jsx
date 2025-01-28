import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import logo from "../Images/Atlas.png";
import * as API from "../Endpoint/Endpoint"; // Ensure you have the correct OTP verification endpoint here
import styles from "./Login.module.css";
const VerifyOTP = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(""); // State to store the OTP
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !otp) {
      toast.error("Please enter your e-mail and OTP");
    } else {
      try {
        const response = await fetch(API.VERIFY_OTP_API, {
          // Update to your OTP verification endpoint
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, otp }), // Send both email and OTP
        });

        const data = await response.json();
        if (response.ok) {
          toast.success("OTP verified successfully. You can now log in.");
          navigate("/login"); // Navigate to login page upon successful verification
        } else {
          toast.error("OTP verification failed: " + data.message);
        }
      } catch (err) {
        toast.error("Error: " + err.message);
      }
    }
  };

  return (
    <div className="container-fluid">
      <div className="container">
        <div className="row ">
          <div className={`col-lg-10 col-md-12 ${styles["login-box"]}`}>
            <div className="row">
              <div className={`col-lg-6 col-md-6 ${styles["log-det"]}`}>
                <div className={styles["small-logo"]}>
                  <img
                    src={logo}
                    alt="Logo"
                    style={{ width: "150px", height: "auto" }}
                  />
                </div>
                <p className="dfmn">
                  "Verify your email by entering the OTP sent to your email
                  address to activate your account and continue exploring our
                  platform."
                </p>
                <form onSubmit={handleSubmit}>
                  <div className="text-box-cont">
                    <input
                      type="email"
                      className="form-control"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    <input
                      type="text"
                      className="form-control mt-3"
                      placeholder="Enter OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                    />

                    <div className="input-group center mt-3">
                      <button
                        className="btn btn-round btn-signup"
                        type="submit"
                      >
                        Verify OTP
                      </button>
                    </div>
                  </div>
                </form>
              </div>
              <div className={`col-lg-6 col-md-6 ${styles["box-de"]}`}>
                <div className={styles["inn-cover"]}>
                  <div className={styles["ditk-inf"]}>
                    <div className="small-logo"></div>
                    <h2 className="w-100 text-light">
                      Enter your OTP to verify your account
                    </h2>
                    <p>
                      "Check your email for the OTP, enter it here to verify
                      your account, and start using all the features we offer."
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;
