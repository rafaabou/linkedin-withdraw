# LinkedIn Withdrawal Automation

Developed by: **Bahae Eddine HALIM**  
Contact: https://www.linkedin.com/in/halimbahae/

Automates withdrawing sent LinkedIn invitations — with auto-scroll, pause/resume, and completion summary.

## Features

- **Auto-scroll** — loads all sent invitations before starting (handles lazy loading)
- **Configurable speed** — 2s between withdrawals
- **Pause/Resume** — floating button at top-right of the page
- **Completion summary** — shows total withdrawn when done

## Installation

### 1. Install Violentmonkey
- Firefox → [addons.mozilla.org/en-US/firefox/addon/violentmonkey/](https://addons.mozilla.org/en-US/firefox/addon/violentmonkey/)
- Click **"Add to Firefox"**

### 2. Install the script
Open the raw script URL in Firefox:
```text
https://raw.githubusercontent.com/rafaabou/linkedin-withdraw/main/linkedin-withdraw.user.js
```
Violentmonkey detects it automatically and prompts to install → click **"Install"**.

Or drag the `linkedin-withdraw.user.js` file (from this repo) into Firefox.

## Firefox Addon (no Violentmonkey needed)

The addon is signed and approved by Mozilla. Install as a permanent Firefox extension:

1. Download the signed `.xpi` from [GitHub Releases](https://github.com/rafaabou/linkedin-withdraw/releases)
2. Firefox → `about:addons` → gear icon → **"Install Add-on From File..."**
3. Select the downloaded `.xpi`

No configuration needed — installs permanently, survives restarts, no warnings.

## Usage

1. Go to: `https://www.linkedin.com/mynetwork/invitation-manager/sent/`
2. The script auto-loads all invitations, then starts withdrawing
3. Use the **Pause/Resume** button (top-right) to control the process
4. Open console (F12) to see progress logs

## After Installation — What Now?

1. Visit the sent invitations page — the automation **starts immediately**
2. A blue **Pause** button appears at the top-right of the page
3. The page auto-scrolls to load all sent invitations
4. "Withdraw" buttons are clicked one by one (2 seconds apart)
5. Press **F12 → Console** to see progress: "Confirmed withdrawal #1", "#2", etc.

**When finished:**
- A green popup appears: "Withdrawn: X invitations"
- The button changes to "Done (X)"

**To stop/pause:** Click the blue **Pause** button → click **Resume** to continue
**To restart:** Just revisit the sent invitations page — it runs automatically

## Files

| File | Purpose |
|---|---|
| `linkedin-withdraw.user.js` | Userscript (Violentmonkey) |
| `content.js` | Firefox extension content script |
| `manifest.json` | Firefox extension manifest |
| `icons/` | Extension icons |

## License

MIT
