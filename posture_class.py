# !pip install mediapipe-silicon
import time
import math as m
import cv2
import mediapipe as mp
import mysql.connector  # or import psycopg2 for PostgreSQL
from datetime import datetime
from ultralytics import YOLO
import cv2
import firebase_admin
from firebase_admin import credentials
from firebase_admin import db
from collections import defaultdict
from threading import Timer
from statistics import mean, mode
import numpy as np

cred = credentials.Certificate("intellidesk-174c9-firebase-adminsdk-garkf-abe9a9fb75.json")
firebase_admin.initialize_app(cred, {
                              'databaseURL' : "https://intellidesk-174c9-default-rtdb.asia-southeast1.firebasedatabase.app/"
                              })
ref = db.reference('Posture/')
ref_corr = db.reference('Correction/')
ref_session = db.reference('Session/')
ref_E2S = db.reference('EyeScreenDistance/')


class Posture:    
    def __init__(self,):
        self.start_time = datetime.now()
        self.total_time = self.get_total_time()
        self.standing_frames = 0
        self.current_standing_frames =0
        self.sitting_frames = 0 
        self.good_pos_frames = 0 
        self.bad_pos_frames = 0
        self.perfect_pos_frames = 0
        self.prolong_bad = 0
        self.total_frames = 0
        self.correction = []
        self.average_neck_ang = 0
        self.average_torsol_ang = 0
        self.cap = cv2.VideoCapture(0)
        self.screens_list=[]

        self.mp_pose = mp.solutions.pose
        self.pose = self.mp_pose.Pose()
        self.mp_face_mesh = mp.solutions.face_mesh
        self.face_mesh = self.mp_face_mesh.FaceMesh()
        self.mp_hands = mp.solutions.hands
        self.hands = self.mp_hands.Hands()
        self.mp_drawing = mp.solutions.drawing_utils
        self.mp_drawing_styles = mp.solutions.drawing_styles
        self.model = YOLO("yolov8m.pt")
        self.data_points = defaultdict(list)

        self.last_firebase_update_time = datetime.now()  # Initialize the last update time
        self.update_interval = 5


    def get_total_time(self):
        return datetime.now() - self.start_time

    def findDistance(self,x1, y1, x2, y2):
        dist = m.sqrt((x2-x1)**2+(y2-y1)**2)
        return dist

    def findAngle(self,x1, y1, x2, y2):
        theta = m.acos((y2 -y1)*(-y1) / (m.sqrt((x2 - x1)**2 + (y2 - y1)**2) * y1))
        degree = int(180/m.pi)*theta
        return degree

    def calculate_angle_3p(self, x1, y1, x2, y2, x3, y3):
    # Calculating the slopes of lines AB and BC
        slope_AB = (y2 - y1) / (x2 - x1) if x2 != x1 else float('inf')
        slope_BC = (y3 - y2) / (x3 - x2) if x3 != x2 else float('inf')

        # Calculating the tangent of the angle between the lines
        tan_theta = abs((slope_BC - slope_AB) / (1 + slope_AB * slope_BC))

        # Calculating the angle in radians
        angle_radians = m.atan(tan_theta)

        # Converting the angle to degrees
        angle_degrees = angle_radians * (180 / m.pi)

        return angle_degrees

    def calculate_angle_2p(self,x1, y1, x2, y2):
    # Calculate the differences in the x and y coordinates
        delta_x = x1-x2
        delta_y = y2 - y1

        # Avoid division by zero
        if delta_y == 0:
            return 90 if delta_x > 0 else 270 if delta_x < 0 else 0

        # Calculate the angle in radians
        angle_radians = m.atan(delta_x / delta_y)

        # Convert the angle to degrees
        angle_degrees = angle_radians * (180 / m.pi)

        # Adjust the angle based on the quadrant
        # if delta_x >= 0 and delta_y < 0:
        #     angle_degrees = 180 - angle_degrees
        # elif delta_x < 0 and delta_y < 0:
        #     angle_degrees = 180 + angle_degrees
        # elif delta_x < 0 and delta_y >= 0:
        #     angle_degrees = 360 - angle_degrees

        return angle_degrees

    def sendWarning(self):
        self.correction.append(datetime.now().time())
        return 'bad posture'

    def is_fist(hand_landmarks):
    # Get the landmarks for the fingertips, MCP joints, and wrist
        index_tip_y = hand_landmarks.landmark[8].y 
        index_mcp_y = hand_landmarks.landmark[5].y 
        middle_tip_y = hand_landmarks.landmark[12].y 
        middle_mcp_y = hand_landmarks.landmark[9].y 
        ring_tip_y = hand_landmarks.landmark[16].y 
        ring_mcp_y = hand_landmarks.landmark[13].y 
        pinky_tip_y = hand_landmarks.landmark[20].y
        pinky_mcp_y = hand_landmarks.landmark[17].y 
        print(hand_landmarks)

        # Check for a fist gesture
        if (index_tip_y > index_mcp_y and
            middle_tip_y > middle_mcp_y and
            ring_tip_y > ring_mcp_y and
            pinky_tip_y > pinky_mcp_y ): 
            return True
        else:
            return False


    
    def read(self):
        self.total_frames += 1
        timestamp = datetime.now()
        posture_category = None
        position_category = None
        fist_detected = False
         # Colors.
        blue = (255, 127, 0)
        red = (50, 50, 255)
        green = (127, 255, 0)
        dark_blue = (127, 20, 0)
        light_green = (127, 233, 100)
        yellow = (0, 255, 255)
        pink = (255, 0, 255)

        # Font type.
        font = cv2.FONT_HERSHEY_SIMPLEX
        success, image = self.cap.read()
        # image = cv2.rotate(image, cv2.ROTATE_90_CLOCKWISE)
        if not success:
            print("Null.Frames")
            return self.cap.release()
        # Get fps.
        fps = self.cap.get(cv2.CAP_PROP_FPS)
        # Get height and width.
        h, w = image.shape[:2]
        # print(h,w)

        # # Convert the BGR image to RGB.
        image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        keypoints = self.pose.process(image)

        # Convert the image back to BGR.
        image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)

        # lm = keypoints.pose_landmarks
        # lmPose = self.mp_pose.PoseLandmark


        try: 
            results = self.model.predict(image)
            result = results[0]
            largest_person_area = 0
            largest_person_cords = None
            for box in result.boxes:
                cords = box.xyxy[0].tolist()  # [xmin, ymin, xmax, ymax]
                class_id = box.cls[0].item()
                conf = box.conf[0].item()
                label = result.names[class_id]
                if conf > 0.7 and (label == "laptop" or label == "monitor"):
                    # Draw rectangle (bounding box)
                    start_point = (int(cords[0]), int(cords[1]))  # Top left corner
                    end_point = (int(cords[2]), int(cords[3]))    # Bottom right corner
                    color = (255, 0, 0)  # Color of the rectangle (in BGR)
                    thickness = 2       # Thickness of the rectangle border
                    cv2.rectangle(image, start_point, end_point, color, thickness)
                   
                    self.screens_list.append([cords,class_id,conf,label])

                    # Put label near the top left corner of the rectangle
                    font = cv2.FONT_HERSHEY_SIMPLEX
                    font_scale = 5
                    font_color = (255, 0,0)  
                    font_thickness = 3
                    cv2.putText(image, f'{label} {conf:.2f}', (int(cords[0]), int(cords[1]-10)), font, font_scale, font_color, font_thickness)
                else:
                    pass

                if conf > 0.7 and (label =='person'):
                    start_point = (int(cords[0]), int(cords[1]))  # Top left corner
                    end_point = (int(cords[2]), int(cords[3]))    # Bottom right corner
                    color = (0, 255, 0)  # Color of the rectangle (in BGR)
                    thickness = 2       # Thickness of the rectangle border
                    
                    # area of the rectangle
                    area = (cords[2] - cords[0]) * (cords[3] - cords[1])
                    if area > largest_person_area:
                        largest_person_area = area
                        largest_person_cords = cords
                        cv2.rectangle(image, start_point, end_point, color, thickness)

        

                def process_image(image, bbox):
                    # Crop the image
                    x_min, y_min, x_max, y_max = map(int, bbox)
                    # Crop the image
                    crop_img = image[y_min:y_max, x_min:x_max]

                    # Pad the cropped image to maintain original size
                    h, w, _ = image.shape
                    padded_img = np.zeros((h, w, 3), dtype=np.uint8)
                    padded_img[y_min:y_min+crop_img.shape[0], x_min:x_min+crop_img.shape[1]] = crop_img

                    return padded_img

                if largest_person_cords:
                    # Ensure the coordinates are within the image boundaries
                    x_min, y_min, x_max, y_max = [max(0, int(coord)) for coord in largest_person_cords]
                    x_max = min(x_max, image.shape[1])
                    y_max = min(y_max, image.shape[0])

                    # Crop the image to the largest person's bounding box
                    # cropped_image = image[y_min:y_max, x_min:x_max]
                    # Crop and pad the image
                    padded_img = process_image(image, largest_person_cords)
                    padded_img = cv2.cvtColor(padded_img, cv2.COLOR_BGR2RGB)
                    keypoints = self.pose.process(padded_img)

                    # Convert the image back to BGR.
                    padded_img = cv2.cvtColor(padded_img, cv2.COLOR_RGB2BGR)

                    lm = keypoints.pose_landmarks
                    lmPose = self.mp_pose.PoseLandmark


        
            

        except Exception as e:
            print(e)




        # Acquire the landmark coordinates.
        # Once aligned properly, left or right should not be a concern.      
        # Left shoulder.
        try:
            
            l_shldr_x = int(lm.landmark[lmPose.LEFT_SHOULDER].x * w)
            l_shldr_y = int(lm.landmark[lmPose.LEFT_SHOULDER].y * h)
            print(l_shldr_x, l_shldr_y)
            if largest_person_cords[0] <= l_shldr_x <= largest_person_cords[2] and largest_person_cords[1] <= l_shldr_y <= largest_person_cords[3]:
                # print('within the bb')
                pass
            else: 
                # print('outside the bb')
                pass
                
            # Right shoulder
            r_shldr_x = int(lm.landmark[lmPose.RIGHT_SHOULDER].x * w)
            r_shldr_y = int(lm.landmark[lmPose.RIGHT_SHOULDER].y * h)
            # Left ear.
            l_ear_x = int(lm.landmark[lmPose.LEFT_EAR].x * w)
            l_ear_y = int(lm.landmark[lmPose.LEFT_EAR].y * h)
            # Left hip.
            l_hip_x = int(lm.landmark[lmPose.LEFT_HIP].x * w)
            l_hip_y = int(lm.landmark[lmPose.LEFT_HIP].y * h)
            # Left elbow.
            l_elbow_x = int(lm.landmark[lmPose.LEFT_ELBOW].x * w)
            l_elbow_y = int(lm.landmark[lmPose.LEFT_ELBOW].y * h)
            # Left wrist.
            l_wrist_x = int(lm.landmark[lmPose.LEFT_WRIST].x * w)
            l_wrist_y = int(lm.landmark[lmPose.LEFT_WRIST].y * h)
            # Left knee.
            l_knee_x = int(lm.landmark[lmPose.LEFT_KNEE].x * w)
            l_knee_y = int(lm.landmark[lmPose.LEFT_KNEE].y * h)
            l_eye_x = int(lm.landmark[lmPose.LEFT_EYE].x * w)
            l_eye_y = int(lm.landmark[lmPose.LEFT_EYE].y * h)
            r_eye_x = int(lm.landmark[lmPose.RIGHT_EYE].x * w)
            r_eye_y = int(lm.landmark[lmPose.RIGHT_EYE].y * h)
    
        
            try: 
                if len( self.screens_list) > 1:
                    for i in range(len(self.screens_list)): 
                        cords = self.screens_list[i][0]
                        height=cords[3]-cords[1]
                        eye_screen_distance = self.findDistance(l_eye_x, l_eye_y, cords[0], cords[1]+height/2)
                        self.screens_list[i].append(eye_screen_distance)
                    self.screens_list.sort(key=lambda x: x[4])
                else:
                    cords = self.screens_list[0][0]
                    class_id = self.screens_list[0][1]
                    conf = self.screens_list[0][2]
                    label = self.screens_list[0][3]
                    height=cords[3]-cords[1]
                    start_point = (int(cords[0]), int(cords[1]))
                    
                    cv2.line(image, (l_eye_x, l_eye_y), (int(cords[0]), int(cords[1]+height/2)), red, 2)
                    eye_screen_distance = self.findDistance(l_eye_x, l_eye_y, cords[0], cords[1]+height/2)

                    scale = height/23 #assume 23cm actual height 
                    eye_screen_distance = int(eye_screen_distance/scale)
                    cv2.putText(image, f'eye to screen distance: {eye_screen_distance}', (w - 800, 300) ,font, 0.9, green, 2)

                    current_time = datetime.now()
                    if (current_time - self.last_firebase_update_time).total_seconds() >= self.update_interval:
                        self.last_firebase_update_time = current_time
                        send_to_firebase(ref_E2S,{str(int(timestamp.timestamp() *1000)) : {
                                # Handle numerical fields
                                'Distance' :eye_screen_distance }})
                    #clear screen list
                    self.screens_list.removeAll()
                
            except Exception as e:
                print( e)


            
        
            # Calculate distance between left shoulder and right shoulder points.
            offset = self.findDistance(l_shldr_x, l_shldr_y, r_shldr_x, r_shldr_y)
            eye_offset = self.findDistance(l_eye_x, l_eye_y, r_eye_x, r_eye_y)
        
            # Assist to align the camera to point at the side view of the person.
            # Offset threshold 30 is based on results obtained from analysis over 100 samples.
            if offset < 100:
                cv2.putText(image, str(int(offset)) + ' Aligned', (w - 300, 30), font, 0.9, green, 2)
            else:
                cv2.putText(image, str(int(offset)) + ' Not Aligned', (w - 300, 30), font, 0.9, red, 2)

            if eye_offset < 50:
                cv2.putText(image, str(int(offset)) + ' Eyes Aligned', (w - 300, 100), font, 0.9, green, 2)
            else:
                cv2.putText(image, str(int(offset)) + ' Eyes Not Aligned', (w - 300, 100), font, 0.9, red, 2)
        
            # Calculate angles.
            # neck_inclination = self.findAngle(l_shldr_x, l_shldr_y, l_ear_x, l_ear_y)
            # torso_inclination = self.findAngle(l_hip_x, l_hip_y, l_shldr_x, l_shldr_y)
            # knee_inclination = self.findAngle(l_hip_x, l_hip_y, l_knee_x, l_knee_y)

            trunk_inclication = self.calculate_angle_2p( l_shldr_x, l_shldr_y,l_hip_x, l_hip_y)
            hip_angle = self.calculate_angle_3p(l_shldr_x, l_shldr_y, l_hip_x, l_hip_y, l_knee_x, l_knee_y)
            upper_arm_inclination = self.calculate_angle_2p(l_shldr_x, l_shldr_y, l_elbow_x, l_elbow_y)
            elbow_angle = self.calculate_angle_3p(l_shldr_x, l_shldr_y, l_elbow_x, l_elbow_y, l_wrist_x, l_wrist_y)
            neck_inclination = self.calculate_angle_2p(l_shldr_x, l_shldr_y, l_ear_x, l_ear_y)
            ear_shoulder_distance = self.findDistance(l_shldr_x, l_shldr_y, l_ear_x, l_ear_y)
            print('trunk inclination: ' , trunk_inclication)
            print('hip angle: ' , hip_angle)
            print('upper arm inclination: ' , upper_arm_inclination)
            print('elbow angle: ' , elbow_angle)
            print('neck inclination: ' , neck_inclination)
            print('ear shoulder distance: ' , ear_shoulder_distance)

            # Draw landmarks.
            cv2.circle(image, (l_shldr_x, l_shldr_y), 7, yellow, -1)
            cv2.circle(image, (l_ear_x, l_ear_y), 7, yellow, -1)
        
            # Let's take y - coordinate of P3 100px above x1,  for display elegance.
            # Although we are taking y = 0 while calculating angle between P1,P2,P3.
            cv2.circle(image, (l_shldr_x, l_shldr_y - 100), 7, yellow, -1)
            cv2.circle(image, (r_shldr_x, r_shldr_y), 7, pink, -1)
            cv2.circle(image, (l_hip_x, l_hip_y), 7, yellow, -1)
        
            # Similarly, here we are taking y - coordinate 100px above x1. Note that
            # you can take any value for y, not necessarily 100 or 200 pixels.
            cv2.circle(image, (l_hip_x, l_hip_y - 100), 7, yellow, -1)

            #elbow and wrist and knee
            cv2.circle(image, (l_elbow_x, l_elbow_y), 7, yellow, -1)
            cv2.circle(image, (l_wrist_x, l_wrist_y), 7, yellow, -1)
            cv2.circle(image, (l_knee_x, l_knee_y), 7, yellow, -1)


            #eye
            cv2.circle(image, (l_eye_x, l_eye_y), 7, yellow, -1)
            cv2.circle(image, (r_eye_x, r_eye_y), 7, yellow, -1)

            
            # Put text, Posture and angle inclination.
            # Text string for display.
            angle_text_string = 'Neck : ' + str(int(neck_inclination)) + '  Torso : ' + str(int(trunk_inclication))
            # stand_sit_string = 'Knee Angle ' + str(int(knee_inclination)) 
            stand_sit_string = 'Knee Angle ' + str(int(hip_angle)) 

            cv2.putText(image, stand_sit_string, (10, 100), font, 0.9, light_green, 2)
            if hip_angle > 150:
                position_category = 'standing'
                self.standing_frames += 1
            else:
                position_category = "sitting"
                self.sitting_frames += 1
            cv2.putText(image,"Standing : " + str(round(self.standing_frames*1/fps,1)) + "s", (10, 130), font, 0.9, green, 2)
            cv2.putText(image,"Sitting : " + str(round(self.sitting_frames*1/fps,1)) + "s", (int(w/3), 130), font, 0.9, light_green, 2)

            if position_category == "standing":
                cv2.putText(image, 'standing', (int(w/2), int(h/2)-100), font, 0.9, red, 2)
               
                self.current_standing_frames += 1
                if (1/fps) *self.current_standing_frames > 5:
                    # print("Please hold a fist to move the table up.")
                    # cv2.putText(image, 'Please hold a fist to move the table up.', (int(w/2), int(h/2)), font, 0.9, red, 2)
                    cv2.putText(image, 'table movnig up .', (int(w/2), int(h/2)), font, 0.9, red, 2)
               
                    # results = self.hands.process(image)

                    # print(results.multi_hand_landmarks)

                    # # Check for fist gesture in both hands (if both hands are detected)
                    # if results.multi_hand_landmarks:
                    #     for hand_landmarks in results.multi_hand_landmarks:
                        
                    #         if self.is_fist(hand_landmarks):
                    #             fist_detected = True
                    #             print('table move to position')
                    #             cv2.putText(image, 'table move to position.', (int(w/2), int(h/2)+100), font, 0.9, red, 2)
                    #             break   
            else:
                self.current_standing_frames =0

            # Determine whether good posture or bad posture.
            # The threshold angles have been set based on intuition.
            if neck_inclination < 5 and neck_inclination > -10 and trunk_inclication < 10 and trunk_inclication > 0:  #torso_inclination < 5:
                posture_category = 'perfect'
                self.perfect_pos_frames += 1
                self.prolong_bad = 0

                cv2.putText(image, angle_text_string, (10, 30), font, 0.7, blue, 2)
                cv2.putText(image, str(int(neck_inclination)), (l_shldr_x + 10, l_shldr_y), font, 0.7, blue, 2)
                cv2.putText(image, str(int(trunk_inclication)), (l_hip_x + 10, l_hip_y), font, 0.7, blue, 2)
        
                # Join landmarks.
                cv2.line(image, (l_shldr_x, l_shldr_y), (l_ear_x, l_ear_y), blue, 4)
                cv2.line(image, (l_shldr_x, l_shldr_y), (l_shldr_x, l_shldr_y - 100), blue, 4)
                cv2.line(image, (l_hip_x, l_hip_y), (l_shldr_x, l_shldr_y), blue, 4)
                cv2.line(image, (l_hip_x, l_hip_y), (l_hip_x, l_hip_y - 100), blue, 4)
                cv2.line(image, (l_elbow_x, l_elbow_y), (l_shldr_x, l_shldr_y), blue, 4)
                cv2.line(image, (l_elbow_x, l_elbow_y), (l_wrist_x, l_wrist_y), blue, 4)
                cv2.line(image, (l_hip_x, l_hip_y), (l_knee_x, l_knee_y), blue, 4)
        
            
            
            elif  neck_inclination < 10 and neck_inclination > -20 and trunk_inclication < 30 and trunk_inclication > -5:
                posture_category = 'good'
                self.good_pos_frames += 1
                self.prolong_bad = 0
        
                cv2.putText(image, angle_text_string, (10, 30), font, 0.7, light_green, 2)
                cv2.putText(image, str(int(neck_inclination)), (l_shldr_x + 10, l_shldr_y), font, 0.7, light_green, 2)
                cv2.putText(image, str(int(trunk_inclication)), (l_hip_x + 10, l_hip_y), font, 0.7, light_green, 2)
        
                # Join landmarks.
                cv2.line(image, (l_shldr_x, l_shldr_y), (l_ear_x, l_ear_y), green, 4)
                cv2.line(image, (l_shldr_x, l_shldr_y), (l_shldr_x, l_shldr_y - 100), green, 4)
                cv2.line(image, (l_hip_x, l_hip_y), (l_shldr_x, l_shldr_y), green, 4)
                cv2.line(image, (l_hip_x, l_hip_y), (l_hip_x, l_hip_y - 100), green, 4)
                cv2.line(image, (l_elbow_x, l_elbow_y), (l_shldr_x, l_shldr_y), green, 4)
                cv2.line(image, (l_elbow_x, l_elbow_y), (l_wrist_x, l_wrist_y), green, 4)
                cv2.line(image, (l_hip_x, l_hip_y), (l_knee_x, l_knee_y), green, 4)
        
            else:
                posture_category = 'bad'
                self.bad_pos_frames  += 1
                self.prolong_bad += 1
        
                cv2.putText(image, angle_text_string, (10, 30), font, 0.9, red, 2)
                cv2.putText(image, str(int(neck_inclination)), (l_shldr_x + 10, l_shldr_y), font, 0.9, red, 2)
                cv2.putText(image, str(int(trunk_inclication)), (l_hip_x + 10, l_hip_y), font, 0.9, red, 2)
        
                # Join landmarks.
                cv2.line(image, (l_shldr_x, l_shldr_y), (l_ear_x, l_ear_y), red, 4)
                cv2.line(image, (l_shldr_x, l_shldr_y), (l_shldr_x, l_shldr_y - 100), red, 4)
                cv2.line(image, (l_hip_x, l_hip_y), (l_shldr_x, l_shldr_y), red, 4)
                cv2.line(image, (l_hip_x, l_hip_y), (l_hip_x, l_hip_y - 100), red, 4)
                cv2.line(image, (l_elbow_x, l_elbow_y), (l_shldr_x, l_shldr_y), red, 4)
                cv2.line(image, (l_elbow_x, l_elbow_y), (l_wrist_x, l_wrist_y), red, 4)
                cv2.line(image, (l_hip_x, l_hip_y), (l_knee_x, l_knee_y), red, 4)


            if ear_shoulder_distance < 100: #shrug
                posture_category = 'bad'
                print('shrug')
        
        
            # Calculate the time of remaining in a particular posture.
            perfect_time = (1/fps) * self.perfect_pos_frames
            good_time = (1 / fps) * self.good_pos_frames
            bad_time =  (1 / fps) * self.bad_pos_frames 
            prolong_bad_time = (1 / fps) * self.prolong_bad

            time_string = 'Total Time : ' + str(round(self.total_frames *1/fps, 1)) + 's'
            cv2.putText(image, time_string, (10, h - 100), font, 0.9, dark_blue, 2)
           
            correction_string = 'Correction Count : ' + str(len(self.correction)) 
            cv2.putText(image, correction_string, (int(w/3), h - 100), font, 0.9, yellow , 2)
            # Pose time.
            bad_count_string = 'Prolong Bad Time : ' + str(round(prolong_bad_time,1)) + 's'
            cv2.putText(image, bad_count_string, (int(2*w/3), h - 100), font, 0.9, yellow, 2)
            # Pose time.
            time_string_perfect = 'Perfect Posture Time : ' + str(round(perfect_time, 1)) + 's'
            cv2.putText(image, time_string_perfect, (10, h - 20), font, 0.9, blue, 2)
            # if self.good_pos_frames > 0:
            time_string_good = 'Good Posture Time : ' + str(round(good_time, 1)) + 's'
            cv2.putText(image, time_string_good, ( int(w/3), h - 20), font, 0.9, green, 2)
            # else:
            time_string_bad = 'Bad Posture Time : ' + str(round(bad_time, 1)) + 's'
            cv2.putText(image, time_string_bad, (int(2*w/3), h - 20), font, 0.9, red, 2)

            # If you stay in bad posture for more than 3 minutes (180s) send an alert.
            if prolong_bad_time > 5 : # 5 seconds
                correction_type = self.sendWarning()
                self.prolong_bad =0
                try:
                    self.data_points['CorrectionTimestamp'].append(timestamp)
                    self.data_points['CorrectionType'].append(correction_type)
                    data = {str(int(timestamp.timestamp() *1000)) : {
                        # Handle numerical fields
                        'CorrectionType' :correction_type }
                    }
                    send_to_firebase(ref_corr, data)
                    # query = "INSERT INTO CorrectionHistory (Timestamp, CorrectionType) VALUES (%s, %s)"
                    # cursor.execute(query, (timestamp, correction_type))
                    # connection.commit()
                except Exception as e:
                    print(e)
            
            try:
                self.data_points['Timestamp'].append(timestamp)
                self.data_points['PostureCategory'].append(posture_category)
                self.data_points['PositionCategory'].append(position_category)
                self.data_points['NeckInclination'].append(neck_inclination)
                self.data_points['TorseInclination'].append(trunk_inclication)
                self.data_points['KneeInclination'].append(trunk_inclication)
                # query = "INSERT INTO PostureData (Timestamp, PostureCategory, PositionCategory, NeckInclination, TorseInclination, KneeInclination) VALUES (%s, %s, %s, %s, %s, %s)"
                # cursor.execute(query, (timestamp, posture_category,position_category,neck_inclination,torso_inclination,knee_inclination))
                # connection.commit()
            except Exception as e:
                print(e)
            # Write frames.
            
        except Exception as e:
            print(e)
            pass


        return image

    

