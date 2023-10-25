const path = require("path");
const express = require("express");
const app = express();
const proxy = require("./scripts/setupProxy.js");

const session = require("express-session");
const passport = require("passport");
const WebAppStrategy = require("ibmcloud-appid").WebAppStrategy;

// --------------------------------------------------------------------------
// Read environment variables
// --------------------------------------------------------------------------

// When not present in the system environment variables, dotenv will take them
// from the local file
require("dotenv-defaults").config({
  path: "my.env",
  encoding: "utf8",
  defaults: "my.env.defaults",
});

const DISCOVERY_AUTH_TYPE = process.env.DISCOVERY_AUTH_TYPE;
const DISCOVERY_URL = process.env.DISCOVERY_URL;
const DISCOVERY_APIKEY = process.env.DISCOVERY_APIKEY;
const DISCOVERY_PROJECTID = process.env.DISCOVERY_PROJECTID;
const APPID_CLIENT_ID = process.env.APPID_CLIENT_ID;
const APPID_TENANT_ID = process.env.APPID_TENANT_ID;
const APPID_SECRET = process.env.APPID_SECRET;
const APPID_OAUTH_SERVERURL = process.env.APPID_OAUTH_SERVERURL;
const APPID_REDIRECT_HOSTNAME = process.env.APPID_REDIRECT_HOSTNAME;
const APPID_REDIRECT_URI = process.env.APPID_REDIRECT_URI;

proxy(app);

app.use(
  session({
    secret: "ibmclientengineeringSECRET123456",
    resave: true,
    saveUninitialized: true,
  })
);
app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser(function (user, cb) {
  cb(null, user);
});
passport.deserializeUser(function (obj, cb) {
  cb(null, obj);
});

// APP ID setup
passport.use(
  new WebAppStrategy({
    tenantId: APPID_TENANT_ID,
    clientId: APPID_CLIENT_ID,
    secret: APPID_SECRET,
    oauthServerUrl: APPID_OAUTH_SERVERURL,
    redirectUri: APPID_REDIRECT_HOSTNAME + APPID_REDIRECT_URI,
  })
);
// Handle callback
app.get(
  APPID_REDIRECT_URI,
  passport.authenticate(WebAppStrategy.STRATEGY_NAME)
);

// Protect the whole app
app.use(passport.authenticate(WebAppStrategy.STRATEGY_NAME));

app.use(express.static(path.join(__dirname, "build")));

const port = 8080;
app.listen(port, () => {
  console.log(
    "Discovery components example application running at ",
    APPID_REDIRECT_HOSTNAME
  );
});

// --------------------------------------------------------------------------
// REST API : retrieve info about the host
// --------------------------------------------------------------------------
app.get("/getEnvironment", function (req, res) {
  var hostobj = {
    project_id: DISCOVERY_PROJECTID,
  };
  console.log(
    "INFO: Service getEnvironment returning : " + JSON.stringify(hostobj)
  );

  res.json(hostobj);
});
