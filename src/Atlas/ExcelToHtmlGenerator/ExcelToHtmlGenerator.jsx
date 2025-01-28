import React, { useState } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import JSZip from "jszip";

const ExcelToHtmlGenerator = () => {
  const [excelData, setExcelData] = useState([]);
  const [htmlTemplate, setHtmlTemplate] = useState(
    `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{{title}}</title>

     <!-- SEO Meta Tags -->
    <meta name="description" content="{{description}}">
    <meta name="keywords" content="{{title}}, {{category}}">
    <meta name="author" content="https://atlas.passionit.com">

    <!-- Open Graph Metadata -->
    <meta property="og:title" content="{{title}} - {{category}}">
    <meta property="og:description" content="{{description}}">
    <meta property="og:type" content="website">
    <meta property="og:url" content="http://localhost:3018/html-pages/{{modifiedTitleValue}}.html">

     <!-- Schema.org Structured Data -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "Article",
      "name": "{{title}}",
      "headline": "{{title}} - {{category}}",
      "description": "{{description}}",
      "category": "{{category}}",
      "dateModified":"{{currentDateInHtmlValue}}",
    }
    </script>

    <script src="https://cdn.tailwindcss.com"></script>
    
    <style>
      /* Base styles */
      body {
        font-family: Arial, sans-serif;
        margin: 0;
        padding: 0;
      }

      footer {
        background-color: #fff8f0;
      }

      .footer-container {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        padding: 20px;
        background-color: #ffffff;
        color: #333;
      }

      /* Left Section */
      .footer-left {
        display: flex;
        flex-direction: column;
        width: 100%;
        gap: 20px;
      }

      .footer-left img {
        max-height: 80px;
        width: auto;
      }

      .footer-left p {
        font-size: 14px;
        color: #555;
      }

      /* Right Section */
      .footer-right {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 20px;
      }

      .footer-right a {
        text-decoration: none;
        color: #333;
      }

      .footer-right .social-icons a {
        margin: 5px;
        display: inline-block;
      }

      .social-icons svg {
        width: 30px;
        height: 30px;
        fill: #333;
      }

      /* Footer Bottom */
      .footer-bottom {
        background-color: #f9f9f9;
        text-align: center;
        padding: 10px;
        color: #555;
        font-size: 12px;
      }

      /* Media Queries */
      @media (min-width: 768px) {
        .footer-container {
          flex-direction: row;
        }

        .footer-left,
        .footer-right {
          width: 48%;
        }

        .footer-left {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }

        .footer-right {
          align-items: flex-end;
        }
          /* Inline styles from Navbar.css */

        .atlas-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background-color: transparent;
          color: #fff;
          height: 80px;
        }

        .atlas-logo {
          padding-left: 10px;
        }

        .atlas-logo img {
          width: 180px;
          height: 110px;
        }

        .atlas-nav a {
          color: #ffffff;
          text-decoration: none;
        }

        .atlas-nav ul {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
        }

        .atlas-nav li {
          margin-right: 20px;
        }

        .atlas-nav a {
          color: #ffffff;
          text-decoration: none;
        }

        .account-section {
          position: relative;
          display: inline-block;
          cursor: pointer;
        }

        .dropdown-menu {
          position: absolute;
          top: 100%;
          right: 0;
          background-color: white;
          border: 1px solid #ddd;
          border-radius: 4px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          z-index: 1000;
          min-width: 150px;
          padding: 10px 0;
        }

        .dropdown-item {
          padding: 8px 16px;
          cursor: pointer;
          transition: background-color 0.2s ease;
        }

        .dropdown-item:hover {
          background-color: #f5f5f5;
        }
        .login-button {
          border: none;
          height: 45px;
          background-color: #e37d34;
          color: #fff;
          width: 110px;
          border-radius: 5px;
          height: 35px;
          border-radius: 5px;
        }
        .about-button {
          margin-top: 6px;
        }
      }
    </style>
  </head>
  <body class="bg-[#fbf9ef]">
      <!-- <header class="flex justify-between items-center px-4 md:px-4 bg-[#fbf9ef]">
      <div>
        <img src="../Images/Atlas.png" alt="Atlas Logo" width="180px" />
      </div>

      <nav class="flex items-center gap-4">
        <a
          href="http://localhost:3018/about"
          class="no-underline text-[#333] text-base font-bold hover:text-[#d67631]"
        >
          About Us</a
        >

        <a
        href="http://localhost:3018/login"
        class="no-underline"
      >
      <button
        class="bg-[#d67631] text-sm flex h-8 text-white justify-center items-center px-6 rounded-md hover:bg-[#b66028]"
      >
        Login
      </button>
    </a>
      </nav>
    </header> -->

    <header class="atlas-header">
      <div class="atlas-logo">
        <img src="../Images/Atlas.png" alt="Logo" />
      </div>
      <nav class="atlas-nav">
        <ul id="nav-items">
          <li id="about-link" class="about-button">
            <a href="http://localhost:3018/about" style="color: black; "
              >
              <b>

                About Us
              </b>
              </a
            >
          </li>
          <li id="login-button">
            <button class="login-button">
              <a href="http://localhost:3018/login"><b>
                Login
              </b></a>
            </button>
          </li>
          <li
            id="account-section"
            style="display: none"
            class="account-section"
          >
            <div class="header_div">
              <div>
                <i
                  class="fas fa-user-circle"
                  style="color: #ff3131; font-size: 24px"
                ></i>
              </div>
              <div>
                <span
                  id="username"
                  class="email-text mr-4 text-dark font-weight-bold align-middle"
                ></span>
              </div>
            </div>
            <div id="dropdown-menu" class="dropdown-menu" style="display: none">
              <div class="dropdown-item" onclick="navigateToProfile()">
                Profile
              </div>
              <div class="dropdown-item" onclick="logout()">Logout</div>
            </div>
          </li>
        </ul>
      </nav>
    </header>

    <!-- Main Content for Explore -->
    <main>
      <div
        class="flex p-8 gap-8 sm:p-6 sm:gap-6 md:p-8 md:gap-8 lg:p-10 lg:gap-10 xl:p-12 xl:gap-12"
      >
        <!-- Left Section -->
        <section class="flex-[2]">
          <h1
            class="text-4xl text-[#e27c34] mb-4 sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl"
          >
            Explore
          </h1>
          <h2
            class="border-b-[5px] border-[#d62101] w-16 rounded-md sm:w-12 md:w-14 lg:w-20"
          ></h2>
          <div
            class="flex items-center gap-2.5 mt-5 sm:gap-2 md:gap-3 lg:gap-4 xl:gap-5"
          >
            <div>
              <img
                src="../Images/new.png"
                alt="New Logo"
                class="h-7 w-7 object-contain"
              />
            </div>
            <h2
              class="text-2xl font-bold text-[#d62101] sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl"
            >
              {{title}}
            </h2>
          </div>
          <p class="italic text-[#555] mb-2.5 sm:mb-2 md:mb-3 lg:mb-4 xl:mb-5">
            <strong>Category:</strong> {{category}}
          </p>
          <p
            class="text-base text-[#d62101] mb-6 sm:text-sm md:text-base lg:text-lg xl:text-xl"
          >
            {{description}}
          </p>
          <button
            class="bg-[#d67631] h-8 flex justify-center items-center text-sm text-white px-6 rounded-md mb-8 hover:bg-[#b66028] sm:mb-6 md:px-6 lg:py-3 xl:rounded-lg"
          >
            Learn more
          </button>
          <!-- Video and Podcast Recommendations -->
          <section
            class="flex flex-row gap-5 mb-8 sm:flex-col sm:gap-4 sm:mb-6 md:gap-6 lg:gap-8 xl:gap-10"
          >
            <div>
              <h3 class="p-1">Video Recommendation</h3>
              <div
                class="px-24 py-24 bg-gray-300 border border-gray-400 rounded-md sm:px-8 sm:py-12 md:px-16 md:py-20 lg:px-24 lg:py-28 xl:px-32 xl:py-32"
              ></div>
              <div class="h-24 rounded-md font-bold mt-2">
                {{video_recommendations}}
              </div>
            </div>
            <div>
              <h3 class="p-1">Podcast Recommendation</h3>
              <div
                class="px-24 py-24 bg-gray-300 border border-gray-400 rounded-md sm:px-8 sm:py-12 md:px-16 md:py-20 lg:px-24 lg:py-28 xl:px-32 xl:py-32"
              ></div>
              <div class="h-24 rounded-md font-bold mt-2">
                {{podcast_recommendations}}
              </div>
            </div>
          </section>
          <!-- Undiscovered Possible Innovation Section -->
          <section>
            <h3
              class="text-2xl mb-5 mt-5 text-red-600 sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl"
            >
              Undiscovered Possible Innovation
            </h3>
            <p
              class="mb-5 text-sm sm:text-xs md:text-base lg:text-lg xl:text-xl"
            >
              {{undiscovered_possible_innovation}}
            </p>
            <h3
              class="text-2xl mb-5 mt-5 text-red-600 sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl"
            >
              Research Opportunities
            </h3>
            <p
              class="mb-5 text-sm sm:text-xs md:text-base lg:text-lg xl:text-xl"
            >
              {{research_opportunities}}
            </p>
            <h3
              class="text-2xl mb-5 mt-5 text-red-600 sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl"
            >
              Patents (if any)
            </h3>
            <p
              class="mb-5 text-sm sm:text-xs md:text-base lg:text-lg xl:text-xl"
            >
              {{patents_if_any}}
            </p>
            <h3
              class="text-2xl mb-5 mt-5 text-red-600 sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl"
            >
              Lessons to Learn
            </h3>
            <p
              class="mb-5 font-bold text-base sm:text-sm md:text-lg lg:text-xl xl:text-2xl"
            >
              “{{lessons_to_learn}}”
            </p>
            <h3
              class="text-2xl mb-5 mt-5 text-red-600 sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl"
            >
              Startups in this Space
            </h3>
            <p
              class="mb-5 text-sm sm:text-xs md:text-base lg:text-lg xl:text-xl"
            >
              {{startups_in_this_space}}
            </p>
          </section>
        </section>
        <!-- Right Section -->
        <section
          class="flex-[1.3] p-4 rounded-lg ml-2 sm:p-3 sm:ml-1 md:p-4 md:ml-2 lg:p-5 lg:ml-3 xl:p-6 xl:ml-4"
        >
          <!-- Top Right Section -->
          <div class="py-1">
            <h2
              class="text-[2.3rem] text-[#e27c34] mb-1 sm:text-[1.8rem] md:text-[2rem] lg:text-[2.5rem] xl:mb-2"
            >
              PRUTL DIMENSIONS
            </h2>
            <h2
              class="border-b-[5px] border-[#d62101] w-16 rounded-md sm:w-12 md:w-14 lg:w-20"
            ></h2>
          </div>
          <div
            class="flex-1 bg-white p-4 rounded-md ml-1 sm:p-3 md:p-5 lg:rounded-lg xl:p-6"
          >
            <div class="overflow-y-auto max-h-[1800px] px-1">
              <!-- Positive Soul -->
              <div
                class="mb-6 bg-[#fdfdfd] rounded-md relative sm:mb-5 md:rounded-lg lg:mb-7 xl:rounded-xl"
              >
                <button
                  class="text-[1.6rem] font-bold bg-[#fdfdfd] text-[#e27c34] p-2 border-none rounded-md cursor-pointer w-full sm:text-[1.4rem] sm:p-2 md:text-[1.5rem] lg:text-[1.8rem] xl:text-[2rem] whitespace-nowrap"
                  id="togglePositiveSoul"
                >
                  <div
                    class="flex justify-between items-center gap-1 sm:gap-1.5 md:gap-2 lg:gap-3 xl:gap-1"
                  >
                    <h5
                      class="text-[1.8rem] text-[#e27c34] sm:text-[1.5rem] md:text-[1.6rem] lg:text-[2rem]"
                    >
                      Positive Soul
                    </h5>
                    <span>
                      <img
                        src="../Images/down-chevron.png"
                        alt="Dropdown Icon"
                        class="flex-1 w-5 text-[#e27c34] sm:w-1 md:w-2 lg:w-3 xl:w-4"
                      />
                    </span>
                  </div>
                </button>
                <div
                  class="flex flex-col gap-4 sm:gap-3 md:gap-5 lg:gap-6 "
                  id="dropdownPositiveSoul"
                >
                <div
                class="flex items-center gap-4 bg-[#fdf2d1] p-4 rounded-md w-full sm:gap-3 md:p-5 lg:gap-5 xl:rounded-lg"
              >
                <span
                  class="text-[4rem] text-[#ff8c00] sm:text-[3rem] md:text-[3.5rem] lg:text-[4.5rem] xl:text-[5rem]"
                  >🕊️</span
                >
                <div>
                  <h3
                    class="text-[1.2rem] font-bold text-[#d62101] sm:text-[1rem] md:text-[1.1rem] lg:text-[1.4rem]"
                  >
                    Peace
                  </h3>
                  <p
                    class="text-[0.68rem] font-bold m-0 sm:text-[0.6rem] md:text-[0.65rem] lg:text-[0.7rem] xl:text-[0.75rem]"
                  >
                    {{peace}}
                  </p>
                </div>
              </div>

              <div
                class="flex items-center gap-4 bg-[#fdf2d1] p-4 rounded-md w-full sm:gap-3 md:p-5 lg:gap-5 xl:rounded-lg"
              >
                <span
                  class="text-[4rem] text-[#ff8c00] sm:text-[3rem] md:text-[3.5rem] lg:text-[4.5rem] xl:text-[5rem]"
                  >🙏</span
                >
                <div>
                  <h3
                    class="text-[1.2rem] font-bold text-[#d62101] sm:text-[1rem] md:text-[1.1rem] lg:text-[1.4rem]"
                  >
                    Respect
                  </h3>
                  <p
                    class="text-[0.68rem] font-bold m-0 sm:text-[0.6rem] md:text-[0.65rem] lg:text-[0.7rem] xl:text-[0.75rem]"
                  >
                    {{respect}}
                  </p>
                </div>
              </div>

              <div
                class="flex items-center gap-4 bg-[#fdf2d1] p-4 rounded-md w-full sm:gap-3 md:p-5 lg:gap-5 xl:rounded-lg"
              >
                <span
                  class="text-[4rem] text-[#ff8c00] sm:text-[3rem] md:text-[3.5rem] lg:text-[4.5rem] xl:text-[5rem]"
                  >🤝</span
                >
                <div>
                  <h3
                    class="text-[1.2rem] font-bold text-[#d62101] sm:text-[1rem] md:text-[1.1rem] lg:text-[1.4rem]"
                  >
                    Unity
                  </h3>
                  <p
                    class="text-[0.68rem] font-bold m-0 sm:text-[0.6rem] md:text-[0.65rem] lg:text-[0.7rem] xl:text-[0.75rem]"
                  >
                    {{unity}}
                  </p>
                </div>
              </div>

              <div
                class="flex items-center gap-4 bg-[#fdf2d1] p-4 rounded-md w-full sm:gap-3 md:p-5 lg:gap-5 xl:rounded-lg"
              >
                <span
                  class="text-[4rem] text-[#ff8c00] sm:text-[3rem] md:text-[3.5rem] lg:text-[4.5rem] xl:text-[5rem]"
                  >🤝</span
                >
                <div>
                  <h3
                    class="text-[1.2rem] font-bold text-[#d62101] sm:text-[1rem] md:text-[1.1rem] lg:text-[1.4rem]"
                  >
                    Trust
                  </h3>
                  <p
                    class="text-[0.68rem] font-bold m-0 sm:text-[0.6rem] md:text-[0.65rem] lg:text-[0.7rem] xl:text-[0.75rem]"
                  >
                    {{trust}}
                  </p>
                </div>
              </div>

              <div
                class="flex items-center gap-4 bg-[#fdf2d1] p-4 rounded-md w-full sm:gap-3 md:p-5 lg:gap-5 xl:rounded-lg"
              >
                <span
                  class="text-[4rem] text-[#ff8c00] sm:text-[3rem] md:text-[3.5rem] lg:text-[4.5rem] xl:text-[5rem]"
                  >❤️</span
                >
                <div>
                  <h3
                    class="text-[1.2rem] font-bold text-[#d62101] sm:text-[1rem] md:text-[1.1rem] lg:text-[1.4rem]"
                  >
                    Love
                  </h3>
                  <p
                    class="text-[0.68rem] font-bold m-0 sm:text-[0.6rem] md:text-[0.65rem] lg:text-[0.7rem] xl:text-[0.75rem]"
                  >
                    {{love}}
                  </p>
                </div>
              </div>
                </div>
              </div>

              <!-- Negative Soul -->
              <div
                class="mb-6 bg-[#fdfdfd] rounded-md relative sm:mb-5 md:rounded-lg lg:mb-7 xl:rounded-xl"
              >
                <button
                  class="text-[1.6rem] font-bold bg-[#fdfdfd] text-[#e27c34] p-2 border-none rounded-md cursor-pointer w-full sm:text-[1.4rem] sm:p-2 md:text-[1.5rem] lg:text-[1.8rem] xl:text-[2rem] whitespace-nowrap"
                  id="toggleNegativeSoul"
                >
                  <div
                    class="flex justify-between items-center gap-1 sm:gap-1.5 md:gap-2 lg:gap-3 xl:gap-1"
                  >
                    <h5
                      class="text-[1.8rem] text-[#e27c34] sm:text-[1.5rem] md:text-[1.6rem] lg:text-[2rem]"
                    >
                      Negative Soul
                    </h5>
                    <span>
                      <img
                        src="../Images/down-chevron.png"
                        alt="Dropdown Icon"
                        class="flex-1 w-5 text-[#e27c34] sm:w-1 md:w-2 lg:w-3 xl:w-4"
                      />
                    </span>
                  </div>
                </button>
                <div
                  class="flex flex-col gap-4 sm:gap-3 md:gap-5 lg:gap-6 "
                  id="dropdownNegativeSoul"
                >
                <div
                class="flex items-center gap-4 bg-[#fdf2d1] p-4 rounded-md w-full sm:gap-3 md:p-5 lg:gap-5 xl:rounded-lg"
              >
                <span
                  class="text-[4rem] text-[#ff8c00] sm:text-[3rem] md:text-[3.5rem] lg:text-[4.5rem] xl:text-[5rem]"
                  >🦚</span
                >
                <div>
                  <h3
                    class="text-[1.2rem] font-bold text-[#d62101] sm:text-[1rem] md:text-[1.1rem] lg:text-[1.4rem]"
                  >
                    Pride
                  </h3>
                  <p
                    class="text-[0.68rem] font-bold m-0 sm:text-[0.6rem] md:text-[0.65rem] lg:text-[0.7rem] xl:text-[0.75rem]"
                  >
                    {{pride}}
                  </p>
                </div>
              </div>

              <div
                class="flex items-center gap-4 bg-[#fdf2d1] p-4 rounded-md w-full sm:gap-3 md:p-5 lg:gap-5 xl:rounded-lg"
              >
                <span
                  class="text-[4rem] text-[#ff8c00] sm:text-[3rem] md:text-[3.5rem] lg:text-[4.5rem] xl:text-[5rem]"
                  >👑</span
                >
                <div>
                  <h3
                    class="text-[1.2rem] font-bold text-[#d62101] sm:text-[1rem] md:text-[1.1rem] lg:text-[1.4rem]"
                  >
                  Rule
                  </h3>
                  <p
                    class="text-[0.68rem] font-bold m-0 sm:text-[0.6rem] md:text-[0.65rem] lg:text-[0.7rem] xl:text-[0.75rem]"
                  >
                    {{rule}}
                  </p>
                </div>
              </div>

              <div
                class="flex items-center gap-4 bg-[#fdf2d1] p-4 rounded-md w-full sm:gap-3 md:p-5 lg:gap-5 xl:rounded-lg"
              >
                <span
                  class="text-[4rem] text-[#ff8c00] sm:text-[3rem] md:text-[3.5rem] lg:text-[4.5rem] xl:text-[5rem]"
                  >🗡️</span
                >
                <div>
                  <h3
                    class="text-[1.2rem] font-bold text-[#d62101] sm:text-[1rem] md:text-[1.1rem] lg:text-[1.4rem]"
                  >
                  Usurp
                  </h3>
                  <p
                    class="text-[0.68rem] font-bold m-0 sm:text-[0.6rem] md:text-[0.65rem] lg:text-[0.7rem] xl:text-[0.75rem]"
                  >
                    {{usurp}}
                  </p>
                </div>
              </div>

              <div
                class="flex items-center gap-4 bg-[#fdf2d1] p-4 rounded-md w-full sm:gap-3 md:p-5 lg:gap-5 xl:rounded-lg"
              >
                <span
                  class="text-[4rem] text-[#ff8c00] sm:text-[3rem] md:text-[3.5rem] lg:text-[4.5rem] xl:text-[5rem]"
                  >🍎</span
                >
                <div>
                  <h3
                    class="text-[1.2rem] font-bold text-[#d62101] sm:text-[1rem] md:text-[1.1rem] lg:text-[1.4rem]"
                  >
                  Tempt
                  </h3>
                  <p
                    class="text-[0.68rem] font-bold m-0 sm:text-[0.6rem] md:text-[0.65rem] lg:text-[0.7rem] xl:text-[0.75rem]"
                  >
                    {{tempt}}
                  </p>
                </div>
              </div>

              <div
                class="flex items-center gap-4 bg-[#fdf2d1] p-4 rounded-md w-full sm:gap-3 md:p-5 lg:gap-5 xl:rounded-lg"
              >
                <span
                  class="text-[4rem] text-[#ff8c00] sm:text-[3rem] md:text-[3.5rem] lg:text-[4.5rem] xl:text-[5rem]"
                  >🔥</span
                >
                <div>
                  <h3
                    class="text-[1.2rem] font-bold text-[#d62101] sm:text-[1rem] md:text-[1.1rem] lg:text-[1.4rem]"
                  >
                  Lust
                  </h3>
                  <p
                    class="text-[0.68rem] font-bold m-0 sm:text-[0.6rem] md:text-[0.65rem] lg:text-[0.7rem] xl:text-[0.75rem]"
                  >
                    {{lust}}
                  </p>
                </div>
              </div>
                </div>
              </div>

              <!-- Positive Materialism -->
              <div
                class="mb-6 bg-[#fdfdfd] rounded-md relative sm:mb-5 md:rounded-lg lg:mb-7 xl:rounded-xl"
              >
                <button
                  class="text-[1.6rem] font-bold bg-[#fdfdfd] text-[#e27c34] p-2 border-none rounded-md cursor-pointer w-full sm:text-[1.4rem] sm:p-2 md:text-[1.5rem] lg:text-[1.8rem] xl:text-[2rem] whitespace-nowrap"
                  id="togglePositiveMaterialism"
                >
                  <div
                    class="flex justify-between items-center gap-1 sm:gap-1.5 md:gap-2 lg:gap-3 xl:gap-1"
                  >
                    <h5
                      class="text-[1.8rem] text-[#e27c34] sm:text-[1.5rem] md:text-[1.6rem] lg:text-[2rem]"
                    >
                      Positive Materialism
                    </h5>
                    <span>
                      <img
                        src="../Images/down-chevron.png"
                        alt="Dropdown Icon"
                        class="flex-1 w-5 text-[#e27c34] sm:w-1 md:w-2 lg:w-3 xl:w-4"
                      />
                    </span>
                  </div>
                </button>
                <div
                  class="flex flex-col gap-4 sm:gap-3 md:gap-5 lg:gap-6 "
                  id="dropdownPositiveMaterialism"
                >
                <div
                class="flex items-center gap-4 bg-[#fdf2d1] p-4 rounded-md w-full sm:gap-3 md:p-5 lg:gap-5 xl:rounded-lg"
              >
                <span
                  class="text-[4rem] text-[#ff8c00] sm:text-[3rem] md:text-[3.5rem] lg:text-[4.5rem] xl:text-[5rem]"
                  >🛡️</span
                >
                <div>
                  <h3
                    class="text-[1.2rem] font-bold text-[#d62101] sm:text-[1rem] md:text-[1.1rem] lg:text-[1.4rem]"
                  >
                    Protector
                  </h3>
                  <p
                    class="text-[0.68rem] font-bold m-0 sm:text-[0.6rem] md:text-[0.65rem] lg:text-[0.7rem] xl:text-[0.75rem]"
                  >
                    {{protector}}
                  </p>
                </div>
              </div>

              <div
                class="flex items-center gap-4 bg-[#fdf2d1] p-4 rounded-md w-full sm:gap-3 md:p-5 lg:gap-5 xl:rounded-lg"
              >
                <span
                  class="text-[4rem] text-[#ff8c00] sm:text-[3rem] md:text-[3.5rem] lg:text-[4.5rem] xl:text-[5rem]"
                  >♻️</span
                >
                <div>
                  <h3
                    class="text-[1.2rem] font-bold text-[#d62101] sm:text-[1rem] md:text-[1.1rem] lg:text-[1.4rem]"
                  >
                  Recycling
                  </h3>
                  <p
                    class="text-[0.68rem] font-bold m-0 sm:text-[0.6rem] md:text-[0.65rem] lg:text-[0.7rem] xl:text-[0.75rem]"
                  >
                    {{recycling}}
                  </p>
                </div>
              </div>

              <div
                class="flex items-center gap-4 bg-[#fdf2d1] p-4 rounded-md w-full sm:gap-3 md:p-5 lg:gap-5 xl:rounded-lg"
              >
                <span
                  class="text-[4rem] text-[#ff8c00] sm:text-[3rem] md:text-[3.5rem] lg:text-[4.5rem] xl:text-[5rem]"
                  >🛠️</span
                >
                <div>
                  <h3
                    class="text-[1.2rem] font-bold text-[#d62101] sm:text-[1rem] md:text-[1.1rem] lg:text-[1.4rem]"
                  >
                  Positive Utility
                  </h3>
                  <p
                    class="text-[0.68rem] font-bold m-0 sm:text-[0.6rem] md:text-[0.65rem] lg:text-[0.7rem] xl:text-[0.75rem]"
                  >
                    {{positive_utility}}
                  </p>
                </div>
              </div>

              <div
                class="flex items-center gap-4 bg-[#fdf2d1] p-4 rounded-md w-full sm:gap-3 md:p-5 lg:gap-5 xl:rounded-lg"
              >
                <span
                  class="text-[4rem] text-[#ff8c00] sm:text-[3rem] md:text-[3.5rem] lg:text-[4.5rem] xl:text-[5rem]"
                  >🏗️</span
                >
                <div>
                  <h3
                    class="text-[1.2rem] font-bold text-[#d62101] sm:text-[1rem] md:text-[1.1rem] lg:text-[1.4rem]"
                  >
                  Tangibility
                  </h3>
                  <p
                    class="text-[0.68rem] font-bold m-0 sm:text-[0.6rem] md:text-[0.65rem] lg:text-[0.7rem] xl:text-[0.75rem]"
                  >
                    {{tangibility}}
                  </p>
                </div>
              </div>

              <div
                class="flex items-center gap-4 bg-[#fdf2d1] p-4 rounded-md w-full sm:gap-3 md:p-5 lg:gap-5 xl:rounded-lg"
              >
                <span
                  class="text-[4rem] text-[#ff8c00] sm:text-[3rem] md:text-[3.5rem] lg:text-[4.5rem] xl:text-[5rem]"
                  >🕰️</span
                >
                <div>
                  <h3
                    class="text-[1.2rem] font-bold text-[#d62101] sm:text-[1rem] md:text-[1.1rem] lg:text-[1.4rem]"
                  >
                  Longevity
                  </h3>
                  <p
                    class="text-[0.68rem] font-bold m-0 sm:text-[0.6rem] md:text-[0.65rem] lg:text-[0.7rem] xl:text-[0.75rem]"
                  >
                    {{longevity}}
                  </p>
                </div>
              </div>
                </div>
              </div>

              <!-- Negative Materialism -->
              <div
                class="mb-6 bg-[#fdfdfd] rounded-md relative sm:mb-5 md:rounded-lg lg:mb-7 xl:rounded-xl"
              >
                <button
                  class="text-[1.6rem] font-bold bg-[#fdfdfd] text-[#e27c34] p-2 border-none rounded-md cursor-pointer w-full sm:text-[1.4rem] sm:p-2 md:text-[1.5rem] lg:text-[1.8rem] xl:text-[2rem] whitespace-nowrap"
                  id="toggleNegativeMaterialism"
                >
                  <div
                    class="flex justify-between items-center gap-1 sm:gap-1.5 md:gap-2 lg:gap-3 xl:gap-1"
                  >
                    <h5
                      class="text-[1.8rem] text-[#e27c34] sm:text-[1.5rem] md:text-[1.6rem] lg:text-[2rem]"
                    >
                    Negative Materialism
                    </h5>
                    <span>
                      <img
                        src="../Images/down-chevron.png"
                        alt="Dropdown Icon"
                        class="flex-1 w-5 text-[#e27c34] sm:w-1 md:w-2 lg:w-3 xl:w-4"
                      />
                    </span>
                  </div>
                </button>
                <div
                  class="flex flex-col gap-4 sm:gap-3 md:gap-5 lg:gap-6 "
                  id="dropdownNegativeMaterialism"
                >
                <div
                class="flex items-center gap-4 bg-[#fdf2d1] p-4 rounded-md w-full sm:gap-3 md:p-5 lg:gap-5 xl:rounded-lg"
              >
                <span
                  class="text-[4rem] text-[#ff8c00] sm:text-[3rem] md:text-[3.5rem] lg:text-[4.5rem] xl:text-[5rem]"
                  >🔑</span
                >
                <div>
                  <h3
                    class="text-[1.2rem] font-bold text-[#d62101] sm:text-[1rem] md:text-[1.1rem] lg:text-[1.4rem]"
                  >
                    Possession
                  </h3>
                  <p
                    class="text-[0.68rem] font-bold m-0 sm:text-[0.6rem] md:text-[0.65rem] lg:text-[0.7rem] xl:text-[0.75rem]"
                  >
                    {{possession}}
                  </p>
                </div>
              </div>

              <div
                class="flex items-center gap-4 bg-[#fdf2d1] p-4 rounded-md w-full sm:gap-3 md:p-5 lg:gap-5 xl:rounded-lg"
              >
                <span
                  class="text-[4rem] text-[#ff8c00] sm:text-[3rem] md:text-[3.5rem] lg:text-[4.5rem] xl:text-[5rem]"
                  >🍂</span
                >
                <div>
                  <h3
                    class="text-[1.2rem] font-bold text-[#d62101] sm:text-[1rem] md:text-[1.1rem] lg:text-[1.4rem]"
                  >
                  Rot
                  </h3>
                  <p
                    class="text-[0.68rem] font-bold m-0 sm:text-[0.6rem] md:text-[0.65rem] lg:text-[0.7rem] xl:text-[0.75rem]"
                  >
                    {{rot}}
                  </p>
                </div>
              </div>

              <div
                class="flex items-center gap-4 bg-[#fdf2d1] p-4 rounded-md w-full sm:gap-3 md:p-5 lg:gap-5 xl:rounded-lg"
              >
                <span
                  class="text-[4rem] text-[#ff8c00] sm:text-[3rem] md:text-[3.5rem] lg:text-[4.5rem] xl:text-[5rem]"
                  >📦</span
                >
                <div>
                  <h3
                    class="text-[1.2rem] font-bold text-[#d62101] sm:text-[1rem] md:text-[1.1rem] lg:text-[1.4rem]"
                  >
                  Negative Utility
                  </h3>
                  <p
                    class="text-[0.68rem] font-bold m-0 sm:text-[0.6rem] md:text-[0.65rem] lg:text-[0.7rem] xl:text-[0.75rem]"
                  >
                    {{negative_utility}}
                  </p>
                </div>
              </div>

              <div
                class="flex items-center gap-4 bg-[#fdf2d1] p-4 rounded-md w-full sm:gap-3 md:p-5 lg:gap-5 xl:rounded-lg"
              >
                <span
                  class="text-[4rem] text-[#ff8c00] sm:text-[3rem] md:text-[3.5rem] lg:text-[4.5rem] xl:text-[5rem]"
                  >📦</span
                >
                <div>
                  <h3
                    class="text-[1.2rem] font-bold text-[#d62101] sm:text-[1rem] md:text-[1.1rem] lg:text-[1.4rem]"
                  >
                  Trade
                  </h3>
                  <p
                    class="text-[0.68rem] font-bold m-0 sm:text-[0.6rem] md:text-[0.65rem] lg:text-[0.7rem] xl:text-[0.75rem]"
                  >
                    {{trade}}
                  </p>
                </div>
              </div>

              <div
                class="flex items-center gap-4 bg-[#fdf2d1] p-4 rounded-md w-full sm:gap-3 md:p-5 lg:gap-5 xl:rounded-lg"
              >
                <span
                  class="text-[4rem] text-[#ff8c00] sm:text-[3rem] md:text-[3.5rem] lg:text-[4.5rem] xl:text-[5rem]"
                  >📉</span
                >
                <div>
                  <h3
                    class="text-[1.2rem] font-bold text-[#d62101] sm:text-[1rem] md:text-[1.1rem] lg:text-[1.4rem]"
                  >
                  Lessen
                  </h3>
                  <p
                    class="text-[0.68rem] font-bold m-0 sm:text-[0.6rem] md:text-[0.65rem] lg:text-[0.7rem] xl:text-[0.75rem]"
                  >
                    {{lessen}}
                  </p>
                </div>
              </div>

                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
      <!-- Other Bottom Explore Selection -->
      <div class="p-8">
        <div class="py-1">
          <h2
            class="text-[2.3rem] text-[#e27c34] mb-1 sm:text-[1.8rem] md:text-[2rem] lg:text-[2.5rem] xl:mb-2"
          >
            PASSION DIMENSIONS
          </h2>
          <h2
            class="border-b-[5px] border-[#d62101] w-16 rounded-md sm:w-12 md:w-14 lg:w-20"
          ></h2>
        </div>

        <div
          class="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-5 mb-8"
        >
          <div
            class="bg-yellow-50 p-4 rounded-lg shadow-md flex items-start gap-2 sm:p-3 md:p-4 lg:p-5 xl:p-6"
          >
            <span
              class="text-2xl sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl flex-shrink-0"
              >🔍</span
            >
            <div>
              <h3
                class="text-xl mb-2 text-gray-800 sm:text-lg md:text-xl lg:text-2xl xl:text-3xl"
              >
                Probing
              </h3>
              <p
                class="text-base text-gray-600 sm:text-sm md:text-base lg:text-lg xl:text-xl"
              >
                {{probing}}
              </p>
            </div>
          </div>

          <div
            class="bg-yellow-50 p-4 rounded-lg shadow-md flex items-start gap-2 sm:p-3 md:p-4 lg:p-5 xl:p-6"
          >
            <span
              class="text-2xl sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl flex-shrink-0"
              >💡</span
            >
            <div>
              <h3
                class="text-xl mb-2 text-gray-800 sm:text-lg md:text-xl lg:text-2xl xl:text-3xl"
              >
                Innovating
              </h3>
              <p
                class="text-base text-gray-600 sm:text-sm md:text-base lg:text-lg xl:text-xl"
              >
                {{innovating}}
              </p>
            </div>
          </div>

          <div
            class="bg-yellow-50 p-4 rounded-lg shadow-md flex items-start gap-2 sm:p-3 md:p-4 lg:p-5 xl:p-6"
          >
            <span
              class="text-2xl sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl flex-shrink-0"
              >🎬</span
            >
            <div>
              <h3
                class="text-xl mb-2 text-gray-800 sm:text-lg md:text-xl lg:text-2xl xl:text-3xl"
              >
                Acting
              </h3>
              <p
                class="text-base text-gray-600 sm:text-sm md:text-base lg:text-lg xl:text-xl"
              >
                {{acting}}
              </p>
            </div>
          </div>

          <div
            class="bg-yellow-50 p-4 rounded-lg shadow-md flex items-start gap-2 sm:p-3 md:p-4 lg:p-5 xl:p-6"
          >
            <span
              class="text-2xl sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl flex-shrink-0"
              >📋</span
            >
            <div>
              <h3
                class="text-xl mb-2 text-gray-800 sm:text-lg md:text-xl lg:text-2xl xl:text-3xl"
              >
                Scoping
              </h3>
              <p
                class="text-base text-gray-600 sm:text-sm md:text-base lg:text-lg xl:text-xl"
              >
                {{scoping}}
              </p>
            </div>
          </div>

          <div
            class="bg-yellow-50 p-4 rounded-lg shadow-md flex items-start gap-2 sm:p-3 md:p-4 lg:p-5 xl:p-6"
          >
            <span
              class="text-2xl sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl flex-shrink-0"
              >📊</span
            >
            <div>
              <h3
                class="text-xl mb-2 text-gray-800 sm:text-lg md:text-xl lg:text-2xl xl:text-3xl"
              >
                Setting
              </h3>
              <p
                class="text-base text-gray-600 sm:text-sm md:text-base lg:text-lg xl:text-xl"
              >
                {{setting}}
              </p>
            </div>
          </div>

          <div
            class="bg-yellow-50 p-4 rounded-lg shadow-md flex items-start gap-2 sm:p-3 md:p-4 lg:p-5 xl:p-6"
          >
            <span
              class="text-2xl sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl flex-shrink-0"
              >📁</span
            >
            <div>
              <h3
                class="text-xl mb-2 text-gray-800 sm:text-lg md:text-xl lg:text-2xl xl:text-3xl"
              >
                Owning
              </h3>
              <p
                class="text-base text-gray-600 sm:text-sm md:text-base lg:text-lg xl:text-xl"
              >
                {{owning}}
              </p>
            </div>
          </div>

          <div
            class="bg-yellow-50 p-4 rounded-lg shadow-md flex items-start gap-2 sm:p-3 md:p-4 lg:p-5 xl:p-6 col-span-2"
          >
            <span
              class="text-2xl sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl flex-shrink-0"
              >🌱</span
            >
            <div>
              <h3
                class="text-xl mb-2 text-gray-800 sm:text-lg md:text-xl lg:text-2xl xl:text-3xl"
              >
                Nurturing
              </h3>
              <p
                class="text-base text-gray-600 sm:text-sm md:text-base lg:text-lg xl:text-xl"
              >
                {{nurturing}}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- other bottom explore selection (+) button -->
      <div class="px-6 mb-10 sm:px-4 md:px-8 lg:px-12">
        <a href="http://localhost:3018/html-pages/isaac-newton.html">
          <div
            class="flex items-center gap-2.5 mt-5 sm:gap-2 md:gap-3 lg:gap-4 xl:gap-5 cursor-pointer"
          >
            <div>
              <img
                src="../Images/new.png"
                alt="New Logo"
                class="h-7 w-7 object-contain"
              />
            </div>
            <h2
              class="text-2xl font-bold text-[#d62101] sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl"
            >
              Isaac Newton
            </h2>
          </div>
        </a>
        <a href="http://localhost:3018/html-pages/marie-curie.html">
          <div
            class="flex items-center gap-2.5 mt-5 sm:gap-2 md:gap-3 lg:gap-4 xl:gap-5"
          >
            <div>
              <img
                src="../Images/new.png"
                alt="New Logo"
                class="h-7 w-7 object-contain"
              />
            </div>
            <h2
              class="text-2xl font-bold text-[#d62101] sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl"
            >
              Marie Curie
            </h2>
          </div>
        </a> 
        <a href="http://localhost:3018/html-pages/niels-bohr.html">
          <div
            class="flex items-center gap-2.5 mt-5 sm:gap-2 md:gap-3 lg:gap-4 xl:gap-5"
          >
            <div>
              <img
                src="../Images/new.png"
                alt="New Logo"
                class="h-7 w-7 object-contain"
              />
            </div>
            <h2
              class="text-2xl font-bold text-[#d62101] sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl"
            >
              Niels Bohr
            </h2>
          </div>
        </a>
        <a href="http://localhost:3018/html-pages/richard-feynman.html">
          <div
            class="flex items-center gap-2.5 mt-5 sm:gap-2 md:gap-3 lg:gap-4 xl:gap-5"
          >
            <div>
              <img
                src="../Images/new.png"
                alt="New Logo"
                class="h-7 w-7 object-contain"
              />
            </div>
            <h2
              class="text-2xl font-bold text-[#d62101] sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl"
            >
              Richard Feynman
            </h2>
          </div>
        </a>
        <a href="http://localhost:3018/html-pages/dmitri-mendeleev.html">
          <div
            class="flex items-center gap-2.5 mt-5 sm:gap-2 md:gap-3 lg:gap-4 xl:gap-5"
          >
            <div>
              <img
                src="../Images/new.png"
                alt="New Logo"
                class="h-7 w-7 object-contain"
              />
            </div>
            <h2
              class="text-2xl font-bold text-[#d62101] sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl"
            >
              Dmitri Mendeleev
            </h2>
          </div>
        </a>
        <a href="http://localhost:3018/html-pages/linus-pauling.html">
          <div
            class="flex items-center gap-2.5 mt-5 sm:gap-2 md:gap-3 lg:gap-4 xl:gap-5"
          >
            <div>
              <img
                src="../Images/new.png"
                alt="New Logo"
                class="h-7 w-7 object-contain"
              />
            </div>
            <h2
              class="text-2xl font-bold text-[#d62101] sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl"
            >
              Linus Pauling
            </h2>
          </div>
        </a>
        <a href="http://localhost:3018/html-pages/rosalind-franklin.html">
          <div
            class="flex items-center gap-2.5 mt-5 sm:gap-2 md:gap-3 lg:gap-4 xl:gap-5"
          >
            <div>
              <img
                src="../Images/new.png"
                alt="New Logo"
                class="h-7 w-7 object-contain"
              />
            </div>
            <h2
              class="text-2xl font-bold text-[#d62101] sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl"
            >
              Rosalind Franklin
            </h2>
          </div>
        </a>
      </div>
    </main>

    <!-- Main content for Data -->
    <!-- <main>
      <div
        class="flex p-8 gap-8 sm:p-6 sm:gap-6 md:p-8 md:gap-8 lg:p-10 lg:gap-10 xl:p-12 xl:gap-12"
      >
        <section class="flex-[2]">
          <h1
            class="text-4xl text-[#e27c34] mb-4 sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl"
          >
            DATA
          </h1>
          <p
            class="text-base text-[#d62101] mb-6 sm:text-sm md:text-base lg:text-lg xl:text-xl"
          >
            Data refers to a collection of facts, figures, and statistics used
            for analysis, research, and decision-making. In the modern context,
            data has become a critical asset in various domains such as
            business, science, technology, and social sciences. It is the
            foundation of machine learning, artificial intelligence, and
            analytics.
          </p>
          <button
            class="bg-[#d67631] text-sm text-white h-8 flex justify-center items-center px-4 rounded-md mb-8 hover:bg-[#b66028] sm:mb-6 md:px-6 lg:py-3 xl:rounded-lg"
          >
            Explore more
          </button>

          <div class="py-1">
            <h2
              class="text-[2.3rem] text-[#e27c34] mb-1 sm:text-[1.8rem] md:text-[2rem] lg:text-[2.5rem] xl:mb-2"
            >
              PASSION DIMENSIONS
            </h2>
            <h2
              class="border-b-[5px] border-[#d62101] w-16 rounded-md sm:w-12 md:w-14 lg:w-20"
            ></h2>
          </div>

          <div class="flex flex-col gap-4 sm:gap-3 md:gap-5 lg:gap-6">
            <div
              class="flex items-center gap-4 bg-[#fdf2d1] p-4 rounded-md w-full sm:gap-3 md:p-5 lg:gap-5 xl:rounded-lg"
            >
              <span
                class="text-[4rem] text-[#ff8c00] sm:text-[3rem] md:text-[3.5rem] lg:text-[4.5rem] xl:text-[5rem]"
                >🔍</span
              >
              <div>
                <h3
                  class="text-[1.2rem] font-bold text-[#d62101] sm:text-[1rem] md:text-[1.1rem] lg:text-[1.4rem]"
                >
                  Probing
                </h3>
                <p
                  class="text-[0.68rem] font-bold m-0 sm:text-[0.6rem] md:text-[0.65rem] lg:text-[0.7rem] xl:text-[0.75rem]"
                >
                  Data is the starting point for inquiry and exploration.
                  Researchers and analysts use data to investigate new
                  phenomena, probe the unknown, and form hypotheses. In the
                  context of artificial intelligence, data is continuously
                  analyzed to find hidden patterns, trends, and insights.
                </p>
              </div>
            </div>

            <div
              class="flex items-center gap-4 bg-[#fdf2d1] p-4 rounded-md w-full sm:gap-3 md:p-5 lg:gap-5 xl:rounded-lg"
            >
              <span
                class="text-[4rem] text-[#ff8c00] sm:text-[3rem] md:text-[3.5rem] lg:text-[4.5rem] xl:text-[5rem]"
                >💡</span
              >
              <div>
                <h3
                  class="text-[1.2rem] font-bold text-[#d62101] sm:text-[1rem] md:text-[1.1rem] lg:text-[1.4rem]"
                >
                  Innovating
                </h3>
                <p
                  class="text-[0.68rem] font-bold m-0 sm:text-[0.6rem] md:text-[0.65rem] lg:text-[0.7rem] xl:text-[0.75rem]"
                >
                  Innovation thrives on data. It powers innovation in technology
                  (such as AI, big data, blockchain), healthcare (precision
                  medicine), and various industries (like fintech or
                  agriculture). Data facilitates the creation of smarter
                  systems, from predictive analytics to automated workflows.
                </p>
              </div>
            </div>

            <div
              class="flex items-center gap-4 bg-[#fdf2d1] p-4 rounded-md w-full sm:gap-3 md:p-5 lg:gap-5 xl:rounded-lg"
            >
              <span
                class="text-[4rem] text-[#ff8c00] sm:text-[3rem] md:text-[3.5rem] lg:text-[4.5rem] xl:text-[5rem]"
                >🎬</span
              >
              <div>
                <h3
                  class="text-[1.2rem] font-bold text-[#d62101] sm:text-[1rem] md:text-[1.1rem] lg:text-[1.4rem]"
                >
                  Acting
                </h3>
                <p
                  class="text-[0.68rem] font-bold m-0 sm:text-[0.6rem] md:text-[0.65rem] lg:text-[0.7rem] xl:text-[0.75rem]"
                >
                  Data drives decisions. Businesses rely on data for real-time
                  decision-making in areas like supply chain management,
                  customer experience, and product development. Governments use
                  data for policy-making and to address societal challenges such
                  as climate change.
                </p>
              </div>
            </div>

            <div
              class="flex items-center gap-4 bg-[#fdf2d1] p-4 rounded-md w-full sm:gap-3 md:p-5 lg:gap-5 xl:rounded-lg"
            >
              <span
                class="text-[4rem] text-[#ff8c00] sm:text-[3rem] md:text-[3.5rem] lg:text-[4.5rem] xl:text-[5rem]"
                >📋</span
              >
              <div>
                <h3
                  class="text-[1.2rem] font-bold text-[#d62101] sm:text-[1rem] md:text-[1.1rem] lg:text-[1.4rem]"
                >
                  Scoping
                </h3>
                <p
                  class="text-[0.68rem] font-bold m-0 sm:text-[0.6rem] md:text-[0.65rem] lg:text-[0.7rem] xl:text-[0.75rem]"
                >
                  Data helps in identifying the scope of a project, study, or
                  business endeavor. Through data analysis, one can determine
                  the magnitude of a problem, the target audience, or market
                  trends, and assess the viability of new projects or products.
                </p>
              </div>
            </div>

            <div
              class="flex items-center gap-4 bg-[#fdf2d1] p-4 rounded-md w-full sm:gap-3 md:p-5 lg:gap-5 xl:rounded-lg"
            >
              <span
                class="text-[4rem] text-[#ff8c00] sm:text-[3rem] md:text-[3.5rem] lg:text-[4.5rem] xl:text-[5rem]"
                >📊</span
              >
              <div>
                <h3
                  class="text-[1.2rem] font-bold text-[#d62101] sm:text-[1rem] md:text-[1.1rem] lg:text-[1.4rem]"
                >
                  Setting
                </h3>
                <p
                  class="text-[0.68rem] font-bold m-0 sm:text-[0.6rem] md:text-[0.65rem] lg:text-[0.7rem] xl:text-[0.75rem]"
                >
                  Data sets the foundation for benchmarks, goals, and
                  objectives. Metrics derived from data help organizations set
                  targets and measure their performance.
                </p>
              </div>
            </div>
            <div
              class="flex items-center gap-4 bg-[#fdf2d1] p-4 rounded-md w-full sm:gap-3 md:p-5 lg:gap-5 xl:rounded-lg"
            >
              <span
                class="text-[4rem] text-[#ff8c00] sm:text-[3rem] md:text-[3.5rem] lg:text-[4.5rem] xl:text-[5rem]"
                >📁</span
              >
              <div>
                <h3
                  class="text-[1.2rem] font-bold text-[#d62101] sm:text-[1rem] md:text-[1.1rem] lg:text-[1.4rem]"
                >
                  Owning
                </h3>
                <p
                  class="text-[0.68rem] font-bold m-0 sm:text-[0.6rem] md:text-[0.65rem] lg:text-[0.7rem] xl:text-[0.75rem]"
                >
                  Ownership of data is a critical issue today. Data privacy,
                  intellectual property rights, and data sovereignty are topics
                  of immense global importance. Controlling and securing data is
                  essential for businesses and governments alike.
                </p>
              </div>
            </div>
            <div
              class="flex items-center gap-4 bg-[#fdf2d1] p-4 rounded-md w-full sm:gap-3 md:p-5 lg:gap-5 xl:rounded-lg"
            >
              <span
                class="text-[4rem] text-[#ff8c00] sm:text-[3rem] md:text-[3.5rem] lg:text-[4.5rem] xl:text-[5rem]"
                >🌱</span
              >
              <div>
                <h3
                  class="text-[1.2rem] font-bold text-[#d62101] sm:text-[1rem] md:text-[1.1rem] lg:text-[1.4rem]"
                >
                  Nurturing
                </h3>
                <p
                  class="text-[0.68rem] font-bold m-0 sm:text-[0.6rem] md:text-[0.65rem] lg:text-[0.7rem] xl:text-[0.75rem]"
                >
                  Data grows over time and needs to be curated and maintained.
                  With increasing volumes of data (big data), it is crucial to
                  clean, label, and manage data efficiently for sustained use in
                  AI models and analytics.
                </p>
              </div>
            </div>

          </div>
        </section>

        <section
          class="flex-[1.3] p-4 rounded-lg ml-2 sm:p-3 sm:ml-1 md:p-4 md:ml-2 lg:p-5 lg:ml-3 xl:p-6 xl:ml-4"
        >
          <div class="py-1">
            <h2
              class="text-[2.3rem] text-[#e27c34] mb-1 sm:text-[1.8rem] md:text-[2rem] lg:text-[2.5rem] xl:mb-2"
            >
              PRUTL DIMENSIONS
            </h2>
            <h2
              class="border-b-[5px] border-[#d62101] w-16 rounded-md sm:w-12 md:w-14 lg:w-20"
            ></h2>
          </div>
          <div
            class="flex-1 bg-white p-4 rounded-md ml-1 sm:p-3 md:p-5 lg:rounded-lg xl:p-6"
          >
            <div>
              <h5
                class="text-[1.8rem] text-[#e27c34] sm:text-[1.5rem] md:text-[1.6rem] lg:text-[2rem]"
              >
                Positive Soul
              </h5>
              <div class="flex flex-col gap-4 sm:gap-3 md:gap-5 lg:gap-6">
                <div
                  class="flex items-center gap-4 bg-[#fdf2d1] p-4 rounded-md w-full sm:gap-3 md:p-5 lg:gap-5 xl:rounded-lg"
                >
                  <span
                    class="text-[4rem] text-[#ff8c00] sm:text-[3rem] md:text-[3.5rem] lg:text-[4.5rem] xl:text-[5rem]"
                    >🕊️</span
                  >
                  <div>
                    <h3
                      class="text-[1.2rem] font-bold text-[#d62101] sm:text-[1rem] md:text-[1.1rem] lg:text-[1.4rem]"
                    >
                      Peace
                    </h3>
                    <p
                      class="text-[0.68rem] font-bold m-0 sm:text-[0.6rem] md:text-[0.65rem] lg:text-[0.7rem] xl:text-[0.75rem]"
                    >
                      Data promotes transparency, leading to peaceful resolution
                      of conflicts through clear communication of facts and
                      insights.
                    </p>
                  </div>
                </div>
                <div
                  class="flex items-center gap-4 bg-[#fdf2d1] p-4 rounded-md w-full sm:gap-3 md:p-5 lg:gap-5 xl:rounded-lg"
                >
                  <span
                    class="text-[4rem] text-[#ff8c00] sm:text-[3rem] md:text-[3.5rem] lg:text-[4.5rem] xl:text-[5rem]"
                    >🙏</span
                  >
                  <div>
                    <h3
                      class="text-[1.2rem] font-bold text-[#d62101] sm:text-[1rem] md:text-[1.1rem] lg:text-[1.4rem]"
                    >
                      Respect
                    </h3>
                    <p
                      class="text-[0.68rem] font-bold m-0 sm:text-[0.6rem] md:text-[0.65rem] lg:text-[0.7rem] xl:text-[0.75rem]"
                    >
                      Respect for data integrity ensures that decisions are made
                      based on reliable and truthful information.
                    </p>
                  </div>
                </div>
                <div
                  class="flex items-center gap-4 bg-[#fdf2d1] p-4 rounded-md w-full sm:gap-3 md:p-5 lg:gap-5 xl:rounded-lg"
                >
                  <span
                    class="text-[4rem] text-[#ff8c00] sm:text-[3rem] md:text-[3.5rem] lg:text-[4.5rem] xl:text-[5rem]"
                    >🤝</span
                  >
                  <div>
                    <h3
                      class="text-[1.2rem] font-bold text-[#d62101] sm:text-[1rem] md:text-[1.1rem] lg:text-[1.4rem]"
                    >
                      Unity
                    </h3>
                    <p
                      class="text-[0.68rem] font-bold m-0 sm:text-[0.6rem] md:text-[0.65rem] lg:text-[0.7rem] xl:text-[0.75rem]"
                    >
                      Data can bring people together to solve global challenges
                      by uniting different sectors and communities around common
                      facts.
                    </p>
                  </div>
                </div>
                <div
                  class="flex items-center gap-4 bg-[#fdf2d1] p-4 rounded-md w-full sm:gap-3 md:p-5 lg:gap-5 xl:rounded-lg"
                >
                  <span
                    class="text-[4rem] text-[#ff8c00] sm:text-[3rem] md:text-[3.5rem] lg:text-[4.5rem] xl:text-[5rem]"
                    >🤝</span
                  >
                  <div>
                    <h3
                      class="text-[1.2rem] font-bold text-[#d62101] sm:text-[1rem] md:text-[1.1rem] lg:text-[1.4rem]"
                    >
                      Trust
                    </h3>
                    <p
                      class="text-[0.68rem] font-bold m-0 sm:text-[0.6rem] md:text-[0.65rem] lg:text-[0.7rem] xl:text-[0.75rem]"
                    >
                      Transparent data builds trust between stakeholders in
                      industries like finance, healthcare, and governance.
                    </p>
                  </div>
                </div>
                <div
                  class="flex items-center gap-4 bg-[#fdf2d1] p-4 rounded-md w-full sm:gap-3 md:p-5 lg:gap-5 xl:rounded-lg"
                >
                  <span
                    class="text-[4rem] text-[#ff8c00] sm:text-[3rem] md:text-[3.5rem] lg:text-[4.5rem] xl:text-[5rem]"
                    >❤️</span
                  >
                  <div>
                    <h3
                      class="text-[1.2rem] font-bold text-[#d62101] sm:text-[1rem] md:text-[1.1rem] lg:text-[1.4rem]"
                    >
                      Love
                    </h3>
                    <p
                      class="text-[0.68rem] font-bold m-0 sm:text-[0.6rem] md:text-[0.65rem] lg:text-[0.7rem] xl:text-[0.75rem]"
                    >
                      Data fuels discoveries that improve lives, driven by a
                      passion for enhancing human welfare and societal good.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <section class="p-2 sm:p-1.5 md:p-2.5 lg:p-3 xl:p-4">
              <div
                class="mb-6 bg-[#fdfdfd] rounded-md relative sm:mb-5 md:rounded-lg lg:mb-7 xl:rounded-xl"
              >
                <button
                  class="text-[1.6rem] font-bold bg-[#fdfdfd] text-[#e27c34] p-2 border-none rounded-md cursor-pointer w-full sm:text-[1.4rem] sm:p-2 md:text-[1.5rem] lg:text-[1.8rem] xl:text-[2rem] whitespace-nowrap"
                  id="toggleNegativeSoul1"
                >
                  <div
                    class="flex justify-between items-center gap-1 sm:gap-1.5 md:gap-2 lg:gap-3 xl:gap-1"
                  >
                    <div class="flex-1">Negative Soul</div>
                    <span>
                      <img
                        src="../Images/down-chevron.png"
                        alt="Dropdown Icon"
                        class="flex-1 w-5 text-[#e27c34] sm:w-1 md:w-2 lg:w-3 xl:w-4"
                      />
                    </span>
                  </div>
                </button>
                <div
                  class="absolute top-full left-0 w-full mt-2 p-4 bg-[#f9f9f9] rounded-md border border-gray-300 z-10 shadow-md sm:mt-2 md:mt-3 lg:mt-4 xl:mt-5 hidden"
                  id="dropdownNegativeSoul1"
                >
                  <p>
                    Detailed content for <strong>Negative Soul</strong> goes
                    here. This can be tailored further based on the dropdown
                    selection.
                  </p>
                </div>
              </div>
              <div
                class="mb-6 bg-[#fdfdfd] rounded-md relative sm:mb-5 md:rounded-lg lg:mb-7 xl:rounded-xl"
              >
                <button
                  class="text-[1.6rem] font-bold bg-[#fdfdfd] text-[#e27c34] p-2 border-none rounded-md cursor-pointer w-full sm:text-[1.4rem] sm:p-2 md:text-[1.5rem] lg:text-[1.8rem] xl:text-[2rem] whitespace-nowrap"
                  id="togglePositiveMaterialism1"
                >
                  <div
                    class="flex justify-between items-center gap-1 sm:gap-1.5 md:gap-2 lg:gap-3 xl:gap-1"
                  >
                    <div class="flex-1">Positive Materialism</div>
                    <span>
                      <img
                        src="../Images/down-chevron.png"
                        alt="Dropdown Icon"
                        class="flex-1 w-5 text-[#e27c34] sm:w-1 md:w-2 lg:w-3 xl:w-4"
                      />
                    </span>
                  </div>
                </button>
                <div
                  class="absolute top-full left-0 w-full mt-2 p-4 bg-[#f9f9f9] rounded-md border border-gray-300 z-10 shadow-md sm:mt-2 md:mt-3 lg:mt-4 xl:mt-5 hidden"
                  id="dropdownPositiveMaterialism1"
                >
                  <p>
                    Detailed content for
                    <strong>Positive Materialism</strong> goes here. This can be
                    tailored further based on the dropdown selection.
                  </p>
                </div>
              </div>
              <div
                class="mb-6 bg-[#fdfdfd] rounded-md relative sm:mb-5 md:rounded-lg lg:mb-7 xl:rounded-xl"
              >
                <button
                  class="text-[1.6rem] font-bold bg-[#fdfdfd] text-[#e27c34] p-2 border-none rounded-md cursor-pointer w-full sm:text-[1.4rem] sm:p-2 md:text-[1.5rem] lg:text-[1.8rem] xl:text-[2rem] whitespace-nowrap"
                  id="toggleNegativeMaterialism1"
                >
                  <div
                    class="flex justify-between items-center gap-1 sm:gap-1.5 md:gap-2 lg:gap-3 xl:gap-1"
                  >
                    <div class="flex-1">Negative Materialism</div>
                    <span>
                      <img
                        src="../Images/down-chevron.png"
                        alt="Dropdown Icon"
                        class="flex-1 w-5 text-[#e27c34] sm:w-1 md:w-2 lg:w-3 xl:w-4"
                      />
                    </span>
                  </div>
                </button>
                <div
                  class="absolute top-full left-0 w-full mt-2 p-4 bg-[#f9f9f9] rounded-md border border-gray-300 z-10 shadow-md sm:mt-2 md:mt-3 lg:mt-4 xl:mt-5"
                  id="dropdownNegativeMaterialism1"
                >
                  <p>
                    Detailed content for
                    <strong>Negative Materialism</strong> goes here. This can be
                    tailored further based on the dropdown selection.
                  </p>
                </div>
              </div>
            </section>
          </div>
        </section>
      </div>
    </main> -->
    <!-- ************************************************************************************************* -->

    <footer class="bg-[#fff8f0]">
      <div
        class="flex justify-between items-center p-5 lg:px-10 lg:py-6 bg-white text-gray-800"
      >
        <!-- Left Section -->
        <div class="space-y-4 text-left">
          <div class="flex items-center gap-2 col-span-1">
            <img src="../Images/Atlas.png" alt="atlas-logo" width="150px" />
            <div class="w-px h-9 bg-gray-400"></div>
            <img
              src="../Images/passion-it-logo.png"
              alt="passion-it-logo"
              width="150px"
            />
          </div>
          <div class="text-sm text-gray-700 col-span-1">
            <div
              class="text-sm text-gray-700 col-span-1 flex items-center gap-2 py-2"
            >
              <img
                src="../Images/place.png"
                alt="place-logo"
                class="h-5 w-5 object-contain"
              />
              <p>
                Office #5, Block 1, Lloyds Chambers, Mangalwar Peth, Near
                Ambedkar Bavan, Pune - 411011
              </p>
            </div>
            <div class="flex items-center gap-2">
              <img
                src="../Images/phone.png"
                alt="phone-logo"
                class="h-5 w-5 object-contain"
              />
              <p class="font-bold">+91 9123456780</p>
            </div>
          </div>
        </div>

        <!-- Right Section -->
        <div class="text-right space-y-4">
          <p class="font-bold text-left">Connect with us</p>
          <div class="flex gap-4">
            <!-- Social Media Icons -->
            <a
              href="http://localhost:3018/"
              target="_blank"
              rel="noopener noreferrer"
              class="footer-logo"
            >
              <div class="footer-logo-svg">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="30"
                  height="30"
                  viewBox="0 0 300 300"
                >
                  <circle
                    cx="150"
                    cy="150"
                    r="150"
                    class="pattern-fb"
                    fill="#1c1c1c"
                  />
                  <path
                    class="pattern-fb-back"
                    fill="#9ca3af"
                    d="M150 30.6c-66 0-120 53.9-120 120.5 0 60 43.9 109.8 101.3 119v-83.3h-37.1v-34.6h34.6V118.1c0-29.9 17.8-46.3 45-46.3 13 0 26.7 2.3 26.7 2.3v31.1h-14.9c-14.6 0-19.2 9-19.2 18.1v21.9h32.6l-5.3 34.6h-27.4v83.3c57.4-9.2 101.3-59 101.3-119 0-66.6-54-120.5-120-120.5Z"
                  ></path>
                </svg>
              </div>
            </a>

            <a
              href="http://localhost:3018/"
              target="_blank"
              rel="noopener noreferrer"
              class="footer-logo"
            >
              <div class="footer-logo-svg">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="30"
                  height="30"
                  viewBox="0 0 300 300"
                >
                  <circle
                    cx="150"
                    cy="150"
                    r="150"
                    class="pattern-insta"
                    fill="#1c1c1c"
                  />
                  <path
                    class="pattern-insta-back"
                    fill="#9ca3af"
                    d="M195 37.5h-90C49.5 37.5 22.5 64.5 22.5 112.5v75c0 48 27 75 82.5 75h90c55.5 0 82.5-27 82.5-75v-75c0-48-27-75-82.5-75m-15 15a18.75 18.75 0 0 1 18.75 18.75A18.75 18.75 0 0 1 180 90a18.75 18.75 0 0 1-18.75-18.75A18.75 18.75 0 0 1 180 52.5M150 52.5a75 75 0 0 1 75 75a75 75 0 0 1-75 75a75 75 0 0 1-75-75a75 75 0 0 1 75-75m0 30a45 45 0 0 0-45 45a45 45 0 0 0 45 45a45 45 0 0 0 45-45a45 45 0 0 0-45-45Z"
                  />
                </svg>
              </div>
            </a>

            <a
              href="http://localhost:3018/"
              target="_blank"
              rel="noopener noreferrer"
              class="footer-logo"
            >
              <div class="footer-logo-svg">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="30"
                  height="30"
                  viewBox="0 0 300 300"
                >
                  <circle
                    cx="150"
                    cy="150"
                    r="150"
                    class="pattern-youtube"
                    fill="#1c1c1c"
                  />
                  <path
                    class="pattern-youtube-back"
                    fill="#9ca3af"
                    d="m125 187.5l64.875-37.5L125 112.5v75m138.45-97.875c1.575 5.875 2.7 13.75 3.6 23.75.9 10 1.35 18.625 1.35 26.125L275 150c0 27.375-2 47.5-5.55 60.375-3.125 11.25-10.375 18.5-21.625 21.625-5.875 1.575-16.625 2.7-33.125 3.6-16.25.875-31.125 1.35-44.875 1.35L150 237.5c-52.375 0-85-2-97.875-5.55-11.25-3.125-18.5-10.375-21.625-21.625-1.575-5.875-2.7-13.75-3.6-23.75-.9-10-1.35-18.625-1.35-26.125L25 150c0-27.375 2-47.5 5.55-60.375 3.125-11.25 10.375-18.5 21.625-21.625 5.875-1.575 16.625-2.7 33.125-3.6 16.25-.875 31.125-1.35 44.875-1.35L150 62.5c52.375 0 85 2 97.875 5.55 11.25 3.125 18.5 10.375 21.625 21.625Z"
                  />
                </svg>
              </div>
            </a>

            <a
              href="https://www.linkedin.com/in/dr-prakash-sharma-330743a3/"
              target="_blank"
              rel="noopener noreferrer"
              class="footer-logo"
            >
              <div class="footer-logo-svg">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="30"
                  height="30"
                  viewBox="0 0 300 300"
                >
                  <circle
                    cx="150"
                    cy="150"
                    r="150"
                    class="pattern-linkedin"
                    fill="#1c1c1c"
                  />
                  <path
                    class="pattern-linkedin-back"
                    fill="#9ca3af"
                    d="M237.5 37.5a25 25 0 0 1 25 25v175a25 25 0 0 1-25 25H62.5a25 25 0 0 1-25-25V62.5a25 25 0 0 1 25-25h175m-6.25 193.75v-66.25a40.75 40.75 0 0 0-40.75-40.75c-10.625 0-23 6.5-29 16.25v-13.875h-34.875v104.625h34.875v-61.625c0-9.625 7.75-17.5 17.375-17.5a17.5 17.5 0 0 1 17.5 17.5v61.625h34.875M82.25 107a21 21 0 0 0 21-21c0-11.625-9.375-21.125-21-21.125a21.125 21.125 0 0 0-21.125 21.125c0 11.625 9.5 21 21.125 21m17.375 123.625v-104.625H68.75v104.625h30.875Z"
                  />
                </svg>
              </div>
            </a>
          </div>
          <div>
            <p class="text-sm">
              &copy; <span>Terms and Conditions</span> |
              <span>Privacy Policy</span>
            </p>
          </div>
        </div>
      </div>

      <div class="text-center m-4 text-xs text-orange-600">
        <p>© 2024 All rights reserved.</p>
      </div>
    </footer>

    <script>
     
      // Main content for explore script

      // Get the button and dropdown elements for Positive Soul
      const togglePositiveSoul = document.getElementById("togglePositiveSoul");
      const dropdownPositiveSoul = document.getElementById(
        "dropdownPositiveSoul"
      );

      // Get the button and dropdown elements for Negative Soul
      const toggleNegativeSoul = document.getElementById("toggleNegativeSoul");
      const dropdownNegativeSoul = document.getElementById(
        "dropdownNegativeSoul"
      );

      // Get the button and dropdown elements for Positive Materialism
      const togglePositiveMaterialism = document.getElementById(
        "togglePositiveMaterialism"
      );
      const dropdownPositiveMaterialism = document.getElementById(
        "dropdownPositiveMaterialism"
      );
      // Get the button and dropdown for Negative Materialism
      const toggleNegativeMaterialism = document.getElementById(
        "toggleNegativeMaterialism"
      );

      const dropdownNegativeMaterialism = document.getElementById(
        "dropdownNegativeMaterialism"
      );

      // Function to toggle visibility of a dropdown
      function toggleDropdown(button, dropdown) {
        button.addEventListener("click", () => {
          if (dropdown.classList.contains("hidden")) {
            dropdown.classList.remove("hidden");
            dropdown.classList.add("visible");
          } else {
            dropdown.classList.remove("visible");
            dropdown.classList.add("hidden");
          }
        });
      }

      // Attach event listeners to buttons
      toggleDropdown(togglePositiveSoul, dropdownPositiveSoul);
      toggleDropdown(toggleNegativeSoul, dropdownNegativeSoul);
      toggleDropdown(togglePositiveMaterialism, dropdownPositiveMaterialism);
      toggleDropdown(toggleNegativeMaterialism, dropdownNegativeMaterialism);
    </script>
  </body>
</html>
`
  );
  const [showData, setShowData] = useState(true);
  const [previewHtml, setPreviewHtml] = useState(null);

  // Handle Excel file upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
        alert("Please upload a valid Excel file.");
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = new Uint8Array(event.target.result);
          const workbook = XLSX.read(data, { type: "array" });
          const sheetName = workbook.SheetNames[0];
          const sheetData = XLSX.utils.sheet_to_json(
            workbook.Sheets[sheetName]
          );
          console.log("sheetData while uploading+++++++++++", sheetData);
          setExcelData(sheetData);
        } catch (error) {
          alert(
            "Error reading Excel file. Please ensure it is in the correct format."
          );
          console.error(error);
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const normalizeKey = (key) =>
    key.trim().toLowerCase().replace(/ /g, "_").replace(/[()]/g, "");

  const generateHTMLContent = (row) => {
    let filledTemplate = htmlTemplate;

    Object.keys(row).forEach((key) => {
      // Normalize the key to match the placeholder
      const normalizedKey = normalizeKey(key);
      const placeholder = `{{${normalizedKey}}}`;

      // Replace placeholder in the template
      filledTemplate = filledTemplate.replace(
        new RegExp(placeholder, "g"),
        row[key] || "N/A"
      );
    });

    // Normalize the title for the og:url meta tag
    if (row["Title"]) {
      const normalizedTitle = normalizeTitle(row["Title"]);
      filledTemplate = filledTemplate.replace(
        "{{modifiedTitleValue}}",
        normalizedTitle
      );
      const currentDateInHtml = currentDateInHtmlContent(row["Title"]);
      filledTemplate = filledTemplate.replace(
        "{{currentDateInHtmlValue}}",
        currentDateInHtml
      );
    }
    return filledTemplate;
  };

  const generateHtmlPages = async () => {
    if (excelData.length === 0) {
      alert("No data to generate HTML pages. Please upload an Excel file.");
      return;
    }

    const zip = new JSZip(); // Initialize a new ZIP file
    const folder = zip.folder("Generated_HTML_Files"); // Create a folder inside the ZIP

    excelData.forEach((row, index) => {
      const htmlContent = generateHTMLContent(row); // Generate HTML for the row
      let fileName = row["Title"] || `page-${index + 1}`; // Use the Title column or a default name

      // Clean the file name: replace spaces with hyphens and remove unwanted characters
      fileName = fileName
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\./g, "")
        .replace(/\s+/g, "-")
        .replace(/[^a-zA-Z0-9\-]/g, "")
        .toLowerCase();

      const fileNameWithExtension = `${fileName}.html`;

      // Add the file to the ZIP folder
      folder.file(fileNameWithExtension, htmlContent);
    });

    // Generate the ZIP file and save it
    zip
      .generateAsync({ type: "blob" })
      .then((content) => {
        saveAs(content, "Generated_HTML_Files.zip"); // Save the ZIP file with a default name
        alert("ZIP file with HTML pages generated successfully!");
      })
      .catch((error) => {
        console.error("Error creating ZIP file:", error);
        alert("An error occurred while generating the ZIP file.");
      });
  };

  const handlePreview = (row) => {
    let filledTemplate = htmlTemplate;

    Object.keys(row).forEach((key) => {
      // Normalize the key to match the placeholder
      const normalizedKey = normalizeKey(key);
      const placeholder = `{{${normalizedKey}}}`;

      // Replace placeholder in the template
      filledTemplate = filledTemplate.replace(
        new RegExp(placeholder, "g"),
        row[key] || "N/A"
      );
    });

    setPreviewHtml(filledTemplate);
  };

  // ********************Sitemap.xmlGenerator****************************************************************
  const normalizeTitle = (title) =>
    title
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9\-]/g, "");

  const currentDateInHtmlContent = () => new Date().toISOString().split("T")[0]; // Format: YYYY-MM-DD

  const generateSitemap = () => {
    if (excelData.length === 0) {
      alert("No data to generate sitemap. Please upload an Excel file.");
      return;
    }

    const currentDate = new Date().toISOString().split("T")[0]; // Format: YYYY-MM-DD

    let sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    sitemapContent += `
    <url>
        <loc>https://www.atlas.passionit.com/</loc>
        <lastmod>${currentDate}</lastmod>
        <changefreq>yearly</changefreq>
        <priority>1.0</priority>
    </url>\n

    <url>
        <loc>https://www.atlas.passionit.com/about-us</loc>
        <lastmod>${currentDate}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.8</priority>
    </url>\n

    <url>
        <loc>https://www.atlas.passionit.com/login</loc>
        <lastmod>${currentDate}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.8</priority>
    </url>\n
    `;

    excelData.forEach((row) => {
      const title = row["Title"];
      if (title) {
        const normalizedTitle = normalizeTitle(title);
        sitemapContent += `
        <url>
            <loc>https://www.atlas.passionit.com/html-pages/${normalizedTitle}.html</loc>
            <lastmod>${currentDate}</lastmod>
            <changefreq>monthly</changefreq>
            <priority>0.9</priority>
        </url>\n`;
      }
    });

    sitemapContent += `</urlset>`;

    const blob = new Blob([sitemapContent], { type: "application/xml" });
    saveAs(blob, "sitemap.xml");
    alert("Sitemap.xml generated successfully!");
  };

  return (
    <div className="p-1">
      <h1 className="text-2xl font-bold mb-4 text-center">
        Excel to HTML Generator
      </h1>

      {/* Upload Excel file */}
      <div className="mb-4 ">
        <label className="block mb-2 font-medium p-1">Upload Excel File:</label>
        <input
          type="file"
          accept=".xlsx, .xls"
          onChange={handleFileUpload}
          className="border p-2 bg-customOrange text-white font-medium cursor-pointer hover:bg-hoverCustomOrange transition duration-200"
        />
      </div>

      {/* Hide/Show Button */}
      {excelData.length > 0 && (
        <button
          onClick={() => setShowData(!showData)}
          className=" bg-customOrange text-white font-medium cursor-pointer hover:bg-hoverCustomOrange transition duration-200 px-4 py-2 rounded mb-4 whitespace-nowrap w-auto"
        >
          {showData ? "Hide Sheet Data" : "Show Sheet Data"}
        </button>
      )}

      {/* View Excel data */}
      {showData && excelData.length > 0 && (
        <div
          className="mb-4 overflow-x-auto border p-2"
          style={{ maxHeight: "300px" }}
        >
          <h2 className="text-xl font-bold mb-2">Excel Data:</h2>
          <table className="border-collapse border border-gray-400 w-full">
            <thead>
              <tr>
                {Object.keys(excelData[0]).map((key) => (
                  <th key={key} className="border p-2">
                    {key}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {excelData.map((row, index) => (
                <tr key={index}>
                  {Object.values(row).map((value, i) => (
                    <td key={i} className="border p-2 whitespace-nowrap">
                      {value}
                    </td>
                  ))}
                  <td>
                    <button
                      onClick={() => handlePreview(row)}
                      className="  bg-customOrange text-white font-medium cursor-pointer hover:bg-hoverCustomOrange transition duration-200 px-2 py-1 rounded"
                    >
                      Preview
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Template Editor */}
      <div className="mb-4">
        <h2 className="text-xl font-bold mb-2">HTML Template:</h2>
        <textarea
          value={htmlTemplate}
          onChange={(e) => setHtmlTemplate(e.target.value)}
          rows={10}
          className="w-full border p-2"
        />
      </div>

      {/* Generate HTML button */}
      {excelData.length > 0 && (
        <button
          onClick={generateHtmlPages}
          className=" bg-customOrange text-white font-medium cursor-pointer hover:bg-hoverCustomOrange transition duration-200 px-4 py-2 rounded whitespace-nowrap w-auto"
        >
          Generate HTML Pages
        </button>
      )}

      {previewHtml && (
        <div
          className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center  overflow-x-auto items-start z-50"
          onClick={() => setPreviewHtml(null)}
        >
          <div
            className="bg-white p-4 rounded shadow-lg max-w-3xl w-full overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-4">HTML Preview</h2>
            {/* Rendering the HTML content dynamically */}
            <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
            <button
              onClick={() => setPreviewHtml(null)}
              className="mt-4 bg-red-500 text-white px-4 py-2 rounded"
            >
              Close Preview
            </button>
          </div>
        </div>
      )}

      {/* **********************************sitemap.xml file generator code******************************** */}
      <div className="p-1 mt-10">
        <h1 className="text-2xl font-bold mb-4 text-center">Excel Sitemap Generator</h1>

        <div className="mb-4">
          <label className="block mb-2 font-medium">Upload Excel File:</label>
          <input
            type="file"
            accept=".xlsx, .xls"
            onChange={handleFileUpload}
            className="border p-2  bg-customOrange text-white font-medium cursor-pointer hover:bg-hoverCustomOrange transition duration-200"
          />
        </div>

        {excelData.length > 0 && (
          <>
            <button
              onClick={generateSitemap}
              className=" bg-customOrange text-white font-medium cursor-pointer hover:bg-hoverCustomOrange transition duration-200 px-4 py-2 rounded mr-4 whitespace-nowrap w-auto"
            >
              Generate Sitemap.xml
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ExcelToHtmlGenerator;
