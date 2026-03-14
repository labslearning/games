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
        <div style={{ width: '100vw', height: '100vh', background: '#050000', color: '#ffaa00', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', fontFamily: 'monospace', padding: 'clamp(20px, 5vw, 40px)', textAlign:'center', zIndex: 9999, boxSizing: 'border-box' }}>
          <h1 style={{ fontSize: 'clamp(24px, 6vw, 60px)', textShadow: '0 0 30px #f00', color: '#ff0033' }}>⚠️ FATAL SOCIETAL ERROR</h1>
          <p style={{ background: 'rgba(255,0,0,0.1)', padding: 'clamp(15px, 4vw, 20px)', borderRadius: '10px', border:'1px solid #f00', maxWidth:'800px', width: '100%', fontSize: 'clamp(14px, 3.5vw, 18px)', color: '#fff', wordWrap: 'break-word' }}>{this.state.errorMsg}</p>
          <button onClick={() => { window.localStorage.removeItem('icfes_sociales_telemetry_v1'); window.localStorage.removeItem('icfes_sociales_history_v1'); window.location.reload(); }} style={{ marginTop: '30px', padding: 'clamp(12px, 3vw, 15px) clamp(20px, 5vw, 30px)', fontSize: 'clamp(14px, 4vw, 18px)', cursor: 'pointer', background: '#ff0033', color: '#fff', border: 'none', borderRadius: '8px', fontWeight:'bold', textTransform: 'uppercase' }}>Reignite Society (Clear Cache)</button>
        </div>
      );
    }
    return this.props.children;
  }
}

/* ============================================================
   🧠 2. MOTOR GENERATIVO SOCIALES (MULTI-IDIOMA ESTRICTO)
============================================================ */
class IcfesEngine {
  
  static getTopicName(topicId, lang) {
      const mockQ = this.generateQuestion(lang, topicId);
      return mockQ.topic || topicId.replace(/_/g, ' ');
  }

  static generateQuestion(lang, forcedTopic = null) {
    const topics = [
      'COMPETENCIAS_CIUDADANAS_Y_CONSTITUCION', 'HISTORIA_DE_COLOMBIA_Y_CONFLICTO', 
      'GEOGRAFIA_Y_ORDENAMIENTO_TERRITORIAL', 'ECONOMIA_Y_GLOBALIZACION', 
      'DERECHOS_HUMANOS_Y_TUTELA', 'MECANISMOS_DE_PARTICIPACION',
      'MULTIPERSPECTIVISMO_Y_ACTORES_SOCIALES', 'IMPACTO_AMBIENTAL_Y_SOCIEDAD'
    ];
    const selectedTopic = forcedTopic || topics[Math.floor(Math.random() * topics.length)];

    switch (selectedTopic) {
      case 'DERECHOS_HUMANOS_Y_TUTELA': return this.genTutela(lang);
      case 'GEOGRAFIA_Y_ORDENAMIENTO_TERRITORIAL': return this.genGeografia(lang);
      case 'ECONOMIA_Y_GLOBALIZACION': return this.genEconomia(lang);
      case 'MULTIPERSPECTIVISMO_Y_ACTORES_SOCIALES': return this.genMultiperspectivismo(lang);
      case 'COMPETENCIAS_CIUDADANAS_Y_CONSTITUCION': return this.genTutela(lang);
      case 'HISTORIA_DE_COLOMBIA_Y_CONFLICTO': return this.genMultiperspectivismo(lang);
      default: return this.genMultiperspectivismo(lang);
    }
  }

  static generateLocalMasterclass(topic, lang) {
      const q = this.generateQuestion(lang, topic);
      return {
          title: `ENTRENAMIENTO SOCIAL: ${q.topic}`,
          theory: `[SISTEMA AISLADO DE DEEPSEEK]\n\nEl núcleo teórico de ${q.topic} evalúa tu capacidad para entender la sociedad, la Constitución y la historia sin sesgos personales. El ICFES no premia tu opinión sobre lo que es "bueno" o "malo", sino tu capacidad para identificar las posturas de los diferentes actores involucrados en un conflicto y las leyes que los rigen.\n\nLa clave está en analizar quién gana, quién pierde y qué derechos están en choque.`,
          trap: "El ICFES suele emplear distractores morales: opciones que suenan éticamente 'correctas' o 'justas' desde la opinión común, pero que NO responden a la pregunta constitucional o al contexto específico planteado.",
          protocol: "1. Lee el conflicto identificando a todos los actores involucrados.\n2. Si preguntan por un efecto, busca la consecuencia lógica directa, no lo que 'debería' pasar.\n3. Descarta opciones que juzguen moralmente a los actores si la pregunta es analítica.\n4. Apóyate siempre en los derechos fundamentales descritos en la Constitución.",
          demoQuestion: { text: q.text, options: q.options, correctIdx: q.correctIdx, analysis: q.microclass }
      };
  }

  static buildShuffledQuestion(id, lang, textsData) {
      const data = textsData[lang] || textsData['es'];
      const items = data.opts.map((opt, index) => ({
          text: opt,
          trap: data.traps[index],
          isCorrect: index === 0
      }));
      
      items.sort(() => Math.random() - 0.5);
      const correctIdx = items.findIndex(item => item.isCorrect);
      
      return {
          id: id, isAi: false, topic: data.topic, text: data.text, options: items.map(i => i.text),
          correctIdx: correctIdx, hint: data.hint, microclass: data.micro, trapExplanations: items.map(i => i.trap)
      };
  }

  static genTutela(lang) {
    const texts = {
      es: {
        topic: 'DERECHOS HUMANOS Y TUTELA', text: `La acción de tutela es un mecanismo constitucional que busca la protección inmediata de los derechos fundamentales de los ciudadanos. Por tanto, esta se puede presentar ante un juez SOLAMENTE cuando:`, hint: "La tutela es una medida de emergencia para derechos fundamentales.", micro: `La Acción de Tutela (Art. 86 de la Constitución) solo procede para proteger Derechos Fundamentales inminentes (vida, salud, libre desarrollo), no para pleitos contractuales, derechos colectivos o creaciones de leyes.`,
        opts: ["Se vulnera el derecho a la salud, porque está en riesgo la vida de la persona.", "Alguien es expulsado de una agremiación, a pesar de estar al día en sus pagos.", "Se busca proteger un derecho colectivo de constituir juntas de acción comunal.", "Se quiere legislar sobre el derecho a la vida y el acceso a un trabajo digno para las personas."],
        traps: [null, "Esto es un conflicto privado contractual, no un riesgo inminente de vida.", "Los derechos colectivos se protegen con la 'Acción Popular', no con tutela.", "La tutela no legisla ni crea leyes, solo protege a un individuo específico."]
      },
      en: {
        topic: 'HUMAN RIGHTS AND TUTELA', text: `The "Acción de Tutela" is a constitutional mechanism in Colombia that seeks the immediate protection of fundamental rights. Therefore, it can ONLY be presented before a judge when:`, hint: "Tutela is an emergency measure for fundamental rights.", micro: `The Tutela (Art. 86 of the Constitution) only proceeds to protect imminent Fundamental Rights (life, health), not for contractual disputes, collective rights, or creating laws.`,
        opts: ["The right to health is violated, putting the person's life at risk.", "Someone is expelled from an association despite paying their dues.", "Seeking to protect a collective right to form community boards.", "Wanting to legislate on the right to life and decent work."],
        traps: [null, "This is a private contractual conflict, not an imminent life risk.", "Collective rights are protected with a 'Popular Action', not tutela.", "Tutela does not legislate or create laws; it only protects specific individuals."]
      },
      fr: {
        topic: 'DROITS HUMAINS ET TUTELA', text: `L'"Acción de Tutela" est un mécanisme constitutionnel cherchant la protection immédiate des droits fondamentaux. Par conséquent, elle ne peut être présentée devant un juge QUE lorsque :`, hint: "La tutela est une mesure d'urgence pour les droits fondamentaux.", micro: `La Tutela (Art. 86 de la Constitution) ne s'applique que pour protéger les droits fondamentaux imminents (vie, santé), pas pour les litiges contractuels ou les droits collectifs.`,
        opts: ["Le droit à la santé est violé, mettant la vie de la personne en danger.", "Quelqu'un est expulsé d'une association malgré le paiement de ses cotisations.", "On cherche à protéger un droit collectif de former des comités communautaires.", "On veut légiférer sur le droit à la vie et au travail décent."],
        traps: [null, "Il s'agit d'un conflit contractuel privé, pas d'un risque de vie.", "Les droits collectifs sont protégés par une 'Action Populaire'.", "La tutela ne légifère pas, elle protège un individu."]
      },
      de: {
        topic: 'MENSCHENRECHTE UND TUTELA', text: `Die "Acción de Tutela" ist ein Verfassungsmechanismus zum sofortigen Schutz von Grundrechten. Daher kann sie vor einem Richter NUR eingereicht werden, wenn:`, hint: "Tutela ist eine Notfallmaßnahme für Grundrechte.", micro: `Die Tutela (Art. 86 der Verfassung) gilt nur zum Schutz drohender Grundrechte (Leben, Gesundheit), nicht für vertragliche Streitigkeiten, kollektive Rechte oder die Gesetzgebung.`,
        opts: ["Das Recht auf Gesundheit verletzt wird und das Leben der Person in Gefahr ist.", "Jemand trotz Beitragszahlung aus einem Verein ausgeschlossen wird.", "Man ein kollektives Recht auf Bildung von Gemeindevorständen schützen will.", "Man Gesetze über das Recht auf Leben und menschenwürdige Arbeit erlassen will."],
        traps: [null, "Dies ist ein privater vertraglicher Konflikt, kein Lebensrisiko.", "Kollektive Rechte werden mit einer 'Popularklage' geschützt.", "Tutela erlässt keine Gesetze, sie schützt nur Individuen."]
      }
    };
    return this.buildShuffledQuestion('DERECHOS_HUMANOS_Y_TUTELA', lang, texts);
  }

  static genGeografia(lang) {
    const texts = {
      es: {
        topic: 'GEOGRAFÍA Y ORDENAMIENTO TERRITORIAL', text: `En las principales ciudades del mundo moderno está produciéndose un paulatino abandono de las zonas residenciales del centro urbano, al tiempo que las zonas periféricas tienden a un mayor poblamiento. Estas migraciones las realizan personas o familias que tienen ingresos medios y altos. La principal causa de este fenómeno se atribuye:`, hint: "Piensa en el fenómeno de la Gentrificación y el costo del suelo.", micro: `Las familias de altos ingresos abandonan los centros buscando espacios más amplios, seguros y con naturaleza (suburbios), dejando los centros a la actividad comercial o forzando la gentrificación.`,
        opts: ["A la búsqueda de mejor calidad de vida y espacios más amplios en barrios periféricos tranquilos.", "Al creciente desarrollo de la industria pesada en el centro histórico de las ciudades.", "A la escasa oferta de servicios públicos básicos en los barrios del centro de la ciudad.", "A la creciente oferta de vivienda muy barata en las afueras de la ciudad para personas de bajos recursos."],
        traps: [null, "La industria pesada ya no se ubica en los centros urbanos modernos.", "Los centros urbanos son las zonas con mayor concentración de servicios públicos.", "El texto especifica que son familias de 'ingresos medios y altos', no buscan vivienda barata de interés social."]
      },
      en: {
        topic: 'GEOGRAPHY AND TERRITORIAL PLANNING', text: `In major modern cities, there is a gradual abandonment of residential areas in the urban center, while peripheral areas tend to become more populated. These migrations are carried out by middle and high-income families. The main cause of this phenomenon is attributed to:`, hint: "Think about suburbanization and the search for space.", micro: `High-income families leave centers looking for larger, safer spaces with nature (suburbs), leaving centers to commercial activity or forcing gentrification.`,
        opts: ["The search for a better quality of life and larger spaces in quiet peripheral neighborhoods.", "The growing development of heavy industry in the historic center of cities.", "The scarce supply of basic public services in downtown neighborhoods.", "The growing supply of very cheap housing on the outskirts for low-income people."],
        traps: [null, "Heavy industry is no longer located in modern urban centers.", "Urban centers have the highest concentration of public services.", "The text specifies 'middle and high-income' families; they are not looking for cheap social housing."]
      },
      fr: {
        topic: 'GÉOGRAPHIE ET AMÉNAGEMENT DU TERRITOIRE', text: `Dans les grandes villes modernes, on observe un abandon progressif des zones résidentielles du centre-ville, tandis que les zones périphériques se peuplent davantage. Ces migrations sont effectuées par des familles à revenus moyens et élevés. La cause principale de ce phénomène est attribuée à :`, hint: "Pensez à la suburbanisation et à la recherche d'espace.", micro: `Les familles à revenus élevés quittent les centres à la recherche d'espaces plus grands, plus sûrs et plus proches de la nature (banlieues).`,
        opts: ["La recherche d'une meilleure qualité de vie et d'espaces plus vastes dans des quartiers périphériques calmes.", "Le développement croissant de l'industrie lourde dans le centre historique.", "La faible offre de services publics de base dans les quartiers du centre.", "L'offre croissante de logements très bon marché en périphérie pour les personnes à faibles revenus."],
        traps: [null, "L'industrie lourde n'est plus située dans les centres urbains modernes.", "Les centres urbains ont la plus forte concentration de services publics.", "Le texte précise des familles à 'revenus moyens et élevés', elles ne cherchent pas de logements sociaux."]
      },
      de: {
        topic: 'GEOGRAPHIE UND RAUMORDNUNG', text: `In modernen Großstädten kommt es zu einer allmählichen Aufgabe von Wohngebieten im Stadtzentrum, während Randgebiete dichter besiedelt werden. Diese Migrationen werden von Familien mit mittlerem und hohem Einkommen durchgeführt. Die Hauptursache für dieses Phänomen wird zugeschrieben:`, hint: "Denken Sie an Suburbanisierung und die Suche nach Platz.", micro: `Familien mit hohem Einkommen verlassen die Zentren auf der Suche nach größeren, sichereren Räumen mit Natur (Vororte).`,
        opts: ["Der Suche nach mehr Lebensqualität und größeren Räumen in ruhigen Randvierteln.", "Der zunehmenden Entwicklung der Schwerindustrie im historischen Zentrum der Städte.", "Dem geringen Angebot an grundlegenden öffentlichen Dienstleistungen im Stadtzentrum.", "Dem wachsenden Angebot an sehr billigem Wohnraum am Stadtrand für einkommensschwache Menschen."],
        traps: [null, "Schwerindustrie befindet sich nicht mehr in modernen Stadtzentren.", "Stadtzentren haben die höchste Konzentration an öffentlichen Dienstleistungen.", "Der Text nennt 'Familien mit mittlerem und hohem Einkommen'; sie suchen keinen billigen Sozialen Wohnungsbau."]
      }
    };
    return this.buildShuffledQuestion('GEOGRAFIA_Y_ORDENAMIENTO_TERRITORIAL', lang, texts);
  }

