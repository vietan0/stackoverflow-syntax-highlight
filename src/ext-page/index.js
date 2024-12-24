async function main() {
  const [fontFamilyInput] = document.getElementsByName('font-family');
  const [importStringInput] = document.getElementsByName('import-string');
  const [submitBtn] = document.getElementsByTagName('button');
  const { fontFamily, importString } = await browser.storage.local.get();

  // if value found in storage, override inputs' values
  if (fontFamily) {
    fontFamilyInput.value = fontFamily;
  }

  if (importString) {
    importStringInput.value = importString;
  }

  submitBtn.onclick = async (e) => {
    e.preventDefault();

    await browser.storage.local.set({
      fontFamily: fontFamilyInput.value,
      importString: importStringInput.value,
    });

    const saveMsg = document.getElementById('save-msg');
    saveMsg.textContent = 'Saved!';

    setTimeout(() => {
      saveMsg.textContent = '';
    }, 5000);
  };
}

main();
