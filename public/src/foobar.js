import foo from '/lib/foo.js';
import bar from '/lib/bar.js';

function main() {
  console.log('loaded foobar', foo, bar);
  let navEntry = performance.getEntriesByType('navigation')[0];
  let t = performance.now() - navEntry.requestStart;
  document.getElementById('app').textContent = 'Loaded in '+t.toFixed(0)+'ms';
  import('./qux.js').then(({default: qux})=>{
    console.log('qux', qux);
  });
}
document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', main) : main();
