// Тестовый скрипт для проверки удаления и редактирования кастомных бронирований

// 1. Тестовые данные для кастомного бронирования
const testCustomBooking = {
  master_id: 1, // Замените на ID вашего мастера
  client_name: "Тестовый клиент",
  service_name: "Тестовая услуга",
  start_time: "2025-05-15 14:00",
  end_time: "2025-05-15 15:00",
  status: "booked",
  comment: "Тестовое кастомное бронирование"
};

// 2. Функция для создания тестового кастомного бронирования
async function createTestCustomBooking() {
  try {
    const response = await fetch('https://api.kuchizu.online/custom_appointments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'accept': 'application/json'
      },
      body: JSON.stringify(testCustomBooking)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Ошибка создания кастомного бронирования: ${errorData.detail || response.statusText}`);
    }
    
    const data = await response.json();
    console.log('✅ Тестовое кастомное бронирование создано:', data);
    return data;
  } catch (error) {
    console.error('❌ Ошибка:', error);
    return null;
  }
}

// 3. Функция для удаления тестового кастомного бронирования
async function deleteTestCustomBooking(bookingId) {
  try {
    const response = await fetch(`https://api.kuchizu.online/custom_appointments/${bookingId}`, {
      method: 'DELETE',
      headers: {
        'accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Ошибка удаления кастомного бронирования: ${errorData.detail || response.statusText}`);
    }
    
    console.log(`✅ Тестовое кастомное бронирование ${bookingId} успешно удалено`);
    return true;
  } catch (error) {
    console.error('❌ Ошибка:', error);
    return false;
  }
}

// 4. Функция для обновления тестового кастомного бронирования
async function updateTestCustomBooking(bookingId, updateData) {
  try {
    const response = await fetch(`https://api.kuchizu.online/custom_appointments/${bookingId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'accept': 'application/json'
      },
      body: JSON.stringify(updateData)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Ошибка обновления кастомного бронирования: ${errorData.detail || response.statusText}`);
    }
    
    const data = await response.json();
    console.log('✅ Тестовое кастомное бронирование обновлено:', data);
    return data;
  } catch (error) {
    console.error('❌ Ошибка:', error);
    return null;
  }
}

// 5. Запуск тестирования
async function runTests() {
  console.log('🧪 Начало тестирования кастомных бронирований...');
  
  // Создаем тестовое бронирование
  const booking = await createTestCustomBooking();
  if (!booking) {
    console.error('❌ Тестирование остановлено из-за ошибки создания бронирования.');
    return;
  }
  
  // Пауза для визуального осмотра в интерфейсе
  console.log('⏳ Пауза 5 секунд для проверки создания в интерфейсе...');
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  // Обновляем тестовое бронирование
  const updateData = {
    master_id: booking.master_id,
    client_name: "Обновленный клиент",
    service_name: "Обновленная услуга",
    start_time: booking.start_time, // Оставляем то же время начала
    end_time: booking.end_time,     // Оставляем то же время окончания
    comment: "Обновленный комментарий"
  };
  
  const updatedBooking = await updateTestCustomBooking(booking.id, updateData);
  if (!updatedBooking) {
    console.error('❌ Тестирование остановлено из-за ошибки обновления бронирования.');
    return;
  }
  
  // Пауза для визуального осмотра в интерфейсе
  console.log('⏳ Пауза 5 секунд для проверки обновления в интерфейсе...');
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  // Удаляем тестовое бронирование
  const deleted = await deleteTestCustomBooking(booking.id);
  if (!deleted) {
    console.error('❌ Тестирование остановлено из-за ошибки удаления бронирования.');
    return;
  }
  
  console.log('✅ Все тесты успешно пройдены!');
}

// Запускаем тестирование при загрузке файла
runTests().catch(console.error);

// Экспортируем функции для использования в консоли браузера
window.testCustomBooking = {
  create: createTestCustomBooking,
  update: updateTestCustomBooking,
  delete: deleteTestCustomBooking,
  runTests: runTests
};
