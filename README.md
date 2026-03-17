# Yildiz Online Class Automation

This project opens your class page on [online.yildiz.edu.tr](https://online.yildiz.edu.tr/), clicks **Derse Katil**, and then attempts to click the Zoom launch popup automatically.

After the initial setup, it can run on schedule without manual login.

---

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- Google Chrome

---

## First-Time Setup

### 1. Install dependencies

```powershell
cd C:\automation\online-yildiz-auto
npm install
npx playwright install chrome
```

### 2. Create configuration files

1. Create `config.js` by copying `config.example.js`, then add your class data.
2. Create `setup-task.ps1` by copying `setup-task.example.ps1`, then update task entries so they match `config.js`.

### 3. Log in once (save browser session)

```powershell
node setup.js
```

- Chrome opens with a dedicated profile and navigates to the site.
- Log in manually in that Chrome window.
- In the Playwright Inspector, click **Resume** (the green triangle on the toolbar).
- The browser closes and your session is saved in `./chrome-profile/`.

You only need to do this once. Future runs reuse the saved session cookies.

### 4. Register Windows Task Scheduler tasks

Open PowerShell **as Administrator**, then run:

```powershell
cd C:\automation\online-yildiz-auto
.\setup-task.ps1
```

This registers the weekly tasks defined in `setup-task.ps1` (for example: `YTU-Turkce2`, `YTU-Ataturk2`, `YTU-DavranisBilimi`).

To test a task manually:

```powershell
schtasks /run /tn YTU-Turkce2
```

### 5. First Zoom popup behavior

On the first run, Chrome may show a native prompt such as **Open Zoom Meetings?**

- The script can click web-page popups/buttons, but it cannot reliably control Chrome's native browser prompt.
- When prompted, check **Always allow online.yildiz.edu.tr to open links of this type in the associated app** and click **Open**.
- After you allow this once, future runs are usually fully automatic.

---

## Manual Run

Run any class immediately:

```powershell
node attend.js turkce2
```

---

## Adding More Classes

1. Open `config.js` and add a new object to the `classes` array.
2. Open `setup-task.ps1` and add the matching task entry in `$taskClasses`.
3. Re-run `setup-task.ps1` as Administrator.

Example class entry:

```js
{
  id: "matematik",
  name: "Matematik",
  url: "https://online.yildiz.edu.tr/?transaction=LMS.EDU.LessonProgram.ViewLessonProgramAsStudent/XXXXX/0",
  schedule: { dayOfWeek: 3, hour: 14, minute: 0 },
}
```

---

## Troubleshooting

| Problem                                         | Fix                                                                                    |
| ----------------------------------------------- | -------------------------------------------------------------------------------------- |
| Browser opens but **Derse Katil** is not found  | The button text may differ on your page. Update `JOIN_BUTTON_SELECTOR` in `attend.js`. |
| Session expired and you are redirected to login | Run `node setup.js` again and log in to refresh the saved session.                     |
| Task Scheduler does not run the script          | Check the `node.exe` path in Task Scheduler task actions.                              |
| Chrome profile is locked                        | Make sure no other Chrome instance is using `./chrome-profile/` at the same time.      |
| Zoom does not open automatically                | Allow the Chrome native prompt once using the **Always allow** checkbox.               |

---

## Project Files

| File              | Purpose                                |
| ----------------- | -------------------------------------- |
| `config.js`       | Class definitions and shared settings  |
| `attend.js`       | Main automation script                 |
| `setup.js`        | One-time login/session setup           |
| `setup-task.ps1`  | Registers Windows Task Scheduler tasks |
| `chrome-profile/` | Saved Chrome session data              |
