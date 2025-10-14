# PowerShell script to fix ES6 module syntax for Chrome content scripts
# Converts import/export to global namespace pattern

Write-Host "🔧 Fixing ES6 modules..." -ForegroundColor Cyan

# Files to process (remaining ones)
$files = @(
    "src/entities/platform/lib/detector.js",
    "src/entities/platform/index.js",
    "src/entities/message/model/Message.js",
    "src/entities/message/index.js",
    "src/entities/tone/model/Tone.js",
    "src/entities/tone/index.js",
    "src/features/context/model/SpeakerDetector.js",
    "src/features/context/model/ConversationAnalyzer.js",
    "src/features/context/model/ContextExtractor.js",
    "src/features/context/index.js",
    "src/widgets/floating-button/ui/FloatingButton.js",
    "src/widgets/floating-button/index.js",
    "src/widgets/modal/ui/Modal.js",
    "src/widgets/modal/index.js",
    "src/widgets/tone-selector/ui/ToneSelector.js",
    "src/widgets/tone-selector/index.js",
    "src/widgets/context-viewer/ui/ContextViewer.js",
    "src/widgets/context-viewer/index.js",
    "src/widgets/reply-list/ui/ReplyList.js",
    "src/widgets/reply-list/index.js",
    "src/app/GraculaApp.js",
    "src/app/index.js"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "  Processing: $file" -ForegroundColor Yellow
        
        $content = Get-Content $file -Raw
        
        # Remove all import statements
        $content = $content -replace "import\s+\{[^}]+\}\s+from\s+['""][^'""]+['""];?\r?\n", ""
        $content = $content -replace "import\s+\w+\s+from\s+['""][^'""]+['""];?\r?\n", ""
        $content = $content -replace "import\s+\*\s+as\s+\w+\s+from\s+['""][^'""]+['""];?\r?\n", ""
        
        # Convert export class to window.Gracula.ClassName
        $content = $content -replace "export\s+class\s+(\w+)", 'window.Gracula.$1 = class'
        
        # Convert export function to window.Gracula.functionName
        $content = $content -replace "export\s+function\s+(\w+)", 'window.Gracula.$1 = function'
        
        # Convert export const to window.Gracula.CONST_NAME
        $content = $content -replace "export\s+const\s+(\w+)", 'window.Gracula.$1'
        
        # Remove export { ... } statements
        $content = $content -replace "export\s+\{[^}]+\};?\r?\n", ""
        
        # Remove export default statements
        $content = $content -replace "export\s+default\s+\{[^}]+\};?\r?\n", ""
        
        # Add namespace initialization at the top if not present
        if ($content -notmatch "window\.Gracula\s*=\s*window\.Gracula") {
            $firstLine = $content -split "`n" | Select-Object -First 1
            if ($firstLine -match "^//") {
                # Find the end of the comment block
                $lines = $content -split "`n"
                $insertIndex = 0
                for ($i = 0; $i -lt $lines.Length; $i++) {
                    if ($lines[$i] -notmatch "^//" -and $lines[$i].Trim() -ne "") {
                        $insertIndex = $i
                        break
                    }
                }
                
                $beforeComment = ($lines[0..($insertIndex-1)] -join "`n")
                $afterComment = ($lines[$insertIndex..($lines.Length-1)] -join "`n")
                $content = $beforeComment + "`n`nwindow.Gracula = window.Gracula || {};`n`n" + $afterComment
            }
        }
        
        Set-Content $file $content -NoNewline
        Write-Host "    ✅ Fixed" -ForegroundColor Green
    } else {
        Write-Host "    ⚠️  Not found: $file" -ForegroundColor Red
    }
}

Write-Host "`n✅ All files processed!" -ForegroundColor Green
Write-Host "Now reload the extension in Chrome." -ForegroundColor Cyan

