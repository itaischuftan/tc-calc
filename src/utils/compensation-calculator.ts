import { CompensationPackage, CompensationCalculation, SalaryData, BenefitsData, EquityData, PerksData, ComponentBreakdown } from '@/types';
import { TaxCalculator } from './tax-calculator';
import { CurrencyConverter } from './currency-converter';
import { EquityValuator } from './equity-valuator';
import { BenefitsCalculator } from './benefits-calculator';

export class CompensationCalculator {
  /**
   * Main function to calculate total compensation
   */
  static async calculateTotalCompensation(packageData: CompensationPackage): Promise<CompensationCalculation> {
    try {
      // Get current exchange rate
      const exchangeRate = await CurrencyConverter.getCurrentExchangeRate();
      
      // Calculate base salary in ILS
      const annualSalaryILS = await this.calculateAnnualSalaryILS(packageData.salary);
      const monthlySalaryILS = annualSalaryILS / 12;
      
      // Calculate each component
      const baseSalaryBreakdown = await this.calculateBaseSalaryBreakdown(packageData.salary);
      const benefitsBreakdown = this.calculateBenefitsBreakdown(monthlySalaryILS, packageData.benefits);
      const equityBreakdown = await this.calculateEquityBreakdown(packageData.equity);
      const perksBreakdown = this.calculatePerksBreakdown(packageData.perks);
      
      // Calculate tax implications
      const taxBreakdown = TaxCalculator.getAnnualTaxBreakdown(monthlySalaryILS);
      
      // Calculate totals
      const totalGrossCompensation = 
        baseSalaryBreakdown.gross + 
        benefitsBreakdown.gross + 
        equityBreakdown.gross + 
        perksBreakdown.gross;
      
      const totalNetCompensation = 
        baseSalaryBreakdown.net + 
        benefitsBreakdown.net + 
        equityBreakdown.net + 
        perksBreakdown.net;
      
      return {
        totalAnnualCompensation: totalGrossCompensation,
        breakdown: {
          baseSalary: baseSalaryBreakdown,
          benefits: benefitsBreakdown,
          equity: equityBreakdown,
          perks: perksBreakdown
        },
        taxImplications: taxBreakdown,
        netCompensation: totalNetCompensation,
        exchangeRates: {
          usdToIls: exchangeRate,
          timestamp: new Date()
        },
        calculatedAt: new Date()
      };
    } catch (error) {
      console.error('Error calculating total compensation:', error);
      throw new Error('Failed to calculate compensation. Please check your inputs and try again.');
    }
  }

  /**
   * Calculate annual salary in ILS
   */
  private static async calculateAnnualSalaryILS(salaryData: SalaryData): Promise<number> {
    let baseSalary = salaryData.baseSalary;
    
    // Convert frequency to annual
    if (salaryData.frequency === 'monthly') {
      baseSalary = baseSalary * 12;
    }
    
    // Convert currency if needed
    if (salaryData.currency === 'USD') {
      baseSalary = await CurrencyConverter.convertUSDToILS(baseSalary);
    }
    
    // Add bonus if present
    if (salaryData.bonus) {
      let bonusAmount = salaryData.bonus.amount;
      if (salaryData.bonus.frequency === 'quarterly') {
        bonusAmount = bonusAmount * 4;
      }
      
      // Convert bonus currency if needed
      if (salaryData.currency === 'USD') {
        bonusAmount = await CurrencyConverter.convertUSDToILS(bonusAmount);
      }
      
      baseSalary += bonusAmount;
    }
    
    return baseSalary;
  }

  /**
   * Calculate base salary breakdown
   */
  private static async calculateBaseSalaryBreakdown(salaryData: SalaryData): Promise<ComponentBreakdown> {
    const annualSalaryILS = await this.calculateAnnualSalaryILS(salaryData);
    const monthlySalaryILS = annualSalaryILS / 12;
    
    // Calculate net salary after taxes
    const netSalaryResult = TaxCalculator.getNetSalary(monthlySalaryILS);
    const annualNetSalary = netSalaryResult.netSalary * 12;
    
    const components: { [key: string]: { value: number; method: string; assumptions: string[] } } = {
      baseSalary: {
        value: annualSalaryILS,
        method: 'annual_salary_calculation',
        assumptions: [
          `Original currency: ${salaryData.currency}`,
          `Frequency: ${salaryData.frequency}`,
          salaryData.currency === 'USD' ? 'Converted to ILS using current exchange rate' : 'Already in ILS'
        ]
      }
    };
    
    if (salaryData.bonus) {
      const bonusMultiplier = salaryData.bonus.frequency === 'quarterly' ? 4 : 1;
      let annualBonus = salaryData.bonus.amount * bonusMultiplier;
      
      if (salaryData.currency === 'USD') {
        annualBonus = await CurrencyConverter.convertUSDToILS(annualBonus);
      }
      
      components.bonus = {
        value: annualBonus,
        method: 'bonus_calculation',
        assumptions: [
          `${salaryData.bonus.frequency} bonus`,
          salaryData.bonus.guaranteed ? 'Guaranteed bonus' : 'Performance-based bonus'
        ]
      };
    }
    
    return {
      gross: annualSalaryILS,
      net: annualNetSalary,
      components
    };
  }

  /**
   * Calculate benefits breakdown
   */
  private static calculateBenefitsBreakdown(monthlySalaryILS: number, benefitsData: BenefitsData): ComponentBreakdown {
    return BenefitsCalculator.calculateComprehensiveBenefits(monthlySalaryILS, benefitsData);
  }

  /**
   * Calculate equity breakdown
   */
  private static async calculateEquityBreakdown(equityData: EquityData): Promise<ComponentBreakdown> {
    if (!equityData.grants || equityData.grants.length === 0) {
      return {
        gross: 0,
        net: 0,
        components: {}
      };
    }
    
    const equitySummary = await EquityValuator.generateEquitySummary(equityData.grants);
    
    const components: { [key: string]: { value: number; method: string; assumptions: string[] } } = {};
    
    // Group grants by type for breakdown
    const grantsByType = equityData.grants.reduce((acc, grant) => {
      if (!acc[grant.type]) acc[grant.type] = [];
      acc[grant.type].push(grant);
      return acc;
    }, {} as { [key: string]: typeof equityData.grants });
    
    for (const [type, grants] of Object.entries(grantsByType)) {
      let typeValue = 0;
      const assumptions: string[] = [];
      
      if (type === 'RSU') {
        const rsuValuation = await EquityValuator.valueRSUs(grants);
        typeValue = rsuValuation.currentValue;
        assumptions.push(...rsuValuation.assumptions);
      } else if (type === 'ISO' || type === 'NQSO') {
        const optionValuation = await EquityValuator.valueStockOptions(grants);
        typeValue = optionValuation.currentValue;
        assumptions.push(...optionValuation.assumptions);
      } else if (type === 'ESPP') {
        const esppValuation = await EquityValuator.valueESPP(grants);
        typeValue = esppValuation.currentValue;
        assumptions.push(...esppValuation.assumptions);
      }
      
      if (typeValue > 0) {
        components[type.toLowerCase()] = {
          value: typeValue,
          method: 'equity_valuation',
          assumptions
        };
      }
    }
    
    return {
      gross: equitySummary.totalCurrentValue,
      net: equitySummary.totalPostTaxValue,
      components
    };
  }

  /**
   * Calculate perks breakdown
   */
  private static calculatePerksBreakdown(perksData: PerksData): ComponentBreakdown {
    const perksValue = BenefitsCalculator.calculatePerksValue(perksData);
    
    const components: { [key: string]: { value: number; method: string; assumptions: string[] } } = {};
    
    for (const [perkName, value] of Object.entries(perksValue.breakdown)) {
      if (value > 0) {
        components[perkName] = {
          value,
          method: 'annual_value_calculation',
          assumptions: ['Valued at market rate or stipend amount']
        };
      }
    }
    
    return {
      gross: perksValue.totalAnnualValue,
      net: perksValue.totalAnnualValue, // Perks typically not taxed directly
      components
    };
  }

