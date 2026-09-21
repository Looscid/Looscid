const KEYS = Object.freeze({ onboarding: "looscid.onboardingComplete", profile: "looscid.profile", route: "looscid.route", tab: "looscid.feedTab", draft: "looscid.draft", dreams: "looscid.dreams" });

const read = (key, fallback) => { try { const value = localStorage.getItem(key); return value === null ? fallback : JSON.parse(value); } catch { return fallback; } };

const write = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); } catch { announce("This device could not save the local change."); } };

const $ = (selector) => document.querySelector(selector);

const state = { onboarding: read(KEYS.onboarding, false), profile: read(KEYS.profile, null), route: read(KEYS.route, "feed"), tab: read(KEYS.tab, "following"), draft: read(KEYS.draft, ""), dreams: read(KEYS.dreams, []) };

const elements = { onboarding: $("#onboarding"), onboardingForm: $("#onboarding-form"), displayName: $("#display-name"), reducedMotion: $("#reduced-motion"), largerText: $("#larger-text"), npub: $("#nostr-npub"), displayNameError: $("#display-name-error"), npubError: $("#npub-error"), header: $(".site-header"), footer: $(".site-footer"), menu: $("#menu-button"), navigation: $("#primary-navigation"), main: $("#main-content"), status: $("#status-region"), form: $("#dream-form"), text: $("#dream-text"), imageUrl: $("#image-url"), imageAlt: $("#image-alt"), imageError: $("#image-error"), save: $("#save-draft-button"), tabs: [...document.querySelectorAll("[data-feed-tab]")], panels: [...document.querySelectorAll("[data-feed-panel]")], pages: [...document.querySelectorAll("[data-page]")], following: $("#following-dreams"), discover: $("#discover-dreams") };

if (!Array.isArray(state.dreams) || state.dreams.length === 0) state.dreams = [{ id: "local-example", authorName: "Local Dreamor", body: "This Dream is available locally before any network connection.", createdAt: new Date().toISOString(), local: true }];

document.addEventListener("DOMContentLoaded", initialize);

function initialize() { bindOnboarding(); bindMenu(); bindNavigation(); bindTabs(); bindComposer(); elements.text.value = state.draft; state.onboarding ? showApplication() : showOnboarding(); }

function bindOnboarding() { elements.onboardingForm.addEventListener("submit", (event) => { event.preventDefault(); const name = elements.displayName.value.trim(); const npub = elements.npub.value.trim(); elements.displayNameError.textContent = ""; elements.npubError.textContent = ""; if (name.length < 2) { elements.displayNameError.textContent = "Enter a display name with at least two characters."; elements.displayName.focus(); announce("A display name is required."); return; } if (npub && !/^npub1[a-z0-9]+$/.test(npub)) { elements.npubError.textContent = "Enter a valid public npub, or leave this field blank."; elements.npub.focus(); announce("The public npub needs attention."); return; } state.profile = { displayName: name, npub, reducedMotion: elements.reducedMotion.checked, largerText: elements.largerText.checked, createdAt: new Date().toISOString() }; state.onboarding = true; write(KEYS.profile, state.profile); write(KEYS.onboarding, true); applyPreferences(); showApplication(); announce(`Welcome to Looscid, ${name}.`); }); }

function showOnboarding() { elements.header.hidden = true; elements.footer.hidden = true; elements.pages.forEach((page) => { page.hidden = true; }); elements.onboarding.hidden = false; window.setTimeout(() => $("#onboarding-heading")?.focus(), 0); }

function showApplication() { elements.header.hidden = false; elements.footer.hidden = false; elements.onboarding.hidden = true; applyPreferences(); if (elements.main.dataset.bound === "true") return; elements.main.dataset.bound = "true"; renderRoute(window.location.hash.slice(1) || state.route); setTab(state.tab); renderDreams(); }

function applyPreferences() { document.documentElement.classList.toggle("larger-text", Boolean(state.profile?.largerText)); document.documentElement.classList.toggle("reduced-motion", Boolean(state.profile?.reducedMotion)); }

function bindMenu() { elements.menu.addEventListener("click", () => { const open = elements.menu.getAttribute("aria-expanded") === "true"; elements.menu.setAttribute("aria-expanded", String(!open)); elements.navigation.hidden = open; if (!open) elements.navigation.querySelector("a")?.focus(); }); document.addEventListener("keydown", (event) => { if (event.key === "Escape" && !elements.navigation.hidden) { closeMenu(); elements.menu.focus(); } }); }

