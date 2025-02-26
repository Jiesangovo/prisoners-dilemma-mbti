// 定義收益矩陣
const payoffMatrix = {
    '合作': {'合作': [3, 3], '背叛': [0, 5]},
    '背叛': {'合作': [5, 0], '背叛': [1, 1]}
};

// 定義策略
const strategies = {
    '全合作': () => '合作',
    '全背叛': () => '背叛',
    '爭鋒相對': (history) => history.length === 0 ? '合作' : history[history.length - 1][1]
};

// 博弈函數
function playGame(playerStrategy, opponentStrategy, rounds) {
    let history = [];
    let playerScore = 0;
    let opponentScore = 0;

    for (let i = 0; i < rounds; i++) {
        const playerMove = strategies[playerStrategy](history);
        const opponentMove = strategies[opponentStrategy](history.map(([a, b]) => [b, a]));

        const [playerPayoff, opponentPayoff] = payoffMatrix[playerMove][opponentMove];
        playerScore += playerPayoff;
        opponentScore += opponentPayoff;

        history.push([playerMove, opponentMove]);
    }

    return { playerScore, opponentScore, history };
}

// 表單提交事件
document.getElementById('mbti-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const mbti = document.getElementById('mbti').value;

    // 隨機選擇策略順序
    const strategyOrder = ['全合作', '全背叛', '爭鋒相對'].sort(() => Math.random() - 0.5);

    let totalScore = 0;
    strategyOrder.forEach(strategy => {
        const result = playGame('玩家', strategy, 5);
        totalScore += result.playerScore;
        document.getElementById('game-results').innerHTML += `
            <p>對戰 ${strategy}：得分 ${result.playerScore}</p>
        `;
    });

    document.getElementById('game-results').innerHTML += `
        <p>總分：${totalScore}</p>
    `;

    // 將結果發送到後端（Python）以存儲到 Google Drive
    fetch('/save-result', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mbti, totalScore }),
    });
});
