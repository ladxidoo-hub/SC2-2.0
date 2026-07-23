const pveRules = [
  {
    number: "PVE-01",
    title: "Anomalias basicas",
    content: "Todas las anomalias basicas, pequenas, medianas y grandes, pueden realizarse de forma individual o en flota.",
    tag: "Libre acceso",
    icon: "1",
    subrules: [
      "Se recomienda farmear en flota corporativa para limpiar sistemas mas rapido y acelerar la aparicion de anomalias capitales.",
      "Al estar en flota, los aliados podran reaccionar con mayor rapidez si se necesita apoyo.",
      "Las anomalias normales son de libre acceso; nadie esta obligado a abandonar una anomalia porque otro piloto haya ingresado.",
      "Todos los pilotos deben estar de acuerdo con el nivel del sistema y de sus naves."
    ]
  },
  {
    number: "PVE-02",
    title: "Anomalias Inquisidor",
    content: "Las anomalias Inquisidor no son exclusivas de un solo piloto y pueden realizarse individualmente o en flota segun acuerdo entre participantes.",
    tag: "Prioridad",
    icon: "2",
    subrules: [
      "Las Inquisidor Avanzadas podran ser realizadas por pilotos capitales con habilidades y equipamiento necesarios.",
      "Tiene prioridad el piloto capital que haya estado farmeando en el sistema cuando aparezca la anomalia.",
      "Si un piloto capital llega sin haber farmeado, debe consultar primero con el piloto capital que si estuvo presente.",
      "Si no hay ningun piloto capital en el sistema, cualquier piloto capital podra realizarla sin inconvenientes.",
      "El piloto con prioridad puede invitar a otros jugadores si lo desea.",
      "Si varios pilotos estaban farmeando cuando aparezca, podran hacerla juntos o por separado."
    ]
  },
  {
    number: "PVE-03",
    title: "Seguridad del sistema",
    content: "Si entra un piloto hostil o neutral al sistema, debe hacerse una pausa de 15 minutos antes de volver a minar o realizar anomalias.",
    tag: "Seguridad",
    icon: "!",
    subrules: []
  },
  {
    number: "PVE-04",
    title: "Anomalias capitales",
    content: "Se consideran anomalias capitales: Punto de Encuentro, Capital Fleet y Cantera.",
    tag: "Capital",
    icon: "4",
    subrules: [
      "Pertenecen a los pilotos que estaban farmeando el sistema y generaron la aparicion de la anomalia.",
      "Para tener prioridad se deben obtener 3 tickets consecutivos desde el inicio del farmeo hasta la aparicion de la anomalia.",
      "Los tickets de anomalias capitales anteriores no cuentan.",
      "Si nadie posee tres tickets, tendran prioridad quienes tengan dos; si nadie tiene dos, quienes tengan uno.",
      "Si varios pilotos cumplen el mismo requisito, podran realizar la anomalia juntos o llegar a un acuerdo.",
      "Si los propietarios no tienen DPS suficiente o nave requerida, podran solicitar apoyo de hasta dos pilotos capitales.",
      "Se permite ingreso adicional si hay riesgo PvP, si el propietario debe desconectarse o si esta demasiado cansado.",
      "Los pilotos de apoyo no tendran derecho al loot salvo acuerdo de los propietarios o decision de la direccion.",
      "El loot se reparte solo entre quienes hayan realizado la anomalia, salvo excepciones del reglamento."
    ]
  },
  {
    number: "PVE-05",
    title: "Capitales no reportadas",
    content: "Toda anomalia capital no reportada y descubierta posteriormente por otro piloto sera considerada propiedad de la corporacion.",
    tag: "Reporte",
    icon: "5",
    subrules: [
      "Aplica a anomalias omitidas por distraccion, desconexion o por terminar el farmeo sin revisarlas.",
      "El loot debe ser donado a la corporacion.",
      "El ISK obtenido por bounty pertenece al piloto capital que complete la anomalia.",
      "El ISK duplicado mediante tickets pertenece igualmente al piloto capital.",
      "Se permite la participacion de varios pilotos capitales para acelerar la ejecucion."
    ]
  },
  {
    number: "PVE-06",
    title: "Dead Space y exploracion",
    content: "Las anomalias Dead Space escaneadas con el escaner azul pertenecen al piloto que las descubra y pueda realizarlas inmediatamente.",
    tag: "Exploracion",
    icon: "6",
    subrules: [
      "Para conservar la propiedad debe reportarlas en WhatsApp o Discord y entrar a realizarlas inmediatamente.",
      "No se pueden apartar para hacerlas mas tarde y no existen excepciones.",
      "Las anomalias de exploracion, codificacion y hackeo pertenecen al piloto que las escanee y entre primero.",
      "Si el piloto no puede completarlas inmediatamente, otro jugador que tambien las haya escaneado puede hacerlas.",
      "El propietario puede decidir libremente si invita a otros jugadores.",
      "El reporte debe incluir imagen en WhatsApp o Discord para Colmena, Tierra de Zanganos y Cubil de Infestacion.",
      "Para realizar anomalias Mentor es obligatorio solicitar apoyo a un piloto capital."
    ]
  },
  {
    number: "PVE-07",
    title: "Reportes obligatorios",
    content: "Todas las anomalias capitales deben reportarse inmediatamente en el Canal Reporte Capital y en el grupo oficial de WhatsApp.",
    tag: "Obligatorio",
    icon: "7",
    subrules: [
      "Si la anomalia no se reporta y otro piloto la encuentra y reporta primero, el propietario original pierde todos sus derechos sobre ella.",
      "No hay excepciones.",
      "El loot de anomalias capitales corporativas debe reportarse en el canal capital-loot-and-report."
    ]
  },
  {
    number: "PVE-08",
    title: "Hidden Rift y Capital Test",
    content: "Las anomalias Hidden Rift o Capital Test son de libre acceso para todos los pilotos capitales.",
    tag: "Libre acceso",
    icon: "8",
    subrules: [
      "El loot puede donarse a la corporacion o repartirse entre los participantes.",
      "La decision corresponde a la flota que complete la anomalia."
    ]
  },
  {
    number: "PVE-09",
    title: "Canteras",
    content: "En las anomalias de Cantera, el piloto capital no podra ser el minero, ni utilizando una cuenta alter.",
    tag: "Restriccion",
    icon: "9",
    subrules: [
      "El objetivo es dar oportunidad a los mineros de la corporacion para beneficiarse tambien de estas anomalias."
    ]
  },
  {
    number: "PVE-10",
    title: "Sistemas permitidos",
    content: "Esta prohibido realizar anomalias en sistemas que no pertenezcan a SC2.",
    tag: "Restriccion",
    icon: "10",
    subrules: [
      "La prohibicion incluye anomalias normales, Dead Space, Inquisidor, Dead Space generadas por POS y Hidden Rift."
    ]
  },
  {
    number: "PVE-11",
    title: "Eventos CTA",
    content: "Durante los eventos oficiales de CTA todos los jugadores deberan participar y el impuesto corporativo se elevara al 100%.",
    tag: "CTA",
    icon: "11",
    subrules: [
      "Toda anomalia especial generada durante el evento pertenecera integramente a la corporacion."
    ]
  },
  {
    number: "PVE-12",
    title: "Reglas para cuentas Alter",
    content: "Si una cuenta alter genera una anomalia capital y su propietario es piloto capital, podra realizarla solo bajo condiciones especificas.",
    tag: "Alter",
    icon: "12",
    subrules: [
      "El sistema debe haber permanecido libre desde el inicio del farmeo hasta la aparicion de la anomalia.",
      "Se considera sistema libre cuando no existe otro piloto con al menos un ticket.",
      "Esta regla solo aplica cuando los tres sistemas de la corporacion esten vacios.",
      "Si pasan 30 minutos desde que la alter reporto la anomalia y ningun piloto capital responde, el propietario podra realizarla.",
      "Si una anomalia especial requiere dos cuentas y el piloto dispone de dos capitales, inicialmente solo podra ingresar con una.",
      "Debe anunciar la anomalia en WhatsApp; si despues de 30 minutos ningun otro piloto capital responde, podra completarla con ambas cuentas."
    ]
  },
  {
    number: "PVE-13",
    title: "Outposts",
    content: "Los espacios para Outposts dentro de la soberania de SC2 son exclusivos para miembros de la corporacion.",
    tag: "Soberania",
    icon: "13",
    subrules: [
      "Si un jugador abandona SC2, debe retirar primero su Outpost para que el espacio pueda ser ocupado por otro miembro."
    ]
  },
  {
    number: "PVE-14",
    title: "Requisitos para ser Piloto Capital",
    content: "Para ser considerado Piloto Capital se debe contar con nave capital, fit aprobado, habilidades necesarias y nave para recoger loot rapidamente.",
    tag: "Capital",
    icon: "14",
    subrules: [
      "La nave capital debe cumplir con el DPS requerido.",
      "El FIT debe estar aprobado.",
      "El piloto debe contar con las habilidades necesarias.",
      "Debe tener una nave capaz de recoger el loot rapidamente; se recomienda Noctis I o II."
    ]
  },
  {
    number: "PVE-15",
    title: "Responsabilidad de los Pilotos Capitales",
    content: "Los pilotos capitales son considerados jugadores experimentados y reciben un alto grado de confianza por parte de la corporacion.",
    tag: "Responsabilidad",
    icon: "15",
    subrules: [
      "Deben contribuir al crecimiento de los pilotos nuevos brindando apoyo y orientacion cuando sea posible."
    ]
  },
  {
    number: "PVE-16",
    title: "Sanciones",
    content: "Cualquier incumplimiento del Reglamento PVE podra ser sancionado con multas desde 300 millones de ISK hasta 2 mil millones de ISK.",
    tag: "Sancion",
    icon: "16",
    subrules: [
      "La multa dependera de la gravedad de la infraccion."
    ]
  },
  {
    number: "PVE-NOTA",
    title: "Nota final",
    content: "Las anomalias normales son de libre acceso. Ningun piloto esta obligado a abandonar una anomalia porque otro haya ingresado posteriormente.",
    tag: "Nota",
    icon: "i",
    subrules: [
      "Todos los jugadores deberan actuar con respeto, sentido comun y considerando el nivel del sistema y de los pilotos participantes."
    ]
  }
];

