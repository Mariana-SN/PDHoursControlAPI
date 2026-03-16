import { useEffect, useState } from 'react';
import { getSquads, createSquad } from '@/services/squadService';
import type { Squad } from '@/types';

export const useSquadsPage = () => {
  const [squads, setSquads] = useState<Squad[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const [modalOpen, setModalOpen] = useState<boolean>(false);

  const [squadName, setSquadName] = useState<string>('');
  const [fieldError, setFieldError] = useState<string>('');
  const [touched, setTouched] = useState<boolean>(false);

  useEffect(() => {
    loadSquads();
  }, []);

  const loadSquads = async (): Promise<void> => {
    try {
      setLoading(true);
      setLoadError(null);
      const response = await getSquads();
      setSquads(response.data);
    } catch (error) {
      console.error('Erro ao carregar squads:', error);
      setLoadError('Não foi possível carregar as squads. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const validateName = (name: string): string => {
    if (!name.trim()) return 'Nome é obrigatório';
    if (name.trim().length > 100) return 'Nome deve ter no máximo 100 caracteres';
    return '';
  };

  const isFormValid: boolean =
    squadName.trim() !== '' && squadName.length <= 100;

  const handleNameChange = (value: string): void => {
    if (value.length > 100) return;
    setSquadName(value);
    if (touched) setFieldError(validateName(value));
  };

  const handleBlur = (): void => {
    setTouched(true);
    setFieldError(validateName(squadName));
  };

  const resetForm = (): void => {
    setSquadName('');
    setFieldError('');
    setTouched(false);
    setSubmitError(null);
  };

  const handleOpenModal = (): void => setModalOpen(true);

  const handleCloseModal = (): void => {
    setModalOpen(false);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setSubmitError(null);
    setTouched(true);

    const validationError = validateName(squadName);
    setFieldError(validationError);
    if (validationError) return;

    setSubmitting(true);
    try {
      await createSquad({ name: squadName.trim() });
      handleCloseModal();
      await loadSquads();
    } catch (error) {
      console.error('Erro ao criar squad:', error);
      setSubmitError('Não foi possível criar a squad. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  return {
    squads, loading, loadError,

    modalOpen, handleOpenModal, handleCloseModal,

    squadName, fieldError, touched, submitting, submitError, setSubmitError,
    isFormValid, handleNameChange, handleBlur, handleSubmit,

    loadSquads,
  };
};