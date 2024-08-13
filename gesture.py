import cv2
import mediapipe as mp
import time
import math

mpHands = mp.solutions.hands
hands = mpHands.Hands()
mpDraw = mp.solutions.drawing_utils

goJump = False
goCrouch = False

def detect_gesture(img):
    process_frame(img)

    if goJump:
        return "Jump"
    elif goCrouch:
        return "Crouch"
    else:
        return "None"

def process_frame(img):
    global goJump, goCrouch

    imgRGB = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    results = hands.process(imgRGB)

    if results.multi_hand_landmarks:
        for handLms in results.multi_hand_landmarks:
            # Initialize min and max coordinates with extreme values
            min_x, min_y = float('inf'), float('inf')
            max_x, max_y = 0, 0

            # Find min and max coordinates for the bounding box
            for lm in handLms.landmark:
                h, w, c = img.shape
                cx, cy = int(lm.x * w), int(lm.y * h)
                if cx < min_x:
                    min_x = cx
                if cy < min_y:
                    min_y = cy
                if cx > max_x:
                    max_x = cx
                if cy > max_y:
                    max_y = cy

            # Draw bounding box
            cv2.rectangle(img, (min_x, min_y), (max_x, max_y), (0, 255, 0), 2)

            # Calculate aspect ratio
            width = max_x - min_x
            height = max_y - min_y
            aspect_ratio = width / height if height != 0 else 0

            # Use aspect ratio to normalize distances
            thumb = [0, 0]
            index = [0, 0]
            middle = [0, 0]
            for id, lm in enumerate(handLms.landmark):
                cx, cy = int(lm.x * w), int(lm.y * h)
                if id == 4:
                    thumb = [cx, cy]
                elif id == 8:
                    index = [cx, cy]
                elif id == 12:
                    middle = [cx, cy]

            # distance between index fingertip and thumb tip for crouch detection
            # Calculate normalized distance
            jump_x_dis = thumb[0] - index[0]
            jump_y_dis = thumb[1] - index[1]
            jump_dis = math.sqrt(jump_x_dis ** 2 + jump_y_dis ** 2) / aspect_ratio

            if (jump_dis < 40):
                goJump = True
            else:
                goJump = False

            # distance between middle fingertip and thumb tip for crouch detection
            crouch_x_dis = thumb[0] - middle[0]
            crouch_y_dis = thumb[1] - middle[1]
            crouch_dis = math.sqrt(crouch_x_dis ** 2 + crouch_y_dis ** 2) / aspect_ratio

            if (crouch_dis < 40):
                goCrouch = True
            else:
                goCrouch = False

            mpDraw.draw_landmarks(img, handLms, mpHands.HAND_CONNECTIONS)



def main():
    cap = cv2.VideoCapture(0)

    pTime = 0

    while True:
        success, img = cap.read()

        gesture = detect_gesture(img)

        print(gesture)

        # Display FPS
        cTime = time.time()
        fps = 1 / (cTime - pTime)
        pTime = cTime
        cv2.putText(img, str(int(fps)), (10, 70), cv2.FONT_HERSHEY_PLAIN, 3, (255, 0, 0), 3)

        cv2.imshow("Image", img)
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()



if __name__ == '__main__':
    main()