/**
 * Сервис для бизнес-логики, связанной с клиентами
 */
import clientApi from '../api/clientApi';

/**
 * Сервис для работы с клиентами
 */
const clientService = {
  /**
   * Получить данные клиента по ID
   * @param {string|number} clientId - ID клиента
   * @returns {Promise<Object>} - данные клиента
   */
  getClientById: async (clientId) => {
    try {
      const client = await clientApi.fetchClient(clientId);
      return clientService.formatClientData(client);
    } catch (error) {
      console.error('getClientById error:', error);
      throw error;
    }
  },

  /**
   * Создать нового клиента
   * @param {Object} clientData - данные клиента
   * @returns {Promise<Object>} - созданный клиент
   */
  createClient: async (clientData) => {
    try {
      const newClient = await clientApi.createClient(clientData);
      return clientService.formatClientData(newClient);
    } catch (error) {
      console.error('createClient error:', error);
      throw error;
    }
  },

  /**
   * Обновить данные клиента
   * @param {string|number} clientId - ID клиента
   * @param {Object} clientData - обновленные данные
   * @returns {Promise<Object>} - обновленные данные клиента
   */
  updateClient: async (clientId, clientData) => {
    try {
      const updatedClient = await clientApi.updateClient(clientId, clientData);
      return clientService.formatClientData(updatedClient);
    } catch (error) {
      console.error('updateClient error:', error);
      throw error;
    }
  },

  /**
   * Получить клиентов мастера
   * @param {string|number} masterId - ID мастера
   * @returns {Promise<Array>} - список клиентов
   */
  getMasterClients: async (masterId) => {
    try {
      const clients = await clientApi.fetchMasterClients(masterId);
      return clients.map(client => clientService.formatClientData(client));
    } catch (error) {
      console.error('getMasterClients error:', error);
      throw error;
    }
  },

  /**
   * Найти клиента по контактной информации
   * @param {Object} searchParams - параметры поиска (телефон, email, телеграм)
   * @returns {Promise<Array>} - список найденных клиентов
   */
  findClient: async (searchParams) => {
    try {
      const clients = await clientApi.findClient(searchParams);
      return clients.map(client => clientService.formatClientData(client));
    } catch (error) {
      console.error('findClient error:', error);
      throw error;
    }
  },

  /**
   * Загрузить фото клиента
   * @param {string|number} clientId - ID клиента
   * @param {FormData} formData - данные формы с фото
   * @returns {Promise<Object>} - результат загрузки
   */
  uploadPhoto: async (clientId, formData) => {
    try {
      const result = await clientApi.uploadPhoto(clientId, formData);
      return result;
    } catch (error) {
      console.error('uploadPhoto error:', error);
      throw error;
    }
  },

  /**
   * Форматирует данные клиента для отображения в UI
   * @param {Object} clientData - данные клиента из API
   * @returns {Object} - отформатированные данные клиента
   */
  formatClientData: (clientData) => {
    if (!clientData) return null;
    
    return {
      id: clientData._id || clientData.id,
      firstName: clientData.first_name,
      lastName: clientData.last_name,
      email: clientData.email,
      phone: clientData.phone_number,
      telegramUsername: clientData.telegram_username,
      photoUrl: clientData.photo_url,
      notes: clientData.notes,
      createdAt: clientData.created_at,
      updatedAt: clientData.updated_at
    };
  }
};

export default clientService;
