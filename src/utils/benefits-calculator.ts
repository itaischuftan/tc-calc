import { BenefitsData, ComponentBreakdown, PerksData } from '@/types';
import { 
  PENSION_RATES_2024, 
  STUDY_FUND_RATES_2024, 
  HEALTH_INSURANCE_2024,
  VACATION_VALUATION_2024,
  TECH_PERKS_BENCHMARKS_2024
} from '@/constants/israeli-tax';

export class BenefitsCalculator {
  /**
   * Calculate pension fund value (employer contribution)
   */
  static calculatePensionValue(monthlySalary: number, employerRate: number = PENSION_RATES_2024.employer.rate): number {
    const applicableSalary = Math.min(monthlySalary, PENSION_RATES_2024.maxMonthlySalaryForPension);
    return applicableSalary * employerRate * 12; // Annual value
  }

  /**
   * Calculate study fund value (employer contribution)
   */
  static calculateStudyFundValue(monthlySalary: number, employerRate: number = STUDY_FUND_RATES_2024.employer.rate): number {
    const applicableSalary = Math.min(monthlySalary, STUDY_FUND_RATES_2024.maxMonthlySalaryForStudyFund);
    return applicableSalary * employerRate * 12; // Annual value
  }

  /**
   * Calculate health insurance value (employer contribution)
   */
  static calculateHealthInsuranceValue(coverage: 'basic' | 'premium' | 'none', employerContribution?: number): number {
    if (coverage === 'none') return 0;
    
    if (employerContribution !== undefined) {
      return employerContribution * 12; // Annual value from monthly contribution
    }
    
    // Use default values based on coverage type
    const monthlyValue = coverage === 'premium' 
      ? HEALTH_INSURANCE_2024.premium.employerTypicalContribution
      : HEALTH_INSURANCE_2024.basic.employerTypicalContribution;
    
    return monthlyValue * 12;
  }

  /**
   * Calculate vacation days value
   */
  static calculatePTOValue(monthlySalary: number, vacationDays: number): number {
    const dailyRate = (monthlySalary * 12) / VACATION_VALUATION_2024.workingDaysPerYear;
    return dailyRate * vacationDays;
  }

  /**
   * Calculate sick days value (if generous policy)
   */
  static calculateSickDaysValue(monthlySalary: number, sickDays: number | 'unlimited'): number {
    if (sickDays === 'unlimited') {
      // Value unlimited sick days at 10 days per year (conservative estimate)
      const dailyRate = (monthlySalary * 12) / VACATION_VALUATION_2024.workingDaysPerYear;
      return dailyRate * 10 * 0.5; // 50% value since it's conditional
    }
    
    if (typeof sickDays === 'number' && sickDays > 7) {
      // Only value sick days above legal minimum (7 days)
      const extraSickDays = sickDays - 7;
      const dailyRate = (monthlySalary * 12) / VACATION_VALUATION_2024.workingDaysPerYear;
      return dailyRate * extraSickDays * 0.5; // 50% value since it's conditional
    }
    
    return 0;
  }

  /**
   * Calculate parental leave value (beyond legal requirement)
   */
  static calculateParentalLeaveValue(monthlySalary: number, extraDays: number): number {
    if (extraDays <= 0) return 0;
    
    const dailyRate = (monthlySalary * 12) / VACATION_VALUATION_2024.workingDaysPerYear;
    return dailyRate * extraDays * 0.3; // 30% value since it's conditional/future benefit
  }

  /**
   * Calculate perks value
   */
  static calculatePerksValue(perks: {
    laptop?: { provided: boolean; annualValue?: number };
    internetStipend?: number;
    phoneStipend?: number;
    gymMembership?: number;
    meals?: { type: 'allowance' | 'provided' | 'none'; value: number };
    transportation?: number;
    learningBudget?: number;
    flexibleWork?: { remoteAllowed: boolean; hybridDays?: number };
  }): {
    totalAnnualValue: number;
    breakdown: { [key: string]: number };
  } {
    const breakdown: { [key: string]: number } = {};
    let totalAnnualValue = 0;

    // Laptop value
    if (perks.laptop?.provided) {
      const laptopValue = perks.laptop.annualValue || TECH_PERKS_BENCHMARKS_2024.laptop.annualValue;
      breakdown.laptop = laptopValue;
      totalAnnualValue += laptopValue;
    }

    // Internet stipend
    if (perks.internetStipend && perks.internetStipend > 0) {
      breakdown.internetStipend = perks.internetStipend * 12;
      totalAnnualValue += perks.internetStipend * 12;
    }

    // Phone stipend
    if (perks.phoneStipend && perks.phoneStipend > 0) {
      breakdown.phoneStipend = perks.phoneStipend * 12;
      totalAnnualValue += perks.phoneStipend * 12;
    }

    // Gym membership
    if (perks.gymMembership && perks.gymMembership > 0) {
      breakdown.gymMembership = perks.gymMembership * 12;
      totalAnnualValue += perks.gymMembership * 12;
    }

    // Meals
    if (perks.meals && perks.meals.type !== 'none' && perks.meals.value > 0) {
      breakdown.meals = perks.meals.value * 12;
      totalAnnualValue += perks.meals.value * 12;
    }

    // Transportation
    if (perks.transportation && perks.transportation > 0) {
      breakdown.transportation = perks.transportation * 12;
      totalAnnualValue += perks.transportation * 12;
    }

    // Learning budget
    if (perks.learningBudget && perks.learningBudget > 0) {
      breakdown.learningBudget = perks.learningBudget;
      totalAnnualValue += perks.learningBudget;
    }

    // Flexible work (valued as transportation savings)
    if (perks.flexibleWork?.remoteAllowed) {
      const remoteValue = perks.flexibleWork.hybridDays 
        ? (perks.flexibleWork.hybridDays / 5) * TECH_PERKS_BENCHMARKS_2024.transportationAllowance.typical * 12
        : TECH_PERKS_BENCHMARKS_2024.transportationAllowance.typical * 12;
      breakdown.flexibleWork = remoteValue;
      totalAnnualValue += remoteValue;
    }

    return { totalAnnualValue, breakdown };
  }

