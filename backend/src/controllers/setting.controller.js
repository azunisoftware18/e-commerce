import prisma from "../db/db.js";

// ✅ CREATE / UPDATE (single setting)
export const upsertSetting = async (req, res) => {
  try {
    const logoFile = req.file;

    const logo = logoFile
      ? `/uploads/thumbnails/${logoFile.filename}` // 👈 multer config ke hisaab se
      : undefined;

    const data = {
      companyName: req.body.companyName,
      phone: req.body.phone,
      email: req.body.email,
      address: req.body.address,

      ...(logo && { logo }),

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

    res.json(setting);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ GET (public)
export const getSetting = async (req, res) => {
  try {
    const setting = await prisma.setting.findFirst();
    res.json(setting);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ DELETE (admin)
export const deleteSetting = async (req, res) => {
  try {
    await prisma.setting.delete({
      where: { id: "global-setting" },
    });

    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};