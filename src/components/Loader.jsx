import React from 'react';

export default function Loader({ text = 'Загрузка...', size = 'normal' }) {
  const spinnerClass = size === 'large' ? 'spinner-border text-primary' : 'spinner-border text-primary spinner-border-sm';
  const containerStyle = size === 'large' ? { minHeight: '180px' } : { minHeight: '80px' };

  return (
    <div
      className="d-flex flex-column align-items-center justify-content-center p-4 my-3 bg-light bg-opacity-50 rounded border"
      style={containerStyle}
      role="status"
      aria-live="polite"
    >
      <div className={spinnerClass} style={size === 'large' ? { width: '3rem', height: '3rem' } : {}} />
      <span className="mt-3 text-secondary fw-semibold">{text}</span>
    </div>
  );
}

