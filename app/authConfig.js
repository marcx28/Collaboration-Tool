const msalConfig = {
  auth: {
    clientId: "<ClientID>",
    authority: "https://login.microsoftonline.com/<TenantID>",
    redirectUri: "http://localhost:3000",
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: false,
  }
};

const loginRequest = {
  scopes: ["openid", "profile", "User.Read"]
};

const tokenRequest = {
  scopes: ["User.Read", "Notes.Create", "Notes.Read", "Notes.Read.All", "Notes.ReadWrite", "Notes.ReadWrite.All", "Notes.ReadWrite.CreatedByApp"]
};