/* Looscid, js/mount.js: core and every tab file are loaded, so start the app (Security pass 5/6: was an inline script).
   Not inside another website's frame (see js/boot.js). */
if (!window.LOOSCID_FRAMED) ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(Looscid.ErrorBoundary, null, React.createElement(Looscid.App, null)));
