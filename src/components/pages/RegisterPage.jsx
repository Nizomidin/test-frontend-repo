/**
 * Страница регистрации мастера
 */
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaExclamationCircle, FaCamera, FaInfoCircle, FaUserCircle, FaTrash } from 'react-icons/fa';
import './RegisterPage.css';

// API
import masterApi from '../../api/masterApi';

// Contexts
import { useToast } from '../../contexts/ToastContext';

/**
 * Компонент первого шага регистрации
 */
const RegisterStep1 = ({ 
  formData, 
  setFormData, 
  errors, 
  handleInputChange, 
  validateForm, 
  goToNextStep 
}) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      goToNextStep();
    }
  };

  return (
    <div className="register-step">
      <h2>Шаг 1: Основная информация</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="firstName">Имя</label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
            className={errors.firstName ? 'input-error' : ''}
          />
          {errors.firstName && <div className="error-message">{errors.firstName}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="lastName">Фамилия</label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleInputChange}
            className={errors.lastName ? 'input-error' : ''}
          />
          {errors.lastName && <div className="error-message">{errors.lastName}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="telegramHandle">Telegram</label>
          <input
            type="text"
            id="telegramHandle"
            name="telegramHandle"
            value={formData.telegramHandle}
            onChange={handleInputChange}
            className={errors.telegramHandle ? 'input-error' : ''}
            placeholder="@username"
          />
          {errors.telegramHandle && <div className="error-message">{errors.telegramHandle}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="phoneNumber">Телефон</label>
          <input
            type="tel"
            id="phoneNumber"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleInputChange}
            className={errors.phoneNumber ? 'input-error' : ''}
            placeholder="+7 (XXX) XXX-XX-XX"
          />
          {errors.phoneNumber && <div className="error-message">{errors.phoneNumber}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="password">Пароль</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            className={errors.password ? 'input-error' : ''}
          />
          {errors.password && <div className="error-message">{errors.password}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">Подтверждение пароля</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            className={errors.confirmPassword ? 'input-error' : ''}
          />
          {errors.confirmPassword && <div className="error-message">{errors.confirmPassword}</div>}
        </div>

        <button type="submit" className="btn-primary">Далее</button>
      </form>
    </div>
  );
};

/**
 * Компонент второго шага регистрации
 */
const RegisterStep2 = ({ 
  formData, 
  setFormData, 
  errors, 
  handleInputChange, 
  handleSubmit, 
  goToPrevStep,
  serviceCategories,
  companies,
  filteredCompanies,
  services,
  setServices,
  photoBase64,
  setPhotoBase64,
  noCompany,
  setNoCompany
}) => {
  const fileInputRef = useRef(null);

  const handlePhotoSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Файл слишком большой. Максимальный размер 5MB.');
      return;
    }

    // Преобразование фото в base64 для предпросмотра
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoBase64(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setPhotoBase64('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const addService = () => {
    setServices([...services, { serviceName: '', duration: 30 }]);
  };

  const removeService = (index) => {
    const newServices = [...services];
    newServices.splice(index, 1);
    setServices(newServices);
  };

  const handleServiceChange = (index, field, value) => {
    const newServices = [...services];
    newServices[index][field] = value;
    setServices(newServices);
  };

  const toggleNoCompany = () => {
    setNoCompany(!noCompany);
    if (!noCompany) {
      // Если переключаемся на "Работаю самостоятельно", очищаем компанию
      setFormData({
        ...formData,
        companyId: '',
        address: ''
      });
    }
  };

  return (
    <div className="register-step">
      <h2>Шаг 2: Профессиональная информация</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="serviceCategory">Категория услуг</label>
          <select
            id="serviceCategory"
            name="serviceCategory"
            value={formData.serviceCategory}
            onChange={handleInputChange}
            className={errors.serviceCategory ? 'input-error' : ''}
          >
            <option value="">Выберите категорию</option>
            {serviceCategories.map(category => (
              <option key={category._id} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>
          {errors.serviceCategory && <div className="error-message">{errors.serviceCategory}</div>}
        </div>

        <div className="form-group photo-upload-group">
          <label>Фото профиля</label>
          <div className="photo-container">
            {photoBase64 ? (
              <div className="photo-preview">
                <img src={photoBase64} alt="Предпросмотр" />
                <button type="button" onClick={handleRemovePhoto} className="remove-photo">
                  <FaTrash />
                </button>
              </div>
            ) : (
              <div className="photo-placeholder">
                <FaUserCircle />
                <span>Фото не выбрано</span>
              </div>
            )}
            <div className="photo-controls">
              <label className="photo-upload-button">
                <FaCamera />
                <span>Выбрать фото</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoSelect}
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                />
              </label>
            </div>
          </div>
          {errors.photo && <div className="error-message">{errors.photo}</div>}
        </div>

        <div className="form-group">
          <div className="checkbox-group">
            <input
              type="checkbox"
              id="noCompany"
              checked={noCompany}
              onChange={toggleNoCompany}
            />
            <label htmlFor="noCompany">Я работаю самостоятельно (без компании)</label>
          </div>
        </div>

        {!noCompany && (
          <div className="form-group">
            <label htmlFor="companyId">Компания</label>
            <select
              id="companyId"
              name="companyId"
              value={formData.companyId}
              onChange={handleInputChange}
              className={errors.companyId ? 'input-error' : ''}
              disabled={noCompany}
            >
              <option value="">Выберите компанию</option>
              {filteredCompanies.map(company => (
                <option key={company._id} value={company._id}>
                  {company.name}
                </option>
              ))}
            </select>
            {errors.companyId && <div className="error-message">{errors.companyId}</div>}
          </div>
        )}

        <div className="form-group">
          <label htmlFor="address">Адрес</label>
          <input
            type="text"
            id="address"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            className={errors.address ? 'input-error' : ''}
          />
          {errors.address && <div className="error-message">{errors.address}</div>}
        </div>

        <div className="services-section">
          <h3>Услуги</h3>
          {errors.services && <div className="error-message">{errors.services}</div>}
          
          {services.map((service, index) => (
            <div key={index} className="service-item">
              <div className="service-inputs">
                <div className="form-group">
                  <label>Название услуги</label>
                  <input
                    type="text"
                    value={service.serviceName}
                    onChange={(e) => handleServiceChange(index, 'serviceName', e.target.value)}
                    className={errors[`service_${index}_name`] ? 'input-error' : ''}
                  />
                  {errors[`service_${index}_name`] && (
                    <div className="error-message">{errors[`service_${index}_name`]}</div>
                  )}
                </div>
                
                <div className="form-group">
                  <label>Длительность (мин)</label>
                  <input
                    type="number"
                    min="10"
                    max="360"
                    step="5"
                    value={service.duration}
                    onChange={(e) => handleServiceChange(index, 'duration', parseInt(e.target.value, 10) || 30)}
                    className={errors[`service_${index}_duration`] ? 'input-error' : ''}
                  />
                  {errors[`service_${index}_duration`] && (
                    <div className="error-message">{errors[`service_${index}_duration`]}</div>
                  )}
                </div>
              </div>
              
              {services.length > 1 && (
                <button
                  type="button"
                  className="btn-remove-service"
                  onClick={() => removeService(index)}
                >
                  <FaTrash />
                </button>
              )}
            </div>
          ))}
          
          <button type="button" className="btn-add-service" onClick={addService}>
            Добавить услугу
          </button>
        </div>

        <div className="btn-group">
          <button type="button" className="btn-secondary" onClick={goToPrevStep}>
            Назад
          </button>
          <button type="submit" className="btn-primary">
            Зарегистрироваться
          </button>
        </div>
      </form>
    </div>
  );
};

/**
 * Главный компонент страницы регистрации
 */
const RegisterPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showSuccess, showError } = useToast();
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
  
  // Состояния
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: validFirstName,
    lastName: validLastName,
    telegramHandle: validTelegramUsername,
    telegramId: validTelegramId,
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    serviceCategory: '',
    companyId: '',
    address: ''
  });
  
  // Состояния для Step 2
  const [serviceCategories, setServiceCategories] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [services, setServices] = useState([{ serviceName: '', duration: 30 }]);
  const [photoBase64, setPhotoBase64] = useState('');
  const [noCompany, setNoCompany] = useState(false);
  const [registering, setRegistering] = useState(false);
  
  // Состояния ошибок
  const [errors, setErrors] = useState({});
  
  // Загрузка категорий услуг и компаний
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesResponse, companiesResponse] = await Promise.all([
          masterApi.fetchServiceCategories(),
          masterApi.fetchCompanies()
        ]);
        
        setServiceCategories(categoriesResponse);
        setCompanies(companiesResponse);
        setFilteredCompanies(companiesResponse);
      } catch (error) {
        showError('Ошибка при загрузке данных: ' + error.message);
      }
    };
    
    fetchData();
  }, [showError]);
  
  // Фильтрация компаний по категории услуг
  useEffect(() => {
    if (!formData.serviceCategory || !companies.length) {
      setFilteredCompanies(companies);
      return;
    }
    
    const filtered = companies.filter(company => 
      !company.categories || 
      company.categories.includes(formData.serviceCategory)
    );
    
    setFilteredCompanies(filtered);
  }, [formData.serviceCategory, companies]);
  
  const validateStep1 = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Имя обязательно';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Фамилия обязательна';
    }
    
    if (!formData.telegramHandle.trim()) {
      newErrors.telegramHandle = 'Telegram обязателен';
    }
    
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Телефон обязателен';
    } else if (!/^\+?[0-9]{10,15}$/.test(formData.phoneNumber.replace(/\D/g, ''))) {
      newErrors.phoneNumber = 'Неверный формат телефона';
    }
    
    if (!formData.password) {
      newErrors.password = 'Пароль обязателен';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Пароль должен содержать минимум 6 символов';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Пароли не совпадают';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const validateStep2 = () => {
    const newErrors = {};
    
    if (!formData.serviceCategory) {
      newErrors.serviceCategory = 'Выберите категорию услуг';
    }
    
    if (!noCompany && !formData.companyId) {
      newErrors.companyId = 'Выберите компанию';
    }
    
    if (!formData.address) {
      newErrors.address = 'Укажите адрес';
    }
    
    // Валидация услуг
    const validServices = services.filter(s => s.serviceName.trim());
    if (validServices.length === 0) {
      newErrors.services = 'Добавьте хотя бы одну услугу';
    }
    
    services.forEach((service, index) => {
      if (!service.serviceName.trim()) {
        newErrors[`service_${index}_name`] = 'Укажите название услуги';
      }
      
      if (!service.duration || service.duration < 10 || service.duration > 360) {
        newErrors[`service_${index}_duration`] = 'Длительность должна быть от 10 до 360 минут';
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const validateForm = () => {
    return step === 1 ? validateStep1() : validateStep2();
  };
  
  const goToNextStep = () => {
    setStep(2);
  };
  
  const goToPrevStep = () => {
    setStep(1);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep2()) return;
    
    setRegistering(true);
    
    try {
      // Формируем данные для регистрации
      const validServices = services
        .filter(s => s.serviceName.trim())
        .map(s => ({
          name: s.serviceName.trim(),
          duration: s.duration
        }));
      
      const masterData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        telegramHandle: formData.telegramHandle,
        telegramId: formData.telegramId,
        phoneNumber: formData.phoneNumber,
        password: formData.password,
        serviceCategory: formData.serviceCategory,
        companyId: noCompany ? null : formData.companyId,
        address: formData.address,
        services: validServices
      };
      
      // Регистрация мастера
      const response = await masterApi.registerMaster(masterData);
      
      // Если есть фото, загружаем его
      if (photoBase64 && response.masterId) {
        // Преобразуем base64 в файл
        const photoFile = await fetch(photoBase64).then(res => res.blob());
        const formData = new FormData();
        formData.append('photo', photoFile, 'profile-photo.jpg');
        
        await masterApi.uploadPhoto(response.masterId, formData);
      }
      
      // Сохраняем ID мастера в localStorage
      localStorage.setItem('masterId', response.masterId);
      
      showSuccess('Вы успешно зарегистрировались!');
      
      // Перенаправляем на страницу профиля
      navigate(`/master/${response.masterId}`);
    } catch (error) {
      showError('Ошибка при регистрации: ' + error.message);
    } finally {
      setRegistering(false);
    }
  };
  
  return (
    <div className="register-page">
      <div className="register-container">
        <div className="register-header">
          <h1>Регистрация мастера</h1>
          <div className="step-indicator">
            <div className={`step-item ${step >= 1 ? 'active' : ''}`}>1</div>
            <div className="step-line"></div>
            <div className={`step-item ${step >= 2 ? 'active' : ''}`}>2</div>
          </div>
        </div>
        
        {step === 1 ? (
          <RegisterStep1
            formData={formData}
            setFormData={setFormData}
            errors={errors}
            handleInputChange={handleInputChange}
            validateForm={validateForm}
            goToNextStep={goToNextStep}
          />
        ) : (
          <RegisterStep2
            formData={formData}
            setFormData={setFormData}
            errors={errors}
            handleInputChange={handleInputChange}
            handleSubmit={handleSubmit}
            goToPrevStep={goToPrevStep}
            serviceCategories={serviceCategories}
            companies={companies}
            filteredCompanies={filteredCompanies}
            services={services}
            setServices={setServices}
            photoBase64={photoBase64}
            setPhotoBase64={setPhotoBase64}
            noCompany={noCompany}
            setNoCompany={setNoCompany}
          />
        )}
        
        {registering && (
          <div className="loading-overlay">
            <div className="loader"></div>
            <span>Регистрация...</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegisterPage;
