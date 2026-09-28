
async function loadSection(id, url) {
  try {
    const res = await fetch(url);
    const html = await res.text();
    document.getElementById(id).innerHTML = html;
  } catch(e) {
    console.error("Failed to load section", id, e);
  }
}

async function init() {
  await loadSection('1-airlock', 'sections/1-airlock.html');
  await loadSection('2-header', 'sections/2-header.html');
  await loadSection('3-hero', 'sections/3-hero.html');
  await loadSection('4-journey', 'sections/4-journey.html');
  await loadSection('5-destinations', 'sections/5-destinations.html');
  await loadSection('6-mike', 'sections/6-mike.html');
    await loadSection('7-numbers', 'sections/7-numbers.html');
    await loadSection('8-gallery', 'sections/8-gallery.html');
  await loadSection('9-brand', 'sections/9-brand.html');
  await loadSection('10-packages', 'sections/10-packages.html');
  await loadSection('11-footer', 'sections/11-footer.html');

  // Initialize effects after all HTML is loaded
  await import('./modules/airlock.js');
  await import('./modules/flight-cursor.js');
  await import('./modules/tubes.js');
}

document.addEventListener('DOMContentLoaded', init);
