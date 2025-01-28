import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { jwtDecode } from "jwt-decode";
import logo from "../Images/Atlas.png";
import styles from "./Login.module.css";
import * as API from "../Endpoint/Endpoint";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter your login credentials");
    } else {
      try {
        const response = await fetch(API.LOGIN, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const data = await response.json();
        if (response.ok) {
          const token = data.token || "";
          sessionStorage.setItem("token", token);
          toast.success("Login successful!");

          // Decode the token and check the user's role
          const decodedToken = jwtDecode(token);
          const isAdmin = decodedToken.isAdmin;

          // Redirect based on role
          if (isAdmin) {
            navigate("/admin"); // Redirect to the admin route
          } else {
            navigate("/user"); // Redirect to the user route
          }
        } else {
          toast.error("Login failed: " + data.message);
        }
      } catch (err) {
        toast.error("Error: " + err.message);
      }
    }
  };

  return (
    <div className="container-fluid">
      <div className="container">
        <div className="row cdvfdfd">
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
                  Welcome back! Log in to access personalized services and
                  explore everything our platform has to offer.
                </p>
                <form onSubmit={handleSubmit}>
                  <div className={styles["text-box-cont"]}>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Username"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      style={{ marginBottom: "10px" }}
                    />

                    <input
                      type="password"
                      className="form-control"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <div className="row">
                      <p
                        className={styles["forget-p"]}
                        style={{ textAlign: "end" }}
                      >
                        <Link
                          style={{ color: "#ff3131", textAlign: "right" }}
                          to="/forgotpassword"
                        >
                          Forgot Password?
                        </Link>
                      </p>
                    </div>

                    <div className="input-group center">
                      <button
                        className="btn btn-round btn-signup"
                        type="submit"
                      >
                        LOG IN
                      </button>
                    </div>
                    <div className="row">
                      <p className={styles["forget-p"]}>
                        Don't have an account?{" "}
                        <Link style={{ color: "#ff3131" }} to="/signup">
                          Sign Up Now
                        </Link>
                      </p>
                    </div>
                  </div>
                </form>
              </div>
              <div className={`col-lg-6 col-md-6 ${styles["box-de"]}`}>
                <div className={styles["inn-cover"]}>
                  <div className={styles["ditk-inf"]}>
                    <div className={styles["small-logo"]}></div>
                    <h2 className="w-100 text-light">Didn't Have an Account</h2>
                    <p>
                      Explore our platform and create your profile today to
                      access exclusive features and personalized services
                      tailored just for you.
                    </p>
                    <Link to="/signup">
                      <button type="button" className="btn btn-outline-light">
                        SIGN UP
                      </button>
                    </Link>
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

export default Login;
