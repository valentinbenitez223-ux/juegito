# ==============================================================================
# NUESTRO NIDO | Script Vigilante de Auto-Push en Segundo Plano para Windows
# ==============================================================================

$repoPath = $PSScriptRoot
Set-Location $repoPath

# Asegurar que Git y herramientas de usuario estén en el PATH de este proceso
$userPaths = @(
  "$env:LOCALAPPDATA\Programs\Git\cmd",
  "$env:LOCALAPPDATA\Programs\Git\bin",
  "$env:LOCALAPPDATA\Programs\Git\ucrt64\bin",
  "C:\Program Files\Git\cmd",
  "C:\Program Files\Git\bin",
  "$env:LOCALAPPDATA\Programs\nodejs",
  "C:\Program Files\nodejs"
)
foreach ($p in $userPaths) {
  if ((Test-Path $p) -and ($env:Path -notlike "*$p*")) {
    $env:Path = "$p;$env:Path"
  }
}

$logFile = Join-Path $repoPath "auto-push.log"

function Write-SyncLog($msg) {
  $time = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
  $line = "[$time] $msg"
  Write-Output $line
  Add-Content -Path $logFile -Value $line -ErrorAction SilentlyContinue
}

Write-SyncLog "Iniciando vigilancia de auto-push en $repoPath..."

while ($true) {
  try {
    # Verificar si el repo git existe
    if (-not (Test-Path (Join-Path $repoPath ".git"))) {
      Start-Sleep -Seconds 5
      continue
    }

    # Verificar si .git/index.lock existe (operación en curso)
    $lockFile = Join-Path $repoPath ".git\index.lock"
    if (Test-Path $lockFile) {
      Start-Sleep -Seconds 2
      continue
    }

    # Comprobar cambios pendientes
    $status = git status --porcelain 2>$null
    if ($status) {
      # Debounce de 4 segundos para esperar a que terminen ediciones contiguas
      Start-Sleep -Seconds 4

      if (Test-Path $lockFile) {
        Start-Sleep -Seconds 2
        continue
      }

      $statusAfter = git status --porcelain 2>$null
      if ($statusAfter) {
        $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
        Write-SyncLog "Cambios detectados. Creando commit local..."

        git add -A
        $commitResult = git commit -m "auto(sync): $timestamp" 2>&1
        Write-SyncLog "Commit realizado: $commitResult"
      }
    }

    # Comprobar si hay commits locales pendientes de pushear a origin/main
    $hasOrigin = git remote get-url origin 2>$null
    if ($hasOrigin) {
      $unpushed = git log origin/main..HEAD --oneline 2>$null
      if ($unpushed) {
        Write-SyncLog "Commits pendientes de subir a origin/main detectados. Intentando push..."
        try {
          git pull --rebase origin main --quiet 2>&1 | Out-Null
          $p = Start-Process -FilePath "git" -ArgumentList "push origin main" -NoNewWindow -PassThru -ErrorAction SilentlyContinue
          if ($p) {
            $finished = $p.WaitForExit(10000)
            if (-not $finished) {
              Stop-Process -Id $p.Id -Force -ErrorAction SilentlyContinue
              Write-SyncLog "Aviso: git push requiere autenticación con tu cuenta. Ejecuta auth-github.bat para autorizar una sola vez."
            } else {
              if ($p.ExitCode -eq 0) {
                Write-SyncLog "Push exitoso a origin/main! Repositorio sincronizado con GitHub."
              } else {
                Write-SyncLog "Push finalizado con código de salida: $($p.ExitCode)"
              }
            }
          }
        } catch {
          Write-SyncLog "Error en ciclo de push: $_"
        }
      }
    }
  } catch {
    Write-SyncLog "Error en ciclo de auto-push: $_"
  }

  Start-Sleep -Seconds 5
}
