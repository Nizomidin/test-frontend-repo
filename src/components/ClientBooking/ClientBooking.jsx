import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ServiceFilter from './ServiceFilter';
import ServiceList from './ServiceList';
import BookingForm from './BookingForm';
import BookingHistory from './BookingHistory';
import './ClientBooking.css';

function ClientBooking({ apiBase }) {
    const [services, setServices] = useState([]);
    const [filteredServices, setFilteredServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedService, setSelectedService] = useState(null);
    const [activeTab, setActiveTab] = useState('services'); // 'services' или 'history'
    const navigate = useNavigate();
    const { masterId, clientId } = useParams();

    // Получаем ID клиента только из URL
    const getClientId = () => {
        if (clientId) return clientId;
        // Если clientId не передан в URL, перенаправляем на страницу регистрации
        navigate('/register');
        return null;
    };

    // Загрузка доступных услуг
    useEffect(() => {
        const fetchServices = async () => {
            const id = getClientId();
            if (!id) return;

            try {
                setLoading(true);
                // Если указан masterId, загружаем только услуги этого мастера
                const endpoint = masterId 
                    ? `${apiBase}/services?masterId=${masterId}` 
                    : `${apiBase}/services`;

                const response = await fetch(endpoint);

                if (!response.ok) {
                    throw new Error(`Ошибка: ${response.status}`);
                }

                const data = await response.json();
                setServices(data);
                setFilteredServices(data);
            } catch (err) {
                console.error('Ошибка при загрузке услуг:', err);
                setError('Не удалось загрузить услуги. Пожалуйста, попробуйте снова позже.');
            } finally {
                setLoading(false);
            }
        };

        fetchServices();
    }, [apiBase, navigate, clientId, masterId]);

    // Обработчик фильтрации услуг
    const handleFilterChange = (filters) => {
        let filtered = [...services];

        // Фильтрация по категории
        if (filters.category) {
            filtered = filtered.filter(service => service.category === filters.category);
        }

        // Фильтрация по поиску
        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            filtered = filtered.filter(service => 
                service.name.toLowerCase().includes(searchLower) || 
                service.description.toLowerCase().includes(searchLower)
            );
        }

        // Фильтрация по длительности
        if (filters.duration) {
            const duration = parseInt(filters.duration);
            if (duration === 30) {
                filtered = filtered.filter(service => service.duration <= 30);
            } else if (duration === 60) {
                filtered = filtered.filter(service => service.duration > 30 && service.duration <= 60);
            } else if (duration === 90) {
                filtered = filtered.filter(service => service.duration > 60 && service.duration <= 90);
            } else if (duration === 120) {
                filtered = filtered.filter(service => service.duration > 90);
            }
        }

        setFilteredServices(filtered);
    };

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
                    <>
                        <ServiceFilter onFilterChange={handleFilterChange} />
                        <ServiceList 
                            services={filteredServices} 
                            onServiceSelect={handleServiceSelect} 
                            masterId={masterId}
                        />
                    </>
                )}

                {activeTab === 'services' && selectedService && (
                    <BookingForm 
                        service={selectedService} 
                        apiBase={apiBase} 
                        clientId={getClientId()} 
                        onSuccess={goToHistory}
                        onCancel={backToServices}
                    />
                )}

                {activeTab === 'history' && (
                    <BookingHistory 
                        apiBase={apiBase} 
                        clientId={getClientId()} 
                    />
                )}
            </div>
        </div>
    );
}

export default ClientBooking;