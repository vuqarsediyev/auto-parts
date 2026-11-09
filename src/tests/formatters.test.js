import { describe, it, expect } from 'vitest';
import {
  formatPrice,
  getItemPricing,
  getItemStock,
  formatShipmentDate,
} from '../utils/formatters';

describe('formatters utility', () => {
  it('formats prices in RUB properly', () => {
    expect(formatPrice(1084.82)).toContain('1');
    expect(formatPrice(1084.82)).toContain('084');
    expect(formatPrice(0)).toBe('По запросу');
    expect(formatPrice(-5)).toBe('По запросу');
    expect(formatPrice(null)).toBe('По запросу');
  });

  it('correctly calculates pricing from warehouses per API docs requirement', () => {
    // Согласно документации: цену нужно брать из конкретного склада
    const itemWithWarehouses = {
      price: 9999, // устаревший реквизит в корне
      warehouses: [
        { code: 'МСК', price: 1000, stock: 5 },
        { code: 'СПБ', price: 1200, stock: 3 },
      ],
    };
    const pricing = getItemPricing(itemWithWarehouses);
    expect(pricing.fromWarehouse).toBe(true);
    expect(pricing.minPrice).toBe(1000);
    expect(pricing.maxPrice).toBe(1200);
    expect(pricing.isRange).toBe(true);
    expect(pricing.displayPrice).toContain('от');
  });

  it('handles item with single warehouse price', () => {
    const item = {
      price: 500,
      warehouses: [{ code: 'МСК', price: 650, stock: 10 }],
    };
    const pricing = getItemPricing(item);
    expect(pricing.minPrice).toBe(650);
    expect(pricing.isRange).toBe(false);
  });

  it('falls back to root price if no warehouse prices exist', () => {
    const itemNoWh = {
      price: 750,
      warehouses: [],
    };
    const pricing = getItemPricing(itemNoWh);
    expect(pricing.minPrice).toBe(750);
    expect(pricing.fromWarehouse).toBe(false);
  });

  it('calculates total stock and warehouse count', () => {
    const item = {
      count: 36,
      warehouses: [
        { code: 'W1', stock: 10 },
        { code: 'W2', stock: 26 },
      ],
    };
    const stock = getItemStock(item);
    expect(stock.total).toBe(36);
    expect(stock.warehouseCount).toBe(2);
    expect(stock.inStock).toBe(true);
  });

  it('correctly handles zero stock', () => {
    const item = { count: 0, warehouses: [] };
    const stock = getItemStock(item);
    expect(stock.total).toBe(0);
    expect(stock.inStock).toBe(false);
  });

  it('formats shipment date', () => {
    const formatted = formatShipmentDate('2026-11-12T13:30:00+03:00');
    expect(formatted).toBeTruthy();
    expect(formatShipmentDate('')).toBe('—');
  });
});

