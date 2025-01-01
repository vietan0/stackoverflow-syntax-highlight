import customizeFont from './customizeFont.js';

/**
 * Send message to background script to start highlight codeblocks.
 */
async function notifyBackground() {
  const allPre = [];

  for (const pre of document.querySelectorAll('pre')) {
    allPre.push({
      code: pre.textContent,
      classes: [...pre.classList.values()],
    });
  }

  browser.runtime.sendMessage({
    step: 1,
    allPre,
  }).then((message) => {
    const { step, highlighted } = message;

    if (step === 2) {
      const allPre = Array.from(document.querySelectorAll('pre'));

      for (let i = 0; i < allPre.length; i++) {
        const pre = allPre[i];
        pre.outerHTML = highlighted[i];
      }
    }
  });
}

async function main() {
  const { enabled } = await browser.storage.local.get();

  if (enabled === undefined) {
    // first time, should always be boolean
    await browser.storage.local.set({
      enabled: true,
    });

    main();
  }

  if (enabled) {
    notifyBackground();
    customizeFont();
  }
}

async function handleStoreChange(changes) {
  const changedItems = Object.keys(changes);

  for (const item of changedItems) {
    if (item === 'theme') {
      const { enabled } = await browser.storage.local.get();
      if (enabled)
        notifyBackground();
    }

    if (item === 'enabled') {
      location.reload();
    }

    if (item === 'fontFamily' || item === 'importString') {
      const { enabled } = await browser.storage.local.get();

      if (enabled) {
        customizeFont();
      }
    }
  }
}

browser.storage.local.onChanged.addListener(handleStoreChange);
main();
