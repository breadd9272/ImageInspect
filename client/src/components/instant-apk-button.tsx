import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Smartphone, Download, Loader2 } from "lucide-react";

export function InstantApkButton() {
  const [isDownloading, setIsDownloading] = useState(false);
  
  const handleDirectDownload = async () => {
    setIsDownloading(true);
    
    try {
      // Create APK instantly without requiring Android Studio
      const response = await fetch("/api/generate-apk", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "time-tracker.apk";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } else {
        // Fallback: Download instruction file
        downloadInstructions();
      }
    } catch (error) {
      console.error("Download error:", error);
      downloadInstructions();
    } finally {
      setIsDownloading(false);
    }
  };

  const downloadInstructions = () => {
    const instructions = `📱 Time Tracker APK Setup Guide

🚀 Quick Setup (3 Steps):
1. Run: npm run build
2. Run: npx cap sync android  
3. Run: npx cap open android

📁 Your APK will be at: android/app/build/outputs/apk/release/

⚡ Auto Build Script:
#!/bin/bash
npm run build
npx cap sync android
echo "✅ Ready! Run: npx cap open android"

💡 Need Android Studio? Download from: developer.android.com

🔧 Troubleshooting:
- Install Android SDK
- Accept SDK licenses  
- Set ANDROID_HOME path

Your Time Tracker app will work offline as a native Android app! 📲`;
    
    const blob = new Blob([instructions], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'apk-setup-guide.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Button
      onClick={handleDirectDownload}
      disabled={isDownloading}
      data-testid="button-instant-apk"
      className="inline-flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
    >
      {isDownloading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Building APK...
        </>
      ) : (
        <>
          <Smartphone className="w-4 h-4 mr-2" />
          Download APK
        </>
      )}
    </Button>
  );
}