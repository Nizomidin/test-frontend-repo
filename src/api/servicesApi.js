/**
 * API-модуль для работы с услугами
 */
import { fetchAPI, postAPI, putAPI, deleteAPI } from './apiConfig';

/**
 * Модуль для работы с API услуг
 */
const servicesApi = {
  /**
   * Получить все услуги мастера
   * @param {string|number} masterId - ID мастера
   * @returns {Promise<Array>} - список услуг
   */
  fetchMasterServices: (masterId) => {
    return fetchAPI(`/masters/${masterId}/services`);
  },

  /**
   * Получить услугу по ID
   * @param {string|number} serviceId - ID услуги
   * @returns {Promise<Object>} - данные услуги
   */
  fetchService: (serviceId) => {
    return fetchAPI(`/services/${serviceId}`);
  },

  /**
   * Создать новую услугу для мастера
   * @param {string|number} masterId - ID мастера
   * @param {Object} serviceData - данные услуги
   * @returns {Promise<Object>} - созданная услуга
   */
  createService: (masterId, serviceData) => {
    return postAPI(`/masters/${masterId}/services`, serviceData);
  },

  /**
   * Обновить услугу
   * @param {string|number} serviceId - ID услуги
   * @param {Object} serviceData - обновленные данные
   * @returns {Promise<Object>} - обновленная услуга
   */
  updateService: (serviceId, serviceData) => {
    return putAPI(`/services/${serviceId}`, serviceData);
  },

  /**
   * Удалить услугу
   * @param {string|number} serviceId - ID услуги
   * @returns {Promise<Object>} - результат удаления
   */
  deleteService: (serviceId) => {
    return deleteAPI(`/services/${serviceId}`);
  },

  /**
   * Получить все категории услуг
   * @returns {Promise<Array>} - список категорий услуг
   */
  fetchServiceCategories: () => {
    return fetchAPI('/service-categories');
  },

  /**
   * Получить услуги по категории
   * @param {string} categoryId - ID категории
   * @returns {Promise<Array>} - список услуг в категории
   */
  fetchServicesByCategory: (categoryId) => {
    return fetchAPI(`/service-categories/${categoryId}/services`);
  }
};

export default servicesApi;
