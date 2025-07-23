'use client';

import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import SalaryInput from '@/components/input/SalaryInput';
import BenefitsInput from '@/components/input/BenefitsInput';
import EquityInput from '@/components/input/EquityInput';
import PerksInput from '@/components/input/PerksInput';
import TotalCompensationCard from '@/components/results/TotalCompensationCard';
import BreakdownChart from '@/components/results/BreakdownChart';
import CalculationBreakdown from '@/components/results/CalculationBreakdown';
import ExportPanel from '@/components/export/ExportPanel';
import PackageComparison from '@/components/comparison/PackageComparison';
import { useCompensationCalculation } from '@/hooks/useCompensationCalculation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

export default function CalculatorPage() {
  const { isCalculating, performFullCalculation } = useCompensationCalculation();

  return (
    <AppLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              🇮🇱 Israeli Tech Compensation Calculator
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Calculate your total compensation including salary, benefits, equity, and perks with Israeli tax considerations
            </p>
            <div className="flex justify-center gap-2 mt-4">
              <Badge variant="secondary">2024 Tax Rates</Badge>
              <Badge variant="secondary">Real-time USD/ILS</Badge>
              <Badge variant="secondary">Israeli Benefits</Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Inputs */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span>📝</span>
                    Compensation Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="salary" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="salary">💰 Salary</TabsTrigger>
                      <TabsTrigger value="benefits">📈 Benefits</TabsTrigger>
                      <TabsTrigger value="equity">💎 Equity</TabsTrigger>
                      <TabsTrigger value="perks">🎁 Perks</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="salary" className="mt-6">
                      <SalaryInput />
                    </TabsContent>
                    
                    <TabsContent value="benefits" className="mt-6">
                      <BenefitsInput />
                    </TabsContent>
                    
                    <TabsContent value="equity" className="mt-6">
                      <EquityInput />
                    </TabsContent>
                    
                    <TabsContent value="perks" className="mt-6">
                      <PerksInput />
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              {/* Calculate Button */}
              <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                <CardContent className="p-6 text-center">
                  <Button 
                    onClick={performFullCalculation}
                    disabled={isCalculating}
                    size="lg"
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-4 text-lg"
                  >
                    {isCalculating ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Calculating Total Compensation...
                      </>
                    ) : (
                      <>
                        🧮 Calculate Total Compensation
                      </>
                    )}
                  </Button>
                  <p className="text-sm text-green-700 mt-3">
                    Get detailed breakdown with Israeli tax calculations
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Results */}
            <div className="space-y-6" id="compensation-results">
              <TotalCompensationCard />
              
              <Tabs defaultValue="chart" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="chart">📊 Chart</TabsTrigger>
                  <TabsTrigger value="breakdown">🧮 Breakdown</TabsTrigger>
                  <TabsTrigger value="export">📤 Export</TabsTrigger>
                  <TabsTrigger value="compare">⚖️ Compare</TabsTrigger>
                </TabsList>
                
                <TabsContent value="chart" className="mt-6">
                  <BreakdownChart />
                </TabsContent>
                
                <TabsContent value="breakdown" className="mt-6">
                  <CalculationBreakdown />
                </TabsContent>
                
                <TabsContent value="export" className="mt-6">
                  <ExportPanel />
                </TabsContent>
                
                <TabsContent value="compare" className="mt-6">
                  <PackageComparison />
                </TabsContent>
              </Tabs>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-12 text-center">
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">💡 About This Calculator</h3>
                <p className="text-blue-800 mb-4">
                  This calculator uses 2024 Israeli tax rates and regulations. It includes income tax, 
                  Bituach Leumi, pension contributions, and all standard Israeli workplace benefits.
                </p>
                <div className="flex justify-center gap-4 text-sm text-blue-700">
                  <div className="flex items-center gap-1">
                    <span>✓</span>
                    <span>2024 Tax Brackets</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>✓</span>
                    <span>Real-time Exchange Rates</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>✓</span>
                    <span>Israeli Benefits & Perks</span>
                  </div>
                </div>
                <p className="text-xs text-blue-600 mt-3">
                  Disclaimer: This tool is for estimation purposes only. Consult a tax professional for official advice.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
} 