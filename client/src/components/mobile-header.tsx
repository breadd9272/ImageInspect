import { useDeviceInfo } from "@/hooks/use-mobile";
import { ApkDownloadButton } from "./apk-download-button";

interface MobileHeaderProps {
  title: string;
  subtitle?: string;
}

export function MobileHeader({ title, subtitle }: MobileHeaderProps) {
  const { isMobile } = useDeviceInfo();

  if (!isMobile) {
    return (
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
        {subtitle && <p className="text-slate-600 mt-1">{subtitle}</p>}
      </div>
    );
  }

  return (
    <div className="safe-area-top bg-emerald-600 text-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h1 className="text-lg font-semibold">{title}</h1>
          {subtitle && <p className="text-emerald-100 text-sm">{subtitle}</p>}
        </div>
        <div className="ml-4">
          <div className="[&>button]:bg-emerald-500 [&>button]:hover:bg-emerald-400 [&>button]:text-white [&>button]:border-emerald-400">
            <ApkDownloadButton />
          </div>
        </div>
      </div>
    </div>
  );
}