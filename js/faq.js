(()=>{
  if(!document.body.id || document.body.id !== 'page-faq') return;

  // Auto fold-out deeplinked FAQ entries:
  if(window.location.hash) {
    const selector = `details${window.location.hash}`;
    const details = document.querySelector(selector);
    if(details) details.open = true;
  }

  // When unfolding a FAQ entry, put into into the URL fragment so it's deep-linkable:
  document.addEventListener('toggle', e=>{
    if(e.target.matches('details') && e.target.open && e.target.id) {
      history.replaceState({}, '', `#${e.target.id}`);
    }
  }, { capture: true, passive: true });
})();