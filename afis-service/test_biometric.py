import unittest
import cv2
import numpy as np
import base64
from app import compute_match_score # Importamos la función real del middleware

class TestBiometricVectorProcessing(unittest.TestCase):
    
    def test_compute_match_score_generates_valid_vector_score(self):
        # Arrange (Preparar)
        mock_image = np.zeros((100, 100), dtype=np.uint8)
        cv2.circle(mock_image, (50, 50), 20, 255, -1) # Patrón básico
        
        # Codificamos la imagen sintética simulando la entrada desde el hardware U.are.U 4500
        _, buffer = cv2.imencode('.png', mock_image)
        mock_probe_bytes = buffer.tobytes()
        mock_candidate_bytes = buffer.tobytes() # Usamos la misma para garantizar un "Match"

        # Act
        score_result = compute_match_score(mock_probe_bytes, mock_candidate_bytes)

        # Assert
        self.assertIsNotNone(score_result, "El procesamiento del vector no debe devolver Null.")
        
        self.assertIsInstance(score_result, int, "El score de SIFT debe ser un número entero.")
        
        self.assertGreater(score_result, 0, "El score debe ser mayor a 0 para huellas idénticas.")

if __name__ == '__main__':
    unittest.main()
