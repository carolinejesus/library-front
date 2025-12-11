import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { api } from "../utils/api";

const FuncionarioHome = () => {
    const backendUrl = import.meta.env.VITE_API_URL;
    const [nome, setNome] = useState("");
    const [reservas, setReservas] = useState([]);
    const [usuario, setUsuario] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [preview, setPreview] = useState(null);
    const [file, setFile] = useState(null);
    const [zoom, setZoom] = useState(1);
    const [hoverFoto, setHoverFoto] = useState(false);
    const navigate = useNavigate();

    const handleFile = (e) => {
        const img = e.target.files[0];
        if (img) {
            setFile(img);
            setPreview(URL.createObjectURL(img));
        }
    };

    const salvarFoto = async () => {
        if (!file) { toast.error("Selecione uma imagem antes de salvar."); return; }
        const usuarioLocal = JSON.parse(localStorage.getItem("usuario"));
        const token = localStorage.getItem("token");
        const formData = new FormData();
        formData.append("foto", file);
        try {
            const { data } = await api.put(
                `/usuarios/${usuarioLocal.id}/foto`,
                formData,
                { headers: { Authorization: `Bearer ${token}`}}
            );

            const novoUsuario = { ...usuarioLocal, foto: data.foto };
            setUsuario(novoUsuario);
            localStorage.setItem("usuario", JSON.stringify(novoUsuario));

            setFile(null);
            setPreview(null);
            setShowModal(false);
            toast.success("Foto atualizada com sucesso!");
        } catch (err) {
            toast.error("Erro ao conectar com o servidor.");
            console.error(err);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) { 
            toast.error("Não autorizado.");
            navigate("/"); return; }

        const usuarioLocal = JSON.parse(localStorage.getItem("usuario"));
        if (!usuarioLocal) return;

        api.get(`/usuarios/${usuarioLocal.id}`, {
            headers: { Authorization: `Bearer ${token}` }
        }).then(res => {
            const data = res.data;
            console.log("Usuario Fetch:", data);
            setUsuario(data);
            setNome(data.nome);
            localStorage.setItem("usuario", JSON.stringify(data));
        }).catch(err => console.error(err));

        listaReservas(token);
        console.log(token)
    }, []);

    const listaReservas = async (token) => {
        try {
            const { data } = await api.get("/reservas", {
                headers: { "Authorization": "Bearer " + token }
            });
            setReservas(data);         

        } catch (err) {
            if (err.response?.status === 401) sair();
            toast.error("Erro ao carregar reservas.", err);
            setReservas([])
        }
    };

    const finalizarReserva = async (idReserva) => {
        const token = localStorage.getItem("token");

        try {
            await api.put(`/reservas/${idReserva}/finalizar`,
                { status: "Entregue." },
                 {headers: { "Authorization": "Bearer " + token } }
            );
            toast.success("Reserva finalizada com sucesso!");
            listaReservas(token);
            
        } catch (err) {
            console.error("Erro ao carregar reservas.", err);
        }
    }

    const cancelarReserva = async (idReserva) => {
        const token = localStorage.getItem("token");

        try {
            await api.put(`/reservas/${idReserva}/cancelar`, 
                { status: "cancelada" },
                { headers: { "Authorization": "Bearer " + token }, }
            );

            toast.success("Reserva cancelada com sucesso!");
            listaReservas(token);
        } catch (err) { 
            toast.error("Erro ao cancelar reserva."); 
        }
    };

    const excluirReserva = async (idReserva) => {
        const token = localStorage.getItem("token");

        try {
            await api.delete(`/reservas/${idReserva}`, {
                headers: { "Authorization": "Bearer " + token }, }
            );

            toast.success("Reserva excluida com sucesso!");
            listaReservas(token);

        } catch (err) {
            toast.error("Erro ao excluir reserva.")
        }
    }

    const sair = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("usuario");
        navigate("/");
    };

    const formatarData = (dataString) => {
        if (!dataString) return "-";
        const data = new Date(dataString);
        return data.toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        });
    };

    return (
        <div
            className="container-fluid p-4"
            style={{ background: "#f4f4f4", minHeight: "100vh" }}
        >
            <div className="d-flex justify-content-between align-items-center mb-4 p-3 rounded"
                style={{ background: "#ffffff", boxShadow: "0 2px 5px rgba(0,0,0,0.1)" }}
            >
                <div className="d-flex align-items-center gap-3">
                    <div
                        style={{
                            position: "relative",
                            width: "80px",
                            height: "80px",
                            borderRadius: "50%",
                            overflow: "hidden",
                            cursor: "pointer",
                            transition: "0.3s",
                            filter: hoverFoto ? "brightness(80%)" : "brightness(100%)"
                        }}
                        onMouseEnter={() => setHoverFoto(true)}
                        onMouseLeave={() => setHoverFoto(false)}
                        onClick={() => setShowModal(true)}
                    >
                        <img
                            src={
                                usuario?.foto
                                    ? usuario.foto.startsWith("http")
                                        ? usuario.foto
                                        : `${backendUrl}${usuario.foto}`
                                    : `${backendUrl}/uploads/default.png`
                            }
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                    </div>
                    <div>
                        <h5 className="mb-0">Olá, <strong>{nome}</strong></h5>
                        <small className="text-muted">Funcionário</small>
                    </div>
                </div>

                <button className="btn btn-danger" onClick={sair}>
                    Sair
                </button>
            </div>
            <div className="row">
                <div className="col-3 d-flex flex-column gap-3">
                    <button
                        className="btn btn-outline-primary p-3 rounded shadow-sm"
                        style={{ fontSize: "1.1rem", fontWeight: "500" }}
                        onClick={() => navigate("/livros")}
                    >
                        📚 Gerenciar Livros
                    </button>
                    <button
                        className="btn btn-outline-primary p-3 rounded shadow-sm"
                        style={{ fontSize: "1.1rem", fontWeight: "500" }}
                        onClick={() => navigate("/usuarios")}
                    >
                        👥 Gerenciar Usuários
                    </button>
                </div>
                <div className="col-9">
                    <div
                        className="p-4 rounded shadow"
                        style={{
                            background: "#ffffff",
                            height: "70vh",
                            overflowY: "auto",
                        }}
                    >
                        <h4 className="text-center mb-4">Reservas</h4>
                        {reservas.length === 0 ? (
                            <div className="alert alert-secondary text-center">
                                Nenhuma reserva ativa.
                            </div>
                        ) : (
                            <div className="d-flex flex-column gap-3">
                                {reservas.map((r) => (
                                    <div
                                        key={r.id}
                                        className="p-3 rounded border shadow-sm position-relative"
                                        style={{ background: "#fafafa" }}
                                    >
                                        <h6 className="mb-1"><strong>{r.livro || "-"}</strong></h6>
                                        <p className="mb-0">Autor: {r.autor || "-"}</p>
                                        <p className="mb-0">Status:{" "}
                                            <span className={`fw-bold ${r.status === "ativa" ? "text-success" : r.status === "finalizada" ? "text-primary" : "text-danger"}`}>
                                                {r.status || "-"}
                                            </span>
                                        </p>
                                        <p className="mb-0">Reservado por <strong>{r.usuario}</strong></p>
                                        <small className="text-muted">
                                            Em: {formatarData(r.data_reserva)}{""}
                                            {r.data_devolucao ? ` | Devolução em: ${formatarData(r.data_devolucao)}` : ""}
                                        </small>
                                        <div className="position-absolute d-flex flex-column gap-2"
                                            style={{
                                                top: "50%",
                                                right: "20px",
                                                transform: "translateY(-50%)"
                                            }}>
                                            {r.status === "ativa" ? (
                                                <>
                                                    <button className="btn btn-success btn-sm" onClick={() => finalizarReserva(r.id)}>
                                                        ✔ Finalizar
                                                    </button>
                                                    <button className="btn btn-danger btn-sm" onClick={() => cancelarReserva(r.id)}>
                                                        ❌ Cancelar
                                                    </button>
                                                </>
                                            ) : (
                                                <button className="btn btn-danger btn-sm" onClick={() => excluirReserva(r.id)}>
                                                    🗑 Excluir
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

            </div>
            {showModal && (
                <div style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    background: "rgba(0,0,0,0.5)",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    zIndex: 999,
                }}>
                    <div style={{
                        background: "white",
                        padding: "20px",
                        borderRadius: "12px",
                        width: "300px",
                    }}>
                        <h4 className="text-center">Alterar foto</h4>

                        <div style={{
                            width: "160px",
                            height: "160px",
                            borderRadius: "50%",
                            overflow: "hidden",
                            margin: "10px auto",
                            border: "2px solid #ccc"
                        }}>
                            {preview ? (
                                <img
                                    src={preview}
                                    style={{
                                        width: `${160 * zoom}px`,
                                        height: `${160 * zoom}px`,
                                        objectFit: "cover",
                                    }}
                                />
                            ) : (
                                <p className="text-center mt-5">Selecione uma foto</p>
                            )}
                        </div>
                        <input type="file" accept="image/*" onChange={handleFile} />
                        {preview && (
                            <>
                                <label className="mt-3">Zoom:</label>
                                <input
                                    type="range"
                                    min="1"
                                    max="2"
                                    step="0.01"
                                    value={zoom}
                                    onChange={(e) => setZoom(e.target.value)}
                                />
                            </>
                        )}
                        <div className="d-flex justify-content-between mt-3">
                            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                                Cancelar
                            </button>
                            <button className="btn btn-primary" disabled={!file} onClick={salvarFoto}>
                                Salvar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FuncionarioHome;