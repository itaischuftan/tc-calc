import { TaxBreakdown } from '@/types';
import { 
  ISRAELI_TAX_BRACKETS_2024, 
  BITUACH_LEUMI_2024, 
  PENSION_RATES_2024,
  STUDY_FUND_RATES_2024,
  CAPITAL_GAINS_TAX_2024,
  TAX_POINTS_2024
} from '@/constants/israeli-tax';

export class TaxCalculator {
  /**
   * Calculate Israeli income tax for a given monthly salary
   */
  static calculateIncomeTax(monthlySalary: number, taxPoints: number = TAX_POINTS_2024.singlePersonTaxPoints): number {
    // Apply tax point credit
    const taxPointCredit = taxPoints * TAX_POINTS_2024.taxPointValue;
    const taxableIncome = Math.max(0, monthlySalary - taxPointCredit);
    
    let totalTax = 0;
    let remainingIncome = taxableIncome;
    
    for (const bracket of ISRAELI_TAX_BRACKETS_2024.brackets) {
      if (remainingIncome <= 0) break;
      
      const taxableInThisBracket = Math.min(
        remainingIncome, 
        bracket.max === Infinity ? remainingIncome : bracket.max - bracket.min
      );
      
      totalTax += taxableInThisBracket * bracket.rate;
      remainingIncome -= taxableInThisBracket;
    }
    
    return Math.max(0, totalTax);
  }

  /**
   * Calculate Bituach Leumi (Social Security) contribution
   */
  static calculateBituachLeumi(monthlySalary: number): number {
    const applicableSalary = Math.min(monthlySalary, BITUACH_LEUMI_2024.monthlyCeiling);
    return applicableSalary * BITUACH_LEUMI_2024.rate;
  }

  /**
   * Calculate pension fund contributions (employee + employer)
   */
  static calculatePensionContributions(monthlySalary: number): {
    employee: number;
    employer: number;
    total: number;
  } {
    const applicableSalary = Math.min(monthlySalary, PENSION_RATES_2024.maxMonthlySalaryForPension);
    
    const employeeContribution = applicableSalary * PENSION_RATES_2024.employee.rate;
    const employerContribution = applicableSalary * PENSION_RATES_2024.employer.rate;
    
    return {
      employee: employeeContribution,
      employer: employerContribution,
      total: employeeContribution + employerContribution
    };
  }

  /**
   * Calculate study fund (Keren Hishtalmut) contributions
   */
  static calculateStudyFundContributions(monthlySalary: number): {
    employee: number;
    employer: number;
    total: number;
  } {
    const applicableSalary = Math.min(monthlySalary, STUDY_FUND_RATES_2024.maxMonthlySalaryForStudyFund);
    
    const employeeContribution = applicableSalary * STUDY_FUND_RATES_2024.employee.rate;
    const employerContribution = applicableSalary * STUDY_FUND_RATES_2024.employer.rate;
    
    return {
      employee: employeeContribution,
      employer: employerContribution,
      total: employeeContribution + employerContribution
    };
  }

  /**
   * Calculate capital gains tax on equity
   */
  static calculateCapitalGains(equityGains: number): number {
    if (equityGains <= 0) return 0;
    
    // Apply exemption threshold (annual)
    const taxableGains = Math.max(0, equityGains - CAPITAL_GAINS_TAX_2024.exemptionThreshold);
    return taxableGains * CAPITAL_GAINS_TAX_2024.rate;
  }

  /**
   * Calculate net salary after all deductions
   */
  static getNetSalary(grossMonthlySalary: number, taxPoints: number = TAX_POINTS_2024.singlePersonTaxPoints): {
    grossSalary: number;
    netSalary: number;
    totalDeductions: number;
  } {
    const incomeTax = this.calculateIncomeTax(grossMonthlySalary, taxPoints);
    const bituachLeumi = this.calculateBituachLeumi(grossMonthlySalary);
    const pensionContributions = this.calculatePensionContributions(grossMonthlySalary);
    const studyFundContributions = this.calculateStudyFundContributions(grossMonthlySalary);
    
    const totalDeductions = incomeTax + bituachLeumi + pensionContributions.employee + studyFundContributions.employee;
    const netSalary = grossMonthlySalary - totalDeductions;
    
    return {
      grossSalary: grossMonthlySalary,
      netSalary: Math.max(0, netSalary),
      totalDeductions
    };
  }

