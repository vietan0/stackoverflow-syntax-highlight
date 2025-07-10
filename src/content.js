import customizeFont from './customizeFont.js';

/**
 * Send message to background script to start highlight codeblocks.
 */
async function notifyBackground() {
  const allPre = [];

  for (const pre of document.querySelectorAll('.inner-content pre')) {
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
      const allPre = Array.from(document.querySelectorAll('.inner-content pre'));

      for (let i = 0; i < allPre.length; i++) {
        const pre = allPre[i];
        const parser = new DOMParser();
        const highlightedDoc = parser.parseFromString(highlighted[i], 'text/html');
        const highlightedNode = highlightedDoc.querySelector('pre');
        pre.insertAdjacentElement('afterend', highlightedNode);
        pre.remove();
      }

      const allNewPre = Array.from(document.querySelectorAll('.inner-content pre'));

      const observer = new MutationObserver((mutationList) => {
        for (const mutation of mutationList) {
          if (mutation.type === 'attributes'
            && mutation.attributeName === 'class'
            && Array.from(mutation.target.classList).includes('s-code-block')
          ) {
            mutation.target.classList.remove('s-code-block');
          }
        }
      });

      for (const newPre of allNewPre) {
        observer.observe(newPre, {
          attributes: true,
        });
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
