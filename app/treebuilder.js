var jsonString = JSON.parse('{"core":{"data":[]}}');
var section_list = [];

function getAllNotebooks(token) {
    const headers = new Headers();
    const bearer = `Bearer ${token}`;

    headers.append("Authorization", bearer);

    const options = {
        method: "GET",
        headers: headers
    };

    console.log('request made to Graph API at: ' + new Date().toString());

    fetch(graphConfig.graphNotebooksEndpoint, options)
        .then(response => response.json())
        .then(response => {
            if (response.value.length < 1) {
                alertify.error("You don't have any Notebooks!");
            } else {
                for (i = 0; i < response.value.length; i++) {
                    var NBJson = JSON.parse('{"text":"' + response.value[i].displayName + '","id":"' + response.value[i].id + '","state" : {"opened" : true },"icon" : "fas fa-book","children":[]}');
                    console.log(JSON.stringify(NBJson))
                    if (i == (response.value.length - 1)) {
                        getSectionsPerNB(token, NBJson, response.value[i].id, i, true);
                    } else {
                        getSectionsPerNB(token, NBJson, response.value[i].id, i, false);
                    }
                }
            }
        }).catch(error => console.log(error));
}

function getSectionsPerNB(token, NBJson, NBId, index, last) {
    const headers = new Headers();
    const bearer = `Bearer ${token}`;

    headers.append("Authorization", bearer);

    const options = {
        method: "GET",
        headers: headers
    };

    console.log('request made to Graph API at: ' + new Date().toString());

    fetch(graphConfig.graphNotebooksEndpoint + "/" + NBId + "/sections", options)
        .then(response => response.json())
        .then(response => {
            if (response.value.length < 1) {
                alertify.warning("You don't have any Sections in this Notebook!");
                create('Sec', NBId);
            } else {
                for (i = 0; i < response.value.length; i++) {
                    NBJson.children[i] = JSON.parse('{"text":"' + response.value[i].displayName + '","id":"' + response.value[i].id + '","state" : {"opened" : true },"icon" : "fas fa-layer-group","children":[]}');
                }
                jsonString.core.data[index] = NBJson;
                if (last) {
                    finished();
                }
                $(function () {
                    if ($('#container').find("li").length > 0) {
                        $('#container').jstree(true).destroy(true);
                    }
                    $('#container').jstree(jsonString);
                    $('#container').on('changed.jstree', function (e, data) {
                        var i, j = [];
                        for (i = 0, j = data.selected.length; i < j; i++) {
                            setCookie("selectedIdx", data.instance.get_node(data.selected[i]).id);
                            handleClick(data.instance.get_node(data.selected[i]).id, data.instance.get_node(data.selected[i]).parents.length);
                        }
                    }).jstree;
                });
                setCookie("treeJSON", JSON.stringify(jsonString));
            }
        }).catch(error => console.log(error));
}

function getCertainPages(sectionId, token) {
    if (!(section_list.includes(sectionId))) {
        section_list.push(sectionId);
        setCookie("Chosen_Sections", JSON.stringify(section_list));
    }

    const headers = new Headers();
    const bearer = `Bearer ${token}`;

    headers.append("Authorization", bearer);

    const options = {
        method: "GET",
        headers: headers
    };

    console.log('request made to Graph API at: ' + new Date().toString());

    fetch(graphConfig.graphSectionsEndpoint + "/" + sectionId + "/pages", options)
        .then(response => response.json())
        .then(response => {
            if (response.value.length < 1) {
                alertify.warning("You don't have any Pages in this Section!");
            } else {
                var SecId = null;
                var NBId = 0;
                for (i = 0; i < jsonString.core.data.length; i++) {
                    SecId = findIndex(jsonString.core.data[i].children, sectionId);
                    NBId = i;
                    if (SecId != null) { break; }
                }
                for (i = 0; i < response.value.length; i++) {
                    jsonString.core.data[NBId].children[SecId].children[i] = JSON.parse('{"text":"' + response.value[i].title + '","id":"' + response.value[i].id + '","state" : {"opened" : true },"icon" : "far fa-file"}');
                }
                $(function () {
                    $('#container').jstree(true).destroy(true);
                    $('#container').jstree(jsonString);
                    $('#container').on('changed.jstree', function (e, data) {
                        var i, j = [];
                        for (i = 0, j = data.selected.length; i < j; i++) {
                            setCookie("selectedIdx", data.instance.get_node(data.selected[i]).id);
                            handleClick(data.instance.get_node(data.selected[i]).id, data.instance.get_node(data.selected[i]).parents.length);
                        }
                    }).jstree;

                });
                setCookie("treeJSON", JSON.stringify(jsonString));
                setTimeout(() => { selectFromCookie(); }, 100);
            }
        }).catch(error => console.log(error));
}

function findIndex(data, id) {
    for (var i = 0; i < data.length; i++) {
        if (data[i].id == id) {
            return (i);
        }
    }
}

function setCookie(name, value) {
    document.cookie = name + "=" + value;
}

function getCookie(name) {
    var cookieArr = document.cookie.split(";");

    for (var i = 0; i < cookieArr.length; i++) {
        var cookiePair = cookieArr[i].split("=");
        if (name == cookiePair[0].trim()) {
            return decodeURIComponent(cookiePair[1]);
        }
    }
    return null;
}

function deleteCookie(name) {
    document.cookie = [name, '=; expires=Thu, 01-Jan-1970 00:00:01 GMT; path=/; domain=.', window.location.host.toString()].join('');
}

function selectFromCookie() {
    $(function () {
        $('#container').jstree("select_node", getCookie("selectedIdx"));
    });
}

function hasChildren(secId) {
    var SecIdx = null;
    var NBIdx = 0;
    for (i = 0; i < jsonString.core.data.length; i++) {
        SecIdx = findIndex(jsonString.core.data[i].children, secId);
        NBIdx = i;
        if (SecIdx != null) { break; }
    }
    return jsonString.core.data[NBIdx].children[SecIdx].children.length > 0;
}

function loadTree() {
    if (!(getCookie("siteId"))) {
        loadFile();
    }
    if (getCookie("color")) {
        document.getElementById("color").value = getCookie("color");
    }
    if (getCookie("dateSelected") != null) {
        var checkedCB = (getCookie("dateSelected") == 'true');
        document.getElementById("date").checked = checkedCB;
    }
    if (getCookie("treeJSON")) {
        jsonString = JSON.parse(getCookie("treeJSON"));
        $(function () {
            $('#container').jstree(jsonString);
        });
        setTimeout(() => {
            if (getCookie("selectedIdx")) {
                selectFromCookie();
            }
        }, 150);
    } else {
        getNotebooks();
        if (getCookie("selectedIdx")) {
            deleteCookie("selectedIdx");
        }
    }
}

function handleClick(id, level) {
    uploadDiv = document.getElementById("upload");
    if (level == 2 && (!(hasChildren(id)))) {
        getPages(id);
        uploadDiv.style.display = "none";
    } else if (level == 3) {
        uploadDiv.style.display = "block";
    } else {
        uploadDiv.style.display = "none";
    }
}

function finished() {
    if (getCookie("Chosen_Sections")) {
        var list = JSON.parse(getCookie("Chosen_Sections"));
        for (i = 0; i < list.length; i++) {
            getPages(list[i]);
        }
    }
}