'use client';

import React, { useState } from 'react';
import { useCompensation } from '@/contexts/CompensationContext';
import { CompensationPackage, CompensationCalculation } from '@/types';
import { CompensationCalculator } from '@/utils/compensation-calculator';

interface ComparisonData {
  package: CompensationPackage;
  calculation: CompensationCalculation | null;
}

export default function PackageComparison() {
  const { state } = useCompensation();
  const [comparisonPackages, setComparisonPackages] = useState<ComparisonData[]>([]);
  const [showComparison, setShowComparison] = useState(false);

  const addCurrentPackage = async () => {
    try {
      const calculation = await CompensationCalculator.calculateTotalCompensation(state.currentPackage);
      const newComparison: ComparisonData = {
        package: state.currentPackage,
        calculation
      };
      
      setComparisonPackages(prev => [...prev, newComparison]);
      setShowComparison(true);
    } catch (error) {
      console.error('Failed to calculate compensation for comparison:', error);
      alert('Failed to add package to comparison. Please try again.');
    }
  };

  const removePackage = (index: number) => {
    setComparisonPackages(prev => prev.filter((_, i) => i !== index));
    if (comparisonPackages.length <= 1) {
      setShowComparison(false);
    }
  };

  const clearComparison = () => {
    setComparisonPackages([]);
    setShowComparison(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getComparisonMetrics = () => {
    if (comparisonPackages.length === 0) return null;

    const calculations = comparisonPackages.map(p => p.calculation).filter(Boolean) as CompensationCalculation[];
    if (calculations.length === 0) return null;

    const totalCompensations = calculations.map(c => c.totalAnnualCompensation);
    const netCompensations = calculations.map(c => c.netCompensation);
    const taxRates = calculations.map(c => c.taxImplications.effectiveTaxRate);

    return {
      highestTotal: Math.max(...totalCompensations),
      lowestTotal: Math.min(...totalCompensations),
      highestNet: Math.max(...netCompensations),
      lowestNet: Math.min(...netCompensations),
      avgTaxRate: taxRates.reduce((a, b) => a + b, 0) / taxRates.length
    };
  };

  const metrics = getComparisonMetrics();

  if (!showComparison) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">⚖️ Package Comparison</h3>
        
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-2xl">📊</span>
          </div>
          <p className="text-gray-600 mb-4">Compare multiple compensation packages side by side</p>
          
          <button
            onClick={addCurrentPackage}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add Current Package to Comparison
          </button>
          
          <p className="text-sm text-gray-500 mt-3">
            Add your current package, then modify inputs and add more packages to compare
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">⚖️ Package Comparison</h3>
        <div className="flex space-x-2">
          <button
            onClick={addCurrentPackage}
            className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
          >
            Add Current
          </button>
          <button
            onClick={clearComparison}
            className="px-4 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Summary Metrics */}
      {metrics && (
        <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-4 mb-6 border border-blue-200">
          <h4 className="font-medium text-gray-900 mb-3">📊 Comparison Summary</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="font-bold text-green-700">{formatCurrency(metrics.highestTotal)}</div>
              <div className="text-gray-600">Highest Total</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-green-700">{formatCurrency(metrics.highestNet)}</div>
              <div className="text-gray-600">Highest Net</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-red-700">{formatCurrency(metrics.lowestTotal)}</div>
              <div className="text-gray-600">Lowest Total</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-blue-700">{(metrics.avgTaxRate * 100).toFixed(1)}%</div>
              <div className="text-gray-600">Avg Tax Rate</div>
            </div>
          </div>
        </div>
      )}

      {/* Comparison Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-2 font-medium text-gray-900">Metric</th>
              {comparisonPackages.map((comp, index) => (
                <th key={index} className="text-center py-3 px-2 font-medium text-gray-900">
                  <div className="flex items-center justify-center space-x-2">
                    <span>Package {index + 1}</span>
                    <button
                      onClick={() => removePackage(index)}
                      className="text-red-500 hover:text-red-700 text-xs"
                      title="Remove package"
                    >
                      ✕
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {/* Package Name */}
            <tr>
              <td className="py-3 px-2 font-medium">Package Name</td>
              {comparisonPackages.map((comp, index) => (
                <td key={index} className="py-3 px-2 text-center">{comp.package.name}</td>
              ))}
            </tr>

            {/* Total Compensation */}
            <tr className="bg-blue-50">
              <td className="py-3 px-2 font-medium">Total Annual Compensation</td>
              {comparisonPackages.map((comp, index) => (
                <td key={index} className="py-3 px-2 text-center font-bold">
                  {comp.calculation ? formatCurrency(comp.calculation.totalAnnualCompensation) : 'N/A'}
                </td>
              ))}
            </tr>

            {/* Net Compensation */}
            <tr className="bg-green-50">
              <td className="py-3 px-2 font-medium">Net Annual Compensation</td>
              {comparisonPackages.map((comp, index) => (
                <td key={index} className="py-3 px-2 text-center font-bold">
                  {comp.calculation ? formatCurrency(comp.calculation.netCompensation) : 'N/A'}
                </td>
              ))}
            </tr>

            {/* Base Salary */}
            <tr>
              <td className="py-3 px-2 font-medium">Base Salary (Annual)</td>
              {comparisonPackages.map((comp, index) => {
                const annualSalary = comp.package.salary.frequency === 'monthly' 
                  ? comp.package.salary.baseSalary * 12 
                  : comp.package.salary.baseSalary;
                return (
                  <td key={index} className="py-3 px-2 text-center">
                    {formatCurrency(annualSalary)} {comp.package.salary.currency !== 'ILS' && `(${comp.package.salary.currency})`}
                  </td>
                );
              })}
            </tr>

            {/* Benefits */}
            <tr>
              <td className="py-3 px-2 font-medium">Benefits Value</td>
              {comparisonPackages.map((comp, index) => (
                <td key={index} className="py-3 px-2 text-center">
                  {comp.calculation ? formatCurrency(comp.calculation.breakdown.benefits.gross) : 'N/A'}
                </td>
              ))}
            </tr>

            {/* Perks */}
            <tr>
              <td className="py-3 px-2 font-medium">Perks Value</td>
              {comparisonPackages.map((comp, index) => (
                <td key={index} className="py-3 px-2 text-center">
                  {comp.calculation ? formatCurrency(comp.calculation.breakdown.perks.gross) : 'N/A'}
                </td>
              ))}
            </tr>

            {/* Tax Rate */}
            <tr>
              <td className="py-3 px-2 font-medium">Effective Tax Rate</td>
              {comparisonPackages.map((comp, index) => (
                <td key={index} className="py-3 px-2 text-center">
                  {comp.calculation ? `${(comp.calculation.taxImplications.effectiveTaxRate * 100).toFixed(1)}%` : 'N/A'}
                </td>
              ))}
            </tr>

            {/* Remote Work */}
            <tr>
              <td className="py-3 px-2 font-medium">Remote Work</td>
              {comparisonPackages.map((comp, index) => (
                <td key={index} className="py-3 px-2 text-center">
                  {comp.package.perks.flexibleWork.remoteAllowed 
                    ? `${comp.package.perks.flexibleWork.hybridDays || 0} days/week`
                    : 'None'
                  }
                </td>
              ))}
            </tr>

            {/* Vacation Days */}
            <tr>
              <td className="py-3 px-2 font-medium">Vacation Days</td>
              {comparisonPackages.map((comp, index) => (
                <td key={index} className="py-3 px-2 text-center">
                  {comp.package.benefits.vacationDays} days
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Insights */}
      {comparisonPackages.length >= 2 && (
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-yellow-900 mb-2">💡 Comparison Insights</h4>
          <ul className="text-sm text-yellow-800 space-y-1">
            <li>• Consider not just total compensation, but also tax efficiency and work-life balance</li>
            <li>• Remote work options can save significant transportation and meal costs</li>
            <li>• Benefits like pension and study fund have long-term value beyond immediate compensation</li>
            <li>• Factor in company growth potential when evaluating equity compensation</li>
          </ul>
        </div>
      )}
    </div>
  );
} 