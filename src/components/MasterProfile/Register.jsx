// src/components/MasterProfile/Register.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/Register.css";

const API_BASE = "https://api.kuchizu.online";

// Валидация
const isTelegramValid = (t) => /^[a-zA-Z0-9_]{5,32}$/.test(t);
const isPhoneValid = (p) => /^\d{9}$/.test(p);

// Заглушка-аватарка
const DefaultUserAvatar = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="#aaaaaa"
    className="default-avatar"
  >
    <path
      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 
             10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 
             3 1.34 3 3s-1.34 3-3-1.34-3-3 
             1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 
             4-3.08 6-3.08 1.99 0 5.97 1.09 6 
             3.08-1.29 1.94-3.5 3.22-6 3.22z"
    />
  </svg>
);

// Шаг 1: базовые данные
function Step1({ data, onChange, onNext }) {
  const [err, setErr] = useState("");

  const handleNext = () => {
    setErr("");
    const {
      firstName,
      lastName,
      telegramHandle,
      phoneNumber,
      password,
      confirmPassword,
    } = data;
    if (
      !firstName ||
      !lastName ||
      !telegramHandle ||
      !phoneNumber ||
      !password
    ) {
      return setErr("Пожалуйста, заполните все обязательные поля");
    }
    if (!isTelegramValid(telegramHandle)) {
      return setErr("Ник в Телеграм 5–32 символа: буквы, цифры и «_»");
    }
    if (!isPhoneValid(phoneNumber)) {
      return setErr("Номер телефона должен быть ровно 9 цифр");
    }
    if (password !== confirmPassword) {
      return setErr("Пароли не совпадают");
    }
    onNext();
  };

  const handleTel = (e) =>
    onChange({
      target: {
        name: "telegramHandle",
        value: e.target.value.replace("@", ""),
      },
    });
  const handlePhone = (e) =>
    onChange({
      target: {
        name: "phoneNumber",
        value: e.target.value.replace("+992", ""),
      },
    });

  return (
    <div className="form-container">
      <h2>Регистрация мастера</h2>
      {err && <div className="error-message">{err}</div>}
      <div className="form-group">
        <label>Имя</label>
        <input name="firstName" value={data.firstName} onChange={onChange} />
      </div>
      <div className="form-group">
        <label>Фамилия</label>
        <input name="lastName" value={data.lastName} onChange={onChange} />
      </div>
      <div className="form-group">
        <label>Ник в Телеграм</label>
        <div className="input-with-prefix">
          <span className="input-prefix">@</span>
          <input
            name="telegramHandle"
            className="input-with-prefix-field"
            value={data.telegramHandle}
            onChange={handleTel}
          />
        </div>
      </div>
      <div className="form-group">
        <label>Номер телефона</label>
        <div className="input-with-prefix">
          <span className="input-prefix">+992</span>
          <input
            name="phoneNumber"
            className="input-with-prefix-field"
            value={data.phoneNumber}
            onChange={handlePhone}
          />
        </div>
      </div>
      <div className="form-group">
        <label>Пароль</label>
        <input
          type="password"
          name="password"
          value={data.password}
          onChange={onChange}
        />
      </div>
      <div className="form-group">
        <label>Подтвердите пароль</label>
        <input
          type="password"
          name="confirmPassword"
          value={data.confirmPassword}
          onChange={onChange}
        />
      </div>
      <button className="submit-button" onClick={handleNext}>
        Создать аккаунт
      </button>
    </div>
  );
}

