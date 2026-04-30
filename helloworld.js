var http = require('http');
var url = require('url');
var fs = require('fs');
var { exec } = require('child_process');

// ❌ Hardcoded secrets (CWE-798)
var DB_PASSWORD = "SuperSecret123!";
var API_KEY = "API_KEY_XYZ123";
var JWT_SECRET = "fakejwtsecret456";

// ❌ Catastrophic regex — ReDoS (CWE-1333)
var EMAIL_REGEX = /^([a-zA-Z0-9]+)*@([a-zA-Z0-9]+\.)+[a-zA-Z]{2,}$/;

http.createServer(function(req, res) {

  var parsedUrl = url.parse(req.url, true);
  var userInput = parsedUrl.query.input || '';
  var filePath  = parsedUrl.query.file  || '';

  // ❌ Missing security headers (CWE-693)
  res.writeHead(200, { 'Content-Type': 'text/html' });

  // ❌ Code injection via eval (CWE-94)
  var result;
  try {
    result = eval(userInput);
  } catch(e) {
    result = 'Error: ' + e.message;
  }

  // ❌ Command injection via exec (CWE-78)
  exec('ls ' + userInput, function(err, stdout) {
    console.log(stdout);
  });

  // ❌ Path traversal — unsanitized file read (CWE-22)
  if (filePath) {
    var data = fs.readFileSync('/var/data/' + filePath);
    res.write(data);
  }

  // ❌ XSS — reflecting unsanitized input into HTML (CWE-79)
  res.end('<html><body><p>Result: ' + result + '</p><p>Input was: ' + userInput + '</p></body></html>');

}).listen(1337, '127.0.0.1');
