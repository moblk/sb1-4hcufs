const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

async function checkLink(url, timeout = 5000, retries = 2) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await axios.get(url, {
        timeout: timeout,
        maxRedirects: 5,
        validateStatus: function (status) {
          return status >= 200 && status < 300;
        },
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': '*/*'
        }
      });
      return { success: true, message: 'Accessible' };
    } catch (error) {
      if (attempt === retries) {
        if (error.code === 'ECONNABORTED') {
          return { success: false, message: 'Timeout' };
        } else if (error.response) {
          return { success: false, message: `HTTP ${error.response.status}` };
        } else if (error.request) {
          return { success: false, message: 'No response' };
        } else {
          return { success: false, message: 'Request failed' };
        }
      }
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retrying
    }
  }
}

app.post('/check-link', async (req, res) => {
  const { url, timeout } = req.body;
  try {
    const result = await checkLink(url, timeout);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});