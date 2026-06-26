import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { api } from "../utils/api";
import jsPDF from "jspdf";

const AlunoHome = () => {
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
                { headers: { Authorization: `Bearer ${token}` }, }
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
            navigate("/"); return;
        }

        const usuarioLocal = JSON.parse(localStorage.getItem("usuario"));
        if (!usuarioLocal) return;

        api.get(`/usuarios/${usuarioLocal.id}`, {
            headers: { Authorization: `Bearer ${token}` }
        }).then(res => {
            const data = res.data;
            console.log("Usuário Fetch:", data);
            setUsuario(data);
            setNome(data.nome);
            localStorage.setItem("usuario", JSON.stringify(data));
        }).catch(err => console.error(err));

        listaReservas(token);
        console.log(token)
    }, []);

    const listaReservas = async (token) => {
        const usuarioLocal = JSON.parse(localStorage.getItem("usuario"));
        if (!usuarioLocal) return;
        try {
            const response = await api.get(`/reservas/usuario/${usuarioLocal.id}`, {
                headers: { "Authorization": "Bearer " + token }
            });

            setReservas(response.data);

        } catch (err) {
            console.error("Erro ao carregar reservas.", err);
            setReservas([]);
        }
    };

    const cancelarReserva = async (idReserva) => {
        const token = localStorage.getItem("token");

        try {
            await api.put(`/reservas/${idReserva}/cancelar`,
                { status: "cancelada" },
                { headers: { "Authorization": "Bearer " + token }, }
            );

            toast.success("Reserva cancelada com sucesso!");
            listaReservas(token);
        } catch (err) { toast.error("Erro ao cancelar reserva."); }
    };

    const renovarReserva = async (idReserva) => {
        const token = localStorage.getItem("token");

        try {
            await api.put(`/reservas/${idReserva}/renovar`, {},
                { headers: { Authorization: `Bearer ${token}` } }
            );

            toast.success("Reserva renovada com sucesso!");
            listaReservas(token);

        } catch (err) { toast.error("Erro ao renovar."); }
    };

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

    const gerarReciboReserva = (reserva) => {
        if (!reserva) {
            toast.error("Nenhuma reserva encontrada para gerar recibo.");
            return;
        }

        const usuarioLocal = JSON.parse(localStorage.getItem("usuario")) || {};
        const doc = new jsPDF();

        // --- CONFIGURAÇÃO DE CORES (Paleta Moderna) ---
        const corPrimaria = [25, 25, 122];    // #449df6
        const corDestaque = [112, 128, 144];  // #95c7f9
        const corLinha = [135, 206, 250];        // #1b3855
        const corFundoCard = [240, 248, 255]; // #acd2f7

        // --- CORPO DO RECIBO ---

        // 1. Cabeçalho com Linha Decorativa
        doc.setFillColor(...corPrimaria);
        doc.rect(20, 15, 170, 2, "F"); // Linha horizontal superior fina

        doc.setFont("Helvetica", "bold");
        doc.setFontSize(22);
        doc.setTextColor(...corPrimaria);
        doc.text("Comprovante de Reserva", 20, 30);

        doc.setFont("Helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(100, 116, 139); // Texto secundário (cinza)
        doc.text(`Emitido em: ${new Date().toLocaleDateString('pt-BR')}`, 190, 30, { align: "right" });

        // Linha divisória
        doc.setDrawColor(...corLinha);
        doc.line(20, 38, 190, 38);

        // 2. Seção: Dados do Aluno
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(...corPrimaria);
        doc.text("DADOS DO ALUNO", 20, 48);

        doc.setFont("Helvetica", "normal");
        doc.setFontSize(11);
        doc.text(`Nome:`, 20, 56);
        doc.setFont("Helvetica", "bold");
        doc.text(`${usuarioLocal.nome || nome || "Desconhecido"}`, 45, 56); // Destaca o nome em negrito

        doc.setFont("Helvetica", "normal");
        doc.text(`E-mail:`, 20, 64);
        doc.setTextColor(71, 85, 105);
        doc.text(`${usuarioLocal.email || "Não informado"}`, 45, 64);

        // 3. Seção: Detalhes do Livro (Dentro de um Card de Fundo)
        doc.setFillColor(...corFundoCard);
        doc.roundedRect(20, 75, 170, 50, 4, 4, "F"); // Caixa de fundo para destacar o livro

        doc.setFont("Helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(...corPrimaria);
        doc.text("DETALHES DA RESERVA", 28, 87);

        doc.setFont("Helvetica", "normal");
        doc.setFontSize(11);
        doc.text(`Livro:`, 28, 97);
        doc.setFont("Helvetica", "bold");
        doc.text(`${reserva.livro || "Não informado"}`, 45, 97);

        doc.setFont("Helvetica", "normal");
        doc.text(`Autor:`, 28, 105);
        doc.text(`${reserva.autor || "Não informado"}`, 45, 105);

        doc.text(`Quantidade:`, 28, 113);
        doc.text("1 un.", 55, 113);

        // Badge/Tag de Status da Reserva
        doc.setFont("Helvetica", "bold");
        doc.text(`Status:`, 130, 87);
        doc.setTextColor(...corDestaque);
        doc.text(`${(reserva.status || "ativa").toUpperCase()}`, 145, 87);

        // 4. Seção: Prazos e Datas
        doc.setTextColor(...corPrimaria);
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(12);
        doc.text("PRAZOS", 20, 142);

        doc.setFont("Helvetica", "normal");
        doc.setFontSize(11);
        doc.text(`Retirada:`, 20, 152);
        doc.setFont("Helvetica", "bold");
        doc.text(`${formatarData(reserva.data_reserva)}`, 45, 152);

        doc.setFont("Helvetica", "normal");
        doc.text(`Devolução:`, 20, 160);
        doc.setFont("Helvetica", "bold");
        doc.setTextColor(185, 28, 28); // Vermelho para a data de devolução alertar
        doc.text(`${formatarData(reserva.data_devolucao)}`, 45, 160);

        // 5. Rodapé Informativo
        doc.setDrawColor(...corLinha);
        doc.line(20, 175, 190, 175);

        doc.setFont("Helvetica", "italic");
        doc.setFontSize(10);
        doc.setTextColor(148, 163, 184);
        doc.text("Este documento é um comprovante digital gerado pelo sistema da biblioteca.", 20, 185);
        doc.text("A não devolução na data estipulada poderá acarretar em suspensão ou multas.", 20, 191);

        // Nome do arquivo
        const nomeArquivo = reserva.livro
            ? reserva.livro.replaceAll(" ", "-").toLowerCase()
            : "livro";

        doc.save(`recibo-reserva-${nomeArquivo}.pdf`);
    };


    return (
        <div
            className="container-fluid p-4"
            style={{ background: "#f4f4f4", minHeight: "100vh" }}
        >
            <div
                className="d-flex justify-content-between align-items-center mb-4 p-3 rounded"
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
                        <small className="text-muted">Aluno</small>
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
                        onClick={() => navigate("/catalogo")}
                    >
                        📚 Catálogo de Livros
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
                        <h4 className="text-center mb-4">Minhas Reservas</h4>
                        {reservas.length === 0 ? (
                            <div className="alert alert-secondary text-center">
                                Você ainda não possui reservas.
                            </div>
                        ) : (
                            <div className="d-flex flex-column gap-3">
                                {reservas.map((r) => (
                                    <div
                                        key={r.id}
                                        className="p-3 rounded border shadow-sm"
                                        style={{ background: "#fafafa" }}
                                    >
                                        <div className="d-flex gap-3 align-items-start">
                                            <img
                                                src={r.capa || "https://via.placeholder.com/80x110?text=Sem+Capa"}
                                                alt={r.livro || "Capa do livro"}
                                                style={{
                                                    width: "80px",
                                                    height: "110px",
                                                    objectFit: "cover",
                                                    borderRadius: "6px",
                                                    border: "1px solid #ddd"
                                                }}
                                                onError={(e) => {
                                                    e.currentTarget.src = "https://via.placeholder.com/80x110?text=Sem+Capa";
                                                }}
                                            />

                                            <div className="flex-grow-1">
                                                <h6 className="mb-1"><strong>{r.livro || "-"}</strong></h6>

                                                <p className="mb-0">Autor: {r.autor || "-"}</p>

                                                {r.genero && (
                                                    <p className="mb-0">Gênero: {r.genero}</p>
                                                )}

                                                <p className="mb-0">
                                                    Status:{" "}
                                                    <span className={`fw-bold ${r.status === "ativa" ? "text-success" : r.status === "finalizada" ? "text-primary" : "text-danger"}`}>
                                                        {r.status || "-"}
                                                    </span>
                                                </p>

                                                <small className="text-muted">
                                                    Reservado em: {formatarData(r.data_reserva)}{" "}
                                                    {r.data_devolucao ? `| Devolução: ${formatarData(r.data_devolucao)}` : ""}
                                                </small>

                                                {r.status === "ativa" && (
                                                    <div className="mt-3 d-flex gap-2">
                                                        <button className="btn btn-success btn-sm" onClick={() => renovarReserva(r.id)}>
                                                            🔄 Renovar
                                                        </button>

                                                        <button className="btn btn-danger btn-sm" onClick={() => cancelarReserva(r.id)}>
                                                            ❌ Cancelar
                                                        </button>

                                                        <button className="btn btn-primary btn-sm" onClick={() => gerarReciboReserva(r)}>
                                                            📄 Baixar Recibo
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
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

export default AlunoHome;