const pvpRules = [
  {
    number: "PVP-01",
    title: "Obligaciones e impuesto PVP",
    content: "La alianza solicita un impuesto PvP mensual de 10.000 millones de ISK (10B), destinado principalmente al programa SRP para corporaciones activas en PvP.",
    tag: "Obligatorio",
    icon: "1",
    subrules: [
      "En SC2 este impuesto se divide solo entre las cuentas principales de jugadores activos.",
      "Las cuentas alter no participan en el calculo.",
      "Cada jugador puede cubrir su parte participando en eventos PvP oficiales, opcion recomendada, o pagando la diferencia en ISK si no asistio lo suficiente.",
      "La corporacion llevara un registro de asistencias y recompensas en un Drive de libre acceso.",
      "El Drive debe mostrar asistencias registradas, ISK acumulado por participacion, saldo pendiente, reclamos o sugerencias.",
      "Al finalizar cada mes se descuenta el ISK acumulado por asistencias del impuesto correspondiente.",
      "Si queda saldo pendiente, se registra como Puntos Corporativos Negativos y debera pagarse o compensarse posteriormente."
    ]
  },
  {
    number: "PVP-02",
    title: "Doctrinas oficiales",
    content: "Todos los pilotos deben utilizar las doctrinas oficiales de la alianza.",
    tag: "Doctrina",
    icon: "2",
    subrules: [
      "Las naves deben cumplir estrictamente con modulos, rigs, equipamiento y configuracion FIT.",
      "No cumplir con la doctrina puede impedir recibir ciertos beneficios, incluido el SRP."
    ]
  },
  {
    number: "PVP-03",
    title: "Beneficios por participacion",
    content: "Si durante el mes acumulas mas ISK por asistencias del que te correspondia pagar como impuesto, la corporacion depositara la diferencia en tu cartera.",
    tag: "Beneficio",
    icon: "3",
    subrules: [
      "El excedente por participacion se paga directamente al jugador.",
      "La participacion constante reduce o cubre la obligacion mensual del impuesto PvP."
    ]
  },
  {
    number: "PVP-04",
    title: "Ship Replacement Program (SRP)",
    content: "Si usas una nave con doctrina oficial y la pierdes durante un CTA o evento oficial de la alianza, tendras derecho al SRP.",
    tag: "SRP",
    icon: "4",
    subrules: [
      "El SRP entrega el valor necesario en ISK o Void Coins para recuperar el seguro de la nave.",
      "El objetivo es dejar la nave nuevamente lista para futuros eventos PvP.",
      "Las Void Coins podran canjearse por ISK a traves del Director PvP o del CEO."
    ]
  },
  {
    number: "PVP-05",
    title: "Recompensas PvP informal",
    content: "Durante actividades PvP individuales, corporativas o informales, puedes recibir recompensas por kills obtenidas.",
    tag: "Recompensa",
    icon: "5",
    subrules: [
      "Las recompensas se solicitan al CEO o mediante el canal correspondiente en el Discord de la alianza.",
      "Estas recompensas se otorgan unicamente por kills, no por asistencias."
    ]
  },
  {
    number: "PVP-06",
    title: "Mejor Kill del Mes",
    content: "El Director PvP otorgara un premio mensual al jugador que consiga la mejor kill PvP informal del mes.",
    tag: "Premio",
    icon: "6",
    subrules: [
      "Son validas las destrucciones de naves y estructuras.",
      "No cuentan asistencias; unicamente el valor de la kill.",
      "El premio adicional es de 1.000 millones de ISK (1B).",
      "La recompensa se divide en partes iguales entre el piloto que realizo la kill y el piloto que figure como asistencia principal, cuando corresponda."
    ]
  },
  {
    number: "PVP-07",
    title: "Valor por asistencia",
    content: "La asistencia a eventos oficiales genera un credito en ISK que se utiliza para reducir el impuesto mensual.",
    tag: "Asistencia",
    icon: "7",
    subrules: [
      "Acorazado Doctrina o Tackler Doctrina (Fiend): 100 millones por asistencia.",
      "Monocalibre T1 o Nestor: 175 millones por asistencia.",
      "Versatiles, Bodyguard o Lancers: 250 millones por asistencia.",
      "Supercarrier: 2.000 millones (2B) por asistencia."
    ]
  },
  {
    number: "PVP-08",
    title: "Recompensas PvP informal de alianza",
    content: "Las recompensas de alianza aplican a kills realizadas contra pilotos grises o rojos.",
    tag: "Alianza",
    icon: "8",
    subrules: [
      "Subcapital: 5% del valor de la kill, con maximo de 250 millones.",
      "Capital: 10.000 millones (10B).",
      "Supercarrier: 50.000 millones (50B).",
      "Las recompensas por kills de Capitales y Supercarriers tienen limite mensual establecido por la alianza.",
      "Las recompensas se entregan a quienes primero realicen y reclamen la kill."
    ]
  },
  {
    number: "PVP-09",
    title: "Como reclamar una recompensa",
    content: "Para reclamar una recompensa PvP de la alianza se debe abrir un ticket en el Discord de SUS.",
    tag: "Reclamo",
    icon: "9",
    subrules: [
      "Selecciona la opcion Claim PPK.",
      "Adjunta la imagen de la kill.",
      "Espera la validacion por parte del equipo correspondiente."
    ]
  },
  {
    number: "PVP-10",
    title: "Consideraciones finales",
    content: "Participar en los CTA y eventos oficiales es la mejor manera de cumplir con la obligacion mensual del impuesto PvP.",
    tag: "Nota",
    icon: "10",
    subrules: [
      "Utilizar correctamente las doctrinas garantiza el acceso al programa SRP.",
      "Mantente al dia con tu saldo de asistencias mediante el Drive compartido por la corporacion.",
      "Ante cualquier duda o reclamacion, comunicate con el Director PvP o con el CEO."
    ]
  }
];

