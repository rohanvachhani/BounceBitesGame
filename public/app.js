//Misc Helpers

function randomFromArray(array) {
    return array[Math.floor(Math.random() * array.length)];
}


function getKeyString(x, y) {
    return `${x}x${y}`;
}

console.log("test");

(function () {

    console.log("into the function block to execute firebase auth")

    firebase.auth().onAuthStateChanged((user) => {
        console.log("user ", user);
        if (user) {
            //user is logged in

        } else {
            //user is logged out
        }

    })


    firebase.auth().signInAnonymously().catch((error) => {
        var errorCode = error.code;
        var errorMessage = error.message;
        // ...
        console.log(errorCode, errorMessage);
    });




})();