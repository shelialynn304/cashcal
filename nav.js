(function () {
  const header = document.querySelector('.site-header');
  const toggle = document.querySelector('.nav-toggle');
  const menu = document.querySelector('#primary-nav');
  const dropdowns = Array.from(document.querySelectorAll('.nav-item-dropdown'));

  if (!header || !toggle || !menu) {
    return;
  }

  const setMenuOpen = (open) => {
    header.classList.toggle('nav-open', open);
    toggle.setAttribute('aria-expanded', String(open));
  };

  const setDropdownOpen = (item, open) => {
    const button = item.querySelector('.nav-dropdown-toggle');
    item.classList.toggle('open', open);
    if (button) {
      button.setAttribute('aria-expanded', String(open));
    }
  };

  const closeDropdowns = (except) => {
    dropdowns.forEach((item) => {
      if (item !== except) {
        setDropdownOpen(item, false);
      }
    });
  };

  toggle.addEventListener('click', () => {
    const isOpen = toggle.getAttribute('aria-expanded') === 'true';
    setMenuOpen(!isOpen);
  });

  dropdowns.forEach((item) => {
    const button = item.querySelector('.nav-dropdown-toggle');
    if (!button) {
      return;
    }

    button.addEventListener('click', () => {
      const isOpen = button.getAttribute('aria-expanded') === 'true';
      closeDropdowns(item);
      setDropdownOpen(item, !isOpen);
    });
  });

  document.addEventListener('click', (event) => {
    if (!header.contains(event.target)) {
      setMenuOpen(false);
      closeDropdowns();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      setMenuOpen(false);
      closeDropdowns();
      toggle.focus();
    }
  });

  menu.addEventListener('click', (event) => {
    const link = event.target.closest('a');
    if (link) {
      setMenuOpen(false);
      closeDropdowns();
    }
  });

  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  menu.querySelectorAll('a[href]').forEach((link) => {
    if (link.getAttribute('href') === currentPage) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    }
  });
})();
