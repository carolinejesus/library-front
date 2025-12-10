import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { api } from "../utils/api";

const Usuarios = () => {
    const [usuarios, setUsuarios] = useState([]);
    const [erro, setErro] = useState("");
    const [modoEdicao, setModoEdicao] = useState(false);
    const [mostrarModal, setMostrarModal] = useState(false);

    const [form, setForm] = useState({
        id: "",
        nome: "",
        email: "",
        senha: "",
        tipo: "aluno"
    });

    const [confirmacao, setConfirmacao] = useState({
        mostrar: false,
        mensagem: "",
        onConfirm: null
    });

    const usuarioLogado = JSON.parse(localStorage.getItem("usuario"));


    const listaUsuarios = async () => {
        try {
            const token = localStorage.getItem("token");

            const response = await api.get("/usuarios", {
                headers: { Authorization: `Bearer ${token}` },
            });

            setUsuarios(response.data);

        } catch (error) {
            console.error("Erro:", error);
            setErro("Erro ao carregar usuários.");
        }
    };

    useEffect(() => {
        listaUsuarios();
    }, []);

    const cadastro = () => {
        setModoEdicao(false);
        setForm({
            id: "",
            nome: "",
            email: "",
            senha: "",
            tipo: "aluno"
        });
        setMostrarModal(true);
    };

    const editarUser = (usuario) => {
        setModoEdicao(true);
        setForm({
            id: usuario.id,
            nome: usuario.nome,
            email: usuario.email,
            senha: "",
            tipo: usuario.tipo
        });
        setMostrarModal(true);
    };

    const salvar = async (e) => {
        e.preventDefault();

        try {
            const token = localStorage.getItem("token");
            if(modoEdicao){
                const body = {
                    nome: form.nome,
                    email: form.email
                };

                await api.put(`/usuarios/${form.id}`, body, {
                    headers: { Authorization: `Bearer ${token}`}
                });
                toast.success("Usuário atualizado com sucesso!");
            } else {
                await api.post("/usuarios", form, {
                    headers: { Authorization: `Bearer ${token}`}
                });
                toast.success("Usuário cadastrado com sucesso!");
            }

            setMostrarModal(false);
            listaUsuarios();

        } catch (err) {
            console.error(err);
            toast.error("Erro ao salvar usuário.");
        }
    };

    const deletar = async (id) => {
        confirmarAcao("Tem certeza que deseja excluir este usuário?", async () => {
            try {
                const token = localStorage.getItem("token");

                await api.delete(`/usuarios/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                toast.success("Usuário excluído com sucesso!");
                listaUsuarios();

            } catch (error) {
                console.error(error);
                toast.error("Erro ao excluir usuário.");
            };
        });
    };

    const confirmarAcao = (mensagem, acao) => {
        setConfirmacao({
            mostrar: true,
            mensagem,
            onConfirm: async () => {
                setConfirmacao({ mostrar: false, mensagem: "", onConfirm: null });
                await acao();
            }
        });
    };

    const sair = () => {
        window.history.back();
    };

    return (
        <>
            <div className="container py-4" style={{ minHeight: "100vh" }}>
                <div
                    className="d-flex justify-content-between align-items-center mb-4 p-3 rounded"
                    style={{
                        background: "#ffffff",
                        boxShadow: "0 2px 5px rgba(0,0,0,0.1)"
                    }}
                >
                    <h2 className="m-0">👥 Gerenciar Usuários</h2>

                    <button className="btn btn-danger" onClick={sair}>
                        Voltar
                    </button>
                </div>
                {erro && <div className="alert alert-danger">{erro}</div>}
                <button
                    className="btn btn-success mb-3 p-3 shadow-sm"
                    style={{
                        fontSize: "1.1rem",
                        fontWeight: "500",
                        borderRadius: "10px"
                    }}
                    onClick={cadastro}
                >
                    + Adicionar Usuário
                </button>
                <div
                    className="p-4 rounded shadow-sm"
                    style={{ background: "#ffffff" }}
                >
                    <table className="table table-hover align-middle">
                        <thead className="table-light">
                            <tr>
                                <th>ID</th>
                                <th>Nome</th>
                                <th>Email</th>
                                <th>Tipo</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {usuarios.slice()
                                .sort((a, b) => a.nome.localeCompare(b.nome))
                                .map((u) => (
                                    <tr key={u.id}>
                                        <td>{u.id}</td>
                                        <td>{u.nome}</td>
                                        <td>{u.email}</td>
                                        <td>
                                            {u.tipo === "aluno" ? "Aluno" : "Funcionário"}
                                        </td>
                                        <td>
                                            <button
                                                className="btn btn-primary btn-sm me-2"
                                                style={{ borderRadius: "8px" }}
                                                onClick={() => editarUser(u)}
                                            >
                                                Editar
                                            </button>
                                            {u.id !== usuarioLogado?.id && (
                                                <button
                                                    className="btn btn-danger btn-sm"
                                                    style={{ borderRadius: "8px" }}
                                                    onClick={() => deletar(u.id)}
                                                >
                                                    Excluir
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
                {mostrarModal && (
                    <div
                        className="modal fade show d-block"
                        style={{ background: "rgba(0,0,0,0.5)" }}
                    >
                        <div className="modal-dialog">
                            <div className="modal-content shadow">
                                <div className="modal-header">
                                    <h5 className="modal-title">
                                        {modoEdicao ? "Editar Usuário" : "Cadastrar Usuário"}
                                    </h5>
                                    <button
                                        className="btn-close"
                                        onClick={() => setMostrarModal(false)}
                                    ></button>
                                </div>
                                <form onSubmit={salvar}>
                                    <div className="modal-body">
                                        <label className="form-label">Nome</label>
                                        <input
                                            type="text"
                                            className="form-control mb-3"
                                            value={form.nome}
                                            onChange={(e) =>
                                                setForm({ ...form, nome: e.target.value })
                                            }
                                            required
                                        />
                                        <label className="form-label">Email</label>
                                        <input
                                            type="email"
                                            className="form-control mb-3"
                                            value={form.email}
                                            onChange={(e) =>
                                                setForm({ ...form, email: e.target.value })
                                            }
                                            required
                                        />
                                        {!modoEdicao && (
                                            <>
                                                <label className="form-label">Senha</label>
                                                <input
                                                    type="password"
                                                    className="form-control mb-3"
                                                    value={form.senha}
                                                    onChange={(e) =>
                                                        setForm({
                                                            ...form,
                                                            senha: e.target.value
                                                        })
                                                    }
                                                    required
                                                />
                                            </>
                                        )}
                                        <label className="form-label">Tipo</label>
                                        <select
                                            className="form-control"
                                            value={form.tipo}
                                            onChange={(e) =>
                                                setForm({ ...form, tipo: e.target.value })
                                            }
                                            disabled={modoEdicao}
                                        >
                                            <option value="aluno">Aluno</option>
                                            <option value="funcionario">Funcionário</option>
                                        </select>
                                    </div>
                                    <div className="modal-footer">
                                        <button
                                            type="button"
                                            className="btn btn-secondary"
                                            onClick={() => setMostrarModal(false)}
                                            style={{ borderRadius: "8px" }}
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            type="submit"
                                            className="btn btn-primary"
                                            style={{ borderRadius: "8px" }}
                                        >
                                            Salvar
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
                {confirmacao.mostrar && (
                    <div
                        className="modal fade show d-block"
                        style={{ background: "rgba(0,0,0,0.4)" }}
                    >
                        <div className="modal-dialog">
                            <div className="modal-content shadow">
                                <div className="modal-header">
                                    <button
                                        className="btn-close"
                                        onClick={() => setConfirmacao({ mostrar: false })}
                                    ></button>
                                </div>
                                <div className="modal-body text-center">
                                    <p className="fs-5">{confirmacao.mensagem}</p>
                                </div>
                                <div className="modal-footer">
                                    <button
                                        className="btn btn-secondary"
                                        style={{ borderRadius: "8px" }}
                                        onClick={() => setConfirmacao({ mostrar: false })}
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        className="btn btn-danger"
                                        style={{ borderRadius: "8px" }}
                                        onClick={confirmacao.onConfirm}
                                    >
                                        Confirmar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default Usuarios;