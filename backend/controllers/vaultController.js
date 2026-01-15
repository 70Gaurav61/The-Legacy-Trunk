import SecureVault from "../models/SecureVault.js";

/* Create personal vault */
export const createVault = async (req, res) => {
  try {
    const { password, vaultName } = req.body;

    const exists = await SecureVault.findOne({ owner: req.user._id });
    if (exists)
      return res.status(400).json({ message: "Vault already exists" });

    const vault = await SecureVault.create({
      owner: req.user._id,
      password,
      vaultName
    });

    res.status(201).json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* Get vault metadata (NO file URLs) */
export const getVault = async (req, res) => {
  try {
    const vault = await SecureVault.findOne({ owner: req.user._id })
      .select("-password -files.url");

    res.json(vault);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* Unlock vault */
export const unlockVault = async (req, res) => {
  try {
    const { password } = req.body;

    const vault = await SecureVault.findOne({ owner: req.user._id });
    if (!vault) return res.status(404).json({ message: "Vault not found" });

    const valid = await vault.verifyPassword(password);
    if (!valid)
      return res.status(401).json({ message: "Incorrect password" });

    vault.lastUnlockedAt = new Date();
    await vault.save();

    res.json({
      success: true,
      files: vault.files
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* Upload file to vault */
export const uploadVaultFile = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "File missing" });

    const vault = await SecureVault.findOne({ owner: req.user._id });
    if (!vault) return res.status(404).json({ message: "Vault not found" });

    vault.files.push({
      url: req.file.location,
      mimeType: req.file.mimetype,
      size: req.file.size,
      originalName: req.file.originalname
    });

    await vault.save();
    res.status(201).json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
