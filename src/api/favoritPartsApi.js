/**
 * API-клиент для работы с веб-сервисом «Проценка» (Favorit Parts).
 * Документация: wsprice
 */

const DEFAULT_API_KEY = '00000000-0000-0000-0000-000000000001';

// В режиме разработки через Vite используется прокси (/api/hsprice/),
// предотвращающий возможные блокировки Mixed Content / CORS.
// В качестве резервного используется прямой URL сервиса.
const PROXY_URL = '/api/hsprice/';
const DIRECT_URL = 'http://api.favorit-parts.ru/hs/hsprice/';

/**
 * Универсальный запрос к API с автоматическим резервным переключением (proxy -> direct).
 */
async function apiGet(params) {
  const queryParams = new URLSearchParams();

  for (const [key, val] of Object.entries(params)) {
    if (val !== undefined && val !== null && val !== '') {
      queryParams.append(key, val);
    }
  }

  const queryString = queryParams.toString();
  const urlsToTry = [
    `${PROXY_URL}?${queryString}`,
    `${DIRECT_URL}?${queryString}`,
  ];

  let lastError = null;

  for (const url of urlsToTry) {
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Ошибка сервера: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      // Проверка на ошибку от самого API сервиса (например, "Invalid access key", "Empty key!", "Empty number goods!")
      if (data.error) {
        throw new Error(data.error);
      }

      return data;
    } catch (err) {
      lastError = err;
      // Если это ошибка валидации от API (например invalid key), повторять через direct нет смысла
      if (err.message && (err.message.includes('key') || err.message.includes('goods') || err.message.includes('quota'))) {
        throw err;
      }
      // Иначе пробуем следующий URL (резервный)
    }
  }

  throw lastError || new Error('Не удалось подключиться к серверу API');
}

/**
 * Проверка элемента на "пустую структуру" согласно документации:
 * "Если товар не найден в базе, то возвращается массив с одним элементом в виде пустой структуры ответа."
 */
function isDummyItem(item) {
  if (!item) return true;
  const isZeroId = item.goodsID === '00000000-0000-0000-0000-000000000000';
  const hasEmptyBrand = !item.brand || item.brand.trim() === '';
  const hasEmptyName = !item.name || item.name.trim() === '';
  return hasEmptyBrand && (isZeroId || hasEmptyName);
}

/**
 * Этап 1: Поиск производителей по артикулу (номеру) запчасти.
 * Возвращает список производителей с информацией о найденных позициях.
 */
export async function getManufacturersByNumber(number, apiKey = DEFAULT_API_KEY) {
  if (!number || !number.trim()) {
    throw new Error('Укажите номер (артикул) запчасти');
  }

  const cleanNumber = number.trim();
  const cleanKey = apiKey?.trim() || DEFAULT_API_KEY;

  const data = await apiGet({
    key: cleanKey,
    number: cleanNumber,
  });

  const rawGoods = Array.isArray(data.goods) ? data.goods : [];
  const validGoods = rawGoods.filter(item => !isDummyItem(item));

  // Группируем по производителям
  const brandsMap = new Map();

  for (const item of validGoods) {
    const brandName = (item.brand || '').trim();
    if (!brandName) continue;

    if (!brandsMap.has(brandName)) {
      brandsMap.set(brandName, {
        brand: brandName,
        number: item.number || cleanNumber,
        name: item.name || 'Деталь без названия',
        goodsID: item.goodsID,
        totalCount: item.count || 0,
        price: item.price || 0,
        warehouses: Array.isArray(item.warehouses) ? item.warehouses : [],
      });
    } else {
      // Если один производитель встретился несколько раз, суммируем остатки
      const existing = brandsMap.get(brandName);
      existing.totalCount += (item.count || 0);
    }
  }

  return Array.from(brandsMap.values());
}

/**
 * Этап 2: Получение предложений и аналогов для выбранного артикула и производителя.
 * Передаются параметры: number, brand, analogues=on, info=on.
 */
export async function getOffersAndAnalogues(number, brand, apiKey = DEFAULT_API_KEY) {
  if (!number || !number.trim()) {
    throw new Error('Номер детали не может быть пустым');
  }
  if (!brand || !brand.trim()) {
    throw new Error('Производитель не выбран');
  }

  const cleanNumber = number.trim();
  const cleanBrand = brand.trim();
  const cleanKey = apiKey?.trim() || DEFAULT_API_KEY;

  const data = await apiGet({
    key: cleanKey,
    number: cleanNumber,
    brand: cleanBrand,
    analogues: 'on',
    info: 'on',
  });

  const rawGoods = Array.isArray(data.goods) ? data.goods : [];
  const validGoods = rawGoods.filter(item => !isDummyItem(item));

  if (validGoods.length === 0) {
    return {
      originalPart: null,
      analogues: [],
      allOffers: [],
    };
  }

  // Основная деталь (искомый товар по номеру и выбранному производителю)
  const originalItem = validGoods[0];
  const originalPart = {
    ...originalItem,
    isOriginal: true,
    warehouses: Array.isArray(originalItem.warehouses) ? originalItem.warehouses : [],
  };

  // Аналоги детали
  const rawAnalogues = Array.isArray(originalItem.analogues) ? originalItem.analogues : [];
  const validAnalogues = rawAnalogues
    .filter(item => !isDummyItem(item))
    .map(item => ({
      ...item,
      isOriginal: false,
      warehouses: Array.isArray(item.warehouses) ? item.warehouses : [],
    }));

  return {
    originalPart,
    analogues: validAnalogues,
    allOffers: [originalPart, ...validAnalogues],
  };
}

export { DEFAULT_API_KEY };

