(function () {
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': 'https://edgeoverluck.com/#website',
    name: 'Edge Over Luck',
    url: 'https://edgeoverluck.com/',
    description: 'Smart gambling tools for real players: calculators, simulators, trainers, and gambling math guides.',
    inLanguage: 'en-US',
  };

  const websiteSchemaUrl = 'https://edgeoverluck.com/';

  const normalizeSchemaUrl = (url) => {
    if (typeof url !== 'string') {
      return '';
    }

    return url.replace(/#.*$/, '').replace(/\/$/, '') + '/';
  };

  const hasType = (value, type) => {
    if (Array.isArray(value)) {
      return value.includes(type);
    }

    return value === type;
  };

  const hasWebsiteSchema = (value) => {
    if (!value || typeof value !== 'object') {
      return false;
    }

    if (Array.isArray(value)) {
      return value.some(hasWebsiteSchema);
    }

    if (hasType(value['@type'], 'WebSite')) {
      if (value['@id'] === websiteSchema['@id']) {
        return true;
      }

      if (normalizeSchemaUrl(value.url) === websiteSchemaUrl) {
        return true;
      }
    }

    return Object.values(value).some(hasWebsiteSchema);
  };

  const hasGlobalWebsiteSchema = Array.from(document.querySelectorAll('script[type="application/ld+json"]')).some((script) => {
    try {
      return hasWebsiteSchema(JSON.parse(script.textContent));
    } catch (error) {
      return script.textContent.includes(websiteSchema['@id']);
    }
  });

  if (!hasGlobalWebsiteSchema) {
    const schemaScript = document.createElement('script');
    schemaScript.type = 'application/ld+json';
    schemaScript.textContent = JSON.stringify(websiteSchema, null, 2);
    (document.head || document.documentElement).appendChild(schemaScript);
  }

  function ensureHorseOverlayLink() {
    const horsePanel = document.querySelector('#nav-horse-racing');

    if (!horsePanel) {
      return false;
    }

    const hasOverlayLink = Array.from(horsePanel.querySelectorAll('a[href]')).some((link) => {
      const href = link.getAttribute('href') || '';
      return href === 'takeout-overlay-calculator.html' || href.endsWith('/takeout-overlay-calculator.html');
    });

    if (hasOverlayLink) {
      return false;
    }

    const firstHorseTool = Array.from(horsePanel.querySelectorAll('a[href]')).find((link) => {
      const href = link.getAttribute('href') || '';
      return (
        href === 'exotic-bet-calculator.html' ||
        href.endsWith('/exotic-bet-calculator.html') ||
        href === 'horse-racing-guide.html' ||
        href.endsWith('/horse-racing-guide.html')
      );
    });
    const firstHorseHref = firstHorseTool ? firstHorseTool.getAttribute('href') || '' : '';
    const linkPrefix = firstHorseHref.replace(/(?:exotic-bet-calculator|horse-racing-guide)\.html$/, '');

    const overlayLink = document.createElement('a');
    overlayLink.href = `${linkPrefix}takeout-overlay-calculator.html`;
    overlayLink.textContent = 'Takeout & Overlay Calculator';

    horsePanel.insertBefore(overlayLink, firstHorseTool || horsePanel.firstChild);
    return true;
  }

  function ensureExoticSplitLinks() {
    const horsePanel = document.querySelector('#nav-horse-racing');

    if (!horsePanel) {
      return false;
    }

    const splitTypes = [
      { file: 'exacta-box-calculator.html',     label: 'Exacta Box Calculator' },
      { file: 'trifecta-box-calculator.html',   label: 'Trifecta Box Calculator' },
      { file: 'superfecta-box-calculator.html', label: 'Superfecta Box Calculator' }
    ];

    const existingHrefs = Array.from(horsePanel.querySelectorAll('a[href]')).map((a) => a.getAttribute('href') || '');

    const hasAll = splitTypes.every(({ file }) =>
      existingHrefs.some((href) => href === file || href.endsWith('/' + file))
    );

    if (hasAll) {
      return false;
    }

    const exoticLink = Array.from(horsePanel.querySelectorAll('a[href]')).find((link) => {
      const href = link.getAttribute('href') || '';
      return href === 'exotic-bet-calculator.html' || href.endsWith('/exotic-bet-calculator.html');
    });

    const anchorHref = exoticLink ? exoticLink.getAttribute('href') || '' : '';
    const linkPrefix = anchorHref.replace(/exotic-bet-calculator\.html$/, '');

    let insertAfter = exoticLink || null;

    for (const { file, label } of splitTypes) {
      const alreadyPresent = existingHrefs.some((href) => href === file || href.endsWith('/' + file));
      if (alreadyPresent) {
        const existingLink = Array.from(horsePanel.querySelectorAll('a[href]')).find((a) => {
          const h = a.getAttribute('href') || '';
          return h === file || h.endsWith('/' + file);
        });
        insertAfter = existingLink || insertAfter;
        continue;
      }

      const newLink = document.createElement('a');
      newLink.href = `${linkPrefix}${file}`;
      newLink.textContent = label;

      if (insertAfter && insertAfter.nextSibling) {
        horsePanel.insertBefore(newLink, insertAfter.nextSibling);
      } else {
        horsePanel.appendChild(newLink);
      }
      insertAfter = newLink;
    }

    return true;
  }


  function ensureBonusEvLink() {
    const morePanel = document.querySelector('#nav-more');

    if (!morePanel) {
      return false;
    }

    const hasBonusLink = Array.from(morePanel.querySelectorAll('a[href]')).some((link) => {
      const href = link.getAttribute('href') || '';
      return href === 'casino-bonus-calculator.html' || href === '/casino-bonus-calculator.html' || href.endsWith('/casino-bonus-calculator.html');
    });

    if (hasBonusLink) {
      return false;
    }

    const bankrollLink = Array.from(morePanel.querySelectorAll('a[href]')).find((link) => {
      const href = link.getAttribute('href') || '';
      return href === 'bankroll-tools.html' || href === '/bankroll-tools.html' || href.endsWith('/bankroll-tools.html');
    });
    const firstMoreHref = bankrollLink ? bankrollLink.getAttribute('href') || '' : '';
    const linkPrefix = firstMoreHref.replace(/bankroll-tools\.html$/, '');

    const bonusLink = document.createElement('a');
    bonusLink.href = `${linkPrefix}casino-bonus-calculator.html`;
    bonusLink.textContent = 'Casino Bonus Reality Check Calculator';

    if (bankrollLink && bankrollLink.nextSibling) {
      morePanel.insertBefore(bonusLink, bankrollLink.nextSibling);
    } else {
      morePanel.appendChild(bonusLink);
    }

    return true;
  }

  function markCurrentNavLink(menu) {
    if (!menu) {
      return;
    }

    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    menu.querySelectorAll('a[href]').forEach((link) => {
      link.classList.remove('active');
      link.removeAttribute('aria-current');

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
  }

  function initNav() {
    const header = document.querySelector('.site-header');
    const toggle = document.querySelector('.nav-toggle');
    const menu = document.querySelector('#primary-nav');

    ensureHorseOverlayLink();
    ensureExoticSplitLinks();
    ensureBonusEvLink();
    markCurrentNavLink(menu);

    if (!header || !toggle || !menu || header.dataset.navEnhanced === 'true') {
      return Boolean(header && toggle && menu);
    }

    header.dataset.navEnhanced = 'true';

    const dropdowns = Array.from(document.querySelectorAll('.nav-item-dropdown'));
    const desktopQuery = window.matchMedia('(min-width: 769px)');
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

    return true;
  }

  initNav();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNav, { once: true });
  } else {
    window.setTimeout(initNav, 0);
  }

  window.addEventListener('load', initNav, { once: true });

  const observer = new MutationObserver(() => {
    ensureHorseOverlayLink();
    ensureExoticSplitLinks();
    ensureBonusEvLink();
    markCurrentNavLink(document.querySelector('#primary-nav'));
  });

  observer.observe(document.documentElement, { childList: true, subtree: true });
})();
