/**
 * Canonical Rider-Waite-Smith meanings for all 78 cards.
 *
 * Source synthesis: A.E. Waite "The Pictorial Key to the Tarot" (1910),
 * Hajo Banzhaf "Tarot and the Journey of the Hero" (1996), Mary K. Greer
 * "21 Ways to Read a Tarot Card" (2006). Written in English to keep this
 * file the single source of truth; the AI prompt receives the relevant
 * entry as authoritative context and translates / contextualises it into
 * the user's response language.
 *
 * Each card has both UPRIGHT and REVERSED meanings, with four facets:
 *   - core       : one-line essence (what the card IS)
 *   - psychology : the inner state / archetypal pattern
 *   - advice     : practical guidance for action today
 *   - keywords   : 3–5 anchor words for quick recognition
 *
 * This is the canonical layer. AI adds contextual nuance (question,
 * Moon phase, day-of-week) on top of these meanings — it does NOT
 * invent the meaning itself.
 */

export interface CardMeaning {
  core: string;
  psychology: string;
  advice: string;
  keywords: string[];
}

export interface TarotCardCanon {
  upright: CardMeaning;
  reversed: CardMeaning;
}

/** Keyed by the lowercased English name with non-word characters stripped. */
export const TAROT_MEANINGS: Record<string, TarotCardCanon> = {
  // ═══ MAJOR ARCANA (0–21) ═══════════════════════════════════════════════════

  "the-fool": {
    upright: {
      core: "A leap of faith into the unknown. The beginning before reason catches up.",
      psychology: "Pure openness. Innocence not yet hurt by experience. Trust as a posture.",
      advice: "Take the step you've been overthinking. The path appears only when you walk it.",
      keywords: ["beginnings", "trust", "innocence", "leap", "spontaneity"],
    },
    reversed: {
      core: "Recklessness without preparation. Naivety used as an excuse for avoidance.",
      psychology: "Refusing to look at consequences. Childishness instead of childlike.",
      advice: "Slow down. The leap you're tempted to make is escape, not freedom.",
      keywords: ["recklessness", "naivety", "avoidance", "delay", "carelessness"],
    },
  },
  "the-magician": {
    upright: {
      core: "All four elements in your hands. The power to manifest is fully present.",
      psychology: "Conscious will aligned with skill. You are the channel and the tool.",
      advice: "Act. You have everything you need — stop waiting for permission.",
      keywords: ["manifestation", "willpower", "skill", "focus", "action"],
    },
    reversed: {
      core: "Power misused or untapped. Talent that talks but doesn't build.",
      psychology: "Self-deception, manipulation of others or yourself. The gap between can and do.",
      advice: "Stop performing competence — practise it. Honest work over clever words.",
      keywords: ["manipulation", "untapped talent", "self-deception", "trickery"],
    },
  },
  "the-high-priestess": {
    upright: {
      core: "The veiled wisdom. Knowing without proof. The inner voice that already knows.",
      psychology: "Receptive intelligence. Patience that listens before it speaks.",
      advice: "Don't decide today. The answer surfaces on its own — wait one more night.",
      keywords: ["intuition", "mystery", "inner knowing", "silence", "the unconscious"],
    },
    reversed: {
      core: "Ignored intuition. Surface noise drowning the deep voice.",
      psychology: "Disconnection from the inner compass. Listening to everyone but yourself.",
      advice: "Close one tab — your own. Five minutes of silence will say more than the timeline.",
      keywords: ["ignored intuition", "secrets withheld", "noise", "self-doubt"],
    },
  },
  "the-empress": {
    upright: {
      core: "Fertile abundance. The mother principle — creation through nurture.",
      psychology: "Sensual presence. Connection to the body, the earth, beauty without apology.",
      advice: "Tend to what you've planted. Feed it, water it, let it grow at its own pace.",
      keywords: ["abundance", "femininity", "creativity", "sensuality", "nurture"],
    },
    reversed: {
      core: "Smothering or self-neglect. Care that drains the carer.",
      psychology: "Either over-giving until empty, or refusing to receive at all.",
      advice: "Mother yourself first today. The well must refill before it pours.",
      keywords: ["self-neglect", "smothering", "creative block", "imbalance"],
    },
  },
  "the-emperor": {
    upright: {
      core: "Structure as protection. Authority earned through clarity and responsibility.",
      psychology: "The principle of order. The father who holds the boundary so others can grow.",
      advice: "Set the rule. Commit to it. Boundaries today are the freedom of tomorrow.",
      keywords: ["authority", "structure", "discipline", "leadership", "stability"],
    },
    reversed: {
      core: "Tyranny or absent leadership. Power without wisdom.",
      psychology: "Rigidity or collapse. Either too much control or refusing to take any.",
      advice: "Soften where you've gone rigid; firm up where you've gone soft. The middle holds.",
      keywords: ["tyranny", "rigidity", "lack of discipline", "abuse of power"],
    },
  },
  "the-hierophant": {
    upright: {
      core: "The bridge between heaven and earth. Tradition as teaching.",
      psychology: "Belonging to something larger. The wisdom passed down, the rite that holds.",
      advice: "Honour the lineage today. Old wisdom has the answer — ask someone who has lived it.",
      keywords: ["tradition", "teaching", "convention", "spiritual guidance", "institutions"],
    },
    reversed: {
      core: "Dogma rejected — or rebellion for its own sake. The teacher inside emerging.",
      psychology: "Breaking with inherited beliefs that no longer fit. Or stuck rebelling forever.",
      advice: "Question the rule, then choose your own. Both blind obedience and blind rebellion miss.",
      keywords: ["rebellion", "unconventional", "personal beliefs", "freedom from dogma"],
    },
  },
  "the-lovers": {
    upright: {
      core: "Sacred choice. Two becoming one — or the soul saying yes to itself.",
      psychology: "Alignment of heart and value. Choosing what mirrors your truth.",
      advice: "Choose what loves you back. The honest yes today saves a hundred goodbyes later.",
      keywords: ["love", "choice", "values", "union", "alignment"],
    },
    reversed: {
      core: "Misalignment. A choice made for the wrong reason — fear, lust, obligation.",
      psychology: "Internal conflict. Wanting two things that can't both be true.",
      advice: "Look at what you're calling love and ask if it would survive without the chaos.",
      keywords: ["misalignment", "conflict", "wrong choice", "imbalance"],
    },
  },
  "the-chariot": {
    upright: {
      core: "Will steering opposing forces. Victory through control of contradictions.",
      psychology: "Discipline of the inner team. The black and white sphinxes pulling together.",
      advice: "Hold the reins. Both sides of you can pull the same chariot if you decide today.",
      keywords: ["willpower", "victory", "control", "direction", "determination"],
    },
    reversed: {
      core: "Loss of direction. Driving without destination, or with two destinations.",
      psychology: "Self-sabotage. The mind pulls north, the heart pulls south, the chariot stops.",
      advice: "Pick one road for the next 7 days. The chariot moves only when the driver decides.",
      keywords: ["loss of control", "lack of direction", "scattered will", "self-sabotage"],
    },
  },
  "strength": {
    upright: {
      core: "Soft hand on the lion's jaw. Power through gentleness, not force.",
      psychology: "Inner courage that doesn't need to prove itself. Compassion as strength.",
      advice: "Don't break what scares you — befriend it. The lion responds to a steady hand.",
      keywords: ["courage", "compassion", "inner strength", "patience", "gentleness"],
    },
    reversed: {
      core: "Self-doubt or brute force. Either powerless or too forceful.",
      psychology: "Mistaking aggression for strength, or fear for weakness.",
      advice: "Real strength asks: 'what is the smallest, kindest thing I can do that still moves it?'",
      keywords: ["self-doubt", "weakness", "brute force", "fear"],
    },
  },
  "the-hermit": {
    upright: {
      core: "The lantern of solitude. Wisdom found by walking alone for a while.",
      psychology: "Withdrawal that integrates. The cave before the next teaching.",
      advice: "Be alone today. Not lonely — alone. The answer needs your full attention.",
      keywords: ["solitude", "introspection", "wisdom", "withdrawal", "inner guidance"],
    },
    reversed: {
      core: "Isolation that hardens. Withdrawal that becomes hiding.",
      psychology: "Loneliness disguised as independence. Or refusing to share what you've found.",
      advice: "Come back from the cave. The lantern is meant to light other people's paths too.",
      keywords: ["isolation", "loneliness", "withdrawal", "refusal to engage"],
    },
  },
  "wheel-of-fortune": {
    upright: {
      core: "The turning of cycles. What was down rises; what was up falls. Movement.",
      psychology: "Acceptance of what you cannot stop. Riding the wave instead of fighting it.",
      advice: "Don't try to steer the wheel. Steer yourself in relation to where it's already going.",
      keywords: ["cycles", "fate", "turning point", "change", "luck"],
    },
    reversed: {
      core: "Resisting the cycle. Trying to freeze what wants to move.",
      psychology: "Bad-luck stories. Stuck on the rim, refusing to see the spoke turn.",
      advice: "Stop reading omens. The wheel turns whether you bless it or curse it.",
      keywords: ["resistance to change", "bad luck", "stuck cycle", "delays"],
    },
  },
  "justice": {
    upright: {
      core: "The scales of truth. Cause and consequence balanced. The honest verdict.",
      psychology: "Clear seeing without sentiment. Responsibility for one's own actions.",
      advice: "Tell the truth today — even the small one. The scale corrects when you stop tilting it.",
      keywords: ["truth", "fairness", "responsibility", "cause and effect", "integrity"],
    },
    reversed: {
      core: "Unfair outcome or evaded responsibility. The lie carried too far.",
      psychology: "Bias, defensiveness, the refusal to see one's own part.",
      advice: "Where are you owed accountability? Where do you owe it? Today is for that conversation.",
      keywords: ["injustice", "evasion", "bias", "dishonesty", "imbalance"],
    },
  },
  "the-hanged-man": {
    upright: {
      core: "Pause by reversal. Seeing the world from a different angle. Voluntary surrender.",
      psychology: "The wisdom of stopping when everyone says go. New perspective from the upside-down.",
      advice: "Don't act. Don't decide. Hang in this moment — what looks unsolvable will rearrange.",
      keywords: ["pause", "surrender", "perspective shift", "letting go", "sacrifice"],
    },
    reversed: {
      core: "Resisting the necessary pause. Forcing forward when life asks you to suspend.",
      psychology: "Burnout from constant action. Refusing the still teacher.",
      advice: "What if doing nothing today is the most useful thing? Try it once and see.",
      keywords: ["stagnation", "resistance to pause", "wasted sacrifice", "indecision"],
    },
  },
  "death": {
    upright: {
      core: "The end that makes room. Necessary ending. The rose blooming after the bone.",
      psychology: "Letting go of identity that no longer fits. Initiation through release.",
      advice: "Bury what is already dead. Stop watering the rose that already turned to dust.",
      keywords: ["ending", "transformation", "release", "rebirth", "letting go"],
    },
    reversed: {
      core: "Resisting an ending that has already happened. Carrying the corpse.",
      psychology: "Refusing to grieve. Holding the form when the spirit has left.",
      advice: "Say goodbye out loud, even alone, even quietly. The grief is the door.",
      keywords: ["resistance to ending", "stagnation", "fear of change", "carrying weight"],
    },
  },
  "temperance": {
    upright: {
      core: "The angel pouring water between cups. The art of measured blending.",
      psychology: "Patience as alchemy. The right proportion at the right speed.",
      advice: "Don't pour the whole cup. Mix slowly, taste often, adjust the balance.",
      keywords: ["balance", "patience", "moderation", "alchemy", "integration"],
    },
    reversed: {
      core: "Excess or imbalance. Pouring too fast, mixing the wrong ingredients.",
      psychology: "Impatience with the slow process. Forcing a synthesis that won't take.",
      advice: "Where are you pushing too hard? The mixture sets when you stop stirring.",
      keywords: ["excess", "impatience", "imbalance", "wrong proportions"],
    },
  },
  "the-devil": {
    upright: {
      core: "The chain you forgot was loose. Bondage by belief. Material attachment.",
      psychology: "Shadow seen and named. The compulsion you keep returning to.",
      advice: "Look at the chain on your neck and notice — your hands are free. You can lift it off.",
      keywords: ["bondage", "addiction", "shadow", "materialism", "compulsion"],
    },
    reversed: {
      core: "Breaking the chain. The shadow integrated, the spell broken.",
      psychology: "Reclaiming power from what owned you. Awareness as freedom.",
      advice: "What did you used to do that you can stop doing now? That's the freedom you earned.",
      keywords: ["release", "breaking free", "shadow integration", "reclaiming power"],
    },
  },
  "the-tower": {
    upright: {
      core: "Lightning to the false structure. The sudden collapse of what was built on lies.",
      psychology: "Truth bursting through pretense. Revelation that cannot be unseen.",
      advice: "Don't rebuild today. Stand in the rubble. Look at what was actually true.",
      keywords: ["collapse", "revelation", "sudden change", "destruction", "awakening"],
    },
    reversed: {
      core: "The slower collapse, or fear of one that hasn't happened yet.",
      psychology: "Dread of the inevitable. Or numbness after the strike.",
      advice: "If the truth has already shown — face it. If it hasn't — stop borrowing the panic.",
      keywords: ["delayed disaster", "fear of change", "averted crisis", "denial"],
    },
  },
  "the-star": {
    upright: {
      core: "The light returning after the storm. Faith renewed, hope earned.",
      psychology: "Vulnerability as healing. The naked woman by the water — nothing to hide anymore.",
      advice: "Pour what you've carried back into the world. Trust again — gently, but trust.",
      keywords: ["hope", "renewal", "inspiration", "healing", "openness"],
    },
    reversed: {
      core: "Faith withheld. The star still shining, but the eyes turned away.",
      psychology: "Despair as habit. Refusing the medicine that's already in your hand.",
      advice: "Look up tonight. Literally. The light is the same as it was before you stopped seeing.",
      keywords: ["lost faith", "despair", "withheld hope", "disconnection"],
    },
  },
  "the-moon": {
    upright: {
      core: "The dream-light. Not yet clear, not yet dawn. The territory of intuition and illusion.",
      psychology: "What rises from the depths — fears, longings, dreams that demand attention.",
      advice: "Trust the dream tonight. The clarity comes at sunrise; for now, walk by feeling.",
      keywords: ["intuition", "illusion", "dreams", "the unconscious", "subtle fear"],
    },
    reversed: {
      core: "The fog lifting. Or the fear admitted and seen for what it was.",
      psychology: "What looked like a monster in the dark turning out to be a coat on a chair.",
      advice: "The thing you've been dreading — describe it on paper. It shrinks when named.",
      keywords: ["clarity returning", "facing fears", "released illusion", "truth surfacing"],
    },
  },
  "the-sun": {
    upright: {
      core: "Full daylight. The child on the horse — joy, vitality, nothing to hide.",
      psychology: "Aliveness without performance. The truth of being seen and being okay with it.",
      advice: "Do the thing that makes you feel most yourself today. That's the answer.",
      keywords: ["joy", "vitality", "success", "clarity", "wholeness"],
    },
    reversed: {
      core: "The sun dimmed by your own cloud. Joy briefly delayed, not denied.",
      psychology: "Temporary doubt of your own light. Forgetting how good the simple things are.",
      advice: "Step outside. Literally. Five minutes in the sun and the cloud thins.",
      keywords: ["delayed joy", "dimmed light", "temporary doubt", "shadow over success"],
    },
  },
  "judgement": {
    upright: {
      core: "The call to rise. A second chance offered, a true name remembered.",
      psychology: "The reckoning that frees — looking back to see clearly, then choosing differently.",
      advice: "Answer the call you've been ignoring. The next chapter doesn't open until you do.",
      keywords: ["calling", "rebirth", "second chance", "reckoning", "absolution"],
    },
    reversed: {
      core: "Refusing the call. Or judging yourself so harshly the rising can't begin.",
      psychology: "Self-condemnation. Or pretending the call wasn't for you.",
      advice: "Forgive yourself enough to stand up. Even the trumpet won't lift a body that won't move.",
      keywords: ["self-condemnation", "ignored call", "guilt", "refusal to rise"],
    },
  },
  "the-world": {
    upright: {
      core: "The cycle complete. Wholeness earned. The dancer in the wreath.",
      psychology: "Integration of all four elements. Knowing where you belong and standing there.",
      advice: "Take the bow today. Acknowledge what you've finished before you start the next thing.",
      keywords: ["completion", "wholeness", "integration", "achievement", "belonging"],
    },
    reversed: {
      core: "Almost finished, but not quite. The last piece resisted.",
      psychology: "Fear of closing — because closing means starting again.",
      advice: "What's the one small step left? Take it today. Let the cycle actually end.",
      keywords: ["incomplete", "stalled finish", "loose ends", "fear of closure"],
    },
  },

  // ═══ WANDS — Fire / will, action, passion, creative drive ══════════════════

  "ace-of-wands": {
    upright: {
      core: "The spark. The first match of a new fire — pure creative impulse.",
      psychology: "Excitement before strategy. The yes of the body to a possibility.",
      advice: "Strike now while the impulse is hot. Doubt is colder than action.",
      keywords: ["new energy", "inspiration", "spark", "creative start", "passion"],
    },
    reversed: {
      core: "Spark that won't catch. Energy without direction, or fear of igniting.",
      psychology: "Procrastination of the meaningful project. Stalled creative fire.",
      advice: "Stop polishing the matchbox. Light one match, see what burns.",
      keywords: ["delay", "creative block", "wasted spark", "hesitation"],
    },
  },
  "two-of-wands": {
    upright: {
      core: "The map in one hand, the globe in the other. The horizon chosen but not yet walked.",
      psychology: "Strategic vision. Knowing where you want to go, weighing how to begin.",
      advice: "Pick the route. Both options are valid — but only one is yours when you choose.",
      keywords: ["planning", "vision", "decision point", "horizons", "choice"],
    },
    reversed: {
      core: "Hesitation at the threshold. The map studied so long the journey never starts.",
      psychology: "Fear of commitment. The dream preferred to the doing.",
      advice: "Choose the direction that scares you slightly more. That's the real one.",
      keywords: ["hesitation", "fear of commitment", "indecision", "stuck in planning"],
    },
  },
  "three-of-wands": {
    upright: {
      core: "The ships dispatched. Now waiting for return — but with confidence.",
      psychology: "Patience after action. Trust that what was launched will come back changed.",
      advice: "You've done the work. Now watch the horizon — don't pull the ships back early.",
      keywords: ["expansion", "long-term vision", "waiting in trust", "ships sent out"],
    },
    reversed: {
      core: "Delayed return. The horizon stays empty longer than expected.",
      psychology: "Impatience corroding faith. Wondering if the ships will ever come back.",
      advice: "If a launch hasn't returned yet — don't relaunch. Hold steady and the news arrives.",
      keywords: ["delays", "impatience", "lost faith", "stalled return"],
    },
  },
  "four-of-wands": {
    upright: {
      core: "The garlanded gate. Celebration of a milestone. Home reached.",
      psychology: "Pride in what's been built. The pause to gather with people who held you.",
      advice: "Celebrate before you climb again. The summit reached is a real one — toast it.",
      keywords: ["celebration", "milestone", "home", "stability", "joy with community"],
    },
    reversed: {
      core: "The celebration delayed, or done without you. A hollow milestone.",
      psychology: "Skipping the joy because the next mountain already calls. Or feeling outside the circle.",
      advice: "Stop. Even alone, mark today. The wins not celebrated start to feel like nothing happened.",
      keywords: ["unmarked milestone", "exclusion", "delayed celebration", "instability"],
    },
  },
  "five-of-wands": {
    upright: {
      core: "Sticks crossed, no real war. The mock battle that sharpens, doesn't destroy.",
      psychology: "Productive friction. Five wills in a room, none yet dominant.",
      advice: "Stay in the conversation even when it gets loud. The clash is shaping something good.",
      keywords: ["conflict", "competition", "productive friction", "many voices"],
    },
    reversed: {
      core: "The fight that turns ugly. Or the battle avoided so long no one grows.",
      psychology: "Escalation past usefulness. Or peace bought by silence that costs the soul.",
      advice: "Either name the real disagreement, or walk away cleanly. Half-fights are the worst kind.",
      keywords: ["escalation", "avoided conflict", "real fight", "exhaustion"],
    },
  },
  "six-of-wands": {
    upright: {
      core: "The laurel crown. Visible victory recognised by others.",
      psychology: "Confidence earned, not borrowed. Taking the win with dignity.",
      advice: "Accept the praise today without deflecting. You actually did it.",
      keywords: ["victory", "recognition", "public success", "confidence", "leadership"],
    },
    reversed: {
      core: "The crown that doesn't fit, or applause that didn't come.",
      psychology: "Impostor feeling, or pride that turned to arrogance.",
      advice: "If the recognition came — receive it without inflating it. If it didn't — work continues.",
      keywords: ["lost recognition", "impostor feeling", "pride", "delayed victory"],
    },
  },
  "seven-of-wands": {
    upright: {
      core: "Standing on the high ground, defending what's yours.",
      psychology: "The courage to hold a position under pressure. Knowing your line.",
      advice: "Hold the boundary today. The pressure tests whether you really meant it — you do.",
      keywords: ["defence", "standing ground", "courage", "boundary", "perseverance"],
    },
    reversed: {
      core: "Defensive when the attack isn't real. Or surrendering ground that mattered.",
      psychology: "Exhausted from fighting phantoms. Or backing down from the right fight.",
      advice: "Is the threat actually here? If yes — hold. If no — put down the staff and rest.",
      keywords: ["exhaustion", "overwhelm", "surrender", "imagined threats"],
    },
  },
  "eight-of-wands": {
    upright: {
      core: "Eight arrows in flight. Swift movement, no obstacles, sudden arrivals.",
      psychology: "Velocity after stillness. The accumulated energy finally moving.",
      advice: "Strike while it's fast. News arrives, decisions land, things travel today.",
      keywords: ["speed", "movement", "sudden news", "momentum", "swift action"],
    },
    reversed: {
      core: "The arrows fall short, or hit the wrong target. Hasty messages misunderstood.",
      psychology: "Rushed action that misfires. Or sudden frustrating delay.",
      advice: "If something's stuck today — don't push harder. The arrows fly when the wind changes.",
      keywords: ["delays", "misfire", "miscommunication", "rushed mistakes"],
    },
  },
  "nine-of-wands": {
    upright: {
      core: "The wounded sentinel still on guard. One last battle remains.",
      psychology: "The resilience built from previous fights. Tired but standing.",
      advice: "Don't quit one step before the end. You've already done the hardest 90%.",
      keywords: ["resilience", "last stand", "boundary", "vigilance", "near victory"],
    },
    reversed: {
      core: "The guard overdone. Defences raised where no enemy is.",
      psychology: "Paranoia from past wounds. Or finally laying down the weapon.",
      advice: "Either the war is over — let it be over. Or you're tired — rest counts as strategy.",
      keywords: ["paranoia", "overdefence", "exhaustion", "release of vigilance"],
    },
  },
  "ten-of-wands": {
    upright: {
      core: "Ten heavy staves carried alone. Burden that crossed into too much.",
      psychology: "Responsibility taken too far. The need to put something down.",
      advice: "What can you delegate, drop, or finally finish? You weren't meant to carry it all.",
      keywords: ["burden", "responsibility", "overload", "heavy load"],
    },
    reversed: {
      core: "Releasing the load. Or burning out from refusing to release it.",
      psychology: "Either letting go and feeling the lightness — or collapsing under the weight.",
      advice: "If you're still carrying it — put it down. The world keeps spinning without your shoulder.",
      keywords: ["letting go", "burnout", "release", "collapse"],
    },
  },
  "page-of-wands": {
    upright: {
      core: "The young messenger of fire. Curious, restless, eager to start.",
      psychology: "Beginner's enthusiasm. The willingness to learn by trying and failing.",
      advice: "Try the new thing today, even badly. Pages are forgiven their mistakes.",
      keywords: ["curiosity", "new venture", "enthusiasm", "free spirit", "exploration"],
    },
    reversed: {
      core: "Restlessness without follow-through. The new fire that fizzles by lunch.",
      psychology: "Scattered attention. Drama-seeking instead of meaning-seeking.",
      advice: "Finish one small thing before starting two new ones. Excitement matures into focus.",
      keywords: ["scattered energy", "unfinished", "drama", "delays"],
    },
  },
  "knight-of-wands": {
    upright: {
      core: "Charging forward on a rearing horse. Bold, impatient, magnetic.",
      psychology: "Action over deliberation. The hero on the move, sometimes too fast.",
      advice: "Use the momentum, but check the bridle. Speed is good; direction is better.",
      keywords: ["action", "passion", "boldness", "movement", "impulsivity"],
    },
    reversed: {
      core: "The charge becomes reckless. Or stalls because the rider lost the path.",
      psychology: "Hot temper, hot pride, hot mistakes. Or burnout disguised as patience.",
      advice: "If you're charging — slow once and check the map. If you're stuck — get back on the horse.",
      keywords: ["recklessness", "haste", "stalled passion", "temper"],
    },
  },
  "queen-of-wands": {
    upright: {
      core: "The sunflower in the sun. Confident, warm, magnetic, fully herself.",
      psychology: "Sovereign presence. Owning your space without diminishing anyone.",
      advice: "Show up today as the most-you version of you. The room shifts to meet you.",
      keywords: ["confidence", "magnetism", "warmth", "self-possession", "vitality"],
    },
    reversed: {
      core: "Sovereignty wobbled. Confidence turned brittle or theatrical.",
      psychology: "Insecurity dressed as bravado. Or jealousy where there should be solidarity.",
      advice: "Don't perform confidence — find one quiet thing you genuinely love, and start there.",
      keywords: ["insecurity", "jealousy", "performance", "lost vitality"],
    },
  },
  "king-of-wands": {
    upright: {
      core: "The visionary leader. Fire mastered, vision clear, action wise.",
      psychology: "Authority earned. The mature creative will that others trust to follow.",
      advice: "Lead the conversation today. Your vision is needed; speak it cleanly.",
      keywords: ["leadership", "vision", "mastery", "authority", "natural charisma"],
    },
    reversed: {
      core: "Authority misused, or vision turned to ego.",
      psychology: "Burnout from leading too much, too long. Or arrogance disconnected from reality.",
      advice: "If you've been driving everyone — let someone else lead today. The fire returns in rest.",
      keywords: ["arrogance", "burnout", "tyrant", "ungrounded vision"],
    },
  },

  // ═══ CUPS — Water / emotion, love, relationships, intuition ════════════════

  "ace-of-cups": {
    upright: {
      core: "The first overflow. The cup of pure feeling beginning to pour.",
      psychology: "Emotional opening. Love that finds its source again — for self, another, or life.",
      advice: "Let yourself feel today, even the soft tears. The cup is full because you let it be.",
      keywords: ["new love", "emotional opening", "compassion", "intuition", "renewal"],
    },
    reversed: {
      core: "The cup overturned. Feeling withheld, or grief still pooling.",
      psychology: "Emotional shutdown. Or the love offered that has nowhere to land.",
      advice: "Where have you closed? Open one degree today. The cup refills from inside, not outside.",
      keywords: ["blocked feeling", "withheld love", "grief", "emotional numbness"],
    },
  },
  "two-of-cups": {
    upright: {
      core: "Two cups meeting between two beings. Mutual recognition.",
      psychology: "The yes between two souls — romantic, friendly, creative. Equal exchange.",
      advice: "Honour the connection today. Say the thing that matters out loud to the person who matters.",
      keywords: ["union", "partnership", "mutual recognition", "love", "harmony"],
    },
    reversed: {
      core: "The exchange uneven, or the connection misread.",
      psychology: "One-sided love. Or projection mistaken for partnership.",
      advice: "Look at what's actually being given vs. what you imagine. The honest answer is freeing.",
      keywords: ["imbalance", "projection", "miscommunication", "broken connection"],
    },
  },
  "three-of-cups": {
    upright: {
      core: "Three friends toasting. Joy multiplied by shared presence.",
      psychology: "The pure pleasure of belonging. The circle that holds laughter.",
      advice: "Be with your people today. The ones who refill you simply by being near.",
      keywords: ["celebration", "friendship", "joy", "community", "shared abundance"],
    },
    reversed: {
      core: "The party that empties you. Or the circle you no longer fit.",
      psychology: "Loneliness in a crowd. Or overindulgence as escape from real intimacy.",
      advice: "Decline the gathering that drains you. Choose the one quiet friend over many noisy ones.",
      keywords: ["disconnection", "overindulgence", "loneliness in crowds", "shallow ties"],
    },
  },
  "four-of-cups": {
    upright: {
      core: "Three cups offered, a fourth ignored. Apathy in front of abundance.",
      psychology: "The boredom of having. Looking past the gift to the imagined absence.",
      advice: "Look at what's right in front of you. The fourth cup is waiting to be noticed.",
      keywords: ["apathy", "discontent", "missed opportunity", "withdrawal", "reflection"],
    },
    reversed: {
      core: "Coming out of the fog. Re-seeing what was always there.",
      psychology: "The mood lifting. Curiosity returning after a long emotional pause.",
      advice: "If something has caught your interest this week — follow it. The fog is lifting on purpose.",
      keywords: ["renewed interest", "engagement", "stepping out", "new clarity"],
    },
  },
  "five-of-cups": {
    upright: {
      core: "Three cups spilled, two still standing. Grief that hasn't yet noticed what remains.",
      psychology: "The mourning that absorbs the whole field of view. Tunnel vision of loss.",
      advice: "Turn around. Two cups are still upright behind you. The story isn't only what was lost.",
      keywords: ["grief", "loss", "regret", "missed remainder", "tunnel vision"],
    },
    reversed: {
      core: "The turn — finally seeing the standing cups.",
      psychology: "Grief integrating. The horizon widening again after long focus on loss.",
      advice: "Acknowledge what survived. The two cups behind you carry the whole future.",
      keywords: ["acceptance", "moving forward", "found resilience", "integrated grief"],
    },
  },
  "six-of-cups": {
    upright: {
      core: "The child offering flowers. Memory as gift, innocence as wisdom.",
      psychology: "Nostalgia tender, not heavy. The past visiting kindly.",
      advice: "Call the person from before. Or just look at the old photo. The past wants to bless you today.",
      keywords: ["nostalgia", "childhood", "innocence", "old connections", "tender memory"],
    },
    reversed: {
      core: "Stuck in the past. Or releasing it at last.",
      psychology: "Living in memory instead of presence. Or the long-held memory finally let go.",
      advice: "If a story keeps replaying — try writing it once, then closing the notebook for good.",
      keywords: ["stuck in past", "letting go", "outgrown memory", "release"],
    },
  },
  "seven-of-cups": {
    upright: {
      core: "Seven cups in clouds — too many choices, half of them illusion.",
      psychology: "Imagination overstocked. The mind wandering instead of committing.",
      advice: "Pick one cup. Most of the others are smoke. Reality narrows joyfully when you decide.",
      keywords: ["illusion", "too many choices", "fantasy", "scattered focus", "daydream"],
    },
    reversed: {
      core: "The fog clearing. The real choice visible at last.",
      psychology: "Discernment returning. Knowing which fantasy was the real direction.",
      advice: "The choice you keep coming back to even after dismissing it — that's the one.",
      keywords: ["clarity", "decisive choice", "released fantasy", "discernment"],
    },
  },
  "eight-of-cups": {
    upright: {
      core: "Walking away from a row of full cups. The leaving that takes courage.",
      psychology: "Knowing when 'enough' is actually too little. The quiet exit.",
      advice: "What are you ready to walk away from? The cups will stay; you don't have to drink them all.",
      keywords: ["walking away", "deeper search", "withdrawal", "quiet courage"],
    },
    reversed: {
      core: "The leaving postponed. Or returning to what you already left.",
      psychology: "Cold feet at the threshold. Or rejoining for the wrong reason.",
      advice: "Either go all the way — or stay and stop pretending you'll leave. Halfway is corrosive.",
      keywords: ["hesitation", "return", "fear of leaving", "stuck threshold"],
    },
  },
  "nine-of-cups": {
    upright: {
      core: "The smiling host with everything achieved. The wish granted.",
      psychology: "Satisfaction that is real, even if quiet. The good day acknowledged.",
      advice: "Receive the good thing today without bracing. It came; you can let yourself enjoy it.",
      keywords: ["satisfaction", "wish fulfilled", "contentment", "emotional fullness"],
    },
    reversed: {
      core: "The wish granted but hollow. Or the wish not quite materialised.",
      psychology: "Mistaking pleasure for joy. Or the goal achieved that didn't taste like you expected.",
      advice: "If the win felt empty — ask what you actually wanted. The next wish will be more honest.",
      keywords: ["hollow satisfaction", "smugness", "deferred joy", "unmet wish"],
    },
  },
  "ten-of-cups": {
    upright: {
      core: "The rainbow over the family. Lasting emotional fulfilment, the circle of love.",
      psychology: "The wholeness that comes from belonging — chosen or born.",
      advice: "Acknowledge the love you do have today. The rainbow is overhead; look up.",
      keywords: ["family", "fulfilment", "harmony", "lasting love", "the circle"],
    },
    reversed: {
      core: "The picture frayed. The circle that doesn't actually hold.",
      psychology: "Pretending the rainbow is there when the storm hasn't passed. Or longing for what isn't.",
      advice: "Address the real fracture in the chosen family. Pretending it's whole keeps it broken.",
      keywords: ["broken harmony", "family discord", "false picture", "missing closeness"],
    },
  },
  "page-of-cups": {
    upright: {
      core: "The dreamy messenger. A small surprise from the heart.",
      psychology: "Openness to feeling. Curious about love, art, intuition without cynicism.",
      advice: "Pay attention to the small tender signal today. A message, a memory, a hint — follow it.",
      keywords: ["sensitivity", "creative impulse", "emotional message", "openness", "dreaminess"],
    },
    reversed: {
      core: "The page sulking. Hurt feelings out of proportion to the cause.",
      psychology: "Emotional immaturity, oversensitivity, or fear of feeling.",
      advice: "Notice if today's reaction is from now or from then. Most often it's from then.",
      keywords: ["moodiness", "oversensitivity", "blocked creativity", "emotional immaturity"],
    },
  },
  "knight-of-cups": {
    upright: {
      core: "The romantic knight bringing the chalice. Idealism in motion.",
      psychology: "The heart riding out into the world. Charm, art, devotion in action.",
      advice: "Make the romantic gesture. Send the message you've been drafting. Beauty rewards the brave.",
      keywords: ["romance", "idealism", "emotional offering", "creativity in motion"],
    },
    reversed: {
      core: "Charm without substance. Or love letters never sent.",
      psychology: "The romantic who never delivers. Or the dreamer afraid of real intimacy.",
      advice: "Match the words to the deeds. Or stop the words. Halfway romance is the cruelest.",
      keywords: ["false charm", "broken promises", "moodiness", "intimacy avoidance"],
    },
  },
  "queen-of-cups": {
    upright: {
      core: "The queen on the seashore. Deeply feeling, deeply attuned, fully contained.",
      psychology: "Emotional mastery. The wisdom to feel everything without drowning in it.",
      advice: "Trust your read of the room today. You see what others miss — and you can hold it gently.",
      keywords: ["intuition", "emotional wisdom", "compassion", "psychic attunement"],
    },
    reversed: {
      core: "The waters overwhelming the queen. Boundaries dissolved.",
      psychology: "Co-dependency, emotional flooding, or losing self in someone else's feelings.",
      advice: "Where does someone else's emotional weather end and yours begin? Today, find that line.",
      keywords: ["overwhelm", "co-dependency", "moodiness", "boundary loss"],
    },
  },
  "king-of-cups": {
    upright: {
      core: "The king on a steady throne in stormy water. Calm in deep feeling.",
      psychology: "Emotional integrity. Mastery of the inner ocean — not by force, by depth.",
      advice: "Be the steady one in the storm today. Your calm is the medicine the situation needs.",
      keywords: ["emotional mastery", "calm in crisis", "wisdom", "diplomacy", "deep care"],
    },
    reversed: {
      core: "The king's mask cracks. Emotional control rigid or volatile.",
      psychology: "Suppressed feeling that leaks sideways. Or manipulation through 'calm'.",
      advice: "What feeling have you been managing instead of feeling? Today, feel it for one minute.",
      keywords: ["suppression", "manipulation", "moodiness", "emotional dishonesty"],
    },
  },

  // ═══ SWORDS — Air / thought, decision, conflict, truth ═════════════════════

  "ace-of-swords": {
    upright: {
      core: "The clean blade of truth. Sudden mental clarity.",
      psychology: "The cut that releases. Seeing through what was murky.",
      advice: "Say it plainly today. The truth said clean is gentler than the truth said softly forever.",
      keywords: ["clarity", "truth", "breakthrough", "decisive thought", "mental power"],
    },
    reversed: {
      core: "The blade misused — or sheathed when needed.",
      psychology: "Confusion, or cutting words without compassion. Truth weaponised or withheld.",
      advice: "If you're confused — slow down before deciding. If you've been cruel with truth — soften.",
      keywords: ["confusion", "harsh words", "withheld truth", "miscommunication"],
    },
  },
  "two-of-swords": {
    upright: {
      core: "Blindfolded, swords crossed. The decision being avoided.",
      psychology: "Stalemate held by refusal to look. The peace bought by not deciding.",
      advice: "Take the blindfold off. The decision is already made in your body — let the mind catch up.",
      keywords: ["stalemate", "avoidance", "blocked emotions", "indecision"],
    },
    reversed: {
      core: "The blindfold lifting — or the avoidance breaking under its own weight.",
      psychology: "The decision finally taken. Or chaos when the blindfold rips off too fast.",
      advice: "If the truth has surfaced — face it now. The longer you wait, the more it costs.",
      keywords: ["facing truth", "decision made", "released stalemate", "overwhelm"],
    },
  },
  "three-of-swords": {
    upright: {
      core: "Three blades through one heart. Grief, betrayal, the necessary pain.",
      psychology: "The wound that must be felt, not bypassed. Heartbreak as honest data.",
      advice: "Let it hurt today. Don't manage it, don't reframe it. The wound heals only when felt.",
      keywords: ["heartbreak", "grief", "betrayal", "necessary pain", "honest wound"],
    },
    reversed: {
      core: "The blades being removed. Or wounds clung to past their lesson.",
      psychology: "Healing in progress. Or living from the wound instead of through it.",
      advice: "If healing — let it be slow. If clinging — ask what the wound still gives you to keep it.",
      keywords: ["healing", "released grief", "clung-to wound", "moving past hurt"],
    },
  },
  "four-of-swords": {
    upright: {
      core: "The knight lying down. Necessary rest after battle.",
      psychology: "The body and mind insisting on stillness. Recovery as a real act.",
      advice: "Rest today. Cancel one thing. The recovery is the work right now.",
      keywords: ["rest", "recovery", "retreat", "meditation", "necessary pause"],
    },
    reversed: {
      core: "Rest refused — or rest extended into stagnation.",
      psychology: "Pushing through when the body asks for stop. Or hiding under recovery.",
      advice: "If you're depleted — actually rest, fully. If you've been hiding — five minutes outside.",
      keywords: ["burnout", "restlessness", "stagnation", "delayed recovery"],
    },
  },
  "five-of-swords": {
    upright: {
      core: "The dishonourable win. Victory at the cost of relationship.",
      psychology: "Being right and losing the people. The hollow taste of dominating a small fight.",
      advice: "Pick the bigger thing today — connection over correctness. The argument isn't worth the wound.",
      keywords: ["hollow victory", "discord", "pride", "lost relationship"],
    },
    reversed: {
      core: "Repair after the bad win. Or doubling down in self-justification.",
      psychology: "Realising the cost. Or refusing to.",
      advice: "Reach back today. The relationship costs less to repair this week than next month.",
      keywords: ["reconciliation", "self-justification", "regret", "amends"],
    },
  },
  "six-of-swords": {
    upright: {
      core: "The quiet boat across calm water. Moving away from struggle to calmer shores.",
      psychology: "The transition done with maturity. Carrying only what serves where you're going.",
      advice: "It's okay to leave the loud place for the quiet one. The next shore is more honest.",
      keywords: ["transition", "calm passage", "moving on", "gentle journey", "release"],
    },
    reversed: {
      core: "Stuck on the wrong shore. Or carrying the same trouble across the water.",
      psychology: "Geographic move without inner move. Or refusing the boat altogether.",
      advice: "If you're moving — actually leave what's behind. If you're stuck — the boat's still there.",
      keywords: ["stuck", "carried baggage", "refused journey", "delayed transition"],
    },
  },
  "seven-of-swords": {
    upright: {
      core: "Slipping away with five swords. Strategy, stealth, or quiet self-betrayal.",
      psychology: "The clever move that may or may not be honourable. Watch your motive.",
      advice: "Examine your tactic today — is it brave or just clever? The honest path costs less long-term.",
      keywords: ["strategy", "stealth", "deception", "clever escape", "compromise"],
    },
    reversed: {
      core: "The truth coming out. Or finally admitting the dishonesty to yourself.",
      psychology: "Confession, exposure, or self-honesty after a long avoidance.",
      advice: "Tell the truth before someone else does. The owned admission is light; the exposed one is heavy.",
      keywords: ["confession", "exposed deception", "self-honesty", "consequence"],
    },
  },
  "eight-of-swords": {
    upright: {
      core: "Bound and blindfolded, eight swords surrounding. The trap that's mostly mental.",
      psychology: "Believing you're stuck when the ropes are loose. Self-imposed limitation.",
      advice: "Look at the bonds — they're not as tight as they feel. Walk forward. The swords don't move.",
      keywords: ["self-imposed limitation", "trapped feeling", "victim mindset", "delusion"],
    },
    reversed: {
      core: "Walking out. Realising the prison was unlocked.",
      psychology: "Recovery from victim story. The bonds loosened and shrugged off.",
      advice: "What story have you been telling about being stuck? Today, try the opposite story.",
      keywords: ["freedom", "released belief", "self-rescue", "empowerment"],
    },
  },
  "nine-of-swords": {
    upright: {
      core: "Sitting up at 3am with nine swords on the wall. The mind catastrophising.",
      psychology: "Anxiety amplified by the dark. The fear bigger than the actual thing.",
      advice: "Write the fear down at 3am. In the morning, most of it dissolves in light.",
      keywords: ["anxiety", "night terror", "catastrophic thinking", "worry spiral"],
    },
    reversed: {
      core: "The night ending. Or the worry seeping into day too.",
      psychology: "Recovering from the spiral. Or refusing to come out of it.",
      advice: "Tell one trusted person what's been keeping you up. Naming it cuts its hold in half.",
      keywords: ["recovery from anxiety", "named fear", "released worry", "lingering shadow"],
    },
  },
  "ten-of-swords": {
    upright: {
      core: "Face down with ten swords in the back. The complete ending — dramatic, final.",
      psychology: "The story so over there's nothing left to defend. Rock bottom is also solid ground.",
      advice: "Stop trying to save what's already done. The dawn behind the corpse is real.",
      keywords: ["complete ending", "rock bottom", "betrayal", "final defeat", "dawn coming"],
    },
    reversed: {
      core: "Recovery beginning. Or fearing the ending that hasn't actually come.",
      psychology: "Slowly standing up. Or borrowing tomorrow's catastrophe today.",
      advice: "If it's truly over — let it be. If it isn't — stop rehearsing the funeral.",
      keywords: ["slow recovery", "fear of ending", "premature mourning", "false closure"],
    },
  },
  "page-of-swords": {
    upright: {
      core: "The young scout, sword raised, watching the horizon. Curious mind, sharp tongue.",
      psychology: "Eager to learn, to question, to test. Quick wit not yet seasoned by wisdom.",
      advice: "Ask the bold question today. Curiosity is the doorway — even if your phrasing is awkward.",
      keywords: ["curiosity", "sharp mind", "questioning", "investigation", "new ideas"],
    },
    reversed: {
      core: "Curiosity turned to gossip. The sharp tongue without aim.",
      psychology: "Restless thinking. Stirring conflict with words. Or paranoid investigation.",
      advice: "Stop fact-checking your fears. Either gather real evidence or let the suspicion go.",
      keywords: ["gossip", "paranoia", "scattered thinking", "verbal sharpness"],
    },
  },
  "knight-of-swords": {
    upright: {
      core: "The knight charging at full speed, sword forward. Pure mental drive.",
      psychology: "Conviction in motion. The argument that wants to be won, the action that must happen now.",
      advice: "Use the momentum, but slow the speech. Force at full speed cuts the wrong things too.",
      keywords: ["fast action", "conviction", "directness", "intellectual force", "haste"],
    },
    reversed: {
      core: "The charge spent. Or the cause abandoned mid-gallop.",
      psychology: "Burnout from too many battles. Or impulsivity without conviction.",
      advice: "Where are you charging? Stop. Look. Re-aim. The energy is real; the target is wobbly.",
      keywords: ["impulsivity", "burnout", "aimless action", "blunted will"],
    },
  },
  "queen-of-swords": {
    upright: {
      core: "The queen with sword raised, eyes clear. Truth held with grace.",
      psychology: "Boundary as compassion. Saying the hard thing because love demands honesty.",
      advice: "Say the thing kindly but completely today. Half-truth is the kindest cruelty.",
      keywords: ["clear truth", "boundary", "independence", "fair judgment", "perceptive"],
    },
    reversed: {
      core: "The blade turned cold. Cynicism, bitterness, the wit used to wound.",
      psychology: "Past hurts hardening into cynicism. The defender becoming the attacker.",
      advice: "Where has truth become a weapon? Today, set the sword down for one conversation.",
      keywords: ["cynicism", "bitterness", "harsh judgement", "cold detachment"],
    },
  },
  "king-of-swords": {
    upright: {
      core: "The king of clear thought. Mind mastered, truth spoken cleanly, justice given fairly.",
      psychology: "Authority of intellect. The mature mind that uses logic in service of wisdom.",
      advice: "Be the clear thinker in the room today. Your reasoning is needed; offer it without softening.",
      keywords: ["intellectual authority", "fair judgement", "clarity", "strategic wisdom"],
    },
    reversed: {
      core: "Logic without compassion. Or rigid thinking that won't update with new data.",
      psychology: "The tyranny of the rational. Or thought paralysed by its own complexity.",
      advice: "Either the head has overrun the heart — let the heart speak. Or the heart has fogged the head — return to the basics.",
      keywords: ["cold reasoning", "rigidity", "manipulation", "thought paralysis"],
    },
  },

  // ═══ PENTACLES — Earth / matter, money, body, work ═════════════════════════

  "ace-of-pentacles": {
    upright: {
      core: "The golden coin offered. A tangible new opportunity rooted in reality.",
      psychology: "The ground beneath an idea. A seed that wants to become a tree.",
      advice: "Accept the practical opportunity today. The seed only becomes a tree if you plant it.",
      keywords: ["new opportunity", "material beginning", "prosperity seed", "grounded start"],
    },
    reversed: {
      core: "The opportunity missed or the seed left unplanted.",
      psychology: "Hesitation about money, body, or career. Or chasing schemes instead of solid ground.",
      advice: "Look at the offer that you almost said yes to. Did you say no for a real reason, or out of fear?",
      keywords: ["missed opportunity", "scarcity mindset", "delays", "false start"],
    },
  },
  "two-of-pentacles": {
    upright: {
      core: "The juggler with two coins in infinity-loop. Balance of competing demands.",
      psychology: "The art of switching. Holding multiple priorities without dropping any.",
      advice: "You can juggle today, but don't add a third ball. Hold the two well.",
      keywords: ["balance", "juggling", "adaptability", "priorities", "flow"],
    },
    reversed: {
      core: "Dropping the balls. Overcommitment finally cracking.",
      psychology: "Overwhelm from spinning too many plates. The juggler exhausted.",
      advice: "What can you put down today, even just for a week? You weren't meant to hold three lives.",
      keywords: ["overwhelm", "dropped balls", "imbalance", "exhaustion"],
    },
  },
  "three-of-pentacles": {
    upright: {
      core: "The mason, the architect and the patron in the cathedral. Collaborative craft.",
      psychology: "Skill meeting skill. The pride of being part of something built well.",
      advice: "Bring your skill to the team today. The cathedral is built by many hands; yours matters.",
      keywords: ["collaboration", "craftsmanship", "teamwork", "recognition", "skill"],
    },
    reversed: {
      core: "The collaboration breaking. Or skill unrecognised.",
      psychology: "Misalignment of roles, unappreciated craft, or teamwork without communication.",
      advice: "Name what's not working in the team. The silence costs more than the awkward conversation.",
      keywords: ["broken collaboration", "unappreciated", "misalignment", "rework"],
    },
  },
  "four-of-pentacles": {
    upright: {
      core: "The miser holding tight. Security through gripping rather than circulating.",
      psychology: "Fear of loss controlling the relationship with resources, time, or affection.",
      advice: "Loosen one finger today. What flows out returns; what is gripped suffocates.",
      keywords: ["holding tight", "security through control", "scarcity grip", "stagnation"],
    },
    reversed: {
      core: "The grip loosening. Or the fear of loss exploding into reckless release.",
      psychology: "Generosity returning. Or spending impulsively after long restriction.",
      advice: "If you've gripped too long — give one thing freely today. If you're swinging open — slow the swing.",
      keywords: ["release", "generosity returning", "reckless spending", "let go of control"],
    },
  },
  "five-of-pentacles": {
    upright: {
      core: "Two figures outside in the snow, missing the lit window behind them. Hardship felt as exclusion.",
      psychology: "Lack — material or emotional — that obscures the help available. Pride that won't ask.",
      advice: "Look at the lit window. Ask for the help you've been refusing yourself. The door is open.",
      keywords: ["hardship", "exclusion", "scarcity", "refused help", "isolation"],
    },
    reversed: {
      core: "Finding the lit window. Coming in from the cold.",
      psychology: "Recovery, asking for help, the warmth restored after long lack.",
      advice: "The help you receive today — receive it fully. You don't have to earn comfort.",
      keywords: ["recovery", "found support", "asked for help", "rebuilding"],
    },
  },
  "six-of-pentacles": {
    upright: {
      core: "Coins flowing from generous hand to receiver. The balance of giving and taking.",
      psychology: "Generosity that knows its own limit. Receiving that knows its dignity.",
      advice: "Give what you can today. Receive what is offered. The exchange itself is medicine.",
      keywords: ["generosity", "fair exchange", "giving and receiving", "philanthropy"],
    },
    reversed: {
      core: "Imbalance of giving and receiving. Or strings attached to gifts.",
      psychology: "Power dynamic in the giving. Always-giver or always-receiver patterns.",
      advice: "Look at who you only give to, and who you only take from. Both patterns cost.",
      keywords: ["imbalanced exchange", "strings attached", "power dynamic", "debt"],
    },
  },
  "seven-of-pentacles": {
    upright: {
      core: "The farmer leaning on the hoe, looking at slow-growing fruit. Patience with what takes time.",
      psychology: "Long-term thinking. The pause to assess investment before continuing.",
      advice: "Don't pull the seedling up to check the roots. Trust the slow work.",
      keywords: ["patience", "long view", "assessment", "investment", "slow growth"],
    },
    reversed: {
      core: "Impatience with the slow harvest. Or realising the soil was wrong all along.",
      psychology: "Quitting too early, or realising late that the project needs to be abandoned.",
      advice: "Either commit fully to the long timeline, or honestly admit this isn't your field.",
      keywords: ["impatience", "wasted effort", "abandoned project", "false expectation"],
    },
  },
  "eight-of-pentacles": {
    upright: {
      core: "The apprentice carving the eighth coin. Devoted practice. Mastery in the making.",
      psychology: "The dignity of doing the same thing well, again and again, until it's masterful.",
      advice: "Sit down and do the work today. Mastery is the by-product of showing up to practice.",
      keywords: ["mastery", "practice", "dedication", "skill", "quiet diligence"],
    },
    reversed: {
      core: "Cutting corners. Or stuck doing the same thing without growth.",
      psychology: "Boredom with the work. Or perfectionism preventing finishing anything.",
      advice: "If you're cutting corners — slow down. If you're perfecting forever — finish one thing badly.",
      keywords: ["cut corners", "shallow work", "stuck practice", "perfectionism"],
    },
  },
  "nine-of-pentacles": {
    upright: {
      core: "The elegant woman in her own garden, falcon on her wrist. Self-earned abundance.",
      psychology: "Solitary sophistication. The pleasure of one's own well-built life.",
      advice: "Enjoy your own company in your own space today. You built this — let yourself live in it.",
      keywords: ["self-sufficiency", "elegant solitude", "earned luxury", "independence"],
    },
    reversed: {
      core: "The garden looks elegant but feels lonely. Or the wealth that came too cheaply.",
      psychology: "Solitude turned to loneliness. Or material gain that didn't earn its meaning.",
      advice: "If the garden feels empty — invite someone in today. The luxury was never meant to be only solo.",
      keywords: ["lonely abundance", "shallow wealth", "missed dependence", "isolation"],
    },
  },
  "ten-of-pentacles": {
    upright: {
      core: "Three generations in a courtyard, dogs at the gate. Legacy. The stable family wealth.",
      psychology: "What lasts beyond one lifetime. The structures that hold many.",
      advice: "Think long-term today. What you build now will outlive the worry that built it.",
      keywords: ["legacy", "family wealth", "long-term security", "tradition", "stability"],
    },
    reversed: {
      core: "Family wealth turned to obligation. Or the structure that no longer fits its people.",
      psychology: "Inherited expectations. Or the legacy that costs more than it gives.",
      advice: "What inherited weight could you finally set down? Legacy is meant to lift, not crush.",
      keywords: ["family obligation", "inherited weight", "broken legacy", "structural strain"],
    },
  },
  "page-of-pentacles": {
    upright: {
      core: "The young student studying the coin. Earnest beginner with the long game in mind.",
      psychology: "The willingness to learn slow, useful things. The student before the master.",
      advice: "Start the course, read the book, take the class. The slow learning is the right speed.",
      keywords: ["study", "earnest beginning", "new opportunity", "long-term learning"],
    },
    reversed: {
      core: "Distracted from the work. Or unrealistic ambition without foundation.",
      psychology: "Daydreaming about the result while skipping the practice.",
      advice: "Pick the one boring step you've been avoiding. Do it today before anything fancier.",
      keywords: ["procrastination", "unrealistic ambition", "scattered focus", "missed lesson"],
    },
  },
  "knight-of-pentacles": {
    upright: {
      core: "The patient knight on a sturdy black horse. Methodical, reliable, committed.",
      psychology: "Steady work without flair. The discipline that finishes what it starts.",
      advice: "Be the steady one today. The unflashy work compounds; tortoise beats hare here.",
      keywords: ["reliability", "patience", "steady progress", "discipline", "method"],
    },
    reversed: {
      core: "Steady turning to stuck. The plodder who can't speed up when it matters.",
      psychology: "Routine without inspiration. Or perfectionism that prevents finishing.",
      advice: "Inject one small change in the routine today. Steady is good; rigid is not.",
      keywords: ["rigidity", "stuck in routine", "perfectionism", "lacking momentum"],
    },
  },
  "queen-of-pentacles": {
    upright: {
      core: "The queen in her garden, the rabbit at her feet. Grounded abundance, sensual care.",
      psychology: "The body-wise woman. Generosity that comes from her own fullness.",
      advice: "Take care of the body today — food, rest, walking. The queen rules from her own well-being.",
      keywords: ["earthly abundance", "nurture", "self-care", "sensual grounding", "comfort"],
    },
    reversed: {
      core: "The queen's care turning to martyrdom. Or grounding lost to self-neglect.",
      psychology: "Giving from empty. Or losing connection to body and senses.",
      advice: "What's the smallest thing your body needs right now? Do that first. Everything else waits.",
      keywords: ["self-neglect", "martyrdom", "loss of grounding", "imbalance"],
    },
  },
  "king-of-pentacles": {
    upright: {
      core: "The king of earned wealth. Mature mastery of resources, body, business.",
      psychology: "Stability that supports many. Wealth as generosity, not hoarding.",
      advice: "Use your stability to hold space for others today. Earned mastery is meant to be shared.",
      keywords: ["mastery", "earned wealth", "generosity", "stability", "abundance"],
    },
    reversed: {
      core: "Wealth without wisdom. Or material focus crowding out everything else.",
      psychology: "Greed, status anxiety, or self-worth tied entirely to bank balance.",
      advice: "What in your life is undervalued because you can't price it? Honour that today.",
      keywords: ["greed", "stubbornness", "material obsession", "status anxiety"],
    },
  },
};

/** Convert a card name like "The Fool" or "Ace of Wands" to the meanings key. */
export function cardKey(nameEn: string): string {
  return nameEn.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z-]/g, "");
}

/** Get the canonical meaning for a card. Returns null if not found (shouldn't happen). */
export function getMeaning(nameEn: string): TarotCardCanon | null {
  return TAROT_MEANINGS[cardKey(nameEn)] ?? null;
}
