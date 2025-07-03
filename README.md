# Image resizer MVP

This is a demonstration of client-side image processing using React and the [rect-image-file-resizer](https://www.npmjs.com/package/react-image-file-resizer) library. 

The app demonstrates that complex image processing can be done entirely client-side, making it perfect for scenarios where you want to reduce server load or process images offline. You can upload multiple images at once and see the immediate size savings from the compression and resizing process.

# Getting started

`npm install; npm start`

# Micro benchmark
This is a micro benchmark but it gives an idea:
- Cumulated images size: 2,24GB
- Number of images: 400
- Computer : Macbook M3
- Browser : Chrome
- Duration: 40 secondes
- Javascript heap size :
  - before: 52MB
  - max: 118MB
- Chrome (render) memory consumption :
  - before: 175MB
  - max: 1,7GB

# Notes

## Core Functionality

- File Upload: Multiple image upload via a styled button
Automatic Resizing: Images are immediately resized to 800x800px max while maintaining aspect ratio
- Memory Management: Original files are automatically freed from browser memory after processing
- JPEG Compression: Images are converted to JPEG format with 80% quality for optimal file size

## Key Features

- Real-time Stats: Shows number of images processed, original size, space saved, and compression ratio
- Visual Grid: Displays all resized images in a responsive grid layout
- Individual Controls: Remove specific images or clear all at once
- Progress Indication: Shows processing state with loading spinner
- File Size Display: Shows original vs resized file sizes for each image

## Technical notes

- File upload: The original `File` objects are stored in the `files` array from `event.target.files`
- Processing: Each file is passed to `react-image-file-resizer`
- Memory: Only the final base64 resized images are kept in state
- Input clearing: `event.target.value = ''` clears the file input, but this doesn't free the File objects from memory

## Memory notes

- The `react-image-file-resizer` library handles most of the internal memory cleanup automatically
- JavaScript's garbage collector will eventually free the original File objects once there are no more references
- The most effective cleanup happens when we clear the file input and remove array references, in the handleFileUpload` function:
  - `javascriptevent.target.value = '';`  clears the file input element
  - `files.length = 0;` removes all references from the files array




