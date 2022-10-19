/**
 * everytime the window is about to be refreshed (form submit, or click on a previous or next link, or on a sort filter...), we show the preloader (sort of a turning wheel)
 */
window.addEventListener('beforeunload', (e) => {
  const preloader = document.querySelector('.preloader');
  if (!preloader) return;
  preloader.style.display = 'block';
});
