const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'node_modules', 'flowbite-react', 'dist', 'helpers', 'get-tailwind-version.js');

if (fs.existsSync(filePath)) {
  const patchContent = `function getTailwindVersion() {
  return 4;
}
export { getTailwindVersion };
`;
  fs.writeFileSync(filePath, patchContent, 'utf8');
  console.log('Successfully patched flowbite-react getTailwindVersion for Tailwind v4 compatibility!');
} else {
  console.warn('Flowbite get-tailwind-version.js file not found to patch.');
}
