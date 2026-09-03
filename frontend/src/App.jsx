import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './AppContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import About from './pages/About';
import Login from './pages/Login';
import AddUser from './pages/user/AddUser';
import Board from './pages/boards/BoardList';
import BoardComponent from './pages/boards/Board';
import CreateBoard from './pages/boards/CreateBoard';

export default function App() {
  return (
    <AuthProvider>
      <div>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="/user/addUser" element={<AddUser />} />
          <Route path='/boards' element={<ProtectedRoute><Board /></ProtectedRoute>} />
          <Route path='/board/create' element={<ProtectedRoute><CreateBoard /></ProtectedRoute>} />
          <Route path='/board/:id' element={<ProtectedRoute><BoardComponent /></ProtectedRoute>} />
        </Routes>
      </div>
    </AuthProvider>
  );
}