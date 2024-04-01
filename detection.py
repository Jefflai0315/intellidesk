# import argparse
# import time
# from pathlib import Path

# import cv2
# import torch

# from models.experimental import attempt_load
# from utils.datasets import LoadImages
# from utils.general import check_img_size, non_max_suppression, \
#     scale_coords,  set_logging

# from utils.torch_utils import select_device

# class ObjectDetection:

#     def __init__(self):

#         set_logging()
#         self.device = select_device()

#         # Load model
#         self.model = attempt_load("yolov7-tiny.pt", map_location=self.device)  # load FP32 model
#         self.stride = int(self.model.stride.max())
#         self.imgsz = check_img_size(640, s=self.stride)


#     def detect(self, img_path, idx):

#         cell_phone_centers = []

#         # Set Dataloader
#         dataset = LoadImages(img_path, img_size=self.imgsz, stride=self.stride)

#         # Get names and colors
#         names = self.model.module.names if hasattr(self.model, 'module') else self.model.names

#         # Run inference
#         if self.device.type != 'cpu':
#             self.model(torch.zeros(1, 3, self.imgsz, self.imgsz).to(self.device).type_as(next(self.model.parameters())))  # run once
#         old_img_w = old_img_h = self.imgsz
#         old_img_b = 1

#         t0 = time.time()
#         for path, img, im0s, vid_cap in dataset:
#             img = torch.from_numpy(img).to(self.device)
#             img = img.float()  # uint8 to fp16/32
#             img /= 255.0  # 0 - 255 to 0.0 - 1.0
#             if img.ndimension() == 3:
#                 img = img.unsqueeze(0)

#             # Warmup
#             if self.device.type != 'cpu' and (old_img_b != img.shape[0] or old_img_h != img.shape[2] or old_img_w != img.shape[3]):
#                 old_img_b = img.shape[0]
#                 old_img_h = img.shape[2]
#                 old_img_w = img.shape[3]
#                 for i in range(3):
#                     self.model(img, augment=False)[0]

#             # Inference
#             with torch.no_grad():   # Calculating gradients would cause a GPU memory leak
#                 pred = self.model(img, augment=False)[0]
#             # Apply NMS
#             pred = non_max_suppression(pred, 0.25, 0.45, classes=None, agnostic=False)


#             # Process detections
#             cell_phone_centers += self.process_detection(pred, path, im0s, dataset, names, img, idx)
#         print(f'Done. ({time.time() - t0:.3f}s)')
#         return cell_phone_centers
    



#     def process_detection(self, pred, path, im0s, dataset, names, img, idx):
#         cell_phone_centers = []
#         for i, det in enumerate(pred):  # detections per image
#             p, s, im0, frame = path, '', im0s, getattr(dataset, 'frame', 0)
#             screen_list = []
#             if len(det):
#                 # Rescale boxes from img_size to im0 size
#                 det[:, :4] = scale_coords(img.shape[2:], det[:, :4], im0.shape).round()
#                 # Write results
#                 for *xyxy, conf, cls in reversed(det):
#                     if int(cls) == 62 or int(cls) == 63:  # index for "screen"
#                         screen_list.append([xyxy,int(cls),conf,det.names[int(cls)]])
                        
#                     elif int(cls) == 0:

#         return screen_list

import argparse
import time
from datetime import datetime
from pathlib import Path

import cv2
import torch

import numpy as np
from models.experimental import attempt_load
from utils.datasets import LoadImages
from utils.general import check_img_size, non_max_suppression, \
    scale_coords, set_logging

from utils.torch_utils import select_device
import mediapipe as mp

