
export function getPageName() {
  let pn = window.location.pathname;
  if (pn === '/') {
    pn = 'root';
  } else {
    pn = pn.slice(1);
  }
  return pn;
}
