const fs = require("fs-extra");
// const fs = require("fs");
const express = require("express");
const { Pool } = require("pg");
const bcrypt = require("bcryptjs");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use(express.json({ limit: "100mb" }));
// app.use(express.urlencoded({ limit: "100mb", extended: true }));
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
        sitemapContent = sitemapContent.replace("</urlset>", newEntry + "\n</urlset>");
    }

    // Write the updated sitemap back to the file
    fs.writeFileSync(sitemapPath, sitemapContent, "utf-8");
    console.log("✅ Sitemap updated successfully!");
}

// Watch for changes in the html-pages folder and update sitemap incrementally
fs.watch(htmlPagesPath, { persistent: true, recursive: false }, (eventType, filename) => {
    if (eventType === "rename" && filename) {
        updateSitemap(filename);
    }
});

// Initial log to confirm the script is running
console.log("🚀 Sitemap updater is running...");

// // Function to update sitemap.xml when a new file is added
// function updateSitemap(newFileName) {
//   const sitemapPath = path.join(
//     __dirname,
//     "../public/sitemap.xml"
//   );
//   const htmlPagesPath = path.join(
//     __dirname,
//     "../public/html-pages"
//   );

//   // Check if the new file is an HTML file in the 'html-pages' directory
//   if (
//     newFileName.endsWith(".html") &&
//     fs.existsSync(path.join(htmlPagesPath, newFileName))
//   ) {
//     // Generate the new <url> entry for the sitemap
//     const newUrlEntry = `
//     <url>
//       <loc>https://www.atlas.passionit.com/html-pages/${newFileName}</loc>
//       <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
//       <changefreq>monthly</changefreq>
//       <priority>0.9</priority>
//     </url>`;

//     // Read the existing sitemap
//     fs.readFile(sitemapPath, "utf-8", (err, data) => {
//       if (err) {
//         console.error("Error reading sitemap.xml:", err);
//         return;
//       }

//       // Check if the <urlset> already contains the entry for this file
//       if (!data.includes(newFileName)) {
//         // Insert the new entry before closing </urlset>
//         const updatedSitemap = data.replace(
//           "</urlset>",
//           newUrlEntry + "\n</urlset>"
//         );

//         // Write the updated sitemap back to the file
//         fs.writeFileSync(sitemapPath, updatedSitemap, "utf-8", (err) => {
//           if (err) {
//             console.error("Error updating sitemap.xml:", err);
//           } else {
//             console.log(`Sitemap updated with ${newFileName}`);
//           }
//         });
//       }
//     });
//   }
// }

// // Example: Call this function when a new file is added to html-pages
// fs.watch(
//   path.join(__dirname, "../public/html-pages"),
//   (eventType, filename) => {
//     if (eventType === "rename" && filename) {
//       updateSitemap(filename);
//     }
//   }
// );
/****************************************************************************************************************************** */

