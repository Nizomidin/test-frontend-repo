import React, { useState, useEffect } from "react";
import BlockTimeForm from "./BlockTimeForm";
import CustomBookingForm from "./CustomBookingForm";
import "./BookingOptionsForm.css";

function BookingOptionsForm({ onSubmitStandard, onSubmitCustom, onCancel, selectedDate, masterId }) {
  const [bookingType, setBookingType] = useState("standard"); // standard или custom
  const [isAnimating, setIsAnimating] = useState(false);

  const handleBookingTypeChange = (type) => {
    if (type !== bookingType) {
      setIsAnimating(true);
      setTimeout(() => {
        setBookingType(type);
        setIsAnimating(false);
      }, 250); // 250ms - длительность анимации затухания
    }
  };
  const handleStandardSubmit = (data) => {
    onSubmitStandard(data);
    // Закрываем форму при успешном бронировании
    onCancel();
  };

  const handleCustomSubmit = (data) => {
    onSubmitCustom(data);
    // Закрываем форму при успешном бронировании
    onCancel();
  };

  const handleCancel = () => {
    onCancel();
  };

  return (
    <div className={`booking-options-form ${isAnimating ? 'switching' : ''}`}>      <div className="booking-type-selector">
        <div className="booking-header">
          <h2>Забронировать время</h2>
          <button className="close-button" onClick={handleCancel}>×</button>
        </div>
        <div className="booking-tabs">
          <button 
            className={`booking-tab ${bookingType === 'standard' ? 'active' : ''}`} 
            onClick={() => handleBookingTypeChange('standard')}
          >
            Стандартная запись
          </button>
          <button 
            className={`booking-tab ${bookingType === 'custom' ? 'active' : ''}`} 
            onClick={() => handleBookingTypeChange('custom')}
          >
            Кастомная запись
          </button>
        </div>
      </div>

      <div className="booking-form-container">
        {bookingType === 'standard' ? (
          <BlockTimeForm
            onSubmit={handleStandardSubmit}
            onCancel={handleCancel}
            selectedDate={selectedDate}
            masterId={masterId}
            embedded={true} // Флаг, что форма встроена в другую
          />
        ) : (
          <CustomBookingForm
            onSubmit={handleCustomSubmit}
            onCancel={handleCancel}
            selectedDate={selectedDate}
            masterId={masterId}
            embedded={true} // Флаг, что форма встроена в другую
          />
        )}
      </div>
    </div>
  );
}

export default BookingOptionsForm;
