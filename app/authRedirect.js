const myMSALObj = new msal.PublicClientApplication(msalConfig);

let accessToken;
let username = "";

myMSALObj.handleRedirectPromise().then(handleResponse).catch(err => {
    console.error(err);
});

function handleResponse(resp) {
    if (resp !== null) {
        username = resp.account.username;
        showWelcomeMessage(resp.account);
    } else {
        const currentAccounts = myMSALObj.getAllAccounts();
        if (currentAccounts === null) {
            return;
        } else if (currentAccounts.length > 1) {
            console.warn("Multiple accounts detected.");
        } else if (currentAccounts.length === 1) {
            username = currentAccounts[0].username;
            showWelcomeMessage(currentAccounts[0]);
        }
    }
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
    if (img || img.length || img.length != 0) {
        type = "i";
        content = img;
    } else {
        content = document.getElementById("textarea").value;
        type = "t";
    }

    getTokenPopup(tokenRequest).then(response => {
        console.log(pageid)
        patchMSGraphPage(graphConfig.graphPagesEndpoint + "/" + pageid + "/content", response.accessToken, content, null, type);
    }).catch(error => {
        console.error(error);
    });
}