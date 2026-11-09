import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchOffers, fetchManufacturers } from '../store/partsSlice';
import Loader from './Loader';
import ErrorAlert from './ErrorAlert';

export default function BrandSelector() {
  const dispatch = useDispatch();
  const { loading, error, brands, searchedNumber, hasSearched } = useSelector(
    (state) => state.parts.stage1
  );
  const loadingStage2 = useSelector((state) => state.parts.stage2.loading);

  if (!hasSearched) {
    return (
      <div className="card shadow-sm border-0 bg-white text-center py-5 px-3">
        <div className="card-body">
          <div className="text-primary mb-3">
            <i className="bi bi-search fs-1" />
          </div>
          <h4 className="card-title fw-bold">Этап 1: Поиск производителей</h4>
          <p className="card-text text-muted mx-auto" style={{ maxWidth: '540px' }}>
            Введите артикул автозапчасти в поле поиска выше (например,{' '}
            <code className="text-primary fw-semibold">01089</code> или{' '}
            <code className="text-primary fw-semibold">7160500039S</code>), чтобы получить список
            брендов-производителей, выпускающих эту номенклатуру.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return <Loader text={`Ищем производителей по артикулу «${searchedNumber}»...`} size="large" />;
  }

  if (error) {
    return (
      <ErrorAlert
        error={error}
        title="Не удалось получить производителей"
        onRetry={() => dispatch(fetchManufacturers(searchedNumber))}
      />
    );
  }

  if (brands.length === 0) {
    return (
      <div className="card shadow-sm border-0 bg-white text-center py-5 px-3">
        <div className="card-body">
          <div className="text-warning mb-3">
            <i className="bi bi-inbox fs-1" />
          </div>
          <h5 className="card-title fw-bold">Позиция не найдена</h5>
          <p className="card-text text-muted mx-auto" style={{ maxWidth: '500px' }}>
            По артикулу <strong className="font-monospace text-dark">«{searchedNumber}»</strong> производители
            не найдены в базе данных поставщика. Пожалуйста, проверьте правильность ввода артикула.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-4">
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-3">
        <div>
          <h5 className="fw-bold mb-1 d-flex align-items-center gap-2">
            <span>Список производителей по артикулу</span>
            <span className="badge bg-secondary font-monospace">#{searchedNumber}</span>
          </h5>
          <p className="text-muted small mb-0">
            Выберите производителя для перехода к <strong>Этапу 2</strong> (загрузка цен, складов и аналогов).
          </p>
        </div>
        <span className="badge bg-primary fs-6 px-3 py-2 rounded-pill shadow-sm">
          Найдено производителей: {brands.length}
        </span>
      </div>

      <div className="row g-3">
        {brands.map((b) => {
          const inStock = b.totalCount > 0;
          return (
            <div key={b.brand} className="col-lg-4 col-md-6">
              <div className="card h-100 shadow-sm border border-light-subtle hover-shadow transition-all">
                <div className="card-body d-flex flex-column justify-content-between p-3">
                  <div>
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h5 className="card-title fw-bold text-primary mb-0 font-monospace">
                        {b.brand}
                      </h5>
                      <span
                        className={`badge ${
                          inStock ? 'bg-success bg-opacity-10 text-success border border-success' : 'bg-secondary bg-opacity-10 text-secondary'
                        }`}
                      >
                        {inStock ? `В наличии: ${b.totalCount} шт.` : 'Под заказ (0 шт.)'}
                      </span>
                    </div>

                    <h6 className="card-subtitle text-dark mb-2 text-truncate" title={b.name}>
                      {b.name}
                    </h6>

                    <div className="text-muted small mb-3">
                      <div>
                        <span className="text-secondary">Артикул:</span>{' '}
                        <span className="font-monospace fw-semibold text-dark">{b.number}</span>
                      </div>
                      {b.warehouses && b.warehouses.length > 0 && (
                        <div>
                          <span className="text-secondary">Складов с остатком:</span>{' '}
                          <span className="fw-semibold text-dark">{b.warehouses.length}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    className="btn btn-outline-primary w-100 fw-semibold d-flex align-items-center justify-content-center gap-2"
                    onClick={() =>
                      dispatch(
                        fetchOffers({
                          number: searchedNumber,
                          brand: b.brand,
                        })
                      )
                    }
                    disabled={loadingStage2}
                  >
                    <span>Выбрать {b.brand}</span>
                    <i className="bi bi-arrow-right" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

