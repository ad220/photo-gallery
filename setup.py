import os
import json
from PIL import Image
from PIL import ExifTags
from bs4 import BeautifulSoup

PHOTO_DIR = "page/photos/"
THUMBNAIL_DIR = PHOTO_DIR + "thumbnails/"

os.makedirs(THUMBNAIL_DIR, exist_ok=True)

def get_photos():
    return [file for file in os.listdir("page/photos/") if file.endswith(".jpg")]

def make_thumbnails():
    photos = get_photos()
    for photo in photos:
        img = Image.open(PHOTO_DIR + photo)
        img.thumbnail((2000, 400), Image.BICUBIC)
        img.save(THUMBNAIL_DIR + photo, quality=95)

def get_exif_data(photo):
    img = Image.open(PHOTO_DIR+photo)
    exif_data = img._getexif()
    if exif_data:
        exif = {ExifTags.TAGS[k]: v for k, v in exif_data.items() if k in ExifTags.TAGS and type(v) is not bytes}
        return exif
    return {}

def edit_html(photos):
    with open("template.html", "r") as f:
        soup = BeautifulSoup(f, "html.parser")
    
    ul = soup.find("ul", class_="gallery-container")
    for photo in photos:
        li = soup.new_tag("li", id=photo)
        a = soup.new_tag("a", href="/view?img=" + photo)
        img = soup.new_tag("img", src=THUMBNAIL_DIR[4:] + photo)
        a.append(img)
        li.append(a)
        ul.append(li)
    
    with open("page/index.html", "w") as f:
        f.write(str(soup))


if __name__ == "__main__":
    photos = get_photos()
    exif_data = {photo: get_exif_data(photo) for photo in photos}
    data = {"photo_list": photos} #, "exif_data": exif_data}
    edit_html(photos)
    # print(data)
    with open(PHOTO_DIR + "data.json", "w") as f:
        json.dump(data, f)

    make_thumbnails()

