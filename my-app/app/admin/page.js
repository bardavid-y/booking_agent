"use client";

import { useState, useEffect } from "react";

export default function AdminDashboard() {
  const [tickets, setTickets] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch both tickets and rooms when the page loads
    const fetchData = async () => {
      try {
        const [ticketsRes, roomsRes] = await Promise.all([
          fetch("/api/maintenance"),
          fetch("/api/rooms")
        ]);

        const ticketsData = await ticketsRes.json();
        const roomsData = await roomsRes.json();

        if (ticketsData.success) setTickets(ticketsData.data);
        if (roomsData.success) setRooms(roomsData.data);
      } catch (error) {
        console.error("Error fetching admin data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div style={{ padding: "40px", fontFamily: "sans-serif" }}>Loading Dashboard...</div>;
  }

  return (
    <div style={{ maxWidth: "900px", margin: "40px auto", padding: "20px", fontFamily: "sans-serif" }}>
      <h1 style={{ fontSize: "28px", borderBottom: "2px solid #eee", paddingBottom: "10px" }}>
        Hotel Admin Dashboard
      </h1>

      <div style={{ display: "flex", gap: "40px", marginTop: "30px" }}>
        
        {/* Left Column: Maintenance Tickets */}
        <div style={{ flex: 2 }}>
          <h2 style={{ fontSize: "20px", marginBottom: "15px" }}>Active Maintenance Tickets</h2>
          {tickets.length === 0 ? (
            <p>No open tickets. Great job!</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              {tickets.map((ticket) => (
                <div 
                  key={ticket._id} 
                  style={{ 
                    border: "1px solid #ccc", 
                    borderRadius: "6px", 
                    padding: "15px",
                    borderLeft: ticket.priority === "Critical" ? "5px solid #ef4444" : "5px solid #3b82f6"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                    <strong>Room {ticket.roomNumber}</strong>
                    <span style={{ 
                      backgroundColor: ticket.priority === "Critical" ? "#fee2e2" : "#e0f2fe", 
                      color: ticket.priority === "Critical" ? "#991b1b" : "#075985",
                      padding: "2px 8px", 
                      borderRadius: "12px", 
                      fontSize: "12px",
                      fontWeight: "bold"
                    }}>
                      {ticket.priority} Priority
                    </span>
                  </div>
                  <p style={{ margin: "0 0 10px 0", color: "#444" }}>{ticket.issue}</p>
                  <div style={{ fontSize: "12px", color: "#888" }}>
                    Status: {ticket.status} | Out of Order: {ticket.outOfOrder ? "Yes" : "No"}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Room Status Overview */}
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: "20px", marginBottom: "15px" }}>Room Statuses</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            {rooms.map((room) => (
              <div 
                key={room._id} 
                style={{
                  padding: "10px",
                  borderRadius: "6px",
                  textAlign: "center",
                  fontWeight: "bold",
                  backgroundColor: room.status === "Out of Order" ? "#fee2e2" : "#dcfce3",
                  color: room.status === "Out of Order" ? "#991b1b" : "#166534",
                  border: `1px solid ${room.status === "Out of Order" ? "#f87171" : "#86efac"}`
                }}
              >
                Room {room.roomNumber}
                <div style={{ fontSize: "12px", fontWeight: "normal", marginTop: "4px" }}>
                  {room.status}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}