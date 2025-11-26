import { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";

import "../styles/Camera.css";

export default function Camera() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [name, setName] = useState("");
  const [capturedImage, setCapturedImage] = useState(null);

  // ============================
  // LOAD MODELS + START CAMERA
  // ============================
  useEffect(() => {
    async function loadModelsAndCamera() {
      const MODEL_URL = "/models";

      await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
      await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
      await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);

      console.log("Face-api models loaded");

      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
    }

    loadModelsAndCamera();
  }, []);

  // -----------------------------
  // SAVE DESCRIPTOR
  // -----------------------------
  const saveFaceDescriptor = (name, descriptor) => {
    const storedData = JSON.parse(localStorage.getItem("faceDescriptors") || "{}");

    storedData[name] = Array.from(descriptor);
    localStorage.setItem("faceDescriptors", JSON.stringify(storedData));

    alert(`✅ Registered successfully as "${name}"`);
  };

  // ============================
  // REGISTER FACE (WITH CHECK)
  // ============================
  const registerFace = async () => {
    if (!name) {
      alert("Enter a name first");
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Capture current frame
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = canvas.toDataURL("image/png");
    setCapturedImage(imageData);

    const img = new Image();
    img.src = imageData;

    img.onload = async () => {
      const detection = await faceapi
        .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        alert("❌ No face detected. Try again.");
        return;
      }

      const newDescriptor = detection.descriptor;

      // Load existing
      const storedData = JSON.parse(localStorage.getItem("faceDescriptors") || "{}");

      const existing = Object.entries(storedData).map(([n, d]) => ({
        name: n,
        descriptor: new Float32Array(d),
      }));

      // Compare new face with stored faces
      let matchFound = false;
      let matchedName = null;

      existing.forEach(item => {
        const dist = faceapi.euclideanDistance(item.descriptor, newDescriptor);
        if (dist < 0.45) {
          matchFound = true;
          matchedName = item.name;
        }
      });

      if (matchFound) {
        alert(`❌ This face already belongs to "${matchedName}".`);
        return;
      }

      // Save new user
      saveFaceDescriptor(name, newDescriptor);
    };
  };

  // ============================
  // MARK ATTENDANCE
  // ============================
  const markAttendance = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = canvas.toDataURL("image/png");
    setCapturedImage(imageData);

    const img = new Image();
    img.src = imageData;

    img.onload = async () => {
      const detection = await faceapi
        .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        alert("❌ No face detected!");
        return;
      }

      const capturedDescriptor = detection.descriptor;

      // Load stored users
      const storedData = JSON.parse(localStorage.getItem("faceDescriptors") || "{}");

      const known = Object.entries(storedData).map(([n, d]) => ({
        name: n,
        descriptor: new Float32Array(d),
      }));

      let minDistance = Infinity;
      let matchedName = null;

      known.forEach(user => {
        const dist = faceapi.euclideanDistance(user.descriptor, capturedDescriptor);
        if (dist < minDistance) {
          minDistance = dist;
          matchedName = user.name;
        }
      });

      const tolerance = 0.60;

      if (minDistance < tolerance) {
        const attendanceData = JSON.parse(localStorage.getItem("attendance") || "[]");
        const today = new Date().toISOString().split("T")[0];
        const time = new Date().toLocaleTimeString();

        const exists = attendanceData.some(
          a => a.name === matchedName && a.date === today
        );

        if (!exists) {
          attendanceData.push({ name: matchedName, date: today, time });
          localStorage.setItem("attendance", JSON.stringify(attendanceData));
          alert(`✅ Attendance marked for ${matchedName}`);
        } else {
          alert(`ℹ️ ${matchedName}'s attendance already marked today.`);
        }
      } else {
        alert("❌ No matching face found. Please register first.");
      }
    };
  };

  // ============================
  // UI
  // ============================
  return (
    <div className="camera-container">
      <video ref={videoRef} autoPlay muted className="camera-video" />

      <div className="controls">
        <input
          type="text"
          placeholder="Enter name to register"
          value={name}
          onChange={e => setName(e.target.value)}
          className="input-box"
        />

        <button onClick={registerFace} className="btn primary">
          Register Face
        </button>

        <button onClick={markAttendance} className="btn secondary">
          Mark Attendance
        </button>
      </div>

      <canvas ref={canvasRef} style={{ display: "none" }} />

      {capturedImage && (
        <div className="capture-preview">
          <h3>Captured Image:</h3>
          <img src={capturedImage} alt="captured" className="capture-img" />
        </div>
      )}
    </div>
  );
}
