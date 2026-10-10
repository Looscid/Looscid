const form = document.querySelector('#search-form');
const search = document.querySelector('#search');
const cards = [...document.querySelectorAll('#catalog article.card')];
const status = document.querySelector('#search-status');
const empty = document.querySelector('#no-results');
function filterCards() {
  const query = search.value.trim().toLocaleLowerCase();
  let count = 0;
  for (const card of cards) {
    const visible = !query || card.textContent.toLocaleLowerCase().includes(query);
    card.hidden = !visible;
    if (visible) count++;
  }
  status.textContent = query ? `${count} ${count === 1 ? 'entry' : 'entries'} found.` : 'Showing all entries.';
  empty.hidden = count !== 0;
}
form.addEventListener('submit', event => { event.preventDefault(); filterCards(); });
search.addEventListener('keydown', event => {
  if (event.key === 'Enter' || event.keyCode === 13) { event.preventDefault(); filterCards(); }
});



// Platform-specific sharing content and accessible controls; no external SDKs.
(() => {
  const canonicalUrl = 'https://2three1y.github.io/soundvault/';
  const shareTextByPlatform = {
    twitter: 'Soundvault — The Vault of sounds. For everyone to access. Curated speech tools, soundpacks, and accessible audio resources. #soundvault',
    mastodon: 'Soundvault — The Vault of sounds. For everyone to access. A curated archive of soundpacks, retro screen reader chimes, and tactile computing audio. #soundvault',
    threads: 'Soundvault — The Vault of sounds. For everyone to access. Curated accessible soundpacks and speech tools. #soundvault',
    nostr: 'Soundvault — The Vault of sounds. For everyone to access. Free, sovereign catalog of accessible audio, speech engines, and sound themes. #soundvault',
    facebook: 'Soundvault — The Vault of sounds. For everyone to access. #soundvault'
  };
  const defaultShareText = shareTextByPlatform.twitter + ' ' + canonicalUrl;
  const platformSelect = document.querySelector('#share-platform');
  const actionButton = document.querySelector('#share-action-btn');
  const copyButton = document.querySelector('#share-copy-btn');
  const instanceField = document.querySelector('#mastodon-instance-field');
  const instanceInput = document.querySelector('#mastodon-instance');
  const status = document.querySelector('#share-status');
  const deviceButton = document.querySelector('#device-share');

  const copyText = async text => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const field = document.createElement('textarea');
        field.value = text;
        field.setAttribute('readonly', '');
        field.style.position = 'fixed';
        field.style.opacity = '0';
        document.body.appendChild(field);
        field.select();
        const copied = document.execCommand('copy');
        field.remove();
        if (!copied) throw new Error('Clipboard copy unavailable');
      }
      status.textContent = 'Copied share text to clipboard!';
    } catch {
      status.textContent = 'Could not copy automatically. You can copy this text: ' + text;
    }
  };

  const updateShareUI = () => {
    instanceField.hidden = platformSelect.value !== 'mastodon';
  };

  platformSelect.addEventListener('change', updateShareUI);
  updateShareUI();
  copyButton.addEventListener('click', () => copyText(defaultShareText));
  instanceInput.addEventListener('keydown', event => {
    if (event.key === 'Enter') {
      event.preventDefault();
      actionButton.click();
    }
  });
  actionButton.addEventListener('click', () => {
    const platform = platformSelect.value;
    const promoText = shareTextByPlatform[platform] || shareTextByPlatform.twitter;
    const encodedUrl = encodeURIComponent(canonicalUrl);
    const encodedText = encodeURIComponent(promoText + ' ' + canonicalUrl);
    let intentUrl;

    if (platform === 'mastodon') {
      let instance = instanceInput.value.trim().replace(/^@+/, '').replace(/^https?:\/\//i, '').replace(/@/g, '').replace(/\/+$/, '');
      if (!instance) instance = 'mastodon.social';
      try {
        const parsedInstance = new URL('https://' + instance);
        if (parsedInstance.pathname !== '/' || parsedInstance.search || parsedInstance.hash) throw new Error('Enter an instance domain only');
        instance = parsedInstance.host;
      } catch {
        status.textContent = 'Enter a valid Mastodon instance domain, such as mastodon.social.';
        instanceInput.focus();
        return;
      }
      intentUrl = 'https://' + instance + '/share?text=' + encodedText;
    } else if (platform === 'twitter') {
      intentUrl = 'https://twitter.com/intent/tweet?text=' + encodedText;
    } else if (platform === 'threads') {
      intentUrl = 'https://www.threads.net/intent/post?text=' + encodedText;
    } else if (platform === 'facebook') {
      intentUrl = 'https://www.facebook.com/sharer/sharer.php?u=' + encodedUrl + '&quote=' + encodeURIComponent(promoText);
    } else if (platform === 'nostr') {
      copyText(encodedText ? promoText + ' ' + canonicalUrl : promoText);
      return;
    }

    if (intentUrl) window.open(intentUrl, '_blank', 'noopener,noreferrer');
  });

  if (typeof navigator.share === 'function') {
    deviceButton.hidden = false;
    deviceButton.addEventListener('click', async () => {
      try {
        await navigator.share({title: 'Soundvault', text: shareTextByPlatform.twitter, url: canonicalUrl});
      } catch (error) {
        if (error.name !== 'AbortError') status.textContent = 'Device sharing is unavailable right now. You can use the selected platform or copy the share text.';
      }
    });
  }
})();
