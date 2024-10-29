# Photo Gallery
A simple photo gallery in a static web page

## Features
- Shows your photos in a grid layout trying to respect the aspect ratio of the photos
- Clicking on a photo will open a modal with the photo in full resolution
- Generates thumbnails for faster loading

## Installation
1. Clone repository
2. Install dependencies
```bash
python -m pip install pillow beautifulsoup4
```
3. Drop your photos in the `/page/photos` folder
4. Run the python setup script from root directory
```bash
python setup.py
```
5. Setup is complete, open the `/page/index.html` file in your browser to view the gallery or use any static web server to host the files with `/page` as the root directory

## Configuration
You can edit `template.html` to change the header and footer of the gallery page.

You can also tweak the color theme in the `/page/assets/style/app.css` stylesheet.

## Planned Features
- Add EXIF data to the modal view
