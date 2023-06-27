document.getElementById("video_file").addEventListener("change", function () {
  var videoFile = this.files[0];
  if (videoFile && !validateFileType(videoFile, ['video/mp4', 'video/mpeg', 'video/quicktime'])) {
    window.alert('Please select a valid video file (MP4, MPEG, QuickTime).');
    this.value = null; // Reset the file input to allow reselection
  }
});

document.getElementById("image_file").addEventListener("change", function () {
  var imageFile = this.files[0];
  if (imageFile && !validateFileType(imageFile, ['image/jpeg', 'image/png', 'image/gif'])) {
    window.alert('Please select a valid image file (JPEG, PNG, GIF).');
    this.value = null; // Reset the file input to allow reselection
  }
});

function validateFileType(file, allowedTypes) {
  return allowedTypes.includes(file.type);
}