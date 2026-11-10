// 글 맨 위 photo: 주소의 사진(Higgsfield 등)을 받아 썸네일로 줄여 저장해요. GitHub Actions에서 실행해요.
//   site/img/posts/<slug>-sq.jpg  : 목록용 정사각 480px
//   site/img/posts/<slug>.jpg     : 공유 이미지용 1200x630
// 사진을 못 받으면 원래 그림 썸네일(scripts/thumbs.py로 만든 것)이 그대로 쓰여요.
import { readdir, readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { createHash } from "node:crypto";
import sharp from "sharp";

const files = (await readdir("posts")).filter(n => n.endsWith(".md"));
await mkdir("site/img/posts", { recursive: true });
await mkdir(".photo-cache", { recursive: true });  // 한 번 받은 원본은 여기에 보관 (Actions 캐시)
let ok = 0, fail = 0;
for (const n of files) {
  const src = await readFile(`posts/${n}`, "utf8");
  const head = (src.match(/^---\s*\n([\s\S]*?)\n---/) || [])[1] || "";
  const slug = (head.match(/^slug:\s*"?([^"\n]+)"?/m) || [])[1];
  const photo = (head.match(/^photo:\s*"?([^"\n]+)"?/m) || [])[1];
  if (!slug || !photo) continue;
  try {
    const cache = `.photo-cache/${createHash("sha1").update(photo.trim()).digest("hex")}`;
    let buf;
    if (existsSync(cache)) buf = await readFile(cache);
    else {
      const res = await fetch(photo.trim());
      if (!res.ok) throw new Error("HTTP " + res.status);
      buf = Buffer.from(await res.arrayBuffer());
      await writeFile(cache, buf);
    }
    await sharp(buf).resize(480, 480, { fit: "cover" }).jpeg({ quality: 82, mozjpeg: true }).toFile(`site/img/posts/${slug.trim()}-sq.jpg`);
    await sharp(buf).resize(1200, 630, { fit: "cover", position: "centre" }).jpeg({ quality: 82, mozjpeg: true }).toFile(`site/img/posts/${slug.trim()}.jpg`);
    ok++;
  } catch (e) { fail++; console.error(`사진 실패 ${slug}: ${e.message}`); }
}
console.log(`사진 썸네일 ${ok}개 저장, 실패 ${fail}개`);
