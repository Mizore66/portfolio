import type { Metadata } from "next";
import { content } from "@/content/site";
import { Lab, type LabCopy } from "@/components/lab/Lab";
import tree from "@/content/lab-tree.json";
import type { TreeNode } from "@/content/lab-tree.gen";

const A = (content as unknown as { lab: { article: { title: string; description: string; gates: { elo: number; err: number; record: string }[] } } }).lab.article;
const L = (content.pageCopy as unknown as { lab: { open: Record<string, string>; chapters: LabCopy["chapters"] } }).lab;

export const metadata: Metadata = { title: "Lab", description: A.description };

export default function Page() {
  const c = A.gates[1];
  const copy: LabCopy = {
    open: {
      num: `${c.elo < 0 ? "−" : "+"}${Math.abs(c.elo).toFixed(1)}`, pm: `±${c.err} Elo`,
      qualifier: L.open.qualifier, qualifierPhone: L.open.qualifierPhone, lede: L.open.lede, body: L.open.body, voice: L.open.voice,
      share: "30.5%", record: c.record.split("–").map((n, i) => `${n} ${["wins", "draws", "losses"][i]}`).join(" · "),
    },
    chapters: L.chapters,
  };
  return <Lab copy={copy} tree={tree as TreeNode} />;
}
