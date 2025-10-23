/**
 * !!! NOT TESTED !!!
 * Uploaded for reference
 */

/**
 * scripts/fake-sign.js
 *
 * Automatically generates a self-signed certificate (if not present)
 * and signs the built NodemcuIDE.exe with signtool.
 *
 * Works only on Windows and requires Windows SDK (for signtool.exe).
 */

import { execSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const EXE_PATH = path.resolve(__dirname, "../dist/win-unpacked/NodemcuIDE.exe");

// Ensure running on Windows
if (process.platform !== "win32") {
  console.log("🟡 Fake signing skipped: not running on Windows.");
  process.exit(0);
}

// Check if exe exists
if (!fs.existsSync(EXE_PATH)) {
  console.error(`❌ Executable not found at: ${EXE_PATH}`);
  process.exit(1);
}

console.log("🔏 Starting fake signing for NodemcuIDE.exe...");

try {
  // Try to get existing self-signed cert
  let thumbprint = "";
  const certList = execSync(
    "powershell -Command \"Get-ChildItem Cert:\\CurrentUser\\My | Where-Object { $_.Subject -eq 'CN=NodemcuIDE' } | Select-Object -First 1 -ExpandProperty Thumbprint\"",
    { encoding: "utf8" }
  ).trim();

  if (certList) {
    thumbprint = certList;
    console.log(`✅ Found existing cert with thumbprint: ${thumbprint}`);
  } else {
    console.log("⚙️ Creating new self-signed certificate...");
    execSync(
      "powershell -Command \"New-SelfSignedCertificate -Type CodeSigningCert -Subject 'CN=NodemcuIDE' -CertStoreLocation 'Cert:\\CurrentUser\\My'\"",
      { stdio: "inherit" }
    );

    thumbprint = execSync(
      "powershell -Command \"(Get-ChildItem Cert:\\CurrentUser\\My | Where-Object { $_.Subject -eq 'CN=NodemcuIDE' } | Select-Object -First 1).Thumbprint\"",
      { encoding: "utf8" }
    ).trim();

    if (!thumbprint) {
      throw new Error("Failed to retrieve thumbprint after creation.");
    }
    console.log(`✅ Created new cert with thumbprint: ${thumbprint}`);
  }

  console.log("🧾 Signing executable...");
  execSync(`signtool sign /fd SHA256 /a /sha1 ${thumbprint} "${EXE_PATH}"`, {
    stdio: "inherit",
  });

  console.log("🎉 Successfully fake-signed NodemcuIDE.exe");
} catch (err) {
  console.error("❌ Failed to sign executable:");
  console.error(err.message || err);
  process.exit(1);
}
