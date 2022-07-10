import foo from '/lib/foo.js';
import bar from '/lib/bar.js';
import qux from './qux.js';

function main() {
  console.log('loaded foobar', foo, bar, qux);
  let navEntry = performance.getEntriesByType('navigation')[0];
  let t = performance.now() - navEntry.requestStart;
  document.getElementById('app').textContent = 'Loaded in '+t.toFixed(0)+'ms';
}
document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', main) : main();
