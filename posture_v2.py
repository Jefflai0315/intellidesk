
import time
import math as m
import cv2
import mediapipe as mp
from datetime import datetime
from ultralytics import YOLO 
# Import your database connector library
# from your_database_library import your_database_connector

# Define constants for easier changes and readability
FPS_UPDATE_TIME = 1  # Update the FPS every second
DB_BATCH_SIZE = 30  # Number of frames to batch before a DB write
EYE_SCREEN_THRESHOLD = 0.7
ALIGNMENT_THRESHOLD = 100
EYES_ALIGNMENT_THRESHOLD = 50
BAD_POSTURE_THRESHOLD = 5  # Seconds


# Define your Posture class here
class Posture:
    def __init__(self):
        # Initialization code...
        self.mp_pose = mp.solutions.pose
        self.pose = self.mp_pose.Pose()
        self.mp_face_mesh = mp.solutions.face_mesh
        self.face_mesh = self.mp_face_mesh.FaceMesh()
        self.mp_drawing = mp.solutions.drawing_utils
        self.mp_drawing_styles = mp.solutions.drawing_styles
        self.model = YOLO("yolov8m.pt")
        self.cap = cv2.VideoCapture(0)

        # attributes for tracking additional statistics
        self.current_position = None
        self.current_position_start_time = None
        self.longest_sitting_duration = 0
        self.longest_standing_duration = 0
        self.current_posture = None
        self.current_posture_start_time = None
        self.total_bad_posture_duration = 0
        self.total_good_posture_duration = 0
        self.total_perfect_posture_duration = 0
        self.closest_eye_to_screen_distance = float('inf')
        self.current_eye_to_screen_distance = None

    def update_position(self, position):
        if self.current_position != position:
            if self.current_position_start_time is not None:
                duration = time.time() - self.current_position_start_time
                if self.current_position == 'sitting':
                    self.longest_sitting_duration = max(self.longest_sitting_duration, duration)
                elif self.current_position == 'standing':
                    self.longest_standing_duration = max(self.longest_standing_duration, duration)

            self.current_position = position
            self.current_position_start_time = time.time()

    def update_posture(self, posture):
        if self.current_posture != posture:
            if self.current_posture_start_time is not None:
                duration = time.time() - self.current_posture_start_time
                if self.current_posture == 'bad':
                    self.total_bad_posture_duration += duration
                elif self.current_posture == 'good':
                    self.total_good_posture_duration += duration
                elif self.current_posture == 'perfect':
                    self.total_perfect_posture_duration += duration

            self.current_posture = posture
            self.current_posture_start_time = time.time()

    def update_eye_screen_distance(self, distance):
        self.closest_eye_to_screen_distance = min(self.closest_eye_to_screen_distance, distance)
        self.current_eye_to_screen_distance = distance


    def read(self):
        # Read and process image frame...
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
        lmPose = self.mp_pose.PoseLandmar

        # Acquire the landmark coordinates.
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
            # Eyes
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
            self.update_position(position_category) # where position is 'sitting' or 'standing'
            self.update_posture(posture_category) # where posture is 'bad', 'good', or 'perfect'
            

            # time_string = 'Total Time : ' + str(round(self.total_frames *1/fps, 1)) + 's'
            # cv2.putText(image, time_string, (10, h - 100), font, 0.9, dark_blue, 2)
           
            # correction_string = 'Correction Count : ' + str(len(self.correction)) 
            # cv2.putText(image, correction_string, (int(w/3), h - 100), font, 0.9, yellow , 2)
            # # Pose time.
            # bad_count_string = 'Prolong Bad Time : ' + str(round(prolong_bad_time,1)) + 's'
            # cv2.putText(image, bad_count_string, (int(2*w/3), h - 100), font, 0.9, yellow, 2)
            # # Pose time.
            # time_string_perfect = 'Perfect Posture Time : ' + str(round(perfect_time, 1)) + 's'
            # cv2.putText(image, time_string_perfect, (10, h - 20), font, 0.9, blue, 2)
            # # if self.good_pos_frames > 0:
            # time_string_good = 'Good Posture Time : ' + str(round(good_time, 1)) + 's'
            # cv2.putText(image, time_string_good, ( int(w/3), h - 20), font, 0.9, green, 2)
            # # else:
            # time_string_bad = 'Bad Posture Time : ' + str(round(bad_time, 1)) + 's'
            # cv2.putText(image, time_string_bad, (int(2*w/3), h - 20), font, 0.9, red, 2)

            # If you stay in bad posture for more than 3 minutes (180s) send an alert.
            # if prolong_bad_time > 5 : # 5 seconds
            #     correction_type = self.sendWarning()
            #     self.prolong_bad =0
            #     try:
            #         query = "INSERT INTO CorrectionHistory (Timestamp, CorrectionType) VALUES (%s, %s)"
            #         # cursor.execute(query, (timestamp, correction_type))
            #         # connection.commit()
            #     except Exception as e:
            #         print(e)
            
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
            self.update_eye_screen_distance(eye_screen_distance) # where distance is the current eye to screen distance


        except Exception as e:
            print(e)

        return image

    def process_keypoints(self, keypoints, image):
        # Calculate angles and other metrics...
        pass

    def update_database(self):
        # Batch and write data to the database...
        pass

    def findDistance(self,x1, y1, x2, y2):
        dist = m.sqrt((x2-x1)**2+(y2-y1)**2)
        return dist

    def findAngle(self,x1, y1, x2, y2):
        theta = m.acos((y2 -y1)*(-y1) / (m.sqrt((x2 - x1)**2 + (y2 - y1)**2) * y1))
        degree = int(180/m.pi)*theta
        return degree

    def draw_landmarks(self, image):
        # Drawing landmarks and lines...
        pass

    def get_statistics(self):
        # Call this method to get the required statistics
        current_position_duration = self.get_current_duration(self.current_position_start_time)
        current_posture_duration = self.get_current_duration(self.current_posture_start_time)

        stats = {
            "Longest Sitting Duration": self.longest_sitting_duration,
            "Longest Standing Duration": self.longest_standing_duration,
            "Current Position": self.current_position,
            "Current Position Duration": current_position_duration,
            "Total Bad Posture Duration": self.total_bad_posture_duration,
            "Total Good Posture Duration": self.total_good_posture_duration,
            "Total Perfect Posture Duration": self.total_perfect_posture_duration,
            "Current Posture": self.current_posture,
            "Current Posture Duration": current_posture_duration,
            "Closest Eye to Screen Distance": self.closest_eye_to_screen_distance,
            "Current Eye to Screen Distance": self.current_eye_to_screen_distance
        }

        return stats

    def check_posture(self, neck_inclination, torso_inclination, knee_inclination):
        # Check and categorize posture...
        pass

    def monitor_screen_distance(self, image):
        # Monitor and calculate the distance from eyes to screen...
        pass

    def sendWarning(self):
        self.correction.append(time.time())
        return 'bad posture'

# Main execution
if __name__ == "__main__":
    posture_monitor = Posture()
    # Open database connection here...
    
    try:
        while posture_monitor.cap.isOpened():
            frame_time_start = time.time()
            image = posture_monitor.read()

            if image is not None:
                # Process and display the image...
                cv2.imshow('Posture Monitoring', image)

            if cv2.waitKey(1) & 0xFF == ord('q'):
                break

            # Update FPS calculation and display...
            if time.time() - frame_time_start > FPS_UPDATE_TIME:
                # Update the displayed FPS...
                pass

    except Exception as e:
        print("Error occurred:", e)
    finally:
        posture_monitor.cap.release()
        cv2.destroyAllWindows()
        # Close database connection here...
        print("Monitoring finished.")

