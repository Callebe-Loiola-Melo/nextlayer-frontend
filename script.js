document.addEventListener('DOMContentLoaded', function(){
 
  const API_URL = 'https://nextlayer-backend-vzle.vercel.app'; 
  const EMAIL_DESTINO = 'nextlayerempresarial@gmail.com';

  const anos = document.querySelectorAll('#ano, #ano2, #ano3, #ano4');
  anos.forEach(el => { if(el) el.textContent = new Date().getFullYear(); });

  // --- Modais ---
  const contactModal = document.getElementById('contactModal');
  const solicitationModal = document.getElementById('solicitationModal');
  // NOVO: Modal de Sucesso
  const successModal = document.getElementById('success-modal');
  const closeSuccessModalBtn = document.getElementById('close-success-modal');

  try {
    const urlParams = new URLSearchParams(window.location.search);
    const modeloQuery = urlParams.get('modelo');
    const descTextarea = document.getElementById('descricao'); 
    if (modeloQuery && descTextarea) {
        descTextarea.value = `Olá! Gostaria de um orçamento baseado no modelo: "${modeloQuery}".\n\n[Descreva aqui o restante do seu projeto...]`;
        descTextarea.focus();
    }
  } catch (e) {
    console.warn("Erro ao ler parâmetros da URL:", e);
  }

  // --- Funções de Abrir/Fechar Modais ---
  function openContactModal() {
    if (contactModal) contactModal.classList.add('active');
  }
  function openSolicitationModal() {
    if (solicitationModal) solicitationModal.classList.add('active');
  }
  
  // NOVA Função para o modal de sucesso
  function openSuccessModal() {
    if (successModal) successModal.classList.add('active');
  }
  
  function closeModal(modalElement) {
    if (modalElement) modalElement.classList.remove('active');
  }
  
  // Listener para fechar o modal de sucesso
  if (closeSuccessModalBtn) {
    closeSuccessModalBtn.addEventListener('click', () => closeModal(successModal));
  }

  // --- Listeners dos botões de navegação ---
  const navContato = document.getElementById('nav-contato');
  if (navContato) {
    navContato.addEventListener('click', (e) => { e.preventDefault(); openContactModal(); });
  }
  const openContactBtnHome = document.getElementById('openContactModal');
  if (openContactBtnHome) {
    openContactBtnHome.addEventListener('click', (e) => { e.preventDefault(); openContactModal(); });
  }
  document.querySelectorAll('.modal-close').forEach(button => {
    button.addEventListener('click', (e) => {
      closeModal(e.target.closest('.modal-overlay'));
    });
  });

  // --- Lógica do Menu Mobile ---
  const mobileBtn = document.querySelector('.mobile-nav-trigger');
  const navList = document.getElementById('nav-list');
  if(mobileBtn && navList){
    mobileBtn.addEventListener('click', () => {
      const open = mobileBtn.getAttribute('aria-expanded') === 'true';
      mobileBtn.setAttribute('aria-expanded', String(!open));
      navList.style.display = open ? 'none' : 'flex';
    });
    window.addEventListener('resize', () => {
        if(window.innerWidth > 720){ navList.style.display = 'flex'; }
        else if(mobileBtn.getAttribute('aria-expanded') === 'false'){ navList.style.display = 'none'; }
    });
  }

  // --- Lógica do E-mail do Modal de Contato ---
  const contactModalEmailButton = document.getElementById('contactModalEmailBtn');
  if (contactModalEmailButton) {
    contactModalEmailButton.addEventListener('click', function(e) {
      e.preventDefault();
      const subject = "Contato via Site Next Layer";
      const body = "Olá, gostaria de entrar em contato.";
      const isMobile = /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      if (isMobile) {
          const mailtoLink = `mailto:${EMAIL_DESTINO}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
          window.location.href = mailtoLink;
      } else {
          const gmailLink = `https://mail.google.com/mail/?view=cm&fs=1&to=${EMAIL_DESTINO}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
          window.open(gmailLink, '_blank');
      }
      closeModal(contactModal); 
    });
  }

  // --- LÓGICA DE ENVIO DO ORÇAMENTO (Atualizada) ---
  
  async function handleBudgetSubmit(form, messageEl, submitBtn) {
      const data = {
          nome: form.querySelector('[name="nome"]').value,
          empresa: form.querySelector('[name="empresa"]').value,
          email: form.querySelector('[name="email"]').value,
          whatsapp: form.querySelector('[name="whatsapp"]').value,
          descricao: form.querySelector('[name="descricao"]').value
      };

      if(!data.nome || !data.email || !data.descricao){
          messageEl.textContent = 'Por favor, preencha os campos obrigatórios.';
          messageEl.style.color = '#ff6b6b';
          messageEl.style.display = 'block';
          return;
      }
      
      submitBtn.textContent = 'Enviando...';
      submitBtn.disabled = true;
      messageEl.style.display = 'none';

      try {
          const response = await fetch(`${API_URL}/api/pedidos`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data),
          });

          if (!response.ok) throw new Error('Erro no servidor. Tente novamente.');

          // SUCESSO!
          form.reset(); 
          if(form.id === 'form-orcamento-modal') {
             closeModal(solicitationModal); // Fecha o modal de orçamento
          }
          openSuccessModal(); // <-- ABRE O NOVO MODAL DE SUCESSO

      } catch (error) {
          // ERRO!
          console.error('Erro ao enviar pedido:', error);
          messageEl.textContent = 'Erro ao enviar. Verifique sua conexão ou tente mais tarde.';
          messageEl.style.display = 'block';
      } finally {
          // Reabilita o botão
          submitBtn.textContent = 'Enviar Pedido de Orçamento';
          submitBtn.disabled = false;
      }
  }

  // Manipulador do Formulário da Página (criacao.html)
  const formPagina = document.getElementById('form-orcamento');
  if (formPagina) {
      const messageEl = document.getElementById('form-message');
      const submitBtn = document.getElementById('sendBudget');
      formPagina.addEventListener('submit', (e) => {
          e.preventDefault();
          handleBudgetSubmit(formPagina, messageEl, submitBtn);
      });
  }
  
  // Manipulador do Formulário do Modal (todas as páginas)
  const formModal = document.getElementById('form-orcamento-modal');
  if (formModal) {
      const messageElModal = document.getElementById('form-message-modal');
      const submitBtnModal = document.getElementById('sendBudgetModal');
      formModal.addEventListener('submit', (e) => {
          e.preventDefault();
          handleBudgetSubmit(formModal, messageElModal, submitBtnModal);
      });
  }

  // --- Lógica da Barra Mobile ---
  const mobileContactBtn = document.getElementById('mobile-nav-contato');
  if (mobileContactBtn) {
    mobileContactBtn.addEventListener('click', (e) => { e.preventDefault(); openContactModal(); });
  }
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
  const pathParts = window.location.pathname.split('/');
  const currentPage = pathParts[pathParts.length - 1] === '' ? 'index.html' : pathParts[pathParts.length - 1];
  mobileNavLinks.forEach(link => {
    const linkPage = link.dataset.page; 
    if (linkPage === currentPage) link.classList.add('active');
  });

  // --- CÓDIGO DA ANIMAÇÃO (QUE FOI APAGADO) ---
  // Este é o código que vai consertar seus "serviços apagados"
  const revealEls = document.querySelectorAll('.animate-entry, .servico-card, .catalog-card');
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if(en.isIntersecting){ 
        en.target.classList.add('in-view'); 
        obs.unobserve(en.target);
      }
    });
  }, { threshold: 0.15 });

  revealEls.forEach(el => obs.observe(el));
  // --- FIM DO CÓDIGO DA ANIMAÇÃO ---

});
//Rany é GAY <3