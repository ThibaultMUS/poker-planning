export default function StatsCard({
  average,
  median,
  minVote,
  maxVote,
  spread,
}) {
  return (
    <div
      style={{
        marginTop: "2rem",
        background: "#1e293b",
        border: "1px solid #334155",
        borderRadius: "16px",
        padding: "1.5rem",
      }}
    >
      <h3>📊 Statistiques</h3>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(120px,1fr))",
          gap: "1rem",
        }}
      >
        <Stat title="Moyenne" value={average} />
        <Stat title="Médiane" value={median} />
        <Stat title="Minimum" value={minVote} />
        <Stat title="Maximum" value={maxVote} />
        <Stat title="Écart" value={spread} />
      </div>

      <div style={{ marginTop: "1rem" }}>
        {spread <= 3 && (
          <p style={{ color: "#22c55e" }}>
            ✅ Forte convergence
          </p>
        )}

        {spread > 3 && spread <= 8 && (
          <p style={{ color: "#f59e0b" }}>
            ⚠️ Quelques divergences
          </p>
        )}

        {spread > 8 && (
          <p style={{ color: "#ef4444" }}>
            🔥 Forte divergence
          </p>
        )}
      </div>
    </div>
  );
}

function Stat({ title, value }) {
  return (
    <div
      style={{
        background: "#0f172a",
        padding: "1rem",
        borderRadius: "12px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          color: "#94a3b8",
          fontSize: ".9rem",
        }}
      >
        {title}
      </div>

      <div
        style={{
          fontSize: "1.5rem",
          fontWeight: "bold",
        }}
      >
        {value}
      </div>
    </div>
  );
}
``