if (!!window.EventSource) {
    var source = new EventSource('/stream');

    source.onmessage = function(event) {
        document.getElementById('status').innerText = event.data;
        console.log(event.data);
        if (event.data === "Jump") {
            triggerJump();
        } else if (event.data === "Crouch") {
            triggerDuck();
        } else if (event.data === "None") {
            stopDuck();
        }
    };

    source.onerror = function(error) {
        console.error("EventSource failed:", error);
        source.close();
    };
} else {
    console.log("Your browser doesn't support SSE");
}

function triggerJump() {
    if (!gameOver && dino.y === dinoY) {
        velocityY = -11;  // Simulate jump
    }
}

function triggerDuck() {
    if (!gameOver && dino.y === dinoY) {
        dino.isDucking = true; // Start ducking
    }
}

function stopDuck() {
    dino.isDucking = false; // Stop ducking
}


//if (!!window.EventSource) {
//    var source = new EventSource('/stream');
//
//    source.onmessage = function(event) {
//        document.getElementById('status').innerText = event.data;
//    };
//
//    source.onerror = function(error) {
//        console.error("EventSource failed:", error);
//        source.close();
//    };
//} else {
//    console.log("Your browser doesn't support SSE");
//}