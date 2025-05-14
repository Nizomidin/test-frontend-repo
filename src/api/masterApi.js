/**
 * API-модуль для работы с мастерами
 */
import { fetchAPI, postAPI, putAPI, deleteAPI, uploadFile } from './apiConfig';

/**
 * Модуль для работы с API мастеров
 */
const masterApi = {
  /**
   * Получить данные мастера по ID
   * @param {string|number} masterId - ID мастера
   * @returns {Promise<Object>} - данные мастера
   */
  fetchMaster: (masterId) => {
    return fetchAPI(`/masters/${masterId}`);
  },

  /**
   * Регистрация нового мастера
   * @param {Object} masterData - данные мастера для регистрации
   * @returns {Promise<Object>} - результат регистрации с ID мастера
   */
  registerMaster: (masterData) => {
    return postAPI('/masters/register', masterData);
  },

  /**
   * Обновить данные мастера
   * @param {string|number} masterId - ID мастера
   * @param {Object} masterData - обновленные данные мастера
   * @returns {Promise<Object>} - обновленные данные мастера
   */
  updateMaster: (masterId, masterData) => {
    return putAPI(`/masters/${masterId}`, masterData);
  },

  /**
   * Загрузить фото мастера
   * @param {string|number} masterId - ID мастера
   * @param {FormData} formData - данные формы с фото
   * @returns {Promise<Object>} - результат загрузки
   */
  uploadPhoto: (masterId, formData) => {
    return uploadFile(`/masters/${masterId}/photo`, formData);
  },

  /**
   * Получить расписание работы мастера
   * @param {string|number} masterId - ID мастера
   * @returns {Promise<Array>} - расписание мастера
   */
  fetchWorkSchedule: (masterId) => {
    return fetchAPI(`/masters/${masterId}/schedule`);
  },

  /**
   * Обновить расписание работы мастера
   * @param {string|number} masterId - ID мастера
   * @param {Object} scheduleData - данные расписания
   * @returns {Promise<Object>} - обновленное расписание
   */
  updateWorkSchedule: (masterId, scheduleData) => {
    return putAPI(`/masters/${masterId}/schedule`, scheduleData);
  },

  /**
   * Получить список компаний
   * @returns {Promise<Array>} - список компаний
   */
  fetchCompanies: () => {
    return fetchAPI('/companies');
  },

  /**
   * Получить список категорий услуг
   * @returns {Promise<Array>} - список категорий
   */
  fetchServiceCategories: () => {
    return fetchAPI('/service-categories');
  },

  /**
   * Отметить день как выходной
   * @param {string|number} masterId - ID мастера
   * @param {string} date - дата в формате YYYY-MM-DD
   * @returns {Promise<Object>} - результат операции
   */
  markDayOff: (masterId, date) => {
    return postAPI(`/masters/${masterId}/day-off`, { date });
  },

  /**
   * Убрать отметку выходного дня
   * @param {string|number} masterId - ID мастера
   * @param {string} date - дата в формате YYYY-MM-DD
   * @returns {Promise<Object>} - результат операции
   */
  removeDayOff: (masterId, date) => {
    return deleteAPI(`/masters/${masterId}/day-off/${date}`);
  }
};

export default masterApi;
