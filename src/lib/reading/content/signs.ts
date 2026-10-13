import type { ZodiacId } from '../../astro/zodiac';

interface Prompt {
  title: string;
  body: string;
}

export interface SignContent {
  /** Nouns for the generated profile title ("The Midnight Explorer"). */
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
    nouns: ['Pathfinder', 'Vanguard', 'Firebrand'],
    identity: [
      'Aries opens the zodiac at the March equinox, and its symbolism is the symbolism of beginnings: the first green shoot, the first step onto an unmarked path. Your Sun here suggests a nature that comes alive when something needs to be started — a readiness to move before the map is finished.',
      'The Ram does not wait for permission. Astrologically, an Aries Sun points to an inner flame that prefers the direct route, an honesty that can feel bracing, and a courage that grows the moment it is used. You may notice that you think most clearly while already in motion.',
    ],
    strengths: [
      {
        title: 'Initiative',
        body: 'You may be the one who says “let’s begin” while others are still weighing the risks.',
      },
      { title: 'Courage under pressure', body: 'Difficult moments might sharpen rather than freeze you.' },
      { title: 'Honest directness', body: 'Saying what you mean can be a gift that clears the air for everyone.' },
      { title: 'Renewal', body: 'Like spring itself, you may have a talent for starting again after a setback.' },
      { title: 'Protective fire', body: 'Your energy can be fiercely used on behalf of others.' },
    ],
    tensions: [
      { title: 'Impatience', body: 'When the pace of the world feels slow, where does your frustration go?' },
      { title: 'Starting vs. finishing', body: 'Which of your beginnings is still waiting for an ending?' },
      { title: 'The heat of the moment', body: 'What changes when you give a strong reaction one breath of space?' },
      { title: 'Going it alone', body: 'When might asking for help be its own form of courage?' },
    ],
    growth: [
      {
        title: 'The courage to stay',
        body: 'Your growth theme may lie less in starting and more in remaining — letting something you began reach its full form.',
      },
      { title: 'Gentle strength', body: 'Explore how your strength feels when it is quiet, unhurried and soft.' },
      {
        title: 'Listening before leaping',
        body: 'Consider how a moment of listening could aim your fire more precisely.',
      },
    ],
    questions: [
      'What would you begin today if you knew no one was watching?',
      'Where in your life are you being asked to stay rather than to start?',
      'What does courage look like for you when it is quiet?',
    ],
    lore: 'The constellation Aries is linked in Greek myth to the golden ram whose fleece Jason and the Argonauts set out to find. In antiquity the March equinox lay among its stars — which is why Western astrology still begins the zodiac here.',
    axis: 'Aries and Libra form the axis of self and other. Your opposite sign, Libra, holds qualities you might grow toward: patience with other people’s pace, the art of partnership and the quiet strength of compromise.',
    color: 'Ember red',
    star: 'Hamal',
    mantra: 'I begin with courage, and I stay with grace.',
  },
  taurus: {
    nouns: ['Keeper', 'Gardener', 'Anchor'],
    identity: [
      'Taurus is the season of full spring, when what was planted takes root. Your Sun here suggests a nature that trusts what can be touched, tasted and built slowly — a steadiness that others may lean on without ever saying so.',
      'The Bull moves at its own tempo, and that tempo is rarely wrong. Astrologically, a Taurus Sun speaks of loyalty, sensory intelligence and a deep instinct for value — knowing what is worth keeping and what is merely loud.',
    ],
    strengths: [
      { title: 'Steadfastness', body: 'When others waver, you may be the one who simply keeps going.' },
      { title: 'Sensory wisdom', body: 'You might read a room, a meal or a melody with your whole body.' },
      { title: 'Patience', body: 'Things built slowly with you tend to last.' },
      { title: 'Loyalty', body: 'Once you commit to a person or an idea, your devotion can be remarkable.' },
      { title: 'Grounding presence', body: 'Your calm may lower the temperature of any room you enter.' },
    ],
    tensions: [
      { title: 'Holding on', body: 'What are you keeping that has already given you everything it can?' },
      { title: 'Resistance to change', body: 'When change arrives uninvited, what helps you meet it halfway?' },
      { title: 'Comfort as a ceiling', body: 'Where might comfort have quietly become a limit?' },
      { title: 'Unspoken needs', body: 'Which of your needs have you been too patient to name?' },
    ],
    growth: [
      {
        title: 'Fluid strength',
        body: 'Your growth theme may be discovering that flexibility is not the opposite of strength, but a deeper form of it.',
      },
      { title: 'Value beyond possession', body: 'Explore what you value that can never be owned.' },
      { title: 'Welcoming the new', body: 'Consider which small change you could invite in — on your own terms.' },
    ],
    questions: [
      'What in your life deserves more of your patience — and what deserves less?',
      'What would you build if you knew it had to last a hundred years?',
      'Which simple pleasure have you forgotten to make time for?',
    ],
    lore: 'Taurus holds the Pleiades and the Hyades, two of the most storied star clusters in the sky. In Greek myth the bull is Zeus in disguise, carrying Europa across the sea. Its bright red star Aldebaran — from the Arabic for “the follower” — trails the Pleiades across the night.',
    axis: 'Taurus and Scorpio form the axis of what we hold and what we transform. Scorpio, your opposite, invites depth, the release of control and trust in change.',
    color: 'Moss green',
    star: 'Aldebaran',
    mantra: 'I build slowly, and I let the new take root.',
  },
  gemini: {
    nouns: ['Messenger', 'Storyteller', 'Translator'],
    identity: [
      'Gemini arrives as spring turns toward summer, when the air is full of seeds and voices. Your Sun here suggests a mind that moves like light through a prism — curious, quick, and happiest when ideas are allowed to meet.',
      'The Twins are a dialogue rather than a monologue. Astrologically, a Gemini Sun points to a gift for connection, language and play — and perhaps a restlessness that is really a love of possibility. You may hold more than one truth at a time without discomfort.',
    ],
    strengths: [
      { title: 'Curiosity', body: 'Almost anything can become fascinating once your attention lands on it.' },
      { title: 'Fluency', body: 'You might translate between people, ideas or worlds with surprising ease.' },
      { title: 'Lightness', body: 'Your humour can open doors that seriousness cannot.' },
      { title: 'Adaptability', body: 'New situations may energise you rather than unsettle you.' },
      { title: 'Bridge-building', body: 'You may be the link between people who would never otherwise have met.' },
    ],
    tensions: [
      { title: 'Scattered focus', body: 'Which thread is worth following all the way to its end?' },
      { title: 'Restlessness', body: 'What might stillness show you that movement cannot?' },
      { title: 'Surface and depth', body: 'Where would you like to go deeper, even if it means going slower?' },
      { title: 'Two voices', body: 'When your inner voices disagree, which one tends to win — and why?' },
    ],
    growth: [
      {
        title: 'Depth through devotion',
        body: 'Your growth theme may be choosing a few questions and living with them for a long time.',
      },
      {
        title: 'Listening as language',
        body: 'Explore the quiet half of communication: listening without preparing a reply.',
      },
      {
        title: 'One story, many sides',
        body: 'Consider how your many sides could become one story rather than many fragments.',
      },
    ],
    questions: [
      'Which conversation has changed you the most — and why?',
      'What is the one question you never tire of asking?',
      'Where do you scatter your energy to avoid a single, important choice?',
    ],
    lore: 'Gemini is named for Castor and Pollux, the twin brothers of Greek myth — one mortal, one divine — who chose to share immortality between them. Their two bright stars still stand side by side, and sailors once invoked them as protectors at sea.',
    axis: 'Gemini and Sagittarius form the axis of information and meaning. Sagittarius, your opposite, invites you to gather your many questions into a larger philosophy.',
    color: 'Pale citrine',
    star: 'Pollux',
    mantra: 'I follow my curiosity all the way down.',
  },
  cancer: {
    nouns: ['Guardian', 'Tide-Keeper', 'Lantern-Bearer'],
    identity: [
      'Cancer begins at the June solstice — in the northern sky, the longest day, the moment light turns inward. Your Sun here suggests a nature shaped by feeling and memory, with an instinct to protect what is tender and to make a home wherever you are.',
      'The Crab carries its shelter with it. Astrologically, a Cancer Sun speaks of emotional intelligence, devotion and quiet tenacity. You may sense the mood of a room before anyone speaks, and remember the small details that make others feel held.',
    ],
    strengths: [
      { title: 'Emotional intelligence', body: 'You might understand what others feel before they find the words.' },
      { title: 'Devotion', body: 'The people you love may feel truly carried by you.' },
      { title: 'Memory', body: 'You may keep the stories, rituals and small details that give a life its texture.' },
      { title: 'Protective instinct', body: 'You can create safety for others, sometimes without them noticing.' },
      { title: 'Tenacity', body: 'Behind the softness may sit a remarkable ability to hold on through difficulty.' },
    ],
    tensions: [
      { title: 'The shell', body: 'When do you retreat to protect yourself — and what might you miss there?' },
      { title: 'Caring for everyone', body: 'Who takes care of the caretaker?' },
      { title: 'Living in memory', body: 'Which memory still shapes your choices more than you would like?' },
      { title: 'Unspoken moods', body: 'Which feelings would grow lighter if you said them out loud?' },
    ],
    growth: [
      {
        title: 'Receiving care',
        body: 'Your growth theme may be letting yourself be held as generously as you hold others.',
      },
      { title: 'Home within', body: 'Explore what it means to feel at home inside yourself, wherever you are.' },
      {
        title: 'Kind boundaries',
        body: 'Consider how clear boundaries could protect your tenderness without hiding it.',
      },
    ],
    questions: [
      'Where do you feel most at home — and what does that place have that others do not?',
      'What would you like the people closest to you to remember you for?',
      'Which part of your past are you ready to thank and release?',
    ],
    lore: 'Cancer is a faint constellation that hides a famous star cluster, the Beehive (Praesepe), visible to the naked eye on dark nights. In Greek myth the crab was sent by Hera to distract Heracles during his battle with the Hydra, and was set among the stars for its loyalty.',
    axis: 'Cancer and Capricorn form the axis of home and world. Capricorn, your opposite, invites structure, public purpose and the confidence to build something visible.',
    color: 'Moonlit silver',
    star: 'Al Tarf',
    mantra: 'I hold others well, and I let myself be held.',
  },
  leo: {
    nouns: ['Sovereign', 'Luminary', 'Lionheart'],
    identity: [
      'Leo is high summer, ruled by the Sun itself. Your Sun here suggests a nature that radiates — warmth, creativity and a natural sense of presence. Where you put your heart, light tends to follow.',
      'The Lion is often read as pride, but its deeper symbol is the heart. Astrologically, a Leo Sun speaks of generosity, loyalty and the courage to be seen. You may feel most alive when you are making something that carries your signature.',
    ],
    strengths: [
      { title: 'Warmth', body: 'People may feel more seen and more welcome around you.' },
      { title: 'Creative fire', body: 'Self-expression may come to you as naturally as breathing.' },
      { title: 'Generosity', body: 'When you give, you might give fully and without counting.' },
      { title: 'Encouragement', body: 'You can inspire others simply by believing in them out loud.' },
      { title: 'Loyal heart', body: 'Your protection of those you love can be fierce and steady.' },
    ],
    tensions: [
      { title: 'The need for recognition', body: 'What happens inside you when your effort goes unseen?' },
      { title: 'Pride', body: 'Which apology or admission would actually make you stronger?' },
      { title: 'Performing strength', body: 'Who gets to see you when you are not shining?' },
      { title: 'Centre stage', body: 'How might sharing the spotlight expand your own light?' },
    ],
    growth: [
      {
        title: 'Light without an audience',
        body: 'Your growth theme may be creating for the joy of it, regardless of applause.',
      },
      { title: 'Vulnerable courage', body: 'Explore the bravery of letting yourself be seen when you feel uncertain.' },
      { title: 'Lighting others', body: 'Consider how your warmth could help someone else find their own stage.' },
    ],
    questions: [
      'What would you create if no one would ever see it?',
      'Whose light have you helped to grow — and how did that feel?',
      'Where are you hiding your heart behind your strength?',
    ],
    lore: 'Leo is one of the oldest recognised constellations; Mesopotamian astronomers already saw a lion in these stars. In Greek myth it is the Nemean lion, overcome by Heracles in his first labour. Its brightest star, Regulus, means “little king”.',
    axis: 'Leo and Aquarius form the axis of the individual heart and the collective. Aquarius, your opposite, invites you to offer your light to something larger than yourself.',
    color: 'Sun gold',
    star: 'Regulus',
    mantra: 'I shine for the joy of it, and I light the way for others.',
  },
  virgo: {
    nouns: ['Artisan', 'Healer', 'Cartographer'],
    identity: [
      'Virgo arrives at harvest time, when the fields are gathered and sorted. Your Sun here suggests a mind that notices what others overlook, and a heart that expresses care through usefulness, precision and craft.',
      'The Maiden holds an ear of wheat — a symbol of skill, harvest and discernment. Astrologically, a Virgo Sun speaks of devotion to doing things well. You may find meaning in refining, healing and improving, one careful detail at a time.',
    ],
    strengths: [
      { title: 'Discernment', body: 'You might see the one detail that changes everything.' },
      { title: 'Practical care', body: 'Your love may show itself in what you do, mend and prepare for others.' },
      { title: 'Craft', body: 'Mastery through patient practice may be one of your quiet joys.' },
      { title: 'Reliability', body: 'People may trust you with the things that truly matter.' },
      { title: 'Analytical clarity', body: 'Complex problems might grow calmer once you lay them out.' },
    ],
    tensions: [
      { title: 'Perfectionism', body: 'What becomes possible when “good” is allowed to be good enough?' },
      { title: 'The inner critic', body: 'Whose voice is your inner critic really speaking with?' },
      { title: 'Worry', body: 'Which of your worries belong to the present, and which to an imagined future?' },
      { title: 'Over-giving', body: 'Where does your helpfulness leave you depleted?' },
    ],
    growth: [
      {
        title: 'Wholeness over perfection',
        body: 'Your growth theme may be accepting that what is whole is often imperfect.',
      },
      {
        title: 'Gentleness with yourself',
        body: 'Explore offering yourself the same care you so naturally give to others.',
      },
      {
        title: 'Trusting the larger pattern',
        body: 'Consider how the details you tend might belong to a story larger than any plan.',
      },
    ],
    questions: [
      'What would you do differently if you trusted that you are already enough?',
      'Which small daily ritual makes your life feel most like your own?',
      'Where could you let go of control and simply observe?',
    ],
    lore: 'Virgo is the second-largest constellation in the sky. Its brightest star, Spica — Latin for “ear of grain” — ties it to the harvest. The figure has been linked with goddesses of agriculture and justice, among them Demeter and Astraea, said to be the last of the immortals to leave the Earth.',
    axis: 'Virgo and Pisces form the axis of order and surrender. Pisces, your opposite, invites trust, imagination and the wisdom of letting things flow.',
    color: 'Wheat & sage',
    star: 'Spica',
    mantra: 'I tend the details, and I trust the whole.',
  },
  libra: {
    nouns: ['Harmonist', 'Diplomat', 'Aesthete'],
    identity: [
      'Libra begins at the September equinox, when day and night stand in balance. Your Sun here suggests a nature attuned to harmony, beauty and fairness — a talent for sensing what a situation, a room or a relationship needs to feel right.',
      'The Scales are the only object among the zodiac’s symbols, and they speak of judgement, grace and relationship. Astrologically, a Libra Sun points to a mind that thinks in pairs and perspectives. You may understand people by understanding what lies between them.',
    ],
    strengths: [
      { title: 'Diplomacy', body: 'You might find the words that let two sides finally meet.' },
      { title: 'Aesthetic sense', body: 'Beauty may not be a luxury for you, but a kind of nourishment.' },
      { title: 'Fairness', body: 'Injustice, even small, may stir you deeply.' },
      { title: 'Partnership', body: 'You can bring out the best in others by truly meeting them.' },
      { title: 'Grace', body: 'Your presence may soften even difficult moments.' },
    ],
    tensions: [
      { title: 'Indecision', body: 'Which decision are you postponing to keep every door open?' },
      { title: 'Peace at any price', body: 'When does keeping the peace cost you your own voice?' },
      { title: 'Mirroring', body: 'Who are you when no one is reflecting you back?' },
      { title: 'Others first', body: 'What do you want — before you consider what anyone else might want?' },
    ],
    growth: [
      {
        title: 'Balanced, not still',
        body: 'Your growth theme may be discovering that true balance includes movement, choice and even conflict.',
      },
      {
        title: 'The courage to choose',
        body: 'Explore how a clear decision can create harmony rather than threaten it.',
      },
      {
        title: 'Inner equilibrium',
        body: 'Consider how your sense of balance could come from within rather than from others.',
      },
    ],
    questions: [
      'What would you choose if you did not have to explain it to anyone?',
      'Which relationship in your life asks for more honesty and a little less harmony?',
      'Where do you feel most in balance — and what creates that feeling?',
    ],
    lore: 'Babylonian astronomers already saw a balance in these stars. Greek astronomers later read them as the claws of the neighbouring Scorpion — two of its stars still carry Arabic names meaning “southern claw” and “northern claw” — before Roman tradition firmly re-established the Scales.',
    axis: 'Libra and Aries form the axis of other and self. Aries, your opposite, invites directness, independence and the courage to act on your own wants.',
    color: 'Rose quartz',
    star: 'Zubeneschamali',
    mantra: 'I choose — and my choices create harmony.',
  },
  scorpio: {
    nouns: ['Alchemist', 'Seeker', 'Oracle'],
    identity: [
      'Scorpio arrives in deep autumn, when leaves fall and roots grow quietly in the dark. Your Sun here suggests a nature drawn to depth — to truth beneath surfaces, to bonds that are real, to change that goes all the way through.',
      'The Scorpion is only one of its symbols; the eagle and the phoenix belong to it too. Astrologically, a Scorpio Sun speaks of intensity, loyalty and transformation. You may feel most yourself in conversations others would find almost too honest.',
    ],
    strengths: [
      { title: 'Depth', body: 'You might sense what lies beneath words, gestures and appearances.' },
      { title: 'Resilience', body: 'Like the phoenix, you may rise more complete after difficult chapters.' },
      { title: 'Devoted loyalty', body: 'Your commitment, once given, can be total.' },
      { title: 'Perception', body: 'Little escapes your attention — especially what remains unspoken.' },
      { title: 'Transformative power', body: 'You may help others face what they have been avoiding.' },
    ],
    tensions: [
      { title: 'Control', body: 'What would it feel like to let a situation unfold without steering it?' },
      { title: 'Trust', body: 'Who has earned your trust — and have you told them?' },
      { title: 'All or nothing', body: 'Where might a middle path be wiser than an absolute?' },
      { title: 'Old wounds', body: 'Which old hurt is ready to become wisdom?' },
    ],
    growth: [
      {
        title: 'Soft power',
        body: 'Your growth theme may be discovering that openness can be more powerful than protection.',
      },
      { title: 'Shedding skins', body: 'Explore what you are ready to release so that something new can grow.' },
      { title: 'Shared depth', body: 'Consider letting someone see the depth you usually keep private.' },
    ],
    questions: [
      'What truth are you ready to say out loud?',
      'What has your hardest experience given you that you would not trade?',
      'Where could trust replace control in your life?',
    ],
    lore: 'Scorpius is one of the few constellations that truly resembles its name, its curved tail sweeping low across southern horizons. In Greek myth the scorpion was sent against the hunter Orion — and the two were placed on opposite sides of the sky, so that Orion sets as the Scorpion rises. Its heart is the red star Antares, the “rival of Mars”.',
    axis: 'Scorpio and Taurus form the axis of transformation and stability. Taurus, your opposite, invites simplicity, sensual presence and peace with what is.',
    color: 'Garnet & obsidian',
    star: 'Antares',
    mantra: 'I release what I no longer need, and I rise renewed.',
  },
  sagittarius: {
    nouns: ['Voyager', 'Explorer', 'Archer'],
    identity: [
      'Sagittarius carries the year toward the December solstice and its longest nights in the north. Your Sun here suggests a spirit that aims beyond the horizon — toward meaning, freedom and the next great question.',
      'The Archer is half human, half horse: thought and instinct running together. Astrologically, a Sagittarius Sun speaks of optimism, honesty and a hunger for experience. You may feel most alive when your world is getting larger.',
    ],
    strengths: [
      { title: 'Optimism', body: 'Your belief in possibility may lift others when they cannot see a way forward.' },
      { title: 'Adventurous spirit', body: 'New places, ideas and people may feel like home rather than risk.' },
      { title: 'Candour', body: 'You might say the true thing that others are only thinking.' },
      { title: 'Philosophical mind', body: 'Big questions may excite rather than overwhelm you.' },
      { title: 'Generosity of spirit', body: 'You can make room for other people’s ideas and ways of life.' },
    ],
    tensions: [
      { title: 'Restless freedom', body: 'Which commitment might actually set you free?' },
      { title: 'Bluntness', body: 'When does your honesty need a little more care to land?' },
      { title: 'Elsewhere', body: 'What are you looking for far away that might be close at hand?' },
      { title: 'Promises', body: 'Which promise of yours deserves more follow-through?' },
    ],
    growth: [
      {
        title: 'Depth over distance',
        body: 'Your growth theme may be finding a whole horizon inside a single place, person or practice.',
      },
      {
        title: 'Wisdom in the ordinary',
        body: 'Explore how meaning can be found in routines, not only in adventures.',
      },
      {
        title: 'Aim with care',
        body: 'Consider how the arrow of your words and plans can carry both truth and tenderness.',
      },
    ],
    questions: [
      'What horizon do you keep walking toward — and what will you do when you arrive?',
      'Which belief of yours has changed the most over the years?',
      'Where could staying be the greater adventure?',
    ],
    lore: 'Sagittarius points toward the centre of our galaxy: the densest star clouds of the Milky Way lie behind the Archer’s bow. Its brightest stars form the shape modern stargazers call the Teapot. In Greek tradition the archer is a centaur, often linked with wise Chiron or with Crotus, said to have invented archery.',
    axis: 'Sagittarius and Gemini form the axis of meaning and information. Gemini, your opposite, invites curiosity for details, conversation and the wisdom of what is near.',
    color: 'Deep indigo',
    star: 'Kaus Australis',
    mantra: 'I find the horizon within the here and now.',
  },
  capricorn: {
    nouns: ['Architect', 'Mountaineer', 'Steward'],
    identity: [
      'Capricorn begins at the December solstice — in the north, the darkest point, from which the light returns. Your Sun here suggests a nature that builds: patiently, deliberately, with an eye on what will still stand in many years.',
      'The Sea-Goat climbs mountains yet carries the memory of the ocean. Astrologically, a Capricorn Sun speaks of discipline, responsibility and a dry, quiet humour. You may become more yourself with time, like a landscape shaped by seasons.',
    ],
    strengths: [
      { title: 'Discipline', body: 'You might keep going long after motivation has gone quiet.' },
      { title: 'Strategic vision', body: 'You may see the long path, not only the next step.' },
      { title: 'Responsibility', body: 'Others may rely on you because you actually follow through.' },
      { title: 'Endurance', body: 'Hard seasons might reveal your strength rather than diminish it.' },
      { title: 'Dry humour', body: 'Your wit can lighten even the most serious work.' },
    ],
    tensions: [
      { title: 'Work as identity', body: 'Who are you when you are not achieving?' },
      { title: 'Self-sufficiency', body: 'What would it mean to let someone carry part of the weight?' },
      { title: 'Rigidity', body: 'Which of your rules has outlived its purpose?' },
      { title: 'Deferred joy', body: 'Which pleasure are you postponing until “later”?' },
    ],
    growth: [
      {
        title: 'The climb itself',
        body: 'Your growth theme may be finding meaning in the climb, and resting on the way.',
      },
      { title: 'Softening the walls', body: 'Explore how vulnerability can strengthen what you build.' },
      { title: 'Playful ambition', body: 'Consider what your ambitions would look like if they were also fun.' },
    ],
    questions: [
      'What are you building — and who is it really for?',
      'When did you last allow yourself to rest without earning it?',
      'Which version of success would make your younger self proud?',
    ],
    lore: 'Capricornus has roots in Mesopotamia, where a goat-fish was linked to Enki (Ea), god of fresh water and wisdom. Greek myth often connects it with Pan, who leapt into a river and became half fish. Some two thousand years ago the December solstice fell in these stars — the origin of the name “Tropic of Capricorn”.',
    axis: 'Capricorn and Cancer form the axis of world and home. Cancer, your opposite, invites tenderness, belonging and the courage to feel.',
    color: 'Slate & bronze',
    star: 'Deneb Algedi',
    mantra: 'I climb with purpose, and I rest without guilt.',
  },
  aquarius: {
    nouns: ['Visionary', 'Inventor', 'Outrider'],
    identity: [
      'Aquarius arrives in the heart of the northern winter, when the air is clear and the stars are sharp. Your Sun here suggests a mind tuned to the future — original, independent, and loyal to ideals that may be ahead of their time.',
      'The Water-Bearer pours knowledge out for everyone. Astrologically, an Aquarius Sun speaks of friendship, invention and a strong sense of the collective. You may feel most yourself when you are a little unusual — and among people who welcome it.',
    ],
    strengths: [
      { title: 'Originality', body: 'You might see solutions others have not yet imagined.' },
      { title: 'Independence', body: 'Your thinking may stay your own, even under pressure.' },
      { title: 'Humanitarian spirit', body: 'Fairness for everyone, not just the few, may matter deeply to you.' },
      { title: 'Friendship', body: 'You can be a loyal, accepting friend to very different people.' },
      { title: 'Clarity', body: 'Even in emotional storms, your perspective may stay calm and wide.' },
    ],
    tensions: [
      { title: 'Distance', body: 'When does your objectivity keep people further away than you want?' },
      { title: 'Rebellion for its own sake', body: 'Which tradition might actually be worth keeping?' },
      { title: 'Head over heart', body: 'What does your heart know that your ideas have not yet caught up with?' },
      { title: 'Belonging', body: 'Where do you long to belong, even as you stand apart?' },
    ],
    growth: [
      { title: 'Warm ideals', body: 'Your growth theme may be bringing your vision into close, everyday connection.' },
      { title: 'Belonging as yourself', body: 'Explore communities where being different is a strength, not a cost.' },
      {
        title: 'The feeling mind',
        body: 'Consider how emotions can become a source of insight rather than interference.',
      },
    ],
    questions: [
      'What future are you quietly working toward?',
      'Where do you feel most free to be fully yourself?',
      'Which feeling have you been thinking about instead of feeling?',
    ],
    lore: 'Aquarius lies in a region of the sky that ancient astronomers associated with water, surrounded by the Fishes, the Sea Monster and the river Eridanus. Babylonian sources show a figure pouring water from a vessel; in Greek myth the water-bearer is Ganymede, cup-bearer of the gods.',
    axis: 'Aquarius and Leo form the axis of collective and individual. Leo, your opposite, invites warmth, play and the courage to put your own heart centre stage.',
    color: 'Electric blue',
    star: 'Sadalsuud',
    mantra: 'I bring my vision close to the heart.',
  },
  pisces: {
    nouns: ['Dreamer', 'Mystic', 'Poet'],
    identity: [
      'Pisces closes the zodiac, where every cycle dissolves before beginning again. Your Sun here suggests a nature of great imagination and empathy — porous to beauty, to feeling, and to what cannot quite be said.',
      'The two Fishes swim in opposite directions, bound by a single cord. Astrologically, a Pisces Sun speaks of compassion, intuition and creativity. You may sense connections between people and things long before you can explain them.',
    ],
    strengths: [
      { title: 'Empathy', body: 'You might feel what others feel, sometimes as if it were your own.' },
      { title: 'Imagination', body: 'Your inner world may be vast, vivid and generous.' },
      { title: 'Intuition', body: 'You may know things before you can say how you know them.' },
      { title: 'Compassion', body: 'Your kindness can reach people others have given up on.' },
      { title: 'Artistic sensitivity', body: 'Music, images and stories might move you more deeply than most.' },
    ],
    tensions: [
      { title: 'Boundaries', body: 'Where do you end and others begin?' },
      { title: 'Escape', body: 'What are you avoiding when you drift away?' },
      { title: 'Absorbing moods', body: 'Which feelings in you right now might not actually be yours?' },
      { title: 'Clarity', body: 'What would happen if you said a clear “no” today?' },
    ],
    growth: [
      { title: 'Anchored dreaming', body: 'Your growth theme may be giving your dreams a shape, a time and a place.' },
      {
        title: 'Compassionate boundaries',
        body: 'Explore how limits can protect your sensitivity rather than diminish it.',
      },
      { title: 'Trusting your inner tide', body: 'Consider how your intuition could guide decisions, not only moods.' },
    ],
    questions: [
      'Which dream of yours is ready to become a plan?',
      'Where do you need a gentle boundary to protect your tenderness?',
      'What does your intuition keep telling you that you have not yet acted on?',
    ],
    lore: 'Pisces is large but faint. In Greek myth Aphrodite and Eros became fish to escape the monster Typhon, tying themselves together so they would not lose each other. Today the March equinox lies in Pisces, slowly drifting toward Aquarius — the source of the phrase “the Age of Aquarius”.',
    axis: 'Pisces and Virgo form the axis of surrender and order. Virgo, your opposite, invites structure, discernment and practical care.',
    color: 'Sea-glass teal',
    star: 'Alpherg',
    mantra: 'I give my dreams a shape and my tenderness a boundary.',
  },
};
