const fs = require("fs-extra");
const multer = require("multer");
const express = require("express");
const { Pool } = require("pg");
const bcrypt = require("bcryptjs");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
app.use(express.json({ limit: "300mb" }));
app.use(express.urlencoded({ limit: "300mb", extended: true }));
app.use(bodyParser.json({ limit: "300mb" }));
app.use(cors());
require("dotenv").config();
const crypto = require("crypto");
const CryptoJS = require("crypto-js");
const path = require("path");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const cheerio = require("cheerio");
const xlsx = require("xlsx");
const pgp = require("pg-promise")(); // Import pg-promise

// PostgreSQL Connection
const port = process.env.PORT; // Choose your desired port
let pool;
const connectWithRetry = () => {
  pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  });
  pool
    .connect()
    .then(() => console.log("Connected to PostgreSQL"))
    .catch((err) => {
      console.error("Failed to connect, retrying in 5 seconds...", err);
      setTimeout(connectWithRetry, 5000); // Retry connection after 5 seconds
    });

  pool.on("error", (err) => {
    console.error("Unexpected error on idle client", err);
    pool.end();
    connectWithRetry(); // Reconnect on error
  });
};

connectWithRetry();
const secretKey = process.env.JWT_SECRET;
/*****************************************************************SIGNUP API******************************************************* */
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL, // Your email address
    pass: process.env.EMAIL_PASSWORD, // Your email password
  },
});

