# Image & Testimonial System Test Script

$API_URL = "http://localhost:5000/api"

Write-Host "================================" -ForegroundColor Cyan
Write-Host "Image & Testimonial System Tests" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan

# Test 1: Admin login
Write-Host "`n→ Test 1: Admin Login" -ForegroundColor Yellow
$adminLogin = Invoke-RestMethod -Uri "$API_URL/auth/login" -Method Post -ContentType "application/json" -Body (@{
    email = "admin@eventforge.com"
    password = "admin123"
} | ConvertTo-Json)

$adminToken = $adminLogin.token
Write-Host "Admin Token: $($adminToken.Substring(0, 20))..." -ForegroundColor Green

# Test 2: Client login or register
Write-Host "`n→ Test 2: Client Login/Register" -ForegroundColor Yellow
try {
    $clientLogin = Invoke-RestMethod -Uri "$API_URL/auth/login" -Method Post -ContentType "application/json" -Body (@{
        email = "testclient@example.com"
        password = "test123"
    } | ConvertTo-Json)
    $clientToken = $clientLogin.token
}
catch {
    Write-Host "Creating new client..." -ForegroundColor Yellow
    $clientReg = Invoke-RestMethod -Uri "$API_URL/auth/register" -Method Post -ContentType "application/json" -Body (@{
        name = "Test Client"
        email = "testclient@example.com"
        password = "test123"
        role = "client"
    } | ConvertTo-Json)
    $clientToken = $clientReg.token
}
Write-Host "Client Token: $($clientToken.Substring(0, 20))..." -ForegroundColor Green

# Test 3: Get web images (public)
Write-Host "`n→ Test 3: Get Web Images (Public)" -ForegroundColor Yellow
try {
    $webImages = Invoke-RestMethod -Uri "$API_URL/public/images" -Method Get
    Write-Host "Web Images Count: $($webImages.Count)" -ForegroundColor Green
    if ($webImages.Count -gt 0) {
        Write-Host "First Image:" -ForegroundColor Cyan
        $webImages[0] | ConvertTo-Json | Write-Host
    }
}
catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Get testimonials landing view
Write-Host "`n→ Test 4: Get Testimonials (Landing View - limit 6)" -ForegroundColor Yellow
try {
    $testimonials = Invoke-RestMethod -Uri "$API_URL/public/testimonials?landing=true&limit=6" -Method Get
    Write-Host "Landing Testimonials Count: $($testimonials.Count)" -ForegroundColor Green
    if ($testimonials.Count -gt 0) {
        Write-Host "First Testimonial:" -ForegroundColor Cyan
        $testimonials[0] | ConvertTo-Json | Write-Host
    }
}
catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 5: Client submit feedback
Write-Host "`n→ Test 5: Client Submit Feedback" -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $clientToken"
        "Content-Type" = "application/json"
    }
    $feedback = Invoke-RestMethod -Uri "$API_URL/client/feedback" -Method Post -Headers $headers -Body (@{
        message = "Excellent platform for event planning!"
    } | ConvertTo-Json)
    Write-Host "Feedback Response:" -ForegroundColor Green
    Write-Host $feedback.message
}
catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $streamReader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
        Write-Host $streamReader.ReadToEnd()
    }
}

# Test 6: Get pending testimonials (admin)
Write-Host "`n→ Test 6: Get Pending Testimonials (Admin)" -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $adminToken"
    }
    $pending = Invoke-RestMethod -Uri "$API_URL/admin/testimonials/pending" -Method Get -Headers $headers
    Write-Host "Pending Testimonials Count: $($pending.Count)" -ForegroundColor Green
    if ($pending.Count -gt 0) {
        Write-Host "First Pending Testimonial:" -ForegroundColor Cyan
        $pending[0] | ConvertTo-Json | Write-Host
    }
}
catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 7: Get event gallery (public)
Write-Host "`n→ Test 7: Get Event Gallery (Public)" -ForegroundColor Yellow
try {
    $gallery = Invoke-RestMethod -Uri "$API_URL/public/event-images" -Method Get
    Write-Host "Event Images Count: $($gallery.Count)" -ForegroundColor Green
    if ($gallery.Count -gt 0) {
        Write-Host "First Event Image:" -ForegroundColor Cyan
        $gallery[0] | ConvertTo-Json | Write-Host
    }
}
catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 8: Get admin event images list
Write-Host "`n→ Test 8: List Admin Event Images" -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $adminToken"
    }
    $adminImages = Invoke-RestMethod -Uri "$API_URL/admin/event-images" -Method Get -Headers $headers
    Write-Host "Admin Event Images Total: $($adminImages.total)" -ForegroundColor Green
    Write-Host "Admin Event Images Count: $($adminImages.images.Count)" -ForegroundColor Green
    if ($adminImages.images.Count -gt 0) {
        Write-Host "First Admin Image:" -ForegroundColor Cyan
        $adminImages.images[0] | ConvertTo-Json | Write-Host
    }
}
catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n================================" -ForegroundColor Cyan
Write-Host "Tests Complete!" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
