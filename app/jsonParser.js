function CreateTableFromJSON(array) {
    buildHtmlTable(array);
    var table = document.getElementById("jsonTable");
    console.log(table)
    var first = '<!DOCTYPE html><html><head><style>table, th, td {border: 1px solid black;}</style></head><body><table>';
    var last = '</table></body></html>';
    var divContainer = document.getElementById("textarea");
    divContainer.value = "";
    divContainer.value = first + table.innerHTML + last;
}

function buildHtmlTable(array) {
    var columns = addAllColumnHeaders(array);

    for (var i = 0; i < array.length; i++) {
        var row$ = $('<tr/>');
        for (var colIndex = 0; colIndex < columns.length; colIndex++) {
            var cellValue = array[i][columns[colIndex]];

            if (cellValue == null) { cellValue = ""; }

            row$.append($('<td/>').html(cellValue));
        }
        $("#jsonTable").append(row$);
    }
}

function addAllColumnHeaders(array) {
    var columnSet = [];
    var headerTr$ = $('<tr/>');

    for (var i = 0; i < array.length; i++) {
        var rowHash = array[i];
        for (var key in rowHash) {
            if ($.inArray(key, columnSet) == -1) {
                columnSet.push(key);
                headerTr$.append($('<th/>').html(key));
            }
        }
    }

    $("#jsonTable").append(headerTr$);

    return columnSet;
}

function isArray(input) {
    return Object.prototype.toString.call(input) === '[object Array]';
}