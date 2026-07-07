import { useState } from "react";
import Room from "./components/Room";

export default function App() {
  const [playerName, setPlayerName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [joined, setJoined] = useState(false);

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
    <div style={{ padding: "2rem" }}>
      <h1>♠️ Poker Planning</h1>

      <div>
        <input
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          placeholder="Ton prénom"
        />
      </div>

      <div style={{ marginTop: "1rem" }}>
        <input
          value={roomCode}
          onChange={(e) => setRoomCode(e.target.value)}
          placeholder="Code room (ex: SPRINT42)"
        />
      </div>

      <div style={{ marginTop: "1rem" }}>
        <button onClick={handleJoin}>
          Rejoindre
        </button>
      </div>
    </div>
  );
}