import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { backToBrands } from '../store/partsSlice';

export default function StepTracker() {
  const dispatch = useDispatch();
  const currentStage = useSelector((state) => state.parts.currentStage);
  const selectedBrand = useSelector((state) => state.parts.selectedBrand);
  const searchNumber = useSelector((state) => state.parts.stage1.searchedNumber);
  const brandsCount = useSelector((state) => state.parts.stage1.brands.length);

  return (
    <div className="card shadow-sm border-0 mb-4 bg-white">
      <div className="card-body py-3 px-4">
        <div className="row g-2 align-items-center">
          {/* Этап 1 */}
          <div className="col-md-6">
            <div
              className={`p-2 rounded-3 d-flex align-items-center transition-all ${
                currentStage === 1
                  ? 'bg-primary bg-opacity-10 border border-primary border-opacity-25'
                  : 'bg-light text-muted'
              }`}
            >
              <div
                className={`rounded-circle d-flex align-items-center justify-content-center me-3 fw-bold ${
                  currentStage === 1
                    ? 'bg-primary text-white'
                    : currentStage > 1
                    ? 'bg-success text-white'
                    : 'bg-secondary text-white'
                }`}
                style={{ width: '34px', height: '34px', minWidth: '34px', fontSize: '0.9rem' }}
              >
                {currentStage > 1 ? <i className="bi bi-check-lg" /> : '1'}
              </div>
              <div className="overflow-hidden">
                <div className="fw-bold small text-uppercase text-secondary" style={{ letterSpacing: '0.5px' }}>
                  Этап 1
                </div>
                <div className="fw-semibold text-truncate">
                  Поиск производителей
                  {searchNumber && (
                    <span className="badge bg-secondary ms-2 fw-normal font-monospace">
                      #{searchNumber}
                    </span>
                  )}
                </div>
                {brandsCount > 0 && currentStage === 1 && (
                  <div className="text-muted small">Найдено брендов: {brandsCount}</div>
                )}
              </div>
            </div>
          </div>

          {/* Этап 2 */}
          <div className="col-md-6">
            <div
              className={`p-2 rounded-3 d-flex align-items-center justify-content-between transition-all ${
                currentStage === 2
                  ? 'bg-primary bg-opacity-10 border border-primary border-opacity-25'
                  : 'bg-light text-muted'
              }`}
            >
              <div className="d-flex align-items-center overflow-hidden">
                <div
                  className={`rounded-circle d-flex align-items-center justify-content-center me-3 fw-bold ${
                    currentStage === 2 ? 'bg-primary text-white' : 'bg-secondary bg-opacity-50 text-white'
                  }`}
                  style={{ width: '34px', height: '34px', minWidth: '34px', fontSize: '0.9rem' }}
                >
                  2
                </div>
                <div className="overflow-hidden">
                  <div className="fw-bold small text-uppercase text-secondary" style={{ letterSpacing: '0.5px' }}>
                    Этап 2
                  </div>
                  <div className="fw-semibold text-truncate">
                    Аналоги и предложения
                    {selectedBrand && (
                      <span className="badge bg-primary ms-2 fw-normal">
                        Бренд: {selectedBrand}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {currentStage === 2 && (
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary ms-2 text-nowrap"
                  onClick={() => dispatch(backToBrands())}
                  title="Вернуться к выбору производителя"
                >
                  <i className="bi bi-arrow-left me-1" />
                  К брендам
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

