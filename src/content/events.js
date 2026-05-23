const NovStatsEvents = {
  setup(panel) {
    const btn   = panel.querySelector('.ns-collapse-btn');
    const block = panel.querySelector('.profile_customization_block');

    btn.addEventListener('click', () => {
      const hidden = block.style.display === 'none';
      block.style.display = hidden ? '' : 'none';
      btn.textContent = hidden ? '▲' : '▼';
    });
  }
};
