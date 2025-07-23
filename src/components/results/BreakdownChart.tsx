'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useCompensationCalculation } from '@/hooks/useCompensationCalculation';

const COLORS = {
  salary: '#3B82F6',     // Blue
  benefits: '#10B981',   // Green  
  equity: '#8B5CF6',     // Purple
  perks: '#F59E0B'       // Orange
};

interface ChartData {
  name: string;
  value: number;
  percentage: number;
  color: string;
  displayName: string;
}

export default function BreakdownChart() {
  const { calculation, formatCurrency } = useCompensationCalculation();

  if (!calculation) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Compensation Breakdown</h3>
        <div className="flex items-center justify-center h-64 text-gray-500">
          <div className="text-center">
            <svg className="w-12 h-12 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p>Run calculation to see breakdown</p>
          </div>
        </div>
      </div>
    );
  }

  const { breakdown, totalAnnualCompensation } = calculation;

  const chartData: ChartData[] = [
    {
      name: 'salary',
      value: breakdown.baseSalary.gross,
      percentage: (breakdown.baseSalary.gross / totalAnnualCompensation) * 100,
      color: COLORS.salary,
      displayName: 'Base Salary'
    },
    {
      name: 'benefits',
      value: breakdown.benefits.gross,
      percentage: (breakdown.benefits.gross / totalAnnualCompensation) * 100,
      color: COLORS.benefits,
      displayName: 'Benefits'
    },
    {
      name: 'equity',
      value: breakdown.equity.gross,
      percentage: (breakdown.equity.gross / totalAnnualCompensation) * 100,
      color: COLORS.equity,
      displayName: 'Equity'
    },
    {
      name: 'perks',
      value: breakdown.perks.gross,
      percentage: (breakdown.perks.gross / totalAnnualCompensation) * 100,
      color: COLORS.perks,
      displayName: 'Perks'
    }
  ].filter(item => item.value > 0); // Only show non-zero values

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{payload: ChartData}> }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{data.displayName}</p>
          <p className="text-sm text-gray-600">
            {formatCurrency(data.value, 'ILS')} ({data.percentage.toFixed(1)}%)
          </p>
        </div>
      );
    }
    return null;
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const CustomLabel = (props: any) => {
    const { cx, cy, midAngle, innerRadius, outerRadius, percentage } = props;
    if (percentage < 5) return null; // Don't show labels for very small slices
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${percentage.toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Compensation Breakdown</h3>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={CustomLabel}
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ fontSize: '14px' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Detailed Breakdown */}
      <div className="mt-6 space-y-3">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Detailed Breakdown</h4>
        {chartData.map((item) => (
          <div key={item.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div 
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: item.color }}
              ></div>
              <span className="font-medium text-gray-900">{item.displayName}</span>
            </div>
            <div className="text-right">
              <div className="font-semibold text-gray-900">
                {formatCurrency(item.value, 'ILS')}
              </div>
              <div className="text-sm text-gray-600">
                {item.percentage.toFixed(1)}% of total
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="text-lg font-semibold text-blue-900">
              {formatCurrency(totalAnnualCompensation, 'ILS')}
            </div>
            <div className="text-sm text-blue-700">Total Gross</div>
          </div>
          <div className="bg-green-50 p-3 rounded-lg">
            <div className="text-lg font-semibold text-green-900">
              {formatCurrency(calculation.netCompensation, 'ILS')}
            </div>
            <div className="text-sm text-green-700">Total Net</div>
          </div>
        </div>
      </div>
    </div>
  );
} 