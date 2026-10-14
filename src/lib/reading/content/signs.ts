import type { ZodiacId } from '../../astro/zodiac';

interface Prompt {
  title: string;
  body: string;
}

export interface SignContent {
  /** Nouns for the generated profile title ("Die Entdeckerseele der Mitternacht"). */
  nouns: [string, string, string];
  identity: [string, string];
  strengths: Prompt[];
  tensions: Prompt[];
  growth: Prompt[];
  questions: [string, string, string];
  /** Cultural history of the constellation — about the symbol, not the visitor. */
  lore: string;
  axis: string;
  color: string;
  /** Brightest star of the constellation. */
  star: string;
  mantra: string;
}

export const SIGN_CONTENT: Record<ZodiacId, SignContent> = {
  aries: {
    nouns: ['Pionierseele', 'Feuerseele', 'Aufbruchsseele'],
    identity: [
      'Der Widder eröffnet den Tierkreis zur Frühlings-Tagundnachtgleiche – seine Symbolik ist die des Anfangs. Deine Sonne hier deutet auf eine Natur, die lebendig wird, wenn etwas begonnen werden will.',
      'Der Widder wartet nicht auf Erlaubnis. Astrologisch steht eine Widder-Sonne für ein inneres Feuer, das den direkten Weg wählt, und für Mut, der mit jedem Schritt wächst.',
    ],
    strengths: [
      { title: 'Initiative', body: 'Oft sagst du „Los geht’s“, während andere noch abwägen.' },
      { title: 'Mut unter Druck', body: 'Schwierige Momente machen dich eher wach als starr.' },
      { title: 'Ehrliche Direktheit', body: 'Du sagst, was du meinst – das klärt die Luft.' },
      { title: 'Neuanfang', body: 'Nach Rückschlägen fängst du oft schneller wieder an als andere.' },
      { title: 'Schützendes Feuer', body: 'Deine Energie setzt du gern für andere ein.' },
    ],
    tensions: [
      { title: 'Ungeduld', body: 'Wohin geht dein Frust, wenn die Welt zu langsam ist?' },
      { title: 'Anfangen vs. Beenden', body: 'Welcher deiner Anfänge wartet noch auf sein Ende?' },
      { title: 'Hitze des Moments', body: 'Was ändert sich, wenn du einer starken Reaktion einen Atemzug Zeit gibst?' },
      { title: 'Allein vorangehen', body: 'Wann wäre es mutig, um Hilfe zu bitten?' },
    ],
    growth: [
      {
        title: 'Mut zum Bleiben',
        body: 'Dein Wachstumsthema liegt vielleicht weniger im Anfangen als im Dranbleiben.',
      },
      { title: 'Sanfte Stärke', body: 'Entdecke, wie sich deine Kraft anfühlt, wenn sie leise und ohne Eile ist.' },
      { title: 'Erst hören, dann springen', body: 'Ein Moment des Zuhörens kann dein Feuer genauer ausrichten.' },
    ],
    questions: [
      'Was würdest du heute beginnen, wenn niemand zusähe?',
      'Wo in deinem Leben wirst du gebeten zu bleiben, statt neu anzufangen?',
      'Wie sieht Mut für dich aus, wenn er leise ist?',
    ],
    lore: 'Das Sternbild Widder wird in der griechischen Mythologie mit dem goldenen Widder verbunden, dessen Fell Jason und die Argonauten suchten. In der Antike lag die Frühlings-Tagundnachtgleiche in seinen Sternen – deshalb beginnt der westliche Tierkreis bis heute hier.',
    axis: 'Widder und Waage bilden die Achse von Ich und Du. Die Waage zeigt, wohin du wachsen kannst: Geduld mit dem Tempo anderer, Partnerschaft und die Stärke des Kompromisses.',
    color: 'Glutrot',
    star: 'Hamal',
    mantra: 'Ich beginne mit Mut und bleibe mit Anmut.',
  },
  taurus: {
    nouns: ['Hüterseele', 'Gärtnerseele', 'Erdseele'],
    identity: [
      'Der Stier ist der volle Frühling, wenn das Gepflanzte Wurzeln schlägt. Deine Sonne hier deutet auf eine Natur, die dem vertraut, was man anfassen, schmecken und langsam aufbauen kann.',
      'Der Stier geht in seinem eigenen Tempo – und das ist selten falsch. Astrologisch steht eine Stier-Sonne für Loyalität, sinnliche Intelligenz und ein feines Gespür dafür, was wirklich Wert hat.',
    ],
    strengths: [
      { title: 'Beständigkeit', body: 'Wenn andere wanken, machst du einfach weiter.' },
      { title: 'Sinnliche Klugheit', body: 'Du liest einen Raum, ein Essen oder eine Melodie mit dem ganzen Körper.' },
      { title: 'Geduld', body: 'Was du langsam aufbaust, hält lange.' },
      { title: 'Loyalität', body: 'Hast du dich einmal entschieden, ist deine Treue bemerkenswert.' },
      { title: 'Erdende Präsenz', body: 'Deine Ruhe senkt die Temperatur jedes Raums.' },
    ],
    tensions: [
      { title: 'Festhalten', body: 'Was hältst du fest, das dir längst alles gegeben hat?' },
      { title: 'Widerstand gegen Wandel', body: 'Was hilft dir, ungebetenem Wandel auf halbem Weg zu begegnen?' },
      { title: 'Komfort als Grenze', body: 'Wo ist Bequemlichkeit leise zur Decke geworden?' },
      { title: 'Unausgesprochenes', body: 'Welche Bedürfnisse hast du zu geduldig verschwiegen?' },
    ],
    growth: [
      {
        title: 'Fließende Stärke',
        body: 'Flexibilität ist nicht das Gegenteil von Stärke, sondern eine tiefere Form davon.',
      },
      { title: 'Wert ohne Besitz', body: 'Entdecke, was dir wertvoll ist und sich nicht besitzen lässt.' },
      { title: 'Das Neue einladen', body: 'Welche kleine Veränderung könntest du zu deinen Bedingungen hereinlassen?' },
    ],
    questions: [
      'Was in deinem Leben verdient mehr Geduld – und was weniger?',
      'Was würdest du bauen, wenn es hundert Jahre halten müsste?',
      'Welche einfache Freude hast du vergessen, dir zu gönnen?',
    ],
    lore: 'Im Stier liegen die Plejaden und die Hyaden, zwei der bekanntesten Sternhaufen am Himmel. In der griechischen Mythologie ist der Stier der verwandelte Zeus, der Europa übers Meer trägt. Sein roter Hauptstern Aldebaran heißt auf Arabisch „der Folgende“.',
    axis: 'Stier und Skorpion bilden die Achse von Halten und Verwandeln. Der Skorpion lädt dich zu Tiefe, Loslassen und Vertrauen in Veränderung ein.',
    color: 'Moosgrün',
    star: 'Aldebaran',
    mantra: 'Ich baue langsam und lasse Neues Wurzeln schlagen.',
  },
  gemini: {
    nouns: ['Botenseele', 'Erzählerseele', 'Brückenseele'],
    identity: [
      'Die Zwillinge kommen, wenn der Frühling in den Sommer übergeht und die Luft voller Samen und Stimmen ist. Deine Sonne hier deutet auf einen neugierigen, schnellen Geist, der aufblüht, wenn Ideen sich begegnen.',
      'Die Zwillinge sind ein Dialog, kein Monolog. Astrologisch steht eine Zwillinge-Sonne für Verbindung, Sprache und Spiel – und für eine Unruhe, die eigentlich Liebe zur Möglichkeit ist.',
    ],
    strengths: [
      { title: 'Neugier', body: 'Fast alles wird spannend, sobald deine Aufmerksamkeit darauf fällt.' },
      { title: 'Sprachgefühl', body: 'Du übersetzt mühelos zwischen Menschen, Ideen und Welten.' },
      { title: 'Leichtigkeit', body: 'Dein Humor öffnet Türen, die Ernst verschlossen hält.' },
      { title: 'Anpassungsfähigkeit', body: 'Neue Situationen beleben dich, statt dich zu verunsichern.' },
      { title: 'Brückenbauen', body: 'Du verbindest Menschen, die sich sonst nie begegnet wären.' },
    ],
    tensions: [
      { title: 'Zerstreuter Fokus', body: 'Welcher Faden lohnt sich bis zum Ende?' },
      { title: 'Rastlosigkeit', body: 'Was könnte dir Stille zeigen, das Bewegung nicht kann?' },
      { title: 'Oberfläche und Tiefe', body: 'Wo möchtest du tiefer gehen, auch wenn es langsamer wird?' },
      { title: 'Zwei Stimmen', body: 'Wenn deine inneren Stimmen streiten – welche gewinnt meistens?' },
    ],
    growth: [
      { title: 'Tiefe durch Hingabe', body: 'Wähle wenige Fragen und lebe lange mit ihnen.' },
      {
        title: 'Zuhören als Sprache',
        body: 'Entdecke die stille Hälfte der Kommunikation: zuhören, ohne die Antwort vorzubereiten.',
      },
      {
        title: 'Eine Geschichte, viele Seiten',
        body: 'Wie könnten deine vielen Seiten eine einzige Geschichte erzählen?',
      },
    ],
    questions: [
      'Welches Gespräch hat dich am meisten verändert – und warum?',
      'Welche Frage wirst du nie müde zu stellen?',
      'Wo verstreust du Energie, um einer wichtigen Entscheidung auszuweichen?',
    ],
    lore: 'Die Zwillinge sind nach Kastor und Pollux benannt, den Zwillingsbrüdern der griechischen Mythologie – einer sterblich, einer göttlich –, die ihre Unsterblichkeit teilten. Ihre beiden hellen Sterne stehen bis heute nebeneinander; Seeleute riefen sie als Beschützer an.',
    axis: 'Zwillinge und Schütze bilden die Achse von Information und Sinn. Der Schütze lädt dich ein, deine vielen Fragen zu einer größeren Haltung zu verbinden.',
    color: 'Helles Zitrin',
    star: 'Pollux',
    mantra: 'Ich folge meiner Neugier bis auf den Grund.',
  },
  cancer: {
    nouns: ['Gezeitenseele', 'Laternenseele', 'Heimatseele'],
    identity: [
      'Der Krebs beginnt zur Sommersonnenwende – auf der Nordhalbkugel dem längsten Tag, an dem sich das Licht nach innen wendet. Deine Sonne hier deutet auf eine Natur aus Gefühl und Erinnerung, mit dem Instinkt, Zartes zu schützen.',
      'Der Krebs trägt sein Zuhause mit sich. Astrologisch steht eine Krebs-Sonne für emotionale Intelligenz, Hingabe und stille Zähigkeit. Du spürst die Stimmung eines Raumes, bevor jemand spricht.',
    ],
    strengths: [
      { title: 'Emotionale Intelligenz', body: 'Du verstehst, was andere fühlen, bevor sie Worte finden.' },
      { title: 'Hingabe', body: 'Menschen, die du liebst, fühlen sich von dir getragen.' },
      { title: 'Erinnerung', body: 'Du bewahrst Geschichten, Rituale und Details, die einem Leben Textur geben.' },
      { title: 'Schutzinstinkt', body: 'Du schaffst Sicherheit für andere – oft unbemerkt.' },
      { title: 'Zähigkeit', body: 'Hinter der Weichheit steckt erstaunliche Ausdauer.' },
    ],
    tensions: [
      { title: 'Der Panzer', body: 'Wann ziehst du dich zurück – und was verpasst du dort?' },
      { title: 'Für alle sorgen', body: 'Wer kümmert sich um dich, wenn du dich um alle kümmerst?' },
      { title: 'In Erinnerungen leben', body: 'Welche Erinnerung lenkt deine Entscheidungen mehr, als dir lieb ist?' },
      { title: 'Unausgesprochene Stimmungen', body: 'Welche Gefühle würden leichter, wenn du sie aussprichst?' },
    ],
    growth: [
      { title: 'Fürsorge annehmen', body: 'Lass dich so großzügig halten, wie du andere hältst.' },
      { title: 'Zuhause in dir', body: 'Entdecke, was es heißt, überall in dir selbst zu Hause zu sein.' },
      { title: 'Freundliche Grenzen', body: 'Klare Grenzen können deine Zartheit schützen, ohne sie zu verstecken.' },
    ],
    questions: [
      'Wo fühlst du dich am meisten zu Hause – und was hat dieser Ort, was andere nicht haben?',
      'Wofür möchtest du von deinen engsten Menschen in Erinnerung bleiben?',
      'Welchen Teil deiner Vergangenheit bist du bereit zu würdigen und loszulassen?',
    ],
    lore: 'Der Krebs ist ein lichtschwaches Sternbild, das einen berühmten Sternhaufen verbirgt: die Krippe (Praesepe), in dunklen Nächten mit bloßem Auge sichtbar. In der griechischen Mythologie schickte Hera den Krebs, um Herakles im Kampf mit der Hydra abzulenken.',
    axis: 'Krebs und Steinbock bilden die Achse von Zuhause und Welt. Der Steinbock lädt dich zu Struktur, öffentlicher Wirkung und dem Mut ein, etwas Sichtbares aufzubauen.',
    color: 'Mondsilber',
    star: 'Al Tarf',
    mantra: 'Ich halte andere gut – und lasse mich halten.',
  },
  leo: {
    nouns: ['Sonnenseele', 'Herzensseele', 'Leuchtseele'],
    identity: [
      'Der Löwe ist Hochsommer, regiert von der Sonne selbst. Deine Sonne hier deutet auf eine Natur, die ausstrahlt – Wärme, Kreativität und Präsenz. Wo du dein Herz hinlegst, folgt oft das Licht.',
      'Der Löwe wird oft mit Stolz verwechselt, doch sein tieferes Symbol ist das Herz. Astrologisch steht eine Löwe-Sonne für Großzügigkeit, Loyalität und den Mut, gesehen zu werden.',
    ],
    strengths: [
      { title: 'Wärme', body: 'Menschen fühlen sich in deiner Nähe gesehen und willkommen.' },
      { title: 'Kreatives Feuer', body: 'Selbstausdruck fällt dir so leicht wie Atmen.' },
      { title: 'Großzügigkeit', body: 'Wenn du gibst, dann ganz und ohne zu zählen.' },
      { title: 'Ermutigung', body: 'Du inspirierst andere, indem du laut an sie glaubst.' },
      { title: 'Treues Herz', body: 'Du schützt die Menschen, die du liebst, mit Kraft und Beständigkeit.' },
    ],
    tensions: [
      { title: 'Anerkennung', body: 'Was passiert in dir, wenn deine Mühe unbemerkt bleibt?' },
      { title: 'Stolz', body: 'Welche Entschuldigung würde dich stärker machen?' },
      { title: 'Stärke spielen', body: 'Wer sieht dich, wenn du gerade nicht strahlst?' },
      { title: 'Rampenlicht', body: 'Wie könnte geteiltes Rampenlicht dein eigenes Licht vergrößern?' },
    ],
    growth: [
      { title: 'Licht ohne Publikum', body: 'Erschaffe aus Freude, unabhängig vom Applaus.' },
      { title: 'Verletzlicher Mut', body: 'Lass dich auch dann sehen, wenn du unsicher bist.' },
      { title: 'Andere erhellen', body: 'Wie kann deine Wärme jemand anderem zur eigenen Bühne verhelfen?' },
    ],
    questions: [
      'Was würdest du erschaffen, wenn es niemand je sähe?',
      'Wessen Licht hast du wachsen lassen – und wie fühlte sich das an?',
      'Wo versteckst du dein Herz hinter deiner Stärke?',
    ],
    lore: 'Der Löwe gehört zu den ältesten bekannten Sternbildern; schon mesopotamische Astronomen sahen hier einen Löwen. In der griechischen Mythologie ist es der Nemeische Löwe, den Herakles in seiner ersten Aufgabe bezwang. Sein hellster Stern Regulus bedeutet „kleiner König“.',
    axis: 'Löwe und Wassermann bilden die Achse von persönlichem Herz und Gemeinschaft. Der Wassermann lädt dich ein, dein Licht etwas Größerem zu schenken.',
    color: 'Sonnengold',
    star: 'Regulus',
    mantra: 'Ich strahle aus Freude – und erhelle den Weg für andere.',
  },
  virgo: {
    nouns: ['Handwerkerseele', 'Heilerseele', 'Kartografenseele'],
    identity: [
      'Die Jungfrau kommt zur Erntezeit, wenn Felder eingebracht und sortiert werden. Deine Sonne hier deutet auf einen Blick, der bemerkt, was andere übersehen, und auf Fürsorge, die sich in Können und Genauigkeit zeigt.',
      'Die Jungfrau hält eine Ähre – Symbol für Können, Ernte und Unterscheidungskraft. Astrologisch steht eine Jungfrau-Sonne für die Hingabe, Dinge gut zu machen, Detail für Detail.',
    ],
    strengths: [
      { title: 'Urteilskraft', body: 'Du siehst das eine Detail, das alles verändert.' },
      { title: 'Praktische Fürsorge', body: 'Deine Zuneigung zeigt sich in dem, was du für andere tust.' },
      { title: 'Können', body: 'Meisterschaft durch geduldiges Üben ist eine deiner stillen Freuden.' },
      { title: 'Verlässlichkeit', body: 'Man vertraut dir an, was wirklich zählt.' },
      { title: 'Analytische Klarheit', body: 'Komplexe Probleme werden ruhiger, sobald du sie ordnest.' },
    ],
    tensions: [
      { title: 'Perfektionismus', body: 'Was wird möglich, wenn „gut“ gut genug sein darf?' },
      { title: 'Innere Kritik', body: 'Mit wessen Stimme spricht deine innere Kritik eigentlich?' },
      { title: 'Sorgen', body: 'Welche deiner Sorgen gehören in die Gegenwart – und welche in eine erdachte Zukunft?' },
      { title: 'Zu viel geben', body: 'Wo lässt dich deine Hilfsbereitschaft leer zurück?' },
    ],
    growth: [
      { title: 'Ganz statt perfekt', body: 'Was ganz ist, ist oft unvollkommen – und genau richtig.' },
      { title: 'Sanftheit mit dir selbst', body: 'Schenke dir dieselbe Fürsorge, die du anderen gibst.' },
      {
        title: 'Dem großen Muster vertrauen',
        body: 'Deine Details gehören zu einer Geschichte, die größer ist als jeder Plan.',
      },
    ],
    questions: [
      'Was würdest du anders machen, wenn du darauf vertrautest, schon genug zu sein?',
      'Welches kleine tägliche Ritual macht dein Leben am meisten zu deinem eigenen?',
      'Wo könntest du Kontrolle abgeben und einfach beobachten?',
    ],
    lore: 'Die Jungfrau ist das zweitgrößte Sternbild am Himmel. Ihr hellster Stern Spica – lateinisch „Ähre“ – verbindet sie mit der Ernte. Die Figur wurde mit Göttinnen der Landwirtschaft und Gerechtigkeit verbunden, etwa Demeter und Astraea.',
    axis: 'Jungfrau und Fische bilden die Achse von Ordnung und Hingabe. Die Fische laden dich zu Vertrauen, Fantasie und dem Fließenlassen ein.',
    color: 'Weizen & Salbei',
    star: 'Spica',
    mantra: 'Ich pflege die Details und vertraue dem Ganzen.',
  },
  libra: {
    nouns: ['Harmonieseele', 'Diplomatenseele', 'Ästhetenseele'],
    identity: [
      'Die Waage beginnt zur Herbst-Tagundnachtgleiche, wenn Tag und Nacht im Gleichgewicht stehen. Deine Sonne hier deutet auf einen feinen Sinn für Harmonie, Schönheit und Fairness – du spürst, was eine Situation braucht, um stimmig zu sein.',
      'Die Waage ist das einzige Objekt unter den Tierkreissymbolen und steht für Urteil, Anmut und Beziehung. Astrologisch deutet eine Waage-Sonne auf einen Geist, der in Perspektiven denkt.',
    ],
    strengths: [
      { title: 'Diplomatie', body: 'Du findest Worte, mit denen sich zwei Seiten begegnen können.' },
      { title: 'Sinn für Ästhetik', body: 'Schönheit ist für dich kein Luxus, sondern Nahrung.' },
      { title: 'Fairness', body: 'Selbst kleine Ungerechtigkeiten berühren dich.' },
      { title: 'Partnerschaft', body: 'Du bringst das Beste in anderen hervor, weil du ihnen wirklich begegnest.' },
      { title: 'Anmut', body: 'Deine Präsenz macht schwierige Momente weicher.' },
    ],
    tensions: [
      { title: 'Unentschlossenheit', body: 'Welche Entscheidung schiebst du auf, um alle Türen offen zu halten?' },
      { title: 'Frieden um jeden Preis', body: 'Wann kostet dich das Friedenhalten deine eigene Stimme?' },
      { title: 'Spiegeln', body: 'Wer bist du, wenn dich niemand spiegelt?' },
      { title: 'Andere zuerst', body: 'Was willst du – bevor du an die Wünsche anderer denkst?' },
    ],
    growth: [
      { title: 'Balance in Bewegung', body: 'Echtes Gleichgewicht schließt Bewegung, Wahl und sogar Konflikt ein.' },
      { title: 'Mut zur Wahl', body: 'Eine klare Entscheidung kann Harmonie schaffen, statt sie zu bedrohen.' },
      { title: 'Inneres Gleichgewicht', body: 'Deine Balance darf aus dir selbst kommen, nicht nur von anderen.' },
    ],
    questions: [
      'Was würdest du wählen, wenn du es niemandem erklären müsstest?',
      'Welche Beziehung braucht mehr Ehrlichkeit und etwas weniger Harmonie?',
      'Wo fühlst du dich am meisten im Gleichgewicht – und was erzeugt dieses Gefühl?',
    ],
    lore: 'Schon babylonische Astronomen sahen in diesen Sternen eine Waage. Griechische Astronomen deuteten sie später als Scheren des benachbarten Skorpions – zwei Sterne tragen bis heute arabische Namen für „südliche“ und „nördliche Schere“ –, bevor die römische Tradition die Waage wieder etablierte.',
    axis: 'Waage und Widder bilden die Achse von Du und Ich. Der Widder lädt dich zu Direktheit, Eigenständigkeit und dem Mut ein, für deine Wünsche zu handeln.',
    color: 'Rosenquarz',
    star: 'Zubeneschamali',
    mantra: 'Ich wähle – und meine Wahl schafft Harmonie.',
  },
  scorpio: {
    nouns: ['Alchemistenseele', 'Sucherseele', 'Orakelseele'],
    identity: [
      'Der Skorpion kommt im tiefen Herbst, wenn Blätter fallen und Wurzeln im Dunkeln wachsen. Deine Sonne hier deutet auf eine Natur, die Tiefe sucht – Wahrheit unter der Oberfläche, echte Bindungen, Wandel bis auf den Grund.',
      'Der Skorpion ist nur eines seiner Symbole; Adler und Phönix gehören ebenso dazu. Astrologisch steht eine Skorpion-Sonne für Intensität, Loyalität und Verwandlung.',
    ],
    strengths: [
      { title: 'Tiefe', body: 'Du spürst, was unter Worten und Gesten liegt.' },
      { title: 'Resilienz', body: 'Wie ein Phönix gehst du aus schweren Kapiteln oft vollständiger hervor.' },
      { title: 'Treue', body: 'Deine Verbundenheit, einmal geschenkt, ist ganz.' },
      { title: 'Wahrnehmung', body: 'Wenig entgeht dir – vor allem nicht das Unausgesprochene.' },
      { title: 'Verwandelnde Kraft', body: 'Du hilfst anderen, sich dem zu stellen, was sie meiden.' },
    ],
    tensions: [
      { title: 'Kontrolle', body: 'Wie fühlt es sich an, eine Situation laufen zu lassen, ohne zu steuern?' },
      { title: 'Vertrauen', body: 'Wer hat dein Vertrauen verdient – und weiß es diese Person?' },
      { title: 'Alles oder nichts', body: 'Wo wäre ein Mittelweg klüger als ein Entweder-oder?' },
      { title: 'Alte Wunden', body: 'Welche alte Verletzung ist bereit, zu Weisheit zu werden?' },
    ],
    growth: [
      { title: 'Sanfte Macht', body: 'Offenheit kann stärker sein als Schutz.' },
      { title: 'Häutungen', body: 'Was bist du bereit loszulassen, damit Neues wachsen kann?' },
      { title: 'Geteilte Tiefe', body: 'Lass jemanden die Tiefe sehen, die du sonst für dich behältst.' },
    ],
    questions: [
      'Welche Wahrheit bist du bereit auszusprechen?',
      'Was hat dir deine schwerste Erfahrung geschenkt, das du nicht hergeben würdest?',
      'Wo könnte Vertrauen Kontrolle ersetzen?',
    ],
    lore: 'Der Skorpion ist eines der wenigen Sternbilder, die ihrem Namen wirklich ähneln; sein gebogener Schwanz zieht tief über den Südhorizont. In der griechischen Mythologie wurde er gegen den Jäger Orion geschickt – beide stehen seitdem auf gegenüberliegenden Seiten des Himmels. Sein Herz ist der rote Stern Antares, der „Rivale des Mars“.',
    axis: 'Skorpion und Stier bilden die Achse von Wandel und Stabilität. Der Stier lädt dich zu Einfachheit, sinnlicher Gegenwart und Frieden mit dem ein, was ist.',
    color: 'Granat & Obsidian',
    star: 'Antares',
    mantra: 'Ich lasse los, was ich nicht mehr brauche, und erhebe mich neu.',
  },
  sagittarius: {
    nouns: ['Entdeckerseele', 'Horizontseele', 'Wanderseele'],
    identity: [
      'Der Schütze trägt das Jahr zur Wintersonnenwende und ihren langen Nächten. Deine Sonne hier deutet auf einen Geist, der über den Horizont zielt – nach Sinn, Freiheit und der nächsten großen Frage.',
      'Der Schütze ist halb Mensch, halb Pferd: Denken und Instinkt laufen gemeinsam. Astrologisch steht eine Schütze-Sonne für Optimismus, Ehrlichkeit und Hunger nach Erfahrung.',
    ],
    strengths: [
      { title: 'Optimismus', body: 'Dein Glaube an Möglichkeiten trägt andere, wenn sie keinen Weg sehen.' },
      {
        title: 'Abenteuergeist',
        body: 'Neue Orte, Ideen und Menschen fühlen sich eher wie Zuhause an als wie Risiko.',
      },
      { title: 'Offenheit', body: 'Du sprichst aus, was andere nur denken.' },
      { title: 'Philosophischer Geist', body: 'Große Fragen begeistern dich, statt dich zu überfordern.' },
      { title: 'Weite', body: 'Du lässt Raum für die Ideen und Lebensweisen anderer.' },
    ],
    tensions: [
      { title: 'Rastlose Freiheit', body: 'Welche Verpflichtung könnte dich tatsächlich befreien?' },
      { title: 'Unverblümtheit', body: 'Wann braucht deine Ehrlichkeit etwas mehr Sorgfalt?' },
      { title: 'Anderswo', body: 'Was suchst du in der Ferne, das ganz nah sein könnte?' },
      { title: 'Versprechen', body: 'Welches deiner Versprechen verdient mehr Nachdruck?' },
    ],
    growth: [
      {
        title: 'Tiefe statt Weite',
        body: 'Finde einen ganzen Horizont an einem einzigen Ort, in einem Menschen oder einer Praxis.',
      },
      { title: 'Weisheit im Alltag', body: 'Sinn steckt auch in Routinen, nicht nur in Abenteuern.' },
      { title: 'Mit Sorgfalt zielen', body: 'Deine Worte können Wahrheit und Zärtlichkeit zugleich tragen.' },
    ],
    questions: [
      'Auf welchen Horizont gehst du zu – und was tust du, wenn du ankommst?',
      'Welche deiner Überzeugungen hat sich am stärksten verändert?',
      'Wo wäre Bleiben das größere Abenteuer?',
    ],
    lore: 'Der Schütze zeigt zum Zentrum unserer Galaxie: Hinter seinem Bogen liegen die dichtesten Sternwolken der Milchstraße. Seine hellsten Sterne bilden die Form, die man heute „Teekanne“ nennt. In der griechischen Tradition ist der Schütze ein Kentaur, oft mit dem weisen Chiron verbunden.',
    axis: 'Schütze und Zwillinge bilden die Achse von Sinn und Information. Die Zwillinge laden dich zu Neugier für Details, Gesprächen und der Weisheit des Nahen ein.',
    color: 'Tiefes Indigo',
    star: 'Kaus Australis',
    mantra: 'Ich finde den Horizont im Hier und Jetzt.',
  },
  capricorn: {
    nouns: ['Baumeisterseele', 'Gipfelseele', 'Architektenseele'],
    identity: [
      'Der Steinbock beginnt zur Wintersonnenwende – im Norden dem dunkelsten Punkt, von dem aus das Licht zurückkehrt. Deine Sonne hier deutet auf eine Natur, die aufbaut: geduldig, bewusst, mit Blick auf das, was in vielen Jahren noch steht.',
      'Die Meerziege erklimmt Berge und trägt doch die Erinnerung ans Meer. Astrologisch steht eine Steinbock-Sonne für Disziplin, Verantwortung und trockenen Humor. Mit der Zeit wirst du immer mehr du selbst.',
    ],
    strengths: [
      { title: 'Disziplin', body: 'Du machst weiter, wenn die Motivation längst still ist.' },
      { title: 'Strategischer Blick', body: 'Du siehst den langen Weg, nicht nur den nächsten Schritt.' },
      { title: 'Verantwortung', body: 'Andere verlassen sich auf dich, weil du wirklich lieferst.' },
      { title: 'Ausdauer', body: 'Harte Zeiten zeigen deine Stärke, statt sie zu schmälern.' },
      { title: 'Trockener Humor', body: 'Dein Witz macht auch ernste Arbeit leichter.' },
    ],
    tensions: [
      { title: 'Arbeit als Identität', body: 'Wer bist du, wenn du gerade nichts leistest?' },
      { title: 'Alles allein tragen', body: 'Wie wäre es, jemanden einen Teil der Last tragen zu lassen?' },
      { title: 'Starrheit', body: 'Welche deiner Regeln hat ihren Zweck überlebt?' },
      { title: 'Aufgeschobene Freude', body: 'Welche Freude schiebst du auf „später“?' },
    ],
    growth: [
      { title: 'Der Weg selbst', body: 'Finde Sinn im Aufstieg – und raste unterwegs.' },
      { title: 'Mauern weicher machen', body: 'Verletzlichkeit kann stärken, was du aufbaust.' },
      { title: 'Spielerischer Ehrgeiz', body: 'Wie sähen deine Ziele aus, wenn sie auch Spaß machen dürften?' },
    ],
    questions: [
      'Was baust du auf – und für wen eigentlich?',
      'Wann hast du dir zuletzt Ruhe gegönnt, ohne sie dir zu verdienen?',
      'Welche Art von Erfolg würde dein jüngeres Ich stolz machen?',
    ],
    lore: 'Der Steinbock hat Wurzeln in Mesopotamien, wo ein Ziegenfisch mit Enki (Ea) verbunden war, dem Gott des Süßwassers und der Weisheit. Vor rund zweitausend Jahren lag die Wintersonnenwende in diesen Sternen – daher der Name „Wendekreis des Steinbocks“.',
    axis: 'Steinbock und Krebs bilden die Achse von Welt und Zuhause. Der Krebs lädt dich zu Zärtlichkeit, Zugehörigkeit und dem Mut zu fühlen ein.',
    color: 'Schiefer & Bronze',
    star: 'Deneb Algedi',
    mantra: 'Ich steige mit Ziel und ruhe ohne Schuld.',
  },
  aquarius: {
    nouns: ['Visionärsseele', 'Erfinderseele', 'Freigeistseele'],
    identity: [
      'Der Wassermann kommt im Herzen des Winters, wenn die Luft klar ist und die Sterne scharf. Deine Sonne hier deutet auf einen Geist, der auf die Zukunft gestimmt ist – originell, unabhängig und Idealen treu, die ihrer Zeit voraus sein können.',
      'Der Wasserträger gießt sein Wissen für alle aus. Astrologisch steht eine Wassermann-Sonne für Freundschaft, Erfindungsgeist und einen starken Sinn für Gemeinschaft.',
    ],
    strengths: [
      { title: 'Originalität', body: 'Du siehst Lösungen, die andere noch nicht denken.' },
      { title: 'Unabhängigkeit', body: 'Dein Denken bleibt deins, auch unter Druck.' },
      { title: 'Gemeinsinn', body: 'Fairness für alle, nicht nur für wenige, ist dir wichtig.' },
      {
        title: 'Freundschaft',
        body: 'Du kannst sehr unterschiedlichen Menschen eine treue, offene Freundschaft schenken.',
      },
      { title: 'Klarheit', body: 'Auch im Gefühlssturm bleibt dein Blick ruhig und weit.' },
    ],
    tensions: [
      { title: 'Distanz', body: 'Wann hält dich deine Sachlichkeit weiter weg von Menschen, als du willst?' },
      { title: 'Rebellion als Selbstzweck', body: 'Welche Tradition wäre es wert, behalten zu werden?' },
      { title: 'Kopf vor Herz', body: 'Was weiß dein Herz, das deine Ideen noch nicht eingeholt haben?' },
      { title: 'Zugehörigkeit', body: 'Wo sehnst du dich nach Zugehörigkeit, während du abseits stehst?' },
    ],
    growth: [
      { title: 'Warme Ideale', body: 'Bring deine Vision in nahe, alltägliche Verbindung.' },
      { title: 'Dazugehören als du selbst', body: 'Suche Gemeinschaften, in denen Anderssein eine Stärke ist.' },
      { title: 'Fühlender Verstand', body: 'Gefühle können Erkenntnis sein, keine Störung.' },
    ],
    questions: [
      'Auf welche Zukunft arbeitest du still hin?',
      'Wo fühlst du dich am freiesten, ganz du selbst zu sein?',
      'Über welches Gefühl hast du nachgedacht, statt es zu fühlen?',
    ],
    lore: 'Der Wassermann liegt in einer Himmelsregion, die schon antike Astronomen mit Wasser verbanden – umgeben von den Fischen, dem Walfisch und dem Fluss Eridanus. In der griechischen Mythologie ist der Wasserträger Ganymed, der Mundschenk der Götter.',
    axis: 'Wassermann und Löwe bilden die Achse von Gemeinschaft und Herz. Der Löwe lädt dich zu Wärme, Spiel und dem Mut ein, dein eigenes Herz in die Mitte zu stellen.',
    color: 'Elektrisches Blau',
    star: 'Sadalsuud',
    mantra: 'Ich bringe meine Vision nah ans Herz.',
  },
  pisces: {
    nouns: ['Träumerseele', 'Dichterseele', 'Mystikerseele'],
    identity: [
      'Die Fische schließen den Tierkreis, wo sich jeder Zyklus auflöst, bevor er neu beginnt. Deine Sonne hier deutet auf große Fantasie und Empathie – offen für Schönheit, Gefühl und das, was sich kaum sagen lässt.',
      'Die zwei Fische schwimmen in entgegengesetzte Richtungen, verbunden durch ein einziges Band. Astrologisch steht eine Fische-Sonne für Mitgefühl, Intuition und Kreativität.',
    ],
    strengths: [
      { title: 'Empathie', body: 'Du fühlst, was andere fühlen – manchmal, als wäre es deins.' },
      { title: 'Fantasie', body: 'Deine Innenwelt ist weit, lebendig und großzügig.' },
      { title: 'Intuition', body: 'Du weißt Dinge, bevor du sagen kannst, woher.' },
      { title: 'Mitgefühl', body: 'Deine Güte erreicht Menschen, die andere aufgegeben haben.' },
      {
        title: 'Künstlerische Sensibilität',
        body: 'Musik, Bilder und Geschichten berühren dich tiefer als die meisten.',
      },
    ],
    tensions: [
      { title: 'Grenzen', body: 'Wo endest du – und wo beginnen andere?' },
      { title: 'Flucht', body: 'Wovor weichst du aus, wenn du wegdriftest?' },
      { title: 'Fremde Stimmungen', body: 'Welche Gefühle in dir gehören gerade vielleicht gar nicht dir?' },
      { title: 'Klarheit', body: 'Was würde passieren, wenn du heute klar „Nein“ sagst?' },
    ],
    growth: [
      { title: 'Geerdetes Träumen', body: 'Gib deinen Träumen Form, Zeit und Ort.' },
      { title: 'Mitfühlende Grenzen', body: 'Grenzen können deine Sensibilität schützen, statt sie zu schmälern.' },
      {
        title: 'Der inneren Flut vertrauen',
        body: 'Lass deine Intuition Entscheidungen leiten, nicht nur Stimmungen.',
      },
    ],
    questions: [
      'Welcher deiner Träume ist bereit, ein Plan zu werden?',
      'Wo brauchst du eine sanfte Grenze, um deine Zartheit zu schützen?',
      'Was sagt dir deine Intuition immer wieder, ohne dass du handelst?',
    ],
    lore: 'Die Fische sind groß, aber lichtschwach. In der griechischen Mythologie verwandelten sich Aphrodite und Eros in Fische, um vor dem Ungeheuer Typhon zu fliehen, und banden sich aneinander, um sich nicht zu verlieren. Heute liegt der Frühlingspunkt in den Fischen und wandert langsam Richtung Wassermann – daher das „Zeitalter des Wassermanns“.',
    axis: 'Fische und Jungfrau bilden die Achse von Hingabe und Ordnung. Die Jungfrau lädt dich zu Struktur, Unterscheidung und praktischer Fürsorge ein.',
    color: 'Meerglas-Türkis',
    star: 'Alpherg',
    mantra: 'Ich gebe meinen Träumen Form und meiner Zartheit eine Grenze.',
  },
};