const allianceRules = [
  {
    number: "AL-PVE-01",
    title: "Resumen general PVE de alianza",
    content: "Todo piloto de The Usual Suspects (SUS) debe conocer quien es propietario de cada sistema y respetar las reglas PvE correspondientes.",
    tag: "General PVE",
    icon: "A1",
    subrules: [
      "En soberania de tu propia corporacion, sigue el reglamento de tu corporacion.",
      "En soberania de otra corporacion, no realices contenido PvE sin autorizacion.",
      "En sistemas Libre Para Todos (FFA) de SUS, coopera con los demas pilotos.",
      "No destruyas anomalias Base destinadas al farmeo."
    ]
  },
  {
    number: "AL-PVE-02",
    title: "Definicion de espacios PVE",
    content: "La alianza distingue entre Espacio Exclusivo, Espacio Libre Para Todos (FFA) y Espacio Abierto.",
    tag: "Territorio",
    icon: "A2",
    subrules: [
      "Espacio Exclusivo: sistema declarado exclusivo por una corporacion miembro o perteneciente a corporacion o alianza aliada azul, incluyendo vecinos o inquilinos.",
      "Si tienes dudas sobre la propiedad de un sistema, consulta con los pilotos residentes; si no responden, asume que es exclusivo.",
      "Espacio FFA: sistema bajo control de SUS, propio o NPC, que no haya sido designado como exclusivo.",
      "Consulta siempre el mapa oficial de la alianza para verificar la clasificacion.",
      "Espacio Abierto: cualquier sistema que no entre en las categorias anteriores."
    ]
  },
  {
    number: "AL-PVE-03",
    title: "Reglas para espacios exclusivos",
    content: "El propietario de un sistema exclusivo posee todos los derechos sobre el contenido PvE disponible en dicho sistema.",
    tag: "Exclusivo",
    icon: "A3",
    subrules: [
      "Esto incluye farmeo, mineria, anomalias y contenido generado.",
      "No esta permitido realizar actividades PvE en estos sistemas sin autorizacion expresa del propietario.",
      "Si recibes contenido generado exclusivamente para ti, como Encuentro, Gravimetrico o Evento, puedes ingresar si notificas al propietario, completas rapido y abandonas el sistema al terminar.",
      "Esta permitido minar recursos normales en un sistema exclusivo, pero el propietario puede pedirte que salgas en cualquier momento.",
      "Esta prohibida la mineria selectiva de recursos de alto valor, como Mercoxit Sniping; se considera infraccion entre aliados."
    ]
  },
  {
    number: "AL-PVE-04",
    title: "Reglas para espacios FFA",
    content: "En sistemas FFA se aplica, por norma general, el principio de primero que llega tiene prioridad.",
    tag: "FFA",
    icon: "A4",
    subrules: [
      "La regla aplica a contenido generado por el sistema, incluyendo FRP, SFRP y demas anomalias especiales.",
      "Si varios pilotos de SUS farmean el mismo sistema, se recomienda formar una unica flota.",
      "Si otro piloto solicita unirse antes de completar la primera sala u oleada, debe permitirse su participacion y compartir el botin.",
      "Cuando aparezca una anomalia especial, el FC o piloto lider decide si la flota tiene capacidad para realizarla.",
      "El botin se divide en partes iguales por jugador participante, no por cuentas, personajes o alters.",
      "Un miembro que llega tarde puede incorporarse, pero el FC puede excluirlo del reparto si no esta antes de la tercera oleada o tercera zona.",
      "En portales Nihilus Capital de corporaciones: con 2 portales debes abandonar y notificar; con 4 portales puedes participar libremente.",
      "Esta prohibido ingresar a anomalias generadas por POS cuando el portal de entrada y el POS sean visibles simultaneamente."
    ]
  },
  {
    number: "AL-PVE-05",
    title: "Escaneo y exploracion",
    content: "El escaneo esta permitido en sistemas de SUS o KRKD y en sistemas NPC completamente rodeados por soberania de SUS o KRKD.",
    tag: "Exploracion",
    icon: "A5",
    subrules: [
      "Esta prohibido escanear o explorar en sistemas de corporaciones aliadas, incluyendo vecinos e inquilinos.",
      "Quienes incumplan podran ser destruidos sin derecho a compensacion.",
      "La prioridad se rige por la regla Primero en el Grid.",
      "El primer piloto que llegue a la anomalia escaneada tiene derecho exclusivo sobre ella.",
      "Toda anomalia escaneada debe completarse y saquearse por completo.",
      "Esta prohibido recoger solo los contenedores de mayor valor y dejar el resto sin abrir."
    ]
  },
  {
    number: "AL-PVE-06",
    title: "Anomalias Base",
    content: "Las anomalias Base son el principal recurso de farmeo de la alianza y deben protegerse.",
    tag: "Base",
    icon: "A6",
    subrules: [
      "Esta prohibido disparar o completar anomalias Base en sistemas que no pertenezcan a tu corporacion sin autorizacion expresa del propietario.",
      "La regla aplica a sistemas exclusivos, sistemas FFA y sistemas NPC.",
      "La corporacion propietaria si puede destruir anomalias Base dentro de sus propios sistemas exclusivos.",
      "Una corporacion puede destruir anomalias Base en sistemas FFA para aprovechar mecanicas del juego, pero el abuso podra ser sancionado por la alianza."
    ]
  },
  {
    number: "AL-PVE-07",
    title: "Penalizaciones PVE de alianza",
    content: "Todas las infracciones deben reportarse al departamento de Pilot Service. Las multas maximas pueden reducirse segun circunstancias, gravedad, contexto e intencion.",
    tag: "Sancion",
    icon: "A7",
    subrules: [
      "Completar un Inquisitor: multa maxima de 1.000 millones (1B).",
      "Completar un ODS: multa maxima de 1.500 millones (1.5B).",
      "Completar un NDS generado por otra corporacion: multa maxima de 2.500 millones (2.5B).",
      "Completar un Quarry o Cantera: multa maxima de 2.000 millones (2B).",
      "Completar un FRP: multa maxima de 3.000 millones (3B).",
      "Completar un SFRP: multa maxima de 8.000 millones (8B).",
      "Completar un CNDS: multa maxima de 10.000 millones (10B) por sala.",
      "Las reincidencias pueden causar sanciones mas severas.",
      "La corporacion afectada recibe compensacion economica y el resto de la multa queda retenido por SUS."
    ]
  },
  {
    number: "AL-PVE-08",
    title: "Consideraciones finales PVE",
    content: "El objetivo del reglamento general PVE es garantizar una convivencia justa entre corporaciones miembros de la alianza.",
    tag: "Nota",
    icon: "A8",
    subrules: [
      "Respetar la soberania, colaborar con otros pilotos y cumplir las normas mantiene un ambiente organizado y beneficioso para toda la comunidad SUS."
    ]
  },
  {
    number: "AL-POS-01",
    title: "Principios generales POS",
    content: "Todas las POS deben registrarse mediante un ticket en el canal Outpost de Discord.",
    tag: "POS",
    icon: "P1",
    subrules: [
      "El impuesto mensual por POS lo paga el piloto propietario directamente a la alianza.",
      "El monto vigente se publica en el canal de pagos correspondiente."
    ]
  },
  {
    number: "AL-POS-02",
    title: "Definicion de espacios POS",
    content: "Para la politica POS se distinguen Espacio SUS, Espacio Vecino y Espacio Libre.",
    tag: "Territorio",
    icon: "P2",
    subrules: [
      "Espacio SUS incluye sistemas dentro de Cache, Insmother, Wicked Creek y Scalding Pass.",
      "Incluye sistemas con soberania de corporaciones miembros, corporaciones de soporte, sistemas vacios y sistemas NPC dentro de esas regiones.",
      "Espacio Vecino es cualquier sistema cuya soberania pertenezca a una corporacion o alianza que no forme parte de SUS/KRKD.",
      "Los pilotos de SUS no deben desplegar POS en sistemas vecinos.",
      "Espacio Libre es cualquier sistema fuera de las definiciones anteriores, incluyendo Great Wildlands, otras regiones NPC y espacio fuera de los limites SUS."
    ]
  },
  {
    number: "AL-POS-03",
    title: "Impuesto por POS",
    content: "Todo piloto con POS desplegada dentro del Espacio SUS debe pagar el impuesto mensual correspondiente.",
    tag: "Impuesto",
    icon: "P3",
    subrules: [
      "Los pagos pueden realizarse por adelantado hasta por seis meses.",
      "Los impuestos solo pueden pagarse mediante ISK o moneda interna COIN.",
      "Los pagos deben hacerse desde el personaje principal registrado en Discord y enviarse directamente a VOIDNomos.",
      "La cuenta receptora puede ser modificada por un Director o rango superior, con anuncio oficial en Discord y actualizacion del canal de pagos.",
      "Las corporaciones pueden cubrir el impuesto POS de sus pilotos.",
      "Si un piloto paga directamente, ese importe se descuenta de la factura mensual de la corporacion.",
      "Si un piloto no paga, la corporacion asume automaticamente ese costo."
    ]
  },
  {
    number: "AL-POS-04",
    title: "Reubicacion obligatoria de POS",
    content: "Si un sistema del Espacio SUS pasa a convertirse en Espacio Vecino, Internal & HR puede exigir la retirada de cualquier POS ubicada alli.",
    tag: "Reubicacion",
    icon: "P4",
    subrules: [
      "Si un sistema pasa a soberania exclusiva de una nueva corporacion aceptada dentro de SUS, Internal & HR puede solicitar la reubicacion de cualquier POS existente."
    ]
  },
  {
    number: "AL-POS-05",
    title: "Derechos de despliegue",
    content: "Una POS puede desplegarse y registrarse por ticket oficial si el sistema no pertenece a espacio exclusivo, vecino o de inquilinos.",
    tag: "Despliegue",
    icon: "P5",
    subrules: [
      "La corporacion propietaria de un sistema tiene prioridad para desplegar POS dentro de su soberania exclusiva.",
      "Como norma general, se solicita que los pilotos coloquen primero sus POS dentro del territorio de su propia corporacion.",
      "Si una POS se traslada dentro de la soberania exclusiva de la corporacion, el propietario o CEO debe actualizar el registro ante la alianza."
    ]
  },
  {
    number: "AL-POS-06",
    title: "Registro y responsabilidad",
    content: "Toda POS nueva o reubicada dentro del Espacio SUS debe registrarse oficialmente.",
    tag: "Registro",
    icon: "P6",
    subrules: [
      "El propietario es responsable del registro y del pago del impuesto correspondiente.",
      "El incumplimiento del registro puede sancionarse con multas de hasta 5.000 millones de ISK (5B).",
      "El departamento de Outpost puede exigir la reubicacion de la POS.",
      "Si un piloto no paga el impuesto mensual, la corporacion asume automaticamente el pago.",
      "Las POS fuera del Espacio SUS no necesitan registrarse ni pagan impuestos.",
      "Toda POS dentro del Espacio SUS debe permitir acceso a miembros de la alianza vigente.",
      "Si la POS esta dentro de soberania de otra alianza, tambien debe permitir acceso a miembros de la corporacion propietaria cuando lo soliciten.",
      "Si una POS es destruida o retirada, el propietario debe reportarlo por ticket en Discord; si no lo hace, el impuesto seguira generandose."
    ]
  },
  {
    number: "AL-POS-07",
    title: "Retiro de POS",
    content: "Las POS abandonadas o con impuestos pendientes pueden ser retiradas de forma obligatoria.",
    tag: "Retiro",
    icon: "P7",
    subrules: [
      "La alianza puede autorizar a un oficial a destruir una POS en Espacio SUS si permanece en bajo consumo durante 7 dias consecutivos y el propietario no responde notificaciones.",
      "Los impuestos previamente pagados no se reembolsan, aunque se reducira el impuesto futuro correspondiente a la corporacion.",
      "Una corporacion puede destruir cualquier POS dentro de su soberania que permanezca en bajo consumo durante 7 dias consecutivos.",
      "Antes de destruir una POS debe enviarse captura del bajo consumo y ticket a Internal & HR con al menos 72 horas de anticipacion.",
      "Internal & HR notificara al propietario o, en su defecto, al CEO de la corporacion.",
      "Una corporacion puede destruir la POS de uno de sus miembros si el piloto no pago el impuesto.",
      "Toda destruccion bajo estas reglas debe reportarse a Internal & HR para detener el cobro.",
      "El botin generado tras destruir una POS puede ser retenido por la alianza o la corporacion correspondiente."
    ]
  },
  {
    number: "AL-POS-08",
    title: "Defensa de POS",
    content: "Los temporizadores de defensa de POS seran establecidos por un miembro del equipo de Fleet Leads o rango superior.",
    tag: "Defensa",
    icon: "P8",
    subrules: [
      "Los horarios se publicaran en Discord y podran modificarse segun necesidades estrategicas de la alianza.",
      "La alianza no garantiza flotas de defensa para todas las POS.",
      "Si tu estacion es atacada, puedes solicitar apoyo mediante tu CEO o cualquier Fleet Commander disponible en Discord.",
      "Hay derecho a SRP si el Hull Timer fue configurado segun instrucciones oficiales, Guerra y/o tu corporacion no pudieron defender, y el impuesto estaba pagado.",
      "Para solicitar SRP por perdida de POS debe abrirse un ticket en el canal correspondiente."
    ]
  },
  {
    number: "AL-POS-09",
    title: "Consideraciones finales POS",
    content: "La politica POS busca mantener control ordenado de las estaciones dentro del territorio SUS, con distribucion justa del espacio, administracion correcta de impuestos y defensa organizada.",
    tag: "Nota",
    icon: "P9",
    subrules: [
      "Todo piloto debe mantener actualizada la informacion de su POS, cumplir sus obligaciones fiscales y respetar las decisiones de Outpost, Internal & HR y demas departamentos de la alianza."
    ]
  }
];

