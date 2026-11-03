(() => {
  const menu = document.querySelector('.sidebar');
  const toggle = document.querySelector('.menu-toggle');
  const backdrop = document.querySelector('.menu-backdrop');
  const closeButton = document.querySelector('.menu-close');
  function setMenu(open, returnFocus = false) {
    menu.classList.toggle('is-open', open);
    menu.inert = window.innerWidth <= 850 && !open;
    backdrop.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) closeButton.focus();
    if (returnFocus) toggle.focus();
  }
  menu.inert = window.innerWidth <= 850;
  toggle.addEventListener('click', () => setMenu(!menu.classList.contains('is-open')));
  closeButton.addEventListener('click', () => setMenu(false, true));
  backdrop.addEventListener('click', () => setMenu(false, true));
  document.addEventListener('keydown', e => {
    if (!menu.classList.contains('is-open')) return;
    if (e.key === 'Escape') setMenu(false, true);
    if (e.key === 'Tab') {
      const items = [...menu.querySelectorAll('a,button')].filter(el => el.offsetParent !== null);
      const first = items[0], last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  document.querySelectorAll('.sidebar a[href^="#"]').forEach(a => a.addEventListener('click', () => setMenu(false)));
  window.matchMedia('(min-width:851px)').addEventListener('change', e => { setMenu(false); });
  const navLinks = [...document.querySelectorAll('.nav-link')];
  const sections = [...document.querySelectorAll('main > section[id]')];
  function updateNavigation() {
    const offset = window.innerWidth <= 850 ? 110 : 110;
    let current = sections[0].id;
    for (const section of sections) if(section.getBoundingClientRect().top <= offset) current = section.id;
    if(window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 20) current = sections.at(-1).id;
    navLinks.forEach(link => { const active = link.hash === '#' + current; link.classList.toggle('active', active); if(active)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current'); });
  }
  let ticking = false;
  window.addEventListener('scroll', () => { if(!ticking){requestAnimationFrame(() => {updateNavigation();ticking=false;});ticking=true;} }, {passive:true});
  updateNavigation();
  const publicationTabs = [...document.querySelectorAll('.publication-tabs [role="tab"]')];
  function selectPublicationView(tab) {
    publicationTabs.forEach(t => {
      const active = t === tab;
      t.setAttribute('aria-selected', String(active));
      t.tabIndex = active ? 0 : -1;
      document.getElementById(t.getAttribute('aria-controls')).hidden = !active;
    });
  }
  publicationTabs.forEach((tab, index) => {
    tab.addEventListener('click', () => selectPublicationView(tab));
    tab.addEventListener('keydown', e => {
      if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key)) return;
      e.preventDefault();
      const next = e.key === 'Home' ? publicationTabs[0] : e.key === 'End' ? publicationTabs.at(-1) : publicationTabs[(index + (e.key === 'ArrowRight' ? 1 : -1) + publicationTabs.length) % publicationTabs.length];
      selectPublicationView(next); next.focus();
    });
  });
  const papers = [...document.querySelectorAll('.publication')];
  const filterButtons = [...document.querySelectorAll('.filter')];
  const input = document.querySelector('#publication-search');
  const status = document.querySelector('#results-count');
  let selected = 'all';
  function filterPapers() {
    const words = input.value.toLocaleLowerCase().trim().split(/\s+/).filter(Boolean);
    let count = 0;
    papers.forEach(p => {
      const categoryMatch = selected === 'all' || p.dataset.category === selected || (selected === 'conference' && p.dataset.category === 'short');
      const text = p.textContent.toLocaleLowerCase();
      const visible = categoryMatch && words.every(word => text.includes(word));
      p.hidden = !visible;
      if(visible) count++;
    });
    document.querySelectorAll('.year-group').forEach(g => {g.hidden = ![...g.querySelectorAll('.publication')].some(p => !p.hidden);});
    status.textContent = `${count} ${count === 1 ? 'publication' : 'publications'}${input.value.trim() ? ' matching your search' : ''}`;
    document.querySelector('#empty-state').hidden = count !== 0;
  }
  filterButtons.forEach(b => b.addEventListener('click', () => {
    selected = b.dataset.filter;
    filterButtons.forEach(other => other.setAttribute('aria-pressed', String(other === b)));
    filterPapers();
  }));
  input.addEventListener('input', filterPapers);
  filterPapers();
})();
