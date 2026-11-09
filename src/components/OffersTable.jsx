import React, { useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchOffers, backToBrands, setFilters } from '../store/partsSlice';
import { getItemPricing, getItemStock } from '../utils/formatters';
import Loader from './Loader';
import ErrorAlert from './ErrorAlert';
import WarehouseDetails from './WarehouseDetails';

export default function OffersTable() {
  const dispatch = useDispatch();
  const { loading, error, originalPart, analogues, allOffers } = useSelector(
    (state) => state.parts.stage2
  );
  const selectedBrand = useSelector((state) => state.parts.selectedBrand);
  const searchNumber = useSelector((state) => state.parts.stage1.searchedNumber);
  const filters = useSelector((state) => state.parts.filters);

  // Состояние для просмотра детальной информации о складах конкретного товара
  const [activeWarehouseItem, setActiveWarehouseItem] = useState(null);

  // Фильтрация и сортировка позиций
  const filteredOffers = useMemo(() => {
    let list = [...allOffers];

    // Фильтр по вкладкам: Все / Искомая деталь / Только аналоги
    if (filters.activeTab === 'original') {
      list = list.filter((item) => item.isOriginal);
    } else if (filters.activeTab === 'analogues') {
      list = list.filter((item) => !item.isOriginal);
    }

    // Фильтр "Только в наличии"
    if (filters.inStockOnly) {
      list = list.filter((item) => getItemStock(item).inStock);
    }

    // Текстовый поиск по результатам (по названию, бренду или номеру)
    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase().trim();
      list = list.filter(
        (item) =>
          (item.name && item.name.toLowerCase().includes(q)) ||
          (item.brand && item.brand.toLowerCase().includes(q)) ||
          (item.number && item.number.toLowerCase().includes(q))
      );
    }

    // Сортировка
    if (filters.sortBy === 'priceAsc') {
      list.sort((a, b) => {
        const pa = getItemPricing(a).minPrice || Infinity;
        const pb = getItemPricing(b).minPrice || Infinity;
        return pa - pb;
      });
    } else if (filters.sortBy === 'priceDesc') {
      list.sort((a, b) => {
        const pa = getItemPricing(a).minPrice || 0;
        const pb = getItemPricing(b).minPrice || 0;
        return pb - pa;
      });
    } else if (filters.sortBy === 'stockDesc') {
      list.sort((a, b) => getItemStock(b).total - getItemStock(a).total);
    } else if (filters.sortBy === 'brandAsc') {
      list.sort((a, b) => (a.brand || '').localeCompare(b.brand || ''));
    }

    return list;
  }, [allOffers, filters]);

  if (loading) {
    return (
      <Loader
        text={`Загрузка предложений и аналогов для «${selectedBrand}» #${searchNumber}...`}
        size="large"
      />
    );
  }

  if (error) {
    return (
      <div className="mb-4">
        <ErrorAlert
          error={error}
          title="Не удалось загрузить предложения и аналоги"
          onRetry={() =>
            dispatch(
              fetchOffers({
                number: searchNumber,
                brand: selectedBrand,
              })
            )
          }
        />
        <div className="text-center mt-3">
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={() => dispatch(backToBrands())}
          >
            <i className="bi bi-arrow-left me-1" />
            Вернуться к выбору производителя
          </button>
        </div>
      </div>
    );
  }

  if (allOffers.length === 0) {
    return (
      <div className="card shadow-sm border-0 bg-white text-center py-5 px-3 mb-4">
        <div className="card-body">
          <div className="text-muted mb-3">
            <i className="bi bi-search fs-1" />
          </div>
          <h5 className="card-title fw-bold">Предложения не найдены</h5>
          <p className="card-text text-muted mx-auto" style={{ maxWidth: '500px' }}>
            По запросу <strong className="font-monospace">#{searchNumber}</strong> (бренд:{' '}
            <strong>{selectedBrand}</strong>) не найдено предложений и аналогов.
          </p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => dispatch(backToBrands())}
          >
            <i className="bi bi-arrow-left me-1" />
            Выбрать другого производителя
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-4">
      {/* Шапка результатов Этапа 2 */}
      <div className="card shadow-sm border-0 mb-3 bg-white">
        <div className="card-body p-3">
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
            <div>
              <div className="d-flex align-items-center gap-2 mb-1">
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
                  onClick={() => dispatch(backToBrands())}
                  title="Вернуться к списку производителей"
                >
                  <i className="bi bi-arrow-left" />
                  <span>Назад к брендам</span>
                </button>
                <h5 className="fw-bold mb-0">
                  Предложения и аналоги по запросу:
                </h5>
              </div>
              <div className="d-flex align-items-center gap-2 mt-2">
                <span className="badge bg-primary fs-6 px-3 py-1 font-monospace">
                  #{searchNumber}
                </span>
                <span className="badge bg-dark fs-6 px-3 py-1">
                  Производитель: {selectedBrand}
                </span>
                <span className="text-muted small">
                  Найдено позиций: <strong>{allOffers.length}</strong> (Оригинал:{' '}
                  {originalPart ? '1' : '0'}, Аналогов: {analogues.length})
                </span>
              </div>
            </div>

            {/* Быстрые фильтры и сортировка */}
            <div className="d-flex flex-wrap align-items-center gap-2">
              <div className="form-check form-switch me-2">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="inStockCheck"
                  checked={filters.inStockOnly}
                  onChange={(e) =>
                    dispatch(setFilters({ inStockOnly: e.target.checked }))
                  }
                />
                <label className="form-check-label small fw-semibold" htmlFor="inStockCheck">
                  Только в наличии
                </label>
              </div>

              <select
                className="form-select form-select-sm"
                style={{ width: 'auto' }}
                value={filters.sortBy}
                onChange={(e) => dispatch(setFilters({ sortBy: e.target.value }))}
                aria-label="Сортировка"
              >
                <option value="default">По умолчанию</option>
                <option value="priceAsc">Сначала дешевле</option>
                <option value="priceDesc">Сначала дороже</option>
                <option value="stockDesc">По остатку на складе</option>
                <option value="brandAsc">По бренду (А-Я)</option>
              </select>
            </div>
          </div>

          <hr className="my-3 text-secondary opacity-25" />

          {/* Вкладки и строка поиска внутри результатов */}
          <div className="row g-2 align-items-center">
            <div className="col-md-6">
              <ul className="nav nav-pills small">
                <li className="nav-item">
                  <button
                    type="button"
                    className={`nav-link py-1 px-3 ${
                      filters.activeTab === 'all' ? 'active' : ''
                    }`}
                    onClick={() => dispatch(setFilters({ activeTab: 'all' }))}
                  >
                    Все позиции ({allOffers.length})
                  </button>
                </li>
                {originalPart && (
                  <li className="nav-item">
                    <button
                      type="button"
                      className={`nav-link py-1 px-3 ${
                        filters.activeTab === 'original' ? 'active' : ''
                      }`}
                      onClick={() => dispatch(setFilters({ activeTab: 'original' }))}
                    >
                      Искомая деталь (1)
                    </button>
                  </li>
                )}
                <li className="nav-item">
                  <button
                    type="button"
                    className={`nav-link py-1 px-3 ${
                      filters.activeTab === 'analogues' ? 'active' : ''
                    }`}
                    onClick={() => dispatch(setFilters({ activeTab: 'analogues' }))}
                  >
                    Аналоги ({analogues.length})
                  </button>
                </li>
              </ul>
            </div>

            <div className="col-md-6">
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-light border-end-0">
                  <i className="bi bi-funnel text-muted" />
                </span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Фильтр по названию, бренду или номеру..."
                  value={filters.searchQuery}
                  onChange={(e) =>
                    dispatch(setFilters({ searchQuery: e.target.value }))
                  }
                />
                {filters.searchQuery && (
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => dispatch(setFilters({ searchQuery: '' }))}
                  >
                    <i className="bi bi-x" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Итоговая таблица найденных позиций */}
      <div className="card shadow-sm border-0 bg-white overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light border-bottom">
              <tr>
                <th scope="col" style={{ width: '130px' }}>
                  Тип
                </th>
                <th scope="col">
                  Название / Производитель
                </th>
                <th scope="col" style={{ width: '150px' }}>
                  Артикул (Номер)
                </th>
                <th scope="col" className="text-end" style={{ width: '160px' }}>
                  Стоимость (цена)
                </th>
                <th scope="col" className="text-center" style={{ width: '170px' }}>
                  Доступный остаток
                </th>
                <th scope="col" className="text-center" style={{ width: '140px' }}>
                  Склады
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredOffers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-muted">
                    <i className="bi bi-filter-circle fs-4 d-block mb-2 text-secondary" />
                    По заданным критериям фильтра ничего не найдено.
                  </td>
                </tr>
              ) : (
                filteredOffers.map((item, idx) => {
                  const pricing = getItemPricing(item);
                  const stock = getItemStock(item);
                  const isOriginal = Boolean(item.isOriginal);

                  return (
                    <tr
                      key={item.goodsID || `${item.brand}-${item.number}-${idx}`}
                      className={isOriginal ? 'table-primary-subtle' : ''}
                    >
                      {/* Тип позиции */}
                      <td>
                        {isOriginal ? (
                          <span className="badge bg-primary text-white d-inline-flex align-items-center gap-1">
                            <i className="bi bi-star-fill small" />
                            Искомая
                          </span>
                        ) : (
                          <span className="badge bg-secondary-subtle text-secondary border">
                            Аналог
                          </span>
                        )}
                      </td>

                      {/* Обязательное поле: Название / Производитель */}
                      <td>
                        <div className="fw-bold text-dark">{item.name || 'Деталь без названия'}</div>
                        <div className="d-flex align-items-center gap-2 mt-1">
                          <span className="badge bg-dark bg-opacity-75 text-light font-monospace">
                            {item.brand}
                          </span>
                          {item.notRefund && (
                            <span
                              className="badge bg-danger-subtle text-danger border border-danger small"
                              title="Невозвратная позиция"
                            >
                              Невозвратная
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Артикул / Номер детали */}
                      <td>
                        <span className="font-monospace fw-semibold text-secondary">
                          {item.number}
                        </span>
                      </td>

                      {/* Обязательное поле: Стоимость (цена) */}
                      <td className="text-end">
                        <div
                          className={`fw-bold fs-6 ${
                            pricing.hasPrice ? 'text-success' : 'text-muted'
                          }`}
                        >
                          {pricing.displayPrice}
                        </div>
                        {pricing.fromWarehouse && pricing.isRange && (
                          <div className="text-muted small" style={{ fontSize: '0.75rem' }}>
                            разные склады
                          </div>
                        )}
                        {!pricing.fromWarehouse && pricing.hasPrice && (
                          <div className="text-muted small" style={{ fontSize: '0.75rem' }}>
                            базовая цена
                          </div>
                        )}
                      </td>

                      {/* Обязательное поле: Доступный остаток на складе */}
                      <td className="text-center">
                        <span
                          className={`badge fs-6 px-3 py-1 ${
                            stock.inStock
                              ? 'bg-success bg-opacity-10 text-success border border-success'
                              : 'bg-secondary bg-opacity-10 text-secondary'
                          }`}
                        >
                          {stock.inStock ? `${stock.total} шт.` : '0 шт.'}
                        </span>
                        <div className="text-muted small mt-1" style={{ fontSize: '0.75rem' }}>
                          {stock.warehouseCount > 0
                            ? `Складов: ${stock.warehouseCount}`
                            : 'Склады не указаны'}
                        </div>
                      </td>

                      {/* Кнопка просмотра конкретных складов */}
                      <td className="text-center">
                        {stock.warehouseCount > 0 ? (
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => setActiveWarehouseItem(item)}
                            title="Посмотреть список складов и сроки отгрузки"
                          >
                            <i className="bi bi-buildings me-1" />
                            Склады ({stock.warehouseCount})
                          </button>
                        ) : (
                          <span className="text-muted small">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Модальное окно детализации складов для выбранной детали */}
      {activeWarehouseItem && (
        <WarehouseDetails
          item={activeWarehouseItem}
          onClose={() => setActiveWarehouseItem(null)}
        />
      )}
    </div>
  );
}

