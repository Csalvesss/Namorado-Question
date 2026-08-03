import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import PageViewLogger from './components/PageViewLogger';
import RequireAdmin from './components/RequireAdmin';
import RequireAuth from './components/RequireAuth';
import Admin from './pages/Admin';
import PendingApproval from './pages/PendingApproval';
import ProvaIntegrada from './pages/ProvaIntegrada';
import Author from './pages/Author';
import Bilhetes from './pages/Bilhetes';
import Calculators from './pages/Calculators';
import Course from './pages/Course';
import Courses from './pages/Courses';
import FarmacoMDC from './pages/FarmacoMDC';
import Home from './pages/Home';
import History from './pages/History';
import ProvaReview from './pages/ProvaReview';
import Login from './pages/Login';
import AlgorithmPlayer, { AlgorithmsList } from './pages/Algorithms';
import CaseSimulator from './pages/CaseSimulator';
import Cases from './pages/Cases';
import Mistakes from './pages/Mistakes';
import Profile from './pages/Profile';
import QuickReview from './pages/QuickReview';
import Quiz from './pages/Quiz';
import Review from './pages/Review';
import StudyPlan from './pages/StudyPlan';
import BilheteBancada from './pages/BilheteBancada';
import CadeiraAnsiosa from './pages/CadeiraAnsiosa';
import CalculoTubetes from './pages/CalculoTubetes';
import OdontoEmBreve from './pages/OdontoEmBreve';
import Receituario from './pages/Receituario';
import Tools from './pages/Tools';
import Welcome from './pages/Welcome';

export default function App() {
  return (
    <>
      <PageViewLogger />
      <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/aguardando" element={<PendingApproval />} />
      <Route
        path="/admin"
        element={
          <RequireAdmin>
            <Admin />
          </RequireAdmin>
        }
      />
      <Route
        element={
          <RequireAuth>
            <Layout />
          </RequireAuth>
        }
      >
        <Route path="/app" element={<Home />} />
        <Route path="/cursos" element={<Courses />} />
        <Route path="/curso/:id" element={<Course />} />
        <Route path="/quiz/:courseId" element={<Quiz />} />
        <Route path="/intercalado" element={<Quiz />} />
        <Route path="/ferramentas" element={<Tools />} />
        <Route path="/calculadoras" element={<Calculators />} />
        <Route path="/farmaco-mdc" element={<FarmacoMDC />} />
        <Route path="/cadeira-ansiosa" element={<CadeiraAnsiosa />} />
        <Route path="/calculo-tubetes" element={<CalculoTubetes />} />
        <Route path="/bilhete-bancada" element={<BilheteBancada />} />
        <Route path="/receituario" element={<Receituario />} />
        <Route path="/simulacoes-odonto" element={<OdontoEmBreve />} />
        <Route path="/algoritmos-odonto" element={<OdontoEmBreve />} />
        <Route path="/passa-facil" element={<QuickReview />} />
        <Route path="/casos" element={<Cases />} />
        <Route path="/casos/:caseId" element={<CaseSimulator />} />
        <Route path="/erros" element={<Mistakes />} />
        <Route path="/algoritmos" element={<AlgorithmsList />} />
        <Route path="/algoritmos/:algoId" element={<AlgorithmPlayer />} />
        <Route path="/historico" element={<History />} />
        <Route path="/historico/prova/:sessionId" element={<ProvaReview />} />
        <Route path="/revisar" element={<Review />} />
        <Route path="/plano" element={<StudyPlan />} />
        <Route path="/bilhetes" element={<Bilhetes />} />
        <Route path="/autor" element={<Author />} />
        <Route path="/perfil" element={<Profile />} />
        <Route path="/prova-integrada" element={<ProvaIntegrada />} />
      </Route>
      <Route path="/" element={<Welcome />} />
      <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