const ruleSections = [
  {
    id: "reglamento-pve",
    nav: "PVE",
    kicker: "Modulo PVE",
    title: "Reglamento PVE",
    copy: "Reglas oficiales para anomalias, farmeo, reportes, pilotos capitales, loot y sanciones PVE de SC2.",
    rules: pveRules
  },
  {
    id: "reglamento-pvp",
    nav: "PVP",
    kicker: "Modulo PVP",
    title: "Reglamento PVP",
    copy: "Reglas oficiales para impuesto PvP, doctrinas, SRP, asistencias, recompensas y reclamos de alianza.",
    rules: pvpRules
  },
  {
    id: "reglas-alianza",
    nav: "Alianza",
    kicker: "Modulo Alianza",
    title: "Reglas de la Alianza",
    copy: "Reglamentos generales de alianza para convivencia PVE, soberania, exploracion, POS, impuestos y defensa de activos.",
    actions: [
      { label: "Reglamento General PVE", href: "#/reglamento/reglas-alianza" },
      { label: "Politica POS", href: "#/reglamento/reglas-alianza" }
    ],
    rules: allianceRules
  }
];

export function renderRules() {
  return `
    <section class="rules-page">
      <aside class="rules-sidebar" aria-label="Menu de secciones del reglamento">
        <div class="rules-brand">
          <span class="rules-brand-mark">SC2</span>
          <div>
            <p>Heart Of The Swarm</p>
            <strong>Reglamento Oficial</strong>
          </div>
        </div>
        <nav class="rules-nav" aria-label="Navegacion del reglamento">
          <a class="rules-nav-link is-active" href="#/reglamento/inicio-reglamento" data-rules-nav="inicio-reglamento">Inicio</a>
          ${ruleSections.map((section) => `
            <a class="rules-nav-link" href="#/reglamento/${section.id}" data-rules-nav="${section.id}">
              ${section.nav}
            </a>
          `).join("")}
        </nav>
        <div class="rules-sidebar-status">
          <span class="status-light"></span>
          Sistema listo para nuevas directivas
        </div>
      </aside>

      <div class="rules-content">
        <section class="rules-hero reveal" id="inicio-reglamento" aria-labelledby="rules-title">
          <p class="eyebrow">Centro de Mando del Enjambre</p>
          <h1 id="rules-title">Reglamento Oficial</h1>
          <p>[SC2] Heart Of The Swarm</p>
          <span>Aqui encontraras las normas y contenedores oficiales de la corporacion.</span>
        </section>

        <section class="rules-search reveal" aria-label="Buscador del reglamento">
          <label class="rules-search-box" for="rules-search">
            <span class="search-glyph" aria-hidden="true"></span>
            <input id="rules-search" type="search" placeholder="Buscar en reglamento o secciones..." autocomplete="off" data-rules-search>
          </label>
        </section>

        ${ruleSections.map(renderRuleSection).join("")}
      </div>

      <button class="rules-scroll-top" type="button" data-rules-scroll-top aria-label="Volver arriba">
        Arriba
      </button>

      <template id="rule-card-template">
        <article class="rule-card">
          <header class="rule-card-header">
            <span class="rule-card-icon" data-rule-icon aria-hidden="true"></span>
            <div class="rule-title-group">
              <p class="rule-number" data-rule-number></p>
              <h3 data-rule-title></h3>
            </div>
            <span class="rule-tag" data-rule-tag></span>
          </header>
          <p class="rule-content" data-rule-content></p>
          <ul class="rule-subrules" data-rule-subrules></ul>
        </article>
      </template>
    </section>
  `;
}

