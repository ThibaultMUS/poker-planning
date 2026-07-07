import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import VotingCards from "./VotingCards";
import PlayerCard from "./PlayerCard";
import StatsCard from "./StatsCard";
import { computeStats } from "../utils/roomStats";
import TshirtStats from "./TshirtStats";

export default function Room({
  playerName,
  roomCode,
}) {
  const [selectedCard, setSelectedCard] =
    useState(null);
  const [copied, setCopied] =
  useState(false);  

  const [revealed, setRevealed] =
    useState(false);
  const [
  estimationType,
  setEstimationType,
] = useState("fibonacci");

  const [players, setPlayers] =
    useState([]);

  const [
    connectedPlayers,
    setConnectedPlayers,
  ] = useState([]);

  useEffect(() => {
    async function init() {
      await createRoomIfNeeded();
      await registerPlayer();
      await loadRoom();
      await loadVotes();
      await loadPlayers();
    }

    init();

    const votesChannel = supabase
      .channel(`votes-${roomCode}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "votes",
        },
        () => loadVotes()
      )
      .subscribe();

    const roomsChannel = supabase
      .channel(`rooms-${roomCode}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "rooms",
        },
        () => loadRoom()
      )
      .subscribe();

    const playersChannel = supabase
      .channel(`players-${roomCode}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "players",
        },
        () => loadPlayers()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(votesChannel);
      supabase.removeChannel(roomsChannel);
      supabase.removeChannel(playersChannel);
    };
  }, [roomCode]);
async function updateEstimationType(
  value
) {
  setEstimationType(value);

  await supabase
    .from("rooms")
    .update({
      estimation_type: value,
    })
    .eq("room_code", roomCode);
}
  async function createRoomIfNeeded() {
    const { data } = await supabase
      .from("rooms")
      .select("*")
      .eq("room_code", roomCode)
      .maybeSingle();

    if (!data) {
      await supabase
        .from("rooms")
        .insert({
          room_code: roomCode,
          revealed: false,
        });
    }
  }

  async function registerPlayer() {
    await supabase
      .from("players")
      .upsert(
        {
          room_code: roomCode,
          player_name: playerName,
        },
        {
          onConflict:
            "room_code,player_name",
        }
      );
  }

  async function loadPlayers() {
    const { data } = await supabase
      .from("players")
      .select("*")
      .eq("room_code", roomCode);

    setConnectedPlayers(data || []);
  }

  async function loadRoom() {
    const { data } = await supabase
      .from("rooms")
      .select("*")
      .eq("room_code", roomCode)
      .single();

if (data) {
  setRevealed(data.revealed);

  setEstimationType(
    data.estimation_type ||
      "fibonacci"
  );
}  }

  async function loadVotes() {
    const { data } = await supabase
      .from("votes")
      .select("*")
      .eq("room_code", roomCode);

    setPlayers(data || []);
  }

  async function handleVote(card) {
    setSelectedCard(card);

    await supabase
      .from("votes")
      .upsert(
        {
          room_code: roomCode,
          player_name: playerName,
          vote: card,
        },
        {
          onConflict:
            "room_code,player_name",
        }
      );
  }

  async function revealRoom() {
    await supabase
      .from("rooms")
      .update({
        revealed: true,
      })
      .eq("room_code", roomCode);
  }

  async function resetRoom() {
    await supabase
      .from("votes")
      .delete()
      .eq("room_code", roomCode);

    await supabase
      .from("rooms")
      .update({
        revealed: false,
      })
      .eq("room_code", roomCode);

    setSelectedCard(null);
  }

  const votedPlayers = players.filter(
    (player) =>
      player.vote !== null &&
      player.vote !== undefined
  );

  const totalPlayers =
    connectedPlayers.length;

  const totalVotes =
    votedPlayers.length;

  const stats =
    computeStats(players);

return (
  <div
    style={{
      minHeight: "100vh",
      background: "#0f172a",
      color: "white",
      padding: "1rem",
      maxWidth: "1600px",
      margin: "0 auto",
    }}
  >
<div
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "2rem",
  }}
>      <h1
        style={{
          margin: 0,
        }}
      >
        ♠️ Poker Planning
      </h1>

      <div
        style={{
          color: "#38bdf8",
          fontWeight: "bold",
          fontSize: "1.2rem",
        }}
  style={{
    display: "flex",
    alignItems: "center",
    gap: "1rem",
  }}
>
  <div
    style={{
      color: "#38bdf8",
      fontWeight: "bold",
      fontSize: "1.2rem",
    }}
  >
    Room {roomCode}
  </div>

  <button
onClick={() => {
  navigator.clipboard.writeText(
    `${window.location.origin}/?room=${roomCode}`
  );

  setCopied(true);

  setTimeout(() => {
    setCopied(false);
  }, 2000);
}}
  style={{
      background: "#2563eb",
      color: "white",
      border: "none",
      padding: "10px 18px",
      borderRadius: "10px",
      cursor: "pointer",
      fontWeight: "bold",
      boxShadow:
        "0 4px 10px rgba(37,99,235,.3)",
    }}
  >
    📋 Copier
  </button>
</div>
    </div>
    <div
  style={{
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(220px,1fr))",
    gap: "1rem",
    marginBottom: "2rem",
  }}
>
  <div
    style={{
      background: "#1e293b",
      border: "1px solid #334155",
      borderRadius: "12px",
      padding: "1rem",
    }}
  >
    <div
      style={{
        fontSize: ".8rem",
        color: "#94a3b8",
      }}
    >
      Méthode
    </div>

    <select
      value={estimationType}
      onChange={(e) =>
        updateEstimationType(
          e.target.value
        )
      }
      style={{
        marginTop: ".5rem",
        width: "100%",
        padding: "8px",
        borderRadius: "8px",
      }}
    >
      <option value="fibonacci">
        Fibonacci
      </option>

      <option value="tshirt">
        Taille T-Shirt
      </option>
    </select>
  </div>

  <div
    style={{
      background: "#1e293b",
      border: "1px solid #334155",
      borderRadius: "12px",
      padding: "1rem",
    }}
  >
    <div
      style={{
        fontSize: ".8rem",
        color: "#94a3b8",
      }}
    >
      Joueurs
    </div>

    <div
      style={{
        fontSize: "2rem",
        fontWeight: "bold",
      }}
    >
      {totalPlayers}
    </div>
  </div>

  <div
    style={{
      background: "#1e293b",
      border: "1px solid #334155",
      borderRadius: "12px",
      padding: "1rem",
    }}
  >
    <div
      style={{
        fontSize: ".8rem",
        color: "#94a3b8",
      }}
    >
      Votes
    </div>

    <div
      style={{
        fontSize: "2rem",
        fontWeight: "bold",
      }}
    >
      {totalVotes}/{totalPlayers}
    </div>
  </div>
</div>
<div
  style={{
    background: "#1e293b",
    border: "1px solid #334155",
    borderRadius: "12px",
    padding: "1rem",
    marginTop: "2rem",
  }}
>
  <div
    style={{
      display: "flex",
      justifyContent:
        "space-between",
    }}
  >
    <span>🗳️ Votes</span>

    <span>
      {totalVotes}/{totalPlayers}
    </span>
  </div>

  <div
    style={{
      marginTop: "1rem",
      fontWeight: "bold",
    }}
  >
    {revealed ? (
      <span
        style={{
          color: "#38bdf8",
        }}
      >
        🔵 Votes révélés
      </span>
    ) : (
      <span
        style={{
          color: "#22c55e",
        }}
      >
        🟢 Vote en cours
      </span>
    )}
  </div>

  <div
    style={{
      marginTop: ".5rem",
      height: "12px",
      background: "#334155",
      borderRadius: "12px",
      overflow: "hidden",
    }}
  >
    <div
      style={{
        height: "100%",
        width: `${
          totalPlayers > 0
            ? (totalVotes * 100) /
              totalPlayers
            : 0
        }%`,
        background: "#38bdf8",
        transition:
          "width .3s ease",
      }}
    />
  </div>
</div>

<div
  style={{
    display: "grid",
    gridTemplateColumns:
  "repeat(auto-fit,minmax(220px,1fr))",
      gap: "1rem",
    margin: "2rem 0",
  }}
>
  {connectedPlayers.map(
    (connectedPlayer) => {
      const voteData =
        players.find(
          (player) =>
            player.player_name ===
            connectedPlayer.player_name
        );

      return (
        <PlayerCard
          key={connectedPlayer.id}
          player={{
            name:
              connectedPlayer.player_name,
            vote:
              voteData?.vote ?? null,
          }}
          revealed={revealed}
        />
      );
    }
  )}
</div>

<div
  style={{
    minHeight: "170px",
    display: "flex",
    alignItems: "center",
  }}
>
  <VotingCards
    selected={selectedCard}
    onSelect={handleVote}
    estimationType={estimationType}
  />
</div>

<div
  style={{
    display: "flex",
    gap: "1rem",
    marginTop: "2rem",
    alignItems: "flex-start",
  }}
>
<div
  style={{
    flex: 1,
    minHeight: "320px",
  }}
>
{revealed &&
  estimationType ===
    "fibonacci" && (
    <StatsCard
      average={stats.average}
      median={stats.median}
      minVote={stats.minVote}
      maxVote={stats.maxVote}
      spread={stats.spread}
      majorityVote={
        stats.majorityVote
      }
    />
  )}

{revealed &&
  estimationType ===
    "tshirt" && (
    <TshirtStats
      players={players}
    />
  )}</div>
<div
  style={{
    display: "flex",
    justifyContent: "center",
    gap: "1rem",
    marginTop: "1rem",
  }}
><button
  onClick={revealRoom}
  disabled={
    totalVotes < totalPlayers
  } style={{
  background: "#16a34a",
  color: "white",
  border: "none",
  padding: "14px 28px",
  borderRadius: "12px",
  fontWeight: "bold",
  minWidth: "180px",
  fontSize: "1rem",
  boxShadow:
    "0 10px 20px rgba(22,163,74,.3)",
  opacity:
    totalVotes < totalPlayers
      ? 0.5
      : 1,
  cursor:
    totalVotes < totalPlayers
      ? "not-allowed"
      : "pointer",
}}
    >
      👀 Reveal
    </button>

<button
      onClick={resetRoom}
style={{
  background: "#ef4444",
  color: "white",
  border: "none",
  padding: "14px 28px",
  borderRadius: "12px",
  fontWeight: "bold",
  minWidth: "180px",
  fontSize: "1rem",
  cursor: "pointer",
  boxShadow:
    "0 10px 20px rgba(239,68,68,.3)",
}}    >
      🔄 Reset
    </button>
  {copied && (
  <div
    style={{
      position: "fixed",
      top: "20px",
      right: "20px",
      background: "#16a34a",
      color: "white",
      padding: "12px 20px",
      borderRadius: "12px",
      fontWeight: "bold",
      boxShadow:
        "0 10px 25px rgba(0,0,0,.3)",
      zIndex: 9999,
    }}
  >
    ✅ Lien copié dans le presse‑papier
  </div>
)}</div>
</div>

</div>
  );
}