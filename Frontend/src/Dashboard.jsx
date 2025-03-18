import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [file, setFile] = useState(null);
  const [data, setData] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    } else {
      fetchData(token);
    }
  }, [navigate]);

  const handleUpload = async () => {
    if (!file) return alert("Please select a file");

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Session expired. Please log in again.");
      navigate("/login");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("http://localhost:5555/upload", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    const result = await response.json();
    alert(result.message);
    fetchData(token);
  };

  const fetchData = async (token) => {
    const response = await fetch("http://localhost:5555/data", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.ok) {
      const result = await response.json();
      const uniqueData = filterDuplicates(result);
      setData(uniqueData);
    } else {
      alert("Session expired. Please log in again.");
      localStorage.removeItem("token");
      navigate("/login");
    }
  };

  // ✅ Function to remove duplicates based on (date, title, url)
  const filterDuplicates = (entries) => {
    const seen = new Set();
    return entries.filter((entry) => {
      const key = `${entry.date}-${entry.title}-${entry.url}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  };

  return (
    <div style={{ textAlign: "center" }}>
      <h2>Dashboard</h2>
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <button onClick={handleUpload}>Upload CSV</button>

      <h3>CSV Data</h3>
      <ul>
        {data.map((entry, index) => (
          <li key={index}>
            {entry.date} - <a href={entry.url} target="_blank" rel="noopener noreferrer">{entry.title}</a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Dashboard;
