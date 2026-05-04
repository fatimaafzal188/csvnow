// ── BILLING TOGGLE ──
let isAnnual = false;

function toggleBilling() {
  isAnnual = !isAnnual;

  const track = document.getElementById('billing-toggle');
  const lblMo = document.getElementById('lbl-mo');
  const lblYr = document.getElementById('lbl-yr');
  const proPrice = document.getElementById('pro-price');
  const bizPrice = document.getElementById('biz-price');
  const proNote = document.getElementById('pro-note');
  const bizNote = document.getElementById('biz-note');

  if (isAnnual) {
    track.classList.add('annual');
    lblMo.classList.remove('active');
    lblYr.classList.add('active');
    proPrice.textContent = '$8.40';
    bizPrice.textContent = '$34.30';
    proNote.innerHTML = '<s style="color:#94a3b8">$144/yr</s> &nbsp;$100.80/yr — save $43.20';
    bizNote.innerHTML = '<s style="color:#94a3b8">$588/yr</s> &nbsp;$411.60/yr — save $176.40';
  } else {
    track.classList.remove('annual');
    lblMo.classList.add('active');
    lblYr.classList.remove('active');
    proPrice.textContent = '$12';
    bizPrice.textContent = '$49';
    proNote.textContent = 'Billed monthly';
    bizNote.textContent = 'Billed monthly';
  }
}

// ── SMOOTH NAV HIGHLIGHT ──
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');

window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(section => {
    if (window.scrollY >= section.offsetTop - 80) {
      current = section.getAttribute('id');
    }
  });
  navLinks.forEach(link => {
    link.style.color = link.getAttribute('href') === '#' + current ? '#0D9488' : '';
  });
});

// ── FADE IN ON SCROLL ──
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.tool-card, .feature-card, .plan-card').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  observer.observe(el);
});