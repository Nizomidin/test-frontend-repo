/**
 * API-модуль для работы с клиентами
 */
import { fetchAPI, postAPI, putAPI, uploadFile } from './apiConfig';

/**
 * Модуль для работы с API клиентов
 */
const clientApi = {
  /**
   * Получить данные клиента по ID
   * @param {string|number} clientId - ID клиента
   * @returns {Promise<Object>} - данные клиента
   */
  fetchClient: (clientId) => {
    return fetchAPI(`/clients/${clientId}`);
  },

  /**
   * Создать нового клиента
   * @param {Object} clientData - данные клиента
   * @returns {Promise<Object>} - созданный клиент
   */
  createClient: (clientData) => {
    return postAPI('/clients', clientData);
  },

  /**
   * Обновить данные клиента
   * @param {string|number} clientId - ID клиента
   * @param {Object} clientData - обновленные данные
   * @returns {Promise<Object>} - обновленные данные клиента
   */
  updateClient: (clientId, clientData) => {
    return putAPI(`/clients/${clientId}`, clientData);
  },

  /**
   * Загрузить фото клиента
   * @param {string|number} clientId - ID клиента
   * @param {FormData} formData - данные формы с фото
   * @returns {Promise<Object>} - результат загрузки
   */
  uploadPhoto: (clientId, formData) => {
    return uploadFile(`/clients/${clientId}/photo`, formData);
  },

  /**
   * Получить клиентов мастера
   * @param {string|number} masterId - ID мастера
   * @returns {Promise<Array>} - список клиентов
   */
  fetchMasterClients: (masterId) => {
    return fetchAPI(`/masters/${masterId}/clients`);
  },

  /**
   * Найти клиента по контактной информации
   * @param {Object} searchParams - параметры поиска (телефон, email, телеграм)
   * @returns {Promise<Array>} - список найденных клиентов
   */
  findClient: (searchParams) => {
    return fetchAPI('/clients/search', searchParams);
  }
};

export default clientApi;
