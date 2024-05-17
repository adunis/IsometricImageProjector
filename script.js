document.getElementById('imageInput').addEventListener('change', handleImage, false);
document.getElementById('processButton').addEventListener('click', createIsometricProjection, false);

let imageUrl = '';

function handleImage(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        imageUrl = e.target.result;
    };
    reader.readAsDataURL(file);
}

function createIsometricProjection() {
    if (!imageUrl) {
        alert('Please select an image first.');
        return;
    }

    const output = document.getElementById('output');
    output.innerHTML = ''; // Clear previous content

    const img = new Image();
    img.src = imageUrl;
    img.onload = function() {
        const originalWidth = img.width;
        const originalHeight = img.height;

        const angleX = Math.PI / 6; // 30 degrees in radians
        const angleY = Math.PI / 6; // 30 degrees in radians

        const newWidth = Math.floor(originalWidth * Math.cos(angleX) + originalHeight * Math.cos(angleY));
        const newHeight = Math.floor(originalWidth * Math.sin(angleX) + originalHeight * Math.sin(angleY));

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = newWidth;
        canvas.height = newHeight;

        // Draw the original image on the canvas
        context.drawImage(img, 0, 0, originalWidth, originalHeight);

        // Get the image data from the canvas
        const imageData = context.getImageData(0, 0, originalWidth, originalHeight);
        const data = imageData.data;

        const projectedImageData = context.createImageData(newWidth, newHeight);
        const projectedData = projectedImageData.data;

        // Apply isometric transformation to each pixel
        for (let y = 0; y < originalHeight; y++) {
            for (let x = 0; x < originalWidth; x++) {
                const index = (y * originalWidth + x) * 4;
                const r = data[index];
                const g = data[index + 1];
                const b = data[index + 2];
                const a = data[index + 3];

                const newX = Math.floor((x - y) * Math.cos(angleX) + newWidth / 2);
                const newY = Math.floor((x + y) * Math.sin(angleY) + newHeight / 2 - newHeight / 2);

                const newIndex = (newY * newWidth + newX) * 4;
                if (newIndex >= 0 && newIndex < projectedData.length) {
                    projectedData[newIndex] = r;
                    projectedData[newIndex + 1] = g;
                    projectedData[newIndex + 2] = b;
                    projectedData[newIndex + 3] = a;
                }
            }
        }

        context.putImageData(projectedImageData, 0, 0);
        
        // Append canvas and set its display size using CSS
        canvas.style.width = '50%';  // Adjust this value to scale the display size
        canvas.style.height = 'auto';
        output.appendChild(canvas);

        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = 'isometric_image.png';
        link.textContent = 'Download Isometric Image';
        output.appendChild(link);
    };
}
