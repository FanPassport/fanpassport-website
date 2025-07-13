#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Clés privées connues à détecter (exemples pour détection)
const PRIVATE_KEYS = [
  '***REMOVED***',
  '***REMOVED***'
];

// API Keys connues à détecter (exemples pour détection)
const API_KEYS = [
  'oKxs-03sij-U_N0iOlrSsZFr29-IqbuF'
];

// Patterns à détecter
const PATTERNS = [
  /private.*key.*=.*["'][^"']{64,}["']/i,
  /private_key.*=.*["'][^"']{64,}["']/i,
  /PRIVATE_KEY.*=.*["'][^"']{64,}["']/i
];

function scanDirectory(dir, excludeDirs = ['node_modules', '.git', '.next', 'cache', 'out', 'broadcast']) {
  const results = [];
  
  function scan(currentPath) {
    const items = fs.readdirSync(currentPath);
    
    for (const item of items) {
      const fullPath = path.join(currentPath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        if (!excludeDirs.includes(item)) {
          scan(fullPath);
        }
      } else if (stat.isFile()) {
        // Ignorer les fichiers de sécurité et de documentation
        const fileName = path.basename(fullPath);
        if (fileName === 'check-security.js' || fileName === 'SECURITY_SETUP.md') {
          continue;
        }
        
        // Vérifier seulement les fichiers texte
        const ext = path.extname(item).toLowerCase();
        if (['.js', '.ts', '.tsx', '.json', '.md', '.txt', '.toml', '.yml', '.yaml'].includes(ext)) {
          try {
            const content = fs.readFileSync(fullPath, 'utf8');
            const relativePath = path.relative(process.cwd(), fullPath);
            
            // Vérifier les clés privées connues
            for (const key of PRIVATE_KEYS) {
              if (content.includes(key)) {
                results.push({
                  file: relativePath,
                  type: 'PRIVATE_KEY',
                  value: key,
                  line: content.split('\n').findIndex(line => line.includes(key)) + 1
                });
              }
            }
            
            // Vérifier les API keys connues
            for (const key of API_KEYS) {
              if (content.includes(key)) {
                results.push({
                  file: relativePath,
                  type: 'API_KEY',
                  value: key,
                  line: content.split('\n').findIndex(line => line.includes(key)) + 1
                });
              }
            }
            
            // Vérifier les patterns
            for (const pattern of PATTERNS) {
              const matches = content.match(pattern);
              if (matches) {
                results.push({
                  file: relativePath,
                  type: 'PATTERN_MATCH',
                  value: matches[0],
                  line: content.split('\n').findIndex(line => pattern.test(line)) + 1
                });
              }
            }
          } catch (error) {
            console.warn(`⚠️  Erreur lors de la lecture de ${fullPath}:`, error.message);
          }
        }
      }
    }
  }
  
  scan(dir);
  return results;
}

console.log('🔍 Vérification de sécurité du projet...\n');

const results = scanDirectory('.');

if (results.length === 0) {
  console.log('✅ Aucune clé privée ou API key exposée détectée !');
  console.log('🎉 Le projet est prêt à être rendu public sur GitHub.');
} else {
  console.log('❌ Problèmes de sécurité détectés :\n');
  
  for (const result of results) {
    console.log(`📁 Fichier: ${result.file}`);
    console.log(`🔍 Type: ${result.type}`);
    console.log(`📍 Ligne: ${result.line}`);
    console.log(`🔑 Valeur: ${result.value.substring(0, 20)}...`);
    console.log('---');
  }
  
  console.log('\n⚠️  Veuillez corriger ces problèmes avant de rendre le projet public !');
  process.exit(1);
}

console.log('\n📋 Recommandations :');
console.log('1. Vérifiez que tous les fichiers .env sont dans .gitignore');
console.log('2. Utilisez des variables d\'environnement pour les clés sensibles');
console.log('3. Ne commitez jamais de clés privées dans le code source');
console.log('4. Utilisez des clés de test pour le développement local'); 