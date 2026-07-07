export default function PlayerCard({
  player,
  revealed,
}) {
  return (
    <div
      style={{
        border: "1px solid #ddd",
        borderRadius: "8px",
        padding: "1rem",
        minWidth: "120px",
        textAlign: "center",
      }}
    >
      <h3>{player.name}</h3>

      <div
        style={{
          fontSize: "2rem",
          marginTop: "1rem",
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