  static genEconomia(lang) {
    const texts = {
      es: {
        topic: 'ECONOMÍA Y GLOBALIZACIÓN', text: `A pesar de que las economías latinoamericanas han dado pasos hacia el Libre Comercio, siguen existiendo fuertes restricciones y aranceles comerciales en países potencias. La valoración objetiva de esta situación lleva a concluir que:`, hint: "El Libre Comercio no es perfecto y está condicionado por intereses políticos.", micro: `El comercio internacional no es equitativo. Las potencias mundiales promueven el libre comercio para vender sus productos, pero imponen proteccionismos (aranceles) para proteger sus industrias internas de la competencia extranjera.`,
        opts: ["El intercambio libre entre países no es absoluto, pues existen intereses políticos orientados a proteger sectores económicos locales.", "El neoliberalismo garantizará que las economías en desarrollo crezcan sin ninguna restricción futura.", "Se pueden abrir las economías al mundo en condiciones totalmente justas, eliminando la diferencia entre potencias.", "Una política económica local puede forzar a las potencias a bajar sus aranceles voluntariamente."],
        traps: [null, "El texto afirma que 'siguen existiendo restricciones', contradiciendo la idea de un neoliberalismo perfecto.", "El texto demuestra que las condiciones NO son justas ni similares.", "Los países en desarrollo no tienen el poder económico para forzar decisiones en las potencias mundiales."]
      },
      en: {
        topic: 'ECONOMY AND GLOBALIZATION', text: `Although Latin American economies have taken steps towards Free Trade, strong trade restrictions and tariffs still exist in powerful countries. An objective assessment of this situation leads to the conclusion that:`, hint: "Free Trade is not perfect and is conditioned by political interests.", micro: `International trade is not equitable. World powers promote free trade to sell their products but impose protectionism (tariffs) to protect their domestic industries from foreign competition.`,
        opts: ["Free exchange between countries is not absolute, as there are political interests aimed at protecting local economic sectors.", "Neoliberalism will ensure that developing economies grow without any future restrictions.", "Economies can be opened to the world under completely fair conditions, eliminating differences between powers.", "A local economic policy can force global powers to voluntarily lower their tariffs."],
        traps: [null, "The text states that 'restrictions still exist', contradicting the idea of perfect neoliberalism.", "The text shows that conditions are NOT fair or similar.", "Developing countries lack the economic power to force decisions on world powers."]
      },
      fr: {
        topic: 'ÉCONOMIE ET MONDIALISATION', text: `Bien que les économies latino-américaines aient fait des pas vers le libre-échange, de fortes restrictions commerciales existent toujours dans les pays puissants. Une évaluation objective de cette situation permet de conclure que :`, hint: "Le libre-échange n'est pas parfait et dépend d'intérêts politiques.", micro: `Le commerce international n'est pas équitable. Les puissances imposent le protectionnisme pour protéger leurs industries.`,
        opts: ["Le libre-échange n'est pas absolu, car des intérêts politiques cherchent à protéger les secteurs économiques locaux.", "Le néolibéralisme garantira une croissance sans restriction pour les économies en développement.", "Les économies peuvent s'ouvrir dans des conditions totalement justes.", "Une politique économique locale peut forcer les puissances à baisser leurs tarifs."],
        traps: [null, "Le texte contredit l'idée d'un néolibéralisme parfait.", "Le texte montre que les conditions NE SONT PAS justes.", "Les pays en développement ne peuvent pas forcer les puissances mondiales."]
      },
      de: {
        topic: 'WIRTSCHAFT UND GLOBALISIERUNG', text: `Obwohl lateinamerikanische Volkswirtschaften Schritte in Richtung Freihandel unternommen haben, gibt es in mächtigen Ländern weiterhin starke Handelsbeschränkungen. Eine objektive Bewertung dieser Situation führt zu dem Schluss, dass:`, hint: "Freihandel ist nicht perfekt und wird von politischen Interessen bestimmt.", micro: `Der internationale Handel ist nicht gerecht. Weltmächte fördern den Freihandel, um ihre Produkte zu verkaufen, verhängen aber Protektionismus, um ihre heimische Industrie zu schützen.`,
        opts: ["Der freie Austausch ist nicht absolut, da politische Interessen darauf abzielen, lokale Wirtschaftssektoren zu schützen.", "Der Neoliberalismus wird sicherstellen, dass Entwicklungsländer ohne zukünftige Einschränkungen wachsen.", "Volkswirtschaften können unter völlig fairen Bedingungen geöffnet werden.", "Eine lokale Wirtschaftspolitik kann Weltmächte zwingen, ihre Zölle zu senken."],
        traps: [null, "Der Text widerspricht der Idee eines perfekten Neoliberalismus.", "Der Text zeigt, dass die Bedingungen NICHT fair sind.", "Entwicklungsländer haben nicht die Macht, Weltmächte zu zwingen."]
      }
    };
    return this.buildShuffledQuestion('ECONOMIA_Y_GLOBALIZACION', lang, texts);
  }

  static genMultiperspectivismo(lang) {
    const texts = {
      es: {
        topic: 'MULTIPERSPECTIVISMO SOCIAL', text: `Un estudiante se intoxicó con comida que compró a un vendedor ambulante a la salida del colegio. Por esto, el Consejo Directivo, con ayuda de la Policía, logró la expulsión definitiva de los vendedores ambulantes del sector. ¿Cuál sería un efecto socioeconómico directo de la expulsión de estos vendedores?`, hint: "En sociales debes ver los efectos en TODOS los actores, incluyendo a los vendedores.", micro: `El análisis social requiere multiperspectivismo. Aunque el colegio resolvió el problema de salud, la expulsión genera una consecuencia socioeconómica negativa inmediata para las familias de los vendedores, que dependen del mercado informal para subsistir.`,
        opts: ["La disminución drástica de los ingresos de las familias que dependían económicamente de esas ventas.", "El aumento inminente de la inseguridad y los robos en las inmediaciones del colegio.", "El aumento de las intoxicaciones alimentarias de los estudiantes dentro de la cafetería del colegio.", "La disminución del apoyo de la comunidad educativa al Consejo Directivo y a la Policía local."],
        traps: [null, "Asumir que un vendedor ambulante se vuelve criminal al ser expulsado es un prejuicio y no un efecto lógico.", "Los vendedores fueron expulsados, por ende las intoxicaciones externas bajarán, no subirán en el colegio.", "Generalmente, los padres apoyan estas medidas por seguridad de sus hijos, no disminuyen su apoyo."]
      },
      en: {
        topic: 'SOCIAL MULTIPERSPECTIVISM', text: `A student got food poisoning from a street vendor outside the school. Because of this, the School Board, with the help of the Police, permanently expelled all street vendors from the area. What would be a direct socioeconomic effect of expelling these vendors?`, hint: "In social sciences, look at the effects on ALL actors, including the vendors.", micro: `Social analysis requires multiperspectivism. Although the school solved the health issue, the expulsion generates an immediate negative socioeconomic consequence for the vendors' families, who rely on informal markets to survive.`,
        opts: ["A drastic decrease in the income of families who depended economically on those sales.", "An imminent increase in insecurity and robberies around the school premises.", "An increase in food poisoning among students inside the school cafeteria.", "A decrease in the educational community's support for the School Board and local Police."],
        traps: [null, "Assuming a street vendor turns into a criminal when expelled is a prejudice, not a logical effect.", "Vendors were expelled; thus, external poisonings will drop, not increase inside.", "Parents generally support these measures for their children's safety."]
      },
      fr: {
        topic: 'MULTIPERSPECTIVISME SOCIAL', text: `Un élève a été intoxiqué par la nourriture d'un vendeur ambulant devant l'école. Le conseil d'administration et la police ont donc expulsé définitivement les vendeurs du secteur. Quel serait un effet socio-économique direct de cette expulsion ?`, hint: "Regardez les effets sur TOUS les acteurs, y compris les vendeurs.", micro: `L'analyse sociale requiert du multiperspectivisme. Bien que l'école ait résolu le problème de santé, l'expulsion entraîne une baisse immédiate des revenus des familles des vendeurs.`,
        opts: ["Une baisse drastique des revenus des familles qui dépendaient économiquement de ces ventes.", "Une augmentation imminente de l'insécurité et des vols aux abords de l'école.", "Une augmentation des intoxications alimentaires dans la cafétéria de l'école.", "Une diminution du soutien de la communauté éducative envers le Conseil et la Police."],
        traps: [null, "Supposer qu'un vendeur devient criminel est un préjugé.", "Les vendeurs ont été expulsés, les intoxications baisseront.", "Les parents soutiennent généralement ces mesures de sécurité."]
      },
      de: {
        topic: 'SOZIALER MULTIPERSPEKTIVISMUS', text: `Ein Schüler erlitt eine Lebensmittelvergiftung durch einen Straßenverkäufer vor der Schule. Daraufhin vertrieb die Schulleitung mit Hilfe der Polizei alle Verkäufer aus der Gegend. Was wäre eine direkte sozioökonomische Auswirkung der Vertreibung dieser Verkäufer?`, hint: "Betrachten Sie die Auswirkungen auf ALLE Akteure, auch auf die Verkäufer.", micro: `Soziale Analyse erfordert Multiperspektivismus. Obwohl das Gesundheitsproblem gelöst wurde, führt die Vertreibung zu einem sofortigen Einkommensverlust für die Familien der Verkäufer.`,
        opts: ["Ein drastischer Rückgang des Einkommens der Familien, die von diesen Verkäufen abhingen.", "Eine drohende Zunahme von Unsicherheit und Raubüberfällen rund um die Schule.", "Eine Zunahme von Lebensmittelvergiftungen in der Schulkantine.", "Ein Rückgang der Unterstützung der Schulgemeinschaft für die Schulleitung und Polizei."],
        traps: [null, "Anzunehmen, ein Verkäufer werde kriminell, ist ein Vorurteil.", "Die Verkäufer sind weg; Vergiftungen werden sinken, nicht steigen.", "Eltern unterstützen solche Sicherheitsmaßnahmen in der Regel."]
      }
    };
    return this.buildShuffledQuestion('MULTIPERSPECTIVISMO_Y_ACTORES_SOCIALES', lang, texts);
  }
}

