import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import { ToastProvider } from "./components/Toast/ToastContext";

// Импортируем компоненты
import MasterProfile from "./components/MasterProfile/MasterProfile";
import Register from "./components/MasterProfile/Register";
import ClientBooking from "./components/ClientBooking/ClientBooking";
import Test from "./Test";

// API Base URL
const API_BASE = "https://api.kuchizu.online";

function App() {
  return (
    <ToastProvider>
      <Router>
        <div className="app-container">
          <Routes>
            {/* Маршрут по умолчанию - редирект на страницу регистрации */}
            <Route path="/" element={<Navigate to="/register" replace />} />
            
            {/* Маршрут для страницы регистрации */}
            <Route path="/register" element={<Register apiBase={API_BASE} />} />
            
            {/* Маршрут для профиля мастера */}
            <Route path="/master/:masterId" element={<MasterProfile apiBase={API_BASE} />} />
            
            {/* Маршрут для профиля мастера без указания ID (используется ID из localStorage) */}
            <Route path="/master" element={<MasterProfile apiBase={API_BASE} />} />
            
            {/* Маршрут для клиентского бронирования - только через ссылку с clientId и master_id в query параметре */}
            <Route path="/booking/client/:clientId" element={<ClientBooking apiBase={API_BASE} />} />
            <Route path="/test" element={<Test />} />
            
            {/* Маршрут для всех остальных адресов - 404 страница */}
            <Route path="*" element={
              <div className="not-found">
                <h1>404</h1>
                <p>Страница не найдена</p>
                <a href="/">Вернуться на главную</a>
              </div>
            } />
          </Routes>
        </div>
      </Router>
    </ToastProvider>
  );
}

export default App;
