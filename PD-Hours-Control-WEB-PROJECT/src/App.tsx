import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import SquadsPage from '@/pages/Squads/squadsPage';
import UsersPage from '@/pages/Users/usersPage';
import ReportsPage from '@/pages/Reports/reportsPage';
import SquadReportPage from '@/pages/Squads/squadsPage';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <nav>
          <Link to="/squads">Squads</Link>
          <Link to="/users">Usuários</Link>
          <Link to="/reports/new">Lançar horas</Link>
        </nav>
        <main>
          <Routes>
            <Route path="/squads" element={<SquadsPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/reports/new" element={<ReportsPage />} />
            <Route path="/squad/:squadId/report" element={<SquadReportPage />} />
            <Route path="/" element={<SquadsPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;