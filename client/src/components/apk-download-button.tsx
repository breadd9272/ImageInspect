import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useDeviceInfo } from "@/hooks/use-mobile";
import { Download, Smartphone, AlertCircle, CheckCircle } from "lucide-react";

export function ApkDownloadButton() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { isMobile } = useDeviceInfo();

  const steps = [
    {
      title: "Install Android Studio",
      description: "Download and install Android Studio from developer.android.com",
      status: "pending" as const
    },
    {
      title: "Build Web App",
      description: "Run: npm run build",
      status: "pending" as const
    },
    {
      title: "Sync Mobile Assets",
      description: "Run: npx cap sync android",
      status: "pending" as const
    },
    {
      title: "Open in Android Studio",
      description: "Run: npx cap open android",
      status: "pending" as const
    },
    {
      title: "Build APK",
      description: "In Android Studio: Build → Generate Signed Bundle/APK",
      status: "pending" as const
    }
  ];

  const handleQuickBuild = () => {
    // This would trigger the automated build script
    alert("Quick build feature coming soon! Please follow the manual steps for now.");
  };

  const handleDownloadScript = () => {
    // Create and download the build script
    const scriptContent = `#!/bin/bash
echo "🚀 Building Time Tracker APK..."
npm run build
npx cap sync android
echo "✅ Build complete! Run 'npx cap open android' to open in Android Studio"
echo "📁 APK will be at: android/app/build/outputs/apk/release/app-release.apk"`;
    
    const blob = new Blob([scriptContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'build-apk.sh';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button
            data-testid="button-download-apk"
            className="inline-flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors"
          >
            <Smartphone className="w-4 h-4 mr-2" />
            {isMobile ? "Get APK" : "Download APK"}
          </Button>
        </DialogTrigger>
        
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Download className="w-5 h-5 text-emerald-600" />
              Generate APK App
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Quick Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button
                onClick={handleDownloadScript}
                variant="outline"
                className="flex items-center gap-2"
                data-testid="button-download-script"
              >
                <Download className="w-4 h-4" />
                Download Build Script
              </Button>
              
              <Button
                onClick={handleQuickBuild}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700"
                data-testid="button-quick-build"
              >
                <CheckCircle className="w-4 h-4" />
                Quick Build (Beta)
              </Button>
            </div>

            {/* Warning Notice */}
            <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-amber-800">Requirements:</p>
                <p className="text-amber-700">Android Studio, Java JDK 11+, and Android SDK are required to build APK files.</p>
              </div>
            </div>

            {/* Step-by-Step Guide */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Build Steps:</h3>
              <div className="space-y-3">
                {steps.map((step, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                    <div className="flex items-center justify-center w-6 h-6 bg-slate-100 text-slate-600 rounded-full text-sm font-medium">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-slate-900">{step.title}</h4>
                      <p className="text-sm text-slate-600 mt-1">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Final APK Location */}
            <div className="bg-slate-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-slate-900">APK Location:</p>
              <code className="text-xs text-slate-600 mt-1 block font-mono bg-white px-2 py-1 rounded border">
                android/app/build/outputs/apk/release/app-release.apk
              </code>
            </div>

            {/* Documentation Links */}
            <div className="flex justify-between items-center pt-4 border-t">
              <p className="text-xs text-slate-500">
                Need help? Check README-MOBILE.md for detailed instructions
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsDialogOpen(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}