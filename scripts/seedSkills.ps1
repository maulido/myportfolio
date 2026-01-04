# Seed Skills via API
# PowerShell script to populate skills database

$skills = @(
    @{name="Next.js"; level="Expert"; years=3; category="Frontend Development"; icon="SiNextdotjs"; order=1},
    @{name="React"; level="Expert"; years=4; category="Frontend Development"; icon="SiReact"; color="text-blue-400"; order=2},
    @{name="TypeScript"; level="Advanced"; years=3; category="Frontend Development"; icon="SiTypescript"; color="text-blue-600"; order=3},
    @{name="JavaScript"; level="Expert"; years=5; category="Frontend Development"; icon="SiJavascript"; color="text-yellow-400"; order=4},
    @{name="Tailwind CSS"; level="Expert"; years=3; category="Frontend Development"; icon="SiTailwindcss"; color="text-cyan-400"; order=5},
    @{name="Node.js"; level="Advanced"; years=3; category="Backend & Database"; icon="SiNodedotjs"; color="text-green-500"; order=1},
    @{name="MongoDB"; level="Advanced"; years=3; category="Backend & Database"; icon="SiMongodb"; color="text-green-600"; order=2},
    @{name="PostgreSQL"; level="Intermediate"; years=2; category="Backend & Database"; icon="SiPostgresql"; color="text-blue-500"; order=3},
    @{name="Python"; level="Intermediate"; years=2; category="Backend & Database"; icon="SiPython"; color="text-yellow-500"; order=4},
    @{name="Cisco Networking"; level="Expert"; years=5; category="Network & DevOps"; icon="SiCisco"; color="text-blue-700"; order=1},
    @{name="Docker"; level="Advanced"; years=2; category="Network & DevOps"; icon="SiDocker"; color="text-blue-400"; order=2},
    @{name="Linux"; level="Advanced"; years=4; category="Network & DevOps"; icon="SiLinux"; order=3},
    @{name="AWS"; level="Intermediate"; years=2; category="Network & DevOps"; icon="SiAmazonwebservices"; color="text-orange-500"; order=4},
    @{name="Git"; level="Advanced"; years=4; category="Network & DevOps"; icon="SiGit"; color="text-orange-600"; order=5}
)

Write-Host "🌱 Seeding skills database..." -ForegroundColor Green
$successCount = 0
$errorCount = 0

foreach ($skill in $skills) {
    try {
        $body = $skill | ConvertTo-Json
        $response = Invoke-WebRequest -Uri "http://localhost:3000/api/skills" -Method POST -Body $body -ContentType "application/json" -UseBasicParsing
        if ($response.StatusCode -eq 201) {
            $successCount++
            Write-Host "✅ Added: $($skill.name)" -ForegroundColor Green
        }
    } catch {
        $errorCount++
        Write-Host "❌ Failed: $($skill.name) - $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n📊 Summary:" -ForegroundColor Cyan
Write-Host "   Success: $successCount skills" -ForegroundColor Green
Write-Host "   Failed: $errorCount skills" -ForegroundColor Red
Write-Host "`n✨ Seeding complete!" -ForegroundColor Green
