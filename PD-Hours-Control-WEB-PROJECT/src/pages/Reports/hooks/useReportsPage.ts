import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSquads } from '@/services/squadService';
import { getEmployeesBySquad } from '@/services/employeeService';
import { createReport } from '@/services/reportService';
import type { Squad, Employee } from '@/types';

type ReportForm = {
  description: string;
  employeeId: number;
  spentHours: number;
};

type FormErrors = Record<keyof ReportForm, string>;
type FormTouched = Record<keyof ReportForm, boolean>;

const INITIAL_FORM: ReportForm = { description: '', employeeId: 0, spentHours: 0 };
const INITIAL_ERRORS: FormErrors = { description: '', employeeId: '', spentHours: '' };
const INITIAL_TOUCHED: FormTouched = { description: false, employeeId: false, spentHours: false };

export const useReportsPage = () => {
  const navigate = useNavigate();

  const [squads, setSquads] = useState<Squad[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);

  const [loading, setLoading] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>('');

  const [selectedSquadId, setSelectedSquadId] = useState<number>(0);

  const [modalOpen, setModalOpen] = useState<boolean>(true);

  const [formData, setFormData] = useState<ReportForm>(INITIAL_FORM);
  const [errors, setErrors] = useState<FormErrors>(INITIAL_ERRORS);
  const [touched, setTouched] = useState<FormTouched>(INITIAL_TOUCHED);

  const [squadSearch, setSquadSearch] = useState<string>('');
  const [isSquadDropdownOpen, setIsSquadDropdownOpen] = useState<boolean>(false);
  const [employeeSearch, setEmployeeSearch] = useState<string>('');
  const [isEmployeeDropdownOpen, setIsEmployeeDropdownOpen] = useState<boolean>(false);

  const squadDropdownRef = useRef<HTMLDivElement>(null);
  const employeeDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadSquads();
  }, []);

  useEffect(() => {
    if (selectedSquadId > 0) {
      loadEmployees(selectedSquadId);
    } else {
      setEmployees([]);
      setFormData(prev => ({ ...prev, employeeId: 0 }));
    }
  }, [selectedSquadId]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (squadDropdownRef.current && !squadDropdownRef.current.contains(e.target as Node)) {
        setIsSquadDropdownOpen(false);
        setSquadSearch('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (employeeDropdownRef.current && !employeeDropdownRef.current.contains(e.target as Node)) {
        setIsEmployeeDropdownOpen(false);
        setEmployeeSearch('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadSquads = async (): Promise<void> => {
    try {
      setLoadError(null);
      const response = await getSquads();
      setSquads(response.data);
    } catch (error) {
      console.error('Erro ao carregar squads:', error);
      setLoadError('Não foi possível carregar as squads. Tente novamente.');
    }
  };

  const loadEmployees = async (squadId: number): Promise<void> => {
    try {
      setLoading(true);
      setLoadError(null);
      const data = await getEmployeesBySquad(squadId);
      setEmployees(data);
    } catch (error) {
      console.error('Erro ao carregar funcionários:', error);
      setLoadError('Não foi possível carregar os funcionários. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const validateField = (field: keyof ReportForm, value: string | number): string => {
    switch (field) {
      case 'description':
        if (!String(value).trim()) return 'Descrição é obrigatória';
        if (String(value).trim().length > 500) return 'Descrição deve ter no máximo 500 caracteres';
        return '';
      case 'employeeId':
        if (!value || value === 0) return 'Selecione um funcionário';
        return '';
      case 'spentHours':
        if (Number(value) <= 0) return 'Horas devem ser maiores que 0';
        if (Number(value) > 12) return 'Máximo de 12 horas por dia';
        return '';
      default:
        return '';
    }
  };

  const isFormValid: boolean =
    selectedSquadId > 0 &&
    !validateField('description', formData.description) &&
    !validateField('employeeId', formData.employeeId) &&
    !validateField('spentHours', formData.spentHours);

  const handleBlur = (field: keyof ReportForm): void => {
    setTouched((prev: FormTouched) => ({ ...prev, [field]: true }));
    setErrors((prev: FormErrors) => ({
      ...prev,
      [field]: validateField(field, formData[field] as string | number),
    }));
  };

  const handleDescriptionChange = (value: string): void => {
    if (value.length > 500) return;
    setFormData((prev: ReportForm) => ({ ...prev, description: value }));
    if (touched.description) {
      setErrors((prev: FormErrors) => ({
        ...prev,
        description: validateField('description', value),
      }));
    }
  };

  const handleHoursChange = (value: number): void => {
    setFormData((prev: ReportForm) => ({ ...prev, spentHours: value }));
    if (touched.spentHours) {
      setErrors((prev: FormErrors) => ({
        ...prev,
        spentHours: validateField('spentHours', value),
      }));
    }
  };

  const handleSquadSelect = (squadId: number): void => {
    setSelectedSquadId(squadId);
    setFormData(prev => ({ ...prev, employeeId: 0 }));
    setErrors(INITIAL_ERRORS);
    setTouched(INITIAL_TOUCHED);
    setIsSquadDropdownOpen(false);
    setSquadSearch('');
    setEmployeeSearch('');
  };

  const handleEmployeeSelect = (empId: number): void => {
    setFormData((prev: ReportForm) => ({ ...prev, employeeId: empId }));
    setIsEmployeeDropdownOpen(false);
    setEmployeeSearch('');
    if (touched.employeeId) {
      setErrors((prev: FormErrors) => ({
        ...prev,
        employeeId: validateField('employeeId', empId),
      }));
    }
  };

  const resetForm = (): void => {
    setFormData(INITIAL_FORM);
    setErrors(INITIAL_ERRORS);
    setTouched(INITIAL_TOUCHED);
    setSelectedSquadId(0);
    setSquadSearch('');
    setEmployeeSearch('');
    setIsSquadDropdownOpen(false);
    setIsEmployeeDropdownOpen(false);
    setSubmitError(null);
    setSuccessMessage('');
  };

  const handleCloseModal = (): void => {
    setModalOpen(false);
    navigate('/squads');
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setSubmitError(null);

    setTouched({ description: true, employeeId: true, spentHours: true });

    const newErrors: FormErrors = {
      description: validateField('description', formData.description),
      employeeId: validateField('employeeId', formData.employeeId),
      spentHours: validateField('spentHours', formData.spentHours),
    };
    setErrors(newErrors);

    if (Object.values(newErrors).some(Boolean)) return;

    setSubmitting(true);
    try {
      await createReport({
        description: formData.description.trim(),
        employeeId: formData.employeeId,
        spentHours: formData.spentHours,
      });
      setSuccessMessage('Horas lançadas com sucesso!');
      setTimeout(() => {
        resetForm();
        setModalOpen(false);
        navigate('/squads');
      }, 1500);
    } catch (error: unknown) {
      console.error('Erro ao lançar horas:', error);
      setSubmitError('Não foi possível lançar as horas. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredSquads: Squad[] = squads.filter((s: Squad) =>
    s.name.toLowerCase().includes(squadSearch.toLowerCase())
  );

  const filteredEmployees: Employee[] = employees.filter((e: Employee) =>
    e.name.toLowerCase().includes(employeeSearch.toLowerCase())
  );

  const selectedSquad: Squad | undefined = squads.find(s => s.id === selectedSquadId);
  const selectedEmployee: Employee | undefined = employees.find(e => e.id === formData.employeeId);

  return {
    loading, loadError,
    squads, employees,


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
  };
};