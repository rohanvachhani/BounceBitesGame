

// Options for Player Colors... these are in the same order as our sprite sheet
const playerColors = ["blue", "red", "orange", "yellow", "green", "purple"];


//Misc Helpers
function randomFromArray(array) {
    return array[Math.floor(Math.random() * array.length)];
}


function getKeyString(x, y) {
    return `${x}x${y}`;
}

function createName() {
    const prefix = randomFromArray([
        "Altitude",
        "Arcane",
        "Catalyst",
        "Celestial",
        "Chaos",
        "Comet",
        "Eclipse",
        "Enigma",
        "Equinox",
        "Euphoric",
        "Fusion",
        "Galactic",
        "Horizon",
        "Illusion",
        "Kinetic",
        "Luminous",
        "Mirage",
        "Nebula",
        "Nexus",
        "Odyssey",
        "Paragon",
        "Phoenix",
        "Radiant",
        "Resonance",
        "Solar",
        "Sonic",
        "Specter",
        "Stellar",
        "Synapse",
        "Synergy",
        "Techno",
        "Tempest",
        "Thunderbolt",
        "Tranquil",
        "Vector",
        "Vortex",
        "Whirlwind",
        "Zen",
        "Zodiac",
        "Zephyr"]);
    const animal = randomFromArray([
        "BEAR",
        "DOG",
        "CAT",
        "FOX",
        "LAMB",
        "LION",
        "BOAR",
        "GOAT",
        "VOLE",
        "SEAL",
        "PUMA",
        "MULE",
        "BULL",
        "BIRD",
        "BUG",
    ]);
    return `${prefix} ${animal}`;
}

(function () {

    let playerID;
    let playerRef;
    const playerNameInput = document.querySelector("#player-name");

    let playerElements = {};

    //reference to the DOM element
    const gameContainer = document.querySelector(".game-container");

    console.log("into the function block to execute firebase auth")

    function initGame() {
        const allPlayerRef = firebase.database().ref(`players`);
        const allConinsRef = firebase.database().ref(`coins`);

        allPlayerRef.on("value", (snapshot) => {
            //triggers whenever a change occurs i.e any values inside the player object changes

        })

        allPlayerRef.on("child_added", (snapshot) => {
            //triggers whenever a new node(here, a player) is added to the db tree 
            const addedPlayer = snapshot.val();
            console.log("A new player added is: ", addedPlayer);
            const characterElement = document.createElement("div");
            characterElement.classList.add("Character", "grid-cell");

            if (addedPlayer.id === playerID) {
                characterElement.classList.add("you");
            }

            characterElement.innerHTML = (`
            <div class="Character_shadow grid-cell"></div>
            <div class="Character_sprite grid-cell"></div>
            <div class="Character_name-container">
              <span class="Character_name"></span>
              <span class="Character_coins">0</span>
            </div>
            <div class="Character_you-arrow"></div>
          `);
            playerElements[addedPlayer.id] = characterElement;

            //fill some data for created elements
            characterElement.querySelector(".Character_name").innerHTML = addedPlayer.name;
            characterElement.querySelector(".Character_coins").innerHTML = addedPlayer.coins;

            characterElement.setAttribute("data-color", addedPlayer.color);
            characterElement.setAttribute("data-direction", addedPlayer.direction);

            //position the character based on x and y value it has at the time of initialization
            const left = 16 * addedPlayer.x + "px";
            const top = 16 * addedPlayer.y - 4 + "px";      //just a little bit up(middle of the cell)
            characterElement.style.transform = `translate3d(${left}, ${top}, 0)`;       //for fluid smooth movement on the board


            gameContainer.appendChild(characterElement); 




        })

    }

    firebase.auth().onAuthStateChanged((user) => {
        console.log("user ", user);
        if (user) {
            //user is logged in
            playerID = user.uid;
            playerRef = firebase.database().ref(`players/${playerID}`);

            const name = createName();
            playerNameInput.value = name;


            playerRef.set({
                id: playerID,
                name,
                direction: "right",
                color: randomFromArray(playerColors),
                x: 3,
                y: 10,
                coins: 0
            })


            // remove the player from firebase when disconneted
            playerRef.onDisconnect().remove();

            //now begin the new game
            initGame();


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