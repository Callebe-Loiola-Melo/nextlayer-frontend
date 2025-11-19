document.addEventListener('DOMContentLoaded', () => {
        
    // URL do seu Back-end no Netlify
    const API_URL = 'https://nextlayerbackend.netlify.app';
    const catalogoGrid = document.getElementById('catalogo-grid');
    
    // --- Elementos do Modal ---
    const modal = document.getElementById('projeto-modal');
    const modalImagem = document.getElementById('modal-imagem');
    const modalTitulo = document.getElementById('modal-titulo');
    const modalDescricao = document.getElementById('modal-descricao');
    const modalShowMore = document.getElementById('modal-show-more');
    const modalBtnPersonalizar = document.getElementById('modal-btn-personalizar');
    const modalBtnDemo = document.getElementById('modal-btn-demo');
    const modalBtnClose = document.getElementById('close-projeto-modal');

    // --- Função para ABRIR o modal com dados ---
    async function abrirModalProjeto(projetoId) {
        if (!projetoId || !modal) return;

        modal.classList.add('active');
        modalTitulo.textContent = 'Carregando...';
        modalDescricao.textContent = '...';
        modalImagem.src = '';
        modalShowMore.style.display = 'none';
        modalDescricao.classList.remove('expanded');

        try {
            const response = await fetch(`${API_URL}/api/projetos/${projetoId}`);
            if (!response.ok) throw new Error('Projeto não encontrado.');
            
            const projeto = await response.json();

            // --- CORREÇÃO DA IMAGEM (NO MODAL) ---
            modalImagem.src = projeto.imagem_url.startsWith('http')
                ? projeto.imagem_url
                : `${API_URL}/uploads/${projeto.imagem_url}`;

            modalImagem.alt = projeto.nome;
            modalTitulo.textContent = projeto.nome;
            modalDescricao.textContent = projeto.descricao;
            
            modalBtnPersonalizar.href = `criacao.html?modelo=${encodeURIComponent(projeto.nome)}`;
            modalBtnDemo.href = projeto.demo_url;
            
            setTimeout(() => {
                if (modalDescricao.scrollHeight > 105) { 
                    modalShowMore.style.display = 'block';
                    modalShowMore.textContent = 'Mostrar mais';
                }
            }, 1); 

        } catch (error) {
            console.error('Erro ao buscar detalhes do projeto:', error);
            modalTitulo.textContent = 'Erro';
            modalDescricao.textContent = 'Não foi possível carregar os detalhes deste projeto.';
        }
    }

    // --- Função para FECHAR o modal ---
    function fecharModalProjeto() {
        if (modal) {
            modal.classList.remove('active');
        }
    }

    // --- Lógica do botão "Mostrar Mais" ---
    if (modalShowMore) {
        modalShowMore.addEventListener('click', () => {
            modalDescricao.classList.toggle('expanded');
            if (modalDescricao.classList.contains('expanded')) {
                modalShowMore.textContent = 'Mostrar menos';
            } else {
                modalShowMore.textContent = 'Mostrar mais';
            }
        });
    }
    
    // --- Lógica do botão de FECHAR ---
    if (modalBtnClose) {
        modalBtnClose.addEventListener('click', fecharModalProjeto);
    }

    // --- Função para carregar o GRID ---
    async function carregarProjetos() {
        if (!catalogoGrid) return;

        try {
            const response = await fetch(`${API_URL}/api/projetos`);
            if (!response.ok) throw new Error('Falha ao carregar dados.');
            
            const projetos = await response.json();
            catalogoGrid.innerHTML = '';

            if (projetos.length === 0) {
                catalogoGrid.innerHTML = '<p>Nenhum projeto no catálogo no momento.</p>';
                return;
            }

            projetos.forEach(projeto => {
                const card = document.createElement('article');
                card.className = 'catalog-card animate-entry';
                card.dataset.id = projeto.id;
                card.style.cursor = 'pointer'; 
                
                // --- CORREÇÃO DA IMAGEM (NO CARD) ---
                const imageUrl = projeto.imagem_url.startsWith('http')
                    ? projeto.imagem_url
                    : `${API_URL}/uploads/${projeto.imagem_url}`;

                const descCurta = projeto.descricao.substring(0, 60) + '...';
                
                card.innerHTML = `
                    <img src="${imageUrl}" alt="${projeto.nome}" />
                    <h3>${projeto.nome}</h3>
                    <p>${projeto.descricao}</p>
                    <small class="card-show-more-prompt">Clique para ver a descrição completa.</small>
                    <div class="card-actions">
                        <a class="cta-button" href="criacao.html?modelo=${encodeURIComponent(projeto.nome)}">Personalizar</a>
                        <a class="cta-outline" href="${projeto.demo_url}" target="_blank">Demo</a>
                    </div>
                `;
                
                catalogoGrid.appendChild(card);
            });

            // Lógica de clique inteligente
            catalogoGrid.addEventListener('click', (e) => {
                const clicouNoLink = e.target.closest('a');
                if (clicouNoLink) {
                    return; 
                }
                const clicouNoCard = e.target.closest('.catalog-card');
                if (clicouNoCard) {
                    e.preventDefault(); 
                    const projetoId = clicouNoCard.dataset.id;
                    abrirModalProjeto(projetoId);
                }
            });

        } catch (error) {
            console.error('Erro ao carregar projetos:', error);
            catalogoGrid.innerHTML = '<p style="color: #ff6b6b;">Não foi possível carregar os projetos.</p>';
        }
    }

    // --- PONTO DE INÍCIO DE TUDO ---
    
    carregarProjetos();

    const urlParams = new URLSearchParams(window.location.search);
    const projetoIdParaAbrir = urlParams.get('projeto');

    if (projetoIdParaAbrir) {
        setTimeout(() => {
            abrirModalProjeto(projetoIdParaAbrir);
        }, 500); 
    }
});