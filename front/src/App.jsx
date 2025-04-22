import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar/Sidebar'
import ProteticoPage from './pages/Protetico/ProteticoPage'
import CadastroProtetico from './pages/Protetico/CadastroProtetico'
import HistoricoProtetico from './pages/Protetico/HistoricoProtetico'
import EditarProtetico from './pages/Protetico/EditarProtetico'
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
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
