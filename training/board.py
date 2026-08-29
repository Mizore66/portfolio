"""FEN, 768-feature indexing, and quiet/opening cuts.

Feature indices match src/lib/chess/nnue/features.ts (STM-perspective 12×64, black
mirrors with square^56). Piece codes match the TypeScript engine: WP=1…WK=6, BP=9…BK=14.
"""
from __future__ import annotations

PIECE: dict[str, int] = {
    "P": 1,
    "N": 2,
    "B": 3,
    "R": 4,
    "Q": 5,
    "K": 6,
    "p": 9,
    "n": 10,
    "b": 11,
    "r": 12,
    "q": 13,
    "k": 14,
}

KNIGHT = ((1, 2), (1, -2), (-1, 2), (-1, -2), (2, 1), (2, -1), (-2, 1), (-2, -1))
DIAG = ((1, 1), (1, -1), (-1, 1), (-1, -1))
ORTH = ((1, 0), (-1, 0), (0, 1), (0, -1))


def parse_sq(alg: str) -> int:
    return (ord(alg[0]) - 97) + 8 * (ord(alg[1]) - 49)


def parse_fen(fen: str) -> tuple[list[int], int, str, int]:
    """Return (board[64], stm ±1, castling, ep_sq or -1)."""
    parts = fen.strip().split()
    board = [0] * 64
    sq = 56
    for ch in parts[0]:
        if ch == "/":
            sq -= 16
            continue
        if ch.isdigit():
            sq += ord(ch) - 48
            continue
        board[sq] = PIECE[ch]
        sq += 1
    stm = 1 if parts[1] == "w" else -1
    castle = parts[2] if len(parts) > 2 else "-"
    ep = -1
    if len(parts) > 3 and parts[3] not in ("-", ""):
        ep = parse_sq(parts[3])
    return board, stm, castle, ep


def piece_count(board: list[int]) -> int:
    n = 0
    for p in board:
        if p:
            n += 1
    return n


def feature_index(piece: int, square: int, perspective: int) -> int:
    ptype = (piece & 7) - 1
    white = 1 <= piece <= 6
    sq = square ^ 56 if perspective == -1 else square
    own = white if perspective == 1 else (not white)
    plane = (0 if own else 6) + ptype
    return plane * 64 + sq


def features(board: list[int], perspective: int) -> list[int]:
    out: list[int] = []
    for sq, piece in enumerate(board):
        if piece:
            out.append(feature_index(piece, sq, perspective))
    return out


def board_from_features(feats: list[int], perspective: int) -> list[int]:
    """Invert `features()`. Used to score PeSTO on hold-out packs that store only indices."""
    board = [0] * 64
    for feat in feats:
        plane = int(feat) // 64
        sq_p = int(feat) % 64
        ptype = plane % 6
        own = plane < 6
        if perspective == 1:
            square = sq_p
            white = own
        else:
            square = sq_p ^ 56
            white = not own
        board[square] = (ptype + 1) if white else (ptype + 1) + 8
    return board


def _ray_hit(board: list[int], target: int, df: int, dr: int) -> int:
    f = (target & 7) + df
    r = (target >> 3) + dr
    while 0 <= f <= 7 and 0 <= r <= 7:
        p = board[r * 8 + f]
        if p:
            return p
        f += df
        r += dr
    return 0


def attacked(board: list[int], target: int, by: int) -> bool:
    tf = target & 7
    tr = target >> 3
    pawn = 1 if by == 1 else 9
    pr = tr + (-1 if by == 1 else 1)
    if 0 <= pr <= 7:
        for df in (-1, 1):
            f = tf + df
            if 0 <= f <= 7 and board[pr * 8 + f] == pawn:
                return True
    knight = 2 if by == 1 else 10
    for df, dr in KNIGHT:
        f, r = tf + df, tr + dr
        if 0 <= f <= 7 and 0 <= r <= 7 and board[r * 8 + f] == knight:
            return True
    king = 6 if by == 1 else 14
    for df in (-1, 0, 1):
        for dr in (-1, 0, 1):
            if df == 0 and dr == 0:
                continue
            f, r = tf + df, tr + dr
            if 0 <= f <= 7 and 0 <= r <= 7 and board[r * 8 + f] == king:
                return True
    bishop = 3 if by == 1 else 11
    queen = 5 if by == 1 else 13
    rook = 4 if by == 1 else 12
    for df, dr in DIAG:
        hit = _ray_hit(board, target, df, dr)
        if hit == bishop or hit == queen:
            return True
    for df, dr in ORTH:
        hit = _ray_hit(board, target, df, dr)
        if hit == rook or hit == queen:
            return True
    return False


def in_check(board: list[int], stm: int) -> bool:
    king = 6 if stm == 1 else 14
    ksq = -1
    for i, p in enumerate(board):
        if p == king:
            ksq = i
            break
    if ksq < 0:
        return True
    return attacked(board, ksq, -stm)


def uci_is_capture(board: list[int], ep: int, uci: str) -> bool:
    if not uci or len(uci) < 4:
        return False
    to = parse_sq(uci[2:4])
    if board[to]:
        return True
    fr = parse_sq(uci[:2])
    piece = board[fr]
    if ep >= 0 and to == ep and piece in (1, 9):
        return True
    return False


def is_early_opening(board: list[int], castle: str, ply: int | None) -> bool:
    if ply is not None and ply < 10:
        return True
    if ply is not None:
        return False
    # Lichess eval FENs omit clocks. 32 pieces and full castling is the ply<10 proxy.
    return piece_count(board) == 32 and "K" in castle and "Q" in castle and "k" in castle and "q" in castle
