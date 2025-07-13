# 🔐 Guide de Sécurité - Configuration du Projet

## ⚠️ IMPORTANT : Sécurité des Clés Privées

Ce projet a été configuré pour utiliser des variables d'environnement afin d'éviter d'exposer des clés privées dans le code source.

## 📋 Configuration Requise

### 1. Variables d'Environnement Foundry

Créez un fichier `.env` dans `packages/foundry/` avec :

```bash
# Configuration Foundry
RPC_URL=http://127.0.0.1:8545
PRIVATE_KEY=YOUR_PRIVATE_KEY_HERE
USER_ADDRESS=0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266

# API Keys (optionnel pour le développement local)
ALCHEMY_API_KEY=YOUR_ALCHEMY_API_KEY_HERE
ETHERSCAN_API_KEY=YOUR_ETHERSCAN_API_KEY_HERE

# Configuration du déploiement
DEPLOY_SCRIPT=script/Deploy.s.sol
```

### 2. Variables d'Environnement Next.js

Créez un fichier `.env.local` dans `packages/nextjs/` avec :

```bash
# API Keys
NEXT_PUBLIC_ALCHEMY_API_KEY=YOUR_ALCHEMY_API_KEY_HERE
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=YOUR_WALLET_CONNECT_PROJECT_ID_HERE

# Configuration
NEXT_PUBLIC_IGNORE_BUILD_ERROR=false
NEXT_PUBLIC_IPFS_BUILD=false
```

## 🚨 Clés Privées de Test

Pour le développement local, vous pouvez utiliser les clés de test d'Anvil :

- **Clé privée de test** : `[CLÉ_PRIVÉE_DE_TEST_ANVIL]` (voir documentation Anvil)
- **Adresse** : `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`

⚠️ **NE JAMAIS utiliser ces clés en production !**

## 🔧 Scripts Modifiés

Les scripts suivants ont été mis à jour pour utiliser des variables d'environnement :

- `packages/foundry/scripts-js/testExperienceFlow.js`
- `packages/foundry/scripts-js/claim-nft-reward.js`
- `packages/foundry/scripts-js/complete-all-tasks.js`
- `packages/foundry/scripts-js/mint-experience-nft.js`
- `packages/foundry/scripts-js/test-gallery.js`
- `packages/foundry/scripts-js/completeAndClaim.js`
- `packages/foundry/scripts-js/link-user-to-nft.js`
- `packages/foundry/Makefile`

## 🛡️ Bonnes Pratiques

1. **Ne jamais commiter de clés privées** dans le code source
2. **Utiliser des variables d'environnement** pour toutes les clés sensibles
3. **Ajouter `.env` au `.gitignore`** (déjà fait)
4. **Utiliser des clés de test** pour le développement local
5. **Vérifier les fichiers avant de commiter** avec `git status`

## 🚀 Démarrage Rapide

1. Copier `packages/foundry/env.example` vers `packages/foundry/.env`
2. Remplacer `YOUR_PRIVATE_KEY_HERE` par votre clé privée de test
3. Lancer la blockchain : `yarn chain`
4. Déployer les contrats : `yarn deploy`
5. Démarrer l'application : `yarn start`

## 📝 Notes

- Les fichiers `.env` sont déjà dans le `.gitignore`
- Les clés API par défaut ont été remplacées par des placeholders
- La documentation a été mise à jour pour éviter d'exposer des clés 