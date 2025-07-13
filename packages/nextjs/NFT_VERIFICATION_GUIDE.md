# 🔍 Guide de Vérification du NFT FAN Passport

## 📱 Vérification dans MetaMask

### Étape 1 : Ajouter le token dans MetaMask
1. Ouvrez MetaMask
2. Assurez-vous d'être sur le réseau **Localhost 8545** (31337)
3. Cliquez sur **"Import tokens"** en bas de la page
4. Collez l'adresse du contrat : `0xb19b36b1456e65e3a6d514d3f715f204bd59f431`
5. Cliquez sur **"Add Custom Token"**
6. Cliquez sur **"Import Tokens"**

### Étape 2 : Vérifier la balance
- Vous devriez voir **"FanAIPassport"** dans votre liste de tokens
- La balance devrait afficher **1** (ou plus si vous avez minté plusieurs NFTs)

## 🌐 Vérification via Block Explorer

### Option 1 : Block Explorer Local
1. Allez sur `http://localhost:3000/blockexplorer`
2. Recherchez votre adresse : `0x60b07C5f61FB3580B79Fb42E73FBE4bce69E610b`
3. Vous devriez voir les transactions de minting

### Option 2 : Console du Navigateur
Ouvrez la console du navigateur (F12) et tapez :

```javascript
// Vérifier la balance NFT
const { data: balance } = useScaffoldReadContract({
  contractName: "FanAIPassport",
  functionName: "balanceOf",
  args: ["0x60b07C5f61FB3580B79Fb42E73FBE4bce69E610b"],
});
console.log("NFT Balance:", balance);

// Vérifier le propriétaire du token ID 0
const { data: owner } = useScaffoldReadContract({
  contractName: "FanAIPassport",
  functionName: "ownerOf",
  args: [0],
});
console.log("Owner of token 0:", owner);
```

## 🔧 Vérification via Script

### Script de vérification rapide :
```bash
# Dans le terminal, depuis packages/foundry
forge script script/CheckNFT.s.sol --rpc-url http://127.0.0.1:8545
```

## 📊 Informations du Contrat

- **Nom du contrat** : FanAIPassport
- **Adresse** : `0xb19b36b1456e65e3a6d514d3f715f204bd59f431`
- **Réseau** : Local (31337)
- **Standard** : ERC-721 (NFT)
- **Fonction de minting** : `mint(address to)`

## 🎯 Que vérifier

1. **Balance NFT** : Vous devriez avoir au moins 1 NFT
2. **Transaction de minting** : Une transaction dans l'historique
3. **Token ID** : Généralement 0 pour le premier NFT minté
4. **Propriétaire** : Votre adresse devrait être le propriétaire

## ❓ Problèmes courants

### "Token not found in MetaMask"
- Vérifiez que vous êtes sur le bon réseau (31337)
- Vérifiez que l'adresse du contrat est correcte
- Essayez de recharger MetaMask

### "Balance shows 0"
- Vérifiez que la transaction de minting a été confirmée
- Vérifiez que vous utilisez la bonne adresse de wallet
- Vérifiez les logs dans la console du navigateur

### "Transaction failed"
- Vérifiez que vous avez des ETH pour les frais de transaction
- Vérifiez que la blockchain locale fonctionne
- Vérifiez que les contrats sont déployés

## 🎉 Succès !
Si tout fonctionne, vous devriez voir :
- ✅ NFT dans MetaMask
- ✅ Balance > 0
- ✅ Transaction confirmée
- ✅ Détails du NFT visibles 