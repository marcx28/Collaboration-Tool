var colorPicker = document.getElementById("color");
colorPicker.addEventListener("change", colorChange, false);

function colorChange(event) {
    setCookie("color", event.target.value);
}

function handleCBChange(cb) {
    setCookie("dateSelected", cb.checked);
}

function loadColor() {
    if (getCookie("color")) {
        colorPicker.value = getCookie("color");
    }
}