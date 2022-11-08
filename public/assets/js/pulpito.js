/**
 * everytime the window is about to be refreshed (form submit, or click on a previous or next link, or on a sort filter...), we show the preloader (sort of a turning wheel)
 */
window.addEventListener('beforeunload', () => {
  const preloader = document.querySelector('.preloader');
  if (!preloader) return;
  preloader.style.display = 'block';
});

/**
 * when loading is finished, if there are flight search results, we scroll to them
 */
document.addEventListener('DOMContentLoaded', () => {
  const resultsArea = document.querySelector('#explore_area');
  if (resultsArea) resultsArea.scrollIntoView(true);
});
