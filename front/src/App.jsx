import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Sidebar from './components/Sidebar/Sidebar'
import LoginPage from './pages/Login'
import RegisterPage from './pages/Register'
import TwoFactorPage from './pages/TwoFactor'
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
import Kanban from './pages/Kanban/Kanban'
import './App.css'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { SidebarProvider } from './contexts/SidebarContext'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'
import HistoricoDentista from './pages/Dentista/HistoricoDentista'


const ProtectedLayout = ({ children }) => (
  <>
    <Sidebar />
    <main className="main-content">
      {children}
    </main>
  </>
);

// Componente para redirecionar se já estiver logado
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  // Aguardar verificação de autenticação antes de redirecionar
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <div>Carregando...</div>
      </div>
    );
  }
  
  return isAuthenticated ? <Navigate to="/paciente" replace /> : children;
};

function App() {
  return (
    <AuthProvider>
      <SidebarProvider>
        <Router>
          <div className="app">
            <Routes>
              {/* Rotas públicas */}
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
              <Route path="/two-factor" element={<PublicRoute><TwoFactorPage /></PublicRoute>} />
              <Route path="/registre-se" element={<PublicRoute><RegisterPage /></PublicRoute>} />
              <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />
              <Route path="/reset-password" element={<PublicRoute><ResetPasswordPage /></PublicRoute>} />
              <Route path="/planos" element={<PlanosPage />} />
              
              {/* Rotas protegidas apenas para admins */}
              <Route path="/protetico" element={<AdminRoute><ProtectedLayout><ProteticoPage /></ProtectedLayout></AdminRoute>} />
              <Route path="/protetico/cadastro" element={<AdminRoute><ProtectedLayout><CadastroProtetico /></ProtectedLayout></AdminRoute>} />
              <Route path="/proteticos/historico/:id" element={<AdminRoute><ProtectedLayout><HistoricoProtetico /></ProtectedLayout></AdminRoute>} />
              <Route path="/proteticos/editar/:id" element={<AdminRoute><ProtectedLayout><EditarProtetico /></ProtectedLayout></AdminRoute>} />
              
              {/* Rotas protegidas para todos os usuários autenticados */}
              <Route path="/paciente" element={<ProtectedRoute><ProtectedLayout><PacientePage /></ProtectedLayout></ProtectedRoute>} />
              <Route path="/paciente/cadastro" element={<ProtectedRoute><ProtectedLayout><CadastroPaciente /></ProtectedLayout></ProtectedRoute>} />
              <Route path="/paciente/historico/:id" element={<ProtectedRoute><ProtectedLayout><HistoricoPaciente /></ProtectedLayout></ProtectedRoute>} />
              <Route path="/paciente/editar/:id" element={<ProtectedRoute><ProtectedLayout><EditarPaciente /></ProtectedLayout></ProtectedRoute>} />
              <Route path="/dentista" element={<ProtectedRoute><ProtectedLayout><DentistaPage /></ProtectedLayout></ProtectedRoute>} />
              <Route path="/dentista/cadastro" element={<ProtectedRoute><ProtectedLayout><CadastroDentista /></ProtectedLayout></ProtectedRoute>} />
              <Route path="/dentista/editar/:id" element={<ProtectedRoute><ProtectedLayout><EditarDentista /></ProtectedLayout></ProtectedRoute>} />
              <Route path="/dentista/historico/:id" element={<ProtectedRoute><ProtectedLayout><HistoricoDentista /></ProtectedLayout></ProtectedRoute>} />
              <Route path="/clinica" element={<ProtectedRoute><ProtectedLayout><ClinicaPage /></ProtectedLayout></ProtectedRoute>} />
              <Route path="/clinica/cadastro" element={<ProtectedRoute><ProtectedLayout><CadastroClinica /></ProtectedLayout></ProtectedRoute>} />
              <Route path="/clinica/editar/:id" element={<ProtectedRoute><ProtectedLayout><EditarClinica /></ProtectedLayout></ProtectedRoute>} />
              <Route path="/material" element={<ProtectedRoute><ProtectedLayout><MaterialPage /></ProtectedLayout></ProtectedRoute>} />
              <Route path="/material/cadastro" element={<ProtectedRoute><ProtectedLayout><CadastroMaterial /></ProtectedLayout></ProtectedRoute>} />
              <Route path="/material/editar/:id" element={<ProtectedRoute><ProtectedLayout><EditarMaterial /></ProtectedLayout></ProtectedRoute>} />
              <Route path="/servico" element={<ProtectedRoute><ProtectedLayout><ServicoPage /></ProtectedLayout></ProtectedRoute>} />
              <Route path="/servico/cadastro" element={<ProtectedRoute><ProtectedLayout><CadastroServico /></ProtectedLayout></ProtectedRoute>} />
              <Route path="/servico/editar/:id" element={<ProtectedRoute><ProtectedLayout><EditarServico /></ProtectedLayout></ProtectedRoute>} />
              <Route path="/configuracao" element={<ProtectedRoute><ProtectedLayout><Configuracao /></ProtectedLayout></ProtectedRoute>} />
              <Route path="/relatorios" element={<ProtectedRoute><ProtectedLayout><Relatorios /></ProtectedLayout></ProtectedRoute>} />
              <Route path="/pedidos" element={<ProtectedRoute><ProtectedLayout><PedidoPage /></ProtectedLayout></ProtectedRoute>} />
              <Route path="/pedidos/cadastro" element={<ProtectedRoute><ProtectedLayout><CadastroPedido /></ProtectedLayout></ProtectedRoute>} />
              <Route path="/pedidos/editar/:id" element={<ProtectedRoute><ProtectedLayout><EditarPedido /></ProtectedLayout></ProtectedRoute>} />
              <Route path="/pedidos/visualizar/:id" element={<ProtectedRoute><ProtectedLayout><VisualizarPedido /></ProtectedLayout></ProtectedRoute>} />
              <Route path="/kanban" element={<ProtectedRoute><ProtectedLayout><Kanban /></ProtectedLayout></ProtectedRoute>} />
            </Routes>
            <ToastContainer position="top-right" autoClose={3000} />
          </div>
        </Router>
      </SidebarProvider>
    </AuthProvider>
  )
}

export default App
