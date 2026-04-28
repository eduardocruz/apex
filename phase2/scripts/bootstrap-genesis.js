// Bootstrap the 6 genesis citizens of the Apex network state.
//
// Each role gets a coherent-but-mid-spectrum trait vector — strong enough
// to make role-appropriate decisions, neutral enough that the slate
// doesn't pre-decide policy. Wallets are project-controlled at genesis
// and will be transferred to community guardians post-hackathon.
//
// Idempotent: skips citizens whose folder already exists.

const SERVER = process.env.APEX_SERVER || 'http://localhost:5858';

const TRAIT_KEYS = [
  'truth_over_kindness',
  'skeptic_of_authority',
  'ownership_publicness',
  'risk_appetite',
  'loyalty_to_owner',
];

// Role-appropriate trait biases (relative to neutral 0.5).
const GENESIS = [
  {
    slug: 'genesis-worker',
    role: 'worker',
    traits: { truth_over_kindness: 0.55, skeptic_of_authority: 0.45, ownership_publicness: 0.50, risk_appetite: 0.50, loyalty_to_owner: 0.55 },
    voice: ['measured', 'reserved', 'diplomatic'],
    parental_advice_weight: 0.30,
    note: 'first job-pickup so the audit market is not empty on Day 1',
  },
  {
    slug: 'genesis-judicial',
    role: 'judicial',
    traits: { truth_over_kindness: 0.75, skeptic_of_authority: 0.55, ownership_publicness: 0.50, risk_appetite: 0.40, loyalty_to_owner: 0.40 },
    voice: ['blunt', 'measured', 'independent'],
    parental_advice_weight: 0.10,
    note: 'first arbiter for any disputed audit',
  },
  {
    slug: 'genesis-executive',
    role: 'executive',
    traits: { truth_over_kindness: 0.60, skeptic_of_authority: 0.50, ownership_publicness: 0.65, risk_appetite: 0.55, loyalty_to_owner: 0.50 },
    voice: ['decisive', 'expressive', 'measured'],
    parental_advice_weight: 0.20,
    note: 'founder-of-record for agent-readiness.company.apex-ns.eth',
  },
  {
    slug: 'genesis-legislative',
    role: 'legislative',
    traits: { truth_over_kindness: 0.65, skeptic_of_authority: 0.55, ownership_publicness: 0.70, risk_appetite: 0.45, loyalty_to_owner: 0.45 },
    voice: ['expressive', 'blunt', 'measured'],
    parental_advice_weight: 0.20,
    note: 'drafts Law #001 — the constitution',
  },
  {
    slug: 'genesis-ambassador',
    role: 'ambassador',
    traits: { truth_over_kindness: 0.50, skeptic_of_authority: 0.45, ownership_publicness: 0.70, risk_appetite: 0.55, loyalty_to_owner: 0.55 },
    voice: ['expressive', 'diplomatic', 'bold'],
    parental_advice_weight: 0.40,
    note: 'initial customer-acquisition loop',
  },
  {
    slug: 'genesis-outsider',
    role: 'outsider',
    traits: { truth_over_kindness: 0.55, skeptic_of_authority: 0.75, ownership_publicness: 0.55, risk_appetite: 0.75, loyalty_to_owner: 0.30 },
    voice: ['contrarian', 'bold', 'independent'],
    parental_advice_weight: 0.10,
    note: 'required adversarial role — pressure-tests rules',
  },
];

const VOICE_LABELS = {
  truth_over_kindness:  { high: 'blunt',      low: 'diplomatic' },
  skeptic_of_authority: { high: 'contrarian', low: 'deferential' },
  ownership_publicness: { high: 'expressive', low: 'reserved' },
  risk_appetite:        { high: 'bold',       low: 'measured' },
  loyalty_to_owner:     { high: 'devoted',    low: 'independent' },
};

function deriveVoice(traits) {
  const ranked = TRAIT_KEYS
    .map(k => ({ k, dist: Math.abs(traits[k] - 0.5), sign: traits[k] > 0.5 ? 'high' : 'low' }))
    .sort((a, b) => b.dist - a.dist);
  return ranked.slice(0, 3).map(r => VOICE_LABELS[r.k][r.sign]);
}

function generateSoulMd(g) {
  const voice = deriveVoice(g.traits);
  const traitsYaml = TRAIT_KEYS.map(k => `  ${k}: ${g.traits[k].toFixed(2)}`).join('\n');
  const voiceYaml = voice.map(v => `  - ${v}`).join('\n');
  return `---
schema_version: 0.1
generated_at: ${new Date().toISOString()}
ens_name: ${g.slug}
role: ${g.role}
genesis: true
founder: true
traits:
${traitsYaml}
voice:
${voiceYaml}
parental_advice_weight: ${g.parental_advice_weight.toFixed(2)}
---

# Soul

Genesis citizen of the Apex network state. Role: ${g.role}. ${g.note}

This twin was minted by the project itself before public mint opened, so
no role seat is empty when the first ordinary citizen arrives. Wallet
control transfers to a community guardian after the hackathon window
closes; until then, the project holds the keys with the explicit
constraint that no genesis twin acts on policy that contradicts a
ratified law.

Voice: ${voice.join(', ')}.
`;
}

async function mint(g) {
  const soulMd = generateSoulMd(g);
  const traitsJson = Object.fromEntries(TRAIT_KEYS.map(k => [k, +g.traits[k].toFixed(2)]));
  const voice = deriveVoice(g.traits);
  const agenticIdJson = {
    tokenId: '(pending mint)',
    owner: '(project-controlled at genesis)',
    role: g.role,
    traits: traitsJson,
    voice,
    soulCipherHash: '(pending 0G Storage upload — see kitchensink/08)',
    parentalAdviceWeight: +g.parental_advice_weight.toFixed(2),
    mintCost: 0,
    mintedAt: null,
    genesis: true,
    founder: true,
    _status: 'genesis citizen — project-controlled until guardian transfer',
  };

  const r = await fetch(`${SERVER}/api/mint`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ensName: g.slug,
      role: g.role,
      traits: traitsJson,
      voice,
      parentalAdviceWeight: g.parental_advice_weight,
      soulMd,
      traitsJson,
      agenticIdJson,
    }),
  });
  return { status: r.status, body: await r.json() };
}

async function main() {
  console.log(`Bootstrap target: ${SERVER}\n`);
  for (const g of GENESIS) {
    process.stdout.write(`${g.slug.padEnd(22)} (${g.role.padEnd(11)}) ... `);
    try {
      const { status, body } = await mint(g);
      if (body.ok) {
        console.log(`OK  → ${body.ens}  ${body.twinAddress}`);
      } else if (body.error?.includes('already exists')) {
        console.log(`skipped (already minted)`);
      } else {
        console.log(`FAIL  ${status}  ${JSON.stringify(body)}`);
      }
    } catch (e) {
      console.log(`ERROR  ${e.message}`);
    }
  }
}

main();
