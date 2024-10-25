export function openSidebar() {
    document.getElementById("sidebar").classList.add('open');
}

export function closeSidebar() {
    document.getElementById("sidebar").classList.remove('open');
}

export function toggleSidebar() {
    const sidebar = document.getElementById("sidebar");
    if (sidebar.classList.contains('open')) {
        closeSidebar();
    } else {
        openSidebar();
    }
}

// Associar evento de clique ao botão de fechar quando o documento carregar
document.addEventListener('DOMContentLoaded', () => {
    const closeBtn = document.getElementById('closeSidebarBtn');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeSidebar);  // Associa o clique ao botão de fechar
    }
});