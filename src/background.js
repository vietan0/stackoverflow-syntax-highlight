import { bundledLanguages, codeToHtml } from 'shiki';

/**
 * Turn a code snippet into a syntax-highlighted HTML string.
 * @param {string} code The code snippet
 * @param {string} lang The language (specified or guessed) of the code
 * @returns {string} A highlighted HTML string
 */
async function highlight(code, lang) {
  if (!(lang in bundledLanguages)) {
    console.log(`Shiki doesn't recognize: ${lang}, fallback to 'plain'`);
  }

  const { theme } = await browser.storage.local.get();

  if (!theme) {
    // if undefined (first time), set to dark-plus
    await browser.storage.local.set({
      theme: 'dark-plus',
    });
  }

  const html = await codeToHtml(code, {
    lang: lang in bundledLanguages ? lang : 'plain',
    theme: theme || 'dark-plus',
  });

  return html;
}

/**
 * If it has a guess, pass that guess to `highlight()` and return highlighted HTML string.
 *
 * If there's no guess, return `undefined`.
 * @param {HTMLElement} code The code snippet
 * @returns {string | undefined} Highlighted HTML string if guessed, `undefined` if not
 */
async function guessAndHighlight(code) {
  // eslint-disable-next-line no-undef
  const guessLang = new GuessLang();
  const guesses = await guessLang.runModel(code);
  if (guesses.length === 0)
    return;

  const guessedLang = guesses[0].languageId;
  const highlighted = await highlight(code, guessedLang);

  return highlighted;
}

/**
 * Receive `<pre>` elements' text and classes, highlight and return them.
 * @param {{ textContent: string, classList: string[] }[]} allPre
 */
async function highlightAll(allPre) {
  const transformed = await Promise.all(allPre.map(async ({ code, classes }) => {
    if (classes.length === 0) {
      return guessAndHighlight(code);
    }
    else {
      const langClass = classes.find(className => className.startsWith('lang-'));

      if (!langClass) {
        return guessAndHighlight(code);
      }
      else {
        const regex = /(?<=lang-)[\w-]+/g; // find js, cpp, html in lang-js, lang-cpp, lang-html
        const [lang] = langClass.match(regex);

        if (lang === 'none') {
          return guessAndHighlight(code);
        }
        else {
          return highlight(code, lang);
        }
      }
    }
  }));

  return transformed;
}

browser.runtime.onMessage.addListener(
  (message, _sender, sendResponse) => {
    if (message.step === 1) {
      const { allPre } = message;

      highlightAll(allPre).then((highlighted) => {
        sendResponse({
          step: 2,
          highlighted,
        });
      });
    }

    return true;
  },
);
