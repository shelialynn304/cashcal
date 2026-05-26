(function () {
  'use strict';

  var GA_MEASUREMENT_ID = window.GA_MEASUREMENT_ID || 'TODO_GA4_MEASUREMENT_ID';

  function hasGtag() {
    return typeof window.gtag === 'function';
  }

  function sendEvent(eventName, params) {
    if (!eventName || !hasGtag()) return;
    window.gtag('event', eventName, params || {});
  }

  function track(eventName, params) {
    var payload = Object.assign({
      page_path: window.location.pathname,
      page_title: document.title
    }, params || {});
    sendEvent(eventName, payload);
  }

  function getToolName(el) {
    if (!el) return document.body.getAttribute('data-tool-name') || 'site';
    return el.getAttribute('data-tool-name') ||
      (el.closest('[data-tool-name]') && el.closest('[data-tool-name]').getAttribute('data-tool-name')) ||
      document.body.getAttribute('data-tool-name') ||
      'site';
  }

  function initDataTrackEvents() {
    document.addEventListener('click', function (event) {
      var el = event.target.closest('[data-track-event]');
      if (!el) return;
      track(el.getAttribute('data-track-event'), {
        tool_name: getToolName(el),
        cta_label: (el.getAttribute('data-track-label') || el.textContent || '').trim(),
        destination: el.getAttribute('href') || ''
      });
    });
  }

  function initLinkTracking() {
    document.addEventListener('click', function (event) {
      var link = event.target.closest('a[href]');
      if (!link) return;
      var href = link.getAttribute('href') || '';
      if (!href) return;

      if (href.indexOf('mailto:') === 0) {
        track('email_click', {
          tool_name: getToolName(link),
          email_href: href,
          cta_label: (link.textContent || '').trim()
        });
        return;
      }

      if (href.indexOf('tel:') === 0) return;

      var isAbsolute = /^https?:\/\//i.test(href);
      if (!isAbsolute) return;

      var url;
      try {
        url = new URL(href, window.location.origin);
      } catch (e) {
        return;
      }

      if (url.origin !== window.location.origin) {
        track('outbound_click', {
          tool_name: getToolName(link),
          outbound_url: url.href,
          cta_label: (link.textContent || '').trim()
        });
      }
    });
  }

  function initResultViewTracking() {
    var resultNodes = document.querySelectorAll('[data-track-result]');
    if (!resultNodes.length) return;

    resultNodes.forEach(function (node) {
      var lastTrackedSignature = '';
      var emitView = function () {
        var isReady = node.getAttribute('data-result-ready') === 'true';
        if (!isReady) return;
        var text = (node.textContent || '').replace(/\s+/g, ' ').trim();
        if (!text) return;
        var signature = text;
        if (signature === lastTrackedSignature) return;
        lastTrackedSignature = signature;
        track('tool_result_view', {
          tool_name: getToolName(node),
          result_target: node.getAttribute('id') || node.getAttribute('data-track-result') || 'result'
        });
      };

      var observer = new MutationObserver(emitView);
      observer.observe(node, {
        childList: true,
        subtree: true,
        characterData: true,
        attributes: true,
        attributeFilter: ['data-result-ready']
      });
    });
  }

  window.edgeTrack = track;
  window.edgeTrackConfig = { measurementId: GA_MEASUREMENT_ID };

  initDataTrackEvents();
  initLinkTracking();
  initResultViewTracking();
})();
