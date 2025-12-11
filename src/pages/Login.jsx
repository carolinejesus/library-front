import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { api } from "../utils/api";

const Login = () => {
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [erro, setErro] = useState("");
    const [mensagem, setMensagem] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setErro("");
        setMensagem("");

        try {
            const response = await api.post("/login", {
                email, senha
            });

            const data = response.data;

            localStorage.setItem("token", data.token);
            localStorage.setItem("usuario", JSON.stringify(data.usuario));

            toast.success("Login realizado!");

            if (data.usuario.tipo === "aluno") {
                navigate("/aluno");
            } else if (data.usuario.tipo === "funcionario") {
                navigate("/funcionario");
            } else {
                setErro("Tipo de usuário inválido.");
            }

        } catch (err) {
            console.error(err);
            if (err.response?.data?.erro) {
                setErro(err.response.data.erro);
            } else {
                setErro("Erro ao conectar ao servidor.");
            }
            toast.error("Falha no login.");
        }
    };

    return (
        <div className="container d-flex justify-content-center align-items-center vh-100">
            <div className="card p-4 shadow" style={{ width: "400px" }}>
                <div className="d-flex justify-content-center">
                    <img
                        src="/liv.png"
                        alt="Logo"
                        style={{ width: "175px", marginBottom: "6px" }}
                    />
                </div>
                <h2 className="text-center mb-0">Sistema de Reservas</h2>
                <h3 className="text-center mb-2">Login</h3>

                {erro && (
                    <div className="alert alert-danger py-2">{erro}</div>
                )}

                {mensagem && (
                    <div className="alert alert-warning py-2">{mensagem}</div>
                )}

                <form onSubmit={handleLogin}>
                    <div className="mb-3">
                        <label className="form-label">Email</label>
                        <input
                            type="email"
                            className="form-control"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Senha</label>
                        <input
                            type="password"
                            className="form-control"
                            value={senha}
                            onChange={(e) => setSenha(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="btn btn-primary w-100">
                        Entrar
                    </button>
                    <div mb-3>
                        <button className="btn btn-outline-primary w-100" onClick={() => navigate("/catalogo")}>
                            Visualizar Catálogo
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
