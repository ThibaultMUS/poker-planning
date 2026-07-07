import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import VotingCards from "./VotingCards";
import PlayerCard from "./PlayerCard";

export default function Room({ playerName, roomCode }) {
  const [selectedCard, setSelectedCard] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [players, setPlayers] = useState([]);

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
      await supabase.from("rooms").insert({
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

    await supabase.from("votes").upsert(
      {
        room_code: roomCode,
        player_name: playerName,
        vote: card,
      },
      {
        onConflict: "room_code,player_name",
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

  const numericVotes = players
    .map((player) => Number(player.vote))
    .filter((vote) => !isNaN(vote));

  const average =
    numericVotes.length > 0
      ? (
          numericVotes.reduce(
            (sum, vote) => sum + vote,
            0
          ) / numericVotes.length
        ).toFixed(2)
      : 0;

  const sortedVotes = [...numericVotes].sort(
    (a, b) => a - b
  );

  const median =
    sortedVotes.length === 0
      ? 0
      : sortedVotes.length % 2 === 0
      ? (
          sortedVotes[
            sortedVotes.length / 2 - 1
          ] +
          sortedVotes[
            sortedVotes.length / 2
          ]
        ) / 2
      : sortedVotes[
          Math.floor(sortedVotes.length / 2)
        ];

  const minVote =
    numericVotes.length > 0
      ? Math.min(...numericVotes)
      : 0;

  const maxVote =
    numericVotes.length > 0
      ? Math.max(...numericVotes)
      : 0;

  const spread =
    numericVotes.length > 0
      ? maxVote - minVote
      : 0;

  return (
    <div style={{ padding: "2rem" }}>
      <h1>♠️ Room {roomCode}</h1>

      <p>Lien de partage :</p>

      <input
        readOnly
        value={`${window.location.origin}/?room=${roomCode}`}
        style={{
          width: "100%",
          padding: "0.5rem",
          marginBottom: "1rem",
        }}
      />

      <button
        onClick={() =>
          navigator.clipboard.writeText(
            `${window.location.origin}/?room=${roomCode}`
          )
        }
      >
        Copier le lien
      </button>

      <p>
        Connecté en tant que <b>{playerName}</b>
      </p>

      <div
        style={{
          padding: "0.75rem",
          background: "#e8f5e9",
          borderRadius: "8px",
          marginBottom: "1rem",
          fontWeight: "bold",
        }}
      >
        🗳️ Votes : {totalVotes}/{totalPlayers}
      </div>

      {totalVotes === totalPlayers &&
        totalPlayers > 0 && (
          <div
            style={{
              color: "green",
              fontWeight: "bold",
              marginBottom: "1rem",
            }}
          >
            ✅ Tout le monde a voté
          </div>
        )}

      <div
        style={{
          display: "flex",
          gap: "1rem",
          margin: "2rem 0",
          flexWrap: "wrap",
        }}
      >
        {players.map((player) => (
          <PlayerCard
            key={player.id}
            player={{
              name: player.player_name,
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
        <div
          style={{
            marginTop: "2rem",
            padding: "1rem",
            backgroundColor: "#f5f5f5",
            borderRadius: "8px",
          }}
        >
          <h3>📊 Statistiques</h3>

          <p>Moyenne : <b>{average}</b></p>
          <p>Médiane : <b>{median}</b></p>
          <p>Minimum : <b>{minVote}</b></p>
          <p>Maximum : <b>{maxVote}</b></p>
          <p>Écart : <b>{spread}</b></p>

          {spread <= 3 && (
            <p style={{ color: "green" }}>
              ✅ Forte convergence
            </p>
          )}

          {spread > 3 && spread <= 8 && (
            <p style={{ color: "orange" }}>
              ⚠️ Quelques divergences
            </p>
          )}

          {spread > 8 && (
            <p style={{ color: "red" }}>
              🔥 Forte divergence
            </p>
          )}
        </div>
      )}

      <div style={{ marginTop: "2rem" }}>
        <button onClick={revealRoom}>
          Reveal
        </button>

        <button
          style={{ marginLeft: "1rem" }}
          onClick={resetRoom}
        >
          Reset Room
        </button>
      </div>
    </div>
  );
}