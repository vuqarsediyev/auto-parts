import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchManufacturers, setSearchNumber } from '../store/partsSlice';

// Примеры номеров деталей из официальной документации wsprice
const EXAMPLE_ARTICLES = [
  { number: '01089', label: '01089 (Стеклоподъемники, фильтры, 10 брендов)' },
  { number: '7160500039S', label: '7160500039S (Рычаги MEYLE из примера PDF)' },
  { number: '0189', label: '0189 (CAFFARO / ZEN / NGKNTK)' },
];

export default function SearchBar() {
  const dispatch = useDispatch();
  const searchNumber = useSelector((state) => state.parts.searchNumber);
  const loadingStage1 = useSelector((state) => state.parts.stage1.loading);

  const [inputVal, setInputVal] = useState(searchNumber || '');

  const handleSearch = (numberToSearch) => {
    const query = (numberToSearch !== undefined ? numberToSearch : inputVal).trim();
    if (!query) return;

    dispatch(setSearchNumber(query));
    dispatch(fetchManufacturers(query));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSearch(inputVal);
  };

  const handleExampleClick = (num) => {
    setInputVal(num);
    handleSearch(num);
  };

  const handleClear = () => {
    setInputVal('');
  };

  return (
    <div className="card shadow-sm border-0 mb-4 bg-white">
      <div className="card-body p-4">
        <form onSubmit={handleSubmit}>
          <div className="row g-3 align-items-center">
            <div className="col-lg-9 col-md-8">
              <label htmlFor="partNumberInput" className="form-label fw-bold mb-1">
                <i className="bi bi-search me-2 text-primary" />
                Артикул (номер) автозапчасти:
              </label>
              <div className="input-group input-group-lg">
                <input
                  id="partNumberInput"
                  type="text"
                  className="form-control font-monospace"
                  placeholder="Например: 01089, 7160500039S..."
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  autoComplete="off"
                  disabled={loadingStage1}
                />
                {inputVal && (
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={handleClear}
                    title="Очистить поле"
                    disabled={loadingStage1}
                  >
                    <i className="bi bi-x-lg" />
                  </button>
                )}
                <button
                  type="submit"
                  className="btn btn-primary px-4 fw-semibold d-flex align-items-center gap-2"
                  disabled={loadingStage1 || !inputVal.trim()}
                >
                  {loadingStage1 ? (
                    <>
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                      Поиск...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-search" />
                      Найти производителей
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Быстрые примеры из документации для проверки */}
            <div className="col-lg-3 col-md-4">
              <span className="form-label text-muted small fw-semibold d-block mb-1">
                Быстрые примеры из PDF:
              </span>
              <div className="d-flex flex-wrap gap-1">
                {EXAMPLE_ARTICLES.map((ex) => (
                  <button
                    key={ex.number}
                    type="button"
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => handleExampleClick(ex.number)}
                    disabled={loadingStage1}
                    title={ex.label}
                  >
                    {ex.number}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

