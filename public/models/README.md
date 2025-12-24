# Face-API.js Models

This directory should contain the pre-trained models required for `face-api.js` to perform face detection.

## Action Required

You need to download the model files and place them in this directory.

1.  **Download the models:** You can get the files from the official `face-api.js` GitHub repository. A zip file of the models can be found here: [https://github.com/justadudewhohacks/face-api.js/tree/master/weights](https://github.com/justadudewhohacks/face-api.js/tree/master/weights)
    
2.  **Extract and Place:** Download or clone the repository, and copy the following files from the `weights` directory into this `public/models` directory:
    *   `tiny_face_detector_model-weights_manifest.json`
    *   `tiny_face_detector_model.bin`
    *   `face_landmark_68_model-weights_manifest.json`
    *   `face_landmark_68_model.bin`
    *   `face_recognition_model-weights_manifest.json`
    *   `face_recognition_model.bin`
    *   `face_expression_model-weights_manifest.json`
    *   `face_expression_model.bin`
    *   `age_gender_model-weights_manifest.json`
    *   `age_gender_model.bin`
    *   `ssd_mobilenetv1_model-weights_manifest.json`
    *   `ssd_mobilenetv1_model.bin`

The face proctoring code written will not function until these files are present.
