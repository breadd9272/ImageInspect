import TimeTracker from "../components/time-tracker";
import CalculationSection from "../components/calculation-section";
import DataManagement from "../components/data-management";
import { MobileHeader } from "../components/mobile-header";
import { useQuery } from "@tanstack/react-query";
import { useDeviceInfo } from "@/hooks/use-mobile";
import type { TimeEntry, Settings } from "@shared/schema";

export default function Home() {
  const { data: timeEntries = [], isLoading: entriesLoading } = useQuery<TimeEntry[]>({
    queryKey: ['/api/time-entries']
  });

  const { data: settings, isLoading: settingsLoading } = useQuery<Settings>({
    queryKey: ['/api/settings']
  });
  
  const { isMobile } = useDeviceInfo();

  if (entriesLoading || settingsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-lg text-slate-600">Loading...</div>
      </div>
    );
  }

  const totals = timeEntries.reduce(
    (acc, entry) => ({
      nafees: acc.nafees + entry.nafees,
      waqas: acc.waqas + entry.waqas,
      cheetan: acc.cheetan + entry.cheetan,
      nadeem: acc.nadeem + entry.nadeem,
      totalMinutes: acc.totalMinutes + entry.totalMinutes,
    }),
    { nafees: 0, waqas: 0, cheetan: 0, nadeem: 0, totalMinutes: 0 }
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Mobile Header */}
      {isMobile ? (
        <MobileHeader 
          title="Tanker Calculation" 
          subtitle="Calculate tanker rates and volumes"
        />
      ) : (
        /* Desktop Header */
        <header className="bg-white shadow-sm border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-800">Tanker Calculation</h1>
                <p className="text-sm text-slate-600 mt-1">Calculate tanker volumes and per-minute rates</p>
              </div>
              <div className="flex space-x-3">
                <button 
                  data-testid="button-export"
                  className="inline-flex items-center px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                  Export
                </button>
              </div>
            </div>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${isMobile ? 'py-4' : 'py-8'}`}>
        <TimeTracker timeEntries={timeEntries} totals={totals} />
        
        <div className={`grid grid-cols-1 ${isMobile ? 'gap-4' : 'lg:grid-cols-2 gap-8'} mt-8`}>
          <CalculationSection 
            totals={totals} 
            settings={settings} 
          />
          <DataManagement />
        </div>

      </main>

      {/* Footer - Hidden on mobile to save space */}
      {!isMobile && (
        <footer className="bg-white border-t border-slate-200 mt-16 safe-area-bottom">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="text-center text-sm text-slate-500">
              <p>Tanker Calculation - Real-time calculations and data persistence</p>
              <p className="mt-1">
                Last saved: <span data-testid="text-last-saved" className="font-mono">{new Date().toLocaleString()}</span>
              </p>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
