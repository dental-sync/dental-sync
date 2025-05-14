import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Sidebar from './components/Sidebar/Sidebar'
import ProteticoPage from './pages/Protetico/ProteticoPage'
import CadastroProtetico from './pages/Protetico/CadastroProtetico'
import HistoricoProtetico from './pages/Protetico/HistoricoProtetico'
import EditarProtetico from './pages/Protetico/EditarProtetico'
import PacientePage from './pages/Paciente/PacientePage'
import CadastroPaciente from './pages/Paciente/CadastroPaciente'
import HistoricoPaciente from './pages/Paciente/HistoricoPaciente'
import EditarPaciente from './pages/Paciente/EditarPaciente'
import DentistaPage from './pages/Dentista/DentistaPage'
import CadastroDentista from './pages/Dentista/CadastroDentista'
import EditarDentista from './pages/Dentista/EditarDentista'
import ClinicaPage from './pages/Clinica/ClinicaPage'
import CadastroClinica from './pages/Clinica/CadastroClinica'
import EditarClinica from './pages/Clinica/EditarClinica'
import MaterialPage from './pages/Material/MaterialPage'
import CadastroMaterial from './pages/Material/CadastroMaterial'
import EditarMaterial from './pages/Material/EditarMaterial'
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
            <Route path="/dentista" element={<DentistaPage />} />
            <Route path="/dentista/cadastro" element={<CadastroDentista />} />
            <Route path="/dentista/editar/:id" element={<EditarDentista />} />
            <Route path="/clinica" element={<ClinicaPage />} />
            <Route path="/clinica/cadastro" element={<CadastroClinica />} />
            <Route path="/clinica/editar/:id" element={<EditarClinica />} />
            <Route path="/material" element={<MaterialPage />} />
            <Route path="/material/cadastro" element={<CadastroMaterial />} />
            <Route path="/material/editar/:id" element={<EditarMaterial />} />
          </Routes>
        </main>
        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    </Router>
  )
}

export default App
