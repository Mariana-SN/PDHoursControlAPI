import { Link } from 'react-router-dom';
import { useSquadReportPage } from './hooks/useSquadReportPage';
import { Table } from '@/components/Table/Table';
import { FiltersContainer } from '@/components/Filters/FiltersContainer';
import { ClearButton } from '@/components/Filters/ClearButton';
import { Button } from '@/components/Button/Button';
import { ErrorBanner } from '@/components/ErrorBanner/ErrorBanner';
import DatePicker from '@/components/DatePicker/DatePicker';
import type { Employee, ReportDetail } from '@/types';
import './SquadReportsPage.css';

const SquadReportPage = () => {
  const {
    squad, employees, reports, employeesWithHours,
    totalHours, displayAverage, memberHours,
    loading, searchLoading, loadError, searchError, setSearchError,
    dateError, searched, isFormValid, daysInPeriod,
    today, startDate, endDate, setStartDate, setEndDate,
    handleSearch, clearSearch, navigate,
    formatDate, formatDateTime,
  } = useSquadReportPage();

  const employeeColumns = [
    {
      header: 'Funcionário',
      key: 'name',
      render: (employee: Employee & { totalHours: number }) => (
        <span className="employee-name">{employee.name}</span>
      ),
    },
    {
      header: 'Horas Estimadas/Dia',
      key: 'estimatedHours',
      render: (employee: Employee & { totalHours: number }) => (
        <span>{employee.estimatedHours}h</span>
      ),
    },
    {
      header: 'Total no Período',
      key: 'totalHours',
      render: (employee: Employee & { totalHours: number }) => (
        <span className="hours-column">{employee.totalHours.toFixed(1)}h</span>
      ),
    },
    {
      header: 'Média por Dia',
      key: 'averagePerDay',
      render: (employee: Employee & { totalHours: number }) => (
        <span>{(daysInPeriod > 0 ? employee.totalHours / daysInPeriod : 0).toFixed(1)}h/dia</span>
      ),
    },
  ];

  const reportColumns = [
    {
      header: 'Data',
      key: 'createdAt',
      render: (report: ReportDetail) => <span>{formatDateTime(report.createdAt)}</span>,
    },
    {
      header: 'Funcionário',
      key: 'employeeName',
      render: (report: ReportDetail) => <span>{report.employeeName}</span>,
    },
    {
      header: 'Descrição',
      key: 'description',
      render: (report: ReportDetail) => <span>{report.description}</span>,
    },
    {
      header: 'Horas',
      key: 'spentHours',
      render: (report: ReportDetail) => (
        <span className="hours-column">{report.spentHours}h</span>
      ),
    },
  ];

  if (loading) return <div className="loading">Carregando squad...</div>;

  if (loadError || !squad) return (
    <div className="error-state">
      <h2>{loadError ?? 'Squad não encontrada'}</h2>
      <Button variant="primary" onClick={() => navigate('/squads')}>
        Voltar para Squads
      </Button>
    </div>
  );

  return (
    <div className="squad-report-page">
      <div className="page-header">
        <div className="header-left">
          <Link to="/squads" className="back-link">← Voltar para Squads</Link>
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
              minDate={startDate ?? undefined}
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
            <ClearButton visible={searched} onClick={clearSearch} label="Limpar" />
          </div>

          {dateError && <div className="date-error-message">{dateError}</div>}
        </FiltersContainer>
      </form>

      {searchError && (<ErrorBanner message={searchError} onClose={() => setSearchError(null)} />)}

      {searched && (
        <>
          <div className="summary-cards">
            <div className="summary-card">
              <span className="summary-label">TOTAL DE HORAS</span>
              <span className="summary-value">{totalHours?.totalHours.toFixed(1) ?? 0}h</span>
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

          {reports.length > 0 ? (
            <div className="reports-section">
              <h2>Lançamentos Detalhados</h2>
              <Table columns={reportColumns} data={reports} />
            </div>
          ) : (
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