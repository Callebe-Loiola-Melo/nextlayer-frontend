// =============================================================
// --- ADMIN.JS v3.1 (Com correção do closeModal) ---
// =============================================================

const API_URL = 'https://nextlayer-backend-vzle.vercel.app';

// ===============================================
// --- LÓGICA DE LOGIN (Sem alteração) ---
// ===============================================

const loginForm = document.getElementById('login-form');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const login = document.getElementById('login').value;
    const senha = document.getElementById('senha').value;
    const errorMessage = document.getElementById('error-message');
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login, senha }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        localStorage.setItem('nextlayer_token', data.token);
        window.location.href = 'admin.html'; 
      } else {
        errorMessage.textContent = data.error || 'Erro no login.';
        errorMessage.style.display = 'block';
      }
    } catch (error) {
      errorMessage.textContent = 'Não foi possível conectar ao servidor.';
      errorMessage.style.display = 'block';
    }
  });
}

// ===============================================
// --- CÓDIGO DA PÁGINA ADMIN (admin.html) ---
// ===============================================

if (!loginForm) {

  // --- Funções Auxiliares de Segurança ---
  const getToken = () => localStorage.getItem('nextlayer_token');
  
  if (!getToken()) window.location.href = 'login.html';

  const getAuthHeaders = (contentType = 'application/json') => {
    const headers = { 'Authorization': `Bearer ${getToken()}` };
    if (contentType) {
      headers['Content-Type'] = contentType;
    }
    return headers;
  };

  // --- FUNÇÃO ADICIONADA (O conserto do bug) ---
  function closeModal(modalElement) {
    if (modalElement) modalElement.classList.remove('active');
  }
  // --- FIM DA FUNÇÃO ADICIONADA ---


  // --- Lógica de Logout ---
  const logoutButton = document.getElementById('logout-button');
  if (logoutButton) {
    logoutButton.addEventListener('click', () => {
      localStorage.removeItem('nextlayer_token');
      window.location.href = 'login.html';
    });
  }

  // --- Lógica de Navegação (Abas) ---
  const navLinks = document.querySelectorAll('.admin-nav-link');
  const pages = document.querySelectorAll('.admin-page');

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const pageId = link.dataset.page;
      pages.forEach(p => p.style.display = 'none');
      document.getElementById(pageId).style.display = 'block';
      navLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      
      if (pageId === 'page-projetos') fetchAndDisplayProjetos();
      else if (pageId === 'page-pedidos') fetchAndDisplayPedidos();
      else if (pageId === 'page-registros') fetchAndDisplayRegistros();
    });
  });

  // --- Lógica da Página "Projetos" ---
  const projetoForm = document.getElementById('projeto-form');
  const formTitle = document.getElementById('form-title');
  const formSubmitBtn = document.getElementById('form-submit-btn');
  const cancelEditBtn = document.getElementById('cancel-edit-btn');
  const projetoIdInput = document.getElementById('projeto-id');
  const projetosListaDiv = document.getElementById('projetos-lista');
  const successMessage = document.getElementById('success-message');

  async function fetchAndDisplayProjetos() {
    try {
      const response = await fetch(`${API_URL}/api/projetos`, { headers: getAuthHeaders(null) });
      if (response.status === 401 || response.status === 403) return logoutButton.click();
      const projetos = await response.json();
      
      projetosListaDiv.innerHTML = '';
      if (projetos.length === 0) {
        projetosListaDiv.innerHTML = '<p>Nenhum projeto cadastrado.</p>';
        return;
      }
      projetos.forEach(projeto => {
        const el = document.createElement('div');
        el.className = 'projeto-item';
        el.innerHTML = `
          <img src="${API_URL}/uploads/${projeto.imagem_url}" alt="${projeto.nome}">
          <div class="projeto-item-info"><h4>${projeto.nome}</h4><p>${projeto.descricao.substring(0, 50)}...</p></div>
          <div class="projeto-item-actions">
            <button class="action-btn edit-btn" data-id="${projeto.id}">Editar</button>
            <button class="action-btn delete-btn" data-id="${projeto.id}">Apagar</button>
          </div>
        `;
        projetosListaDiv.appendChild(el);
      });
    } catch (err) { projetosListaDiv.innerHTML = '<p style="color: #ff6b6b;">Erro ao carregar projetos.</p>'; }
  }
  async function handleProjetoFormSubmit(e) {
    e.preventDefault();
    const id = projetoIdInput.value;
    const isEditing = !!id;
    const formData = new FormData(projetoForm);
    const url = isEditing ? `${API_URL}/api/projetos/${id}` : `${API_URL}/api/projetos`;
    const method = isEditing ? 'PUT' : 'POST';
    try {
      const response = await fetch(url, { method: method, headers: { 'Authorization': `Bearer ${getToken()}` }, body: formData });
      if (!response.ok) throw new Error('Erro ao salvar.');
      const data = await response.json();
      showSuccessMessage(data.message);
      resetForm();
      fetchAndDisplayProjetos();
    } catch (err) { alert('Erro ao salvar projeto.'); }
  }
  async function deleteProjeto(id) {
    try {
      await fetch(`${API_URL}/api/projetos/${id}`, { method: 'DELETE', headers: getAuthHeaders(null) });
      fetchAndDisplayProjetos();
    } catch (err) { alert('Erro ao apagar projeto.'); }
  }
  function prepareEditForm(itemElement, id) {
    const nome = itemElement.querySelector('h4').textContent;
    const descricao = itemElement.querySelector('p').textContent.replace('...', '');
    projetoForm.querySelector('#nome').value = nome;
    projetoForm.querySelector('#descricao').value = descricao;
    projetoForm.querySelector('#demo_url').value = ''; 
    projetoIdInput.value = id;
    formTitle.textContent = 'Editar Projeto';
    formSubmitBtn.textContent = 'Salvar Alterações';
    cancelEditBtn.style.display = 'block';
    window.scrollTo(0, 0);
  }
  function resetForm() {
    projetoForm.reset(); 
    projetoIdInput.value = ''; 
    formTitle.textContent = 'Adicionar Novo Projeto';
    formSubmitBtn.textContent = 'Adicionar Projeto';
    cancelEditBtn.style.display = 'none';
  }
  function showSuccessMessage(message) {
    successMessage.textContent = message;
    successMessage.style.display = 'block';
    setTimeout(() => { successMessage.style.display = 'none'; }, 3000);
  }
  // Listeners da página Projetos
  projetoForm.addEventListener('submit', handleProjetoFormSubmit);
  cancelEditBtn.addEventListener('click', resetForm);
  projetosListaDiv.addEventListener('click', (e) => {
    if (e.target.classList.contains('delete-btn')) {
      const id = e.target.dataset.id;
      if (confirm('Tem certeza?')) deleteProjeto(id);
    }
    if (e.target.classList.contains('edit-btn')) {
      const id = e.target.dataset.id;
      const item = e.target.closest('.projeto-item');
      prepareEditForm(item, id);
    }
  });

  // --- Lógica da Página "Pedidos" ---
  const pedidosListaDiv = document.getElementById('pedidos-lista');
  
  async function fetchAndDisplayPedidos() {
    try {
      const response = await fetch(`${API_URL}/api/pedidos`, { headers: getAuthHeaders(null) });
      if (response.status === 401 || response.status === 403) return logoutButton.click();
      const pedidos = await response.json();
      
      pedidosListaDiv.innerHTML = '';
      if (pedidos.length === 0) {
        pedidosListaDiv.innerHTML = '<p>Nenhum pedido pendente.</p>';
        return;
      }
      
      pedidos.forEach(pedido => {
        const el = document.createElement('div');
        el.className = 'admin-list-item';
        el.dataset.id = pedido.id;
        el.dataset.status = pedido.status;
        const dataPedido = new Date(pedido.created_at).toLocaleDateString('pt-BR');
        
        el.innerHTML = `
          <h4>${pedido.nome}</h4>
          <span class="item-data">${dataPedido}</span>
          <select class="status-select">
            <option value="Pendente" ${pedido.status === 'Pendente' ? 'selected' : ''}>Pendente</option>
            <option value="Em Produção" ${pedido.status === 'Em Produção' ? 'selected' : ''}>Em Produção</option>
            <option value="Finalizado" ${pedido.status === 'Finalizado' ? '' : ''}>Finalizado</option>
          </select>
          <div class="item-actions">
            <button class="action-btn edit-btn" data-id="${pedido.id}">Detalhes</button>
          </div>
        `;
        pedidosListaDiv.appendChild(el);
      });
    } catch (err) {
      pedidosListaDiv.innerHTML = '<p style="color: #ff6b6b;">Erro ao carregar pedidos.</p>';
    }
  }

  // Listener para MUDAR O STATUS
  pedidosListaDiv.addEventListener('change', async (e) => {
    if (e.target.classList.contains('status-select')) {
      const select = e.target;
      const novoStatus = select.value;
      const card = select.closest('.admin-list-item');
      const pedidoId = card.dataset.id;
      
      if (!confirm(`Tem certeza que quer mudar o status para "${novoStatus}"?`)) {
        select.value = card.dataset.status;
        return;
      }
      
      try {
        await fetch(`${API_URL}/api/pedidos/${pedidoId}/status`, {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify({ status: novoStatus })
        });
        fetchAndDisplayPedidos();
      } catch (err) {
        alert('Não foi possível atualizar o status.');
      }
    }
  });

  // Listener para ABRIR O MODAL DE PEDIDOS
  pedidosListaDiv.addEventListener('click', (e) => {
    if (e.target.classList.contains('edit-btn')) {
      const id = e.target.dataset.id;
      openPedidoModal(id);
    }
  });

  // --- Lógica da Página "Registros" ---
  const registrosListaDiv = document.getElementById('registros-lista');

  async function fetchAndDisplayRegistros() {
    try {
      const response = await fetch(`${API_URL}/api/registros`, { headers: getAuthHeaders(null) });
      if (response.status === 401 || response.status === 403) return logoutButton.click();
      const registros = await response.json();
      
      registrosListaDiv.innerHTML = '';
      if (registros.length === 0) {
        registrosListaDiv.innerHTML = '<p>Nenhum registro encontrado.</p>';
        return;
      }
      
      registros.forEach(reg => {
        const el = document.createElement('div');
        el.className = 'admin-list-item';
        el.dataset.type = 'registro';
        el.innerHTML = `
          <h4>${reg.nome}</h4>
          <div class="item-actions">
            <button class="action-btn edit-btn" data-id="${reg.id}">Detalhes</button>
            <button class="action-btn delete-btn" data-id="${reg.id}">Apagar</button>
          </div>
        `;
        registrosListaDiv.appendChild(el);
      });
    } catch (err) {
      registrosListaDiv.innerHTML = '<p style="color: #ff6b6b;">Erro ao carregar registros.</p>';
    }
  }
  
  // Listener para ABRIR MODAL e APAGAR REGISTROS
  registrosListaDiv.addEventListener('click', async (e) => {
    if (e.target.classList.contains('delete-btn')) {
      const id = e.target.dataset.id;
      if (confirm('Tem certeza que deseja apagar este registro? Esta ação não pode ser desfeita.')) {
        try {
          await fetch(`${API_URL}/api/registros/${id}`, { method: 'DELETE', headers: getAuthHeaders(null) });
          fetchAndDisplayRegistros();
        } catch (err) {
          alert('Não foi possível apagar o registro.');
        }
      }
    }
    if (e.target.classList.contains('edit-btn')) {
      const id = e.target.dataset.id;
      openRegistroModal(id);
    }
  });

  // --- LÓGICA DO MODAL DE DETALHES ---
  const detailsModal = document.getElementById('details-modal');
  const detailsModalBody = document.getElementById('details-modal-body');
  const closeDetailsModalBtn = document.getElementById('close-details-modal');

  const formatarData = (dataISO) => {
    if (!dataISO) return 'N/A';
    return new Date(dataISO).toLocaleString('pt-BR');
  };

  // Função para ABRIR O MODAL DE PEDIDO
  async function openPedidoModal(id) {
    detailsModalBody.innerHTML = '<p>Carregando...</p>';
    detailsModal.classList.add('active');

    const response = await fetch(`${API_URL}/api/pedidos/${id}`, { headers: getAuthHeaders(null) });
    const pedido = await response.json();

    detailsModalBody.innerHTML = `
      <h3>${pedido.nome}</h3>
      <div class="details-sub">
        Pedido recebido em: ${formatarData(pedido.created_at)}
      </div>
      <div class="details-grid">
        <div class="details-item"><strong>E-mail:</strong> <span>${pedido.email}</span></div>
        <div class="details-item"><strong>WhatsApp:</strong> <span>${pedido.whatsapp || 'N/A'}</span></div>
        <div class="details-item" colspan="2"><strong>Empresa:</strong> <span>${pedido.empresa || 'N/A'}</span></div>
      </div>
      <div class="details-item full">
        <strong>Descrição do Projeto:</strong>
        <p>${pedido.descricao}</p>
      </div>
      
      <form class="dev-form" data-id="${pedido.id}">
        <div class="form-group">
          <label for="dev_responsavel">Dev Responsável</label>
          <input type="text" id="dev_responsavel" class="form-group-input" value="${pedido.dev_responsavel || ''}">
        </div>
        <button type="submit" class="cta-button" style="width: auto;">Salvar Dev</button>
      </form>
    `;
    
    detailsModalBody.querySelector('.dev-form').addEventListener('submit', handleDevFormSubmit);
  }
  
  // Função para ABRIR O MODAL DE REGISTRO
  async function openRegistroModal(id) {
    detailsModalBody.innerHTML = '<p>Carregando...</p>';
    detailsModal.classList.add('active');
    
    const response = await fetch(`${API_URL}/api/registros/${id}`, { headers: getAuthHeaders(null) });
    const reg = await response.json();

    detailsModalBody.innerHTML = `
      <h3>${reg.nome} (Registro Finalizado)</h3>
      <div class="details-sub">
        Finalizado em: ${formatarData(reg.finalizado_at)}
      </div>
      <div class="details-grid">
        <div class="details-item"><strong>E-mail:</strong> <span>${reg.email}</span></div>
        <div class="details-item"><strong>WhatsApp:</strong> <span>${reg.whatsapp || 'N/A'}</span></div>
        <div class="details-item"><strong>Empresa:</strong> <span>${reg.empresa || 'N/A'}</span></div>
        <div class="details-item"><strong>Dev Responsável:</strong> <span>${reg.dev_responsavel || 'N/A'}</span></div>
        <div class="details-item"><strong>Data Recebimento:</strong> <span>${formatarData(reg.created_at)}</span></div>
        <div class="details-item"><strong>Data Produção:</strong> <span>${formatarData(reg.data_producao)}</span></div>
      </div>
      <div class="details-item full">
        <strong>Descrição do Projeto:</strong>
        <p>${reg.descricao}</p>
      </div>
    `;
  }
  
  // Função para SALVAR O DEV
  async function handleDevFormSubmit(e) {
    e.preventDefault();
    const id = e.target.dataset.id;
    const dev = e.target.querySelector('#dev_responsavel').value;
    
    try {
      await fetch(`${API_URL}/api/pedidos/${id}/dev`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ dev_responsavel: dev })
      });
      
      alert('Dev salvo com sucesso!');
      
      // MUDANÇA: Agora o closeModal(detailsModal) vai funcionar!
      closeModal(detailsModal); 
      
    } catch (err) {
      // O "erro" falso não deve mais acontecer
      alert('Erro ao salvar o dev.');
    }
  }

  // Listener para FECHAR O MODAL DE DETALHES
  closeDetailsModalBtn.addEventListener('click', () => closeModal(detailsModal));


  // --- Inicialização ---
  fetchAndDisplayProjetos(); // Carrega a aba padrão

} // Fim do if (!loginForm)