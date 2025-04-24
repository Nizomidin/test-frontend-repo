import React, { Component } from 'react';
import './App.css';

// Дефолтное изображение пользователя в формате SVG
const DefaultUserAvatar = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="#aaaaaa" 
    className="default-avatar"
  >
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
  </svg>
);

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      step: 1,
      firstName: '',
      lastName: '',
      telegramHandle: '',
      phoneNumber: '', // Добавлено новое поле для номера телефона
      password: '',
      confirmPassword: '',
      serviceCategory: '',
      companyName: '',
      companyId: 0, // Добавлено поле для ID компании
      address: '',
      photo: null,
      photoBase64: '', // Для хранения фото в формате base64
      photoPreview: null, // Добавляем новое свойство для хранения URL превью фото
      services: [{ name: '', duration: 30 }],
      selectedServices: [], // Массив выбранных услуг для отправки на сервер
      availableServices: [],
      loading: false,
      submitting: false, // Для отслеживания состояния отправки формы
      error: null,
      registrationSuccess: false, // Для отображения сообщения об успешной регистрации
      companies: [], // Добавляем массив для хранения списка компаний
      loadingCompanies: false // Флаг загрузки списка компаний
    };
    
    this.fileInputRef = React.createRef(); // Создаем ссылку для скрытого file input
  }

  componentDidMount() {
    this.fetchServices();
    this.fetchCompanies(); // Добавляем загрузку списка компаний
  }

  // Получение списка услуг из API
  fetchServices = async () => {
    try {
      this.setState({ loading: true });
      const response = await fetch('https://87.120.36.97:44556/services/', {
        headers: { 'accept': 'application/json' }
      });

      if (!response.ok) {
        throw new Error(`Ошибка при получении данных: ${response.statusText}`);
      }

      const data = await response.json();
      
      // В зависимости от формата данных, полученных из API, 
      // может потребоваться дополнительная обработка
      this.setState({ 
        availableServices: data, 
        loading: false 
      });
      console.log('Полученные услуги:', data);
    } catch (error) {
      console.error('Ошибка при загрузке услуг:', error);
      this.setState({ 
        error: 'Не удалось загрузить список услуг. Пожалуйста, попробуйте позже.', 
        loading: false 
      });
    }
  }

  // Получение списка компаний из API
  fetchCompanies = async () => {
    try {
      this.setState({ loadingCompanies: true });
      const response = await fetch('https://87.120.36.97:44556/companies/', {
        headers: { 'accept': 'application/json' }
      });

      if (!response.ok) {
        throw new Error(`Ошибка при получении данных о компаниях: ${response.statusText}`);
      }

      const data = await response.json();
      
      this.setState({ 
        companies: data.companies, 
        loadingCompanies: false 
      });
      console.log('Полученные компании:', data);
    } catch (error) {
      console.error('Ошибка при загрузке компаний:', error);
      this.setState({ 
        error: 'Не удалось загрузить список компаний. Пожалуйста, попробуйте позже.', 
        loadingCompanies: false 
      });
    }
  }

  // Переход к следующему шагу
  nextStep = () => {
    // Проверка валидации формы первого шага
    const { firstName, lastName, telegramHandle, phoneNumber, password, confirmPassword } = this.state;
    
    if (!firstName || !lastName || !telegramHandle || !phoneNumber || !password) {
      alert('Пожалуйста, заполните все обязательные поля');
      return;
    }
    
    if (password !== confirmPassword) {
      alert('Пароли не совпадают');
      return;
    }
    
    const { step } = this.state;
    this.setState({ step: step + 1 });
  }

  // Возврат к предыдущему шагу
  prevStep = () => {
    const { step } = this.state;
    this.setState({ step: step - 1 });
  }

  // Обработчик изменения полей ввода
  handleChange = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  }

  // Преобразование файла в base64
  convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(file);
      fileReader.onload = () => {
        resolve(fileReader.result.split(',')[1]); // Отделяем сам base64 от префикса data:image/...
      };
      fileReader.onerror = (error) => {
        reject(error);
      };
    });
  };

  // Обработчик клика на круглый элемент загрузки фото
  handlePhotoClick = () => {
    this.fileInputRef.current.click(); // Имитируем клик на скрытый input
  }

  // Обработчик изменения фото
  handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        // Создаем URL для превью
        const previewUrl = URL.createObjectURL(file);
        
        // Конвертируем в base64 для отправки на сервер
        const base64 = await this.convertToBase64(file);
        
        this.setState({ 
          photo: file,
          photoBase64: base64,
          photoPreview: previewUrl
        });
      } catch (error) {
        console.error('Ошибка при обработке фото:', error);
      }
    }
  }

  // Обработчик выбора компании
  handleCompanyChange = (e) => {
    const companyId = parseInt(e.target.value) || 0;
    const selectedCompany = this.state.companies.find(company => company.id === companyId);
    
    this.setState({ 
      companyId: companyId,
      companyName: selectedCompany ? selectedCompany.name : ''
    });
  }

  // Добавление новой услуги
  addService = () => {
    this.setState(prevState => ({
      services: [...prevState.services, { name: '', duration: 30 }]
    }));
  }

  // Обработчик изменения полей услуг
  handleServiceChange = (index, field, value) => {
    const updatedServices = [...this.state.services];
    updatedServices[index][field] = value;
    this.setState({ services: updatedServices });
  }

  // Выбор услуги из доступного списка
  selectService = (index, selectedServiceId) => {
    const selectedService = this.state.availableServices.find(service => service.id === selectedServiceId);
    
    if (selectedService) {
      const updatedServices = [...this.state.services];
      updatedServices[index] = {
        name: selectedService.name,
        duration: selectedService.defaultDuration || 30,
        serviceId: selectedService.id
      };
      
      // Обновляем массив выбранных услуг для API
      const selectedServices = [...this.state.selectedServices];
      if (!selectedServices.includes(selectedService.id)) {
        selectedServices.push(selectedService.id);
      }
      
      this.setState({ 
        services: updatedServices,
        selectedServices: selectedServices
      });
    }
  }

  // Удаление услуги
  removeService = (index) => {
    const updatedServices = [...this.state.services];
    const removedService = updatedServices[index];
    
    // Удаляем услугу из массива выбранных услуг для API
    if (removedService && removedService.serviceId) {
      const updatedSelectedServices = this.state.selectedServices.filter(
        id => id !== removedService.serviceId
      );
      this.setState({ selectedServices: updatedSelectedServices });
    }
    
    updatedServices.splice(index, 1);
    this.setState({ services: updatedServices });
  }

  // Отправка формы регистрации на сервер
  handleSubmit = async () => {
    try {
      this.setState({ submitting: true, error: null });
      
      // Разделяем имя на имя и фамилию
      const { firstName, lastName, telegramHandle, phoneNumber, password, companyId, photoBase64, selectedServices } = this.state;
      
      // Формируем данные для отправки на сервер
      const registrationData = {
        first_name: firstName,
        last_name: lastName,
        telegram_username: telegramHandle,
        phone_number: phoneNumber,
        password: password,
        company_id: companyId,
        photo_base64: photoBase64 || "",
        services: selectedServices
      };
      
      console.log('Отправляемые данные:', registrationData);
      
      // Отправляем запрос на регистрацию
      const response = await fetch('https://87.120.36.97:44556/register_master/', {
        method: 'POST',
        headers: { 
          'accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(registrationData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Ошибка при регистрации');
      }
      
      const data = await response.json();
      console.log('Успешный ответ:', data);
      
      // Отображаем сообщение об успешной регистрации
      this.setState({ registrationSuccess: true, submitting: false });
      
    } catch (error) {
      console.error('Ошибка при регистрации:', error);
      this.setState({ 
        error: error.message || 'Произошла ошибка при регистрации. Попробуйте позже.',
        submitting: false 
      });
    }
  }

  // Рендер первого шага формы
  renderStep1() {
    return (
      <div className="form-container">
        <h2>Регистрация мастера</h2>
        <div className="form-group">
          <label htmlFor="firstName">Имя</label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={this.state.firstName}
            onChange={this.handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="lastName">Фамилия</label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={this.state.lastName}
            onChange={this.handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="telegramHandle">Ник в Телеграм</label>
          <input
            type="text"
            id="telegramHandle"
            name="telegramHandle"
            value={this.state.telegramHandle}
            onChange={this.handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="phoneNumber">Номер телефона</label>
          <input
            type="tel"
            id="phoneNumber"
            name="phoneNumber"
            value={this.state.phoneNumber}
            onChange={this.handleChange}
            placeholder="+7 (XXX) XXX-XX-XX"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Пароль</label>
          <input
            type="password"
            id="password"
            name="password"
            value={this.state.password}
            onChange={this.handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="confirmPassword">Подтвердите пароль</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={this.state.confirmPassword}
            onChange={this.handleChange}
            required
          />
        </div>
        <button className="submit-button" onClick={this.nextStep}>Создать аккаунт</button>
      </div>
    );
  }

  // Рендер второго шага формы
  renderStep2() {
    const serviceCategories = ['Барбершопы', 'Женские бьюти услуги', 'Медицина', 'Футбольные поля', 'Дачи'];
    const { loading, loadingCompanies, error, submitting, availableServices, registrationSuccess, companies, photoPreview } = this.state;
    
    if (registrationSuccess) {
      return (
        <div className="form-container success-container">
          <div className="success-message">
            <h2>Регистрация успешно завершена!</h2>
            <p>Вы успешно зарегистрировались в качестве мастера.</p>
          </div>
        </div>
      );
    }
    
    return (
      <div className="form-container">
        <h2>Профессиональная информация</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        <div className="form-group">
          <label htmlFor="serviceCategory">Сфера услуг</label>
          <select
            id="serviceCategory"
            name="serviceCategory"
            value={this.state.serviceCategory}
            onChange={this.handleChange}
            required
          >
            <option value="">Выберите сферу услуг</option>
            {serviceCategories.map((category, index) => (
              <option key={index} value={category}>{category}</option>
            ))}
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="companyId">Компания (если работаете на компанию)</label>
          {loadingCompanies ? (
            <div className="loading-small">Загрузка списка компаний...</div>
          ) : (
            <select
              id="companyId"
              name="companyId"
              value={this.state.companyId}
              onChange={this.handleCompanyChange}
            >
              <option value="0">-- Не указано --</option>
              {companies && companies.length > 0 && companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>
          )}
        </div>
        
        <div className="form-group">
          <label htmlFor="address">Адрес</label>
          <input
            type="text"
            id="address"
            name="address"
            value={this.state.address}
            onChange={this.handleChange}
            required
          />
        </div>
        
        <div className="form-group photo-upload-container">
          <label>Фотография (опционально)</label>
          <div className="photo-circle" onClick={this.handlePhotoClick}>
            {photoPreview ? (
              <img 
                src={photoPreview} 
                alt="Фото профиля" 
                className="photo-preview-image" 
              />
            ) : (
              <div className="photo-placeholder">
                <DefaultUserAvatar />
                <span>Изменить фото</span>
              </div>
            )}
          </div>
          <input
            type="file"
            id="photo"
            name="photo"
            ref={this.fileInputRef}
            onChange={this.handlePhotoChange}
            accept="image/*"
            className="hidden-file-input"
          />
        </div>
        
        <h3>Ваши услуги</h3>
        {loading ? (
          <div className="loading">Загрузка списка услуг...</div>
        ) : (
          <>
            {this.state.services.map((service, index) => (
              <div key={index} className="service-item">
                <div className="form-group service-name">
                  <label htmlFor={`service-name-${index}`}>Услуга</label>
                  {availableServices && availableServices.length > 0 ? (
                    <select
                      id={`service-name-${index}`}
                      value={service.serviceId || ''}
                      onChange={(e) => this.selectService(index, e.target.value)}
                      required
                    >
                      <option value="">Выберите услугу</option>
                      {availableServices.map((availableService) => (
                        <option 
                          key={availableService.id} 
                          value={availableService.id}
                        >
                          {availableService.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      id={`service-name-${index}`}
                      value={service.name}
                      onChange={(e) => this.handleServiceChange(index, 'name', e.target.value)}
                      placeholder="Например: маникюр"
                      required
                    />
                  )}
                </div>
                <div className="form-group service-duration">
                  <label htmlFor={`service-duration-${index}`}>Длительность (мин)</label>
                  <input
                    type="number"
                    id={`service-duration-${index}`}
                    value={service.duration}
                    onChange={(e) => this.handleServiceChange(index, 'duration', parseInt(e.target.value) || 0)}
                    min="5"
                    required
                  />
                </div>
                {index > 0 && (
                  <button 
                    type="button" 
                    className="remove-service-btn" 
                    onClick={() => this.removeService(index)}
                  >
                    Удалить
                  </button>
                )}
              </div>
            ))}
            <button type="button" className="add-service-btn" onClick={this.addService}>
              + Добавить услугу
            </button>
          </>
        )}
        
        <div className="buttons-group">
          <button 
            type="button" 
            className="back-button" 
            onClick={this.prevStep}
            disabled={submitting}
          >
            Назад
          </button>
          <button 
            type="submit" 
            className="submit-button" 
            onClick={this.handleSubmit}
            disabled={loading || submitting}
          >
            {submitting ? 'Отправка...' : 'Подтвердить'}
          </button>
        </div>
      </div>
    );
  }

  render() {
    const { step } = this.state;
    return (
      <div className="master-registration">
        <div className="form-wrapper">
          <div className="progress-container">
            <div className={`progress-step ${step >= 1 ? 'active' : ''}`}>1</div>
            <div className="progress-line"></div>
            <div className={`progress-step ${step >= 2 ? 'active' : ''}`}>2</div>
          </div>
          {step === 1 ? this.renderStep1() : this.renderStep2()}
        </div>
      </div>
    );
  }
}