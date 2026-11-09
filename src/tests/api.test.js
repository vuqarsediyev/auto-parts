import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getManufacturersByNumber,
  getOffersAndAnalogues,
} from '../api/favoritPartsApi';

describe('favoritPartsApi', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('throws error when number is empty in getManufacturersByNumber', async () => {
    await expect(getManufacturersByNumber('')).rejects.toThrow('Укажите номер (артикул) запчасти');
  });

  it('filters out dummy empty records and groups unique brands (Stage 1)', async () => {
    const mockResponse = {
      goods: [
        {
          brand: 'OSSCA',
          count: 36,
          goodsID: '111',
          name: 'Стеклоподъемник',
          number: '01089',
          price: 1000,
          warehouses: [{ code: 'МСК', price: 1000, stock: 36 }],
        },
        {
          brand: 'FEBI',
          count: 20,
          goodsID: '222',
          name: 'Антифриз',
          number: '01089',
          price: 500,
          warehouses: [],
        },
        // Пустая структура из документации:
        {
          brand: '',
          count: 0,
          goodsID: '00000000-0000-0000-0000-000000000000',
          name: '',
          number: '',
          price: 0,
          warehouses: [],
        },
      ],
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });

    const brands = await getManufacturersByNumber('01089');
    expect(brands).toHaveLength(2);
    expect(brands.map((b) => b.brand)).toEqual(['OSSCA', 'FEBI']);
    expect(brands[0].totalCount).toBe(36);
  });

  it('handles API error object properly', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ error: 'Invalid access key' }),
    });

    await expect(getManufacturersByNumber('01089')).rejects.toThrow('Invalid access key');
  });

  it('correctly processes Stage 2 response with analogues', async () => {
    const mockStage2Response = {
      goods: [
        {
          brand: 'MEYLE',
          count: 20,
          goodsID: 'M1',
          name: 'Рычаги подвески',
          number: '7160500039S',
          warehouses: [{ code: 'МС2', price: 12533.62, stock: 20 }],
          analogues: [
            {
              brand: 'Mapco',
              count: 10,
              goodsID: 'A1',
              name: 'Комплект рычагов',
              number: '53612/1',
              warehouses: [{ code: 'ПТ4', price: 8680.2, stock: 10 }],
            },
          ],
        },
      ],
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockStage2Response,
    });

    const result = await getOffersAndAnalogues('7160500039S', 'MEYLE');
    expect(result.originalPart).toBeTruthy();
    expect(result.originalPart.brand).toBe('MEYLE');
    expect(result.originalPart.isOriginal).toBe(true);

    expect(result.analogues).toHaveLength(1);
    expect(result.analogues[0].brand).toBe('Mapco');
    expect(result.analogues[0].isOriginal).toBe(false);

    expect(result.allOffers).toHaveLength(2);
  });
});

