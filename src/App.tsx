import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import RequireAuth from './components/RequireAuth';
import Author from './pages/Author';
import Bilhetes from './pages/Bilhetes';
import Course from './pages/Course';
import Dashboard from './pages/Dashboard';
import History from './pages/History';
import Login from './pages/Login';
import Profile from './pages/Profile';
import Quiz from './pages/Quiz';
import Review from './pages/Review';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        element={
          <RequireAuth>
            <Layout />
          </RequireAuth>
        }
      >
        <Route path="/app" element={<Dashboard />} />
        <Route path="/curso/:id" element={<Course />} />
        <Route path="/quiz/:courseId" element={<Quiz />} />
        <Route path="/historico" element={<History />} />
        <Route path="/revisar" element={<Review />} />
        <Route path="/bilhetes" element={<Bilhetes />} />
        <Route path="/autor" element={<Author />} />
        <Route path="/perfil" element={<Profile />} />
      </Route>
      <Route path="/" element={<Navigate to="/app" replace />} />
      <Route path="*" element={<Navigate to="/app" replace />} />
    </Routes>
  );
}