/* ============================================================
   🧠 3. MOTOR DEEPSEEK (CONEXIÓN IA PROFUNDA Y PROTEGIDA)
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
    const topics = ['COMPETENCIAS_CIUDADANAS_Y_CONSTITUCION', 'HISTORIA_DE_COLOMBIA_Y_CONFLICTO', 'GEOGRAFIA_Y_ORDENAMIENTO_TERRITORIAL', 'ECONOMIA_Y_GLOBALIZACION', 'DERECHOS_HUMANOS_Y_TUTELA'];
    const selectedTopic = forcedTopic || topics[Math.floor(Math.random() * topics.length)];
    const targetLang = LANG_MAP_DS[lang] || "SPANISH";

    const sysPrompt = `
      Eres un experto diseñador de exámenes ICFES de Colombia, enfocado 100% en CIENCIAS SOCIALES Y COMPETENCIAS CIUDADANAS.
      Genera una pregunta analítica COMPLETAMENTE NUEVA sobre el tema: "${selectedTopic}".
      Language for the output must strictly be: ${targetLang}.
      Inventa un caso de la vida real, un dilema ético, una política pública o un conflicto entre actores sociales.
      Provee 4 opciones de respuesta (en el idioma solicitado), solo 1 correcta. Las otras 3 deben ser distractores comunes del ICFES (por ejemplo, juzgar moralmente en lugar de objetivamente, ignorar un actor del conflicto, o aplicar leyes falsas).
      
      REGLA ABSOLUTA: RESPONDE SOLO CON UN JSON VÁLIDO. NADA DE MARKDOWN ALREDEDOR. TODOS LOS TEXTOS DENTRO DEL JSON DEBEN ESTAR EN ${targetLang}. Usa comillas simples ('') dentro de los textos.
      {
        "id": "${selectedTopic}",
        "topic": "Nombre del dominio social",
        "text": "El enunciado del conflicto social/histórico y la pregunta...",
        "options": ["Opción Correcta", "Opción Trampa 1", "Opción Trampa 2", "Opción Trampa 3"],
        "correctIdx": 0,
        "hint": "Pista analítica para identificar actores o derechos",
        "microclass": "Explicación de los efectos sociales y por qué es correcta",
        "trapExplanations": ["Explicación correcta", "Trampa B explicada", "Trampa C explicada", "Trampa D explicada"]
      }
    `;

    try {
      const response = await this.fetchWithTimeout(DEEPSEEK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${DEEPSEEK_API_KEY}` },
        body: JSON.stringify({ model: "deepseek-chat", messages: [{ role: "system", content: sysPrompt }], temperature: 0.7, max_tokens: 1000, response_format: { type: "json_object" } })
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
      Eres un Profesor de Ciencias Sociales de élite preparando a un estudiante para la prueba de Estado ICFES.
      Genera una CLASE MAGISTRAL sobre: "${topic}".
      Language for the output MUST STRICTLY BE: ${targetLang}.
      Debe ser profundamente analítica (entre 300 y 400 palabras), explicando cómo el ICFES evalúa este problema social (multiperspectivismo, análisis de derechos).

      REGLAS CRÍTICAS: RESPONDE SÓLO EN JSON VÁLIDO. ESCAPA SALTOS DE LÍNEA \\n. USA COMILLAS SIMPLES (''). TODOS LOS TEXTOS DEBEN ESTAR EN ${targetLang}.
      
      ESTRUCTURA EXACTA REQUERIDA:
      {
        "title": "TÍTULO DEL PROBLEMA SOCIAL",
        "theory": "Explicación teórica extensa sobre actores, Estado e historia.",
        "trap": "La trampa moral o de sesgo típico del ICFES explicada a fondo.",
        "protocol": "1. Identificar actores.\\n2. Identificar derechos vulnerados.",
        "demoQuestion": {
           "text": "Minifragmento de un dilema social generado...",
           "options": ["A", "B", "C", "D"],
           "correctIdx": 0,
           "analysis": "Análisis extenso y sociológico de la interpretación correcta."
        }
      }
    `;

    try {
      const response = await this.fetchWithTimeout(DEEPSEEK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${DEEPSEEK_API_KEY}` },
        body: JSON.stringify({ model: "deepseek-chat", messages: [{ role: "system", content: sysPrompt }], temperature: 0.2, max_tokens: 1500, response_format: { type: "json_object" } })
      }, 30000); 
      
      if(!response.ok) throw new Error("HTTP_ERROR");
      const data = await response.json();
      const parsed = this.cleanJSON(data.choices[0].message.content);
      
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
   🌍 5. DICCIONARIOS UI Y CONSEJOS (CIENCIAS SOCIALES + HISTORIAL)
============================================================ */
const DICT_UI = {
  es: {
      start: "INICIAR INMERSIÓN SOCIAL", title: "LABORATORIO ICFES CIENCIAS SOCIALES", 
      scan: "ESCÁNER CONSTITUCIONAL", aiBtn: "TUTORÍA IA",
      time: "CRONÓMETRO ESTATAL", mastery: "Maestría Ciudadana", 
      btnCheck: "SINTETIZAR RESOLUCIÓN", btnNext: "SIGUIENTE DILEMA ➔",
      btnRetrySame: "REINTENTAR ANÁLISIS ➔", 
      correctTitle: "¡ANÁLISIS SOCIAL PERFECTO!", wrongTitle: "RUPTURA CONSTITUCIONAL",
      statsBtn: "TELEMETRÍA", theoryText: "MOTOR SOCIOLÓGICO ACTIVO. Conectado a DeepSeek. Generando conflictos de interés, problemas de ordenamiento territorial y dilemas constitucionales procedurales.",
      timeout: "¡COLAPSO DEL SISTEMA DEMOCRÁTICO!", topic: "DOMINIO ACTIVO", 
      dashboard: "DASHBOARD CIUDADANO GLOBAL", avgTime: "Tiempo Medio de Resolución",
      btnRetry: "PURGAR CONSTITUCIÓN", aiSocraticBtn: "SOLICITAR CLASE MAGISTRAL IA",
      socraticModal: "LA IA HA DETECTADO FALLOS EN:", aiPraise: "¡DERECHOS PROTEGIDOS! NO HAY FALLAS SOCIALES.",
      aiSelectTopic: "Selecciona la competencia a repasar:", aiClose: "CERRAR SESIÓN IA",
      downloadReport: "DESCARGAR INFORME CIUDADANO",
      loadingData: "ESTABLECIENDO CONEXIÓN CONSTITUCIONAL...",
      warmupTitle: "⚡ DILEMA DE CALENTAMIENTO", warmupSub: "Mientras la IA sintetiza el conflicto principal...",
      pdfTitleTheory: "NÚCLEO TEÓRICO Y ANÁLISIS",
      pdfTitleTrap: "TRAMPA COGNITIVA ICFES",
      pdfTitleSim: "SIMULACIÓN DE CONFLICTO SOCIAL",
      pdfTitleAnalysis: "VEREDICTO CONSTITUCIONAL",
      downloadMasterclassBtn: "📄 DESCARGAR MASTERCLASS EN PDF",
      historyBtn: "📚 HISTORIAL IA",
      historyTitle: "ARCHIVOS AKÁSHICOS (HISTORIAL)",
      historyEmpty: "No hay registros en la matriz. Solicita una clase primero.",
      clearHistoryBtn: "🗑️ PURGAR HISTORIAL",
      viewClassBtn: "👁️ VER ARCHIVO",
      backToHistoryBtn: "VOLVER AL HISTORIAL"
  },
  en: {
      start: "START SOCIAL IMMERSION", title: "ICFES SOCIAL SCIENCES LAB", scan: "CONSTITUTIONAL SCANNER", aiBtn: "AI TUTOR", time: "STATE TIMER", mastery: "Citizenship Mastery", btnCheck: "SYNTHESIZE RESOLUTION", btnNext: "NEXT DILEMMA ➔", btnRetrySame: "RETRY ANALYSIS ➔", correctTitle: "PERFECT SOCIAL ANALYSIS!", wrongTitle: "CONSTITUTIONAL RUPTURE", statsBtn: "TELEMETRY", theoryText: "SOCIOLOGICAL ENGINE ACTIVE. Hooked to DeepSeek. Generating procedural conflicts of interest and constitutional dilemmas.", timeout: "DEMOCRATIC SYSTEM COLLAPSE!", topic: "ACTIVE DOMAIN", dashboard: "GLOBAL CITIZEN DASHBOARD", avgTime: "Avg Resolution Time", btnRetry: "PURGE CONSTITUTION", aiSocraticBtn: "REQUEST AI MASTERCLASS", socraticModal: "AI HAS DETECTED FAILURES IN:", aiPraise: "RIGHTS PROTECTED! NO SOCIAL FLAWS.", aiSelectTopic: "Select the competence to review:", aiClose: "CLOSE AI SESSION", downloadReport: "DOWNLOAD CITIZEN REPORT", loadingData: "ESTABLISHING CONSTITUTIONAL LINK...", warmupTitle: "⚡ WARM-UP DILEMMA", warmupSub: "While AI synthesizes your main conflict...",
      pdfTitleTheory: "THEORETICAL CORE AND ANALYSIS",
      pdfTitleTrap: "ICFES COGNITIVE TRAP",
      pdfTitleSim: "SOCIAL CONFLICT SIMULATION",
      pdfTitleAnalysis: "CONSTITUTIONAL VERDICT",
      downloadMasterclassBtn: "📄 DOWNLOAD MASTERCLASS AS PDF",
      historyBtn: "📚 AI HISTORY",
      historyTitle: "AKASHIC RECORDS (HISTORY)",
      historyEmpty: "No records in the matrix. Request a class first.",
      clearHistoryBtn: "🗑️ PURGE HISTORY",
      viewClassBtn: "👁️ VIEW RECORD",
      backToHistoryBtn: "BACK TO HISTORY"
  },
  fr: {
      start: "DÉMARRER L'IMMERSION SOCIALE", title: "LABO SCIENCES SOCIALES ICFES", scan: "SCANNER CONSTITUTIONNEL", aiBtn: "TUTEUR IA", time: "CHRONOMÈTRE D'ÉTAT", mastery: "Maîtrise Citoyenne", btnCheck: "SYNTHÉTISER LA RÉSOLUTION", btnNext: "DILEMME SUIVANT ➔", btnRetrySame: "RÉESSAYER L'ANALYSE ➔", correctTitle: "ANALYSE SOCIALE PARFAITE!", wrongTitle: "RUPTURE CONSTITUTIONNELLE", statsBtn: "TÉLÉMÉTRIE", theoryText: "MOTEUR SOCIOLOGIQUE ACTIF. Connecté à DeepSeek. Génération de conflits d'intérêts et de dilemmes constitutionnels.", timeout: "EFFONDREMENT DÉMOCRATIQUE!", topic: "DOMAINE ACTIF", dashboard: "TABLEAU DE BORD CITOYEN", avgTime: "Temps Moyen de Résolution", btnRetry: "PURGER LA CONSTITUTION", aiSocraticBtn: "DEMANDER MASTERCLASS IA", socraticModal: "FAILLES DÉTECTÉES :", aiPraise: "DROITS PROTÉGÉS !", aiSelectTopic: "Sélectionnez la compétence :", aiClose: "FERMER LA SESSION IA", downloadReport: "TÉLÉCHARGER LE RAPPORT CITOYEN", loadingData: "ÉTABLISSEMENT DU LIEN CONSTITUTIONNEL...", warmupTitle: "⚡ DILEMME D'ÉCHAUFFEMENT", warmupSub: "Pendant que l'IA synthétise le conflit...",
      pdfTitleTheory: "NOYAU THÉORIQUE ET ANALYSE",
      pdfTitleTrap: "PIÈGE COGNITIF ICFES",
      pdfTitleSim: "SIMULATION DE CONFLIT SOCIAL",
      pdfTitleAnalysis: "VERDICT CONSTITUTIONNEL",
      downloadMasterclassBtn: "📄 TÉLÉCHARGER MASTERCLASS EN PDF",
      historyBtn: "📚 HISTORIQUE IA",
      historyTitle: "ARCHIVES AKASHIQUES (HISTORIQUE)",
      historyEmpty: "Aucun registre. Demandez un cours d'abord.",
      clearHistoryBtn: "🗑️ PURGER L'HISTORIQUE",
      viewClassBtn: "👁️ VOIR L'ARCHIVE",
      backToHistoryBtn: "RETOUR À L'HISTORIQUE"
  },
  de: {
      start: "SOZIALE IMMERSION STARTEN", title: "ICFES SOZIALWISSENSCHAFTEN LABOR", scan: "VERFASSUNGSSCANNER", aiBtn: "KI-TUTOR", time: "STAATSTIMER", mastery: "Bürgerbeherrschung", btnCheck: "LÖSUNG SYNTHETISIEREN", btnNext: "NÄCHSTES DILEMMA ➔", btnRetrySame: "ANALYSE WIEDERHOLEN ➔", correctTitle: "PERFEKTE SOZIALANALYSE!", wrongTitle: "VERFASSUNGSBRUCH", statsBtn: "TELEMETRIE", theoryText: "SOZIOLOGISCHE KI AKTIV. Verbunden mit DeepSeek. Erzeugt prozedurale Interessenkonflikte und Verfassungsdilemmata.", timeout: "DEMOKRATIE-KOLLAPS!", topic: "AKTIVE DOMÄNE", dashboard: "GLOBALE BÜRGER-TELEMETRIE", avgTime: "Durchschnittliche Lösungszeit", btnRetry: "VERFASSUNG LÖSCHEN", aiSocraticBtn: "KI MASTERCLASS ANFORDERN", socraticModal: "FEHLER ERKANNT IN:", aiPraise: "RECHTE GESCHÜTZT! KEINE FEHLER.", aiSelectTopic: "Wählen Sie die Kompetenz:", aiClose: "KI-SITZUNG SCHLIESSEN", downloadReport: "BÜRGERBERICHT HERUNTERLADEN", loadingData: "AUFBAU DER VERFASSUNGSVERBINDUNG...", warmupTitle: "⚡ AUFWÄRM-DILEMMA", warmupSub: "Während die KI deinen Hauptkonflikt synthetisiert...",
      pdfTitleTheory: "THEORETISCHER KERN UND ANALYSE",
      pdfTitleTrap: "ICFES KOGNITIVE FALLE",
      pdfTitleSim: "SIMULATION SOZIALER KONFLIKTE",
      pdfTitleAnalysis: "VERFASSUNGSURTEIL",
      downloadMasterclassBtn: "📄 MASTERCLASS ALS PDF HERUNTERLADEN",
      historyBtn: "📚 KI-VERLAUF",
      historyTitle: "AKASHA-CHRONIK (VERLAUF)",
      historyEmpty: "Keine Aufzeichnungen. Fordern Sie zuerst eine Klasse an.",
      clearHistoryBtn: "🗑️ VERLAUF LÖSCHEN",
      viewClassBtn: "👁️ AUFZEICHNUNG ANSEHEN",
      backToHistoryBtn: "ZURÜCK ZUM VERLAUF"
  }
};

