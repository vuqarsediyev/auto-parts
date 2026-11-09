import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import partsReducer from '../store/partsSlice';
import SearchBar from '../components/SearchBar';
import BrandSelector from '../components/BrandSelector';
import OffersTable from '../components/OffersTable';
import Loader from '../components/Loader';
import ErrorAlert from '../components/ErrorAlert';

function renderWithStore(ui, { preloadedState } = {}) {
  const store = configureStore({
    reducer: { parts: partsReducer },
    preloadedState,
  });
  return {
    ...render(<Provider store={store}>{ui}</Provider>),
    store,
  };
}

describe('React Components', () => {
  it('renders Loader with custom message', () => {
    render(<Loader text="Тестовая загрузка" />);
    expect(screen.getByText('Тестовая загрузка')).toBeInTheDocument();
  });

  it('renders ErrorAlert and handles retry click', () => {
    const handleRetry = vi.fn();
    render(<ErrorAlert error="Empty key!" onRetry={handleRetry} />);
    expect(screen.getByText(/Не указан уникальный ключ покупателя/i)).toBeInTheDocument();

    const retryBtn = screen.getByRole('button', { name: /повторить/i });
    fireEvent.click(retryBtn);
    expect(handleRetry).toHaveBeenCalledTimes(1);
  });

  it('renders SearchBar and handles input change', () => {
    renderWithStore(<SearchBar />);
    const input = screen.getByPlaceholderText(/Например: 01089/i);
    fireEvent.change(input, { target: { value: '01089' } });
    expect(input.value).toBe('01089');
  });

  it('renders BrandSelector with list of manufacturers (Stage 1)', () => {
    const preloadedState = {
      parts: {
        apiKey: '00000000-0000-0000-0000-000000000001',
        searchNumber: '01089',
        selectedBrand: null,
        currentStage: 1,
        stage1: {
          loading: false,
          error: null,
          hasSearched: true,
          searchedNumber: '01089',
          brands: [
            {
              brand: 'OSSCA',
              name: 'Стеклоподъемник задний левый',
              number: '01089',
              totalCount: 36,
              warehouses: [{ code: 'МСК', price: 1084.82, stock: 36 }],
            },
            {
              brand: 'FEBI',
              name: 'Антифриз синий',
              number: '01089',
              totalCount: 800,
              warehouses: [],
            },
          ],
        },
        stage2: { loading: false, error: null, allOffers: [] },
        filters: { inStockOnly: false, searchQuery: '', activeTab: 'all', sortBy: 'default' },
      },
    };

    renderWithStore(<BrandSelector />, { preloadedState });

    // Проверяем отображение списка брендов
    expect(screen.getByText('OSSCA')).toBeInTheDocument();
    expect(screen.getByText('FEBI')).toBeInTheDocument();
    expect(screen.getByText('Стеклоподъемник задний левый')).toBeInTheDocument();
    expect(screen.getByText('Антифриз синий')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Выбрать OSSCA/i })).toBeInTheDocument();
  });

  it('renders OffersTable with all required fields (Stage 2: Name/Brand, Price, Stock)', () => {
    const originalPart = {
      brand: 'OSSCA',
      name: 'Стеклоподъемник задний левый',
      number: '01089',
      count: 36,
      isOriginal: true,
      warehouses: [
        { code: 'МСК РС', price: 1084.82, stock: 36, own: false, shipmentDate: '2026-11-12T13:30:00+03:00' },
      ],
    };

    const analoguePart = {
      brand: 'STELLOX',
      name: 'Стеклоподъемник аналог',
      number: '7550430SX',
      count: 138,
      isOriginal: false,
      warehouses: [
        { code: 'СПБ', price: 644.0, stock: 138, own: true, shipmentDate: '2026-11-13T13:30:00+03:00' },
      ],
    };

    const preloadedState = {
      parts: {
        apiKey: '00000000-0000-0000-0000-000000000001',
        searchNumber: '01089',
        selectedBrand: 'OSSCA',
        currentStage: 2,
        stage1: {
          loading: false,
          error: null,
          hasSearched: true,
          searchedNumber: '01089',
          brands: [],
        },
        stage2: {
          loading: false,
          error: null,
          originalPart,
          analogues: [analoguePart],
          allOffers: [originalPart, analoguePart],
          hasLoaded: true,
        },
        filters: { inStockOnly: false, searchQuery: '', activeTab: 'all', sortBy: 'default' },
      },
    };

    renderWithStore(<OffersTable />, { preloadedState });

    // Проверяем обязательные поля согласно требованиям ТЗ:
    // 1. Название / Производитель
    expect(screen.getByText('Стеклоподъемник задний левый')).toBeInTheDocument();
    expect(screen.getByText('Стеклоподъемник аналог')).toBeInTheDocument();
    expect(screen.getAllByText('OSSCA').length).toBeGreaterThan(0);
    expect(screen.getByText('STELLOX')).toBeInTheDocument();

    // 2. Стоимость (цена)
    expect(screen.getByText(/1.*084/)).toBeInTheDocument();
    expect(screen.getByText(/644/)).toBeInTheDocument();

    // 3. Доступный остаток на складе
    expect(screen.getByText('36 шт.')).toBeInTheDocument();
    expect(screen.getByText('138 шт.')).toBeInTheDocument();
  });
});

