# !pip install mediapipe-silicon
import time
import math as m
import cv2
import mediapipe as mp
import mysql.connector  # or import psycopg2 for PostgreSQL
from datetime import datetime
from ultralytics import YOLO
import cv2

# try:
#     connection = mysql.connector.connect(host='localhost',
#                                          database='test',
#                                          user='root',
#                                          password='Murukku!')
#     if connection.is_connected():
#         db_Info = connection.get_server_info()
#         print("Connected to MySQL Server version ", db_Info)
#         cursor = connection.cursor()
#         cursor.execute("select database();")
#         record = cursor.fetchone()
#         print("You're connected to database: ", record)

# except Exception as e:
#     print("Error while connecting to MySQL", e)
# finally:
#     if connection.is_connected():
#         # cursor.close()
#         # connection.close()
#         print("MySQL connection is connected")

class Posture:    

    def __init__(self,):
        self.start_time = time.time()
        self.total_time = self.get_total_time()
        self.standing_frames = 0
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

        self.mp_pose = mp.solutions.pose
        mp_holistic = mp.solutions.holistic
        self.pose = self.mp_pose.Pose()
        self.mp_face_mesh = mp.solutions.face_mesh
        self.face_mesh = self.mp_face_mesh.FaceMesh()
        self.mp_drawing = mp.solutions.drawing_utils
        self.mp_drawing_styles = mp.solutions.drawing_styles
        self.model = YOLO("yolov8m.pt")


    def get_total_time(self):
        return time.time() - self.start_time

    def findDistance(self,x1, y1, x2, y2):
        dist = m.sqrt((x2-x1)**2+(y2-y1)**2)
        return dist
    

    # Calculate angle.
    def findAngle(self,x1, y1, x2, y2):
        theta = m.acos((y2 -y1)*(-y1) / (m.sqrt((x2 - x1)**2 + (y2 - y1)**2) * y1))
        degree = int(180/m.pi)*theta
        return degree

    def sendWarning(self):
        self.correction.append(time.time())
        return 'bad posture'



    
    def read(self):
        self.total_frames += 1
        timestamp = datetime.now()
        posture_category = None
        position_category = None
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

        # Convert the BGR image to RGB.
        image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

        # Process the image.
        keypoints = self.pose.process(image)

        # Convert the image back to BGR.
        image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)

        # Use lm and lmPose as representative of the following methods.
        lm = keypoints.pose_landmarks
        lmPose = self.mp_pose.PoseLandmark


        # Acquire the landmark coordinates.
        # Once aligned properly, left or right should not be a concern.      
        # Left shoulder.
        try:
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
            l_eye_x = int(lm.landmark[lmPose.LEFT_EYE].x * w)
            l_eye_y = int(lm.landmark[lmPose.LEFT_EYE].y * h)
            r_eye_x = int(lm.landmark[lmPose.RIGHT_EYE].x * w)
            r_eye_y = int(lm.landmark[lmPose.RIGHT_EYE].y * h)

            torso_length = self.findDistance(l_shldr_x, l_shldr_y, l_hip_x, l_hip_y)
            
        
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
            neck_inclination = self.findAngle(l_shldr_x, l_shldr_y, l_ear_x, l_ear_y)
            torso_inclination = self.findAngle(l_hip_x, l_hip_y, l_shldr_x, l_shldr_y)
            knee_inclination = self.findAngle(l_hip_x, l_hip_y, l_knee_x, l_knee_y)
           
            # _inclination = findAngle(l_hip_x, l_hip_y, l_shldr_x, l_shldr_y)
        
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
            angle_text_string = 'Neck : ' + str(int(neck_inclination)) + '  Torso : ' + str(int(torso_inclination))
            stand_sit_string = 'Knee Angle ' + str(int(knee_inclination)) 


            cv2.putText(image, stand_sit_string, (10, 100), font, 0.9, light_green, 2)
            if knee_inclination > 150:
                position_category = 'standing'
                self.standing_frames += 1
            else:
                position_category = "sitting"
                self.sitting_frames += 1
            cv2.putText(image,"Standing : " + str(round(self.standing_frames*1/fps,1)) + "s", (10, 130), font, 0.9, green, 2)
            cv2.putText(image,"Sitting : " + str(round(self.sitting_frames*1/fps,1)) + "s", (int(w/3), 130), font, 0.9, light_green, 2)



            # Determine whether good posture or bad posture.
            # The threshold angles have been set based on intuition.
            if neck_inclination < 20 and torso_inclination < 5:
                posture_category = 'perfect'
                self.perfect_pos_frames += 1
                self.prolong_bad = 0

                cv2.putText(image, angle_text_string, (10, 30), font, 0.7, blue, 2)
                cv2.putText(image, str(int(neck_inclination)), (l_shldr_x + 10, l_shldr_y), font, 0.7, blue, 2)
                cv2.putText(image, str(int(torso_inclination)), (l_hip_x + 10, l_hip_y), font, 0.7, blue, 2)
        
                # Join landmarks.
                cv2.line(image, (l_shldr_x, l_shldr_y), (l_ear_x, l_ear_y), blue, 4)
                cv2.line(image, (l_shldr_x, l_shldr_y), (l_shldr_x, l_shldr_y - 100), blue, 4)
                cv2.line(image, (l_hip_x, l_hip_y), (l_shldr_x, l_shldr_y), blue, 4)
                cv2.line(image, (l_hip_x, l_hip_y), (l_hip_x, l_hip_y - 100), blue, 4)
                cv2.line(image, (l_elbow_x, l_elbow_y), (l_shldr_x, l_shldr_y), blue, 4)
                cv2.line(image, (l_elbow_x, l_elbow_y), (l_wrist_x, l_wrist_y), blue, 4)
                cv2.line(image, (l_hip_x, l_hip_y), (l_knee_x, l_knee_y), blue, 4)
        
            
            
            elif  neck_inclination < 40 and torso_inclination < 10:
                posture_category = 'good'
                self.good_pos_frames += 1
                self.prolong_bad = 0
        
                cv2.putText(image, angle_text_string, (10, 30), font, 0.7, light_green, 2)
                cv2.putText(image, str(int(neck_inclination)), (l_shldr_x + 10, l_shldr_y), font, 0.7, light_green, 2)
                cv2.putText(image, str(int(torso_inclination)), (l_hip_x + 10, l_hip_y), font, 0.7, light_green, 2)
        
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
                cv2.putText(image, str(int(torso_inclination)), (l_hip_x + 10, l_hip_y), font, 0.9, red, 2)
        
                # Join landmarks.
                cv2.line(image, (l_shldr_x, l_shldr_y), (l_ear_x, l_ear_y), red, 4)
                cv2.line(image, (l_shldr_x, l_shldr_y), (l_shldr_x, l_shldr_y - 100), red, 4)
                cv2.line(image, (l_hip_x, l_hip_y), (l_shldr_x, l_shldr_y), red, 4)
                cv2.line(image, (l_hip_x, l_hip_y), (l_hip_x, l_hip_y - 100), red, 4)
                cv2.line(image, (l_elbow_x, l_elbow_y), (l_shldr_x, l_shldr_y), red, 4)
                cv2.line(image, (l_elbow_x, l_elbow_y), (l_wrist_x, l_wrist_y), red, 4)
                cv2.line(image, (l_hip_x, l_hip_y), (l_knee_x, l_knee_y), red, 4)
        
        
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
                    query = "INSERT INTO CorrectionHistory (Timestamp, CorrectionType) VALUES (%s, %s)"
                    # cursor.execute(query, (timestamp, correction_type))
                    # connection.commit()
                except Exception as e:
                    print(e)
            
            try:
                query = "INSERT INTO PostureData (Timestamp, PostureCategory, PositionCategory, NeckInclination, TorseInclination, KneeInclination) VALUES (%s, %s, %s, %s, %s, %s)"
                # cursor.execute(query, (timestamp, posture_category,position_category,neck_inclination,torso_inclination,knee_inclination))
                # connection.commit()
            except Exception as e:
                print(e)
            # Write frames.
        except Exception as e:
            pass

        #detect laptop
        try: 
            results = self.model.predict(image)
            result = results[0]
            screens_list=[]
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
                    width = cords[3]-cords[1]
                    eye_screen_distance = self.findDistance(l_eye_x, l_eye_y, cords[0], cords[1]+width/2)
                    screens_list.append([cords,class_id,conf,label,eye_screen_distance])

                    # Put label near the top left corner of the rectangle
                    font = cv2.FONT_HERSHEY_SIMPLEX
                    font_scale = 5
                    font_color = (255, 0,0)  
                    font_thickness = 3
                    cv2.putText(image, f'{label} {conf:.2f}', (int(cords[0]), int(cords[1]-10)), font, font_scale, font_color, font_thickness)
                else:
                    pass

            if len(screens_list) > 0:
                screens_list.sort(key=lambda x: x[4])
                cords = screens_list[0][0]
                class_id = screens_list[0][1]
                conf = screens_list[0][2]
                label = screens_list[0][3]
                width=cords[3]-cords[1]
                start_point = (int(cords[0]), int(cords[1]))
                cv2.line(image, (l_eye_x, l_eye_y), (int(cords[0]), int(cords[1]+width/2)), red, 2)
                eye_screen_distance = self.findDistance(l_eye_x, l_eye_y, cords[0], cords[1]+width/2)
                print("torso length: ", torso_length)
                torso_scale = torso_length/50 #50cm
                eye_screen_distance = int(eye_screen_distance/torso_scale)
                cv2.putText(image, f'eye to screen distance: {eye_screen_distance}', (w - 800, 300) ,font, 0.9, green, 2)
            

        except Exception as e:
            print(e)

        


       


        return image

    

post = Posture()

while post.cap.isOpened():
    # Capture frames.

    image = post.read()
    # Write frames.
    cv2.imshow('Webcam', image)
    
    # video_output.write(image)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        # cursor.close()
        # connection.close()
        break
print('Finished.')
# cap.release()
# video_output.release()

post.cap.release()
cv2.destroyAllWindows()