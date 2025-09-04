require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkModule2English() {
  try {
    console.log('🔍 MODULE 2 ENGLISH CONTENT CHECK');
    console.log('=====================================\n');

    // Get Module 2
    const { data: modules, error: moduleError } = await supabase
      .from('academy_modules')
      .select('*')
      .eq('order_index', 2);

    if (moduleError || !modules[0]) {
      console.error('❌ Error fetching Module 2:', moduleError);
      return;
    }

    const module2 = modules[0];
    console.log(`📖 MODULE 2: ${module2.title}\n`);

    // Get all lessons for Module 2
    const { data: lessons, error: lessonsError } = await supabase
      .from('academy_lessons')
      .select('*')
      .eq('module_id', module2.id)
      .eq('status', 'published')
      .order('order_index');

    if (lessonsError) {
      console.error('❌ Error fetching lessons:', lessonsError);
      return;
    }

    // Check each lesson for English content
    for (const lesson of lessons) {
      console.log(`\n📖 LES ${lesson.order_index}: ${lesson.title}`);
      console.log('─'.repeat(60));
      
      if (!lesson.content) {
        console.log('❌ No content found');
        continue;
      }

      // Look for obvious English words/phrases
      const content = lesson.content;
      const englishPatterns = [
        /\b(the|and|or|but|with|from|through|understanding|development|growth|performance|identity|masculine|excellence|discipline|leadership|framework|principles|strategies|implementation|optimization|transformation|accountability|psychological|behavioral|emotional|cognitive|systematic|comprehensive|professional|individual|potential|capacity|resources|capabilities|effectiveness|efficiency|consistency|achievement|improvement|foundation|structure|environment|community|relationship|experience|knowledge|skills|abilities|confidence|motivation|commitment|dedication|persistence|resilience|responsibility|character|integrity|values|standards|quality|success|failure|challenge|opportunity|obstacle|solution|decision|choice|action|behavior|habit|routine|practice|training|learning|education|teaching|instruction|guidance|mentorship|coaching|support|assistance|help|service|contribution|impact|influence|legacy|mission|purpose|vision|goal|objective|target|result|outcome|consequence|effect|benefit|advantage|value|worth|investment|return|profit|gain|improvement|progress|advancement|development|evolution|change|transformation|adaptation|adjustment|modification|enhancement|optimization|maximization|minimization|balance|harmony|stability|security|safety|protection|prevention|preparation|planning|organization|management|leadership|authority|control|power|strength|force|energy|effort|work|labor|activity|productivity|performance|execution|implementation|application|utilization|employment|usage|practice|exercise|demonstration|example|model|pattern|template|framework|system|method|approach|technique|strategy|tactic|plan|scheme|design|concept|idea|principle|rule|law|standard|criterion|measure|metric|indicator|sign|signal|evidence|proof|confirmation|validation|verification|assessment|evaluation|analysis|examination|investigation|research|study|exploration|discovery|finding|conclusion|result|outcome|recommendation|suggestion|advice|guidance|instruction|direction|path|way|route|journey|process|procedure|step|stage|phase|level|degree|extent|scope|range|scale|size|amount|quantity|number|count|total|sum|whole|part|element|component|factor|aspect|dimension|feature|characteristic|trait|quality|attribute|property|nature|essence|core|heart|center|focus|point|key|main|primary|essential|fundamental|basic|elementary|simple|complex|complicated|difficult|challenging|easy|simple|hard|tough|strong|weak|powerful|effective|efficient|successful|productive|valuable|useful|helpful|beneficial|positive|negative|good|bad|right|wrong|correct|incorrect|true|false|real|actual|genuine|authentic|original|unique|special|particular|specific|general|common|ordinary|normal|regular|standard|typical|usual|average|medium|moderate|extreme|intense|severe|serious|important|significant|major|minor|critical|crucial|vital|essential|necessary|required|needed|wanted|desired|preferred|chosen|selected|picked|decided|determined|established|set|fixed|stable|constant|permanent|temporary|short|long|brief|quick|fast|slow|rapid|immediate|instant|sudden|gradual|progressive|continuous|ongoing|persistent|consistent|regular|frequent|occasional|rare|uncommon|unusual|strange|odd|weird|normal|natural|artificial|synthetic|organic|mechanical|automatic|manual|voluntary|involuntary|conscious|unconscious|aware|unaware|mindful|mindless|careful|careless|thoughtful|thoughtless|considerate|inconsiderate|responsible|irresponsible|reliable|unreliable|dependable|undependable|trustworthy|untrustworthy|honest|dishonest|truthful|untruthful|sincere|insincere|genuine|fake|real|artificial|natural|supernatural|physical|mental|emotional|spiritual|intellectual|social|cultural|personal|individual|private|public|open|closed|secret|hidden|visible|invisible|obvious|subtle|clear|unclear|certain|uncertain|sure|unsure|confident|unconfident|positive|negative|optimistic|pessimistic|hopeful|hopeless|encouraging|discouraging|motivating|demotivating|inspiring|uninspiring|exciting|boring|interesting|uninteresting|engaging|disengaging|attractive|unattractive|appealing|unappealing|pleasant|unpleasant|enjoyable|unenjoyable|satisfying|unsatisfying|fulfilling|unfulfilling|rewarding|unrewarding|worthwhile|worthless|valuable|invaluable|priceless|cheap|expensive|costly|affordable|reasonable|unreasonable|fair|unfair|just|unjust|equal|unequal|balanced|unbalanced|stable|unstable|secure|insecure|safe|unsafe|dangerous|risky|hazardous|harmful|helpful|beneficial|detrimental|advantageous|disadvantageous|favorable|unfavorable|positive|negative)\b/gi,
        /\b(you|your|yourself|we|our|ourselves|they|their|themselves|he|his|himself|she|her|herself|it|its|itself|I|my|myself|me|us|them|him|her)\b/gi,
        /\b(can|could|should|would|will|shall|must|may|might|have|has|had|do|does|did|is|are|was|were|been|being|get|got|getting|make|making|made|take|taking|took|give|giving|gave|come|coming|came|go|going|went|see|seeing|saw|know|knowing|knew|think|thinking|thought|feel|feeling|felt|want|wanting|wanted|need|needing|needed|like|liking|liked|love|loving|loved|work|working|worked|live|living|lived|become|becoming|became|create|creating|created|build|building|built|develop|developing|developed|improve|improving|improved|increase|increasing|increased|decrease|decreasing|decreased|change|changing|changed|learn|learning|learned|teach|teaching|taught|understand|understanding|understood|explain|explaining|explained|show|showing|showed|tell|telling|told|say|saying|said|speak|speaking|spoke|talk|talking|talked|listen|listening|listened|hear|hearing|heard|read|reading|read|write|writing|wrote|study|studying|studied|practice|practicing|practiced|train|training|trained|exercise|exercising|exercised|perform|performing|performed|achieve|achieving|achieved|accomplish|accomplishing|accomplished|succeed|succeeding|succeeded|fail|failing|failed|try|trying|tried|attempt|attempting|attempted|start|starting|started|begin|beginning|began|finish|finishing|finished|end|ending|ended|stop|stopping stopped|continue|continuing|continued|keep|keeping|kept|maintain|maintaining|maintained|support|supporting|supported|help|helping|helped|assist|assisting|assisted|guide|guiding|guided|lead|leading|led|follow|following|followed|control|controlling|controlled|manage|managing|managed|organize|organizing|organized|plan|planning|planned|prepare|preparing|prepared|decide|deciding|decided|choose|choosing|chose|select|selecting|selected|determine|determining|determined|establish|establishing|established|set|setting|set|focus|focusing|focused|concentrate|concentrating|concentrated|pay|paying|paid|spend|spending|spent|invest|investing|invested|use|using|used|apply|applying|applied|implement|implementing|implemented|execute|executing|executed|perform|performing|performed|operate|operating|operated|function|functioning|functioned|act|acting|acted|behave|behaving|behaved|respond|responding|responded|react|reacting|reacted|adapt|adapting|adapted|adjust|adjusting|adjusted|modify|modifying|modified|change|changing|changed|transform|transforming|transformed|convert|converting|converted|turn|turning|turned|move|moving|moved|shift|shifting|shifted|transfer|transferring|transferred|progress|progressing|progressed|advance|advancing|advanced|develop|developing|developed|evolve|evolving|evolved|grow|growing|grew|expand|expanding|expanded|extend|extending|extended|spread|spreading|spread|reach|reaching|reached|achieve|achieving|achieved|attain|attaining|attained|obtain|obtaining|obtained|gain|gaining|gained|acquire|acquiring|acquired|receive|receiving|received|accept|accepting|accepted|reject|rejecting|rejected|refuse|refusing|refused|deny|denying|denied|avoid|avoiding|avoided|prevent|preventing|prevented|protect|protecting|protected|defend|defending|defended|attack|attacking|attacked|fight|fighting|fought|struggle|struggling|struggled|compete|competing|competed|challenge|challenging|challenged|overcome|overcoming|overcame|conquer|conquering|conquered|defeat|defeating|defeated|win|winning|won|lose|losing|lost|succeed|succeeding|succeeded|fail|failing|failed|pass|passing|passed|miss|missing|missed|hit|hitting|hit|catch|catching|caught|throw|throwing|threw|push|pushing|pushed|pull|pulling|pulled|lift|lifting|lifted|carry|carrying|carried|hold|holding|held|grab|grabbing|grabbed|release|releasing|released|drop|dropping|dropped|place|placing|placed|put|putting|put|position|positioning|positioned|locate|locating|located|find|finding|found|search|searching|searched|look|looking|looked|watch|watching|watched|observe|observing|observed|notice|noticing|noticed|recognize|recognizing|recognized|identify|identifying|identified|discover|discovering|discovered|explore|exploring|explored|investigate|investigating|investigated|examine|examining|examined|analyze|analyzing|analyzed|evaluate|evaluating|evaluated|assess|assessing|assessed|measure|measuring|measured|test|testing|tested|check|checking|checked|verify|verifying|verified|confirm|confirming|confirmed|prove|proving|proved|demonstrate|demonstrating|demonstrated|show|showing|showed|display|displaying|displayed|present|presenting|presented|reveal|revealing|revealed|expose|exposing|exposed|hide|hiding|hid|cover|covering|covered|protect|protecting|protected|save|saving|saved|store|storing|stored|keep|keeping|kept|preserve|preserving|preserved|maintain|maintaining|maintained|sustain|sustaining|sustained|continue|continuing|continued|last|lasting|lasted|remain|remaining|remained|stay|staying|stayed|wait|waiting|waited|pause|pausing|paused|rest|resting|rested|sleep|sleeping|slept|wake|waking|woke|rise|rising|rose|stand|standing|stood|sit|sitting|sat|lie|lying|lay|walk|walking|walked|run|running|ran|jump|jumping|jumped|climb|climbing|climbed|fall|falling|fell|fly|flying|flew|swim|swimming|swam|drive|driving|drove|ride|riding|rode|travel|traveling|traveled|visit|visiting|visited|leave|leaving|left|arrive|arriving|arrived|enter|entering|entered|exit|exiting|exited|return|returning|returned|bring|bringing|brought|take|taking|took|send|sending|sent|deliver|delivering|delivered|transport|transporting|transported|carry|carrying|carried|move|moving|moved|transfer|transferring|transferred|exchange|exchanging|exchanged|trade|trading|traded|buy|buying|bought|sell|selling|sold|pay|paying|paid|cost|costing|cost|price|pricing|priced|value|valuing|valued|worth|counting|earned|earn|earning|earned|spend|spending|spent|save|saving|saved|invest|investing|invested|lose|losing|lost|waste|wasting|wasted|use|using|used|consume|consuming|consumed|produce|producing|produced|create|creating|created|make|making|made|build|building|built|construct|constructing|constructed|design|designing|designed|plan|planning|planned|organize|organizing|organized|arrange|arranging|arranged|prepare|preparing|prepared|setup|setting|set|install|installing|installed|fix|fixing|fixed|repair|repairing|repaired|maintain|maintaining|maintained|clean|cleaning|cleaned|wash|washing|washed|cook|cooking|cooked|eat|eating|ate|drink|drinking|drank|taste|tasting|tasted|smell|smelling|smelled|touch|touching|touched|feel|feeling|felt|hear|hearing|heard|see|seeing|saw|look|looking|looked|watch|watching|watched|listen|listening|listened|speak|speaking|spoke|talk|talking|talked|say|saying|said|tell|telling|told|ask|asking|asked|answer|answering|answered|reply|replying|replied|respond|responding|responded|communicate|communicating|communicated|express|expressing|expressed|describe|describing|described|explain|explaining|explained|discuss|discussing|discussed|argue|arguing|argued|debate|debating|debated|negotiate|negotiating|negotiated|agree|agreeing|agreed|disagree|disagreeing|disagreed|accept|accepting|accepted|reject|rejecting|rejected|approve|approving|approved|disapprove|disapproving|disapproved|support|supporting|supported|oppose|opposing|opposed|encourage|encouraging|encouraged|discourage|discouraging|discouraged|motivate|motivating|motivated|inspire|inspiring|inspired|influence|influencing|influenced|persuade|persuading|persuaded|convince|convincing|convinced|suggest|suggesting|suggested|recommend|recommending|recommended|advise|advising|advised|warn|warning|warned|inform|informing|informed|notify|notifying|notified|announce|announcing|announced|declare|declaring|declared|state|stating|stated|claim|claiming|claimed|assert|asserting|asserted|maintain|maintaining|maintained|insist|insisting|insisted|demand|demanding|demanded|require|requiring|required|request|requesting|requested|order|ordering|ordered|command|commanding|commanded|direct|directing|directed|instruct|instructing|instructed|guide|guiding|guided|lead|leading|led|manage|managing|managed|control|controlling|controlled|rule|ruling|ruled|govern|governing|governed|regulate|regulating|regulated|organize|organizing|organized|coordinate|coordinating|coordinated|supervise|supervising|supervised|monitor|monitoring|monitored|check|checking|checked|inspect|inspecting|inspected|review|reviewing|reviewed|examine|examining|examined|investigate|investigating|investigated|study|studying|studied|research|researching|researched|analyze|analyzing|analyzed|evaluate|evaluating|evaluated|assess|assessing|assessed|judge|judging|judged|rate|rating|rated|rank|ranking|ranked|compare|comparing|compared|contrast|contrasting|contrasted|distinguish|distinguishing|distinguished|differentiate|differentiating|differentiated|separate|separating|separated|divide|dividing|divided|split|splitting|split|break|breaking|broke|cut|cutting|cut|tear|tearing|tore|rip|ripping|ripped|damage|damaging|damaged|destroy|destroying|destroyed|ruin|ruining|ruined|harm|harming|harmed|hurt|hurting|hurt|injure|injuring|injured|wound|wounding|wounded|kill|killing|killed|murder|murdering|murdered|attack|attacking|attacked|fight|fighting|fought|beat|beating|beat|hit|hitting|hit|strike|striking|struck|punch|punching|punched|kick|kicking|kicked|push|pushing|pushed|pull|pulling|pulled|grab|grabbing|grabbed|catch|catching|caught|throw|throwing|threw|shoot|shooting|shot|fire|firing|fired|explode|exploding|exploded|burn|burning|burned|melt|melting|melted|freeze|freezing|froze|cool|cooling|cooled|heat|heating|heated|warm|warming|warmed|light|lighting|lit|shine|shining|shone|glow|glowing|glowed|reflect|reflecting|reflected|absorb|absorbing|absorbed|emit|emitting|emitted|radiate|radiating|radiated|spread|spreading|spread|expand|expanding|expanded|contract|contracting|contracted|shrink|shrinking|shrank|grow|growing|grew|increase|increasing|increased|decrease|decreasing|decreased|rise|rising|rose|fall|falling|fell|climb|climbing|climbed|drop|dropping|dropped|lift|lifting|lifted|raise|raising|raised|lower|lowering|lowered|level|leveling|leveled|balance|balancing|balanced|stabilize|stabilizing|stabilized|steady|steadying|steadied|shake|shaking|shook|vibrate|vibrating|vibrated|move|moving|moved|shift|shifting|shifted|turn|turning|turned|rotate|rotating|rotated|spin|spinning|spun|twist|twisting|twisted|bend|bending|bent|curve|curving|curved|stretch|stretching|stretched|extend|extending|extended|reach|reaching|reached|touch|touching|touched|contact|contacting|contacted|connect|connecting|connected|link|linking|linked|join|joining|joined|unite|uniting|united|combine|combining|combined|merge|merging|merged|blend|blending|blended|mix|mixing|mixed|stir|stirring|stirred|shake|shaking|shook|pour|pouring|poured|flow|flowing|flowed|stream|streaming|streamed|run|running|ran|drip|dripping|dripped|leak|leaking|leaked|spill|spilling|spilled|splash|splashing|splashed|spray|spraying|sprayed|squirt|squirting|squirted|pump|pumping|pumped|suck|sucking|sucked|blow|blowing|blew|breathe|breathing|breathed|inhale|inhaling|inhaled|exhale|exhaling|exhaled|cough|coughing|coughed|sneeze|sneezing|sneezed|yawn|yawning|yawned|sleep|sleeping|slept|dream|dreaming|dreamed|wake|waking|woke|rest|resting|rested|relax|relaxing|relaxed|calm|calming|calmed|quiet|quieting|quieted|silence|silencing|silenced|whisper|whispering|whispered|shout|shouting|shouted|scream|screaming|screamed|cry|crying|cried|weep|weeping|wept|sob|sobbing|sobbed|laugh|laughing|laughed|giggle|giggling|giggled|smile|smiling|smiled|grin|grinning|grinned|frown|frowning|frowned|worry|worrying|worried|fear|fearing|feared|panic|panicking|panicked|stress|stressing|stressed|relax|relaxing|relaxed|calm|calming|calmed|comfort|comforting|comforted|soothe|soothing|soothed|encourage|encouraging|encouraged|support|supporting|supported|help|helping|helped|assist|assisting|assisted|aid|aiding|aided|serve|serving|served|care|caring|cared|tend|tending|tended|nurse|nursing|nursed|heal|healing|healed|cure|curing|cured|treat|treating|treated|medicine|medicining|medicined|doctor|doctoring|doctored|operate|operating|operated|surgery|performing|performed)\b/gi
      ];

      let hasEnglish = false;
      let englishSample = [];

      for (const pattern of englishPatterns) {
        const matches = content.match(pattern);
        if (matches && matches.length > 0) {
          hasEnglish = true;
          englishSample = englishSample.concat(matches.slice(0, 5));
          if (englishSample.length >= 10) break;
        }
      }

      if (hasEnglish) {
        console.log('🚨 ENGLISH CONTENT DETECTED!');
        console.log('English words found:', englishSample.slice(0, 10).join(', '));
        console.log('\n📄 SAMPLE (first 200 chars):');
        console.log(content.substring(0, 200) + '...');
      } else {
        console.log('✅ No obvious English content detected');
      }
    }

  } catch (error) {
    console.error('❌ Script error:', error);
  }
}

checkModule2English()
  .then(() => {
    console.log('\n✅ Module 2 English check completed!');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
