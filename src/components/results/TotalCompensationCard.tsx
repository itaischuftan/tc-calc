'use client';

import React from 'react';
import { useCompensationCalculation } from '@/hooks/useCompensationCalculation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';

export default function TotalCompensationCard() {
  const { calculation, formatCurrency, isCalculating } = useCompensationCalculation();

  if (isCalculating) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-center">Calculating Your Compensation...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center space-y-4 py-8">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="text-gray-600">Analyzing your package...</p>
            <Progress value={66} className="w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!calculation) {
    return (
      <Card className="w-full border-dashed border-2 border-gray-300">
        <CardHeader>
          <CardTitle className="text-center text-gray-700">💰 Total Compensation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
              <span className="text-2xl">🧮</span>
            </div>
            <p className="text-gray-600 mb-2">Ready to calculate your compensation</p>
            <p className="text-sm text-gray-500">Fill in your details above and click Calculate</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const summaryStats = {
    totalAnnual: calculation.totalAnnualCompensation,
    netAnnual: calculation.netCompensation,
    monthlyGross: calculation.totalAnnualCompensation / 12,
    monthlyNet: calculation.netCompensation / 12,
    effectiveTaxRate: calculation.taxImplications.effectiveTaxRate
  };

  // Calculate breakdown percentages
  const breakdown = [
    { 
      label: 'Salary', 
      value: calculation.breakdown.baseSalary.gross, 
      percentage: Math.round((calculation.breakdown.baseSalary.gross / calculation.totalAnnualCompensation) * 100),
      color: 'bg-blue-500'
    },
    { 
      label: 'Benefits', 
      value: calculation.breakdown.benefits.gross, 
      percentage: Math.round((calculation.breakdown.benefits.gross / calculation.totalAnnualCompensation) * 100),
      color: 'bg-green-500'
    },
    { 
      label: 'Equity', 
      value: calculation.breakdown.equity.gross, 
      percentage: Math.round((calculation.breakdown.equity.gross / calculation.totalAnnualCompensation) * 100),
      color: 'bg-purple-500'
    },
    { 
      label: 'Perks', 
      value: calculation.breakdown.perks.gross, 
      percentage: Math.round((calculation.breakdown.perks.gross / calculation.totalAnnualCompensation) * 100),
      color: 'bg-orange-500'
    }
  ];

  return (
    <Card className="w-full bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white border-0 shadow-xl">
      <CardHeader className="text-center pb-6">
        <CardTitle className="text-2xl font-bold text-white mb-2">
          🇮🇱 Your Total Annual Compensation
        </CardTitle>
        <div className="text-5xl font-bold text-white mb-4 tracking-tight">
          {formatCurrency(summaryStats.totalAnnual, 'ILS')}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-white/10 backdrop-blur border-white/20">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-white">
                {formatCurrency(summaryStats.netAnnual, 'ILS')}
              </div>
              <Badge variant="secondary" className="mt-2 bg-white/20 text-white border-white/30">
                Net (After Tax)
              </Badge>
            </CardContent>
          </Card>
          
          <Card className="bg-white/10 backdrop-blur border-white/20">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-white">
                {formatCurrency(summaryStats.monthlyGross, 'ILS')}
              </div>
              <Badge variant="secondary" className="mt-2 bg-white/20 text-white border-white/30">
                Monthly Gross
              </Badge>
            </CardContent>
          </Card>
        </div>

        <Separator className="bg-white/20" />

        {/* Compensation Breakdown */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4 text-center">
            Compensation Breakdown
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {breakdown.map((item) => (
              <div key={item.label} className="text-center">
                <div className="text-xl font-bold text-white">
                  {item.percentage}%
                </div>
                <div className="text-sm text-white/80">
                  {item.label}
                </div>
                <div className="w-full bg-white/20 rounded-full h-2 mt-2">
                  <div 
                    className={`h-2 rounded-full ${item.color} transition-all duration-500`}
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Separator className="bg-white/20" />

        {/* Tax Information */}
        <div className="text-center">
          <div className="text-lg font-semibold text-white">
            Effective Tax Rate: {(summaryStats.effectiveTaxRate * 100).toFixed(1)}%
          </div>
          <div className="mt-2">
            <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30">
              🏛️ Israeli Tax Calculation
            </Badge>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex justify-center space-x-2 pt-4">
          <Badge variant="outline" className="bg-white/10 text-white border-white/30 hover:bg-white/20">
            📊 View Details Below
          </Badge>
          <Badge variant="outline" className="bg-white/10 text-white border-white/30 hover:bg-white/20">
            📄 Export Report
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
} 