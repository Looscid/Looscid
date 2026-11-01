# UI check of the web client with a headless browser: join with an invite, post, search, chat, settings, mod page.
import sys, json
from playwright.sync_api import sync_playwright
home, seed, outdir, tag = sys.argv[1], json.loads(sys.argv[2]), sys.argv[3], sys.argv[4]
log = []
def step(m): print('..', m, flush=True)
def ok(c, m): log.append(('PASS ' if c else 'FAIL ') + m); print(log[-1], flush=True)
with sync_playwright() as p:
    b = p.chromium.launch()
    # new member joins through the web client
    ctx = b.new_context(bypass_csp=True, viewport={'width': 390, 'height': 844}, device_scale_factor=2, color_scheme='dark')
    pg = ctx.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e))); pg.on('console', lambda m: m.type == 'error' and errs.append(m.text))
    pg.goto(home + '/#join=' + seed['invite']); pg.wait_for_selector('#j-code')
    pg.screenshot(path=f'{outdir}/looscid-server-phone-welcome-dark{tag}.png', full_page=False)
    ok(pg.locator('h1').count() == 1, 'one h1 on welcome')
    import random; pg.fill('#j-handle', 'webtest' + str(random.randint(100, 999))); pg.fill('#j-name', 'Web Test'); pg.check('#j-age'); pg.click('button:text-is("Join")')
    pg.wait_for_function("location.hash === '#more/looscidid'", timeout=15000)
    step('settings'); pg.click('button:has-text("Show recovery phrase")'); pg.wait_for_selector('#phrase')
    phrase = pg.inner_text('#phrase'); ok(len(phrase.split()) == 24, 'new member sees 24-word recovery phrase')
    pg.goto(home + '/#discover'); pg.wait_for_selector('article.dream')
    ok(pg.locator('article.dream h3').count() >= 3, 'Discover lists Dreams as articles with headings')
    # follow nova, post in dreamline
    step('follow'); pg.goto(home + '/#@nova_test'); pg.wait_for_selector('button:text-is("Follow")'); pg.click('button:text-is("Follow")'); pg.wait_for_timeout(600)
    pg.goto(home + '/#dreamline'); pg.wait_for_selector('#c1-text, textarea')
    pg.fill('textarea >> nth=0', 'Hello from the web client test 🌙'); pg.click('button:has-text("Post Dream")'); pg.wait_for_timeout(1200)
    ok(pg.locator('article.dream', has_text='Hello from the web client test').count() >= 1, 'post from the web client shows in Dreamline')
    pg.wait_for_timeout(300)
    pg.screenshot(path=f'{outdir}/looscid-server-phone-dreamline-dark{tag}.png', full_page=False)
    # content warning toggle
    pg.goto(home + '/#discover'); pg.wait_for_selector('text=Content warning: movie spoiler')
    btn = pg.locator('button:has-text("Show Dream")').first.element_handle(); btn.click()
    ok(btn.get_attribute('aria-expanded') == 'true', 'content warning reveals with aria-expanded')
    # search
    pg.goto(home + '/#search/looscid'); pg.wait_for_selector('text=People'); pg.wait_for_timeout(500)
    ok(pg.locator('article.dream').count() >= 1, 'search finds a Dream')
    # image upload without alt refused in UI
    pg.goto(home + '/#dreamline'); pg.wait_for_selector('summary')
    pg.click('summary:has-text("Image")'); pg.set_input_files('input[type=file]', sys.argv[5])
    pg.fill('textarea >> nth=0', 'pic test'); pg.click('button:has-text("Post Dream")'); pg.wait_for_timeout(600)
    ok(pg.locator('.error', has_text='alt text').count() >= 1, 'web client refuses image without alt text')
    pg.fill('textarea[id$="-alt"]', 'An orange square'); pg.click('button:has-text("Post Dream")'); pg.wait_for_timeout(1500)
    ok(pg.locator('img[alt="An orange square"]').count() >= 1, 'image with alt posted and shown with its alt')
    # light mode phone
    ctxl = b.new_context(bypass_csp=True, viewport={'width': 390, 'height': 844}, device_scale_factor=2, color_scheme='light')
    pl = ctxl.new_page(); pl.goto(home + '/'); pl.wait_for_selector('#in-key')
    pl.fill('#in-key', seed['nova_nsec']); pl.click('button:has-text("Sign in")'); pl.wait_for_selector('article.dream'); pl.wait_for_timeout(500)
    pl.screenshot(path=f'{outdir}/looscid-server-phone-dreamline-light{tag}.png', full_page=False)
    ok(True, 'sign in with nsec (device switch) works')
    # desktop dark: owner mod page
    ctxd = b.new_context(bypass_csp=True, viewport={'width': 1280, 'height': 900}, color_scheme='dark')
    pd = ctxd.new_page(); pd.goto(home + '/'); pd.wait_for_selector('#in-key')
    pd.fill('#in-key', seed['owner_nsec']); pd.click('button:has-text("Sign in")'); pd.wait_for_selector('article.dream')
    pd.wait_for_timeout(500); pd.screenshot(path=f'{outdir}/looscid-server-desktop-dreamline-dark{tag}.png', full_page=False)
    pd.goto(home + '/#more/admin'); pd.wait_for_selector('text=Invite a moderator or admin'); pd.wait_for_timeout(400)
    pd.goto(home + '/#more'); pd.wait_for_selector('#cat-admin'); ok(pd.locator('#cat-admin').is_visible(), 'owner sees Admin in More')
    pd.screenshot(path=f'{outdir}/looscid-server-desktop-mod-dark{tag}.png', full_page=False)
    ctxdl = b.new_context(bypass_csp=True, viewport={'width': 1280, 'height': 900}, color_scheme='light')
    pdl = ctxdl.new_page(); pdl.goto(home + '/'); pdl.wait_for_selector('#in-key'); pdl.wait_for_timeout(300)
    pdl.screenshot(path=f'{outdir}/looscid-server-desktop-welcome-light{tag}.png', full_page=False)
    # accessibility structure checks
    for page, name in [(pg, 'phone'), (pd, 'desktop')]:
        n_live = page.locator('[aria-live]').count()
        unlabeled = page.evaluate("""() => [...document.querySelectorAll('input,textarea,select')].filter(e => e.type !== 'hidden' && !(e.labels && e.labels.length) && !e.getAttribute('aria-label')).length""")
        unnamed = page.evaluate("""() => [...document.querySelectorAll('button,a')].filter(e => !(e.textContent || e.getAttribute('aria-label') || '').trim()).length""")
        noalt = page.evaluate("""() => [...document.querySelectorAll('img')].filter(e => !e.hasAttribute('alt')).length""")
        ext = page.evaluate("""() => [...document.querySelectorAll('script[src],link[href],img[src]')].filter(e => { const u = new URL(e.src || e.href, location.href); return u.origin !== location.origin; }).length""")
        ok(n_live == 1 and unlabeled == 0 and unnamed == 0 and noalt == 0 and ext == 0 and page.locator('h1').count() == 1 and page.get_attribute('html', 'lang') == 'en-US',
           f'{name}: 1 live region, 1 h1, en-US, no unlabeled fields/unnamed controls/missing alt/outside resources ({n_live},{unlabeled},{unnamed},{noalt},{ext})')
    ok(not errs, 'no JS errors ' + '; '.join(errs[:3]))
    b.close()
print('\n'.join(log))
