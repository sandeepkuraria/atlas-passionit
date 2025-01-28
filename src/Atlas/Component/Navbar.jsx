import React, { useEffect, useState, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import logo from "../Images/Atlas.png";
import { IoLogOutOutline } from "react-icons/io5";
import { MdManageAccounts } from "react-icons/md";
import { IconContext } from "react-icons";
import { VscAccount } from "react-icons/vsc";
import "./Navbar.css";
const Navbar = () => {
  const location = useLocation();
  const [username, setUsername] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const navigate = useNavigate();
  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        setUsername(decodedToken.userName || ""); // Assuming 'username' is a field in your token
      } catch (error) {
        console.error("Invalid token:", error);
        setUsername("");
      }
    } else {
      setUsername("");
    }
  }, [location.pathname]);

  const toggleDropdown = () => {
    setIsDropdownOpen((prevState) => !prevState); // Toggle state
  };

  // Close the dropdown if the user clicks outside of it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleProfileClick = () => {
    // Navigate to the profile page
    navigate("/profile"); // Adjust the path as needed
  };

  const handleLogoutClick = () => {
    sessionStorage.removeItem("token");
    setUsername("");
    navigate("/");
    // You might want to redirect to the home page or login page after logout
  };

  return (
    <div style={{ backgroundColor: "#fcf9f0" }}>
      <header className="atlas-header">
        <div className="atlas-logo">
          <img src={logo} width="180px" height="110px" alt="Logo" />
        </div>
        <nav className="atlas-nav">
          <ul>
            {/* Display 'About Us' and 'Login' if on the home or about page */}
            {!username &&
              (location.pathname === "/" || location.pathname === "/about") && (
                <>
                  {location.pathname === "/" && (
                    <li style={{ marginTop: "6px" }}>
                      <b>
                        <Link style={{ color: "black" }} to="/about">
                          About Us
                        </Link>
                      </b>
                    </li>
                  )}
                  <li>
                    <button style={{ height: "35px", borderRadius: "5px" }}>
                      <Link to="/login">
                        <b>Login</b>
                      </Link>
                    </button>
                  </li>
                </>
              )}
            {/* Show the username if the user is authenticated */}
            {username && (
              <div
                className="account-section"
                onClick={toggleDropdown}
                ref={dropdownRef}
              >
                <div className="header_div">
                  <div className="mr-2">
                    {" "}
                    {/* Account icon and dropdown toggle */}
                    <IconContext.Provider
                      value={{ size: 24, color: "#ff3131" }}
                    >
                      <VscAccount />
                    </IconContext.Provider>{" "}
                  </div>

                  <div>
                    {" "}
                    <span className="email-text mr-4 text-dark font-weight-bold align-middle">
                      {username}
                    </span>
                  </div>
                </div>

                {isDropdownOpen && (
                  <div className="dropdown-menu show mt-2">
                    {" "}
                    {/* Add show class conditionally */}
                    <div className="dropdown-item" onClick={handleProfileClick}>
                      Profile{" "}
                      <MdManageAccounts
                        size={24}
                        style={{ cursor: "pointer", marginLeft: "10px" }}
                      />
                    </div>
                    <div className="dropdown-item" onClick={handleLogoutClick}>
                      Logout{" "}
                      <IoLogOutOutline
                        size={24}
                        style={{ cursor: "pointer", marginLeft: "10px" }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </ul>
        </nav>
      </header>
    </div>
  );
};

export default Navbar;
