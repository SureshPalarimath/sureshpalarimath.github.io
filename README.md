# sureshpalarimath.github.io

Personal academic website of Dr. Suresh Palarimath. Plain HTML, CSS and JavaScript, so there is no build step and GitHub Pages serves it as is.

## Files

| File | What it is |
|---|---|
| `index.html`, `about.html`, `research.html`, `teaching.html`, `publications.html`, `books.html`, `patents.html`, `experience.html`, `achievements.html`, `contact.html` | The pages |
| `style.css` | All styling (light and dark themes) |
| `script.js` | Menu, theme toggle, live numbers, publication search and filters |
| `data.js` | **Edit this file to update the site's content**: headline numbers, publications, books, patents and grants |
| `data/metrics.json` | Google Scholar citations and h-index (updated daily by the GitHub Action) |
| `assets/` | Photo, favicon and CV PDF |
| `journal-publications.html` and the other three old publication pages | Redirects, so old links still work |
| `.github/workflows/update-scholar.yml`, `scripts/update_scholar.py` | Daily Google Scholar update |

## Uploading to GitHub

1. Open the repository `sureshpalarimath/sureshpalarimath.github.io`.
2. Delete the old `light-theme.css` (no longer used). Keep the old repository otherwise; the new files replace the old ones with the same names.
3. Choose **Add file > Upload files** and drag in everything from this folder **except** the `.github` folder (browsers often skip hidden folders).
4. Create the workflow by hand: **Add file > Create new file**, type the name `.github/workflows/update-scholar.yml`, paste the contents of that file, and commit.
5. Replace `assets/Dr-Suresh-Palarimath-CV.pdf` with your latest CV, keeping the same file name.

## Updating content

- **New paper:** open `data.js`, copy one entry in `PUBLICATIONS`, and change the fields. `type` is `journal`, `conference` or `chapter`. Add `"selected": true` to show it on the home and research pages. The counts on the Publications page update themselves.
- **Headline numbers:** change the `SITE` block at the top of `data.js` (`publications`, `textbooks`, `patents`, `funding`).
- **New grant:** add an entry to `GRANTS` in `data.js`. One of the seven grants is not listed yet.

## Daily Google Scholar numbers

Google Scholar has no official API and blocks automated requests from servers, so the Action uses SerpApi, which has a free plan with enough searches for one run a day.

1. Create a free account at serpapi.com and copy your API key.
2. In the repository, go to **Settings > Secrets and variables > Actions > New repository secret**. Name it `SERPAPI_KEY` and paste the key.
3. Go to **Settings > Actions > General > Workflow permissions** and choose **Read and write permissions**.
4. Open the **Actions** tab, choose **Update Google Scholar metrics**, and click **Run workflow** to test it.

After that it runs every morning and updates citations, h-index and i10-index on the site. If the key is missing or the run fails, the site keeps showing the last saved values. Publication counts stay manual (in `data.js`), because Google Scholar also counts preprints and duplicates.
