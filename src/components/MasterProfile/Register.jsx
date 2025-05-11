import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaExclamationCircle, FaCamera, FaInfoCircle, FaUserCircle, FaTrash } from 'react-icons/fa';
import '../../styles/Register.css';

const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  // Получаем данные из URL с проверкой на null и строку "null"
  const firstNameParam = searchParams.get('first_name');
  const lastNameParam = searchParams.get('last_name');
  const telegramUsernameParam = searchParams.get('telegram_username');
  const telegramIdParam = searchParams.get('telegram_id');
  
  // Проверяем, не является ли значение строкой "null"
  const validFirstName = firstNameParam && firstNameParam !== "null" ? firstNameParam : '';
  const validLastName = lastNameParam && lastNameParam !== "null" ? lastNameParam : '';
  const validTelegramUsername = telegramUsernameParam && telegramUsernameParam !== "null" ? telegramUsernameParam : '';
  const validTelegramId = telegramIdParam && telegramIdParam !== "null" ? telegramIdParam : null;
  
  // Состояния для Step 1
  const [step, setStep] = useState(1);
  const [firstName, setFirstName] = useState(validFirstName);
  const [lastName, setLastName] = useState(validLastName);
  const [telegramHandle, setTelegramHandle] = useState(validTelegramUsername);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Состояния для Step 2
  const [serviceCategories, setServiceCategories] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [serviceCategory, setServiceCategory] = useState('');
  const [companyId, setCompanyId] = useState('');
  const [address, setAddress] = useState('');
  const [photoBase64, setPhotoBase64] = useState('');
  const [services, setServices] = useState([{ serviceName: '', duration: 30 }]);
  const [noCompany, setNoCompany] = useState(false);
  
  // Состояния ошибок
  const [errors, setErrors] = useState({
    firstName: '',
    lastName: '',
    telegramHandle: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    serviceCategory: '',
    companyId: '',
    services: [''],
    general: ''
  });

  // Состояния валидации полей
  const [validFields, setValidFields] = useState({
    firstName: false,
    lastName: false,
    telegramHandle: true, // Телеграм-юзернейм необязательный, поэтому изначально valid
    phoneNumber: false,
    password: false,
    confirmPassword: false,
    serviceCategory: false,
    companyId: false,
    services: [false]
  });

  // Refs для полей ввода
  const fileInputRef = useRef(null);

  // Состояния для отслеживания, было ли поле в фокусе
  const [touchedFields, setTouchedFields] = useState({
    firstName: false,
    lastName: false,
    telegramHandle: false,
    phoneNumber: false,
    password: false,
    confirmPassword: false,
    serviceCategory: false,
    companyId: false,
    services: [false]
  });

  // Проверяем наличие данных в URL
  const hasTelegramId = searchParams.get('telegram_id') !== null && searchParams.get('telegram_id') !== "null";
  const hasTelegramUsername = telegramUsernameParam !== null && telegramUsernameParam !== "" && telegramUsernameParam !== "null";
  const hasFirstName = firstNameParam !== null && firstNameParam !== "" && firstNameParam !== "null";
  const hasLastName = lastNameParam !== null && lastNameParam !== "" && lastNameParam !== "null";

  // Эффект для загрузки категорий услуг
  useEffect(() => {
    const fetchServiceCategories = async () => {
      try {
        const response = await fetch('https://api.kuchizu.online/service-areas/');
        if (!response.ok) throw new Error('Failed to fetch service categories');
        const data = await response.json();
        setServiceCategories(data);
      } catch (error) {
        setErrors(prev => ({ ...prev, general: 'Failed to load service categories' }));
      }
    };

    const fetchCompanies = async () => {
      try {
        const response = await fetch('https://api.kuchizu.online/companies');
        if (!response.ok) throw new Error('Failed to fetch companies');
        const data = await response.json();
        setCompanies(data);
      } catch (error) {
        setErrors(prev => ({ ...prev, general: 'Failed to load companies' }));
      }
    };

    fetchServiceCategories();
    fetchCompanies();
  }, []);

  // Эффект для фильтрации компаний при изменении категории услуг
  useEffect(() => {
    if (serviceCategory) {
      const filtered = companies.filter(company => company.service_area_id === serviceCategory);
      setFilteredCompanies(filtered);
    } else {
      setFilteredCompanies([]);
    }
  }, [serviceCategory, companies]);

  // Эффект для установки адреса при выборе компании
  useEffect(() => {
    if (companyId) {
      const selectedCompany = companies.find(company => company.id === companyId);
      if (selectedCompany) {
        setAddress(selectedCompany.address);
        setNoCompany(false);
      }
    } else if (noCompany) {
      // Если выбрано "Нет компании", оставляем редактируемое поле адреса
      setAddress('');
    } else {
      setAddress('');
    }
  }, [companyId, companies, noCompany]);

  // Проверка валидности полей Step 1
  useEffect(() => {
    const isStep1Valid = 
      validFields.firstName && 
      validFields.lastName && 
      validFields.telegramHandle && 
      validFields.phoneNumber && 
      validFields.password && 
      validFields.confirmPassword;
    
    if (isStep1Valid) {
      document.getElementById('nextBtn')?.removeAttribute('disabled');
    } else {
      document.getElementById('nextBtn')?.setAttribute('disabled', 'true');
    }
  }, [validFields]);

  // Инициализация начальных значений валидности полей
  useEffect(() => {
    // Проверяем начальные значения полей, полученные из URL
    if (firstName) {
      const { isValid } = validateField('firstName', firstName);
      setValidFields(prev => ({ ...prev, firstName: isValid }));
    }
    
    if (lastName) {
      const { isValid } = validateField('lastName', lastName);
      setValidFields(prev => ({ ...prev, lastName: isValid }));
    }
    
    if (telegramHandle) {
      const { isValid } = validateField('telegramHandle', telegramHandle);
      setValidFields(prev => ({ ...prev, telegramHandle: isValid }));
    }
  }, []);

  // Валидация полей
  const validateField = (field, value) => {
    let errorMessage = '';
    let isValid = false;

    switch (field) {
      case 'firstName':
        isValid = value.length >= 5 && value.length <= 50;
        errorMessage = isValid ? '' : 'ФИО должно содержать от 5 до 50 символов';
        break;
      case 'lastName':
        isValid = value.length >= 2 && value.length <= 50;
        errorMessage = isValid ? '' : 'Профессия должна содержать от 2 до 50 символов';
        break;
      case 'telegramHandle':
        // Если поле пустое, считаем его валидным
        if (!value) {
          isValid = true;
          errorMessage = '';
        } else {
          const telegramRegex = /^[A-Za-z0-9_]{5,32}$/;
          isValid = telegramRegex.test(value);
          errorMessage = isValid ? '' : 'Неверный формат имени пользователя Telegram (5-32 символа, буквы, цифры, подчеркивания)';
        }
        break;
      case 'phoneNumber':
        const phoneRegex = /^\d{9}$/;
        isValid = phoneRegex.test(value);
        errorMessage = isValid ? '' : 'Номер телефона должен содержать 9 цифр';
        break;
      case 'password':
        isValid = value.length >= 6;
        errorMessage = isValid ? '' : 'Пароль должен содержать минимум 6 символов';
        break;
      case 'confirmPassword':
        isValid = value === password;
        errorMessage = isValid ? '' : 'Пароли не совпадают';
        break;
      case 'serviceCategory':
        isValid = !!value;
        errorMessage = isValid ? '' : 'Выберите категорию услуг';
        break;
      case 'companyId':
        // Компания не обязательна для выбора
        isValid = true;
        errorMessage = '';
        break;
      case 'serviceName':
        isValid = value.length > 0;
        errorMessage = isValid ? '' : 'Введите название услуги';
        break;
      case 'duration':
        isValid = parseInt(value) >= 1;
        errorMessage = isValid ? '' : 'Длительность должна быть не менее 1 минуты';
        break;
      default:
        return { isValid: true, errorMessage: '' };
    }

    return { isValid, errorMessage };
  };

  // Обработчики изменения полей Step 1
  const handleFirstNameChange = (e) => {
    const value = e.target.value;
    setFirstName(value);
    const { isValid, errorMessage } = validateField('firstName', value);
    setErrors(prev => ({ ...prev, firstName: errorMessage }));
    setValidFields(prev => ({ ...prev, firstName: isValid }));
  };

  const handleFieldBlur = (field, value) => {
    setTouchedFields(prev => ({ ...prev, [field]: true }));
    const { isValid, errorMessage } = validateField(field, value);
    setErrors(prev => ({ ...prev, [field]: errorMessage }));
    setValidFields(prev => ({ ...prev, [field]: isValid }));
  };

  const handleLastNameChange = (e) => {
    const value = e.target.value;
    setLastName(value);
    const { isValid, errorMessage } = validateField('lastName', value);
    setErrors(prev => ({ ...prev, lastName: errorMessage }));
    setValidFields(prev => ({ ...prev, lastName: isValid }));
  };

  const handleTelegramHandleChange = (e) => {
    const value = e.target.value.replace(/^@/, ''); // Удаляем @ в начале, если пользователь его ввел
    setTelegramHandle(value);
    const { isValid, errorMessage } = validateField('telegramHandle', value);
    setErrors(prev => ({ ...prev, telegramHandle: errorMessage }));
    setValidFields(prev => ({ ...prev, telegramHandle: isValid }));
  };

  const handlePhoneNumberChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 9) {
      setPhoneNumber(value);
      const { isValid, errorMessage } = validateField('phoneNumber', value);
      setErrors(prev => ({ ...prev, phoneNumber: errorMessage }));
      setValidFields(prev => ({ ...prev, phoneNumber: isValid }));
    }
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    const { isValid, errorMessage } = validateField('password', value);
    setErrors(prev => ({ ...prev, password: errorMessage }));
    setValidFields(prev => ({ ...prev, password: isValid }));
    
    // Также проверяем, совпадает ли confirmPassword с новым значением password
    if (confirmPassword) {
      const confirmValidation = validateField('confirmPassword', confirmPassword);
      setErrors(prev => ({ ...prev, confirmPassword: confirmValidation.errorMessage }));
      setValidFields(prev => ({ ...prev, confirmPassword: confirmValidation.isValid }));
    }
  };

  const handleConfirmPasswordChange = (e) => {
    const value = e.target.value;
    setConfirmPassword(value);
    const { isValid, errorMessage } = validateField('confirmPassword', value);
    setErrors(prev => ({ ...prev, confirmPassword: errorMessage }));
    setValidFields(prev => ({ ...prev, confirmPassword: isValid }));
  };

  // Обработчики изменения полей Step 2
  const handleServiceCategoryChange = (e) => {
    const value = e.target.value;
    setServiceCategory(value);
    setCompanyId('');
    setAddress('');
    const { isValid, errorMessage } = validateField('serviceCategory', value);
    setErrors(prev => ({ ...prev, serviceCategory: errorMessage }));
    setValidFields(prev => ({ ...prev, serviceCategory: isValid }));
  };

  const handleCompanyIdChange = (e) => {
    const value = e.target.value;
    
    if (value === 'no-company') {
      setCompanyId('');
      setNoCompany(true);
    } else {
      setCompanyId(value);
      setNoCompany(false);
    }
    
    const { isValid, errorMessage } = validateField('companyId', value);
    setErrors(prev => ({ ...prev, companyId: errorMessage }));
    setValidFields(prev => ({ ...prev, companyId: isValid }));
  };

  const handleAddressChange = (e) => {
    const value = e.target.value;
    setAddress(value);
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        // Результат содержит "data:image/jpeg;base64,ДАННЫЕ"
        // Нам нужно удалить начальный префикс и оставить только данные в base64
        const base64String = reader.result;
        const base64Data = base64String.split(',')[1]; // Получаем только данные после запятой
        setPhotoBase64(base64Data);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerPhotoUpload = () => {
    fileInputRef.current.click();
  };

  const handleServiceNameChange = (index, value) => {
    const newServices = [...services];
    newServices[index].serviceName = value;
    setServices(newServices);

    const { isValid, errorMessage } = validateField('serviceName', value);
    const newErrors = [...errors.services];
    newErrors[index] = errorMessage;
    setErrors(prev => ({ ...prev, services: newErrors }));

    const newValidFields = [...validFields.services];
    newValidFields[index] = isValid;
    setValidFields(prev => ({ ...prev, services: newValidFields }));
  };

  const handleServiceDurationChange = (index, value) => {
    const newServices = [...services];
    newServices[index].duration = value === '' ? '' : parseInt(value) || 0;
    setServices(newServices);

    const { isValid, errorMessage } = validateField('duration', value);
    const newErrors = [...errors.services];
    newErrors[index] = errorMessage;
    setErrors(prev => ({ ...prev, services: newErrors }));

    const newValidFields = [...validFields.services];
    newValidFields[index] = isValid;
    setValidFields(prev => ({ ...prev, services: newValidFields }));
  };

  // Обработчик потери фокуса для полей услуг
  const handleServiceFieldBlur = (field, index, value) => {
    const newTouchedServices = [...touchedFields.services];
    newTouchedServices[index] = true;
    setTouchedFields(prev => ({ ...prev, services: newTouchedServices }));
    
    const { isValid, errorMessage } = validateField(field, value);
    const newErrors = [...errors.services];
    newErrors[index] = errorMessage;
    setErrors(prev => ({ ...prev, services: newErrors }));

    const newValidFields = [...validFields.services];
    newValidFields[index] = isValid;
    setValidFields(prev => ({ ...prev, services: newValidFields }));
  };

  const addService = () => {
    setServices([...services, { serviceName: '', duration: 30 }]);
    setErrors(prev => ({ ...prev, services: [...prev.services, ''] }));
    setValidFields(prev => ({ ...prev, services: [...prev.services, false] }));
    setTouchedFields(prev => ({ ...prev, services: [...prev.services, false] }));
  };

  const removeService = (index) => {
    if (services.length > 1) {
      const newServices = services.filter((_, i) => i !== index);
      setServices(newServices);

      const newErrors = errors.services.filter((_, i) => i !== index);
      setErrors(prev => ({ ...prev, services: newErrors }));

      const newValidFields = validFields.services.filter((_, i) => i !== index);
      setValidFields(prev => ({ ...prev, services: newValidFields }));
      
      const newTouchedServices = touchedFields.services.filter((_, i) => i !== index);
      setTouchedFields(prev => ({ ...prev, services: newTouchedServices }));
    }
  };

  // Навигация между шагами
  const goToNextStep = () => {
    if (isStep1Valid()) {
      setStep(2);
    }
  };

  const goToPreviousStep = () => {
    setStep(1);
  };

  // Проверка возможности продолжения (для Step 2)
  const canContinue = () => {
    const isServiceCategoryValid = !!serviceCategory;
    // Убираем проверку companyId, т.к. она необязательна
    const areServicesValid = services.every(service => 
      service.serviceName.length > 0 && service.duration >= 1
    );

    return isServiceCategoryValid && areServicesValid;
  };

  // Проверка валидности полей Step 1
  const isStep1Valid = () => {
    return (
      validFields.firstName && 
      validFields.lastName && 
      // Telegram handle теперь необязательное поле, поэтому проверяем или на валидность, или на пустоту
      validFields.telegramHandle && 
      validFields.phoneNumber && 
      validFields.password && 
      validFields.confirmPassword
    );
  };

  // Отправка формы
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!canContinue()) {
      setErrors(prev => ({ ...prev, general: 'Пожалуйста, заполните все обязательные поля' }));
      return;
    }

    const payload = {
      first_name: firstName,
      last_name: lastName,
      // Если telegramHandle пустой, отправляем null
      telegram_username: telegramHandle ? '@' + telegramHandle : null,
      phone_number: '+992' + phoneNumber,
      password: password,
      service_category: serviceCategory,
      // Если companyId не выбран, отправляем null
      company_id: companyId || null,
      address: address || null,
      photo_base64: photoBase64,
      services: services.map(service => ({
        service_name: service.serviceName,
        duration: service.duration
      })),
      telegram_id: validTelegramId // Добавляем telegram_id в payload
    };

    try {
      const response = await fetch('https://api.kuchizu.online/masters/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Ошибка при регистрации');
      }

      const data = await response.json();
      navigate(`/master/${data.id}`);
    } catch (error) {
      setErrors(prev => ({ ...prev, general: error.message || 'Произошла ошибка при регистрации' }));
    }
  };

  // Функция для удаления загруженной фотографии
  const handleRemovePhoto = () => {
    setPhotoBase64('');
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h2>Регистрация мастера</h2>
        
        {errors.general && <div className="error-message general-error">{errors.general}</div>}
        
        {step === 1 && (
          <form className="register-form step1">
            <h3>Шаг 1: Личная информация</h3>
            
            <div className="form-group">
              <label htmlFor="firstName">ФИО</label>
              <input 
                type="text" 
                id="firstName" 
                value={firstName} 
                onChange={handleFirstNameChange}
                onBlur={() => handleFieldBlur('firstName', firstName)}
                // Имя всегда редактируемое
                className={touchedFields.firstName && errors.firstName ? 'error' : validFields.firstName ? 'valid' : ''}
              />
              {touchedFields.firstName && errors.firstName && (
                <div className="error-message">
                  <FaExclamationCircle /> {errors.firstName}
                </div>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="lastName">Профессия</label>
              <input 
                type="text" 
                id="lastName" 
                value={lastName} 
                onChange={handleLastNameChange}
                onBlur={() => handleFieldBlur('lastName', lastName)}
                // Фамилия всегда редактируемая
                className={touchedFields.lastName && errors.lastName ? 'error' : validFields.lastName ? 'valid' : ''}
              />
              {touchedFields.lastName && errors.lastName && (
                <div className="error-message">
                  <FaExclamationCircle /> {errors.lastName}
                </div>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="telegramHandle">Имя пользователя Telegram (необязательно)</label>
              <div className="phone-input-container">
                <span className="phone-prefix">@</span>
                <input 
                  type="text" 
                  id="telegramHandle" 
                  value={telegramHandle} 
                  onChange={handleTelegramHandleChange}
                  onBlur={() => handleFieldBlur('telegramHandle', telegramHandle)}
                  readOnly={hasTelegramUsername}
                  className={touchedFields.telegramHandle && errors.telegramHandle ? 'error' : validFields.telegramHandle ? 'valid' : ''}
                />
              </div>
              {touchedFields.telegramHandle && errors.telegramHandle && (
                <div className="error-message">
                  <FaExclamationCircle /> {errors.telegramHandle}
                </div>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="phoneNumber">Номер телефона (+992)</label>
              <div className="phone-input-container">
                <span className="phone-prefix">+992</span>
                <input 
                  type="text" 
                  id="phoneNumber" 
                  value={phoneNumber} 
                  onChange={handlePhoneNumberChange}
                  onBlur={() => handleFieldBlur('phoneNumber', phoneNumber)}
                  className={touchedFields.phoneNumber && errors.phoneNumber ? 'error' : validFields.phoneNumber ? 'valid' : ''}
                />
              </div>
              {touchedFields.phoneNumber && errors.phoneNumber && (
                <div className="error-message">
                  <FaExclamationCircle /> {errors.phoneNumber}
                </div>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Пароль</label>
              <input 
                type="password" 
                id="password" 
                value={password} 
                onChange={handlePasswordChange}
                onBlur={() => handleFieldBlur('password', password)}
                className={touchedFields.password && errors.password ? 'error' : validFields.password ? 'valid' : ''}
              />
              {touchedFields.password && errors.password && (
                <div className="error-message">
                  <FaExclamationCircle /> {errors.password}
                </div>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="confirmPassword">Подтверждение пароля</label>
              <input 
                type="password" 
                id="confirmPassword" 
                value={confirmPassword} 
                onChange={handleConfirmPasswordChange}
                onBlur={() => handleFieldBlur('confirmPassword', confirmPassword)}
                className={touchedFields.confirmPassword && errors.confirmPassword ? 'error' : validFields.confirmPassword ? 'valid' : ''}
              />
              {touchedFields.confirmPassword && errors.confirmPassword && (
                <div className="error-message">
                  <FaExclamationCircle /> {errors.confirmPassword}
                </div>
              )}
            </div>
            
            <div className="form-buttons">
              <button 
                type="button" 
                id="nextBtn" 
                onClick={goToNextStep} 
                disabled={!isStep1Valid()}
              >
                Далее
              </button>
            </div>
          </form>
        )}
        
        {step === 2 && (
          <form className="register-form step2" onSubmit={handleSubmit}>
            <h3>Шаг 2: Профессиональная информация</h3>
            
            <div className="form-group">
              <label htmlFor="serviceCategory">Категория услуг</label>
              <select 
                id="serviceCategory" 
                value={serviceCategory} 
                onChange={handleServiceCategoryChange}
                onBlur={() => handleFieldBlur('serviceCategory', serviceCategory)}
                className={touchedFields.serviceCategory && errors.serviceCategory ? 'error' : ''}
              >
                <option value="">Выберите категорию</option>
                {serviceCategories.map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
              {touchedFields.serviceCategory && errors.serviceCategory && (
                <div className="error-message">
                  <FaExclamationCircle /> {errors.serviceCategory}
                </div>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="companyId">Компания (необязательно)</label>
              <select 
                id="companyId" 
                value={noCompany ? 'no-company' : companyId} 
                onChange={handleCompanyIdChange}
                onBlur={() => handleFieldBlur('companyId', companyId)}
                disabled={!serviceCategory}
                className={touchedFields.companyId && errors.companyId ? 'error' : ''}
              >
                <option value="">Выберите компанию</option>
                <option value="no-company">Нет компании</option>
                {filteredCompanies.map(company => (
                  <option key={company.id} value={company.id}>{company.name}</option>
                ))}
              </select>
              {touchedFields.companyId && errors.companyId && (
                <div className="error-message">
                  <FaExclamationCircle /> {errors.companyId}
                </div>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="address">Адрес</label>
              <input 
                type="text" 
                id="address" 
                value={address} 
                onChange={handleAddressChange}
                readOnly={!noCompany && companyId} 
                className={(noCompany || !companyId) ? '' : companyId ? 'valid' : ''}
              />
            </div>
            
            <div className="form-group photo-upload">
              <label>Фотография</label>
              <div className="photo-upload-container">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handlePhotoUpload} 
                  accept="image/*" 
                  style={{ display: 'none' }} 
                />
                <div className="photo-preview" onClick={triggerPhotoUpload}>
                  {photoBase64 ? (
                    <img src={`data:image/jpeg;base64,${photoBase64}`} alt="Preview" />
                  ) : (
                    <div className="photo-placeholder">
                      <FaUserCircle />
                      <div>Нажмите для загрузки фото</div>
                    </div>
                  )}
                </div>
                <div className="photo-actions">
                  <button type="button" className="upload-btn" onClick={triggerPhotoUpload}>
                    <FaCamera /> Загрузить фото
                  </button>
                  {photoBase64 && (
                    <button type="button" className="remove-photo-btn" onClick={handleRemovePhoto}>
                      <FaTrash /> Удалить фото
                    </button>
                  )}
                </div>
              </div>
            </div>
            
            <div className="form-group services-section">
              <label>Услуги</label>
              {services.map((service, index) => (
                <div key={index} className="service-item">
                  <div className="service-inputs">
                    <div className="service-name-input">
                      <input 
                        type="text" 
                        placeholder="Название услуги" 
                        value={service.serviceName} 
                        onChange={(e) => handleServiceNameChange(index, e.target.value)}
                        onBlur={() => handleServiceFieldBlur('serviceName', index, service.serviceName)}
                        className={touchedFields.services[index] && errors.services[index] ? 'error' : ''}
                      />
                    </div>
                    <div className="service-duration-input">
                      <input 
                        type="number" 
                        placeholder="Длительность (мин)" 
                        value={service.duration} 
                        onChange={(e) => handleServiceDurationChange(index, e.target.value)}
                        onBlur={() => handleServiceFieldBlur('duration', index, service.duration)}
                        min="1"
                        className={touchedFields.services[index] && errors.services[index] ? 'error' : ''}
                      />
                    </div>
                    <button 
                      type="button" 
                      className="remove-service-btn" 
                      onClick={() => removeService(index)}
                      disabled={services.length === 1}
                    >
                      Удалить
                    </button>
                  </div>
                  {touchedFields.services[index] && errors.services[index] && (
                    <div className="error-message">
                      <FaExclamationCircle /> {errors.services[index]}
                    </div>
                  )}
                </div>
              ))}
              <button type="button" className="add-service-btn" onClick={addService}>
                Добавить услугу
              </button>
            </div>
            
            <div className="form-buttons">
              <button type="button" onClick={goToPreviousStep}>Назад</button>
              <button type="submit" disabled={!canContinue()}>Зарегистрироваться</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Register;