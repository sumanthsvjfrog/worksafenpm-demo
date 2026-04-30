var http = require('http');
var url = require('url');
var fs = require('fs');
var { exec } = require('child_process');

// ❌ Hardcoded secrets (CWE-798)
var DB_PASSWORD = "SuperSecret123!";
var API_KEY = "API_KEY_XYZ123";
var JWT_SECRET = "fakejwtsecret456";

// ❌ Additional hardcoded passwords — various patterns SAST tools detect
var adminPassword     = "admin1234!";
var rootPassword      = "r00tP@ssw0rd";
var dbConnectionStr   = "mysql://root:P@ssw0rd99@localhost:3306/mydb";
var mongoUri          = "mongodb://admin:Mongo$ecret42@mongo.internal:27017/prod";
var ldapBindPassword  = "LdapB!nd2024";
var encryptionKey     = "aes256key-hardcoded-do-not-use";
var privateKeyPem     = "-----BEGIN RSA PRIVATE KEY-----\nMIIEowIBAAKCAQEA0Z3VS5JJcds3xHn/ygWep4\n-----END RSA PRIVATE KEY-----";
var awsSecretKey      = "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY";
var githubToken       = "ghp_A1b2C3d4E5f6G7h8I9j0K1l2M3n4O5p6Q7r8";
var slackWebhook      = "https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX";

// ❌ Password reuse via config object
var dbConfig = {
  host:     "prod-db.internal",
  user:     "dbadmin",
  password: "Pr0d-DB-P@ss!",
  database: "customers"
};

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

  // ❌ Password logged to console (CWE-312)
  console.log("Connecting with password: " + dbConfig.password);

  // ❌ XSS — reflecting unsanitized input into HTML (CWE-79)
  res.end('<html><body><p>Result: ' + result + '</p><p>Input was: ' + userInput + '</p></body></html>');

}).listen(1337, '127.0.0.1');
