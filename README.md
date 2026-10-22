# Personal desktop

Portfolio/CV bilingue italiano e inglese, reinterpretato come un desktop Windows
95/98. Su mobile diventa un telefono a colori dei primi anni 2000,
con scocca coordinata al tema, menu a icone e tasti funzionanti. I testi personali, i progetti, i contatti e il PDF del CV sono ancora
segnaposto. Nessun contenuto professionale è inventato e nessun link esterno è
pubblicato.

## Avvio e build

Richiede Node.js compatibile con Vite 8. Per i test UI servono anche
`agent-browser` e il relativo browser (`npm install -g agent-browser`,
poi `agent-browser install`).

```sh
npm install
npm run dev
npm test
npm run build
npm run preview
```

Il server di sviluppo indica la porta disponibile. La build statica è in `dist/`:
può essere pubblicata su GitHub Pages, anche sotto il percorso di una repository,
perché Vite genera collegamenti relativi. La pagina inglese è in `en/`.

## Pubblicazione automatica

Il workflow `.github/workflows/deploy.yml` pubblica il sito su GitHub Pages a ogni
push su `main`; può anche essere avviato manualmente dalla scheda Actions.
Installa le dipendenze dal lockfile con `npm ci`, esegue `npm run test:unit`,
genera la build Vite e pubblica esclusivamente `dist/`. Se un controllo o la build
fallisce, la versione già online rimane disponibile.

La sorgente Pages della repository deve essere impostata su **GitHub Actions**.
I test browser completi restano nel comando locale `npm test`; il deploy non
richiede l'installazione di agent-browser sul runner.

## Verifica automatica

`npm test` esegue i controlli del tema e delle pagine, genera la build e verifica
l’interfaccia in un browser reale. Il server temporaneo e la sessione del browser
vengono chiusi al termine, anche in caso di errore.

La verifica copre entrambe le lingue a 1440×900, 844×320, 701×600, 700×600,
390×844, 568×320 e 320×568: controlli visibili e cliccabili, finestre entro l’area desktop,
menu Start scorrevole e tutte le app raggiungibili nel display del telefono.
Alle dimensioni desktop e telefono standard esegue anche i controlli completi
delle interazioni, delle palette chiara/scura, delle tre modalità del tema e
delle animazioni con movimento normale e ridotto.

`npm run test:unit` esegue solo i controlli senza browser;
`npm run test:browser` genera la build ed esegue solo quelli UI.

## Interazioni

- Un clic su un’icona apre la relativa finestra. “Benvenuto” è già aperta all’ingresso.
- Le finestre si possono trascinare dalla barra del titolo e ridimensionare
  dall’angolo in basso a destra. La posizione rimane entro lo spazio visibile.
- I tre pulsanti della barra del titolo minimizzano, ingrandiscono/ripristinano
  e chiudono. Il doppio clic sulla barra ingrandisce/ripristina.
- La barra in basso elenca le finestre aperte. Un clic ripristina una finestra
  minimizzata; un clic sulla finestra attiva la minimizza.
- Il pulsante con il monitor mostra il desktop minimizzando tutte le finestre.
- Il menu Start offre accesso a tutte le sezioni.
- Su mobile la schermata iniziale è un menu a cinque app, con pad direzionale,
  selezione centrale, Menu/Indietro e accesso diretto tramite tocco.
- I numeri 1–5 aprono le cinque app nell’ordine del menu; il 6 non è assegnato. 7/8 scorrono il contenuto
  (o selezionano una riga nel menu), 9 cambia tema, * torna indietro, 0 apre il
  menu e # cambia lingua. I comandi hanno etichette accessibili con la funzione.
- Aprendo un’app, il display si espande e il tastierino si ritira. Menu e Indietro
  rimangono sempre sul display. I contenuti si scorrono normalmente con il touch.
- Le frecce di una tastiera fisica navigano il menu; durante la lettura Su/Giù
  scorrono il contenuto e Sinistra/Destra cambiano app. Escape torna al menu.
- Sotto i 600px di altezza si nascondono i tasti numerici; sotto i 450px
  si ritira anche il pad. Restano Menu/Indietro sul display, tocco e tastiera.
- Passando da desktop a mobile si torna al menu; il desktop conserva le finestre
  minimizzate, ripristinabili dalla barra delle applicazioni.
