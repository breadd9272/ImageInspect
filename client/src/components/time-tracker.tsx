import { useState, useCallback, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useDeviceInfo } from "@/hooks/use-mobile";
import type { TimeEntry, InsertTimeEntry } from "@shared/schema";

interface TimeTrackerProps {
  timeEntries: TimeEntry[];
  totals: {
    nafees: number;
    waqas: number;
    cheetan: number;
    nadeem: number;
    totalMinutes: number;
  };
}

export default function TimeTracker({ timeEntries, totals }: TimeTrackerProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { isMobile } = useDeviceInfo();
  const [editingId, setEditingId] = useState<string | null>(null);
  const debounceTimeouts = useRef<{ [key: string]: NodeJS.Timeout }>({});

  const createMutation = useMutation({
    mutationFn: async (data: InsertTimeEntry) => {
      const response = await apiRequest("POST", "/api/time-entries", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/time-entries"] });
      toast({ title: "Entry created successfully" });
    },
    onError: () => {
      toast({ title: "Failed to create entry", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertTimeEntry> }) => {
      const response = await apiRequest("PUT", `/api/time-entries/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/time-entries"] });
      toast({ title: "Entry updated successfully" });
      setEditingId(null);
    },
    onError: () => {
      toast({ title: "Failed to update entry", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/time-entries/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/time-entries"] });
      toast({ title: "Entry deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete entry", variant: "destructive" });
    },
  });

  const handleAddRow = () => {
    const today = new Date().toISOString().split('T')[0];
    createMutation.mutate({
      date: today,
      nafees: 0,
      waqas: 0,
      cheetan: 0,
      nadeem: 0,
    });
  };

  const handleUpdateEntry = useCallback((id: string, field: keyof InsertTimeEntry, value: string | number) => {
    const key = `${id}-${field}`;
    
    // Clear existing timeout
    if (debounceTimeouts.current[key]) {
      clearTimeout(debounceTimeouts.current[key]);
    }
    
    // Set new timeout for debounced update
    debounceTimeouts.current[key] = setTimeout(() => {
      updateMutation.mutate({
        id,
        data: { [field]: value },
      });
      delete debounceTimeouts.current[key];
    }, 500); // 500ms debounce
  }, [updateMutation]);

  const handleDeleteEntry = (id: string) => {
    if (confirm("Are you sure you want to delete this entry?")) {
      deleteMutation.mutate(id);
    }
  };

  // Mobile card layout
  const MobileView = () => (
    <div id="time-tracker-container" className="bg-white rounded-xl shadow-sm border border-slate-200">
      {/* Mobile Header */}
      <div className="px-4 py-3 border-b border-slate-200 bg-slate-50">
        <div className="flex justify-between items-center">
          <h2 className="text-base font-semibold text-slate-800">Time Entries</h2>
          <button
            data-testid="button-add-row"
            onClick={handleAddRow}
            disabled={createMutation.isPending}
            className="inline-flex items-center px-3 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            Add
          </button>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="divide-y divide-slate-200">
        {timeEntries.map((entry) => (
          <div key={entry.id} className="p-4 space-y-3">
            {/* Date and Delete Button Row */}
            <div className="flex justify-between items-center">
              <div className="flex-1">
                <label className="text-xs font-medium text-slate-600 uppercase tracking-wide">Date</label>
                <input
                  data-testid={`input-date-${entry.id}`}
                  type="date"
                  value={entry.date}
                  onChange={(e) => handleUpdateEntry(entry.id, 'date', e.target.value)}
                  className="block w-full mt-1 text-sm border border-slate-300 rounded-md px-3 py-2 bg-white focus:border-emerald-500 focus:ring-emerald-500"
                />
              </div>
              <button
                data-testid={`button-delete-${entry.id}`}
                onClick={() => handleDeleteEntry(entry.id)}
                disabled={deleteMutation.isPending}
                className="ml-3 p-2 text-red-500 hover:text-red-700 transition-colors disabled:opacity-50"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
              </button>
            </div>

            {/* Person Inputs Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-600 uppercase tracking-wide">Nafees</label>
                <input
                  data-testid={`input-nafees-${entry.id}`}
                  type="number"
                  min="0"
                  value={entry.nafees}
                  onChange={(e) => handleUpdateEntry(entry.id, 'nafees', parseInt(e.target.value) || 0)}
                  className="block w-full mt-1 text-sm border border-slate-300 rounded-md px-3 py-2 bg-white focus:border-emerald-500 focus:ring-emerald-500 text-center font-mono"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 uppercase tracking-wide">Waqas</label>
                <input
                  data-testid={`input-waqas-${entry.id}`}
                  type="number"
                  min="0"
                  value={entry.waqas}
                  onChange={(e) => handleUpdateEntry(entry.id, 'waqas', parseInt(e.target.value) || 0)}
                  className="block w-full mt-1 text-sm border border-slate-300 rounded-md px-3 py-2 bg-white focus:border-emerald-500 focus:ring-emerald-500 text-center font-mono"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 uppercase tracking-wide">Cheetan</label>
                <input
                  data-testid={`input-cheetan-${entry.id}`}
                  type="number"
                  min="0"
                  value={entry.cheetan}
                  onChange={(e) => handleUpdateEntry(entry.id, 'cheetan', parseInt(e.target.value) || 0)}
                  className="block w-full mt-1 text-sm border border-slate-300 rounded-md px-3 py-2 bg-white focus:border-emerald-500 focus:ring-emerald-500 text-center font-mono"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 uppercase tracking-wide">Nadeem</label>
                <input
                  data-testid={`input-nadeem-${entry.id}`}
                  type="number"
                  min="0"
                  value={entry.nadeem}
                  onChange={(e) => handleUpdateEntry(entry.id, 'nadeem', parseInt(e.target.value) || 0)}
                  className="block w-full mt-1 text-sm border border-slate-300 rounded-md px-3 py-2 bg-white focus:border-emerald-500 focus:ring-emerald-500 text-center font-mono"
                />
              </div>
            </div>

            {/* Total Minutes */}
            <div className="text-center">
              <label className="text-xs font-medium text-slate-600 uppercase tracking-wide">Total Minutes</label>
              <div className="mt-1">
                <span 
                  data-testid={`text-total-${entry.id}`}
                  className="inline-block text-lg font-bold text-emerald-800 font-mono bg-emerald-100 px-4 py-2 rounded-lg"
                >
                  {entry.totalMinutes}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Mobile Totals */}
      <div className="bg-emerald-50 border-t-2 border-emerald-200 p-4">
        <h3 className="text-sm font-bold text-emerald-800 uppercase mb-3 text-center">Totals</h3>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="text-center">
            <div className="text-xs text-emerald-700 font-medium">Nafees</div>
            <span data-testid="text-total-nafees" className="text-sm font-bold text-emerald-800 font-mono">
              {totals.nafees}
            </span>
          </div>
          <div className="text-center">
            <div className="text-xs text-emerald-700 font-medium">Waqas</div>
            <span data-testid="text-total-waqas" className="text-sm font-bold text-emerald-800 font-mono">
              {totals.waqas}
            </span>
          </div>
          <div className="text-center">
            <div className="text-xs text-emerald-700 font-medium">Cheetan</div>
            <span data-testid="text-total-cheetan" className="text-sm font-bold text-emerald-800 font-mono">
              {totals.cheetan}
            </span>
          </div>
          <div className="text-center">
            <div className="text-xs text-emerald-700 font-medium">Nadeem</div>
            <span data-testid="text-total-nadeem" className="text-sm font-bold text-emerald-800 font-mono">
              {totals.nadeem}
            </span>
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs text-emerald-700 font-medium mb-1">Total Minutes</div>
          <span data-testid="text-total-minutes" className="inline-block text-lg font-bold text-emerald-800 font-mono bg-emerald-100 px-4 py-2 rounded-lg">
            {totals.totalMinutes}
          </span>
        </div>
      </div>
    </div>
  );

  // Desktop table layout
  const DesktopView = () => (
    <div id="time-tracker-container" className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Table Controls */}
      <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-slate-800">Time Entry Table</h2>
          <button
            data-testid="button-add-row"
            onClick={handleAddRow}
            disabled={createMutation.isPending}
            className="inline-flex items-center px-3 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            Add Row
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="overflow-x-auto">
        <table className="w-full data-table">
          <thead className="bg-slate-100 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider w-32">Date</th>
              <th className="px-4 py-4 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider w-24">Nafees</th>
              <th className="px-4 py-4 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider w-24">Waqas</th>
              <th className="px-4 py-4 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider w-24">Cheetan</th>
              <th className="px-4 py-4 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider w-24">Nadeem</th>
              <th className="px-4 py-4 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider w-28">T.Minutes</th>
              <th className="px-4 py-4 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider w-16">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {timeEntries.map((entry) => (
              <tr key={entry.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <input
                    data-testid={`input-date-${entry.id}`}
                    type="date"
                    value={entry.date}
                    onChange={(e) => handleUpdateEntry(entry.id, 'date', e.target.value)}
                    className="data-table-input text-sm text-slate-700 font-mono"
                  />
                </td>
                <td className="px-4 py-4">
                  <input
                    data-testid={`input-nafees-${entry.id}`}
                    type="number"
                    min="0"
                    value={entry.nafees}
                    onChange={(e) => handleUpdateEntry(entry.id, 'nafees', parseInt(e.target.value) || 0)}
                    className="data-table-input text-sm text-slate-700 font-mono"
                  />
                </td>
                <td className="px-4 py-4">
                  <input
                    data-testid={`input-waqas-${entry.id}`}
                    type="number"
                    min="0"
                    value={entry.waqas}
                    onChange={(e) => handleUpdateEntry(entry.id, 'waqas', parseInt(e.target.value) || 0)}
                    className="data-table-input text-sm text-slate-700 font-mono"
                  />
                </td>
                <td className="px-4 py-4">
                  <input
                    data-testid={`input-cheetan-${entry.id}`}
                    type="number"
                    min="0"
                    value={entry.cheetan}
                    onChange={(e) => handleUpdateEntry(entry.id, 'cheetan', parseInt(e.target.value) || 0)}
                    className="data-table-input text-sm text-slate-700 font-mono"
                  />
                </td>
                <td className="px-4 py-4">
                  <input
                    data-testid={`input-nadeem-${entry.id}`}
                    type="number"
                    min="0"
                    value={entry.nadeem}
                    onChange={(e) => handleUpdateEntry(entry.id, 'nadeem', parseInt(e.target.value) || 0)}
                    className="data-table-input text-sm text-slate-700 font-mono"
                  />
                </td>
                <td className="px-4 py-4">
                  <span 
                    data-testid={`text-total-${entry.id}`}
                    className="text-sm font-semibold text-slate-800 font-mono bg-slate-100 px-2 py-1 rounded"
                  >
                    {entry.totalMinutes}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <button
                    data-testid={`button-delete-${entry.id}`}
                    onClick={() => handleDeleteEntry(entry.id)}
                    disabled={deleteMutation.isPending}
                    className="text-red-500 hover:text-red-700 transition-colors disabled:opacity-50"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          
          {/* Totals Row */}
          <tfoot className="bg-emerald-50 border-t-2 border-emerald-200">
            <tr>
              <td className="px-6 py-4">
                <span className="text-sm font-bold text-emerald-800 uppercase">Total</span>
              </td>
              <td className="px-4 py-4 text-center">
                <span data-testid="text-total-nafees" className="text-sm font-bold text-emerald-800 font-mono">
                  {totals.nafees}
                </span>
              </td>
              <td className="px-4 py-4 text-center">
                <span data-testid="text-total-waqas" className="text-sm font-bold text-emerald-800 font-mono">
                  {totals.waqas}
                </span>
              </td>
              <td className="px-4 py-4 text-center">
                <span data-testid="text-total-cheetan" className="text-sm font-bold text-emerald-800 font-mono">
                  {totals.cheetan}
                </span>
              </td>
              <td className="px-4 py-4 text-center">
                <span data-testid="text-total-nadeem" className="text-sm font-bold text-emerald-800 font-mono">
                  {totals.nadeem}
                </span>
              </td>
              <td className="px-4 py-4 text-center">
                <span data-testid="text-total-minutes" className="text-sm font-bold text-emerald-800 font-mono bg-emerald-100 px-3 py-1 rounded-lg">
                  {totals.totalMinutes}
                </span>
              </td>
              <td className="px-4 py-4"></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );

  return isMobile ? <MobileView /> : <DesktopView />;
}
