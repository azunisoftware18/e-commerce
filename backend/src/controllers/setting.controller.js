import fs from "fs";
import path from "path";
import prisma from "../db/db.js";
import { upload, deleteByKey, getSignedFileUrl } from "../utils/s3Service.js";

// ✅ CREATE / UPDATE (single setting)
export const upsertSetting = async (req, res) => {
  try {
    const logoFile = req.file;

    // Get existing settings to handle old logo deletion
    const existingSetting = await prisma.setting.findFirst();

    let logoData = undefined;

    if (logoFile) {
      try {
        // Delete old logo from S3 if exists
        if (existingSetting?.logoKey) {
          try {
            await deleteByKey(existingSetting.logoKey);
            console.log("Deleted old logo from S3:", existingSetting.logoKey);
          } catch (error) {
            console.error("Failed to delete old logo from S3:", error);
          }
        }

        // Upload new logo to S3
        const logoLocalPath = logoFile.path;
        
        // Verify file exists
        if (!fs.existsSync(logoLocalPath)) {
          throw new Error(`Logo file not found at path: ${logoLocalPath}`);
        }

        const s3Result = await upload(logoLocalPath);
        logoData = {
          logo: s3Result.url,
          logoKey: s3Result.key,
        };
        
        console.log("Logo uploaded to S3:", s3Result);
      } catch (error) {
        console.error("S3 Upload Error:", error);
        return res.status(500).json({ 
          error: "Failed to upload logo to S3. " + error.message 
        });
      }
    }

    const data = {
      companyName: req.body.companyName,
      phone: req.body.phone,
      email: req.body.email,
      address: req.body.address,

      ...(logoData && logoData),

      socialLinks: req.body.socialLinks
        ? JSON.parse(req.body.socialLinks)
        : undefined,
    };

    const setting = await prisma.setting.upsert({
      where: { id: "global-setting" },
      update: data,
      create: {
        id: "global-setting",
        ...data,
      },
    });

    // Generate signed URL for logo if it has a key
    if (setting.logoKey) {
      try {
        setting.logoSignedUrl = await getSignedFileUrl(setting.logoKey);
      } catch (error) {
        console.error("Error generating signed URL for logo:", error);
        setting.logoSignedUrl = setting.logo;
      }
    } else if (setting.logo) {
      setting.logoSignedUrl = setting.logo;
    }

    res.json(setting);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ GET (public)
export const getSetting = async (req, res) => {
  try {
    const setting = await prisma.setting.findFirst();
    
    if (!setting) {
      return res.json(null);
    }

    // Generate signed URL for logo if S3 key exists
    if (setting.logoKey) {
      try {
        setting.logoSignedUrl = await getSignedFileUrl(setting.logoKey);
      } catch (error) {
        console.error("Error generating signed URL for logo:", error);
        setting.logoSignedUrl = setting.logo;
      }
    } else if (setting.logo) {
      setting.logoSignedUrl = setting.logo;
    }

    res.json(setting);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ DELETE (admin)
export const deleteSetting = async (req, res) => {
  try {
    // Get setting to delete logo from S3
    const setting = await prisma.setting.findFirst();

    if (setting) {
      // Delete logo from S3 if exists
      if (setting.logoKey) {
        try {
          await deleteByKey(setting.logoKey);
          console.log("Deleted logo from S3:", setting.logoKey);
        } catch (error) {
          console.error("Failed to delete logo from S3:", error);
        }
      } else if (setting.logo) {
        // Fallback for local file
        const logoPath = path.join("public", setting.logo);
        if (fs.existsSync(logoPath)) {
          fs.unlinkSync(logoPath);
          console.log("Deleted local logo:", logoPath);
        }
      }
    }

    await prisma.setting.delete({
      where: { id: "global-setting" },
    });

    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};