const DICT_REPORT = {
  es: { docTitle: "DOSSIER TÁCTICO SOCIAL", docSub: "SIMULACIÓN ICFES - NÚCLEO CIUDADANO", dateLabel: "Fecha de Extracción", kpiTitle: "MÉTRICAS GLOBALES DE RENDIMIENTO", kpiAcc: "Juicio Constitucional", kpiTime: "Tiempo Medio", kpiTotal: "Dilemas Analizados", aiTitle: "VEREDICTO DEL SISTEMA IA", aiVuln: "⚠️ VULNERABILIDADES CIUDADANAS DETECTADAS", aiVulnDesc: "El operador muestra deficiencias en las siguientes competencias sociopolíticas:", aiAction: "PLAN DE ACCIÓN DE IA", aiActionDesc: "Es imperativo solicitar la 'Masterclass IA' para re-entrenar la empatía y la lógica estatal.", aiOpt: "✅ RENDIMIENTO CIUDADANO ÓPTIMO", aiOptDesc: "El operador comprende la pluralidad de actores en un conflicto.", aiNoData: "Datos sociales insuficientes.", topicTitle: "DESGLOSE POR COMPETENCIA", topicNoData: "Faltan mapas territoriales.", topicHit: "Aciertos", topicMiss: "Fallos", footer: "LEARNING LABS SOCIAL-ENGINE V27.0", footerSub: "La democracia exige ciudadanos críticos." },
  en: { docTitle: "SOCIAL TACTICAL DOSSIER", docSub: "ICFES SIMULATION - CITIZEN CORE", dateLabel: "Date", kpiTitle: "GLOBAL METRICS", kpiAcc: "Constitutional Judgment", kpiTime: "Avg Time", kpiTotal: "Dilemmas Analyzed", aiTitle: "AI VERDICT", aiVuln: "⚠️ CITIZEN VULNERABILITIES DETECTED", aiVulnDesc: "Deficiencies in socio-political competencies:", aiAction: "ACTION PLAN", aiActionDesc: "Use AI Masterclass to retrain state logic.", aiOpt: "✅ OPTIMAL CITIZEN PERFORMANCE", aiOptDesc: "Operator understands multiperspectivism.", aiNoData: "Insufficient social data.", topicTitle: "COMPETENCE BREAKDOWN", topicNoData: "Missing territorial maps.", topicHit: "Hits", topicMiss: "Misses", footer: "LEARNING LABS SOCIAL-ENGINE", footerSub: "Democracy demands critical citizens." },
  fr: { docTitle: "DOSSIER TACTIQUE SOCIAL", docSub: "SIMULATION CITOYENNE ICFES", dateLabel: "Date", kpiTitle: "MÉTRIQUES GLOBALES", kpiAcc: "Jugement Constitutionnel", kpiTime: "Temps Moyen", kpiTotal: "Dilemmes Analysés", aiTitle: "VERDICT IA", aiVuln: "⚠️ VULNÉRABILITÉS CITOYENNES", aiVulnDesc: "Déficiences dans :", aiAction: "PLAN D'ACTION", aiActionDesc: "Utiliser Masterclass IA.", aiOpt: "✅ PERFORMANCE OPTIMALE", aiOptDesc: "Compréhension des acteurs sociaux.", aiNoData: "Données insuffisantes.", topicTitle: "RÉPARTITION PAR COMPÉTENCE", topicNoData: "Pas de cartes.", topicHit: "Succès", topicMiss: "Échecs", footer: "LEARNING LABS SOCIAL-ENGINE", footerSub: "La démocratie exige des citoyens critiques." },
  de: { docTitle: "TAKTISCHES SOZIAL-DOSSIER", docSub: "BÜRGER QUANTENSIMULATION", dateLabel: "Datum", kpiTitle: "GLOBALE KENNZAHLEN", kpiAcc: "Verfassungsurteil", kpiTime: "Durchschnittszeit", kpiTotal: "Dilemmata analysiert", aiTitle: "KI-URTEIL", aiVuln: "⚠️ BÜRGER-SCHWACHSTELLEN", aiVulnDesc: "Mängel in soziopolitischen Kompetenzen:", aiAction: "AKTIONSPLAN", aiActionDesc: "KI Masterclass nutzen.", aiOpt: "✅ OPTIMALE LEISTUNG", aiOptDesc: "Bediener versteht Multiperspektivismus.", aiNoData: "Unzureichende Daten.", topicTitle: "KOMPETENZAUFSCHLÜSSELUNG", topicNoData: "Keine Karten.", topicHit: "Treffer", topicMiss: "Fehler", footer: "LEARNING LABS SOCIAL-ENGINE", footerSub: "Demokratie erfordert kritische Bürger." }
};

// 💡 BANCO MASIVO DE 20 TIPS POR IDIOMA (ENFOCADO EN SOCIALES Y CIUDADANAS)
const TIPS_DB = {
  es: [
    "MULTIPERSPECTIVISMO: Ante un problema social (ej. una mina vs un páramo), NUNCA juzgues qué es bueno o malo. Pregúntate: ¿Qué actor pierde y qué actor gana?",
    "ACCIÓN DE TUTELA: Úsala SOLO y exclusivamente cuando esté en riesgo inminente un Derecho Fundamental (Vida, Salud, Libertad).",
    "MECANISMOS DE PARTICIPACIÓN: Un Plebiscito es convocado por el Presidente. Un Referendo aprueba o deroga leyes. La Consulta Popular es local.",
    "CONSTITUCIÓN DE 1991: Recuerda que Colombia es un Estado 'Social' de Derecho, lo que obliga al Estado a proteger a los más vulnerables, no solo a la propiedad privada.",
    "TRAMPAS DE OPINIÓN: El ICFES te pondrá opciones que suenan 'muy éticas' o 'solidarias'. Si la opción no se basa en el texto o la ley, es una trampa mortal.",
    "GEOGRAFÍA Y GENTRIFICACIÓN: Cuando las familias ricas migran a las afueras, el centro suele sufrir deterioro o se comercializa. Cuando vuelven al centro, encarecen el costo de vida (Gentrificación).",
    "ECONOMÍA Y GLOBALIZACIÓN: El libre comercio elimina barreras (aranceles), pero puede quebrar la industria nacional si los productores locales no pueden competir con precios extranjeros.",
    "RAMAS DEL PODER: El Congreso (Legislativa) hace las leyes. El Presidente (Ejecutiva) administra. Las Cortes (Judicial) castigan y protegen la Constitución.",
    "DERECHOS COLECTIVOS: Si el problema afecta a un barrio entero (ej. contaminación de un río), se usa una Acción Popular, NO una Acción de Tutela.",
    "TRAMPA DE GENERALIZACIÓN: Desconfía de respuestas que digan 'Todos los políticos son corruptos' o 'Siempre los pobres tienen la razón'. Las ciencias sociales no son absolutas.",
    "CONFLICTO ARMADO COLOMBIANO: Comprende la diferencia entre actores: Guerrillas (extrema izquierda, buscan toma del poder) y Paramilitares (extrema derecha, originados como anti-subversivos).",
    "ESTADO DE EXCEPCIÓN: Solo el Presidente, con firma de sus ministros, puede declarar estados de emergencia, conmoción interior o guerra exterior.",
    "DERECHOS DE SEGUNDA GENERACIÓN: Son los Derechos Económicos, Sociales y Culturales (DESC). Requieren inversión del Estado (educación, vivienda, pensiones).",
    "IMPACTO AMBIENTAL: El desarrollo económico infinito choca lógicamente con un planeta de recursos finitos. Identifica esa tensión en las preguntas ecológicas.",
    "SESGOS HISTÓRICOS: Al analizar un discurso histórico, fíjate en quién lo emite. Un discurso imperialista siempre justificará la conquista como 'civilizadora'.",
    "CONTROL CONSTITUCIONAL: La Corte Constitucional tiene el poder supremo de tumbar una ley si esta viola la Constitución de 1991. Nadie está por encima de la Carta Magna.",
    "TRAMPAS POPULISTAS: Opciones como 'Darle pena de muerte a todos los delincuentes' violan la Constitución Colombiana, por lo tanto, siempre serán opciones incorrectas en el ICFES.",
    "INFLACIÓN Y TASAS DE INTERÉS: Si hay mucha inflación (todo sube de precio), el Banco de la República sube las tasas de interés para que la gente deje de endeudarse y gastar.",
    "DESPLAZAMIENTO FORZADO: La principal causa histórica en Colombia ha sido la disputa territorial y el control de tierras productivas por parte de actores armados ilegales.",
    "ESTADO LAICO: Según la Constitución del 91, Colombia no tiene religión oficial. Todas las religiones tienen igualdad ante la ley. Ninguna opción puede favorecer una iglesia."
  ],
  en: [
    "MULTIPERSPECTIVISM: In a social problem (e.g., a mine vs. a moor), NEVER judge what is good or bad. Ask: Which actor loses and which gains?",
    "ACCIÓN DE TUTELA: Use it ONLY when a Fundamental Right (Life, Health, Freedom) is at imminent risk.",
    "PARTICIPATION MECHANISMS: A Plebiscite is called by the President. A Referendum approves or repeals laws. Popular Consultation is local.",
    "1991 CONSTITUTION: Colombia is a 'Social' State of Law, meaning the State MUST protect the vulnerable, not just private property.",
    "OPINION TRAPS: ICFES will give you options that sound 'ethical' or 'solidary'. If it's not based on the text/law, it's a deadly trap.",
    "GENTRIFICATION: When rich families return to the city center, the cost of living increases, displacing poor people (Gentrification).",
    "GLOBALIZATION: Free trade eliminates tariffs, but it can ruin national industry if local producers cannot compete with foreign prices.",
    "BRANCHES OF POWER: Congress (Legislative) makes laws. President (Executive) administers. Courts (Judicial) punish and protect the Constitution.",
    "COLLECTIVE RIGHTS: If a problem affects a whole neighborhood (e.g., river pollution), use a Popular Action, NOT a Tutela.",
    "GENERALIZATION TRAPS: Distrust answers saying 'All politicians are corrupt'. Social sciences avoid absolute extremes.",
    "COLOMBIAN CONFLICT: Understand actors: Guerrillas (far-left, seek power) vs. Paramilitaries (far-right, anti-subversive origins).",
    "STATE OF EXCEPTION: Only the President, with ministers' signatures, can declare states of emergency or war.",
    "SECOND-GEN RIGHTS: Economic, Social, and Cultural Rights (DESC). They require State investment (education, housing).",
    "ENVIRONMENTAL IMPACT: Infinite economic growth logically clashes with finite planet resources. Spot this tension.",
    "HISTORICAL BIAS: When analyzing a historical speech, notice who says it. Imperialists will always justify conquest as 'civilizing'.",
    "CONSTITUTIONAL CONTROL: The Constitutional Court can strike down any law that violates the 1991 Constitution.",
    "POPULIST TRAPS: Options like 'Death penalty for all criminals' violate the Colombian Constitution and are always incorrect in the ICFES.",
    "INFLATION: If inflation is high, the Central Bank raises interest rates so people stop borrowing and spending.",
    "FORCED DISPLACEMENT: The main historical cause in Colombia is territorial dispute and control of productive lands by illegal armed groups.",
    "SECULAR STATE: Per the '91 Constitution, Colombia has no official religion. All are equal before the law."
  ],
  fr: [
    "MULTIPERSPECTIVISME : Face à un problème social, ne jugez pas le bien ou le mal. Demandez-vous : Quel acteur gagne et qui perd ?",
    "ACCIÓN DE TUTELA : Utilisez-la UNIQUEMENT lorsqu'un droit fondamental (Vie, Santé) est en danger imminent.",
    "MÉCANISMES DE PARTICIPATION : Le Plébiscite est convoqué par le Président. Le Référendum approuve ou abroge les lois.",
    "CONSTITUTION DE 1991 : La Colombie est un État 'Social' de Droit, obligeant l'État à protéger les plus vulnérables.",
    "PIÈGES D'OPINION : Les options 'éthiques' ou 'morales' non fondées sur la loi sont des pièges mortels.",
    "GENTRIFICATION : Le retour des riches au centre-ville augmente le coût de la vie et déplace les pauvres.",
    "MONDIALISATION : Le libre-échange élimine les droits de douane mais peut ruiner l'industrie nationale non compétitive.",
    "SÉPARATION DES POUVOIRS : Le Congrès fait les lois. Le Président administre. La Cour protège la Constitution.",
    "DROITS COLLECTIFS : Pour un problème de quartier (pollution), on utilise l'Action Populaire, PAS la Tutela.",
    "PIÈGES DE GÉNÉRALISATION : Méfiez-vous des réponses absolues comme 'Tous les politiciens sont corrompus'.",
    "CONFLIT COLOMBIEN : Différenciez Guérillas (extrême gauche) et Paramilitaires (extrême droite anti-subversive).",
    "ÉTAT D'URGENCE : Seul le Président peut déclarer des états d'exception.",
    "DROITS DE SECONDE GÉNÉRATION : Droits économiques et sociaux. Ils nécessitent des investissements de l'État.",
    "IMPACT ENVIRONNEMENTAL : La croissance économique infinie heurte les ressources finies de la planète.",
    "BIAIS HISTORIQUE : Un discours impérialiste justifiera toujours la conquête comme 'civilisatrice'.",
    "CONTRÔLE CONSTITUTIONNEL : La Cour Constitutionnelle a le pouvoir suprême d'annuler les lois illégales.",
    "PIÈGES POPULISTES : La peine de mort viole la Constitution colombienne, donc cette option est toujours fausse.",
    "INFLATION : Si l'inflation est élevée, la Banque Centrale augmente les taux d'intérêt.",
    "DÉPLACEMENT FORCÉ : La cause principale est la dispute territoriale par des groupes armés illégaux.",
    "ÉTAT LAÏQUE : La Colombie n'a pas de religion officielle. Toutes sont égales devant la loi."
  ],
  de: [
    "MULTIPERSPEKTIVISMUS: Urteilen Sie bei sozialen Problemen nie, was gut oder schlecht ist. Fragen Sie: Wer gewinnt, wer verliert?",
    "ACCIÓN DE TUTELA: NUR verwenden, wenn ein Grundrecht (Leben, Gesundheit) in unmittelbarer Gefahr ist.",
    "PARTIZIPATION: Plebiszit wird vom Präsidenten einberufen. Referendum ändert Gesetze.",
    "VERFASSUNG 1991: Kolumbien ist ein 'sozialer' Rechtsstaat; der Staat muss die Schwächsten schützen.",
    "MEINUNGSFALLEN: Optionen, die nur 'moralisch' klingen, ohne rechtliche Basis, sind tödliche Fallen im ICFES.",
    "GENTRIFIZIERUNG: Wenn Reiche ins Zentrum ziehen, steigen die Lebenshaltungskosten und verdrängen Arme.",
    "GLOBALISIERUNG: Freihandel beseitigt Zölle, kann aber die schwache heimische Industrie ruinieren.",
    "GEWALTENTEILUNG: Kongress macht Gesetze. Präsident verwaltet. Gerichte schützen die Verfassung.",
    "KOLLEKTIVRECHTE: Bei Nachbarschaftsproblemen (z. B. Flussverschmutzung) nutzt man die 'Acción Popular', nicht die Tutela.",
    "VERALLGEMEINERUNGEN: Misstrauen Sie extremen Aussagen wie 'Alle Politiker sind korrupt'.",
    "KOLUMBIANISCHER KONFLIKT: Guerillas (extreme Linke) vs. Paramilitärs (extreme Rechte).",
    "AUSNAHMEZUSTAND: Nur der Präsident kann den Ausnahmezustand ausrufen.",
    "RECHTE DER ZWEITEN GENERATION: Wirtschaftliche und soziale Rechte erfordern staatliche Investitionen.",
    "UMWELTAUSWIRKUNGEN: Unendliches Wirtschaftswachstum kollidiert mit endlichen planetaren Ressourcen.",
    "HISTORISCHER BIAS: Ein imperialistischer Diskurs rechtfertigt Eroberung immer als 'zivilisierend'.",
    "VERFASSUNGSGERICHT: Es hat die höchste Macht, jedes verfassungswidrige Gesetz aufzuheben.",
    "POPULISMUS-FALLEN: Die Todesstrafe verstößt gegen die kolumbianische Verfassung und ist immer falsch.",
    "INFLATION: Bei hoher Inflation erhöht die Zentralbank die Zinsen, um den Konsum zu bremsen.",
    "VERTREIBUNG: Die Hauptursache in Kolumbien ist der territoriale Kampf bewaffneter Gruppen.",
    "SÄKULARER STAAT: Kolumbien hat keine offizielle Religion. Alle sind vor dem Gesetz gleich."
  ]
};

