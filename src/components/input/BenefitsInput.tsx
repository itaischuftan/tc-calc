'use client';

import React from 'react';
import { useCompensation } from '@/contexts/CompensationContext';

export default function BenefitsInput() {
  const { state, dispatch } = useCompensation();
  const { benefits } = state.currentPackage;

  const handleBenefitsChange = (field: keyof typeof benefits, value: string | number | boolean | object | undefined) => {
    dispatch({
      type: 'UPDATE_BENEFITS',
      payload: { [field]: value }
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">📈 Benefits & Insurance</h3>
      
      <div className="space-y-6">
        {/* Pension Fund */}
        <div className="border-b border-gray-200 pb-6">
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-gray-700">
              Pension Fund (Keren Pensia)
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={benefits.pensionFund.employerContribution > 0}
                onChange={(e) => handleBenefitsChange('pensionFund', {
                  ...benefits.pensionFund,
                  employerContribution: e.target.checked ? 6.5 : 0
                })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-600">Employer contributes</span>
            </div>
          </div>

          {benefits.pensionFund.employerContribution > 0 && (
            <div className="bg-blue-50 p-4 rounded-lg space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Employee Rate (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="15"
                    step="0.5"
                    value={benefits.pensionFund.employeeContribution}
                    onChange={(e) => handleBenefitsChange('pensionFund', {
                      ...benefits.pensionFund,
                      employeeContribution: Number(e.target.value)
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="6.0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Employer Rate (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="15"
                    step="0.5"
                    value={benefits.pensionFund.employerContribution}
                    onChange={(e) => handleBenefitsChange('pensionFund', {
                      ...benefits.pensionFund,
                      employerContribution: Number(e.target.value)
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="6.5"
                  />
                </div>
              </div>
              <p className="text-sm text-blue-700">
                💡 Standard rates: Employee 6%, Employer 6.5%. Some companies offer enhanced rates.
              </p>
            </div>
          )}
        </div>

        {/* Study Fund */}
        <div className="border-b border-gray-200 pb-6">
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-gray-700">
              Study Fund (Keren Hishtalmut)
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={benefits.studyFund.employerContribution > 0}
                onChange={(e) => handleBenefitsChange('studyFund', {
                  ...benefits.studyFund,
                  employerContribution: e.target.checked ? 7.5 : 0
                })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-600">Employer contributes</span>
            </div>
          </div>

          {benefits.studyFund.employerContribution > 0 && (
            <div className="bg-green-50 p-4 rounded-lg space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Employee Rate (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    step="0.5"
                    value={benefits.studyFund.employeeContribution}
                    onChange={(e) => handleBenefitsChange('studyFund', {
                      ...benefits.studyFund,
                      employeeContribution: Number(e.target.value)
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-green-500 focus:border-green-500"
                    placeholder="2.5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Employer Rate (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    step="0.5"
                    value={benefits.studyFund.employerContribution}
                    onChange={(e) => handleBenefitsChange('studyFund', {
                      ...benefits.studyFund,
                      employerContribution: Number(e.target.value)
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-green-500 focus:border-green-500"
                    placeholder="7.5"
                  />
                </div>
              </div>
              <p className="text-sm text-green-700">
                💡 Standard rates: Employee 2.5%, Employer 7.5%. Available after 6 years or for approved education.
              </p>
            </div>
          )}
        </div>

        {/* Health Insurance */}
        <div className="border-b border-gray-200 pb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Private Health Insurance
          </label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Coverage Level</label>
              <select
                value={benefits.healthInsurance.coverage}
                onChange={(e) => handleBenefitsChange('healthInsurance', {
                  ...benefits.healthInsurance,
                  coverage: e.target.value as 'basic' | 'premium' | 'none'
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="none">None</option>
                <option value="basic">Basic</option>
                <option value="premium">Premium</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Employer Contribution (₪/month)</label>
              <input
                type="number"
                min="0"
                step="50"
                value={benefits.healthInsurance.employerContribution}
                onChange={(e) => handleBenefitsChange('healthInsurance', {
                  ...benefits.healthInsurance,
                  employerContribution: Number(e.target.value)
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                placeholder="200"
              />
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            💡 Typical employer contribution: ₪150-400/month. Premium plans often include dental and vision.
          </p>
        </div>

        {/* Vacation Days */}
        <div className="border-b border-gray-200 pb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Time Off Benefits
          </label>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Vacation Days</label>
              <input
                type="number"
                min="0"
                max="50"
                value={benefits.vacationDays}
                onChange={(e) => handleBenefitsChange('vacationDays', Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="22"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Sick Days</label>
              <input
                type="number"
                min="0"
                max="30"
                value={typeof benefits.sickDays === 'number' ? benefits.sickDays : 0}
                onChange={(e) => handleBenefitsChange('sickDays', Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="12"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Extra Parental Leave (days)</label>
              <input
                type="number"
                min="0"
                max="90"
                value={benefits.parentalLeave}
                onChange={(e) => handleBenefitsChange('parentalLeave', Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="14"
              />
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            💡 Israeli law: Minimum 14 vacation days, 18 sick days. Many tech companies offer more.
          </p>
        </div>



        {/* Benefits Summary */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-900 mb-2">💡 Benefits Overview</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Pension and study fund contributions are tax-deductible</li>
            <li>• Health insurance premiums are considered taxable benefits</li>
            <li>• Vacation days have monetary value for compensation calculations</li>
            <li>• Some benefits may have annual caps or vesting periods</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 