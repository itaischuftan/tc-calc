'use client';

import React, { useState, useEffect } from 'react';
import { useCompensation } from '@/contexts/CompensationContext';
import { EquityGrant, VestingSchedule } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAnalytics } from '@/utils/analytics';

export default function EquityInput() {
  const { state, dispatch } = useCompensation();
  const { equity } = state.currentPackage;
  const [selectedGrant, setSelectedGrant] = useState<string | null>(null);
  const { trackInteraction } = useAnalytics();

  const handleEquityChange = (updates: Partial<typeof equity>) => {
    dispatch({
      type: 'UPDATE_EQUITY',
      payload: updates
    });
  };

  const createNewGrant = (type: 'RSU' | 'ISO' | 'NQSO' | 'ESPP') => {
    const newGrant: EquityGrant = {
      id: `grant-${Date.now()}`,
      type,
      amount: type === 'ESPP' ? 10 : 0, // For ESPP, amount represents salary deduction %
      grantDate: new Date(),
      vestingStart: new Date(),
      vestingSchedule: {
        type: 'standard',
        totalYears: type === 'ESPP' ? 1 : 4, // ESPP typically has purchase periods
        cliffMonths: type === 'ESPP' ? 0 : 12,
        frequency: type === 'ESPP' ? 'quarterly' : 'quarterly'
      },
      strikePrice: type === 'ESPP' ? 15 : (type !== 'RSU' ? 0 : undefined), // For ESPP, represents discount %
      currentStockPrice: 0,
      companyValuation: 0,
      companyStage: 'startup'
    };

    handleEquityChange({
      grants: [...equity.grants, newGrant]
    });
    setSelectedGrant(newGrant.id);
    
    // Analytics tracking
    trackInteraction('equity_grant_added', {
      grant_type: type,
      total_grants: equity.grants.length + 1
    });
  };

  const updateGrant = (grantId: string, updates: Partial<EquityGrant>) => {
    const updatedGrants = equity.grants.map(grant =>
      grant.id === grantId ? { ...grant, ...updates } : grant
    );
    handleEquityChange({ grants: updatedGrants });
  };

  const removeGrant = (grantId: string) => {
    const grant = equity.grants.find(g => g.id === grantId);
    const updatedGrants = equity.grants.filter(grant => grant.id !== grantId);
    handleEquityChange({ grants: updatedGrants });
    if (selectedGrant === grantId) {
      setSelectedGrant(null);
    }
    
    // Analytics tracking
    if (grant) {
      trackInteraction('equity_grant_removed', {
        grant_type: grant.type,
        total_grants: updatedGrants.length
      });
    }
  };

  const updateVestingSchedule = (grantId: string, schedule: Partial<VestingSchedule>) => {
    const grant = equity.grants.find(g => g.id === grantId);
    if (grant) {
      updateGrant(grantId, {
        vestingSchedule: { ...grant.vestingSchedule, ...schedule }
      });
    }
  };

  const selectedGrantData = selectedGrant ? equity.grants.find(g => g.id === selectedGrant) : null;

  // Calculate total equity value for preview
  const totalEquityValue = equity.grants.reduce((total, grant) => {
    if (!grant.currentStockPrice || grant.currentStockPrice <= 0) return total;
    
    if (grant.type === 'RSU') {
      return total + (grant.amount * grant.currentStockPrice);
    } else if (grant.type === 'ESPP') {
      // For ESPP, estimate annual purchase based on salary deduction and discount
      const annualSalary = state.currentPackage.salary.baseSalary * 
        (state.currentPackage.salary.frequency === 'monthly' ? 12 : 1);
      const monthlyDeduction = (annualSalary / 12) * (grant.amount / 100); // grant.amount is deduction %
      const annualDeduction = monthlyDeduction * 12;
      const discountRate = (grant.strikePrice || 15) / 100; // strikePrice stores discount %
      const purchasePrice = grant.currentStockPrice * (1 - discountRate);
      const sharesPerYear = annualDeduction / purchasePrice;
      const immediateGain = sharesPerYear * (grant.currentStockPrice - purchasePrice);
      return total + immediateGain;
    } else if (grant.strikePrice !== undefined) {
      // For options, calculate intrinsic value
      const intrinsicValue = Math.max(0, grant.currentStockPrice - grant.strikePrice);
      return total + (grant.amount * intrinsicValue);
    }
    
    return total;
  }, 0);

  const getEquityTypeInfo = (type: string) => {
    switch (type) {
      case 'RSU':
        return {
          name: 'Restricted Stock Units',
          description: 'Company shares that vest over time',
          taxInfo: 'Taxed as income at vesting (up to 50% rate in Israel)',
          color: 'bg-blue-50 border-blue-200 text-blue-800'
        };
      case 'ISO':
        return {
          name: 'Incentive Stock Options',
          description: 'Tax-advantaged employee stock options',
          taxInfo: 'No tax at grant/exercise if held >2 years, capital gains on sale',
          color: 'bg-green-50 border-green-200 text-green-800'
        };
      case 'NQSO':
        return {
          name: 'Non-Qualified Stock Options',
          description: 'Standard employee stock options',
          taxInfo: 'Income tax on exercise spread, capital gains on sale',
          color: 'bg-purple-50 border-purple-200 text-purple-800'
        };
      case 'ESPP':
        return {
          name: 'Employee Stock Purchase Plan',
          description: 'Discounted company stock purchases',
          taxInfo: 'Discount taxed as income, gains as capital gains',
          color: 'bg-orange-50 border-orange-200 text-orange-800'
        };
      default:
        return {
          name: 'Unknown',
          description: '',
          taxInfo: '',
          color: 'bg-gray-50 border-gray-200 text-gray-800'
        };
    }
  };

  // Auto-select first grant if none selected
  useEffect(() => {
    if (equity.grants.length > 0 && !selectedGrant) {
      setSelectedGrant(equity.grants[0].id);
    }
  }, [equity.grants, selectedGrant]);

  return (
    <div className="space-y-6">
      {/* Header with Value Preview */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <span>💎</span>
            Equity & Stock Compensation
          </h3>
          {totalEquityValue > 0 && (
            <p className="text-sm text-gray-600 mt-1">
              Current equity value: <span className="font-medium text-green-600">
                ${totalEquityValue.toLocaleString()}
              </span>
            </p>
          )}
        </div>
        <Badge variant="secondary" className="text-xs">
          {equity.grants.length} grant{equity.grants.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      {/* Add New Grant Buttons */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Add Equity Grant</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {(['RSU', 'ISO', 'NQSO', 'ESPP'] as const).map((type) => {
              return (
                <Button
                  key={type}
                  variant="outline"
                  onClick={() => createNewGrant(type)}
                  className="flex flex-col items-center p-4 h-auto"
                >
                  <div className="font-medium text-sm">{type}</div>
                  <div className="text-xs text-gray-600 text-center mt-1">
                    {type === 'RSU' && 'Stock Units'}
                    {type === 'ISO' && 'Tax Advantage'}
                    {type === 'NQSO' && 'Standard Options'}
                    {type === 'ESPP' && 'Purchase Plan'}
                  </div>
                </Button>
              );
            })}
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>💡 Pro Tip:</strong> Add all your equity grants to get an accurate total compensation picture. 
              The calculator will handle vesting schedules and Israeli tax implications automatically.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Grants List */}
      {equity.grants.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Your Equity Grants</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {equity.grants.map((grant) => {
                const info = getEquityTypeInfo(grant.type);
                const isSelected = selectedGrant === grant.id;
                
                let grantValue = 0;
                let displayText = '';
                
                if (grant.type === 'ESPP') {
                  displayText = `${grant.amount}% deduction, ${grant.strikePrice || 15}% discount`;
                  if (grant.currentStockPrice) {
                    const annualSalary = state.currentPackage.salary.baseSalary * 
                      (state.currentPackage.salary.frequency === 'monthly' ? 12 : 1);
                    const monthlyDeduction = (annualSalary / 12) * (grant.amount / 100);
                    const annualDeduction = monthlyDeduction * 12;
                    const discountRate = (grant.strikePrice || 15) / 100;
                    const purchasePrice = grant.currentStockPrice * (1 - discountRate);
                    const sharesPerYear = annualDeduction / purchasePrice;
                    grantValue = sharesPerYear * (grant.currentStockPrice - purchasePrice);
                  }
                } else {
                  displayText = `${grant.amount.toLocaleString()} ${grant.type === 'RSU' ? 'units' : 'shares'}`;
                  if (grant.currentStockPrice && grant.amount) {
                    if (grant.type === 'RSU') {
                      grantValue = grant.amount * grant.currentStockPrice;
                    } else if (grant.strikePrice !== undefined) {
                      grantValue = grant.amount * Math.max(0, grant.currentStockPrice - grant.strikePrice);
                    }
                  }
                }
                
                return (
                  <Card
                    key={grant.id}
                    className={`cursor-pointer transition-all ${
                      isSelected ? 'ring-2 ring-blue-500 border-blue-300' : 'hover:shadow-md'
                    }`}
                    onClick={() => setSelectedGrant(grant.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={info.color}>
                              {grant.type}
                            </Badge>
                            <span className="text-sm font-medium">
                              {displayText}
                            </span>
                          </div>
                          <div className="text-xs text-gray-600 space-y-1">
                            <div>Granted: {grant.grantDate && !isNaN(grant.grantDate.getTime()) 
                              ? grant.grantDate.toLocaleDateString() 
                              : 'Invalid Date'}</div>
                            {grant.type !== 'ESPP' && (
                              <div>Vesting: {grant.vestingSchedule.totalYears}y {grant.vestingSchedule.frequency}</div>
                            )}
                            {grant.type !== 'RSU' && grant.type !== 'ESPP' && grant.strikePrice && (
                              <div>Strike: ${grant.strikePrice.toFixed(2)}</div>
                            )}
                            {grantValue > 0 && (
                              <div className="font-medium text-green-600">
                                {grant.type === 'ESPP' ? 'Annual gain' : 'Value'}: ${grantValue.toLocaleString()}
                              </div>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeGrant(grant.id);
                          }}
                          className="text-red-600 hover:text-red-800 p-1"
                        >
                          ×
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Selected Grant Details */}
      {selectedGrantData && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Badge className={getEquityTypeInfo(selectedGrantData.type).color}>
                {selectedGrantData.type}
              </Badge>
              Grant Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedGrantData.type === 'ESPP' ? (
              /* Simplified ESPP Configuration */
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-medium text-gray-900">Employee Stock Purchase Plan (ESPP)</h3>
                    <p className="text-sm text-gray-600">Configure your ESPP participation and stock prices</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-700">Enable ESPP</span>
                    <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-green-600 transition-colors">
                      <div className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6"></div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Monthly Salary Deduction (%)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="1"
                        max="15"
                        step="1"
                        value={selectedGrantData.amount}
                        onChange={(e) => updateGrant(selectedGrantData.id, { amount: Number(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="10"
                      />
                      <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500">%</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Typically 1-15% of gross salary</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Stock Discount (%)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="5"
                        max="25"
                        step="1"
                        value={selectedGrantData.strikePrice || 15}
                        onChange={(e) => updateGrant(selectedGrantData.id, { strikePrice: Number(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="15"
                      />
                      <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500">%</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Discount from market price</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Stock Price (USD)
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">$</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={selectedGrantData.currentStockPrice || 0}
                      onChange={(e) => updateGrant(selectedGrantData.id, { currentStockPrice: Number(e.target.value) })}
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="100.00"
                    />
                  </div>
                </div>

                {/* ESPP Value Preview */}
                {selectedGrantData.currentStockPrice && selectedGrantData.currentStockPrice > 0 && (
                  <Card className="bg-green-50 border-green-200">
                    <CardContent className="p-4">
                      <h4 className="text-sm font-medium text-green-900 mb-3">💰 ESPP Value Calculation</h4>
                      <div className="space-y-2 text-sm">
                        {(() => {
                          const annualSalary = state.currentPackage.salary.baseSalary * 
                            (state.currentPackage.salary.frequency === 'monthly' ? 12 : 1);
                          const monthlyDeduction = (annualSalary / 12) * (selectedGrantData.amount / 100);
                          const annualDeduction = monthlyDeduction * 12;
                          const discountRate = (selectedGrantData.strikePrice || 15) / 100;
                          const purchasePrice = selectedGrantData.currentStockPrice * (1 - discountRate);
                          const sharesPerYear = annualDeduction / purchasePrice;
                          const immediateGain = sharesPerYear * (selectedGrantData.currentStockPrice - purchasePrice);

                          return (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <div className="text-green-700">Monthly Deduction:</div>
                                <div className="font-semibold text-green-900">
                                  ${monthlyDeduction.toLocaleString(undefined, {maximumFractionDigits: 0})}
                                </div>
                              </div>
                              <div>
                                <div className="text-green-700">Purchase Price:</div>
                                <div className="font-semibold text-green-900">
                                  ${purchasePrice.toFixed(2)} ({(selectedGrantData.strikePrice || 15)}% discount)
                                </div>
                              </div>
                              <div>
                                <div className="text-green-700">Shares per Year:</div>
                                <div className="font-semibold text-green-900">
                                  {sharesPerYear.toLocaleString(undefined, {maximumFractionDigits: 0})}
                                </div>
                              </div>
                              <div>
                                <div className="text-green-700">Annual Immediate Gain:</div>
                                <div className="font-semibold text-green-900">
                                  ${immediateGain.toLocaleString(undefined, {maximumFractionDigits: 0})}
                                </div>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                      <div className="mt-3 text-xs text-green-700">
                        💡 This shows immediate gain from discount. Additional gains possible if stock price increases.
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              /* Standard Equity Configuration */
              <Tabs defaultValue="basics" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="basics">📊 Basics</TabsTrigger>
                  <TabsTrigger value="vesting">⏰ Vesting</TabsTrigger>
                  <TabsTrigger value="valuation">💰 Valuation</TabsTrigger>
                </TabsList>

                <TabsContent value="basics" className="space-y-4 mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Number of {selectedGrantData.type === 'RSU' ? 'Units' : 'Shares'}
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="100"
                        value={selectedGrantData.amount}
                        onChange={(e) => updateGrant(selectedGrantData.id, { amount: Number(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Grant Date
                      </label>
                      <input
                        type="date"
                        value={selectedGrantData.grantDate && !isNaN(selectedGrantData.grantDate.getTime()) 
                          ? selectedGrantData.grantDate.toISOString().split('T')[0] 
                          : new Date().toISOString().split('T')[0]}
                        onChange={(e) => {
                          // Only update if the date is valid and not empty
                          if (e.target.value && !isNaN(new Date(e.target.value).getTime())) {
                            updateGrant(selectedGrantData.id, { grantDate: new Date(e.target.value) });
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    {selectedGrantData.type !== 'RSU' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Strike Price (USD)
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={selectedGrantData.strikePrice || 0}
                          onChange={(e) => updateGrant(selectedGrantData.id, { strikePrice: Number(e.target.value) })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Company Stage
                      </label>
                      <select
                        value={selectedGrantData.companyStage}
                        onChange={(e) => updateGrant(selectedGrantData.id, { 
                          companyStage: e.target.value as 'startup' | 'growth' | 'public' | 'pre-ipo'
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="startup">🚀 Startup</option>
                        <option value="growth">📈 Growth</option>
                        <option value="pre-ipo">📋 Pre-IPO</option>
                        <option value="public">🏛️ Public</option>
                      </select>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="vesting" className="space-y-4 mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Vesting Period (Years)
                      </label>
                      <select
                        value={selectedGrantData.vestingSchedule.totalYears}
                        onChange={(e) => updateVestingSchedule(selectedGrantData.id, { 
                          totalYears: Number(e.target.value) 
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value={1}>1 Year</option>
                        <option value={2}>2 Years</option>
                        <option value={3}>3 Years</option>
                        <option value={4}>4 Years (Standard)</option>
                        <option value={5}>5 Years</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cliff Period (Months)
                      </label>
                      <select
                        value={selectedGrantData.vestingSchedule.cliffMonths || 0}
                        onChange={(e) => updateVestingSchedule(selectedGrantData.id, { 
                          cliffMonths: Number(e.target.value) || undefined
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value={0}>No Cliff</option>
                        <option value={6}>6 Months</option>
                        <option value={12}>12 Months (Standard)</option>
                        <option value={18}>18 Months</option>
                        <option value={24}>24 Months</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Vesting Frequency
                      </label>
                      <select
                        value={selectedGrantData.vestingSchedule.frequency}
                        onChange={(e) => updateVestingSchedule(selectedGrantData.id, { 
                          frequency: e.target.value as 'monthly' | 'quarterly' | 'annual'
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="monthly">Monthly</option>
                        <option value="quarterly">Quarterly (Standard)</option>
                        <option value="annual">Annual</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Vesting Start Date
                    </label>
                    <input
                      type="date"
                                              value={selectedGrantData.vestingStart && !isNaN(selectedGrantData.vestingStart.getTime())
                          ? selectedGrantData.vestingStart.toISOString().split('T')[0]
                          : new Date().toISOString().split('T')[0]}
                      onChange={(e) => {
                        // Only update if the date is valid and not empty
                        if (e.target.value && !isNaN(new Date(e.target.value).getTime())) {
                          updateGrant(selectedGrantData.id, { vestingStart: new Date(e.target.value) });
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="valuation" className="space-y-4 mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Current Stock Price (USD)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={selectedGrantData.currentStockPrice || 0}
                        onChange={(e) => updateGrant(selectedGrantData.id, { currentStockPrice: Number(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Company Valuation (USD M)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={selectedGrantData.companyValuation || 0}
                        onChange={(e) => updateGrant(selectedGrantData.id, { companyValuation: Number(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., 100 for $100M"
                      />
                    </div>
                  </div>

                  {/* Current Value Display */}
                  {selectedGrantData.currentStockPrice && selectedGrantData.currentStockPrice > 0 && (
                    <Card className="bg-green-50 border-green-200">
                      <CardContent className="p-4">
                        <h4 className="text-sm font-medium text-green-900 mb-2">💰 Current Equity Value</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <div className="text-green-700">
                              {selectedGrantData.type === 'RSU' ? 'Gross Value:' : 'Intrinsic Value:'}
                            </div>
                            <div className="font-semibold text-green-900">
                              ${(selectedGrantData.type === 'RSU' 
                                ? selectedGrantData.amount * selectedGrantData.currentStockPrice
                                : selectedGrantData.strikePrice !== undefined
                                  ? selectedGrantData.amount * Math.max(0, selectedGrantData.currentStockPrice - selectedGrantData.strikePrice)
                                  : 0
                              ).toLocaleString()}
                            </div>
                          </div>
                          {selectedGrantData.type !== 'RSU' && selectedGrantData.strikePrice && (
                            <div>
                              <div className="text-green-700">Exercise Cost:</div>
                              <div className="font-semibold text-green-900">
                                ${(selectedGrantData.amount * selectedGrantData.strikePrice).toLocaleString()}
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="mt-3 text-xs text-green-700">
                          💡 This is the pre-tax value. Actual value will be lower after Israeli taxes.
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      )}

      {/* Israeli Tax Information */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-blue-900 flex items-center gap-2">
            <span>🇮🇱</span>
            Israeli Equity Tax Considerations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div>
              <h4 className="font-medium mb-2">🏛️ Tax Tracks</h4>
              <ul className="space-y-1">
                <li>• <strong>102 Track:</strong> Lower tax, longer holding period</li>
                <li>• <strong>3(i) Track:</strong> Higher tax, more flexibility</li>
                <li>• Consult a tax advisor for optimal choice</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">💸 Tax Rates</h4>
              <ul className="space-y-1">
                <li>• <strong>RSUs:</strong> Income tax at vesting (up to 50%)</li>
                <li>• <strong>Options:</strong> Income tax on exercise spread</li>
                <li>• <strong>Capital Gains:</strong> 25% on sale profits</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Empty State */}
      {equity.grants.length === 0 && (
        <Card className="border-dashed border-2 border-gray-300">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-100 to-blue-200 rounded-full flex items-center justify-center">
              <span className="text-2xl">💎</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Equity Grants Yet</h3>
            <p className="text-gray-600 mb-4">
              Add your stock options, RSUs, or ESPP grants to calculate their value and tax implications.
            </p>
            <div className="text-sm text-gray-500">
              Israeli tech companies commonly offer equity as part of total compensation packages.
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 