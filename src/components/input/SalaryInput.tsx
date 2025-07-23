'use client';

import React from 'react';
import { useCompensation } from '@/contexts/CompensationContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export default function SalaryInput() {
  const { state, dispatch } = useCompensation();
  const { salary } = state.currentPackage;

  const handleSalaryChange = (updates: Partial<typeof salary>) => {
    dispatch({
      type: 'UPDATE_SALARY',
      payload: { ...salary, ...updates }
    });
  };

  return (
    <div className="space-y-6">
      {/* Base Salary */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <span>💰</span>
          Base Salary
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount
            </label>
            <input
              type="number"
              min="0"
              step="1000"
              value={salary.baseSalary}
              onChange={(e) => handleSalaryChange({ baseSalary: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="25000"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Currency
            </label>
            <select
              value={salary.currency}
              onChange={(e) => handleSalaryChange({ currency: e.target.value as 'ILS' | 'USD' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="ILS">₪ ILS (Shekel)</option>
              <option value="USD">$ USD (Dollar)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Frequency
            </label>
            <select
              value={salary.frequency}
              onChange={(e) => handleSalaryChange({ frequency: e.target.value as 'monthly' | 'annual' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="monthly">Monthly</option>
              <option value="annual">Annual</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <div className="text-sm text-gray-600">
              {salary.frequency === 'monthly' ? (
                <span>Annual: <strong>{salary.currency} {(salary.baseSalary * 12).toLocaleString()}</strong></span>
              ) : (
                <span>Monthly: <strong>{salary.currency} {(salary.baseSalary / 12).toLocaleString()}</strong></span>
              )}
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {/* Bonus */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <span>🎯</span>
            Bonus
          </h3>
          <Button
            variant={salary.bonus ? "default" : "outline"}
            size="sm"
            onClick={() => {
              if (salary.bonus) {
                handleSalaryChange({ bonus: undefined });
              } else {
                handleSalaryChange({ 
                  bonus: { 
                    amount: 0, 
                    frequency: 'annual', 
                    guaranteed: false 
                  } 
                });
              }
            }}
          >
            {salary.bonus ? 'Remove Bonus' : 'Add Bonus'}
          </Button>
        </div>

        {salary.bonus && (
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bonus Amount
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={salary.bonus.amount}
                    onChange={(e) => handleSalaryChange({ 
                      bonus: { ...salary.bonus!, amount: Number(e.target.value) } 
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="10000"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Frequency
                  </label>
                  <select
                    value={salary.bonus.frequency}
                    onChange={(e) => handleSalaryChange({ 
                      bonus: { ...salary.bonus!, frequency: e.target.value as 'quarterly' | 'annual' } 
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >

                    <option value="quarterly">Quarterly</option>
                    <option value="annual">Annual</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={salary.bonus.guaranteed}
                  onChange={(e) => handleSalaryChange({ 
                    bonus: { ...salary.bonus!, guaranteed: e.target.checked } 
                  })}
                  className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <label className="text-sm text-gray-700">
                  Guaranteed bonus (not performance-based)
                </label>
              </div>

              <div className="flex gap-2">
                <Badge variant={salary.bonus.guaranteed ? "default" : "secondary"}>
                  {salary.bonus.guaranteed ? "Guaranteed" : "Performance-based"}
                </Badge>
                <Badge variant="outline">
                  {salary.currency} {salary.bonus.amount.toLocaleString()} {salary.bonus.frequency}
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Quick Tips */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <h4 className="text-sm font-medium text-blue-900 mb-2 flex items-center gap-2">
            <span>💡</span>
            Salary Tips
          </h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Enter your gross salary (before taxes and deductions)</li>
            <li>• Many Israeli tech contracts are negotiated in USD</li>
            <li>• Include guaranteed bonuses as part of base compensation</li>
            <li>• Variable bonuses should be estimated conservatively</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
} 