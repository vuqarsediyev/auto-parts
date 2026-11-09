import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  getManufacturersByNumber,
  getOffersAndAnalogues,
  DEFAULT_API_KEY,
} from '../api/favoritPartsApi';

/**
 * Thunk для Этапа 1: Поиск производителей по артикулу детали
 */
export const fetchManufacturers = createAsyncThunk(
  'parts/fetchManufacturers',
  async (number, { getState, rejectWithValue }) => {
    try {
      const { apiKey } = getState().parts;
      const brands = await getManufacturersByNumber(number, apiKey);
      return { brands, number };
    } catch (err) {
      return rejectWithValue(err.message || 'Ошибка при загрузке списка производителей');
    }
  }
);

/**
 * Thunk для Этапа 2: Получение предложений и аналогов по артикулу и бренду
 */
export const fetchOffers = createAsyncThunk(
  'parts/fetchOffers',
  async ({ number, brand }, { getState, rejectWithValue }) => {
    try {
      const { apiKey } = getState().parts;
      const result = await getOffersAndAnalogues(number, brand, apiKey);
      return { ...result, brand, number };
    } catch (err) {
      return rejectWithValue(err.message || 'Ошибка при загрузке предложений и аналогов');
    }
  }
);

const initialState = {
  // Настройки
  apiKey: DEFAULT_API_KEY,

  // Текущие поисковые параметры
  searchNumber: '',
  selectedBrand: null,
  currentStage: 1, // 1: Поиск и выбор производителя, 2: Просмотр предложений и аналогов

  // Состояние Этапа 1
  stage1: {
    loading: false,
    error: null,
    brands: [],
    searchedNumber: '',
    hasSearched: false,
  },

  // Состояние Этапа 2
  stage2: {
    loading: false,
    error: null,
    originalPart: null,
    analogues: [],
    allOffers: [],
    hasLoaded: false,
  },

  // Фильтрация и сортировка предложений
  filters: {
    inStockOnly: false,
    searchQuery: '',
    activeTab: 'all', // 'all' | 'original' | 'analogues'
    sortBy: 'default', // 'default' | 'priceAsc' | 'priceDesc' | 'stockDesc' | 'brandAsc'
  },
};

const partsSlice = createSlice({
  name: 'parts',
  initialState,
  reducers: {
    setApiKey: (state, action) => {
      state.apiKey = action.payload;
    },
    setSearchNumber: (state, action) => {
      state.searchNumber = action.payload;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },
    backToBrands: (state) => {
      state.currentStage = 1;
      state.selectedBrand = null;
      state.stage2 = initialState.stage2;
      state.filters = initialState.filters;
    },
    resetAll: (state) => {
      state.searchNumber = '';
      state.selectedBrand = null;
      state.currentStage = 1;
      state.stage1 = initialState.stage1;
      state.stage2 = initialState.stage2;
      state.filters = initialState.filters;
    },
  },
  extraReducers: (builder) => {
    // Этап 1: fetchManufacturers
    builder
      .addCase(fetchManufacturers.pending, (state) => {
        state.stage1.loading = true;
        state.stage1.error = null;
        state.stage1.hasSearched = true;
        state.stage1.brands = [];
        state.selectedBrand = null;
        state.currentStage = 1;
        state.stage2 = initialState.stage2;
      })
      .addCase(fetchManufacturers.fulfilled, (state, action) => {
        state.stage1.loading = false;
        state.stage1.error = null;
        state.stage1.brands = action.payload.brands;
        state.stage1.searchedNumber = action.payload.number;
      })
      .addCase(fetchManufacturers.rejected, (state, action) => {
        state.stage1.loading = false;
        state.stage1.error = action.payload || 'Не удалось получить список производителей';
        state.stage1.brands = [];
      });

    // Этап 2: fetchOffers
    builder
      .addCase(fetchOffers.pending, (state, action) => {
        state.stage2.loading = true;
        state.stage2.error = null;
        state.stage2.hasLoaded = true;
        state.selectedBrand = action.meta.arg.brand;
        state.currentStage = 2;
      })
      .addCase(fetchOffers.fulfilled, (state, action) => {
        state.stage2.loading = false;
        state.stage2.error = null;
        state.stage2.originalPart = action.payload.originalPart;
        state.stage2.analogues = action.payload.analogues;
        state.stage2.allOffers = action.payload.allOffers;
      })
      .addCase(fetchOffers.rejected, (state, action) => {
        state.stage2.loading = false;
        state.stage2.error = action.payload || 'Не удалось получить аналоги и предложения';
      });
  },
});

export const {
  setApiKey,
  setSearchNumber,
  setFilters,
  resetFilters,
  backToBrands,
  resetAll,
} = partsSlice.actions;

export default partsSlice.reducer;

