# Yildiz Online Class Automation

Automatically opens your class page on [online.yildiz.edu.tr](https://online.yildiz.edu.tr/) and clicks **"Canlı Derse Katıl"** at the scheduled time — no manual login required after the first setup.

---

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- Google Chrome installed

---

## First-time setup

### 1. Install dependencies

```powershell
cd C:\automation\online-yildiz-auto
npm install
npx playwright install chrome
```

### 2. Log in once (saves your session)

```powershell
node setup.js
```

- Chrome opens with a fresh dedicated profile and navigates to the site.
- **Log in manually** in the browser window.
- Once logged in, click **Resume** in the Playwright Inspector that appears.
- The browser closes and your session is saved to `./chrome-profile/`.

> You only need to do this once. Subsequent runs reuse the saved cookies.

### 3. Register the Windows Task Scheduler task

Open PowerShell **as Administrator**, then:

```powershell
cd C:\automation\online-yildiz-auto
.\setup-task.ps1
```

This registers a weekly task called `YildizOnlineClass-Turkce2` that runs every **Monday at 11:00**.

Verify in Task Scheduler (`taskschd.msc`) or run manually:

```powershell
schtasks /run /tn YildizOnlineClass-Turkce2
```

---

## Manual run

You can also run the script at any time yourself:

```powershell
node attend.js turkce2
```

---

## Adding more classes

1. Open `config.js` and add a new object to the `classes` array:

```js
{
  id: 'matematik',
  name: 'Matematik',
  url: 'https://online.yildiz.edu.tr/?transaction=LMS.EDU.LessonProgram.ViewLessonProgramAsStudent/XXXXX/0',
  schedule: { dayOfWeek: 3, hour: 14, minute: 0 },
},
```

2. Open `setup-task.ps1` and uncomment / add the matching entry in `$taskClasses`.

3. Re-run `.\setup-task.ps1` as Administrator to register the new task.

---

## Troubleshooting

| Problem                                            | Fix                                                                                                                      |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Browser opens but "Canlı Derse Katıl" is not found | The button text may differ slightly. Inspect the page and update `JOIN_BUTTON_SELECTOR` in `attend.js`.                  |
| Session expired (redirected to login)              | Run `node setup.js` again to log in and refresh the session.                                                             |
| Task Scheduler doesn't run the script              | Check that `node.exe` path in the task action is correct. Open Task Scheduler → right-click task → Properties → Actions. |
| Script errors with Chrome profile locked           | Make sure no other Chrome window using `./chrome-profile/` is open at the same time.                                     |

---

## File overview

| File              | Purpose                                            |
| ----------------- | -------------------------------------------------- |
| `config.js`       | Class definitions and profile path                 |
| `attend.js`       | Core automation script                             |
| `setup.js`        | First-run login helper                             |
| `setup-task.ps1`  | Registers Windows Task Scheduler tasks             |
| `chrome-profile/` | Saved Chrome session (auto-created, not committed) |