post = Posture()

def send_to_firebase(ref,data):
    print(ref, data)
    ref.update(data)
    pass


def calculate_average(data_points):
    averaged_data = {str(int(data_points['Timestamp'][-1].timestamp() *1000)) if data_points['Timestamp'] else None : {
    # Handle numerical fields
    'NeckInclination' : mean(data_points['NeckInclination']) if data_points['NeckInclination'] else None,
    'TorsoInclination' : mean(data_points['TorseInclination']) if data_points['TorseInclination'] else None,
    'KneeInclination' : mean(data_points['KneeInclination']) if data_points['KneeInclination'] else None,

    # Handle categorical fields
    'PostureQuality' : mode(data_points['PostureCategory']) if data_points['PostureCategory'] else None,
    'PostureMode': mode(data_points['PositionCategory']) if data_points['PositionCategory'] else None,
    }}
    return averaged_data

# Store data points here


def average_and_send():
    averaged_data = calculate_average(post.data_points)
    send_to_firebase(ref,averaged_data)
    print(averaged_data)
    post.data_points.clear()
    # Reset the timer
    timer = Timer(10, average_and_send)
    timer.start()
timer = Timer(10, average_and_send)
timer.start()

while post.cap.isOpened():
    # Capture frames.

    image = post.read()
    # Write frames.
    cv2.imshow('Webcam', image)
    
    # video_output.write(image)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        timer.cancel()
        ref_session.update({str(int(post.start_time.timestamp()*1000)):str(int(datetime.now().timestamp()*1000))})
        # cursor.close()
        # connection.close()
        break
print('Finished.')
# cap.release()
# video_output.release()

post.cap.release()
cv2.destroyAllWindows()