- La lingua cambia pagina; finestre e posizioni ripartono dallo stato iniziale.
- Il selettore del tema è sempre visibile nella barra desktop e nella barra
  superiore del telefono: Sistema / Chiaro / Scuro. Sistema segue anche i cambi
  di tema del dispositivo durante la visita; scegliere di nuovo Sistema elimina
  la precedente preferenza manuale. Le scelte manuali sono salvate localmente
  e sincronizzate fra schede e lingue. Nessun cookie, analytics o servizio esterno.

## Tastiera e accessibilità

Le icone sono collegamenti, le azioni sono pulsanti e le finestre sono dialoghi
non modali etichettati. Tab e Shift+Tab consentono di raggiungere i controlli.
Sulla barra del titolo, Alt + frecce sposta la finestra e Invio la ingrandisce o
ripristina. Sul controllo di ridimensionamento, le frecce cambiano le dimensioni.
Escape chiude la finestra selezionata; nel menu Start chiude il menu. Nel menu,
frecce, Home ed End spostano il focus tra le voci.

Finestre e menu Start compaiono con brevi animazioni a scatti; i contenuti
entrano con un piccolo movimento e le icone reagiscono a selezione e pressione.
Il cambio di tema sfuma brevemente le superfici. La preferenza di sistema
“Riduci movimento” disattiva queste animazioni e transizioni, mantenendo le interazioni. Senza JavaScript i contenuti restano leggibili in una pagina
continua. Il CV e i repository non ancora aggiunti sono esplicitamente indisponibili.

## Struttura

- `index.html`, `en/index.html`: pagine e contenuti localizzati.
- `assets/desktop.js`: stato delle finestre, focus, trascinamento, ridimensionamento,
  barra delle applicazioni, navigazione e orologio locale.
- `assets/style.css`: chrome retrò e due temi per il desktop.
- `assets/phone.css`, `assets/phone.js`: scocca del telefono, display adattivo,
  pad, tastierino, selezione delle app e navigazione mobile.
- `assets/favicon.svg`: icona originale. Le icone pixel sono SVG originali nelle pagine.
- `public/site.js`: tema iniziale prima del rendering e gestione della preferenza.
- `tests/theme.test.js`: verifica delle preferenze e della persistenza del tema.
- `tests/test_site.py`: integrità di entrambe le pagine e collegamenti locali.
- `tests/desktop.browser.js`: verifica interattiva da eseguire su una pagina appena
  caricata con agent-browser (strumento esterno, non una dipendenza del progetto).

```sh
agent-browser --session portfolio-test open http://127.0.0.1:5173/
agent-browser --session portfolio-test eval --stdin < tests/desktop.browser.js
agent-browser --session portfolio-test close
```

Il controllo desktop copre
apertura di più finestre, focus, spostamento e ridimensionamento da tastiera,
minimizzazione, ingrandimento/ripristino, chiusura, taskbar, menu Start, CV
indisponibile e overflow della pagina. Trascinamento e ridimensionamento con
puntatore vanno verificati con eventi reali del browser.

Il 3D, Three.js e i font esterni della precedente esplorazione sono stati rimossi.

Per il telefono usare una pagina appena caricata, senza un frammento nell’URL:

```sh
agent-browser --session phone-test open http://127.0.0.1:5173/
agent-browser --session phone-test set viewport 390 844
agent-browser --session phone-test eval --stdin < tests/phone.browser.js
agent-browser --session phone-test close
```

Ripetere su `/en/`, su schermi più piccoli e con movimento ridotto. Il controllo
verifica pad, selezione centrale, tocco, scorciatoie 1–5, display espanso, ritorno
al menu, scorrimento dei contenuti lunghi, tema, focus, cronologia del browser
e assenza di overflow.
La preferenza del tema è condivisa fra telefono e desktop. Il cambio lingua
apre la pagina localizzata e riparte dal menu del telefono.

## Palette condivise

I colori di desktop e telefono provengono dalle stesse variabili in
`assets/style.css`: bianco sporco, sabbia e grigi caldi nel tema chiaro; blu
inchiostro vicino al nero nel tema scuro. Scocca e tasti del telefono usano il
colore delle cornici desktop; display e finestre condividono la superficie di
lettura, barre e selezioni condividono i rispettivi colori. Le icone SVG seguono
il tema. `assets/phone.css` usa questi ruoli senza definire colori propri.

`tests/palette.browser.js` verifica i colori effettivi e il contrasto di dieci
coppie testo/sfondo. Eseguirlo con agent-browser in entrambi i temi, a larghezza
desktop e telefono, per controllare tutte e quattro le combinazioni:

```sh
agent-browser --session palette-test eval --stdin < tests/palette.browser.js
```