app.post("/atlas-api/signup", async (req, res) => {
  const { email, password, name } = req.body;

  function generateOTP() {
    return crypto.randomInt(100000, 999999).toString();
  }

  try {
    // Check if user already exists
    const user = await pool.query(
      "SELECT * FROM atlasuser WHERE user_email = $1",
      [email]
    );

    if (user.rows.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate OTP and set expiry (10 minutes from now)
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    // Store user with hashed password, OTP, and expiry in database
    await pool.query(
      "INSERT INTO atlasuser (user_email, user_password, user_name, user_otp, otp_expiry) VALUES ($1, $2, $3, $4, $5)",
      [email, hashedPassword, name, otp, otpExpiry]
    );

    // Send OTP to user's email
    await transporter.sendMail({
      from: process.env.EMAIL,
      to: email,
      subject: "OTP for Email Verification",
      html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif; color: #333; background-color: #f4f4f4; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <p>Hello,</p>
          <p>Your OTP for email verification is:</p>
          <h2 style="font-size: 24px; font-weight: bold; color: #fa713b;">${otp}</h2>
          <p>This OTP will expire in 10 minutes. Please use it to verify your email address.</p>
          <p>If you did not request this, please ignore this email.</p>
          <div style="text-align: center; font-size: 14px; color: #888; margin-top: 20px;">
            <p>&copy; ${new Date().getFullYear()} Atlas Passion Framework. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    });

    res.status(201).json({
      message:
        "User registered successfully. Please verify your email using the OTP sent to your email.",
    });
  } catch (err) {
    console.error("Error signing up:", err);
    res.status(500).json({ message: "Error signing up" });
  }
});
/********************************************LOGIN API*************************************************************** */
app.post("/atlas-api/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Decrypt data

    // Find user by email
    const result = await pool.query(
      "SELECT * FROM atlasuser WHERE user_email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    // Compare passwords
    const match = await bcrypt.compare(password, result.rows[0].user_password);
    if (!match) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (result.rows[0].is_verified !== true) {
      return res.status(401).json({ message: "Unverified Account" });
    }

    const userName = result.rows[0].user_name;
    // Generate JWT token
    const token = jwt.sign(
      {
        userId: result.rows[0].user_id,
        email: result.rows[0].user_email,
        userName: result.rows[0].user_name,
        isAdmin: result.rows[0].is_admin,
      },
      secretKey,
      {
        expiresIn: "1h", // Token expires in 1 hour
        issuer: process.env.CLIENT_URL, // The issuer of the token
        audience: userName, // The intended audience
      }
    );

    res.status(200).json({ token });
  } catch (err) {
    console.error("Error logging in:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/*******************************************OTP VERIFICATION************************************************************** */
// OTP Verification route
app.post("/atlas-api/verify-otp", async (req, res) => {
  const { email, otp } = req.body;

  try {
    // Fetch user by email
    const user = await pool.query(
      "SELECT * FROM atlasuser WHERE user_email = $1",
      [email]
    );

    if (user.rows.length === 0) {
      return res.status(400).json({ message: "User not found" });
    }

    const userData = user.rows[0];

    // Check if OTP matches and is not expired
    if (
      userData.user_otp === otp &&
      new Date() < new Date(userData.otp_expiry)
    ) {
      // Mark user as verified
      await pool.query(
        "UPDATE atlasuser SET is_verified = true, user_otp = NULL, otp_expiry = NULL WHERE user_email = $1",
        [email]
      );

      res
        .status(200)
        .json({ message: "User verified successfully. You can now log in." });
    } else {
      res
        .status(400)
        .json({ message: "Invalid or expired OTP. Please try again." });
    }
  } catch (err) {
    console.error("Error verifying OTP:", err);
    res.status(500).json({ message: "Error verifying OTP" });
  }
});

/****************************************************VERIFY OTP****************************************************************** */
// OTP Verification route
app.post("/startup-api/verify-otp", async (req, res) => {
  const { email, otp } = req.body;

  try {
    // Fetch user by email
    const user = await pool.query(
      "SELECT * FROM atlasuser WHERE user_email = $1",
      [email]
    );

    if (user.rows.length === 0) {
      return res.status(400).json({ message: "User not found" });
    }

    const userData = user.rows[0];

    // Check if OTP matches and is not expired
    if (
      userData.user_otp === otp &&
      new Date() < new Date(userData.otp_expiry)
    ) {
      // Mark user as verified
      await pool.query(
        "UPDATE atlasuser SET is_verified = true, user_otp = NULL, otp_expiry = NULL WHERE user_email = $1",
        [email]
      );

      res
        .status(200)
        .json({ message: "User verified successfully. You can now log in." });
    } else {
      res
        .status(400)
        .json({ message: "Invalid or expired OTP. Please try again." });
    }
  } catch (err) {
    console.error("Error verifying OTP:", err);
    res.status(500).json({ message: "Error verifying OTP" });
  }
});

// app.use('/atlas-api/public', express.static(path.join(__dirname, '../public')));
// const sitemapPath = path.resolve('/home/passionit/public_html/atlas.passionit.com/public/sitemap.xml');
// const htmlPagesPath = path.resolve('/home/passionit/public_html/atlas.passionit.com/public/html-pages');

// ***********************update sitmap.xml*************************************

const sitemapPath = path.join(__dirname, "../public/sitemap.xml");
const htmlPagesPath = path.join(__dirname, "../public/html-pages");
const SITE_URL = "https://www.atlas.passionit.com/html-pages";

// Function to update sitemap with only the changed file
function updateSitemap(newFileName) {
  if (!newFileName.endsWith(".html")) return;

  const filePath = path.join(htmlPagesPath, newFileName);
  if (!fs.existsSync(filePath)) return;

  const fileUrl = `${SITE_URL}/${newFileName}`;
  const lastMod = new Date().toISOString().split("T")[0];

  console.log(`🔄 Updating sitemap for: ${newFileName}`);

  let sitemapContent = "";

  // Check if sitemap exists, otherwise create a new one
  if (fs.existsSync(sitemapPath)) {
    sitemapContent = fs.readFileSync(sitemapPath, "utf-8");
  } else {
    console.log("⚠️ Sitemap not found, creating a new one...");
    sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n</urlset>`;
  }

  // If the file already exists in the sitemap, update its lastmod
  if (sitemapContent.includes(fileUrl)) {
    console.log(`🟡 File already in sitemap, updating timestamp: ${lastMod}`);
    sitemapContent = sitemapContent.replace(
      new RegExp(`(<loc>${fileUrl}</loc>\\s*<lastmod>)([^<]+)(</lastmod>)`),
      `$1${lastMod}$3`
    );
  } else {
    console.log(`🟢 Adding new file to sitemap: ${newFileName}`);
    const newEntry = `
    <url>
        <loc>${fileUrl}</loc>
        <lastmod>${lastMod}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.9</priority>
    </url>`;

    // Insert new entry before closing </urlset>
    sitemapContent = sitemapContent.replace(
      "</urlset>",
      newEntry + "\n</urlset>"
    );
  }

  // Write the updated sitemap back to the file
  fs.writeFileSync(sitemapPath, sitemapContent, "utf-8");
  console.log("✅ Sitemap updated successfully!");
}

// Watch for changes in the html-pages folder and update sitemap incrementally
fs.watch(
  htmlPagesPath,
  { persistent: true, recursive: false },
  (eventType, filename) => {
    if (eventType === "rename" && filename) {
      updateSitemap(filename);
    }
  }
);

// Initial log to confirm the script is running
console.log("🚀 Sitemap updater is running...");

/****************************************************************************************************************************** */

// API to fetch the dateModified from an HTML file
app.post("/atlas-api/get-date-modified", (req, res) => {
  const { title } = req.body;
  // console.log("title ++++++++++++++++++++",title)
  if (!title) {
    return res.status(400).json({ error: "Title is required" });
  }

  const fileName =
    title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\./g, "")
      .replace(/\s+/g, "-") + ".html";
  const filePath = path.join(__dirname, "../public/html-pages", fileName);

  // Check if the file exists
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "HTML file not found" });
  }

  try {
    const htmlContent = fs.readFileSync(filePath, "utf-8");
    const $ = cheerio.load(htmlContent);

    // Extract the dateModified from the script tag in the head
    const scriptTagContent = $("head script").html();
    const dateModifiedMatch =
      scriptTagContent && scriptTagContent.match(/"dateModified":"(.*?)"/);

    if (dateModifiedMatch && dateModifiedMatch[1]) {
      return res.status(200).json({ dateModified: dateModifiedMatch[1] });
    } else {
      return res
        .status(404)
        .json({ error: "dateModified not found in the file" });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ error: "An error occurred while reading the file" });
  }
});

/**********************************************************saving html pages******************************************************************** */
// API Endpoint to save HTML files
// Define the folder where HTML files should be saved (inside frontend)
const saveFolderPath = path.resolve(__dirname, "../public/html-pages");

// // Ensure the folder exists
// if (!fs.existsSync(saveFolderPath)) {
//     fs.mkdirSync(saveFolderPath, { recursive: true });
// }

// Ensure the folder exists once at startup
fs.ensureDir(saveFolderPath)
  .then(() => console.log("📂 Save folder is ready:", saveFolderPath))
  .catch((err) => console.error("❌ Error ensuring folder:", err));

app.post("/atlas-api/save-html", async (req, res) => {
  try {
    const { fileName, htmlContent } = req.body;
    console.log(`➡️ Received request to save: ${fileName}.html`);

    if (!fileName || !htmlContent) {
      return res
        .status(400)
        .json({ message: "Missing fileName or htmlContent" });
    }

    const sanitizedFileName = fileName
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\./g, "")
      .replace(/\s+/g, "-")
      .replace(/[^a-zA-Z0-9\-]/g, "")
      .toLowerCase();

    const filePath = path.join(saveFolderPath, `${sanitizedFileName}.html`);

    if (fs.existsSync(filePath)) {
      // Read the existing file content
      const existingContent = await fs.readFile(filePath, "utf8");

      if (existingContent.trim() === htmlContent.trim()) {
        console.log(`✅ No changes, file already up to date: ${filePath}`);
        return res.json({
          success: true,
          message: "File already up to date",
          filePath,
        });
      } else {
        // Update file if content is different
        await fs.writeFile(filePath, htmlContent, "utf8");
        console.log(`🔄 Updated file: ${filePath}`);
        return res.json({
          success: true,
          message: "File updated successfully",
          filePath,
        });
      }
    } else {
      // Create new file if it does not exist
      await fs.writeFile(filePath, htmlContent, "utf8");
      console.log(`🆕 Created new file: ${filePath}`);
      return res.json({
        success: true,
        message: "File created successfully",
        filePath,
      });
    }
  } catch (error) {
    console.error("❌ Error saving file:", error);
    res
      .status(500)
      .json({ success: false, message: "Error saving file", error });
  }
});

/************************************Add API to Fetch KeyGroup Data****************************************************************************************** */

// app.get("/atlas-api/keygroup/:name", async (req, res) => {
//   try {
//     const keygroupName = req.params.name;
//     const query = `SELECT * FROM keygroup_data WHERE keygroup_name = $1 ORDER BY created_at DESC LIMIT 1`;
//     const { rows } = await pool.query(query, [keygroupName]);

//     if (rows.length === 0) {
//       return res.status(404).json({ success: false, message: "No data found" });
//     }

//     let data = rows[0];

//     // Parse the response to extract dimensions and scores
//     function parseResponse(responseText) {
//       let sections = responseText.split("\n\n");
//       let parsedData = {};

//       sections.forEach((section) => {
//         let lines = section.split("\n");
//         if (lines.length > 2 && lines[1].includes("Score")) {
//           let category = lines[0].trim();
//           parsedData[category] = [];

//           for (let i = 3; i < lines.length; i++) {
//             let cols = lines[i].split("|").map((col) => col.trim());
//             if (cols.length >= 4) {
//               parsedData[category].push({
//                 dimension: cols[1],
//                 score: parseInt(cols[2]),
//                 evidence: cols[3],
//                 rationale: cols[4],
//               });
//             }
//           }
//         }
//       });

//       return parsedData;
//     }

//     data.parsed_response = parseResponse(data.response);

//     res.json({ success: true, data });
//   } catch (error) {
//     console.error("Error fetching KeyGroup data:", error);
//     res.status(500).json({ success: false, message: "Server Error" });
//   }
// });
// *********************************Generate s7.html Dynamically*******************************************

// app.post("/atlas-api/generate-html", async (req, res) => {
//   try {
//     const { keygroupName } = req.body;
//     if (!keygroupName) {
//       return res.status(400).json({ message: "KeyGroup name is required" });
//     }

//     const response = await pool.query(
//       `SELECT * FROM keygroup_data WHERE keygroup_name = $1 ORDER BY created_at DESC LIMIT 1`,
//       [keygroupName]
//     );

//     if (response.rows.length === 0) {
//       return res.status(404).json({ success: false, message: "No data found" });
//     }

//     const data = response.rows[0];

//     function parseResponse(responseText) {
//       let sections = responseText.split("\n\n");
//       let parsedData = {};

//       sections.forEach((section) => {
//         let lines = section.split("\n");
//         if (lines.length > 2 && lines[1].includes("Score")) {
//           let category = lines[0].trim();
//           parsedData[category] = [];

//           for (let i = 3; i < lines.length; i++) {
//             let cols = lines[i].split("|").map((col) => col.trim());
//             if (cols.length >= 4) {
//               parsedData[category].push({
//                 dimension: cols[1],
//                 score: parseInt(cols[2]),
//                 evidence: cols[3],
//                 rationale: cols[4],
//               });
//             }
//           }
//         }
//       });

//       return parsedData;
//     }

//     const parsedData = parseResponse(data.response);

//     let htmlContent = `
//       <!DOCTYPE html>
//       <html lang="en">
//       <head>
//           <meta charset="UTF-8">
//           <meta name="viewport" content="width=device-width, initial-scale=1.0">
//           <title>KeyGroup Report - ${data.keygroup_name}</title>
//           <script src="https://cdn.tailwindcss.com"></script>
//       </head>
//       <body class="bg-[#fbf9ef] p-6">
//           <div class="max-w-6xl mx-auto bg-white p-6 rounded-lg shadow-md">
//               <h1 class="text-3xl font-bold text-[#e27c34] mb-4">KeyGroup Report</h1>
//               <h2 class="text-2xl font-semibold bg-[#d62101] text-white p-3 rounded">${data.keygroup_name} - ${data.keyword_name}</h2>
//               <p><strong>Link:</strong> <a href="${data.link}" class="text-blue-500">${data.link}</a></p>
//               <p><strong>Text:</strong> ${data.text}</p>
//               <p><strong>Date:</strong> ${data.date}</p>
//               <p><strong>Time:</strong> ${data.time}</p>`;

//     for (let category in parsedData) {
//       htmlContent += `
//               <h3 class="text-xl font-semibold text-[#e27c34] mt-6">${category}</h3>
//               <table class="w-full table-auto border border-collapse border-gray-300 mt-3">
//                   <thead>
//                       <tr class="bg-[#fdf2d1]">
//                           <th class="border px-4 py-2">Dimension</th>
//                           <th class="border px-4 py-2">Score</th>
//                           <th class="border px-4 py-2">Evidence</th>
//                           <th class="border px-4 py-2">Rationale</th>
//                       </tr>
//                   </thead>
//                   <tbody class="text-gray-700">`;

//       parsedData[category].forEach((row) => {
//         htmlContent += `
//                   <tr class="border">
//                       <td class="border px-4 py-2">${row.dimension}</td>
//                       <td class="border px-4 py-2">${row.score}</td>
//                       <td class="border px-4 py-2">${row.evidence}</td>
//                       <td class="border px-4 py-2">${row.rationale}</td>
//                   </tr>`;
//       });

//       htmlContent += `</tbody></table>`;
//     }

//     htmlContent += `
//           </div>
//       </body>
//       </html>`;

//     // Save the generated HTML file
//     const filePath = path.join(
//       saveFolderPath,
//       `s7-${data.keygroup_name.toLowerCase()}.html`
//     );
//     await fs.writeFile(filePath, htmlContent, "utf8");

//     res.json({
//       success: true,
//       message: "HTML file generated successfully",
//       filePath,
//     });
//   } catch (error) {
//     console.error("Error generating HTML:", error);
//     res
//       .status(500)
//       .json({ success: false, message: "Error generating HTML", error });
//   }
// });


// ****************************************excel file uploadad and send the data to postgre***************************************************************
// Configure Multer for file uploads
const upload = multer({ dest: "uploads/" });

const newsColumns = new pgp.helpers.ColumnSet(
  ["keyword_id", "link", "text", "date", "time", "response"],
  { table: "news_articles" }
);

const dimensionColumns = new pgp.helpers.ColumnSet(
  ["article_id", "category", "dimension_name", "score", "evidence", "rationale"],
  { table: "dimensions" }
);

async function bulkInsertDimensions(dimensionsData) {
  if (dimensionsData.length === 0) return;
  const query = pgp.helpers.insert(dimensionsData, dimensionColumns);
  
  try {
    await pool.query(query);
    console.log("✅ Bulk Inserted Dimensions Successfully!");
  } catch (error) {
    console.error("🚨 Bulk Insert Dimensions Error:", error);
  }
}

const convertExcelDate = (value) => {
  if (!value) return "";

  if (typeof value === "number" && value > 40000) { 
    // ✅ Convert Excel serial number to JavaScript Date
    const excelEpoch = new Date(1899, 11, 30);
    const dateObj = new Date(excelEpoch.getTime() + value * 24 * 60 * 60 * 1000);

    // ✅ Preserve AM/PM format if present
    let dateStr = dateObj.toISOString().split("T")[0]; // YYYY-MM-DD
    let timeStr = dateObj.toLocaleTimeString("en-US"); // HH:MM:SS AM/PM

    return `${dateStr} ${timeStr}`.trim();
  }

  return value.toString().trim(); // ✅ Preserve original text format
};

const processExcelRow = (row) => {
  const keyword_name = row["Keyword Name"]?.toString().trim() || "";
  const link = row["Link"]?.toString().trim() || "";
  const text = row["Text"]?.toString().trim() || "";
  const response = row["Response"]?.toString().trim() || "";

  // ✅ Ensure Date & Time Are Read Correctly
  let date = row["Date"] || row["date"] || row["Date Time"] || "";
  let time = row["Time"] || row["time"] || row["Date Time"] || "";

  // ✅ Convert Excel Serial Numbers to Proper Date & Time Format
  date = convertExcelDate(date);
  time = convertExcelDate(time);

  if (!keyword_name || !link || !text || !response) {
    console.warn("❌ Skipping row due to missing critical data:", row);
    return null;
  }

  return { keyword_name, link, text, response, date, time };
};

app.post("/atlas-api/upload-excel", upload.single("file"), async (req, res) => {
  try {
      if (!req.file) {
          return res.status(400).json({ success: false, message: "No file uploaded" });
      }

      const workbook = xlsx.readFile(req.file.path);
      const sheetNames = workbook.SheetNames;

      let keygroupsCache = {};
      let keywordsCache = {};

      for (let sheetName of sheetNames) {
          const sheet = workbook.Sheets[sheetName];
          const jsonData = xlsx.utils.sheet_to_json(sheet);
          if (jsonData.length === 0) continue;

          // ✅ Get or Insert KeyGroup
          if (!keygroupsCache[sheetName]) {
              let keygroupResult = await pool.query(
                  "INSERT INTO keygroups (keygroup_name) VALUES ($1) ON CONFLICT (keygroup_name) DO NOTHING RETURNING keygroup_id",
                  [sheetName]
              );

              keygroupsCache[sheetName] =
                  keygroupResult.rows.length > 0
                      ? keygroupResult.rows[0].keygroup_id
                      : (await pool.query("SELECT keygroup_id FROM keygroups WHERE keygroup_name = $1", [sheetName])).rows[0].keygroup_id;
          }

          const keygroupId = keygroupsCache[sheetName];

          let insertNewsData = [];
          let insertDimensionsData = [];

          for (let row of jsonData) {
            const processedRow = processExcelRow(row);
            
            if (!processedRow) continue; // Skip rows with missing data
          
            const { keyword_name, link, text, response, date, time } = processExcelRow(row);
          
            const keywordKey = `${keygroupId}-${keyword_name}`;
          
            if (!keywordsCache[keywordKey]) {
              let keywordResult = await pool.query(
                "INSERT INTO keywords (keygroup_id, keyword_name) VALUES ($1, $2) ON CONFLICT (keygroup_id, keyword_name) DO NOTHING RETURNING keyword_id",
                [keygroupId, keyword_name]
              );
          
              keywordsCache[keywordKey] =
                keywordResult.rows.length > 0
                  ? keywordResult.rows[0].keyword_id
                  : (await pool.query(
                      "SELECT keyword_id FROM keywords WHERE keygroup_id = $1 AND keyword_name = $2",
                      [keygroupId, keyword_name]
                    )).rows[0].keyword_id;
            }
          
            const keywordId = keywordsCache[keywordKey];
          
            insertNewsData.push({ keyword_id: keywordId, link, text, date, time, response });
          }
          
          // ✅ Bulk Insert News Articles
          if (insertNewsData.length > 0) {
              const newsQuery = pgp.helpers.insert(insertNewsData, newsColumns) + " RETURNING article_id";
              const articlesResult = await pool.query(newsQuery);

              articlesResult.rows.forEach(({ article_id }, index) => {
                  const parsedDimensions = parseResponse(insertNewsData[index].response);
                  parsedDimensions.forEach(({ category, dimension, score, evidence, rationale }) => {
                      insertDimensionsData.push({
                          article_id,
                          category,
                          dimension_name: dimension,
                          score,
                          evidence,
                          rationale,
                      });
                  });
              });

              // ✅ Bulk Insert Dimensions
              if (insertDimensionsData.length > 0) {
                  await bulkInsertDimensions(insertDimensionsData);
              }
          }
      }

      res.status(200).json({ success: true, message: "Excel data processed successfully!" });
  } catch (error) {
      console.error("🚨 Error processing Excel:", error);
      res.status(500).json({ success: false, message: "Error processing Excel file", error });
  }
});

function parseResponse(responseText) {
  let parsedData = [];

  // Split response into sections using "Dimensions" as a delimiter
  let sections = responseText.split(/\n(?=[A-Za-z\s]+Dimensions)/g);

  sections.forEach(section => {
      let lines = section.trim().split("\n").map(line => line.trim()).filter(line => line);

      if (lines.length < 4) return; // Skip invalid sections

      let category = lines[0].replace(":", "").trim(); // Extract category name
      if (!category.toLowerCase().includes("dimensions")) return; // Ensure it's a valid category

      console.log(`🟢 Processing Category: ${category}`);

      // Locate the start of the table dynamically
      let tableStartIndex = lines.findIndex(line => line.includes("| Dimension | Score (1-10) | Evidence Found | Rationale for Score |"));
      if (tableStartIndex === -1) return; // Skip if no valid table found
      tableStartIndex += 2; // Move to first data row

      // Extract table rows
      for (let i = tableStartIndex; i < lines.length; i++) {
          let cols = lines[i].split("|").map(col => col.trim()).filter(col => col); // Split into columns

          if (cols.length >= 4 && !isNaN(parseInt(cols[1]))) { // Ensure row has a valid score
              parsedData.push({
                  category: category, // Example: "Passion Dimensions"
                  dimension: cols[0], // Example: "Probing"
                  score: parseInt(cols[1]), // Convert score to number
                  evidence: cols[2].replace(/["¹']/g, "").trim() || "N/A", // Remove quotes and special characters
                  rationale: cols[3].replace(/["¹']/g, "").trim() || "N/A" // Remove quotes and special characters
              });
          }
      }
  });

  console.log("✅ Parsed Data:", JSON.stringify(parsedData, null, 2));
  return parsedData;
}

// ******************************popping up html page according to keygroup like Google, Donald Trump, India*************************************************************************
// Fetch KeyGroup Data (News + Dimensions) from PostgreSQL
app.get("/atlas-api/keygroup/:keygroupId", async (req, res) => {
  try {
    const { keygroupId } = req.params;
    console.log("🔍 Fetching Data for KeyGroup ID:", keygroupId);

    // Fetch News Articles for the KeyGroup
    const newsQuery = `
      SELECT na.*, k.keyword_name
      FROM news_articles na
      JOIN keywords k ON na.keyword_id = k.keyword_id
      WHERE k.keygroup_id = $1
      ORDER BY na.created_at DESC;
    `;

    const newsResult = await pool.query(newsQuery, [keygroupId]);
    console.log("📊 Fetched News Articles:", newsResult.rows);

    // Fetch Dimensions for the News Articles
    const articleIds = newsResult.rows.map((article) => article.article_id);
    console.log("🆔 Article IDs for Dimensions Fetch:", articleIds);

    let dimensionsResult = [];

    if (articleIds.length > 0) {
      const dimensionQuery = `
        SELECT d.*, na.article_id
        FROM dimensions d
        JOIN news_articles na ON d.article_id = na.article_id
        WHERE na.article_id = ANY($1);
      `;
      dimensionsResult = await pool.query(dimensionQuery, [articleIds]);
      console.log("📐 Fetched Dimensions:", dimensionsResult.rows);
    }

    res.status(200).json({
      news: newsResult.rows,
      dimensions: dimensionsResult.rows,
    });
  } catch (error) {
    console.error("🚨 Error fetching KeyGroup data:", error);
    res.status(500).json({ error: "Failed to fetch KeyGroup data." });
  }
});

// Fetch all keygroups
app.get("/atlas-api/keygroups", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM keygroups ORDER BY created_at DESC;");
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("🚨 Error fetching keygroups:", error);
    res.status(500).json({ error: "Failed to fetch keygroups." });
  }
});


// *******************************************************************************************************

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// ******************************db create tables queries for atlas*************************
// select * from dimensions;
// select * from news_articles;
// select * from keywords;
// select * from keygroups;

// SELECT response FROM news_articles WHERE article_id = 32;
// SELECT category FROM dimensions WHERE dimension_id = 463;

// DROP TABLE dimensions;
// DROP TABLE news_articles;
// DROP TABLE keywords;
// DROP TABLE keygroups;



//  CREATE TABLE keygroups (
//    keygroup_id SERIAL PRIMARY KEY,
//    keygroup_name TEXT UNIQUE NOT NULL,
//    created_at TIMESTAMP DEFAULT NOW()
//  );

// CREATE TABLE keywords (
//    keyword_id SERIAL PRIMARY KEY,
//    keygroup_id INT REFERENCES keygroups(keygroup_id),
//    keyword_name TEXT NOT NULL,
//   UNIQUE (keygroup_id, keyword_name),
//    created_at TIMESTAMP DEFAULT NOW()
// );

// CREATE TABLE news_articles (
//     article_id SERIAL PRIMARY KEY,
//     keyword_id INT REFERENCES keywords(keyword_id),
//     link TEXT NOT NULL,
//     text TEXT NOT NULL,
//     datetime TIMESTAMP NOT NULL,  -- Now stores both date & time
//     response TEXT NOT NULL,
//     created_at TIMESTAMP DEFAULT NOW()
// );

// CREATE TABLE dimensions (
//     dimension_id SERIAL PRIMARY KEY,
//     article_id INT REFERENCES news_articles(article_id),
//     category TEXT NOT NULL,
//     dimension_name TEXT NOT NULL,
//     score INT NOT NULL CHECK (score BETWEEN 1 AND 10),
//     evidence TEXT,
//     rationale TEXT,
//     created_at TIMESTAMP DEFAULT NOW()
// );


// *******************removed not null and refrences from ids************************
// select * from dimensions;
// select * from news_articles;
// select * from keywords;
// select * from keygroups;

// SELECT response FROM news_articles WHERE article_id = 32;
// SELECT category FROM dimensions WHERE dimension_id = 463;

// DROP TABLE dimensions;
// DROP TABLE news_articles;
// DROP TABLE keywords;
// DROP TABLE keygroups;

// CREATE TABLE keygroups (
//    keygroup_id SERIAL PRIMARY KEY,
//    keygroup_name TEXT UNIQUE,
//    created_at TIMESTAMP DEFAULT NOW()
// );

// CREATE TABLE keywords (
//    keyword_id SERIAL PRIMARY KEY,
//    keygroup_id INT,
//    keyword_name TEXT,
//    UNIQUE (keygroup_id, keyword_name),
//    created_at TIMESTAMP DEFAULT NOW()
// );

// CREATE TABLE news_articles (
//     article_id SERIAL PRIMARY KEY,
//     keyword_id INT,
//     link TEXT,
//     text TEXT,
//     date TEXT,
//     time TEXT,
//     response TEXT,
//     created_at TIMESTAMP DEFAULT NOW()
// );

// CREATE TABLE dimensions (
//     dimension_id SERIAL PRIMARY KEY,
//     article_id INT,
//     category TEXT,
//     dimension_name TEXT,
//     score INT CHECK (score BETWEEN 1 AND 10),
//     evidence TEXT,
//     rationale TEXT,
//     created_at TIMESTAMP DEFAULT NOW()
// );