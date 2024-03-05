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

def initialize_firebase():
    cred = credentials.Certificate("intellidesk-174c9-firebase-adminsdk-garkf-abe9a9fb75.json")
    firebase_admin.initialize_app(cred, {
        'databaseURL' : "https://intellidesk-174c9-default-rtdb.asia-southeast1.firebasedatabase.app/"
                            })
    return db.reference()

class FaceSetUp:
    def __init__(self, similarity_threshold=0.5, firebase_refs=None):
        self.app = FaceAnalysis(providers=['CPUExecutionProvider'])
        self.app.prepare(ctx_id=0, det_size=(640, 640))
        self.firebase_refs = firebase_refs
        self.face_embeddings_ref = firebase_refs.child('Controls/FaceEmbeddings/')
        self.similarity_threshold = similarity_threshold


    def add_face_embeddings(self, image_paths, Username): 
        known_embeddings = {}

        embedding = self.get_embedding(image_paths)
        if embedding is not None:
            known_embeddings[Username] = embedding.tolist()
        self.firebase_refs.child(f'Controls/FaceEmbeddings/').update(known_embeddings)



    def get_embedding(self, img_paths):
        embeddings = []
        for img_path in os.listdir(img_paths):
            img = cv2.imread(img_paths + '/' + img_path)
            faces = self.app.get(img)
            if faces and len(faces) > 0:
                embeddings.append(faces[0].embedding)
        return np.mean(embeddings, axis=0) if embeddings else None


    def cosine_similarity(self, embedding1, embedding2):
        return np.dot(embedding1, embedding2) / (norm(embedding1) * norm(embedding2))

    def identify_persons(self, img_path):
        img = cv2.imread(img_path)
        faces = self.app.get(img)
        for face in faces:
            embedding = face.embedding
            max_similarity = -1
            identity = 'Unknown'
            for name, known_embedding in self.known_embeddings.items():
                similarity = self.cosine_similarity(embedding, known_embedding) 
                print(f'similarity with {name} from User database: ',similarity)

                if similarity > max_similarity:
                    max_similarity = similarity
                   
                    identity = name if similarity > self.similarity_threshold else 'Unknown'

            # Draw bounding box and label
            bbox = face.bbox.astype(np.int32)
            cv2.rectangle(img, (bbox[0], bbox[1]), (bbox[2], bbox[3]), (0, 255, 0), 2)
            cv2.putText(img, identity, (bbox[0], bbox[1] - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 255, 0), 2)

        return img, identity

if __name__ == "__main__":
    img_dir = "SetUpImages"
    # img_path = '/Users/jefflai/intellidesk-screen/test.jpg'
    firebase_refs = initialize_firebase()
    input_name = firebase_refs.child('Controls/InputName').get()
    face_recognition = FaceSetUp(similarity_threshold = 0.40, firebase_refs= firebase_refs)
    face_recognition.add_face_embeddings(img_dir, input_name) # need to add input name , when user key in name from the app 