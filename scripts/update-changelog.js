#!/usr/bin/env node

/**
 * Changelog Update Helper
 * Usage: node scripts/update-changelog.js [type] [description]
 * Types: added, changed, fixed, removed, security, deprecated
 * 
 * Example: node scripts/update-changelog.js added "New review system for doctors"
 */

const fs = require('fs');
const path = require('path');

const CHANGELOG_PATH = path.join(__dirname, '..', 'CHANGELOG.md');

const CHANGE_TYPES = {
  added: 'Added',
  changed: 'Changed', 
  fixed: 'Fixed',
  removed: 'Removed',
  security: 'Security',
  deprecated: 'Deprecated'
};

function updateChangelog(type, description) {
  if (!CHANGE_TYPES[type]) {
    console.error(`Invalid change type: ${type}`);
    console.error(`Valid types: ${Object.keys(CHANGE_TYPES).join(', ')}`);
    process.exit(1);
  }

  if (!description) {
    console.error('Description is required');
    process.exit(1);
  }

  try {
    let content = fs.readFileSync(CHANGELOG_PATH, 'utf8');
    const changeType = CHANGE_TYPES[type];
    const entry = `- ${description}`;
    const today = new Date().toISOString().split('T')[0];
    
    // Find the [Unreleased] section
    const unreleasedRegex = /## \[Unreleased\]\s*([\s\S]*?)(?=\s*---|\s*## \[)/;
    const match = content.match(unreleasedRegex);
    
    if (!match) {
      console.error('Could not find [Unreleased] section in changelog');
      process.exit(1);
    }

    let unreleasedSection = match[1];
    
    // Check if the change type section exists
    const typeRegex = new RegExp(`### ${changeType}\\s*([\\s\\S]*?)(?=\\s*### |\\s*$)`, 'i');
    const typeMatch = unreleasedSection.match(typeRegex);
    
    if (typeMatch) {
      // Add to existing section
      const existingEntries = typeMatch[1].trim();
      const updatedEntries = existingEntries ? `${existingEntries}\n${entry}` : entry;
      unreleasedSection = unreleasedSection.replace(typeRegex, `### ${changeType}\n${updatedEntries}\n`);
    } else {
      // Create new section
      const sections = unreleasedSection.split(/### /);
      const newSection = `### ${changeType}\n${entry}\n\n`;
      
      // Insert in order: Added, Changed, Deprecated, Removed, Fixed, Security
      const order = ['Added', 'Changed', 'Deprecated', 'Removed', 'Fixed', 'Security'];
      const insertIndex = order.findIndex(t => t === changeType);
      
      let inserted = false;
      for (let i = insertIndex + 1; i < order.length; i++) {
        const nextType = order[i];
        const nextIndex = sections.findIndex(s => s.startsWith(nextType));
        if (nextIndex !== -1) {
          sections.splice(nextIndex, 0, newSection.replace('### ', ''));
          inserted = true;
          break;
        }
      }
      
      if (!inserted) {
        sections.push(newSection.replace('### ', ''));
      }
      
      unreleasedSection = sections.join('### ').replace(/^### /, '');
    }
    
    // Replace the content
    content = content.replace(unreleasedRegex, `## [Unreleased]\n\n${unreleasedSection}\n---`);
    
    fs.writeFileSync(CHANGELOG_PATH, content);
    console.log(`✅ Added to changelog: [${changeType}] ${description}`);
    
  } catch (error) {
    console.error('Error updating changelog:', error.message);
    process.exit(1);
  }
}

function showHelp() {
  console.log(`
Changelog Update Helper

Usage: node scripts/update-changelog.js [type] [description]

Types:
  added      - New features
  changed    - Changes in existing functionality  
  fixed      - Bug fixes
  removed    - Removed features
  security   - Security fixes
  deprecated - Soon-to-be removed features

Examples:
  node scripts/update-changelog.js added "New patient review system"
  node scripts/update-changelog.js fixed "Authentication bug on refresh"
  node scripts/update-changelog.js changed "Improved error handling"

You can also manually edit CHANGELOG.md directly.
`);
}

// Parse command line arguments
const args = process.argv.slice(2);

if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
  showHelp();
  process.exit(0);
}

if (args.length < 2) {
  console.error('Both type and description are required');
  showHelp();
  process.exit(1);
}

const [type, ...descParts] = args;
const description = descParts.join(' ');

updateChangelog(type.toLowerCase(), description);