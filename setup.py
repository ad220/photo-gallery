import os
import json
from datetime import datetime
from PIL import Image
from PIL import ExifTags
from bs4 import BeautifulSoup

PHOTO_DIR = "page/photos/"
THUMBNAIL_DIR = PHOTO_DIR + "thumbnails/"

os.makedirs(THUMBNAIL_DIR, exist_ok=True)

def get_photos():
    photos = [file for file in os.listdir("page/photos/") if file.endswith(".jpg")]
    photos.sort()
    photos.reverse()
    return photos

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

    processed_exif = {}

    processed_exif["date"] = datetime.strptime(exif.get("DateTimeOriginal"), "%Y:%m:%d %H:%M:%S").strftime("%-d %B %-Y") if exif.get("DateTimeOriginal") else None
    processed_exif["filename"] = photo
    processed_exif["properties"] = f"{img.width}x{img.height} {round(os.path.getsize(PHOTO_DIR + photo)/1e6,1)}MB"

    camera_model = [exif.get("Make"), exif.get("Model")]
    camera_settings = []
    if exif.get("FNumber"): camera_settings.append(f"f/{exif.get('FNumber')}")
    if exif.get("ExposureTime"): camera_settings.append(f"1/{int(1/exif.get('ExposureTime'))}s")
    if exif.get("FocalLength"): camera_settings.append(f"{int(exif.get('FocalLength'))}mm")
    if exif.get("ISOSpeedRatings"): camera_settings.append(f"ISO{exif.get('ISOSpeedRatings')}")
    
    processed_exif["camera"] = " ".join([x for x in camera_model if x])
    processed_exif["settings"] = " ".join(camera_settings)

    if processed_exif["camera"] == "": processed_exif["camera"] = "Unknown Camera"

    return processed_exif


def gen_histogram(photo):
    img = Image.open(PHOTO_DIR + photo).convert('L')
    histogram = img.histogram()
    max_value = max(histogram)
    histogram = [int(256*(value/max_value)) for value in histogram]
    return histogram


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
    print(f"Reading photos from `{PHOTO_DIR}` directory...")
    photos = get_photos()
    print(f"{len(photos)} files found.")

    print("Extracting EXIF data from photos...")
    exif_data = {photo: get_exif_data(photo) for photo in photos}
    data = {"photo_list": photos, "exif_data": exif_data}

    print("Exporting HTML file and EXIF data...")
    edit_html(photos)
    # print(data)
    with open(PHOTO_DIR + "data.json", "w") as f:
        json.dump(data, f)
    
    print("Generating luminance histogram for every photo...")
    for photo in photos:
        histogram = gen_histogram(photo)
        with open(PHOTO_DIR + f"histograms/{photo.split('.')[0]}.json", "w") as f:
            json.dump(histogram, f)

    print("Generating thumbnails...")
    make_thumbnails()

    print("Gallery setup done!")
