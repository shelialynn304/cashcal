(function () {
  const checkboxes = Array.from(document.querySelectorAll('[data-check]'));
  const status = document.getElementById('checklist-status');
  const resetButton = document.getElementById('reset-checklist');

  if (!checkboxes.length || !status || !resetButton) return;

  function updateStatus() {
    const checked = checkboxes.filter((item) => item.checked).length;
    status.textContent = `${checked} / ${checkboxes.length} complete`;
  }

  checkboxes.forEach((item) => {
    item.addEventListener('change', updateStatus);
  });

  resetButton.addEventListener('click', function () {
    checkboxes.forEach((item) => {
      item.checked = false;
    });
    updateStatus();
  });

  updateStatus();
})();
