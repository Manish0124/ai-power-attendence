from PIL import Image
import numpy as np
import io
import os

_MODEL_PATH = os.path.join(os.path.dirname(__file__), 'face_landmarker.task')


def get_face_encoding(image_bytes: bytes) -> list:
    import mediapipe as mp
    BaseOptions = mp.tasks.BaseOptions
    FaceLandmarker = mp.tasks.vision.FaceLandmarker
    FaceLandmarkerOptions = mp.tasks.vision.FaceLandmarkerOptions
    VisionRunningMode = mp.tasks.vision.RunningMode

    options = FaceLandmarkerOptions(
        base_options=BaseOptions(model_asset_path=_MODEL_PATH),
        running_mode=VisionRunningMode.IMAGE,
        num_faces=1,
    )
    img = Image.open(io.BytesIO(image_bytes)).convert('RGB')
    img = img.resize((256, 256))
    arr = np.array(img, dtype=np.uint8)
    mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=arr)

    with FaceLandmarker.create_from_options(options) as landmarker:
        result = landmarker.detect(mp_image)

    if not result.face_landmarks:
        raise ValueError('No face detected')

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
