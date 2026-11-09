import { describe, it, expect } from 'vitest';
import partsReducer, {
  setApiKey,
  setSearchNumber,
  setFilters,
  backToBrands,
  resetAll,
  fetchManufacturers,
  fetchOffers,
} from '../store/partsSlice';

describe('parts Redux slice', () => {
  const initialState = {
    apiKey: '00000000-0000-0000-0000-000000000001',
    searchNumber: '',
    selectedBrand: null,
    currentStage: 1,
    stage1: {
      loading: false,
      error: null,
      brands: [],
      searchedNumber: '',
      hasSearched: false,
    },
    stage2: {
      loading: false,
      error: null,
      originalPart: null,
      analogues: [],
      allOffers: [],
      hasLoaded: false,
    },
    filters: {
      inStockOnly: false,
      searchQuery: '',
      activeTab: 'all',
      sortBy: 'default',
    },
  };

  it('updates API key and search number', () => {
    let state = partsReducer(initialState, setApiKey('my-custom-key'));
    expect(state.apiKey).toBe('my-custom-key');

    state = partsReducer(state, setSearchNumber('01089'));
    expect(state.searchNumber).toBe('01089');
  });

  it('handles stage 1 pending and fulfilled states', () => {
    let state = partsReducer(initialState, {
      type: fetchManufacturers.pending.type,
    });
    expect(state.stage1.loading).toBe(true);
    expect(state.stage1.hasSearched).toBe(true);

    const brands = [{ brand: 'OSSCA', name: 'Стеклоподъемник', totalCount: 36 }];
    state = partsReducer(state, {
      type: fetchManufacturers.fulfilled.type,
      payload: { brands, number: '01089' },
    });
    expect(state.stage1.loading).toBe(false);
    expect(state.stage1.brands).toEqual(brands);
    expect(state.stage1.searchedNumber).toBe('01089');
  });

  it('handles stage 2 pending and fulfilled transitions', () => {
    let state = partsReducer(initialState, {
      type: fetchOffers.pending.type,
      meta: { arg: { number: '01089', brand: 'OSSCA' } },
    });
    expect(state.stage2.loading).toBe(true);
    expect(state.selectedBrand).toBe('OSSCA');
    expect(state.currentStage).toBe(2);

    const originalPart = { brand: 'OSSCA', name: 'Деталь 1', isOriginal: true };
    const analogues = [{ brand: 'STELLOX', name: 'Аналог 1', isOriginal: false }];

    state = partsReducer(state, {
      type: fetchOffers.fulfilled.type,
      payload: {
        originalPart,
        analogues,
        allOffers: [originalPart, ...analogues],
        brand: 'OSSCA',
        number: '01089',
      },
    });

    expect(state.stage2.loading).toBe(false);
    expect(state.stage2.allOffers).toHaveLength(2);
    expect(state.stage2.originalPart.brand).toBe('OSSCA');
  });

  it('allows returning back to brands (stage 1)', () => {
    let state = {
      ...initialState,
      currentStage: 2,
      selectedBrand: 'OSSCA',
    };
    state = partsReducer(state, backToBrands());
    expect(state.currentStage).toBe(1);
    expect(state.selectedBrand).toBeNull();
  });

  it('resets everything on resetAll', () => {
    let state = {
      ...initialState,
      currentStage: 2,
      selectedBrand: 'OSSCA',
      searchNumber: '01089',
    };
    state = partsReducer(state, resetAll());
    expect(state.currentStage).toBe(1);
    expect(state.searchNumber).toBe('');
    expect(state.selectedBrand).toBeNull();
  });
});

