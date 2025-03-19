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

  // Render News Items
  useEffect(() => {
    const newsContainer = document.getElementById('news-container');
    if (data.length > 0) {
      newsContainer.innerHTML = data.map(item => `
        <div class="card" style="width: 18rem; margin: 10px;">
          <div class="card-body">
            <h5 class="card-title">${item.title}</h5>
            <p class="card-text"><a href="${item.url}" target="_blank">${item.url}</a></p>
            <p class="card-text">Date: ${item.date}</p>
          </div>
        </div>
      `).join('');
    } else {
      newsContainer.innerHTML = '<p>No news data available. Go scrape, first.</p>';
    }
  }, [data]);

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

      // Sort data by date in descending order
      uniqueData.sort((a, b) => new Date(b.date) - new Date(a.date));

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
      <h3>Past News</h3>
        <div class="row" id="news-container"></div>
    </div>
  );
};

export default Dashboard;
