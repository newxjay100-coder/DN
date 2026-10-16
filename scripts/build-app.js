const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const apiDir = path.join(__dirname, "..", "src", "app", "api");

function getRouteFiles(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of list) {
    const full = path.join(dir, item.name);
    if (item.isDirectory()) {
      results = results.concat(getRouteFiles(full));
    } else if (item.name === "route.ts" || item.name === "route.js") {
      results.push(full);
    }
  }
  return results;
}

const renamedFiles = [];
try {
  const routes = getRouteFiles(apiDir);
  for (const r of routes) {
    const bak = r + ".bak";
    fs.renameSync(r, bak);
    renamedFiles.push({ original: r, backup: bak });
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
  for (const item of renamedFiles) {
    if (fs.existsSync(item.backup)) {
      try {
        fs.renameSync(item.backup, item.original);
      } catch (restoreErr) {
        console.warn("Failed to restore", item.backup, restoreErr);
      }
    }
  }
  console.log("🔄 Restored all API route files for web server.");
}
