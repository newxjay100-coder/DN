const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const apiDir = path.join(__dirname, "..", "src", "app", "api");
const tempDir = path.join(__dirname, "..", "src", "app", "_api_temp");

let renamed = false;
try {
  if (fs.existsSync(apiDir)) {
    fs.renameSync(apiDir, tempDir);
    renamed = true;
  }
  console.log("⚡ Building static export for Capacitor app...");
  execSync("npx cross-env CAPACITOR_BUILD=true next build", {
    stdio: "inherit",
    env: { ...process.env, CAPACITOR_BUILD: "true" },
  });
  console.log("✅ App static export completed successfully!");
} catch (err) {
  console.error("❌ App build error:", err);
  process.exit(1);
} finally {
  if (renamed && fs.existsSync(tempDir)) {
    fs.renameSync(tempDir, apiDir);
    console.log("🔄 Restored src/app/api directory for web server.");
  }
}
