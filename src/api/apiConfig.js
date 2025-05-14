/**
 * Конфигурация API-клиента
 * Содержит базовый URL и вспомогательные функции для работы с API
 */

// Базовый URL для API запросов
export const API_BASE = process.env.REACT_APP_API_BASE || 'https://api.kuchizu.online';

/**
 * Отправляет GET-запрос к API
 * @param {string} endpoint - эндпоинт API без базового URL 
 * @param {Object} queryParams - параметры запроса
 * @returns {Promise<any>} - результат запроса
 */
export const fetchAPI = async (endpoint, queryParams = {}) => {
  try {
    // Формируем URL с параметрами
    let url = `${API_BASE}${endpoint}`;
    const queryString = new URLSearchParams(queryParams).toString();
    if (queryString) {
      url += `?${queryString}`;
    }

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    throw error;
  }
};

/**
 * Отправляет POST-запрос к API
 * @param {string} endpoint - эндпоинт API без базового URL 
 * @param {Object} data - данные для отправки
 * @returns {Promise<any>} - результат запроса
 */
export const postAPI = async (endpoint, data) => {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error posting to ${endpoint}:`, error);
    throw error;
  }
};

/**
 * Отправляет PUT-запрос к API
 * @param {string} endpoint - эндпоинт API без базового URL 
 * @param {Object} data - данные для отправки
 * @returns {Promise<any>} - результат запроса
 */
export const putAPI = async (endpoint, data) => {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error putting to ${endpoint}:`, error);
    throw error;
  }
};

/**
 * Отправляет DELETE-запрос к API
 * @param {string} endpoint - эндпоинт API без базового URL 
 * @returns {Promise<any>} - результат запроса
 */
export const deleteAPI = async (endpoint) => {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error deleting ${endpoint}:`, error);
    throw error;
  }
};

/**
 * Загружает файл на сервер
 * @param {string} endpoint - эндпоинт API без базового URL 
 * @param {FormData} formData - данные формы с файлом
 * @returns {Promise<any>} - результат запроса
 */
export const uploadFile = async (endpoint, formData) => {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error uploading file to ${endpoint}:`, error);
    throw error;
  }
};
