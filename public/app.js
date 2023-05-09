
const mapData = {
    minX: 0,
    maxX: 14,
    minY: 3,
    maxY: 12,
    blockedSpaces: {        //position: colxrow
        "7x4": true,
        "1x11": true,
        "12x10": true,
        "4x7": true,
        "5x7": true,
        "6x7": true,
        "8x6": true,
        "9x6": true,
        "10x6": true,
        "7x9": true,
        "8x9": true,
        "9x9": true,
    },
};

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

function isSolid(x, y) {

    const blockedNextSpace = mapData.blockedSpaces[getKeyString(x, y)];

    return (
        blockedNextSpace ||
        x >= mapData.maxX ||
        x <= mapData.minX ||
        y >= mapData.maxY ||
        y <= mapData.minY
    )

}

function getRandomSafeSpot() {
    //We don't look things up by key here, so just return an x/y
    return randomFromArray([
        { x: 1, y: 4 },
        { x: 2, y: 4 },
        { x: 1, y: 5 },
        { x: 2, y: 6 },
        { x: 2, y: 8 },
        { x: 2, y: 9 },
        { x: 4, y: 8 },
        { x: 5, y: 5 },
        { x: 5, y: 8 },
        { x: 5, y: 10 },
        { x: 5, y: 11 },
        { x: 11, y: 7 },
        { x: 12, y: 7 },
        { x: 13, y: 7 },
        { x: 13, y: 6 },
        { x: 13, y: 8 },
        { x: 7, y: 6 },
        { x: 7, y: 7 },
        { x: 7, y: 8 },
        { x: 8, y: 8 },
        { x: 10, y: 8 },
        { x: 8, y: 8 },
        { x: 11, y: 4 },
    ]);
}

