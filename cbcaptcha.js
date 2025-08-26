// cbcaptcha.js - CBCaptcha demo client
(function () {
  if (window.__CBCAPTCHA_LOADED) return;
  window.__CBCAPTCHA_LOADED = true;

  const TRIGGER_PROBABILITY = 0.9;
  const CHECKBOX_RATIO = 0.8;
  const VALID_DURATION_MS = 30 * 1000;

  const STR = {
    en: {
      title: "Prove you're human",
      clickbox: "Click the box to confirm",
      slider: "Slide to confirm",
      success: "Verification passed. Proceeding...",
      fail: "Verification failed. Try again.",
      lang: "Language:",
      checkbox_label: "I am human"
    },
    zh: {
      title: "证明我是人类",
      clickbox: "点击方框以确认",
      slider: "滑动以确认",
      success: "验证通过，正在继续…",
      fail: "验证失败，请重试",
      lang: "语言：",
      checkbox_label: "我是人类"
    }
  };

  let lang = 'zh';
  let validUntil = 0;
  let pendingAction = null;
  let overlayEl, boxEl, doneEl, failedEl;

  function el(tag, cls, html) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html !== undefined) e.innerHTML = html;
    return e;
  }
  function now() { return Date.now(); }

  function buildOverlay() {
    overlayEl = el('div', 'cbc-overlay');
    boxEl = el('div', 'cbc-box');
    const title = el('div', 'cbc-title');
    title.textContent = STR[lang].title;
    boxEl.appendChild(title);

    const langDiv = el('div', 'cbc-lang');
    const langLabel = el('span', null, STR[lang].lang);
    langDiv.appendChild(langLabel);

    const checkboxCn = el('label', 'cbc-lang-checkbox');
    const cbInputCn = el('input');
    cbInputCn.type = 'checkbox';
    cbInputCn.checked = lang === 'zh';
    cbInputCn.setAttribute('data-lang', 'zh');
    checkboxCn.appendChild(cbInputCn);
    checkboxCn.appendChild(document.createTextNode('简体中文'));
    langDiv.appendChild(checkboxCn);

    const checkboxEn = el('label', 'cbc-lang-checkbox');
    const cbInputEn = el('input');
    cbInputEn.type = 'checkbox';
    cbInputEn.checked = lang === 'en';
    cbInputEn.setAttribute('data-lang', 'en');
    checkboxEn.appendChild(cbInputEn);
    checkboxEn.appendChild(document.createTextNode('English'));
    langDiv.appendChild(checkboxEn);

    function setLang(l) {
      lang = l;
      updateUI();
      cbInputEn.checked = (l === 'en');
      cbInputCn.checked = (l === 'zh');
    }
    cbInputCn.addEventListener('change', ()=> { if (cbInputCn.checked) setLang('zh'); else setLang('en'); });
    cbInputEn.addEventListener('change', ()=> { if (cbInputEn.checked) setLang('en'); else setLang('zh'); });

    boxEl.appendChild(langDiv);

    const challengeMount = el('div', 'cbc-challenge');
    boxEl.appendChild(challengeMount);

    const help = el('div', 'cbc-help');
    boxEl.appendChild(help);

    doneEl = el('div', 'cbc-done');
    boxEl.appendChild(doneEl);
    failedEl = el('div', 'cbc-failed');
    boxEl.appendChild(failedEl);

    overlayEl.appendChild(boxEl);
    document.body.appendChild(overlayEl);
  }

