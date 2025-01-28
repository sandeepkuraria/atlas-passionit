import React from "react";
import "./About.css"; // Add custom styling in a separate CSS file
import Navbar from "../Component/Navbar";
import aboutAtlas from "../Images/aboutatlas.png";
import logos from "../Images/logos.png";
import { FaPhone } from "react-icons/fa6";
import { TiLocation } from "react-icons/ti";

import { FaLinkedin } from "react-icons/fa";
import { FaFacebookSquare } from "react-icons/fa";
import { FaInstagramSquare } from "react-icons/fa";
import { FaSquareXTwitter } from "react-icons/fa6";
import { Link } from "react-router-dom";

const About = () => {
  return (
    <div>
      <Navbar />
      <div className="about-container">
        {/* Header Section */}
        <header className="about-header">
          <img
            style={{ height: "auto", width: "600px", marginTop: "50px" }}
            src={aboutAtlas}
            alt=""
          />
          <h5
            className="mt-2"
            style={{
              color: "#e50000",
            }}
          >
            Engage, Learn, Innovate: Where Knowledge and PASSION Drive the
            Future
          </h5>
          <div style={{ marginTop: "50px" }}>
            <Link to="/">
              <button className="btn btn-signup" style={{ width: "200px" }}>
                Explore more
              </button>
            </Link>
          </div>
        </header>

        {/* Vision Section */}
        <div className="about_header_div">
          {" "}
          <section className="about-header-container">
            <h1 style={{ textAlign: "center", color: "#e37d34" }}>
              OUR VISION
            </h1>
            <div
              style={{
                border: "3px solid #e50000",
                width: "90px",
                borderRadius: "50px",
                textAlign: "center",
                display: "block",
                margin: "0 auto",
              }}
            />
            <p>
              To create the world’s most insightful, innovative, and engaging
              infopedia, where all forms of content—whether written, visual, or
              auditory—are analyzed comprehensively using the PASSION Framework
              + PRUTL dimensions. ATLAS seeks to inspire discovery and
              innovation by integrating knowledge from STEAM, Humanities, and
              Global Issues, with a continuous feedback loop to evolve and
              improve the user experience.
            </p>
          </section>
          {/* Mission Section */}
          <section className="about-header-container">
            <h1 style={{ textAlign: "center", color: "#e37d34" }}>
              OUR MISSION
            </h1>
            <div
              style={{
                border: "3px solid #e50000",
                width: "90px",
                borderRadius: "50px",
                textAlign: "center",
                display: "block",
                margin: "0 auto",
              }}
            />
            <ul>
              <li>
                Leverage the PASSION Framework + PRUTL Dimensions to provide
                deep analysis of texts, videos, audios, and podcasts, covering
                all dimensions of STEAM, History, Geography, Humanity, and
                global concerns.
              </li>
              <li>
                Build an infopedia that seamlessly integrates real-world case
                studies, lessons to learn, and unexplored innovations across
                diverse fields.
              </li>
              <li>
                Foster a research-driven community where learners, researchers,
                and innovators can access and contribute to meaningful,
                data-rich content.
              </li>
              <li>
                Provide an easy-to-navigate search engine interface that guides
                users to comprehensive and insightful content.
              </li>
              <li>
                Continuously improve the platform through feedback analysis,
                encouraging users to engage and help shape the evolution of
                ATLAS Infopedia.
              </li>
              <li>
                Analyze every significant news item, event, and new media using
                the PASSION + PRUTL framework, providing unique,
                multi-dimensional perspectives.
              </li>
            </ul>
          </section>
        </div>

        <div
          style={{
            backgroundColor: "#e37d34",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
          className="about-header"
        >
          <div
            style={{ maxWidth: "1500px", textAlign: "center" }}
            className="about-header-container "
          >
            <h1 style={{ textAlign: "center", color: "#e37d34" }}>
              WHAT WE DO
            </h1>
            <div
              style={{
                border: "3px solid #e50000",
                width: "90px",
                borderRadius: "50px",
                textAlign: "center",
                display: "block",
                margin: "0 auto",
              }}
            />
            <ul>
              <li>
                Analyze multimedia content—including texts, videos, podcasts,
                and audios—using a multi-dimensional approach (PASSION + PRUTL)
                to uncover key lessons, real-world applications, and innovative
                ideas.
              </li>
              <li>
                Foster self-learning and innovation through a rich and
                comprehensive infopedia of knowledge, providing case studies,
                research insights, and potential startup ideas.
              </li>
              <li>
                Collect and analyze user feedback to ensure the platform evolves
                based on community engagement.
              </li>
              <li>
                Enable users to explore research gaps and innovative ideas based
                on the analyzed content.
              </li>
              <li>
                Provide a search engine interface where users can intuitively
                search and discover content.
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Section */}
        <div className="about_header_div">
          {" "}
          <div style={{ padding: "20px" }}>
            <img height="auto" width="400px" src={logos} alt="" />

            <div style={{ display: "flex" }}>
              <div style={{ marginTop: "25px" }}>
                <TiLocation size={30} color="black" />
              </div>
              <div
                style={{ maxWidth: "300px", margin: "10px", color: "black" }}
              >
                {" "}
                Office #5, Block 1, Lloyds Chambers, Mangalwar Peth, Near
                Ambedkar Bavan, Pune - 4110111
              </div>
            </div>
            <div style={{ margin: "10px", color: "black" }}>
              <FaPhone size={20} color="black" /> +91 8390234456
            </div>
          </div>
          <di style={{ padding: "20px" }}>
            <h4 style={{ color: "black" }}>Connect with us</h4>
            <div className="mt-4">
              <FaLinkedin size={40} />
              &nbsp; &nbsp;
              <FaFacebookSquare size={40} />
              &nbsp; &nbsp;
              <FaInstagramSquare size={40} />
              &nbsp; &nbsp;
              <FaSquareXTwitter size={40} />
            </div>
            <div className="legal-links mt-4 ">
              <a style={{ color: "black" }} href="/terms">
                Terms and Conditions
              </a>{" "}
              |
              <a style={{ color: "black" }} href="/privacy">
                Privacy Policy
              </a>
            </div>
          </di>
        </div>

        <footer className="about-footer">
          <p>All Rights Reserved</p>
        </footer>
      </div>
    </div>
  );
};

export default About;
