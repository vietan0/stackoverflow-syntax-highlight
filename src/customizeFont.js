/**
 * Customize font using settings declared in extension page.
 */
export default async function customizeFont() {
  const {
    fontFamily,
    importString,
    fontSize,
    lineHeight,
    letterSpacing,
  } = await browser.storage.local.get();

  if (!fontFamily && !fontSize && !lineHeight && !letterSpacing)
    return;

  const styleString = `
    ${importString}
    code,
    .s-prose code {
      font-size: ${fontSize}px;
      line-height: ${lineHeight};
      letter-spacing: ${letterSpacing}px;
      font-family: '${fontFamily}', monospace;
    }
  `;

  const styleClass = 'stackoverflow-syntax-highlight';

  for (const elem of document.getElementsByClassName(styleClass)) {
    elem.remove();
  }

  const style = document.createElement('style');
  style.className = styleClass;
  style.textContent = styleString;
  document.head.append(style);
}
