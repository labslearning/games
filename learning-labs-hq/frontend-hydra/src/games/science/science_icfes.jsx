import React, { Suspense, useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Sparkles, Html, Grid } from '@react-three/drei';
import { EffectComposer, Bloom, ChromaticAberration, Scanline } from '@react-three/postprocessing';
import * as THREE from 'three';
import { useGameStore } from '../../store/useGameStore';

/* ============================================================
   🌌 CONSTANTES GLOBALES BLINDADAS
============================================================ */
const VECTOR_EXP = new THREE.Vector2(0.02, 0.02);
const VECTOR_NORM = new THREE.Vector2(0.002, 0.002);
const SPHERE_GEOM = new THREE.SphereGeometry(0.6, 32, 32);

// API KEY DEEPSEEK (GOD TIER INTEGRATION)
const DEEPSEEK_API_KEY = "sk-2a7f2964d1e34ebe90f176a986367360";
const DEEPSEEK_URL = "https://api.deepseek.com/chat/completions";

/* ============================================================
   🛡️ 1. ESCUDO ANTI-CRASH (ERROR BOUNDARY DE GRADO MILITAR)
============================================================ */
class GameErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false, errorMsg: "" }; }
  static getDerivedStateFromError(error) { return { hasError: true, errorMsg: error.toString() }; }
  componentDidCatch(error, errorInfo) { console.error("Quantum Core Error:", error, errorInfo); }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ width: '100vw', height: '100vh', background: '#050000', color: '#00f2ff', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', fontFamily: 'monospace', padding: 'clamp(20px, 5vw, 40px)', textAlign:'center', zIndex: 9999, boxSizing: 'border-box' }}>
          <h1 style={{ fontSize: 'clamp(24px, 6vw, 60px)', textShadow: '0 0 30px #f00', color: '#ff0033' }}>⚠️ FATAL BIOLOGY CORE ERROR</h1>
          <p style={{ background: 'rgba(255,0,0,0.1)', padding: 'clamp(15px, 4vw, 20px)', borderRadius: '10px', border:'1px solid #f00', maxWidth:'800px', width: '100%', fontSize: 'clamp(14px, 3.5vw, 18px)', color: '#fff', wordWrap: 'break-word' }}>{this.state.errorMsg}</p>
          <button onClick={() => { window.localStorage.removeItem('icfes_biology_telemetry_v1'); window.location.reload(); }} style={{ marginTop: '30px', padding: 'clamp(12px, 3vw, 15px) clamp(20px, 5vw, 30px)', fontSize: 'clamp(14px, 4vw, 18px)', cursor: 'pointer', background: '#ff0033', color: '#fff', border: 'none', borderRadius: '8px', fontWeight:'bold', textTransform: 'uppercase' }}>Reignite DNA Core (Clear Cache)</button>
        </div>
      );
    }
    return this.props.children;
  }
}

/* ============================================================
   🧠 2. MOTOR GENERATIVO DE BIOLOGÍA (ALGORITMO MULTI-IDIOMA)
============================================================ */
class IcfesEngine {
  
  static getTopicName(topicId, lang) {
      const mockQ = this.generateQuestion(lang, topicId);
      return mockQ.topic || topicId.replace(/_/g, ' ');
  }

  static generateQuestion(lang, forcedTopic = null) {
    const topics = [
      'BIOLOGIA_CELULAR_Y_MEMBRANA', 'ECOLOGIA_Y_ECOSISTEMAS', 'SINTESIS_DE_PROTEINAS', 
      'GENETICA_MENDELIANA', 'SISTEMAS_ORGANICOS', 'EVOLUCION_Y_ADAPTACION', 
      'CICLOS_BIOGEOQUIMICOS', 'FOTOSINTESIS_Y_RESPIRACION', 'REDES_TROFICAS', 'METODO_CIENTIFICO_BIO'
    ];
    const selectedTopic = forcedTopic || topics[Math.floor(Math.random() * topics.length)];

    switch (selectedTopic) {
      case 'BIOLOGIA_CELULAR_Y_MEMBRANA': return this.genCellBiology(lang);
      case 'ECOLOGIA_Y_ECOSISTEMAS': return this.genEcosystems(lang);
      case 'SINTESIS_DE_PROTEINAS': return this.genProteinSynthesis(lang);
      case 'GENETICA_MENDELIANA': return this.genGenetics(lang);
      case 'EVOLUCION_Y_ADAPTACION': return this.genEvolution(lang);
      case 'SISTEMAS_ORGANICOS': return this.genOrganSystems(lang);
      // Fallbacks para reusar lógicas afines:
      case 'CICLOS_BIOGEOQUIMICOS': return this.genEcosystems(lang);
      case 'FOTOSINTESIS_Y_RESPIRACION': return this.genCellBiology(lang);
      case 'REDES_TROFICAS': return this.genEcosystems(lang);
      case 'METODO_CIENTIFICO_BIO': return this.genEvolution(lang);
      default: return this.genCellBiology(lang);
    }
  }

  static generateLocalMasterclass(topic, lang) {
      const q = this.generateQuestion(lang, topic);
      return {
          title: `ENTRENAMIENTO TÁCTICO: ${q.topic}`,
          theory: `[SISTEMA AISLADO DE DEEPSEEK]\n\nEl núcleo teórico de ${q.topic} evalúa tu capacidad para conectar conceptos macro (ecosistemas, evolución) con fenómenos micro (células, genética). El ICFES en Biología no premia la memorización, sino la interpretación de sistemas vivos.\n\nLa clave biológica está en leer las gráficas poblacionales y comprender el flujo de materia y energía.`,
          trap: "El ICFES suele emplear distractores teleológicos: opciones que afirman que los animales 'deciden' cambiar o adaptarse por voluntad propia, lo cual va en contra de la biología real.",
          protocol: "1. Identifica el nivel de organización (célula, individuo, población).\n2. Examina las variables biológicas dependientes.\n3. Descarta opciones antropomórficas.\n4. Verifica que la respuesta respete leyes como la conservación de la materia.",
          demoQuestion: { text: q.text, options: q.options, correctIdx: q.correctIdx, analysis: q.microclass }
      };
  }

  // 🛠️ FUNCIÓN BARAJEADORA MAESTRA (Asegura opciones en el idioma correcto)
  static buildShuffledQuestion(id, lang, textsData) {
      const data = textsData[lang] || textsData['es'];
      // opts[0] siempre es la correcta en la base de datos, luego se barajan
      const items = data.opts.map((opt, index) => ({
          text: opt,
          trap: data.traps[index],
          isCorrect: index === 0
      }));
      
      // Algoritmo de Barajado (Fisher-Yates style)
      items.sort(() => Math.random() - 0.5);
      const correctIdx = items.findIndex(item => item.isCorrect);
      
      return {
          id: id,
          isAi: false,
          topic: data.topic,
          text: data.text,
          options: items.map(i => i.text),
          correctIdx: correctIdx,
          hint: data.hint,
          microclass: data.micro,
          trapExplanations: items.map(i => i.trap)
      };
  }

  static genCellBiology(lang) {
    const texts = {
      es: {
        topic: 'BIOLOGÍA CELULAR', text: `Cuando una célula requiere absorber un nutriente en específico, y este se encuentra en MENOR concentración afuera que en el citoplasma, ocurre el "transporte activo". ¿Cuál es el requisito indispensable para que esto suceda?`, hint: "Mover algo en contra de su flujo natural requiere 'trabajo' metabólico.", micro: `El transporte pasivo mueve partículas de mayor a menor concentración. El transporte ACTIVO va en contra del gradiente (de menor a mayor), por lo que la célula debe gastar energía metabólica (ATP).`,
        opts: ["Gasto de energía (ATP) en contra del gradiente.", "Movimiento pasivo a favor del gradiente.", "Tamaño microscópico del soluto.", "Equilibrio isotónico entre medios."],
        traps: [null, "Ese es el transporte pasivo (difusión simple).", "El tamaño facilita la difusión, pero no define el transporte activo.", "Si hay equilibrio isotónico, el flujo neto es cero."]
      },
      en: {
        topic: 'CELL BIOLOGY', text: `When a cell needs to absorb a specific nutrient, and it is in LOWER concentration outside than inside, "active transport" occurs. What is the indispensable requirement for this?`, hint: "Moving something against natural flow requires metabolic 'work'.", micro: `Active transport moves substances AGAINST the concentration gradient (low to high), which strictly requires the cell to expend metabolic energy (ATP).`,
        opts: ["Energy expenditure (ATP) against the gradient.", "Passive movement along the gradient.", "Microscopic size of the solute.", "Isotonic equilibrium between mediums."],
        traps: [null, "That defines passive transport (diffusion).", "Size facilitates diffusion, doesn't define active transport.", "In isotonic equilibrium, net flow is zero."]
      },
      fr: {
        topic: 'BIOLOGIE CELLULAIRE', text: `Lorsqu'une cellule absorbe un nutriment en concentration PLUS FAIBLE à l'extérieur qu'à l'intérieur, c'est un "transport actif". Quelle est l'exigence indispensable ?`, hint: "Déplacer quelque chose contre son flux nécessite un 'travail'.", micro: `Le transport actif va à l'encontre du gradient (de faible à fort), ce qui oblige la cellule à dépenser de l'énergie métabolique (ATP).`,
        opts: ["Dépense d'énergie (ATP) contre le gradient.", "Mouvement passif selon le gradient.", "Taille microscopique du soluté.", "Équilibre isotonique."],
        traps: [null, "C'est le transport passif (diffusion).", "La taille ne définit pas le travail actif.", "En équilibre isotonique, le flux net est nul."]
      },
      de: {
        topic: 'ZELLBIOLOGIE', text: `Wenn eine Zelle einen Nährstoff aufnimmt, dessen Konzentration außen GERINGER ist als innen, findet "aktiver Transport" statt. Was ist die unverzichtbare Voraussetzung?`, hint: "Etwas gegen den natürlichen Strom zu bewegen, erfordert Arbeit.", micro: `Aktiver Transport erfolgt GEGEN den Konzentrationsgradienten, was zwingend erfordert, dass die Zelle Stoffwechselenergie (ATP) verbraucht.`,
        opts: ["ATP-Verbrauch gegen den Gradienten.", "Passive Bewegung entlang des Gradienten.", "Mikroskopische Größe des Stoffes.", "Isotonisches Gleichgewicht."],
        traps: [null, "Das ist passive Diffusion.", "Größe definiert nicht die aktive Arbeit.", "Im isotonischen Gleichgewicht ist der Nettofluss null."]
      }
    };
    return this.buildShuffledQuestion('BIOLOGIA_CELULAR_Y_MEMBRANA', lang, texts);
  }

  static genEcosystems(lang) {
    const texts = {
      es: {
        topic: 'ECOSISTEMAS', text: `Se cultivan algas. Acuario 1 (solo Fósforo): no crecen. Acuario 2 (solo Nitrógeno): no crecen. Acuario 3 (Nitrógeno + Fósforo): crecimiento masivo. Acuario 4 (Micronutrientes): no crecen. ¿Qué se concluye sobre los limitantes?`, hint: "Observa qué ocurre cuando están solos vs cuando están juntos.", micro: `El crecimiento masivo solo se dispara cuando ambos elementos están presentes simultáneamente. Esto indica que tanto Nitrógeno como Fósforo actúan como factores limitantes co-dependientes.`,
        opts: ["Ambos nutrientes (N y P) son factores limitantes en conjunto.", "Solo el fósforo es limitante.", "Los micronutrientes son tóxicos.", "Solo el nitrógeno es limitante."],
        traps: [null, "El Acuario 1 probó que el fósforo solo no basta.", "No hubo toxicidad, simplemente falta de nutrientes clave.", "El Acuario 2 probó que el nitrógeno solo no basta."]
      },
      en: {
        topic: 'ECOSYSTEMS', text: `Algae cultivated. Tank 1 (Phosphorus only): no growth. Tank 2 (Nitrogen only): no growth. Tank 3 (N + P): massive growth. Tank 4 (Micronutrients): no growth. Ecological conclusion?`, hint: "Observe alone vs together.", micro: `Massive growth only triggers when both are present. Both Nitrogen and Phosphorus act as co-dependent limiting factors.`,
        opts: ["Both nutrients (N and P) are co-dependent limiting factors.", "Only phosphorus is limiting.", "Micronutrients are toxic.", "Only nitrogen is limiting."],
        traps: [null, "Tank 1 proved Phosphorus alone isn't enough.", "No toxicity, just lack of key elements.", "Tank 2 proved Nitrogen alone isn't enough."]
      },
      fr: {
        topic: 'ÉCOSYSTÈMES', text: `Algues cultivées. Bac 1 (Phosphore): pas de croissance. Bac 2 (Azote): pas de croissance. Bac 3 (N + P): croissance massive. Bac 4 (Micronutriments): pas de croissance. Conclusion ?`, hint: "Seul vs ensemble.", micro: `La croissance massive ne se déclenche que lorsque les deux sont présents simultanément. Les deux sont des facteurs limitants co-dépendants.`,
        opts: ["L'Azote et le Phosphore sont des facteurs limitants conjoints.", "Seul le phosphore limite.", "Les micronutriments sont toxiques.", "Seul l'azote limite."],
        traps: [null, "Le Bac 1 prouve que le P seul ne suffit pas.", "Pas de toxicité, juste un manque de nutriments.", "Le Bac 2 prouve que le N seul ne suffit pas."]
      },
      de: {
        topic: 'ÖKOSYSTEME', text: `Algen kultiviert. Tank 1 (nur Phosphor): kein Wachstum. Tank 2 (nur Stickstoff): kein Wachstum. Tank 3 (N + P): massives Wachstum. Tank 4 (Mikronährstoffe): kein Wachstum. Fazit?`, hint: "Allein vs zusammen.", micro: `Wachstum wird nur ausgelöst, wenn beide vorhanden sind. Beide wirken als voneinander abhängige begrenzende Faktoren.`,
        opts: ["Beide Nährstoffe (N und P) sind begrenzende Faktoren.", "Nur Phosphor ist begrenzend.", "Mikronährstoffe sind toxisch.", "Nur Stickstoff ist begrenzend."],
        traps: [null, "Tank 1 bewies, dass Phosphor allein nicht ausreicht.", "Keine Toxizität, nur Mangel an Schlüsselelementen.", "Tank 2 bewies, dass Stickstoff allein nicht ausreicht."]
      }
    };
    return this.buildShuffledQuestion('ECOLOGIA_Y_ECOSISTEMAS', lang, texts);
  }

