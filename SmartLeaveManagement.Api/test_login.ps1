$body = @{
    email = "manager@test.com"
    password = "password123"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:5249/api/Auth/login" -Method Post -Body $body -ContentType "application/json"
    Write-Output "Login Successful. Token received."
    Write-Output $response
} catch {
    Write-Output "Login Failed."
    Write-Output $_.Exception.Message
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        Write-Output $reader.ReadToEnd()
    }
}
