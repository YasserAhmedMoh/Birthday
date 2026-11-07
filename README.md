# 💗 A birthday surprise for Mira

A small website made as a birthday gift. It has a secret code gate, an envelope that opens, the birthday letter, and a final note.

## Files

| File | What it does |
|------|--------------|
| `index.html` | The page structure and all the text |
| `style.css` | Colors, layout and animations |
| `script.js` | Password check, envelope, confetti, hugs, music |

No build step and no libraries. Upload the three files and it works.

## Hosting it free on GitHub Pages

1. Sign in at https://github.com (or create a free account).
2. Click **+** (top right) → **New repository**.
3. Name it, for example `mira`, set it to **Public**, and click **Create repository**.
4. On the new repo page, click **uploading an existing file**, drag in `index.html`, `style.css`, `script.js` (and this README), then click **Commit changes**.
5. Go to **Settings** → **Pages** (left sidebar).
6. Under **Build and deployment** → **Source**, choose **Deploy from a branch**.
7. Under **Branch**, pick `main` and `/ (root)`, then click **Save**.
8. Wait 1–2 minutes and refresh. The link appears at the top of the Pages screen:
   `https://YOUR-USERNAME.github.io/mira/`

## Changing things

- **Text:** edit it directly in `index.html`.
- **Secret code:** it's stored as a hash, so the code isn't written anywhere in the files. To change it, open the live site, press `F12` → **Console**, type `mira.secretFor('NEWCODE')`, press Enter, and paste the number you get into `secretHash` at the top of `script.js`.
- **Music:** a soft music-box melody is built in, with no audio file needed. To use your own song, upload an `.mp3` (e.g. `music.mp3`) to the repo and set `musicFile: 'music.mp3'` at the top of `script.js`.
