import asyncio
import edge_tts
from pathlib import Path

VOICE = "en-GB-ThomasNeural"
OUT_DIR = Path(__file__).resolve().parent.parent / "public" / "sounds" / "commentary"

LINES = {
    1: "Kylian Mbappe! The French sensation!",
    2: "Erling Haaland! What a machine!",
    3: "Vinicius Junior! Pure Brazilian magic!",
    4: "Lionel Messi! The greatest of all time!",
    5: "Mohamed Salah! The Egyptian King!",
    7: "Cristiano Ronaldo! And he scores! Siiuuu!",
    8: "Lamine Yamal! The wonderkid!",
    10: "Harry Kane! England's captain!",
    11: "Lyle Foster! Bafana Bafana's striker!",
    12: "Relebohile Mofokeng! Orlando Pirates star!",
}


async def generate_one(player_id: int, text: str) -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    out_file = OUT_DIR / f"player-{player_id}.mp3"
    communicate = edge_tts.Communicate(text, VOICE, rate="+8%", pitch="+2Hz")
    await communicate.save(str(out_file))
    print(f"Wrote {out_file.name}")


async def main() -> None:
    await asyncio.gather(*(generate_one(pid, text) for pid, text in LINES.items()))


if __name__ == "__main__":
    asyncio.run(main())