// URL da nossa API (rodando em localhost:3000)
const API_URL = 'http://localhost:3000';

// --- ELEMENTOS DO DOM ---
const projetoForm = document.getElementById('projeto-form');
const formTitle = document.getElementById('form-title');
const formSubmitBtn = document.getElementById('form-submit-btn');
const cancelEditBtn = document.getElementById('cancel-edit-btn');
const projetoIdInput = document.getElementById('projeto-id');
const projetosListaDiv = document.getElementById('projetos-lista');
const successMessage = document.getElementById('success-message');

// --- LÓGICA DE LOGIN/LOGOUT E PROTEÇÃO (Igual a antes) ---
const currentPage = window.location.pathname.split('/').pop();

if (currentPage === 'admin.html') {
  if (!sessionStorage.getItem('nextlayer_auth')) {
    window.location.href = 'login.html';
  }
}

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
        sessionStorage.setItem('nextlayer_auth', 'true');
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

const logoutButton = document.getElementById('logout-button');
if (logoutButton) {
  logoutButton.addEventListener('click', () => {
    sessionStorage.removeItem('nextlayer_auth');
    window.location.href = 'login.html';
  });
}

// ----------------------------------------------------
// --- NOVO: LÓGICA DA PÁGINA ADMIN (CRUD) ---
// ----------------------------------------------------

// Função 1: Buscar e Mostrar os projetos na lista
async function fetchAndDisplayProjetos() {
  // Garante que só rode na página admin
  if (!projetosListaDiv) return;

  try {
    const response = await fetch(`${API_URL}/api/projetos`);
    if (!response.ok) throw new Error('Erro ao buscar projetos.');
    
    const projetos = await response.json();
    
    // Limpa a lista (tira o "Carregando...")
    projetosListaDiv.innerHTML = '';

    if (projetos.length === 0) {
      projetosListaDiv.innerHTML = '<p>Nenhum projeto cadastrado ainda.</p>';
      return;
    }

    // Cria o HTML de cada item
    projetos.forEach(projeto => {
      const projetoElement = document.createElement('div');
      projetoElement.className = 'projeto-item';
      
      // A mágica: construímos a URL da imagem baseada no nosso backend
      const imageUrl = `${API_URL}/uploads/${projeto.imagem_url}`;
      
      projetoElement.innerHTML = `
        <img src="${imageUrl}" alt="${projeto.nome}">
        <div class="projeto-item-info">
          <h4>${projeto.nome}</h4>
          <p>${projeto.descricao.substring(0, 50)}...</p>
        </div>
        <div class="projeto-item-actions">
          <button class="action-btn edit-btn" data-id="${projeto.id}">Editar</button>
          <button class="action-btn delete-btn" data-id="${projeto.id}">Apagar</button>
        </div>
      `;
      projetosListaDiv.appendChild(projetoElement);
    });

  } catch (error) {
    console.error('Erro:', error);
    projetosListaDiv.innerHTML = '<p style="color: #ff6b6b;">Erro ao carregar projetos.</p>';
  }
}

// Função 2: Lidar com o envio do formulário (Adicionar OU Editar)
async function handleFormSubmit(e) {
  e.preventDefault();

  const id = projetoIdInput.value; // Pega o ID (se estiver editando)
  const isEditing = !!id; // Se tem ID, estamos editando

  // --- MÁGICA DO UPLOAD ---
  // Não usamos JSON.stringify. Usamos FormData!
  const formData = new FormData(projetoForm);
  // Não precisamos de 'Content-Type', o navegador cuida disso
  
  const url = isEditing ? `${API_URL}/api/projetos/${id}` : `${API_URL}/api/projetos`;
  const method = isEditing ? 'PUT' : 'POST';

  try {
    const response = await fetch(url, {
      method: method,
      body: formData,
      // Note: SEM 'headers' de Content-Type
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Erro no servidor');
    }

    const data = await response.json();
    
    // Sucesso!
    showSuccessMessage(data.message);
    resetForm();
    fetchAndDisplayProjetos(); // Recarrega a lista

  } catch (error) {
    console.error('Erro ao salvar:', error);
    alert(`Erro: ${error.message}`);
  }
}

// Função 3: Lidar com cliques na lista (Editar ou Apagar)
function handleListClick(e) {
  const target = e.target;

  // Se clicou no botão de APAGAR
  if (target.classList.contains('delete-btn')) {
    const id = target.dataset.id;
    if (confirm('Tem certeza que deseja apagar este projeto?')) {
      deleteProjeto(id);
    }
  }

  // Se clicou no botão de EDITAR
  if (target.classList.contains('edit-btn')) {
    const id = target.dataset.id;
    // Pega o elemento-pai
    const item = target.closest('.projeto-item');
    // Prepara o formulário para edição
    prepareEditForm(item, id);
  }
}

// Função 4: Apagar um projeto
async function deleteProjeto(id) {
  try {
    const response = await fetch(`${API_URL}/api/projetos/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Erro ao apagar');
    
    fetchAndDisplayProjetos(); // Recarrega a lista
    
  } catch (error) {
    console.error('Erro:', error);
    alert('Não foi possível apagar o projeto.');
  }
}

// Função 5: Preparar o formulário para edição
function prepareEditForm(itemElement, id) {
  // Pega os dados do item (do HTML mesmo)
  const nome = itemElement.querySelector('.projeto-item-info h4').textContent;
  const descricao = itemElement.querySelector('.projeto-item-info p').textContent.replace('...', ''); 
  // (Nota: Isso é simples. O ideal seria buscar o objeto completo)
  
  // Preenche o formulário
  projetoForm.querySelector('#nome').value = nome;
  projetoForm.querySelector('#descricao').value = descricao; 
  projetoForm.querySelector('#demo_url').value = ''; // (Não temos essa info, o usuário preenche de novo)
  projetoIdInput.value = id; // O mais importante: guarda o ID

  // Muda a UI do formulário
  formTitle.textContent = 'Editar Projeto';
  formSubmitBtn.textContent = 'Salvar Alterações';
  cancelEditBtn.style.display = 'block';
  
  // Rola a tela para o topo, onde está o formulário
  window.scrollTo(0, 0);
}

// Função 6: Resetar o formulário (para Adicionar ou Cancelar)
function resetForm() {
  projetoForm.reset(); // Limpa os campos
  projetoIdInput.value = ''; // Limpa o ID escondido
  
  formTitle.textContent = 'Adicionar Novo Projeto';
  formSubmitBtn.textContent = 'Adicionar Projeto';
  cancelEditBtn.style.display = 'none';
}

// Função 7: Mostrar mensagem de sucesso
function showSuccessMessage(message) {
  successMessage.textContent = message;
  successMessage.style.display = 'block';
  setTimeout(() => {
    successMessage.style.display = 'none';
  }, 3000);
}


// --- INICIALIZAÇÃO DA PÁGINA ADMIN ---
if (currentPage === 'admin.html') {
  // 1. Carrega a lista de projetos assim que a página abre
  document.addEventListener('DOMContentLoaded', fetchAndDisplayProjetos);
  
  // 2. Escuta o envio do formulário
  projetoForm.addEventListener('submit', handleFormSubmit);

  // 3. Escuta cliques na lista (para Editar e Apagar)
  projetosListaDiv.addEventListener('click', handleListClick);

  // 4. Escuta o clique no botão "Cancelar Edição"
  cancelEditBtn.addEventListener('click', resetForm);
}