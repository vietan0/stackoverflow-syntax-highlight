import customizeFont from './customizeFont.js';

const preSelector = '.inner-content pre:not(.markdown)';

/**
 * Observes for new `pre`s added to the DOM
 * (e.g. you post an answer that has a code block),
 * at which point calls `notifyBackground()`.
 * Never disconnects.
 */
const preObserver = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    const addedPre = [...mutation.addedNodes].find(node => node.nodeName === 'PRE');

    if (addedPre) {
      if (addedPre.classList.contains('s-code-block')
        && !addedPre.classList.contains('markdown')
      ) {
        notifyBackground();
        break;
      }
    }
  }
});

/**
 * Observe `pre`s until one has its `className` loaded,
 * at which point call `notifyBackground()` which will stop observing all.
 */
const classObserver = new MutationObserver((mutations) => {
  if (mutations.some(mutation =>
    mutation.oldValue === null && mutation.target.classList.contains('s-code-block'),
  )) {
    notifyBackground();
  }
});

/**
 * Send message to background script to start highlight codeblocks.
 */
async function notifyBackground() {
  classObserver.disconnect();
  /**
   * @type {{ code: string, classes: string[] }[]}
   */
  const allPreInfos = [];

  for (const pre of document.querySelectorAll(preSelector)) {
    allPreInfos.push({
      code: pre.textContent,
      classes: [...pre.classList.values()],
    });
  }

  browser.runtime.sendMessage({
    step: 1,
    allPreInfos,
  }).then((message) => {
    const { step, highlighted } = message;

    if (step === 2) {
      const allPre = Array.from(document.querySelectorAll(preSelector));

      for (let i = 0; i < allPre.length; i++) {
        const pre = allPre[i];
        const parser = new DOMParser();

        const highlightedDoc = parser.parseFromString(
          highlighted[i],
          'text/html',
        );

        const highlightedNode = highlightedDoc.querySelector('pre');
        pre.insertAdjacentElement('afterend', highlightedNode);
        pre.remove();
      }

      const allNewPre = Array.from(document.querySelectorAll(preSelector));

      const observer = new MutationObserver((mutationList) => {
        for (const mutation of mutationList) {
          if (
            mutation.type === 'attributes'
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

  if (enabled) {
    customizeFont();
    const innerContent = document.querySelector('.inner-content');

    if (innerContent) {
      preObserver.observe(innerContent, { childList: true, subtree: true });
    }

    for (const pre of document.querySelectorAll(preSelector)) {
      if (pre.classList.length === 0) {
        classObserver.observe(pre, { attributeFilter: ['class'], attributeOldValue: true });
      }
      else {
        notifyBackground();
        break;
      }
    }
  }
}

async function handleStoreChange(changes) {
  const changedItems = Object.keys(changes);
  const { enabled } = await browser.storage.local.get();

  if (changedItems.length === 1) {
    const [item] = changedItems;

    if (item === 'enabled') {
      location.reload();
    }

    if (item === 'theme') {
      if (enabled)
        notifyBackground();
    }
  }

  else {
    // changedItems.length > 1 means font styles were changed
    if (enabled)
      customizeFont();
  }
}

browser.storage.local.onChanged.addListener(handleStoreChange);
main();
