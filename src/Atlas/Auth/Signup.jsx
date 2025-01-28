import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import logo from "../Images/Atlas.png";
import styles from "./Login.module.css";
import * as API from "../Endpoint/Endpoint";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      toast.error("Please fill all the fields");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setIsLoading(true); // Set loading to true

    try {
      const response = await fetch(API.SIGNUP, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await response.json();
      if (response.ok) {
        toast.success("Signup successful! Please verify your email.");
        navigate("/verifyotp");
      } else {
        toast.error("Signup failed: " + data.message);
      }
    } catch (err) {
      toast.error("Error: " + err.message);
    } finally {
      setIsLoading(false); // Reset loading state
    }
  };

  return (
    <div className="container-fluid">
      <div className="container">
        <div className="row">
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
                <p className={styles["dfmn"]}>
                  Welcome! Begin your journey with us by creating your account.
                </p>
                <form onSubmit={handleSubmit}>
                  <div className={styles.textBoxCont}>
                    <input
                      type="text"
                      className="form-control mb-2"
                      placeholder="Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                    <input
                      type="email"
                      className="form-control mb-2"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                    <input
                      type="password"
                      className="form-control mb-2"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <input
                      type="password"
                      className="form-control mb-2"
                      placeholder="Confirm Password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                    <div className="input-group center">
                      <button
                        className="btn btn-round btn-signup"
                        type="submit"
                        disabled={isLoading} // Disable button while loading
                      >
                        {isLoading ? "Signing up..." : "SIGN UP"}
                      </button>
                    </div>
                    <div className="row">
                      <p className={styles["forget-p"]}>
                        Already have an account?{" "}
                        <Link style={{ color: "#ff3131" }} to="/login">
                          Log in
                        </Link>
                      </p>
                    </div>
                  </div>
                </form>
              </div>
              <div className={`col-lg-6 col-md-6 ${styles["box-de"]}`}>
                <div className={styles["inn-cover"]}>
                  <div className={styles["ditk-inf"]}>
                    <h2 className="w-100 text-light">Create Your Account</h2>
                    <p>
                      Join us and create your account to access exclusive
                      features tailored just for you. Experience seamless
                      navigation, personalized content, and more. Start your
                      journey with us today!
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

export default Signup;
