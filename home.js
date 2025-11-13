document.addEventListener('DOMContentLoaded', () => {
        
    // REVERTIDO: Voltamos para o localhost
    const API_URL = 'https://nextlayer-backend-production-c450.up.railway.app';
    const recentesGrid = document.getElementById('recentes-grid'); 
    
    async function carregarProjetosRecentes() {
        if (!recentesGrid) {
            console.error('Elemento #recentes-grid não encontrado.');
            return;
        }

        try {
            const response = await fetch(`${API_URL}/api/projetos/recentes`);
            if (!response.ok) {
                throw new Error('Falha ao carregar dados do servidor.');
            }
            
            const projetos = await response.json();
            recentesGrid.innerHTML = '';

            if (projetos.length === 0) {
                return; 
            }

            projetos.forEach(projeto => {
                const imageUrl = `${API_URL}/uploads/${projeto.imagem_url}`;
                
                const cardHTML = `
                    <a href="catalogo.html?projeto=${projeto.id}" style="text-decoration: none;">
                      <figure class="portfolio-card animate-entry">
                        <img src="${imageUrl}" alt="${projeto.nome}" />
                        <figcaption>${projeto.nome}</figcaption>
                      </figure>
                    </a>
                `;
                
                recentesGrid.innerHTML += cardHTML;
            });

        } catch (error) {
            console.error('Erro ao carregar projetos recentes:', error);
            recentesGrid.innerHTML = '<p style="color: #ff6b6b; grid-column: 1 / -1;">Não foi possível carregar os projetos. O backend está ligado?</p>';
        }
    }

    // 4. Chamar a função
    carregarProjetosRecentes();
});