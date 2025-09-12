# Guide de Déploiement YouTube Transcript App

## Étape 1: Prérequis

### Compte Développeur Apple
1. Allez sur [developer.apple.com](https://developer.apple.com)
2. Créez un compte Apple Developer Program ($99/an)
3. Générez des certificats de distribution
4. Créez un App ID (`com.youtubetranscriptapp.ios`)

### Compte Expo
1. Créez un compte sur [expo.dev](https://expo.dev)
2. Installez EAS CLI : `npm install -g eas-cli`
3. Connectez votre compte : `eas login`

### Assets Requis
Placez ces fichiers dans le dossier `assets/` :
- `icon.png` (1024x1024px)
- `splash.png` (1242x2436px)
- `adaptive-icon.png` (1024x1024px)
- `favicon.png` (32x32px)

## Étape 2: Configuration EAS

```bash
# Se connecter à Expo
npx eas login

# Initialiser EAS Build
npx eas build:configure

# Configurer les credentials iOS
npx eas credentials
```

## Étape 3: Build pour Production

```bash
# Build pour iOS
npx eas build --platform ios --profile production

# Build pour Android (optionnel)
npx eas build --platform android --profile production
```

Le build prendra 15-30 minutes. Vous recevrez un email avec le lien de téléchargement.

## Étape 4: Tester l'App

```bash
# Build de développement pour test
npx eas build --platform ios --profile development

# Installer via TestFlight (iOS) ou directement (Android)
```

## Étape 5: Soumission à l'App Store

### Méthode 1: EAS Submit (Recommandé)

```bash
# Préparer les informations de soumission
npx eas submit --platform ios

# EAS vous guidera pour :
# - Description de l'app
# - Captures d'écran (4-5 par taille)
# - Catégorie de l'app
# - Informations de contact
```

### Méthode 2: Soumission Manuelle
1. Téléchargez le fichier `.ipa` depuis EAS
2. Ouvrez [App Store Connect](https://appstoreconnect.apple.com)
3. Créez une nouvelle app
4. Uploadez le fichier avec Transporter ou Xcode

## Étape 6: Métadonnées App Store

### Informations Requises
- **Nom de l'app**: YouTube Transcript Tool
- **Sous-titre**: Extract, summarize & analyze YouTube videos
- **Description**:
  ```
  Transform YouTube videos into actionable knowledge with AI-powered transcript analysis.

  Features:
  • Extract transcripts from any YouTube video
  • Get AI-generated summaries
  • Extract key topics and keywords
  • Receive actionable insights
  • Works offline once transcript is loaded
  ```
- **Catégorie**: Productivity, Education
- **Captures d'écran**: 5-6 captures montrant l'interface
- **Icône**: 1024x1024px (prête dans assets/)
- **Support URL**: Votre site web ou email

### Politiques de Confidentialité
Créez un document de [politique de confidentialité](https://app-privacy-policy-generator.firebaseapp.com/) mentionnant:
- Utilisation du réseau Internet
- Accès aux APIs externes (aucune donnée personnelle stockée)

## Étape 7: TestFlight et Distribution

### Partager avec Testeurs
```bash
# Distribuer via EAS
npx eas build --platform ios --profile production
npx eas submit --platform ios
```

### Gérer les Versions
- **Version Code**: Incrémentez pour les nouvelles builds
- **Marketing Version**: Version visible (1.0.0, 1.1.0, etc.)

## Dépannage

### Build Errors
```bash
# Nettoyer le cache
npx eas build --platform ios --clear-cache

# Reconfigurer
npx eas build:configure
```

### Problèmes Courants
- **Bundle ID**: Vérifiez la correspondance avec App Store Connect
- **Provisioning Profile**: Régénérez si expiré
- **Assets manquants**: Tous les assets doivent être présents
- **App Store Review**: Préparez-vous à expliquer l'usage des APIs

## Coûts
- **Apple Developer Program**: $99/an
- **EAS Builds**: 30 builds gratuits/mois, puis $1/build
- **EAS Submit**: Gratuit (quelques soumissions/mois)

## Commandes Utiles
```bash
# Status des builds
npx eas build:list

# Versions
npx eas build:version:set --platform ios

# Cancel un build
npx eas build:cancel <build-id>
```

## Support
- [Documentation EAS](https://docs.expo.dev/eas/)
- [App Store Connect Help](https://help.apple.com/app-store-connect/)
- [Expo Discord](https://chat.expo.dev/)

---

**Conseils pour l'App Store Review:**
- Soyez transparent sur les APIs utilisées
- Fournissez des captures d'écran claires
- Testez complètement avant soumission
- Répondez rapidement aux questions des reviewers
