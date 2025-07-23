// Core compensation data types
export interface CompensationPackage {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  
  // Input data
  salary: SalaryData;
  benefits: BenefitsData;
  equity: EquityData;
  perks: PerksData;
  
  // Calculated values
  calculations?: CompensationCalculation;
  benchmarks?: BenchmarkData;
}

export interface SalaryData {
  baseSalary: number;
  currency: 'ILS' | 'USD';
  frequency: 'monthly' | 'annual';
  bonus?: {
    amount: number;
    frequency: 'quarterly' | 'annual';
    guaranteed: boolean;
  };
}

export interface BenefitsData {
  pensionFund: {
    employeeContribution: number; // % (default 6%)
    employerContribution: number; // % (default 6%)
  };
  studyFund: {
    employeeContribution: number; // % (default 2.5%)
    employerContribution: number; // % (default 7.5%)
  };
  healthInsurance: {
    coverage: 'basic' | 'premium' | 'none';
    employerContribution: number; // ILS monthly
  };
  vacationDays: number;
  sickDays: number | 'unlimited';
  parentalLeave: number; // days beyond legal requirement
}

export interface EquityData {
  grants: EquityGrant[];
}

export interface EquityGrant {
  id: string;
  type: 'RSU' | 'ISO' | 'NQSO' | 'ESPP';
  amount: number; // shares or units
  grantDate: Date;
  vestingStart: Date;
  vestingSchedule: VestingSchedule;
  strikePrice?: number; // for options
  currentStockPrice?: number;
  companyValuation?: number; // for private companies
  companyStage?: 'startup' | 'growth' | 'public' | 'pre-ipo';
}

export interface VestingSchedule {
  type: 'standard' | 'cliff' | 'custom';
  totalYears: number;
  cliffMonths?: number; // months before first vesting
  frequency: 'monthly' | 'quarterly' | 'annual';
  percentages?: number[]; // for custom schedules
}

export interface PerksData {
  laptop: {
    provided: boolean;
    annualValue?: number;
  };
  internetStipend: number; // monthly ILS
  phoneStipend: number; // monthly ILS
  gymMembership: number; // monthly ILS
  meals: {
    type: 'allowance' | 'provided' | 'none';
    value: number; // monthly ILS
  };
  transportation: number; // monthly ILS
  learningBudget: number; // annual ILS
  flexibleWork: {
    remoteAllowed: boolean;
    hybridDays?: number;
  };
}

// Calculation result types
export interface CompensationCalculation {
  totalAnnualCompensation: number; // ILS
  breakdown: {
    baseSalary: ComponentBreakdown;
    benefits: ComponentBreakdown;
    equity: ComponentBreakdown;
    perks: ComponentBreakdown;
  };
  taxImplications: TaxBreakdown;
  netCompensation: number;
  exchangeRates: ExchangeRateSnapshot;
  calculatedAt: Date;
}

export interface ComponentBreakdown {
  gross: number;
  net: number;
  components: {
    [key: string]: {
      value: number;
      method: string;
      assumptions: string[];
    };
  };
}

export interface TaxBreakdown {
  incomeTax: number;
  bituachLeumi: number;
  pensionContributions: number;
  studyFundContributions: number;
  totalDeductions: number;
  effectiveTaxRate: number;
  marginalTaxRate: number;
  grossSalary: number;
  netSalary: number;
}

// Currency and exchange rate types
export interface ExchangeRate {
  rate: number;
  lastUpdated: Date;
  source: string;
}

export interface ExchangeRateSnapshot {
  usdToIls: ExchangeRate;
  timestamp: Date;
}

// Benchmarking types
export interface BenchmarkData {
  role: string;
  experience: string;
  location: string;
  percentile: number;
  marketData: {
    p25: number;
    p50: number;
    p75: number;
    p90: number;
  };
  lastUpdated: Date;
}

// Tax calculation types
export interface TaxBracket {
  min: number;
  max: number;
  rate: number;
}

export interface IsraeliTaxBrackets {
  brackets: TaxBracket[];
  year: number;
  currency: 'ILS';
}

// Equity valuation types
export interface EquityValuation {
  currentValue: number;
  postTaxValue: number;
  riskAdjustedValue: number;
  vestingSchedule: VestingEvent[];
  assumptions: string[];
}

export interface VestingEvent {
  date: Date;
  sharesVested: number;
  cumulativeShares: number;
  estimatedValue: number;
}

// Form and validation types
export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface FormState {
  isValid: boolean;
  isDirty: boolean;
  errors: ValidationError[];
}

// UI state types
export interface LoadingState {
  isLoading: boolean;
  operation?: string;
}

export interface ErrorState {
  hasError: boolean;
  message?: string;
  code?: string;
}

// Export types
export interface ExportData {
  packageData: CompensationPackage;
  format: 'pdf' | 'json' | 'csv';
  includeCharts: boolean;
  timestamp: Date;
}

// Utility types
export type Currency = 'ILS' | 'USD';
export type Frequency = 'monthly' | 'annual';
export type CompanyStage = 'startup' | 'growth' | 'public' | 'pre-ipo';
export type EquityType = 'RSU' | 'ISO' | 'NQSO' | 'ESPP';
export type BenefitsCoverage = 'basic' | 'premium' | 'none';
export type MealType = 'allowance' | 'provided' | 'none';
export type VestingType = 'standard' | 'cliff' | 'custom';
export type VestingFrequency = 'monthly' | 'quarterly' | 'annual'; 