def strategy_round_2(opponent_id: int, my_history: dict[int, list[int]], opponents_history: dict[int, list[int]]) -> tuple[int, int]:
    if not opponents_history[opponent_id]:
        move = 1
    else:
        opponent_moves = opponents_history[opponent_id]
        total_moves = len(opponent_moves)
        cooperation_rate = opponent_moves.count(1) / total_moves if total_moves > 0 else 0.5

        if cooperation_rate > 0.8 or cooperation_rate == 0:
            move = 0
        elif cooperation_rate < 0.4:
            move = 1
        else:
            recent_moves = opponent_moves[-3:] if len(opponent_moves) >= 3 else opponent_moves
            recent_cooperation_rate = recent_moves.count(1) / len(recent_moves)
            move = 0 if recent_cooperation_rate > 0.8 else 1

    available = [id for id in my_history.keys() if len(my_history[id]) < 200]

    if not available:
        return move, opponent_id

    cooperative_opponents = []
    for id in available:
        if opponents_history[id]:
            coop_rate = opponents_history[id].count(1) / len(opponents_history[id])
            if coop_rate > 0.7:
                cooperative_opponents.append((id, coop_rate))

    if cooperative_opponents:
        best_opponent = max(cooperative_opponents, key=lambda x: x[1])[0]
        return move, best_opponent

    untested = [id for id in available if not opponents_history[id]]
    if untested:
        return move, untested[0]

    if (opponent_id in available and opponents_history[opponent_id] and
        opponents_history[opponent_id][-1] == 1):
        return move, opponent_id

    return move, min(available, key=lambda id: len(my_history[id]))