  static genProteinSynthesis(lang) {
    const texts = {
      es: {
        topic: 'SÍNTESIS DE PROTEÍNAS', text: `Las células requieren aminoácidos esenciales de la dieta. Si una persona sufre desnutrición severa y carece de ellos, ¿qué proceso genético celular se interrumpirá directamente?`, hint: "Los aminoácidos son los ladrillos que se unen al final del proceso.", micro: `El ensamblaje físico ocurre durante la 'traducción', donde el ribosoma lee el ARNm y une los aminoácidos. Si no hay aminoácidos, la cadena polipeptídica no se forma.`,
        opts: ["La traducción del ARNm en el ribosoma.", "La transcripción del ADN a ARN.", "La replicación celular del núcleo.", "El empaquetamiento lipídico de Golgi."],
        traps: [null, "La transcripción usa nucleótidos, no aminoácidos.", "La replicación usa bases nitrogenadas para copiar el genoma.", "Golgi ocurre después de crear la proteína."]
      },
      en: {
        topic: 'PROTEIN SYNTHESIS', text: `Cells require essential dietary amino acids. If a person is severely malnourished and lacks them, which genetic process will stop directly?`, hint: "Amino acids are the building blocks joined at the final stage.", micro: `Physical assembly happens in 'translation', where the ribosome links amino acids. Without them, the polypeptide chain cannot form.`,
        opts: ["mRNA translation in the ribosome.", "DNA transcription to RNA.", "Cellular replication in the nucleus.", "Lipid packaging in the Golgi."],
        traps: [null, "Transcription uses nucleotides, not amino acids.", "Replication uses nitrogenous bases.", "Golgi packaging is a post-translational step."]
      },
      fr: {
        topic: 'SYNTHÈSE PROTÉIQUE', text: `Les cellules nécessitent des acides aminés essentiels de l'alimentation. En cas de carence sévère, quel processus génétique s'arrêtera directement ?`, hint: "Les acides aminés sont les briques liées à la fin.", micro: `L'assemblage se produit lors de la 'traduction' dans le ribosome. Sans acides aminés, la chaîne ne se forme pas.`,
        opts: ["La traduction de l'ARNm dans le ribosome.", "La transcription de l'ADN en ARN.", "La réplication cellulaire.", "L'emballage dans l'appareil de Golgi."],
        traps: [null, "La transcription utilise des nucléotides.", "La réplication utilise des bases azotées.", "Golgi intervient après la création de la protéine."]
      },
      de: {
        topic: 'PROTEINBIOSYNTHESE', text: `Zellen benötigen essentielle Aminosäuren aus der Nahrung. Welcher genetische Prozess wird bei schwerem Mangel direkt gestoppt?`, hint: "Aminosäuren sind die Bausteine, die in der Endphase verbunden werden.", micro: `Der Zusammenbau findet bei der 'Translation' am Ribosom statt. Ohne Aminosäuren bildet sich keine Peptidkette.`,
        opts: ["mRNA-Translation am Ribosom.", "DNA-Transkription zu RNA.", "Zelluläre Replikation.", "Lipidverpackung im Golgi."],
        traps: [null, "Transkription nutzt Nukleotide, keine Aminosäuren.", "Replikation nutzt stickstoffhaltige Basen.", "Golgi erfolgt nach der Proteinbildung."]
      }
    };
    return this.buildShuffledQuestion('SINTESIS_DE_PROTEINAS', lang, texts);
  }

  static genGenetics(lang) {
    const texts = {
      es: {
        topic: 'GENÉTICA MENDELIANA', text: `El alelo para flores rojas (A) es dominante sobre el de flores blancas (a). Si cruzas una planta heterocigota (Aa) con una homocigota recesiva (aa), ¿cuál es la probabilidad genotípica en la descendencia?`, hint: "Dibuja un Cuadro de Punnett: columnas (A, a) y filas (a, a).", micro: `El cruce (Aa x aa) genera: Aa, Aa, aa, aa. Es decir, 50% probabilidad Aa (rojas) y 50% probabilidad aa (blancas).`,
        opts: ["50% de probabilidad de ser Aa.", "100% de probabilidad de ser aa.", "75% de fenotipo recesivo.", "100% de probabilidad AA."],
        traps: [null, "Para 100% 'aa', ambos padres deben ser 'aa'.", "Esa es la proporción de un cruce Aa x Aa.", "Imposible, el padre 'aa' no puede heredar 'A'."]
      },
      en: {
        topic: 'MENDELIAN GENETICS', text: `Red flowers (A) are dominant over white (a). If you cross a heterozygous (Aa) plant with a homozygous recessive (aa), what is the offspring genotypic probability?`, hint: "Punnett Square: columns (A, a) and rows (a, a).", micro: `Cross (Aa x aa) yields: Aa, Aa, aa, aa. 50% chance of Aa (red) and 50% chance of aa (white).`,
        opts: ["50% probability of being Aa.", "100% probability of being aa.", "75% recessive phenotype.", "100% probability of AA."],
        traps: [null, "For 100% 'aa', both parents must be 'aa'.", "That is the ratio for an Aa x Aa cross.", "Impossible, parent 'aa' has no 'A' to give."]
      },
      fr: {
        topic: 'GÉNÉTIQUE MENDÉLIENNE', text: `Les fleurs rouges (A) dominent les blanches (a). En croisant une plante (Aa) avec une (aa), quelle est la probabilité génotypique ?`, hint: "Tableau de Punnett : colonnes (A, a) et lignes (a, a).", micro: `Le croisement (Aa x aa) donne : Aa, Aa, aa, aa. Soit 50% de chance pour Aa (rouge) et 50% pour aa (blanc).`,
        opts: ["50% de probabilité d'être Aa.", "100% de probabilité d'être aa.", "75% de phénotype récessif.", "100% de probabilité AA."],
        traps: [null, "Pour 100% 'aa', les deux parents doivent être 'aa'.", "C'est le ratio d'un croisement Aa x Aa.", "Impossible, le parent 'aa' n'a pas de 'A'."]
      },
      de: {
        topic: 'MENDELSCHE GENETIK', text: `Rote Blüten (A) dominieren weiße (a). Wenn Sie (Aa) mit (aa) kreuzen, wie ist die genotypische Wahrscheinlichkeit der Nachkommen?`, hint: "Punnett-Quadrat: Spalten (A, a) und Zeilen (a, a).", micro: `Kreuzung (Aa x aa) ergibt: Aa, Aa, aa, aa. 50% Wahrscheinlichkeit für Aa (rot) und 50% für aa (weiß).`,
        opts: ["50% Wahrscheinlichkeit für Aa.", "100% Wahrscheinlichkeit für aa.", "75% rezessiver Phänotyp.", "100% Wahrscheinlichkeit für AA."],
        traps: [null, "Für 100% 'aa' müssen beide Eltern 'aa' sein.", "Das ist das Verhältnis einer Aa x Aa Kreuzung.", "Unmöglich, der 'aa'-Elternteil hat kein 'A'."]
      }
    };
    return this.buildShuffledQuestion('GENETICA_MENDELIANA', lang, texts);
  }

  static genEvolution(lang) {
    const texts = {
      es: {
        topic: 'EVOLUCIÓN Y ADAPTACIÓN', text: `Una sequía en las Galápagos dejó solo semillas duras. En la siguiente generación, el tamaño promedio del pico de los pinzones aumentó. Según Darwin, ¿qué explica esto?`, hint: "La evolución no es voluntad, es supervivencia diferencial.", micro: `La Selección Natural indica que la variación ya existía. Los pinzones que ya poseían picos grandes por genética lograron comer, sobrevivir y reproducirse.`,
        opts: ["Pinzones con picos naturalmente grandes sobrevivieron y se reprodujeron.", "Los pájaros decidieron cambiar su pico para no morir.", "La sequía mutó el ADN de todos a la vez.", "Las semillas se volvieron blandas mágicamente."],
        traps: [null, "Trampa teleológica: Los animales no cambian a voluntad.", "Las mutaciones son aleatorias y previas, el ambiente solo 'selecciona'.", "Las semillas no mutan por altruismo."]
      },
      en: {
        topic: 'EVOLUTION', text: `A drought in the Galapagos left only hard seeds. In the next generation, average finch beak size increased. According to Darwin, why?`, hint: "Evolution is not willpower, it's differential survival.", micro: `Natural selection states variation pre-existed. Finches genetically possessing large beaks could eat, survive, and reproduce.`,
        opts: ["Finches with naturally large beaks survived and reproduced.", "Birds decided to change their beaks.", "The drought mutated everyone's DNA at once.", "Seeds magically became soft."],
        traps: [null, "Teleological trap: Animals don't change at will.", "Mutations are random/prior; the environment only 'selects'.", "Seeds don't mutate out of altruism."]
      },
      fr: {
        topic: 'ÉVOLUTION', text: `Une sécheresse aux Galápagos n'a laissé que des graines dures. À la génération suivante, la taille moyenne du bec des pinsons a augmenté. Selon Darwin, pourquoi ?`, hint: "L'évolution n'est pas la volonté, c'est la survie différentielle.", micro: `La sélection naturelle affirme que la variation existait. Les pinsons ayant génétiquement un gros bec ont pu manger et se reproduire.`,
        opts: ["Les pinsons avec de gros becs naturels ont survécu.", "Les oiseaux ont décidé de changer de bec.", "La sécheresse a muté l'ADN de tous.", "Les graines sont devenues douces."],
        traps: [null, "Piège téléologique: on ne change pas par volonté.", "Les mutations sont antérieures et aléatoires.", "Les graines ne mutent pas par altruisme."]
      },
      de: {
        topic: 'EVOLUTION', text: `Eine Dürre auf Galapagos hinterließ nur harte Samen. In der nächsten Finken-Generation stieg die durchschnittliche Schnabelgröße. Warum, laut Darwin?`, hint: "Evolution ist kein Wille, sondern differentielles Überleben.", micro: `Die natürliche Selektion besagt, dass Variation bereits existierte. Finken mit genetisch großen Schnäbeln konnten fressen und sich fortpflanzen.`,
        opts: ["Finken mit natürlich großen Schnäbeln überlebten.", "Die Vögel beschlossen, ihre Schnäbel zu ändern.", "Die Dürre mutierte die DNA von allen.", "Die Samen wurden magisch weich."],
        traps: [null, "Teleologische Falle: Tiere ändern sich nicht willentlich.", "Mutationen sind zufällig und vorherig.", "Samen mutieren nicht aus Altruismus."]
      }
    };
    return this.buildShuffledQuestion('EVOLUCION_Y_ADAPTACION', lang, texts);
  }

  static genOrganSystems(lang) {
    const texts = {
      es: {
        topic: 'SISTEMAS ORGÁNICOS', text: `El hígado produce bilis, almacenada en la vesícula biliar. Si una enfermedad bloquea completamente el conducto biliar, ¿qué problema digestivo sufriría el paciente?`, hint: "La bilis emulsiona lípidos (grasas).", micro: `La bilis es un detergente biológico que rompe las grasas en gotas pequeñas para las lipasas. Sin bilis, las grasas no se digieren.`,
        opts: ["Incapacidad para emulsionar grasas en el intestino.", "Interrupción de digestión de carbohidratos.", "Cese de absorción de agua en el colon.", "Falta de secreción de insulina."],
        traps: [null, "Los carbohidratos inician su digestión con la saliva.", "El colon absorbe agua sin necesidad de bilis.", "La insulina es secretada por el páncreas endocrino."]
      },
      en: {
        topic: 'ORGAN SYSTEMS', text: `The liver produces bile, stored in the gallbladder. If a disease blocks the bile duct, what digestive problem occurs?`, hint: "Bile emulsifies lipids (fats).", micro: `Bile acts as a biological detergent breaking down fats for lipases. Without it, fats are not digested properly.`,
        opts: ["Inability to emulsify fats in the intestine.", "Interrupted carbohydrate digestion.", "Cessation of water absorption in the colon.", "Lack of insulin secretion."],
        traps: [null, "Carbohydrate digestion starts in the mouth.", "The colon absorbs water independently of bile.", "Insulin is secreted by the pancreas."]
      },
      fr: {
        topic: 'SYSTÈMES ORGANIQUES', text: `Le foie produit la bile, stockée dans la vésicule. Si un canal biliaire est bloqué, quel problème digestif survient ?`, hint: "La bile émulsionne les lipides (graisses).", micro: `La bile est un détergent qui décompose les graisses pour les lipases. Sans elle, les graisses ne sont pas digérées.`,
        opts: ["Incapacité à émulsionner les graisses.", "Interruption de la digestion des glucides.", "Arrêt de l'absorption d'eau dans le côlon.", "Manque de sécrétion d'insuline."],
        traps: [null, "Les glucides sont digérés par la salive.", "Le côlon absorbe l'eau indépendamment.", "L'insuline est sécrétée par le pancréas."]
      },
      de: {
        topic: 'ORGANISCHE SYSTEME', text: `Die Leber produziert Galle, gespeichert in der Gallenblase. Wenn der Gallengang blockiert ist, welches Verdauungsproblem tritt auf?`, hint: "Galle emulgiert Lipide (Fette).", micro: `Galle wirkt als Detergens, das Fette für Lipasen aufspaltet. Ohne sie werden Fette nicht verdaut.`,
        opts: ["Unfähigkeit, Fette im Darm zu emulgieren.", "Unterbrechung der Kohlenhydratverdauung.", "Stopp der Wasseraufnahme im Dickdarm.", "Mangelnde Insulinsekretion."],
        traps: [null, "Kohlenhydratverdauung beginnt im Mund.", "Der Dickdarm absorbiert Wasser unabhängig.", "Insulin wird von der Bauchspeicheldrüse produziert."]
      }
    };
    return this.buildShuffledQuestion('SISTEMAS_ORGANICOS', lang, texts);
  }
}

