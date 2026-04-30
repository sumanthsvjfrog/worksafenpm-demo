var http = require('http');
var url = require('url');
var fs = require('fs');
var { exec } = require('child_process');

// ----------------------------------------------------------------
// ❌ CWE-798 / CWE-321 — Hardcoded secrets in well-known formats
// ----------------------------------------------------------------

// AWS — exact format Xray pattern-matches
var AWS_ACCESS_KEY_ID     = "AKIAIOSFODNN7EXAMPLE";
var AWS_SECRET_ACCESS_KEY = "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY";

// GitHub PAT — ghp_ prefix triggers dedicated rule
var GITHUB_TOKEN = "ghp_A1b2C3d4E5f6G7h8I9j0K1l2M3n4O5p6Q7r8";

// Slack Bot/Webhook tokens — known prefixes
var SLACK_BOT_TOKEN  = "xoxb-263594206564-2343594206564-FGqddMF8t08v8246fFzd3vvv";
var SLACK_USER_TOKEN = "xoxp-263594206564-263594206564-263594206564-abcdef1234567890abcdef1234567890";
var SLACK_WEBHOOK    = "https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX";

// Stripe — sk_live_ prefix is a dedicated scanner rule
var STRIPE_SECRET_KEY      = "sk_live_51OaBcDEfGhIjKlMnOpQrStUvWxYz1234567890abcd";
var STRIPE_PUBLISHABLE_KEY = "pk_live_51OaBcDEfGhIjKlMnOpQrStUvWxYz1234567890abcd";

// Twilio
var TWILIO_ACCOUNT_SID = "AC1234567890abcdef1234567890abcdef";
var TWILIO_AUTH_TOKEN  = "your_auth_token_1234567890abcdef12";

// SendGrid
var SENDGRID_API_KEY = "SG.abcdefghijklmnop.AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";

// Google API key — AIza prefix
var GOOGLE_API_KEY = "AIzaSyD-9tSrke72I6e3pUuzMND4DXrRt6HzUc0";

// NPM token — npm_prefix
var NPM_TOKEN = "npm_A1b2C3d4E5f6G7h8I9j0K1l2M3n4O5p6";

// JWT — three-part base64 structure
var JWT_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

// RSA Private Key block — universal trigger
var PRIVATE_KEY = `-----BEGIN RSA PRIVATE KEY-----
MIIEowIBAAKCAQEA0Z3VS5JJcds3xHn/ygWep25kH5y6kvFqAlrfAOABEqhCEPVs
7byjfRPDsMcFkdFBnr1CRUY8mKTzNcKHGEFnVOkSPqPTKFLbJv+pN3xMVCKCqwf
-----END RSA PRIVATE KEY-----`;

// DB connection strings with embedded passwords
var MYSQL_URI = "mysql://dbadmin:Pr0d-DB-P@ss!@prod-db.internal:3306/customers";
var MONGO_URI = "mongodb://admin:Mongo$ecret42@mongo.internal:27017/prod";
var POSTGRES_URI = "postgresql://postgres:pgP@ssw0rd99@localhost:5432/appdb";

// Basic Auth header with credentials
var AUTH_HEADER = "Authorization: Basic " + Buffer.from("admin:SuperSecret123!").toString('base64');

// Generic high-entropy password variables (variable name + value triggers rule)
var password        = "Tr0ub4dor&3xamplePass!";
var db_password     = "SuperSecret123!";
var admin_password  = "admin1234!";
var root_password   = "r00tP@ssw0rd";
var api_secret      = "a7f3k9x2p5m8n1q4r6t0w";
var encryption_key  = "aes256-hardcoded-key-do-not-use-in-prod";

// Config object — 'password' key is a known pattern
var dbConfig = {
  host:     "prod-db.internal",
  port:     3306,
  user:     "dbadmin",
  password: "Pr0d-DB-P@ss!",
  database: "customers"
};

// ----------------------------------------------------------------
// ❌ CWE-1333 — ReDoS via catastrophic regex
// ----------------------------------------------------------------
var EMAIL_REGEX = /^([a-zA-Z0-9]+)*@([a-zA-Z0-9]+\.)+[a-zA-Z]{2,}$/;

// ----------------------------------------------------------------
// HTTP server with additional code-level vulns
// ----------------------------------------------------------------
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

  // ❌ Command injection (CWE-78)
  exec('ls ' + userInput, function(err, stdout) {
    console.log(stdout);
  });

  // ❌ Path traversal (CWE-22)
  if (filePath) {
    var data = fs.readFileSync('/var/data/' + filePath);
    res.write(data);
  }

  // ❌ Credentials logged to console (CWE-312)
  console.log("Connecting with password: " + dbConfig.password);
  console.log("Using AWS key: " + AWS_ACCESS_KEY_ID);

  // ❌ XSS — unsanitized reflection (CWE-79)
  res.end('<html><body><p>Result: ' + result + '</p><p>Input: ' + userInput + '</p></body></html>');

}).listen(1337, '127.0.0.1');
