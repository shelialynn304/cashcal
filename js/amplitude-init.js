(function () {
  'use strict';

  // Amplitude ingestion key — public by design; move to an env var when you set up environments.
  var AMPLITUDE_API_KEY = '8a4022368b20bf1e7d46632beeef889';

  if (window.amplitude) return;

  var loader = document.createElement('script');
  loader.src = 'https://cdn.amplitude.com/script/' + AMPLITUDE_API_KEY + '.js';
  loader.onload = function () {
    window.amplitude.add(window.sessionReplay.plugin({ sampleRate: 1 }));
    window.amplitude.init(AMPLITUDE_API_KEY, {
      autocapture: true
    });
  };
  document.head.appendChild(loader);
})();