// API to fetch the dateModified from an HTML file
app.post("/atlas-api/get-date-modified", (req, res) => {
  const { title } = req.body;
  // console.log("title ++++++++++++++++++++",title)
  if (!title) {
    return res.status(400).json({ error: "Title is required" });
  }

  const fileName = title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\./g, "").replace(/\s+/g, "-") + ".html";
  const filePath = path.join(
    __dirname,
    "../public/html-pages",
    fileName
  );

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
// Define the folder where HTML files should be saved (inside frontend)
// const saveFolderPath = path.join(__dirname, "../public/html-pages"); 

// // Ensure the folder exists
// if (!fs.existsSync(saveFolderPath)) {
//     fs.mkdirSync(saveFolderPath, { recursive: true });
// }

// app.post("/save-html", async (req, res) => {
//     try {
//         const { fileName, htmlContent } = req.body;
//         if (!fileName || !htmlContent) {
//             return res.status(400).json({ message: "Missing fileName or htmlContent" });
//         }

//         const sanitizedFileName = fileName
//         .normalize("NFD")
//         .replace(/[\u0300-\u036f]/g, "")
//         .replace(/\./g, "")
//         .replace(/\s+/g, "-")
//         .replace(/[^a-zA-Z0-9\-]/g, "")
//         .toLowerCase();
//         const filePath = path.join(saveFolderPath, `${sanitizedFileName}.html`);

//         console.log(`Saving file as: ${filePath}`);

//         await fs.promises.writeFile(filePath, htmlContent, "utf8");

//         res.json({ success: true, message: `File saved: ${filePath}` });
//     } catch (error) {
//         console.error("Error saving file:", error);
//         res.status(500).json({ success: false, message: "Error saving file", error });
//     }
// });

// const saveFolderPath = (__dirname, "../public/html-pages");
const saveFolderPath = path.resolve(__dirname, "../public/html-pages");

// // Ensure the folder exists
// if (!fs.existsSync(saveFolderPath)) {
//     fs.mkdirSync(saveFolderPath, { recursive: true });
// }

// Ensure the folder exists once at startup
fs.ensureDir(saveFolderPath)
    .then(() => console.log("📂 Save folder is ready:", saveFolderPath))
    .catch((err) => console.error("❌ Error ensuring folder:", err));
    
  //   app.post("/save-html", async (req, res) => {
  //     try {
  //         const { fileName, htmlContent } = req.body;
  //         console.log(`➡️ Received request to save: ${fileName}.html`);
  
  //         if (!fileName || !htmlContent) {
  //             return res.status(400).json({ message: "Missing fileName or htmlContent" });
  //         }
  
  //         const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9-_]/g, "").toLowerCase();
  //         const filePath = path.join(saveFolderPath, `${sanitizedFileName}.html`);
  
  //         console.log(`📂 Saving file as: ${filePath}`);
  //         await fs.writeFile(filePath, htmlContent, "utf8");
  //         console.log(`✅ File successfully saved: ${filePath}`);
  
  //         res.json({ success: true, message: `File saved: ${filePath}` });
  //     } catch (error) {
  //         console.error("❌ Error saving file:", error);
  //         res.status(500).json({ success: false, message: "Error saving file", error });
  //     }
  // });
  
  app.post("/save-html", async (req, res) => {
    try {
        const { fileName, htmlContent } = req.body;
        console.log(`➡️ Received request to save: ${fileName}.html`);

        if (!fileName || !htmlContent) {
            return res.status(400).json({ message: "Missing fileName or htmlContent" });
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
                return res.json({ success: true, message: "File already up to date", filePath });
            } else {
                // Update file if content is different
                await fs.writeFile(filePath, htmlContent, "utf8");
                console.log(`🔄 Updated file: ${filePath}`);
                return res.json({ success: true, message: "File updated successfully", filePath });
            }
        } else {
            // Create new file if it does not exist
            await fs.writeFile(filePath, htmlContent, "utf8");
            console.log(`🆕 Created new file: ${filePath}`);
            return res.json({ success: true, message: "File created successfully", filePath });
        }
    } catch (error) {
        console.error("❌ Error saving file:", error);
        res.status(500).json({ success: false, message: "Error saving file", error });
    }
});
// API Endpoint to save HTML files
// app.post("/save-html", async (req, res) => {
//     try {
//         const { fileName, htmlContent } = req.body;
//         if (!fileName || !htmlContent) {
//             return res.status(400).json({ message: "Missing fileName or htmlContent" });
//         }

//         const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9-_]/g, "").toLowerCase();
//         const filePath = path.join(saveFolderPath, `${sanitizedFileName}.html`);
//         console.log(`Saving file as: ${filePath}`);
        
//           // Ensure the folder exists before writing each file (optional but extra safe)
//           await fs.ensureDir(saveFolderPath);
          
//         // await fs.promises.writeFile(filePath, htmlContent, "utf8");
//         // fs.writeFileSync(filePath, htmlContent, "utf8");
// // Save file with fs-extra
// await fs.writeFile(filePath, htmlContent, "utf8");
// console.log(`✅ File successfully saved: ${filePath}`);

//         res.json({ success: true, message: `File saved: ${filePath}` });
//     } catch (error) {
//         console.error("Error saving file:", error);
//         res.status(500).json({success: false, message: "Error saving file", error });
//     }
// });
/****************************************************************************************************************************** */

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
