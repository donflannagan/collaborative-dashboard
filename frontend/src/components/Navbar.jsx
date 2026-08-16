import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="bg-slate-900 text-white px-6 py-4 flex gap-6 shadow-md mb-8">
      <Link to="/" className="hover:text-sky-400 font-medium transition-colors">Home</Link>
      <Link to="/about" className="hover:text-sky-400 font-medium transition-colors">About</Link>
    </nav>
  );
}