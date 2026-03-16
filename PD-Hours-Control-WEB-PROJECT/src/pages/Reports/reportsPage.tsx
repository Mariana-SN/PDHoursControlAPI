import { useReportsPage } from './hooks/useReportsPage';
import { Modal } from '@/components/Modal/Modal';
import { Button } from '@/components/Button/Button';
import { ErrorBanner } from '@/components/ErrorBanner/ErrorBanner';
import './ReportsPage.css';

const ReportsPage = () => {
  const {
    loading, loadError,
    modalOpen, handleCloseModal,
    selectedSquadId,
    formData, errors, touched, submitting,
    submitError, setSubmitError,
    successMessage, isFormValid,
    handleDescriptionChange, handleHoursChange,
    handleSquadSelect, handleEmployeeSelect,
    handleBlur, handleSubmit,
    squadSearch, setSquadSearch,
    isSquadDropdownOpen, setIsSquadDropdownOpen,
    employeeSearch, setEmployeeSearch,
    isEmployeeDropdownOpen, setIsEmployeeDropdownOpen,
    filteredSquads, filteredEmployees,
    selectedSquad, selectedEmployee,
    squadDropdownRef, employeeDropdownRef,
  } = useReportsPage();

  return (
    <Modal isOpen={modalOpen} onClose={handleCloseModal} title="Lançar Horas">
      {successMessage && (
        <div className="success-message">{successMessage}</div>
      )}

      {submitError && (
        <ErrorBanner message={submitError} onClose={() => setSubmitError(null)} />
      )}

      {loadError && (
        <ErrorBanner message={loadError} />
      )}

      <form onSubmit={handleSubmit} className="modal-form" noValidate>
        <div className="form-group">
          <label>SQUAD <span className="required">*</span></label>
          <div className="custom-select" ref={squadDropdownRef}>
            <div
              className={`select-display ${!selectedSquadId ? 'placeholder' : ''}`}
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
                          className={`select-item ${selectedSquadId === squad.id ? 'selected' : ''}`}
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
        </div>

        <div className="form-group">
          <label>FUNCIONÁRIO <span className="required">*</span></label>
          {selectedSquadId ? (
            <div className="custom-select" ref={employeeDropdownRef}>
              <div
                className={`select-display ${!formData.employeeId ? 'placeholder' : ''} ${touched.employeeId && errors.employeeId ? 'error' : ''}`}
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
                    onChange={e => setEmployeeSearch(e.target.value)}
                    autoFocus
                  />
                  <div className="select-options">
                    {loading
                      ? <div className="select-empty">Carregando...</div>
                      : filteredEmployees.length > 0
                      ? filteredEmployees.map(emp => (
                          <div
                            key={emp.id}
                            className={`select-item ${formData.employeeId === emp.id ? 'selected' : ''}`}
                            onClick={() => handleEmployeeSelect(emp.id)}
                          >
                            {emp.name} ({emp.estimatedHours}h/dia)
                          </div>
                        ))
                      : <div className="select-empty">
                          {employeeSearch ? 'Nenhum funcionário encontrado' : 'Nenhum funcionário nesta squad'}
                        </div>}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="select-disabled-message">Selecione uma squad primeiro</div>
          )}
          {touched.employeeId && errors.employeeId && (
            <span className="field-error">{errors.employeeId}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="spentHours">HORAS TRABALHADAS <span className="required">*</span></label>
          <input
            type="number"
            id="spentHours"
            value={formData.spentHours || ''}
            onChange={e => handleHoursChange(Number(e.target.value))}
            onBlur={() => handleBlur('spentHours')}
            placeholder="0"
            min="1" max="12" step="1"
            className={touched.spentHours && errors.spentHours ? 'input-error' : ''}
            disabled={submitting}
          />
          {touched.spentHours && errors.spentHours && (
            <span className="field-error">{errors.spentHours}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="description">DESCRIÇÃO DO TRABALHO <span className="required">*</span></label>
          <textarea
            id="description"
            value={formData.description}
            onChange={e => handleDescriptionChange(e.target.value)}
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
            <span className="char-counter">{formData.description.length}/500</span>
          </div>
        </div>

        <div className="modal-actions">
          <Button type="button" variant="secondary" onClick={handleCloseModal} disabled={submitting}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={submitting || !isFormValid}>
            {submitting ? 'Lançando...' : 'Lançar horas'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ReportsPage;