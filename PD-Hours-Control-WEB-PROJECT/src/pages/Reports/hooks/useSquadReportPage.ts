import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSquadById, getMemberHours, getTotalHours, getAverageHours } from '@/services/squadService';
import { getEmployeesBySquad } from '@/services/employeeService';
import { getReportsBySquad } from '@/services/reportService';
import type { Squad, Employee, MemberHours, SquadTotalHours, SquadAverageHours, ReportDetail } from '@/types';

export const useSquadReportPage = () => {
  const { squadId } = useParams<{ squadId: string }>();
  const navigate = useNavigate();

  const [squad, setSquad] = useState<Squad | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [memberHours, setMemberHours] = useState<MemberHours[]>([]);
  const [totalHours, setTotalHours] = useState<SquadTotalHours | null>(null);
  const [averageHours, setAverageHours] = useState<SquadAverageHours | null>(null);
  const [reports, setReports] = useState<ReportDetail[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [searchLoading, setSearchLoading] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [dateError, setDateError] = useState<string>('');
  const [searched, setSearched] = useState<boolean>(false);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  useEffect(() => {
    if (squadId) loadSquadInfo();
  }, [squadId]);

  const loadSquadInfo = async (): Promise<void> => {
    try {
      setLoading(true);
      setLoadError(null);
      const id = parseInt(squadId!);
      const [squadResponse, employeesData] = await Promise.all([
        getSquadById(id),
        getEmployeesBySquad(id),
      ]);
      setSquad(squadResponse.data);
      setEmployees(employeesData);
    } catch (error) {
      console.error('Erro ao carregar dados da squad:', error);
      setLoadError('Não foi possível carregar os dados da squad. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const validateDates = (): boolean => {
    if (!startDate || !endDate) {
      setDateError('');
      return false;
    }
    if (startDate > endDate) {
      setDateError('Data inicial não pode ser maior que data final');
      return false;
    }
    if (startDate > today) {
      setDateError('Data inicial não pode ser futura');
      return false;
    }
    if (endDate > today) {
      setDateError('Data final não pode ser futura');
      return false;
    }
    setDateError('');
    return true;
  };

  const isFormValid: boolean = !!startDate && !!endDate;

  const formatDateToString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleSearch = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!squadId || !startDate || !endDate) return;
    if (!validateDates()) return;

    try {
      setSearchLoading(true);
      setSearchError(null);
      const id = parseInt(squadId);
      const startDateStr = formatDateToString(startDate);
      const endDateStr = formatDateToString(endDate);

      const [memberHoursRes, totalHoursRes, averageHoursRes, reportsData] = await Promise.all([
        getMemberHours(id, startDateStr, endDateStr),
        getTotalHours(id, startDateStr, endDateStr),
        getAverageHours(id, startDateStr, endDateStr),
        getReportsBySquad(id, startDateStr, endDateStr),
      ]);

      setMemberHours(memberHoursRes.data);
      setTotalHours(totalHoursRes.data);
      setAverageHours(averageHoursRes.data);
      setReports(reportsData);
      setSearched(true);
    } catch (error) {
      console.error('Erro ao buscar relatórios:', error);
      setSearchError('Não foi possível buscar os relatórios para o período selecionado.');
    } finally {
      setSearchLoading(false);
    }
  };

  const clearSearch = (): void => {
    setStartDate(null);
    setEndDate(null);
    setDateError('');
    setSearched(false);
    setSearchError(null);
  };

  const getDaysInPeriod = (): number => {
    if (!startDate || !endDate) return 1;
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const formatDate = (date: Date | null): string => {
    if (!date) return '';
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${day}/${month}/${date.getFullYear()}`;
  };

  const formatDateTime = (dateString: string): string => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const employeeHoursMap = new Map(memberHours.map(mh => [mh.employeeId, mh.totalHours]));

  const employeesWithHours = employees.map(employee => ({
    ...employee,
    totalHours: employeeHoursMap.get(employee.id) ?? 0,
  }));

  const daysInPeriod = getDaysInPeriod();
  const calculatedAverage = totalHours?.totalHours ? totalHours.totalHours / daysInPeriod : 0;
  const displayAverage = calculatedAverage || averageHours?.averageHoursPerDay || 0;
  
  return {
  squad, employees, reports, employeesWithHours,
  totalHours, daysInPeriod, displayAverage, memberHours,

  loading, searchLoading,

  loadError, searchError, setSearchError, dateError,

  searched, setSearched, isFormValid,

  today, startDate, endDate, setStartDate, setEndDate, setDateError,

  handleSearch, clearSearch, navigate,

  formatDate, formatDateTime,
};
};