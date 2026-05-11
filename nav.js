(function () {
  const header = document.querySelector('.site-header');
  const toggle = document.querySelector('.nav-toggle');
  const menu = document.querySelector('#primary-nav');
  const dropdowns = Array.from(document.querySelectorAll('.nav-item-dropdown'));
  const desktopQuery = window.matchMedia('(min-width: 769px)');

  if (!header || !toggle || !menu) {
    return;
  }

  const isDesktop = () => desktopQuery.matches;

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
    if (isOpen) {
      closeDropdowns();
    }
  });

  dropdowns.forEach((item) => {
    const button = item.querySelector('.nav-dropdown-toggle');
    if (!button) {
      return;
    }

    item.addEventListener('mouseenter', () => {
      if (!isDesktop()) {
        return;
      }
      closeDropdowns(item);
      setDropdownOpen(item, true);
    });

    item.addEventListener('mouseleave', () => {
      if (!isDesktop()) {
        return;
      }
      setDropdownOpen(item, false);
    });

    item.addEventListener('focusin', () => {
      if (!isDesktop()) {
        return;
      }
      closeDropdowns(item);
      setDropdownOpen(item, true);
    });

    item.addEventListener('focusout', (event) => {
      if (!isDesktop()) {
        return;
      }
      if (!item.contains(event.relatedTarget)) {
        setDropdownOpen(item, false);
      }
    });

    button.addEventListener('click', () => {
      if (isDesktop()) {
        closeDropdowns(item);
        setDropdownOpen(item, true);
        return;
      }

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

  desktopQuery.addEventListener('change', () => {
    setMenuOpen(false);
    closeDropdowns();
  });

  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  menu.querySelectorAll('a[href]').forEach((link) => {
    if (link.getAttribute('href') === currentPage) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');

      const parentDropdown = link.closest('.nav-item-dropdown');
      const parentToggle = parentDropdown ? parentDropdown.querySelector('.nav-dropdown-toggle') : null;
      if (parentToggle) {
        parentToggle.classList.add('active');
      }
    }
  });
})();
