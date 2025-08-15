import { useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import html2canvas from "html2canvas";
import type { TimeEntry } from "@shared/schema";

export default function DataManagement() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: timeEntries = [] } = useQuery<TimeEntry[]>({
    queryKey: ['/api/time-entries']
  });

  const handleLoadData = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        let data;

        if (file.name.endsWith('.json')) {
          data = JSON.parse(content);
        } else if (file.name.endsWith('.csv')) {
          // Basic CSV parsing
          const lines = content.split('\n');
          const headers = lines[0].split(',');
          data = lines.slice(1).map(line => {
            const values = line.split(',');
            const entry: any = {};
            headers.forEach((header, index) => {
              entry[header.trim()] = values[index]?.trim();
            });
            return entry;
          });
        } else {
          throw new Error('Unsupported file format');
        }

        // Validate and import data
        console.log('Loaded data:', data);
        toast({ title: "Data loaded successfully" });
      } catch (error) {
        toast({ 
          title: "Failed to load data", 
          description: "Please check the file format and try again",
          variant: "destructive" 
        });
      }
    };

    reader.readAsText(file);
    event.target.value = '';
  };

  const handleSaveLocal = () => {
    try {
      const dataToSave = {
        timeEntries,
        exportDate: new Date().toISOString(),
        version: '1.0'
      };
      
      localStorage.setItem('timeTrackingData', JSON.stringify(dataToSave));
      toast({ title: "Data saved to local storage successfully" });
    } catch (error) {
      toast({ 
        title: "Failed to save data locally", 
        variant: "destructive" 
      });
    }
  };

  const handlePrintReport = () => {
    const printContent = generatePrintableReport();
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleDownloadPNG = async () => {
    try {
      // Find the complete time tracker container by ID
      const tableContainer = document.getElementById('time-tracker-container');
      if (!tableContainer) {
        toast({ 
          title: "Error", 
          description: "Time tracker table not found for capture", 
          variant: "destructive" 
        });
        return;
      }

      // Add a small delay to ensure the UI is settled
      await new Promise(resolve => setTimeout(resolve, 100));

      // Capture the complete table container as canvas
      const canvas = await html2canvas(tableContainer, {
        backgroundColor: '#ffffff',
        scale: 2, // Higher quality
        useCORS: true,
        logging: false,
        allowTaint: true,
        width: tableContainer.scrollWidth,
        height: tableContainer.scrollHeight,
        scrollX: 0,
        scrollY: 0
      });

      // Convert to PNG and download
      const link = document.createElement('a');
      link.download = `time-tracker-${new Date().toISOString().split('T')[0]}.png`;
      link.href = canvas.toDataURL('image/png', 0.9);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({ title: "PNG downloaded successfully" });
    } catch (error) {
      console.error('PNG download error:', error);
      toast({ 
        title: "Failed to download PNG", 
        description: "Please try again. Error: " + (error instanceof Error ? error.message : 'Unknown error'),
        variant: "destructive" 
      });
    }
  };

  const generatePrintableReport = () => {
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

    // Calculate prices using final per-minute rate
    const baseAmount = 10000; // Default base amount
    const finalPerMinuteRate = totals.totalMinutes > 0 ? baseAmount / totals.totalMinutes : 0;
    const prices = {
      nafees: Math.round(finalPerMinuteRate * totals.nafees),
      waqas: Math.round(finalPerMinuteRate * totals.waqas),
      cheetan: Math.round(finalPerMinuteRate * totals.cheetan),
      nadeem: Math.round(finalPerMinuteRate * totals.nadeem),
    };

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Time Tracking Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: center; }
            th { background-color: #f5f5f5; }
            .totals { background-color: #e8f5e8; font-weight: bold; }
            .prices { background-color: #f0f8ff; font-weight: bold; color: #2563eb; }
          </style>
        </head>
        <body>
          
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Nafees</th>
                <th>Waqas</th>
                <th>Cheetan</th>
                <th>Nadeem</th>
                <th>Total Minutes</th>
              </tr>
            </thead>
            <tbody>
              ${timeEntries.map(entry => `
                <tr>
                  <td>${entry.date}</td>
                  <td>${entry.nafees}</td>
                  <td>${entry.waqas}</td>
                  <td>${entry.cheetan}</td>
                  <td>${entry.nadeem}</td>
                  <td>${entry.totalMinutes}</td>
                </tr>
              `).join('')}
            </tbody>
            <tfoot>
              <tr class="totals">
                <td>TOTAL</td>
                <td>${totals.nafees}</td>
                <td>${totals.waqas}</td>
                <td>${totals.cheetan}</td>
                <td>${totals.nadeem}</td>
                <td>${totals.totalMinutes}</td>
              </tr>
              <tr class="prices">
                <td>PRICE</td>
                <td>${prices.nafees.toLocaleString()}</td>
                <td>${prices.waqas.toLocaleString()}</td>
                <td>${prices.cheetan.toLocaleString()}</td>
                <td>${prices.nadeem.toLocaleString()}</td>
                <td>${(prices.nafees + prices.waqas + prices.cheetan + prices.nadeem).toLocaleString()}</td>
              </tr>
            </tfoot>
          </table>
          
          <div>
            <h3>Summary</h3>
            <p><strong>Tanker Price:</strong> ${baseAmount.toLocaleString()}</p>
            <p><strong>Total Minutes:</strong> ${totals.totalMinutes}</p>
            <p><strong>Total Hours:</strong> ${(totals.totalMinutes / 60).toFixed(1)}</p>
            <p><strong>Per Minute Rate:</strong> ${baseAmount.toLocaleString()} ÷ ${totals.totalMinutes} = ${finalPerMinuteRate.toFixed(3)}</p>
            <br>
            <h4>Individual Calculations:</h4>
            <p>• Nafees: ${finalPerMinuteRate.toFixed(3)} × ${totals.nafees} min = ${prices.nafees.toLocaleString()}</p>
            <p>• Waqas: ${finalPerMinuteRate.toFixed(3)} × ${totals.waqas} min = ${prices.waqas.toLocaleString()}</p>
            <p>• Cheetan: ${finalPerMinuteRate.toFixed(3)} × ${totals.cheetan} min = ${prices.cheetan.toLocaleString()}</p>
            <p>• Nadeem: ${finalPerMinuteRate.toFixed(3)} × ${totals.nadeem} min = ${prices.nadeem.toLocaleString()}</p>
            <br>
            <p><strong>Total Price:</strong> ${(prices.nafees + prices.waqas + prices.cheetan + prices.nadeem).toLocaleString()}</p>
          </div>
        </body>
      </html>
    `;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mt-8">
      <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
        <svg className="w-5 h-5 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"></path>
        </svg>
        Data Management
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="flex flex-col items-center p-4 border border-slate-200 rounded-lg hover:border-blue-300 transition-colors">
          <svg className="w-8 h-8 text-blue-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"></path>
          </svg>
          <button 
            data-testid="button-load-data"
            onClick={handleLoadData}
            className="text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            Load Data
          </button>
          <p className="text-xs text-slate-500 mt-1 text-center">Import from file</p>
        </div>
        
        <div className="flex flex-col items-center p-4 border border-slate-200 rounded-lg hover:border-emerald-300 transition-colors">
          <svg className="w-8 h-8 text-emerald-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12"></path>
          </svg>
          <button 
            data-testid="button-save-local"
            onClick={handleSaveLocal}
            className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
          >
            Save Local
          </button>
          <p className="text-xs text-slate-500 mt-1 text-center">Browser storage</p>
        </div>
        
        <div className="flex flex-col items-center p-4 border border-slate-200 rounded-lg hover:border-indigo-300 transition-colors">
          <svg className="w-8 h-8 text-indigo-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H9.414a1 1 0 01-.707-.293l-2-2A1 1 0 005.586 6H4a2 2 0 00-2 2v4a2 2 0 002 2h2m3 4h6m-6 0l3-3m-3 3l3 3"></path>
          </svg>
          <button 
            data-testid="button-print-report"
            onClick={handlePrintReport}
            className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
          >
            Print Report
          </button>
          <p className="text-xs text-slate-500 mt-1 text-center">PDF export</p>
        </div>
        
        <div className="flex flex-col items-center p-4 border border-slate-200 rounded-lg hover:border-purple-300 transition-colors">
          <svg className="w-8 h-8 text-purple-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
          </svg>
          <button 
            data-testid="button-download-png"
            onClick={handleDownloadPNG}
            className="text-sm font-medium text-purple-600 hover:text-purple-700"
          >
            Download PNG
          </button>
          <p className="text-xs text-slate-500 mt-1 text-center">Image export</p>
        </div>
      </div>

      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-center">
          <svg className="w-4 h-4 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span className="text-sm text-yellow-800">Data is automatically saved locally every 30 seconds</span>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json,.csv"
        onChange={handleFileUpload}
        className="hidden"
      />
    </div>
  );
}
