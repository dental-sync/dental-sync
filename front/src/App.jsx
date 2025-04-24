import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar/Sidebar'
import ProteticoPage from './pages/Protetico/ProteticoPage'
import CadastroProtetico from './pages/Protetico/CadastroProtetico'
import HistoricoProtetico from './pages/Protetico/HistoricoProtetico'
import EditarProtetico from './pages/Protetico/EditarProtetico'
import PacientePage from './pages/Protetico/Paciente/PacientePage'
import CadastroPaciente from './pages/Protetico/Paciente/CadastroPaciente'
import HistoricoPaciente from './pages/Protetico/Paciente/HistoricoPaciente'
import EditarPaciente from './pages/Protetico/Paciente/EditarPaciente'
import './App.css'

function App() {
  return (
    <Router>
      <div className="app">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<ProteticoPage />} />
            <Route path="/protetico" element={<ProteticoPage />} />
            <Route path="/protetico/cadastro" element={<CadastroProtetico />} />
            <Route path="/protetico/historico/:id" element={<HistoricoProtetico />} />
            <Route path="/protetico/editar/:id" element={<EditarProtetico />} />
            <Route path="/paciente" element={<PacientePage />} />
            <Route path="/paciente/cadastro" element={<CadastroPaciente />} />
            <Route path="/paciente/historico/:id" element={<HistoricoPaciente />} />
            <Route path="/paciente/editar/:id" element={<EditarPaciente />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
