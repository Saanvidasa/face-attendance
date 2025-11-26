import { useEffect, useState } from "react";
import { Bar, Pie } from "react-chartjs-2";
import "../styles/AttendanceDashboard.css";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

export default function AttendanceDashboard() {
  const [attendanceData, setAttendanceData] = useState([]);
  const [filterDate, setFilterDate] = useState("");
  const [filterName, setFilterName] = useState("");

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("attendance") || "[]");
    setAttendanceData(data);
  }, []);

  // Filtered data
  const filteredData = attendanceData.filter(record => {
    return (
      (filterDate ? record.date === filterDate : true) &&
      (filterName ? record.name.toLowerCase().includes(filterName.toLowerCase()) : true)
    );
  });

  // Prepare data for charts
  const dailyCount = {};
  const userCount = {};
  filteredData.forEach(({ name, date }) => {
    dailyCount[date] = (dailyCount[date] || 0) + 1;
    userCount[name] = (userCount[name] || 0) + 1;
  });

  const barData = {
    labels: Object.keys(dailyCount),
    datasets: [
      {
        label: "Attendance per day",
        data: Object.values(dailyCount),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
      },
    ],
  };

  const pieData = {
    labels: Object.keys(userCount),
    datasets: [
      {
        label: "Attendance per user",
        data: Object.values(userCount),
        backgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#4BC0C0",
          "#9966FF",
          "#FF9F40",
        ],
      },
    ],
  };

  // Download CSV
  const downloadCSV = () => {
    const csv = [
      ["Name", "Date", "Time"],
      ...filteredData.map(item => [item.name, item.date, item.time]),
    ]
      .map(e => e.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "attendance.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1 style={{ textAlign: "center", marginBottom: "20px" }}>📊 Attendance Dashboard</h1>

      <div style={{ display: "flex", gap: "10px", marginBottom: "20px", justifyContent: "center" }}>
        <input
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          style={{ padding: "8px", fontSize: "16px" }}
        />
        <input
          type="text"
          placeholder="Search by name"
          value={filterName}
          onChange={(e) => setFilterName(e.target.value)}
          style={{ padding: "8px", fontSize: "16px" }}
        />
        <button
          onClick={downloadCSV}
          style={{ padding: "8px 16px", cursor: "pointer", background: "#4BC0C0", color: "white", border: "none", borderRadius: "5px" }}
        >
          Download CSV
        </button>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "40px", justifyContent: "center" }}>
        <div style={{ width: "400px" }}>
          <Bar data={barData} />
        </div>
        <div style={{ width: "400px" }}>
          <Pie data={pieData} />
        </div>
      </div>

      <h2 style={{ marginTop: "40px", textAlign: "center" }}>Attendance Records</h2>
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "10px" }}>
        <thead>
          <tr style={{ background: "#f2f2f2" }}>
            <th style={{ border: "1px solid #ddd", padding: "8px" }}>Name</th>
            <th style={{ border: "1px solid #ddd", padding: "8px" }}>Date</th>
            <th style={{ border: "1px solid #ddd", padding: "8px" }}>Time</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((record, index) => (
            <tr key={index}>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>{record.name}</td>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>{record.date}</td>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>{record.time}</td>
            </tr>
          ))}
          {filteredData.length === 0 && (
            <tr>
              <td colSpan={3} style={{ textAlign: "center", padding: "10px" }}>
                No records found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
