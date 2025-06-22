import React, { useState, useRef, useEffect } from 'react';
import './DatePicker.css';

const DatePicker = ({ 
  value, 
  onChange, 
  placeholder = "DD/MM/AAAA",
  minDate = null,
  maxDate = null,
  required = false,
  disabled = false,
  className = "",
  id = ""
}) => {
  const [inputValue, setInputValue] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const inputRef = useRef(null);
  const calendarRef = useRef(null);

  // Converte data do formato YYYY-MM-DD para DD/MM/AAAA
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return '';
    
    // Se já está no formato correto YYYY-MM-DD, usar parsing manual
    if (dateString.includes('-') && dateString.length === 10) {
      const [year, month, day] = dateString.split('-');
      return `${day}/${month}/${year}`;
    }
    
    // Para outros casos, usar Date mas com cuidado para timezone
    const date = new Date(dateString + 'T00:00:00'); // Adicionar hora para evitar timezone issues
    if (isNaN(date.getTime())) return '';
    
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
  };

  // Converte data do formato DD/MM/AAAA para YYYY-MM-DD
  const formatDateForValue = (displayDate) => {
    if (!displayDate) return '';
    
    const parts = displayDate.split('/');
    if (parts.length !== 3) return '';
    
    const day = parts[0].padStart(2, '0');
    const month = parts[1].padStart(2, '0');
    const year = parts[2];
    
    if (day.length !== 2 || month.length !== 2 || year.length !== 4) return '';
    
    return `${year}-${month}-${day}`;
  };

  // Atualiza o valor de exibição quando o value prop muda
  useEffect(() => {
    setInputValue(formatDateForDisplay(value));
  }, [value]);

  // Atualiza o mês atual quando o valor muda
  useEffect(() => {
    if (value) {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        setCurrentMonth(date);
      }
    }
  }, [value]);

  // Fecha o calendário quando clica fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showCalendar && 
          calendarRef.current && !calendarRef.current.contains(event.target) && 
          inputRef.current && !inputRef.current.contains(event.target)) {
        setShowCalendar(false);
      }
    };

    if (showCalendar) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [showCalendar]);

  // Máscara para o input
  const applyMask = (value) => {
    // Remove tudo que não é número
    const numericValue = value.replace(/\D/g, '');
    
    // Aplica a máscara DD/MM/AAAA
    if (numericValue.length <= 2) {
      return numericValue;
    } else if (numericValue.length <= 4) {
      return `${numericValue.slice(0, 2)}/${numericValue.slice(2)}`;
    } else {
      return `${numericValue.slice(0, 2)}/${numericValue.slice(2, 4)}/${numericValue.slice(4, 8)}`;
    }
  };

  // Valida se a data é válida
  const isValidDate = (dateString) => {
    if (!dateString || dateString.length !== 10) return false;
    
    const parts = dateString.split('/');
    if (parts.length !== 3) return false;
    
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);
    
    if (day < 1 || day > 31 || month < 1 || month > 12 || year < 1900 || year > 2100) {
      return false;
    }
    
    const date = new Date(year, month - 1, day);
    return date.getDate() === day && date.getMonth() === month - 1 && date.getFullYear() === year;
  };

  // Verifica se a data está dentro dos limites
  const isDateInRange = (date) => {
    // Remover verificação de data mínima para permitir datas anteriores
    // if (minDate && date < new Date(minDate)) return false;
    if (maxDate && date > new Date(maxDate)) return false;
    return true;
  };

  const handleInputChange = (e) => {
    const maskedValue = applyMask(e.target.value);
    setInputValue(maskedValue);
    
    // Se a data estiver completa e válida, chama onChange
    if (maskedValue.length === 10 && isValidDate(maskedValue)) {
      const isoDate = formatDateForValue(maskedValue);
      const date = new Date(isoDate);
      
      if (isDateInRange(date)) {
        onChange(isoDate);
      }
    } else if (maskedValue === '') {
      onChange('');
    }
  };

  const handleInputClick = () => {
    setShowCalendar(!showCalendar);
  };

  const handleArrowClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowCalendar(!showCalendar);
    if (!showCalendar) {
      inputRef.current?.focus();
    }
  };

  const handleDateClick = (date) => {
    // Corrigir problema de fuso horário criando uma data local
    const localDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    // Formatar manualmente para evitar problemas de timezone
    const year = localDate.getFullYear();
    const month = (localDate.getMonth() + 1).toString().padStart(2, '0');
    const day = localDate.getDate().toString().padStart(2, '0');
    const isoDate = `${year}-${month}-${day}`;
    
    const displayDate = formatDateForDisplay(isoDate);
    
    setInputValue(displayDate);
    onChange(isoDate);
    setShowCalendar(false);
  };

  // Gera os dias do calendário
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const today = new Date();
    
    // Criar data selecionada de forma consistente
    let selectedDate = null;
    if (value) {
      if (value.includes('-') && value.length === 10) {
        const [year, month, day] = value.split('-');
        selectedDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      } else {
        selectedDate = new Date(value + 'T00:00:00');
      }
    }
    
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      const isCurrentMonth = date.getMonth() === month;
      const isToday = date.toDateString() === today.toDateString();
      
      // Comparar datas de forma mais precisa
      let isSelected = false;
      if (selectedDate && !isNaN(selectedDate.getTime())) {
        isSelected = date.getFullYear() === selectedDate.getFullYear() &&
                    date.getMonth() === selectedDate.getMonth() &&
                    date.getDate() === selectedDate.getDate();
      }
      
      const isDisabled = !isDateInRange(date);
      
      days.push({
        date,
        day: date.getDate(),
        isCurrentMonth,
        isToday,
        isSelected,
        isDisabled
      });
    }
    
    return days;
  };

  const navigateMonth = (direction) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(currentMonth.getMonth() + direction);
    setCurrentMonth(newMonth);
  };

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

    return (
    <div className="date-picker">
      <div className="date-picker-input-container">
        <input
          ref={inputRef}
          type="text"
          id={id}
          value={inputValue}
          onChange={handleInputChange}
          onClick={handleInputClick}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className="date-picker-input"
          maxLength="10"
        />
        <svg 
          className={`date-picker-arrow ${showCalendar ? 'open' : ''}`}
          onClick={handleArrowClick}
          width="12" 
          height="12" 
          viewBox="0 0 12 12"
        >
          <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" fill="none"/>
        </svg>
      </div>
      
      {showCalendar && (
        <div ref={calendarRef} className="date-picker-calendar">
          <div className="calendar-header">
            <button
              type="button"
              className="calendar-nav-btn"
              onClick={() => navigateMonth(-1)}
            >
              ‹
            </button>
            <span className="calendar-month-year">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </span>
            <button
              type="button"
              className="calendar-nav-btn"
              onClick={() => navigateMonth(1)}
            >
              ›
            </button>
          </div>
          
          <div className="calendar-weekdays">
            {weekDays.map(day => (
              <div key={day} className="calendar-weekday">
                {day}
              </div>
            ))}
          </div>
          
          <div className="calendar-days">
            {generateCalendarDays().map((dayObj, index) => (
              <button
                key={index}
                type="button"
                className={`calendar-day ${
                  !dayObj.isCurrentMonth ? 'other-month' : ''
                } ${
                  dayObj.isToday ? 'today' : ''
                } ${
                  dayObj.isSelected ? 'selected' : ''
                } ${
                  dayObj.isDisabled ? 'disabled' : ''
                }`}
                onClick={() => !dayObj.isDisabled && handleDateClick(dayObj.date)}
                disabled={dayObj.isDisabled}
              >
                {dayObj.day}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DatePicker; 