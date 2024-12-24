import { bundledLanguages, codeToHtml } from 'shiki';

/**
 * Change `<pre>`'s html to be syntax highlighted by Shiki
 * @param {string} lang The language (specified or guessed) of the code block
 * @param {HTMLElement} pre The `<pre>` element
 * @returns {void}
 */
async function modifyHtml(lang, pre) {
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

  const html = await codeToHtml(pre.textContent, {
    lang: lang in bundledLanguages ? lang : 'plain',
    theme: theme || 'dark-plus',
  });

  pre.outerHTML = html;
}

/**
 * If it has a guess, pass that guess to `modifyHtml` and return true.
 *
 * If there's no guess, return false.
 * @param {HTMLElement} pre The `<pre>` element
 * @returns {boolean} Boolean
 */
async function guessAndModify(pre) {
  // eslint-disable-next-line no-undef
  const guessLang = new GuessLang();
  const guesses = await guessLang.runModel(pre.textContent);
  if (guesses.length === 0)
    return false;

  const guessedLang = guesses[0].languageId;
  modifyHtml(guessedLang, pre);

  return true;
}

/**
 * Find all code blocks in the document and modify their syntax highlighting.
 */
function modify() {
  for (const pre of document.querySelectorAll('pre')) {
    if (pre.classList.length === 0) {
      guessAndModify(pre);
    }
    else {
      for (const className of pre.classList.values()) {
        const regex = /(?<=lang-)[\w-]+/g; // find js, cpp, html in lang-js, lang-cpp, lang-html
        const langExists = className.match(regex);

        if (langExists) {
          const [lang] = langExists;

          if (lang === 'none') {
            guessAndModify(pre);
          }
          else {
            modifyHtml(lang, pre);
          }
        }
        else {
          // no "lang-xxx" class but maybe it has "default" class
          guessAndModify(pre);
        }
      }
    }
  }
}

/**
 * Customize Font declared in extension page
 */
async function customizeFont() {
  const { fontFamily, importString } = await browser.storage.local.get();
  if (!fontFamily)
    return;

  const styleString = `
    ${importString}
    code,
    .s-prose code,
    pre.s-code-block {
      font-size: 13px;
      line-height: 1.5;
      letter-spacing: 0.25px;
      font-family: '${fontFamily}', monospace;
    }
  `;

  const style = document.createElement('style');
  style.textContent = styleString;
  document.head.append(style);
}

async function handleChange(changes) {
  const changedItems = Object.keys(changes);

  for (const item of changedItems) {
    if (item === 'theme') {
      const { enabled } = await browser.storage.local.get();
      if (enabled)
        modify();
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

async function main() {
  const { enabled } = await browser.storage.local.get();

  if (enabled === undefined) {
    // first time, should always be boolean
    await browser.storage.local.set({
      enabled: true,
    });

    modify();
    customizeFont();
  }

  if (enabled) {
    modify();
    customizeFont();
  }

  browser.storage.local.onChanged.addListener(handleChange);
}

main();
