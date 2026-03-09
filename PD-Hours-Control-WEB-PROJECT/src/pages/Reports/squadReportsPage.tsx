import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getSquadById, getMemberHours, getTotalHours, getAverageHours } from '../../services/squadService';
import { getEmployeesBySquad } from '../../services/employeeService';
import { getReportsBySquad } from '../../services/reportService';
import type { Squad, Employee, MemberHours, SquadTotalHours, SquadAverageHours, ReportDetail } from '../../types';
import { Table } from '../../components/Table/Table';
import { FiltersContainer } from '../../components/Filters/FiltersContainer';
import { ClearButton } from '../../components/Filters/ClearButton';
import { Button } from '../../components/Button/Button'; 
import DatePicker from '../../components/DatePicker/DatePicker';
import './SquadReportsPage.css';

const SquadReportPage: React.FC = () => {
  const { squadId } = useParams<{ squadId: string }>();
  const navigate = useNavigate();
  const [squad, setSquad] = useState<Squad | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [memberHours, setMemberHours] = useState<MemberHours[]>([]);
  const [totalHours, setTotalHours] = useState<SquadTotalHours | null>(null);
  const [averageHours, setAverageHours] = useState<SquadAverageHours | null>(null);
  const [reports, setReports] = useState<ReportDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);
  const [dateError, setDateError] = useState<string>('');
 
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

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

  const isFormValid = startDate && endDate;

  useEffect(() => {
    if (squadId) {
      loadSquadInfo();
    }
  }, [squadId]);

  const loadSquadInfo = async () => {
    try {
      setLoading(true);
      setError('');
      
      const id = parseInt(squadId!);
      
      const [squadResponse, employeesData] = await Promise.all([
        getSquadById(id),
        getEmployeesBySquad(id)
      ]);
      
      setSquad(squadResponse.data);
      setEmployees(employeesData);
      
    } catch (error) {
      console.error('Erro ao carregar dados da squad:', error);
      setError('Erro ao carregar dados da squad');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!squadId || !startDate || !endDate) return;
    
    if (!validateDates()) return;
    
    const formatDateToString = (date: Date): string => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    
    try {
      setSearchLoading(true);
      setError('');
      
      const id = parseInt(squadId);
      const startDateStr = formatDateToString(startDate);
      const endDateStr = formatDateToString(endDate);
      
      const [
        memberHoursResponse,
        totalHoursResponse,
        averageHoursResponse,
        reportsData
      ] = await Promise.all([
        getMemberHours(id, startDateStr, endDateStr),
        getTotalHours(id, startDateStr, endDateStr),
        getAverageHours(id, startDateStr, endDateStr),
        getReportsBySquad(id, startDateStr, endDateStr)
      ]);
      
      setMemberHours(memberHoursResponse.data);
      setTotalHours(totalHoursResponse.data);
      setAverageHours(averageHoursResponse.data);
      setReports(reportsData);
      setSearched(true);
      
    } catch (error) {
      console.error('Erro ao buscar relatórios:', error);
      setError('Erro ao buscar relatórios para o período selecionado');
    } finally {
      setSearchLoading(false);
    }
  };

  const employeeHoursMap = new Map(
    memberHours.map(mh => [mh.employeeId, mh.totalHours])
  );

  const employeesWithHours = employees.map(employee => ({
    ...employee,
    totalHours: employeeHoursMap.get(employee.id) || 0
  }));

  function getDaysInPeriod(): number {
    if (!startDate || !endDate) return 1;
    
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    
    return diffDays;
  }

  const formatDate = (date: Date | null): string => {
    if (!date) return '';
    
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const daysInPeriod = getDaysInPeriod();
  
  const calculatedAverage = totalHours?.totalHours ? totalHours.totalHours / daysInPeriod : 0;
  const displayAverage = calculatedAverage || averageHours?.averageHoursPerDay || 0;

  const employeeColumns = [
    {
      header: 'Funcionário',
      key: 'name',
      render: (employee: Employee & { totalHours: number }) => (
        <span className="employee-name">{employee.name}</span>
      )
    },
    {
      header: 'Horas Estimadas/Dia',
      key: 'estimatedHours',
      render: (employee: Employee & { totalHours: number }) => (
        <span>{employee.estimatedHours}h</span>
      )
    },
    {
      header: 'Total no Período',
      key: 'totalHours',
      render: (employee: Employee & { totalHours: number }) => (
        <span className="hours-column">{employee.totalHours.toFixed(1)}h</span>
      )
    },
    {
      header: 'Média por Dia',
      key: 'averagePerDay',
      render: (employee: Employee & { totalHours: number }) => {
        const averagePerDay = daysInPeriod > 0 ? employee.totalHours / daysInPeriod : 0;
        return <span>{averagePerDay.toFixed(1)}h/dia</span>;
      }
    }
  ];

  const reportColumns = [
    {
      header: 'Data',
      key: 'createdAt',
      render: (report: ReportDetail) => <span>{formatDateTime(report.createdAt)}</span>
    },
    {
      header: 'Funcionário',
      key: 'employeeName',
      render: (report: ReportDetail) => <span>{report.employeeName}</span>
    },
    {
      header: 'Descrição',
      key: 'description',
      render: (report: ReportDetail) => (
        <span>{report.description}</span>
      )
    },
    {
      header: 'Horas',
      key: 'spentHours',
      render: (report: ReportDetail) => <span className="hours-column">{report.spentHours}h</span>
    }
  ];

  if (loading) {
    return <div className="loading">Carregando squad...</div>;
  }

  if (error || !squad) {
    return (
      <div className="error-state">
        <h2>{error || 'Squad não encontrada'}</h2>
        <Button 
          variant="primary" 
          onClick={() => navigate('/squads')}
        >
          Voltar para Squads
        </Button>
      </div>
    );
  }

  return (
    <div className="squad-report-page">
      <div className="page-header">
        <div className="header-left">
          <Link to="/squads" className="back-link">
            ← Voltar para Squads
          </Link>
          <h1>{squad.name}</h1>
        </div>
      </div>

      <form onSubmit={handleSearch}>
        <FiltersContainer>
          <div className="filters-row">
            <DatePicker
              label="DATA INICIAL"
              value={startDate}
              onChange={setStartDate}
              placeholder="DD/MM/AAAA"
              maxDate={today}
            />
            
            <DatePicker
              label="DATA FINAL"
              value={endDate}
              onChange={setEndDate}
              placeholder="DD/MM/AAAA"
              minDate={startDate || undefined}
              maxDate={today}
            />

            <Button 
              type="submit" 
              variant="primary"
              disabled={!isFormValid || searchLoading}
              className="search-button"
            >
              {searchLoading ? 'Buscando...' : 'Pesquisar'}
            </Button>

            <ClearButton
              visible={searched}
              onClick={() => {
                setStartDate(null);
                setEndDate(null);
                setDateError('');
                setSearched(false);
              }}
              label="Limpar"
            />
          </div>
          {dateError && (
            <div className="date-error-message">
              {dateError}
            </div>
          )}
        </FiltersContainer>
      </form>

      {searched && (
        <>
          <div className="summary-cards">
            <div className="summary-card">
              <span className="summary-label">TOTAL DE HORAS</span>
              <span className="summary-value">{totalHours?.totalHours.toFixed(1) || 0}h</span>
            </div>
            <div className="summary-card">
              <span className="summary-label">MÉDIA POR DIA</span>
              <span className="summary-value">{displayAverage.toFixed(1)}h</span>
            </div>
            <div className="summary-card">
              <span className="summary-label">FUNCIONÁRIOS</span>
              <span className="summary-value">{employees.length}</span>
            </div>
            <div className="summary-card">
              <span className="summary-label">COM LANÇAMENTOS</span>
              <span className="summary-value">{memberHours.length}</span>
            </div>
          </div>

          <div className="period-info">
            <strong>Período:</strong> {formatDate(startDate)} - {formatDate(endDate)} ({daysInPeriod} dias)
          </div>

          <div className="members-section">
            <h2>Horas por Funcionário</h2>
            <Table columns={employeeColumns} data={employeesWithHours} />
          </div>

          {reports.length > 0 && (
            <div className="reports-section">
              <h2>Lançamentos Detalhados</h2>
              <Table columns={reportColumns} data={reports} />
            </div>
          )}

          {reports.length === 0 && employees.length > 0 && (
            <div className="empty-reports">
              <h3>Nenhum lançamento no período</h3>
              <p>Não há registros de horas para o período selecionado.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SquadReportPage;