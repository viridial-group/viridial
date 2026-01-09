// Script to generate base translation files for all languages
// This creates stub files that can be filled with proper translations

const fs = require('fs');
const path = require('path');

const languages = {
  en: 'English',
  es: 'Español',
  ar: 'العربية',
  de: 'Deutsch',
  it: 'Italiano',
  vi: 'Tiếng Việt',
  zh: '中文',
  pt: 'Português',
  ru: 'Русский',
};

const translationFiles = [
  'common',
  'home',
  'features',
  'pricing',
  'search',
  'property',
  'auth',
];

// This is a helper script - actual translations should be done manually or via translation service
// For now, we'll copy the French files as templates
const frDir = path.join(__dirname, 'translations');

translationFiles.forEach(file => {
  const frFile = path.join(frDir, `${file}.fr.json`);
  if (fs.existsSync(frFile)) {
    const frContent = JSON.parse(fs.readFileSync(frFile, 'utf8'));
    
    Object.keys(languages).forEach(lang => {
      const targetFile = path.join(frDir, `${file}.${lang}.json`);
      if (!fs.existsSync(targetFile)) {
        // Create file with French content as placeholder (to be translated)
        fs.writeFileSync(targetFile, JSON.stringify(frContent, null, 2) + '\n');
        console.log(`Created ${file}.${lang}.json`);
      }
    });
  }
});

console.log('Translation files generated. Please translate them using a professional service.');

