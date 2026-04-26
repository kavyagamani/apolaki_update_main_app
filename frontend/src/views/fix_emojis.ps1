\$content = [System.IO.File]::ReadAllText('Dashboard.vue', [System.Text.Encoding]::UTF8)

# Monthly Savings should show green money
\$content = \$content -replace '(?<=Monthly Savings<\/p>.*?<\/div>.*?)<span class="savings-icon">.+?(?=<\/span>)', '<span class="savings-icon">💵'

# Yearly Savings should show money bag
\$content = \$content -replace '(?<=Yearly Savings<\/p>.*?<\/div>.*?)<span class="savings-icon">.+?(?=<\/span>)', '<span class="savings-icon">💰'

[System.IO.File]::WriteAllText('Dashboard.vue', \$content, [System.Text.Encoding]::UTF8)
Write-Host 'Fixed!'
