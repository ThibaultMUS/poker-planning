const fibonacciCards = [
  "0",
  "1",
  "2",
  "3",
  "5",
  "8",
  "13",
  "21",
  "?",
];

const tshirtCards = [
  "XS",
  "S",
  "M",
  "L",
  "XL",
  "XXL",
  ];

export default function VotingCards({
  selected,
  onSelect,
  estimationType,
}) {
  const cards =
    estimationType === "tshirt"
      ? tshirtCards
      : fibonacciCards;

  return (
    <div
      style={{
        display: "flex",
        gap: "1rem",
        flexWrap: "wrap",
        marginTop: "2rem",
      }}
    >
      {cards.map((card) => (
        <button
          key={card}
          onClick={() => onSelect(card)}
          style={{
width: "85px",
height: "120px",
            background:
              selected === card
                ? "#0ea5e9"
                : "#1e293b",
            color: "white",
            border:
              selected === card
                ? "3px solid #38bdf8"
                : "1px solid #334155",
            borderRadius: "14px",
            cursor: "pointer",
            fontSize: "1.4rem",
            fontWeight: "bold",
            boxShadow:
              selected === card
                ? "0 0 20px rgba(56,189,248,.5)"
                : "0 4px 10px rgba(0,0,0,.25)",
            transition: "all .2s ease",
          }}
        >
          {card}
        </button>
      ))}
    </div>
  );
}