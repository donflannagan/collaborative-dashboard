import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './AppContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import About from './pages/About';
import Login from './pages/Login';
import AddUser from './pages/user/AddUser';
import Board from './pages/boards/BoardList';
import BoardComponent from './pages/boards/Board';

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
          <Route path='/boards' element={<Board />} />
          <Route path='/board/:id' element={<BoardComponent />} />
        </Routes>
      </div>
    </AuthProvider>
  );
}