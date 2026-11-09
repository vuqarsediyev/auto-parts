import React from 'react';
import { formatPrice, formatShipmentDate } from '../utils/formatters';

export default function WarehouseDetails({ item, onClose }) {
  if (!item) return null;

  const warehouses = Array.isArray(item.warehouses) ? item.warehouses : [];

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      role="dialog"
      aria-modal="true"
    >
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content border-0 shadow-lg">
          <div className="modal-header bg-light">
            <div>
              <h5 className="modal-title fw-bold d-flex align-items-center gap-2 mb-1">
                <i className="bi bi-buildings text-primary" />
                Наличие на складах
              </h5>
              <div className="small text-muted">
                <span className="badge bg-primary me-2">{item.brand}</span>
                <span className="font-monospace fw-semibold me-2">#{item.number}</span>
                <span>{item.name}</span>
              </div>
            </div>
            <button
              type="button"
              className="btn-close"
              aria-label="Закрыть"
              onClick={onClose}
            />
          </div>

          <div className="modal-body p-0">
            {warehouses.length === 0 ? (
              <div className="p-4 text-center text-muted">
                <i className="bi bi-box-seam fs-2 d-block mb-2 text-secondary" />
                Данная позиция временно отсутствует на складах или доступна только под предварительный заказ.
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th scope="col">Склад</th>
                      <th scope="col">Тип</th>
                      <th scope="col" className="text-center">Остаток</th>
                      <th scope="col" className="text-end">Цена склада</th>
                      <th scope="col">Срок отгрузки</th>
                      <th scope="col" className="text-center">Возвратность</th>
                    </tr>
                  </thead>
                  <tbody>
                    {warehouses.map((wh, idx) => {
                      const isOwn = Boolean(wh.own);
                      const isNotRefund = Boolean(wh.notRefund);
                      return (
                        <tr key={wh.id || idx}>
                          <td>
                            <strong className="font-monospace text-dark">
                              {wh.code || 'Склад поставщика'}
                            </strong>
                            {wh.id && (
                              <div className="text-muted small" style={{ fontSize: '0.7rem' }}>
                                ID: {wh.id.slice(0, 8)}...
                              </div>
                            )}
                          </td>
                          <td>
                            <span
                              className={`badge ${
                                isOwn ? 'bg-success-subtle text-success border border-success' : 'bg-light text-secondary border'
                              }`}
                            >
                              {isOwn ? 'Собственный' : 'Партнерский'}
                            </span>
                          </td>
                          <td className="text-center">
                            <span className="badge bg-primary bg-opacity-10 text-primary fs-6 px-3 py-1">
                              {wh.stock} шт.
                            </span>
                          </td>
                          <td className="text-end">
                            <span className="fw-bold text-success fs-6">
                              {formatPrice(wh.price)}
                            </span>
                          </td>
                          <td>
                            <div className="small">
                              <i className="bi bi-clock me-1 text-muted" />
                              {formatShipmentDate(wh.shipmentDate)}
                            </div>
                          </td>
                          <td className="text-center">
                            {isNotRefund ? (
                              <span
                                className="badge bg-danger-subtle text-danger border border-danger small"
                                title="Позицию нельзя вернуть по причине «Отказ»"
                              >
                                Невозвратная
                              </span>
                            ) : (
                              <span className="badge bg-light text-muted border small">
                                Возвратная
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="modal-footer bg-light d-flex justify-content-between">
            <div className="small text-muted">
              Всего складов: <strong>{warehouses.length}</strong> | Суммарный остаток:{' '}
              <strong>{warehouses.reduce((sum, w) => sum + (Number(w.stock) || 0), 0)} шт.</strong>
            </div>
            <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
              Закрыть
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

