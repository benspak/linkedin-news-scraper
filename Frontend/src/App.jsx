import { Link } from "react-router-dom";

const App = () => {
  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h1>CSV Upload & Authentication</h1>
      <nav>
        <Link to="/signup">Signup</Link> |
        <Link to="/login">Login</Link> |
        <Link to="/dashboard">Dashboard</Link>
      </nav>
    </div>
  );
};

export default App;
