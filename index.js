const fs = require('fs');
const readline = require('readline');
const axios = require('axios');

async function checkLink(url) {
  try {
    const response = await axios.head(url, { timeout: 5000 });
    return response.status >= 200 && response.status < 300;
  } catch (error) {
    return false;
  }
}

async function processM3UFile(filePath) {
  const fileStream = fs.createReadStream(filePath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  for await (const line of rl) {
    if (line.trim() && !line.startsWith('#')) {
      const isAccessible = await checkLink(line);
      console.log(`${line}: ${isAccessible ? 'Accessible' : 'Not accessible'}`);
    }
  }
}

const filePath = process.argv[2];

if (!filePath) {
  console.error('Please provide a file path as an argument.');
  process.exit(1);
}

processM3UFile(filePath).catch(error => {
  console.error('An error occurred:', error);
});