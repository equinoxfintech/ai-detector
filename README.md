# AI Detector

Kleine Webanwendung: Text einf&uuml;gen, Score erhalten, wie wahrscheinlich der Text
von einer KI generiert bzw. von einem Menschen geschrieben wurde (&auml;hnlich wie
[Pangram](https://www.pangram.com/)).

Die Bewertung nutzt [TypeSafe](https://typesafe.ai) (`@typesafe-ai/sdk`): eine
`noul`-Frage ("Wurde `text` von einer KI generiert?") liefert eine kalibrierte
Wahrscheinlichkeit zwischen 0 und 1, die als KI-/Mensch-Score angezeigt wird.

## Setup

```sh
npm install
cp .env.example .env
# TYPESAFE_API_KEY in .env eintragen
npm start
```

Die App l&auml;uft anschlie&szlig;end unter <http://localhost:3000>.

## Entwicklung

```sh
npm run dev   # startet den Server mit Auto-Reload
npm test      # f&uuml;hrt die Tests aus (node:test)
```

## Architektur

- `src/server.js` &ndash; Express-Server, liefert das Frontend aus `public/` aus und
  stellt `POST /api/detect` bereit.
- `src/typesafeClient.js` &ndash; kapselt den Aufruf der TypeSafe-API (`noul`-Frage)
  und wandelt die Antwort in KI-/Mensch-Scores plus Verdict um.
- `public/` &ndash; einfaches Frontend (Textarea, Score-Balken, Verdict).

Der API-Key bleibt serverseitig (`TYPESAFE_API_KEY`), der Browser sieht ihn nie.

## API

`POST /api/detect`

```json
{ "text": "..." }
```

Antwort:

```json
{
  "aiProbability": 0.87,
  "humanProbability": 0.13,
  "aiScore": 87,
  "humanScore": 13,
  "verdict": "likely_ai",
  "model": "jev-latest"
}
```

Text muss zwischen 40 und 20.000 Zeichen lang sein.