function updateUI() {
  if (!boxEl) return;

  // 更新标题
  const title = boxEl.querySelector('.cbc-title');
  if (title) title.textContent = STR[lang].title;

  // 更新语言标签
  const langLabel = boxEl.querySelector('.cbc-lang span');
  if (langLabel) langLabel.textContent = STR[lang].lang;

  // 更新帮助提示
  const help = boxEl.querySelector('.cbc-help');
  if (help) {
    // 判断当前是 checkbox 还是 slider
    const challenge = boxEl.querySelector('.cbc-challenge');
    if (challenge && challenge.querySelector('.cbc-check-box')) {
      help.textContent = STR[lang].clickbox;
    } else if (challenge && challenge.querySelector('.cbc-slider')) {
      help.textContent = STR[lang].slider;
    } else {
      help.textContent = '';
    }
  }

  // 更新 checkbox 标签文字
  const cbLabelText = boxEl.querySelector('.cbc-checkbox span');
  if (cbLabelText) cbLabelText.textContent = STR[lang].checkbox_label;

  // 更新成功/失败提示
  if (doneEl && doneEl.style.display !== 'none') {
    doneEl.textContent = STR[lang].success;
  }
  if (failedEl && failedEl.style.display !== 'none') {
    failedEl.textContent = STR[lang].fail;
  }
}


  function showCaptcha(onSuccess, onFail) {
    if (!overlayEl) buildOverlay();
    const roll = Math.random();
    const type = (roll < CHECKBOX_RATIO) ? 'checkbox' : 'slider';
    mountChallenge(type, onSuccess, onFail);
    overlayEl.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }

  function hideCaptcha() {
    if (overlayEl) overlayEl.style.display = 'none';
    document.body.style.overflow = '';
    const mount = boxEl.querySelector('.cbc-challenge');
    if (mount) mount.innerHTML = '';
    doneEl.style.display = 'none';
    failedEl.style.display = 'none';
  }

  function mountChallenge(type, onSuccess, onFail) {
    const mount = boxEl.querySelector('.cbc-challenge');
    mount.innerHTML = '';
    doneEl.style.display = 'none';
    failedEl.style.display = 'none';

    if (type === 'checkbox') {
      const cbLabel = el('label', 'cbc-checkbox');
      const box = el('div', 'cbc-check-box');
      const labelText = el('span', null, STR[lang].checkbox_label);
      cbLabel.appendChild(box);
      cbLabel.appendChild(labelText);
      mount.appendChild(cbLabel);

      const help = boxEl.querySelector('.cbc-help');
      if (help) help.textContent = STR[lang].clickbox;

      function succeed() {
        box.classList.add('checked');
        doneEl.textContent = STR[lang].success;
        doneEl.style.display = 'block';
        setTimeout(() => { hideCaptcha(); onSuccess && onSuccess(); }, 650);
      }

      function fail() {
        failedEl.textContent = STR[lang].fail;
        failedEl.style.display = 'block';
        onFail && onFail();
      }

      box.addEventListener('click', () => {
        if (Math.random() > 0.15) succeed(); else fail();
      });
    } else {
      const sliderWrap = el('div', 'cbc-slider');
      const sliderTrack = el('div', 'cbc-slider-track');
      const handle = el('div', 'cbc-slider-handle');
      sliderTrack.appendChild(handle);
      sliderWrap.appendChild(sliderTrack);
      mount.appendChild(sliderWrap);

      const help = boxEl.querySelector('.cbc-help');
      if (help) help.textContent = STR[lang].slider;

      let dragging = false, startX = 0, origLeft = 0;
      function clamp(v,a,b){ return Math.max(a, Math.min(b, v)); }
      function onDown(e) {
        dragging = true;
        startX = (e.touches ? e.touches[0].clientX : e.clientX);
        origLeft = handle.offsetLeft;
        handle.style.cursor = 'grabbing';
      }
      function onMove(e) {
        if (!dragging) return;
        const clientX = (e.touches ? e.touches[0].clientX : e.clientX);
        const dx = clientX - startX;
        const trackWidth = sliderWrap.clientWidth;
        const maxLeft = trackWidth - handle.offsetWidth - 4;
        const newLeft = clamp(origLeft + dx, 0, maxLeft);
        handle.style.transform = 'translateX(' + newLeft + 'px)';
        if (newLeft >= maxLeft - 1) {
          dragging = false;
          handle.style.cursor = 'grab';
          if (Math.random() > 0.12) {
            doneEl.textContent = STR[lang].success;
            doneEl.style.display = 'block';
            setTimeout(() => { hideCaptcha(); onSuccess && onSuccess(); }, 450);
          } else {
            failedEl.textContent = STR[lang].fail;
            failedEl.style.display = 'block';
            onFail && onFail();
            setTimeout(()=>{ handle.style.transform = 'translateX(0px)'; }, 600);
          }
        }
      }
      function onUp() { dragging = false; handle.style.cursor = 'grab'; }
      handle.addEventListener('mousedown', onDown);
      handle.addEventListener('touchstart', onDown, {passive:true});
      window.addEventListener('mousemove', onMove);
      window.addEventListener('touchmove', onMove, {passive:true});
      window.addEventListener('mouseup', onUp);
      window.addEventListener('touchend', onUp);
    }
  }

  function initInterception() {
    document.addEventListener('click', function (ev) {
      if (ev.defaultPrevented) return;
      if (ev.button !== 0) return;
      let node = ev.target;
      while (node && node !== document.body && node.tagName !== 'A') node = node.parentElement;
      if (!node || node.tagName !== 'A') return;
      const href = node.getAttribute('href') || '';
      if (/^\s*javascript:/i.test(href)) return;
      if (now() < validUntil) return;
      if (Math.random() > TRIGGER_PROBABILITY) return;

      ev.preventDefault();
      ev.stopPropagation();
      pendingAction = { href, target: node.getAttribute('target') };
      showCaptcha(onCaptchaSuccess, onCaptchaFail);
    }, true);
  }

  function onCaptchaSuccess() {
    validUntil = now() + VALID_DURATION_MS;
    if (pendingAction) {
      if (pendingAction.target === '_blank') {
        window.open(pendingAction.href, '_blank');
      } else {
        window.location.href = pendingAction.href;
      }
      pendingAction = null;
    }
  }
  function onCaptchaFail() {}

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      buildOverlay();
      initInterception();
    });
  } else {
    buildOverlay();
    initInterception();
  }
})();
