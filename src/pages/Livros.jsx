import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { api } from "../utils/api";

const Livros = () => {
    const [livros, setLivros] = useState([]);
    const [confirmacao, setConfirmacao] = useState({
        mostrar: false,
        mensagem: "",
        onConfirm: null
    });

    const [showModal, setShowModal] = useState(false);
    const [modoEdicao, setModoEdicao] = useState(false);
    const [form, setForm] = useState({
        id: "",
        titulo: "",
        autor: "",
        patrimonio: "",
        total_copias: "",
        copias_disponiveis: "",
        descricao: ""
    });

    const listaLivros = async () => {
        try {
            const token = localStorage.getItem("token");

            const { data } = await api.get("/livros", {
                headers: { Authorization: `Bearer ${token}` },
            });

            setLivros(data);

        } catch (error) {
            console.error("Erro:", error);
            toast.error("Erro ao conectar com servidor.");
        }

    };

    useEffect(() => {
        listaLivros();
    }, []);

    const adicionarLivro = () => {
        setModoEdicao(false);
        setForm({
            id: "",
            titulo: "",
            autor: "",
            patrimonio: "",
            total_copias: "",
            copias_disponiveis: ""
        });
        setShowModal(true);
    };

    const editarLivro = (livro) => {
        setModoEdicao(true);
        setForm(livro);
        setShowModal(true);
    };

    const salvarLivro = async () => {
        const token = localStorage.getItem("token");

        try {
            if (modoEdicao) {
                await api.put(`/livros/${form.id}`, form, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success("Livro atualizado com sucesso!");
            } else {
                await api.post("/livros", form, {
                    headers: { Authorization: `Baerer ${token}` }
                });
                toast.success("Livro adicionado com sucesso!")
            }
            setShowModal(false);
            listaLivros();

        } catch (err) {
            console.error(err);
            toast.error("Erro ao salvar livro.");
        }
    };

    const deletar = async (id) => {
        confirmarAcao("Tem certeza que deseja excluir este livro?", async () => {
            try {
                const token = localStorage.getItem("token");

                await api.delete(`/livros/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                toast.success("Livro excluído com sucesso!");
                listaLivros();
                
            } catch (err) {
                console.error(err);
                toast.error("Erro ao salvar livro.");
            }
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

    const voltar = () => {
        window.location.href = "/funcionario";
    };

    return (
        <>
            <div className="container py-4" style={{ minHeight: "100vh" }}>
                <div
                    className="d-flex justify-content-between align-items-center mb-4 p-3 rounded shadow-sm"
                    style={{ background: "#ffffff" }}
                >
                    <h2 className="mb-0">📚 Gerenciar Livros</h2>
                    <button className="btn btn-danger px-4" onClick={voltar}>
                        Voltar
                    </button>
                </div>
                <button
                    className="btn btn-success mb-3 shadow-sm"
                    style={{ fontSize: "1.1rem", fontWeight: "500" }}
                    onClick={adicionarLivro}
                >
                    + Adicionar Livro
                </button>
                <div className="card shadow-sm rounded">
                    <div className="card-body">
                        <table className="table table-hover align-middle">
                            <thead className="table-light">
                                <tr>
                                    <th>ID</th>
                                    <th>Título</th>
                                    <th>Autor</th>
                                    <th>Patrimônio</th>
                                    <th>Total</th>
                                    <th>Disponíveis</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {livros.map((livro) => (
                                    <tr key={livro.id}>
                                        <td>{livro.id}</td>
                                        <td>{livro.titulo}</td>
                                        <td>{livro.autor}</td>
                                        <td>{livro.patrimonio}</td>
                                        <td>{livro.total_copias}</td>
                                        <td>{livro.copias_disponiveis}</td>
                                        <td>
                                            <button
                                                className="btn btn-primary btn-sm me-2 shadow-sm"
                                                onClick={() => editarLivro(livro)}
                                            >
                                                Editar
                                            </button>
                                            <button
                                                className="btn btn-danger btn-sm shadow-sm"
                                                onClick={() => deletar(livro.id)}
                                            >
                                                Excluir
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                    </div>
                </div>
                {showModal && (
                    <div
                        className="modal fade show d-block"
                        style={{ background: "rgba(0,0,0,0.4)" }}
                    >
                        <div className="modal-dialog">
                            <div className="modal-content shadow">
                                <div className="modal-header">
                                    <h5 className="modal-title">
                                        {modoEdicao ? "Editar Livro" : "Adicionar Livro"}
                                    </h5>
                                    <button
                                        className="btn-close"
                                        onClick={() => setShowModal(false)}
                                    ></button>
                                </div>
                                <div className="modal-body">
                                    <label className="form-label">Título</label>
                                    <input
                                        type="text"
                                        className="form-control mb-3"
                                        value={form.titulo}
                                        onChange={(e) =>
                                            setForm({ ...form, titulo: e.target.value })
                                        }
                                    />
                                    <label className="form-label">Autor</label>
                                    <input
                                        type="text"
                                        className="form-control mb-3"
                                        value={form.autor}
                                        onChange={(e) =>
                                            setForm({ ...form, autor: e.target.value })
                                        }
                                    />
                                    <label className="form-label">Patrimônio</label>
                                    <input
                                        type="text"
                                        className="form-control mb-3"
                                        value={form.patrimonio}
                                        onChange={(e) =>
                                            setForm({ ...form, patrimonio: e.target.value })
                                        }
                                    />
                                    <label className="form-label">Total de cópias</label>
                                    <input
                                        type="number"
                                        className="form-control mb-3"
                                        value={form.total_copias}
                                        onChange={(e) =>
                                            setForm({ ...form, total_copias: e.target.value })
                                        }
                                    />
                                    <label className="form-label">Cópias disponíveis</label>
                                    <input
                                        type="number"
                                        className="form-control mb-3"
                                        value={form.copias_disponiveis}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                copias_disponiveis: e.target.value,
                                            })
                                        }
                                    />
                                    <label className="form-label">Descrição</label>
                                    <textarea
                                        className="form-control mb-3"
                                        value={form.descricao}
                                        onChange={(e) =>
                                            setForm({ ...form, descricao: e.target.value })
                                        }
                                        placeholder="Digite a descrição do livro"
                                    />
                                </div>
                                <div className="modal-footer">
                                    <button
                                        className="btn btn-secondary"
                                        onClick={() => setShowModal(false)}
                                    >
                                        Cancelar
                                    </button>
                                    <button className="btn btn-success" onClick={salvarLivro}>
                                        Salvar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                {confirmacao.mostrar && (
                    <div className="modal fade show d-block" style={{ background: "rgba(0,0,0,0.4)" }}>
                        <div className="modal-dialog">
                            <div className="modal-content shadow">
                                <div className="modal-header">
                                    <button
                                        className="btn-close"
                                        onClick={() => setConfirmacao({ mostrar: false })}
                                    ></button>
                                </div>
                                <div className="modal-body">
                                    <p>{confirmacao.mensagem}</p>
                                </div>
                                <div className="modal-footer">
                                    <button
                                        className="btn btn-secondary"
                                        onClick={() => setConfirmacao({ mostrar: false })}
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        className="btn btn-danger"
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
}

export default Livros;