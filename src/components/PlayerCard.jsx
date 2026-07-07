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
        color: "white",
        minHeight: "130px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        boxShadow:
          "0 8px 20px rgba(0,0,0,.25)",
          borderRadius: "12px",
      }}
    >
      <div
        style={{
          fontSize: "1rem",
          fontWeight: "bold",
          marginBottom: "1rem",
        }}
      >
        {player.name}
      </div>

      <div
        style={{
          fontSize: "1.4rem",
          fontWeight: "bold",
        }}
      >
        {revealed ? (
          player.vote ?? "-"
        ) : player.vote ? (
          <span
            style={{
              color: "#22c55e",
            }}
          >
            ✅ Voté
          </span>
        ) : (
          <span
            style={{
              color: "#f59e0b",
            }}
          >
            ⏳ En attente
          </span>
        )}
      </div>
    </div>
  );
}