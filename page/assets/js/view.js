import data from '/photos/data.json' with {type: 'json'};

const photoList = data.photo_list;
const params = new URLSearchParams(document.location.search);
const imgName = params.get("img");
const imgIndex = photoList.indexOf(imgName);

if (imgIndex === -1) {
    window.location = '/';
}

document.getElementById('progression').innerHTML = imgIndex+1 + ' / ' + photoList.length;
document.getElementById("img-container").setAttribute("style", "background-image: url(/photos/thumbnails/"+imgName+");");

document.getElementById('close-button').addEventListener('click', function() {
    window.location = '/#'+imgName;
});
document.getElementById('left-arrow-nav').addEventListener('click', function() {
    if (imgIndex === 0) {
        window.location = '/view/?img='+photoList[photoList.length-1];
    } else {
        window.location = '/view/?img='+photoList[imgIndex-1];
    }
});
document.getElementById('right-arrow-nav').addEventListener('click', function() {
    if (imgIndex === photoList.length-1) {
        window.location = '/view/?img='+photoList[0];
    } else {
        window.location = '/view/?img='+photoList[imgIndex+1];
    }
});
document.getElementById('download-button').setAttribute("href", "/photos/"+imgName);
document.getElementById('download-button').setAttribute("download", imgName);

const fullResImg = new Image();
fullResImg.src = "/photos/"+imgName;
fullResImg.onload = function() {
    document.getElementById("img-container").setAttribute("style", "background-image: url(/photos/"+imgName+");");
};