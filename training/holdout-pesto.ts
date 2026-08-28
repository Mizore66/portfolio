#!/usr/bin/env npx tsx
/** Hold-out: learned vs PeSTO on a handful of quiet book positions. Not CI. */
import { readFileSync } from "node:fs";
import { configureEngine, evaluateHandcrafted, startPos } from "@/lib/chess/engine";
import { refreshAcc } from "@/lib/chess/nnue/accumulator";
import { decodeNnue } from "@/lib/chess/nnue/format";
import { evaluateNnue } from "@/lib/chess/nnue/infer";

const path = process.argv[2];
if (!path) throw new Error("usage: holdout-pesto.ts <opn2.bin>");
const net = decodeNnue(new Uint8Array(readFileSync(path)));
configureEngine({ evalMode: "learned", net });

const pos = startPos();
pos.net = net;
pos.acc = refreshAcc(pos.board, net);
const pesto = evaluateHandcrafted(pos);
const nnue = evaluateNnue(net, pos.acc, pos.side);
process.stdout.write(`net ${net.id}\nstart PeSTO ${pesto}  NNUE ${nnue}\n`);
configureEngine({ evalMode: "handcrafted", net: null });
