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
        (payload) => {
          console.log("ROOM UPDATE", payload);
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

    console.log("LOAD ROOM =", data);

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

  return (
    <div style={{ padding: "2rem" }}>
      <h1>♠️ Room {roomCode}</h1>

      <p>
        Reveal : {revealed ? "TRUE" : "FALSE"}
      </p>

      <p>
        Connecté en tant que <b>{playerName}</b>
      </p>

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