/* ============================================================
   🎥 6. COMPONENTE DE CARGA HOLOGRÁFICA (ESTÁTICA PARA LECTURA)
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
        <div style={{ position:'absolute', inset:0, zIndex:3000, background:'#050010', display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center', padding:'clamp(20px, 5vw, 40px)', textAlign: 'center', boxSizing: 'border-box' }}>
            <div className="loader-ring" style={{ width: 'clamp(50px, 8vw, 80px)', height: 'clamp(50px, 8vw, 80px)', border: '5px solid #111', borderTop: '5px solid #ffaa00', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '30px' }}></div>
            <h1 className="hud-pulse" style={{color:'#ffaa00', fontSize:'clamp(16px, 4vw, 40px)', textShadow:'0 0 30px #ffaa00', margin: '0 0 30px 0', letterSpacing: '2px', lineHeight: '1.4'}}>{loadingText}</h1>
            
            <div style={{ background: 'rgba(255, 170, 0, 0.1)', borderLeft: '4px solid #ffaa00', padding: 'clamp(15px, 4vw, 30px)', maxWidth: '800px', width: '100%', borderRadius: '0 10px 10px 0', position: 'relative', overflow: 'hidden', boxSizing: 'border-box' }}>
                <div style={{ color: '#ffaa00', fontSize: 'clamp(12px, 3vw, 16px)', fontWeight: 'bold', marginBottom: '15px', textTransform: 'uppercase' }}>💡 CIUDADANÍA TIP</div>
                <div style={{ color: '#fff', fontSize: 'clamp(14px, 3.5vw, 24px)', minHeight: '120px', transition: 'opacity 0.5s ease', lineHeight: '1.5' }}>
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
   🎥 7. NÚCLEO 3D AVANZADO (ESTÁTICO SIN DISTRACCIONES)
============================================================ */
const Core3D = ({ isExploding, scannerActive, isLoading }) => {
  const scanPlaneRef = useRef();

  useFrame((state) => {
    // Cámara estática para facilitar la lectura sin distracciones
    state.camera.position.lerp(new THREE.Vector3(0, 0, 28), 0.1);
    state.camera.lookAt(0, 0, 0);
    
    if (scannerActive && scanPlaneRef.current) {
        scanPlaneRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 5;
    }
  });

  return (
    <>
      <ambientLight intensity={1.5} />
      {/* Estrellas de fondo quietas, para ambiente sin mover los ojos */}
      <Stars count={2000} factor={4} fade speed={0} />
      
      {scannerActive && (
         <mesh ref={scanPlaneRef} rotation={[-Math.PI/2, 0, 0]}>
            <planeGeometry args={[50, 50]} />
            <meshBasicMaterial color="#ffaa00" transparent opacity={0.05} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} depthWrite={false} />
         </mesh>
      )}
      
      <EffectComposer>
        {isExploding && <ChromaticAberration offset={VECTOR_EXP} />}
        <Scanline opacity={0.15} density={2.5} />
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
        parsed = parsed.replace(/### (.*)/g, '<h3 style="color:#0055ff; margin-top:clamp(20px, 4vw, 30px); border-bottom:1px solid #0055ff; padding-bottom:5px; font-size: clamp(20px, 4.5vw, 30px);">$1</h3>');
        parsed = parsed.replace(/## (.*)/g, '<h2 style="color:#ffaa00; margin-top:clamp(15px, 3vw, 25px); font-size: clamp(22px, 5vw, 34px);">$1</h2>');
        parsed = parsed.replace(/\*\*(.*?)\*\*/g, '<strong style="color:#00f2ff;">$1</strong>');
        parsed = parsed.replace(/\\n/g, '<br/>'); 
        parsed = parsed.replace(/\n/g, '<br/>'); 
        return { __html: parsed };
    }, [text]);

    return <div dangerouslySetInnerHTML={htmlContent} style={{ color: '#fff', fontSize: 'clamp(16px, 4vw, 26px)', lineHeight: '1.7', fontFamily: 'sans-serif' }} />;
};

