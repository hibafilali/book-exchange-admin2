import fs from 'fs';
import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function extractText(pdfName) {
    const pdfPath = path.resolve(__dirname, '../../', pdfName);
    try {
        const dataBuffer = fs.readFileSync(pdfPath);
        const data = await pdf(dataBuffer);
        
        fs.writeFileSync(path.resolve(__dirname, '../' + pdfName.replace('.pdf', '') + '_extracted.txt'), data.text);
        console.log(`Extracted text to ${pdfName}_extracted.txt`);
    } catch (e) {
        console.error(`Error reading ${pdfPath}:`, e);
    }
}

async function main() {
    await extractText('Cahier des Charges.pdf');
    await extractText('Classe UML (5).pdf');
}

main();
