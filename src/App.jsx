import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login.jsx";
import FuncionarioHome from "./pages/FuncionarioHome.jsx";
import Livros from "./pages/Livros.jsx";
import Usuarios from "./pages/Usuarios.jsx";
import AlunoHome from "./pages/AlunoHome.jsx";
import Catalogo from "./pages/Catalogo.jsx";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/funcionario" element={<FuncionarioHome />} />
      <Route path="/aluno" element={<AlunoHome />} />
      <Route path="/livros" element={<Livros />} />
      <Route path="/usuarios" element={<Usuarios />} />
      <Route path="/catalogo" element={<Catalogo />} />
    </Routes>
  )
}

export default App;
