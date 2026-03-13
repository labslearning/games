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
          <h1 style={{ fontSize: 'clamp(24px, 6vw, 60px)', textShadow: '0 0 30px #f00', color: '#ff0033' }}>⚠️ FATAL COGNITIVE ERROR</h1>
          <p style={{ background: 'rgba(255,0,0,0.1)', padding: 'clamp(15px, 4vw, 20px)', borderRadius: '10px', border:'1px solid #f00', maxWidth:'800px', width: '100%', fontSize: 'clamp(14px, 3.5vw, 18px)', color: '#fff', wordWrap: 'break-word' }}>{this.state.errorMsg}</p>
          <button onClick={() => { window.localStorage.removeItem('icfes_reading_telemetry_v1'); window.location.reload(); }} style={{ marginTop: '30px', padding: 'clamp(12px, 3vw, 15px) clamp(20px, 5vw, 30px)', fontSize: 'clamp(14px, 4vw, 18px)', cursor: 'pointer', background: '#ff0033', color: '#fff', border: 'none', borderRadius: '8px', fontWeight:'bold', textTransform: 'uppercase' }}>Reignite Synapses (Clear Cache)</button>
        </div>
      );
    }
    return this.props.children;
  }
}

/* ============================================================
   🧠 2. MOTOR GENERATIVO LECTURA CRÍTICA (MULTI-IDIOMA ESTRICTO)
============================================================ */
class IcfesEngine {
  
  static getTopicName(topicId, lang) {
      const mockQ = this.generateQuestion(lang, topicId);
      return mockQ.topic || topicId.replace(/_/g, ' ');
  }

  static generateQuestion(lang, forcedTopic = null) {
    const topics = [
      'COMPRENSION_LITERAL_SINTACTICA', 'SENTIDO_GLOBAL_DEL_TEXTO', 'REFLEXION_Y_EVALUACION_CRITICA', 
      'TEXTOS_CONTINUOS_LITERARIOS', 'TEXTOS_CONTINUOS_INFORMATIVOS', 'TEXTOS_DISCONTINUOS_GRAFICOS',
      'INTENCION_COMUNICATIVA', 'RELACIONES_SEMANTICAS', 'ARGUMENTACION_Y_PREMISAS', 'VISION_DEL_MUNDO_AUTOR'
    ];
    const selectedTopic = forcedTopic || topics[Math.floor(Math.random() * topics.length)];

    switch (selectedTopic) {
      case 'COMPRENSION_LITERAL_SINTACTICA': return this.genLiteral(lang);
      case 'SENTIDO_GLOBAL_DEL_TEXTO': return this.genGlobal(lang);
      case 'REFLEXION_Y_EVALUACION_CRITICA': return this.genCritical(lang);
      case 'TEXTOS_CONTINUOS_LITERARIOS': return this.genLiterary(lang);
      case 'TEXTOS_CONTINUOS_INFORMATIVOS': return this.genInformativo(lang);
      case 'INTENCION_COMUNICATIVA': return this.genIntencion(lang);
      case 'ARGUMENTACION_Y_PREMISAS': return this.genArgumentacion(lang);
      default: return this.genGlobal(lang);
    }
  }

