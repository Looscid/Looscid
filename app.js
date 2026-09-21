const KEYS = Object.freeze({ route: "looscid.route", tab: "looscid.feedTab", draft: "looscid.draft", dreams: "looscid.dreams" });

const state = { route: read(KEYS.route, "feed"), tab: read(KEYS.tab, "following"), draft: read(KEYS.draft, ""), dreams: read(KEYS.dreams, []) };

const $ = (selector) => document.querySelector(selector);

const elements = { menu: $("#menu-button"), navigation: $("#primary-navigation"), main: $("#main-content"), status: $("#status-region"), form: $("#dream-form"), text: $("#dream-text"), save: $("#save-draft-button"), tabs: [...document.querySelectorAll("[data-feed-tab]")], panels: [...document.querySelectorAll("[data-feed-panel]")], pages: [...document.querySelectorAll("[data-page]")], following: $("#following-dreams"), discover: $("#discover-dreams") };

if (!Array.isArray(state.dreams) || state.dreams.length === 0) { state.dreams = [{ id: "local-example", authorName: "Local Dreamor", body: "This Dream is available locally before any network connection.", createdAt: new Date().toISOString(), local: true }]; }

document.addEventListener("DOMContentLoaded", initialize);

function initialize() { bindMenu(); bindNavigation(); bindTabs(); bindComposer(); elements.text.value = state.draft; renderRoute(window.location.hash.slice(1) || state.route); setTab(state.tab); renderDreams(); }

function bindMenu() { elements.menu.addEventListener("click", () => { const open = elements.menu.getAttribute("aria-expanded") === "true"; elements.menu.setAttribute("aria-expanded", String(!open)); elements.navigation.hidden = open; if (!open) elements.navigation.querySelector("a")?.focus(); }); document.addEventListener("keydown", (event) => { if (event.key === "Escape" && !elements.navigation.hidden) { closeMenu(); elements.menu.focus(); } }); }

function bindNavigation() { elements.navigation.addEventListener("click", (event) => { const link = event.target.closest("[data-route]"); if (!link) return; event.preventDefault(); window.location.hash = link.dataset.route; closeMenu(); renderRoute(link.dataset.route); }); window.addEventListener("hashchange", () => renderRoute(window.location.hash.slice(1))); }

function bindTabs() { elements.tabs.forEach((tab, index) => { tab.addEventListener("click", () => setTab(tab.dataset.feedTab)); tab.addEventListener("keydown", (event) => { if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return; event.preventDefault(); let next = index; if (event.key === "ArrowLeft") next = (index - 1 + elements.tabs.length) % elements.tabs.length; if (event.key === "ArrowRight") next = (index + 1) % elements.tabs.length; if (event.key === "Home") next = 0; if (event.key === "End") next = elements.tabs.length - 1; setTab(elements.tabs[next].dataset.feedTab); elements.tabs[next].focus(); }); }); }

function bindComposer() { elements.text.addEventListener("input", () => { state.draft = elements.text.value; write(KEYS.draft, state.draft); }); elements.save.addEventListener("click", () => { write(KEYS.draft, elements.text.value); announce("Draft saved locally."); }); elements.form.addEventListener("submit", (event) => { event.preventDefault(); const body = elements.text.value.trim(); if (!body) { announce("Dream text is required."); elements.text.focus(); return; } state.dreams.unshift({ id: `local-${Date.now()}`, authorName: "You", body, createdAt: new Date().toISOString(), local: true }); write(KEYS.dreams, state.dreams); elements.text.value = ""; state.draft = ""; write(KEYS.draft, ""); renderDreams(); announce("Dream published locally."); }); }

function renderRoute(route) { const page = elements.pages.find((candidate) => candidate.dataset.page === route) || elements.pages.find((candidate) => candidate.dataset.page === "feed"); state.route = page.dataset.page; write(KEYS.route, state.route); elements.pages.forEach((candidate) => { candidate.hidden = candidate !== page; }); page.querySelector("h1")?.focus({ preventScroll: true }); elements.main.focus({ preventScroll: true }); }

function setTab(tabName) { const selected = elements.tabs.find((tab) => tab.dataset.feedTab === tabName) || elements.tabs[0]; state.tab = selected.dataset.feedTab; write(KEYS.tab, state.tab); elements.tabs.forEach((tab) => { const active = tab === selected; tab.setAttribute("aria-selected", String(active)); tab.tabIndex = active ? 0 : -1; }); elements.panels.forEach((panel) => { panel.hidden = panel.dataset.feedPanel !== state.tab; }); }

function renderDreams() { renderList(elements.following); renderList(elements.discover); }

function renderList(container) { container.replaceChildren(...state.dreams.map(createDream)); }

function createDream(dream) { const article = document.createElement("article"); article.className = "dream"; const heading = document.createElement("h3"); heading.textContent = `${dream.authorName}'s Dream`; const body = document.createElement("p"); body.textContent = dream.body; const time = document.createElement("time"); time.dateTime = dream.createdAt; time.textContent = formatDate(dream.createdAt); const metadata = document.createElement("p"); metadata.append("Published ", time); const source = document.createElement("p"); source.textContent = dream.local ? "Stored on this device." : "Synced."; article.append(heading, body, metadata, source); return article; }

function formatDate(value) { const date = new Date(value); return Number.isNaN(date.getTime()) ? "Date unavailable" : new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(date); }

function closeMenu() { elements.navigation.hidden = true; elements.menu.setAttribute("aria-expanded", "false"); }

function announce(message) { elements.status.textContent = ""; window.setTimeout(() => { elements.status.textContent = message; }, 0); }

function read(key, fallback) { try { const value = localStorage.getItem(key); return value === null ? fallback : JSON.parse(value); } catch { return fallback; } }

function write(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch { announce("This device could not save the local change."); } }
