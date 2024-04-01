import cv2
import os
import numpy as np
from insightface.app import FaceAnalysis
from scipy.spatial.distance import euclidean
from numpy.linalg import norm
import firebase_admin
from firebase_admin import credentials
from firebase_admin import db
import time
from datetime import datetime
from detection import ObjectDetection

def initialize_firebase():
    cred = credentials.Certificate("intellidesk-174c9-firebase-adminsdk-garkf-abe9a9fb75.json")
    firebase_admin.initialize_app(cred, {
        'databaseURL' : "https://intellidesk-174c9-default-rtdb.asia-southeast1.firebasedatabase.app/"
                            })
    return db.reference()

class FaceRecognition:
    def __init__(self, similarity_threshold=0.5, firebase_refs=None):
        self.app = FaceAnalysis(providers=['CPUExecutionProvider'])
        self.app.prepare(ctx_id=0, det_size=(640, 640))
        self.firebase_refs = firebase_refs
        self.face_embeddings_ref = firebase_refs.child('Controls/FaceEmbeddings/')
        self.known_embeddings = self.extract_known_embeddings()
        self.similarity_threshold = similarity_threshold
        self.model = ObjectDetection()


    def add_face_embeddings(self, image_paths, Username): 
        known_embeddings = {}


        embedding = self.get_embedding(image_paths)
        if embedding is not None:
            known_embeddings[Username] = embedding.tolist()
        self.firebase_refs.child(f'Controls/FaceEmbeddings/').update(known_embeddings)





    def extract_known_embeddings(self):
        known_embeddings = self.firebase_refs.child(f'Controls/FaceEmbeddings/').get()
        

        return known_embeddings

    def get_image_paths(self, directory):
        image_paths = []
        for filename in os.listdir(directory):
            if filename.lower().endswith(('.png', '.jpg', '.jpeg')): 
                image_paths.append(os.path.join(directory, filename))
        return image_paths

    def get_embedding(self, img_paths):
        embeddings = []
        for img_path in os.listdir(img_paths):
            _,_,_,_,isolated_image = self.model.detect(img_path, 0)
            # img = cv2.imread(img_paths + '/' + img_path)
            faces = self.app.get(isolated_image)
            if faces and len(faces) > 0:
                embeddings.append(faces[0].embedding)
        return np.mean(embeddings, axis=0) if embeddings else None

    def euclidean_distance(self, embedding1, embedding2):
        return euclidean(embedding1, embedding2)

    def cosine_similarity(self, embedding1, embedding2):
        return np.dot(embedding1, embedding2) / (norm(embedding1) * norm(embedding2))

    def identify_persons(self, img_path):
        _,_,_,_,isolated_image = self.model.detect(img_path, 0)
        # img = cv2.imread(img_path)
        cv2.imshow('Webcam', isolated_image)

        faces = self.app.get(isolated_image)
        identity = 'Unknown'
        for face in faces:
            embedding = face.embedding
            max_similarity = -1
            identity = 'Unknown'
            self.known_embeddings = self.extract_known_embeddings()
            for name, known_embedding in self.known_embeddings.items():
                similarity = self.cosine_similarity(embedding, known_embedding) 
                print(f'similarity with {name} from User database: ',similarity)

                if similarity > max_similarity:
                    max_similarity = similarity
                   
                    identity = name if similarity > self.similarity_threshold else 'Unknown'

            # Draw bounding box and label
            bbox = face.bbox.astype(np.int32)
            cv2.rectangle(isolated_image, (bbox[0], bbox[1]), (bbox[2], bbox[3]), (0, 255, 0), 2)
            cv2.putText(isolated_image, identity, (bbox[0], bbox[1] - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 255, 0), 2)

        return isolated_image, identity

# if __name__ == "__main__":
#     img_dir = "Intellidesk"
#     # img_path = '/Users/jefflai/intellidesk-screen/test.jpg'
#     firebase_refs = initialize_firebase()

#     # cv2.imwrite("./output.jpg", result_img)  # Save the image
#     start_time = datetime.now().timestamp()*1000
#     last_time = time.time()
#     interval = 3
#     cap = cv2.VideoCapture(0)
#     while cap.isOpened():
#         # cur_time = datetime.now().timestamp()*1000
#         # if firebase_refs.child("Controls/PostureCamera").get()==1:
#         if firebase_refs.child("Controls/PostureCamera").get()==1:
#             # current_time = time.time()
#             # if current_time - last_time >= interval: # 3-second interval has passed
#                 # Capture and process frame
#                 # last_time = current_time
#             success, image = cap.read()
#             cv2.imwrite("./static/images/identity.jpg", image)
#             img_path = "./static/images/identity.jpg"

#             if not success:
#                 print("Null.Frames")
#                 cap.release()
#                 break
#             else: 
#                 face_recognition = FaceRecognition(similarity_threshold = 0.40, firebase_refs= firebase_refs)
#                 result_img, identity = face_recognition.identify_persons(img_path)
#                 #update identity
#                 if identity == "Unknown":
#                     firebase_refs.child(f'Controls/').update({'PostureNudge': 4})
#                     identity = ''
#                 firebase_refs.child(f'Controls/').update({'UserTable': identity})
#                 firebase_refs.child("Controls/").update({'DetectUser': 0})
#                 firebase_refs.child("Controls/").update({'PostureCamera': 2})

#             cv2.imshow('Webcam', result_img)

#         if cv2.waitKey(1) & 0xFF == ord('q'):
#             # self.firebase_refs['Session'].update({str(int(self.start_time)):str(int(datetime.now().timestamp()*1000))})
#             break
#     print('Finished.')
#     cap.release()
#     cv2.destroyAllWindows()
    