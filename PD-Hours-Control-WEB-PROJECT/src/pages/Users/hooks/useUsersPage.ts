import { useEffect, useState, useRef } from 'react';
import { getEmployees, createEmployee } from '@/services/employeeService';
import { getSquads } from '@/services/squadService';
import type { Employee, Squad, EmployeeCreate } from '@/types';

const INITIAL_FORM: EmployeeCreate = { name: '', estimatedHours: 0, squadId: 0 };

const INITIAL_ERRORS: Record<keyof EmployeeCreate, string> = {
  name: '',
  estimatedHours: '',
  squadId: '',
};

const INITIAL_TOUCHED: Record<keyof EmployeeCreate, boolean> = {
  name: false,
  estimatedHours: false,
  squadId: false,
};

export const useUsersPage = () => {
  const [users, setUsers] = useState<Employee[]>([]);
  const [squads, setSquads] = useState<Squad[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const [selectedSquadId, setSelectedSquadId] = useState<number | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [formData, setFormData] = useState<EmployeeCreate>(INITIAL_FORM);
  const [errors, setErrors] = useState<Record<keyof EmployeeCreate, string>>(INITIAL_ERRORS);
  const [touched, setTouched] = useState<Record<keyof EmployeeCreate, boolean>>(INITIAL_TOUCHED);

  const [squadSearch, setSquadSearch] = useState<string>('');
  const [isSquadDropdownOpen, setIsSquadDropdownOpen] = useState<boolean>(false);
  const squadDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        squadDropdownRef.current &&
        !squadDropdownRef.current.contains(e.target as Node)
      ) {
        setIsSquadDropdownOpen(false);
        setSquadSearch('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadData = async (): Promise<void> => {
    try {
      setLoading(true);
      setLoadError(null);
      const [usersRes, squadsRes] = await Promise.all([
        getEmployees(),
        getSquads(),
      ]);
      setUsers(usersRes);
      setSquads(squadsRes.data);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setLoadError('Não foi possível carregar os dados. Verifique sua conexão e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers: Employee[] = users.filter((user: Employee) => {
    const matchSquad = selectedSquadId === 'all' || user.squadId === selectedSquadId;
    const matchSearch = user.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase().trim());
    return matchSquad && matchSearch;
  });

  const clearFilters = (): void => {
    setSelectedSquadId('all');
    setSearchTerm('');
  };

  const validateField = (
    field: keyof EmployeeCreate,
    value: string | number
  ): string => {
    switch (field) {
      case 'name':
        if (!String(value).trim()) return 'Nome é obrigatório';
        if (String(value).trim().length > 100) return 'Nome deve ter no máximo 100 caracteres';
        return '';
      case 'estimatedHours':
        if (Number(value) < 1) return 'Mínimo de 1 hora por dia';
        if (Number(value) > 12) return 'Máximo de 12 horas por dia';
        return '';
      case 'squadId':
        if (!value || value === 0) return 'Selecione uma squad';
        return '';
      default:
        return '';
    }
  };

  const isFormValid: boolean =
    !validateField('name', formData.name) &&
    !validateField('estimatedHours', formData.estimatedHours) &&
    !validateField('squadId', formData.squadId);

  const handleBlur = (field: keyof EmployeeCreate): void => {
    setTouched((prev: Record<keyof EmployeeCreate, boolean>) => ({
      ...prev,
      [field]: true,
    }));
    setErrors((prev: Record<keyof EmployeeCreate, string>) => ({
      ...prev,
      [field]: validateField(field, formData[field] as string | number),
    }));
  };

  const handleNameChange = (value: string): void => {
    if (value.length > 100) return;
    setFormData((prev: EmployeeCreate) => ({ ...prev, name: value }));
    if (touched.name) {
      setErrors((prev: Record<keyof EmployeeCreate, string>) => ({
        ...prev,
        name: validateField('name', value),
      }));
    }
  };

  const handleHoursChange = (value: number): void => {
    setFormData((prev: EmployeeCreate) => ({ ...prev, estimatedHours: value }));
    if (touched.estimatedHours) {
      setErrors((prev: Record<keyof EmployeeCreate, string>) => ({
        ...prev,
        estimatedHours: validateField('estimatedHours', value),
      }));
    }
  };

  const handleSquadSelect = (squadId: number): void => {
    setFormData((prev: EmployeeCreate) => ({ ...prev, squadId }));
    setIsSquadDropdownOpen(false);
    setSquadSearch('');
    if (touched.squadId) {
      setErrors((prev: Record<keyof EmployeeCreate, string>) => ({
        ...prev,
        squadId: validateField('squadId', squadId),
      }));
    }
  };

  const resetForm = (): void => {
    setFormData(INITIAL_FORM);
    setErrors(INITIAL_ERRORS);
    setTouched(INITIAL_TOUCHED);
    setSquadSearch('');
    setIsSquadDropdownOpen(false);
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

    setTouched({ name: true, estimatedHours: true, squadId: true });

    const newErrors: Record<keyof EmployeeCreate, string> = {
      name: validateField('name', formData.name),
      estimatedHours: validateField('estimatedHours', formData.estimatedHours),
      squadId: validateField('squadId', formData.squadId),
    };
    setErrors(newErrors);

    if (Object.values(newErrors).some(Boolean)) return;

    setSubmitting(true);
    try {
      await createEmployee({ ...formData, name: formData.name.trim() });
      handleCloseModal();
      await loadData();
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      setSubmitError('Não foi possível criar o usuário. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const getSquadName = (squadId: number): string =>
    squads.find((s: Squad) => s.id === squadId)?.name ?? `Squad #${squadId}`;

  const filteredSquads: Squad[] = squads.filter((s: Squad) =>
    s.name.toLowerCase().includes(squadSearch.toLowerCase())
  );

  const selectedSquad: Squad | undefined = squads.find(
    (s: Squad) => s.id === formData.squadId
  );

  return {
  filteredUsers, squads, loading, loadError,

  selectedSquadId, searchTerm, setSelectedSquadId, setSearchTerm, clearFilters,

  modalOpen, handleOpenModal, handleCloseModal,

  formData, errors, touched, submitting, submitError, setSubmitError,
  isFormValid, handleNameChange, handleHoursChange, handleSquadSelect, handleBlur, handleSubmit,

  squadSearch, setSquadSearch, isSquadDropdownOpen, setIsSquadDropdownOpen,
  filteredSquads, selectedSquad, squadDropdownRef,

  getSquadName, loadData,
  };
};