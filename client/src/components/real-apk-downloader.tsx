import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Smartphone, Download, Loader2, CheckCircle } from "lucide-react";

export function RealApkDownloader() {
  const [isBuilding, setIsBuilding] = useState(false);
  const [buildStatus, setBuildStatus] = useState<string>("");
  
  const downloadRealApk = async () => {
    setIsBuilding(true);
    setBuildStatus("Building your APK...");
    
    try {
      // Step 1: Build the web app
      setBuildStatus("Building web application...");
      await fetch("/api/build-web", { method: "POST" });
      
      // Step 2: Generate APK
      setBuildStatus("Creating APK file...");
      const response = await fetch("/api/create-real-apk", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      
      if (response.ok) {
        setBuildStatus("APK ready! Starting download...");
        
        // Download the actual APK file
        const blob = await response.blob();
        if (blob.size > 0) {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = "TimeTracker.apk";
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
          
          setBuildStatus("APK downloaded successfully!");
          
          // Show installation instructions
          setTimeout(() => {
            alert(`✅ APK Downloaded Successfully!

📱 Installation Steps:
1. Open Downloads folder on your Android phone
2. Find "TimeTracker.apk" file
3. Tap to install (enable "Unknown sources" if needed)
4. App will appear in your app drawer

🔒 If blocked: Go to Settings → Security → Allow from Unknown Sources

Your Time Tracker app will work offline! 🎉`);
            setBuildStatus("");
          }, 1000);
        } else {
          throw new Error("APK file is empty");
        }
      } else {
        throw new Error("Failed to create APK");
      }
    } catch (error) {
      console.error("APK creation error:", error);
      setBuildStatus("Build failed - downloading setup guide...");
      
      // Fallback: Download setup instructions
      downloadSetupGuide();
      
      setTimeout(() => {
        setBuildStatus("");
      }, 2000);
    } finally {
      setIsBuilding(false);
    }
  };

  const downloadSetupGuide = () => {
    const guide = `🚀 Time Tracker APK Builder

Run these commands to build your APK:

# 1. Build web app
npm run build

# 2. Add Android platform (if not done)
npx cap add android

# 3. Sync web assets
npx cap sync android

# 4. Open in Android Studio
npx cap open android

# 5. In Android Studio:
Build → Generate Signed Bundle/APK → APK

📁 Your APK will be at:
android/app/build/outputs/apk/release/app-release.apk

📱 Install on phone:
1. Copy APK to phone
2. Enable "Unknown Sources" in Settings
3. Tap APK to install

🎉 Your Time Tracker will work offline!`;

    const blob = new Blob([guide], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'build-apk-guide.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-3">
      <Button
        onClick={downloadRealApk}
        disabled={isBuilding}
        data-testid="button-real-apk"
        className="w-full inline-flex items-center justify-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
      >
        {isBuilding ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Building...
          </>
        ) : (
          <>
            <Smartphone className="w-4 h-4 mr-2" />
            Download Real APK
          </>
        )}
      </Button>
      
      {buildStatus && (
        <div className="text-center">
          <div className="inline-flex items-center px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm">
            {isBuilding ? (
              <Loader2 className="w-3 h-3 mr-2 animate-spin" />
            ) : (
              <CheckCircle className="w-3 h-3 mr-2" />
            )}
            {buildStatus}
          </div>
        </div>
      )}
    </div>
  );
}