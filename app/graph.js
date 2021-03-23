var extension = "";

function callMSGraph(endpoint, token, callback, type) {
    const headers = new Headers();
    const bearer = `Bearer ${token}`;

    headers.append("Authorization", bearer);

    const options = {
        method: "GET",
        headers: headers
    };

    console.log('request made to Graph API at: ' + new Date().toString());

    fetch(endpoint, options)
        .then(response => response.json())
        .then(response => callback(response, type))
        .catch(error => console.log(error));
}

function postMSGraph(endpoint, token, name, callback) {
    const bearer = `Bearer ${token}`;
    const body = {
        "displayName": name
    };

    const param = {
        headers: {
            "Authorization": bearer,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body),
        method: "POST"
    };

    fetch(endpoint, param)
        .then(response => {
            if (response.ok) {
                alertify.success('Object "' + name + '" created!');
                getNotebooks();
            }
        })
        .then(data => { return data.json() })
        .then(response => { console.log(response) })
        .then(response => callback(response, endpoint))
        .catch(error => console.log(error));
}

function postMSGraphPage(endpoint, token, name, sectionid) {
    const bearer = `Bearer ${token}`;
    const htmlBegin = "<!DOCTYPE html><html><head><title>";
    const htmlEnd = "</title></head></html>";
    var content = htmlBegin + name + htmlEnd;

    const param = {
        headers: {
            "Authorization": bearer,
            "Content-Type": "application/xhtml+xml"
        },
        body: content.toString(),
        method: "POST"
    };

    fetch(endpoint, param)
        .then(response => {
            if (response.ok) {
                alertify.success('Page "' + name + '" created!');
                getPages(sectionid);
            }
        })
        .then(data => { return data.json() })
        .then(response => { console.log(response) })
        .catch(error => console.log(error));
}

function patchMSGraphPage(endpoint, token, content, type) {
    const bearer = `Bearer ${token}`;
    var param = null;
    var tag = document.getElementById("tagdd");
    var dateCB = document.getElementById("date");
    var colorPicker = document.getElementById("color");
    var comment = document.getElementById("comment_text").value;
    const jsonBodyFirst = "[{'target':'body','action':'append','position':'after','content':'";
    const jsonBodyLast = "'}]";
    var colorTagStart = '<p style="color:' + colorPicker.value + '">';
    const colorTagEnd = '</p>';

    if (type == "t") {
        switch (tag.options[tag.selectedIndex].text) {
            case "Idea":
                content += '<p data-tag="idea">' + comment + '</p>';
                break;
            case "Critical":
                content += '<p data-tag="critical">' + comment + '</p>';
                break;
            case "Comment":
                content += '<p data-tag="remember-for-blog">' + comment + '</p>';
                break;
            case "Red":
                content += '<p data-tag="project-a">' + comment + '</p>';
                break;
            default:
                break;
        }

        if (dateCB.checked) {
            var currentDate = new Date();
            var dateTime = '<p>' + currentDate.getDate() + '.' + currentDate.getMonth() + '.' + currentDate.getFullYear() + ' ' + currentDate.getHours() + ':' + currentDate.getMinutes() + ':' + currentDate.getSeconds() + '</p>';
            console.log(dateTime);
            content += dateTime;
        }

        var paramBody = jsonBodyFirst + colorTagStart + content + colorTagEnd + jsonBodyLast;

        param = {
            headers: {
                "Authorization": bearer,
                "Content-Type": "application/json"
            },
            body: paramBody,
            method: "PATCH"
        };
    } else if (type == "i") {
        const htmlText = '<img src="name:imageBlock1" alt="an image on the page" width="300" />';

        switch (tag.options[tag.selectedIndex].text) {
            case "Idea":
                htmlText += '<p data-tag="idea">' + comment + '</p>';
                break;
            case "Critical":
                htmlText += '<p data-tag="critical">' + comment + '</p>';
                break;
            case "Comment":
                htmlText += '<p data-tag="remember-for-blog">' + comment + '</p>';
                break;
            case "Red":
                htmlText += '<p data-tag="project-a">' + comment + '</p>';
                break;
            default:
                break;
        }

        let formData = new FormData();
        formData.append("Commands", new Blob([
            jsonBodyFirst + htmlText + jsonBodyLast
        ], {
            type: "application/json"
        }));

        var blob1 = b64toBlob(content);

        formData.append("imageBlock1", new Blob([
            blob1
        ], {
            type: extension
        }), "image." + extension.substr(-3));

        param = {
            headers: {
                "Authorization": bearer,
            },
            body: formData,
            method: "PATCH"
        };
    }


    console.log(content);

    fetch(endpoint, param)
        .then(response => {
            if (response.ok) {
                alertify.success('Content has been inserted!');
            }
        })
        .then(data => { return data })
        .then(response => { console.log(response) })
        .catch(error => console.log(error));
}

function b64toBlob(dataURI) {
    var dataPart = dataURI.split(',')[1];
    var byteString = atob(dataPart);
    if (dataPart.charAt(0) == '/') {
        extension = "image/jpg";
    } else if (dataPart.charAt(0) == 'R') {
        extension = "image/gif";
    } else if (dataPart.charAt(0) == 'i') {
        extension = "image/png";
    }

    var ab = new ArrayBuffer(byteString.length);
    var ia = new Uint8Array(ab);

    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: extension });
}