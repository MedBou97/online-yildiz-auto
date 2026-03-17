# setup-task.ps1
# Registers (or re-registers) Windows Task Scheduler tasks that run attend.js.
# Run once as Administrator.

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

# In PowerShell 7+, external command stderr can become terminating errors.
# We disable that behavior so schtasks /query can fail normally when a task is absent.
$PSNativeCommandUseErrorActionPreference = $false

# Paths
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$attendScript = Join-Path $scriptDir 'attend.js'

# Detect node.exe: PATH first, then common install locations.
$nodePath = $null
try {
    $nodePath = (Get-Command node -ErrorAction Stop).Source
}
catch {
}

if (-not $nodePath) {
    $candidates = @(
        "$env:ProgramFiles\nodejs\node.exe",
        "$env:LOCALAPPDATA\Programs\nodejs\node.exe"
    )

    foreach ($candidate in $candidates) {
        if (Test-Path $candidate) {
            $nodePath = $candidate
            break
        }
    }
}

if (-not $nodePath) {
    Write-Error 'node.exe not found. Install Node.js and ensure it is on PATH.'
    exit 1
}

Write-Host "Using node: $nodePath"

# Class definitions (keep in sync with config.js)
$taskClasses = @(
    @{ TaskName = 'YTU-Turkce2'; ClassId = 'turkce2'; DayOfWeek = 'MON'; Hour = 11; Minute = 0 }

    # You can add more classes here by following the same format. Just make sure to also add them to config.js.
    # @{ TaskName = 'YTU-Matematik'; ClassId = 'matematik'; DayOfWeek = 'WED'; Hour = 14; Minute = 0 }
)

foreach ($cls in $taskClasses) {
    $taskName = $cls.TaskName
    $classId = $cls.ClassId
    $dayOfWeek = $cls.DayOfWeek
    $startTime = '{0:D2}:{1:D2}' -f $cls.Hour, $cls.Minute

    $dayMap = @{
        MON = 'Monday'
        TUE = 'Tuesday'
        WED = 'Wednesday'
        THU = 'Thursday'
        FRI = 'Friday'
        SAT = 'Saturday'
        SUN = 'Sunday'
    }
    $triggerDay = if ($dayMap.ContainsKey($dayOfWeek)) { $dayMap[$dayOfWeek] } else { $dayOfWeek }

    Write-Host ''
    Write-Host "Registering task: $taskName (every $dayOfWeek at $startTime)"

    try {
        # Delete old task if it exists.
        Unregister-ScheduledTask -TaskName $taskName -Confirm:$false -ErrorAction SilentlyContinue

        $taskAction = New-ScheduledTaskAction -Execute $nodePath -Argument "`"$attendScript`" $classId" -WorkingDirectory $scriptDir
        $taskTrigger = New-ScheduledTaskTrigger -Weekly -DaysOfWeek $triggerDay -At $startTime
        $taskSettings = New-ScheduledTaskSettingsSet -WakeToRun -RunOnlyIfNetworkAvailable -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries
        $taskPrincipal = New-ScheduledTaskPrincipal -UserId "$env:USERDOMAIN\$env:USERNAME" -LogonType Interactive -RunLevel Limited

        Register-ScheduledTask `
            -TaskName $taskName `
            -Action $taskAction `
            -Trigger $taskTrigger `
            -Settings $taskSettings `
            -Principal $taskPrincipal `
            -Force | Out-Null

        Write-Host '  OK - task registered successfully.'
    }
    catch {
        Write-Warning "  Failed to register task: $taskName"
        Write-Warning "  $_"
    }
}

Write-Host ''
Write-Host 'Done. You can verify tasks in Task Scheduler (taskschd.msc).'
Write-Host 'To do a dry run: schtasks /run /tn YTU-Turkce2'
