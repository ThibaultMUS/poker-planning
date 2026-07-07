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
        padding: "2rem",
      }}
    >
      <h1>♠️ Poker Planning</h1>

      <h2
        style={{
          color: "#38bdf8",
        }}
      >
        Room {roomCode}
      </h2>

      <p>🔗 Lien de partage</p>

      <input
        readOnly
        value={`${window.location.origin}/?room=${roomCode}`}
        style={{
          width: "100%",
          padding: "12px",
          background: "#1e293b",
          color: "white",
          border: "1px solid #334155",
          borderRadius: "8px",
        }}
      />

      <button
        style={{
          marginTop: "1rem",
        }}
        onClick={() =>
          navigator.clipboard.writeText(
            `${window.location.origin}/?room=${roomCode}`
          )
        }
      >
        Copier le lien
      </button>

      <h3
        style={{
          marginTop: "2rem",
        }}
      >
        👥 Joueurs connectés
      </h3>

      <div
        style={{
          display: "flex",
          gap: ".5rem",
          flexWrap: "wrap",
          marginBottom: "2rem",
        }}
      >
        {connectedPlayers.map(
          (player) => (
            <div
              key={player.id}
              style={{
                background: "#1e293b",
                border: "1px solid #334155",
                borderRadius: "999px",
                padding: "6px 12px",
              }}
            >
              🟢 {player.player_name}
            </div>
          )
        )}
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
                  ? (totalVotes *
                      100) /
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

      <div
        style={{
          marginTop: "2rem",
        }}
      >
        <button
          onClick={revealRoom}
        >
          Reveal
        </button>

        <button
          onClick={resetRoom}
          style={{
            marginLeft: "1rem",
          }}
        >
          Reset Room
        </button>
      </div>
    </div>
  );
}