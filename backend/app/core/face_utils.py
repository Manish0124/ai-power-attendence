from PIL import Image
import numpy as np
import io
import urllib.request
import os
import tempfile

_MODEL_PATH = None


def _get_model():
    global _MODEL_PATH
    if _MODEL_PATH and os.path.exists(_MODEL_PATH):
        return _MODEL_PATH
    model_url = "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task"
    tmp = tempfile.NamedTemporaryFile(suffix=".task", delete=False)
    urllib.request.urlretrieve(model_url, tmp.name)
    _MODEL_PATH = tmp.name
    return _MODEL_PATH


def get_face_encoding(image_bytes: bytes) -> list:
    import mediapipe as mp
    BaseOptions = mp.tasks.BaseOptions
    FaceLandmarker = mp.tasks.vision.FaceLandmarker
    FaceLandmarkerOptions = mp.tasks.vision.FaceLandmarkerOptions
    VisionRunningMode = mp.tasks.vision.RunningMode

    model_path = _get_model()
    options = FaceLandmarkerOptions(
        base_options=BaseOptions(model_asset_path=model_path),
        running_mode=VisionRunningMode.IMAGE,
        num_faces=1,
    )
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    img = img.resize((256, 256))
    arr = np.array(img, dtype=np.uint8)
    mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=arr)

    with FaceLandmarker.create_from_options(options) as landmarker:
        result = landmarker.detect(mp_image)

    if not result.face_landmarks:
        raise ValueError("No face detected")

    landmarks = result.face_landmarks[0]
    encoding = []
    for lm in landmarks:
        encoding.extend([lm.x, lm.y, lm.z])
    return encoding


def compare_encodings(known: list, candidate: list, threshold: float = 1.0) -> bool:
    a = np.array(known)
    b = np.array(candidate)
    distance = np.linalg.norm(a - b)
    print(f'Face distance: {distance:.4f}, threshold: {threshold}')
    return distance < threshold
