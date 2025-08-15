import { Router } from "express";
import { exec } from "child_process";
import { promises as fs } from "fs";
import path from "path";

const router = Router();

// Build and serve APK directly
router.post("/api/build-apk", async (req, res) => {
  try {
    console.log("🚀 Starting APK build process...");
    
    // Step 1: Build web app
    await executeCommand("npm run build");
    console.log("✅ Web app built successfully");

    // Step 2: Sync capacitor
    await executeCommand("npx cap sync android");
    console.log("✅ Capacitor sync completed");

    // Step 3: Build APK using gradle
    const apkPath = await buildApk();
    
    if (apkPath && await fileExists(apkPath)) {
      console.log("✅ APK built successfully at:", apkPath);
      
      // Send APK file as download
      res.download(apkPath, "time-tracker.apk", (err) => {
        if (err) {
          console.error("Download error:", err);
          res.status(500).json({ error: "Failed to download APK" });
        } else {
          console.log("📱 APK downloaded successfully");
        }
      });
    } else {
      throw new Error("APK file not found after build");
    }
    
  } catch (error) {
    console.error("❌ APK build failed:", error);
    res.status(500).json({ 
      error: "APK build failed", 
      details: error instanceof Error ? error.message : String(error),
      instructions: "Please install Android Studio and Android SDK first"
    });
  }
});

// Check if APK build is possible
router.get("/api/apk-status", async (req, res) => {
  try {
    // Check if Android SDK is available
    await executeCommand("which android", { timeout: 5000 });
    res.json({ canBuild: true, message: "Android SDK found" });
  } catch (error) {
    res.json({ 
      canBuild: false, 
      message: "Android Studio/SDK not found. Manual build required.",
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// Helper functions
function executeCommand(command: string, options: { timeout?: number } = {}): Promise<string> {
  return new Promise((resolve, reject) => {
    const childProcess = exec(command, { 
      timeout: options.timeout || 300000, // 5 minutes default
      cwd: path.resolve(process.cwd())
    });
    
    let stdout = "";
    let stderr = "";
    
    childProcess.stdout?.on("data", (data: any) => {
      stdout += data;
      console.log(data.toString().trim());
    });
    
    childProcess.stderr?.on("data", (data: any) => {
      stderr += data;
      console.error(data.toString().trim());
    });
    
    childProcess.on("close", (code: number | null) => {
      if (code === 0) {
        resolve(stdout);
      } else {
        reject(new Error(`Command failed with code ${code}: ${stderr || stdout}`));
      }
    });
    
    childProcess.on("error", reject);
  });
}

async function buildApk(): Promise<string | null> {
  const androidDir = path.resolve(process.cwd(), "android");
  
  if (!await fileExists(androidDir)) {
    throw new Error("Android project not found. Run 'npx cap add android' first.");
  }
  
  // Try building APK with gradle
  try {
    await executeCommand("cd android && ./gradlew assembleRelease");
    
    // Look for the generated APK
    const apkPaths = [
      "android/app/build/outputs/apk/release/app-release.apk",
      "android/app/build/outputs/apk/release/app-release-unsigned.apk"
    ];
    
    for (const apkPath of apkPaths) {
      const fullPath = path.resolve(process.cwd(), apkPath);
      if (await fileExists(fullPath)) {
        return fullPath;
      }
    }
    
    throw new Error("APK file not found after build");
  } catch (error) {
    console.error("Gradle build failed:", error);
    throw error;
  }
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

export default router;