import { Magika } from 'magika';
import { bundledLanguages, codeToHtml } from 'shiki';

const initialStorage = {
  enabled: true,
  theme: 'dark-plus',
  fontFamily: '',
  importString: '',
  fontSize: '',
  lineHeight: '',
  letterSpacing: '',
};

browser.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    await browser.storage.local.set(initialStorage);
  }
  else if (details.reason === 'update') {
    const storage = await browser.storage.local.get();
    const currentKeys = Object.keys(storage);
    const initialKeys = Object.keys(initialStorage);

    for (const key of initialKeys) {
      if (!currentKeys.includes(key)) {
        browser.storage.local.set({ [key]: initialStorage[key] });
      }
    }
  }
});

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
  const shikiApprovedLang = lang in bundledLanguages ? lang : 'text';

  const html = await codeToHtml(code, {
    lang: shikiApprovedLang,
    theme: theme || 'dark-plus',
    transformers: [{
      code(hast) {
        this.addClassToHast(hast, `language-${shikiApprovedLang}`);
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
 * @param {{ code: string, lang: string | null }[]} allPreInfos
 */
async function highlightAll(allPreInfos) {
  const transformed = await Promise.all(allPreInfos.map(async ({ code, lang }) => {
    return lang === null || lang === 'none' ? guessAndHighlight(code) : highlight(code, lang);
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
