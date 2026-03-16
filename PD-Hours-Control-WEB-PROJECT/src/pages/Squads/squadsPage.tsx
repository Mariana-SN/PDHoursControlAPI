import { Link } from 'react-router-dom';
import { useSquadsPage } from './hooks/useSquadsPage';
import { Modal } from '@/components/Modal/Modal';
import { Button } from '@/components/Button/Button';
import { ErrorBanner } from '@/components/ErrorBanner/ErrorBanner';
import './Squads.css';

const SquadsPage = () => {
  const {
    squads, loading, loadError,  modalOpen, handleOpenModal, handleCloseModal,
    squadName, fieldError,  touched, submitting, submitError, setSubmitError,
    isFormValid,  handleNameChange, handleBlur, handleSubmit, loadSquads,
  } = useSquadsPage();

  if (loading) return <div className="loading">Carregando...</div>;

  if (loadError) return (
    <div className="error-state">
      <p>{loadError}</p>
      <Button variant="secondary" onClick={loadSquads}>Tentar novamente</Button>
    </div>
  );

  return (
    <div className="squads-page">
      <div className="page-header">
        <h1>Squads</h1>
        <Button variant="primary" onClick={handleOpenModal}>+ Nova Squad</Button>
      </div>

      {squads.length === 0 ? (
        <div className="empty-state">
          <p>Nenhuma squad cadastrada</p>
          <Button variant="primary" onClick={handleOpenModal}>
            Criar primeira squad
          </Button>
        </div>
      ) : (
        <div className="squad-grid">
          {squads.map(squad => (
            <div key={squad.id} className="squad-card">
              <h3>{squad.name}</h3>
              <div className="card-actions">
                <Link
                  to={`/squad/${squad.id}/report`}
                  className="btn btn-primary btn-small"
                >
                  Ver relatório
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
 
      <Modal isOpen={modalOpen} onClose={handleCloseModal} title="Criar Nova Squad">
        <form onSubmit={handleSubmit} className="modal-form" noValidate>

          {submitError && (
            <ErrorBanner message={submitError} onClose={() => setSubmitError(null)} />
          )}

          <div className="form-group">
            <label htmlFor="squadName">
              NOME DA SQUAD <span className="required">*</span>
            </label>
            <input
              type="text"
              id="squadName"
              value={squadName}
              onChange={e => handleNameChange(e.target.value)}
              onBlur={handleBlur}
              placeholder="Digite o nome da squad"
              maxLength={100}
              className={touched && fieldError ? 'input-error' : ''}
              disabled={submitting}
              autoFocus
            />
            {touched && fieldError && (
              <span className="field-error">{fieldError}</span>
            )}
            <div className="input-footer">
              <span className="char-counter">{squadName.length}/100</span>
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
              disabled={submitting || !isFormValid}
            >
              {submitting ? 'Criando...' : 'Criar squad'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SquadsPage;