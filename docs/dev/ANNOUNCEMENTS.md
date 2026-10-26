# Discord announcements

The Looscid Discord's #announcements channel gets its announcements from the GitHub Actions workflow `.github/workflows/discord-announce.yml`, which runs `.github/scripts/discord-announce.mjs` (plain Node, no packages, no outside services). It speaks through the Discord webhook "Looscid Bot", stored as the repository secret `DISCORD_ANNOUNCE_WEBHOOK`.

In the channel, only Looscid Bot, Moderators and the Founder can write. Everyone can react, open threads and reply in them.

## What it announces

- New videos on youtube.com/@Looscid: checked every 30 minutes through YouTube's public feed. Text: "New video: TITLE LINK".
- New builds: whenever a push to main changes `app/version.json` to a higher build. Text: "Looscid VERSION (build N) is live: WHAT'S NEW https://looscid.github.io/Looscid/changelog/", where What's new is the top CHANGELOG.md entry.
- Anything else, on demand (for example a new tweet from @Looscid): see below.

`.github/announce-state.json` remembers which videos and which build were already announced, so nothing repeats. The workflow updates it itself. If it is deleted, the next run only remembers what exists and announces nothing.

## Announcing something by hand (a tweet, news)

On GitHub: Looscid/Looscid, Actions, "Discord announcements", Run workflow. Type the announcement in "message", optionally paste a link (the tweet's address) in "url", then Run workflow.

From a terminal with the GitHub CLI:

    gh workflow run discord-announce.yml -R Looscid/Looscid -f message="Looscid has a new update" -f url="https://x.com/Looscid/status/123"

Or the API: POST /repos/Looscid/Looscid/actions/workflows/discord-announce.yml/dispatches with {"ref":"main","inputs":{"message":"...","url":"..."}}.

Running it with both fields empty just checks for new videos and builds.

Messages are plain text. Mentions like @everyone are never turned into pings.

## Changing the webhook

Discord, Looscid server, #announcements, Edit Channel, Integrations, Webhooks, Looscid Bot, Copy Webhook URL. Then on GitHub: Settings, Secrets and variables, Actions, DISCORD_ANNOUNCE_WEBHOOK, Update. Never put the address in a file or a commit.
