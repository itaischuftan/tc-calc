'use client';

import React, { useState } from 'react';
import { useCompensation } from '@/contexts/CompensationContext';
import { useCompensationCalculation } from '@/hooks/useCompensationCalculation';
import { 
  exportToPDF, 
  generateDetailedPDFReport, 
  exportToJSON, 
  exportToCSV,
  importFromJSON
} from '@/utils/export-utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export default function ExportPanel() {
  const { state, dispatch } = useCompensation();
  const { calculation } = useCompensationCalculation();
  const [isExporting, setIsExporting] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  const handleVisualPDFExport = async () => {
    setIsExporting('visual-pdf');
    try {
      await exportToPDF('compensation-results', `${state.currentPackage.name}-visual-report.pdf`);
    } catch (error) {
      console.error('PDF export failed:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsExporting(null);
    }
  };

  const handleDetailedPDFExport = async () => {
    setIsExporting('detailed-pdf');
    try {
      await generateDetailedPDFReport(
        state.currentPackage, 
        calculation, 
        `${state.currentPackage.name}-detailed-report.pdf`
      );
    } catch (error) {
      console.error('Detailed PDF export failed:', error);
      alert('Failed to generate detailed PDF. Please try again.');
    } finally {
      setIsExporting(null);
    }
  };

  const handleJSONExport = () => {
    setIsExporting('json');
    try {
      exportToJSON(state.currentPackage, calculation);
    } catch (error) {
      console.error('JSON export failed:', error);
      alert('Failed to export JSON. Please try again.');
    } finally {
      setIsExporting(null);
    }
  };

  const handleCSVExport = () => {
    setIsExporting('csv');
    try {
      exportToCSV(state.currentPackage, calculation);
    } catch (error) {
      console.error('CSV export failed:', error);
      alert('Failed to export CSV. Please try again.');
    } finally {
      setIsExporting(null);
    }
  };

  const handleJSONImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImportError(null);
    try {
      const { package: importedPackage, calculation: importedCalculation } = await importFromJSON(file);
      
      // Update the current package
      dispatch({ type: 'UPDATE_SALARY', payload: importedPackage.salary });
      dispatch({ type: 'UPDATE_BENEFITS', payload: importedPackage.benefits });
      dispatch({ type: 'UPDATE_EQUITY', payload: importedPackage.equity });
      dispatch({ type: 'UPDATE_PERKS', payload: importedPackage.perks });
      
      if (importedCalculation) {
        dispatch({ type: 'SET_CALCULATION', payload: importedCalculation });
      }
      
      alert('Compensation package imported successfully!');
    } catch (error) {
      setImportError((error as Error).message);
    }
    
    // Reset file input
    event.target.value = '';
  };

  const exportOptions = [
    {
      id: 'visual-pdf',
      title: 'Visual PDF Report',
      description: 'Export current view as PDF with charts',
      icon: '📄',
      variant: 'destructive' as const,
      action: handleVisualPDFExport,
      disabled: false
    },
    {
      id: 'detailed-pdf',
      title: 'Detailed PDF Report',
      description: 'Comprehensive report with all details',
      icon: '📋',
      variant: 'destructive' as const,
      action: handleDetailedPDFExport,
      disabled: false
    },
    {
      id: 'json',
      title: 'JSON Export',
      description: 'Save package data for backup/sharing',
      icon: '💾',
      variant: 'default' as const,
      action: handleJSONExport,
      disabled: false
    },
    {
      id: 'csv',
      title: 'CSV Spreadsheet',
      description: 'Export to Excel/Sheets compatible format',
      icon: '📊',
      variant: 'secondary' as const,
      action: handleCSVExport,
      disabled: false
    }
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>📤</span>
          Export & Share
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Export Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {exportOptions.map((option) => (
            <Card key={option.id} className="transition-all duration-200 hover:shadow-md">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">{option.icon}</span>
                  <div className="flex-1 space-y-2">
                    <div>
                      <h4 className="font-medium text-sm">
                        {option.title}
                      </h4>
                      <p className="text-xs text-gray-600">{option.description}</p>
                    </div>
                    
                    <Button
                      onClick={option.action}
                      disabled={option.disabled || isExporting === option.id}
                      variant={option.variant}
                      size="sm"
                      className="w-full"
                    >
                      {isExporting === option.id ? (
                        <>
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
                          Generating...
                        </>
                      ) : (
                        `Export ${option.title.split(' ')[0]}`
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Separator />

        {/* Import Section */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <span>📥</span>
            Import Package
          </h4>
          
          <div className="flex items-center space-x-4">
            <Button asChild variant="outline" size="sm">
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleJSONImport}
                  className="hidden"
                />
                Choose JSON file
              </label>
            </Button>
            <span className="text-xs text-gray-500">
              Import a previously exported compensation package
            </span>
          </div>
          
          {importError && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-3">
                <p className="text-sm text-red-700">{importError}</p>
              </CardContent>
            </Card>
          )}
        </div>

        <Separator />

        {/* Export Tips */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-blue-900 flex items-center gap-2">
              <span>💡</span>
              Export Tips
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ul className="text-sm text-blue-800 space-y-1">
              <li className="flex items-start gap-2">
                <Badge variant="outline" className="text-xs bg-blue-100 text-blue-700 border-blue-300">PDF</Badge>
                <span>Perfect for sharing with HR or for personal records</span>
              </li>
              <li className="flex items-start gap-2">
                <Badge variant="outline" className="text-xs bg-blue-100 text-blue-700 border-blue-300">JSON</Badge>
                <span>Best for backing up and restoring your configuration</span>
              </li>
              <li className="flex items-start gap-2">
                <Badge variant="outline" className="text-xs bg-blue-100 text-blue-700 border-blue-300">CSV</Badge>
                <span>Import into Excel/Sheets for further analysis</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Calculation Status */}
        {!calculation && (
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="p-4 flex items-center gap-3">
              <span className="text-yellow-600">⚠️</span>
              <p className="text-sm text-yellow-800">
                Run a calculation first to include results in your exports
              </p>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
} 