  /**
   * Calculate comprehensive benefits breakdown
   */
  static calculateComprehensiveBenefits(
    monthlySalary: number, 
    benefitsData: BenefitsData,
    _perks?: PerksData
  ): ComponentBreakdown {
    const components: { [key: string]: { value: number; method: string; assumptions: string[] } } = {};

    // Pension fund
    const pensionValue = this.calculatePensionValue(
      monthlySalary, 
      benefitsData.pensionFund.employerContribution / 100
    );
    components.pensionFund = {
      value: pensionValue,
      method: 'employer_contribution',
      assumptions: [`Employer contribution: ${benefitsData.pensionFund.employerContribution}%`]
    };

    // Study fund
    const studyFundValue = this.calculateStudyFundValue(
      monthlySalary,
      benefitsData.studyFund.employerContribution / 100
    );
    components.studyFund = {
      value: studyFundValue,
      method: 'employer_contribution',
      assumptions: [`Employer contribution: ${benefitsData.studyFund.employerContribution}%`]
    };

    // Health insurance
    const healthInsuranceValue = this.calculateHealthInsuranceValue(
      benefitsData.healthInsurance.coverage,
      benefitsData.healthInsurance.employerContribution
    );
    components.healthInsurance = {
      value: healthInsuranceValue,
      method: 'employer_contribution',
      assumptions: [`Coverage: ${benefitsData.healthInsurance.coverage}`]
    };

    // Vacation days
    const vacationValue = this.calculatePTOValue(monthlySalary, benefitsData.vacationDays);
    components.vacationDays = {
      value: vacationValue,
      method: 'daily_rate_calculation',
      assumptions: [`${benefitsData.vacationDays} vacation days per year`]
    };

    // Sick days (if generous)
    const sickDaysValue = this.calculateSickDaysValue(monthlySalary, benefitsData.sickDays);
    if (sickDaysValue > 0) {
      components.sickDays = {
        value: sickDaysValue,
        method: 'daily_rate_calculation',
        assumptions: ['Valued at 50% of daily rate for days above legal minimum']
      };
    }

    // Parental leave
    const parentalLeaveValue = this.calculateParentalLeaveValue(monthlySalary, benefitsData.parentalLeave);
    if (parentalLeaveValue > 0) {
      components.parentalLeave = {
        value: parentalLeaveValue,
        method: 'daily_rate_calculation',
        assumptions: ['Valued at 30% of daily rate for future conditional benefit']
      };
    }

    // Calculate totals
    const grossTotal = Object.values(components).reduce((sum, comp) => sum + comp.value, 0);
    
    // Benefits are typically not taxed as income to employee, so net = gross
    const netTotal = grossTotal;

    return {
      gross: grossTotal,
      net: netTotal,
      components
    };
  }

  /**
   * Get benefits benchmark comparison
   */
  static getBenefitsBenchmark(role: string): {
    pensionContribution: number;
    studyFundContribution: number;
    healthInsurance: number;
    vacationDays: number;
    totalBenefitsValue: number;
  } {
    // Sample salary for benchmark calculation based on role
    const benchmarkSalaries: { [key: string]: number } = {
      'junior': 20000,
      'senior': 32000,
      'lead': 42000,
      'principal': 55000,
      'manager': 52000
    };

    const monthlySalary = benchmarkSalaries[role.toLowerCase()] || 30000;

    return {
      pensionContribution: this.calculatePensionValue(monthlySalary),
      studyFundContribution: this.calculateStudyFundValue(monthlySalary),
      healthInsurance: this.calculateHealthInsuranceValue('basic'),
      vacationDays: VACATION_VALUATION_2024.techIndustryAverage,
      totalBenefitsValue: this.calculatePensionValue(monthlySalary) + 
                         this.calculateStudyFundValue(monthlySalary) + 
                         this.calculateHealthInsuranceValue('basic') +
                         this.calculatePTOValue(monthlySalary, VACATION_VALUATION_2024.techIndustryAverage)
    };
  }

  /**
   * Calculate total employer cost (salary + benefits)
   */
  static calculateTotalEmployerCost(monthlySalary: number, benefitsData: BenefitsData): {
    baseSalary: number;
    mandatoryBenefits: number;
    additionalBenefits: number;
    totalCost: number;
    costPercentage: number;
  } {
    const annualSalary = monthlySalary * 12;
    
    // Mandatory employer contributions
    const pensionContribution = this.calculatePensionValue(monthlySalary, benefitsData.pensionFund.employerContribution / 100);
    const studyFundContribution = this.calculateStudyFundValue(monthlySalary, benefitsData.studyFund.employerContribution / 100);
    const mandatoryBenefits = pensionContribution + studyFundContribution;
    
    // Additional benefits
    const healthInsurance = this.calculateHealthInsuranceValue(
      benefitsData.healthInsurance.coverage,
      benefitsData.healthInsurance.employerContribution
    );
    const additionalBenefits = healthInsurance;
    
    const totalCost = annualSalary + mandatoryBenefits + additionalBenefits;
    const costPercentage = ((mandatoryBenefits + additionalBenefits) / annualSalary) * 100;
    
    return {
      baseSalary: annualSalary,
      mandatoryBenefits,
      additionalBenefits,
      totalCost,
      costPercentage
    };
  }
} 