  static generateLocalMasterclass(topic, lang) {
      const q = this.generateQuestion(lang, topic);
      return {
          title: `ENTRENAMIENTO COGNITIVO: ${q.topic}`,
          theory: `[SISTEMA AISLADO DE DEEPSEEK]\n\nEl núcleo teórico de ${q.topic} evalúa tu competencia lectora. El ICFES no mide tu opinión personal sobre un tema, sino tu capacidad para identificar qué dice el texto explícitamente (nivel literal), qué infiere (nivel global) y cómo se posiciona el autor (nivel crítico).\n\nLa clave está en anclar cada respuesta a una oración o premisa que exista dentro de los límites del texto.`,
          trap: "El ICFES suele emplear distractores de 'Conocimiento Previo': opciones que afirman verdades del mundo real que NO están mencionadas ni sustentadas en el texto.",
          protocol: "1. Lee la pregunta antes que el texto para saber qué buscar.\n2. Identifica si te piden información local (un párrafo) o global (todo el texto).\n3. Descarta opciones que contengan generalizaciones absolutas ('siempre', 'todos') si el autor no las usa.\n4. Selecciona la opción que tenga respaldo textual directo.",
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

  static genGlobal(lang) {
    const texts = {
      es: {
        topic: 'SENTIDO GLOBAL DEL TEXTO', text: `TEXTO: "Nadie es justo por voluntad, sino porque no tiene el poder de cometer injusticias. Si damos al justo y al injusto el poder de hacer lo que quieran, sorprenderemos al justo tomando el mismo camino que el injusto, siguiendo sus propios intereses."\n\n¿Cuál es la tesis principal (sentido global) que defiende el autor en el fragmento?`, hint: "La tesis es la idea central que el autor intenta demostrar.", micro: `El autor argumenta que la justicia no es un deseo natural, sino una restricción impuesta. Si no hubiera castigo, todos (incluso los 'justos') actuarían de forma egoísta e injusta.`,
        opts: ["El ser humano actúa justamente solo por imposición o falta de poder para ser injusto.", "La justicia es el camino natural de todas las criaturas en la sociedad.", "Las personas justas siempre serán justas sin importar el poder que tengan.", "Las leyes son inútiles porque los hombres siempre buscarán sus propios intereses."],
        traps: [null, "El texto afirma exactamente lo contrario (nadie es justo por voluntad).", "El autor dice que el justo tomaría el mismo camino que el injusto si tuviera poder.", "El autor no dice que las leyes sean inútiles, dice que obligan a respetar la igualdad."]
      },
      en: {
        topic: 'GLOBAL MEANING OF THE TEXT', text: `TEXT: "No one is just by will, but because they lack the power to commit injustices. If we grant both the just and the unjust the power to do whatever they want, we will catch the just man taking the same path as the unjust, following his own interests."\n\nWhat is the main thesis (global meaning) defended by the author?`, hint: "The thesis is the central idea the author is trying to prove.", micro: `The author argues that justice is not a natural desire, but an imposed restriction. Without punishment, everyone would act selfishly.`,
        opts: ["Human beings act justly only out of imposition or lack of power to be unjust.", "Justice is the natural path for all creatures in society.", "Just people will always be just regardless of the power they hold.", "Laws are useless because men will always seek their own interests."],
        traps: [null, "The text claims the exact opposite.", "The author says the just would act unjustly if given absolute power.", "The author doesn't say laws are useless; they force respect for equality."]
      },
      fr: {
        topic: 'SENS GLOBAL DU TEXTE', text: `TEXTE : "Personne n'est juste par volonté, mais par manque de pouvoir de commettre des injustices. Si nous donnons au juste et à l'injuste le pouvoir de faire ce qu'ils veulent, nous surprendrons le juste empruntant le même chemin que l'injuste."\n\nQuelle est la thèse principale défendue par l'auteur ?`, hint: "La thèse est l'idée centrale que l'auteur tente de prouver.", micro: `L'auteur soutient que la justice n'est pas un désir naturel, mais une restriction imposée. Sans punition, tout le monde agirait de manière égoïste.`,
        opts: ["Les humains n'agissent justement que par contrainte ou manque de pouvoir.", "La justice est la voie naturelle de toutes les créatures.", "Les personnes justes seront toujours justes peu importe leur pouvoir.", "Les lois sont inutiles car les hommes cherchent toujours leurs intérêts."],
        traps: [null, "Le texte affirme exactement le contraire.", "L'auteur dit que le juste agirait de manière injuste s'il avait le pouvoir.", "L'auteur ne dit pas que les lois sont inutiles."]
      },
      de: {
        topic: 'GLOBALE BEDEUTUNG', text: `TEXT: "Niemand ist aus freiem Willen gerecht, sondern weil ihm die Macht fehlt, Unrecht zu tun. Wenn wir dem Gerechten und dem Ungerechten die Macht geben, zu tun, was sie wollen, werden wir den Gerechten auf demselben Weg wie den Ungerechten ertappen."\n\nWas ist die Hauptthese des Autors?`, hint: "Die These ist der Kerngedanke, den der Autor beweisen will.", micro: `Der Autor argumentiert, dass Gerechtigkeit kein natürlicher Wunsch ist, sondern eine auferlegte Einschränkung. Ohne Strafe würden alle egoistisch handeln.`,
        opts: ["Menschen handeln nur aus Zwang oder mangelnder Macht gerecht.", "Gerechtigkeit ist der natürliche Weg aller Lebewesen.", "Gerechte Menschen bleiben immer gerecht, unabhängig von ihrer Macht.", "Gesetze sind nutzlos, da Menschen immer ihre eigenen Interessen verfolgen."],
        traps: [null, "Der Text behauptet genau das Gegenteil.", "Der Autor sagt, der Gerechte würde ungerecht handeln, wenn er die Macht hätte.", "Der Autor sagt nicht, dass Gesetze nutzlos sind."]
      }
    };
    return this.buildShuffledQuestion('SENTIDO_GLOBAL_DEL_TEXTO', lang, texts);
  }

  static genCritical(lang) {
    const texts = {
      es: {
        topic: 'REFLEXIÓN CRÍTICA', text: `TEXTO: "Los recientes hallazgos demuestran que los videojuegos de acción mejoran la coordinación visomotora. Sin embargo, algunos sectores conservadores insisten, sin aportar datos empíricos, en prohibirlos bajo la excusa de que fomentan la violencia."\n\n¿Cuál es la actitud del autor hacia los "sectores conservadores"?`, hint: "Evalúa las palabras que usa el autor: 'insisten', 'sin aportar datos', 'excusa'.", micro: `El autor utiliza términos despectivos ('excusa', 'sin datos empíricos') para descalificar la postura de los sectores conservadores, revelando una actitud crítica y de rechazo hacia ellos.`,
        opts: ["Crítica y de desaprobación, al considerarlos carentes de fundamentos.", "Objetiva e imparcial, limitándose a exponer ambas posturas.", "Conciliadora, buscando un punto medio entre la ciencia y la moral.", "Indiferente, pues su enfoque está únicamente en la coordinación visomotora."],
        traps: [null, "No es imparcial; usa palabras con carga valorativa como 'excusa'.", "No busca un punto medio, ataca abiertamente el argumento conservador.", "Si fuera indiferente, no los habría mencionado explícitamente para criticarlos."]
      },
      en: {
        topic: 'CRITICAL REFLECTION', text: `TEXT: "Recent findings show action video games improve visuomotor coordination. However, some conservative sectors insist, without providing empirical data, on banning them under the excuse that they promote violence."\n\nWhat is the author's attitude towards the "conservative sectors"?`, hint: "Evaluate the author's word choice: 'insist', 'without data', 'excuse'.", micro: `The author uses derogatory terms ('excuse', 'without empirical data') to discredit the conservative sectors, revealing a critical and disapproving attitude.`,
        opts: ["Critical and disapproving, considering them baseless.", "Objective and impartial, merely presenting both sides.", "Conciliatory, seeking a middle ground between science and morals.", "Indifferent, focusing solely on visuomotor coordination."],
        traps: [null, "Not impartial; uses loaded words like 'excuse'.", "Does not seek a middle ground, openly attacks the conservative argument.", "If indifferent, wouldn't have mentioned them to criticize them."]
      },
      fr: {
        topic: 'RÉFLEXION CRITIQUE', text: `TEXTE : "Des découvertes récentes montrent que les jeux vidéo d'action améliorent la coordination visomotrice. Cependant, certains secteurs conservateurs insistent, sans fournir de données, pour les interdire sous l'excuse qu'ils favorisent la violence."\n\nQuelle est l'attitude de l'auteur envers les "secteurs conservateurs" ?`, hint: "Évaluez le choix des mots de l'auteur : 'insistent', 'sans données', 'excuse'.", micro: `L'auteur utilise des termes péjoratifs ('excuse', 'sans données') pour discréditer les secteurs conservateurs, révélant une attitude critique.`,
        opts: ["Critique et désapprobatrice, les jugeant sans fondement.", "Objective et impartiale, exposant simplement les deux côtés.", "Conciliante, cherchant un juste milieu.", "Indifférente, se concentrant uniquement sur la science."],
        traps: [null, "Pas impartial ; utilise des mots chargés comme 'excuse'.", "Ne cherche pas de juste milieu, attaque l'argument.", "S'il était indifférent, il ne les aurait pas mentionnés."]
      },
      de: {
        topic: 'KRITISCHE REFLEXION', text: `TEXT: "Jüngste Erkenntnisse zeigen, dass Action-Videospiele die visumotorische Koordination verbessern. Einige konservative Sektoren bestehen jedoch ohne empirische Daten darauf, sie unter dem Vorwand zu verbieten, sie würden Gewalt fördern."\n\nWie ist die Haltung des Autors gegenüber den "konservativen Sektoren"?`, hint: "Bewerten Sie die Wortwahl des Autors: 'bestehen', 'Vorwand', 'ohne Daten'.", micro: `Der Autor verwendet abwertende Begriffe ('Vorwand', 'ohne Daten'), um die konservativen Sektoren zu diskreditieren, was eine kritische Haltung offenbart.`,
        opts: ["Kritisch und ablehnend, hält sie für unbegründet.", "Objektiv und unparteiisch, stellt nur beide Seiten dar.", "Versöhnlich, sucht einen Mittelweg.", "Gleichgültig, konzentriert sich nur auf die Wissenschaft."],
        traps: [null, "Nicht unparteiisch; verwendet wertende Wörter wie 'Vorwand'.", "Sucht keinen Mittelweg, greift das Argument an.", "Wäre er gleichgültig, hätte er sie nicht kritisiert."]
      }
    };
    return this.buildShuffledQuestion('REFLEXION_Y_EVALUACION_CRITICA', lang, texts);
  }

  static genLiteral(lang) {
    const texts = {
      es: {
        topic: 'COMPRENSIÓN LITERAL', text: `TEXTO: "La ciudad es, en sí misma, un tema literario. Es la materia prima de los sueños y las pesadillas del hombre moderno. Sin embargo, no basta con hacer una mera nominación de calles o bares para ser un escritor urbano."\n\nSegún el texto, ¿qué acción es insuficiente para que alguien sea considerado un verdadero "escritor urbano"?`, hint: "Busca en el texto qué es lo que 'no basta' (es insuficiente).", micro: `El texto dice explícitamente a nivel sintáctico: 'no basta con hacer una mera nominación de calles o bares'. Es una pregunta de extracción de información directa.`,
        opts: ["Hacer una simple enumeración o nominación de calles y bares.", "Escribir sobre las pesadillas del hombre moderno.", "Vivir físicamente en una ciudad metropolitana.", "Rechazar la crítica literaria moderna."],
        traps: [null, "El autor dice que la ciudad ES la materia prima de pesadillas, no que sea insuficiente.", "El texto no menciona el lugar de residencia física del autor.", "La crítica se menciona, pero no como requisito rechazado."]
      },
      en: {
        topic: 'LITERAL COMPREHENSION', text: `TEXT: "The city is, in itself, a literary theme. It is the raw material of modern man's dreams and nightmares. However, simply naming streets or bars is not enough to be an urban writer."\n\nAccording to the text, what action is insufficient to be considered a true "urban writer"?`, hint: "Look in the text for what is 'not enough' (insufficient).", micro: `The text explicitly states: 'simply naming streets or bars is not enough'. This is a direct information extraction question.`,
        opts: ["Simply listing or naming streets and bars.", "Writing about modern man's nightmares.", "Physically living in a metropolitan city.", "Rejecting modern literary criticism."],
        traps: [null, "The author says the city IS the raw material, not that it's insufficient.", "The text does not mention the author's physical residence.", "Criticism is mentioned, but not as a rejected requirement."]
      },
      fr: {
        topic: 'COMPRÉHENSION LITTÉRALE', text: `TEXTE : "La ville est, en soi, un thème littéraire. Elle est la matière première des rêves et cauchemars de l'homme. Cependant, il ne suffit pas de simplement nommer des rues ou des bars pour être un écrivain urbain."\n\nSelon le texte, quelle action est insuffisante pour être considéré comme un "écrivain urbain" ?`, hint: "Cherchez dans le texte ce qui 'ne suffit pas'.", micro: `Le texte dit explicitement : 'il ne suffit pas de simplement nommer des rues ou des bars'. Il s'agit d'une question d'extraction directe.`,
        opts: ["Simplement énumérer ou nommer des rues et des bars.", "Écrire sur les cauchemars de l'homme moderne.", "Vivre physiquement dans une métropole.", "Rejeter la critique littéraire moderne."],
        traps: [null, "L'auteur dit que la ville EST la matière première.", "Le texte ne mentionne pas la résidence physique de l'auteur.", "La critique n'est pas une exigence rejetée ici."]
      },
      de: {
        topic: 'LITERARISCHES VERSTÄNDNIS', text: `TEXT: "Die Stadt ist an sich ein literarisches Thema. Sie ist der Rohstoff für Träume und Albträume. Es reicht jedoch nicht aus, nur Straßen oder Bars zu benennen, um ein urbaner Schriftsteller zu sein."\n\nWelche Handlung reicht laut Text nicht aus, um als "urbaner Schriftsteller" zu gelten?`, hint: "Suchen Sie im Text danach, was 'nicht ausreicht'.", micro: `Der Text besagt ausdrücklich: 'Es reicht jedoch nicht aus, nur Straßen oder Bars zu benennen'. Dies ist eine direkte Informationsextraktion.`,
        opts: ["Einfach nur Straßen und Bars aufzählen oder benennen.", "Über die Albträume des modernen Menschen schreiben.", "Physisch in einer Metropole leben.", "Moderne Literaturkritik ablehnen."],
        traps: [null, "Der Autor sagt, die Stadt IST der Rohstoff.", "Der Text erwähnt nicht den Wohnort des Autors.", "Kritik wird nicht als abgelehnte Anforderung erwähnt."]
      }
    };
    return this.buildShuffledQuestion('COMPRENSION_LITERAL_SINTACTICA', lang, texts);
  }

  static genArgumentacion(lang) {
    const texts = {
      es: {
        topic: 'ARGUMENTACIÓN Y PREMISAS', text: `TEXTO: "Si reducimos los impuestos a las corporaciones, estas tendrán más capital. Si tienen más capital, generarán más empleo. Por lo tanto, para acabar con el desempleo, debemos reducir los impuestos."\n\n¿Cuál es el supuesto (premisa implícita) más débil que asume el autor del argumento?`, hint: "Un supuesto es algo que el autor da por hecho sin probarlo.", micro: `El argumento asume automáticamente que el 'nuevo capital' se invertirá en empleo, ignorando otras posibilidades (que los directivos lo ahorren, paguen deudas o aumenten sus propios salarios). Esa es la premisa implícita débil.`,
        opts: ["Asume que todo el capital ahorrado en impuestos se destinará exclusivamente a crear empleo.", "Asume que las corporaciones pagan demasiados impuestos actualmente.", "Asume que el desempleo es el principal problema del país.", "Asume que los ciudadanos no quieren pagar impuestos tampoco."],
        traps: [null, "El texto no habla sobre si los impuestos actuales son altos o bajos, solo de reducirlos.", "El autor propone una solución, pero no asume que sea el 'principal' problema.", "No se menciona en absoluto a los ciudadanos naturales."]
      },
      en: {
        topic: 'ARGUMENTATION AND PREMISES', text: `TEXT: "If we lower corporate taxes, corporations will have more capital. If they have more capital, they will create more jobs. Therefore, to end unemployment, we must lower taxes."\n\nWhat is the weakest underlying assumption (implicit premise) made by the author?`, hint: "An assumption is something taken for granted without proof.", micro: `The argument automatically assumes that 'new capital' will be invested in jobs, ignoring other possibilities (saving, paying debts, executive bonuses). That is the weak implicit premise.`,
        opts: ["It assumes all saved capital will be exclusively used to create jobs.", "It assumes corporations currently pay too many taxes.", "It assumes unemployment is the country's main problem.", "It assumes citizens don't want to pay taxes either."],
        traps: [null, "The text doesn't discuss if current taxes are high or low.", "The author proposes a solution, but doesn't assume it's the 'main' problem.", "Natural citizens are not mentioned at all."]
      },
      fr: {
        topic: 'ARGUMENTATION ET PRÉMISSES', text: `TEXTE : "Si nous réduisons les impôts sur les sociétés, elles auront plus de capital. Si elles ont plus de capital, elles créeront des emplois. Par conséquent, pour mettre fin au chômage, réduisons les impôts."\n\nQuelle est la supposition (prémisse implicite) la plus faible de l'auteur ?`, hint: "Une supposition est une idée acceptée comme vraie sans preuve.", micro: `L'argument suppose que le 'nouveau capital' sera investi dans l'emploi, ignorant d'autres possibilités (épargne, dividendes). C'est la prémisse faible.`,
        opts: ["Il suppose que tout le capital économisé sera utilisé pour créer des emplois.", "Il suppose que les sociétés paient actuellement trop d'impôts.", "Il suppose que le chômage est le principal problème.", "Il suppose que les citoyens ne veulent pas payer d'impôts non plus."],
        traps: [null, "Le texte ne dit pas si les impôts actuels sont élevés.", "Il propose une solution, mais ne dit pas que c'est le problème 'principal'.", "Les citoyens ne sont pas mentionnés."]
      },
      de: {
        topic: 'ARGUMENTATION UND PRÄMISSEN', text: `TEXT: "Wenn wir die Unternehmenssteuern senken, haben sie mehr Kapital. Wenn sie mehr Kapital haben, schaffen sie Arbeitsplätze. Um die Arbeitslosigkeit zu beenden, müssen wir die Steuern senken."\n\nWas ist die schwächste Annahme (implizite Prämisse) des Autors?`, hint: "Eine Annahme ist etwas, das ohne Beweis als selbstverständlich vorausgesetzt wird.", micro: `Das Argument geht davon aus, dass 'neues Kapital' in Arbeitsplätze investiert wird, und ignoriert andere Möglichkeiten (Sparen, Boni). Das ist die schwache Prämisse.`,
        opts: ["Es wird davon ausgegangen, dass das gesamte gesparte Kapital ausschließlich für neue Arbeitsplätze verwendet wird.", "Es wird angenommen, dass Unternehmen derzeit zu viele Steuern zahlen.", "Es wird angenommen, dass Arbeitslosigkeit das Hauptproblem des Landes ist.", "Es wird angenommen, dass die Bürger auch keine Steuern zahlen wollen."],
        traps: [null, "Der Text erörtert nicht, ob die aktuellen Steuern hoch oder niedrig sind.", "Der Autor schlägt eine Lösung vor, geht aber nicht davon aus, dass es das 'Hauptproblem' ist.", "Natürliche Bürger werden überhaupt nicht erwähnt."]
      }
    };
    return this.buildShuffledQuestion('ARGUMENTACION_Y_PREMISAS', lang, texts);
  }

  // Fallbacks para otros temas
  static genLiterary(lang) { return this.genGlobal(lang); }
  static genInformativo(lang) { return this.genLiteral(lang); }
  static genIntencion(lang) { return this.genCritical(lang); }
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
    const topics = ['COMPRENSION_LITERAL_SINTACTICA', 'SENTIDO_GLOBAL_DEL_TEXTO', 'REFLEXION_Y_EVALUACION_CRITICA', 'INTENCION_COMUNICATIVA', 'ARGUMENTACION_Y_PREMISAS'];
    const selectedTopic = forcedTopic || topics[Math.floor(Math.random() * topics.length)];
    const targetLang = LANG_MAP_DS[lang] || "SPANISH";

    const sysPrompt = `
      Eres un experto diseñador de exámenes ICFES de Colombia, enfocado 100% en LECTURA CRÍTICA.
      Genera una pregunta analítica COMPLETAMENTE NUEVA sobre la competencia: "${selectedTopic}".
      Language for the output must strictly be: ${targetLang}.
      Inventa un fragmento corto de texto (máximo 80 palabras) de tipo filosófico, literario o periodístico. Luego formula una pregunta sobre el texto.
      Provee 4 opciones de respuesta, solo 1 correcta. Las otras 3 deben ser distractores comunes del ICFES (por ejemplo, inferencias exageradas, conocimiento previo no mencionado en el texto, o detalles menores).
      
      REGLA ABSOLUTA: RESPONDE SOLO CON UN JSON VÁLIDO. NADA DE MARKDOWN ALREDEDOR. TODOS LOS TEXTOS DENTRO DEL JSON DEBEN ESTAR EN ${targetLang}. Usa comillas simples ('') dentro de los textos.
      {
        "id": "${selectedTopic}",
        "topic": "Nombre de la competencia lectora",
        "text": "El fragmento de lectura (usa \\n para separar) y luego la pregunta...",
        "options": ["Opción Correcta", "Opción Trampa 1", "Opción Trampa 2", "Opción Trampa 3"],
        "correctIdx": 0,
        "hint": "Pista analítica para el estudiante",
        "microclass": "Explicación paso a paso de por qué es la respuesta correcta",
        "trapExplanations": ["Explicación correcta", "Trampa B explicada", "Trampa C explicada", "Trampa D explicada"]
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
      Eres un Profesor de Lectura Crítica preparando a un estudiante para la prueba del examen ICFES.
      Genera una CLASE MAGISTRAL sobre la competencia: "${topic}".
      Language for the output MUST STRICTLY BE: ${targetLang}.
      Debe ser analítica, explicando cómo el ICFES evalúa esta competencia lectora. Máximo 400 palabras.

      REGLAS CRÍTICAS: RESPONDE SÓLO EN JSON VÁLIDO. ESCAPA SALTOS DE LÍNEA \\n. USA COMILLAS SIMPLES (''). TODOS LOS TEXTOS DEBEN ESTAR EN ${targetLang}.
      
      ESTRUCTURA EXACTA REQUERIDA:
      {
        "title": "TÍTULO DE LA COMPETENCIA",
        "theory": "Explicación teórica enfocada a la lectura y análisis de textos.",
        "trap": "El tipo de distractor o trampa semántica típica del ICFES.",
        "protocol": "1. Leer pregunta.\\n2. Identificar tipología textual.",
        "demoQuestion": {
           "text": "Minifragmento de lectura generado...",
           "options": ["A", "B", "C", "D"],
           "correctIdx": 0,
           "analysis": "Análisis de la interpretación correcta del texto."
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
   🌍 5. DICCIONARIOS UI Y CONSEJOS (LECTURA CRÍTICA)
============================================================ */
const DICT_UI = {
  es: {
      start: "INICIAR INMERSIÓN LECTORA", title: "LABORATORIO ICFES LECTURA CRÍTICA", 
      scan: "ESCÁNER SEMÁNTICO", aiBtn: "TUTORÍA IA",
      time: "CRONÓMETRO COGNITIVO", mastery: "Maestría Lectora", 
      btnCheck: "SINTETIZAR RESPUESTA", btnNext: "SIGUIENTE TEXTO ➔",
      btnRetrySame: "REINTENTAR ANÁLISIS ➔", 
      correctTitle: "¡ANÁLISIS COGNITIVO PERFECTO!", wrongTitle: "RUPTURA SEMÁNTICA",
      statsBtn: "TELEMETRÍA", theoryText: "MOTOR NEURONAL DE LECTURA ACTIVO. Conectado a DeepSeek. Se están generando textos continuos y discontinuos procedurales en tiempo real. Cada reto evalúa tu capacidad de inferencia.",
      timeout: "¡COLAPSO DE ATENCIÓN!", topic: "COMPETENCIA ACTIVA", 
      dashboard: "DASHBOARD COGNITIVO GLOBAL", avgTime: "Tiempo Medio de Lectura",
      btnRetry: "PURGAR CACHÉ MENTAL", aiSocraticBtn: "SOLICITAR CLASE MAGISTRAL IA",
      socraticModal: "LA IA HA DETECTADO FALLOS EN:", aiPraise: "¡SINTAXIS PERFECTA! NO HAY FALLAS DE COMPRENSIÓN.",
      aiSelectTopic: "Selecciona la competencia a repasar:", aiClose: "CERRAR SESIÓN IA",
      downloadReport: "DESCARGAR INFORME LECTOR",
      loadingData: "ESTABLECIENDO SINAPSIS CON DEEPSEEK...",
      warmupTitle: "⚡ LECTURA DE CALENTAMIENTO", warmupSub: "Mientras la IA sintetiza tu texto principal..."
  },
  en: {
      start: "START READING IMMERSION", title: "ICFES CRITICAL READING LAB", scan: "SEMANTIC SCANNER", aiBtn: "AI TUTOR", time: "COGNITIVE TIMER", mastery: "Reading Mastery", btnCheck: "SYNTHESIZE RESPONSE", btnNext: "NEXT TEXT ➔", btnRetrySame: "RETRY ANALYSIS ➔", correctTitle: "PERFECT COGNITIVE ANALYSIS!", wrongTitle: "SEMANTIC RUPTURE", statsBtn: "TELEMETRY", theoryText: "NEURAL READING ENGINE ACTIVE. Hooked to DeepSeek. Generating procedural texts and inference challenges in real-time.", timeout: "ATTENTION COLLAPSE!", topic: "ACTIVE COMPETENCE", dashboard: "GLOBAL COGNITIVE DASHBOARD", avgTime: "Avg Reading Time", btnRetry: "PURGE MENTAL CACHE", aiSocraticBtn: "REQUEST AI MASTERCLASS", socraticModal: "AI HAS DETECTED FAILURES IN:", aiPraise: "PERFECT SYNTAX! NO COMPREHENSION FLAWS.", aiSelectTopic: "Select the competence to review:", aiClose: "CLOSE AI SESSION", downloadReport: "DOWNLOAD READING REPORT", loadingData: "ESTABLISHING DEEPSEEK SYNAPSES...", warmupTitle: "⚡ WARM-UP READING", warmupSub: "While AI synthesizes your main text..."
  },
  fr: {
      start: "DÉMARRER L'IMMERSION DE LECTURE", title: "LABO LECTURE CRITIQUE ICFES", scan: "SCANNER SÉMANTIQUE", aiBtn: "TUTEUR IA", time: "CHRONOMÈTRE COGNITIF", mastery: "Maîtrise de Lecture", btnCheck: "SYNTHÉTISER LA RÉPONSE", btnNext: "TEXTE SUIVANT ➔", btnRetrySame: "RÉESSAYER L'ANALYSE ➔", correctTitle: "ANALYSE COGNITIVE PARFAITE!", wrongTitle: "RUPTURE SÉMANTIQUE", statsBtn: "TÉLÉMÉTRIE", theoryText: "MOTEUR NEURONAL DE LECTURE ACTIF. Connecté à DeepSeek. Génération de textes procéduraux.", timeout: "EFFONDREMENT DE L'ATTENTION!", topic: "COMPÉTENCE ACTIVE", dashboard: "TABLEAU DE BORD COGNITIF", avgTime: "Temps Moyen de Lecture", btnRetry: "PURGER LE CACHE MENTAL", aiSocraticBtn: "DEMANDER MASTERCLASS IA", socraticModal: "FAILLES DÉTECTÉES :", aiPraise: "SYNTAXE PARFAITE !", aiSelectTopic: "Sélectionnez la compétence :", aiClose: "FERMER LA SESSION IA", downloadReport: "TÉLÉCHARGER LE RAPPORT DE LECTURE", loadingData: "ÉTABLISSEMENT DES SYNAPSES...", warmupTitle: "⚡ LECTURE D'ÉCHAUFFEMENT", warmupSub: "Pendant que l'IA synthétise votre texte..."
  },
  de: {
      start: "LESEIMMERSION STARTEN", title: "ICFES KRITISCHES LESEN LABOR", scan: "SEMANTIK-SCANNER", aiBtn: "KI-TUTOR", time: "KOGNITIVER TIMER", mastery: "Lesebeherrschung", btnCheck: "ANTWORT SYNTHETISIEREN", btnNext: "NÄCHSTER TEXT ➔", btnRetrySame: "ANALYSE WIEDERHOLEN ➔", correctTitle: "PERFEKTE KOGNITIVE ANALYSE!", wrongTitle: "SEMANTISCHER BRUCH", statsBtn: "TELEMETRIE", theoryText: "NEURONALE LESE-KI AKTIV. Verbunden mit DeepSeek. Erzeugt prozedurale Texte und Inferenzherausforderungen.", timeout: "AUFMERKSAMKEITSKOLLAPS!", topic: "AKTIVE KOMPETENZ", dashboard: "GLOBALE KOGNITIVE TELEMETRIE", avgTime: "Durchschnittliche Lesezeit", btnRetry: "MENTALEN CACHE LÖSCHEN", aiSocraticBtn: "KI MASTERCLASS ANFORDERN", socraticModal: "FEHLER ERKANNT IN:", aiPraise: "PERFEKTE SYNTAX!", aiSelectTopic: "Wählen Sie die Kompetenz:", aiClose: "KI-SITZUNG SCHLIESSEN", downloadReport: "LESEBERICHT HERUNTERLADEN", loadingData: "AUFBAU DER SYNAPSEN...", warmupTitle: "⚡ AUFWÄRM-LEKTÜRE", warmupSub: "Während die KI deinen Haupttext synthetisiert..."
  }
};

const DICT_REPORT = {
  es: { docTitle: "DOSSIER TÁCTICO LECTURA CRÍTICA", docSub: "SIMULACIÓN ICFES - NÚCLEO COGNITIVO", dateLabel: "Fecha de Extracción", kpiTitle: "MÉTRICAS GLOBALES DE RENDIMIENTO", kpiAcc: "Precisión Inferencial", kpiTime: "Tiempo Medio", kpiTotal: "Textos Analizados", aiTitle: "VEREDICTO DEL SISTEMA IA", aiVuln: "⚠️ VULNERABILIDADES LECTORAS DETECTADAS", aiVulnDesc: "El operador muestra deficiencias en las siguientes competencias analíticas:", aiAction: "PLAN DE ACCIÓN DE IA", aiActionDesc: "Es imperativo solicitar la 'Masterclass IA' para re-entrenar la comprensión semántica.", aiOpt: "✅ RENDIMIENTO COGNITIVO ÓPTIMO", aiOptDesc: "El operador está adaptado para interpretar la complejidad del ICFES.", aiNoData: "Datos de lectura insuficientes.", topicTitle: "DESGLOSE POR COMPETENCIA", topicNoData: "Faltan sinapsis de lectura.", topicHit: "Aciertos", topicMiss: "Fallos", footer: "LEARNING LABS COGNITIVE-ENGINE V27.0", footerSub: "Leer críticamente es la única ventaja inquebrantable." },
  en: { docTitle: "CRITICAL READING DOSSIER", docSub: "ICFES SIMULATION - COGNITIVE CORE", dateLabel: "Date", kpiTitle: "GLOBAL METRICS", kpiAcc: "Inferential Accuracy", kpiTime: "Avg Time", kpiTotal: "Texts Analyzed", aiTitle: "AI VERDICT", aiVuln: "⚠️ READING VULNERABILITIES DETECTED", aiVulnDesc: "Deficiencies in analytical competencies:", aiAction: "ACTION PLAN", aiActionDesc: "Use AI Masterclass to retrain semantic comprehension.", aiOpt: "✅ OPTIMAL COGNITIVE PERFORMANCE", aiOptDesc: "Operator is adapted for ICFES complexity.", aiNoData: "Insufficient reading data.", topicTitle: "COMPETENCE BREAKDOWN", topicNoData: "Missing reading synapses.", topicHit: "Hits", topicMiss: "Misses", footer: "LEARNING LABS COGNITIVE-ENGINE", footerSub: "Critical reading is the ultimate advantage." },
  fr: { docTitle: "DOSSIER TACTIQUE LECTURE CRITIQUE", docSub: "SIMULATION COGNITIVE ICFES", dateLabel: "Date", kpiTitle: "MÉTRIQUES GLOBALES", kpiAcc: "Précision Inférentielle", kpiTime: "Temps Moyen", kpiTotal: "Textes Analysés", aiTitle: "VERDICT IA", aiVuln: "⚠️ VULNÉRABILITÉS DE LECTURE", aiVulnDesc: "Déficiences dans :", aiAction: "PLAN D'ACTION", aiActionDesc: "Utiliser Masterclass IA.", aiOpt: "✅ PERFORMANCE OPTIMALE", aiOptDesc: "Opérateur adapté à la complexité ICFES.", aiNoData: "Données insuffisantes.", topicTitle: "RÉPARTITION PAR COMPÉTENCE", topicNoData: "Pas de synapses de lecture.", topicHit: "Succès", topicMiss: "Échecs", footer: "LEARNING LABS COGNITIVE-ENGINE", footerSub: "La lecture critique est l'avantage absolu." },
  de: { docTitle: "TAKTISCHES LESE-DOSSIER", docSub: "KOGNITIVE QUANTENSIMULATION", dateLabel: "Datum", kpiTitle: "GLOBALE KENNZAHLEN", kpiAcc: "Inferenzgenauigkeit", kpiTime: "Durchschnittszeit", kpiTotal: "Texte analysiert", aiTitle: "KI-URTEIL", aiVuln: "⚠️ LESESCHWACHSTELLEN", aiVulnDesc: "Mängel in analytischen Kompetenzen:", aiAction: "AKTIONSPLAN", aiActionDesc: "KI Masterclass nutzen.", aiOpt: "✅ OPTIMALE LEISTUNG", aiOptDesc: "Bediener angepasst.", aiNoData: "Unzureichende Daten.", topicTitle: "KOMPETENZAUFSCHLÜSSELUNG", topicNoData: "Keine Lesesynapsen.", topicHit: "Treffer", topicMiss: "Fehler", footer: "LEARNING LABS COGNITIVE-ENGINE", footerSub: "Kritisches Lesen ist der ultimative Vorteil." }
};

const TIPS_DB = {
  es: [
    "TRUCO ICFES: Siempre lee la pregunta ANTES que el texto. Así tu cerebro escaneará la información buscando exactamente lo que necesitas.",
    "OJO AL CONTEXTO: En Lectura Crítica, la respuesta correcta casi siempre tiene respaldo literal o inferencial DENTRO del texto, no en tus conocimientos previos.",
    "PILAS CON LOS ABSOLUTOS: Desconfía de opciones que usen palabras como 'siempre', 'nunca', 'todos' o 'ninguno', a menos que el autor sea así de radical.",
    "NIVEL CRÍTICO: Si te preguntan por la intención del autor, fíjate en los adjetivos que usa. ¿Son despectivos? ¿Son elogiosos? Ahí está su postura.",
    "ESTRATEGIA: En textos filosóficos largos, concéntrate en identificar la 'tesis' (la idea principal a defender) y los 'argumentos' (las razones que la apoyan)."
  ],
  en: [
    "ICFES TRICK: Always read the question BEFORE the text. Your brain will scan specifically for what you need.",
    "CONTEXT WARNING: The correct answer usually has literal or inferential backing INSIDE the text, not from your outside knowledge.",
    "BEWARE ABSOLUTES: Distrust options using 'always', 'never', 'all', or 'none', unless the author is explicitly that radical.",
    "CRITICAL LEVEL: If asked about the author's intention, look at their adjectives. Are they derogatory? Praising? That reveals their stance.",
    "STRATEGY: In philosophical texts, focus on finding the 'thesis' (main idea) and the 'arguments' (supporting reasons)."
  ],
  fr: [
    "ASTUCE ICFES : Lisez toujours la question AVANT le texte pour scanner efficacement.",
    "ATTENTION AU CONTEXTE : La bonne réponse se trouve DANS le texte, pas dans vos connaissances générales.",
    "MÉFIEZ-VOUS DES ABSOLUS : Évitez les mots comme 'toujours', 'jamais', 'tous'.",
    "NIVEAU CRITIQUE : L'intention de l'auteur se cache souvent dans les adjectifs qu'il utilise.",
    "STRATÉGIE : Dans les textes philosophiques, identifiez la thèse et les arguments."
  ],
  de: [
    "ICFES-TRICK: Lesen Sie IMMER die Frage VOR dem Text, um das Gehirn zu fokussieren.",
    "KONTEXT VORSICHT: Die richtige Antwort basiert auf dem Text, nicht auf Ihrem Vorwissen.",
    "VORSICHT VOR ABSOLUTEN: Misstrauen Sie Wörtern wie 'immer', 'nie', 'alle'.",
    "KRITISCHES NIVEAU: Die Absicht des Autors zeigt sich oft in seinen Adjektiven.",
    "STRATEGIE: Suchen Sie in philosophischen Texten nach der These und den Argumenten."
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
        <div style={{ position:'absolute', inset:0, zIndex:3000, background:'#000a14', display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center', padding:'clamp(20px, 5vw, 40px)', textAlign: 'center', boxSizing: 'border-box' }}>
            <div className="loader-ring" style={{ width: 'clamp(50px, 8vw, 80px)', height: 'clamp(50px, 8vw, 80px)', border: '5px solid #111', borderTop: '5px solid #00f2ff', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '30px' }}></div>
            <h1 className="hud-pulse" style={{color:'#00f2ff', fontSize:'clamp(16px, 4vw, 40px)', textShadow:'0 0 30px #00f2ff', margin: '0 0 30px 0', letterSpacing: '2px', lineHeight: '1.4'}}>{loadingText}</h1>
            
            <div style={{ background: 'rgba(255, 0, 255, 0.1)', borderLeft: '4px solid #ff00ff', padding: 'clamp(15px, 4vw, 30px)', maxWidth: '800px', width: '100%', borderRadius: '0 10px 10px 0', position: 'relative', overflow: 'hidden', boxSizing: 'border-box' }}>
                <div style={{ color: '#ff00ff', fontSize: 'clamp(12px, 3vw, 16px)', fontWeight: 'bold', marginBottom: '15px', textTransform: 'uppercase' }}>💡 LECTURA CRÍTICA TIP</div>
                <div style={{ color: '#fff', fontSize: 'clamp(14px, 3.5vw, 24px)', minHeight: '80px', transition: 'opacity 0.5s ease', lineHeight: '1.5' }}>
                    {tips[tipIdx]}
                </div>
                <div style={{position: 'absolute', bottom: 0, left: 0, height: '4px', background: '#ff00ff', width: '100%', animation: 'shrink 8s linear infinite'}}></div>
            </div>
            <style>{`
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                @keyframes shrink { 0% { width: 100%; } 100% { width: 0%; } }
            `}</style>
        </div>
    );
};

/* ============================================================
   🎥 7. NÚCLEO 3D AVANZADO (RED NEURONAL LECTORA)
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
  
  // 🔵 Cambio de color maestro: CIAN LECTURA COGNITIVA
  let particleColor = "#00f2ff"; 
  if (isLoading) particleColor = "#ff00ff";
  else if (isDanger) particleColor = "#ffea00"; 
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
            <meshBasicMaterial color="#ff00ff" transparent opacity={0.2} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} depthWrite={false} />
         </mesh>
      )}
      <group position={[0, 3, 0]}>
         <mesh ref={torusRef}>
            {/* Nudo Toroide modificado para simular sinapsis complejas */}
            <torusKnotGeometry args={[3.5, 0.5, 200, 30]} />
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
        parsed = parsed.replace(/### (.*)/g, '<h3 style="color:#00f2ff; margin-top:clamp(20px, 4vw, 30px); border-bottom:1px solid #00f2ff; padding-bottom:5px; font-size: clamp(18px, 4vw, 26px);">$1</h3>');
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

        const t1 = setTimeout(() => { if(isMounted) setLoadText("> ANALIZANDO VULNERABILIDADES DEL ESTUDIANTE EN: " + topic.replace(/_/g, ' ')); }, 3000);
        const t2 = setTimeout(() => { if(isMounted) setLoadText("> SINTETIZANDO NÚCLEO COGNITIVO AVANZADO..."); }, 6000);
        const t3 = setTimeout(() => { if(isMounted) setLoadText("> GENERANDO TEXTO DE LECTURA CRÍTICA (ESPERE)..."); }, 10000);
        const t4 = setTimeout(() => { if(isMounted) setLoadText("> COMPILANDO DATOS SEMÁNTICOS (ÚLTIMA FASE)..."); }, 15000);

        try {
            const content = await DeepSeekEngine.generateMasterclass(topic, lang);
            if (isMounted) {
                setClassData(content);
                setIsGenerating(false);
                sfx.success();
            }
        } catch (err) {
            console.warn("DeepSeek Fallback Lectura en Masterclass.", err);
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
                    <p className="hud-pulse" style={{marginBottom: '20px', color: '#ff00ff', fontSize: 'clamp(18px, 4vw, 30px)', fontWeight: 'bold'}}>{loadText}</p>
                    <p style={{color: '#aaa', opacity: 0.8}}>_ Operación: Socratic Reading Overdrive</p>
                    <p style={{color: '#aaa', opacity: 0.8}}>_ Destino: Neural Net DeepSeek-Chat</p>
                    <p style={{color: '#aaa', opacity: 0.8}}>_ Status: Aguardando carga semántica (Payload)...</p>
                </div>
            </div>
        );
    }

    if (!classData) return null;

    return (
        <div style={{ padding: 'clamp(10px, 3vw, 30px)', width: '100%', boxSizing: 'border-box' }}>
           <h2 style={{color:'#ff00ff', fontSize:'clamp(20px, 5vw, 45px)', textAlign:'center', borderBottom:'3px solid #ff00ff', paddingBottom:'20px', marginTop: 0, textTransform: 'uppercase'}}>🎓 {classData.title || topic.replace(/_/g, ' ')}</h2>
           
           <div style={{ display: 'grid', gap: 'clamp(20px, 4vw, 30px)', marginTop: '40px' }}>
              <div style={{ borderLeft: '6px solid #00f2ff', padding: 'clamp(15px, 3vw, 30px)', background: 'rgba(0,242,255,0.05)', borderRadius: '0 15px 15px 0' }}>
                 <h3 style={{color: '#00f2ff', marginTop: 0, fontSize: 'clamp(18px, 4vw, 26px)', display: 'flex', alignItems: 'center', gap:'10px'}}>📚 NÚCLEO TEÓRICO Y ANÁLISIS</h3>
                 <MarkdownParser text={classData.theory} />
              </div>
              
              <div style={{ borderLeft: '6px solid #f00', padding: 'clamp(15px, 3vw, 30px)', background: 'rgba(255,0,0,0.05)', borderRadius: '0 15px 15px 0' }}>
                 <h3 style={{color: '#f00', marginTop: 0, fontSize: 'clamp(18px, 4vw, 26px)', display: 'flex', alignItems: 'center', gap:'10px'}}>⚠️ TRAMPA COGNITIVA ICFES</h3>
                 <MarkdownParser text={classData.trap} />
              </div>

              <div style={{ borderLeft: '6px solid #ffea00', padding: 'clamp(15px, 3vw, 30px)', background: 'rgba(255,234,0,0.05)', borderRadius: '0 15px 15px 0' }}>
                 <h3 style={{color: '#ffea00', marginTop: 0, fontSize: 'clamp(18px, 4vw, 26px)', display: 'flex', alignItems: 'center', gap:'10px'}}>⚙️ PROTOCOLO SEMÁNTICO INFALIBLE</h3>
                 <MarkdownParser text={classData.protocol} />
              </div>
           </div>

           {/* EJEMPLO GENERADO VIVO POR LA IA O FALLBACK */}
           {classData.demoQuestion && (
               <div style={{ marginTop: 'clamp(30px, 6vw, 50px)', border: '3px solid #0f0', borderRadius: '15px', padding: 'clamp(15px, 4vw, 40px)', background: 'rgba(0,20,5,0.95)', boxShadow: '0 0 40px rgba(0,255,0,0.15)', boxSizing: 'border-box' }}>
                   <h3 style={{color: '#0f0', textAlign: 'center', marginTop: 0, fontSize: 'clamp(20px, 4.5vw, 28px)'}}>📖 SIMULACIÓN DE LECTURA</h3>
                   <p style={{color: '#aaa', fontSize: 'clamp(12px, 3vw, 16px)', textAlign: 'center', fontStyle: 'italic', marginBottom:'30px'}}>Este texto ha sido generado en tiempo real. Jamás se repetirá.</p>
                   
                   <div style={{ color: '#fff', fontSize: 'clamp(16px, 3.5vw, 24px)', lineHeight: '1.6', background: 'rgba(255,255,255,0.05)', padding: 'clamp(15px, 3vw, 30px)', borderRadius: '10px', whiteSpace: 'pre-wrap' }}>
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
   🎮 9. APLICACIÓN PRINCIPAL LECTURA (PHANTOM QUEUE Y CICLO)
============================================================ */

const getInitialStats = () => {
  if (typeof window !== 'undefined') {
    // 🟢 Cache Key ÚNICO para LECTURA CRÍTICA
    const saved = window.localStorage.getItem('icfes_reading_telemetry_v1'); 
    if (saved) return JSON.parse(saved);
  }
  return {
      totalQ: 0, correctQ: 0, totalTime: 0,
      topics: {
          'COMPRENSION_LITERAL_SINTACTICA': { c: 0, w: 0 },
          'SENTIDO_GLOBAL_DEL_TEXTO': { c: 0, w: 0 },
          'REFLEXION_Y_EVALUACION_CRITICA': { c: 0, w: 0 },
          'TEXTOS_CONTINUOS_LITERARIOS': { c: 0, w: 0 },
          'TEXTOS_CONTINUOS_INFORMATIVOS': { c: 0, w: 0 },
          'TEXTOS_DISCONTINUOS_GRAFICOS': { c: 0, w: 0 },
          'INTENCION_COMUNICATIVA': { c: 0, w: 0 },
          'RELACIONES_SEMANTICAS': { c: 0, w: 0 },
          'ARGUMENTACION_Y_PREMISAS': { c: 0, w: 0 },
          'VISION_DEL_MUNDO_AUTOR': { c: 0, w: 0 }
      },
      needsReview: [] 
  };
};

function GameApp() {
  const { language } = useGameStore() || { language: "es" };
  const safeLang = DICT_UI[language] ? language : 'es';
  const UI = DICT_UI[safeLang];
  const REPORT_UI = DICT_REPORT[safeLang] || DICT_REPORT['es'];

  // En lectura crítica el tiempo es mayor por el texto
  const MAX_TIME = 240; 
  const WARMUP_TIME = 90; 

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
      window.localStorage.setItem('icfes_reading_telemetry_v1', JSON.stringify(stats));
    }
  }, [stats]);

  const currentQ = useMemo(() => {
      if (!currentQData) return null;
      return currentQData; // El generador ahora manda todo pre-ensamblado en el idioma
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
          console.warn("AI Fallback Lectura: Generando texto algorítmico de respaldo.");
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
                  <title>Learning Labs - Reading Report</title>
                  <style>
                      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
                      body { font-family: 'Inter', sans-serif; background-color: #ffffff; color: #0f172a; margin: 0; padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                      .container { max-width: 800px; margin: 0 auto; padding: 40px; }
                      .header { display: flex; align-items: center; border-bottom: 4px solid #00f2ff; padding-bottom: 30px; margin-bottom: 40px; }
                      .logo { width: 140px; height: auto; margin-right: 30px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
                      .title h1 { margin: 0 0 5px 0; color: #0f172a; font-size: 32px; font-weight: 900; letter-spacing: -0.5px; text-transform: uppercase; }
                      .title p { margin: 0; color: #64748b; font-size: 15px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; }
                      .timestamp { margin-top: 10px; display: inline-block; background: #f1f5f9; padding: 5px 10px; border-radius: 4px; font-size: 12px; color: #475569; font-weight: bold; }
                      .section-title { font-size: 20px; font-weight: 900; color: #0f172a; text-transform: uppercase; margin-bottom: 20px; display: flex; align-items: center; }
                      .section-title::before { content: ''; display: inline-block; width: 12px; height: 12px; background-color: #00f2ff; margin-right: 10px; border-radius: 2px; }
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
        .hud-btn { padding: clamp(12px, 3vw, 20px) clamp(15px, 4vw, 40px); background: #00f2ff; color: #000; font-weight: 900; font-size: clamp(14px, 3.5vw, 24px); cursor: pointer; border-radius: 8px; border: none; font-family: 'Orbitron', monospace; transition: 0.2s; box-shadow: 0 0 20px rgba(0,242,255,0.4); text-transform: uppercase; user-select: none; }
        .hud-btn:hover { transform: scale(1.02); }
        .hud-btn:disabled { background: #555; color:#888; box-shadow: none; cursor:not-allowed; transform: none; }
        .opt-btn { display: block; width: 100%; margin: 10px 0; padding: clamp(12px, 3vw, 20px); background: rgba(0,20,40,0.8); border: 2px solid #555; color: #fff; font-size: clamp(14px, 3.5vw, 22px); border-radius: 10px; cursor: pointer; text-align: left; transition: 0.2s; font-family: 'Orbitron'; line-height: 1.4; user-select: none; min-height: 64px; }
        .opt-btn:hover { background: rgba(255,255,255,0.1); border-color: #aaa; }
        .opt-btn.selected { border-color: #ffea00; background: rgba(255,234,0,0.2); box-shadow: 0 0 20px rgba(255,234,0,0.4); color: #ffea00; }
        .glass-panel { background: rgba(0,10,20,0.85); border: 2px solid #00f2ff; backdrop-filter: blur(20px); border-radius: 15px; box-shadow: 0 0 40px rgba(0,242,255,0.15); padding: clamp(15px, 4vw, 40px); box-sizing: border-box; }
        .hud-pulse { animation: pulse 1s infinite; }
        @keyframes pulse { 0% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.02); opacity: 0.8; } 100% { transform: scale(1); opacity: 1; } }
        
        .timer-danger { background: #ffaa00 !important; }
        .timer-critical { background: #f00 !important; animation: shake 0.5s infinite; }
        @keyframes shake { 0% { transform: translateX(0); } 25% { transform: translateX(-3px); } 50% { transform: translateX(3px); } 75% { transform: translateX(-3px); } 100% { transform: translateX(0); } }

        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: rgba(0,0,0,0.5); border-radius: 10px; }
        ::-webkit-scrollbar-thumb { background: rgba(0,242,255,0.4); border-radius: 10px; }
      `}</style>
      
      <main style={{ position:'absolute', inset:0, overflow:'hidden', background:'#000', fontFamily:'Orbitron, sans-serif', padding: 'env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)', boxSizing: 'border-box' }}>
        
        {/* PANTALLA DE CARGA IA */}
        {phase === "LOADING" && (
            <QuantumIntermission lang={safeLang} loadingText={UI.loadingData} />
        )}

        {/* PANTALLA INICIAL Y TEORÍA */}
        {(phase === "BOOT" || phase === "THEORY") && (
          <section style={{ position:'absolute', inset:0, zIndex:3000, background:'#000510', display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center', padding:'clamp(15px, 4vw, 20px)', boxSizing: 'border-box' }}>
            <h1 style={{color:'#00f2ff', fontSize:'clamp(30px, 8vw, 80px)', textShadow:'0 0 40px #00f2ff', textAlign:'center', margin: '0 0 20px 0', lineHeight: '1.1'}}>{UI.title}</h1>
            {phase === "THEORY" && <p style={{color:'#fff', fontSize:'clamp(14px, 3.5vw, 24px)', maxWidth:'800px', textAlign:'center', marginBottom:'clamp(30px, 6vw, 40px)', lineHeight:'1.6', borderLeft: '4px solid #ffea00', paddingLeft: 'clamp(10px, 3vw, 20px)'}}>{UI.theoryText}</p>}
            
            <div style={{display:'flex', gap:'clamp(10px, 3vw, 20px)', flexWrap:'wrap', justifyContent:'center', width: '100%', maxWidth: '800px'}}>
                <button className="hud-btn" style={{flex: '1 1 250px'}} onClick={() => { if(phase === "BOOT") setPhase("THEORY"); else { generateNew(); } }}>{phase === "BOOT" ? UI.start : "EMPEZAR EVALUACIÓN"}</button>
                <button className="hud-btn" style={{flex: '1 1 250px', background:'rgba(30,30,30,0.8)', color:'#00f2ff', border:'2px solid #00f2ff'}} onClick={openTelemetry}>📊 {UI.statsBtn}</button>
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
                 <button className="hud-btn" style={{background:'rgba(30,30,30,0.8)', color:'#00f2ff', border:'1px solid #00f2ff', padding:'8px 15px', fontSize:'clamp(10px, 2.5vw, 14px)', boxShadow:'none'}} onClick={openTelemetry}>📊 {UI.statsBtn}</button>
              )}
            </nav>

            {/* SEÑALADOR DE DEEPSEEK NEURAL MATRIX */}
            {phase === "GAME" && (
               <div style={{position: 'absolute', bottom: 'max(15px, env(safe-area-inset-bottom))', right: 'clamp(10px, 3vw, 15px)', color: currentQData?.isAi ? '#ff00ff' : '#00f2ff', fontSize: 'clamp(8px, 2vw, 12px)', fontWeight: 'bold', zIndex: 100, textShadow: currentQData?.isAi ? '0 0 10px #ff00ff' : 'none', letterSpacing: '1px', textAlign: 'right'}}>
                  {currentQData?.isAi ? "🧠 DEEPSEEK NEURAL MATRIX ACTIVE" : "⚙️ ALGORITHMIC FALLBACK ACTIVE"}
               </div>
            )}

            {/* BARRA DE PRESIÓN DE TIEMPO */}
            {(phase === "GAME" || phase === "WARMUP") && (
                <div style={{position:'absolute', top:'clamp(60px, calc(env(safe-area-inset-top) + 60px), 100px)', left:'50%', transform:'translateX(-50%)', width:'95%', maxWidth:'800px', zIndex:100, display:'flex', flexDirection:'column', alignItems:'center'}}>
                    {phase === "WARMUP" && <div style={{color: '#ffaa00', fontSize: 'clamp(10px, 2.5vw, 14px)', marginBottom: '5px', textAlign: 'center'}}>{UI.warmupSub}</div>}
                    <div style={{color: timeLeft > 30 ? '#00f2ff' : (timeLeft > 15 ? '#ffaa00' : '#f00'), fontSize:'clamp(18px, 5vw, 28px)', fontWeight:'bold', marginBottom:'10px', textShadow: timeLeft <= 15 ? '0 0 10px #f00' : 'none'}} className={timeLeft <= 15 ? 'hud-pulse' : ''}>
                        {UI.time}: {Math.floor(timeLeft / 60)}:{('0' + (timeLeft % 60)).slice(-2)}
                    </div>
                    <div style={{width: '100%', height:'clamp(10px, 2.5vw, 15px)', background:'rgba(255,255,255,0.1)', borderRadius:'10px', overflow:'hidden', border: '1px solid #444'}}>
                        <div className={timeLeft <= 15 ? 'timer-critical' : (timeLeft <= 36 ? 'timer-danger' : '')} style={{width: `${(timeLeft/(phase === "WARMUP" ? WARMUP_TIME : MAX_TIME))*100}%`, height:'100%', background: phase === "WARMUP" ? '#ffaa00' : '#00f2ff', borderRadius:'10px', transition:'width 1s linear, background 0.5s'}} />
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
                <article className="glass-panel" style={{maxHeight:'clamp(50vh, 65vh, 75vh)', overflowY:'auto', borderColor: phase === "WARMUP" ? '#ffaa00' : '#00f2ff'}}>
                  <h2 style={{color:'#fff', fontSize:'clamp(16px, 4vw, 26px)', lineHeight:'1.6', fontWeight:'normal', margin:0, whiteSpace: 'pre-wrap'}}>{currentQ.text}</h2>
                  
                  {scannerActive && (
                      <div className="hud-pulse" style={{background:'rgba(0,242,255,0.1)', borderLeft:'4px solid #00f2ff', padding:'clamp(10px, 3vw, 15px)', margin:'15px 0', color:'#00f2ff', fontSize:'clamp(14px, 3.5vw, 20px)', fontWeight:'bold'}}>
                          🤖 {UI.aiBtn}: {currentQ.hint}
                      </div>
                  )}

                  <div style={{marginTop:'clamp(15px, 4vw, 30px)'}}>
                      {currentQ.options.map((opt, i) => (
                          <button key={i} className={`opt-btn ${selectedOpt === i ? 'selected' : ''}`} onClick={() => {sfx.click(); setSelectedOpt(i);}}>
                              <span style={{fontWeight:'bold', marginRight:'clamp(5px, 2vw, 15px)', color: selectedOpt === i ? '#ffea00' : '#00f2ff'}}>{String.fromCharCode(65 + i)}.</span> {opt}
                          </button>
                      ))}
                  </div>

                  <div style={{display:'flex', justifyContent:'center', marginTop:'clamp(20px, 5vw, 40px)'}}>
                      <button className="hud-btn" style={{width:'100%', height:'clamp(50px, 8vw, 80px)', fontSize:'clamp(14px, 4vw, 28px)', background: phase === "WARMUP" ? '#ffaa00' : '#00f2ff'}} disabled={selectedOpt === null} onClick={submitAnswer}>{UI.btnCheck}</button>
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

                      <div style={{color:'#fff', fontSize:'clamp(14px, 3.5vw, 24px)', lineHeight:'1.6', background:'rgba(0,0,0,0.6)', padding:'clamp(15px, 4vw, 30px)', borderRadius:'10px', whiteSpace:'pre-wrap', borderLeft:'4px solid #00f2ff', marginTop:'20px'}}>
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
              <section style={{ position:'absolute', inset:0, zIndex:2000, background:'rgba(0,10,30,0.98)', display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center', padding:'clamp(10px, 3vw, 20px)', boxSizing: 'border-box' }}>
                  <article className="glass-panel" style={{maxWidth:'1000px', width:'100%', maxHeight:'95dvh', overflowY:'auto'}}>
                      <h2 style={{color:'#00f2ff', textAlign:'center', fontSize:'clamp(20px, 5vw, 40px)', borderBottom:'2px solid #00f2ff', paddingBottom:'15px', margin:0}}>{UI.dashboard}</h2>
                      
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
                                      <div style={{color: isFailed ? '#f00' : '#00f2ff', fontWeight:'bold', marginBottom:'10px', fontSize:'clamp(11px, 2.5vw, 16px)'}}>
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
                          <button className="hud-btn" style={{flex:'1 1 200px', background:'transparent', border:'2px solid #00f2ff', color:'#00f2ff', fontSize: 'clamp(12px, 3vw, 18px)'}} onClick={downloadReport}>📄 {UI.downloadReport}</button>
                          <button className="hud-btn" style={{flex:'1 1 200px', fontSize: 'clamp(12px, 3vw, 18px)'}} onClick={closeTelemetry}>VOLVER A LA MISIÓN</button>
                          <button className="hud-btn" style={{flex:'1 1 200px', background:'transparent', border:'2px solid #f00', color:'#f00', fontSize: 'clamp(12px, 3vw, 18px)'}} onClick={() => { window.localStorage.removeItem('icfes_reading_telemetry_v1'); window.location.reload(); }}>{UI.btnRetry}</button>
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