export default function TshirtStats({
  players,
}) {
  const sizes = [
    "XS",
    "S",
    "M",
    "L",
    "XL",
    "XXL",
  ];

  const counts = {};

  sizes.forEach((size) => {
    counts[size] = 0;
  });

  players.forEach((player) => {
    if (
      counts[player.vote] !==
      undefined
    ) {
      counts[player.vote]++;
    }
  });

  const maxVote = Math.max(
    ...Object.values(counts),
    1
  );

  const majoritySize =
    Object.entries(counts).sort(
      (a, b) => b[1] - a[1]
    )[0]?.[0];

  return (
    <div
      style={{
        background: "#1e293b",
        border: "1px solid #334155",
        borderRadius: "16px",
        padding: "1.5rem",
      }}
    >
      <h3
        style={{
          marginTop: 0,
          marginBottom: "1rem",
        }}
      >
        📊 Répartition T‑Shirt
      </h3>

      <div
        style={{
          marginBottom: "1.5rem",
          padding: ".75rem",
          background: "#0f172a",
          borderRadius: "10px",
          border: "1px solid #334155",
          color: "#38bdf8",
          fontWeight: "bold",
          textAlign: "center",
        }}
      >
        🏆 Taille majoritaire :{" "}
        {majoritySize}
      </div>

      {sizes.map((size) => (
        <div
          key={size}
          style={{
            marginBottom: "1rem",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent:
                "space-between",
              marginBottom: ".25rem",
            }}
          >
            <span>{size}</span>

            <strong>
              {counts[size]}
            </strong>
          </div>

          <div
            style={{
              height: "10px",
              background:
                "#334155",
              borderRadius:
                "999px",
              overflow:
                "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${
                  (counts[size] *
                    100) /
                  maxVote
                }%`,
                background:
                  "#38bdf8",
                transition:
                  "all .3s ease",
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}