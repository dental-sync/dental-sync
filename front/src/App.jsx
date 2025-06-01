import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Sidebar from './components/Sidebar/Sidebar'
import LoginPage from './pages/Login'
import RegisterPage from './pages/Register'
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
import ServicoPage from './pages/Servico/ServicoPage'
import CadastroServico from './pages/Servico/CadastroServico'
import EditarServico from './pages/Servico/EditarServico'
import Configuracao from './pages/Configuracao'
import Relatorios from './pages/Relatorios'
import ForgotPasswordPage from './pages/Login/ForgotPassword'
import ResetPasswordPage from './pages/Login/ResetPassword'
import PlanosPage from './pages/Planos'
import PedidoPage from './pages/Pedido/PedidoPage'
import CadastroPedido from './pages/Pedido/CadastroPedido'
import EditarPedido from './pages/Pedido/EditarPedido'
import VisualizarPedido from './pages/Pedido/VisualizarPedido'
import './App.css'


const ProtectedLayout = ({ children }) => (
  <>
    <Sidebar />
    <main className="main-content">
      {children}
    </main>
  </>
);

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          {/* Rotas públicas */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/registre-se" element={<RegisterPage />} />
          <Route path="/esqueci-senha" element={<ForgotPasswordPage />} />
          <Route path="/redefinir-senha" element={<ResetPasswordPage />} />
          <Route path="/planos" element={<PlanosPage />} />
          
          {/* Rotas protegidas */}
          <Route path="/protetico" element={<ProtectedLayout><ProteticoPage /></ProtectedLayout>} />
          <Route path="/pedidos" element={<ProtectedLayout><PedidoPage /></ProtectedLayout>} />
          <Route path="/pedidos/cadastro" element={<ProtectedLayout><CadastroPedido /></ProtectedLayout>} />
          <Route path="/pedidos/editar/:id" element={<ProtectedLayout><EditarPedido /></ProtectedLayout>} />
          <Route path="/pedidos/:id" element={<ProtectedLayout><VisualizarPedido /></ProtectedLayout>} />
          <Route path="/protetico/cadastro" element={<ProtectedLayout><CadastroProtetico /></ProtectedLayout>} />
          <Route path="/proteticos/historico/:id" element={<ProtectedLayout><HistoricoProtetico /></ProtectedLayout>} />
          <Route path="/proteticos/editar/:id" element={<ProtectedLayout><EditarProtetico /></ProtectedLayout>} />
          <Route path="/paciente" element={<ProtectedLayout><PacientePage /></ProtectedLayout>} />
          <Route path="/paciente/cadastro" element={<ProtectedLayout><CadastroPaciente /></ProtectedLayout>} />
          <Route path="/paciente/historico/:id" element={<ProtectedLayout><HistoricoPaciente /></ProtectedLayout>} />
          <Route path="/paciente/editar/:id" element={<ProtectedLayout><EditarPaciente /></ProtectedLayout>} />
          <Route path="/dentista" element={<ProtectedLayout><DentistaPage /></ProtectedLayout>} />
          <Route path="/dentista/cadastro" element={<ProtectedLayout><CadastroDentista /></ProtectedLayout>} />
          <Route path="/dentista/editar/:id" element={<ProtectedLayout><EditarDentista /></ProtectedLayout>} />
          <Route path="/clinica" element={<ProtectedLayout><ClinicaPage /></ProtectedLayout>} />
          <Route path="/clinica/cadastro" element={<ProtectedLayout><CadastroClinica /></ProtectedLayout>} />
          <Route path="/clinica/editar/:id" element={<ProtectedLayout><EditarClinica /></ProtectedLayout>} />
          <Route path="/material" element={<ProtectedLayout><MaterialPage /></ProtectedLayout>} />
          <Route path="/material/cadastro" element={<ProtectedLayout><CadastroMaterial /></ProtectedLayout>} />
          <Route path="/material/editar/:id" element={<ProtectedLayout><EditarMaterial /></ProtectedLayout>} />
          <Route path="/servico" element={<ProtectedLayout><ServicoPage /></ProtectedLayout>} />
          <Route path="/servico/cadastro" element={<ProtectedLayout><CadastroServico /></ProtectedLayout>} />
          <Route path="/servico/editar/:id" element={<ProtectedLayout><EditarServico /></ProtectedLayout>} />
          <Route path="/configuracao" element={<ProtectedLayout><Configuracao /></ProtectedLayout>} />
          <Route path="/relatorios" element={<ProtectedLayout><Relatorios /></ProtectedLayout>} />
        </Routes>
        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    </Router>
  )
}

export default App
