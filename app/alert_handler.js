$('#container').on('changed.jstree', function (e, data) {
    var i, j = [];
    for (i = 0, j = data.selected.length; i < j; i++) {
        setCookie("selectedIdx", data.instance.get_node(data.selected[i]).id);
        handleClick(data.instance.get_node(data.selected[i]).id, data.instance.get_node(data.selected[i]).parents.length);
    }
}).jstree;

$('#insertIntoPage').click(function () {
    updatePage(getCookie("selectedIdx"));
});

function create(type, id) {
    if (id != null && type == 'Sec') {
        alertify.prompt("Create new Section", "Section Name",
            function (evt, value) {
                createSection(id, value);
            }).set('title', 'Create Section');
    } else {
        if (type == "NB") {
            alertify.prompt("Create new Notebook", "Notebook Name",
                function (evt, value) {
                    createNotebook(value);
                }).set('title', 'Create Notebook');
        }

        if ($('#container').jstree().get_selected(true)[0] != null) {
            id = $('#container').jstree().get_selected(true)[0].id;
            var level = $('#container').jstree().get_selected(true)[0].parents.length;
        }

        if (type == 'Sec') {
            if (level != 1) {
                alertify.error('Please choose a Notebook');
            } else {
                alertify.prompt("Create new Section", "Section Name",
                    function (evt, value) {
                        createSection(id, value);
                    }).set('title', 'Create Section');
            }
        } else if (type == "Pag") {
            if (level != 2) {
                alertify.error('Please choose a Section');
            } else {
                alertify.prompt("Create new Page", "Page Name",
                    function (evt, value) {
                        createPage(id, value);
                    }).set('title', 'Create Page');
            }
        }
    }
}

function executeCommand() {
    var commands = document.getElementById("commands");
    var selectedCommand = commands.options[commands.selectedIndex].value;

    var variables = selectedCommand.match(/\[(.*?)\]/g);
    var inputVariables = [];

    if (variables) {
        var uniqVariables = variables.reduce(function (a, b) {
            if (a.indexOf(b) < 0) a.push(b);
            return a;
        }, []);

        var customCommandVariablesDlg = document.getElementById("customCommandVariablesDlg");
        customCommandVariablesDlg.innerHTML = "";

        for (var i = 0; i < uniqVariables.length; i++) {
            customCommandVariablesDlg.innerHTML += "<p style='margin-bottom:5px'>" + uniqVariables[i].substring(1, uniqVariables[i].length - 1) + "</p>";
            customCommandVariablesDlg.innerHTML += "<input class='ajs-input' id='custom-command-input-" + i + "' type='text' value=''/><br>";
        }

        var customCommandVariablesHTML = $('#customCommandVariablesDlg').html();

        $('#customCommandVariablesDlg').html("");
        alertify.confirm(customCommandVariablesHTML).set('onok', function (closeevent, value) {
            for (var i = 0; i < uniqVariables.length; i++) {
                var obj = {};
                obj[uniqVariables[i]] = $('#custom-command-input-' + i).val();
                inputVariables.push(obj);
            }

            for (var i = 0; i < inputVariables.length; i++) {
                for (let key in inputVariables[i]) {
                    selectedCommand = selectedCommand.replaceAll(key, inputVariables[i][key]);
                }
            }

            window.location.href = "/custom-command?command=" + selectedCommand;
        }).set('title', 'Input Values');

    } else {
        window.location.href = "/custom-command?command=" + selectedCommand;
    }
}

function loadWritePath() {
    var sharepointDlgHTML = $('#sharepointDlg').html();
    $('#sharepointDlg').html("");
    alertify.confirm(sharepointDlgHTML).set('onok', function (closeevent, value) {
        var sharepointhost = $('#sharepoint-host').val();
        var sharepointpath = $('#sharepoint-path').val();
        window.location.href = "/setSharepoint?host=" + sharepointhost + "&path=" + sharepointpath;
    }).set('title', 'Input Values');
}