import { useState } from "react";
import Camera from "./components/camera";
import AttendanceDashboard from "./components/AttendanceDashboard";
import "./styles/App.css";


export default function App() {
  const [activeTab, setActiveTab] = useState("camera"); // default tab

  return (
    <div style={{ fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      {/* Header */}
      <h1 style={{ textAlign: "center", marginBottom: "30px", color: "#333" }}>
        📚 Face Recognition Attendance System
      </h1>

      {/* Tabs */}
      <div style={{ display: "flex", justifyContent: "center", gap: "15px", flexWrap: "wrap", marginBottom: "30px" }}>
        <button
          onClick={() => setActiveTab("camera")}
          style={{
            padding: "10px 25px",
            cursor: "pointer",
            backgroundColor: activeTab === "camera" ? "#4caf50" : "#e0e0e0",
            color: activeTab === "camera" ? "white" : "black",
            border: "none",
            borderRadius: "8px",
            fontWeight: "bold",
            transition: "0.3s",
          }}
        >
          Camera / Register
        </button>

        <button
          onClick={() => setActiveTab("dashboard")}
          style={{
            padding: "10px 25px",
            cursor: "pointer",
            backgroundColor: activeTab === "dashboard" ? "#4caf50" : "#e0e0e0",
            color: activeTab === "dashboard" ? "white" : "black",
            border: "none",
            borderRadius: "8px",
            fontWeight: "bold",
            transition: "0.3s",
          }}
        >
          Attendance Dashboard
        </button>
      </div>

      {/* Tab Content */}
      <div style={{ minHeight: "500px", backgroundColor: "#f9f9f9", padding: "20px", borderRadius: "12px", boxShadow: "0 4px 10px rgba(0,0,0,0.1)" }}>
        {activeTab === "camera" && <Camera />}
        {activeTab === "dashboard" && <AttendanceDashboard />}
      </div>
    </div>
  );
}
