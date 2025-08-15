import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Settings } from "@shared/schema";

interface CalculationSectionProps {
  totals: {
    nafees: number;
    waqas: number;
    cheetan: number;
    nadeem: number;
    totalMinutes: number;
  };
  settings?: Settings;
}

export default function CalculationSection({ totals, settings }: CalculationSectionProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const updateSettingsMutation = useMutation({
    mutationFn: async (baseAmount: number) => {
      const response = await apiRequest("PUT", "/api/settings", { baseAmount });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({ title: "Base amount updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update base amount", variant: "destructive" });
    },
  });

  const baseAmount = settings?.baseAmount || 10000;
  
  // Calculate per-minute rates
  const rates = {
    nafees: totals.nafees > 0 ? Math.round(baseAmount / totals.nafees) : 0,
    waqas: totals.waqas > 0 ? Math.round(baseAmount / totals.waqas) : 0,
    cheetan: totals.cheetan > 0 ? Math.round(baseAmount / totals.cheetan) : 0,
    nadeem: totals.nadeem > 0 ? Math.round(baseAmount / totals.nadeem) : 0,
  };

  // Final calculation
  const finalRate = totals.totalMinutes > 0 ? (baseAmount / totals.totalMinutes).toFixed(3) : "0.000";
  const totalHours = (totals.totalMinutes / 60).toFixed(1);
  const hourlyRate = totals.totalMinutes > 0 ? Math.round((baseAmount / totals.totalMinutes) * 60) : 0;

  const handleBaseAmountChange = (value: string) => {
    const amount = parseFloat(value);
    if (!isNaN(amount) && amount > 0) {
      updateSettingsMutation.mutate(amount);
    }
  };

  return (
    <>
      {/* Per-Minute Rates */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
          </svg>
          Per-Minute Rates
        </h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="calculation-highlight p-4 rounded-lg border border-blue-200">
            <div className="text-xs font-medium text-slate-600 uppercase tracking-wider mb-1">Nafees</div>
            <div data-testid="text-rate-nafees" className="text-2xl font-bold text-slate-800 font-mono">
              {rates.nafees.toLocaleString()}
            </div>
            <div className="text-xs text-slate-500 mt-1">per minute</div>
          </div>
          
          <div className="calculation-highlight p-4 rounded-lg border border-blue-200">
            <div className="text-xs font-medium text-slate-600 uppercase tracking-wider mb-1">Waqas</div>
            <div data-testid="text-rate-waqas" className="text-2xl font-bold text-slate-800 font-mono">
              {rates.waqas.toLocaleString()}
            </div>
            <div className="text-xs text-slate-500 mt-1">per minute</div>
          </div>
          
          <div className="calculation-highlight p-4 rounded-lg border border-blue-200">
            <div className="text-xs font-medium text-slate-600 uppercase tracking-wider mb-1">Cheetan</div>
            <div data-testid="text-rate-cheetan" className="text-2xl font-bold text-slate-800 font-mono">
              {rates.cheetan.toLocaleString()}
            </div>
            <div className="text-xs text-slate-500 mt-1">per minute</div>
          </div>
          
          <div className="calculation-highlight p-4 rounded-lg border border-blue-200">
            <div className="text-xs font-medium text-slate-600 uppercase tracking-wider mb-1">Nadeem</div>
            <div data-testid="text-rate-nadeem" className="text-2xl font-bold text-slate-800 font-mono">
              {rates.nadeem.toLocaleString()}
            </div>
            <div className="text-xs text-slate-500 mt-1">per minute</div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-slate-50 rounded-lg">
          <label className="block text-sm font-medium text-slate-700 mb-2">Base Amount for Calculations</label>
          <input
            data-testid="input-base-amount"
            type="number"
            min="0"
            step="100"
            value={baseAmount}
            onChange={(e) => handleBaseAmountChange(e.target.value)}
            disabled={updateSettingsMutation.isPending}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg font-mono text-center disabled:opacity-50"
          />
        </div>
      </div>

      {/* Final Calculation */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
          </svg>
          Final Calculation
        </h3>
        
        <div className="text-center">
          <div className="bg-gradient-to-r from-emerald-50 to-blue-50 p-8 rounded-xl border-2 border-emerald-200">
            <div className="text-sm text-slate-600 mb-2">Final Rate Calculation</div>
            <div className="text-4xl font-bold text-slate-800 font-mono mb-2">
              <span data-testid="text-base-amount">{baseAmount.toLocaleString()}</span> ÷ <span data-testid="text-division-total">{totals.totalMinutes}</span>
            </div>
            <div className="text-sm text-slate-500 mb-4">=</div>
            <div data-testid="text-final-rate" className="text-5xl font-bold text-emerald-600 font-mono">
              {finalRate}
            </div>
            <div className="text-sm text-slate-600 mt-2">per minute</div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 text-center">
          <div className="p-3 bg-slate-50 rounded-lg">
            <div className="text-xs font-medium text-slate-600 uppercase mb-1">Total Hours</div>
            <div data-testid="text-total-hours" className="text-lg font-bold text-slate-800 font-mono">
              {totalHours}
            </div>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg">
            <div className="text-xs font-medium text-slate-600 uppercase mb-1">Hourly Rate</div>
            <div data-testid="text-hourly-rate" className="text-lg font-bold text-slate-800 font-mono">
              {hourlyRate.toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
