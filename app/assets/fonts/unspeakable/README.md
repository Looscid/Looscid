# Looscid Unspeakable (the robot character)

`looscid-unspeakable.woff2` is one character, U+F544 (the robot), cut from Font Awesome 6.7.2 Free Solid (`webfonts/fa-solid-900.ttf` in the npm package @fortawesome/fontawesome-free 6.7.2). It is what Settings, Accessibility, Sense, General, "Unspeakable characters" shows before and after headings, buttons, tabs, links, menu buttons and menu items (Round 7.36, build 186). U+F544 is a private-use character with no name, so VoiceOver reads it as "unspeakable".

- Made with fontTools: `pyftsubset fa-solid-900.ttf --unicodes=U+F544 --flavor=woff2 --layout-features='' --no-hinting --desubroutinize`, then renamed to "Looscid Unspeakable" (the SIL OFL reserves the name "Font Awesome" for unmodified fonts, and this one is a subset).
- Credit: Font Awesome Free by Fonticons, Inc. (https://fontawesome.com). The font is under the SIL Open Font License 1.1 and the icon design under CC BY 4.0. The full license is in LICENSE.txt in this folder, copied unchanged from the package.
- Loaded only from this site (css/a11y.css `@font-face`, preloaded in index.html; index.html's CSP allows `font-src 'self'`). No CDN.
