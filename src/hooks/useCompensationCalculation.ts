'use client';

import { useState, useEffect, useCallback } from 'react';
import { CompensationCalculator } from '@/utils/compensation-calculator';
import { useCompensation } from '@/contexts/CompensationContext';

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function useCompensationCalculation() {
  const { state, calculateCompensation } = useCompensation();
  const [autoCalculateEnabled, setAutoCalculateEnabled] = useState(true);
  const [quickTotal, setQuickTotal] = useState<number>(0);
  
  // Debounce the package data to avoid too frequent calculations
  const debouncedPackage = useDebounce(state.currentPackage, 500);

  // Quick calculation for real-time preview
  const calculateQuickTotal = useCallback(async () => {
    if (!autoCalculateEnabled) return;
    
    try {
      const hasEquity = state.currentPackage.equity.grants.length > 0;
      const total = await CompensationCalculator.calculateQuickTotal(
        state.currentPackage.salary.baseSalary,
        state.currentPackage.salary.currency,
        hasEquity,
        true // always include benefits
      );
      setQuickTotal(total);
    } catch (error) {
      console.error('Quick calculation error:', error);
      setQuickTotal(0);
    }
  }, [state.currentPackage, autoCalculateEnabled]);

  // Auto-calculate when package changes (debounced)
  useEffect(() => {
    if (autoCalculateEnabled) {
      calculateQuickTotal();
    }
  }, [debouncedPackage, autoCalculateEnabled, calculateQuickTotal]);

  // Manual full calculation
  const performFullCalculation = useCallback(async () => {
    await calculateCompensation();
  }, [calculateCompensation]);

  // Validation helper
  const validateCurrentPackage = useCallback(() => {
    return CompensationCalculator.validateInputs(state.currentPackage);
  }, [state.currentPackage]);

  // Summary statistics
  const getSummaryStats = useCallback(() => {
    if (!state.calculation) return null;
    return CompensationCalculator.generateSummaryStats(state.calculation);
  }, [state.calculation]);

  // Format currency helper
  const formatCurrency = useCallback((amount: number, currency: 'ILS' | 'USD' = 'ILS') => {
    return new Intl.NumberFormat(currency === 'ILS' ? 'he-IL' : 'en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }, []);

  // Component breakdown percentages
  const getBreakdownPercentages = useCallback(() => {
    if (!state.calculation) return null;
    
    const { breakdown, totalAnnualCompensation } = state.calculation;
    
    return {
      salary: (breakdown.baseSalary.gross / totalAnnualCompensation) * 100,
      benefits: (breakdown.benefits.gross / totalAnnualCompensation) * 100,
      equity: (breakdown.equity.gross / totalAnnualCompensation) * 100,
      perks: (breakdown.perks.gross / totalAnnualCompensation) * 100
    };
  }, [state.calculation]);

  // Monthly equivalent calculations
  const getMonthlyEquivalents = useCallback(() => {
    if (!state.calculation) return null;
    
    const { breakdown, totalAnnualCompensation, netCompensation } = state.calculation;
    
    return {
      totalGrossMonthly: totalAnnualCompensation / 12,
      totalNetMonthly: netCompensation / 12,
      salaryMonthly: breakdown.baseSalary.gross / 12,
      benefitsMonthly: breakdown.benefits.gross / 12,
      equityMonthly: breakdown.equity.gross / 12,
      perksMonthly: breakdown.perks.gross / 12
    };
  }, [state.calculation]);

  // Comparison helpers
  const compareWithBenchmark = useCallback((benchmarkSalary: number) => {
    if (!quickTotal || quickTotal === 0) return null;
    
    const difference = quickTotal - benchmarkSalary;
    const percentageDifference = (difference / benchmarkSalary) * 100;
    
    return {
      difference,
      percentageDifference,
      isAboveBenchmark: difference > 0,
      isBelowBenchmark: difference < 0
    };
  }, [quickTotal]);

  // Export calculation data
  const getExportData = useCallback(() => {
    if (!state.calculation) return null;
    
    return {
      package: state.currentPackage,
      calculation: state.calculation,
      summaryStats: getSummaryStats(),
      breakdownPercentages: getBreakdownPercentages(),
      monthlyEquivalents: getMonthlyEquivalents(),
      exportedAt: new Date()
    };
  }, [state.currentPackage, state.calculation, getSummaryStats, getBreakdownPercentages, getMonthlyEquivalents]);

  // Error helpers
  const getValidationErrors = useCallback(() => {
    const validation = validateCurrentPackage();
    return validation.isValid ? [] : validation.errors;
  }, [validateCurrentPackage]);

  const hasValidationErrors = useCallback(() => {
    return !validateCurrentPackage().isValid;
  }, [validateCurrentPackage]);

  // Calculation status
  const getCalculationStatus = useCallback(() => {
    if (state.loading.isLoading) return 'calculating';
    if (state.error.hasError) return 'error';
    if (!state.calculation) return 'not_calculated';
    if (hasValidationErrors()) return 'invalid';
    return 'ready';
  }, [state.loading.isLoading, state.error.hasError, state.calculation, hasValidationErrors]);

  return {
    // Core data
    calculation: state.calculation,
    loading: state.loading,
    error: state.error,
    quickTotal,
    
    // Actions
    performFullCalculation,
    setAutoCalculateEnabled,
    calculateQuickTotal,
    
    // Helpers
    formatCurrency,
    validateCurrentPackage,
    getSummaryStats,
    getBreakdownPercentages,
    getMonthlyEquivalents,
    compareWithBenchmark,
    getExportData,
    getValidationErrors,
    hasValidationErrors,
    getCalculationStatus,
    
    // State
    autoCalculateEnabled,
    isCalculating: state.loading.isLoading,
    hasError: state.error.hasError,
    errorMessage: state.error.message,
    isReady: getCalculationStatus() === 'ready',
    needsCalculation: !state.calculation || hasValidationErrors()
  };
} 