export function initRules({ main }) {
  const controller = new AbortController();
  const { signal } = controller;
  const navLinks = Array.from(main.querySelectorAll("[data-rules-nav]"));
  const revealElements = Array.from(main.querySelectorAll(".reveal"));
  const searchInput = main.querySelector("[data-rules-search]");
  const scrollTopButton = main.querySelector("[data-rules-scroll-top]");
  const ruleTemplate = main.querySelector("#rule-card-template");

  const setActiveNavLink = (sectionId) => {
    navLinks.forEach((link) => {
      link.classList.toggle("is-active", link.dataset.rulesNav === sectionId);
    });
  };

  const createRuleCard = (rule) => {
    const card = ruleTemplate.content.firstElementChild.cloneNode(true);
    const icon = card.querySelector("[data-rule-icon]");
    const tag = card.querySelector("[data-rule-tag]");
    const subrules = card.querySelector("[data-rule-subrules]");

    card.dataset.searchable = normalizeForAttr([
      rule.number,
      rule.title,
      rule.content,
      rule.tag,
      ...(rule.subrules || [])
    ].join(" "));
    card.querySelector("[data-rule-number]").textContent = rule.number || "";
    card.querySelector("[data-rule-title]").textContent = rule.title || "";
    card.querySelector("[data-rule-content]").textContent = rule.content || "";
    icon.dataset.iconLabel = rule.icon || "i";
    tag.textContent = rule.tag || "Informacion";
    tag.dataset.tag = rule.tag || "Informacion";
    subrules.replaceChildren();

    (rule.subrules || []).forEach((subrule) => {
      const item = document.createElement("li");
      item.textContent = subrule;
      subrules.appendChild(item);
    });

    return card;
  };

  const mountRules = (containerName, rules) => {
    const container = main.querySelector(`[data-rule-container="${containerName}"]`);
    if (!container) {
      return;
    }

    const cards = rules.map(createRuleCard);
    container.replaceChildren(...cards);
    container.classList.toggle("empty-rule-zone", cards.length === 0);
  };

  ruleSections.forEach((section) => mountRules(section.id, section.rules));

  searchInput.addEventListener("input", () => {
    const term = normalizeText(searchInput.value);
    const searchable = Array.from(main.querySelectorAll("[data-searchable]"));

    searchable.forEach((node) => {
      const matches = !term || node.dataset.searchable.includes(term);
      node.classList.toggle("is-filtered-out", !matches);
    });
  }, { signal });

  scrollTopButton.addEventListener("click", () => {
    main.querySelector("#inicio-reglamento")?.scrollIntoView({ behavior: "smooth" });
  }, { signal });

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.16 });

  revealElements.forEach((element) => revealObserver.observe(element));

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        setActiveNavLink(entry.target.id);
      }
    });
  }, {
    rootMargin: "-42% 0px -48% 0px",
    threshold: 0
  });

  main.querySelectorAll(".rules-content section[id]").forEach((section) => {
    sectionObserver.observe(section);
  });

  window.addEventListener("scroll", () => {
    scrollTopButton.classList.toggle("is-visible", window.scrollY > 520);
  }, { passive: true, signal });

  window.ReglamentoCommandCenter = {
    createRuleCard,
    mountRules,
    exampleRuleData: ruleSections[0].rules[0]
  };

  return () => {
    controller.abort();
    revealObserver.disconnect();
    sectionObserver.disconnect();
    delete window.ReglamentoCommandCenter;
  };
}

function renderRuleSection(section) {
  return `
    <section class="rules-section reveal" id="${section.id}" aria-labelledby="${section.id}-title">
      <div class="rules-section-inner">
        <div class="rules-section-heading" data-searchable="${normalizeForAttr(`${section.kicker} ${section.title} ${section.copy}`)}">
          <p class="eyebrow">${section.kicker}</p>
          <h2 id="${section.id}-title">${section.title}</h2>
          <p>${section.copy}</p>
        </div>

        ${section.actions ? `
          <div class="alliance-actions">
            ${section.actions.map((action) => `
              <a class="alliance-button" href="${action.href}" data-searchable="${normalizeForAttr(action.label)}">
                ${action.label}
              </a>
            `).join("")}
          </div>
        ` : ""}

        <div
          class="rules-grid empty-rule-zone"
          data-rule-container="${section.id}"
          data-empty-label="Contenedor preparado para futuras tarjetas"
        ></div>
      </div>
    </section>
  `;
}

function normalizeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function normalizeForAttr(value) {
  return normalizeText(value).replace(/"/g, "&quot;");
}