/* ============================================================
   🧠 3. MOTOR DEEPSEEK (CONEXIÓN IA SANITIZADA Y PROTEGIDA)
============================================================ */
const LANG_MAP_DS = { es: "SPANISH", en: "ENGLISH", fr: "FRENCH", de: "GERMAN" };

class DeepSeekEngine {
  static cleanJSON(raw) {
    try {
      let cleaned = raw.replace(/```json/gi, '').replace(/```/g, '').trim();
      const start = cleaned.indexOf('{');
      const end = cleaned.lastIndexOf('}');
      if (start !== -1 && end !== -1) cleaned = cleaned.substring(start, end + 1);
      try { return JSON.parse(cleaned); } catch (e) {
          cleaned = cleaned.replace(/(?<!\\)\n/g, '\\n').replace(/(?<!\\)\r/g, '');
          return JSON.parse(cleaned);
      }
    } catch (error) { throw new Error("JSON_PARSE_ERROR"); }
  }

  static async fetchWithTimeout(url, options, timeout = 25000) {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), timeout);
      try {
          const response = await fetch(url, { ...options, signal: controller.signal });
          clearTimeout(id);
          return response;
      } catch (e) { clearTimeout(id); throw e; }
  }

  static async generateQuestion(lang, forcedTopic = null, retries = 1) {
    const topics = ['BIOLOGIA_CELULAR_Y_MEMBRANA', 'ECOLOGIA_Y_ECOSISTEMAS', 'SINTESIS_DE_PROTEINAS', 'GENETICA_MENDELIANA', 'SISTEMAS_ORGANICOS', 'EVOLUCION_Y_ADAPTACION', 'CICLOS_BIOGEOQUIMICOS', 'FOTOSINTESIS_Y_RESPIRACION', 'REDES_TROFICAS', 'METODO_CIENTIFICO_BIO'];
    const selectedTopic = forcedTopic || topics[Math.floor(Math.random() * topics.length)];
    const targetLang = LANG_MAP_DS[lang] || "SPANISH";

    const sysPrompt = `
      Eres un experto diseñador de exámenes ICFES de Colombia, enfocado 100% en BIOLOGÍA y SISTEMAS VIVOS.
      Genera una pregunta biológica analítica COMPLETAMENTE NUEVA sobre el tema: "${selectedTopic}".
      Language for the output must strictly be: ${targetLang}.
      Inventa un experimento biológico, un contexto ecológico, genético o celular. Provee 4 opciones de respuesta (en el idioma solicitado), solo 1 correcta. Las otras 3 deben ser trampas conceptuales comunes en biología.
      
      REGLA ABSOLUTA: RESPONDE SOLO CON UN JSON VÁLIDO. NADA DE MARKDOWN ALREDEDOR. Usa comillas simples ('') dentro de los textos.
      {
        "id": "${selectedTopic}",
        "topic": "Nombre del tema",
        "text": "El texto del enunciado biológico y la pregunta...",
        "options": ["Opción Correcta", "Opción Trampa 1", "Opción Trampa 2", "Opción Trampa 3"],
        "correctIdx": 0,
        "hint": "Pista ecológica o celular",
        "microclass": "Explicación paso a paso de la ley biológica",
        "trapExplanations": ["Explicación correcta", "Trampa B", "Trampa C", "Trampa D"]
      }
    `;

    try {
      const response = await this.fetchWithTimeout(DEEPSEEK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${DEEPSEEK_API_KEY}` },
        body: JSON.stringify({ model: "deepseek-chat", messages: [{ role: "system", content: sysPrompt }], temperature: 0.7, max_tokens: 800, response_format: { type: "json_object" } })
      }, 20000);
      
      if(!response.ok) throw new Error("HTTP_ERROR");
      const data = await response.json();
      const parsed = this.cleanJSON(data.choices[0].message.content);
      parsed.isAi = true; 
      
      // Shuffle the AI options to prevent always A
      const items = parsed.options.map((opt, i) => ({ text: opt, trap: parsed.trapExplanations[i], isCorrect: i === parsed.correctIdx }));
      items.sort(() => Math.random() - 0.5);
      parsed.correctIdx = items.findIndex(i => i.isCorrect);
      parsed.options = items.map(i => i.text);
      parsed.trapExplanations = items.map(i => i.trap);

      return parsed;
    } catch (error) {
      if (retries > 0) return this.generateQuestion(lang, forcedTopic, retries - 1);
      throw error;
    }
  }

  static async generateMasterclass(topic, lang, retries = 2) {
    const targetLang = LANG_MAP_DS[lang] || "SPANISH";

    const sysPrompt = `
      Eres un Profesor Investigador de Biología preparando a un estudiante para la prueba del examen ICFES.
      Genera una CLASE MAGISTRAL sobre el dominio biológico: "${topic}".
      Language for the output MUST STRICTLY BE: ${targetLang}.
      Debe ser analítica, explicando cómo el ICFES evalúa este concepto biológico. Máximo 400 palabras.

      REGLAS CRÍTICAS: RESPONDE SÓLO EN JSON VÁLIDO. ESCAPA SALTOS DE LÍNEA \\n. USA COMILLAS SIMPLES ('').
      
      ESTRUCTURA EXACTA REQUERIDA:
      {
        "title": "TÍTULO DEL TEMA BIOLÓGICO",
        "theory": "Explicación teórica corta enfocada a sistemas vivos.",
        "trap": "La trampa biológica típica del ICFES.",
        "protocol": "1. Identificar nivel.\\n2. Análisis.",
        "demoQuestion": {
           "text": "Problema bio-analítico generado...",
           "options": ["A", "B", "C", "D"],
           "correctIdx": 0,
           "analysis": "Análisis de por qué el sistema vivo reacciona así."
        }
      }
    `;

    try {
      const response = await this.fetchWithTimeout(DEEPSEEK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${DEEPSEEK_API_KEY}` },
        body: JSON.stringify({ model: "deepseek-chat", messages: [{ role: "system", content: sysPrompt }], temperature: 0.2, max_tokens: 1000, response_format: { type: "json_object" } })
      }, 30000); 
      
      if(!response.ok) throw new Error("HTTP_ERROR");
      const data = await response.json();
      const parsed = this.cleanJSON(data.choices[0].message.content);
      
      // Shuffle demo options
      if(parsed.demoQuestion) {
          const items = parsed.demoQuestion.options.map((opt, i) => ({ text: opt, isCorrect: i === parsed.demoQuestion.correctIdx }));
          items.sort(() => Math.random() - 0.5);
          parsed.demoQuestion.correctIdx = items.findIndex(i => i.isCorrect);
          parsed.demoQuestion.options = items.map(i => i.text);
      }
      return parsed;
    } catch (error) {
      if (retries > 0) {
          await new Promise(resolve => setTimeout(resolve, 500)); 
          return this.generateMasterclass(topic, lang, retries - 1);
      }
      throw error;
    }
  }
}

/* ============================================================
   🔊 4. MOTOR DE AUDIO SCI-FI
============================================================ */
class QuantumAudio {
  constructor() { this.ctx = null; this.gainNode = null; }
  init() {
    if (typeof window !== 'undefined' && !this.ctx) {
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
          this.ctx = new AudioContext();
          this.gainNode = this.ctx.createGain();
          this.gainNode.gain.value = 0.2;
          this.gainNode.connect(this.ctx.destination);
        }
      } catch (e) {}
    }
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume().catch(()=>{});
  }
  _play(type, fStart, fEnd, dur, vol = 0.1) {
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator(); const gain = this.ctx.createGain();
      osc.connect(gain); gain.connect(this.gainNode);
      osc.type = type; osc.frequency.setValueAtTime(fStart, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(fEnd, this.ctx.currentTime + dur);
      gain.gain.setValueAtTime(vol, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + dur);
      osc.start(); osc.stop(this.ctx.currentTime + dur);
    } catch (e) {}
  }
  click() { this._play('sine', 432, 216, 0.15, 0.1); } 
  success() { this._play('square', 432, 864, 0.6, 0.2); }
  error() { this._play('sawtooth', 150, 40, 0.6, 0.2); }
  scanSweep() { this._play('sine', 1200, 400, 0.5, 0.05); } 
  aiPop() { this._play('triangle', 600, 800, 0.3, 0.1); }
}
const sfx = new QuantumAudio();

/* ============================================================
   🌍 5. DICCIONARIOS UI Y CONSEJOS (BIOLOGÍA EXCLUSIVO)
============================================================ */
const DICT_UI = {
  es: {
      start: "INICIAR INMERSIÓN BIOLÓGICA", title: "LABORATORIO ICFES BIOLOGÍA", 
      scan: "ESCÁNER BIO-LÓGICO", aiBtn: "TUTORÍA IA",
      time: "CRONÓMETRO CELULAR", mastery: "Maestría Biológica", 
      btnCheck: "SINTETIZAR RESPUESTA", btnNext: "SIGUIENTE ORGANISMO ➔",
      btnRetrySame: "REINTENTAR HIPÓTESIS ➔", 
      correctTitle: "¡ANÁLISIS EVOLUTIVO PERFECTO!", wrongTitle: "RUPTURA ECOLÓGICA",
      statsBtn: "BIO-METRÍAS", theoryText: "MOTOR NEURONAL BIOLÓGICO ACTIVO. Conectado a DeepSeek. Se están generando ecosistemas, células y genotipos procedurales en tiempo real.",
      timeout: "¡COLAPSO DEL ECOSISTEMA!", topic: "DOMINIO ACTIVO", 
      dashboard: "DASHBOARD DEL GENOMA GLOBAL", avgTime: "Tiempo Medio",
      btnRetry: "PURGAR ADN", aiSocraticBtn: "SOLICITAR CLASE MAGISTRAL IA",
      socraticModal: "LA IA HA DETECTADO FALLOS EN:", aiPraise: "¡ADN PERFECTO! NO HAY MUTACIONES.",
      aiSelectTopic: "Selecciona la red trófica a repasar:", aiClose: "CERRAR SESIÓN IA",
      downloadReport: "DESCARGAR INFORME BIOMÉTRICO",
      loadingData: "ESTABLECIENDO CONEXIÓN GENÓMICA DEEPSEEK...",
      warmupTitle: "⚡ MUTACIÓN DE CALENTAMIENTO", warmupSub: "Mientras la IA sintetiza tu organismo..."
  },
  en: {
      start: "START BIOLOGICAL IMMERSION", title: "ICFES BIOLOGY LAB", scan: "BIO-LOGIC SCANNER", aiBtn: "AI TUTOR", time: "CELLULAR TIMER", mastery: "Biological Mastery", btnCheck: "SYNTHESIZE RESPONSE", btnNext: "NEXT ORGANISM ➔", btnRetrySame: "RETRY HYPOTHESIS ➔", correctTitle: "PERFECT EVOLUTIONARY ANALYSIS!", wrongTitle: "ECOLOGICAL RUPTURE", statsBtn: "BIO-METRICS", theoryText: "BIOLOGICAL NEURAL ENGINE ACTIVE. Hooked to DeepSeek. Generating procedural ecosystems and genotypes.", timeout: "ECOSYSTEM COLLAPSE!", topic: "ACTIVE DOMAIN", dashboard: "GLOBAL GENOME DASHBOARD", avgTime: "Avg Time", btnRetry: "PURGE DNA", aiSocraticBtn: "REQUEST AI MASTERCLASS", socraticModal: "AI HAS DETECTED FAILURES IN:", aiPraise: "PERFECT DNA! NO MUTATIONS.", aiSelectTopic: "Select the domain to review:", aiClose: "CLOSE AI SESSION", downloadReport: "DOWNLOAD BIOMETRIC REPORT", loadingData: "ESTABLISHING DEEPSEEK GENOMIC LINK...", warmupTitle: "⚡ WARM-UP MUTATION", warmupSub: "While AI synthesizes your main organism..."
  },
  fr: {
      start: "DÉMARRER L'IMMERSION BIOLOGIQUE", title: "LABORATOIRE DE BIOLOGIE ICFES", scan: "SCANNER BIO-LOGIQUE", aiBtn: "TUTEUR IA", time: "CHRONOMÈTRE CELLULAIRE", mastery: "Maîtrise Biologique", btnCheck: "SYNTHÉTISER LA RÉPONSE", btnNext: "ORGANISME SUIVANT ➔", btnRetrySame: "RÉESSAYER L'HYPOTHÈSE ➔", correctTitle: "ANALYSE ÉVOLUTIVE PARFAITE!", wrongTitle: "RUPTURE ÉCOLOGIQUE", statsBtn: "BIO-MÉTRIQUES", theoryText: "MOTEUR NEURONAL BIOLOGIQUE ACTIF. Connecté à DeepSeek. Génération d'écosystèmes procéduraux.", timeout: "EFFONDREMENT DE L'ÉCOSYSTÈME!", topic: "DOMAINE ACTIF", dashboard: "TABLEAU DE BORD DU GÉNOME", avgTime: "Temps Moyen", btnRetry: "PURGER L'ADN", aiSocraticBtn: "DEMANDER MASTERCLASS IA", socraticModal: "FAILLES DÉTECTÉES :", aiPraise: "ADN PARFAIT !", aiSelectTopic: "Sélectionnez le domaine :", aiClose: "FERMER LA SESSION IA", downloadReport: "TÉLÉCHARGER LE RAPPORT BIOMÉTRIQUE", loadingData: "ÉTABLISSEMENT DU LIEN GÉNOMIQUE...", warmupTitle: "⚡ MUTATION D'ÉCHAUFFEMENT", warmupSub: "Pendant que l'IA synthétise votre organisme..."
  },
  de: {
      start: "BIOLOGISCHE IMMERSION STARTEN", title: "ICFES BIOLOGIE LABOR", scan: "BIO-LOGIK SCANNER", aiBtn: "KI-TUTOR", time: "ZELLULÄRER TIMER", mastery: "Biologische Beherrschung", btnCheck: "ANTWORT SYNTHETISIEREN", btnNext: "NÄCHSTER ORGANISMUS ➔", btnRetrySame: "HYPOTHESE WIEDERHOLEN ➔", correctTitle: "PERFEKTE EVOLUTIONÄRE ANALYSE!", wrongTitle: "ÖKOLOGISCHER BRUCH", statsBtn: "BIO-METRIKEN", theoryText: "BIOLOGISCHE KI AKTIV. Verbunden mit DeepSeek. Erzeugt prozedurale Ökosysteme und Zellen.", timeout: "ÖKOSYSTEM KOLLAPS!", topic: "AKTIVE DOMÄNE", dashboard: "GLOBALE GENOM-TELEMETRIE", avgTime: "Durchschnittszeit", btnRetry: "DNA LÖSCHEN", aiSocraticBtn: "KI MASTERCLASS ANFORDERN", socraticModal: "FEHLER ERKANNT IN:", aiPraise: "PERFEKTE DNA!", aiSelectTopic: "Wählen Sie die Domäne:", aiClose: "KI-SITZUNG SCHLIESSEN", downloadReport: "BIOMETRISCHEN BERICHT HERUNTERLADEN", loadingData: "AUFBAU DER GENOMISCHEN VERBINDUNG...", warmupTitle: "⚡ AUFWÄRM-MUTATION", warmupSub: "Während die KI deinen Organismus synthetisiert..."
  }
};

