const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS for all routes
app.use(cors({
  origin: ['https://www.bu8f.online', 'http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));

app.use(express.json());

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// Security Tools API Proxy
app.post('/api/security/url-scan', async (req, res) => {
  try {
    const { url } = req.body;
    const response = await fetch('https://urlscan.io/api/v1/scan/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'API-Key': '0198068b-e9d0-7743-91b8-92554e0a774b'
      },
      body: JSON.stringify({ url })
    });
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'URL scan failed' });
  }
});

app.get('/api/security/ip-reputation/:ip', async (req, res) => {
  try {
    const { ip } = req.params;
    const response = await fetch(`https://api.abuseipdb.com/api/v2/check?ipAddress=${ip}`, {
      method: 'GET',
      headers: {
        'Key': '35cd736e3b5475dd41f4b98be65dbd2e7b07eaeebca45d487198f40a4097327f8c7e21ad2e601754',
        'Accept': 'application/json'
      }
    });
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'IP reputation check failed' });
  }
});

app.get('/api/security/domain-reputation/:domain', async (req, res) => {
  try {
    const { domain } = req.params;
    const response = await fetch(`https://otx.alienvault.com/api/v1/indicators/domain/${domain}/general`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Domain reputation check failed' });
  }
});

app.get('/api/security/file-analysis/:hash', async (req, res) => {
  try {
    const { hash } = req.params;
    const response = await fetch(`https://www.virustotal.com/api/v3/files/${hash}`, {
      method: 'GET',
      headers: {
        'x-apikey': 'd4feac2af1b31e26cf43b4368ef99cb7ab18dc049b9fc4c2062366e996a7df65'
      }
    });
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'File analysis failed' });
  }
});

// Search Engines API Proxy
app.get('/api/search/memex', async (req, res) => {
  try {
    const { query } = req.query;
    const response = await fetch(`https://memex.marginalia.nu/search?query=${encodeURIComponent(query)}&count=5`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Memex search failed' });
  }
});

app.get('/api/search/serpstack', async (req, res) => {
  try {
    const { query } = req.query;
    const response = await fetch(`http://api.serpstack.com/search?access_key=472744b4b488e0d6dc0f688fad9bd777&query=${encodeURIComponent(query)}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Serpstack search failed' });
  }
});

app.get('/api/search/duckduckgo', async (req, res) => {
  try {
    const { query } = req.query;
    const response = await fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'DuckDuckGo search failed' });
  }
});

// Dark Web API Proxy
app.get('/api/darkweb/search', async (req, res) => {
  try {
    const { query } = req.query;
    const response = await fetch(`https://darksearch.io/api/search?query=${encodeURIComponent(query)}&page=1`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Dark web search failed' });
  }
});

app.get('/api/darkweb/onion-lookup', async (req, res) => {
  try {
    const { url } = req.query;
    const response = await fetch(`https://onion.ail-project.org/api/lookup?url=${encodeURIComponent(url)}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Onion lookup failed' });
  }
});

// Vulnerabilities API Proxy
app.get('/api/vulnerabilities/nvd/:cveId', async (req, res) => {
  try {
    const { cveId } = req.params;
    const response = await fetch(`https://services.nvd.nist.gov/rest/json/cves/2.0?cveId=${cveId}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'NVD search failed' });
  }
});

app.get('/api/vulnerabilities/opencve/:cveId', async (req, res) => {
  try {
    const { cveId } = req.params;
    const response = await fetch(`https://www.opencve.io/api/cve/${cveId}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'OpenCVE search failed' });
  }
});

app.get('/api/vulnerabilities/gtfobins/:cveId', async (req, res) => {
  try {
    const { cveId } = req.params;
    const response = await fetch(`https://kevin.gtfkd.com/api/v1/cve/${cveId}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'GTFOBins search failed' });
  }
});

// Aviation API Proxy
app.get('/api/aviation/flights', async (req, res) => {
  try {
    const { search } = req.query;
    const response = await fetch(`http://api.aviationstack.com/v1/flights?access_key=6dad36e1f40208970abb639991f6c37c&search=${encodeURIComponent(search)}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Flight search failed' });
  }
});

app.get('/api/aviation/aircraft', async (req, res) => {
  try {
    const { search } = req.query;
    const response = await fetch(`https://opensky-network.org/api/states/all?search=${encodeURIComponent(search)}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Aircraft search failed' });
  }
});

app.get('/api/aviation/airports', async (req, res) => {
  try {
    const { apt } = req.query;
    const response = await fetch(`https://api.aviationapi.com/v1/airports?apt=${encodeURIComponent(apt)}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Airport search failed' });
  }
});

// Catch all handler - serve the React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API proxy ready for CORS-free requests`);
}); 