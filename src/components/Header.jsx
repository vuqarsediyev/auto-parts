import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setApiKey, resetAll } from '../store/partsSlice';
import { DEFAULT_API_KEY } from '../api/favoritPartsApi';

export default function Header() {
  const dispatch = useDispatch();
  const currentApiKey = useSelector((state) => state.parts.apiKey);

  const [showKeyModal, setShowKeyModal] = useState(false);
  const [tempKey, setTempKey] = useState(currentApiKey);
  const [isSaved, setIsSaved] = useState(false);

  const handleOpenModal = () => {
    setTempKey(currentApiKey);
    setIsSaved(false);
    setShowKeyModal(true);
  };

  const handleSaveKey = (e) => {
    e.preventDefault();
    dispatch(setApiKey(tempKey.trim() || DEFAULT_API_KEY));
    setIsSaved(true);
    setTimeout(() => {
      setShowKeyModal(false);
      setIsSaved(false);
    }, 600);
  };

  const handleResetToDefault = () => {
    setTempKey(DEFAULT_API_KEY);
    dispatch(setApiKey(DEFAULT_API_KEY));
  };

  const isDefault = currentApiKey === DEFAULT_API_KEY;

  return (
    <>
      <header className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm py-3 mb-4">
        <div className="container">
          <div
            className="navbar-brand d-flex align-items-center gap-2 cursor-pointer text-decoration-none"
            onClick={() => dispatch(resetAll())}
            style={{ cursor: 'pointer' }}
          >
            <div className="bg-primary text-white rounded-3 p-2 d-flex align-items-center justify-content-center shadow-sm" style={{ width: '40px', height: '40px' }}>
              <i className="bi bi-gear-wide-connected fs-5" />
            </div>
            <div>
              <div className="fw-bold fs-5 lh-1 text-white">AutoParts Search</div>
              <small className="text-secondary" style={{ fontSize: '0.75rem' }}>
                Поиск автозапчастей и аналогов • API «Проценка»
              </small>
            </div>
          </div>

          <div className="d-flex align-items-center gap-2">
            <button
              type="button"
              className={`btn btn-sm d-flex align-items-center gap-2 ${
                isDefault ? 'btn-outline-secondary' : 'btn-outline-warning'
              }`}
              onClick={handleOpenModal}
              title="Настройки API-ключа"
            >
              <i className="bi bi-key-fill" />
              <span className="d-none d-sm-inline">API Key:</span>
              <span className="font-monospace small">
                {currentApiKey ? `${currentApiKey.slice(0, 8)}...` : 'Не задан'}
              </span>
              {isDefault ? (
                <span className="badge bg-secondary text-light">демо</span>
              ) : (
                <span className="badge bg-warning text-dark">пользовательский</span>
              )}
            </button>

            <button
              type="button"
              className="btn btn-sm btn-outline-light"
              onClick={() => dispatch(resetAll())}
              title="Начать новый поиск"
            >
              <i className="bi bi-arrow-counterclockwise me-1" />
              <span className="d-none d-sm-inline">Сброс</span>
            </button>
          </div>
        </div>
      </header>

      {/* Модальное окно настройки API-ключа */}
      {showKeyModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-light">
                <h5 className="modal-title d-flex align-items-center gap-2">
                  <i className="bi bi-shield-lock text-primary" />
                  Уникальный ключ покупателя (API Key)
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowKeyModal(false)}
                />
              </div>

              <form onSubmit={handleSaveKey}>
                <div className="modal-body">
                  <p className="text-muted small mb-3">
                    Веб-сервис «Проценка» требует параметр <code>key</code> в каждом запросе.
                    По умолчанию используется демонстрационный ключ из документации.
                  </p>

                  <div className="mb-3">
                    <label className="form-label fw-semibold small">API Key:</label>
                    <input
                      type="text"
                      className="form-control font-monospace"
                      value={tempKey}
                      onChange={(e) => setTempKey(e.target.value)}
                      placeholder="00000000-0000-0000-0000-000000000001"
                      required
                    />
                  </div>

                  <div className="d-flex justify-content-between align-items-center">
                    <button
                      type="button"
                      className="btn btn-link btn-sm text-decoration-none p-0"
                      onClick={handleResetToDefault}
                    >
                      Восстановить ключ по умолчанию
                    </button>
                    {isSaved && <span className="text-success small fw-semibold">Ключ сохранен!</span>}
                  </div>
                </div>

                <div className="modal-footer bg-light">
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setShowKeyModal(false)}
                  >
                    Отмена
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm">
                    Сохранить ключ
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

