import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { api } from "../utils/api";

const Catalogo = () => {
    const [livros, setLivros] = useState([]);
    const [filtro, setFiltro] = useState("");
    const [generoFiltro, setGeneroFiltro] = useState("");
    const [detalhes, setDetalhes] = useState(null);
    const token = localStorage.getItem("token");

    useEffect(() => {
        carregarLivros();
    }, []);

    const carregarLivros = async () => {
        try {
            const response = await api.get("/livros");
            setLivros(response.data);
        } catch (err) {
            console.error("Erro na requisição de livros.", err);
        }
    };

    const generosDisponiveis = Array.isArray(livros)
        ? [...new Set(livros.map((livro) => livro.genero).filter(Boolean))]
        : [];

    const livrosFiltrados = Array.isArray(livros)
        ? livros.filter((l) => {
            const textoBusca = filtro.toLowerCase();

            const combinaTexto =
                (l.titulo || "").toLowerCase().includes(textoBusca) ||
                (l.autor || "").toLowerCase().includes(textoBusca) ||
                (l.genero || "").toLowerCase().includes(textoBusca);

            const combinaGenero =
                generoFiltro === "" || l.genero === generoFiltro;

            return combinaTexto && combinaGenero;
        })
        : [];

    const verDetalhes = async (id) => {
        const token = localStorage.getItem("token");

        if (!token) {
            toast.error("Faça login para ver os detalhes do livro.");
            return;
        }

        const response = await api.get(`/livros/${id}`, {
            headers: { Authorization: "Bearer " + token }
        });

        setDetalhes(response.data);
    };

    const reservarLivro = async (idLivro) => {
        const token = localStorage.getItem("token");
        let id_usuario = null;

        try {
            const payload = JSON.parse(atob(token.split(".")[1]));
            id_usuario = payload.id;
        } catch (err) {
            console.error("Erro ao decodificar token:", err);
        }

        if (!id_usuario) {
            toast.error("Usuário não encontrado.")
        }

        const reserva = {
            id_usuario: id_usuario,
            id_livro: idLivro
        };

        try {
            await api.post("/reservas", reserva, {
                headers: { Authorization: "Bearer " + token },
            });

            toast.success("Livro reservado com sucesso!");
            setDetalhes(null);
            carregarLivros();

        } catch (err) {
            console.error(err);
            alert("Erro ao reservar livro.")
        }
    };

    const voltar = () => {
        window.history.back();
    };


    if (detalhes) {
        return (
            <div className="container-fluid p-4" style={{ background: "#f4f4f4", minHeight: "100vh" }}>
                <div className="p-4 rounded shadow"
                    style={{ background: "#ffffff", minHeight: "85vh" }}
                >
                    <h3 className="mb-4">Detalhes do Livro</h3>
                    <div className="border rounded p-4 shadow-sm" style={{ background: "#fafafa" }}>
                        <img
                            src={detalhes.capa || "https://via.placeholder.com/180x250?text=Sem+Capa"}
                            alt={detalhes.titulo}
                            style={{
                                width: "180px",
                                height: "250px",
                                objectFit: "cover",
                                borderRadius: "8px",
                                marginBottom: "15px"
                            }}
                            onError={(e) => {
                                e.currentTarget.src = "https://via.placeholder.com/180x250?text=Sem+Capa";
                            }}
                        />
                        <h4>{detalhes.titulo}</h4>
                        <p className="text-muted">Autor: {detalhes.autor}</p>
                        <p className="text-muted"><strong>Gênero: </strong>{detalhes.genero || "Não informado"}</p>
                        <p className="text-muted"><strong>Gênero: </strong>{detalhes.genero || "Não informado"}</p>
                        <p className="text-muted">
                            <strong>Descrição: </strong>{detalhes.descricao || "Sem descrição"}
                        </p>
                        <p>
                            <strong>Quantidade disponível: </strong>
                            {detalhes.copias_disponiveis}
                        </p>
                        {detalhes.reserva && (
                            <p>
                                <strong>Reservado em: </strong> {new Date(detalhes.reserva.data_reserva).toLocaleDateString()}
                            </p>
                        )}
                        {detalhes.reserva && (
                            <p>
                                <strong>Data de devolução: </strong> {new Date(detalhes.reserva.data_devolucao).toLocaleDateString()}
                            </p>
                        )}
                        <div className="d-flex gap-3 mt-4">
                            <button
                                className="btn btn-secondary"
                                onClick={() => setDetalhes(null)}
                            >
                                Voltar ao Catálogo
                            </button>

                            <button
                                className="btn btn-primary"
                                disabled={detalhes.copias_disponiveis === 0}
                                onClick={() => reservarLivro(detalhes.id)}
                            >
                                Reservar Livro
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container-fluid p-4" style={{ background: "#f4f4f4", minHeight: "100vh" }}>
            <div className="p-4 rounded shadow"
                style={{ background: "#ffffff", minHeight: "85vh" }}
            >
                <h3 className="text-center mb-4">Catálogo de Livros</h3>
                <div
                    className="d-flex justify-content-between align-items-center mb-4 p-3 rounded"
                    style={{
                        background: "#ffffff",
                        boxShadow: "0 2px 5px rgba(0,0,0,0.1)"
                    }}
                >
                    <input
                        type="text"
                        className="form-control me-2"
                        placeholder="Pesquisar por título, autor ou gênero..."
                        value={filtro}
                        onChange={(e) => setFiltro(e.target.value)}
                    />
                    <select
                        className="form-select me-2"
                        style={{ maxWidth: "220px" }}
                        value={generoFiltro}
                        onChange={(e) => setGeneroFiltro(e.target.value)}
                    >
                        <option value="">Todos os gêneros</option>

                        {generosDisponiveis.map((genero) => (
                            <option key={genero} value={genero}>
                                {genero}
                            </option>
                        ))}
                    </select>
                    <button
                        className="btn btn-outline-secondary me-2"
                        onClick={() => {
                            setFiltro("");
                            setGeneroFiltro("");
                        }}
                    >
                        Limpar
                    </button>
                    <button className="btn btn-danger" onClick={voltar}>
                        Voltar
                    </button>
                </div>
                <div className="row">
                    {livrosFiltrados.length === 0 ? (
                        <div className="alert alert-secondary text-center">
                            Nenhum livro encontrado.
                        </div>
                    ) : (
                        livrosFiltrados.map(livro => (
                            <div className="col-3 mb-4" key={livro.id}>
                                <div
                                    className="p-3 rounded border shadow-sm h-100 d-flex flex-column justify-content-between"
                                    style={{ background: "#fafafa", cursor: "pointer" }}
                                    onClick={() => verDetalhes(livro.id)}
                                >
                                    <div>
                                        <img
                                            src={livro.capa || "https://via.placeholder.com/180x250?text=Sem+Capa"}
                                            alt={livro.titulo}
                                            style={{
                                                width: "100%",
                                                height: "220px",
                                                objectFit: "cover",
                                                borderRadius: "8px",
                                                marginBottom: "10px"
                                            }}
                                            onError={(e) => {
                                                e.currentTarget.src = "https://via.placeholder.com/180x250?text=Sem+Capa";
                                            }}
                                        />
                                        <h6 className="mb-1">{livro.titulo}</h6>
                                        <p className="text-muted mb-1">Autor: {livro.autor}</p>
                                        <p className="text-muted"><strong>Gênero: </strong>{livro.genero || "Não informado"}</p>
                                        <small className="text-muted">
                                            Disponíveis:{" "}
                                            <span className={`fw-bold ${livro.copias_disponiveis > 0 ? "text-success" : "text-danger"}`}>
                                                {livro.copias_disponiveis}
                                            </span>
                                        </small>
                                    </div>
                                    {token && (
                                        <button className="btn btn-primary mt-3"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                verDetalhes(livro.id);
                                            }}
                                        >
                                            Ver detalhes
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default Catalogo;
