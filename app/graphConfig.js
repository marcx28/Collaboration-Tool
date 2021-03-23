var id;

function loadFile() {
    fetch('./getSharepoint').then(results => results.json()).then(results => getPath(results));
}

fetch('./getSharepoint').then(results => results.json()).then(results => getPath(results));

function getPath(graphPath) {
    if (graphPath == "") {
        loadWritePath();
        return;
    }
    var result = JSON.parse(graphPath);
    var sitePath = "https://graph.microsoft.com/v1.0/sites/" + result[0].host + ":/" + result[1].path;
    getSite(sitePath);
}

function handleSite(data, type) {
    if (JSON.stringify(data.error)) {
        if (JSON.stringify(data.error.code)) {
            alertify.error("Invalid Sharepoint data entered!");
        } else {
            alertify.error("Error with request!");
        }
    } else {
        alertify.success("Sharepoint Site loaded!");
    }

    setCookie("siteId", data.id);
    id = data.id;
    graphConfig.graphNotebooksEndpoint = 'https://graph.microsoft.com/v1.0/sites/' + id + '/onenote/notebooks';
    graphConfig.graphSectionsEndpoint = 'https://graph.microsoft.com/v1.0/sites/' + id + '/onenote/sections';
    graphConfig.graphPagesEndpoint = 'https://graph.microsoft.com/v1.0/sites/' + id + '/onenote/pages';
    loadTree();
}

const graphConfig = {
    graphMeEndpoint: 'https://graph.microsoft.com/v1.0/me',
    graphOneNoteEndpoint: 'https://graph.microsoft.com/v1.0/sites/' + id + '/onenote',
    graphNotebooksEndpoint: 'https://graph.microsoft.com/v1.0/sites/' + id + '/onenote/notebooks',
    graphSectionsEndpoint: 'https://graph.microsoft.com/v1.0/sites/' + id + '/onenote/sections',
    graphPagesEndpoint: 'https://graph.microsoft.com/v1.0/sites/' + id + '/onenote/pages'
};