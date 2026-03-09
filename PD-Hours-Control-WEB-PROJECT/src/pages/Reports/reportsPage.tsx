import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSquads } from '../../services/squadService';
import { getEmployeesBySquad } from '../../services/employeeService';
import { createReport } from '../../services/reportService';
import type { Squad, Employee } from '../../types';
import { Modal } from '../../components/Modal/Modal';
import { Button } from '../../components/Button/Button';
import './ReportsPage.css';

const ReportsPage: React.FC = () => {
  const navigate = useNavigate();
  const [squads, setSquads] = useState<Squad[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedSquadId, setSelectedSquadId] = useState<number>(0);
  const [modalOpen, setModalOpen] = useState(true);
  
  const [squadSearch, setSquadSearch] = useState('');
  const [isSquadDropdownOpen, setIsSquadDropdownOpen] = useState(false);
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [isEmployeeDropdownOpen, setIsEmployeeDropdownOpen] = useState(false);
  
  const [description, setDescription] = useState('');
  const [employeeId, setEmployeeId] = useState<number>(0);
  const [spentHours, setSpentHours] = useState<number>(0);

  const [errors, setErrors] = useState({
    description: '',
    employeeId: '',
    spentHours: ''
  });
  
  const [touched, setTouched] = useState({
    description: false,
    employeeId: false,
    spentHours: false
  });
  
  const [successMessage, setSuccessMessage] = useState('');

  const squadDropdownRef = useRef<HTMLDivElement>(null);
  const employeeDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (squadDropdownRef.current && !squadDropdownRef.current.contains(event.target as Node)) {
        setIsSquadDropdownOpen(false);
        setSquadSearch('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (employeeDropdownRef.current && !employeeDropdownRef.current.contains(event.target as Node)) {
        setIsEmployeeDropdownOpen(false);
        setEmployeeSearch('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    loadSquads();
  }, []);

  useEffect(() => {
    if (selectedSquadId > 0) {
      loadEmployees(selectedSquadId);
    } else {
      setEmployees([]);
      setEmployeeId(0);
    }
  }, [selectedSquadId]);

  const loadSquads = async () => {
    try {
      const response = await getSquads();
      setSquads(response.data);
    } catch (error) {
      console.error('Erro ao carregar squads:', error);
    }
  };

  const loadEmployees = async (squadId: number) => {
    try {
      setLoading(true);
      const data = await getEmployeesBySquad(squadId);
      setEmployees(data);
    } catch (error) {
      console.error('Erro ao carregar funcionários:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateField = (field: string, value: any): string => {
    switch (field) {
      case 'description':
        if (!value || !value.trim()) return 'Descrição é obrigatória';
        if (value.trim().length > 500) return 'Descrição deve ter no máximo 500 caracteres';
        return '';
      
      case 'employeeId':
        if (!value || value === 0) return 'Selecione um funcionário';
        return '';
      
      case 'spentHours':
        const hours = Number(value);
        if (isNaN(hours) || hours <= 0) return 'Horas devem ser maiores que 0';
        if (hours > 12) return 'Máximo de 12 horas por dia';
        return '';
      
      default:
        return '';
    }
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= 500) {
      setDescription(value);
      if (touched.description) {
        setErrors(prev => ({ ...prev, description: validateField('description', value) }));
      }
    }
  };

  const handleHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    setSpentHours(value);
    if (touched.spentHours) {
      setErrors(prev => ({ ...prev, spentHours: validateField('spentHours', value) }));
    }
  };

  const handleSquadSelect = (squadId: number) => {
    setSelectedSquadId(squadId);
    setEmployeeId(0);
    setErrors({ description: '', employeeId: '', spentHours: '' });
    setTouched({ description: false, employeeId: false, spentHours: false });
    setIsSquadDropdownOpen(false);
    setSquadSearch('');
    setEmployeeSearch('');
  };

  const handleEmployeeSelect = (empId: number) => {
    setEmployeeId(empId);
    setIsEmployeeDropdownOpen(false);
    setEmployeeSearch('');
    if (touched.employeeId) {
      setErrors(prev => ({ ...prev, employeeId: validateField('employeeId', empId) }));
    }
  };

  const handleBlur = (field: keyof typeof touched) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    
    let value: string | number = '';
    
    if (field === 'description') value = description;
    if (field === 'employeeId') value = employeeId;
    if (field === 'spentHours') value = spentHours;

    setErrors(prev => ({
      ...prev,
      [field]: validateField(field, value)
    }));
  };

  const isFormValid = (): boolean => {
    return (
      selectedSquadId > 0 &&
      employeeId > 0 &&
      spentHours > 0 &&
      spentHours <= 12 &&
      description.trim() !== ''
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setTouched({
      description: true,
      employeeId: true,
      spentHours: true
    });

    const descError = validateField('description', description);
    const empError = validateField('employeeId', employeeId);
    const hoursError = validateField('spentHours', spentHours);

    setErrors({
      description: descError,
      employeeId: empError,
      spentHours: hoursError
    });

    if (descError || empError || hoursError) return;

    setSubmitting(true);
    try {
      await createReport({
        description,
        employeeId,
        spentHours
      });
      setSuccessMessage('Horas lançadas com sucesso!');
      
      setTimeout(() => {
        setDescription('');
        setEmployeeId(0);
        setSpentHours(0);
        setSelectedSquadId(0);
        setErrors({ description: '', employeeId: '', spentHours: '' });
        setTouched({ description: false, employeeId: false, spentHours: false });
        setSuccessMessage('');
        setModalOpen(false);
        navigate('/squads');
      }, 1500);
      
    } catch (error) {
      console.error('Erro ao lançar horas:', error);
      setErrors(prev => ({ ...prev, description: 'Erro ao lançar horas. Tente novamente.' }));
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    navigate('/squads');
  };

  const selectedEmployee = employees.find(e => e.id === employeeId);
  const selectedSquad = squads.find(s => s.id === selectedSquadId);
  
  const filteredSquads = squads.filter(squad =>
    squad.name.toLowerCase().includes(squadSearch.toLowerCase())
  );

  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(employeeSearch.toLowerCase())
  );

  return (
    <Modal isOpen={modalOpen} onClose={handleCloseModal} title="Lançar Horas">
      {successMessage && (
        <div className="success-message">
          {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="modal-form" noValidate>
        <div className="form-group">
          <label htmlFor="squadId">
            SQUAD <span className="required">*</span>
          </label>
          <div 
            className="custom-select" 
            ref={squadDropdownRef}
          >
            <div 
              className={`select-display ${!selectedSquadId ? 'placeholder' : ''}`}
              onClick={() => setIsSquadDropdownOpen(!isSquadDropdownOpen)}
            >
              <span className="select-value">
                {selectedSquad?.name || 'Selecione uma squad'}
              </span>
              <span className="select-arrow">▼</span>
            </div>

            {isSquadDropdownOpen && (
              <div className="select-dropdown">
                <input
                  type="text"
                  className="select-search"
                  placeholder="Buscar squad..."
                  value={squadSearch}
                  onChange={(e) => setSquadSearch(e.target.value)}
                  autoFocus
                />
                <div className="select-options">
                  {filteredSquads.length > 0 ? (
                    filteredSquads.map(squad => (
                      <div
                        key={squad.id}
                        className={`select-item ${selectedSquadId === squad.id ? 'selected' : ''}`}
                        onClick={() => handleSquadSelect(squad.id)}
                        title={squad.name}
                      >
                        {squad.name}
                      </div>
                    ))
                  ) : (
                    <div className="select-empty">
                      Nenhuma squad encontrada
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="employeeId">
            FUNCIONÁRIO <span className="required">*</span>
          </label>
          {selectedSquadId ? (
            <div 
              className="custom-select" 
              ref={employeeDropdownRef} 
            >
              <div 
                className={`select-display ${!employeeId ? 'placeholder' : ''} ${touched.employeeId && errors.employeeId ? 'error' : ''}`}
                onClick={() => setIsEmployeeDropdownOpen(!isEmployeeDropdownOpen)}
              >
                <span className="select-value">
                  {selectedEmployee 
                    ? `${selectedEmployee.name} (${selectedEmployee.estimatedHours}h/dia)` 
                    : 'Selecione um funcionário'}
                </span>
                <span className="select-arrow">▼</span>
              </div>

              {isEmployeeDropdownOpen && (
                <div className="select-dropdown">
                  <input
                    type="text"
                    className="select-search"
                    placeholder="Buscar funcionário..."
                    value={employeeSearch}
                    onChange={(e) => setEmployeeSearch(e.target.value)}
                    autoFocus
                  />
                  <div className="select-options">
                    {loading ? (
                      <div className="select-empty">Carregando...</div>
                    ) : filteredEmployees.length > 0 ? (
                      filteredEmployees.map(emp => (
                        <div
                          key={emp.id}
                          className={`select-item ${employeeId === emp.id ? 'selected' : ''}`}
                          onClick={() => handleEmployeeSelect(emp.id)}
                          title={`${emp.name} (${emp.estimatedHours}h/dia)`}
                        >
                          {emp.name} ({emp.estimatedHours}h/dia)
                        </div>
                      ))
                    ) : (
                      <div className="select-empty">
                        {employeeSearch 
                          ? 'Nenhum funcionário encontrado' 
                          : 'Nenhum funcionário nesta squad'}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="select-disabled-message">
              Selecione uma squad primeiro
            </div>
          )}
          {touched.employeeId && errors.employeeId && (
            <span className="field-error">{errors.employeeId}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="spentHours">
            HORAS TRABALHADAS <span className="required">*</span>
          </label>
          <input
            type="number"
            id="spentHours"
            value={spentHours || ''}
            onChange={handleHoursChange}
            onBlur={() => handleBlur('spentHours')}
            placeholder="0"
            min="1"
            max="12"
            step="1"
            className={touched.spentHours && errors.spentHours ? 'input-error' : ''}
            disabled={submitting}
          />
          {touched.spentHours && errors.spentHours && (
            <span className="field-error">{errors.spentHours}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="description">
            DESCRIÇÃO DO TRABALHO <span className="required">*</span>
          </label>
          <textarea
            id="description"
            value={description}
            onChange={handleDescriptionChange}
            onBlur={() => handleBlur('description')}
            placeholder="Descreva o que foi feito..."
            rows={4}
            maxLength={500}
            className={touched.description && errors.description ? 'input-error' : ''}
            disabled={submitting}
          />
          {touched.description && errors.description && (
            <span className="field-error">{errors.description}</span>
          )}
          <div className="input-footer">
            <span className="char-counter">{description.length}/500</span>
          </div>
        </div>

        <div className="modal-actions">
          <Button 
            type="button" 
            variant="secondary"
            onClick={handleCloseModal}
            disabled={submitting}
          >
            Cancelar
          </Button>
          <Button 
            type="submit" 
            variant="primary"
            disabled={submitting || !isFormValid()}
          >
            {submitting ? 'Lançando...' : 'Lançar horas'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ReportsPage;