var textarea = document.getElementById("textarea");
var jsonTable = document.getElementById("jsonParse");
var sectionsdd = document.getElementById("sectionsdd");

document.getElementById('textarea').onpaste = function (event) {
    var items = (event.clipboardData || event.originalEvent.clipboardData).items;
    console.log(JSON.stringify(items));
    var blob = null;
    for (var i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") === 0) {
            blob = items[i].getAsFile();
        }
        else if (items[i].type.indexOf("text") === 0) {
            items[i].getAsString(function (s) {
                if (isHTML(s)) {
                    textarea.value = "";
                    textarea.value = s;
                } else if (isJson(s)) {
                    var jsonString = JSON.parse(s);
                    textarea.value = "";
                    CreateTableFromJSON(jsonString);
                } else {
                    text = "<p>" + s + "</p>"
                    textarea.value = "";
                    textarea.value = text;
                }
            });
        }
    }
    if (blob !== null) {
        var reader = new FileReader();
        reader.onload = function (event) {
            console.log(event.target.result);
            document.getElementById("pastedImage").src = event.target.result;
        };
        reader.readAsDataURL(blob);
    }
}

function isJson(item) {
    item = typeof item !== "string"
        ? JSON.stringify(item)
        : item;

    try {
        item = JSON.parse(item);
    } catch (e) {
        return false;
    }

    if (typeof item === "object" && item !== null) {
        return true;
    }

    return false;
}

function isHTML(html) {
    var doc = new DOMParser().parseFromString(html, "text/html");
    return Array.from(doc.body.childNodes).some(node => node.nodeType === 1);
}