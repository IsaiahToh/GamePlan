import React from 'react'

const handleScrapeAndImport = async () => {
  const token = localStorage.getItem("token");
  const res = await fetch("http://localhost:3000/api/dashboard/scrape-and-import", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await res.json();
  console.log(data);
};

const Home = () => {
  return (
    <div>
      <p>Home</p>
      <button onClick={handleScrapeAndImport}>Scrape & Import My Dashboard</button>
    </div>
  )
}

export default Home