export function computeStats(players) {
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
          Math.floor(
            sortedVotes.length / 2
          )
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

  const voteCounts = {};

  numericVotes.forEach((vote) => {
    voteCounts[vote] =
      (voteCounts[vote] || 0) + 1;
  });

  let majorityVote = null;
  let maxCount = 0;

  Object.entries(voteCounts).forEach(
    ([vote, count]) => {
      if (count > maxCount) {
        maxCount = count;
        majorityVote = vote;
      }
    }
  );

  return {
    average,
    median,
    minVote,
    maxVote,
    spread,
    majorityVote,
  };
}