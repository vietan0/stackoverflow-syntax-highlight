import { darkThemes, lightThemes, themes } from './themes.js';

async function renderBtns(themes, container) {
  for (let i = 0; i < themes.length; i++) {
    const btn = document.createElement('button');
    btn.textContent = themes[i].name;
    btn.id = themes[i].id;
    const { theme } = await browser.storage.local.get();
    const className = `block text-xs text-start font-roboto px-2 py-1.5 border-b-[1px] border-zinc-700 hover:bg-zinc-700 active:bg-zinc-600`;
    btn.className = `${className} ${theme === themes[i].id && 'bg-zinc-600 font-bold'}`;

    async function handleClick() {
      const { theme } = await browser.storage.local.get();

      if (themes[i].id !== theme) {
        await browser.storage.local.set({
          theme: themes[i].id,
        });
      }
    }

    btn.onclick = handleClick;
    container.appendChild(btn);
  }
}

async function renderCurrentThemeName(theme) {
  const { enabled } = await browser.storage.local.get();
  const currentThemeSpan = document.getElementById('current-theme');
  const currentTheme = themes.find(obj => obj.id === theme);
  currentThemeSpan.textContent = currentTheme.name;
  if (!enabled)
    currentThemeSpan.classList.add('opacity-40');
}

async function renderSwitch() {
  const { enabled } = await browser.storage.local.get();
  const enabledBtn = document.getElementById('enabled');
  const switchIcon = document.createElement('img');
  switchIcon.id = 'switch';
  switchIcon.src = enabled ? './LineMdSwitchOffTwotoneToSwitchTwotoneTransition.svg' : './LineMdSwitchTwotoneToSwitchOffTwotoneTransition.svg';
  enabledBtn.textContent = enabled ? 'Enabled' : 'Disabled';
  enabledBtn.prepend(switchIcon);
}

async function render() {
  const { theme } = await browser.storage.local.get();
  renderCurrentThemeName(theme);
  renderSwitch();
  const enabledBtn = document.getElementById('enabled');

  enabledBtn.onclick = async () => {
    const { enabled } = await browser.storage.local.get();

    await browser.storage.local.set({
      enabled: !enabled,
    });
  };

  const extPageLink = document.getElementById('ext-page-link');

  extPageLink.onclick = () => {
    const createData = {
      url: '../ext-page/index.html',
    };

    browser.tabs.create(createData);
  };

  renderBtns(lightThemes, document.getElementById('light-container'));
  renderBtns(darkThemes, document.getElementById('dark-container'));
}

render();

function handleChange(changes) {
  const changedItems = Object.keys(changes);

  for (const item of changedItems) {
    const newTheme = changes[item].newValue;

    // highlight btn on selection
    if (item === 'theme') {
      // 1. update current theme
      const currentThemeSpan = document.getElementById('current-theme');
      const currentTheme = themes.find(obj => obj.id === newTheme);
      currentThemeSpan.textContent = currentTheme.name;
      renderCurrentThemeName(newTheme);

      // 2. highlight selected btn
      const btns = document.getElementsByTagName('button');

      for (let i = 0; i < btns.length; i++) {
        // 2a. de-highlight all buttons
        const btn = btns[i];
        btn.classList.remove('bg-zinc-600', 'text-white', 'font-bold');
      }

      // 2b. highlight the one button
      const selectedBtn = document.getElementById(newTheme);
      if (!selectedBtn)
        return;
      selectedBtn.classList.add('bg-zinc-600', 'text-white', 'font-bold');
    }

    if (item === 'enabled') {
      const newEnabled = changes[item].newValue;
      const oldSwitchIcon = document.getElementById('switch');
      oldSwitchIcon.remove();
      renderSwitch();
      const currentThemeSpan = document.getElementById('current-theme');

      if (newEnabled) {
        currentThemeSpan.classList.remove('opacity-40');
      }
      else {
        currentThemeSpan.classList.add('opacity-40');
      }
    }
  }
}

browser.storage.local.onChanged.addListener(handleChange);
