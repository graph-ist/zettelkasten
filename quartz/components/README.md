# Custom Quartz Components

Questa documentazione descrive i componenti custom aggiunti a Quartz per migliorare la navigazione e la scoperta di connessioni nel grafo delle note.

## Panoramica dei contributi

### Componenti aggiunti

| Componente | Tipo | Descrizione |
|------------|------|-------------|
| **Co-Citations** | Sidebar destra | Note frequentemente citate insieme |
| **Similar Notes** | Sidebar destra | Note con connessioni simili (Jaccard) |
| **Suggested Links** | Sidebar destra | Link potenziali da creare (Adamic-Adar) |
| **Community** | Sidebar destra | Note nello stesso cluster tematico |
| **Virtual Linker** | Content processing | Auto-linking del testo |

### Modifiche estetiche

- Design uniforme per tutte le sezioni della sidebar
- Percentuali allineate a destra per ogni voce
- Text-overflow con ellipsis (`...`) per titoli lunghi
- Collapsible sections con animazioni smooth

---

# Virtual Linker

## Descrizione

Il Virtual Linker trasforma automaticamente il testo che corrisponde a titoli o alias di altre note in link cliccabili, senza dover creare manualmente i wikilink.

## Come funziona

1. **Caricamento**: Al caricamento della pagina, scarica l'indice dei contenuti (`contentIndex.json`)
2. **Indexing**: Costruisce una mappa di tutti i titoli e alias → slug delle note
3. **Scanning**: Scansiona il testo dell'articolo cercando match
4. **Linking**: Sostituisce i match con link cliccabili

## Caratteristiche

- **Case-insensitive**: "Kant" e "kant" matchano entrambi
- **Word boundaries**: Matcha solo parole intere (non "Kantiano" se cerchi "Kant")
- **Priorità lunghezza**: Termini più lunghi hanno priorità (evita match parziali)
- **Disambiguazione**: Se più note matchano lo stesso termine, mostra un selettore
- **Esclusioni**: Non processa heading, code blocks, link esistenti
- **Mermaid support**: Funziona anche nei diagrammi Mermaid

## Esempio

Testo originale:
```
Kant sviluppò la sua filosofia critica in risposta a Hume.
```

Risultato (se esistono note "Kant" e "Hume"):
```html
<a href="/Kant" class="virtual-link">Kant</a> sviluppò la sua filosofia 
critica in risposta a <a href="/Hume" class="virtual-link">Hume</a>.
```

## Stile visivo

I virtual link hanno uno stile leggermente diverso dai link normali per distinguerli:
- Stesso colore dei link normali
- Sottolineatura tratteggiata (dashed) invece che continua

## File

- `VirtualLinker.tsx` - Componente wrapper
- `scripts/virtualLinker.inline.ts` - Logica di auto-linking
- `styles/virtualLinker.scss` - Stili CSS

---

# Graph Analysis Components

## Overview

| Componente | Algoritmo | Cosa misura |
|------------|-----------|-------------|
| **Co-Citations** | Co-citation frequency | Note citate insieme alla nota corrente |
| **Similar Notes** | Jaccard Similarity | Note con connessioni simili |
| **Suggested Links** | Adamic-Adar Index | Link potenziali da creare |
| **Community** | Label Propagation + Clustering Coefficient | Note nello stesso cluster tematico |

---

## Co-Citations

### Descrizione
Mostra le note che vengono frequentemente citate insieme alla nota corrente. Se due note appaiono spesso nello stesso contesto (cioè sono linkate dalle stesse pagine), probabilmente hanno un'affinità concettuale.

### Algoritmo
```
Score(B) = (numero di pagine che citano sia A che B) / (numero totale di pagine che citano A) × 100
```

### Esempio
Se la nota "Kant" è citata da 10 pagine, e 6 di queste citano anche "Hume", allora:
- Score di Hume = 6/10 × 100 = **60%**

### Parametri
| Parametro | Default | Descrizione |
|-----------|---------|-------------|
| `minScore` | 30 | Percentuale minima per essere mostrato |
| `maxItems` | 20 | Numero massimo di risultati |

### Interpretazione
- **>70%**: Forte affinità concettuale
- **50-70%**: Buona correlazione
- **30-50%**: Correlazione moderata

---

## Similar Notes (Jaccard Similarity)

### Descrizione
Trova note che hanno un "vicinato" simile nel grafo. Due note sono simili se condividono molti vicini (link in entrata e in uscita).

### Algoritmo
```
Jaccard(A, B) = |vicini_comuni| / |tutti_vicini|
             = |N(A) ∩ N(B)| / |N(A) ∪ N(B)|
```

Dove:
- **N(A)** = insieme dei vicini della nota A (link in + link out)
- **∩** = intersezione (vicini comuni)
- **∪** = unione (tutti i vicini di entrambi)

### Esempio
- Nota A ha vicini: {Kant, Hume, Locke, Berkeley}
- Nota B ha vicini: {Kant, Hume, Descartes}
- Intersezione: {Kant, Hume} → 2 elementi
- Unione: {Kant, Hume, Locke, Berkeley, Descartes} → 5 elementi
- Jaccard = 2/5 = **40%**

### Parametri
| Parametro | Default | Descrizione |
|-----------|---------|-------------|
| `minScore` | 0.15 (15%) | Score minimo per essere mostrato |
| `maxItems` | 10 | Numero massimo di risultati |

### Interpretazione
- **>30%**: Molto simili
- **20-30%**: Simili
- **15-20%**: Correlazione lieve

---

