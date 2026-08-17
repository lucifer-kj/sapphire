import fs from "fs";
import path from "path";

function copyE2EImages() {
  const destDir = "C:\\Users\\USER\\.gemini\\antigravity\\brain\\502d090a-b07a-4022-901b-8153fc3f035e";

  const imgA = path.resolve(process.cwd(), "scratch", "e2e-concept-a.png");
  const imgB = path.resolve(process.cwd(), "scratch", "e2e-concept-b.png");

  if (fs.existsSync(imgA)) {
    fs.copyFileSync(imgA, path.join(destDir, "e2e-concept-a.png"));
    console.log("Copied e2e-concept-a.png to artifacts directory.");
  }

  if (fs.existsSync(imgB)) {
    fs.copyFileSync(imgB, path.join(destDir, "e2e-concept-b.png"));
    console.log("Copied e2e-concept-b.png to artifacts directory.");
  }
}

copyE2EImages();
