/**
 * Утилиты для форматирования цен, дат и расчёта складских данных
 */

/**
 * Форматирование цены в рублях
 */
export function formatPrice(price) {
  if (price === null || price === undefined || isNaN(price) || price <= 0) {
    return 'По запросу';
  }
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(price);
}

/**
 * Получение актуального диапазона цен по складам.
 * Согласно документации API: "цену нужно брать из конкретного склада,
 * этот реквизит (в корне товара) остался для совместимости".
 */
export function getItemPricing(item) {
  const warehouses = Array.isArray(item.warehouses) ? item.warehouses : [];
  const validWarehousePrices = warehouses
    .map(w => Number(w.price))
    .filter(p => !isNaN(p) && p > 0);

  if (validWarehousePrices.length > 0) {
    const minPrice = Math.min(...validWarehousePrices);
    const maxPrice = Math.max(...validWarehousePrices);
    return {
      minPrice,
      maxPrice,
      isRange: minPrice !== maxPrice,
      displayPrice: minPrice === maxPrice
        ? formatPrice(minPrice)
        : `от ${formatPrice(minPrice)}`,
      hasPrice: true,
      fromWarehouse: true,
    };
  }

  // Если складов нет или цены в складах 0, смотрим цену товара как резервную
  const itemPrice = Number(item.price);
  if (!isNaN(itemPrice) && itemPrice > 0) {
    return {
      minPrice: itemPrice,
      maxPrice: itemPrice,
      isRange: false,
      displayPrice: formatPrice(itemPrice),
      hasPrice: true,
      fromWarehouse: false,
    };
  }

  return {
    minPrice: 0,
    maxPrice: 0,
    isRange: false,
    displayPrice: 'Нет цены',
    hasPrice: false,
    fromWarehouse: false,
  };
}

/**
 * Получение суммарного и складского остатка
 */
export function getItemStock(item) {
  const warehouses = Array.isArray(item.warehouses) ? item.warehouses : [];
  const warehouseTotal = warehouses.reduce((sum, w) => sum + (Number(w.stock) || 0), 0);
  
  // Документация указывает count как остаток на всех складах
  const totalCount = Number(item.count) || warehouseTotal;

  return {
    total: totalCount,
    warehouseCount: warehouses.length,
    inStock: totalCount > 0,
  };
}

/**
 * Форматирование даты отгрузки (shipmentDate: "2026-11-12T13:30:00+03:00")
 */
export function formatShipmentDate(dateString) {
  if (!dateString) return '—';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return dateString;
  }
}

