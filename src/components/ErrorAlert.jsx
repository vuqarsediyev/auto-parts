import React from 'react';

// Человекопонятные пояснения к кодам ошибок из PDF-документации
const ERROR_DESCRIPTIONS = {
  'Empty key!': 'Не указан уникальный ключ покупателя (API Key).',
  'Invalid key client!': 'Неверный ключ покупателя, покупатель не найден в системе.',
  'Invalid access key': 'Неверный или недействительный ключ доступа API.',
  'Empty number goods!': 'Не указан номер (артикул) детали для поиска.',
  'Request quota exceeded!': 'Превышен лимит запросов по грузовому ассортименту.',
};

export default function ErrorAlert({ error, onRetry, title = 'Произошла ошибка' }) {
  if (!error) return null;

  const rawMessage = typeof error === 'string' ? error : error?.message || 'Неизвестная ошибка';
  const explanation = ERROR_DESCRIPTIONS[rawMessage] || null;

  return (
    <div className="alert alert-danger shadow-sm border-danger border-opacity-25 rounded-3 p-3 my-3" role="alert">
      <div className="d-flex align-items-start">
        <i className="bi bi-exclamation-triangle-fill fs-4 text-danger me-3 mt-1" />
        <div className="flex-grow-1">
          <h6 className="alert-heading fw-bold mb-1">{title}</h6>
          <p className="mb-1 text-danger-emphasis">
            {explanation ? (
              <>
                <strong>{explanation}</strong>
                <span className="text-muted d-block small mt-1">Ответ API: "{rawMessage}"</span>
              </>
            ) : (
              rawMessage
            )}
          </p>
          <div className="small text-secondary mt-2">
            Проверьте подключение к сети, корректность артикула детали или настройки API-ключа.
          </div>
        </div>
        {onRetry && (
          <button
            type="button"
            className="btn btn-sm btn-outline-danger ms-3 align-self-center text-nowrap"
            onClick={onRetry}
          >
            <i className="bi bi-arrow-clockwise me-1" />
            Повторить
          </button>
        )}
      </div>
    </div>
  );
}

