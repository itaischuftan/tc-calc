'use client';

import React from 'react';
import { useCompensation } from '@/contexts/CompensationContext';

export default function PerksInput() {
  const { state, dispatch } = useCompensation();
  const { perks } = state.currentPackage;

  const handlePerksChange = (updates: Partial<typeof perks>) => {
    dispatch({
      type: 'UPDATE_PERKS',
      payload: updates
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">🎁 Perks & Additional Benefits</h3>
      
      <div className="space-y-6">
        {/* Meal Benefits */}
        <div className="border-b border-gray-200 pb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Meal Benefits
          </label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Meal Type</label>
              <select
                value={perks.meals.type}
                onChange={(e) => handlePerksChange({
                  meals: {
                    ...perks.meals,
                    type: e.target.value as 'allowance' | 'provided' | 'none'
                  }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="none">None</option>
                <option value="allowance">Daily Allowance</option>
                <option value="provided">Office Meals Provided</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Monthly Value (₪)</label>
              <input
                type="number"
                min="0"
                step="50"
                value={perks.meals.value}
                onChange={(e) => handlePerksChange({
                  meals: {
                    ...perks.meals,
                    value: Number(e.target.value)
                  }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="750"
              />
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            💡 Typical meal allowance: ₪25-50/day (₪500-1000/month). Tax-exempt up to certain limits.
          </p>
        </div>

        {/* Transportation */}
        <div className="border-b border-gray-200 pb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Transportation Benefits
          </label>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Monthly Transportation Allowance (₪)</label>
            <input
              type="number"
              min="0"
              step="50"
              value={perks.transportation}
              onChange={(e) => handlePerksChange({ transportation: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="380"
            />
          </div>
          <p className="text-sm text-gray-600 mt-2">
            💡 Public transport allowance up to ₪380/month is tax-exempt. Parking worth ₪200-500/month in Tel Aviv.
          </p>
        </div>

        {/* Technology & Equipment */}
        <div className="border-b border-gray-200 pb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Technology & Equipment
          </label>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Laptop Provided</label>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={perks.laptop.provided}
                  onChange={(e) => handlePerksChange({
                    laptop: {
                      ...perks.laptop,
                      provided: e.target.checked
                    }
                  })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Company provides laptop</span>
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Annual Value (₪)</label>
              <input
                type="number"
                min="0"
                step="500"
                value={perks.laptop.annualValue}
                onChange={(e) => handlePerksChange({
                  laptop: {
                    ...perks.laptop,
                    annualValue: Number(e.target.value)
                  }
                })}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                placeholder="8000"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Phone Stipend (₪/month)</label>
              <input
                type="number"
                min="0"
                step="25"
                value={perks.phoneStipend}
                onChange={(e) => handlePerksChange({ phoneStipend: Number(e.target.value) })}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                placeholder="150"
              />
            </div>
          </div>
          <div className="mt-3">
            <label className="block text-xs text-gray-600 mb-1">Internet Stipend (₪/month)</label>
            <input
              type="number"
              min="0"
              step="25"
              value={perks.internetStipend}
              onChange={(e) => handlePerksChange({ internetStipend: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="100"
            />
          </div>
        </div>

        {/* Professional Development */}
        <div className="border-b border-gray-200 pb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Professional Development
          </label>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Learning Budget (₪/year)</label>
            <input
              type="number"
              min="0"
              step="500"
              value={perks.learningBudget}
              onChange={(e) => handlePerksChange({ learningBudget: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="5000"
            />
          </div>
        </div>

        {/* Work Environment */}
        <div className="border-b border-gray-200 pb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Work Environment & Flexibility
          </label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Remote Work Allowed</label>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={perks.flexibleWork.remoteAllowed}
                  onChange={(e) => handlePerksChange({
                    flexibleWork: {
                      ...perks.flexibleWork,
                      remoteAllowed: e.target.checked
                    }
                  })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Remote work allowed</span>
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Hybrid Days per Week</label>
              <select
                value={perks.flexibleWork.hybridDays || 0}
                onChange={(e) => handlePerksChange({
                  flexibleWork: {
                    ...perks.flexibleWork,
                    hybridDays: Number(e.target.value)
                  }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={0}>No remote work</option>
                <option value={1}>1 day remote</option>
                <option value={2}>2 days remote</option>
                <option value={3}>3 days remote</option>
                <option value={4}>4 days remote</option>
                <option value={5}>Full remote</option>
              </select>
            </div>
          </div>
        </div>

        {/* Gym Membership */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Gym Membership
          </label>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Monthly Gym Allowance (₪)</label>
            <input
              type="number"
              min="0"
              step="50"
              value={perks.gymMembership}
              onChange={(e) => handlePerksChange({ gymMembership: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="200"
            />
          </div>
        </div>

        {/* Perks Summary */}
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-orange-900 mb-2">🎯 Perks Valuation Tips</h4>
          <ul className="text-sm text-orange-800 space-y-1">
            <li>• Remote work can save ₪1,000+ monthly on commuting and meals</li>
            <li>• Professional development budget adds long-term career value</li>
            <li>• Office amenities and meal allowances reduce personal expenses</li>
            <li>• Consider the tax implications of different perk types</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 