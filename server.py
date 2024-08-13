from flask import Flask, Response, render_template
import cv2
from gesture import process_frame, detect_gesture

app = Flask(__name__)

camera = cv2.VideoCapture(0)

def generate_frames():
    global camera
    while True:
        success, frame = camera.read()

        process_frame(frame)

        if not success:
            break
        else:
            # Convert the frame format to bytes
            ret, buffer = cv2.imencode('.jpg', frame)
            frame = buffer.tobytes()
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')

def event_stream():
    global camera
    while True:
        success, frame = camera.read()
        if not success:
            break
        action = detect_gesture(frame)
        yield f"data: {action}\n\n"

@app.route('/stream')
def stream():
    return Response(event_stream(), mimetype='text/event-stream')

@app.route('/video_feed')
def video_feed():
    return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/')
def index():
    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True, threaded=True)