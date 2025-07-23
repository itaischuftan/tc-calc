import { ExchangeRate } from '@/types';
import { FALLBACK_EXCHANGE_RATE } from '@/constants/israeli-tax';

export class CurrencyConverter {
  private static cachedRate: ExchangeRate | null = null;
  private static cacheExpiry: number = 0;
  private static readonly CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

  /**
   * Convert USD to ILS using current exchange rate
   */
  static async convertUSDToILS(usdAmount: number): Promise<number> {
    const rate = await this.getCurrentExchangeRate();
    return usdAmount * rate.rate;
  }

  /**
   * Convert ILS to USD using current exchange rate
   */
  static async convertILSToUSD(ilsAmount: number): Promise<number> {
    const rate = await this.getCurrentExchangeRate();
    return ilsAmount / rate.rate;
  }

  /**
   * Get current USD to ILS exchange rate
   */
  static async getCurrentExchangeRate(): Promise<ExchangeRate> {
    // Check if we have a valid cached rate
    if (this.cachedRate && Date.now() < this.cacheExpiry) {
      return this.cachedRate;
    }

    try {
      // Try primary API
      const rate = await this.fetchFromPrimaryAPI();
      this.cacheRate(rate);
      return rate;
    } catch (error) {
      console.warn('Primary exchange rate API failed, trying fallback:', error);
      
      try {
        // Try Bank of Israel API as fallback
        const rate = await this.fetchFromBankOfIsrael();
        this.cacheRate(rate);
        return rate;
      } catch (fallbackError) {
        console.warn('Fallback exchange rate API failed:', fallbackError);
        
        // Return cached rate if available, otherwise use hardcoded fallback
        if (this.cachedRate) {
          console.warn('Using expired cached rate');
          return this.cachedRate;
        }
        
        console.warn('Using hardcoded fallback exchange rate');
        return {
          rate: FALLBACK_EXCHANGE_RATE.usdToIls,
          lastUpdated: FALLBACK_EXCHANGE_RATE.lastUpdated,
          source: FALLBACK_EXCHANGE_RATE.source
        };
      }
    }
  }

  /**
   * Fetch exchange rate from primary API (ExchangeRate-API)
   */
  private static async fetchFromPrimaryAPI(): Promise<ExchangeRate> {
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
    
    if (!response.ok) {
      throw new Error(`Primary API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.rates || !data.rates.ILS) {
      throw new Error('Invalid response format from primary API');
    }
    
    return {
      rate: data.rates.ILS,
      lastUpdated: new Date(data.date || Date.now()),
      source: 'exchangerate-api.com'
    };
  }

  /**
   * Fetch exchange rate from Bank of Israel API
   */
  private static async fetchFromBankOfIsrael(): Promise<ExchangeRate> {
    // Bank of Israel API endpoint for USD/ILS rate
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    const response = await fetch(
      `https://edge.boi.gov.il/FusionEdgeServer/sdmx/v2/data/dataflow/BOI.STATISTICS/EXR/1.0/RER_USD_ILS.D?startPeriod=${today}&endPeriod=${today}&format=json`
    );
    
    if (!response.ok) {
      throw new Error(`Bank of Israel API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Parse Bank of Israel response format
    if (!data.data || !data.data.dataSets || !data.data.dataSets[0]) {
      throw new Error('Invalid response format from Bank of Israel API');
    }
    
    const observations = data.data.dataSets[0].observations;
    if (!observations || Object.keys(observations).length === 0) {
      throw new Error('No exchange rate data available from Bank of Israel');
    }
    
    // Get the latest rate
    const latestKey = Object.keys(observations)[0];
    const rate = observations[latestKey][0];
    
    return {
      rate: parseFloat(rate),
      lastUpdated: new Date(),
      source: 'boi.gov.il'
    };
  }

  /**
   * Cache the exchange rate
   */
  private static cacheRate(rate: ExchangeRate): void {
    this.cachedRate = rate;
    this.cacheExpiry = Date.now() + this.CACHE_DURATION;
  }

  /**
   * Get historical exchange rate (for specific date)
   */
  static async getHistoricalRate(date: Date): Promise<ExchangeRate> {
    const dateString = date.toISOString().split('T')[0];
    
    try {
      // Try historical data from ExchangeRate-API
      const response = await fetch(`https://api.exchangerate-api.com/v4/history/USD/${dateString}`);
      
      if (!response.ok) {
        throw new Error(`Historical API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.rates || !data.rates.ILS) {
        throw new Error('Invalid historical response format');
      }
      
      return {
        rate: data.rates.ILS,
        lastUpdated: new Date(data.date),
        source: 'exchangerate-api.com (historical)'
      };
    } catch (error) {
      console.warn('Historical exchange rate fetch failed:', error);
      
      // Fallback to current rate
      const currentRate = await this.getCurrentExchangeRate();
      return {
        ...currentRate,
        source: `${currentRate.source} (current, historical unavailable)`
      };
    }
  }

  /**
   * Clear cached exchange rate (force refresh)
   */
  static clearCache(): void {
    this.cachedRate = null;
    this.cacheExpiry = 0;
  }

  /**
   * Check if cached rate is valid
   */
  static isCacheValid(): boolean {
    return this.cachedRate !== null && Date.now() < this.cacheExpiry;
  }

  /**
   * Get cached rate without fetching new one
   */
  static getCachedRate(): ExchangeRate | null {
    return this.isCacheValid() ? this.cachedRate : null;
  }

  /**
   * Convert any currency to any currency (future enhancement)
   */
  static async convertCurrency(amount: number, fromCurrency: 'USD' | 'ILS', toCurrency: 'USD' | 'ILS'): Promise<number> {
    if (fromCurrency === toCurrency) {
      return amount;
    }
    
    if (fromCurrency === 'USD' && toCurrency === 'ILS') {
      return await this.convertUSDToILS(amount);
    }
    
    if (fromCurrency === 'ILS' && toCurrency === 'USD') {
      return await this.convertILSToUSD(amount);
    }
    
    throw new Error(`Unsupported currency conversion: ${fromCurrency} to ${toCurrency}`);
  }

  /**
   * Format currency amount with proper symbols
   */
  static formatCurrency(amount: number, currency: 'USD' | 'ILS'): string {
    const formatter = new Intl.NumberFormat(currency === 'ILS' ? 'he-IL' : 'en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
    
    return formatter.format(amount);
  }

  /**
   * Get exchange rate trend (if we stored historical data)
   */
  static getExchangeRateTrend(_days: number = 30): string {
    // This would require storing historical data
    // For now, return neutral
    return 'stable';
  }
} 