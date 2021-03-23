const signInButton = document.getElementById("SignIn");
const all_div = document.getElementById("all");

function checkTag(option) {
    if (option) {
        optionValue = document.getElementById("0").value;
        if (!(optionValue == option.value)) {
            document.getElementById("comment").style.display = "block";
        }
        else {
            document.getElementById("comment").style.display = "none";
        }
    }
    else {
        document.getElementById("comment").style.display = "none";
    }
}

function showWelcomeMessage(account) {
    all_div.style.display = "block";
    signInButton.setAttribute("onclick", "signOut();");
    signInButton.innerHTML = "Sign Out";
    loadFile()
}