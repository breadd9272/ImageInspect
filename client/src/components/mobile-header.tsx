import { useDeviceInfo } from "@/hooks/use-mobile";

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
        <div>
          <h1 className="text-lg font-semibold">{title}</h1>
          {subtitle && <p className="text-emerald-100 text-sm">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
}