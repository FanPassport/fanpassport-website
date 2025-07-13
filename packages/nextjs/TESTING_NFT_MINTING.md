# Guide de Test - Minting NFT Automatique

## 🎯 Objectif
Tester le minting automatique du NFT quand une expérience est complétée.

## 📋 Prérequis

### 1. Blockchain Locale
Assurez-vous que la blockchain locale est en cours d'exécution :
```bash
cd packages/foundry
yarn chain
```

### 2. Configuration MetaMask

#### Ajouter le réseau local :
- **Nom du réseau** : Localhost 8545
- **URL RPC** : http://127.0.0.1:8545
- **ID de chaîne** : 31337
- **Symbole de devise** : ETH
- **URL de l'explorateur de blocs** : (laisser vide)

#### Importer le compte de test :
- **Adresse privée** : `YOUR_PRIVATE_KEY_HERE` (utilisez une clé de test uniquement)
- **Adresse publique** : `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`

### 3. Déploiement des Contrats
```bash
cd packages/foundry
yarn deploy
```

## 🧪 Test du Minting

### Étape 1 : Préparer les données
L'utilisateur de test `0x60b07C5f61FB3580B79Fb42E73FBE4bce69E610b` a déjà une expérience complétée (ID: 2).

### Étape 2 : Accéder à l'application
1. Lancer l'application : `yarn dev`
2. Aller sur : `http://localhost:3001/experiences/2`
3. Connecter le wallet avec l'adresse : `0x60b07C5f61FB3580B79Fb42E73FBE4bce69E610b`

### Étape 3 : Vérifier l'état
- L'expérience doit être marquée comme "Terminée"
- Le bouton "Mint NFT" doit être visible
- Vérifier que vous êtes sur le réseau local (31337)

### Étape 4 : Mint le NFT
1. Cliquer sur "Mint NFT"
2. MetaMask doit afficher une popup de confirmation
3. Confirmer la transaction
4. Vérifier que le NFT apparaît dans votre wallet

## 🔍 Débogage

### Vérifier les logs dans la console du navigateur :
```javascript
// Ces logs doivent apparaître :
"Starting NFT minting process..."
"User address: 0x60b07C5f61FB3580B79Fb42E73FBE4bce69E610b"
"Experience ID: 2"
"Mint API response: 200"
"Mint API successful, calling smart contract..."
```

### Problèmes courants :

1. **Pas de popup MetaMask** :
   - Vérifier que vous êtes sur le réseau local (31337)
   - Vérifier que vous avez des ETH

2. **Erreur de transaction** :
   - Vérifier que la blockchain locale fonctionne
   - Vérifier que les contrats sont déployés

3. **"User already has NFT"** :
   - L'utilisateur a déjà minté un NFT
   - Tester avec une autre adresse

## 📊 Vérification

### Vérifier le contrat :
```bash
cd packages/foundry
forge script script/CheckNFT.s.sol --rpc-url http://127.0.0.1:8545
```

### Vérifier le solde :
```javascript
// Dans la console du navigateur
const { data: balance } = useScaffoldReadContract({
  contractName: "FanAIPassport",
  functionName: "balanceOf",
  args: ["0x60b07C5f61FB3580B79Fb42E73FBE4bce69E610b"],
});
console.log("NFT Balance:", balance);
```

## 🎉 Succès
Si tout fonctionne, vous devriez voir :
- ✅ Transaction confirmée dans MetaMask
- ✅ Notification "NFT minté avec succès"
- ✅ NFT visible dans votre wallet
- ✅ Balance NFT > 0 