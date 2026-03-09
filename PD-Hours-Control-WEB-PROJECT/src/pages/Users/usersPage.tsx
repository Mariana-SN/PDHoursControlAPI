import React, { useEffect, useState, useRef } from 'react';
import { getEmployees } from '../../services/employeeService';
import { getSquads } from '../../services/squadService';
import { createEmployee } from '../../services/employeeService';
import type { Employee, Squad, EmployeeCreate } from '../../types';
import { Table } from '../../components/Table/Table';
import { Modal } from '../../components/Modal/Modal';
import { FiltersContainer } from '../../components/Filters/FiltersContainer';
import { FilterSelect } from '../../components/Filters/FilterSelect';
import { SearchInput } from '../../components/Filters/SearchInput';
import { ClearButton } from '../../components/Filters/ClearButton';
import { Button } from '../../components/Button/Button';
import './Users.css';

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<Employee[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<Employee[]>([]);
  const [squads, setSquads] = useState<Squad[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSquadId, setSelectedSquadId] = useState<number | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const [formData, setFormData] = useState<EmployeeCreate>({
    name: '',
    estimatedHours: 0,
    squadId: 0
  });
  
  const [errors, setErrors] = useState({
    name: '',
    estimatedHours: '',
    squadId: ''
  });
  
  const [touched, setTouched] = useState({
    name: false,
    estimatedHours: false,
    squadId: false
  });
  
  const [submitting, setSubmitting] = useState(false);
  
  const [squadSearch, setSquadSearch] = useState('');
  const [isSquadDropdownOpen, setIsSquadDropdownOpen] = useState(false);
  
  const squadDropdownRef = useRef<HTMLDivElement>(null);

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
    loadData();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [selectedSquadId, users, searchTerm]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [usersResponse, squadsResponse] = await Promise.all([
        getEmployees(),
        getSquads()
      ]);
      
      setUsers(usersResponse);
      setFilteredUsers(usersResponse);
      setSquads(squadsResponse.data);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    if (selectedSquadId !== 'all') {
      filtered = filtered.filter(user => user.squadId === selectedSquadId);
    }

    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(user => 
        user.name.toLowerCase().includes(term)
      );
    }

    setFilteredUsers(filtered);
  };

  const handleSquadChange = (value: number | string | 'all') => {
    setSelectedSquadId(value as number | 'all');
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const clearFilters = () => {
    setSelectedSquadId('all');
    setSearchTerm('');
  };

  const getSquadName = (squadId: number): string => {
    const squad = squads.find(s => s.id === squadId);
    return squad?.name || `Squad #${squadId}`;
  };

  const validateField = (field: string, value: any): string => {
    switch (field) {
      case 'name':
        if (!value || !value.trim()) return 'Nome é obrigatório';
        if (value.trim().length > 100) return 'Nome deve ter no máximo 100 caracteres';
        return '';
      
      case 'estimatedHours':
        const hours = Number(value);
        if (isNaN(hours) || hours <= 0) return 'Mínimo de 1 hora por dia';
        if (hours < 1) return 'Mínimo de 1 hora por dia';
        if (hours > 12) return 'Máximo de 12 horas por dia';
        return '';
      
      case 'squadId':
        if (!value || value === 0) return 'Selecione uma squad';
        return '';
      
      default:
        return '';
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= 100) {
      setFormData(prev => ({ ...prev, name: value }));
      if (touched.name) {
        setErrors(prev => ({ ...prev, name: validateField('name', value) }));
      }
    }
  };

  const handleHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    setFormData(prev => ({ ...prev, estimatedHours: value }));
    if (touched.estimatedHours) {
      setErrors(prev => ({ ...prev, estimatedHours: validateField('estimatedHours', value) }));
    }
  };

  const handleSquadSelect = (squadId: number) => {
    setFormData(prev => ({ ...prev, squadId }));
    setIsSquadDropdownOpen(false);
    setSquadSearch('');
    if (touched.squadId) {
      setErrors(prev => ({ ...prev, squadId: validateField('squadId', squadId) }));
    }
  };

  const handleBlur = (field: keyof typeof touched) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    
    let value: string | number = '';
    
    if (field === 'name') value = formData.name;
    if (field === 'estimatedHours') value = formData.estimatedHours;
    if (field === 'squadId') value = formData.squadId;

    setErrors(prev => ({
      ...prev,
      [field]: validateField(field, value)
    }));
  };

  const isFormValid = (): boolean => {
    return (
      formData.name.trim() !== '' &&
      formData.name.length <= 100 &&
      formData.estimatedHours >= 1 &&
      formData.estimatedHours <= 12 &&
      formData.squadId > 0
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setTouched({
      name: true,
      estimatedHours: true,
      squadId: true
    });

    const nameError = validateField('name', formData.name);
    const hoursError = validateField('estimatedHours', formData.estimatedHours);
    const squadError = validateField('squadId', formData.squadId);

    setErrors({
      name: nameError,
      estimatedHours: hoursError,
      squadId: squadError
    });

    if (nameError || hoursError || squadError) return;

    setSubmitting(true);
    try {
      await createEmployee({
        name: formData.name.trim(),
        estimatedHours: formData.estimatedHours,
        squadId: formData.squadId
      });
      
      setFormData({ name: '', estimatedHours: 0, squadId: 0 });
      setErrors({ name: '', estimatedHours: '', squadId: '' });
      setTouched({ name: false, estimatedHours: false, squadId: false });
      setModalOpen(false);
      
      loadData();
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      setErrors(prev => ({ ...prev, name: 'Erro ao criar usuário. Tente novamente.' }));
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setFormData({ name: '', estimatedHours: 0, squadId: 0 });
    setErrors({ name: '', estimatedHours: '', squadId: '' });
    setTouched({ name: false, estimatedHours: false, squadId: false });
    setSquadSearch('');
    setIsSquadDropdownOpen(false);
  };

  const squadOptions = squads.map(squad => ({
    id: squad.id,
    name: squad.name
  }));

  const filteredSquads = squads.filter(squad =>
    squad.name.toLowerCase().includes(squadSearch.toLowerCase())
  );

  const selectedSquad = squads.find(s => s.id === formData.squadId);

  const columns = [
    {
      header: 'NOME',
      key: 'name',
      render: (user: Employee) => (
        <span className="user-name">{user.name}</span>
      )
    },
    {
      header: 'HORAS/DIA',
      key: 'estimatedHours',
      render: (user: Employee) => (
        <span className="hours-value">{user.estimatedHours}h</span>
      )
    },
    {
      header: 'SQUAD',
      key: 'squadId',
      render: (user: Employee) => (
        <div className="squad-info">
          <span className="squad-name">{getSquadName(user.squadId)}</span>
        </div>
      )
    }
  ];

  if (loading) return <div className="loading">Carregando usuários...</div>;

  return (
    <div className="users-page">
      <div className="page-header">
        <h1>Usuários</h1>
        <Button 
          variant="primary" 
          onClick={() => setModalOpen(true)}
        >
          + Novo Usuário
        </Button>
      </div>

      <FiltersContainer>
        <FilterSelect
          label="FILTRAR POR SQUAD"
          options={squadOptions}
          value={selectedSquadId}
          onChange={handleSquadChange}
          placeholder="Selecione uma squad"
          allOptionText="Todas as squads"
          showAllOption={true}
        />

        <SearchInput
          label="BUSCAR USUÁRIO"
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Buscar por nome..."
        />

        <ClearButton
          visible={selectedSquadId !== 'all' || searchTerm !== ''}
          onClick={clearFilters}
        />
      </FiltersContainer>

      {filteredUsers.length === 0 ? (
        <div className="empty-state">
          <h3>Nenhum usuário encontrado</h3>
          <p>
            {searchTerm 
              ? `Nenhum resultado para "${searchTerm}"` 
              : selectedSquadId !== 'all' 
                ? 'Esta squad ainda não tem usuários cadastrados.' 
                : 'Comece cadastrando o primeiro usuário.'}
          </p>
          <Button 
            variant="primary" 
            onClick={() => setModalOpen(true)}
          >
            {selectedSquadId !== 'all' ? 'Adicionar usuário' : 'Criar primeiro usuário'}
          </Button>
        </div>
      ) : (
        <div className="users-section">
          <h2>Lista de Usuários</h2>
          <Table<Employee>
            columns={columns}
            data={filteredUsers}
          />
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={handleCloseModal} title="Novo Usuário">
        <form onSubmit={handleSubmit} className="modal-form" noValidate>
          <div className="form-group">
            <label htmlFor="name">
              NOME DO USUÁRIO <span className="required">*</span>
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={handleNameChange}
              onBlur={() => handleBlur('name')}
              placeholder="Digite o nome completo"
              maxLength={100}
              className={touched.name && errors.name ? 'input-error' : ''}
              disabled={submitting}
              autoFocus
            />
            {touched.name && errors.name && (
              <span className="field-error">{errors.name}</span>
            )}
            <div className="input-footer">
              <span className="char-counter">{formData.name.length}/100</span>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="estimatedHours">
              HORAS/DIA <span className="required">*</span>
            </label>
            <input
              type="number"
              id="estimatedHours"
              value={formData.estimatedHours || ''}
              onChange={handleHoursChange}
              onBlur={() => handleBlur('estimatedHours')}
              placeholder="0"
              min="1"
              max="12"
              step="1"
              className={touched.estimatedHours && errors.estimatedHours ? 'input-error' : ''}
              disabled={submitting}
            />
            {touched.estimatedHours && errors.estimatedHours && (
              <span className="field-error">{errors.estimatedHours}</span>
            )}
          </div>

       
          <div className="form-group">
            <label htmlFor="squadId">
              SQUAD <span className="required">*</span>
            </label>
            <div 
              className="custom-select" 
              ref={squadDropdownRef}
            >
              <div 
                className={`select-display ${!selectedSquad ? 'placeholder' : ''} ${touched.squadId && errors.squadId ? 'error' : ''}`}
                onClick={() => setIsSquadDropdownOpen(!isSquadDropdownOpen)}
              >
                <span className="select-value" title={selectedSquad?.name}>
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
                          className={`select-item ${formData.squadId === squad.id ? 'selected' : ''}`}
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
            {touched.squadId && errors.squadId && (
              <span className="field-error">{errors.squadId}</span>
            )}
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
              {submitting ? 'Criando...' : 'Criar usuário'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default UsersPage;