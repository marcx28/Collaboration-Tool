const myMSALObj = new msal.PublicClientApplication(msalConfig);

let username = "";

function loadPage() {
    const currentAccounts = myMSALObj.getAllAccounts();
    if (currentAccounts === null) {
        return;
    } else if (currentAccounts.length > 1) {
        // Add choose account code here
        console.warn("Multiple accounts detected.");
    } else if (currentAccounts.length === 1) {
        username = currentAccounts[0].username;
        showWelcomeMessage(currentAccounts[0]);
    }
}

function handleResponse(resp) {
    if (resp !== null) {
        username = resp.account.username;
        showWelcomeMessage(resp.account);
    } else {
        loadPage();
    }
}

function signIn() {
    myMSALObj.loginPopup(loginRequest).then(handleResponse).catch(error => {
        console.error(error);
    });
}

function signOut() {
    const logoutRequest = {
        account: myMSALObj.getAccountByUsername(username)
    };

    myMSALObj.logout(logoutRequest);
}

function getTokenPopup(request) {
    request.account = myMSALObj.getAccountByUsername(username);
    return myMSALObj.acquireTokenSilent(request).catch(error => {
        console.warn("silent token acquisition fails. acquiring token using redirect");
        if (error instanceof msal.InteractionRequiredAuthError) {
            // fallback to interaction when silent call fails
            return myMSALObj.acquireTokenPopup(request).then(tokenResponse => {
                console.log(tokenResponse);

                return tokenResponse;
            }).catch(error => {
                console.error(error);
            });
        } else {
            console.warn(error);
        }
    });
}

function getNotebooks() {
    getTokenPopup(tokenRequest).then(response => {
        getAllNotebooks(response.accessToken);
    }).catch(error => {
        console.error(error);
    });
}

function getPages(section) {
    getTokenPopup(tokenRequest).then(response => {
        getCertainPages(section, response.accessToken);
    }).catch(error => {
        console.error(error);
    });
}

function getSite(path) {
    getTokenPopup(tokenRequest).then(response => {
        callMSGraph(path, response.accessToken, handleSite, null)
    });
}

function createNotebook(notebookName) {
    getTokenPopup(tokenRequest).then(response => {
        postMSGraph(graphConfig.graphNotebooksEndpoint, response.accessToken, notebookName, null);
    }).catch(error => {
        console.error(error);
    });
}

function createSection(notebookid, sectionName) {
    getTokenPopup(tokenRequest).then(response => {
        postMSGraph(graphConfig.graphNotebooksEndpoint + "/" + notebookid + "/sections", response.accessToken, sectionName, null);
    }).catch(error => {
        console.error(error);
    });
}

function createPage(sectionid, pageName) {
    getTokenPopup(tokenRequest).then(response => {
        postMSGraphPage(graphConfig.graphSectionsEndpoint + "/" + sectionid + "/pages", response.accessToken, pageName, sectionid);
    }).catch(error => {
        console.error(error);
    });
}

function updatePage(pageid) {
    const img = document.getElementById("pastedImage").src;
    var type;
    var content;
    if (img.startsWith("data")) {
        type = "i";
        content = img;
    } else {
        content = document.getElementById("textarea").value;
        type = "t";
    }

    getTokenPopup(tokenRequest).then(response => {
        console.log(pageid)
        patchMSGraphPage(graphConfig.graphPagesEndpoint + "/" + pageid + "/content", response.accessToken, content, type);
    }).catch(error => {
        console.error(error);
    });
}

loadPage();