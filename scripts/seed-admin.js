const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

function loadEnvFile() {
  const fs = require("fs");
  const path = require("path");
  const envPath = path.join(process.cwd(), ".env.local");

  if (!fs.existsSync(envPath)) return;

  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
    const index = trimmed.indexOf("=");
    const key = trimmed.slice(0, index);
    const value = trimmed.slice(index + 1);
    process.env[key] ||= value;
  }
}

async function main() {
  loadEnvFile();

  const uri = process.env.MONGODB_URI;
  const email = process.env.ADMIN_EMAIL || "admin@roopshree.local";
  const password = process.env.ADMIN_PASSWORD || "Admin@12345";

  if (!uri) {
    throw new Error("MONGODB_URI is not configured");
  }

  await mongoose.connect(uri, { bufferCommands: false });

  const userSchema = new mongoose.Schema(
    {
      name: { type: String, required: true, trim: true },
      email: { type: String, required: true, unique: true, lowercase: true, trim: true },
      password: { type: String, required: true },
      role: { type: String, enum: ["user", "manager", "admin"], default: "user" },
      phone: { type: String, trim: true },
      emailVerified: { type: Boolean, default: true },
      addresses: Array
    },
    { timestamps: true }
  );

  const User = mongoose.models.User || mongoose.model("User", userSchema);
  const hashedPassword = await bcrypt.hash(password, 10);
  await User.findOneAndUpdate(
    { email },
    {
      name: "Roop Shree Admin",
      email,
      password: hashedPassword,
      role: "admin",
      emailVerified: true
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  await mongoose.disconnect();
  console.log(`Admin ready: ${email}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
