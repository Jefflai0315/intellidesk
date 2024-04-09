import math as m
import cv2
import mediapipe as mp
from datetime import datetime
from ultralytics import YOLO
# from yolov5 import YOLOv5
import cv2
import firebase_admin
from firebase_admin import credentials
from firebase_admin import db
from firebase_admin import initialize_app, storage
from collections import defaultdict
from threading import Timer
from statistics import mean, mode
import numpy as np
from detection import ObjectDetection
import time
from identity import FaceRecognition
from setup_profile import FaceSetUp
import os


# Initialize Firebase


def initialize_firebase():
    cred = credentials.Certificate("intellidesk-174c9-firebase-adminsdk-garkf-abe9a9fb75.json")
    firebase_admin.initialize_app(cred, {
        'databaseURL' : "https://intellidesk-174c9-default-rtdb.asia-southeast1.firebasedatabase.app/",
        'storageBucket': 'intellidesk-174c9.appspot.com',
                              })
    return db.reference()

class PostureAnalyzer:    
    def __init__(self, firebase_refs):
        self.firebase_refs = firebase_refs
        # print('firebase_refs', self.firebase_refs)
        self.user = firebase_refs.child('Controls/UserTable/').get()
        self.start_time = datetime.now().timestamp()*1000
        self.firebase_refs.child(f'{self.user}/Session/').update({str(int(self.start_time)):str(int(datetime.now().timestamp()*1000))})
        self.standing_frames = 0
        self.current_standing_frames =0
        self.sitting_frames = 0 
        self.good_pos_frames = 0 
        self.bad_pos_frames = 0
        self.perfect_pos_frames = 0
        self.prolong_bad = 0
        self.total_frames = 0
        self.correction = []
        # self.cap = cv2.VideoCapture(0)
        self.screens_list=[]
        self.faceRecognition =  FaceRecognition(similarity_threshold = 0.35, firebase_refs= firebase_refs)
        self.face_recognition = FaceSetUp(similarity_threshold = 0.40, firebase_refs= firebase_refs)

        self.mp_pose = mp.solutions.pose
        self.pose = self.mp_pose.Pose()
        self.mp_hands = mp.solutions.hands
        self.hands = self.mp_hands.Hands()
        # self.model = YOLO("yolov3-tiny.pt")
        self.model = ObjectDetection()
        # self.model = YOLOv5('yolov3-tiny.pt')
        self.data_points = defaultdict(list)

        self.last_firebase_update_time = datetime.now().timestamp()*1000  # Initialize the last update time
        self.last_identity_update_time = datetime.now().timestamp()*1000 
        self.update_interval = 20000

    # def capture_images(self,output_dir, num_images, interval):
    #     # Create the output directory if it doesn't exist
    #     if not os.path.exists(output_dir):
    #         os.makedirs(output_dir)


    #     # Capture images
    #     for i in range(num_images):
    #         # Wait for the specified interval
    #         time.sleep(interval)

    #         # Capture frame from the camera
    #         ret, frame = self.cap.read()

    #         # Save the captured frame as an image
    #         image_path = os.path.join(output_dir, f"{i+1:03d}.jpg")
    #         cv2.imwrite(image_path, frame)
    #         cv2.imshow('frame', frame)
    #         print(f"Saved image: {image_path}")

    def findDistance(self,x1, y1, x2, y2):
        dist = m.sqrt((x2-x1)**2+(y2-y1)**2)
        return dist


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

        return angle_degrees
    
    def reset_nudge(self):
        self.send_to_firebase('Controls',{'PostureNudge': 0})


    def sendWarning(self, ind):
        self.correction.append(datetime.now().timestamp()*1000)
        self.send_to_firebase('Controls',{'PostureNudge': ind})
        timer = Timer(10, self.reset_nudge)
        timer.start()
        return f'warning_{ind}'
    
    
    def send_to_firebase(self, ref,data):
        if ref == 'Controls':
            self.firebase_refs.child(f'{ref}/').update(data)
            print('nudge value', self.firebase_refs.child(f'{ref}/PostureNudge/').get())
            
        else:
            self.firebase_refs.child(f'{self.user}/{ref}/').update(data)
        # ref.update(data)
        pass


    def calculate_average(self, data_points):
        averaged_data = {str(int(data_points['Timestamp'][-1])) if data_points['Timestamp'] else None : {
        # Handle numerical fields
        'NeckInclination' : mean(data_points['NeckInclination']) if data_points['NeckInclination'] else None,
        'TrunkInclination' : mean(data_points['TrunkInclination']) if data_points['TrunkInclination'] else None,
        'HipAngle' : mean(data_points['HipAngle']) if data_points['HipAngle'] else None,
        'UpperArmInclination' : mean(data_points['UpperArmInclination']) if data_points['UpperArmInclination'] else None,
        'ElbowAngle': mean(data_points['ElbowAngle']) if data_points['ElbowAngle'] else None,
        'EarShoulderDistance': mean(data_points['EarShoulderDistance']) if data_points['EarShoulderDistance'] else None,
        'KneeAngle': mean(data_points['KneeAngle']) if data_points['KneeAngle'] else None,
        'TrunkAngle': mean(data_points['TrunkAngle']) if data_points['TrunkAngle'] else None,
        'FeetAngle': mean(data_points['FeetAngle']) if data_points['FeetAngle'] else None,

        # Handle categorical fields
        'PostureQuality' : mode(data_points['PostureCategory']) if data_points['PostureCategory'] else None,
        'PostureMode': mode(data_points['PositionCategory']) if data_points['PositionCategory'] else None,
        }}
        return averaged_data



    def average_and_send(self):
        averaged_data = self.calculate_average(self.data_points)
        self.user = firebase_refs.child('Controls/UserTable/').get()
        try:
            self.send_to_firebase('Posture',averaged_data)
            print(averaged_data)
            print('send_to_firebase')
        except Exception as e:
            # print("No data captured, as cant detect side profile: " + averaged_data)
            # print(e)
            pass
        self.data_points.clear()
        # Reset the timer
        timer = Timer(12, self.average_and_send)
        timer.start()

    def run(self):
        timer = Timer(12, self.average_and_send)
        timer.start()
        last_time = time.time()
        while True:
            # cur_time = datetime.now().timestamp()*1000
            current_time = time.time()
            PostureCamera = self.firebase_refs.child('Controls/PostureCamera').get()
            BiometricRecroding = firebase_refs.child('Controls/BiometricRecording').get()
            if  BiometricRecroding == 1:
                # self.firebase_refs.child('Controls/').update({"PostureCamera":0}) # off the posture camera so we can use the camera for biometric recording
                # num_images = 5
                # interval = 3  # seconds
                img_dir = "SetUpImages"

                # self.capture_images(img_dir, num_images, interval)
                # img_path = '/Users/jefflai/intellidesk-screen/test.jpg'
                while BiometricRecroding != 3: 
                    time.sleep(2)
                    BiometricRecroding = firebase_refs.child('Controls/BiometricRecording').get()
                print('Biometric Recroding Done')
                #List all blobs (files) in the specified folder
                bucket = storage.bucket()
                blobs = bucket.list_blobs(prefix=img_dir)
                print(blobs)

                # Download each blob (image) to local machine
                for blob in blobs:
                    # Extract the file name from the blob's name
                    file_name = os.path.basename(blob.name)
                    # Define the local file path to save the downloaded image
                    local_file_path = f"{img_dir}/{file_name}"  # Local path to save the downloaded image
                    # Download the blob to the local file path
                    blob.download_to_filename(local_file_path)
                    print(f"Image downloaded from Firebase Storage and saved to: {local_file_path}")

                input_name = self.firebase_refs.child('Controls/InputName').get()
                if input_name != "":
                    self.face_recognition.add_face_embeddings(img_dir, input_name) # need to add input name , when user key in name from the app 
                firebase_refs.child('Controls/').update({"BiometricRecording":2})

            elif PostureCamera == 1:
                # success, image = self.cap.read()
                # cv2.imwrite("./static/images/identity.jpg", image)
                # img_path = "./static/images/identity.jpg"
                #gs://intellidesk-174c9.appspot.com/SetUpImages/images3.jpg
                time.sleep(3)
                remote_img_path = "/home/pi/image.jpg"  
                img_path = "home/pi/image.jpg"  # Local path to save the retrieved image
                bucket = storage.bucket()
                blob = bucket.blob(remote_img_path)
                blob.download_to_filename(img_path)


                if not os.path.exists(img_path):
                    print("Null.Frames")
                    # self.cap.release()
                    break
                else: 
                    result_img, identity = self.faceRecognition.identify_persons(img_path)
                    #update identity
                    if identity == "Unknown":
                        self.firebase_refs.child(f'Controls/').update({'PostureNudge': 4})
                    self.firebase_refs.child(f'Controls/').update({'UserTable': identity})
                    self.firebase_refs.child("Controls/").update({'DetectUser': 0})
                    self.firebase_refs.child("Controls/").update({'PostureCamera': 2})
                print("identity: " , identity)
                cv2.imshow('Webcam', result_img)
                time.sleep(2)

            elif PostureCamera == 2:
                if self.start_time == None:
                    self.user = self.firebase_refs.child('Controls/UserTable/').get()
                    self.start_time = datetime.now().timestamp()*1000
                    self.firebase_refs.child(f'{self.user}/Session/').update({str(int(self.start_time)):str(int(datetime.now().timestamp()*1000))})
        
                # if current_time - last_time >= 0.1:  # 2-second interval has passed
                #     # Capture and process frame
                #     last_time = current_time
                # Capture frames.
                image = self.read()
                # Write frames.
                cv2.imshow('Webcam', image)
            elif PostureCamera == 0:
                # print('PostureCamera is off')
                if self.start_time != None:
                    print('PostureCamera is off')
                    self.firebase_refs.child(f'{self.user}/Session/').update({str(int(self.start_time)):str(int(datetime.now().timestamp()*1000))})
                self.start_time = None
            


            if cv2.waitKey(1) & 0xFF == ord('q'):
                 break
        print('Finished.')
        # self.cap.release()
        cv2.destroyAllWindows()
    


    
    def read(self):
        self.total_frames += 1
        timestamp = datetime.now().timestamp()*1000
        posture_category = None
        position_category = None

         # Colors.
        blue = (255, 127, 0)
        red = (50, 50, 255)
        green = (127, 255, 0)
        light_green = (127, 233, 100)
        yellow = (0, 255, 255)
        pink = (255, 0, 255)

        # Font type.
        font = cv2.FONT_HERSHEY_SIMPLEX

        # success, image = self.cap.read()

        img_path = "home/pi/image.jpg"  # Local path to save the retrieved image
        bucket = storage.bucket()
        blob = bucket.blob("/home/pi/image.jpg")
        blob.download_to_filename(img_path)


        if not os.path.exists(img_path):
            print("Null.Frames")
            # self.cap.release()
            return
        # if not success:
        #     print("Null.Frames")
        #     return self.cap.release()
        image  = cv2.imread(img_path)
        
        # Get fps.
        # fps = self.cap.get(cv2.CAP_PROP_FPS)
        # Get height and width.
        h, w = image.shape[:2]

        # save image to path = 'intellidesk/static/images'
        cv2.imwrite('static/images/frame.jpg', image)

        # isolate user/person 
        # detect if there is a screen
        try: 
            #check duration 
            time_now = datetime.now()
            # results = self.model.predict(image) #yolo model
            results, lm , lmPose, largest_person_cords, _= self.model.detect('static/images/frame.jpg', 0)

            for i in range(len(results)):
                cords = results[i][0]
                class_id = results[i][1]
                conf = results[i][2]
                label = results[i][3]
                # Draw rectangle (bounding box)
                start_point = (int(cords[0]), int(cords[1]))
                end_point = (int(cords[2]), int(cords[3]))
                color = (255, 0, 0)  # Color of the rectangle (in BGR)
                thickness = 2       # Thickness of the rectangle border
                cv2.rectangle(image, start_point, end_point, color, thickness)
                # Put label near the top left corner of the rectangle
                font = cv2.FONT_HERSHEY_SIMPLEX
                font_scale = 3
                font_color = (255, 0,0)
                font_thickness = 3
                cv2.putText(image, f'{label} {conf:.2f}', (int(cords[0]), int(cords[1]-10)), font, font_scale, font_color, font_thickness)
            self.screens_list = results
        
            if largest_person_cords:
                # Ensure the coordinates are within the image boundaries
                x_min, y_min, x_max, y_max = [max(0, int(coord)) for coord in largest_person_cords]
                # draw box on the image 
                cv2.rectangle(image, (x_min, y_min), (x_max, y_max), (0, 255, 0), 2)


        except Exception as e:
            print(e)

        # Acquire the landmark coordinates.
        # Once aligned properly, left or right should not be a concern.      
        
        try:
            #check duration 
            time_now = datetime.now()
            # Left shoulder.
            l_shldr_x = int(lm.landmark[lmPose.LEFT_SHOULDER].x * w)
            l_shldr_y = int(lm.landmark[lmPose.LEFT_SHOULDER].y * h)
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
            # Eyes.
            l_eye_x = int(lm.landmark[lmPose.LEFT_EYE].x * w)
            l_eye_y = int(lm.landmark[lmPose.LEFT_EYE].y * h)
            r_eye_x = int(lm.landmark[lmPose.RIGHT_EYE].x * w)
            r_eye_y = int(lm.landmark[lmPose.RIGHT_EYE].y * h)
            # Left ankle.
            l_ankle_x = int(lm.landmark[lmPose.LEFT_ANKLE].x * w)
            l_ankle_y = int(lm.landmark[lmPose.LEFT_ANKLE].y * h)
            # Left heel.
            l_heel_x = int(lm.landmark[lmPose.LEFT_HEEL].x * w)
            l_heel_y = int(lm.landmark[lmPose.LEFT_HEEL].y * h)
            # Left foot index. 
            l_foot_index_x = int(lm.landmark[lmPose.LEFT_FOOT_INDEX].x * w)
            l_foot_index_y = int(lm.landmark[lmPose.LEFT_FOOT_INDEX].y * h)


            # Calculate distance between left shoulder and right shoulder points.
            offset = self.findDistance(l_shldr_x, l_shldr_y, r_shldr_x, r_shldr_y)
            eye_offset = self.findDistance(l_eye_x, l_eye_y, r_eye_x, r_eye_y)
        
            # Assist to align the camera to point at the side view of the person.
            if offset < 300:
                cv2.putText(image, str(int(offset)) + ' Aligned', (w - 300, 30), font, 0.9, green, 2)
            else:
                cv2.putText(image, str(int(offset)) + ' Not Aligned', (w - 300, 30), font, 0.9, red, 2)
                return image

            if eye_offset < 50:
                cv2.putText(image, str(int(eye_offset)) + ' Eyes Aligned', (w - 300, 100), font, 0.9, green, 2)
            else:
                cv2.putText(image, str(int(eye_offset)) + ' Eyes Not Aligned', (w - 300, 100), font, 0.9, red, 2)
    
            # Measure screen distance
            if len(self.screens_list) == 0:
                pass
            else:
                #  detect the closest screen to user
                for i in range(len(self.screens_list)): 
                    cords = self.screens_list[i][0]
                    height=cords[3]-cords[1]
                    eye_screen_distance = self.findDistance(l_eye_x, l_eye_y, cords[0], cords[1]+height/2)
                    self.screens_list[i].append(eye_screen_distance)
                self.screens_list.sort(key=lambda x: x[4]) 
                cords = self.screens_list[0][0]
                class_id = self.screens_list[0][1]
                conf = self.screens_list[0][2]
                label = self.screens_list[0][3]
                eye_screen_distance = self.screens_list[0][4]
                height=cords[3]-cords[1]
                start_point = (int(cords[0]), int(cords[1]))
                
                #draw line on image
                cv2.line(image, (l_eye_x, l_eye_y), (int(cords[0]), int(cords[1]+height/2)), red, 2)

                scale = height/23 #assume 23cm actual height of laptop
                eye_screen_distance = int(eye_screen_distance/scale)
                cv2.putText(image, f'eye to screen distance: {eye_screen_distance}', (w - 800, 300) ,font, 0.9, green, 2)
                

                eye_screen_angle = 90-abs(self.calculate_angle_2p(l_eye_x, l_eye_y, cords[0], cords[1]+height/2))
                print(eye_screen_angle)
                self.send_to_firebase('EyeScreenDistance',{str(int(timestamp)) : {
                            # Handle numerical fields
                            'Distance' :eye_screen_distance, 
                            'Angle' :eye_screen_angle}})
                if eye_screen_distance < 50: 
                    self.sendWarning(2)
                #clear screen list
                if len(self.screens_list) >0:
                    self.screens_list = []


            trunk_inclication = self.calculate_angle_2p( l_shldr_x, l_shldr_y,l_hip_x, l_hip_y)
            hip_angle = self.calculate_angle_3p(l_shldr_x, l_shldr_y, l_hip_x, l_hip_y, l_knee_x, l_knee_y)
            upper_arm_inclination = self.calculate_angle_2p(l_shldr_x, l_shldr_y, l_elbow_x, l_elbow_y)
            elbow_angle = self.calculate_angle_3p(l_shldr_x, l_shldr_y, l_elbow_x, l_elbow_y, l_wrist_x, l_wrist_y)
            neck_inclination = self.calculate_angle_2p(l_shldr_x, l_shldr_y, l_ear_x, l_ear_y)
            ear_shoulder_distance = self.findDistance(l_shldr_x, l_shldr_y, l_ear_x, l_ear_y)
            knee_angle = self.calculate_angle_3p(l_hip_x,l_hip_y,l_knee_x,l_knee_y,l_ankle_x,l_ankle_y)
            trunk_angle = self.calculate_angle_3p(l_ear_x,l_ear_y,l_shldr_x,l_shldr_y,l_hip_x,l_hip_y)
            feet_angle = self.calculate_angle_3p(l_knee_x,l_knee_y,l_heel_x,l_heel_y,l_foot_index_x,l_foot_index_y)
            # print('trunk inclination: ' , trunk_inclication)
            # print('hip angle: ' , hip_angle)
            # print('upper arm inclination: ' , upper_arm_inclination)
            # print('elbow angle: ' , elbow_angle)
            # print('neck inclination: ' , neck_inclination)
            # print('ear shoulder distance: ' , ear_shoulder_distance)
            # print('knee angle: ' , knee_angle)
            # print('trunk angle: ' , trunk_angle)
            # print('feet angle: ' , feet_angle)

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

            # ankle, heel, foot index
            cv2.circle(image, (l_ankle_x, l_ankle_y), 7, yellow, -1)
            cv2.circle(image, (l_heel_x, l_heel_y), 7, yellow, -1)
            cv2.circle(image, (l_foot_index_x, l_foot_index_y), 7, yellow, -1)


            #eye
            cv2.circle(image, (l_eye_x, l_eye_y), 7, yellow, -1)
            cv2.circle(image, (r_eye_x, r_eye_y), 7, yellow, -1)

            
            # Put text, Posture and angle inclination.
            # Text string for display.
            angle_text_string = 'Neck : ' + str(int(neck_inclination)) + '  Trunk : ' + str(int(trunk_inclication))
            # stand_sit_string = 'Knee Angle ' + str(int(knee_inclination)) 
            stand_sit_string = 'Hip Angle ' + str(int(hip_angle)) 

            cv2.putText(image, stand_sit_string, (10, 100), font, 0.9, light_green, 2)
            print('hipangle', hip_angle)
            if hip_angle < 70:
                position_category = 'standing'
                self.standing_frames += 1
            else:
                position_category = "sitting"
                self.sitting_frames += 1

            # Determine whether good posture or bad posture.
            # The threshold angles have been set based on intuition.
            if (neck_inclination < 5 and neck_inclination > -20
            and trunk_inclication < 10 and trunk_inclication > 0
            and upper_arm_inclination < 40 and upper_arm_inclination >-10
            # and knee_angle >80 and knee_angle < 100
            ): 
                posture_category = 'perfect'
                self.perfect_pos_frames += 1
                self.prolong_bad = 0
                color = blue

            elif  (neck_inclination < 5 and neck_inclination > -35 
                and trunk_inclication < 30 and trunk_inclication > -5
                #    and upper_arm_inclination < 40 and upper_arm_inclination >-10
                #    and  knee_angle > 70 and knee_angle < 110
                ):
                posture_category = 'good'
                self.good_pos_frames += 1
                self.prolong_bad = 0
                color = green
        
            else:
                posture_category = 'bad'
                self.bad_pos_frames  += 1
                self.prolong_bad += 1
                color = red


            cv2.putText(image, angle_text_string, (10, 30), font, 0.7, color, 2)
            cv2.putText(image, str(int(neck_inclination)), (l_shldr_x + 10, l_shldr_y), font, 0.7, color, 2)
            cv2.putText(image, str(int(trunk_inclication)), (l_hip_x + 10, l_hip_y), font, 0.7, color, 2)
    
            # Join landmarks.
            cv2.line(image, (l_shldr_x, l_shldr_y), (l_ear_x, l_ear_y), color, 4)
            cv2.line(image, (l_shldr_x, l_shldr_y), (l_shldr_x, l_shldr_y - 100), color, 4)
            cv2.line(image, (l_hip_x, l_hip_y), (l_shldr_x, l_shldr_y), color, 4)
            cv2.line(image, (l_hip_x, l_hip_y), (l_hip_x, l_hip_y - 100), color, 4)
            cv2.line(image, (l_elbow_x, l_elbow_y), (l_shldr_x, l_shldr_y), color, 4)
            cv2.line(image, (l_elbow_x, l_elbow_y), (l_wrist_x, l_wrist_y), color, 4)
            cv2.line(image, (l_hip_x, l_hip_y), (l_knee_x, l_knee_y), color, 4)
            cv2.line(image, (l_knee_x, l_knee_y), (l_ankle_x, l_ankle_y), color, 4)
            cv2.line(image, (l_ankle_x, l_ankle_y), (l_heel_x, l_heel_y), color, 4)
            cv2.line(image, (l_ankle_x, l_ankle_y), (l_foot_index_x, l_foot_index_y), color, 4)
        



            # if ear_shoulder_distance < 70: #shrug
            #     posture_category = 'bad'
            #     print('shrug')
        
        
            # Calculate the time of remaining in a particular posture.
            # perfect_time = (1/fps) * self.perfect_pos_frames
            # good_time = (1 / fps) * self.good_pos_frames
            # bad_time =  (1 / fps) * self.bad_pos_frames 

            # time_string = 'Total Time : ' + str(round(self.total_frames *1, 1)) + 's'
            # cv2.putText(image, time_string, (10, h - 100), font, 0.9, dark_blue, 2)
            cv2.putText(image, posture_category, (10, h - 100), font, 0.9, yellow, 2)
            cv2.putText(image, position_category, (10, h - 200), font, 0.9, yellow, 2)


            # If you stay in bad posture for more than 3 minutes (180s) send an alert.
            time_string_bad = ' Prolong Bad Posture count : ' + str(self.prolong_bad) 
            cv2.putText(image, time_string_bad, (int(2*w/3), h - 20), font, 0.9, red, 2)
            if self.prolong_bad > 5: # 5 bad counts
                correction_type = self.sendWarning(1)
            
                self.prolong_bad =0
                try:
                    print('updating corection')
                    self.data_points['CorrectionTimestamp'].append(timestamp)
                    self.data_points['CorrectionType'].append(correction_type)
                    data = {str(int(timestamp)) : {
                        # Handle numerical fields
                        'CorrectionType' :correction_type }
                    }
                    self.send_to_firebase('Correction', data)
                    print('updated corection')
                    # query = "INSERT INTO CorrectionHistory (Timestamp, CorrectionType) VALUES (%s, %s)"
                    # cursor.execute(query, (timestamp, correction_type))
                    # connection.commit()
                except Exception as e:
                    print('errorr')
                    print(e)
            
            try:
                self.data_points['Timestamp'].append(timestamp)
                self.data_points['PostureCategory'].append(posture_category)
                self.data_points['PositionCategory'].append(position_category)
                self.data_points['NeckInclination'].append(neck_inclination)
                self.data_points['TrunkInclination'].append(trunk_inclication)
                self.data_points['HipAngle'].append(hip_angle)
                self.data_points['UpperArmInclination'].append(upper_arm_inclination)
                self.data_points['ElbowAngle'].append(elbow_angle)
                self.data_points['EarShoulderDistance'].append(ear_shoulder_distance)
                self.data_points['KneeAngle'].append(knee_angle)
                self.data_points['FeetAngle'].append(feet_angle)
                self.data_points['TrunkAngle'].append(trunk_angle)
            
            except Exception as e:
                print(e)
            print('time for lm : ' , datetime.now()-time_now)
            
        except Exception as e:
            print(e)
            pass


        return image

if __name__ == "__main__":    
    firebase_refs = initialize_firebase()
  
    post = PostureAnalyzer(firebase_refs)
    ## within run, have to constantly test if the person identity and update the self.user
    post.run()

    