import type { Stock } from '../types';

const ALPHA_VANTAGE_BASE_URL = 'https://www.alphavantage.co/query';

export interface QuoteData {
  price: number;
  change: number;
  changePercent: number;
  lastUpdated: string;
}

export interface StockAPI {
  getQuote(symbol: string): Promise<QuoteData>;
  getQuoteBatch(symbols: string[]): Promise<Map<string, QuoteData>>;
  getHistoricalData(symbol: string, days: number): Promise<{ date: string; close: number }[]>;
}

export class AlphaVantageAPI implements StockAPI {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async getQuote(symbol: string): Promise<QuoteData> {
    try {
      const response = await fetch(
        `${ALPHA_VANTAGE_BASE_URL}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${this.apiKey}`
      );
      const data = await response.json();
      
      if (data['Global Quote']) {
        const quote = data['Global Quote'];
        return {
          price: parseFloat(quote['05. price']),
          change: parseFloat(quote['09. change']),
          changePercent: parseFloat(quote['10. change percent']),
          lastUpdated: new Date().toISOString(),
        };
      }
      
      throw new Error('Invalid API response');
    } catch (error) {
      console.error('Alpha Vantage API error:', error);
      throw error;
    }
  }

  async getQuoteBatch(symbols: string[]): Promise<Map<string, QuoteData>> {
    const results = new Map<string, QuoteData>();
    
    for (const symbol of symbols) {
      try {
        const quote = await this.getQuote(symbol);
        results.set(symbol, quote);
      } catch (error) {
        console.error(`Failed to fetch quote for ${symbol}:`, error);
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    return results;
  }

  async getHistoricalData(symbol: string, days: number = 30): Promise<{ date: string; close: number }[]> {
    try {
      const response = await fetch(
        `${ALPHA_VANTAGE_BASE_URL}?function=TIME_SERIES_DAILY&symbol=${symbol}&outputsize=compact&apikey=${this.apiKey}`
      );
      const data = await response.json();
      
      if (data['Time Series (Daily)']) {
        const timeSeries = data['Time Series (Daily)'];
        const dates = Object.keys(timeSeries).sort().reverse().slice(0, days);
        
        return dates.map(date => ({
          date,
          close: parseFloat(timeSeries[date]['4. close']),
        }));
      }
      
      throw new Error('Invalid API response');
    } catch (error) {
      console.error('Alpha Vantage API error:', error);
      throw error;
    }
  }
}

export class MockStockAPI implements StockAPI {
  private mockPrices: Map<string, number> = new Map();

  constructor(stocks: Stock[]) {
    stocks.forEach(stock => {
      this.mockPrices.set(stock.code, stock.currentPrice);
    });
  }

  async getQuote(symbol: string): Promise<QuoteData> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const basePrice = this.mockPrices.get(symbol) || 100;
    const changePercent = (Math.random() - 0.5) * 4;
    const change = basePrice * (changePercent / 100);
    const price = basePrice + change;
    
    this.mockPrices.set(symbol, price);
    
    return {
      price,
      change,
      changePercent,
      lastUpdated: new Date().toISOString(),
    };
  }

  async getQuoteBatch(symbols: string[]): Promise<Map<string, QuoteData>> {
    const results = new Map<string, QuoteData>();
    
    for (const symbol of symbols) {
      const quote = await this.getQuote(symbol);
      results.set(symbol, quote);
    }
    
    return results;
  }

  async getHistoricalData(symbol: string, days: number = 30): Promise<{ date: string; close: number }[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const data: { date: string; close: number }[] = [];
    const basePrice = this.mockPrices.get(symbol) || 100;
    let price = basePrice * 0.9;
    
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      price = price * (1 + (Math.random() - 0.48) * 0.03);
      
      data.push({
        date: date.toISOString().split('T')[0],
        close: Math.round(price * 100) / 100,
      });
    }
    
    return data;
  }
}

let stockAPI: StockAPI | null = null;

export function initializeAPI(apiKey?: string, stocks?: Stock[]): StockAPI {
  if (apiKey) {
    stockAPI = new AlphaVantageAPI(apiKey);
  } else if (stocks) {
    stockAPI = new MockStockAPI(stocks);
  } else {
    stockAPI = new MockStockAPI([]);
  }
  return stockAPI;
}

export function getAPI(): StockAPI {
  if (!stockAPI) {
    throw new Error('API not initialized. Call initializeAPI first.');
  }
  return stockAPI;
}
