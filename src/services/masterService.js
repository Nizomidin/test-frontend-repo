/**
 * Сервис для бизнес-логики, связанной с мастерами
 */
import masterApi from '../api/masterApi';
import bookingApi from '../api/bookingApi';

/**
 * Сервис для работы с мастерами
 */
const masterService = {
  /**
   * Проверяет, является ли мастер администратором компании
   * @param {string|number} masterId - ID мастера
   * @param {string|number} companyId - ID компании
   * @returns {Promise<boolean>} - результат проверки
   */
  isCompanyAdmin: async (masterId, companyId) => {
    try {
      if (!masterId || !companyId) return false;
      
      const companyData = await masterApi.fetchCompany(companyId);
      return companyData.admin_id === masterId;
    } catch (error) {
      console.error('isCompanyAdmin error:', error);
      return false;
    }
  },

  /**
   * Обработка выходного дня мастера
   * @param {string|number} masterId - ID мастера 
   * @param {string} dateStr - Дата в формате YYYY-MM-DD
   * @param {boolean} isDayOff - Флаг установки/снятия выходного
   * @returns {Promise<boolean>} - результат операции
   */
  toggleDayOff: async (masterId, dateStr, isDayOff) => {
    try {
      if (isDayOff) {
        await masterApi.removeDayOff(masterId, dateStr);
      } else {
        await masterApi.markDayOff(masterId, dateStr);
      }
      return true;
    } catch (error) {
      console.error('toggleDayOff error:', error);
      throw error;
    }
  },

  /**
   * Получить полную информацию о мастере, включая связанные данные
   * @param {string|number} masterId - ID мастера
   * @returns {Promise<Object>} - данные мастера с дополнительной информацией
   */
  fetchMasterWithRelatedData: async (masterId) => {
    try {
      const [masterData, bookings, services] = await Promise.all([
        masterApi.fetchMaster(masterId),
        bookingApi.fetchMasterBookings(masterId),
        masterApi.fetchMasterServices(masterId)
      ]);
      
      return {
        ...masterData,
        bookings,
        services
      };
    } catch (error) {
      console.error('fetchMasterWithRelatedData error:', error);
      throw error;
    }
  },

  /**
   * Подготовка данных мастера для отображения на странице профиля
   * @param {Object} rawMasterData - "сырые" данные мастера из API
   * @returns {Object} - подготовленные данные для компонента
   */
  prepareMasterProfileData: (rawMasterData) => {
    if (!rawMasterData) return null;
    
    // Преобразуем данные в формат, удобный для компонентов
    return {
      id: rawMasterData.id,
      firstName: rawMasterData.first_name,
      lastName: rawMasterData.last_name,
      photoUrl: rawMasterData.photo_url,
      phoneNumber: rawMasterData.phone_number,
      telegramHandle: rawMasterData.telegram_username,
      address: rawMasterData.address,
      companyId: rawMasterData.company_id,
      companyName: rawMasterData.company_name,
      serviceCategory: rawMasterData.service_category,
      workSchedule: rawMasterData.work_schedule || {},
      daysOff: rawMasterData.days_off || []
    };
  }
};

export default masterService;
