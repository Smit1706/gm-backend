import "dotenv/config";
import express, { type NextFunction, type Request, type Response } from "express";
import path from "path";
import { authRouter } from "./routes/auth.route.js";
import { userRouter } from "./routes/user.route.js";
import { sheetRouter } from "./routes/sheet.route.js";
import { authMiddleware } from "./middleware/auth.middleware.js";
import { client } from "./config/db.js";
import { sendMail } from "./config/mail.js";


//deployment CI/CD
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded images statically
const __dirname = path.resolve();

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/assets", express.static(path.join(__dirname, "assets")));

app.get("/", (req, res) => {
  return res.status(200).json({
    message: "hello"
  });
});

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/sheet", sheetRouter);

// Backup endpoint - syncs sheets and entries from frontend
app.post("/api/v1/backup", authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { sheets, entries } = req.body;

    // Upsert sheets
    if (sheets && Array.isArray(sheets)) {
      for (const sheet of sheets) {
        await client.sheets.upsert({
          where: { sheetId: sheet.sheetId },
          create: {
            sheetId: sheet.sheetId,
            userId: userId,
            sheetName: sheet.sheetName,
            customerName: sheet.customerName,
            vehicleNo: sheet.vehicleNo || null,
            lotNo: sheet.lotNo || null,
            image: sheet.image || null,
            date: new Date(sheet.date),
            sheetType: sheet.sheetType,
            baseUnit: sheet.baseUnit || 'INCH',
            areaUnit: sheet.areaUnit || 'FEET',
            createdAt: new Date(sheet.createdAt),
            updatedAt: new Date(sheet.updatedAt),
          },
          update: {
            sheetName: sheet.sheetName,
            customerName: sheet.customerName,
            vehicleNo: sheet.vehicleNo || null,
            lotNo: sheet.lotNo || null,
            image: sheet.image || null,
            date: new Date(sheet.date),
            sheetType: sheet.sheetType,
            baseUnit: sheet.baseUnit || 'INCH',
            areaUnit: sheet.areaUnit || 'FEET',
            updatedAt: new Date(sheet.updatedAt),
          },
        });

        await client.sheetEntries.deleteMany({
          where: { sheetId: sheet.sheetId }
        });
      }
    }

    // Upsert entries
    if (entries && Array.isArray(entries)) {
      for (const entry of entries) {
        await client.sheetEntries.upsert({
          where: { entryId: entry.entryId },
          create: {
            entryId: entry.entryId,
            sheetId: entry.sheetId,
            len: entry.len,
            width: entry.width,
            quantity: entry.quantity,
            createdAt: new Date(entry.createdAt),
            updatedAt: new Date(entry.updatedAt),
          },
          update: {
            len: entry.len,
            width: entry.width,
            quantity: entry.quantity,
            updatedAt: new Date(entry.updatedAt),
          },
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: "Backup successful",
      sheetsCount: sheets?.length || 0,
      entriesCount: entries?.length || 0,
    });

  } catch (error: any) {
    console.error('❌ Backup error:', error);

    return res.status(500).json({
      success: false,
      error: error.message || "Backup failed"
    });
  }
});

app.get("/api/v1/get-backup", authMiddleware, async (req, res) => {

  try {

    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const userData = await client.user.findUnique({
      where: { id: userId },
      select: {
        companyName: true,
        companyAddress: true,
        mobileNumber: true,
        email: true,
        city: true,
        state: true,
        pinCode: true,
        country: true,
        gstNumber: true,
      }
    })

    if (!userData) {
      return res.status(404).json({ error: "User not found" });
    }

    const sheets = await client.sheets.findMany({
      where: { userId },
    });

    const entries = await client.sheetEntries.findMany({
      where: { sheetId: { in: sheets.map(sheet => sheet.sheetId) } },
    });

    return res.status(200).json({
      success: true,
      userData,
      sheets,
      entries
    });

  }
  catch (error: any) {
    console.error('❌ Backup error:', error);

    return res.status(500).json({
      success: false,
      error: error.message || "Backup failed"
    });
  }

});

// Contact form endpoint
app.post("/api/v1/contact", authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // Get user details for email
    const user = await client.user.findUnique({
      where: { id: userId },
      select: { email: true, companyName: true }
    });

    if (!user || !user.email) {
      return res.status(400).json({ error: "User email not found" });
    }

    // Save issue details to database
    const issueDetail = await client.issueDetails.create({
      data: {
        userId,
        message
      }
    });

    console.log('✅ Issue saved to database:', {
      id: issueDetail.id,
      userId,
      createdAt: issueDetail.createdAt
    });

    // Send confirmation email to user
    const userEmailSubject = "We received your message - Granite Marble Measure";
    const userEmailText = `Dear ${user.companyName || "User"},

Thank you for contacting us. We have received your message and our team will get back to you soon.

Your message:
"${message}"

Issue Reference ID: ${issueDetail.id}

Best regards,
Granite Marble Measure Support Team`;

    await sendMail(user.email, userEmailSubject, userEmailText);

    // Send notification email to admin
    const adminEmail = process.env.MAIL_USER || "gmmeasure@gmail.com";
    const adminEmailSubject = `New Contact Form Submission - Issue #${issueDetail.id}`;
    const adminEmailText = `New contact form submission received:

User Details:
- Email: ${user.email}
- Company: ${user.companyName || "N/A"}
- User ID: ${userId}

Message:
"${message}"

Issue ID: ${issueDetail.id}
Submitted at: ${issueDetail.createdAt.toISOString()}`;

    await sendMail(adminEmail, adminEmailSubject, adminEmailText);

    console.log('✅ Emails sent to user and admin');

    return res.status(200).json({
      success: true,
      message: "Your message has been received. We'll get back to you soon!",
      issueId: issueDetail.id
    });

  } catch (error) {
    console.error("Contact form error:", error);
    return res.status(500).json({ error: "Failed to submit contact form" });
  }
});

app.get("/api/v1/health", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Server is running"
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  // if (err instanceof MulterError) {
  //   return res.status(400).json({ error: err.message });
  // }

  // if (err.message === "Invalid file type. Only images allowed.") {
  //   return res.status(400).json({ error: err.message });
  // }
  next(err);
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});