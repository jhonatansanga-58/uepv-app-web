import base64
import json
import cv2
import numpy as np
from flask import Flask, request, jsonify

app = Flask(__name__)

def compute_match_score(probe_bytes, candidate_bytes):
    try:
        nparr1 = np.frombuffer(probe_bytes, np.uint8)
        img1 = cv2.imdecode(nparr1, cv2.IMREAD_GRAYSCALE)
        
        nparr2 = np.frombuffer(candidate_bytes, np.uint8)
        img2 = cv2.imdecode(nparr2, cv2.IMREAD_GRAYSCALE)

        if img1 is None or img2 is None:
            return 0

        # Mejorar el contraste de las crestas para evitar matching de ruido en el cristal
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        img1 = clahe.apply(img1)
        img2 = clahe.apply(img2)

        # Iniciar detector SIFT 
        sift = cv2.SIFT_create()
        kp1, des1 = sift.detectAndCompute(img1, None)
        kp2, des2 = sift.detectAndCompute(img2, None)

        if des1 is None or des2 is None or len(des1) < 2 or len(des2) < 2:
            return 0

        index_params = dict(algorithm=1, trees=10) # FLANN_INDEX_KDTREE
        search_params = dict(checks=50)
        
        flann = cv2.FlannBasedMatcher(index_params, search_params)
        matches = flann.knnMatch(des1, des2, k=2)

        # Ratio Test de Lowe equilibrado a 0.70 
        good_matches = []
        for m, n in matches:
            if m.distance < 0.70 * n.distance:
                good_matches.append(m)

        return len(good_matches)
    except Exception as e:
        print("Match score error:", e)
        return 0

@app.route("/verify", methods=["POST"])
def verify():
    data = request.json
    probe_base64 = data.get("probe")
    candidates = data.get("candidates")

    if not probe_base64 or not candidates:
        return jsonify({"error": "Faltan parámetros 'probe' o 'candidates'"}), 400

    try:
        probe_bytes = base64.b64decode(probe_base64)
        
        best_id = None
        highest_score = 0
        THRESHOLD = 12 # Reducido a 12 para permitir rotaciones leves o diferencias de presión

        for candidate in candidates:
            templates = candidate.get("templates", [])
            for t_b64 in templates:
                try:
                    c_bytes = base64.b64decode(t_b64)
                    score = compute_match_score(probe_bytes, c_bytes)
                    
                    if score > THRESHOLD and score > highest_score:
                        highest_score = score
                        best_id = candidate["id"]
                except Exception as template_error:
                    continue
        
        if best_id is not None:
            return jsonify({"match": True, "studentId": best_id, "score": highest_score})
        else:
            return jsonify({"match": False, "studentId": None})

    except Exception as e:
        print(f"Server Error: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    print("Iniciando Motor de Visión Artificial (OpenCV) en el puerto 5000...")
    app.run(port=5000)
