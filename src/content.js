import { codeToHtml } from 'shiki'

const code = 'const a = 1' // input code

codeToHtml(code, {
  lang: 'javascript',
  theme: 'vitesse-dark'
}).then((value) => {
  console.log('value', value);
})
