import React from 'react';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { ptBR } from 'date-fns/locale';

interface DatePickerProps {
  label: string;
  value: Date | null;
  onChange: (date: Date | null) => void;
  placeholder?: string;
  minDate?: Date;
  maxDate?: Date;
}

const DatePicker: React.FC<DatePickerProps> = ({
  label,
  value,
  onChange,
  placeholder = 'DD/MM/AAAA',
  minDate,
  maxDate,
}) => {
  return (
    <div className="date-picker">
      <label>{label}</label>
      <ReactDatePicker
        selected={value}
        onChange={onChange}
        dateFormat="dd/MM/yyyy"
        locale={ptBR}
        placeholderText={placeholder}
        className="date-picker-input"
        minDate={minDate}
        maxDate={maxDate}
      />
    </div>
  );
};

export default DatePicker;