## Suggested Links (Adamic-Adar Index)

### Descrizione
Predice quali link potrebbero essere aggiunti al grafo. Suggerisce note non ancora collegate direttamente ma che condividono vicini comuni.

### Algoritmo
```
Adamic-Adar(A, B) = Σ 1/log(grado(z))   per ogni vicino comune z
```

Dove:
- **z** = vicino comune tra A e B
- **grado(z)** = numero di connessioni del nodo z

L'intuizione è che i **vicini rari** (con poche connessioni) sono più significativi dei vicini molto connessi (hub).

### Normalizzazione
Il punteggio viene normalizzato a percentuale:
```
Score = (AA score) / (max theoretical AA) × 100
```
Dove max theoretical AA = numero di vicini comuni × 1/log(2) ≈ 1.44

### Esempio
Note A e B condividono 2 vicini:
- Vicino X con grado 3: contributo = 1/log(3) ≈ 0.91
- Vicino Y con grado 10: contributo = 1/log(10) ≈ 0.43
- AA score = 0.91 + 0.43 = 1.34
- Max possibile = 2 × 1.44 = 2.88
- Score = 1.34/2.88 × 100 ≈ **47%**

### Parametri
| Parametro | Default | Descrizione |
|-----------|---------|-------------|
| `minScore` | 50 | Percentuale minima |
| `maxItems` | 10 | Numero massimo |
| `algorithm` | 'adamic-adar' | Alternativa: 'common-neighbors' |

### Interpretazione
- **>70%**: Forte raccomandazione di creare il link
- **50-70%**: Buon suggerimento
- **<50%**: Non mostrato

---

## Community (Label Propagation)

### Descrizione
Identifica cluster tematici nel grafo usando Label Propagation, poi ordina i membri per Clustering Coefficient.

### Algoritmo: Label Propagation

1. **Inizializzazione**: ogni nodo riceve un'etichetta unica
2. **Iterazione** (10 volte per default):
   - Per ogni nodo (in ordine casuale):
   - Conta le etichette dei vicini
   - Adotta l'etichetta più comune
3. **Risultato**: nodi con la stessa etichetta = stessa community

### Algoritmo: Clustering Coefficient

Misura quanto i vicini di un nodo sono interconnessi tra loro:

```
Clustering(v) = (2 × link_tra_vicini) / (num_vicini × (num_vicini - 1))
              = 2e / k(k-1)
```

Dove:
- **e** = numero di link tra i vicini di v
- **k** = numero di vicini di v

### Esempio
Nodo con 4 vicini (A, B, C, D):
- Connessioni possibili tra vicini: 4×3/2 = 6
- Connessioni effettive: A-B, B-C, C-D = 3
- Clustering Coefficient = 3/6 = **50%**

### Parametri
| Parametro | Default | Descrizione |
|-----------|---------|-------------|
| `maxItems` | 15 | Numero massimo di membri |
| `iterations` | 10 | Iterazioni label propagation |

### Interpretazione del Clustering Coefficient
- **>60%**: Nodo molto centrale nella community
- **30-60%**: Buona integrazione
- **<30%**: Periferico alla community

---

# Note tecniche

## Grafo bidirezionale
Tutti gli algoritmi considerano il grafo come **non direzionato**. Se A linka B, sia A che B sono considerati vicini l'uno dell'altro.

## Normalizzazione slug
Gli slug sono normalizzati in lowercase e gli alias sono supportati per un matching più robusto.

## Performance
- I componenti di graph analysis calcolano le metriche a **build-time**
- Il Virtual Linker opera a **runtime** ma usa caching dell'indice

## Soglie minime applicate

Per evitare di mostrare correlazioni deboli o rumore, ogni componente applica una soglia minima:

| Componente | Soglia | Motivazione |
|------------|--------|-------------|
| **Co-Citations** | 30% | Solo note citate insieme in almeno 1/3 delle pagine |
| **Similar Notes** | 15% | Jaccard >15% indica sovrapposizione significativa dei vicini |
| **Suggested Links** | 50% | Solo suggerimenti con alta probabilità di essere utili |
| **Community** | nessuna | Mostra tutti i membri della stessa community |

Queste soglie sono state scelte empiricamente per bilanciare:
- **Rilevanza**: mostrare solo risultati significativi
- **Quantità**: avere abbastanza risultati da essere utili
- **Rumore**: evitare correlazioni spurie o casuali

---

# Struttura dei file

```
quartz/components/
├── CoCitations.tsx          # Componente co-citazioni
├── Similarity.tsx           # Componente note simili
├── LinkPrediction.tsx       # Componente link suggeriti
├── Community.tsx            # Componente community
├── VirtualLinker.tsx        # Componente auto-linking
├── scripts/
│   ├── cocitations.inline.ts
│   ├── similarity.inline.ts
│   ├── linkprediction.inline.ts
│   ├── community.inline.ts
│   └── virtualLinker.inline.ts
└── styles/
    ├── cocitations.scss
    ├── similarity.scss
    ├── linkprediction.scss
    ├── community.scss
    └── virtualLinker.scss
```

---

# Riferimenti

- **Jaccard Index**: Jaccard, P. (1912). "The distribution of the flora in the alpine zone"
- **Adamic-Adar**: Adamic, L. & Adar, E. (2003). "Friends and neighbors on the Web"
- **Label Propagation**: Raghavan et al. (2007). "Near linear time algorithm to detect community structures in large-scale networks"
- **Clustering Coefficient**: Watts, D.J. & Strogatz, S.H. (1998). "Collective dynamics of 'small-world' networks"
