(function () {
  'use strict';

  // Amplitude ingestion key — public by design; move to an env var when you set up environments.
  var AMPLITUDE_API_KEY = '8a4022368b20bf1e7d46632beeef889';

  var trackQueue = window.amplitudeQueue || [];
  window.amplitudeQueue = trackQueue;

  // Queues track calls made before the CDN script has finished loading, so an
  // early click (slow network, cache miss) isn't silently dropped.
  window.amplitudeTrack = function (eventName, props) {
    if (window.amplitude && typeof window.amplitude.track === 'function') {
      window.amplitude.track(eventName, props);
    } else {
      trackQueue.push([eventName, props]);
    }
  };

  if (window.amplitude) return;

  var loader = document.createElement('script');
  loader.src = 'https://cdn.amplitude.com/script/' + AMPLITUDE_API_KEY + '.js';
  loader.onload = function () {
    window.amplitude.add(window.sessionReplay.plugin({ sampleRate: 1 }));
    window.amplitude.init(AMPLITUDE_API_KEY, {
      autocapture: true
    });
    trackQueue.splice(0).forEach(function (args) {
      window.amplitude.track(args[0], args[1]);
    });
  };
  document.head.appendChild(loader);
})();