(function () {

    let playerId;       // gives ID of player who's logged into the firebase
    let playerRef;      // reference to refer player obj's data from firebase
    let players = {};    // local list of states, where every character is in the game i.e looking players obj to update all DOM nodes on the screen
    let playerElements = {};    // list of references to our actual DOM elements

    let coins = {};
    let coinElements = {};


    //reference to the DOM element
    const gameContainer = document.querySelector(".game-container");
    const playerNameInput = document.querySelector("#player-name");
    const playerColorButton = document.querySelector("#player-color");

    function attemptGrabCoin(x, y) {
        const key = getKeyString(x, y);
        if (coins[key]) {
            //remove this coin from data, and update the player's coin count
            firebase.database().ref(`coins/${key}`).remove();
            console.log("player's coin current value is: ", players[playerId].coins);
            playerRef.update({
                coins: players[playerId].coins + 1,      // TO-DO: some more validations can be added here
            })
        }
    }


    function handleArrowPress(xChange = 0, yChange = 0) {
        const newX = players[playerId].x + xChange;
        const newY = players[playerId].y + yChange;

        if (!isSolid(newX, newY)) {  //is it a movable space in the map?
            //move to the next space
            players[playerId].x = newX;
            players[playerId].y = newY;
            if (xChange === 1) {
                players[playerId].direction = "right";
            }
            if (xChange === -1) {
                players[playerId].direction = "left";
            }

            playerRef.set(players[playerId]);
            attemptGrabCoin(newX, newY);

        }
    }

    function initGame() {
        new KeyPressListener("ArrowUp", () => handleArrowPress(0, -1));
        new KeyPressListener("ArrowDown", () => handleArrowPress(0, 1));
        new KeyPressListener("ArrowLeft", () => handleArrowPress(-1, 0));
        new KeyPressListener("ArrowRight", () => handleArrowPress(1, 0));

        const allPlayerRef = firebase.database().ref(`players`);
        const allConinsRef = firebase.database().ref(`coins`);

        function placeCoin() {
            const { x, y } = getRandomSafeSpot();

            const coinRef = firebase.database().ref(`coins/${getKeyString(x, y)}`);

            coinRef.set({
                x,
                y
            });

            const coinsAppearTimeout = [2000, 3000, 4000, 5000];

            setTimeout(() => {
                placeCoin();
            }, randomFromArray(coinsAppearTimeout));
        }


        allPlayerRef.on("value", (snapshot) => {
            //triggers whenever a change occurs i.e any values inside the player object changes

            //sync value of position for the character from firebase
            players = snapshot.val() || {};
            Object.keys(players).forEach((key) => {
                const characterState = players[key];
                console.log("current players's character state : ", characterState)
                let el = playerElements[key];       //reference to the that character's DOM element 

                //now update the dom, as per the updated values of element
                el.querySelector(".Character_name").innerText = characterState.name;
                el.querySelector(".Character_coins").innerText = characterState.coins;
                el.setAttribute("data-color", characterState.color);
                el.setAttribute("data-direction", characterState.direction);
                const left = 16 * characterState.x + "px";
                const top = 16 * characterState.y - 4 + "px";
                el.style.transform = `translate3d(${left}, ${top}, 0)`;

            })
            console.log("current player's reference from firebase: ", players)
        })

        allPlayerRef.on("child_added", (snapshot) => {
            //triggers whenever a new node(here, a player) is added to the db tree 
            const addedPlayer = snapshot.val();
            console.log("A new player added is: ", addedPlayer);
            const characterElement = document.createElement("div");
            characterElement.classList.add("Character", "grid-cell");

            if (addedPlayer.id === playerId) {
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
        });

        //remove character's DOM element after they leave the game
        allPlayerRef.on("child_removed", (snapshot) => {
            const removeKey = snapshot.val().id;
            gameContainer.removeChild(playerElements[removeKey]);
            delete playerElements[removeKey];
        })

        //This block will remove coins from local state when Firebase `coins` value updates
        allConinsRef.on("value", (snapshot) => {
            coins = snapshot.val() || {};
        })

        // when the coin created in the firebase
        allConinsRef.on("child_added", (snapshot) => {
            const coin = snapshot.val();
            const key = getKeyString(coin.x, coin.y);
            coins[key] = true;

            //create the DOM element for the above coin
            const coinElement = document.createElement("div");
            coinElement.classList.add("Coin", "grid-cell");
            coinElement.innerHTML = `
            <div class="Coin_shadow grid-cell"></div>
            <div class="Coin_sprite grid-cell"></div>
            `;

            //position this coin DOM element
            const left = 16 * coin.x + "px";
            const top = 16 * coin.y - 4 + "px";
            coinElement.style.transform = `translate3d(${left}, ${top}, 0)`;

            // keep a reference for removal later and add to DOM
            coinElements[key] = coinElement;
            gameContainer.appendChild(coinElement);

        })

        //when a coin gets removed from firebase
        allConinsRef.on("child_removed", (snapshot) => {
            const { x, y } = snapshot.val();
            const keysToRemove = getKeyString(x, y);

            gameContainer.removeChild(coinElements[keysToRemove]);

            delete coinElements[keysToRemove];
        })

        //update player's name with the text input
        playerNameInput.addEventListener("change", (e) => {
            let newName = e.target.value.trim();  // Remove leading/trailing whitespace characters from the input

            if (newName.length === 0) {  // Check if the new name consists only of whitespace characters
                newName = createName();  // Generate a new random name if the input is invalid
            }

            playerNameInput.value = newName;
            playerRef.update({
                name: newName
            });
        });

        //update player's color with the color botton click
        playerColorButton.addEventListener("click", (e) => {
            console.log("player color button clicked!");
            const currentColorIndex = playerColors.indexOf(players[playerId].color);
            const newColor = playerColors[(currentColorIndex + 1) % playerColors.length];
            playerRef.update({
                color: newColor
            });
        });




        placeCoin();

    }

    firebase.auth().onAuthStateChanged((user) => {
        console.log("user ", user);
        if (user) {
            //user is logged in
            playerId = user.uid;
            playerRef = firebase.database().ref(`players/${playerId}`);

            const name = createName();
            playerNameInput.value = name;

            const { x, y } = getRandomSafeSpot();

            playerRef.set({
                id: playerId,
                name,
                direction: "right",
                color: randomFromArray(playerColors),
                x,
                y,
                coins: 0,
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