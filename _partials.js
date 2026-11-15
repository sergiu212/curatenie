/* ── Shared JS — JoJo Multiserv ── */

/* WhatsApp icon SVG */
const WA_SVG = `<svg viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>`;

/* Build WhatsApp message URL from calculator state */
function buildWaUrl({ type, svc, extras, total, lang }) {
  const labels = {
    ro: { prefix: 'Bună ziua! Aș dori o ofertă:', type: 'Tip locuință', svc: 'Serviciu', extras: 'Servicii extra', est: 'Estimare' },
    en: { prefix: 'Hello! I would like a quote:', type: 'Property type', svc: 'Service', extras: 'Extra services', est: 'Estimate' },
    fr: { prefix: 'Bonjour! Je souhaite un devis:', type: 'Type de bien', svc: 'Service', extras: 'Services supplémentaires', est: 'Estimation' },
  };
  const l = labels[lang] || labels.ro;
  let msg = `${l.prefix}\n- ${l.type}: ${type}\n- ${l.svc}: ${svc}`;
  if (extras && extras.length) msg += `\n- ${l.extras}: ${extras.join(', ')}`;
  msg += `\n- ${l.est}: ~${total} lei`;
  return `https://wa.me/40756963902?text=${encodeURIComponent(msg)}`;
}

/* Calculator init — called by each page with its config */
function initCalc({ typeOpts, svcOpts, extraOpts, lang, typeDefault, svcDefault }) {
  const intPrices  = { garsoniera:200, ap2:250, ap34:275, casa120:300, casa180:325, casa250:325, casa250p:375 };
  const genPrices  = { garsoniera:400, ap2:550, ap34:700, casa120:900, casa180:1000, casa250:1300, casa250p:1700 };
  const bizPrices  = { biz_int:300, biz_gen:600, biz_ren:500 };
  const autoPrices = { auto:200 };

  let calcType = typeDefault || Object.keys(typeOpts)[0];
  let calcSvc  = svcDefault  || Object.keys(svcOpts)[0];

  function getBasePrice() {
    if (calcType in intPrices) return calcSvc === 'gen' ? genPrices[calcType] : intPrices[calcType];
    if (calcType in bizPrices) return bizPrices[calcType];
    if (calcType in autoPrices) return autoPrices[calcType];
    return 0;
  }

  function update() {
    const base   = getBasePrice();
    const extras = [...document.querySelectorAll('.xcheck:checked')].reduce((s, el) => s + +el.dataset.price, 0);
    const total  = base + extras;
    const el = document.getElementById('calc-total');
    if (el) el.textContent = total.toLocaleString('ro-RO');
    return total;
  }

  document.querySelectorAll('#calc-type-opts .pill-opt').forEach(opt => {
    opt.addEventListener('click', () => {
      document.querySelectorAll('#calc-type-opts .pill-opt').forEach(o => o.classList.remove('active'));
      opt.classList.add('active');
      calcType = opt.dataset.val;
      update();
    });
  });

  document.querySelectorAll('#calc-svc-opts .pill-opt').forEach(opt => {
    opt.addEventListener('click', () => {
      document.querySelectorAll('#calc-svc-opts .pill-opt').forEach(o => o.classList.remove('active'));
      opt.classList.add('active');
      calcSvc = opt.dataset.val;
      update();
    });
  });

  document.querySelectorAll('.xcheck').forEach(cb => cb.addEventListener('change', update));

  const btn = document.getElementById('calc-wa-btn');
  if (btn) {
    btn.addEventListener('click', () => {
      const total  = update();
      const typeEl = document.querySelector('#calc-type-opts .pill-opt.active');
      const svcEl  = document.querySelector('#calc-svc-opts .pill-opt.active');
      const extras = [...document.querySelectorAll('.xcheck:checked')].map(el => el.closest('.check-opt').querySelector('.check-opt-name').textContent);
      const url = buildWaUrl({
        type:  typeEl ? typeEl.querySelector('.pill-opt-name').textContent : '',
        svc:   svcEl  ? svcEl.querySelector('.pill-opt-name').textContent : '',
        extras, total, lang: lang || 'ro'
      });
      window.open(url, '_blank');
    });
  }

  /* Contact form WA button */
  const cfBtn = document.getElementById('cf-wa-btn');
  if (cfBtn) {
    cfBtn.addEventListener('click', () => {
      const name    = document.getElementById('cf-name')?.value || '';
      const phone   = document.getElementById('cf-phone')?.value || '';
      const service = document.getElementById('cf-service')?.value || '';
      const details = document.getElementById('cf-details')?.value || '';
      const labels  = { ro: 'Bună ziua!', en: 'Hello!', fr: 'Bonjour!' };
      let msg = `${labels[lang]||labels.ro}\n`;
      if (name)    msg += `Nume: ${name}\n`;
      if (phone)   msg += `Telefon: ${phone}\n`;
      if (service) msg += `Serviciu: ${service}\n`;
      if (details) msg += `Detalii: ${details}`;
      window.open(`https://wa.me/40756963902?text=${encodeURIComponent(msg)}`, '_blank');
    });
  }

  update();
}
