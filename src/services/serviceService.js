/**
 * Сервис для бизнес-логики, связанной с услугами
 */
import servicesApi from '../api/servicesApi';

/**
 * Сервис для работы с услугами
 */
const serviceService = {
  /**
   * Получить все услуги мастера
   * @param {string|number} masterId - ID мастера
   * @returns {Promise<Array>} - список услуг
   */
  getMasterServices: async (masterId) => {
    try {
      const services = await servicesApi.fetchMasterServices(masterId);
      return services.map(service => serviceService.formatServiceData(service));
    } catch (error) {
      console.error('getMasterServices error:', error);
      throw error;
    }
  },

  /**
   * Получить услугу по ID
   * @param {string|number} serviceId - ID услуги
   * @returns {Promise<Object>} - данные услуги
   */
  getServiceById: async (serviceId) => {
    try {
      const service = await servicesApi.fetchService(serviceId);
      return serviceService.formatServiceData(service);
    } catch (error) {
      console.error('getServiceById error:', error);
      throw error;
    }
  },

  /**
   * Создать новую услугу для мастера
   * @param {string|number} masterId - ID мастера
   * @param {Object} serviceData - данные услуги
   * @returns {Promise<Object>} - созданная услуга
   */
  createService: async (masterId, serviceData) => {
    try {
      const newService = await servicesApi.createService(masterId, serviceData);
      return serviceService.formatServiceData(newService);
    } catch (error) {
      console.error('createService error:', error);
      throw error;
    }
  },

  /**
   * Обновить услугу
   * @param {string|number} serviceId - ID услуги
   * @param {Object} serviceData - обновленные данные
   * @returns {Promise<Object>} - обновленная услуга
   */
  updateService: async (serviceId, serviceData) => {
    try {
      const updatedService = await servicesApi.updateService(serviceId, serviceData);
      return serviceService.formatServiceData(updatedService);
    } catch (error) {
      console.error('updateService error:', error);
      throw error;
    }
  },

  /**
   * Удалить услугу
   * @param {string|number} serviceId - ID услуги
   * @returns {Promise<Object>} - результат удаления
   */
  deleteService: async (serviceId) => {
    try {
      const result = await servicesApi.deleteService(serviceId);
      return result;
    } catch (error) {
      console.error('deleteService error:', error);
      throw error;
    }
  },

  /**
   * Получить все категории услуг
   * @returns {Promise<Array>} - список категорий услуг
   */
  getServiceCategories: async () => {
    try {
      const categories = await servicesApi.fetchServiceCategories();
      return categories;
    } catch (error) {
      console.error('getServiceCategories error:', error);
      throw error;
    }
  },

  /**
   * Получить услуги по категории
   * @param {string} categoryId - ID категории
   * @returns {Promise<Array>} - список услуг в категории
   */
  getServicesByCategory: async (categoryId) => {
    try {
      const services = await servicesApi.fetchServicesByCategory(categoryId);
      return services.map(service => serviceService.formatServiceData(service));
    } catch (error) {
      console.error('getServicesByCategory error:', error);
      throw error;
    }
  },

  /**
   * Форматирует данные услуги для отображения в UI
   * @param {Object} serviceData - данные услуги из API
   * @returns {Object} - отформатированные данные услуги
   */
  formatServiceData: (serviceData) => {
    if (!serviceData) return null;
    
    return {
      id: serviceData._id || serviceData.id,
      name: serviceData.name,
      description: serviceData.description,
      price: serviceData.price,
      duration: serviceData.duration,
      category: serviceData.category,
      categoryId: serviceData.category_id,
      masterId: serviceData.master_id,
      isActive: serviceData.is_active !== false,
      createdAt: serviceData.created_at,
      updatedAt: serviceData.updated_at
    };
  }
};

export default serviceService;