function bindNavigation() { elements.navigation.addEventListener("click", (event) => { const link = event.target.closest("[data-route]"); if (!link) return; event.preventDefault(); window.location.hash = link.dataset.route; closeMenu(); renderRoute(link.dataset.route); }); window.addEventListener("hashchange", () => { if (state.onboarding) renderRoute(window.location.hash.slice(1)); }); }

function bindTabs() { elements.tabs.forEach((tab, index) => { tab.addEventListener("click", () => setTab(tab.dataset.feedTab)); tab.addEventListener("keydown", (event) => { if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return; event.preventDefault(); let next = index; if (event.key === "ArrowLeft") next = (index - 1 + elements.tabs.length) % elements.tabs.length; if (event.key === "ArrowRight") next = (index + 1) % elements.tabs.length; if (event.key === "Home") next = 0; if (event.key === "End") next = elements.tabs.length - 1; setTab(elements.tabs[next].dataset.feedTab); elements.tabs[next].focus(); }); }); }

function bindComposer() { elements.text.addEventListener("input", () => { state.draft = elements.text.value; write(KEYS.draft, state.draft); }); elements.save.addEventListener("click", () => { write(KEYS.draft, elements.text.value); announce("Draft saved locally."); }); elements.form.addEventListener("submit", (event) => { event.preventDefault(); const body = elements.text.value.trim(); const imageUrl = elements.imageUrl.value.trim(); const imageAlt = elements.imageAlt.value.trim(); elements.imageError.textContent = ""; if (!body) { announce("Dream text is required."); elements.text.focus(); return; } if (imageUrl && !imageAlt) { elements.imageError.textContent = "Adding images requires Alt text. Describe this image before publishing."; elements.imageAlt.setAttribute("aria-required", "true"); elements.imageAlt.focus(); announce("Adding images requires Alt text. Image publication is blocked until a description is provided."); return; } state.dreams.unshift({ id: `local-${Date.now()}`, authorName: state.profile?.displayName || "You", body, imageUrl: imageUrl || null, imageAlt: imageUrl ? imageAlt : null, createdAt: new Date().toISOString(), local: true }); write(KEYS.dreams, state.dreams); elements.text.value = ""; elements.imageUrl.value = ""; elements.imageAlt.value = ""; elements.imageAlt.setAttribute("aria-required", "false"); write(KEYS.draft, ""); renderDreams(); announce("Dream published locally."); }); }

function renderRoute(route) { const page = elements.pages.find((candidate) => candidate.dataset.page === route) || elements.pages.find((candidate) => candidate.dataset.page === "feed"); state.route = page.dataset.page; write(KEYS.route, state.route); elements.pages.forEach((candidate) => { candidate.hidden = candidate !== page; }); page.querySelector("h1")?.focus({ preventScroll: true }); }

function setTab(tabName) { const selected = elements.tabs.find((tab) => tab.dataset.feedTab === tabName) || elements.tabs[0]; state.tab = selected.dataset.feedTab; write(KEYS.tab, state.tab); elements.tabs.forEach((tab) => { const active = tab === selected; tab.setAttribute("aria-selected", String(active)); tab.tabIndex = active ? 0 : -1; }); elements.panels.forEach((panel) => { panel.hidden = panel.dataset.feedPanel !== state.tab; }); }

function renderDreams() { [elements.following, elements.discover].forEach((container) => container.replaceChildren(...state.dreams.map(createDream))); }

function createDream(dream) { const article = document.createElement("article"); article.className = "dream"; const heading = document.createElement("h3"); heading.textContent = `${dream.authorName}'s Dream`; const body = document.createElement("p"); body.textContent = dream.body; article.append(heading, body); if (dream.imageUrl && dream.imageAlt) { const image = document.createElement("img"); image.src = dream.imageUrl; image.alt = dream.imageAlt; image.loading = "lazy"; article.append(image); } const time = document.createElement("time"); time.dateTime = dream.createdAt; time.textContent = formatDate(dream.createdAt); const metadata = document.createElement("p"); metadata.append("Published ", time); const source = document.createElement("p"); source.textContent = dream.local ? "Stored on this device." : "Synced."; article.append(metadata, source); return article; }

function formatDate(value) { const date = new Date(value); return Number.isNaN(date.getTime()) ? "Date unavailable" : new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(date); }

function closeMenu() { elements.navigation.hidden = true; elements.menu.setAttribute("aria-expanded", "false"); }

function announce(message) { elements.status.textContent = ""; window.setTimeout(() => { elements.status.textContent = message; }, 0); }