  /**
   * Quick calculation for real-time updates (without full breakdown)
   */
  static async calculateQuickTotal(
    monthlySalary: number,
    currency: 'ILS' | 'USD',
    hasEquity: boolean = false,
    hasBenefits: boolean = true
  ): Promise<number> {
    try {
      // Convert to ILS if needed
      let salaryILS = monthlySalary;
      if (currency === 'USD') {
        salaryILS = await CurrencyConverter.convertUSDToILS(monthlySalary);
      }
      
      const annualSalaryILS = salaryILS * 12;
      
      // Add basic benefits (pension + study fund)
      let benefitsValue = 0;
      if (hasBenefits) {
        benefitsValue = BenefitsCalculator.calculatePensionValue(salaryILS) +
                       BenefitsCalculator.calculateStudyFundValue(salaryILS) +
                       BenefitsCalculator.calculateHealthInsuranceValue('basic');
      }
      
      // Add estimated equity (simplified)
      let equityValue = 0;
      if (hasEquity) {
        equityValue = annualSalaryILS * 0.3; // Rough estimate of 30% of salary in equity
      }
      
      return annualSalaryILS + benefitsValue + equityValue;
    } catch (error) {
      console.error('Quick calculation error:', error);
      return 0;
    }
  }

  /**
   * Validate compensation package inputs
   */
  static validateInputs(packageData: CompensationPackage): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Validate salary
    if (!packageData.salary.baseSalary || packageData.salary.baseSalary <= 0) {
      errors.push('Base salary must be greater than 0');
    }
    
    if (packageData.salary.baseSalary > 200000 && packageData.salary.currency === 'ILS') {
      errors.push('Monthly salary seems unusually high. Please verify the amount.');
    }
    
    if (packageData.salary.baseSalary > 50000 && packageData.salary.currency === 'USD') {
      errors.push('Monthly salary in USD seems unusually high. Please verify the amount.');
    }
    
    // Validate benefits
    if (packageData.benefits.pensionFund.employerContribution < 0 || 
        packageData.benefits.pensionFund.employerContribution > 10) {
      errors.push('Pension fund employer contribution should be between 0% and 10%');
    }
    
    if (packageData.benefits.studyFund.employerContribution < 0 || 
        packageData.benefits.studyFund.employerContribution > 15) {
      errors.push('Study fund employer contribution should be between 0% and 15%');
    }
    
    if (packageData.benefits.vacationDays < 0 || packageData.benefits.vacationDays > 50) {
      errors.push('Vacation days should be between 0 and 50');
    }
    
    // Validate equity
    if (packageData.equity.grants) {
      for (const grant of packageData.equity.grants) {
        if (grant.amount <= 0) {
          errors.push(`Equity grant amount must be greater than 0`);
        }
        
        if (grant.type === 'ISO' || grant.type === 'NQSO') {
          if (!grant.strikePrice || grant.strikePrice < 0) {
            errors.push(`Strike price is required for stock options`);
          }
        }
        
        if (grant.currentStockPrice && grant.currentStockPrice < 0) {
          errors.push(`Current stock price must be positive`);
        }
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Generate summary statistics
   */
  static generateSummaryStats(calculation: CompensationCalculation): {
    totalCompensation: number;
    netCompensation: number;
    effectiveTaxRate: number;
    salaryPercentage: number;
    benefitsPercentage: number;
    equityPercentage: number;
    perksPercentage: number;
  } {
    const { breakdown, totalAnnualCompensation, netCompensation, taxImplications } = calculation;
    
    return {
      totalCompensation: totalAnnualCompensation,
      netCompensation,
      effectiveTaxRate: taxImplications.effectiveTaxRate,
      salaryPercentage: (breakdown.baseSalary.gross / totalAnnualCompensation) * 100,
      benefitsPercentage: (breakdown.benefits.gross / totalAnnualCompensation) * 100,
      equityPercentage: (breakdown.equity.gross / totalAnnualCompensation) * 100,
      perksPercentage: (breakdown.perks.gross / totalAnnualCompensation) * 100
    };
  }
} 