class ObjectDetection:

    def __init__(self):

        set_logging()
        self.device = select_device()

        # Load model
        self.model = attempt_load("yolov7-tiny.pt", map_location=self.device)  # load FP32 model
        # self.model = attempt_load("yolov7.pt",  map_location=self.device)
        self.stride = int(self.model.stride.max())
        self.imgsz = check_img_size(640, s=self.stride)
        self.mp_pose = mp.solutions.pose
        self.pose = self.mp_pose.Pose()


    def detect(self, img_path, idx):
     

        # Initialize list to store detection results
        detection_results = []

        # Set Dataloader
        dataset = LoadImages(img_path, img_size=self.imgsz, stride=self.stride)

        # Get names and colors
        names = self.model.module.names if hasattr(self.model, 'module') else self.model.names

        # Run inference
        if self.device.type != 'cpu':
            self.model(torch.zeros(1, 3, self.imgsz, self.imgsz).to(self.device).type_as(next(self.model.parameters())))  # run once
        
        t0 = time.time()
        for path, img, im0s, vid_cap in dataset:
            img = torch.from_numpy(img).to(self.device)
            img = img.float()  # uint8 to fp16/32
            img /= 255.0  # 0 - 255 to 0.0 - 1.0
            if img.ndimension() == 3:
                img = img.unsqueeze(0)

            # Inference
            with torch.no_grad():
                pred = self.model(img, augment=False)[0]

            # Apply NMS
            pred = non_max_suppression(pred, 0.25, 0.45, classes=None, agnostic=False)
            
            # Process detections
            detection_results += self.process_detection(pred, img,im0s, names)

        print(f'Done. ({time.time() - t0:.3f}s)')
        return detection_results
    
    def isolate_object(self, image, bbox):

        # Crop the image\
  
        x_min, y_min, x_max, y_max = map(int, bbox)
 
        # Crop the image

        crop_img = image[y_min:y_max, x_min:x_max]
   

        # Pad the cropped image to maintain original size
    
        h, w, _ = image.shape
        padded_img = np.zeros((h, w, 3), dtype=np.uint8)
        padded_img[y_min:y_min+crop_img.shape[0], x_min:x_min+crop_img.shape[1]] = crop_img

        

        return padded_img

    def process_detection(self, pred,img, im0s, names):
        detection_results = []
        largest_person_area = 0
        largest_person_cords = None
        lm = None  # Initialize to None
        lmPose = None  # Initialize to None
        for i, det in enumerate(pred):  # detections per image
           
            if len(det):
                # Rescale boxes from img_size to im0 size
                det[:, :4] = scale_coords(img.shape[2:], det[:, :4], im0s.shape).round()

                for *xyxy, conf, cls in reversed(det):
                    label = names[int(cls)]
                    if label in ["laptop", "monitor"]:
                        #[xyxy,int(cls),conf,det.names[int(cls)]
                        detection_results.append([xyxy,int(cls),conf,names[int(cls)]])
                        # Add your logic here to draw rectangles and labels on the image
                        pass
                    elif conf > 0.5 and label == 'person':
                        # Calculate the area of the bounding box
                        x1, y1, x2, y2 = xyxy
                        area = (x2 - x1) * (y2 - y1)
                        if area > largest_person_area:
                            largest_person_area = area
                            largest_person_cords = [x1, y1, x2, y2]
                            # Add your logic here to draw rectangles for the largest person
                            pass

        # After processing all detections, you can handle the largest person bounding box
        # e.g., cropping the image or applying additional processing
        if largest_person_cords:
                # # Ensure the coordinates are within the image boundaries
                # x_min, y_min, x_max, y_max = [max(0, int(coord)) for coord in largest_person_cords]
                # x_max = min(x_max, image.shape[1])
                # y_max = min(y_max, image.shape[0])

                # Crop the image to the largest person's bounding box
                # cropped_image = image[y_min:y_max, x_min:x_max]
                # Crop and pad the image
            isolated_image = self.isolate_object(im0s, largest_person_cords)
            isolated_img = cv2.cvtColor(isolated_image, cv2.COLOR_BGR2RGB)
            keypoints = self.pose.process(isolated_img)

                # Convert the image back to BGR.
                # padded_img = cv2.cvtColor(isolated_img, cv2.COLOR_RGB2BGR)

            lm = keypoints.pose_landmarks
            lmPose = self.mp_pose.PoseLandmark
       
        

        return detection_results , lm , lmPose, largest_person_cords, isolated_image 
