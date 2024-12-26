async function main() {
  const [fontFamilyInput] = document.getElementsByName('font-family');
  const [importStringInput] = document.getElementsByName('import-string');
  const [fontSizeInput] = document.getElementsByName('font-size');
  const [lineHeightInput] = document.getElementsByName('line-height');
  const [letterSpacingInput] = document.getElementsByName('letter-spacing');
  const [submitBtn] = document.getElementsByTagName('button');
  const { fontFamily, importString, fontSize, lineHeight, letterSpacing } = await browser.storage.local.get();

  // if value found in storage, override inputs' values
  if (fontFamily) {
    fontFamilyInput.value = fontFamily;
  }

  if (importString) {
    importStringInput.value = importString;
  }

  if (fontSize) {
    fontSizeInput.value = fontSize;
  }

  if (lineHeight) {
    lineHeightInput.value = lineHeight;
  }

  if (letterSpacing) {
    letterSpacingInput.value = letterSpacing;
  }

  submitBtn.onclick = async (e) => {
    e.preventDefault();

    await browser.storage.local.set({
      fontFamily: fontFamilyInput.value,
      importString: importStringInput.value,
      fontSize: fontSizeInput.value,
      lineHeight: lineHeightInput.value,
      letterSpacing: letterSpacingInput.value,
    });

    const saveMsg = document.getElementById('save-msg');
    saveMsg.textContent = 'Saved!';

    setTimeout(() => {
      saveMsg.textContent = '';
    }, 5000);
  };
}

main();
