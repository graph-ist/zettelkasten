---
cssclasses:
  - "[[Human Computer Interaction]]"
aliases:
  - Dictionary
  - Dizionario
  - Saliency
  - Salienza
  - Scanpath
  - Simulation
  - Simulazione
  - Bottom-up
  - Top-down
  - Fissazioni
  - Fixations
  - Attention
  - Model
  - Attenzione
  - Evaluation
  - Valutazione
  - Cognitive Load
  - Situational Awareness
  - SART
  - SAGAT
  - Consapevolezza Situazionale
  - Carico Cognitivo
tags:
  - Essay
---
###### Entropy Trend Slope

To quantify the directional evolution of visual uncertainty during each scanpath, we computed the linear regression slope of local entropy values over time. This measure, termed_ EntropyTrendSlope, _captures whether entropy increased (exploratory behavior) or decreased (convergent attention) across successive fixations. Positive slopes indicate increasing visual dispersion, while negative slopes reflect progressive focusing.

###### Scanpath Metrics (Aggregate per Simulazione)

|   |   |   |   |   |
|---|---|---|---|---|
|**Metrica**|**Unità**|**Significato computazionale**|**Interpretazione cognitiva**|**Esempio interpretativo**|
|**AttentionDrift**|pixel|Somma delle distanze euclidee tra fissazioni successive|Quantifica quanto il focus visivo si sposta nello spazio|Un drift alto indica una strategia esplorativa, uno basso indica focalizzazione|
|**EntropySlope**|bit/fixazione|Pendenza della regressione dell’entropia nel tempo|Rappresenta la variazione dell’incertezza spaziale mentre si esplora|Una pendenza negativa → aumento focalizzazione nel tempo|
|**EntropyChangeMagnitude**|bit|Media dei cambiamenti assoluti tra entropie successive|Stabilità vs. instabilità dell’attenzione|Valori alti → spostamenti instabili|
|**NetEntropyDrop**|bit|Differenza netta tra la prima e l’ultima entropia|Misura quanto il sistema visivo si è focalizzato|Se > 0 → aumento ordine/focalizzazione|
|**FixationsTo70%Saliency**|numero fissazioni|Quante fissazioni servono per coprire il 70% della salienza|Efficienza nel coprire le aree salienti|Valori bassi → esplorazione mirata|
|**FractalDimension**|adimensionale|Stima della complessità del percorso tramite box counting|Rappresenta quanto il pattern è ricorsivo o dispersivo|Valori > 1.5 → esplorazione caotica; vicini a 1 → più lineare|
|**CognitiveSalienceEffort**|unità relativa|Indice composito: EntropySlope × AttentionDrift ÷ FixationsTo70%Saliency|Proxy per lo sforzo cognitivo impiegato nell’organizzare lo scanpath|Più alto → sforzo visivo maggiore per integrare informazione|
|**ExplorationTime**|ms|Somma delle durate delle fissazioni|Tempo totale di esplorazione|2900 ms indica un’esplorazione sostenuta|
|**MeanFixationTime**|ms|Media delle durate delle fissazioni|Indice di elaborazione visiva per fissazione|Più alto → più elaborazione per punto|
|**RedundancyIndex**|% (0–1)|% di fissazioni che cadono nello stesso blocco spaziale|Misura quanto viene “ripassato” lo stesso punto|Se = 0 → fissazioni uniche, se > 0.3 → ritorni frequenti|

###### Fixation Metrics (Per Fissazione)

|   |   |   |   |   |
|---|---|---|---|---|
|**Metrica**|**Unità**|**Significato computazionale**|**Interpretazione cognitiva**|**Esempio interpretativo**|
|**Entropy**|bit|Entropia della salienza in una finestra 5×5|Misura l’incertezza dell’informazione nella zona fissata|Entropia alta → regione poco saliente o poco informativa|
|**EntropySlopeLocal**|bit|Variazione rispetto alla fissazione precedente|Variazione locale dell’incertezza|Negativo → focalizzazione, positivo → dispersione|
|**Saliency (%)**|%|Salienza relativa al valore massimo della mappa|Quanto il punto fissato è predetto come “interessante”|> 60% → fissazione coerente con la mappa saliente|
|**BlockSaliency (%)**|%|Media della salienza nel blocco 10×10 in cui cade la fissazione|Quanto è saliente l’area circostante|Usata per confrontare punti isolati vs. contesto|
|**DistFromSaliencyCenter**|pixel|Distanza dal centro di massa della salienza|Quanto si devia dal punto predetto più saliente|Basso → target foveale vicino|
|**DistanceFromLast**|pixel|Distanza dalla fissazione precedente|Misura il salto saccadico|Valori alti → shift maggiore|
|**Timestamp**|ms|Tempo assoluto dall’inizio|Posizionamento temporale|Utile per analisi temporale|
|**Duration**|ms|Quanto dura la fissazione|Tempo di elaborazione visiva locale|250 ms → elaborazione approfondita|
|**DistFromGeomCenter**|pixel|Distanza dal centro dell’immagine|Prossimità a regioni centrali|> 300 px → esplorazione periferica|

###### DeepGaze III come strumento esplorativo preliminare

This pre-analysis simulates human-like scanpaths using the DeepGaze III model—a deep neural network trained on extensive eye-tracking data. On standard benchmarks such as MIT1003, DeepGaze III achieves top performance across multiple metrics, including an AUC of 0.916, a normalized scanpath saliency (NSS) score of 3.257, and an average log-likelihood of 2.442 bits per fixation— outperforming the next best model by 0.360 bits/fixation. 

