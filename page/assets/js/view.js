// Check url and corresponding photo

const url = "/photos/data.json";

const response = await fetch(url);
if (!response.ok) {
    throw new Error(`Response status: ${response.status}`);
}
const data = await response.json();

const photoList = data.photo_list;
const exifData = data.exif_data;
const params = new URLSearchParams(document.location.search);
const imgName = params.get("img");
const imgIndex = photoList.indexOf(imgName);

if (imgIndex === -1) {
    window.location = '/';
}


// Set up content

document.getElementById('progression').innerHTML = imgIndex+1 + ' / ' + photoList.length;
document.getElementById("img-container").setAttribute("style", "background-image: url(/photos/thumbnails/"+imgName+");");

document.getElementById("info-date").innerHTML = exifData[imgName].date;
document.getElementById("info-filename").innerHTML = exifData[imgName].filename;
document.getElementById("info-properties").innerHTML = exifData[imgName].properties;
document.getElementById("info-camera").innerHTML = exifData[imgName].camera;
document.getElementById("info-settings").innerHTML = exifData[imgName].settings;

const fullResImg = new Image();
fullResImg.src = "/photos/" + imgName;
fullResImg.addEventListener("load", function() {
    document.getElementById("img-container").style.backgroundImage = "url(/photos/" + imgName + ")";
});

var showInfo = false;

function toggleInfo() {
    showInfo = !showInfo;
    sessionStorage.setItem("show-info", String(showInfo));
    if (showInfo) {
        document.getElementById('info-container').style.display = 'flex';
        if (window.innerWidth < 640) {
            document.getElementById('info-container').style.height = '200px';
        } else {
            document.getElementById('info-container').style.width = '300px';
        }
    } else {
        document.getElementById('info-container').style.display = 'none';
        if (window.innerWidth < 640) {
            document.getElementById('info-container').style.height = '0';
        } else {
            document.getElementById('info-container').style.width = '0';
        }
    }
}

if (sessionStorage.getItem("show-info")) {
    showInfo = sessionStorage.getItem("show-info") === "false";
    toggleInfo();
}


// Set up user interaction

document.getElementById('close-button').addEventListener('click', function() {
    window.location = '/#'+imgName;
});
document.getElementById('download-button').setAttribute("href", "/photos/"+imgName);
document.getElementById('download-button').setAttribute("download", imgName);
document.getElementById('info-button').addEventListener('click', toggleInfo);

function nextPhoto() {
    if (imgIndex === photoList.length-1) {
        window.location = '/view/?img='+photoList[0];
    } else {
        window.location = '/view/?img='+photoList[imgIndex+1];
    }
}

function previousPhoto() {
    if (imgIndex === 0) {
        window.location = '/view/?img='+photoList[photoList.length-1];
    } else {
        window.location = '/view/?img='+photoList[imgIndex-1];
    }
}

document.getElementById('left-arrow-nav').addEventListener('click', previousPhoto);
document.getElementById('right-arrow-nav').addEventListener('click', nextPhoto);

document.addEventListener('keydown', function(event) {
    if (event.key === 'ArrowLeft') {
        previousPhoto();
    } else if (event.key === 'ArrowRight') {
        nextPhoto();
    }
});

if (window.innerWidth < 640) {
    let touchstartX = 0;
    let touchstartY = 0;
    let touchendX = 0;
    let touchendY = 0;

    const gestureZone = document.getElementById('img-container');

    gestureZone.addEventListener('touchstart', function(event) {
        touchstartX = event.changedTouches[0].screenX;
        touchstartY = event.changedTouches[0].screenY;
    });

    gestureZone.addEventListener('touchend', function(event) {
        touchendX = event.changedTouches[0].screenX;
        touchendY = event.changedTouches[0].screenY;
        handleGesture();
    });

    function handleGesture() {
        if ((touchendX - touchstartX < -100) && (3*Math.abs(touchendY - touchstartY) < Math.abs(touchendX - touchstartX))) {
            nextPhoto();
        }

        if ((touchendX - touchstartX > 100) && (3*Math.abs(touchendY - touchstartY) < Math.abs(touchendX - touchstartX))) {
            previousPhoto();
        }
    }
}
