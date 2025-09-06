import { Magika } from 'magika';
import { bundledLanguages, codeToHtml } from 'shiki';

async function guess(code) {
  const file = new File([code], 'fileName');
  const fileBytes = new Uint8Array(await file.arrayBuffer());
  const magika = await Magika.create();
  const magikaResult = await magika.identifyBytes(fileBytes);

  if (magikaResult.status !== 'ok') {
    throw new Error(magikaResult.status);
  }

  return magikaResult.prediction.output.label;
}

/**
 * Turn a code snippet into a syntax-highlighted HTML string.
 * @param {string} code The code snippet
 * @param {string} lang The language (specified or guessed) of the code
 */
async function highlight(code, lang) {
  const { theme } = await browser.storage.local.get();

  if (!theme) {
    // if undefined (first time), set to dark-plus
    await browser.storage.local.set({
      theme: 'dark-plus',
    });
  }

  const shikiApprovedLang = lang in bundledLanguages ? lang : 'plain';

  const html = await codeToHtml(code, {
    lang: shikiApprovedLang,
    theme: theme || 'dark-plus',
    transformers: [{
      code(hast) {
        if (shikiApprovedLang === 'plain')
          this.addClassToHast(hast, 'plain');
      },
    }],
  });

  return html;
}

async function guessAndHighlight(code) {
  const guessedLang = await guess(code);
  const highlighted = await highlight(code, guessedLang);

  return highlighted;
}

/**
 * Receive `<pre>` elements' text and classes, highlight and return them.
 * @param {{ code: string, classes: string[] }[]} allPreInfos
 */
async function highlightAll(allPreInfos) {
  const transformed = await Promise.all(allPreInfos.map(async ({ code, classes }) => {
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

        return lang === 'none' ? guessAndHighlight(code) : highlight(code, lang);
      }
    }
  }));

  return transformed;
}

browser.runtime.onMessage.addListener(
  (message, _sender, sendResponse) => {
    if (message.step === 1) {
      const { allPreInfos } = message;

      highlightAll(allPreInfos).then((highlighted) => {
        sendResponse({ step: 2, highlighted });
      });
    }

    return true;
  },
);