While DeepGaze III has been primarily trained on natural scenes, its use in this study is deliberately constrained to the early-stage selection of interface candidates for downstream evaluation. While the authors acknowledge that DeepGaze III does not capture all aspects of human scanpath behavior and can miss key patterns in individual images, the model still offers valuable insights into general visual attention mechanisms (Kümmerer et al., 2022). Thus, we do not claim predictive accuracy of user attention in GUIs; rather, we adopt the model as a heuristic tool to identify design variants that may warrant further investigation. This approach aligns with established design practices that advocate for lightweight modeling as a means to narrow the design space prior to user-centered validation (Oulasvirta et al., 2018). By leveraging the model’s general capacity to highlight visually prominent regions, we aim to support initial design differentiation without replacing empirical user testing. Importantly, all model-driven insights are subsequently validated through a human-in-the-loop study, ensuring that the final evaluation remains grounded in observed user behavior.

###### Related work

To simulate plausible scanpaths for GUI stimuli in an A/B testing context, we adopted three empirically grounded methodological choices. First, we simulate ten fixations per scanpath—an approximation aligned with the average scanpath lengths observed in free-viewing datasets such as MIT1003, which was used to train DeepGaze III and reflects naturalistic viewing conditions (Kümmerer et al., 2022; Judd et al., 2009). Second, the stimulus space was discretized into a 10×10 grid for region-based saliency aggregation. While this particular granularity is a design choice, it aligns with common practices in computational attention modeling, where the visual field is segmented into regular grids or tiles for saliency pooling or statistical computation (e.g., Manhattan grids in V1-based models: Zhang et al., 2012). This approach also reflects the localized processing characteristics of early visual cortex, where receptive fields in V1 tile the visual field with overlapping yet spatially specific responses. Finally, fixation durations were sampled from a log-normal distribution with a log-mean of μ = log(180 ms) and σ = 0.35. This approach reflects prior findings that fixation durations follow non-symmetric, heavy-tailed distributions well-approximated by a log-normal form, with our parameters aligning with empirically observed ranges for GUI-based visual tasks (Van Der Lans et al., 2011).

Early human‑factors research have been systematacly demostrating that operators often encounter difficulties when automated processes remain opaque. Endsley framed the problem as a lack of “system‑directed transparency,” which prevents accurate mental models of automated behaviour \citep{endsley.1995}. For instance, in a study on remotely‑piloted unmanned vehicle operations, Roth et al. observed that pilots could not discern the rationale behind autonomy‑generated manoeuvres and therefore failed to propose superior alternatives \citep{roth.2004}. Comparable observations have been reported in supervisory systems \citep{kaber.1999} and in advanced driver‑assistance systems (ADAS) \citep{lee.2004}, i.e., inadequate transparency consistently erodes both trust and performance.

Within road‑vehicle automation, futher ADAS studies have demonstrated that surfacing system uncertainty and forthcoming manoeuvres enhances user trust and acceptance \citep{stockert.2015, beller.2013}. However, surveys of Autonomous Vehicle (AV) prototypes reveal that decision logic is seldom exposed to end‑users \citep{cysneiros.2018}. Empirical evidence indicates that interaction with “black‑box” systems lowers trust calibration \citep{eiband.2018}. Lee and See warn that ill‑calibrated trust—either over‑ or under‑trust—threatens safety in dynamic environments \citep{lee.2004}, signalling transparency and predictability as prerequisites for cooperative control.

###### Bottom up vs top down

Attentional processes in human-computer interaction result from the interplay between bottom-up (visually salient stimuli) and top-down (driven by user goals) mechanisms. Classical computational models of visual salience estimate which areas of an interface would capture attention based on low-level features (e.g., contrast, motion) in the absence of specific tasks. For example, deep neural networks such as DeepGaze predict the most salient regions of an image using features trained on object recognition (https://doi.org/10.1167/jov.22.5.7). However, in the context of user interfaces, users' actual attention often deviates from purely bottom-up saliency maps. Top-down factors such as the current task and user expectations can override visual salience: users tend to focus on features relevant to their goal, even ignoring conspicuously salient features if not relevant to the task (https://doi.org/10.1145/3655610). 

This phenomenon is well known in cognitive psychology that explains the strong dissociation between structural visual salience and actual attention can emerge when bottom-up models do not incorporate the top-down influences of the user's context of use and cognitive state. In other words, what a computational model or a purely visual metric identifies as a visually prominent element in a layout does not always coincide with what is cognitively prominent or important to the user during a task. 

The dissociation between interface structure and user experience, has also been studied within constructs such as situational awareness. Fundamental situational awareness work has shown how users might feel safe and aware (via subjective assessment via SART) while lacking critical information (objectively assessed via SAGAT), or conversely might perceive high load and low subjective SA while actually maintaining a good objective understanding of the situation (Endsley et al., 1998). According to the authors, these findings have important implications. A dissociation between interface structure and SA can occur when the interface provides more information than the user can effectively handle, inducing a false sense of security or, conversely, information overload. 

These findings have also been consolidated in parallel strands of studies in cognitive workload, where research on the visual complexity of interfaces and its impact on perceived mental load and user performance has been identified. These findings converge in indicating that high visual complexity can result in higher mental load, lower satisfaction, and even alterations in subjective evaluations of experience.

Harper et al. were among the first to propose that the visual complexity of a Web page could function as an implicit measure of the cognitive load required of users (https://doi.org/10.1145/1456536.1456581). These findings converge in indicating that high visual complexity can result in higher mental load, lower satisfaction, and even alterations in subjective evaluations of the experience.