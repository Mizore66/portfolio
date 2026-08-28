import { Masthead } from "@/components/opening/Masthead";
import { OpeningApp } from "@/components/opening/OpeningApp";
import { StickyBoardStatic } from "@/components/opening/StickyBoardStatic";

export default function Home() {
  return <OpeningApp masthead={<Masthead />} staticBoard={<StickyBoardStatic />} />;
}
