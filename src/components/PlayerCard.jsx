export default function PlayerCard({
  player,
  revealed,
}) {
  return (
    <div
      style={{
        background: "#1e293b",
        border: "1px solid #334155",
        borderRadius: "16px",
        padding: "1rem",
        minWidth: "160px",
        color: "white",
        textAlign: "center",
        boxShadow:
          "0 8px 20px rgba(0,0,0,0.25)",
      }}
    >
      <h3
        style={{
          margin: 0,
          marginBottom: "1rem",
        }}
      >
        {player.name}
      </h3>

      <div
        style={{
          fontSize: "2.5rem",
          fontWeight: "bold",
        }}
      >
        {revealed
          ? player.vote ?? "-"
          : player.vote
          ? "✅"
          : "⏳"}
      </div>
    </div>
  );
}