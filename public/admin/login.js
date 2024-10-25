document.getElementById("login-btn").addEventListener("click", async () => {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  // Buscar o token CSRF antes de enviar o login
  const csrfResponse = await fetch("/api/csrf-token");
  const csrfData = await csrfResponse.json();
  const csrfToken = csrfData.csrfToken;

  try {
    const response = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "CSRF-Token": csrfToken, // Envia o token CSRF no cabeçalho
      },
      body: JSON.stringify({ username, password }),
    });

    if (response.ok) {
      console.log("Login bem-sucedido"); // Log para verificar sucesso
      window.location.href = "/admin"; // Redireciona para a tela de admin
    } else {
      console.log("Login falhou"); // Log para verificar falha
      document.getElementById("login-error").style.display = "block"; // Exibe mensagem de erro
    }
  } catch (error) {
    console.error("Erro ao fazer login:", error);
  }
});
