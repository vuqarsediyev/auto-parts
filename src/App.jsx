import React from 'react';
import { useSelector } from 'react-redux';
import Header from './components/Header';
import StepTracker from './components/StepTracker';
import SearchBar from './components/SearchBar';
import BrandSelector from './components/BrandSelector';
import OffersTable from './components/OffersTable';
import './App.css';

export default function App() {
  const currentStage = useSelector((state) => state.parts.currentStage);

  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      <Header />

      <main className="container flex-grow-1 pb-5">
        {/* Индикатор этапов подбора */}
        <StepTracker />

        {/* Блок ввода артикула */}
        <SearchBar />

        {/* Этап 1: Список производителей для выбора */}
        {currentStage === 1 && <BrandSelector />}

        {/* Этап 2: Итоговая таблица предложений и аналогов */}
        {currentStage === 2 && <OffersTable />}
      </main>

      <footer className="bg-white border-top py-3 text-center text-muted small mt-auto">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-md-6 text-md-start mb-2 mb-md-0">
              <span>Клиентский сервис подбора автозапчастей • Стек: React, Redux Toolkit, Bootstrap</span>
            </div>
            <div className="col-md-6 text-md-end">
              <span>Интеграция с Web-сервисом «Проценка» (Favorit Parts)</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