  /**
   * Get comprehensive tax breakdown
   */
  static getTaxBreakdown(grossMonthlySalary: number, taxPoints: number = TAX_POINTS_2024.singlePersonTaxPoints): TaxBreakdown {
    const incomeTax = this.calculateIncomeTax(grossMonthlySalary, taxPoints);
    const bituachLeumi = this.calculateBituachLeumi(grossMonthlySalary);
    const pensionContributions = this.calculatePensionContributions(grossMonthlySalary);
    const studyFundContributions = this.calculateStudyFundContributions(grossMonthlySalary);
    
    const totalDeductions = incomeTax + bituachLeumi + pensionContributions.employee + studyFundContributions.employee;
    const netSalary = grossMonthlySalary - totalDeductions;
    
    const effectiveTaxRate = grossMonthlySalary > 0 ? totalDeductions / grossMonthlySalary : 0;
    const marginalTaxRate = this.getMarginalTaxRate(grossMonthlySalary, taxPoints);
    
    return {
      incomeTax,
      bituachLeumi,
      pensionContributions: pensionContributions.employee,
      studyFundContributions: studyFundContributions.employee,
      totalDeductions,
      effectiveTaxRate,
      marginalTaxRate,
      grossSalary: grossMonthlySalary,
      netSalary: Math.max(0, netSalary)
    };
  }

  /**
   * Calculate marginal tax rate (rate on next ILS earned)
   */
  static getMarginalTaxRate(monthlySalary: number, taxPoints: number = TAX_POINTS_2024.singlePersonTaxPoints): number {
    const taxPointCredit = taxPoints * TAX_POINTS_2024.taxPointValue;
    const taxableIncome = Math.max(0, monthlySalary - taxPointCredit);
    
    // Find which bracket the salary falls into
    for (const bracket of ISRAELI_TAX_BRACKETS_2024.brackets) {
      if (taxableIncome >= bracket.min && taxableIncome < bracket.max) {
        // Add Bituach Leumi if under ceiling
        const bituachLeumiRate = monthlySalary < BITUACH_LEUMI_2024.monthlyCeiling ? BITUACH_LEUMI_2024.rate : 0;
        
        // Add pension contribution rates if under ceiling
        const pensionRate = monthlySalary < PENSION_RATES_2024.maxMonthlySalaryForPension ? PENSION_RATES_2024.employee.rate : 0;
        
        // Add study fund rates if under ceiling
        const studyFundRate = monthlySalary < STUDY_FUND_RATES_2024.maxMonthlySalaryForStudyFund ? STUDY_FUND_RATES_2024.employee.rate : 0;
        
        return bracket.rate + bituachLeumiRate + pensionRate + studyFundRate;
      }
    }
    
    // If above all brackets, return highest rate
    const highestBracket = ISRAELI_TAX_BRACKETS_2024.brackets[ISRAELI_TAX_BRACKETS_2024.brackets.length - 1];
    return highestBracket.rate + BITUACH_LEUMI_2024.rate + PENSION_RATES_2024.employee.rate + STUDY_FUND_RATES_2024.employee.rate;
  }

  /**
   * Calculate annual tax from monthly salary
   */
  static getAnnualTaxBreakdown(monthlySalary: number, taxPoints: number = TAX_POINTS_2024.singlePersonTaxPoints): TaxBreakdown {
    const monthlyBreakdown = this.getTaxBreakdown(monthlySalary, taxPoints);
    
    return {
      incomeTax: monthlyBreakdown.incomeTax * 12,
      bituachLeumi: monthlyBreakdown.bituachLeumi * 12,
      pensionContributions: monthlyBreakdown.pensionContributions * 12,
      studyFundContributions: monthlyBreakdown.studyFundContributions * 12,
      totalDeductions: monthlyBreakdown.totalDeductions * 12,
      effectiveTaxRate: monthlyBreakdown.effectiveTaxRate,
      marginalTaxRate: monthlyBreakdown.marginalTaxRate,
      grossSalary: monthlyBreakdown.grossSalary * 12,
      netSalary: monthlyBreakdown.netSalary * 12
    };
  }

  /**
   * Calculate employer benefits value (what employer pays but employee doesn't see directly)
   */
  static calculateEmployerBenefitsValue(monthlySalary: number): {
    pensionContribution: number;
    studyFundContribution: number;
    totalEmployerCost: number;
  } {
    const pensionContributions = this.calculatePensionContributions(monthlySalary);
    const studyFundContributions = this.calculateStudyFundContributions(monthlySalary);
    
    return {
      pensionContribution: pensionContributions.employer,
      studyFundContribution: studyFundContributions.employer,
      totalEmployerCost: pensionContributions.employer + studyFundContributions.employer
    };
  }
} 