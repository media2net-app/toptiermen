# GitHub Webhook Setup voor Automatische Project Logs

## 🎯 Overzicht

Dit systeem synchroniseert automatisch GitHub commits met project logs en werkt gewerkte uren bij op basis van commit complexiteit.

## 🚀 Setup Instructies

### 1. GitHub Repository Webhook Configuratie

1. Ga naar je GitHub repository
2. Klik op **Settings** tab
3. Scroll naar **Webhooks** in de linker sidebar
4. Klik op **Add webhook**
5. Vul de volgende gegevens in:
   - **Payload URL**: `https://your-domain.com/api/github/webhook`
   - **Content type**: `application/json`
   - **Secret**: Genereer een veilige random string (bijv. `webhook_secret_123`)
   - **Events**: Selecteer **Just the push event**
6. Klik op **Add webhook**

### 2. Environment Variables

Voeg de volgende variabele toe aan je `.env.local`:

```bash
GITHUB_WEBHOOK_SECRET=your_webhook_secret_here
```

### 3. Deployment

Zorg ervoor dat je applicatie gedeployed is en de webhook endpoint bereikbaar is.

## 🔧 Hoe het Werkt

### Automatische Uren Berekening

Het systeem berekent gewerkte uren op basis van:

- **Base hours**: 0.5h per commit
- **Feature commits** (`feat:`): +1.5h
- **Bug fixes** (`fix:`): +1.0h
- **Major changes** (`refactor:`, `rewrite:`): +2.0h
- **Webhook/API changes**: +1.5h
- **Video/upload changes**: +1.0h
- **Layout/UI changes**: +1.0h
- **Build system changes**: +1.5h
- **File changes**: +0.5h (2-5 files) of +1.0h (>5 files)

### Categorisering

Commits worden automatisch gecategoriseerd:
- `feature` - Nieuwe features
- `bugfix` - Bug fixes
- `api` - API/webhook changes
- `ui` - UI/layout changes
- `deployment` - Build/deployment changes
- `improvement` - Overige verbeteringen

### Tags Extractie

Automatisch gegenereerde tags:
- `webhook` - Webhook gerelateerd
- `video-upload` - Video upload functionaliteit
- `ui-improvement` - UI verbeteringen
- `build-system` - Build systeem
- `bugfix` - Bug fixes
- `feature` - Nieuwe features
- `admin-panel` - Admin panel
- `exercise-management` - Oefening beheer

## 📊 Database Updates

Het systeem update automatisch:

1. **project_logs** tabel:
   - Nieuwe log entries voor elke push
   - Uren berekening
   - Categorisering en tags
   - Gerelateerde bestanden

2. **project_statistics** tabel:
   - Dagelijkse uren updates
   - Cumulatieve statistieken

## 🧪 Testing

### Test Scripts

```bash
# Setup instructies bekijken
node scripts/setup-github-webhook.js

# GitHub commits synchroniseren (historisch)
node scripts/sync-github-commits.js
```

### Test Push Event

Het systeem verwerkt push events met deze structuur:

```json
{
  "ref": "refs/heads/main",
  "commits": [
    {
      "id": "commit-hash",
      "message": "feat: Add new feature\n\n- Implement feature A\n- Add tests",
      "author": {
        "name": "Developer Name",
        "email": "dev@example.com"
      },
      "added": ["src/new-feature.ts"],
      "modified": ["src/existing.ts"],
      "removed": []
    }
  ]
}
```

## 📈 Voorbeelden

### Commit: `feat: Add user authentication system`
- **Uren**: ~2.5h (0.5 base + 1.5 feat + 0.5 files)
- **Categorie**: `feature`
- **Tags**: `feature`, `authentication`

### Commit: `fix: Resolve webpack build error`
- **Uren**: ~2.0h (0.5 base + 1.0 fix + 0.5 build)
- **Categorie**: `deployment`
- **Tags**: `bugfix`, `build-system`

### Commit: `feat: Implement video upload with retry logic`
- **Uren**: ~3.0h (0.5 base + 1.5 feat + 1.0 video)
- **Categorie**: `improvement`
- **Tags**: `feature`, `video-upload`

## 🔍 Monitoring

### Webhook Logs

Monitor webhook activiteit via:
- GitHub repository webhook delivery logs
- Project logs tabel voor nieuwe entries
- Project statistics voor uren updates

### API Endpoint

De webhook endpoint is beschikbaar op:
```
POST /api/github/webhook
```

### Response Format

```json
{
  "success": true,
  "message": "Processed 3 commits",
  "hours_added": 5.5,
  "category": "feature",
  "priority": "medium"
}
```

## 🛠️ Troubleshooting

### Webhook niet ontvangen
1. Controleer webhook URL (moet publiek bereikbaar zijn)
2. Verifieer webhook secret
3. Check GitHub webhook delivery logs

### Uren niet bijgewerkt
1. Controleer database connectie
2. Verifieer project_logs tabel bestaat
3. Check webhook payload format

### Foutmeldingen
- **401 Unauthorized**: Verkeerde webhook secret
- **500 Internal Server Error**: Database of applicatie fout
- **400 Bad Request**: Ongeldige payload format

## 📚 Bestanden

- `src/app/api/github/webhook/route.ts` - Webhook endpoint
- `scripts/setup-github-webhook.js` - Setup instructies
- `scripts/sync-github-commits.js` - Historische sync
- `GITHUB_WEBHOOK_SETUP.md` - Deze documentatie

## 🎉 Resultaat

Na setup wordt elke push naar de main branch automatisch:
- Geanalyseerd op complexiteit
- Omgezet naar gewerkte uren
- Gecategoriseerd en getagd
- Toegevoegd aan project logs
- Verwerkt in project statistieken

Dit zorgt voor real-time project tracking zonder handmatige invoer! 🚀 