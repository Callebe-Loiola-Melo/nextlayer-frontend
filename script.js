document.addEventListener('DOMContentLoaded', function(){
 
  const WHATSAPP_PHONE = '5511999999999'; //coloca o numero do tell aqui 
  const EMAIL_DESTINO = 'nextlayerempresarial@gmail.com';

  
  const anos = document.querySelectorAll('#ano, #ano2, #ano3, #ano4');
  anos.forEach(el => { if(el) el.textContent = new Date().getFullYear(); });

  
  const contactModal = document.getElementById('contactModal');
  const solicitationModal = document.getElementById('solicitationModal'); 

  
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


  
  function openContactModal() {
    if (contactModal) {
      contactModal.classList.add('active');
      contactModal.setAttribute('aria-hidden', 'false');
    }
  }
  
  
  function openSolicitationModal() {
    if (solicitationModal) {
      solicitationModal.classList.add('active');
      solicitationModal.setAttribute('aria-hidden', 'false');
    }
  }

  
  function closeModal(modalElement) {
    if (modalElement) {
      modalElement.classList.remove('active');
      modalElement.setAttribute('aria-hidden', 'true');
    }
  }

  
  const navContato = document.getElementById('nav-contato');
  if (navContato) {
    navContato.addEventListener('click', (e) => {
      e.preventDefault();
      openContactModal();
    });
  }

  
  // --- NOVO BLOCO PARA CORRIGIR O E-MAIL DO MODAL DE CONTATO ---
  const contactModalEmailButton = document.getElementById('contactModalEmailBtn');
  if (contactModalEmailButton) {
    
    contactModalEmailButton.addEventListener('click', function(e) {
      // 1. Prevenir o 'mailto:' padrão
      e.preventDefault();
      
      // 2. Definir o conteúdo simples do e-mail
      const subject = "Contato via Site Next Layer";
      const body = "Olá, gostaria de entrar em contato.";
      
      // 3. Reutilizar a lógica de detecção
      const isMobile = /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

      if (isMobile) {
          // Se for mobile, usa o 'mailto:' que abre o app
          const mailtoLink = `mailto:${EMAIL_DESTINO}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
          window.location.href = mailtoLink;
      } else {
          // Se for desktop, abre o GMAIL no navegador
          const gmailLink = `https://mail.google.com/mail/?view=cm&fs=1&to=${EMAIL_DESTINO}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
          window.open(gmailLink, '_blank');
      }
      
      // 4. Fechar o modal após clicar
      closeModal(contactModal); 
    });
  }
  // --- FIM DO NOVO BLOCO ---


  
  const openContactBtnHome = document.getElementById('openContactModal');
  if (openContactBtnHome) {
      openContactBtnHome.addEventListener('click', (e) => {
          e.preventDefault();
          openContactModal();
      });
  }

  
  document.querySelectorAll('.modal-close').forEach(button => {
    button.addEventListener('click', (e) => {
      closeModal(e.target.closest('.modal-overlay'));
    });
  });

  
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


  function handleWhatsAppSubmit(formData, formType) {
      let mensagem = `*SOLICITAÇÃO DE ORÇAMENTO (${formType})*%0A%0A`;
      mensagem += `*Nome:* ${formData.nome}%0A`;
      if (formData.empresa) {
          mensagem += `*Empresa:* ${formData.empresa}%0A`;
      }
      mensagem += `*E-mail:* ${formData.email}%0A`;
      mensagem += `*WhatsApp:* ${formData.whatsapp}%0A%0A`;
      mensagem += `*Descrição do Projeto:*%0A${formData.desc}`;
      
      window.open(`https://wa.me/${WHATSAPP_PHONE}?text=${mensagem}`, '_blank');
  }

  /**
   
   * @param {object} formData - Objeto com {nome, empresa, email, whatsapp, desc}
   * @param {string} formType - "Página" ou "Modal" para identificação
   */
  function handleEmailSubmit(formData, formType) {
      const subject = `Solicitação de Orçamento (${formType}) - ${formData.nome}`;
      
      let body = `SOLICITAÇÃO DE ORÇAMENTO (${formType})\n\n`;
      body += `Nome: ${formData.nome}\n`;
      if (formData.empresa) {
          body += `Empresa: ${formData.empresa}\n`;
      }
      body += `E-mail: ${formData.email}\n`;
      body += `WhatsApp: ${formData.whatsapp}\n\n`;
      body += `Descrição do Projeto:\n${formData.desc}`;
      
      const isMobile = /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

      if (isMobile) {
          const mailtoLink = `mailto:${EMAIL_DESTINO}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
          window.location.href = mailtoLink;
      } else {
          console.log("Detectado Desktop. Abrindo link do Gmail.");
          const gmailLink = `https://mail.google.com/mail/?view=cm&fs=1&to=${EMAIL_DESTINO}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
          window.open(gmailLink, '_blank');
      }
  }



  const formPagina = document.getElementById('form-orcamento');
  if (formPagina) {
      const btnWpp = document.getElementById('sendBudgetWpp');
      const btnEmail = document.getElementById('sendBudgetEmail');

      function getFormPaginaData() {
          const nome = formPagina.querySelector('#nome').value.trim();
          const empresa = formPagina.querySelector('#empresa').value.trim(); 
          const email = formPagina.querySelector('#email').value.trim();
          const whatsapp = formPagina.querySelector('#whatsapp').value.trim();
          const desc = formPagina.querySelector('#descricao').value.trim();

          if(!nome || !email || !whatsapp || !desc){ 
              alert('Preencha todos os campos obrigatórios.'); 
              return null; 
          }
          return { nome, empresa, email, whatsapp, desc };
      }

      if(btnWpp) {
          btnWpp.addEventListener('click', (e) => {
              e.preventDefault();
              const data = getFormPaginaData();
              if(data) {
                  handleWhatsAppSubmit(data, "Página");
                  formPagina.reset();
              }
          });
      }
      
      if(btnEmail) {
          btnEmail.addEventListener('click', (e) => {
              e.preventDefault();
              const data = getFormPaginaData();
              if(data) {
                  handleEmailSubmit(data, "Página");
                  formPagina.reset();
              }
          });
      }
  }
  
  
  const formModal = document.getElementById('form-orcamento-modal');
  if (formModal) {
      const btnWpp = document.getElementById('sendBudgetModalWpp');
      const btnEmail = document.getElementById('sendBudgetModalEmail');
      
      function getFormModalData() {
          const nome = formModal.querySelector('#nome-modal').value.trim();
          const empresa = formModal.querySelector('#empresa-modal').value.trim();
          const email = formModal.querySelector('#email-modal').value.trim();
          const whatsapp = formModal.querySelector('#whatsapp-modal').value.trim();
          const desc = formModal.querySelector('#descricao-modal').value.trim();

          if(!nome || !email || !whatsapp || !desc){ 
              alert('Preencha todos os campos obrigatórios.'); 
              return null; 
          }
          return { nome, empresa, email, whatsapp, desc };
      }

      if(btnWpp) {
          btnWpp.addEventListener('click', (e) => {
              e.preventDefault();
              const data = getFormModalData();
              if(data) {
                  handleWhatsAppSubmit(data, "Modal");
                  closeModal(formModal.closest('.modal-overlay'));
                  formModal.reset();
              }
          });
      }
      
      if(btnEmail) {
          btnEmail.addEventListener('click', (e) => {
              e.preventDefault();
              const data = getFormModalData();
              if(data) {
                  handleEmailSubmit(data, "Modal");
                  closeModal(formModal.closest('.modal-overlay'));
                  formModal.reset();
              }
          });
      }
  }


  
  const revealEls = document.querySelectorAll('.animate-entry, .servico-card, .catalog-card, .support-card');
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if(en.isIntersecting){ 
        en.target.classList.add('in-view'); 
        obs.unobserve(en.target);
      }
    });
  }, { threshold: 0.15 });

  revealEls.forEach(el => obs.observe(el));



  
  const mobileContactBtn = document.getElementById('mobile-nav-contato');
  if (mobileContactBtn) {
    mobileContactBtn.addEventListener('click', (e) => {
      e.preventDefault();
      openContactModal(); 
    });
  }

  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

  const pathParts = window.location.pathname.split('/');
  const currentPage = pathParts[pathParts.length - 1] === '' ? 'index.html' : pathParts[pathParts.length - 1];
  
  mobileNavLinks.forEach(link => {
    const linkPage = link.dataset.page; 
    
    if (linkPage === currentPage) {
      link.classList.add('active');
    }
  });



});
//Rany é GAY <3