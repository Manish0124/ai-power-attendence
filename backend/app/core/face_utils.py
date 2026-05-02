from PIL import Image
import numpy as np
import io


def get_face_encoding(image_bytes: bytes) -> list:
    """
    Returns a simple 128-dim encoding from a face image.
    Resizes to 64x64, converts to grayscale, normalizes pixel values.
    """
    img = Image.open(io.BytesIO(image_bytes)).convert("L")  # grayscale
    img = img.resize((64, 64))
    arr = np.array(img, dtype=np.float32).flatten()
    norm = np.linalg.norm(arr)
    if norm == 0:
        raise ValueError("Empty image")
    arr = arr / norm
    return arr.tolist()


def compare_encodings(known: list, candidate: list, threshold: float = 0.15) -> bool:
    a = np.array(known)
    b = np.array(candidate)
    distance = np.linalg.norm(a - b)
    return distance < threshold
