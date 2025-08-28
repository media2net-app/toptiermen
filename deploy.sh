#!/bin/bash

# 🚀 Top Tier Men - Automated Deployment Script
# Usage: ./deploy.sh [message]

set -e

echo "🚀 Starting deployment process..."

# Default commit message
COMMIT_MSG="${1:-"Auto-deploy: $(date '+%Y-%m-%d %H:%M:%S')"}"

echo "📝 Commit message: $COMMIT_MSG"

# Check if there are changes to commit
if [[ -n $(git status --porcelain) ]]; then
    echo "📦 Adding changes to git..."
    git add .
    
    echo "💾 Committing changes..."
    git commit -m "$COMMIT_MSG"
    
    echo "⬆️ Pushing to GitHub..."
    git push origin main
    
    echo "✅ Successfully pushed to GitHub!"
    echo "🔄 Vercel will automatically deploy from GitHub..."
    echo "📊 Check deployment status at: https://vercel.com/dashboard"
else
    echo "ℹ️ No changes to commit"
    echo "🔄 Triggering Vercel deployment anyway..."
    
    # Trigger Vercel deployment without changes
    if command -v vercel &> /dev/null; then
        vercel --prod
    else
        echo "⚠️ Vercel CLI not installed. Install with: npm i -g vercel"
    fi
fi

echo "🎉 Deployment process completed!"
