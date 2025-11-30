# Cloud Run Deployment Script for AI Engine
# This script builds and deploys your Docker container to Google Cloud Run

# Configuration
$PROJECT_ID = "gen-lang-client-0293842819"
$SERVICE_NAME = "aiengine"
$REGION = "us-central1"
$IMAGE_NAME = "gcr.io/$PROJECT_ID/$SERVICE_NAME"

Write-Host "🚀 Deploying AI Engine to Cloud Run..." -ForegroundColor Cyan
Write-Host ""

# Step 1: Set the active project
Write-Host "📋 Setting active project to: $PROJECT_ID" -ForegroundColor Yellow
& gcloud config set project $PROJECT_ID

# Step 2: Enable required APIs
Write-Host "🔧 Enabling Cloud Run and Container Registry APIs..." -ForegroundColor Yellow
& gcloud services enable run.googleapis.com
& gcloud services enable containerregistry.googleapis.com

# Step 3: Build and push the Docker image using Cloud Build
Write-Host "🏗️  Building Docker image with Cloud Build..." -ForegroundColor Yellow
& gcloud builds submit --tag $IMAGE_NAME

# Step 4: Deploy to Cloud Run
Write-Host "🌐 Deploying to Cloud Run..." -ForegroundColor Yellow
& gcloud run deploy $SERVICE_NAME `
    --image $IMAGE_NAME `
    --platform managed `
    --region $REGION `
    --allow-unauthenticated `
    --port 80 `
    --memory 512Mi `
    --cpu 1 `
    --max-instances 10

Write-Host ""
Write-Host "✅ Deployment complete!" -ForegroundColor Green
Write-Host ""
Write-Host "🔗 Your app is now live at:" -ForegroundColor Cyan
& gcloud run services describe $SERVICE_NAME --region $REGION --format 'value(status.url)'
