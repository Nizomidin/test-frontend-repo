import React, { useState, useEffect } from "react";
import "./MasterBookingManager.css";
import MasterSelector from "./MasterSelector";
import { useToast } from "../Toast/ToastContext";

function MasterBookingManager({ currentMasterId }) {
  const [selectedMasterId, setSelectedMasterId] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [allMasters, setAllMasters] = useState([]);
  const [mastersSchedule, setMastersSchedule] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [viewMode, setViewMode] = useState("scheduler"); // "detailed" или "scheduler"
  const [formData, setFormData] = useState({
    service_id: "",
    client_name: "",
    appointment_datetime: "",
    comment: "",
  });
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [selectedSchedulerTime, setSelectedSchedulerTime] = useState(null);
  const [selectedSchedulerMaster, setSelectedSchedulerMaster] = useState(null);
  const [allAppointments, setAllAppointments] = useState([]);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [allServices, setAllServices] = useState({});
  const [editingAvailableTimeSlots, setEditingAvailableTimeSlots] = useState(
    []
  ); // Новое состояние для хранения доступных слотов при редактировании
  const [editingSelectedTimeSlot, setEditingSelectedTimeSlot] = useState(null); // Новое состояние для хранения выбранного слота при редактировании
  // Деструктурируем правильные функции из useToast
  const { showSuccess, showError, showWarning, showInfo } = useToast();

  // Загрузка списка всех мастеров компании
  useEffect(() => {
    const fetchMasters = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("https://api.kuchizu.online/masters");
        if (!response.ok) {
          throw new Error("Не удалось загрузить список мастеров");
        }
        const data = await response.json();
        // Фильтруем мастеров - убираем текущего мастера из списка
        let adminMasterData = {};
        for (const user of data) {
          if (user.id === currentMasterId) {
            adminMasterData = user;
            break;
          }
        }
        const filteredMasters = data.filter((master) => master.id !== currentMasterId && master.company_id === adminMasterData.company_id);
        setAllMasters(filteredMasters);

        // Сразу загружаем расписание всех мастеров на текущий день
        fetchAllMastersSchedule(filteredMasters, selectedDate);
      } catch (err) {
        console.error("Ошибка при загрузке списка мастеров:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMasters();
  }, [currentMasterId]);

  // Загрузка услуг выбранного мастера
  useEffect(() => {
    if (!selectedMasterId) return;

    const fetchServices = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `https://api.kuchizu.online/services?master_id=${selectedMasterId}`
        );
        if (!response.ok) {
          throw new Error("Не удалось загрузить услуги");
        }
        const data = await response.json();
        setServices(data);
        
        // Автоматически устанавливаем первую услугу при загрузке списка услуг
        if (data.length > 0) {
          setFormData(prev => ({
            ...prev,
            service_id: data[0].id,
          }));
        }
      } catch (err) {
        console.error("Ошибка при загрузке услуг:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchServices();
  }, [selectedMasterId]);

  // Загрузка бронирований на выбранную дату для выбранного мастера
  useEffect(() => {
    if (!selectedMasterId) return;

    const fetchBookings = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("https://api.kuchizu.online/appointments");
        if (!response.ok) {
          throw new Error("Не удалось загрузить данные о бронированиях");
        }
        const data = await response.json();
        const filteredData = data.filter(
          (item) =>
            item.master_id === selectedMasterId &&
            new Date(item.appointment_datetime).toDateString() ===
              selectedDate.toDateString() &&
            item.status === "booked"
        );
        setBookings(filteredData);
      } catch (err) {
        console.error("Ошибка при загрузке бронирований:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookings();
  }, [selectedMasterId, selectedDate]);

  // Загрузка расписаний всех мастеров и всех записей
  const fetchAllMastersSchedule = async (masters, date) => {
    setIsLoading(true);
    const dateStr = formatDateForApi(date);
    const schedulesData = {};

    try {
      // Загружаем все записи сразу
      const appointmentsResponse = await fetch(
        "https://api.kuchizu.online/appointments"
      );
      if (!appointmentsResponse.ok) {
        throw new Error("Не удалось загрузить данные о записях");
      }
      const allAppointmentsData = await appointmentsResponse.json();

      // Фильтруем записи на выбранную дату и со статусом "booked"
      const todayAppointments = allAppointmentsData.filter(
        (appointment) =>
          new Date(appointment.appointment_datetime).toDateString() ===
          date.toDateString() &&
          appointment.status === "booked"
      );

      setAllAppointments(todayAppointments);

      // Параллельно запрашиваем доступные слоты для всех мастеров
      await Promise.all(
        masters.map(async (master) => {
          try {
            const response = await fetch(
              `https://api.kuchizu.online/masters/${master.id}/available?date=${dateStr}`,
              { headers: { accept: "application/json" } }
            );

            // Если у мастера выходной или нет слотов
            if (!response.ok) {
              if (response.status === 404) {
                schedulesData[master.id] = {
                  available: false,
                  slots: [],
                  isDayOff: true,
                  appointments: todayAppointments.filter(
                    (app) => app.master_id === master.id
                  ),
                };
                return;
              }
              throw new Error(
                `Ошибка при загрузке слотов мастера ${master.id}`
              );
            }

            const availableSlots = await response.json();
            const masterAppointments = todayAppointments.filter(
              (appointment) => appointment.master_id === master.id
            );

            schedulesData[master.id] = {
              available: availableSlots.length > 0,
              slots: availableSlots,
              isDayOff: false,
              appointments: masterAppointments,
            };
          } catch (err) {
            console.error(
              `Ошибка при загрузке расписания мастера ${master.id}:`,
              err
            );
            schedulesData[master.id] = {
              error: err.message,
              available: false,
              slots: [],
              isDayOff: false,
              appointments: todayAppointments.filter(
                (app) => app.master_id === master.id
              ),
            };
          }
        })
      );

      setMastersSchedule(schedulesData);
    } catch (err) {
      console.error("Ошибка при загрузке расписаний мастеров:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Загружаем слоты при изменении мастера, услуги или даты
  useEffect(() => {
    if (selectedMasterId && formData.service_id) {
      fetchAvailableSlots();
    }
  }, [selectedMasterId, formData.service_id, selectedDate, services]);

  // Загрузка доступных слотов времени
  const fetchAvailableSlots = async () => {
    if (!selectedMasterId || !formData.service_id) return;

    const dateStr = formatDateForApi(selectedDate);
    setIsLoading(true);

    try {
      const response = await fetch(
        `https://api.kuchizu.online/masters/${selectedMasterId}/available?date=${dateStr}`,
        { headers: { accept: "application/json" } }
      );

      if (!response.ok) {
        if (response.status === 404) {
          // Если у мастера выходной
          setAvailableTimeSlots([]);
          return;
        }
        throw new Error("Ошибка загрузки интервалов");
      }

      const data = await response.json();

      // Фильтрация слотов для выбранной услуги
      const selectedService = services.find(
        (s) => s.id === formData.service_id
      );
      if (selectedService) {
        const filteredSlots = data.filter(
          (slot) => slot.service === selectedService.service_name
        );
        setAvailableTimeSlots(filteredSlots);
      } else {
        setAvailableTimeSlots([]);
      }
    } catch (err) {
      console.error("Ошибка при загрузке доступных слотов:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Загрузка всех услуг для всех мастеров
  const fetchAllServices = async () => {
    try {
      const response = await fetch("https://api.kuchizu.online/services");
      if (!response.ok) {
        throw new Error("Не удалось загрузить все услуги");
      }
      const data = await response.json();

      // Создаем объект где ключ - ID услуги, значение - сама услуга
      const servicesMap = {};
      data.forEach((service) => {
        servicesMap[service.id] = service;
      });

      setAllServices(servicesMap);
    } catch (err) {
      console.error("Ошибка при загрузке всех услуг:", err);
    }
  };

  // Загрузка услуг всех мастеров при первой загрузке
  useEffect(() => {
    fetchAllServices();
  }, []);

  // Загрузка доступных слотов времени для формы редактирования
  const fetchEditingAvailableSlots = async () => {
    console.log("editingAppointment", editingAppointment);
    if (!editingAppointment?.master_id || !editingAppointment?.service_id)
      return;

    const appointmentDate = new Date(editingAppointment.appointment_datetime);
    const dateStr = formatDateForApi(appointmentDate);
    setIsLoading(true);

    try {
      const response = await fetch(
        `https://api.kuchizu.online/masters/${editingAppointment.master_id}/available?date=${dateStr}`,
        { headers: { accept: "application/json" } }
      );
      if (!response.ok) {
        if (response.status === 404) {
          // Если у мастера выходной
          setEditingAvailableTimeSlots([]);
          return;
        }
        throw new Error("Ошибка загрузки интервалов для редактирования");
      }

      const data = await response.json();

      // Фильтрация слотов для выбранной услуги
      const selectedService = Object.values(allServices).find(
        (s) => s.id === editingAppointment.service_id
      );

      if (selectedService) {
        const filteredSlots = data.filter(
          (slot) => slot.service === selectedService.service_name
        );
        setEditingAvailableTimeSlots(filteredSlots);
      } else {
        setEditingAvailableTimeSlots([]);
      }
    } catch (err) {
      console.error(
        "Ошибка при загрузке доступных слотов для редактирования:",
        err
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Загрузка доступных слотов времени для формы редактирования с прямой передачей данных
  const fetchEditingAvailableSlotsWithData = async (appointment) => {
    if (!appointment?.master_id || !appointment?.service_id) return;
    
    const appointmentDate = new Date(appointment.appointment_datetime);
    const dateStr = formatDateForApi(appointmentDate);
    setIsLoading(true);
    
    try {
      const response = await fetch(
        `https://api.kuchizu.online/masters/${appointment.master_id}/available?date=${dateStr}`,
        { headers: { accept: "application/json" } }
      );
      
      if (!response.ok) {
        if (response.status === 404) {
          // Если у мастера выходной
          setEditingAvailableTimeSlots([]);
          return;
        }
        throw new Error("Ошибка загрузки интервалов для редактирования");
      }
      
      const data = await response.json();
      
      // Фильтрация слотов для выбранной услуги
      const selectedService = Object.values(allServices).find(s => s.id === appointment.service_id);
      if (selectedService) {
        const filteredSlots = data.filter(
          slot => slot.service === selectedService.service_name
        );
        setEditingAvailableTimeSlots(filteredSlots);
      } else {
        setEditingAvailableTimeSlots([]);
      }
    } catch (err) {
      console.error("Ошибка при загрузке доступных слотов для редактирования:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Функция форматирования даты для API
  const formatDateForApi = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Обработчик изменения выбранного мастера
  const handleMasterChange = (masterId) => {
    setSelectedMasterId(masterId);
    setViewMode("detailed"); // Переключаемся на детальный просмотр
    // Сбрасываем форму и выбранные слоты, но не service_id - он установится автоматически
    setShowBookingForm(false);
    setFormData({
      service_id: "", // Оставляем пустым, сервис установится автоматически в useEffect
      client_name: "",
      appointment_datetime: "",
      comment: "",
    });
    setSelectedTimeSlot(null);
    // НЕ сбрасываем доступные слоты при смене мастера - они загрузятся автоматически
  };

  // Обработчик нажатия кнопки "Записаться"
  const handleBookButtonClick = () => {
    setShowBookingForm(true);
  };

  // Обработчик переключения режима просмотра
  const handleViewModeToggle = (mode) => {
    setViewMode(mode);
    if (mode === "scheduler") {
      // Если переключаемся на планировщик, сбрасываем выбранного мастера
      setSelectedMasterId(null);
      // И обновляем данные для всех мастеров
      fetchAllMastersSchedule(allMasters, selectedDate);
    }
    // Сбрасываем выбранные значения планировщика
    setSelectedSchedulerTime(null);
    setSelectedSchedulerMaster(null);
  };

  // Обработчик изменения полей формы
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    if (name === "service_id") {
      // При смене услуги сбрасываем выбранный слот
      setSelectedTimeSlot(null);
      setFormData((prev) => ({
        ...prev,
        appointment_datetime: "",
      }));
      // И загружаем новые доступные слоты
      setTimeout(fetchAvailableSlots, 0);
    }
  };

  // Обработчик выбора временного слота
  const handleTimeSlotSelect = (slot) => {
    setSelectedTimeSlot(slot);
    const appointmentDateTime = `${formatDateForApi(selectedDate)} ${
      slot.start_time
    }`;
    setFormData({
      ...formData,
      appointment_datetime: appointmentDateTime,
    });
  };

  // Обработчик отправки формы бронирования
  const handleBookingSubmit = async (e) => {
    e.preventDefault();

    if (!formData.service_id || !formData.appointment_datetime) {
      setError("Пожалуйста, выберите услугу и время");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("https://api.kuchizu.online/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
        },
        body: JSON.stringify({
          master_id: selectedMasterId,
          client_name: formData.client_name || "Запись от компании",
          service_id: formData.service_id,
          appointment_datetime: formData.appointment_datetime,
          status: "booked",
          comment: formData.comment,
        }),
      });

      if (!response.ok) {
        throw new Error("Ошибка при создании записи");
      }

      // Успешно создали запись
      alert("Запись успешно создана");
      // Сбрасываем форму
      setShowBookingForm(false);
      setFormData({
        service_id: "",
        client_name: "",
        appointment_datetime: "",
        comment: "",
      });
      setSelectedTimeSlot(null);

      // Обновляем список бронирований
      const bookingsResponse = await fetch(
        "https://api.kuchizu.online/appointments"
      );
      if (bookingsResponse.ok) {
        const data = await bookingsResponse.json();

        // Если мы в режиме детального просмотра, обновляем записи для текущего мастера
        if (viewMode === "detailed" && selectedMasterId) {
          const filteredData = data.filter(
            (item) =>
              item.master_id === selectedMasterId &&
              new Date(item.appointment_datetime).toDateString() ===
                selectedDate.toDateString() &&
              item.status === "booked"
          );
          setBookings(filteredData);
        }

        // В любом случае обновляем расписание всех мастеров для планировщика
        const todayAppointments = data.filter(
          (appointment) =>
            new Date(appointment.appointment_datetime).toDateString() ===
            selectedDate.toDateString() &&
            appointment.status === "booked"
        );
        setAllAppointments(todayAppointments);
      }
    } catch (err) {
      console.error("Ошибка при создании записи:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Обработчик изменения даты
  const handleDateChange = (date) => {
    setSelectedDate(date);

    // Обновляем расписание всех мастеров для планировщика
    fetchAllMastersSchedule(allMasters, date);

    // Если выбран конкретный мастер, обновляем его записи
    if (selectedMasterId) {
      // Сбрасываем форму при смене даты
      if (showBookingForm) {
        setFormData({
          ...formData,
          appointment_datetime: "",
        });
        setSelectedTimeSlot(null);
        setTimeout(fetchAvailableSlots, 0);
      }
    }
  };

  // Форматирование времени для отображения
  const formatTime = (dateStr) => {
    if (!dateStr) return "—";
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Функция форматирования времени для формы редактирования
  const formatInputDateTime = (dateStr) => {
    const date = new Date(dateStr);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(date.getDate()).padStart(2, "0")}T${String(
      date.getHours()
    ).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
  };

  // Переход к предыдущему дню
  const prevDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    handleDateChange(newDate);
  };

  // Переход к следующему дню
  const nextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    handleDateChange(newDate);
  };

  // Переход к текущему дню
  const goToToday = () => {
    handleDateChange(new Date());
  };

  // Генерация временных слотов для планировщика (с 8:00 до 20:00 с шагом 60 минут)
  const generateHourLabels = () => {
    const hours = [];
    for (let hour = 7; hour <= 20; hour++) {
      hours.push(`${String(hour).padStart(2, "0")}:00`);
    }
    return hours;
  };

  // Проверка, свободен ли мастер в указанное время
  const isMasterAvailable = (masterId, time) => {
    const masterData = mastersSchedule[masterId];
    if (
      !masterData ||
      masterData.isDayOff ||
      !masterData.slots ||
      masterData.slots.length === 0
    ) {
      return false;
    }

    const [hour, minute] = time.split(":").map(Number);
    const timeInMinutes = hour * 60 + minute;

    // Проверяем, есть ли слоты, включающие нужное время
    return masterData.slots.some((slot) => {
      const [startHour, startMinute] = slot.start_time.split(":").map(Number);
      const [endHour, endMinute] = slot.end_time.split(":").map(Number);

      const startInMinutes = startHour * 60 + startMinute;
      const endInMinutes = endHour * 60 + endMinute;

      return timeInMinutes >= startInMinutes && timeInMinutes < endInMinutes;
    });
  };

  // Получение всех записей мастера в указанный часовой интервал
  const getAppointmentsInHourRange = (masterId, hour) => {
    const nextHour = hour + 1;

    // Фильтруем записи мастера, которые попадают в указанный часовой интервал
    return allAppointments.filter((appointment) => {
      if (appointment.master_id !== masterId) return false;

      const appointmentTime = new Date(appointment.appointment_datetime);
      const appointmentHour = appointmentTime.getHours();

      return appointmentHour >= hour && appointmentHour < nextHour;
    });
  };

  // Обработчик клика по ячейке в планировщике для создания записи
  const handleSchedulerCellClick = (masterId, hour, minute = 0) => {
    // Проверяем, свободен ли мастер в это время
    const time = `${String(hour).padStart(2, "0")}:${String(minute).padStart(
      2,
      "0"
    )}`;
    if (isMasterAvailable(masterId, time)) {
      setSelectedSchedulerMaster(masterId);
      setSelectedSchedulerTime(time);

      // Инициируем форму бронирования
      setSelectedMasterId(masterId);
      setViewMode("detailed");
      setShowBookingForm(true);
    }
  };

  // Позиционирование записи в ячейке планировщика
  const calculateAppointmentPosition = (appointmentTime) => {
    const date = new Date(appointmentTime);
    const hour = date.getHours();
    const minute = date.getMinutes();

    // Рассчитываем позицию в процентах внутри часового блока
    const topPercentage = (minute / 60) * 100;

    return topPercentage;
  };

  // Обработчик клика на запись для её редактирования
  const handleAppointmentClick = (appointment) => {
    setEditingAppointment(appointment);
    setShowEditForm(true);
    
    // Вызываем загрузку доступных слотов сразу при открытии формы редактирования
    // Передаем данные записи напрямую, не полагаясь на состояние editingAppointment
    if (appointment.service_id && appointment.master_id) {
      fetchEditingAvailableSlotsWithData(appointment);
    }
    
    // Сбрасываем все остальные формы
    setShowBookingForm(false);
  };

  // Обработчик изменения формы редактирования
  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditingAppointment((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "service_id") {
      // При смене услуги сбрасываем выбранный слот и перезагружаем доступные слоты
      setEditingSelectedTimeSlot(null);
      setTimeout(fetchEditingAvailableSlots, 0);
    }
  };

  // Обработчик выбора временного слота при редактировании
  const handleEditingTimeSlotSelect = (slot) => {
    setEditingSelectedTimeSlot(slot);
    
    // Получаем текущую дату из формы редактирования
    const appointmentDateStr = editingAppointment.appointment_datetime
      ? formatInputDateTime(editingAppointment.appointment_datetime).split("T")[0]
      : formatDateForApi(new Date());
    
    // Используем простое строковое форматирование для создания даты и времени
    // Без создания объекта Date, чтобы избежать автоматического преобразования в UTC
    const appointmentDateTime = `${appointmentDateStr} ${slot.start_time}:00`;
    
    setEditingAppointment((prev) => ({
      ...prev,
      appointment_datetime: appointmentDateTime,
    }));
    
    console.log(`Выбрано время: ${slot.start_time}`);
    console.log(`Новая дата: ${appointmentDateTime}`);
  };

  // Обработчик отправки формы редактирования
  const handleEditSubmit = async (e) => {
    e.preventDefault();

    if (!editingAppointment) return;

    setIsLoading(true);
    try {
      // Создаем строку с датой и временем в локальном формате
      // Используем исходную строку без преобразования в объект Date
      const appointment_datetime = editingAppointment.appointment_datetime;
      
      console.log('Отправляемая дата на сервер:', appointment_datetime);

      const response = await fetch(
        `https://api.kuchizu.online/appointments/${editingAppointment.id}`,
        {
          method: "PATCH", 
          headers: {
            "Content-Type": "application/json",
            accept: "application/json",
          },
          body: JSON.stringify({
            master_id: editingAppointment.master_id,
            client_name: editingAppointment.client_name || "Без имени",
            service_id: editingAppointment.service_id,
            appointment_datetime: appointment_datetime,
            status: editingAppointment.status || "booked",
            comment: editingAppointment.comment || "",
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Ошибка при обновлении записи");
      }

      // Успешно обновили запись
      showSuccess("Запись успешно обновлена");
      // Закрываем форму редактирования
      setShowEditForm(false);
      setEditingAppointment(null);

      // Обновляем список бронирований
      const bookingsResponse = await fetch(
        "https://api.kuchizu.online/appointments"
      );
      if (bookingsResponse.ok) {
        const data = await bookingsResponse.json();

        // Обновляем все записи на текущий день
        const todayAppointments = data.filter(
          (appointment) =>
            new Date(appointment.appointment_datetime).toDateString() ===
            selectedDate.toDateString()
        );
        setAllAppointments(todayAppointments);

        // Обновляем расписание всех мастеров
        fetchAllMastersSchedule(allMasters, selectedDate);

        // Если активен детальный режим и выбран мастер, обновляем его записи
        if (viewMode === "detailed" && selectedMasterId) {
          const filteredData = data.filter(
            (item) =>
              item.master_id === selectedMasterId &&
              new Date(item.appointment_datetime).toDateString() ===
                selectedDate.toDateString()
          );
          setBookings(filteredData);
        }
      }
    } catch (err) {
      console.error("Ошибка при обновлении записи:", err);
      setError(err.message);
      showError("Не удалось обновить запись");
    } finally {
      setIsLoading(false);
    }
  };

  // Обработчик удаления записи
  const handleDeleteAppointment = async () => {
    if (
      !editingAppointment ||
      !window.confirm("Вы уверены, что хотите удалить эту запись?")
    )
      return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://api.kuchizu.online/appointments/${editingAppointment.id}`,
        {
          method: "DELETE",
          headers: {
            accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Ошибка при удалении записи");
      }

      // Успешно удалили запись
      alert("Запись успешно удалена");
      // Закрываем форму редактирования
      setShowEditForm(false);
      setEditingAppointment(null);

      // Обновляем список бронирований
      const bookingsResponse = await fetch(
        "https://api.kuchizu.online/appointments"
      );
      if (bookingsResponse.ok) {
        const data = await bookingsResponse.json();

        // Обновляем все записи на текущий день
        const todayAppointments = data.filter(
          (appointment) =>
            new Date(appointment.appointment_datetime).toDateString() ===
            selectedDate.toDateString()
        );
        setAllAppointments(todayAppointments);

        // Обновляем расписание всех мастеров
        fetchAllMastersSchedule(allMasters, selectedDate);

        // Если активен детальный режим и выбран мастер, обновляем его записи
        if (viewMode === "detailed" && selectedMasterId) {
          const filteredData = data.filter(
            (item) =>
              item.master_id === selectedMasterId &&
              new Date(item.appointment_datetime).toDateString() ===
                selectedDate.toDateString()
          );
          setBookings(filteredData);
        }
      }
    } catch (err) {
      console.error("Ошибка при удалении записи:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="master-booking-manager">
      <h2 className="manager-title">Управление записями к мастерам</h2>

      {isLoading && <div className="loading-indicator">Загрузка...</div>}
      {error && <div className="error-message">{error}</div>}

      <div className="view-mode-switch">
        {selectedMasterId && (
          <button
            className="view-mode-btn"
            onClick={() => handleViewModeToggle("scheduler")}
          >
            ← Вернуться к планировщику
          </button>
        )}
      </div>

      <div className="date-selector">
        <button onClick={prevDay} className="nav-button">
          ←
        </button>
        <div className="selected-date">
          {selectedDate.toLocaleDateString("ru-RU", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </div>
        <button onClick={nextDay} className="nav-button">
          →
        </button>
        <button onClick={goToToday} className="today-button">
          Сегодня
        </button>
      </div>

      {viewMode === "scheduler" ? (
        <div className="day-scheduler">
          <div className="scheduler-container">
            <div className="scheduler-header">
              <div className="time-column-header">Время</div>
              {allMasters.map((master) => {
                const displayName =
                  master.name ||
                  `${master.first_name || ""} ${
                    master.last_name || ""
                  }`.trim() ||
                  "Мастер";
                return (
                  <div key={master.id} className="master-column-header">
                    {displayName}
                  </div>
                );
              })}
            </div>

            <div className="scheduler-body">
              {generateHourLabels().map((timeLabel, index) => {
                const hour = parseInt(timeLabel.split(":")[0], 10);

                return (
                  <div key={timeLabel} className="scheduler-hour-row">
                    <div className="time-cell">{timeLabel}</div>
                    {allMasters.map((master) => {
                      const hourAppointments = getAppointmentsInHourRange(
                        master.id,
                        hour
                      );
                      const isHourAvailable = isMasterAvailable(
                        master.id,
                        timeLabel
                      );

                      return (
                        <div
                          key={`${master.id}-${timeLabel}`}
                          className={`master-hour-cell ${
                            isHourAvailable
                              ? "has-available-time"
                              : "no-available-time"
                          }`}
                          onClick={() =>
                            isHourAvailable &&
                            handleSchedulerCellClick(master.id, hour)
                          }
                        >
                          {hourAppointments.map(
                            (appointment, appointmentIndex) => {
                              const appointmentTime = new Date(
                                appointment.appointment_datetime
                              );
                              const topPosition = calculateAppointmentPosition(
                                appointment.appointment_datetime
                              );
                              
                              // Расчет высоты на основе продолжительности услуги
                              let heightPercentage = 20; // Значение по умолчанию - 20% часа (12 минут)
                              
                              // Если у нас есть информация о продолжительности услуги в allServices
                              if (allServices[appointment.service_id]) {
                                const service = allServices[appointment.service_id];
                                // Если есть сведения о продолжительности услуги
                                if (service.duration) {
                                  // Рассчитываем высоту как процент от часа в зависимости от продолжительности услуги
                                  const durationInMinutes = parseInt(service.duration, 10);
                                  heightPercentage = (durationInMinutes / 60) * 100;
                                }
                              }

                              return (
                                <div
                                  key={`appointment-${
                                    appointment.id || appointmentIndex
                                  }`}
                                  className={`appointment-item status-${appointment.status || 'booked'}`}
                                  style={{ 
                                    top: `${topPosition}%`,
                                    height: `${heightPercentage}%`
                                  }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAppointmentClick(appointment);
                                  }}
                                >
                                  <div className="appointment-time">
                                    {appointmentTime.toLocaleTimeString([], {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </div>
                                  <div className="appointment-client">
                                    {appointment.client_name || "Без имени"}
                                  </div>
                                  {allServices[appointment.service_id] && (
                                    <div className="appointment-service">
                                      {allServices[appointment.service_id].service_name}
                                    </div>
                                  )}
                                </div>
                              );
                            }
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* <MasterSelector
            masters={allMasters}
            selectedMasterId={selectedMasterId}
            onMasterSelect={handleMasterChange}
          /> */}

          {selectedMasterId && (
            <>

              {showBookingForm && (
                <div className="booking-form-container">
                  <div className="form-header">
                    <h3>Новая запись</h3>

                  </div>

                  <form onSubmit={handleBookingSubmit} className="booking-form">
                    <div className="form-group">
                      <label htmlFor="service">Услуга</label>
                      <select
                        id="service"
                        name="service_id"
                        value={formData.service_id}
                        onChange={handleFormChange}
                        required
                      >
                        <option value="">Выберите услугу</option>
                        {services.map((service) => (
                          <option key={service.id} value={service.id}>
                            {service.service_name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label htmlFor="client_name">Имя клиента</label>
                      <input
                        id="client_name"
                        name="client_name"
                        type="text"
                        value={formData.client_name}
                        onChange={handleFormChange}
                        placeholder="Имя клиента (необязательно)"
                      />
                    </div>

                    {formData.service_id && (
                      <div className="form-group">
                        <label>Доступное время</label>
                        <div className="time-slots-container">
                          {availableTimeSlots.length > 0 ? (
                            availableTimeSlots.map((slot, index) => (
                              <div
                                key={index}
                                className={`time-slot ${
                                  selectedTimeSlot === slot ? "selected" : ""
                                }`}
                                onClick={() => handleTimeSlotSelect(slot)}
                              >
                                {slot.start_time} - {slot.end_time}
                              </div>
                            ))
                          ) : (
                            <p>Нет доступных слотов на выбранную дату</p>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="form-group">
                      <label htmlFor="comment">Комментарий</label>
                      <textarea
                        id="comment"
                        name="comment"
                        value={formData.comment}
                        onChange={handleFormChange}
                        placeholder="Дополнительная информация"
                        rows="3"
                      />
                    </div>

                    <div className="form-actions">
                      <button
                        type="button"
                        className="cancel-button"
                        onClick={() => setShowBookingForm(false)}
                      >
                        Отмена
                      </button>
                      <button
                        type="submit"
                        className="submit-button"
                        disabled={
                          !formData.service_id || !formData.appointment_datetime
                        }
                      >
                        Забронировать
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* Форма редактирования записи */}
      {showEditForm && editingAppointment && (
        <div className="edit-form-overlay">
          <div className="edit-form-container">
            <div className="form-header">
              <h3>Редактирование записи</h3>
              
            </div>

            <form onSubmit={handleEditSubmit} className="edit-form">
              <div className="form-group">
                <label htmlFor="client_name">Имя клиента</label>
                <input
                  id="client_name"
                  name="client_name"
                  type="text"
                  value={editingAppointment.client_name || ""}
                  onChange={handleEditFormChange}
                  placeholder="Имя клиента"
                />
              </div>

              <div className="form-group">
                <label htmlFor="service_id">Услуга</label>
                <select
                  id="service_id"
                  name="service_id"
                  value={editingAppointment.service_id || ""}
                  onChange={handleEditFormChange}
                  required
                >
                  <option value="">Выберите услугу</option>
                  {Object.values(allServices)
                    .filter(
                      (service) =>
                        service.master_id === editingAppointment.master_id
                    )
                    .map((service) => (
                      <option key={service.id} value={service.id}>
                        {service.service_name}
                      </option>
                    ))}
                </select>
              </div>

              <div className="form-group">
                <label>Дата</label>
                <input
                  id="appointment_date"
                  name="appointment_date"
                  type="date"
                  value={
                    editingAppointment.appointment_datetime
                      ? formatInputDateTime(
                          editingAppointment.appointment_datetime
                        ).split("T")[0]
                      : ""
                  }
                  onChange={(e) => {
                    const [currentDateStr, timeStr] = formatInputDateTime(
                      editingAppointment.appointment_datetime
                    ).split("T");
                    const newDateTime = `${e.target.value}T${timeStr}`;
                    setEditingAppointment((prev) => ({
                      ...prev,
                      appointment_datetime: newDateTime,
                    }));
                    // Сбрасываем выбранный слот и загружаем новые доступные слоты
                    setEditingSelectedTimeSlot(null);
                    setTimeout(fetchEditingAvailableSlots, 0);
                  }}
                  required
                />
              </div>

              {editingAppointment.service_id && (
                <div className="form-group">
                  <label>Доступное время</label>
                  <div className="time-slots-container">
                    {editingAvailableTimeSlots.length > 0 ? (
                      editingAvailableTimeSlots.map((slot, index) => (
                        <div
                          key={index}
                          className={`time-slot ${
                            editingSelectedTimeSlot === slot ? "selected" : ""
                          }`}
                          onClick={() => handleEditingTimeSlotSelect(slot)}
                        >
                          {slot.start_time} - {slot.end_time}
                        </div>
                      ))
                    ) : (
                      <p>Нет доступных слотов на выбранную дату</p>
                    )}
                  </div>
                </div>
              )}

              <div className="form-group">
                <label htmlFor="comment">Комментарий</label>
                <textarea
                  id="comment"
                  name="comment"
                  value={editingAppointment.comment || ""}
                  onChange={handleEditFormChange}
                  placeholder="Дополнительная информация"
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label htmlFor="status">Статус</label>
                <select
                  id="status"
                  name="status"
                  value={editingAppointment.status || "booked"}
                  onChange={handleEditFormChange}
                >
                  <option value="booked">Забронировано</option>
                  <option value="completed">Выполнено</option>
                  <option value="cancelled">Отменено</option>
                </select>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="delete-button"
                  onClick={handleDeleteAppointment}
                >
                  Удалить запись
                </button>
                <div className="right-actions">
                  <button
                    type="button"
                    className="cancel-button"
                    onClick={() => {
                      setShowEditForm(false);
                      setEditingAppointment(null);
                    }}
                  >
                    Отмена
                  </button>
                  <button type="submit" className="submit-button">
                    Сохранить
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default MasterBookingManager;
