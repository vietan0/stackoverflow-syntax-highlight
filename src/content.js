import { codeToHtml, bundledLanguages } from 'shiki'

function isDarkTheme() {
  const classes = Array.from(document.body.classList);
  if (classes.includes('theme-dark')) return true;
  if (classes.includes('theme-dark__forced')) return true;
  if (classes.includes('theme-light__forced')) return false;
  if (classes.includes('theme-system')) {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return true;
    }
    return false;
  }
  return false;
}

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

  const html = await codeToHtml(pre.innerText, {
    lang: lang in bundledLanguages ? lang : 'plain',
    theme: isDarkTheme() ? 'dark-plus' : 'light-plus',
  });

  pre.outerHTML = html;
}

/**
 * If it has a guess, pass that guess to `modifyHtml` and return true.
 *
 * If there's no guess, return false.
 * @param {HTMLElement} pre The `<pre>` element
 * @returns {boolean}
 */
async function guessAndModify(pre) {
  const guessLang = new GuessLang();
  const guesses = await guessLang.runModel(pre.innerText);
  if (guesses.length === 0) return false;

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
        } else {
          // no "lang-xxx" class but maybe it has "default" class
          guessAndModify(pre);
        }
      }
    }
  };
}

function listenToThemeChange() {
  const observer = new MutationObserver((mutationList) => {
    for (const mutation of mutationList) {
      if (mutation.type === "attributes" && mutation.attributeName === 'class') {
        modify();
      }
    }
  });
  observer.observe(document.body, { attributes: true });
}

modify();
listenToThemeChange();