const DICT_REPORT = {
  es: { docTitle: "DOSSIER TÁCTICO DE BIOLOGÍA", docSub: "SIMULACIÓN ICFES - NÚCLEO BIOLÓGICO", dateLabel: "Fecha de Extracción", kpiTitle: "MÉTRICAS GLOBALES DE RENDIMIENTO", kpiAcc: "Supervivencia Celular", kpiTime: "Tiempo Medio", kpiTotal: "Organismos Analizados", aiTitle: "VEREDICTO DEL SISTEMA IA", aiVuln: "⚠️ VULNERABILIDADES BIOLÓGICAS DETECTADAS", aiVulnDesc: "El operador muestra deficiencias en la comprensión de los siguientes dominios vitales:", aiAction: "PLAN DE ACCIÓN DE IA", aiActionDesc: "Es imperativo solicitar la 'Masterclass IA' para re-secuenciar los conocimientos biológicos.", aiOpt: "✅ RENDIMIENTO EVOLUTIVO ÓPTIMO", aiOptDesc: "El operador biológico está adaptado al ambiente del ICFES.", aiNoData: "Datos biológicos insuficientes.", topicTitle: "DESGLOSE MICRO-CELULAR", topicNoData: "Faltan cadenas de ADN.", topicHit: "Aciertos", topicMiss: "Fallos", footer: "LEARNING LABS BIO-ENGINE V27.0", footerSub: "La evolución premia la adaptación del conocimiento." },
  en: { docTitle: "BIOLOGY TACTICAL DOSSIER", docSub: "ICFES SIMULATION - BIOLOGICAL CORE", dateLabel: "Date", kpiTitle: "GLOBAL METRICS", kpiAcc: "Cellular Survival", kpiTime: "Avg Time", kpiTotal: "Organisms Analyzed", aiTitle: "AI VERDICT", aiVuln: "⚠️ BIOLOGICAL VULNERABILITIES DETECTED", aiVulnDesc: "Deficiencies in vital domains:", aiAction: "ACTION PLAN", aiActionDesc: "Use AI Masterclass to re-sequence biological knowledge.", aiOpt: "✅ OPTIMAL EVOLUTIONARY PERFORMANCE", aiOptDesc: "Biological operator is adapted.", aiNoData: "Insufficient biological data.", topicTitle: "MICRO-CELLULAR BREAKDOWN", topicNoData: "Missing DNA chains.", topicHit: "Hits", topicMiss: "Misses", footer: "LEARNING LABS BIO-ENGINE", footerSub: "Evolution rewards knowledge adaptation." },
  fr: { docTitle: "DOSSIER TACTIQUE DE BIOLOGIE", docSub: "SIMULATION BIOLOGIQUE ICFES", dateLabel: "Date", kpiTitle: "MÉTRIQUES GLOBALES", kpiAcc: "Survie Cellulaire", kpiTime: "Temps Moyen", kpiTotal: "Organismes Analysés", aiTitle: "VERDICT IA", aiVuln: "⚠️ VULNÉRABILITÉS BIOLOGIQUES", aiVulnDesc: "Déficiences dans:", aiAction: "PLAN D'ACTION", aiActionDesc: "Utiliser Masterclass IA.", aiOpt: "✅ PERFORMANCE OPTIMALE", aiOptDesc: "Opérateur biologique adapté.", aiNoData: "Données insuffisantes.", topicTitle: "RÉPARTITION MICRO-CELLULAIRE", topicNoData: "Pas de chaînes d'ADN.", topicHit: "Succès", topicMiss: "Échecs", footer: "LEARNING LABS BIO-ENGINE", footerSub: "L'évolution récompense l'adaptation." },
  de: { docTitle: "TAKTISCHES BIOLOGIE DOSSIER", docSub: "BIOLOGISCHE QUANTENSIMULATION", dateLabel: "Datum", kpiTitle: "GLOBALE KENNZAHLEN", kpiAcc: "Zelluläres Überleben", kpiTime: "Durchschnittszeit", kpiTotal: "Organismen analysiert", aiTitle: "KI-URTEIL", aiVuln: "⚠️ BIOLOGISCHE SCHWACHSTELLEN", aiVulnDesc: "Mängel in:", aiAction: "AKTIONSPLAN", aiActionDesc: "KI Masterclass nutzen.", aiOpt: "✅ OPTIMALE LEISTUNG", aiOptDesc: "Biologischer Bediener angepasst.", aiNoData: "Unzureichende Daten.", topicTitle: "MIKRO-ZELLULÄRE AUFSCHLÜSSELUNG", topicNoData: "Keine DNA-Ketten.", topicHit: "Treffer", topicMiss: "Fehler", footer: "LEARNING LABS BIO-ENGINE", footerSub: "Evolution belohnt Wissensanpassung." }
};

const TIPS_DB = {
  es: [
    "RECUERDA BIOLÓGICA: Las cadenas tróficas transfieren solo el 10% de energía al siguiente nivel. Si quitas un eslabón primario, el ecosistema colapsa.",
    "TRUCO CELULAR: El transporte ACTIVO siempre, sin excepción, requiere gasto de energía metabólica (ATP) porque va contra la corriente natural.",
    "OJO EVOLUTIVO: La selección natural de Darwin no es un proceso consciente. Los animales NO 'deciden' adaptarse; sobreviven los que ya tenían la mutación útil.",
    "ESTRATEGIA GENÉTICA: Un genotipo homocigoto recesivo (aa) solo se expresa físicamente si ambos padres aportaron el alelo minúscula.",
    "CONCEPTO CLAVE: En la fotosíntesis, la planta toma CO2 y expulsa Oxígeno. En la respiración celular hace exactamente lo opuesto."
  ],
  en: [
    "BIO REMEMBER: Food chains transfer only 10% of energy to the next level. Remove a primary link, the ecosystem collapses.",
    "CELL TRICK: ACTIVE transport always requires metabolic energy (ATP) because it goes against the natural current.",
    "EVOLUTION WATCH OUT: Darwinian natural selection is not conscious. Animals DO NOT 'decide' to adapt.",
    "GENETIC STRATEGY: A homozygous recessive genotype (aa) is only expressed if both parents contributed the lowercase allele.",
    "KEY CONCEPT: In photosynthesis, plants take in CO2 and release Oxygen. Cellular respiration does the opposite."
  ],
  fr: [
    "RAPPEL BIO : Les chaînes alimentaires ne transfèrent que 10 % de l'énergie au niveau suivant.",
    "ASTUCE CELLULE : Le transport ACTIF nécessite toujours de l'ATP car il va à contre-courant.",
    "ATTENTION ÉVOLUTION : La sélection naturelle n'est pas consciente. Les animaux ne 'décident' pas de s'adapter.",
    "STRATÉGIE GÉNÉTIQUE : Un génotype (aa) s'exprime si les deux parents ont apporté l'allèle.",
    "CONCEPT : Dans la photosynthèse, la plante prend du CO2 et rejette de l'O2. La respiration fait l'inverse."
  ],
  de: [
    "BIO ERINNERUNG: Nahrungsketten übertragen nur 10% der Energie auf die nächste Stufe.",
    "ZELL-TRICK: AKTIVER Transport erfordert immer ATP, da er gegen den natürlichen Strom verläuft.",
    "EVOLUTION VORSICHT: Natürliche Selektion ist nicht bewusst. Tiere 'entscheiden' sich nicht zur Anpassung.",
    "GENETIK-STRATEGIE: Ein rezessiver Genotyp (aa) wird nur ausgedrückt, wenn beide Elternteile beigesteuert haben.",
    "KONZEPT: Bei der Photosynthese nehmen Pflanzen CO2 auf und geben O2 ab. Zellatmung tut das Gegenteil."
  ]
};

