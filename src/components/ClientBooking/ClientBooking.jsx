import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import ServiceList from './ServiceList';
import BookingForm from './BookingForm';
import BookingHistory from './BookingHistory';
import './ClientBooking.css';
import { useToast } from '../Toast/ToastContext';

function ClientBooking({ apiBase }) {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedService, setSelectedService] = useState(null);
    const [activeTab, setActiveTab] = useState('services'); // 'services' или 'history'
    const [masterInfo, setMasterInfo] = useState(null);
    const navigate = useNavigate();
    const { clientId } = useParams();
    const location = useLocation();
    const { showError } = useToast();
    
    // Получаем master_id из query-параметров URL
    const getMasterId = () => {
        const searchParams = new URLSearchParams(location.search);
        return searchParams.get('master_id');
    };
    
    const masterId = getMasterId();

    // Получаем ID клиента из URL
    const getClientId = () => {
        if (clientId) return clientId;
        // Если clientId не передан в URL, перенаправляем на страницу регистрации
        navigate('/register');
        return null;
    };

    useEffect(() => {
        // Проверяем наличие master_id
        if (!masterId) {
            showError('Отсутствует ID мастера. Перенаправление на главную страницу.');
            navigate('/');
            return;
        }
    }, [masterId, navigate, showError]);

    // Загрузка данных о мастере
    useEffect(() => {
        const fetchMasterInfo = async () => {
            if (!masterId) return;

            try {
                const response = await fetch(`${apiBase}/masters/${masterId}`, {
                    headers: { 'accept': 'application/json' }
                });

                if (!response.ok) {
                    throw new Error(`Ошибка при загрузке данных о мастере: ${response.status}`);
                }

                const masterData = await response.json();
                setMasterInfo(masterData);
            } catch (err) {
                console.error('Не удалось загрузить информацию о мастере:', err);
                // Не показываем ошибку пользователю, просто продолжаем без информации о мастере
            }
        };

        fetchMasterInfo();
    }, [apiBase, masterId]);

    // Загрузка доступных услуг мастера
    useEffect(() => {
        const fetchServices = async () => {
            const id = getClientId();
            if (!id || !masterId) return;

            try {
                setLoading(true);
                // Загружаем все услуги
                const endpoint = `${apiBase}/services`;

                const response = await fetch(endpoint);

                if (!response.ok) {
                    throw new Error(`Ошибка: ${response.status}`);
                }

                const allServices = await response.json();
                
                // Фильтруем услуги только для нужного мастера
                const filteredServices = allServices.filter(service => service.master_id === masterId);
                
                setServices(filteredServices);
                console.log(`Загружено ${filteredServices.length} услуг мастера ${masterId}`);
            } catch (err) {
                console.error('Ошибка при загрузке услуг:', err);
                setError('Не удалось загрузить услуги. Пожалуйста, попробуйте снова позже.');
            } finally {
                setLoading(false);
            }
        };

        fetchServices();
    }, [apiBase, navigate, clientId, masterId]);

    // Обработчик выбора услуги
    const handleServiceSelect = (service) => {
        setSelectedService(service);
    };

    // Переход в историю бронирований
    const goToHistory = () => {
        setActiveTab('history');
    };

    // Вернуться к выбору услуг
    const backToServices = () => {
        setActiveTab('services');
        setSelectedService(null);
    };

    // Отображение загрузки
    if (loading) {
        return (
            <div className="client-booking-container">
                <div className="loading">Загрузка...</div>
            </div>
        );
    }

    // Отображение ошибки
    if (error) {
        return (
            <div className="client-booking-container">
                <div className="error-message">{error}</div>
            </div>
        );
    }

    return (
        <div className="client-booking-container">
            <div className="client-booking-header">
                <h1>Онлайн-бронирование</h1>
                <div className="tabs">
                    <button 
                        className={`tab ${activeTab === 'services' ? 'active' : ''}`}
                        onClick={() => setActiveTab('services')}
                    >
                        Услуги
                    </button>
                    <button 
                        className={`tab ${activeTab === 'history' ? 'active' : ''}`}
                        onClick={() => setActiveTab('history')}
                    >
                        История бронирований
                    </button>
                </div>
            </div>

            <div className="client-booking-content">
                {activeTab === 'services' && !selectedService && (
                    <ServiceList 
                        services={services} 
                        onSelectService={handleServiceSelect}
                        masterInfo={masterInfo}
                    />
                )}

                {activeTab === 'services' && selectedService && (
                    <BookingForm 
                        selectedService={selectedService} 
                        onCancel={backToServices}
                        onSubmit={(bookingData) => {
                            // Здесь будет обработка формы бронирования
                            console.log('Booking data:', bookingData);
                            goToHistory(); // После успешного бронирования переходим в историю
                        }}
                        masterId={masterId}
                        masterInfo={masterInfo}
                    />
                )}

                {activeTab === 'history' && (
                    <BookingHistory 
                        apiBase={apiBase} 
                        clientId={getClientId()}
                        masterId={masterId}
                    />
                )}
            </div>
        </div>
    );
}

export default ClientBooking;