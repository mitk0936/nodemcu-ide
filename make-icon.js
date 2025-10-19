import fs from "fs";
import path from "path";
import pngToIco from "png-to-ico";

async function buildIco() {
  const sizes = [16, 32, 48, 64, 128, 256]; // you can add 512, 1024 too, not required on Windows
  const files = sizes.map((size) =>
    path.join("build/icons", `${size}x${size}.png`)
  );

  try {
    const buf = await pngToIco(files);
    fs.writeFileSync("build/icon.ico", buf);
    console.log("✅ build/icon.ico generated successfully!");
  } catch (err) {
    console.error("❌ Failed to generate ICO:", err);
  }
}

buildIco();