// Шаг 2: профессиональная информация
function Step2({
  data,
  serviceAreas,
  filteredCompanies,
  loadingCompanies,
  loadingServiceAreas,
  services,
  onChange,
  onCompanyChange,
  onPhotoChange,
  onAddService,
  onRemoveService,
  onServiceChange,
  onBack,
  onSubmit,
  submitting,
  error,
}) {
  const fileInput = useRef();

  return (
    <div className="form-container">
      <h2>Профессиональная информация</h2>
      {error && <div className="error-message">{error}</div>}

      {/* Сфера услуг */}
      <div className="form-group">
        <label>Сфера услуг</label>
        {loadingServiceAreas ? (
          <p>Загрузка сфер услуг…</p>
        ) : (
          <select
            name="serviceCategory"
            value={data.serviceCategory}
            onChange={onChange}
          >
            <option value="">Выберите сферу</option>
            {serviceAreas.map((a) => (
              <option key={a.id} value={a.id}>
                {a.display_name || a.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Компания */}
      <div className="form-group">
        <label>Компания (опционально)</label>
        {loadingCompanies ? (
          <p>Загрузка компаний…</p>
        ) : (
          <select
            name="companyId"
            value={data.companyId}
            onChange={onCompanyChange}
          >
            <option value={0}>-- Не указано --</option>
            {filteredCompanies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Адрес */}
      <div className="form-group">
        <label>Адрес</label>
        <input
          name="address"
          value={data.address}
          readOnly={data.isAddressLocked}
          onChange={onChange}
        />
        {data.isAddressLocked && <small>Адрес подставлен из компании</small>}
      </div>

      {/* Фото */}
      <div className="form-group photo-upload-container">
        <label>Фотография (опционально)</label>
        <div className="photo-circle" onClick={() => fileInput.current.click()}>
          {data.photoPreview ? (
            <img src={data.photoPreview} alt="preview" />
          ) : (
            <DefaultUserAvatar />
          )}
        </div>
        <input
          type="file"
          ref={fileInput}
          accept="image/*"
          onChange={onPhotoChange}
          className="hidden-file-input"
        />
      </div>

      {/* Ваши услуги */}
      <h3>Ваши услуги</h3>
      {services.map((svc, idx) => (
        <div className="service-item" key={idx}>
          <div className="form-group service-name">
            <label>Название услуги</label>
            <input
              type="text"
              placeholder="Введите название услуги"
              value={svc.serviceName}
              onChange={(e) =>
                onServiceChange(idx, "serviceName", e.target.value)
              }
              required
            />
          </div>
          <div className="form-group service-duration">
            <label>Длительность</label>
            <input
              type="number"
              min={1}
              placeholder="минуты"
              value={svc.duration}
              onChange={(e) => {
                const value = e.target.value ? parseInt(e.target.value, 10) : "";
                onServiceChange(idx, "duration", value);
              }}
              required
            />
          </div>
          {idx > 0 && (
            <button
              type="button"
              className="remove-service-btn"
              onClick={() => onRemoveService(idx)}
            >
              Удалить
            </button>
          )}
        </div>
      ))}
      <button type="button" className="add-service-btn" onClick={onAddService}>
        + Добавить услугу
      </button>

      {/* Навигация */}
      <div className="buttons-group">
        <button onClick={onBack} disabled={submitting}>
          Назад
        </button>
        <button onClick={onSubmit} disabled={submitting}>
          {submitting ? "Отправка…" : "Подтвердить"}
        </button>
      </div>
    </div>
  );
}

// Главный компонент регистрации
export default function Register() {
  const navigate = useNavigate(); // Добавляем хук для навигации
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    telegramHandle: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
    serviceCategory: "",
    companyId: 0,
    address: "",
    isAddressLocked: false,
    photoBase64: "",
    photoPreview: "",
  });
  const [services, setServices] = useState([{ serviceName: "", duration: 30 }]);
  const [companies, setCompanies] = useState([]);
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [serviceAreas, setServiceAreas] = useState([]);
  const [loadingCompanies, setLoadingCompanies] = useState(false);
  const [loadingServiceAreas, setLoadingServiceAreas] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [masterId, setMasterId] = useState(null); // Добавляем состояние для хранения ID мастера

  useEffect(() => {
    fetchCompanies();
    fetchServiceAreas();
  }, []);

  async function fetchCompanies() {
    setLoadingCompanies(true);
    try {
      const res = await fetch(`${API_BASE}/companies`, {
        headers: { accept: "application/json" },
      });
      if (!res.ok) throw new Error(res.statusText);
      const data = await res.json();
      setCompanies(data);
      setFilteredCompanies(data);
    } catch (err) {
      console.error("Ошибка загрузки компаний:", err);
      setError("Не удалось загрузить компании");
    } finally {
      setLoadingCompanies(false);
    }
  }

  async function fetchServiceAreas() {
    setLoadingServiceAreas(true);
    try {
      const res = await fetch(`${API_BASE}/service-areas/`, {
        headers: { accept: "application/json" },
      });
      if (!res.ok) throw new Error(res.statusText);
      setServiceAreas(await res.json());
    } catch (err) {
      console.error("Ошибка загрузки сфер услуг:", err);
      setError("Не удалось загрузить сферы услуг");
    } finally {
      setLoadingServiceAreas(false);
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "serviceCategory") {
      setFormData((fd) => ({ ...fd, serviceCategory: value }));
      const filtered = companies.filter((c) => c.service_area_id === value);
      setFilteredCompanies(filtered);
      if (!filtered.some((c) => c.id === formData.companyId)) {
        setFormData((fd) => ({
          ...fd,
          companyId: 0,
          address: "",
          isAddressLocked: false,
        }));
      }
      return;
    }
    setFormData((fd) => ({ ...fd, [name]: value }));
  };

  const handleCompanyChange = (e) => {
    const id = e.target.value;
    const sel = companies.find((c) => c.id === id) || null;
    setFormData((fd) => ({
      ...fd,
      companyId: id,
      address: sel ? sel.address : "",
      isAddressLocked: !!sel,
    }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const rdr = new FileReader();
    rdr.onload = () => {
      const b64 = rdr.result.split(",")[1];
      setFormData((fd) => ({
        ...fd,
        photoBase64: b64,
        photoPreview: URL.createObjectURL(file),
      }));
    };
    rdr.readAsDataURL(file);
  };

  const handleServiceChange = (index, field, value) => {
    setServices((svcs) => {
      const copy = [...svcs];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };
  const addService = () =>
    setServices((svcs) => [...svcs, { serviceName: "", duration: 30 }]);
  const removeService = (idx) =>
    setServices((svcs) => svcs.filter((_, i) => i !== idx));

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        telegram_username: "@" + formData.telegramHandle,
        phone_number: "+992" + formData.phoneNumber,
        password: formData.password,
        service_category: formData.serviceCategory,
        company_id: formData.companyId,
        address: formData.address,
        photo_base64: formData.photoBase64,
        services: services.map((s) => ({
          service_name: s.serviceName,
          duration: s.duration,
        })),
      };
      const res = await fetch(`${API_BASE}/masters/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Ошибка регистрации");
      }
      
      // Получаем ответ от сервера с ID мастера
      const data = await res.json();
      setMasterId(data.master_id);
      setRegistrationSuccess(true);
      
      // Редирект на страницу мастера через 1.5 секунды
      setTimeout(() => {
        navigate(`/master/${data.master_id}`);
      }, 1500);
    } catch (err) {
      console.error("Ошибка при регистрации:", err);
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (registrationSuccess) {
    return (
      <div className="form-container success-container">
        <h2>Регистрация успешно завершена!</h2>
        <p>Перенаправление на страницу мастера...</p>
        {masterId && (
          <button 
            className="submit-button" 
            onClick={() => navigate(`/master/${masterId}`)}
          >
            Перейти в профиль
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="master-registration">
      <div className="form-wrapper">
        <div className="progress-container">
          <div className={`progress-step ${step >= 1 ? "active" : ""}`}>1</div>
          <div className="progress-line" />
          <div className={`progress-step ${step >= 2 ? "active" : ""}`}>2</div>
        </div>
        {step === 1 ? (
          <Step1
            data={formData}
            onChange={handleChange}
            onNext={() => setStep(2)}
          />
        ) : (
          <Step2
            data={formData}
            serviceAreas={serviceAreas}
            filteredCompanies={filteredCompanies}
            loadingCompanies={loadingCompanies}
            loadingServiceAreas={loadingServiceAreas}
            services={services}
            onChange={handleChange}
            onCompanyChange={handleCompanyChange}
            onPhotoChange={handlePhotoChange}
            onServiceChange={handleServiceChange}
            onAddService={addService}
            onRemoveService={removeService}
            onBack={() => setStep(1)}
            onSubmit={handleSubmit}
            submitting={submitting}
            error={error}
          />
        )}
      </div>
    </div>
  );
}
