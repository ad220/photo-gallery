// Check url and corresponding photo
const data_url = "/photos/data.json";

const data_response = await fetch(data_url);
if (!data_response.ok) {
    throw new Error(`Response status: ${data_response.status}`);
}
const data = await data_response.json();

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
    } else {
        document.getElementById('info-container').style.display = 'none';
    }
}

if (sessionStorage.getItem("show-info")) {
    showInfo = sessionStorage.getItem("show-info") === "false";
    toggleInfo();
}


// Set up luminance histogram

function drawHistogram(luminanceValues) {
    const canvas = document.getElementById('histogram-canvas');
    const style = window.getComputedStyle(canvas);
    const textColor = style.getPropertyValue("--text-color");
    const primaryColor = style.getPropertyValue("--primary-color");

    canvas.width = 280;
    canvas.height = 200;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const maxValue = Math.max(...luminanceValues);
    const xStep = canvas.width / (luminanceValues.length - 1);

    ctx.beginPath();

    luminanceValues.forEach((value, index) => {
        const x = index * xStep;
        const y = canvas.height - ((luminanceValues[index-1] + value + luminanceValues[index+1]) / maxValue / 3) * canvas.height * 0.95 + 1;
        ctx.moveTo(x, canvas.height);
        ctx.lineTo(x, y);
    });
    
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.strokeStyle = primaryColor;
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(0, canvas.height - (luminanceValues[0] / maxValue) * canvas.height);

    luminanceValues.forEach((value, index) => {
        const x = index * xStep;
        const y = canvas.height - ((luminanceValues[index-1] + value + luminanceValues[index+1]) / maxValue / 3) * canvas.height * 0.95;
        ctx.lineTo(x, y);
    });
    
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.strokeStyle = textColor;
    ctx.stroke();
}

if (window.innerWidth >= 640) {
    const histogram_url = `/photos/histograms/${imgName.substring(0, imgName.lastIndexOf('.'))}.json`;

    const histogram_response = await fetch(histogram_url);
    if (!histogram_response.ok) {
        throw new Error(`Response status: ${histogram_response.status}`);
    }
    const histogram = await histogram_response.json();
    drawHistogram(histogram);
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
