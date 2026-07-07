import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import VotingCards from "./VotingCards";
import PlayerCard from "./PlayerCard";
import StatsCard from "./StatsCard";
import { computeStats } from "../utils/roomStats";

export default function Room({
  playerName,
  roomCode,
}) {
  const [selectedCard, setSelectedCard] =
    useState(null);

  const [revealed, setRevealed] =
    useState(false);

  const [players, setPlayers] =
    useState([]);

  useEffect(() => {
    async function init() {
      await createRoomIfNeeded();
      await loadRoom();
      await loadVotes();
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
        () => {
          loadVotes();
        }
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
        () => {
          loadRoom();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(votesChannel);
      supabase.removeChannel(roomsChannel);
    };
  }, [roomCode]);

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

  async function loadRoom() {
    const { data } = await supabase
      .from("rooms")
      .select("*")
      .eq("room_code", roomCode)
      .single();

    if (data) {
      setRevealed(data.revealed);
    }
  }

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

  const totalPlayers = players.length;
  const totalVotes = votedPlayers.length;

  const {
    average,
    median,
    minVote,
    maxVote,
    spread,
  } = computeStats(players);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0f172a",
        color: "white",
        padding: "2rem",
      }}
    >
      <h1
        style={{
          fontSize: "2.5rem",
          marginBottom: ".5rem",
        }}
      >
        ♠️ Poker Planning
      </h1>

      <h2
        style={{
          color: "#38bdf8",
          marginBottom: "2rem",
        }}
      >
        Room {roomCode}
      </h2>

      <p>
        Lien de partage :
      </p>

      <input
        readOnly
        value={`${window.location.origin}/?room=${roomCode}`}
        style={{
          width: "100%",
          padding: "12px",
          borderRadius: "8px",
          border:
            "1px solid #334155",
          background: "#1e293b",
          color: "white",
          marginBottom: "1rem",
        }}
      />

      <button
        style={{
          background: "#3b82f6",
          color: "white",
          border: "none",
          padding:
            "10px 20px",
          borderRadius: "8px",
          cursor: "pointer",
          marginBottom: "1rem",
        }}
        onClick={() =>
          navigator.clipboard.writeText(
            `${window.location.origin}/?room=${roomCode}`
          )
        }
      >
        Copier le lien
      </button>

      <p>
        Connecté en tant que{" "}
        <b>{playerName}</b>
      </p>

      <div
        style={{
          padding: ".75rem",
          background: "#1e293b",
          border:
            "1px solid #334155",
          borderRadius: "12px",
          marginBottom: "1rem",
          color: "#38bdf8",
          fontWeight: "bold",
        }}
      >
        🗳️ Votes : {totalVotes}/
        {totalPlayers}
      </div>

      {totalVotes ===
        totalPlayers &&
        totalPlayers > 0 && (
          <div
            style={{
              color: "#22c55e",
              fontWeight: "bold",
              marginBottom: "1rem",
            }}
          >
            ✅ Tout le monde a voté
          </div>
        )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit,minmax(160px,1fr))",
          gap: "1rem",
          margin: "2rem 0",
        }}
      >
        {players.map((player) => (
          <PlayerCard
            key={player.id}
            player={{
              name:
                player.player_name,
              vote: player.vote,
            }}
            revealed={revealed}
          />
        ))}
      </div>

      <VotingCards
        selected={selectedCard}
        onSelect={handleVote}
      />

      {revealed && (
        <StatsCard
          average={average}
          median={median}
          minVote={minVote}
          maxVote={maxVote}
          spread={spread}
        />
      )}

      <div
        style={{
          marginTop: "2rem",
        }}
      >
        <button
          onClick={revealRoom}
          style={{
            background:
              "#22c55e",
            color: "white",
            border: "none",
            padding:
              "10px 20px",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          Reveal
        </button>

        <button
          onClick={resetRoom}
          style={{
            marginLeft: "1rem",
            background:
              "#ef4444",
            color: "white",
            border: "none",
            padding:
              "10px 20px",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          Reset Room
        </button>
      </div>
    </div>
  );
}