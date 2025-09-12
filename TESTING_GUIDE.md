# Guide de Test YouTube Transcript App

## Méthode 1: Test avec Expo Go (Le Plus Rapide - Recommandé)

### Prérequis
- iPhone avec iOS 11+
- Application "Expo Go" depuis l'App Store
- Connexion WI-FI sur le même réseau

### Étapes
```bash
# 1. Lancer le serveur de développement
npm install
npm start

# 2. Sur votre iPhone :
# - Ouvrez Expo Go
# - Scannez le QR code affiché dans le terminal
# - L'app se téléchargera automatiquement
```

### Avantages
- ⚡ Très rapide (1-2 minutes)
- 🔄 Hot reload en temps réel
- 🆓 Gratuit
- 📱 Test natif sur iPhone

---

## Méthode 2: Simulateur iOS (Si vous avez un Mac)

### Prérequis
- macOS avec Xcode installé
- Au moins 10GB d'espace disque

```bash
# 1. Installer Xcode depuis le Mac App Store
# 2. Ouvrir Xcode une fois pour finaliser l'installation

# 3. Lancer l'app dans le simulateur
npm start
# Puis appuyez 'i' dans le terminal pour ouvrir iOS Simulator
```

### Avantages
- 🔧 Développement avancé possible
- 🎯 Test précis des performances
- 📊 Debugging intégré

---

## Méthode 3: Build de Développement (Plus proche de la prod)

### Prérequis
- Compte Expo gratuit
- EAS CLI installé

```bash
# 1. Installer EAS et se connecter
npm install -g eas-cli
eas login

# 2. Build de développement
eas build --platform ios --profile development

# 3. Recevoir l'app via TestFlight ou installation directe
```

### Avantages
- 🎯 Build très proche de la production
- 📱 Test réel sur App Store
- 🚀 Performance réelle

---

## Méthode 4: Test Web (Rapide pour prévisualiser)

```bash
# 1. Lancer la version web
npm run web

# 2. Ouvrir http://localhost:19006 dans votre navigateur
```

### Avantages
- 🌐 Pas besoin d'appareil mobile
- 🖱️ Test facile de l'UI
- 📊 Debug JavaScript facile

---

## Diagnostiquer les Problèmes

### Si l'app ne se lance pas :
```bash
# Vérifier les erreurs
npx expo logs
```

### Nettoyer le cache :
```bash
# Supprimer node_modules et reinstaller
rm -rf node_modules package-lock.json
npm install

# Ou juste nettoyer le cache Expo
npx expo start --clear
```

---

## Tester les Fonctionnalités Spécifiques

### URLs YouTube à Tester :
```
✅ https://www.youtube.com/watch?v=dQw4w9WgXcQ
✅ https://youtu.be/dQw4w9WgXcQ
✅ https://www.youtube.com/embed/dQw4w9WgXcQ
❌ https://example.com/video/v123 (non-YouTube)
```

### Attentes de Test :
- [ ] Interface se charge correctement
- [ ] Entrée URL fonctionne
- [ ] Extraction transcript réussie
- [ ] Résumé AI généré
- [ ] Mots-clés extraits
- [ ] Actions suggérées affichées
- [ ] État de chargement visible
- [ ] Gestion d'erreur pour URLs invalides

---

## Configuration de Test

### Variables d'Environnement Optionnelles
Vous pouvez créer un fichier `.env` :
```bash
EXPO_PUBLIC_API_TIMEOUT=30000
EXPO_PUBLIC_MAX_RETRIES=3
```

### Mock Data pour Tests
Pour tester sans API, modifiez temporairement App.tsx pour utiliser des données mock.

---

## Outils de Debug

### Console Logs iOS :
- Ouvrez Safari > Develop > Votre iPhone > Console

### React Native Debugger :
```bash
npm install -g react-native-debugger
react-native-debugger
```

### Performance Monitoring :
- Activez "Performance Monitor" dans l'Expo Dev Tools
- Monitorisez le FPS et l'utilisation mémoire

---

## Tests Automatisés (Avancé)

### Tests Unitaires :
```bash
npm install --save-dev @testing-library/react-native jest-expo
```

### Tests E2E :
```bash
npm install --save-dev detox
```

---

**Conseil :** Commencez par la Méthode 1 (Expo Go) car elle est la plus rapide pour vérifier que tout fonctionne avant de passer aux autres méthodes de test plus complètes.
