import { EquityValuation, EquityGrant, VestingEvent } from '@/types';
import { TaxCalculator } from './tax-calculator';
import { CurrencyConverter } from './currency-converter';

export class EquityValuator {
  /**
   * Value RSU grants (Restricted Stock Units)
   */
  static async valueRSUs(grants: EquityGrant[]): Promise<EquityValuation> {
    let totalCurrentValue = 0;
    let totalPostTaxValue = 0;
    const allVestingEvents: VestingEvent[] = [];
    const assumptions: string[] = [];

    for (const grant of grants.filter(g => g.type === 'RSU')) {
      const currentStockPrice = grant.currentStockPrice || 0;
      const grantValue = grant.amount * currentStockPrice;
      
      // Convert to ILS if needed
      const grantValueILS = currentStockPrice > 0 ? 
        await CurrencyConverter.convertUSDToILS(grantValue) : 0;
      
      totalCurrentValue += grantValueILS;
      
      // Calculate vesting schedule
      const vestingEvents = this.calculateVestingSchedule(grant);
      allVestingEvents.push(...vestingEvents);
      
      // For RSUs, tax is paid on vesting at ordinary income rates + capital gains on any appreciation
      const taxableValueAtVesting = grantValueILS;
      const capitalGains = Math.max(0, grantValueILS - taxableValueAtVesting);
      const capitalGainsTax = TaxCalculator.calculateCapitalGains(capitalGains);
      
      // Simplified: assume average tax rate of 35% on ordinary income (RSUs taxed as salary)
      const ordinaryIncomeTax = taxableValueAtVesting * 0.35;
      const totalTax = ordinaryIncomeTax + capitalGainsTax;
      
      totalPostTaxValue += Math.max(0, grantValueILS - totalTax);
      
      assumptions.push(`RSU grant valued at current stock price of $${currentStockPrice}`);
      assumptions.push('RSUs taxed as ordinary income at vesting');
    }

    const riskAdjustedValue = this.applyRiskDiscount(totalCurrentValue, grants[0]?.companyStage || 'public');

    return {
      currentValue: totalCurrentValue,
      postTaxValue: totalPostTaxValue,
      riskAdjustedValue,
      vestingSchedule: allVestingEvents.sort((a, b) => a.date.getTime() - b.date.getTime()),
      assumptions
    };
  }

  /**
   * Value stock options (ISO, NQSO)
   */
  static async valueStockOptions(grants: EquityGrant[]): Promise<EquityValuation> {
    let totalCurrentValue = 0;
    let totalPostTaxValue = 0;
    const allVestingEvents: VestingEvent[] = [];
    const assumptions: string[] = [];

    for (const grant of grants.filter(g => g.type === 'ISO' || g.type === 'NQSO')) {
      const currentStockPrice = grant.currentStockPrice || 0;
      const strikePrice = grant.strikePrice || 0;
      const intrinsicValue = Math.max(0, currentStockPrice - strikePrice);
      const grantValue = grant.amount * intrinsicValue;
      
      // Convert to ILS if needed
      const grantValueILS = intrinsicValue > 0 ? 
        await CurrencyConverter.convertUSDToILS(grantValue) : 0;
      
      totalCurrentValue += grantValueILS;
      
      // Calculate vesting schedule
      const vestingEvents = this.calculateVestingSchedule(grant);
      allVestingEvents.push(...vestingEvents);
      
      // Tax treatment depends on option type
      if (grant.type === 'ISO') {
        // ISO: Generally taxed as capital gains if held properly
        const capitalGainsTax = TaxCalculator.calculateCapitalGains(grantValueILS);
        totalPostTaxValue += Math.max(0, grantValueILS - capitalGainsTax);
        assumptions.push('ISO options assumed to qualify for capital gains treatment');
      } else {
        // NQSO: Spread taxed as ordinary income, future gains as capital gains
        const ordinaryIncomeTax = grantValueILS * 0.35; // Simplified average rate
        totalPostTaxValue += Math.max(0, grantValueILS - ordinaryIncomeTax);
        assumptions.push('NQSO options: spread taxed as ordinary income');
      }
      
      assumptions.push(`Options valued at intrinsic value: $${currentStockPrice} - $${strikePrice} = $${intrinsicValue} per share`);
    }

    const riskAdjustedValue = this.applyRiskDiscount(totalCurrentValue, grants[0]?.companyStage || 'public');

    return {
      currentValue: totalCurrentValue,
      postTaxValue: totalPostTaxValue,
      riskAdjustedValue,
      vestingSchedule: allVestingEvents.sort((a, b) => a.date.getTime() - b.date.getTime()),
      assumptions
    };
  }

