import { IsraeliTaxBrackets } from '@/types';

// Israeli Income Tax Brackets for 2024 (in ILS monthly)
export const ISRAELI_TAX_BRACKETS_2024: IsraeliTaxBrackets = {
  year: 2024,
  currency: 'ILS',
  brackets: [
    { min: 0, max: 7010, rate: 0.10 },          // 10%
    { min: 7010, max: 10060, rate: 0.14 },       // 14%
    { min: 10060, max: 16150, rate: 0.20 },      // 20%
    { min: 16150, max: 21240, rate: 0.31 },      // 31%
    { min: 21240, max: 42480, rate: 0.35 },      // 35%
    { min: 42480, max: 54130, rate: 0.47 },      // 47%
    { min: 54130, max: Infinity, rate: 0.50 }    // 50%
  ]
};

// Social Security (Bituach Leumi) rates and ceilings
export const BITUACH_LEUMI_2024 = {
  rate: 0.04, // 4%
  monthlyCeiling: 47220, // ILS - maximum monthly salary subject to Bituach Leumi
  minimumWage: 5880, // ILS monthly minimum wage
  maxMonthlyContribution: 1888.8 // 4% of ceiling
};

// Pension fund mandatory rates
export const PENSION_RATES_2024 = {
  employee: {
    rate: 0.06, // 6% employee contribution
    minContribution: 0.06,
    maxContribution: 0.07 // can contribute up to 7%
  },
  employer: {
    rate: 0.06, // 6% employer contribution (mandatory)
    minContribution: 0.06
  },
  maxMonthlySalaryForPension: 42480, // ILS - pension calculated up to this amount
  maxAnnualSalaryForPension: 509760 // ILS - annual limit
};

// Study Fund (Keren Hishtalmut) rates
export const STUDY_FUND_RATES_2024 = {
  employee: {
    rate: 0.025 // 2.5% employee contribution
  },
  employer: {
    rate: 0.075 // 7.5% employer contribution
  },
  maxMonthlySalaryForStudyFund: 33500, // ILS
  maxAnnualSalaryForStudyFund: 402000 // ILS
};

// Capital gains tax rates
export const CAPITAL_GAINS_TAX_2024 = {
  rate: 0.25, // 25% on most capital gains
  alternativeRate: 0.30, // 30% alternative rate for certain cases
  exemptionThreshold: 680000, // ILS annual exemption for individuals
  longTermHoldingPeriod: 24 // months to qualify for long-term treatment
};

// Health insurance typical costs (approximate market rates)
export const HEALTH_INSURANCE_2024 = {
  basic: {
    monthly: 200, // ILS approximate cost for basic supplementary insurance
    employerTypicalContribution: 150 // ILS typical employer contribution
  },
  premium: {
    monthly: 400, // ILS approximate cost for premium supplementary insurance
    employerTypicalContribution: 300 // ILS typical employer contribution
  }
};

// Vacation day valuation
export const VACATION_VALUATION_2024 = {
  legalMinimum: 14, // days per year legal minimum
  techIndustryAverage: 20, // days per year typical in tech
  workingDaysPerYear: 250, // standard working days for calculation
  valuationMethod: 'daily_rate' // how to calculate vacation day value
};

// Common Israeli tech industry benchmarks (monthly ILS)
export const TECH_SALARY_BENCHMARKS_2024 = {
  juniorDeveloper: {
    min: 15000,
    median: 20000,
    max: 25000
  },
  seniorDeveloper: {
    min: 25000,
    median: 32000,
    max: 40000
  },
  teamLead: {
    min: 35000,
    median: 42000,
    max: 50000
  },
  principal: {
    min: 45000,
    median: 55000,
    max: 70000
  },
  engineeringManager: {
    min: 40000,
    median: 52000,
    max: 65000
  }
};

// Israeli tech perks typical values (monthly ILS)
export const TECH_PERKS_BENCHMARKS_2024 = {
  laptop: {
    annualValue: 8000, // ILS - typical laptop depreciation value
    replacementCycle: 3 // years
  },
  internetStipend: {
    typical: 100, // ILS monthly
    max: 200
  },
  phoneStipend: {
    typical: 150, // ILS monthly
    max: 300
  },
  gymMembership: {
    typical: 200, // ILS monthly
    premium: 400
  },
  mealAllowance: {
    basic: 500, // ILS monthly
    generous: 1000
  },
  transportationAllowance: {
    typical: 300, // ILS monthly
    centralLocation: 500
  },
  learningBudget: {
    typical: 5000, // ILS annual
    generous: 10000
  }
};

// Tax calculation helpers
export const TAX_POINTS_2024 = {
  singlePersonTaxPoints: 2.25, // standard tax points for single person
  marriedPersonTaxPoints: 3.5, // standard tax points for married person
  childTaxPoints: 1.0, // additional tax points per child
  taxPointValue: 245 // ILS value per tax point monthly
};

// Exchange rate fallback (if API fails)
export const FALLBACK_EXCHANGE_RATE = {
  usdToIls: 3.7, // approximate rate
  lastUpdated: new Date('2024-01-01'),
  source: 'fallback'
}; 