import fs from "fs";
import path from "path";

function copyToArtifacts() {
  const srcPath = path.resolve(process.cwd(), "scratch", "cloudflare-flux-canva-post.png");
  const destDir = "C:\\Users\\USER\\.gemini\\antigravity\\brain\\502d090a-b07a-4022-901b-8153fc3f035e";
  const destPath = path.join(destDir, "cloudflare-flux-canva-post.png");

  if (fs.existsSync(srcPath)) {
    const data = fs.readFileSync(srcPath);
    fs.writeFileSync(destPath, data);
    console.log(`✅ Copied to ${destPath} (${data.length} bytes)`);
  } else {
    console.error(`Source file not found: ${srcPath}`);
  }
}

copyToArtifacts();
