const cards = [
  "0",
  "1",
  "2",
  "3",
  "5",
  "8",
  "13",
  "21",
  "?"
];

export default function VotingCards({
  selected,
  onSelect,
}) {
  return (
    <div
      style={{
        display: "flex",
        gap: "0.5rem",
        flexWrap: "wrap",
      }}
    >
      {cards.map((card) => (
        <button
          key={card}
          onClick={() => onSelect(card)}
          style={{
            width: "60px",
            height: "90px",
            cursor: "pointer",
            border:
              selected === card
                ? "3px solid blue"
                : "1px solid #ccc",
            background:
              selected === card
                ? "#e6f0ff"
                : "white",
            borderRadius: "8px",
            fontWeight: "bold",
            fontSize: "1.2rem",
          }}
        >
          {card}
        </button>
      ))}
    </div>
  );
}