const SocraticMasterclass = ({ topic, lang, onBack, onClose, UI, onSave, preloadedData, customBackText }) => {
    const [classData, setClassData] = useState(preloadedData || null);
    const [isGenerating, setIsGenerating] = useState(!preloadedData);
    const [loadText, setLoadText] = useState("> ESTABLECIENDO CONEXIÓN LEGISLATIVA DEEPSEEK...");
    
    const loadClass = useCallback(async () => {
        if (preloadedData) return; 
        let isMounted = true;
        setIsGenerating(true);

        const t1 = setTimeout(() => { if(isMounted) setLoadText("> ANALIZANDO VULNERABILIDADES CIUDADANAS EN: " + topic.replace(/_/g, ' ')); }, 3000);
        const t2 = setTimeout(() => { if(isMounted) setLoadText("> SINTETIZANDO CONSTITUCIÓN POLÍTICA Y DERECHOS..."); }, 6000);
        const t3 = setTimeout(() => { if(isMounted) setLoadText("> GENERANDO CONFLICTO SOCIAL DE ALTA COMPLEJIDAD..."); }, 10000);
        const t4 = setTimeout(() => { if(isMounted) setLoadText("> COMPILANDO MÚLTIPLES PERSPECTIVAS (ÚLTIMA FASE)..."); }, 15000);

        try {
            const content = await DeepSeekEngine.generateMasterclass(topic, lang);
            if (isMounted) {
                setClassData(content);
                setIsGenerating(false);
                sfx.success();
                if (onSave) onSave(topic, lang, content); 
            }
        } catch (err) {
            console.warn("DeepSeek Fallback Sociales en Masterclass.", err);
            if (isMounted) {
                const fallbackClass = IcfesEngine.generateLocalMasterclass(topic, lang);
                setClassData(fallbackClass);
                setIsGenerating(false);
                sfx.success();
                if (onSave) onSave(topic, lang, fallbackClass); 
            }
        }
            
        return () => { 
            isMounted = false; 
            clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4);
        };
    }, [topic, lang, preloadedData, onSave]);

    useEffect(() => {
        const cleanup = loadClass();
        return () => { if (cleanup && cleanup.then) cleanup.then(c => { if (c) c() }); };
    }, [loadClass]);

    const downloadMasterclassPDF = useCallback(() => {
        if (!classData) return;
        sfx.scanSweep();
        const date = new Date().toLocaleString();
        
        const printWindow = window.open('', '', 'height=900,width=850');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html lang="${lang}">
                <head>
                    <title>Learning Labs - Masterclass: ${classData.title}</title>
                    <style>
                        @import url('https://fonts.googleapis.com/css2?family=Merriweather:ital,wght@0,300;0,700;1,300&family=Inter:wght@400;700;900&display=swap');
                        body { font-family: 'Merriweather', serif; background-color: #ffffff; color: #1e293b; margin: 0; padding: 0; line-height: 1.6; }
                        .container { max-width: 800px; margin: 0 auto; padding: 40px; }
                        .header { display: flex; align-items: center; border-bottom: 4px solid #ffaa00; padding-bottom: 20px; margin-bottom: 30px; font-family: 'Inter', sans-serif; }
                        .logo { width: 120px; height: auto; margin-right: 20px; }
                        .title h1 { margin: 0 0 5px 0; color: #0f172a; font-size: 24px; font-weight: 900; text-transform: uppercase; }
                        .title p { margin: 0; color: #64748b; font-size: 14px; font-weight: 700; }
                        .timestamp { margin-top: 5px; display: inline-block; background: #f1f5f9; padding: 4px 8px; border-radius: 4px; font-size: 11px; color: #475569; font-weight: bold; }
                        
                        .section-title { font-family: 'Inter', sans-serif; font-size: 18px; font-weight: 900; color: #0055ff; text-transform: uppercase; margin-top: 30px; border-bottom: 2px solid #e2e8f0; padding-bottom: 5px; margin-bottom: 15px; }
                        .section-title.trap { color: #ef4444; border-bottom-color: #ef4444; }
                        .section-title.protocol { color: #d97706; border-bottom-color: #d97706; }
                        
                        .content-box { background: #f8fafc; border-left: 4px solid #0055ff; padding: 15px 20px; margin-bottom: 20px; border-radius: 0 8px 8px 0; font-size: 15px; }
                        .content-box.trap { border-left-color: #ef4444; background: #fef2f2; }
                        .content-box.protocol { border-left-color: #d97706; background: #fffbeb; }
                        
                        .sim-box { border: 2px solid #ffaa00; border-radius: 12px; padding: 25px; margin-top: 40px; page-break-inside: avoid; }
                        .sim-title { font-family: 'Inter', sans-serif; font-size: 20px; font-weight: 900; color: #0f172a; text-align: center; margin-top: 0; }
                        .sim-text { font-style: italic; color: #334155; margin-bottom: 20px; white-space: pre-wrap; background: #f1f5f9; padding: 15px; border-radius: 6px; }
                        .options { margin-bottom: 20px; }
                        .option { padding: 12px 15px; border: 1px solid #cbd5e1; margin-bottom: 10px; border-radius: 6px; font-family: 'Inter', sans-serif; font-size: 14px; }
                        .option.correct { border-color: #10b981; background: #ecfdf5; color: #065f46; font-weight: bold; }
                        
                        .analysis-box { background: #f0fdfa; border-left: 4px solid #10b981; padding: 15px 20px; margin-top: 20px; font-size: 15px; color: #064e3b; }
                        
                        .footer { text-align: center; margin-top: 50px; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 15px; font-family: 'Inter', sans-serif; }
                        strong { color: #000; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <img src="https://res.cloudinary.com/dukiyxfvn/image/upload/v1768668244/WhatsApp_Image_2026-01-11_at_4.25.52_PM_p8aicp.jpg" class="logo" alt="Learning Labs" />
                            <div class="title">
                                <h1>IA MASTERCLASS: ${classData.title}</h1>
                                <p>SISTEMA GENERATIVO DEEPSEEK - LEARNING LABS</p>
                                <div class="timestamp">Generado: ${date}</div>
                            </div>
                        </div>

                        <div class="section-title">${UI.pdfTitleTheory || 'NÚCLEO TEÓRICO'}</div>
                        <div class="content-box">
                            ${classData.theory.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}
                        </div>

                        <div class="section-title trap">${UI.pdfTitleTrap || 'TRAMPA COGNITIVA'}</div>
                        <div class="content-box trap">
                            ${classData.trap.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}
                        </div>

                        <div class="section-title protocol">PROTOCOLO DE RESOLUCIÓN</div>
                        <div class="content-box protocol">
                            ${classData.protocol.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}
                        </div>

                        ${classData.demoQuestion ? `
                        <div class="sim-box">
                            <h3 class="sim-title">${UI.pdfTitleSim || 'SIMULACIÓN'}</h3>
                            <div class="sim-text">${classData.demoQuestion.text}</div>
                            <div class="options">
                                ${classData.demoQuestion.options.map((opt, i) => `
                                    <div class="option ${i === classData.demoQuestion.correctIdx ? 'correct' : ''}">
                                        ${String.fromCharCode(65 + i)}. ${opt} ${i === classData.demoQuestion.correctIdx ? '✓ (Correcta)' : ''}
                                    </div>
                                `).join('')}
                            </div>
                            <div class="analysis-box">
                                <strong>${UI.pdfTitleAnalysis || 'ANÁLISIS'}:</strong><br/><br/>
                                ${classData.demoQuestion.analysis.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}
                            </div>
                        </div>
                        ` : ''}

                        <div class="footer">
                            LEARNING LABS ENGINE V27.0<br/>El conocimiento es la única ventaja inquebrantable.
                        </div>
                    </div>
                </body>
            </html>
        `);
        printWindow.document.close();
        setTimeout(() => { printWindow.focus(); printWindow.print(); }, 750);
    }, [classData, lang, UI]);

    if (isGenerating) {
        return (
            <div style={{ padding: 'clamp(30px, 6vw, 60px) clamp(10px, 3vw, 20px)', textAlign: 'left', minHeight: '60vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ color: '#0f0', fontFamily: 'monospace', fontSize: 'clamp(14px, 3vw, 24px)', lineHeight: '2' }}>
                    <p className="hud-pulse" style={{marginBottom: '20px', color: '#ffaa00', fontSize: 'clamp(18px, 4vw, 30px)', fontWeight: 'bold'}}>{loadText}</p>
                    <p style={{color: '#aaa', opacity: 0.8}}>_ Operación: Socratic Society Overdrive</p>
                    <p style={{color: '#aaa', opacity: 0.8}}>_ Destino: Neural Net DeepSeek-Chat</p>
                    <p style={{color: '#aaa', opacity: 0.8}}>_ Status: Aguardando carga territorial (Payload)...</p>
                </div>
            </div>
        );
    }

    if (!classData) return null;

    return (
        <div style={{ padding: 'clamp(10px, 3vw, 30px)', width: '100%', boxSizing: 'border-box' }}>
           <h2 style={{color:'#ffaa00', fontSize:'clamp(20px, 5vw, 45px)', textAlign:'center', borderBottom:'3px solid #ffaa00', paddingBottom:'20px', marginTop: 0, textTransform: 'uppercase'}}>🎓 {classData.title || topic.replace(/_/g, ' ')}</h2>
           
           <div style={{ display: 'grid', gap: 'clamp(20px, 4vw, 30px)', marginTop: '40px' }}>
              <div style={{ borderLeft: '6px solid #0055ff', padding: 'clamp(15px, 3vw, 30px)', background: 'rgba(0,85,255,0.05)', borderRadius: '0 15px 15px 0' }}>
                 <h3 style={{color: '#0055ff', marginTop: 0, fontSize: 'clamp(20px, 4.5vw, 30px)', display: 'flex', alignItems: 'center', gap:'10px'}}>📚 CONSTITUCIÓN Y ANÁLISIS SOCIAL</h3>
                 <MarkdownParser text={classData.theory} />
              </div>
              
              <div style={{ borderLeft: '6px solid #f00', padding: 'clamp(15px, 3vw, 30px)', background: 'rgba(255,0,0,0.05)', borderRadius: '0 15px 15px 0' }}>
                 <h3 style={{color: '#f00', marginTop: 0, fontSize: 'clamp(20px, 4.5vw, 30px)', display: 'flex', alignItems: 'center', gap:'10px'}}>⚠️ TRAMPA IDEOLÓGICA ICFES</h3>
                 <MarkdownParser text={classData.trap} />
              </div>

              <div style={{ borderLeft: '6px solid #ffea00', padding: 'clamp(15px, 3vw, 30px)', background: 'rgba(255,234,0,0.05)', borderRadius: '0 15px 15px 0' }}>
                 <h3 style={{color: '#ffea00', marginTop: 0, fontSize: 'clamp(20px, 4.5vw, 30px)', display: 'flex', alignItems: 'center', gap:'10px'}}>⚙️ PROTOCOLO MULTIPERSPECTIVISMO</h3>
                 <MarkdownParser text={classData.protocol} />
              </div>
           </div>

           {classData.demoQuestion && (
               <div style={{ marginTop: 'clamp(30px, 6vw, 50px)', border: '3px solid #ffaa00', borderRadius: '15px', padding: 'clamp(15px, 4vw, 40px)', background: 'rgba(20,10,0,0.95)', boxShadow: '0 0 40px rgba(255,170,0,0.15)', boxSizing: 'border-box' }}>
                   <h3 style={{color: '#ffaa00', textAlign: 'center', marginTop: 0, fontSize: 'clamp(22px, 5vw, 32px)'}}>⚖️ SIMULACIÓN DE CONFLICTO SOCIAL</h3>
                   <p style={{color: '#aaa', fontSize: 'clamp(12px, 3vw, 16px)', textAlign: 'center', fontStyle: 'italic', marginBottom:'30px'}}>Este escenario sociopolítico ha sido generado en tiempo real. Jamás se repetirá.</p>
                   
                   <div style={{ color: '#fff', fontSize: 'clamp(18px, 4.5vw, 30px)', lineHeight: '1.7', background: 'rgba(255,255,255,0.05)', padding: 'clamp(15px, 3vw, 30px)', borderRadius: '10px', whiteSpace: 'pre-wrap' }}>
                       {classData.demoQuestion.text}
                   </div>
                   
                   <div style={{ marginTop: '30px', display: 'flex', flexDirection: 'column', gap: 'clamp(15px, 3vw, 20px)' }}>
                      {classData.demoQuestion.options.map((opt, idx) => {
                          const isCorrect = idx === classData.demoQuestion.correctIdx;
                          return (
                              <div key={idx} style={{ padding: 'clamp(15px, 3vw, 25px)', border: isCorrect ? '3px solid #ffaa00' : '2px solid #333', background: isCorrect ? 'rgba(255,170,0,0.1)' : 'transparent', color: isCorrect ? '#ffaa00' : '#aaa', borderRadius: '10px', fontSize: 'clamp(16px, 4vw, 25px)', fontWeight: isCorrect ? 'bold' : 'normal', wordWrap: 'break-word', minHeight: '80px', display: 'flex', alignItems: 'center' }}>
                                  {String.fromCharCode(65 + idx)}. {opt} {isCorrect && " ➔ (Respuesta Correcta)"}
                              </div>
                          );
                      })}
                   </div>
                   
                   <div style={{ marginTop: '30px', padding: 'clamp(15px, 3vw, 30px)', background: 'rgba(255,170,0,0.05)', color: '#ffaa00', borderRadius: '10px', borderLeft: '6px solid #ffaa00', fontSize: 'clamp(16px, 4vw, 26px)', lineHeight: '1.8' }}>
                       <strong style={{fontSize: 'clamp(20px, 4.5vw, 30px)'}}>VEREDICTO CONSTITUCIONAL:</strong><br/><br/>
                       <MarkdownParser text={classData.demoQuestion.analysis} />
                   </div>
               </div>
           )}

           <div style={{display:'flex', gap:'20px', marginTop:'60px', flexWrap: 'wrap'}}>
               <button className="hud-btn" style={{flex: '1 1 100%', background:'transparent', border:'2px solid #ffaa00', color:'#ffaa00', boxShadow: 'none', fontSize: 'clamp(14px, 3vw, 20px)', padding: 'clamp(15px, 3vw, 25px)'}} onClick={downloadMasterclassPDF}>{UI.downloadMasterclassBtn || '📄 DESCARGAR MASTERCLASS'}</button>
               <button className="hud-btn" style={{flex: '1 1 100%', background:'#555', color:'#fff', boxShadow: 'none', fontSize: 'clamp(16px, 3vw, 22px)', padding: 'clamp(15px, 3vw, 25px)'}} onClick={onBack}>{customBackText || "VOLVER A DOMINIOS"}</button>
               <button className="hud-btn" style={{flex: '1 1 100%', background:'#ffaa00', color:'#000', boxShadow: '0 0 30px rgba(255,170,0,0.5)', fontSize: 'clamp(16px, 3vw, 22px)', padding: 'clamp(15px, 3vw, 25px)'}} onClick={onClose}>{UI.aiClose}</button>
           </div>
        </div>
    )
}

/* ============================================================
   🎮 9. APLICACIÓN PRINCIPAL LECTURA (PHANTOM QUEUE Y CICLO)
============================================================ */

const getInitialStats = () => {
  if (typeof window !== 'undefined') {
    const saved = window.localStorage.getItem('icfes_sociales_telemetry_v1'); 
    if (saved) return JSON.parse(saved);
  }
  return {
      totalQ: 0, correctQ: 0, totalTime: 0,
      topics: {
          'COMPETENCIAS_CIUDADANAS_Y_CONSTITUCION': { c: 0, w: 0 },
          'HISTORIA_DE_COLOMBIA_Y_CONFLICTO': { c: 0, w: 0 },
          'GEOGRAFIA_Y_ORDENAMIENTO_TERRITORIAL': { c: 0, w: 0 },
          'ECONOMIA_Y_GLOBALIZACION': { c: 0, w: 0 },
          'DERECHOS_HUMANOS_Y_TUTELA': { c: 0, w: 0 },
          'MECANISMOS_DE_PARTICIPACION': { c: 0, w: 0 },
          'MULTIPERSPECTIVISMO_Y_ACTORES_SOCIALES': { c: 0, w: 0 },
          'IMPACTO_AMBIENTAL_Y_SOCIEDAD': { c: 0, w: 0 }
      },
      needsReview: [] 
  };
};

function GameApp() {
  const { language } = useGameStore() || { language: "es" };
  const safeLang = DICT_UI[language] ? language : 'es';
  const UI = DICT_UI[safeLang];
  const REPORT_UI = DICT_REPORT[safeLang] || DICT_REPORT['es'];

  const MAX_TIME = 240; 
  const WARMUP_TIME = 240; 

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
  
  // 📚 SISTEMA DE HISTORIAL DE CLASES (CORREGIDO)
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState(null);
  const [classHistory, setClassHistory] = useState(() => {
      if (typeof window !== 'undefined') {
          const saved = window.localStorage.getItem('icfes_sociales_history_v1');
          if (saved) return JSON.parse(saved);
      }
      return [];
  });

  const [previousPhase, setPreviousPhase] = useState("BOOT"); 
  const [savedTime, setSavedTime] = useState(MAX_TIME);
  
  const [stats, setStats] = useState(getInitialStats);

  const failedTopics = useMemo(() => {
      return Object.keys(stats.topics).filter(topicId => stats.topics[topicId].w > 0);
  }, [stats]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('icfes_sociales_telemetry_v1', JSON.stringify(stats));
    }
  }, [stats]);

  const currentQ = useMemo(() => {
      if (!currentQData) return null;
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
          console.warn("AI Fallback Sociales: Generando conflicto algorítmico de respaldo.");
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
          setShowHistoryModal(false);
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
      setShowHistoryModal(false);
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
                  <title>Learning Labs - Social Report</title>
                  <style>
                      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
                      body { font-family: 'Inter', sans-serif; background-color: #ffffff; color: #0f172a; margin: 0; padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                      .container { max-width: 800px; margin: 0 auto; padding: 40px; }
                      .header { display: flex; align-items: center; border-bottom: 4px solid #ffaa00; padding-bottom: 30px; margin-bottom: 40px; }
                      .logo { width: 140px; height: auto; margin-right: 30px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
                      .title h1 { margin: 0 0 5px 0; color: #0f172a; font-size: 32px; font-weight: 900; letter-spacing: -0.5px; text-transform: uppercase; }
                      .title p { margin: 0; color: #64748b; font-size: 15px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; }
                      .timestamp { margin-top: 10px; display: inline-block; background: #f1f5f9; padding: 5px 10px; border-radius: 4px; font-size: 12px; color: #475569; font-weight: bold; }
                      .section-title { font-size: 20px; font-weight: 900; color: #0f172a; text-transform: uppercase; margin-bottom: 20px; display: flex; align-items: center; }
                      .section-title::before { content: ''; display: inline-block; width: 12px; height: 12px; background-color: #ffaa00; margin-right: 10px; border-radius: 2px; }
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

  // 🟢 FUNCIÓN L8: GUARDAR MASTERCLASS EN EL HISTORIAL (AHORA SÍ FUNCIONA PERFECTO)
  const saveToHistory = useCallback((topic, lang, content) => {
      setClassHistory(prev => {
          const newRecord = {
              id: Date.now(),
              date: new Date().toLocaleString(),
              topic,
              lang,
              classData: content
          };
          const updated = [newRecord, ...prev];
          window.localStorage.setItem('icfes_sociales_history_v1', JSON.stringify(updated));
          return updated;
      });
  }, []);

  return (
    <>
      <style>{`
        * { -webkit-tap-highlight-color: transparent; }
        .hud-btn { padding: clamp(12px, 3vw, 20px) clamp(15px, 4vw, 40px); background: #ffaa00; color: #000; font-weight: 900; font-size: clamp(16px, 4vw, 26px); cursor: pointer; border-radius: 8px; border: none; font-family: 'Orbitron', monospace; transition: 0.2s; box-shadow: 0 0 20px rgba(255,170,0,0.4); text-transform: uppercase; user-select: none; }
        .hud-btn:hover { transform: scale(1.02); }
        .hud-btn:disabled { background: #555; color:#888; box-shadow: none; cursor:not-allowed; transform: none; }
        .opt-btn { display: block; width: 100%; margin: 10px 0; padding: clamp(15px, 4vw, 25px); background: rgba(0,20,40,0.8); border: 2px solid #555; color: #fff; font-size: clamp(16px, 4vw, 25px); border-radius: 10px; cursor: pointer; text-align: left; transition: 0.2s; font-family: 'Orbitron'; line-height: 1.6; user-select: none; min-height: 80px; }
        .opt-btn:hover { background: rgba(255,255,255,0.1); border-color: #aaa; }
        .opt-btn.selected { border-color: #00f2ff; background: rgba(0,242,255,0.2); box-shadow: 0 0 20px rgba(0,242,255,0.4); color: #00f2ff; }
        .glass-panel { background: rgba(10,5,0,0.85); border: 2px solid #ffaa00; backdrop-filter: blur(20px); border-radius: 15px; box-shadow: 0 0 40px rgba(255,170,0,0.15); padding: clamp(15px, 4vw, 40px); box-sizing: border-box; }
        .hud-pulse { animation: pulse 1s infinite; }
        @keyframes pulse { 0% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.02); opacity: 0.8; } 100% { transform: scale(1); opacity: 1; } }
        
        .timer-danger { background: #ffaa00 !important; }
        .timer-critical { background: #f00 !important; animation: shake 0.5s infinite; }
        @keyframes shake { 0% { transform: translateX(0); } 25% { transform: translateX(-3px); } 50% { transform: translateX(3px); } 75% { transform: translateX(-3px); } 100% { transform: translateX(0); } }

        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: rgba(0,0,0,0.5); border-radius: 10px; }
        ::-webkit-scrollbar-thumb { background: rgba(255,170,0,0.4); border-radius: 10px; }
      `}</style>
      
      <main style={{ position:'absolute', inset:0, overflow:'hidden', background:'#000', fontFamily:'Orbitron, sans-serif', padding: 'env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)', boxSizing: 'border-box' }}>
        
        {/* PANTALLA DE CARGA IA */}
        {phase === "LOADING" && (
            <QuantumIntermission lang={safeLang} loadingText={UI.loadingData} />
        )}

        {/* PANTALLA INICIAL Y TEORÍA */}
        {(phase === "BOOT" || phase === "THEORY") && (
          <section style={{ position:'absolute', inset:0, zIndex:3000, background:'#000510', display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center', padding:'clamp(15px, 4vw, 20px)', boxSizing: 'border-box' }}>
            <h1 style={{color:'#ffaa00', fontSize:'clamp(30px, 8vw, 80px)', textShadow:'0 0 40px #ffaa00', textAlign:'center', margin: '0 0 20px 0', lineHeight: '1.1'}}>{UI.title}</h1>
            {phase === "THEORY" && <p style={{color:'#fff', fontSize:'clamp(16px, 4vw, 26px)', maxWidth:'800px', textAlign:'center', marginBottom:'clamp(30px, 6vw, 40px)', lineHeight:'1.6', borderLeft: '4px solid #0055ff', paddingLeft: 'clamp(10px, 3vw, 20px)'}}>{UI.theoryText}</p>}
            
            <div style={{display:'flex', gap:'clamp(10px, 3vw, 20px)', flexWrap:'wrap', justifyContent:'center', width: '100%', maxWidth: '800px'}}>
                <button className="hud-btn" style={{flex: '1 1 250px'}} onClick={() => { if(phase === "BOOT") setPhase("THEORY"); else { generateNew(); } }}>{phase === "BOOT" ? UI.start : "EMPEZAR EVALUACIÓN"}</button>
                <button className="hud-btn" style={{flex: '1 1 250px', background:'rgba(30,10,0,0.8)', color:'#ffaa00', border:'2px solid #ffaa00'}} onClick={openTelemetry}>📊 {UI.statsBtn}</button>
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
                     <div className={stats.needsReview.includes(currentQData?.id) ? 'hud-pulse' : ''} style={{background: stats.needsReview.includes(currentQData?.id) ? '#ffea00' : '#ff0055', color: stats.needsReview.includes(currentQData?.id) ? '#000' : '#fff', padding:'clamp(6px, 2vw, 10px) clamp(10px, 3vw, 20px)', borderRadius:'8px', fontWeight:'bold', fontSize:'clamp(12px, 3vw, 18px)'}}>
                         {UI.topic}: {currentQData?.topic} {stats.needsReview.includes(currentQData?.id) ? ' ⚠️' : ''}
                     </div>
                  )}
                  {phase === "WARMUP" && (
                      <div className="hud-pulse" style={{background: '#ffaa00', color: '#000', padding:'clamp(6px, 2vw, 10px) clamp(10px, 3vw, 20px)', borderRadius:'8px', fontWeight:'bold', fontSize:'clamp(12px, 3vw, 18px)'}}>
                          {UI.warmupTitle}
                      </div>
                  )}
                  <div style={{color:'#0f0', fontWeight:'bold', fontSize:'clamp(16px, 4vw, 24px)'}}>XP: {xp}</div>
              </div>
              {phase !== "STATS" && phase !== "LOADING" && (
                 <button className="hud-btn" style={{background:'rgba(30,10,0,0.8)', color:'#ffaa00', border:'1px solid #ffaa00', padding:'8px 15px', fontSize:'clamp(10px, 2.5vw, 14px)', boxShadow:'none'}} onClick={openTelemetry}>📊 {UI.statsBtn}</button>
              )}
            </nav>

            {/* SEÑALADOR DE DEEPSEEK NEURAL MATRIX */}
            {phase === "GAME" && (
               <div style={{position: 'absolute', bottom: 'max(15px, env(safe-area-inset-bottom))', right: 'clamp(10px, 3vw, 15px)', color: currentQData?.isAi ? '#ff00ff' : '#0055ff', fontSize: 'clamp(8px, 2vw, 12px)', fontWeight: 'bold', zIndex: 100, textShadow: currentQData?.isAi ? '0 0 10px #ff00ff' : 'none', letterSpacing: '1px', textAlign: 'right'}}>
                  {currentQData?.isAi ? "🧠 DEEPSEEK SOCIO-MATRIX ACTIVE" : "⚙️ ALGORITHMIC FALLBACK ACTIVE"}
               </div>
            )}

            {/* BARRA DE PRESIÓN DE TIEMPO */}
            {(phase === "GAME" || phase === "WARMUP") && (
                <div style={{position:'absolute', top:'clamp(70px, calc(env(safe-area-inset-top) + 70px), 120px)', left:'50%', transform:'translateX(-50%)', width:'95%', maxWidth:'800px', zIndex:100, display:'flex', flexDirection:'column', alignItems:'center'}}>
                    {phase === "WARMUP" && <div style={{color: '#ffaa00', fontSize: 'clamp(12px, 3vw, 16px)', marginBottom: '5px', textAlign: 'center'}}>{UI.warmupSub}</div>}
                    <div style={{color: timeLeft > 30 ? '#ffaa00' : (timeLeft > 15 ? '#ffea00' : '#f00'), fontSize:'clamp(20px, 5vw, 32px)', fontWeight:'bold', marginBottom:'10px', textShadow: timeLeft <= 15 ? '0 0 10px #f00' : 'none'}} className={timeLeft <= 15 ? 'hud-pulse' : ''}>
                        {UI.time}: {Math.floor(timeLeft / 60)}:{('0' + (timeLeft % 60)).slice(-2)}
                    </div>
                    <div style={{width: '100%', height:'clamp(12px, 3vw, 18px)', background:'rgba(255,255,255,0.1)', borderRadius:'10px', overflow:'hidden', border: '1px solid #444'}}>
                        <div className={timeLeft <= 15 ? 'timer-critical' : (timeLeft <= 36 ? 'timer-danger' : '')} style={{width: `${(timeLeft/(phase === "WARMUP" ? WARMUP_TIME : MAX_TIME))*100}%`, height:'100%', background: phase === "WARMUP" ? '#ffea00' : '#ffaa00', borderRadius:'10px', transition:'width 1s linear, background 0.5s'}} />
                    </div>
                    
                    {!scannerActive && phase === "GAME" && (
                        <button className="hud-btn" style={{background:'rgba(0,85,255,0.1)', border:'1px solid #0055ff', color:'#0055ff', marginTop:'15px', fontSize:'clamp(12px, 3vw, 18px)', padding:'8px 15px', backdropFilter:'blur(10px)'}} onClick={toggleScanner}>
                            👁️ {UI.scan} (-50 XP)
                        </button>
                    )}
                </div>
            )}

            {/* PREGUNTA Y OPCIONES */}
            {(phase === "GAME" || phase === "WARMUP") && currentQ && (
              <div style={{ position:'absolute', top:'clamp(160px, 25vh, 220px)', left:'50%', transform:'translateX(-50%)', width: '95%', maxWidth:'1000px', zIndex:100, boxSizing: 'border-box' }}>
                <article className="glass-panel" style={{maxHeight:'82dvh', overflowY:'auto', borderColor: phase === "WARMUP" ? '#ffea00' : '#ffaa00'}}>
                  <h2 style={{color:'#fff', fontSize:'clamp(18px, 4.5vw, 30px)', lineHeight:'1.7', fontWeight:'normal', margin:0, whiteSpace: 'pre-wrap'}}>{currentQ.text}</h2>
                  
                  {scannerActive && (
                      <div className="hud-pulse" style={{background:'rgba(0,85,255,0.1)', borderLeft:'4px solid #0055ff', padding:'clamp(10px, 3vw, 15px)', margin:'15px 0', color:'#0055ff', fontSize:'clamp(14px, 3.5vw, 20px)', fontWeight:'bold'}}>
                          🤖 {UI.aiBtn}: {currentQ.hint}
                      </div>
                  )}

                  <div style={{marginTop:'clamp(15px, 4vw, 30px)'}}>
                      {currentQ.options.map((opt, i) => (
                          <button key={i} className={`opt-btn ${selectedOpt === i ? 'selected' : ''}`} onClick={() => {sfx.click(); setSelectedOpt(i);}}>
                              <span style={{fontWeight:'bold', marginRight:'clamp(5px, 2vw, 15px)', color: selectedOpt === i ? '#00f2ff' : '#ffaa00'}}>{String.fromCharCode(65 + i)}.</span> {opt}
                          </button>
                      ))}
                  </div>

                  <div style={{display:'flex', justifyContent:'center', marginTop:'clamp(20px, 5vw, 40px)'}}>
                      <button className="hud-btn" style={{width:'100%', height:'clamp(50px, 8vw, 80px)', fontSize:'clamp(14px, 4vw, 28px)', background: phase === "WARMUP" ? '#ffea00' : '#ffaa00'}} disabled={selectedOpt === null} onClick={submitAnswer}>{UI.btnCheck}</button>
                  </div>
                </article>
              </div>
            )}

            {/* OVERLAY: RESPUESTA CORRECTA */}
            {phase === "CORRECT" && (
              <section style={{ position:'absolute', inset:0, zIndex:2000, background:'rgba(0,20,40,0.95)', display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center', backdropFilter:'blur(10px)', padding:'clamp(15px, 4vw, 20px)', textAlign:'center', boxSizing: 'border-box' }}>
                  <h1 className="hud-pulse" style={{color:'#00f2ff', fontSize:'clamp(24px, 6vw, 80px)', textShadow:'0 0 40px #00f2ff', margin:0, lineHeight: 1.1}}>{UI.correctTitle}</h1>
                  <p style={{color:'#fff', fontSize:'clamp(18px, 4.5vw, 30px)', marginTop:'20px'}}>XP: <span style={{color:'#00f2ff', fontWeight:'bold'}}>+{hintUsed ? '50' : '200'}</span></p>
                  <p style={{color:'#aaa', fontSize:'clamp(12px, 3.5vw, 20px)'}}>{UI.time}: {MAX_TIME - timeLeft}s</p>
                  <button className="hud-btn" style={{marginTop:'clamp(30px, 6vw, 50px)', background:'#00f2ff', color:'#000', width: '100%', maxWidth: '400px'}} onClick={handleNextPhase}>{UI.btnNext}</button>
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

                      <div style={{color:'#fff', fontSize:'clamp(14px, 3.5vw, 24px)', lineHeight:'1.6', background:'rgba(0,0,0,0.6)', padding:'clamp(15px, 4vw, 30px)', borderRadius:'10px', whiteSpace:'pre-wrap', borderLeft:'4px solid #0055ff', marginTop:'20px'}}>
                          <MarkdownParser text={currentQData?.microclass} />
                      </div>
                      
                      <div style={{display:'flex', justifyContent:'center'}}>
                          <button className="hud-btn" style={{marginTop:'clamp(20px, 5vw, 40px)', background:'#ffea00', color:'#000', width:'100%', height:'clamp(50px, 8vw, 80px)', fontSize:'clamp(16px, 4vw, 24px)'}} onClick={handleNextPhase}>{UI.btnRetrySame}</button>
                      </div>
                  </article>
              </section>
            )}

            {/* DASHBOARD TELEMETRÍA */}
            {phase === "STATS" && !showAiModal && !showHistoryModal && (
              <section style={{ position:'absolute', inset:0, zIndex:2000, background:'rgba(0,10,30,0.98)', display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center', padding:'clamp(10px, 3vw, 20px)', boxSizing: 'border-box' }}>
                  <article className="glass-panel" style={{maxWidth:'1000px', width:'100%', maxHeight:'95dvh', overflowY:'auto'}}>
                      <h2 style={{color:'#ffaa00', textAlign:'center', fontSize:'clamp(20px, 5vw, 40px)', borderBottom:'2px solid #ffaa00', paddingBottom:'15px', margin:0}}>{UI.dashboard}</h2>
                      
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

                      {/* BOTONES PRINCIPALES DE IA */}
                      <div style={{display:'flex', justifyContent:'center', gap:'20px', flexWrap:'wrap', marginBottom:'clamp(20px, 5vw, 30px)'}}>
                         <button 
                            className="hud-btn" 
                            style={{background: failedTopics.length > 0 ? '#ff00ff' : '#0055ff', color: '#fff', flex:'1 1 300px', maxWidth: '600px', boxShadow: failedTopics.length > 0 ? '0 0 30px #ff00ff' : '0 0 30px #0055ff', fontSize: 'clamp(14px, 3vw, 20px)'}} 
                            onClick={() => { sfx.aiPop(); setShowAiModal(true); }}
                         >
                            🧠 {UI.aiSocraticBtn}
                         </button>
                         <button 
                            className="hud-btn" 
                            style={{background: 'rgba(0,85,255,0.1)', color: '#0055ff', border: '1px solid #0055ff', flex:'1 1 200px', maxWidth: '400px', fontSize: 'clamp(14px, 3vw, 20px)', boxShadow:'none'}} 
                            onClick={() => { sfx.click(); setShowHistoryModal(true); }}
                         >
                            {UI.historyBtn}
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
                                      <div style={{color: isFailed ? '#f00' : '#ffaa00', fontWeight:'bold', marginBottom:'10px', fontSize:'clamp(11px, 2.5vw, 16px)'}}>
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
                          <button className="hud-btn" style={{flex:'1 1 200px', background:'transparent', border:'2px solid #ffaa00', color:'#ffaa00', fontSize: 'clamp(12px, 3vw, 18px)'}} onClick={downloadReport}>📄 {UI.downloadReport}</button>
                          <button className="hud-btn" style={{flex:'1 1 200px', fontSize: 'clamp(12px, 3vw, 18px)'}} onClick={closeTelemetry}>VOLVER A LA MISIÓN</button>
                          <button className="hud-btn" style={{flex:'1 1 200px', background:'transparent', border:'2px solid #f00', color:'#f00', fontSize: 'clamp(12px, 3vw, 18px)'}} onClick={() => { window.localStorage.removeItem('icfes_sociales_telemetry_v1'); window.localStorage.removeItem('icfes_sociales_history_v1'); window.location.reload(); }}>{UI.btnRetry}</button>
                      </div>
                  </article>
              </section>
            )}

            {/* MODAL IA INTERACTIVA (GENERACIÓN DE NUEVAS CLASES) */}
            {showAiModal && phase === "STATS" && (
               <section style={{ position:'absolute', inset:0, zIndex:3000, background:'rgba(20,0,20,0.98)', display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center', padding:'clamp(10px, 2vw, 20px)', backdropFilter:'blur(10px)', boxSizing: 'border-box' }}>
                   <article className="glass-panel" style={{borderColor:'#ff00ff', maxWidth:'1200px', width:'100%', textAlign:'left', boxShadow:'0 0 50px rgba(255,0,255,0.3)', maxHeight:'95dvh', overflowY:'auto'}}>
                       
                       {failedTopics.length > 0 ? (
                           <>
                               {!activeAiTopic ? (
                                   <>
                                       <h2 style={{color:'#ff00ff', fontSize:'clamp(22px, 6vw, 45px)', textAlign:'center', marginBottom:'clamp(20px, 4vw, 30px)'}}>{UI.aiSelectTopic}</h2>
                                       <div style={{display:'flex', flexDirection:'column', gap:'clamp(10px, 2vw, 15px)'}}>
                                           {failedTopics.map((topicId, i) => (
                                               <button key={i} className="opt-btn" style={{borderColor:'#ff00ff', color:'#fff', fontSize: 'clamp(16px, 4vw, 24px)', padding: 'clamp(15px, 3vw, 25px)'}} onClick={() => { sfx.click(); setActiveAiTopic(topicId); }}>
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
                                      onSave={saveToHistory}
                                   />
                               )}
                           </>
                       ) : (
                           <>
                             <h2 style={{color:'#0f0', fontSize:'clamp(20px, 5vw, 36px)', textAlign:'center', margin:'clamp(20px, 5vw, 30px) 0'}}>{UI.aiPraise}</h2>
                             <button className="hud-btn" style={{width:'100%', background:'#0f0', color:'#000'}} onClick={() => setShowAiModal(false)}>CERRAR IA</button>
                           </>
                       )}
                   </article>
               </section>
            )}

            {/* 🔴 NUEVO MODAL: HISTORIAL DE CLASES AKÁSHICAS */}
            {showHistoryModal && phase === "STATS" && (
                <section style={{ position:'absolute', inset:0, zIndex:3100, background:'rgba(0,15,30,0.98)', display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center', padding:'clamp(10px, 2vw, 20px)', backdropFilter:'blur(10px)', boxSizing: 'border-box' }}>
                    <article className="glass-panel" style={{borderColor:'#0055ff', maxWidth:'1200px', width:'100%', textAlign:'left', boxShadow:'0 0 50px rgba(0,85,255,0.3)', maxHeight:'95dvh', overflowY:'auto'}}>
                        {!selectedHistoryItem ? (
                            <>
                                <h2 style={{color:'#0055ff', fontSize:'clamp(22px, 6vw, 45px)', textAlign:'center', marginBottom:'clamp(20px, 4vw, 30px)'}}>{UI.historyTitle}</h2>
                                
                                {classHistory.length === 0 ? (
                                    <div style={{textAlign:'center', padding: '40px 20px', background:'rgba(0,0,0,0.5)', borderRadius:'15px', border:'1px dashed #555'}}>
                                        <p style={{color:'#aaa', fontSize:'clamp(16px, 4vw, 24px)'}}>{UI.historyEmpty}</p>
                                    </div>
                                ) : (
                                    <div style={{display:'flex', flexDirection:'column', gap:'clamp(10px, 2vw, 15px)'}}>
                                        {classHistory.map((item) => (
                                            <div key={item.id} style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,85,255,0.05)', border: '1px solid #0055ff', padding: 'clamp(15px, 3vw, 25px)', borderRadius: '10px' }}>
                                                <div style={{flex: '1 1 60%'}}>
                                                    <div style={{ color: '#fff', fontSize: 'clamp(16px, 4vw, 22px)', fontWeight: 'bold', marginBottom: '8px' }}>{item.classData.title || IcfesEngine.getTopicName(item.topic, safeLang)}</div>
                                                    <div style={{ color: '#0055ff', fontSize: 'clamp(12px, 3vw, 16px)' }}>🕒 {item.date}</div>
                                                </div>
                                                <button className="hud-btn" style={{ flex: '1 1 200px', padding: '15px', fontSize: 'clamp(14px, 3vw, 18px)', margin: 0 }} onClick={() => { sfx.click(); setSelectedHistoryItem(item); }}>{UI.viewClassBtn}</button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                
                                <div style={{display:'flex', gap:'20px', marginTop:'clamp(30px, 6vw, 50px)', flexWrap: 'wrap'}}>
                                    <button className="hud-btn" style={{flex: '1 1 200px', background:'#555', color:'#fff', boxShadow: 'none', padding: '20px'}} onClick={() => setShowHistoryModal(false)}>{UI.aiClose}</button>
                                    {classHistory.length > 0 && (
                                        <button className="hud-btn" style={{flex: '1 1 200px', background:'transparent', border:'2px solid #f00', color:'#f00', boxShadow: 'none', padding: '20px'}} onClick={() => { sfx.error(); setClassHistory([]); window.localStorage.removeItem('icfes_sociales_history_v1'); }}>{UI.clearHistoryBtn}</button>
                                    )}
                                </div>
                            </>
                        ) : (
                            <SocraticMasterclass 
                                topic={selectedHistoryItem.topic} 
                                lang={safeLang} 
                                preloadedData={selectedHistoryItem.classData}
                                onBack={() => { sfx.click(); setSelectedHistoryItem(null); }} 
                                onClose={() => { sfx.click(); setShowHistoryModal(false); setSelectedHistoryItem(null); }} 
                                UI={UI} 
                                customBackText={UI.backToHistoryBtn}
                            />
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