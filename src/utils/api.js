export async function api(url, options = {}, navigate) {
    const token = localStorage.getItem("token");

    const headers = {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
        ...options.headers
    };

    const response = await fetch(url, { ...options, headers });
    
    if (response.status === 401) {
        alert("Sessão expirada, faça login novamente.");
        localStorage.removeItem("token");
        navigate("/");
        return null;
    }

    return response;
}
