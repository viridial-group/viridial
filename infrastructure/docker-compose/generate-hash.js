#!/usr/bin/env node

// Script simple pour générer un hash bcrypt
// Usage: node generate-hash.js "monMotDePasse"

const bcrypt = require('bcrypt');

const password = process.argv[2] || 'Passw0rd!';

bcrypt.hash(password, 10)
  .then(hash => {
    console.log(hash);
    process.exit(0);
  })
  .catch(err => {
    console.error('Erreur:', err);
    process.exit(1);
  });

