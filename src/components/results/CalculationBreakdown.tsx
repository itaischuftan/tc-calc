'use client';

import React, { useState } from 'react';
import { useCompensationCalculation } from '@/hooks/useCompensationCalculation';

export default function CalculationBreakdown() {
  const { calculation, formatCurrency } = useCompensationCalculation();
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  if (!calculation) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">🧮 Calculation Breakdown</h3>
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <span className="text-2xl">🔢</span>
          </div>
          <p className="text-gray-600 mb-2">No calculation available</p>
          <p className="text-sm text-gray-500">Run a calculation to see detailed breakdown</p>
        </div>
      </div>
    );
  }

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const sections = [
    {
      id: 'salary',
      title: 'Base Salary Calculation',
      icon: '💰',
      gross: calculation.breakdown.baseSalary.gross,
      net: calculation.breakdown.baseSalary.net,
      color: 'blue',
      details: {
        description: 'Your base salary converted to annual ILS and net calculation after taxes',
        components: [
          'Base salary (monthly/annual)',
          'Currency conversion (if USD)',
          'Bonus calculations (if applicable)',
          'Income tax deduction',
          'Bituach Leumi (social security)',
          'Health tax deduction'
        ]
      }
    },
    {
      id: 'benefits',
      title: 'Benefits Valuation',
      icon: '📈',
      gross: calculation.breakdown.benefits.gross,
      net: calculation.breakdown.benefits.net,
      color: 'green',
      details: {
        description: 'Employer contributions to pension, study fund, and health insurance',
        components: [
          'Pension fund employer contribution (6.5% standard)',
          'Study fund employer contribution (7.5% standard)',
          'Health insurance premium coverage',
          'Vacation days monetary value',
          'Sick days monetary value',
          'Parental leave benefits'
        ]
      }
    },
    {
      id: 'equity',
      title: 'Equity Compensation',
      icon: '💎',
      gross: calculation.breakdown.equity.gross,
      net: calculation.breakdown.equity.net,
      color: 'purple',
      details: {
        description: 'Stock-based compensation including RSUs, options, and ESPP',
        components: [
          'RSU vesting value (current)',
          'Stock options (if in the money)',
          'ESPP discount benefits',
          'Vesting schedule considerations',
          'Capital gains tax implications',
          'Risk-adjusted valuations'
        ]
      }
    },
    {
      id: 'perks',
      title: 'Perks & Additional Benefits',
      icon: '🎁',
      gross: calculation.breakdown.perks.gross,
      net: calculation.breakdown.perks.net,
      color: 'orange',
      details: {
        description: 'Workplace perks and additional benefits provided by your employer',
        components: [
          'Technology equipment (laptop, phone)',
          'Meal allowances and office meals',
          'Transportation benefits',
          'Learning and development budget',
          'Gym membership subsidies',
          'Remote work value estimation'
        ]
      }
    }
  ];

  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: 'bg-blue-50 border-blue-200 text-blue-800',
      green: 'bg-green-50 border-green-200 text-green-800',
      purple: 'bg-purple-50 border-purple-200 text-purple-800',
      orange: 'bg-orange-50 border-orange-200 text-orange-800'
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">🧮 Calculation Breakdown</h3>
      
      <div className="space-y-4">
        {/* Summary */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-900">
                {formatCurrency(calculation.totalAnnualCompensation, 'ILS')}
              </div>
              <div className="text-sm text-blue-700">Total Gross Annual</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-900">
                {formatCurrency(calculation.netCompensation, 'ILS')}
              </div>
              <div className="text-sm text-green-700">Total Net Annual</div>
            </div>
          </div>
          <div className="mt-3 text-center">
            <div className="text-lg font-semibold text-gray-700">
              Effective Tax Rate: {(calculation.taxImplications.effectiveTaxRate * 100).toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Component Breakdown */}
        {sections.map((section) => (
          <div key={section.id} className={`border rounded-lg ${getColorClasses(section.color)}`}>
            <button
              onClick={() => toggleSection(section.id)}
              className="w-full p-4 text-left flex items-center justify-between hover:bg-white hover:bg-opacity-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <span className="text-xl">{section.icon}</span>
                <div>
                  <h4 className="font-medium">{section.title}</h4>
                  <div className="text-sm opacity-80">
                    Gross: {formatCurrency(section.gross, 'ILS')} • 
                    Net: {formatCurrency(section.net, 'ILS')}
                  </div>
                </div>
              </div>
              <div className={`transform transition-transform ${expandedSection === section.id ? 'rotate-180' : ''}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>

            {expandedSection === section.id && (
              <div className="px-4 pb-4">
                <div className="bg-white bg-opacity-70 rounded-lg p-3">
                  <p className="text-sm mb-3">{section.details.description}</p>
                  <div className="space-y-1">
                    <h5 className="text-xs font-medium opacity-75">CALCULATION INCLUDES:</h5>
                    <ul className="text-xs space-y-1">
                      {section.details.components.map((component, index) => (
                        <li key={index} className="flex items-start">
                          <span className="mr-2">•</span>
                          <span>{component}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Tax Breakdown */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3 flex items-center">
            <span className="mr-2">🏛️</span>
            Tax Breakdown
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Income Tax:</span>
                <span className="font-medium">{formatCurrency(calculation.taxImplications.incomeTax, 'ILS')}</span>
              </div>
              <div className="flex justify-between">
                <span>Bituach Leumi:</span>
                <span className="font-medium">{formatCurrency(calculation.taxImplications.bituachLeumi, 'ILS')}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Pension Contrib:</span>
                <span className="font-medium">{formatCurrency(calculation.taxImplications.pensionContributions, 'ILS')}</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="font-medium">Total Deductions:</span>
                <span className="font-bold">{formatCurrency(calculation.taxImplications.totalDeductions, 'ILS')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Methodology */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-yellow-900 mb-2">📚 Calculation Methodology</h4>
          <ul className="text-sm text-yellow-800 space-y-1">
            <li>• Tax calculations based on 2024 Israeli tax brackets and rates</li>
            <li>• Currency conversion uses real-time exchange rates with fallback</li>
            <li>• Benefits valued at employer cost, perks at fair market value</li>
            <li>• Equity valuations include risk adjustments for private companies</li>
            <li>• Net calculations account for all applicable taxes and deductions</li>
          </ul>
        </div>

        {/* Calculation Timestamp */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            Calculated on {calculation.calculatedAt.toLocaleDateString('en-IL')} at{' '}
            {calculation.calculatedAt.toLocaleTimeString('en-IL')}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Exchange rate: 1 USD = {calculation.exchangeRates.usdToIls.rate.toFixed(4)} ILS
            (Updated: {calculation.exchangeRates.usdToIls.lastUpdated.toLocaleDateString('en-IL')})
          </p>
        </div>
      </div>
    </div>
  );
} 