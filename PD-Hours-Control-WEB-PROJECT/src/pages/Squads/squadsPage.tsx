import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getSquads, createSquad } from '../../services/squadService';
import type { Squad } from '../../types';
import { Modal } from '../../components/Modal/Modal';
import { Button } from '../../components/Button/Button';
import './Squads.css';

const SquadsPage: React.FC = () => {
  const [squads, setSquads] = useState<Squad[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [newSquadName, setNewSquadName] = useState('');
  const [error, setError] = useState('');
  const [touched, setTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadSquads();
  }, []);

  const loadSquads = async () => {
    try {
      const response = await getSquads();
      setSquads(response.data);
    } catch (error) {
      console.error('Erro ao carregar squads:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateName = (name: string): string => {
    if (!name.trim()) {
      return 'Nome é obrigatório';
    }
    if (name.trim().length > 100) {
      return 'Nome deve ter no máximo 100 caracteres';
    }
    return '';
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= 100) {
      setNewSquadName(value);
      if (touched) {
        setError(validateName(value));
      }
    }
  };

  const handleBlur = () => {
    setTouched(true);
    setError(validateName(newSquadName));
  };

  const isValid = (): boolean => {
    return newSquadName.trim() !== '' && newSquadName.length <= 100;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setTouched(true);
    const validationError = validateName(newSquadName);
    setError(validationError);
    
    if (validationError) return;
    
    setSubmitting(true);
    try {
      await createSquad({ name: newSquadName.trim() });
      
      setNewSquadName('');
      setError('');
      setTouched(false);
      setModalOpen(false);
      
      loadSquads();
    } catch (error) {
      console.error('Erro ao criar squad:', error);
      setError('Erro ao criar squad. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setNewSquadName('');
    setError('');
    setTouched(false);
  };

  if (loading) return <div className="loading">Carregando...</div>;

  return (
    <div className="squads-page">
      <div className="page-header">
        <h1>Squads</h1>
        <Button 
          variant="primary" 
          onClick={() => setModalOpen(true)}
        >
          + Nova Squad
        </Button>
      </div>

      {squads.length === 0 ? (
        <div className="empty-state">
          <p>Nenhuma squad cadastrada</p>
          <Button 
            variant="primary" 
            onClick={() => setModalOpen(true)}
          >
            Criar primeira squad
          </Button>
        </div>
      ) : (
        <div className="squad-grid">
          {squads.map((squad) => (
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

      {/* Modal de Criação */}
      <Modal isOpen={modalOpen} onClose={handleCloseModal} title="Criar Nova Squad">
        <form onSubmit={handleSubmit} className="modal-form" noValidate>
          <div className="form-group">
            <label htmlFor="squadName">
              NOME DA SQUAD <span className="required">*</span>
            </label>
            <input
              type="text"
              id="squadName"
              value={newSquadName}
              onChange={handleNameChange}
              onBlur={handleBlur}
              placeholder="Digite o nome da squad"
              maxLength={100}
              className={touched && error ? 'input-error' : ''}
              disabled={submitting}
              autoFocus
            />
            {touched && error && (
              <span className="field-error">{error}</span>
            )}
            <div className="input-footer">
              <span className="char-counter">{newSquadName.length}/100</span>
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
              disabled={submitting || !isValid()}
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