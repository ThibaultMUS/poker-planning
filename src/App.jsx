import { useEffect, useState } from "react";
import Room from "./components/Room";

export default function App() {
  const [playerName, setPlayerName] =
    useState("");

  const [roomCode, setRoomCode] =
    useState("");

  const [joined, setJoined] =
    useState(false);

  function generateRoomCode() {
    const chars =
      "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    let code = "";

    for (let i = 0; i < 6; i++) {
      code += chars.charAt(
        Math.floor(
          Math.random() * chars.length
        )
      );
    }

    setRoomCode(code);
  }

  useEffect(() => {
    const params =
      new URLSearchParams(
        window.location.search
      );

    const room =
      params.get("room");

    if (room) {
      setRoomCode(room);
    }
  }, []);

  const handleJoin = () => {
    if (!playerName.trim()) return;

    if (!roomCode.trim()) return;

    setJoined(true);
  };

  if (joined) {
    return (
      <Room
        playerName={playerName}
        roomCode={roomCode}
      />
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0f172a",
        color: "white",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "2rem",
      }}
    >
      <div
        style={{
          width: "450px",
        }}
      >
        <h1
          style={{
            textAlign: "center",
            fontSize: "3rem",
            marginBottom: ".5rem",
          }}
        >
          ♠️ Poker Planning
        </h1>

        <p
          style={{
            color: "#94a3b8",
            textAlign: "center",
            marginBottom: "2rem",
            fontSize: "1.1rem",
          }}
        >
          Estimez vos User Stories en
          équipe, en temps réel.
        </p>

        <div
          style={{
            background: "#1e293b",
            border:
              "1px solid #334155",
            borderRadius: "20px",
            padding: "2rem",
            boxShadow:
              "0 20px 40px rgba(0,0,0,.25)",
          }}
        >
          <input
            value={playerName}
            onChange={(e) =>
              setPlayerName(
                e.target.value
              )
            }
            placeholder="Votre prénom"
            style={{
              width: "100%",
              padding: "14px",
              borderRadius: "12px",
              border:
                "1px solid #334155",
              background: "#0f172a",
              color: "white",
              marginBottom: "1rem",
              boxSizing:
                "border-box",
              fontSize: "1rem",
            }}
          />

          <input
            value={roomCode}
            onChange={(e) =>
              setRoomCode(
                e.target.value
              )
            }
            placeholder="Code room"
            style={{
              width: "100%",
              padding: "14px",
              borderRadius: "12px",
              border:
                "1px solid #334155",
              background: "#0f172a",
              color: "white",
              marginBottom: "1rem",
              boxSizing:
                "border-box",
              fontSize: "1rem",
            }}
          />

          <button
            onClick={
              generateRoomCode
            }
            style={{
              width: "100%",
              background:                "#334155",

              color: "white",
              border: "none",
              padding: "14px",
              borderRadius: "12px",
              fontWeight:
                "bold",
              cursor: "pointer",
              fontSize: "1rem",
              boxShadow:
                "0 10px 25px rgba(37,99,235,.3)",
            }}
          >
            🚀 Créer un code
          </button>

          <div
            style={{
              textAlign: "center",
              margin: "1rem 0",
              color: "#64748b",
            }}
          >
            
          </div>

          <button
            onClick={handleJoin}
            style={{
              width: "100%",
              background:
                              "linear-gradient(135deg,#2563eb,#3b82f6)",

              color: "white",
              border: "none",
              padding: "14px",
              borderRadius: "12px",
              fontWeight:
                "bold",
              cursor: "pointer",
              fontSize: "1rem",
            }}
          >
            👥 Rejoindre la room
          </button>
        </div>
      </div>
    </div>
  );
}