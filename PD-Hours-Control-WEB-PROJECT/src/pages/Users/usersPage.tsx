import React from 'react';
import { useUsersPage } from './hooks/useUsersPage';
import { Table } from '@/components/Table/Table';
import { Modal } from '@/components/Modal/Modal';
import { FiltersContainer } from '@/components/Filters/FiltersContainer';
import { FilterSelect } from '@/components/Filters/FilterSelect';
import { SearchInput } from '@/components/Filters/SearchInput';
import { ClearButton } from '@/components/Filters/ClearButton';
import { Button } from '@/components/Button/Button';
import { ErrorBanner } from '@/components/ErrorBanner/ErrorBanner';
import type { Employee } from '@/types';
import './Users.css';

const UsersPage: React.FC = () => {
  const {
    filteredUsers, squads, loading, loadError,
    selectedSquadId, searchTerm, setSelectedSquadId, setSearchTerm, clearFilters,
    modalOpen, handleOpenModal, handleCloseModal,
    formData, errors, touched, submitting, submitError, setSubmitError,
    isFormValid, handleNameChange, handleHoursChange, handleBlur, handleSquadSelect, handleSubmit,
    squadSearch, setSquadSearch, isSquadDropdownOpen, setIsSquadDropdownOpen,
    filteredSquads, selectedSquad, squadDropdownRef,
    getSquadName, loadData,
  } = useUsersPage();

  const columns = [
    {
      header: 'NOME',
      key: 'name',
      render: (user: Employee) => <span className="user-name">{user.name}</span>,
    },
    {
      header: 'HORAS/DIA',
      key: 'estimatedHours',
      render: (user: Employee) => <span className="hours-value">{user.estimatedHours}h</span>,
    },
    {
      header: 'SQUAD',
      key: 'squadId',
      render: (user: Employee) => (
        <span className="squad-name">{getSquadName(user.squadId)}</span>
      ),
    },
  ];

  if (loading) return <div className="loading">Carregando usuários...</div>;

  if (loadError) return (
    <div className="error-state">
      <p>{loadError}</p>
      <Button variant="secondary" onClick={loadData}>Tentar novamente</Button>
    </div>
  );

  const squadOptions = squads.map(s => ({ id: s.id, name: s.name }));
  const hasActiveFilters = selectedSquadId !== 'all' || searchTerm !== '';

  return (
    <div className="users-page">
      <div className="page-header">
        <h1>Usuários</h1>
        <Button variant="primary" onClick={handleOpenModal}>+ Novo Usuário</Button>
      </div>

      <FiltersContainer>
        <FilterSelect
          label="FILTRAR POR SQUAD"
          options={squadOptions}
          value={selectedSquadId}
          onChange={v => setSelectedSquadId(v as number | 'all')}
          placeholder="Selecione uma squad"
          allOptionText="Todas as squads"
          showAllOption
        />
        
        <SearchInput
          label="BUSCAR USUÁRIO"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="Buscar por nome..."
        />
        <ClearButton visible={hasActiveFilters} onClick={clearFilters} />
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
          <Button variant="primary" onClick={handleOpenModal}>
            {selectedSquadId !== 'all' ? 'Adicionar usuário' : 'Criar primeiro usuário'}
          </Button>
        </div>
      ) : (
        <div className="users-section">
          <h2>Lista de Usuários</h2>
          <Table<Employee> columns={columns} data={filteredUsers} />
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={handleCloseModal} title="Novo Usuário">
        <form onSubmit={handleSubmit} className="modal-form" noValidate>
        {submitError && (<ErrorBanner message={submitError} onClose={() => setSubmitError(null)} />)}

          <div className="form-group">
            <label htmlFor="name">NOME DO USUÁRIO <span className="required">*</span></label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={e => handleNameChange(e.target.value)}
              onBlur={() => handleBlur('name')}
              placeholder="Digite o nome completo"
              maxLength={100}
              className={touched.name && errors.name ? 'input-error' : ''}
              disabled={submitting}
              autoFocus
            />
            {touched.name && errors.name && <span className="field-error">{errors.name}</span>}
            <div className="input-footer">
              <span className="char-counter">{formData.name.length}/100</span>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="estimatedHours">HORAS/DIA <span className="required">*</span></label>
            <input
              type="number"
              id="estimatedHours"
              value={formData.estimatedHours || ''}
              onChange={e => handleHoursChange(Number(e.target.value))}
              onBlur={() => handleBlur('estimatedHours')}
              placeholder="0"
              min="1" max="12" step="1"
              className={touched.estimatedHours && errors.estimatedHours ? 'input-error' : ''}
              disabled={submitting}
            />
            {touched.estimatedHours && errors.estimatedHours && (
              <span className="field-error">{errors.estimatedHours}</span>
            )}
          </div>

          <div className="form-group">
            <label>SQUAD <span className="required">*</span></label>
            <div className="custom-select" ref={squadDropdownRef}>
              <div
                className={`select-display ${!selectedSquad ? 'placeholder' : ''} ${touched.squadId && errors.squadId ? 'error' : ''}`}
                onClick={() => setIsSquadDropdownOpen(!isSquadDropdownOpen)}
              >
                <span className="select-value">{selectedSquad?.name || 'Selecione uma squad'}</span>
                <span className="select-arrow">▼</span>
              </div>

              {isSquadDropdownOpen && (
                <div className="select-dropdown">
                  <input
                    type="text"
                    className="select-search"
                    placeholder="Buscar squad..."
                    value={squadSearch}
                    onChange={e => setSquadSearch(e.target.value)}
                    autoFocus
                  />
                  <div className="select-options">
                    {filteredSquads.length > 0
                      ? filteredSquads.map(squad => (
                          <div
                            key={squad.id}
                            className={`select-item ${formData.squadId === squad.id ? 'selected' : ''}`}
                            onClick={() => handleSquadSelect(squad.id)} 
                          >
                            {squad.name}
                          </div>
                        ))
                      : <div className="select-empty">Nenhuma squad encontrada</div>}
                  </div>
                </div>
              )}
            </div>
            {touched.squadId && errors.squadId && (
              <span className="field-error">{errors.squadId}</span>
            )}
          </div>

          <div className="modal-actions">
            <Button type="button" variant="secondary" onClick={handleCloseModal} disabled={submitting}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" disabled={submitting || !isFormValid}>
              {submitting ? 'Criando...' : 'Criar usuário'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default UsersPage;