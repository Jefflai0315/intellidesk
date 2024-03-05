// server.js
const http = require('http');
const { exec } = require('child_process');

const server = http.createServer((req, res) => {
  // Execute the setup_profile_script.py script
  exec('python3 setup_profile.py', (error, stdout, stderr) => {
    if (error) {
      console.error(`Error: ${error.message}`);
      res.end(JSON.stringify({ status: 'error', message: error.message }));
      return;
    }

    console.log(`stdout: ${stdout}`);
    console.error(`stderr: ${stderr}`);
    
    res.end(JSON.stringify({ status: 'success', output: stdout, error: stderr }));
  });
});

const PORT = 8080;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});