  /**
   * Value ESPP (Employee Stock Purchase Plan)
   */
  static async valueESPP(grants: EquityGrant[]): Promise<EquityValuation> {
    let totalCurrentValue = 0;
    let totalPostTaxValue = 0;
    const assumptions: string[] = [];

    for (const grant of grants.filter(g => g.type === 'ESPP')) {
      const currentStockPrice = grant.currentStockPrice || 0;
      const purchasePrice = grant.strikePrice || currentStockPrice * 0.85; // Typical 15% discount
      const discount = currentStockPrice - purchasePrice;
      const grantValue = grant.amount * discount;
      
      // Convert to ILS if needed
      const grantValueILS = discount > 0 ? 
        await CurrencyConverter.convertUSDToILS(grantValue) : 0;
      
      totalCurrentValue += grantValueILS;
      
      // ESPP discount typically taxed as ordinary income
      const ordinaryIncomeTax = grantValueILS * 0.35; // Simplified average rate
      totalPostTaxValue += Math.max(0, grantValueILS - ordinaryIncomeTax);
      
      assumptions.push(`ESPP discount of $${discount} per share taxed as ordinary income`);
    }

    return {
      currentValue: totalCurrentValue,
      postTaxValue: totalPostTaxValue,
      riskAdjustedValue: totalCurrentValue, // ESPP usually low risk
      vestingSchedule: [], // ESPP typically immediate
      assumptions
    };
  }

  /**
   * Calculate vesting schedule for an equity grant
   */
  static calculateVestingSchedule(grant: EquityGrant): VestingEvent[] {
    const events: VestingEvent[] = [];
    const { vestingSchedule, amount } = grant;
    const currentStockPrice = grant.currentStockPrice || 0;
    
    if (!vestingSchedule) return events;
    
    const startDate = new Date(grant.vestingStart);
    const cliffMonths = vestingSchedule.cliffMonths || 0;
    
    if (vestingSchedule.type === 'standard') {
      // Standard vesting: typically 25% per year over 4 years
      const quarterlyShares = amount / (vestingSchedule.totalYears * 4);
      
      for (let quarter = 0; quarter < vestingSchedule.totalYears * 4; quarter++) {
        const vestingDate = new Date(startDate);
        vestingDate.setMonth(vestingDate.getMonth() + cliffMonths + (quarter * 3));
        
        // If cliff, first vesting includes cliff amount
        const sharesThisVesting = quarter === 0 && cliffMonths > 0 ? 
          quarterlyShares * (cliffMonths / 3 + 1) : quarterlyShares;
        
        events.push({
          date: vestingDate,
          sharesVested: sharesThisVesting,
          cumulativeShares: (quarter + 1) * quarterlyShares,
          estimatedValue: sharesThisVesting * currentStockPrice
        });
      }
    } else if (vestingSchedule.type === 'cliff') {
      // Cliff vesting: all shares vest at once after cliff period
      const vestingDate = new Date(startDate);
      vestingDate.setMonth(vestingDate.getMonth() + cliffMonths);
      
      events.push({
        date: vestingDate,
        sharesVested: amount,
        cumulativeShares: amount,
        estimatedValue: amount * currentStockPrice
      });
    } else if (vestingSchedule.type === 'custom' && vestingSchedule.percentages) {
      // Custom vesting schedule
      let cumulativeShares = 0;
      
      vestingSchedule.percentages.forEach((percentage, index) => {
        const vestingDate = new Date(startDate);
        vestingDate.setMonth(vestingDate.getMonth() + cliffMonths + (index * 12));
        
        const sharesThisVesting = amount * (percentage / 100);
        cumulativeShares += sharesThisVesting;
        
        events.push({
          date: vestingDate,
          sharesVested: sharesThisVesting,
          cumulativeShares,
          estimatedValue: sharesThisVesting * currentStockPrice
        });
      });
    }
    
    return events;
  }

