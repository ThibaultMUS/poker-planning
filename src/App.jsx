import { useEffect, useState } from "react";
import Room from "./components/Room";

export default function App() {
  const [playerName, setPlayerName] = useState("");
  const [roomCode, setRoomCode] = useState("");
function generateRoomCode() {
  const chars =
    "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

  let code = "";

  for (let i = 0; i < 6; i++) {
    code += chars.charAt(
      Math.floor(Math.random() * chars.length)
    );
  }

  setRoomCode(code);
}  const [joined, setJoined] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(
      window.location.search
    );

    const room = params.get("room");

    if (room) {
      setRoomCode(room);
    }
  }, []);

  const handleJoin = () => {
    if (!roomCode.trim()) {
  generateRoomCode();
  return;
}
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
        <button
  style={{
    marginTop: "0.5rem"
  }}
  onClick={generateRoomCode}
>
  Créer une room
</button>
      </div>

      <div style={{ marginTop: "1rem" }}>
        <button onClick={handleJoin}>
          Rejoindre
        </button>
      </div>
    </div>
  );
}