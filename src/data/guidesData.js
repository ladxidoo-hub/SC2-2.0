export const DEFAULT_GUIDES = [
  {
    id: "damage-types",
    title: "Tipos de dano: armas y drones",
    category: "Combate",
    imageKey: "damageTypes",
    imageFit: "contain",
    imagePosition: "center",
    description: "Esta guia muestra los cuatro tipos de dano del juego y las armas y drones que los utilizan. Cada color representa un tipo distinto: electromagnetico contra escudos, termico contra armadura, cinetico contra estructura y explosivo como alto dano al casco. La longitud de cada segmento indica la proporcion de dano para elegir la combinacion adecuada segun las resistencias del objetivo.",
    fullDetails: [
      "La siguiente guia muestra los cuatro tipos de dano del juego y las armas y drones que los utilizan. Cada color representa un tipo de dano distinto, mientras que la longitud de cada segmento de color indica la proporcion de ese dano que inflige un arma o dron.",
      "Las armas se encuentran en el lado izquierdo y los drones en la parte inferior. Al observar la barra correspondiente a cada uno, es posible identificar si inflige un unico tipo de dano o una combinacion de varios.",
      "Esta informacion permite conocer el perfil de dano de cada arma y dron para elegir la combinacion mas adecuada segun las resistencias del objetivo."
    ],
    damageTypes: [
      {
        name: "Electromagnetico",
        description: "Especializado en causar dano a los escudos."
      },
      {
        name: "Termico",
        description: "Destaca por su efectividad contra la armadura."
      },
      {
        name: "Cinetico",
        description: "Es mas eficaz contra la estructura o casco de la nave."
      },
      {
        name: "Explosivo",
        description: "Tambien es muy efectivo contra la estructura y suele infligir el mayor dano al casco."
      }
    ],
    level: "Basico",
    readingTime: "5 min",
    tags: ["electromagnetico", "termico", "cinetico", "explosivo"],
    gallery: []
  },
  {
    id: "story-missions",
    title: "Misiones de historia por faccion",
    category: "Misiones",
    imageKey: "storyMissions",
    imageFit: "contain",
    imagePosition: "center",
    description: "Tabla con todas las misiones de historia disponibles, organizadas por faccion. Muestra el nombre de cada mision, el nivel tecnologico requerido y la recompensa en ISK al completarla.",
    fullDetails: [
      "La siguiente tabla reune todas las misiones de historia disponibles, organizadas por faccion. En ella se muestra el nombre de cada mision, el nivel tecnologico requerido (T6, T8 o T10) y la recompensa en ISK que se obtiene al completarla.",
      "Las misiones de mayor nivel ofrecen desafios mas dificiles, pero tambien recompensas mas altas. Ademas de la recompensa en ISK, las misiones de historia tambien otorgan cofres y botin relacionado con la faccion correspondiente.",
      "Usa esta guia para comparar rapidamente Caldari, Minmatar, Amarr y Gallente, elegir la ruta de misiones que mejor se adapte a tu nivel tecnologico y calcular que recompensas conviene priorizar."
    ],
    level: "Basico",
    readingTime: "4 min",
    tags: ["caldari", "minmatar", "amarr", "gallente", "isk", "t6", "t8", "t10"],
    gallery: []
  },
  {
    id: "implants-progression",
    title: "Implantes y neurocompiladores",
    category: "Implantes",
    imageKey: "implants",
    imageFit: "contain",
    imagePosition: "center",
    description: "Guia de tipos de implantes, nivel maximo, neurocompiladores necesarios, costo de experiencia por nivel y experiencia total acumulada para completar cada mejora.",
    fullDetails: [
      "La siguiente guia muestra los tipos de implantes disponibles, el nivel maximo que puede alcanzar cada uno y los neurocompiladores necesarios para mejorarlos.",
      "Tambien incluye el nivel a partir del cual puede utilizarse cada neurocompilador, el costo de experiencia requerido para subir cada nivel y la experiencia total acumulada necesaria para alcanzar el nivel maximo.",
      "Esta informacion permite planificar de forma eficiente la progresion de los implantes y calcular los recursos necesarios para completar cada etapa de mejora."
    ],
    level: "Basico",
    readingTime: "5 min",
    tags: ["implantes", "neurocompiladores", "experiencia", "nivel maximo", "rastreador", "profundidad", "genesis", "ascension", "experimental", "basico", "estandar", "avanzado"],
    gallery: []
  },
  {
    id: "nanocore-ai-upgrade",
    title: "Nanonucleo IA: morado a dorado",
    category: "Nanonucleos",
    imageKey: "nanocoreAi",
    imageFit: "contain",
    imagePosition: "center",
    description: "Tabla de recursos para mejorar el nanonucleo de una nave de calidad morada a dorada, activar el modo IA y calcular el consumo diario de Cristales Morados.",
    fullDetails: [
      "La siguiente tabla muestra los recursos necesarios para mejorar el nanonucleo de una nave de calidad morada a dorada. Se indica la cantidad de Nucleos Estelares de Teseracto requerida segun la clase de la nave.",
      "Tambien muestra el costo de activacion del modo IA, el cual puede pagarse con Nucleos Estelares de Teseracto o con AUR.",
      "Ademas, se muestra el consumo de Cristales Morados durante el uso del modo IA, donde cada cristal proporciona 1 hora de funcionamiento, con un limite maximo de 8 horas de uso continuo por dia.",
      "Esta informacion permite calcular con precision los recursos necesarios para mejorar y mantener activo el modo IA de cada nanonucleo."
    ],
    level: "Intermedio",
    readingTime: "5 min",
    tags: ["nanonucleo", "modo ia", "teseracto", "aur", "cristales morados", "superportanaves", "acorazado", "crucero", "destructor", "fragata"],
    gallery: []
  },
  {
    id: "resonance-scanners",
    title: "Escaneres de resonancia",
    category: "Escaneo",
    imageKey: "resonanceScanners",
    imageFit: "contain",
    imagePosition: "center",
    description: "Guia sobre el radio de escaneo minimo, el radio de escaneo y el radio de origen de las naves para saber cuando una nave puede localizarse y si recibira notificacion.",
    fullDetails: [
      "La siguiente guia explica el funcionamiento de los escaneres de resonancia y como interactuan con el radio de origen de las naves. Un escaner posee dos valores: el radio de escaneo minimo, que representa el tamano minimo de firma que puede detectar, y el radio de escaneo, que determina a partir de que tamano de firma el objetivo recibira una notificacion indicando que esta siendo escaneado.",
      "Por su parte, cada nave cuenta con un radio de origen o firma, el cual puede modificarse mediante equipamiento, bonificaciones del casco y habilidades.",
      "Para localizar una nave, el radio de escaneo minimo del escaner debe ser igual o inferior al radio de origen del objetivo. Si el radio de origen de la nave se encuentra entre el radio de escaneo minimo y el radio de escaneo, la nave podra ser localizada, pero el piloto recibira una alerta de que esta siendo escaneado.",
      "En cambio, si el radio de origen es igual o superior al radio de escaneo, la nave podra localizarse sin que el objetivo reciba ninguna notificacion.",
      "Los ejemplos incluidos muestran como un mismo escaner puede ser incapaz de detectar una fragata con una firma muy pequena, detectar un crucero avisando al objetivo, o localizar un acorazado sin que este reciba ninguna advertencia, dependiendo unicamente del tamano de su radio de origen."
    ],
    level: "Intermedio",
    readingTime: "6 min",
    tags: ["escaneres", "resonancia", "radio de escaneo", "radio minimo", "radio de origen", "firma", "kestrel", "blackbird", "raven", "fragata", "crucero", "acorazado"],
    gallery: []
  },
  {
    id: "stacking-penalty",
    title: "Penalizacion por apilamiento",
    category: "Mecanicas",
    imageKey: "stackingPenalty",
    imageFit: "contain",
    imagePosition: "center",
    description: "Guia sobre como disminuye la efectividad al equipar varios modulos, plataformas o modificadores que afectan el mismo atributo.",
    fullDetails: [
      "La siguiente guia explica como funciona la penalizacion por apilamiento al equipar varios modulos, plataformas o modificadores que afectan el mismo atributo. Cuando varios efectos iguales se acumulan, el juego los aplica en orden de mayor a menor potencia, reduciendo progresivamente la efectividad de cada modificador adicional mediante una formula de penalizacion.",
      "El primer modificador siempre conserva el 100 % de su efecto. A partir del segundo, cada uno aporta un porcentaje menor: aproximadamente 86.9 %, 57.1 %, 28.3 %, 10.6 % y 3.0 % para el sexto modificador. Los siguientes continuan aportando beneficios cada vez mas pequenos.",
      "La grafica muestra esta disminucion de efectividad, permitiendo visualizar como el rendimiento cae rapidamente a medida que se anaden mas modulos del mismo tipo.",
      "En la practica, esto significa que apilar mas de tres o cuatro modificadores sobre una misma estadistica suele ofrecer beneficios muy reducidos, por lo que generalmente es mas eficiente invertir esos espacios en modulos que mejoren otros atributos de la nave."
    ],
    level: "Intermedio",
    readingTime: "5 min",
    tags: ["apilamiento", "penalizacion", "modulos", "plataformas", "modificadores", "formula", "efectividad", "atributos"],
    gallery: []
  },
  {
    id: "private-contracts",
    title: "Contratos privados",
    category: "Comercio",
    imageKey: "privateContracts",
    imageFit: "contain",
    imagePosition: "center",
    description: "Guia paso a paso para crear un contrato privado y vender, intercambiar o transferir objetos a otro jugador de forma segura.",
    fullDetails: [
      "La siguiente guia explica como crear un contrato privado para vender, intercambiar o transferir objetos a otro jugador.",
      "Muestra el proceso completo, desde acceder al menu de contratos hasta seleccionar el destinatario mediante su nombre o ID de personaje, elegir la estacion donde se encuentran los objetos, seleccionar los articulos que se incluiran en el contrato y establecer la cantidad de ISK que se desea recibir.",
      "Finalmente, solo queda revisar la informacion, confirmar el contrato y esperar a que el destinatario lo acepte.",
      "Este sistema permite realizar transacciones de forma segura sin necesidad de intercambiar objetos directamente."
    ],
    level: "Basico",
    readingTime: "4 min",
    tags: ["contratos", "contrato privado", "comercio", "isk", "destinatario", "estacion", "objetos", "transferir", "vender", "intercambiar"],
    gallery: []
  },
  {
    id: "reward-duplication",
    title: "Duplicar recompensa",
    category: "Cartera",
    imageKey: "rewardDuplication",
    imageFit: "contain",
    imagePosition: "center",
    description: "Guia para reclamar nuevamente una recompensa de ISK ya obtenida usando el historial de cartera, el filtro de premios y cargas de compensacion.",
    fullDetails: [
      "La siguiente guia explica como utilizar la funcion de duplicar recompensa para reclamar nuevamente una recompensa de ISK ya obtenida.",
      "El proceso consiste en acceder al historial de la cartera, filtrar las transacciones por Premios de recompensa, seleccionar la recompensa que se desea duplicar y confirmar la operacion para recibir nuevamente el mismo monto de ISK.",
      "Esta funcion utiliza cargas de compensacion, las cuales tienen un limite que depende del nivel tecnologico del personaje y se recargan periodicamente.",
      "Debido a que las cargas son limitadas, se recomienda utilizarlas unicamente en las recompensas de mayor valor para obtener el maximo beneficio."
    ],
    level: "Basico",
    readingTime: "4 min",
    tags: ["duplicar recompensa", "recompensa", "cartera", "isk", "premios de recompensa", "cargas de compensacion", "historial", "filtro", "transacciones"],
    gallery: []
  },
  {
    id: "anomalies-specials",
    title: "Anomalias e Inquisidor/DS",
    category: "Anomalias",
    imageKey: "anomalies",
    imageFit: "contain",
    imagePosition: "center",
    description: "Guia para realizar las anomalias correctas, acelerar la generacion de especiales y completar Inquisidor o DS aprovechando los pisos y el botin Elite.",
    fullDetails: [
      "La siguiente guia explica la forma mas eficiente de realizar anomalias para aumentar las probabilidades de que aparezcan anomalias especiales.",
      "Las anomalias que no deben completarse pueden identificarse porque en su informacion aparece Fuente: Desconocido. En cambio, las que si deben realizarse muestran el nombre de la base de la faccion correspondiente a la region, por ejemplo Base de los Guristas.",
      "Completar estas anomalias permite que el sistema genere nuevas anomalias con mayor rapidez y aumenta las posibilidades de que aparezcan anomalias especiales.",
      "Cuando se genera una anomalia especial, como Inquisidor o DS, esta consta de tres niveles. El primer nivel unicamente contiene el portal que permite avanzar al siguiente piso.",
      "El segundo nivel incluye enemigos de la faccion de la region y puede completarse o ignorarse para continuar directamente al siguiente portal.",
      "El tercer nivel alberga la mayor cantidad de enemigos y es donde se obtiene la recompensa principal. Al eliminar a todos los enemigos apareceran varios contenedores con el botin, ademas de los restos de las naves destruidas.",
      "Es especialmente recomendable recoger aquellos restos marcados como Elite, ya que suelen contener las recompensas mas valiosas."
    ],
    level: "Intermedio",
    readingTime: "8 min",
    tags: ["anomalias", "inquisidor", "ds", "especiales", "fuente desconocido", "base guristas", "botin", "elite", "portal"],
    gallery: [
      {
        imageKey: "specialAnomalies",
        title: "Anomalia Inquisidor y DS"
      }
    ]
  },
  {
    id: "zerg-early-game",
    title: "Zerg Early Game",
    category: "Builds",
    imageKey: "swarm",
    imagePosition: "24% 58%",
    description: "Aprende una apertura eficiente para controlar el mapa, defender presiones tempranas y llegar al mid game con economia superior.",
    fullDetails: [
      "Apertura orientada a controlar el mapa, defender presiones tempranas y llegar al mid game con una economia superior.",
      "Prioriza informacion constante, ciclos limpios de produccion y transiciones sin detener el crecimiento."
    ],
    level: "Intermedio",
    readingTime: "8 min",
    tags: ["macro", "larvas", "map control"],
    gallery: []
  },
  {
    id: "kerrigan-build",
    title: "Kerrigan Build",
    category: "Campana",
    imageKey: "swarm",
    imagePosition: "52% 46%",
    description: "Guia completa para aprovechar movilidad, control de masas y picos de poder de Kerrigan durante misiones criticas.",
    fullDetails: [
      "Guia para aprovechar movilidad, control de masas y picos de poder de Kerrigan durante misiones criticas.",
      "El objetivo es entrar a cada combate con habilidades disponibles y evitar gastar recursos antes del momento decisivo."
    ],
    level: "Avanzado",
    readingTime: "11 min",
    tags: ["habilidades", "campana", "poder"],
    gallery: []
  },
  {
    id: "swarm-macro",
    title: "Macro del Enjambre",
    category: "Estrategia",
    imageKey: "swarm",
    imagePosition: "38% 72%",
    description: "Rutinas de inyeccion, expansion y produccion para mantener ciclos limpios incluso bajo presion constante.",
    fullDetails: [
      "Rutinas de inyeccion, expansion y produccion para mantener ciclos limpios incluso bajo presion constante.",
      "Usa esta guia como checklist para sostener economia, mapa y tecnologia sin perder ritmo."
    ],
    level: "Basico",
    readingTime: "6 min",
    tags: ["economia", "expansiones", "inyecciones"],
    gallery: []
  },
  {
    id: "mutalisks-vision",
    title: "Mutaliscos y Vision",
    category: "Unidades",
    imageKey: "swarm",
    imagePosition: "76% 22%",
    description: "Controla rutas aereas, castiga lineas minerales y evita perder tempo mientras preparas transiciones seguras.",
    fullDetails: [
      "Controla rutas aereas, castiga lineas minerales y evita perder tempo mientras preparas transiciones seguras.",
      "La vision previa y las salidas limpias son mas importantes que el dano inicial cuando el rival ya esta preparado."
    ],
    level: "Intermedio",
    readingTime: "7 min",
    tags: ["mutaliscos", "vision", "harass"],
    gallery: []
  },
  {
    id: "timing-push-defense",
    title: "Defensa contra Timing Push",
    category: "Defensa",
    imageKey: "swarm",
    imagePosition: "64% 64%",
    description: "Lee senales de ataque, ajusta produccion y usa terreno, creep y surrounds para sobrevivir a empujes decisivos.",
    fullDetails: [
      "Lee senales de ataque, ajusta produccion y usa terreno, creep y surrounds para sobrevivir a empujes decisivos.",
      "La defensa empieza con scouting temprano: identifica tecnologia, bases y ausencia de economia antes de elegir respuesta."
    ],
    level: "Avanzado",
    readingTime: "10 min",
    tags: ["defensa", "creep", "scouting"],
    gallery: []
  },
  {
    id: "late-game-transitions",
    title: "Transiciones a Late Game",
    category: "Estrategia",
    imageKey: "swarm",
    imagePosition: "48% 38%",
    description: "Convierte ventajas pequenas en composiciones finales estables con tecnologia, upgrades y control de zonas clave.",
    fullDetails: [
      "Convierte ventajas pequenas en composiciones finales estables con tecnologia, upgrades y control de zonas clave.",
      "El foco esta en no sobreinvertir en unidades temporales cuando ya puedes transformar la ventaja en composicion definitiva."
    ],
    level: "Avanzado",
    readingTime: "12 min",
    tags: ["late game", "upgrades", "tecnologia"],
    gallery: []
  }
];

export const GUIDE_IMAGE_OPTIONS = [
  { key: "damageTypes", label: "Tipos de dano" },
  { key: "storyMissions", label: "Misiones de historia" },
  { key: "implants", label: "Implantes" },
  { key: "nanocoreAi", label: "Nanonucleo IA" },
  { key: "resonanceScanners", label: "Escaneres" },
  { key: "stackingPenalty", label: "Penalizacion" },
  { key: "privateContracts", label: "Contratos privados" },
  { key: "rewardDuplication", label: "Duplicar recompensa" },
  { key: "anomalies", label: "Anomalias" },
  { key: "specialAnomalies", label: "Anomalias especiales" },
  { key: "swarm", label: "Heart of the Swarm" }
];