  /**
   * Apply risk discount based on company stage
   */
  static applyRiskDiscount(value: number, companyStage: string): number {
    const discountFactors = {
      'startup': 0.3,  // 70% discount for early stage
      'growth': 0.6,   // 40% discount for growth stage
      'pre-ipo': 0.8,  // 20% discount for pre-IPO
      'public': 1.0    // No discount for public companies
    };
    
    const factor = discountFactors[companyStage as keyof typeof discountFactors] || 0.5;
    return value * factor;
  }

  /**
   * Calculate post-tax equity value with Israeli tax considerations
   */
  static async calculatePostTaxEquityValue(grants: EquityGrant[]): Promise<number> {
    let totalPostTaxValue = 0;
    
    // Group grants by type for different tax treatments
    const rsus = grants.filter(g => g.type === 'RSU');
    const options = grants.filter(g => g.type === 'ISO' || g.type === 'NQSO');
    const espp = grants.filter(g => g.type === 'ESPP');
    
    if (rsus.length > 0) {
      const rsuValuation = await this.valueRSUs(rsus);
      totalPostTaxValue += rsuValuation.postTaxValue;
    }
    
    if (options.length > 0) {
      const optionValuation = await this.valueStockOptions(options);
      totalPostTaxValue += optionValuation.postTaxValue;
    }
    
    if (espp.length > 0) {
      const esppValuation = await this.valueESPP(espp);
      totalPostTaxValue += esppValuation.postTaxValue;
    }
    
    return totalPostTaxValue;
  }

  /**
   * Get equity value for a specific year (useful for vesting projections)
   */
  static getEquityValueForYear(grants: EquityGrant[], year: number): number {
    let yearValue = 0;
    const targetYear = new Date().getFullYear() + year;
    
    for (const grant of grants) {
      const vestingEvents = this.calculateVestingSchedule(grant);
      const yearEvents = vestingEvents.filter(event => 
        event.date.getFullYear() === targetYear
      );
      
      yearValue += yearEvents.reduce((sum, event) => sum + event.estimatedValue, 0);
    }
    
    return yearValue;
  }

  /**
   * Generate equity summary for display
   */
  static async generateEquitySummary(grants: EquityGrant[]): Promise<{
    totalCurrentValue: number;
    totalPostTaxValue: number;
    riskAdjustedValue: number;
    nextVestingDate: Date | null;
    nextVestingValue: number;
    assumptions: string[];
  }> {
    const rsuValuation = await this.valueRSUs(grants.filter(g => g.type === 'RSU'));
    const optionValuation = await this.valueStockOptions(grants.filter(g => g.type === 'ISO' || g.type === 'NQSO'));
    const esppValuation = await this.valueESPP(grants.filter(g => g.type === 'ESPP'));
    
    const allVestingEvents = [
      ...rsuValuation.vestingSchedule,
      ...optionValuation.vestingSchedule
    ].sort((a, b) => a.date.getTime() - b.date.getTime());
    
    const futureEvents = allVestingEvents.filter(event => event.date > new Date());
    const nextVesting = futureEvents[0] || null;
    
    return {
      totalCurrentValue: rsuValuation.currentValue + optionValuation.currentValue + esppValuation.currentValue,
      totalPostTaxValue: rsuValuation.postTaxValue + optionValuation.postTaxValue + esppValuation.postTaxValue,
      riskAdjustedValue: rsuValuation.riskAdjustedValue + optionValuation.riskAdjustedValue + esppValuation.riskAdjustedValue,
      nextVestingDate: nextVesting?.date || null,
      nextVestingValue: nextVesting?.estimatedValue || 0,
      assumptions: [
        ...rsuValuation.assumptions,
        ...optionValuation.assumptions,
        ...esppValuation.assumptions,
        'All values converted to ILS using current exchange rates',
        'Tax calculations based on 2024 Israeli tax law'
      ]
    };
  }
} 