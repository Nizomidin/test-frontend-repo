import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import { ToastProvider } from "./contexts/ToastContext";

// Импортируем страницы
import MasterProfilePage from "./components/pages/MasterProfilePage";
import RegisterPage from "./components/pages/RegisterPage";
import ClientBookingPage from "./components/pages/ClientBookingPage";

function App() {
  return (
    <ToastProvider>
      <Router>
        <div className="app-container">
          <Routes>
            {/* Маршрут по умолчанию - редирект на страницу регистрации */}
            <Route path="/" element={<Navigate to="/register" replace />} />
            
            {/* Маршрут для страницы регистрации */}
            <Route path="/register" element={<RegisterPage />} />
            
            {/* Маршрут для профиля мастера */}
            <Route path="/master/:masterId" element={<MasterProfilePage />} />
            
            {/* Маршрут для профиля мастера без указания ID (используется ID из localStorage) */}
            <Route path="/master" element={<MasterProfilePage />} />
            
            {/* Маршрут для клиентского бронирования - только через ссылку с clientId и master_id в query параметре */}
            <Route path="/booking/client/:clientId" element={<ClientBookingPage />} />
            
            {/* Маршрут для всех остальных адресов - 404 страница */}
            <Route path="*" element={
              <div className="not-found">
                <h1>404</h1>
                <p>Страница не найдена</p>
                <a href="/">Вернуться на главную</a>
              </div>            } />
          </Routes>
        </div>
      </Router>
    </ToastProvider>
  );
}

export default App;
