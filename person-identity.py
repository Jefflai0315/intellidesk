# # !pip install mediapipe-silicon
# import time
# import math as m
# import cv2
# import mediapipe as mp
# import mysql.connector  # or import psycopg2 for PostgreSQL
# from datetime import datetime
# from ultralytics import YOLO
# import cv2
# import firebase_admin
# from firebase_admin import credentials
# from firebase_admin import db
# from collections import defaultdict
# from threading import Timer
# from statistics import mean, mode
# import numpy as np



# cap = cv2.VideoCapture(0)

# mp_pose = mp.solutions.pose
# pose = mp_pose.Pose()
# mp_face_mesh = mp.solutions.face_mesh
# face_mesh = mp_face_mesh.FaceMesh()
# mp_hands = mp.solutions.hands
# hands = mp_hands.Hands()
# mp_drawing = mp.solutions.drawing_utils
# mp_drawing_styles = mp.solutions.drawing_styles
# model = YOLO("yolov8m.pt")
# data_points = defaultdict(list)


# font = cv2.FONT_HERSHEY_SIMPLEX
# success, image = cap.read()

# if not success:
#     print("Null.Frames")
#     cap.release()

# fps =cap.get(cv2.CAP_PROP_FPS)
# h, w = image.shape[:2]

# image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
# keypoints =pose.process(image)

# # Convert the image back to BGR.
# image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)
# results = model.predict(image)
# result = results[0]
# screens_list=[]
# largest_person_area = 0
# largest_person_cords = None
# for box in result.boxes:
#     cords = box.xyxy[0].tolist()  # [xmin, ymin, xmax, ymax]
#     class_id = box.cls[0].item()
#     conf = box.conf[0].item()
#     label = result.names[class_id]
#     if conf > 0.7 and (label == "laptop" or label == "person"):
#         start_point = (int(cords[0]), int(cords[1]))  # Top left corner
#         end_point = (int(cords[2]), int(cords[3]))    # Bottom right corner
#         color = (255, 0, 0)  # Color of the rectangle (in BGR)
#         thickness = 2       # Thickness of the rectangle border
#         cv2.rectangle(image, start_point, end_point, color, thickness)
#         width = cords[3]-cords[1]
#         screens_list.append([cords,class_id,conf,label])

from matplotlib import pyplot as plt
from matplotlib.patches import Rectangle
from matplotlib.patches import Circle
from PIL import Image 
from numpy import savez_compressed
from numpy import asarray
from os import listdir
from mtcnn.mtcnn import MTCNN

#Method to extract Face
def extract_image(image):
  img1 = Image.open(image)            #open the image
  img1 = img1.convert('RGB')          #convert the image to RGB format 
  pixels = asarray(img1)              #convert the image to numpy array
  detector = MTCNN()                  #assign the MTCNN detector
  f = detector.detect_faces(pixels)
  #fetching the (x,y)co-ordinate and (width-->w, height-->h) of the image
  x1,y1,w,h = f[0]['box']             
  x1, y1 = abs(x1), abs(y1)
  x2 = abs(x1+w)
  y2 = abs(y1+h)
  #locate the co-ordinates of face in the image
  store_face = pixels[y1:y2,x1:x2]
  plt.imshow(store_face)
  image1 = Image.fromarray(store_face,'RGB')    #convert the numpy array to object
  image1 = image1.resize((160,160))             #resize the image
  face_array = asarray(image1)                  #image to array
  return face_array


#Method to fetch the face
def load_faces(directory):
  face = []
  i=1
  for filename in listdir(directory):
    path = directory + filename
    faces = extract_image(path)
    face.append(faces)
  return face


#Method to get the array of face data(trainX) and it's labels(trainY)
def load_dataset(directory):
  x, y = [],[]
  i=1
  for subdir in listdir(directory):
    try:
      path = directory + subdir + '/'
      #load all faces in subdirectory
      faces = load_faces(path)
      #create labels
      labels = [subdir for _ in range(len(faces))]
      #summarize
      print("%d There are %d images in the class %s:"%(i,len(faces),subdir))
      x.extend(faces)
      y.extend(labels)
      i=i+1
    except:
      pass 
      
  return asarray(x),asarray(y)  


#load the datasets
trainX,trainY = load_dataset('Users/')
print(trainX.shape,trainY.shape)
#compress the data
savez_compressed('Users.npz',trainX,trainY)