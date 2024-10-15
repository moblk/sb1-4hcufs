let isChecking = false;
let totalLinks = 0;
let checkedLinks = 0;

async function checkLink(url, timeout) {
  try {
    const response = await fetch('/check-link', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url, timeout }),
    });
    return await response.json();
  } catch (error) {
    return { success: false, message: 'Request failed' };
  }
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function processM3UFile(file, timeout) {
  const content = await file.text();
  const lines = content.split('\n');
  const tableBody = document.querySelector('#resultsTable tbody');
  tableBody.innerHTML = '';
  
  totalLinks = lines.filter(line => line.trim() && !line.startsWith('#')).length;
  checkedLinks = 0;
  updateProgress();

  for (const line of lines) {
    if (!isChecking) break;
    if (line.trim() && !line.startsWith('#')) {
      const result = await checkLink(line, timeout);
      const row = tableBody.insertRow();
      const linkCell = row.insertCell(0);
      const statusCell = row.insertCell(1);

      linkCell.textContent = line;
      const statusIndicator = document.createElement('span');
      statusIndicator.className = `status-indicator ${result.success ? 'accessible' : 'not-accessible'}`;
      statusCell.appendChild(statusIndicator);
      statusCell.appendChild(document.createTextNode(` ${result.message}`));

      checkedLinks++;
      updateProgress();

      await delay(1000); // Wait 1 second between checks to avoid overwhelming servers
    }
  }
  isChecking = false;
  updateButtonStates();
}

function updateProgress() {
  const progressElement = document.getElementById('progress');
  progressElement.textContent = `Progress: ${checkedLinks}/${totalLinks}`;
}

function updateButtonStates() {
  const checkButton = document.getElementById('checkButton');
  const stopButton = document.getElementById('stopButton');
  checkButton.disabled = isChecking;
  stopButton.disabled = !isChecking;
}

document.getElementById('checkButton').addEventListener('click', () => {
  const fileInput = document.getElementById('fileInput');
  const timeoutInput = document.getElementById('timeoutInput');
  const file = fileInput.files[0];
  const timeout = parseInt(timeoutInput.value, 10);

  if (file) {
    if (isNaN(timeout) || timeout < 5000) {
      alert('Please enter a valid timeout value (minimum 5000 ms).');
      return;
    }
    isChecking = true;
    updateButtonStates();
    processM3UFile(file, timeout).finally(() => {
      isChecking = false;
      updateButtonStates();
    });
  } else {
    alert('Please select a file first.');
  }
});

document.getElementById('stopButton').addEventListener('click', () => {
  isChecking = false;
  updateButtonStates();
});

// Initialize button states
updateButtonStates();