/* ============================================================
   🎥 6. COMPONENTE DE CARGA HOLOGRÁFICA (INTERMISSION)
============================================================ */
const QuantumIntermission = ({ lang, loadingText }) => {
    const tips = TIPS_DB[lang] || TIPS_DB['es'];
    const [tipIdx, setTipIdx] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setTipIdx(prev => (prev + 1) % tips.length);
        }, 8000); 
        return () => clearInterval(interval);
    }, [tips.length]);

    return (
        <div style={{ position:'absolute', inset:0, zIndex:3000, background:'#001005', display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center', padding:'clamp(20px, 5vw, 40px)', textAlign: 'center', boxSizing: 'border-box' }}>
            <div className="loader-ring" style={{ width: 'clamp(50px, 8vw, 80px)', height: 'clamp(50px, 8vw, 80px)', border: '5px solid #113311', borderTop: '5px solid #00ff88', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '30px' }}></div>
            <h1 className="hud-pulse" style={{color:'#00ff88', fontSize:'clamp(16px, 4vw, 40px)', textShadow:'0 0 30px #00ff88', margin: '0 0 30px 0', letterSpacing: '2px', lineHeight: '1.4'}}>{loadingText}</h1>
            
            <div style={{ background: 'rgba(255, 170, 0, 0.1)', borderLeft: '4px solid #ffaa00', padding: 'clamp(15px, 4vw, 30px)', maxWidth: '800px', width: '100%', borderRadius: '0 10px 10px 0', position: 'relative', overflow: 'hidden', boxSizing: 'border-box' }}>
                <div style={{ color: '#ffaa00', fontSize: 'clamp(12px, 3vw, 16px)', fontWeight: 'bold', marginBottom: '15px', textTransform: 'uppercase' }}>💡 ICFES BIOLOGY TIP</div>
                <div style={{ color: '#fff', fontSize: 'clamp(14px, 3.5vw, 24px)', minHeight: '80px', transition: 'opacity 0.5s ease', lineHeight: '1.5' }}>
                    {tips[tipIdx]}
                </div>
                <div style={{position: 'absolute', bottom: 0, left: 0, height: '4px', background: '#ffaa00', width: '100%', animation: 'shrink 8s linear infinite'}}></div>
            </div>
            <style>{`
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                @keyframes shrink { 0% { width: 100%; } 100% { width: 0%; } }
            `}</style>
        </div>
    );
};

/* ============================================================
   🎥 7. NÚCLEO 3D AVANZADO (ADN VERDE CIENCIA)
============================================================ */
const AtomParticles = ({ count, color, speed, radius }) => {
  const mesh = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const t = Math.random() * 100;
      const factor = 0.5 + Math.random();
      const x = (Math.random() - 0.5) * radius;
      const y = (Math.random() - 0.5) * radius;
      const z = (Math.random() - 0.5) * radius;
      temp.push({ t, factor, x, y, z });
    }
    return temp;
  }, [count, radius]);

  useFrame(() => {
    if (!mesh.current) return;
    particles.forEach((particle, i) => {
      let { t, factor, x, y, z } = particle;
      t = particle.t += speed * factor;
      const a = Math.cos(t) + Math.sin(t) / 10;
      const b = Math.sin(t) + Math.cos(t) / 10;
      dummy.position.set(x + a, y + b, z);
      dummy.scale.setScalar(0.15);
      dummy.updateMatrix();
      mesh.current.setMatrixAt(i, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[null, null, count]}>
      <primitive object={SPHERE_GEOM} attach="geometry" />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={3} />
    </instancedMesh>
  );
};

const Core3D = ({ isExploding, scannerActive, timeRatio, isLoading }) => {
  const torusRef = useRef();
  const scanPlaneRef = useRef();
  
  const isDanger = timeRatio > 0.83; 
  const isCritical = timeRatio > 0.94; 
  
  let particleColor = "#00ff88"; 
  if (isLoading) particleColor = "#ff00ff";
  else if (isDanger) particleColor = "#ffaa00"; 
  else if (isCritical || isExploding) particleColor = "#ff0033"; 

  const particleSpeed = isExploding ? 0.2 : (isLoading ? 0.1 : 0.02 + (timeRatio * 0.08)); 
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  useFrame((state) => {
    if (isExploding || isCritical) {
      state.camera.position.x = Math.sin(state.clock.elapsedTime * 80) * (isExploding ? 1.5 : 0.2);
      state.camera.position.y = 2 + Math.cos(state.clock.elapsedTime * 90) * (isExploding ? 1.5 : 0.2);
    } else if (isLoading) {
      state.camera.position.x = Math.sin(state.clock.elapsedTime * 2) * 5;
      state.camera.position.z = (isMobile ? 35 : 25) + Math.cos(state.clock.elapsedTime * 2) * 5;
    } else {
      state.camera.position.lerp(new THREE.Vector3(0, 2, isMobile ? 38 : 28), 0.05);
    }
    state.camera.lookAt(0, 0, 0);
    
    if (torusRef.current) {
        torusRef.current.rotation.y += particleSpeed;
        torusRef.current.rotation.x += particleSpeed * 0.5;
        if (isDanger && !isExploding && !isLoading) {
            const scale = 1 + Math.sin(state.clock.elapsedTime * 25) * (timeRatio * 0.15);
            torusRef.current.scale.set(scale, scale, scale);
        } else {
            torusRef.current.scale.set(1, 1, 1);
        }
    }
    if (scannerActive && scanPlaneRef.current) {
        scanPlaneRef.current.position.x = Math.sin(state.clock.elapsedTime * 3) * 12;
    }
  });

  return (
    <>
      <ambientLight intensity={1.5} />
      <directionalLight position={[10, 15, 10]} intensity={3} color="#ffffff" />
      <Stars count={4000} factor={5} fade speed={isExploding ? 6 : (isLoading ? 4 : 2)} />
      <AtomParticles count={isMobile ? 150 : 350} color={particleColor} speed={particleSpeed} radius={18} />
      {scannerActive && (
         <mesh ref={scanPlaneRef} rotation={[0, Math.PI/2, 0]}>
            <planeGeometry args={[30, 30]} />
            <meshBasicMaterial color="#0f0" transparent opacity={0.2} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} depthWrite={false} />
         </mesh>
      )}
      <group position={[0, 3, 0]}>
         <mesh ref={torusRef}>
            <torusKnotGeometry args={[3, 0.8, 150, 20]} />
            <meshStandardMaterial color={particleColor} wireframe transparent opacity={0.7} />
         </mesh>
      </group>
      <EffectComposer>
        <Bloom intensity={isExploding ? 10 : (isLoading ? 8 : (isDanger ? 6 : 3))} luminanceThreshold={0.1} mipmapBlur />
        <ChromaticAberration offset={isExploding ? VECTOR_EXP : VECTOR_NORM} />
        <Scanline opacity={0.3} density={isMobile ? 1.5 : 2.5} />
      </EffectComposer>
    </>
  );
};

/* ============================================================
   🤖 8. COMPONENTE MASTERCLASS DEEPSEEK (UX GOD TIER EXPANDIDO)
============================================================ */
const MarkdownParser = ({ text }) => {
    const htmlContent = useMemo(() => {
        if (!text) return { __html: "" };
        let parsed = text;
        parsed = parsed.replace(/### (.*)/g, '<h3 style="color:#00ff88; margin-top:clamp(20px, 4vw, 30px); border-bottom:1px solid #00ff88; padding-bottom:5px; font-size: clamp(18px, 4vw, 26px);">$1</h3>');
        parsed = parsed.replace(/## (.*)/g, '<h2 style="color:#ffea00; margin-top:clamp(15px, 3vw, 25px); font-size: clamp(20px, 4.5vw, 30px);">$1</h2>');
        parsed = parsed.replace(/\*\*(.*?)\*\*/g, '<strong style="color:#ff00ff;">$1</strong>');
        parsed = parsed.replace(/\\n/g, '<br/>'); 
        parsed = parsed.replace(/\n/g, '<br/>'); 
        return { __html: parsed };
    }, [text]);

    return <div dangerouslySetInnerHTML={htmlContent} style={{ color: '#fff', fontSize: 'clamp(14px, 3.5vw, 22px)', lineHeight: '1.8', fontFamily: 'sans-serif' }} />;
};

const SocraticMasterclass = ({ topic, lang, onBack, onClose, UI }) => {
    const [classData, setClassData] = useState(null);
    const [isGenerating, setIsGenerating] = useState(true);
    const [loadText, setLoadText] = useState("> ESTABLECIENDO CONEXIÓN CUÁNTICA DEEPSEEK...");
    
    const loadClass = useCallback(async () => {
        let isMounted = true;
        setIsGenerating(true);

        const t1 = setTimeout(() => { if(isMounted) setLoadText("> ANALIZANDO MUTACIONES DEL ESTUDIANTE EN: " + topic.replace(/_/g, ' ')); }, 3000);
        const t2 = setTimeout(() => { if(isMounted) setLoadText("> SINTETIZANDO NÚCLEO BIOLÓGICO AVANZADO..."); }, 6000);
        const t3 = setTimeout(() => { if(isMounted) setLoadText("> GENERANDO HIPÓTESIS DE ECOSISTEMA (ESPERE)..."); }, 10000);
        const t4 = setTimeout(() => { if(isMounted) setLoadText("> COMPILANDO DATOS EXPERIMENTALES (ÚLTIMA FASE)..."); }, 15000);

        try {
            const content = await DeepSeekEngine.generateMasterclass(topic, lang);
            if (isMounted) {
                setClassData(content);
                setIsGenerating(false);
                sfx.success();
            }
        } catch (err) {
            console.warn("DeepSeek Fallback Bio en Masterclass.", err);
            if (isMounted) {
                const fallbackClass = IcfesEngine.generateLocalMasterclass(topic, lang);
                setClassData(fallbackClass);
                setIsGenerating(false);
                sfx.success();
            }
        }
            
        return () => { 
            isMounted = false; 
            clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4);
        };
    }, [topic, lang]);

    useEffect(() => {
        const cleanup = loadClass();
        return () => { if (cleanup && cleanup.then) cleanup.then(c => { if (c) c() }); };
    }, [loadClass]);

    if (isGenerating) {
        return (
            <div style={{ padding: 'clamp(30px, 6vw, 60px) clamp(10px, 3vw, 20px)', textAlign: 'left', minHeight: '60vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ color: '#0f0', fontFamily: 'monospace', fontSize: 'clamp(14px, 3vw, 24px)', lineHeight: '2' }}>
                    <p className="hud-pulse" style={{marginBottom: '20px', color: '#00ff88', fontSize: 'clamp(18px, 4vw, 30px)', fontWeight: 'bold'}}>{loadText}</p>
                    <p style={{color: '#aaa', opacity: 0.8}}>_ Operación: Socratic Biology Overdrive</p>
                    <p style={{color: '#aaa', opacity: 0.8}}>_ Destino: Neural Net DeepSeek-Chat</p>
                    <p style={{color: '#aaa', opacity: 0.8}}>_ Status: Aguardando carga genética (Payload)...</p>
                </div>
            </div>
        );
    }

    if (!classData) return null;

    return (
        <div style={{ padding: 'clamp(10px, 3vw, 30px)', width: '100%', boxSizing: 'border-box' }}>
           <h2 style={{color:'#ff00ff', fontSize:'clamp(20px, 5vw, 45px)', textAlign:'center', borderBottom:'3px solid #ff00ff', paddingBottom:'20px', marginTop: 0, textTransform: 'uppercase'}}>🎓 {classData.title || topic.replace(/_/g, ' ')}</h2>
           
           <div style={{ display: 'grid', gap: 'clamp(20px, 4vw, 30px)', marginTop: '40px' }}>
              <div style={{ borderLeft: '6px solid #00ff88', padding: 'clamp(15px, 3vw, 30px)', background: 'rgba(0,255,136,0.05)', borderRadius: '0 15px 15px 0' }}>
                 <h3 style={{color: '#00ff88', marginTop: 0, fontSize: 'clamp(18px, 4vw, 26px)', display: 'flex', alignItems: 'center', gap:'10px'}}>📚 NÚCLEO TEÓRICO Y ANÁLISIS</h3>
                 <MarkdownParser text={classData.theory} />
              </div>
              
              <div style={{ borderLeft: '6px solid #f00', padding: 'clamp(15px, 3vw, 30px)', background: 'rgba(255,0,0,0.05)', borderRadius: '0 15px 15px 0' }}>
                 <h3 style={{color: '#f00', marginTop: 0, fontSize: 'clamp(18px, 4vw, 26px)', display: 'flex', alignItems: 'center', gap:'10px'}}>⚠️ TRAMPA COGNITIVA ICFES</h3>
                 <MarkdownParser text={classData.trap} />
              </div>

              <div style={{ borderLeft: '6px solid #ffea00', padding: 'clamp(15px, 3vw, 30px)', background: 'rgba(255,234,0,0.05)', borderRadius: '0 15px 15px 0' }}>
                 <h3 style={{color: '#ffea00', marginTop: 0, fontSize: 'clamp(18px, 4vw, 26px)', display: 'flex', alignItems: 'center', gap:'10px'}}>⚙️ PROTOCOLO CIENTÍFICO INFALIBLE</h3>
                 <MarkdownParser text={classData.protocol} />
              </div>
           </div>

           {/* EJEMPLO GENERADO VIVO POR LA IA O FALLBACK */}
           {classData.demoQuestion && (
               <div style={{ marginTop: 'clamp(30px, 6vw, 50px)', border: '3px solid #0f0', borderRadius: '15px', padding: 'clamp(15px, 4vw, 40px)', background: 'rgba(0,20,5,0.95)', boxShadow: '0 0 40px rgba(0,255,0,0.15)', boxSizing: 'border-box' }}>
                   <h3 style={{color: '#0f0', textAlign: 'center', marginTop: 0, fontSize: 'clamp(20px, 4.5vw, 28px)'}}>🧪 SIMULACIÓN BIOLÓGICA</h3>
                   <p style={{color: '#aaa', fontSize: 'clamp(12px, 3vw, 16px)', textAlign: 'center', fontStyle: 'italic', marginBottom:'30px'}}>Este organismo ha sido calculado en tiempo real. Jamás se repetirá.</p>
                   
                   <div style={{ color: '#fff', fontSize: 'clamp(16px, 3.5vw, 24px)', lineHeight: '1.6', background: 'rgba(255,255,255,0.05)', padding: 'clamp(15px, 3vw, 30px)', borderRadius: '10px' }}>
                       {classData.demoQuestion.text}
                   </div>
                   
                   <div style={{ marginTop: '30px', display: 'flex', flexDirection: 'column', gap: 'clamp(15px, 3vw, 20px)' }}>
                      {classData.demoQuestion.options.map((opt, idx) => {
                          const isCorrect = idx === classData.demoQuestion.correctIdx;
                          return (
                              <div key={idx} style={{ padding: 'clamp(15px, 3vw, 25px)', border: isCorrect ? '3px solid #0f0' : '2px solid #333', background: isCorrect ? 'rgba(0,255,0,0.1)' : 'transparent', color: isCorrect ? '#0f0' : '#aaa', borderRadius: '10px', fontSize: 'clamp(14px, 3.5vw, 22px)', fontWeight: isCorrect ? 'bold' : 'normal', wordWrap: 'break-word' }}>
                                  {String.fromCharCode(65 + idx)}. {opt} {isCorrect && " ➔ (Respuesta Correcta)"}
                              </div>
                          );
                      })}
                   </div>
                   
                   <div style={{ marginTop: '30px', padding: 'clamp(15px, 3vw, 30px)', background: 'rgba(0,255,0,0.05)', color: '#0f0', borderRadius: '10px', borderLeft: '6px solid #0f0', fontSize: 'clamp(14px, 3.5vw, 22px)', lineHeight: '1.8' }}>
                       <strong style={{fontSize: 'clamp(18px, 4vw, 24px)'}}>ANÁLISIS DEL RESULTADO:</strong><br/><br/>
                       <MarkdownParser text={classData.demoQuestion.analysis} />
                   </div>
               </div>
           )}

           <div style={{display:'flex', gap:'20px', marginTop:'60px', flexWrap: 'wrap'}}>
               <button className="hud-btn" style={{flex: '1 1 100%', background:'#555', color:'#fff', boxShadow: 'none', fontSize: 'clamp(16px, 3vw, 22px)', padding: 'clamp(15px, 3vw, 25px)'}} onClick={onBack}>VOLVER A DOMINIOS</button>
               <button className="hud-btn" style={{flex: '1 1 100%', background:'#ff00ff', color:'#fff', boxShadow: '0 0 30px rgba(255,0,255,0.5)', fontSize: 'clamp(16px, 3vw, 22px)', padding: 'clamp(15px, 3vw, 25px)'}} onClick={onClose}>{UI.aiClose}</button>
           </div>
        </div>
    )
}

/* ============================================================
   🎮 9. APLICACIÓN PRINCIPAL CIENCIAS (PHANTOM QUEUE Y CICLO)
============================================================ */

const getInitialStats = () => {
  if (typeof window !== 'undefined') {
    const saved = window.localStorage.getItem('icfes_biology_telemetry_v1'); 
    if (saved) return JSON.parse(saved);
  }
  return {
      totalQ: 0, correctQ: 0, totalTime: 0,
      topics: {
          'BIOLOGIA_CELULAR_Y_MEMBRANA': { c: 0, w: 0 },
          'ECOLOGIA_Y_ECOSISTEMAS': { c: 0, w: 0 },
          'SINTESIS_DE_PROTEINAS': { c: 0, w: 0 },
          'GENETICA_MENDELIANA': { c: 0, w: 0 },
          'SISTEMAS_ORGANICOS': { c: 0, w: 0 },
          'EVOLUCION_Y_ADAPTACION': { c: 0, w: 0 },
          'CICLOS_BIOGEOQUIMICOS': { c: 0, w: 0 },
          'FOTOSINTESIS_Y_RESPIRACION': { c: 0, w: 0 },
          'REDES_TROFICAS': { c: 0, w: 0 },
          'METODO_CIENTIFICO_BIO': { c: 0, w: 0 }
      },
      needsReview: [] 
  };
};

function GameApp() {
  const { language } = useGameStore() || { language: "es" };
  const safeLang = DICT_UI[language] ? language : 'es';
  const UI = DICT_UI[safeLang];
  const REPORT_UI = DICT_REPORT[safeLang] || DICT_REPORT['es'];

  const MAX_TIME = 180; 
  const WARMUP_TIME = 60; 

  const [phase, setPhase] = useState("BOOT"); 
  const [currentQData, setCurrentQData] = useState(null); 
  const [selectedOpt, setSelectedOpt] = useState(null);
  const [xp, setXp] = useState(0);
  
  const [timeLeft, setTimeLeft] = useState(MAX_TIME);
  const [timerActive, setTimerActive] = useState(false);
  const [scannerActive, setScannerActive] = useState(false);
  const [hintUsed, setHintUsed] = useState(false);
  
  const [pendingAIQ, setPendingAIQ] = useState(null);
  const isFetchingAI = useRef(false); 

  const [showAiModal, setShowAiModal] = useState(false); 
  const [activeAiTopic, setActiveAiTopic] = useState(null); 

  const [previousPhase, setPreviousPhase] = useState("BOOT"); 
  const [savedTime, setSavedTime] = useState(MAX_TIME);
  
  const [stats, setStats] = useState(getInitialStats);

  const failedTopics = useMemo(() => {
      return Object.keys(stats.topics).filter(topicId => stats.topics[topicId].w > 0);
  }, [stats]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('icfes_biology_telemetry_v1', JSON.stringify(stats));
    }
  }, [stats]);

  const currentQ = useMemo(() => {
      if (!currentQData) return null;
      // Si la pregunta viene del fallback algorítmico, extraemos el texto correcto.
      // (DeepSeek manda el JSON plano, el fallback lo manda dentro de texts[lang])
      if (currentQData.texts) {
          // El método buildShuffledQuestion ya devuelve las opciones barajadas y en el idioma,
          // no necesitamos extraerlas de texts de nuevo.
          return currentQData;
      }
      return currentQData; 
  }, [currentQData]);

  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    sfx.init();
    return () => { isMounted.current = false; };
  }, []);

  useEffect(() => {
    let interval = null;
    if (timerActive && timeLeft > 0) {
        interval = setInterval(() => setTimeLeft(t => t - 1), 1000);
    } else if (timeLeft === 0 && (phase === "GAME" || phase === "WARMUP")) {
        handleFailTimeout();
    }
    return () => clearInterval(interval);
  }, [timerActive, timeLeft, phase]);

  useEffect(() => {
      if (phase === "LOADING" && pendingAIQ) {
          setCurrentQData(pendingAIQ);
          setSelectedOpt(null);
          setTimeLeft(MAX_TIME);
          setPhase("GAME");
          setTimerActive(true);
          setPendingAIQ(null);
      }
  }, [phase, pendingAIQ]);

  const fetchAIQuestionBackground = useCallback(async (forcedTopic) => {
      if (isFetchingAI.current) return;
      isFetchingAI.current = true;
      try {
          const q = await DeepSeekEngine.generateQuestion(safeLang, forcedTopic);
          if (isMounted.current) setPendingAIQ(q);
      } catch (e) {
          console.warn("AI Fallback Bio: Generando organismo algorítmico de respaldo.");
          if (isMounted.current) setPendingAIQ(IcfesEngine.generateQuestion(safeLang, forcedTopic));
      } finally {
          if (isMounted.current) isFetchingAI.current = false;
      }
  }, [safeLang]);


  const generateNew = useCallback(() => {
      sfx.click();
      let forcedTopic = stats.needsReview.length > 0 ? stats.needsReview[0] : null;
      
      if (pendingAIQ) {
          setCurrentQData(pendingAIQ);
          setSelectedOpt(null);
          setTimeLeft(MAX_TIME);
          setScannerActive(false);
          setHintUsed(false);
          setPhase("GAME");
          setTimerActive(true);
          setShowAiModal(false);
          setActiveAiTopic(null);
          setPendingAIQ(null);
          
          fetchAIQuestionBackground(forcedTopic); 
          return;
      }

      const warmupQ = IcfesEngine.generateQuestion(safeLang, forcedTopic);
      setCurrentQData(warmupQ);
      setSelectedOpt(null);
      setTimeLeft(WARMUP_TIME);
      setScannerActive(false);
      setHintUsed(false);
      setPhase("WARMUP");
      setTimerActive(true);
      setShowAiModal(false);
      setActiveAiTopic(null);
      
      fetchAIQuestionBackground(forcedTopic);

  }, [safeLang, stats.needsReview, pendingAIQ, fetchAIQuestionBackground]);

  const retrySameQuestion = useCallback(() => {
      sfx.click();
      setSelectedOpt(null);
      const isWarmup = currentQData && currentQData.isAi === false;
      setTimeLeft(isWarmup ? WARMUP_TIME : MAX_TIME); 
      setPhase(isWarmup ? "WARMUP" : "GAME"); 
      setTimerActive(true); 
  }, [currentQData]);

  const handleFailTimeout = useCallback(() => {
      setTimerActive(false);
      sfx.error();
      if (phase === "GAME") updateStats(false, MAX_TIME);
      setPhase("MICROCLASS");
  }, [phase]);

  const submitAnswer = () => {
      if (selectedOpt === null) return;
      setTimerActive(false);
      sfx.click();

      const isCorrect = selectedOpt === currentQ.correctIdx;

      if (phase === "GAME") {
          const timeTaken = MAX_TIME - timeLeft;
          updateStats(isCorrect, timeTaken);
      }

      if (isCorrect) {
          sfx.success();
          setXp(p => p + (phase === "WARMUP" ? 50 : (hintUsed ? 50 : 200))); 
          setPhase("CORRECT");
          fetchAIQuestionBackground(stats.needsReview.length > 0 ? stats.needsReview[0] : null);
      } else {
          sfx.error();
          setPhase("MICROCLASS");
          fetchAIQuestionBackground(stats.needsReview.length > 0 ? stats.needsReview[0] : null);
      }
  };

  const updateStats = (isCorrect, timeTaken) => {
      setStats(prev => {
          const newTopics = { ...prev.topics };
          const internalId = currentQData?.id; 
          
          if (internalId && newTopics[internalId]) {
              newTopics[internalId].c += (isCorrect ? 1 : 0);
              newTopics[internalId].w += (isCorrect ? 0 : 1);
          } else if (internalId && !newTopics[internalId]) {
              newTopics[internalId] = { c: isCorrect ? 1 : 0, w: isCorrect ? 0 : 1 };
          }

          let newReview = [...prev.needsReview];
          if (internalId) {
             if (!isCorrect && !newReview.includes(internalId)) {
                 newReview.push(internalId); 
             } else if (isCorrect) {
                 newReview = newReview.filter(t => t !== internalId); 
             }
          }

          return {
              totalQ: prev.totalQ + 1,
              correctQ: prev.correctQ + (isCorrect ? 1 : 0),
              totalTime: prev.totalTime + timeTaken,
              topics: newTopics,
              needsReview: newReview
          };
      });
  };

  const toggleScanner = () => { 
      sfx.scanSweep(); 
      setScannerActive(true); 
      setHintUsed(true);
  };

  const openTelemetry = () => {
      sfx.aiPop();
      setPreviousPhase(phase);
      if (phase === "GAME" || phase === "WARMUP") {
          setSavedTime(timeLeft);
          setTimerActive(false);
      }
      setPhase("STATS");
  };

  const closeTelemetry = () => {
      sfx.click();
      setPhase(previousPhase);
      if (previousPhase === "GAME" || previousPhase === "WARMUP") {
          setTimeLeft(savedTime);
          setTimerActive(true); 
      }
  };

  const handleNextPhase = () => {
      if (phase === "CORRECT") {
          if (currentQData.isAi === false && !pendingAIQ) setPhase("LOADING");
          else generateNew(); 
      } else if (phase === "MICROCLASS") {
          retrySameQuestion(); 
      }
  };

  const downloadReport = useCallback(() => {
      sfx.scanSweep();
      const date = new Date().toLocaleString();
      
      const acc = stats.totalQ > 0 ? Math.round((stats.correctQ/stats.totalQ)*100) : 0;
      const avgT = stats.totalQ > 0 ? Math.round(stats.totalTime/stats.totalQ) : 0;
      
      const strong = [];
      const weak = [];
      
      let topicsHtml = '';
      Object.keys(stats.topics).forEach(topicId => {
          const t = stats.topics[topicId];
          const total = t.c + t.w;
          if (total > 0) {
              const pct = Math.round((t.c / total) * 100);
              const translatedName = IcfesEngine.getTopicName(topicId, safeLang);
              topicsHtml += `
                <div style="margin-bottom: 12px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <div style="font-weight: 700; font-size: 16px; color: #0f172a;">${translatedName}</div>
                        <div style="font-size: 13px; color: #64748b; margin-top: 4px;">${REPORT_UI.topicHit}: <span style="color:#10b981; font-weight:bold;">${t.c}</span> | ${REPORT_UI.topicMiss}: <span style="color:#ef4444; font-weight:bold;">${t.w}</span></div>
                    </div>
                    <div style="font-size: 20px; font-weight: 900; color: ${pct >= 60 ? '#10b981' : '#ef4444'};">${pct}%</div>
                </div>
              `;
              if (pct >= 60) strong.push(translatedName);
              else weak.push(translatedName);
          }
      });

      let aiVeredict = '';
      if (weak.length > 0) {
          aiVeredict = `
            <div style="background-color: #fef2f2; border-left: 6px solid #ef4444; padding: 20px; border-radius: 4px;">
                <div style="color: #b91c1c; font-weight: 900; font-size: 18px; margin-bottom: 10px;">${REPORT_UI.aiVuln}</div>
                <p style="color: #7f1d1d; margin: 0 0 10px 0; font-size: 14px;">${REPORT_UI.aiVulnDesc}</p>
                <ul style="color: #991b1b; margin: 0 0 15px 0; font-weight: bold;">
                    ${weak.map(w => `<li style="margin-bottom: 5px;">${w}</li>`).join('')}
                </ul>
                <div style="background-color: #fee2e2; padding: 10px; border-radius: 4px; border: 1px dashed #fca5a5;">
                    <strong style="color: #991b1b;">${REPORT_UI.aiAction}:</strong> ${REPORT_UI.aiActionDesc}
                </div>
            </div>`;
      } else if (strong.length > 0) {
          aiVeredict = `
            <div style="background-color: #f0fdf4; border-left: 6px solid #10b981; padding: 20px; border-radius: 4px;">
                <div style="color: #047857; font-weight: 900; font-size: 18px; margin-bottom: 10px;">${REPORT_UI.aiOpt}</div>
                <p style="color: #065f46; margin: 0;">${REPORT_UI.aiOptDesc}</p>
            </div>`;
      } else {
          aiVeredict = `<div style="color: #64748b; font-style: italic; padding: 20px; background: #f8fafc; border-radius: 4px;">${REPORT_UI.aiNoData}</div>`;
      }

      const printWindow = window.open('', '', 'height=900,width=850');
      printWindow.document.write(`
          <!DOCTYPE html>
          <html lang="${safeLang}">
              <head>
                  <title>Learning Labs - Biology Report</title>
                  <style>
                      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
                      body { font-family: 'Inter', sans-serif; background-color: #ffffff; color: #0f172a; margin: 0; padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                      .container { max-width: 800px; margin: 0 auto; padding: 40px; }
                      .header { display: flex; align-items: center; border-bottom: 4px solid #00ff88; padding-bottom: 30px; margin-bottom: 40px; }
                      .logo { width: 140px; height: auto; margin-right: 30px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
                      .title h1 { margin: 0 0 5px 0; color: #0f172a; font-size: 32px; font-weight: 900; letter-spacing: -0.5px; text-transform: uppercase; }
                      .title p { margin: 0; color: #64748b; font-size: 15px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; }
                      .timestamp { margin-top: 10px; display: inline-block; background: #f1f5f9; padding: 5px 10px; border-radius: 4px; font-size: 12px; color: #475569; font-weight: bold; }
                      .section-title { font-size: 20px; font-weight: 900; color: #0f172a; text-transform: uppercase; margin-bottom: 20px; display: flex; align-items: center; }
                      .section-title::before { content: ''; display: inline-block; width: 12px; height: 12px; background-color: #00ff88; margin-right: 10px; border-radius: 2px; }
                      .kpi-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 40px; }
                      .kpi-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 25px 20px; text-align: center; }
                      .kpi-val { font-size: 42px; font-weight: 900; color: #0f172a; line-height: 1; margin-bottom: 5px; }
                      .kpi-label { font-size: 13px; color: #64748b; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
                      .topics-container { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 30px; margin-bottom: 40px; }
                      .footer { text-align: center; margin-top: 60px; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 20px; font-weight: bold; }
                  </style>
              </head>
              <body>
                  <div class="container">
                      <div class="header">
                          <img src="https://res.cloudinary.com/dukiyxfvn/image/upload/v1768668244/WhatsApp_Image_2026-01-11_at_4.25.52_PM_p8aicp.jpg" class="logo" alt="Learning Labs" />
                          <div class="title">
                              <h1>${REPORT_UI.docTitle}</h1>
                              <p>${REPORT_UI.docSub}</p>
                              <div class="timestamp">${REPORT_UI.dateLabel}: ${date}</div>
                          </div>
                      </div>
                      <div class="section-title">${REPORT_UI.kpiTitle}</div>
                      <div class="kpi-grid">
                          <div class="kpi-card">
                              <div class="kpi-val" style="color: ${acc >= 60 ? '#10b981' : '#ef4444'}">${acc}%</div>
                              <div class="kpi-label">${REPORT_UI.kpiAcc}</div>
                          </div>
                          <div class="kpi-card">
                              <div class="kpi-val">${avgT}s</div>
                              <div class="kpi-label">${REPORT_UI.kpiTime}</div>
                          </div>
                          <div class="kpi-card">
                              <div class="kpi-val">${stats.totalQ}</div>
                              <div class="kpi-label">${REPORT_UI.kpiTotal}</div>
                          </div>
                      </div>
                      <div class="section-title">${REPORT_UI.aiTitle}</div>
                      <div style="margin-bottom: 40px;">${aiVeredict}</div>
                      <div class="section-title">${REPORT_UI.topicTitle}</div>
                      <div class="topics-container">
                          ${topicsHtml || `<p style="color: #64748b; text-align: center; font-style: italic;">${REPORT_UI.topicNoData}</p>`}
                      </div>
                      <div class="footer">
                          ${REPORT_UI.footer}<br/>${REPORT_UI.footerSub}
                      </div>
                  </div>
              </body>
          </html>
      `);
      printWindow.document.close();
      setTimeout(() => { printWindow.focus(); printWindow.print(); }, 750);
  }, [stats, safeLang, REPORT_UI]);

  return (
    <>
      <style>{`
        * { -webkit-tap-highlight-color: transparent; }
        .hud-btn { padding: clamp(12px, 3vw, 20px) clamp(15px, 4vw, 40px); background: #00ff88; color: #000; font-weight: 900; font-size: clamp(14px, 3.5vw, 24px); cursor: pointer; border-radius: 8px; border: none; font-family: 'Orbitron', monospace; transition: 0.2s; box-shadow: 0 0 20px rgba(0,255,136,0.4); text-transform: uppercase; user-select: none; }
        .hud-btn:hover { transform: scale(1.02); }
        .hud-btn:disabled { background: #555; color:#888; box-shadow: none; cursor:not-allowed; transform: none; }
        .opt-btn { display: block; width: 100%; margin: 10px 0; padding: clamp(12px, 3vw, 20px); background: rgba(0,20,10,0.8); border: 2px solid #555; color: #fff; font-size: clamp(14px, 3.5vw, 22px); border-radius: 10px; cursor: pointer; text-align: left; transition: 0.2s; font-family: 'Orbitron'; line-height: 1.4; user-select: none; min-height: 64px; }
        .opt-btn:hover { background: rgba(255,255,255,0.1); border-color: #aaa; }
        .opt-btn.selected { border-color: #ffea00; background: rgba(255,234,0,0.2); box-shadow: 0 0 20px rgba(255,234,0,0.4); color: #ffea00; }
        .glass-panel { background: rgba(0,15,5,0.85); border: 2px solid #00ff88; backdrop-filter: blur(20px); border-radius: 15px; box-shadow: 0 0 40px rgba(0,255,136,0.15); padding: clamp(15px, 4vw, 40px); box-sizing: border-box; }
        .hud-pulse { animation: pulse 1s infinite; }
        @keyframes pulse { 0% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.02); opacity: 0.8; } 100% { transform: scale(1); opacity: 1; } }
        
        .timer-danger { background: #ffaa00 !important; }
        .timer-critical { background: #f00 !important; animation: shake 0.5s infinite; }
        @keyframes shake { 0% { transform: translateX(0); } 25% { transform: translateX(-3px); } 50% { transform: translateX(3px); } 75% { transform: translateX(-3px); } 100% { transform: translateX(0); } }

        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: rgba(0,0,0,0.5); border-radius: 10px; }
        ::-webkit-scrollbar-thumb { background: rgba(0,255,136,0.4); border-radius: 10px; }
      `}</style>
      
      <main style={{ position:'absolute', inset:0, overflow:'hidden', background:'#000', fontFamily:'Orbitron, sans-serif', padding: 'env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)', boxSizing: 'border-box' }}>
        
        {/* PANTALLA DE CARGA IA */}
        {phase === "LOADING" && (
            <QuantumIntermission lang={safeLang} loadingText={UI.loadingData} />
        )}

        {/* PANTALLA INICIAL Y TEORÍA */}
        {(phase === "BOOT" || phase === "THEORY") && (
          <section style={{ position:'absolute', inset:0, zIndex:3000, background:'#000510', display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center', padding:'clamp(15px, 4vw, 20px)', boxSizing: 'border-box' }}>
            <h1 style={{color:'#00ff88', fontSize:'clamp(30px, 8vw, 80px)', textShadow:'0 0 40px #00ff88', textAlign:'center', margin: '0 0 20px 0', lineHeight: '1.1'}}>{UI.title}</h1>
            {phase === "THEORY" && <p style={{color:'#fff', fontSize:'clamp(14px, 3.5vw, 24px)', maxWidth:'800px', textAlign:'center', marginBottom:'clamp(30px, 6vw, 40px)', lineHeight:'1.6', borderLeft: '4px solid #ffea00', paddingLeft: 'clamp(10px, 3vw, 20px)'}}>{UI.theoryText}</p>}
            
            <div style={{display:'flex', gap:'clamp(10px, 3vw, 20px)', flexWrap:'wrap', justifyContent:'center', width: '100%', maxWidth: '800px'}}>
                <button className="hud-btn" style={{flex: '1 1 250px'}} onClick={() => { if(phase === "BOOT") setPhase("THEORY"); else { generateNew(); } }}>{phase === "BOOT" ? UI.start : "EMPEZAR EVALUACIÓN"}</button>
                <button className="hud-btn" style={{flex: '1 1 250px', background:'rgba(10,30,10,0.8)', color:'#00ff88', border:'2px solid #00ff88'}} onClick={openTelemetry}>📊 {UI.statsBtn}</button>
            </div>
          </section>
        )}

        {/* NÚCLEO 3D DE FONDO Y UI EN JUEGO */}
        {phase !== "BOOT" && phase !== "THEORY" && (
          <>
            <div style={{position:'absolute', inset:0, zIndex:1, pointerEvents:'none'}}>
              <Suspense fallback={null}>
                <Canvas camera={{position:[0, 2, 28], fov:45}}>
                  <Core3D isExploding={phase === "MICROCLASS"} scannerActive={scannerActive} timeRatio={(MAX_TIME - timeLeft)/MAX_TIME} isLoading={phase === "LOADING"} />
                </Canvas>
              </Suspense>
            </div>

            {/* HEADER ESTADÍSTICAS Y TELEMETRÍA (MOBILE FIRST) */}
            <nav style={{ position: 'absolute', top: 'max(15px, env(safe-area-inset-top))', left: 'clamp(10px, 3vw, 20px)', right: 'clamp(10px, 3vw, 20px)', display: 'flex', justifyContent: 'space-between', zIndex: 500, flexWrap:'wrap', gap:'10px' }}>
              <div style={{display:'flex', gap:'clamp(10px, 3vw, 15px)', alignItems:'center', flexWrap: 'wrap'}}>
                  {currentQData && (phase === "GAME" || phase === "WARMUP") && (
                     <div className={stats.needsReview.includes(currentQData?.id) ? 'hud-pulse' : ''} style={{background: stats.needsReview.includes(currentQData?.id) ? '#ffea00' : '#ff0055', color: stats.needsReview.includes(currentQData?.id) ? '#000' : '#fff', padding:'clamp(6px, 2vw, 10px) clamp(10px, 3vw, 20px)', borderRadius:'8px', fontWeight:'bold', fontSize:'clamp(10px, 2.5vw, 16px)'}}>
                         {UI.topic}: {currentQData?.topic} {stats.needsReview.includes(currentQData?.id) ? ' ⚠️' : ''}
                     </div>
                  )}
                  {phase === "WARMUP" && (
                      <div className="hud-pulse" style={{background: '#ffaa00', color: '#000', padding:'clamp(6px, 2vw, 10px) clamp(10px, 3vw, 20px)', borderRadius:'8px', fontWeight:'bold', fontSize:'clamp(10px, 2.5vw, 16px)'}}>
                          {UI.warmupTitle}
                      </div>
                  )}
                  <div style={{color:'#0f0', fontWeight:'bold', fontSize:'clamp(14px, 3.5vw, 20px)'}}>XP: {xp}</div>
              </div>
              {phase !== "STATS" && phase !== "LOADING" && (
                 <button className="hud-btn" style={{background:'rgba(10,30,10,0.8)', color:'#00ff88', border:'1px solid #00ff88', padding:'8px 15px', fontSize:'clamp(10px, 2.5vw, 14px)', boxShadow:'none'}} onClick={openTelemetry}>📊 {UI.statsBtn}</button>
              )}
            </nav>

            {/* SEÑALADOR DE DEEPSEEK NEURAL MATRIX */}
            {phase === "GAME" && (
               <div style={{position: 'absolute', bottom: 'max(15px, env(safe-area-inset-bottom))', right: 'clamp(10px, 3vw, 15px)', color: currentQData?.isAi ? '#ff00ff' : '#00ff88', fontSize: 'clamp(8px, 2vw, 12px)', fontWeight: 'bold', zIndex: 100, textShadow: currentQData?.isAi ? '0 0 10px #ff00ff' : 'none', letterSpacing: '1px', textAlign: 'right'}}>
                  {currentQData?.isAi ? "🧠 DEEPSEEK NEURAL MATRIX ACTIVE" : "⚙️ ALGORITHMIC FALLBACK ACTIVE"}
               </div>
            )}

            {/* BARRA DE PRESIÓN DE TIEMPO */}
            {(phase === "GAME" || phase === "WARMUP") && (
                <div style={{position:'absolute', top:'clamp(60px, calc(env(safe-area-inset-top) + 60px), 100px)', left:'50%', transform:'translateX(-50%)', width:'95%', maxWidth:'800px', zIndex:100, display:'flex', flexDirection:'column', alignItems:'center'}}>
                    {phase === "WARMUP" && <div style={{color: '#ffaa00', fontSize: 'clamp(10px, 2.5vw, 14px)', marginBottom: '5px', textAlign: 'center'}}>{UI.warmupSub}</div>}
                    <div style={{color: timeLeft > 30 ? '#00ff88' : (timeLeft > 15 ? '#ffaa00' : '#f00'), fontSize:'clamp(18px, 5vw, 28px)', fontWeight:'bold', marginBottom:'10px', textShadow: timeLeft <= 15 ? '0 0 10px #f00' : 'none'}} className={timeLeft <= 15 ? 'hud-pulse' : ''}>
                        {UI.time}: {Math.floor(timeLeft / 60)}:{('0' + (timeLeft % 60)).slice(-2)}
                    </div>
                    <div style={{width: '100%', height:'clamp(10px, 2.5vw, 15px)', background:'rgba(255,255,255,0.1)', borderRadius:'10px', overflow:'hidden', border: '1px solid #444'}}>
                        <div className={timeLeft <= 15 ? 'timer-critical' : (timeLeft <= 36 ? 'timer-danger' : '')} style={{width: `${(timeLeft/(phase === "WARMUP" ? WARMUP_TIME : MAX_TIME))*100}%`, height:'100%', background: phase === "WARMUP" ? '#ffaa00' : '#00ff88', borderRadius:'10px', transition:'width 1s linear, background 0.5s'}} />
                    </div>
                    
                    {!scannerActive && phase === "GAME" && (
                        <button className="hud-btn" style={{background:'rgba(0,255,0,0.1)', border:'1px solid #0f0', color:'#0f0', marginTop:'15px', fontSize:'clamp(10px, 3vw, 16px)', padding:'8px 15px', backdropFilter:'blur(10px)'}} onClick={toggleScanner}>
                            👁️ {UI.scan} (-50 XP)
                        </button>
                    )}
                </div>
            )}

            {/* PREGUNTA Y OPCIONES */}
            {(phase === "GAME" || phase === "WARMUP") && currentQ && (
              <div style={{ position:'absolute', top:'clamp(140px, 22vh, 180px)', left:'50%', transform:'translateX(-50%)', width: '95%', maxWidth:'1000px', zIndex:100, boxSizing: 'border-box' }}>
                <article className="glass-panel" style={{maxHeight:'clamp(50vh, 65vh, 75vh)', overflowY:'auto', borderColor: phase === "WARMUP" ? '#ffaa00' : '#00ff88'}}>
                  <h2 style={{color:'#fff', fontSize:'clamp(16px, 4vw, 26px)', lineHeight:'1.5', fontWeight:'normal', margin:0}}>{currentQ.text}</h2>
                  
                  {scannerActive && (
                      <div className="hud-pulse" style={{background:'rgba(0,255,136,0.1)', borderLeft:'4px solid #00ff88', padding:'clamp(10px, 3vw, 15px)', margin:'15px 0', color:'#00ff88', fontSize:'clamp(14px, 3.5vw, 20px)', fontWeight:'bold'}}>
                          🤖 {UI.aiBtn}: {currentQ.hint}
                      </div>
                  )}

                  <div style={{marginTop:'clamp(15px, 4vw, 30px)'}}>
                      {currentQ.options.map((opt, i) => (
                          <button key={i} className={`opt-btn ${selectedOpt === i ? 'selected' : ''}`} onClick={() => {sfx.click(); setSelectedOpt(i);}}>
                              <span style={{fontWeight:'bold', marginRight:'clamp(5px, 2vw, 15px)', color: selectedOpt === i ? '#ffea00' : '#00ff88'}}>{String.fromCharCode(65 + i)}.</span> {opt}
                          </button>
                      ))}
                  </div>

                  <div style={{display:'flex', justifyContent:'center', marginTop:'clamp(20px, 5vw, 40px)'}}>
                      <button className="hud-btn" style={{width:'100%', height:'clamp(50px, 8vw, 80px)', fontSize:'clamp(14px, 4vw, 28px)', background: phase === "WARMUP" ? '#ffaa00' : '#00ff88'}} disabled={selectedOpt === null} onClick={submitAnswer}>{UI.btnCheck}</button>
                  </div>
                </article>
              </div>
            )}

            {/* OVERLAY: RESPUESTA CORRECTA */}
            {phase === "CORRECT" && (
              <section style={{ position:'absolute', inset:0, zIndex:2000, background:'rgba(0,40,10,0.95)', display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center', backdropFilter:'blur(10px)', padding:'clamp(15px, 4vw, 20px)', textAlign:'center', boxSizing: 'border-box' }}>
                  <h1 className="hud-pulse" style={{color:'#0f0', fontSize:'clamp(24px, 6vw, 80px)', textShadow:'0 0 40px #0f0', margin:0, lineHeight: 1.1}}>{UI.correctTitle}</h1>
                  <p style={{color:'#fff', fontSize:'clamp(18px, 4.5vw, 30px)', marginTop:'20px'}}>XP: <span style={{color:'#0f0', fontWeight:'bold'}}>+{hintUsed ? '50' : '200'}</span></p>
                  <p style={{color:'#aaa', fontSize:'clamp(12px, 3.5vw, 20px)'}}>{UI.time}: {MAX_TIME - timeLeft}s</p>
                  <button className="hud-btn" style={{marginTop:'clamp(30px, 6vw, 50px)', background:'#0f0', color:'#000', width: '100%', maxWidth: '400px'}} onClick={handleNextPhase}>{UI.btnNext}</button>
              </section>
            )}

            {/* OVERLAY: MICRO-CLASE SOCRÁTICA */}
            {phase === "MICROCLASS" && (
              <section style={{ position:'absolute', inset:0, zIndex:2000, background:'rgba(40,0,0,0.95)', display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center', padding:'clamp(10px, 3vw, 20px)', backdropFilter:'blur(10px)', boxSizing: 'border-box' }}>
                  <article className="glass-panel" style={{borderColor:'#f00', maxWidth:'1000px', width:'100%', textAlign:'left', boxShadow:'0 0 50px rgba(255,0,255,0.3)', maxHeight:'90dvh', overflowY:'auto'}}>
                      <h1 style={{color:'#f00', fontSize:'clamp(20px, 5vw, 50px)', marginBottom:'20px', textAlign:'center', borderBottom:'2px solid #f00', paddingBottom:'10px', lineHeight: 1.1}}>
                          ⚠️ {timeLeft === 0 ? UI.timeout : UI.wrongTitle}
                      </h1>
                      
                      {currentQData?.trapExplanations && currentQData.trapExplanations[selectedOpt] && (
                          <div style={{color:'#ffaa00', fontSize:'clamp(14px, 3.5vw, 22px)', marginTop:'15px', padding:'clamp(15px, 3vw, 20px)', background:'rgba(255,170,0,0.1)', borderLeft:'4px solid #ffaa00', fontWeight:'bold'}}>
                              {currentQData.trapExplanations[selectedOpt]}
                          </div>
                      )}

                      <div style={{color:'#fff', fontSize:'clamp(14px, 3.5vw, 24px)', lineHeight:'1.6', background:'rgba(0,0,0,0.6)', padding:'clamp(15px, 4vw, 30px)', borderRadius:'10px', whiteSpace:'pre-wrap', borderLeft:'4px solid #00ff88', marginTop:'20px'}}>
                          <MarkdownParser text={currentQData?.microclass} />
                      </div>
                      
                      <div style={{display:'flex', justifyContent:'center'}}>
                          <button className="hud-btn" style={{marginTop:'clamp(20px, 5vw, 40px)', background:'#ffea00', color:'#000', width:'100%', height:'clamp(50px, 8vw, 80px)', fontSize:'clamp(16px, 4vw, 24px)'}} onClick={handleNextPhase}>{UI.btnRetrySame}</button>
                      </div>
                  </article>
              </section>
            )}

            {/* DASHBOARD TELEMETRÍA */}
            {phase === "STATS" && !showAiModal && (
              <section style={{ position:'absolute', inset:0, zIndex:2000, background:'rgba(0,20,10,0.98)', display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center', padding:'clamp(10px, 3vw, 20px)', boxSizing: 'border-box' }}>
                  <article className="glass-panel" style={{maxWidth:'1000px', width:'100%', maxHeight:'95dvh', overflowY:'auto'}}>
                      <h2 style={{color:'#00ff88', textAlign:'center', fontSize:'clamp(20px, 5vw, 40px)', borderBottom:'2px solid #00ff88', paddingBottom:'15px', margin:0}}>{UI.dashboard}</h2>
                      
                      {/* KPIs */}
                      <div style={{display:'flex', justifyContent:'space-around', flexWrap:'wrap', margin:'clamp(20px, 5vw, 40px) 0', gap:'clamp(10px, 3vw, 20px)'}}>
                          <div style={{textAlign:'center', color:'#fff', background:'rgba(255,255,255,0.05)', padding:'clamp(15px, 3vw, 20px)', borderRadius:'15px', flex:'1 1 140px'}}>
                              <div style={{fontSize:'clamp(28px, 6vw, 60px)', fontWeight:'bold', color: stats.totalQ === 0 ? '#aaa' : (stats.correctQ/stats.totalQ > 0.6 ? '#0f0' : '#ff0055')}}>
                                  {stats.totalQ > 0 ? Math.round((stats.correctQ/stats.totalQ)*100) : 0}%
                              </div>
                              <div style={{fontSize:'clamp(11px, 2.5vw, 18px)', letterSpacing:'1px', color:'#aaa'}}>{UI.mastery}</div>
                          </div>
                          <div style={{textAlign:'center', color:'#fff', background:'rgba(255,255,255,0.05)', padding:'clamp(15px, 3vw, 20px)', borderRadius:'15px', flex:'1 1 140px'}}>
                              <div style={{fontSize:'clamp(28px, 6vw, 60px)', fontWeight:'bold', color:'#ffea00'}}>
                                  {stats.totalQ > 0 ? Math.round(stats.totalTime/stats.totalQ) : 0}s
                              </div>
                              <div style={{fontSize:'clamp(11px, 2.5vw, 18px)', letterSpacing:'1px', color:'#aaa'}}>{UI.avgTime}</div>
                          </div>
                      </div>

                      {/* BOTÓN IA SOCRÁTICO */}
                      <div style={{display:'flex', justifyContent:'center', marginBottom:'clamp(20px, 5vw, 30px)'}}>
                         <button 
                            className="hud-btn" 
                            style={{background: failedTopics.length > 0 ? '#ff00ff' : '#0f0', color: failedTopics.length > 0 ? '#fff' : '#000', width: '100%', maxWidth: '600px', boxShadow: failedTopics.length > 0 ? '0 0 30px #ff00ff' : '0 0 30px #0f0', fontSize: 'clamp(14px, 3vw, 20px)'}} 
                            onClick={() => { sfx.aiPop(); setShowAiModal(true); }}
                         >
                            🧠 {UI.aiSocraticBtn}
                         </button>
                      </div>

                      <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(clamp(200px, 40vw, 250px), 1fr))', gap:'clamp(10px, 3vw, 20px)'}}>
                          {Object.keys(stats.topics).map(topicId => {
                              const t = stats.topics[topicId];
                              const total = t.c + t.w;
                              if (total === 0) return null; 
                              const pct = total > 0 ? Math.round((t.c/total)*100) : 0;
                              const isFailed = t.w > 0;
                              
                              const displayName = IcfesEngine.getTopicName(topicId, safeLang);

                              return (
                                  <div key={topicId} className={isFailed ? 'hud-pulse' : ''} style={{background:'rgba(0,0,0,0.5)', padding:'clamp(10px, 3vw, 20px)', borderRadius:'10px', border: isFailed ? '2px solid #f00' : '1px solid #333'}}>
                                      <div style={{color: isFailed ? '#f00' : '#00ff88', fontWeight:'bold', marginBottom:'10px', fontSize:'clamp(11px, 2.5vw, 16px)'}}>
                                          {displayName} {isFailed ? ' ⚠️' : ''}
                                      </div>
                                      <div style={{width:'100%', height:'10px', background:'#222', borderRadius:'5px', overflow:'hidden'}}>
                                          <div style={{width:`${pct}%`, height:'100%', background: pct >= 60 ? '#0f0' : (pct > 0 ? '#ffea00' : '#ff0055')}}></div>
                                      </div>
                                      <div style={{color:'#aaa', fontSize:'clamp(10px, 2.5vw, 14px)', marginTop:'8px', display:'flex', justifyContent:'space-between'}}>
                                          <span>${REPORT_UI.topicHit}: <span style={{color:'#0f0'}}>{t.c}</span></span>
                                          <span>${REPORT_UI.topicMiss}: <span style={{color:'#f00'}}>{t.w}</span></span>
                                      </div>
                                  </div>
                              );
                          })}
                      </div>

                      {/* BOTONES DE ACCIÓN: INCLUYE EL DOSSIER PDF */}
                      <div style={{display:'flex', justifyContent:'center', marginTop:'clamp(30px, 6vw, 50px)', gap:'clamp(10px, 3vw, 20px)', flexWrap:'wrap'}}>
                          <button className="hud-btn" style={{flex:'1 1 200px', background:'transparent', border:'2px solid #00ff88', color:'#00ff88', fontSize: 'clamp(12px, 3vw, 18px)'}} onClick={downloadReport}>📄 {UI.downloadReport}</button>
                          <button className="hud-btn" style={{flex:'1 1 200px', fontSize: 'clamp(12px, 3vw, 18px)'}} onClick={closeTelemetry}>VOLVER A LA MISIÓN</button>
                          <button className="hud-btn" style={{flex:'1 1 200px', background:'transparent', border:'2px solid #f00', color:'#f00', fontSize: 'clamp(12px, 3vw, 18px)'}} onClick={() => { window.localStorage.removeItem('icfes_biology_telemetry_v1'); window.location.reload(); }}>{UI.btnRetry}</button>
                      </div>
                  </article>
              </section>
            )}

            {/* MODAL IA INTERACTIVA */}
            {showAiModal && phase === "STATS" && (
               <section style={{ position:'absolute', inset:0, zIndex:3000, background:'rgba(20,0,20,0.98)', display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center', padding:'clamp(10px, 2vw, 20px)', backdropFilter:'blur(10px)', boxSizing: 'border-box' }}>
                   <article className="glass-panel" style={{borderColor:'#ff00ff', maxWidth:'1200px', width:'100%', textAlign:'left', boxShadow:'0 0 50px rgba(255,0,255,0.3)', maxHeight:'95dvh', overflowY:'auto'}}>
                       
                       {failedTopics.length > 0 ? (
                           <>
                               {!activeAiTopic ? (
                                   <>
                                       <h2 style={{color:'#ff00ff', fontSize:'clamp(18px, 4.5vw, 40px)', textAlign:'center', marginBottom:'clamp(20px, 4vw, 30px)'}}>{UI.aiSelectTopic}</h2>
                                       <div style={{display:'flex', flexDirection:'column', gap:'clamp(10px, 2vw, 15px)'}}>
                                           {failedTopics.map((topicId, i) => (
                                               <button key={i} className="opt-btn" style={{borderColor:'#ff00ff', color:'#fff', fontSize: 'clamp(14px, 3.5vw, 20px)', padding: 'clamp(15px, 3vw, 20px)'}} onClick={() => { sfx.click(); setActiveAiTopic(topicId); }}>
                                                   🔬 INICIAR MASTERCLASS IA: {IcfesEngine.getTopicName(topicId, safeLang)}
                                               </button>
                                           ))}
                                       </div>
                                       <button className="hud-btn" style={{width:'100%', marginTop:'clamp(20px, 5vw, 40px)', background:'#555', color:'#fff'}} onClick={() => setShowAiModal(false)}>{UI.aiClose}</button>
                                   </>
                               ) : (
                                   <SocraticMasterclass 
                                      topic={activeAiTopic} 
                                      lang={safeLang} 
                                      onBack={() => { sfx.click(); setActiveAiTopic(null); }} 
                                      onClose={() => { sfx.click(); setShowAiModal(false); }} 
                                      UI={UI} 
                                   />
                               )}
                           </>
                       ) : (
                           <>
                             <h2 style={{color:'#0f0', fontSize:'clamp(18px, 4vw, 32px)', textAlign:'center', margin:'clamp(20px, 5vw, 30px) 0'}}>{UI.aiPraise}</h2>
                             <button className="hud-btn" style={{width:'100%', background:'#0f0', color:'#000'}} onClick={() => setShowAiModal(false)}>CERRAR IA</button>
                           </>
                       )}
                   </article>
               </section>
            )}

          </>
        )}
      </main>
    </>
  );
}

export default function IcfesLab() {
  return (
    <GameErrorBoundary>
      <GameApp />
    </GameErrorBoundary>
  );
}