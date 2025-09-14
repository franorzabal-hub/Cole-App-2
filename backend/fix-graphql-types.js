const fs = require('fs');
const path = require('path');

// Function to fix GraphQL field decorators
function fixGraphQLTypes(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Fix fields with proper type detection
  const lines = content.split('\n');
  const fixedLines = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const nextLine = lines[i + 1] || '';

    // Check if this is a field decorator that needs fixing
    if (line.includes('@Field(') && line.includes('nullable: true')) {
      // Check the next line to determine the type
      if (nextLine.includes(': Date')) {
        fixedLines.push(line.replace('@Field(() => String, { nullable: true })', '@Field(() => Date, { nullable: true })'));
        modified = true;
      } else if (nextLine.includes(': boolean')) {
        fixedLines.push(line.replace('@Field(() => String, { nullable: true })', '@Field(() => Boolean, { nullable: true })'));
        modified = true;
      } else if (nextLine.includes(': number')) {
        if (!line.includes('Int') && !line.includes('Float')) {
          fixedLines.push(line.replace('@Field(() => String, { nullable: true })', '@Field(() => Float, { nullable: true })'));
          modified = true;
        } else {
          fixedLines.push(line);
        }
      } else if (!line.includes('() =>')) {
        // If no type specified and it's a string field
        if (nextLine.includes(': string')) {
          fixedLines.push(line.replace('@Field({ nullable: true })', '@Field(() => String, { nullable: true })'));
          modified = true;
        } else {
          fixedLines.push(line);
        }
      } else {
        fixedLines.push(line);
      }
    } else {
      fixedLines.push(line);
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, fixedLines.join('\n'));
    console.log(`Fixed: ${filePath}`);
  }

  return modified;
}

// Find all resolver files
function findResolverFiles(dir) {
  const files = [];
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory() && !item.includes('node_modules') && !item.includes('dist')) {
      files.push(...findResolverFiles(fullPath));
    } else if (item.endsWith('.resolver.ts')) {
      files.push(fullPath);
    }
  }

  return files;
}

// Main execution
const srcDir = path.join(__dirname, 'src');
const resolverFiles = findResolverFiles(srcDir);

console.log(`Found ${resolverFiles.length} resolver files`);

let totalFixed = 0;
for (const file of resolverFiles) {
  if (fixGraphQLTypes(file)) {
    totalFixed++;
  }
}

console.log(`\nFixed ${totalFixed} files`);