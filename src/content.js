import customizeFont from './customizeFont.js';

const preSelector = '.inner-content pre:not(.markdown)';
const codeSelector = `${preSelector} > code`;

/**
 * Observes for new `pre`s added to the DOM
 * (e.g. you post an answer that has a code block),
 * at which point calls `notifyBackground()`.
 * Never disconnects.
 */
const addedPreObserver = new MutationObserver((mutations) => {
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
 * Observe `code`s until one has `hljs` class loaded,
 * at which point call `notifyBackground()` which will stop observing all.
 */
const codeClassObserver = new MutationObserver((mutations) => {
  if (mutations.some(mutation =>
    mutation.oldValue === null && mutation.target.classList.contains('hljs'),
  )) {
    notifyBackground();
  }
});

/**
 * @param {string[]} classes e.g. `[]`, `["hljs", "language-bash"]`, `["hljs", "language-php-template"]`
 * @returns {string | null} found language or `null`
 */
function getLangFromClasses(classes) {
  const langClass = classes.find(className => className.startsWith('language-'));
  if (!langClass)
    return null;

  const regex = /(?<=language-)[\w-]+/g;
  const lang = langClass.match(regex)[0];

  return lang;
}

/**
 * Send message to background script to start highlight codeblocks.
 */
async function notifyBackground() {
  codeClassObserver.disconnect();
  /**
   * @type {{ code: string, lang: string | null }[]}
   */
  const allPreInfos = [];

  for (const codeElem of document.querySelectorAll(codeSelector)) {
    const classes = [...codeElem.classList.values()];

    allPreInfos.push({
      code: codeElem.textContent,
      lang: getLangFromClasses(classes),
    });
  }

  browser.runtime.sendMessage({
    step: 1,
    allPreInfos,
  }).then(async (message) => {
    const { step, highlighted } = message;

    if (step === 2) {
      const { theme } = await browser.storage.local.get();
      const defaultPres = Array.from(document.querySelectorAll(preSelector));

      for (let i = 0; i < defaultPres.length; i++) {
        const pre = defaultPres[i];
        const parser = new DOMParser();

        const highlightedDoc = parser.parseFromString(
          highlighted[i],
          'text/html',
        );

        const highlightedNode = highlightedDoc.querySelector('pre');
        pre.insertAdjacentElement('afterend', highlightedNode);
        pre.remove();
      }

      const shikiPres = Array.from(document.querySelectorAll(preSelector));

      /*
        Look for classes added by StackOverflow after Shiki,
        remove them to avoid potential style conflicts.
       */
      const shikiPreClassObserver = new MutationObserver((mutationList) => {
        for (const mutation of mutationList) {
          if (Array.from(mutation.target.classList).includes('s-code-block')) {
            for (const className of mutation.target.classList.values()) {
              if (className !== 'shiki' && className !== theme)
                mutation.target.classList.remove(className);
            }
          }
        }
      });

      for (const shikiPre of shikiPres) {
        shikiPreClassObserver.observe(shikiPre, { attributeFilter: ['class'] });
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
      addedPreObserver.observe(innerContent, { childList: true, subtree: true });
    }

    for (const codeElem of document.querySelectorAll(codeSelector)) {
      if (codeElem.classList.length === 0) {
        // 1. class is loading or 2. there's no language specified
        // Wait for 2s, if there's no classes by then, notifyBackground() anyway
        codeClassObserver.observe(codeElem, { attributeFilter: ['class'], attributeOldValue: true });

        setTimeout(() => {
          if (codeElem.classList.length === 0)
            notifyBackground();
        }, 2000);
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
