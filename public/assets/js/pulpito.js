/**
 * everytime the window is about to be refreshed (form submit, or click on a previous or next link, or on a sort filter...), we show the preloader (sort of a turning wheel)
 */
window.addEventListener('beforeunload', (e) => {
  const preloader = document.querySelector('.preloader');
  if (!preloader) return;
  preloader.style.display = 'block';
});

/**
 * just before finish loading, if there is a list of results, we scroll to it
 */
document.addEventListener('DOMContentLoaded', (e) => {
  const resultsArea = document.querySelector('#explore_area');
  if (resultsArea) resultsArea.scrollIntoView(true);
});
