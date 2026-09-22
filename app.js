/* ═══════════════════════════════════════════════════════
   UB PROJECTS — app.js
   Vanilla JS · Supabase auth + persistence · localStorage cache
   ═══════════════════════════════════════════════════════ */

// ── CONFIG ────────────────────────────────────────────
// Replace these with your actual Supabase project URL and anon key
const SUPABASE_URL  = 'https://wpllvyjjvwssqxplztsj.supabase.co';
const SUPABASE_ANON = 'sb_publishable_aRcisrW-iYogmuQhktDhtQ_yMhhNW1K';

const { createClient } = supabase;
const sb = createClient(SUPABASE_URL, SUPABASE_ANON);

// ── LOCAL DB (in-memory, synced from Supabase) ────────
let DB = {
  leads:     [],
  proposals: [],
  clients:   [],
  contacts:  [],
  projects:  [],
  ideas:     [],
};

// Active context
let activeSection     = 'leads';
let activeCompanyId   = null;
let activeProjectId   = null;
let activeDrawerTab   = 'brief';

// ── SEED DATA ─────────────────────────────────────────
const SEED = {
  leads: [
    {
      id: 'lead-1', name: 'The Last Light of Alba', type: 'Theatre',
      venue: 'Traverse Theatre, Edinburgh', contact: 'Flora Dunbar',
      value: 42000, currency: 'GBP', stage: 'Negotiation',
      source: 'Edinburgh Festivals Office', created_at: '2026-08-10',
      notes: 'Scottish touring production. Traverse keen to co-produce. Arts Council Scotland interest flagged.'
    },
    {
      id: 'lead-2', name: 'Midnight Carnival', type: 'Festival',
      venue: 'Underbelly, George Square, Edinburgh', contact: 'Jamie Carmichael',
      value: 185000, currency: 'GBP', stage: 'Confirmed',
      source: 'Internal — Edinburgh Fringe programme', created_at: '2026-07-22',
      notes: 'Multi-venue late-night circus programme. Running Aug 2027. Headliner TBC.'
    },
    {
      id: 'lead-3', name: 'Peckham Pulse', type: 'Live Event',
      venue: 'Bussey Building, Peckham, London', contact: 'Dara Osei',
      value: 28500, currency: 'GBP', stage: 'Proposal',
      source: 'Inbound – venue referral', created_at: '2026-09-01',
      notes: '3-night immersive music event. South London community arts focus.'
    },
    {
      id: 'lead-4', name: 'The Moth & The Flame', type: 'Theatre',
      venue: 'Brighton Dome, Brighton', contact: 'Cressida Howell',
      value: 67000, currency: 'GBP', stage: 'Enquiry',
      source: 'Producer network — SXSW London showcase', created_at: '2026-09-15',
      notes: 'New writing from Oran Mor. Brighton transfer of sold-out Glasgow run.'
    },
    {
      id: 'lead-5', name: 'Silk Road Stories', type: 'Cultural Experience',
      venue: 'Barbican Centre, London', contact: 'Mei-Lin Zhao',
      value: 210000, currency: 'GBP', stage: 'Negotiation',
      source: 'Arts Council England strategic touring', created_at: '2026-08-28',
      notes: 'Multi-disciplinary cultural programme touring UK/EU 2027–28. Partnership with Barbican and HOME Manchester.'
    },
    {
      id: 'lead-6', name: 'Northern Stage Grand Tour', type: 'Tour',
      venue: 'Multiple — Newcastle, Leeds, Hull, Sheffield', contact: 'Patrick Whitley',
      value: 95000, currency: 'GBP', stage: 'Proposal',
      source: 'Northern Stage partnership', created_at: '2026-09-08',
      notes: 'Four-city regional tour of Northern Stage co-production. Levelling Up arts fund application in progress.'
    },
    {
      id: 'lead-7', name: 'VAULT Festival 2028', type: 'Festival',
      venue: 'The Vaults, Waterloo, London', contact: 'Simone Archer',
      value: 320000, currency: 'GBP', stage: 'Enquiry',
      source: 'Industry — VAULT closing night 2026', created_at: '2026-09-18',
      notes: 'Underbelly approached to take on GM/production oversight for 2028 edition. Decision pending internal review.'
    },
    {
      id: 'lead-8', name: 'Americana Roadhouse', type: 'Live Event',
      venue: 'Nashville, TN / Brooklyn Bowl, Las Vegas', contact: 'Billy Ray Tanner',
      value: 145000, currency: 'USD', stage: 'Enquiry',
      source: 'US agent — William Morris Nashville', created_at: '2026-09-20',
      notes: 'US country/Americana touring package. Early-stage conversations with WME.'
    },
  ],

  proposals: [
    {
      id: 'prop-1', title: 'General Management — Silk Road Stories',
      client: 'Barbican Centre / HOME Manchester', lead_id: 'lead-5',
      status: 'Sent', sent_date: '2026-09-10',
      intro: 'Underbelly is delighted to present this proposal for General Management services on Silk Road Stories, a landmark multi-disciplinary production touring the United Kingdom and Europe in 2027–28. With extensive experience delivering large-scale cultural events from Edinburgh to the West End and beyond, we are uniquely placed to provide strategic, financial and logistical leadership for this project.',
      phases: [
        { name: 'Development & Planning', fee: 18000 },
        { name: 'Pre-Production', fee: 35000 },
        { name: 'Production & Touring', fee: 48000 },
        { name: 'Wrap & Reconciliation', fee: 9000 },
      ],
      investment_notes: 'All fees are exclusive of VAT at the prevailing rate. Payment is structured across phases, invoiced at the commencement of each. Disbursements and expenses are invoiced separately at cost plus 10% admin. Travel and accommodation for Underbelly staff are not included.',
    },
    {
      id: 'prop-2', title: 'Production Services — Midnight Carnival',
      client: 'Edinburgh Festival Fringe Society', lead_id: 'lead-2',
      status: 'Accepted', sent_date: '2026-08-05',
      intro: 'This proposal sets out Underbelly\'s approach to producing Midnight Carnival at George Square, Edinburgh for the 2027 Fringe. Drawing on our long history as one of the Fringe\'s principal venue operators, we propose a fully managed late-night entertainment programme spanning four weeks of August.',
      phases: [
        { name: 'Programme Curation & Casting', fee: 22000 },
        { name: 'Venue Build & Technical', fee: 65000 },
        { name: 'Festival Operations', fee: 72000 },
        { name: 'De-rig & Post-Production', fee: 16000 },
      ],
      investment_notes: 'Ticket revenues are held separately and distributed post-festival per the agreed revenue share schedule. All operational costs are subject to change based on final programme. Underbelly management fee (12% of gross budget) is charged in addition to the above.',
    },
  ],

  clients: [
    {
      id: 'client-1', name: 'Traverse Theatre',
      type: 'Venue', city: 'Edinburgh', country: 'Scotland',
      website: 'https://www.traverse.co.uk',
      notes: 'Scotland\'s leading new-writing venue. Long-standing Underbelly relationship. Key contacts: Flora Dunbar (Executive), Rory McNeil (Programming).'
    },
    {
      id: 'client-2', name: 'Barbican Centre',
      type: 'Venue', city: 'London', country: 'England',
      website: 'https://www.barbican.org.uk',
      notes: 'Major arts complex, City of London. Partnership on Silk Road Stories.'
    },
    {
      id: 'client-3', name: 'HOME Manchester',
      type: 'Co-producer', city: 'Manchester', country: 'England',
      website: 'https://homemcr.org',
      notes: 'Manchester arts centre. Co-producing Silk Road Stories with Barbican.'
    },
    {
      id: 'client-4', name: 'Brighton Dome',
      type: 'Venue', city: 'Brighton', country: 'England',
      website: 'https://brightondome.org',
      notes: 'Historic concert hall and arts complex. The Moth & The Flame enquiry.'
    },
    {
      id: 'client-5', name: 'Edinburgh Festival Fringe Society',
      type: 'Festival', city: 'Edinburgh', country: 'Scotland',
      website: 'https://www.edfringe.com',
      notes: 'The umbrella body for the Edinburgh Fringe. Annual relationship for Underbelly\'s programme.'
    },
    {
      id: 'client-6', name: 'Northern Stage',
      type: 'Co-producer', city: 'Newcastle', country: 'England',
      website: 'https://northernstage.co.uk',
      notes: 'Regional producing house. Grand Tour co-production in development.'
    },
    {
      id: 'client-7', name: 'Arts Council England',
      type: 'Funder', city: 'London', country: 'England',
      website: 'https://www.artscouncil.org.uk',
      notes: 'Principal public funder for England. Strategic Touring Fund applications for Silk Road and Northern tour.'
    },
    {
      id: 'client-8', name: 'The Vaults',
      type: 'Venue', city: 'London', country: 'England',
      website: 'https://www.thevaults.london',
      notes: 'Waterloo underground venue. VAULT Festival 2028 discussions.'
    },
  ],

  contacts: [
    { id: 'con-1', company_id: 'client-1', first: 'Flora', last: 'Dunbar', role: 'Executive Director', email: 'flora@traverse.co.uk', phone: '+44 131 228 1404', notes: '' },
    { id: 'con-2', company_id: 'client-1', first: 'Rory', last: 'McNeil', role: 'Head of Programming', email: 'rory@traverse.co.uk', phone: '', notes: 'Key creative contact for new writing development.' },
    { id: 'con-3', company_id: 'client-2', first: 'Mei-Lin', last: 'Zhao', role: 'Senior Producer', email: 'meilin.zhao@barbican.org.uk', phone: '+44 20 7638 8891', notes: 'Lead contact for Silk Road Stories partnership.' },
    { id: 'con-4', company_id: 'client-3', first: 'Amir', last: 'Hassan', role: 'Executive Director', email: 'amir.hassan@homemcr.org', phone: '+44 161 200 1500', notes: '' },
    { id: 'con-5', company_id: 'client-4', first: 'Cressida', last: 'Howell', role: 'Artistic Director', email: 'cressida@brightondome.org', phone: '', notes: 'Interested in UK tour of Scottish productions.' },
    { id: 'con-6', company_id: 'client-5', first: 'Jamie', last: 'Carmichael', role: 'Venues & Licensing Manager', email: 'jamie@edfringe.com', phone: '+44 131 226 0026', notes: '' },
    { id: 'con-7', company_id: 'client-6', first: 'Patrick', last: 'Whitley', role: 'Executive Producer', email: 'p.whitley@northernstage.co.uk', phone: '', notes: 'Driving Grand Tour partnership.' },
    { id: 'con-8', company_id: 'client-7', first: 'Denise', last: 'Okafor', role: 'Relationship Manager — London', email: 'dokafor@artscouncil.org.uk', phone: '+44 161 934 4317', notes: 'Handles ACE relationship for Underbelly\'s NPO application.' },
    { id: 'con-9', company_id: 'client-8', first: 'Simone', last: 'Archer', role: 'Director', email: 'simone@thevaults.london', phone: '', notes: 'Founder of VAULT Festival.' },
  ],

  projects: [
    {
      id: 'proj-1', name: 'Midnight Carnival', type: 'Festival',
      venue: 'Underbelly, George Square, Edinburgh', status: 'Pre-Production',
      start_date: '2027-08-01', end_date: '2027-08-25',
      brief: 'Midnight Carnival is Underbelly\'s flagship late-night programme at George Square for the 2027 Edinburgh Festival Fringe. Running over four weeks, the programme will feature circus, cabaret, immersive entertainment and club nights across three performance spaces.\n\nUnderbelly is acting as venue operator and general manager. The programme is curated in partnership with a selection of leading UK and international producers.\n\nKey priorities:\n- Complete headliner programming by November 2026\n- Secure sponsorship package by January 2027\n- Venue build commences July 10 2027',
      milestones: [
        { id: 'm-1', title: 'Headliner programming locked', date: '2026-11-30', notes: '' },
        { id: 'm-2', title: 'Sponsorship package agreed', date: '2027-01-31', notes: 'Target: £45k in kind + cash' },
        { id: 'm-3', title: 'Technical rider sign-off', date: '2027-05-01', notes: '' },
        { id: 'm-4', title: 'Venue build commences', date: '2027-07-10', notes: '' },
        { id: 'm-5', title: 'Opening night', date: '2027-08-01', notes: 'Press night TBC +3 days' },
        { id: 'm-6', title: 'Final performance', date: '2027-08-25', notes: '' },
      ],
      docs: [
        { id: 'd-1', name: 'Production Agreement', url: '', type: 'Contract' },
        { id: 'd-2', name: 'Budget v1.2', url: '', type: 'Budget' },
        { id: 'd-3', name: 'Programme Schedule', url: '', type: 'Schedule' },
      ],
    },
    {
      id: 'proj-2', name: 'Silk Road Stories', type: 'Cultural Experience',
      venue: 'Barbican Centre, London / HOME Manchester', status: 'Development',
      start_date: '2027-04-15', end_date: '2027-07-12',
      brief: 'Silk Road Stories is a multi-disciplinary touring production exploring contemporary narratives along the ancient Silk Road. Co-produced by the Barbican Centre and HOME Manchester, Underbelly provides General Management.\n\nThe project includes theatre, installation, live music and participatory events across both venues with a potential European extension to Berlin and Amsterdam.',
      milestones: [
        { id: 'm-10', title: 'Creative team contracted', date: '2026-11-01', notes: '' },
        { id: 'm-11', title: 'GM agreement signed', date: '2026-10-01', notes: '' },
        { id: 'm-12', title: 'First rehearsal', date: '2027-03-01', notes: '' },
      ],
      docs: [
        { id: 'd-10', name: 'Proposal v2 (accepted)', url: '', type: 'Brief' },
      ],
    },
    {
      id: 'proj-3', name: 'The Last Light of Alba', type: 'Theatre',
      venue: 'Traverse Theatre, Edinburgh', status: 'Development',
      start_date: '2027-03-10', end_date: '2027-04-05',
      brief: 'A new Scottish play in co-production with the Traverse Theatre. Drama exploring Highland community and land reform. Written by Callum Bain, directed by Isla Mackay.\n\nUnderbelly acting as producing GM, responsible for budget, scheduling and touring logistics.',
      milestones: [],
      docs: [],
    },
    {
      id: 'proj-4', name: 'Underbelly Festival 2026', type: 'Festival',
      venue: 'Southbank, London', status: 'Wrapped',
      start_date: '2026-05-15', end_date: '2026-08-31',
      brief: 'Annual Underbelly Festival on London\'s Southbank. Summer 2026 edition — wrapped successfully. Final financial reconciliation complete.',
      milestones: [
        { id: 'm-20', title: 'Festival opens', date: '2026-05-15', notes: '' },
        { id: 'm-21', title: 'Festival closes', date: '2026-08-31', notes: '' },
        { id: 'm-22', title: 'Final reconciliation', date: '2026-09-15', notes: '✓ Complete' },
      ],
      docs: [
        { id: 'd-20', name: 'Final Budget & Settlement', url: '', type: 'Budget' },
        { id: 'd-21', name: 'Venue Agreement', url: '', type: 'Contract' },
      ],
    },
  ],
};

// ── UTILITY HELPERS ────────────────────────────────────
const uid = () => crypto.randomUUID ? crypto.randomUUID() : 'id-' + Math.random().toString(36).slice(2);

const formatCurrency = (val, currency = 'GBP') => {
  const sym = currency === 'USD' ? '$' : '£';
  if (!val) return '—';
  return sym + Number(val).toLocaleString('en-GB');
};

const formatDate = (iso) => {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch { return iso; }
};

const typeBadge = (type) => {
  const map = {
    'Theatre': 'badge-theatre',
    'Festival': 'badge-festival',
    'Live Event': 'badge-live',
    'Cultural Experience': 'badge-cultural',
    'Tour': 'badge-tour',
  };
  return `<span class="badge ${map[type] || 'badge-default'}">${type || '—'}</span>`;
};

const statusBadge = (status) => {
  const key = (status || '').toLowerCase().replace(/[\s\/]+/g, '-');
  return `<span class="status-badge status-${key}">${status}</span>`;
};

const initials = (str) => {
  if (!str) return '?';
  return str.split(' ').filter(Boolean).map(w => w[0]).join('').toUpperCase().slice(0, 2);
};

let toastTimer;
const showToast = (msg, type = 'success') => {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = `toast ${type}`;
  el.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.add('hidden'), 3000);
};

// ── MODAL HELPERS ──────────────────────────────────────
const openModal  = (id) => document.getElementById(id).classList.remove('hidden');
const closeModal = (id) => document.getElementById(id).classList.add('hidden');

document.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-modal]');
  if (btn) closeModal(btn.dataset.modal);

  // Close modal on overlay click
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.add('hidden');
  }
});

// ── AUTH (bypassed — open access) ─────────────────────
const authScreen = document.getElementById('auth-screen');
const appEl      = document.getElementById('app');

function initAuth() {
  // No login required — hide auth screen and boot straight into the app
  authScreen.classList.add('hidden');
  appEl.classList.remove('hidden');
  const avatarEl = document.getElementById('user-avatar');
  const emailEl  = document.getElementById('user-email');
  if (avatarEl) avatarEl.textContent = 'UB';
  if (emailEl)  emailEl.textContent  = 'Underbelly';
  loadData();
}

// ── DATA LOADING ───────────────────────────────────────
// Tries Supabase tables; falls back to seed data if tables don't exist yet
async function loadData() {
  try {
    const [
      { data: leads },
      { data: proposals },
      { data: clients },
      { data: contacts },
      { data: projects },
    ] = await Promise.all([
      sb.from('leads').select('*').order('created_at', { ascending: false }),
      sb.from('proposals').select('*').order('created_at', { ascending: false }),
      sb.from('clients').select('*').order('name'),
      sb.from('contacts').select('*').order('last'),
      sb.from('projects').select('*').order('name'),
    ]);

    if (leads)     DB.leads     = leads;
    if (proposals) DB.proposals = proposals;
    if (clients)   DB.clients   = clients;
    if (contacts)  DB.contacts  = contacts;
    if (projects)  DB.projects  = projects;

    // Seed if empty
    if (!DB.leads.length)     DB.leads     = SEED.leads;
    if (!DB.proposals.length) DB.proposals = SEED.proposals;
    if (!DB.clients.length)   DB.clients   = SEED.clients;
    if (!DB.contacts.length)  DB.contacts  = SEED.contacts;
    if (!DB.projects.length)  DB.projects  = SEED.projects;

  } catch (err) {
    // Supabase tables not yet created — use seed data
    console.warn('Supabase tables not found; using seed data.', err.message);
    DB = { ...SEED };
    // Deep clone arrays so mutations don't corrupt SEED
    DB.leads     = JSON.parse(JSON.stringify(SEED.leads));
    DB.proposals = JSON.parse(JSON.stringify(SEED.proposals));
    DB.clients   = JSON.parse(JSON.stringify(SEED.clients));
    DB.contacts  = JSON.parse(JSON.stringify(SEED.contacts));
    DB.projects  = JSON.parse(JSON.stringify(SEED.projects));
  }

  renderAll();
}

// Save helpers (no-op if Supabase tables not yet set up)
async function persist(table, record) {
  try {
    const { error } = await sb.from(table).upsert(record);
    if (error) console.warn('Supabase persist error:', error.message);
  } catch {}
}

async function remove(table, id) {
  try {
    const { error } = await sb.from(table).delete().eq('id', id);
    if (error) console.warn('Supabase remove error:', error.message);
  } catch {}
}

// ── NAVIGATION ─────────────────────────────────────────
document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', (e) => {
    e.preventDefault();
    navigateTo(item.dataset.section);
  });
});

function navigateTo(section) {
  activeSection = section;

  document.querySelectorAll('.nav-item').forEach(i => i.classList.toggle('active', i.dataset.section === section));
  document.querySelectorAll('.section').forEach(s => s.classList.toggle('active', s.id === `section-${section}`));
}

// ── RENDER ALL ──────────────────────────────────────────
function renderAll() {
  renderIdeas();
  renderLeads();
  renderProposals();
  renderClients();
  renderProjects();
  updateBadgeCounts();
}

function updateBadgeCounts() {
  document.getElementById('leads-count').textContent     = DB.leads.length;
  document.getElementById('proposals-count').textContent = DB.proposals.length;
  document.getElementById('clients-count').textContent   = DB.clients.length;
  document.getElementById('projects-count').textContent  = DB.projects.length;
}

// ══════════════════════════════════════════════════════
// LEADS
// ══════════════════════════════════════════════════════
const STAGES = ['Enquiry', 'Proposal', 'Negotiation', 'Confirmed'];

function renderLeads() {
  STAGES.forEach(stage => {
    const cards = DB.leads.filter(l => l.stage === stage);
    document.getElementById(`count-${stage}`).textContent = cards.length;
    const col = document.getElementById(`col-${stage}`);
    col.innerHTML = cards.length ? cards.map(leadCardHTML).join('') : `<div class="empty-state" style="padding:1.5rem;"><p>No leads</p></div>`;
  });
}

function leadCardHTML(lead) {
  return `
    <div class="lead-card" data-id="${lead.id}">
      <div class="lead-card-name">${lead.name}</div>
      <div class="lead-card-venue">${lead.venue || '—'}</div>
      ${typeBadge(lead.type)}
      <div class="lead-card-footer">
        <span class="lead-card-value">${formatCurrency(lead.value, lead.currency)}</span>
        <div class="lead-card-actions">
          <button class="card-action-btn" onclick="editLead('${lead.id}'); event.stopPropagation();">Edit</button>
          <button class="card-action-btn danger" onclick="deleteLead('${lead.id}'); event.stopPropagation();">Delete</button>
        </div>
      </div>
    </div>`;
}

document.getElementById('new-lead-btn').addEventListener('click', () => {
  document.getElementById('lead-id').value        = '';
  document.getElementById('lead-form').reset();
  document.getElementById('lead-modal-title').textContent = 'New Lead';
  openModal('lead-modal');
});

document.getElementById('lead-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('lead-id').value || uid();
  const record = {
    id,
    name:       document.getElementById('lead-name').value.trim(),
    type:       document.getElementById('lead-type').value,
    venue:      document.getElementById('lead-venue').value.trim(),
    contact:    document.getElementById('lead-contact').value.trim(),
    currency:   document.getElementById('lead-currency').value,
    value:      parseFloat(document.getElementById('lead-value').value) || 0,
    stage:      document.getElementById('lead-stage').value,
    source:     document.getElementById('lead-source').value.trim(),
    notes:      document.getElementById('lead-notes').value.trim(),
    created_at: new Date().toISOString(),
  };

  const idx = DB.leads.findIndex(l => l.id === id);
  if (idx >= 0) DB.leads[idx] = record; else DB.leads.unshift(record);

  await persist('leads', record);
  closeModal('lead-modal');
  renderLeads();
  updateBadgeCounts();
  showToast(idx >= 0 ? 'Lead updated' : 'Lead added');
});

window.editLead = (id) => {
  const lead = DB.leads.find(l => l.id === id);
  if (!lead) return;
  document.getElementById('lead-modal-title').textContent = 'Edit Lead';
  document.getElementById('lead-id').value       = lead.id;
  document.getElementById('lead-name').value     = lead.name;
  document.getElementById('lead-type').value     = lead.type;
  document.getElementById('lead-venue').value    = lead.venue || '';
  document.getElementById('lead-contact').value  = lead.contact || '';
  document.getElementById('lead-currency').value = lead.currency || 'GBP';
  document.getElementById('lead-value').value    = lead.value || '';
  document.getElementById('lead-stage').value    = lead.stage;
  document.getElementById('lead-source').value   = lead.source || '';
  document.getElementById('lead-notes').value    = lead.notes || '';
  openModal('lead-modal');
};

window.deleteLead = async (id) => {
  if (!confirm('Delete this lead?')) return;
  DB.leads = DB.leads.filter(l => l.id !== id);
  await remove('leads', id);
  renderLeads();
  updateBadgeCounts();
  showToast('Lead deleted');
};

// ══════════════════════════════════════════════════════
// PROPOSALS
// ══════════════════════════════════════════════════════
function renderProposals() {
  const tbody = document.getElementById('proposals-tbody');
  if (!DB.proposals.length) {
    tbody.innerHTML = `<tr><td colspan="7"><div class="empty-state"><div class="empty-state-icon">📄</div><p>No proposals yet. Create one to get started.</p></div></td></tr>`;
    return;
  }
  tbody.innerHTML = DB.proposals.map(p => {
    const lead = DB.leads.find(l => l.id === p.lead_id);
    const total = (p.phases || []).reduce((s, ph) => s + (ph.fee || 0), 0);
    return `
      <tr onclick="editProposal('${p.id}')">
        <td><strong>${p.title}</strong></td>
        <td>${p.client || '—'}</td>
        <td>${lead ? lead.name : '—'}</td>
        <td>${formatCurrency(total)}</td>
        <td>${statusBadge(p.status || 'Draft')}</td>
        <td>${formatDate(p.sent_date)}</td>
        <td>
          <button class="btn-ghost" onclick="previewProposal('${p.id}'); event.stopPropagation();">Preview</button>
          <button class="btn-ghost" onclick="deleteProposal('${p.id}'); event.stopPropagation();" style="color:var(--red)">Delete</button>
        </td>
      </tr>`;
  }).join('');
}

// Phase row management
let proposalPhases = [];

function renderPhases() {
  const list = document.getElementById('phases-list');
  list.innerHTML = proposalPhases.map((ph, i) => `
    <div class="phase-row">
      <input type="text" class="phase-name" data-i="${i}" placeholder="Phase name" value="${ph.name || ''}">
      <input type="number" class="phase-amount" data-i="${i}" placeholder="Fee (£)" value="${ph.fee || ''}" style="width:110px;text-align:right">
      <button type="button" class="phase-remove" data-i="${i}">×</button>
    </div>`).join('');

  list.querySelectorAll('.phase-name').forEach(el => {
    el.addEventListener('input', () => { proposalPhases[el.dataset.i].name = el.value; });
  });
  list.querySelectorAll('.phase-amount').forEach(el => {
    el.addEventListener('input', () => { proposalPhases[el.dataset.i].fee = parseFloat(el.value) || 0; });
  });
  list.querySelectorAll('.phase-remove').forEach(el => {
    el.addEventListener('click', () => { proposalPhases.splice(el.dataset.i, 1); renderPhases(); });
  });
}

document.getElementById('add-phase-btn').addEventListener('click', () => {
  proposalPhases.push({ name: '', fee: 0 });
  renderPhases();
});

document.getElementById('new-proposal-btn').addEventListener('click', () => {
  document.getElementById('proposal-id').value = '';
  document.getElementById('proposal-form').reset();
  document.getElementById('proposal-modal-title').textContent = 'New Proposal';
  proposalPhases = [{ name: 'Phase 1', fee: 0 }];
  renderPhases();
  populateLeadSelect();
  openModal('proposal-modal');
});

function populateLeadSelect(selectedId = '') {
  const sel = document.getElementById('proposal-lead');
  sel.innerHTML = `<option value="">None</option>` +
    DB.leads.map(l => `<option value="${l.id}" ${l.id === selectedId ? 'selected' : ''}>${l.name}</option>`).join('');
}

document.getElementById('proposal-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('proposal-id').value || uid();
  const record = {
    id,
    title:              document.getElementById('proposal-title').value.trim(),
    client:             document.getElementById('proposal-client').value.trim(),
    lead_id:            document.getElementById('proposal-lead').value || null,
    status:             document.getElementById('proposal-status').value,
    intro:              document.getElementById('proposal-intro').value.trim(),
    investment_notes:   document.getElementById('proposal-investment').value.trim(),
    phases:             JSON.parse(JSON.stringify(proposalPhases)),
    sent_date:          document.getElementById('proposal-status').value === 'Sent' ? new Date().toISOString().slice(0, 10) : null,
    created_at:         new Date().toISOString(),
  };

  const idx = DB.proposals.findIndex(p => p.id === id);
  if (idx >= 0) DB.proposals[idx] = record; else DB.proposals.unshift(record);

  await persist('proposals', record);
  closeModal('proposal-modal');
  renderProposals();
  showToast(idx >= 0 ? 'Proposal updated' : 'Proposal saved');
});

window.editProposal = (id) => {
  const p = DB.proposals.find(x => x.id === id);
  if (!p) return;
  document.getElementById('proposal-modal-title').textContent = 'Edit Proposal';
  document.getElementById('proposal-id').value        = p.id;
  document.getElementById('proposal-title').value     = p.title || '';
  document.getElementById('proposal-client').value    = p.client || '';
  document.getElementById('proposal-status').value    = p.status || 'Draft';
  document.getElementById('proposal-intro').value     = p.intro || '';
  document.getElementById('proposal-investment').value = p.investment_notes || '';
  proposalPhases = JSON.parse(JSON.stringify(p.phases || []));
  renderPhases();
  populateLeadSelect(p.lead_id || '');
  openModal('proposal-modal');
};

window.deleteProposal = async (id) => {
  if (!confirm('Delete this proposal?')) return;
  DB.proposals = DB.proposals.filter(p => p.id !== id);
  await remove('proposals', id);
  renderProposals();
  showToast('Proposal deleted');
};

// PDF Preview
document.getElementById('proposal-preview-btn').addEventListener('click', () => {
  const id = document.getElementById('proposal-id').value;
  if (id) {
    previewProposal(id);
  } else {
    // Preview current unsaved form
    const tempProposal = {
      title:            document.getElementById('proposal-title').value,
      client:           document.getElementById('proposal-client').value,
      status:           document.getElementById('proposal-status').value,
      intro:            document.getElementById('proposal-intro').value,
      investment_notes: document.getElementById('proposal-investment').value,
      phases:           proposalPhases,
    };
    renderProposalPreview(tempProposal);
  }
});

window.previewProposal = (id) => {
  const p = DB.proposals.find(x => x.id === id);
  if (!p) return;
  renderProposalPreview(p);
};

function renderProposalPreview(p) {
  const total = (p.phases || []).reduce((s, ph) => s + (ph.fee || 0), 0);
  const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  document.getElementById('pdf-preview-content').innerHTML = `
    <div class="pdf-header">
      <div>
        <div class="pdf-logo">UNDERBELLY</div>
        <div style="font-size:0.75rem;color:var(--text-muted);">General Management &amp; Production</div>
      </div>
      <div class="pdf-date">Prepared ${today}</div>
    </div>

    <h1>${p.title || 'Untitled Proposal'}</h1>
    <div class="pdf-client">${p.client ? 'Prepared for: ' + p.client : ''}</div>

    ${p.intro ? `
    <div class="pdf-section">
      <div class="pdf-section-title">Introduction</div>
      <p>${p.intro.replace(/\n/g, '<br>')}</p>
    </div>` : ''}

    ${p.phases && p.phases.length ? `
    <div class="pdf-section">
      <div class="pdf-section-title">Scope &amp; Fee Proposal</div>
      <table>
        <thead><tr><th>Phase</th><th style="text-align:right">Fee (excl. VAT)</th></tr></thead>
        <tbody>
          ${p.phases.map(ph => `<tr><td>${ph.name}</td><td style="text-align:right">${formatCurrency(ph.fee)}</td></tr>`).join('')}
        </tbody>
      </table>
      <div class="pdf-total">Total: ${formatCurrency(total)}</div>
    </div>` : ''}

    ${p.investment_notes ? `
    <div class="pdf-section">
      <div class="pdf-section-title">Investment &amp; Terms</div>
      <p>${p.investment_notes.replace(/\n/g, '<br>')}</p>
    </div>` : ''}

    <div class="pdf-section" style="margin-top:3rem;border-top:1px solid #eee;padding-top:1rem;font-size:0.75rem;color:#999;">
      Underbelly Ltd · Registered in Scotland SC329448 · 56 Cowgate, Edinburgh EH1 1JX
    </div>`;

  closeModal('proposal-modal');
  openModal('pdf-preview-modal');
}

document.getElementById('print-proposal-btn').addEventListener('click', () => window.print());

// ══════════════════════════════════════════════════════
// CLIENTS
// ══════════════════════════════════════════════════════
function renderClients(filter = '') {
  const list = document.getElementById('company-list');
  const companies = filter
    ? DB.clients.filter(c => c.name.toLowerCase().includes(filter.toLowerCase()))
    : DB.clients;

  if (!companies.length) {
    list.innerHTML = `<li style="padding:1rem;color:var(--text-muted);font-size:0.875rem;">No companies found</li>`;
    return;
  }

  list.innerHTML = companies.map(c => `
    <li class="company-item ${c.id === activeCompanyId ? 'active' : ''}" data-id="${c.id}">
      <div class="company-avatar">${initials(c.name)}</div>
      <div class="company-info">
        <div class="company-name">${c.name}</div>
        <div class="company-type">${c.type || ''} ${c.city ? '· ' + c.city : ''}</div>
      </div>
      <button class="btn-ghost" style="font-size:0.75rem;padding:2px 6px;" onclick="editClient('${c.id}'); event.stopPropagation();">✎</button>
    </li>`).join('');

  list.querySelectorAll('.company-item').forEach(item => {
    item.addEventListener('click', () => {
      activeCompanyId = item.dataset.id;
      renderClients(document.getElementById('clients-search').value);
      renderContacts(activeCompanyId);
    });
  });

  if (activeCompanyId) renderContacts(activeCompanyId);
}

function renderContacts(companyId) {
  const company = DB.clients.find(c => c.id === companyId);
  const contacts = DB.contacts.filter(c => c.company_id === companyId);
  const nameEl = document.getElementById('contacts-company-name');
  const btn    = document.getElementById('new-contact-btn');
  const panel  = document.getElementById('contacts-list');

  nameEl.textContent = company ? company.name : 'Select a company';
  btn.style.display  = company ? '' : 'none';

  if (!contacts.length) {
    panel.innerHTML = `<div class="empty-state"><div class="empty-state-icon">👤</div><p>No contacts for this company yet.</p></div>`;
    return;
  }

  panel.innerHTML = contacts.map(con => `
    <div class="contact-card">
      <div class="contact-avatar">${initials(con.first + ' ' + con.last)}</div>
      <div class="contact-info">
        <div class="contact-name">${con.first} ${con.last}</div>
        <div class="contact-role">${con.role || ''}</div>
        ${con.email ? `<a class="contact-detail" href="mailto:${con.email}">${con.email}</a>` : ''}
        ${con.phone ? `<div class="contact-detail">${con.phone}</div>` : ''}
        ${con.notes ? `<div style="font-size:0.75rem;color:var(--text-muted);margin-top:0.25rem;">${con.notes}</div>` : ''}
      </div>
      <div class="contact-actions">
        <button class="card-action-btn" onclick="editContact('${con.id}')">Edit</button>
        <button class="card-action-btn danger" onclick="deleteContact('${con.id}')">Delete</button>
      </div>
    </div>`).join('');
}

document.getElementById('clients-search').addEventListener('input', (e) => {
  renderClients(e.target.value);
});

document.getElementById('new-client-btn').addEventListener('click', () => {
  document.getElementById('client-id').value = '';
  document.getElementById('client-form').reset();
  document.getElementById('client-modal-title').textContent = 'New Company';
  document.getElementById('client-country').value = 'UK';
  openModal('client-modal');
});

document.getElementById('client-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('client-id').value || uid();
  const record = {
    id,
    name:    document.getElementById('client-name').value.trim(),
    type:    document.getElementById('client-type').value,
    city:    document.getElementById('client-city').value.trim(),
    country: document.getElementById('client-country').value.trim(),
    website: document.getElementById('client-website').value.trim(),
    notes:   document.getElementById('client-notes').value.trim(),
  };

  const idx = DB.clients.findIndex(c => c.id === id);
  if (idx >= 0) DB.clients[idx] = record; else DB.clients.push(record);
  DB.clients.sort((a, b) => a.name.localeCompare(b.name));

  await persist('clients', record);
  closeModal('client-modal');
  renderClients();
  updateBadgeCounts();
  showToast(idx >= 0 ? 'Company updated' : 'Company added');
});

window.editClient = (id) => {
  const c = DB.clients.find(x => x.id === id);
  if (!c) return;
  document.getElementById('client-modal-title').textContent = 'Edit Company';
  document.getElementById('client-id').value      = c.id;
  document.getElementById('client-name').value    = c.name;
  document.getElementById('client-type').value    = c.type || '';
  document.getElementById('client-city').value    = c.city || '';
  document.getElementById('client-country').value = c.country || 'UK';
  document.getElementById('client-website').value = c.website || '';
  document.getElementById('client-notes').value   = c.notes || '';
  openModal('client-modal');
};

// Contact modal
document.getElementById('new-contact-btn').addEventListener('click', () => {
  document.getElementById('contact-id').value = '';
  document.getElementById('contact-form').reset();
  document.getElementById('contact-company-id').value = activeCompanyId || '';
  document.getElementById('contact-modal-title').textContent = 'New Contact';
  openModal('contact-modal');
});

document.getElementById('contact-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('contact-id').value || uid();
  const record = {
    id,
    company_id: document.getElementById('contact-company-id').value,
    first:  document.getElementById('contact-first').value.trim(),
    last:   document.getElementById('contact-last').value.trim(),
    role:   document.getElementById('contact-role').value.trim(),
    email:  document.getElementById('contact-email').value.trim(),
    phone:  document.getElementById('contact-phone').value.trim(),
    notes:  document.getElementById('contact-notes').value.trim(),
  };

  const idx = DB.contacts.findIndex(c => c.id === id);
  if (idx >= 0) DB.contacts[idx] = record; else DB.contacts.push(record);

  await persist('contacts', record);
  closeModal('contact-modal');
  renderContacts(record.company_id);
  showToast(idx >= 0 ? 'Contact updated' : 'Contact added');
});

window.editContact = (id) => {
  const c = DB.contacts.find(x => x.id === id);
  if (!c) return;
  document.getElementById('contact-modal-title').textContent = 'Edit Contact';
  document.getElementById('contact-id').value         = c.id;
  document.getElementById('contact-company-id').value = c.company_id;
  document.getElementById('contact-first').value      = c.first;
  document.getElementById('contact-last').value       = c.last;
  document.getElementById('contact-role').value       = c.role || '';
  document.getElementById('contact-email').value      = c.email || '';
  document.getElementById('contact-phone').value      = c.phone || '';
  document.getElementById('contact-notes').value      = c.notes || '';
  openModal('contact-modal');
};

window.deleteContact = async (id) => {
  if (!confirm('Delete this contact?')) return;
  const con = DB.contacts.find(c => c.id === id);
  DB.contacts = DB.contacts.filter(c => c.id !== id);
  await remove('contacts', id);
  if (con) renderContacts(con.company_id);
  showToast('Contact deleted');
};

// ══════════════════════════════════════════════════════
// PROJECTS
// ══════════════════════════════════════════════════════
function renderProjects() {
  const grid = document.getElementById('projects-grid');
  if (!DB.projects.length) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1;padding:3rem;"><div class="empty-state-icon">📋</div><p>No projects yet.</p></div>`;
    return;
  }
  grid.innerHTML = DB.projects.map(p => {
    const dates = p.start_date ? `${formatDate(p.start_date)}${p.end_date ? ' – ' + formatDate(p.end_date) : ''}` : '';
    return `
      <div class="project-card" data-id="${p.id}">
        <div class="project-card-top">
          <div class="project-card-header">
            <div class="project-card-name">${p.name}</div>
            ${statusBadge(p.status || 'Development')}
          </div>
          <div class="project-card-venue">${p.venue || '—'}</div>
          ${typeBadge(p.type)}
        </div>
        <div class="project-card-footer">
          <span class="project-dates">${dates}</span>
          <div class="project-card-actions">
            <button class="card-action-btn" onclick="editProject('${p.id}'); event.stopPropagation();">Edit</button>
            <button class="card-action-btn danger" onclick="deleteProject('${p.id}'); event.stopPropagation();">Delete</button>
          </div>
        </div>
      </div>`;
  }).join('');

  document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('.card-action-btn')) return;
      openProjectDrawer(card.dataset.id);
    });
  });
}

document.getElementById('new-project-btn').addEventListener('click', () => {
  document.getElementById('project-id').value = '';
  document.getElementById('project-form').reset();
  document.getElementById('project-modal-title').textContent = 'New Project';
  openModal('project-modal');
});

document.getElementById('project-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('project-id').value || uid();
  const record = {
    id,
    name:       document.getElementById('project-name').value.trim(),
    type:       document.getElementById('project-type').value,
    venue:      document.getElementById('project-venue').value.trim(),
    status:     document.getElementById('project-status').value,
    start_date: document.getElementById('project-start').value || null,
    end_date:   document.getElementById('project-end').value || null,
    brief:      '',
    milestones: [],
    docs:       [],
  };

  const idx = DB.projects.findIndex(p => p.id === id);
  if (idx >= 0) {
    // Preserve existing brief/milestones/docs on edit
    record.brief      = DB.projects[idx].brief || '';
    record.milestones = DB.projects[idx].milestones || [];
    record.docs       = DB.projects[idx].docs || [];
    DB.projects[idx]  = record;
  } else {
    DB.projects.unshift(record);
  }

  await persist('projects', record);
  closeModal('project-modal');
  renderProjects();
  updateBadgeCounts();
  showToast(idx >= 0 ? 'Project updated' : 'Project created');
});

window.editProject = (id) => {
  const p = DB.projects.find(x => x.id === id);
  if (!p) return;
  document.getElementById('project-modal-title').textContent = 'Edit Project';
  document.getElementById('project-id').value     = p.id;
  document.getElementById('project-name').value   = p.name;
  document.getElementById('project-type').value   = p.type || '';
  document.getElementById('project-venue').value  = p.venue || '';
  document.getElementById('project-status').value = p.status || '';
  document.getElementById('project-start').value  = p.start_date || '';
  document.getElementById('project-end').value    = p.end_date || '';
  openModal('project-modal');
};

window.deleteProject = async (id) => {
  if (!confirm('Delete this project?')) return;
  DB.projects = DB.projects.filter(p => p.id !== id);
  await remove('projects', id);
  renderProjects();
  updateBadgeCounts();
  showToast('Project deleted');
};

// ── PROJECT DRAWER ─────────────────────────────────────
function openProjectDrawer(id) {
  activeProjectId = id;
  const p = DB.projects.find(x => x.id === id);
  if (!p) return;

  document.getElementById('drawer-project-name').textContent = p.name;
  document.getElementById('drawer-project-meta').innerHTML =
    `${typeBadge(p.type)} ${statusBadge(p.status || 'Development')} <span style="color:var(--text-muted)">${p.venue || ''}</span>`;

  // Switch to brief tab
  switchDrawerTab('brief');
  document.getElementById('brief-content').value = p.brief || '';
  renderTimeline(p);
  renderDocs(p);

  document.getElementById('project-drawer').classList.remove('hidden');
}

document.getElementById('drawer-close-btn').addEventListener('click', () => {
  document.getElementById('project-drawer').classList.add('hidden');
  activeProjectId = null;
});

document.getElementById('project-drawer').addEventListener('click', (e) => {
  if (e.target === document.getElementById('project-drawer')) {
    document.getElementById('project-drawer').classList.add('hidden');
    activeProjectId = null;
  }
});

document.getElementById('drawer-edit-btn').addEventListener('click', () => {
  if (activeProjectId) editProject(activeProjectId);
});

// Drawer tabs
document.querySelectorAll('.drawer-tab').forEach(tab => {
  tab.addEventListener('click', () => switchDrawerTab(tab.dataset.tab));
});

function switchDrawerTab(tab) {
  activeDrawerTab = tab;
  document.querySelectorAll('.drawer-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
  document.querySelectorAll('.drawer-tab-panel').forEach(p => p.classList.toggle('active', p.id === `tab-${tab}`));
}

// Brief
document.getElementById('save-brief-btn').addEventListener('click', async () => {
  const p = DB.projects.find(x => x.id === activeProjectId);
  if (!p) return;
  p.brief = document.getElementById('brief-content').value;
  await persist('projects', p);
  showToast('Brief saved');
});

// Milestones
function renderTimeline(p) {
  const list = document.getElementById('timeline-list');
  const milestones = (p.milestones || []).sort((a, b) => new Date(a.date) - new Date(b.date));
  list.innerHTML = milestones.length
    ? milestones.map(m => `
        <div class="milestone-item">
          <div class="milestone-dot"></div>
          <div class="milestone-info">
            <div class="milestone-title">${m.title}</div>
            <div class="milestone-date">${formatDate(m.date)}</div>
            ${m.notes ? `<div class="milestone-notes">${m.notes}</div>` : ''}
          </div>
          <button class="card-action-btn danger" onclick="deleteMilestone('${m.id}')">×</button>
        </div>`).join('')
    : `<div class="empty-state"><div class="empty-state-icon">📅</div><p>No milestones yet.</p></div>`;
}

document.getElementById('add-milestone-btn').addEventListener('click', () => {
  document.getElementById('milestone-form').reset();
  openModal('milestone-modal');
});

document.getElementById('milestone-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const p = DB.projects.find(x => x.id === activeProjectId);
  if (!p) return;
  const m = {
    id:    uid(),
    title: document.getElementById('milestone-title').value.trim(),
    date:  document.getElementById('milestone-date').value,
    notes: document.getElementById('milestone-notes').value.trim(),
  };
  p.milestones = [...(p.milestones || []), m];
  await persist('projects', p);
  closeModal('milestone-modal');
  renderTimeline(p);
  showToast('Milestone added');
});

window.deleteMilestone = async (id) => {
  const p = DB.projects.find(x => x.id === activeProjectId);
  if (!p) return;
  p.milestones = (p.milestones || []).filter(m => m.id !== id);
  await persist('projects', p);
  renderTimeline(p);
  showToast('Milestone removed');
};

// Docs
function renderDocs(p) {
  const list = document.getElementById('docs-list');
  const docs = p.docs || [];
  list.innerHTML = docs.length
    ? docs.map(d => `
        <div class="doc-item">
          <div class="doc-icon">${(d.type || 'DOC').slice(0, 3)}</div>
          <div class="doc-info">
            <div class="doc-name">${d.name}</div>
            <div class="doc-type">${d.type}</div>
            ${d.url ? `<a class="doc-link" href="${d.url}" target="_blank" rel="noopener">Open link ↗</a>` : '<span class="doc-link" style="color:var(--text-muted)">No link</span>'}
          </div>
          <button class="card-action-btn danger" onclick="deleteDoc('${d.id}')">×</button>
        </div>`).join('')
    : `<div class="empty-state"><div class="empty-state-icon">📁</div><p>No documents linked yet.</p></div>`;
}

document.getElementById('add-doc-btn').addEventListener('click', () => {
  document.getElementById('doc-form').reset();
  openModal('doc-modal');
});

document.getElementById('doc-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const p = DB.projects.find(x => x.id === activeProjectId);
  if (!p) return;
  const d = {
    id:   uid(),
    name: document.getElementById('doc-name').value.trim(),
    url:  document.getElementById('doc-url').value.trim(),
    type: document.getElementById('doc-type').value,
  };
  p.docs = [...(p.docs || []), d];
  await persist('projects', p);
  closeModal('doc-modal');
  renderDocs(p);
  showToast('Document added');
});

window.deleteDoc = async (id) => {
  const p = DB.projects.find(x => x.id === activeProjectId);
  if (!p) return;
  p.docs = (p.docs || []).filter(d => d.id !== id);
  await persist('projects', p);
  renderDocs(p);
  showToast('Document removed');
};

// ── BOOT ───────────────────────────────────────────────
initAuth();

// ── IDEAS PARK ─────────────────────────────────────────

const INSPIRE_IDEAS = [
  { type: 'Festival', title: 'Fringe After Dark', desc: 'A late-night festival strand running midnight–3am across Edinburgh Fringe. Club nights, immersive performance and secret gigs in unexpected spaces.' },
  { type: 'Live Event', title: 'Southbank Summer Spectacular', desc: 'A weekend takeover of the South Bank with free outdoor performance, food market and a headline ticketed show under the stars.' },
  { type: 'Theatre', title: 'Site-Specific Scottish Tour', desc: 'A new play performed in non-traditional Scottish venues — distilleries, castles, community halls — touring 8 locations over 3 weeks.' },
  { type: 'Cultural Experience', title: 'The Great British Circus Revival', desc: 'A touring big top celebrating the history of British circus. New acts, heritage archive, and a community skills programme at each stop.' },
  { type: 'Festival', title: 'Edinburgh Eats & Beats', desc: 'A food and music festival running alongside the Edinburgh Fringe — local producers, guest chefs, and live music across three stages.' },
  { type: 'Live Event', title: 'Rooftop Cinema Series', desc: 'Monthly rooftop film screenings in London with live score performances. Partner with a film composer to create original accompaniments.' },
  { type: 'Tour', title: 'New Writing Road Trip', desc: 'A van tour of 15 UK towns with no existing theatre infrastructure. A small company, a new play, performed in pubs, libraries and car parks.' },
  { type: 'Theatre', title: 'West End Lunchtime Theatre', desc: 'Short 45-minute lunchtime productions in a West End venue. New writing, affordable tickets, aimed at workers and tourists.' },
  { type: 'Cultural Experience', title: 'Underground Edinburgh', desc: 'A walking experience through Edinburgh\'s hidden underground vaults — immersive theatre, storytelling and local history brought to life.' },
  { type: 'Festival', title: 'UK Spoken Word Festival', desc: 'A national festival celebrating spoken word, poetry slam and storytelling. Touring 6 cities with a headline weekend in London.' },
  { type: 'Live Event', title: 'The Underbelly Games Night', desc: 'A large-scale competitive games evening for 500+ people. Teams, prizes, giant versions of classic games, hosted by a comedian.' },
  { type: 'Theatre', title: 'Immersive Panto', desc: 'A fully immersive pantomime where the audience moves between rooms following different storylines. Suitable for families and adults.' },
];

let inspireIndex = Math.floor(Math.random() * INSPIRE_IDEAS.length);

function showInspireIdea() {
  const idea = INSPIRE_IDEAS[inspireIndex % INSPIRE_IDEAS.length];
  document.getElementById('inspire-tag').textContent = idea.type;
  document.getElementById('inspire-title').textContent = idea.title;
  document.getElementById('inspire-desc').textContent = idea.desc;
}

document.getElementById('inspire-btn').addEventListener('click', () => {
  inspireIndex = Math.floor(Math.random() * INSPIRE_IDEAS.length);
  showInspireIdea();
  openModal('inspire-modal');
});

document.getElementById('inspire-skip-btn').addEventListener('click', () => {
  inspireIndex++;
  showInspireIdea();
});

document.getElementById('inspire-add-btn').addEventListener('click', () => {
  const idea = INSPIRE_IDEAS[inspireIndex % INSPIRE_IDEAS.length];
  const newIdea = {
    id: uid(),
    name: idea.title,
    type: idea.type,
    venue: '',
    notes: idea.desc,
    created_at: new Date().toISOString().slice(0, 10),
    source: 'Inspired',
  };
  DB.ideas.push(newIdea);
  closeModal('inspire-modal');
  renderIdeas();
  showToast('Idea added to Ideas Park 🐄');
  document.querySelector('[data-section="ideas"]').click();
});

document.getElementById('new-idea-btn').addEventListener('click', () => {
  document.getElementById('idea-modal-title').textContent = 'New Idea';
  document.getElementById('idea-form').reset();
  document.getElementById('idea-form').dataset.editId = '';
  openModal('idea-modal');
});

document.getElementById('idea-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const editId = e.target.dataset.editId;
  const record = {
    id: editId || uid(),
    name: document.getElementById('idea-name').value.trim(),
    type: document.getElementById('idea-type').value,
    venue: document.getElementById('idea-venue').value.trim(),
    notes: document.getElementById('idea-notes').value.trim(),
    created_at: new Date().toISOString().slice(0, 10),
    source: 'Manual',
  };
  if (editId) {
    const i = DB.ideas.findIndex(x => x.id === editId);
    if (i > -1) DB.ideas[i] = record;
  } else {
    DB.ideas.push(record);
  }
  closeModal('idea-modal');
  renderIdeas();
  showToast(editId ? 'Idea updated' : 'Idea saved 🐄');
});

function renderIdeas() {
  const grid = document.getElementById('ideas-grid');
  const count = document.getElementById('ideas-count');
  if (count) count.textContent = DB.ideas.length;

  if (!DB.ideas.length) {
    grid.innerHTML = `<div class="ideas-empty">
      <div class="ideas-empty-icon">🐄</div>
      <p>No ideas yet</p>
      <span>Click <strong>Graze on an idea</strong> for inspiration, or add your own</span>
    </div>`;
    return;
  }

  grid.innerHTML = DB.ideas.map(idea => `
    <div class="idea-card" data-id="${idea.id}">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;">
        ${typeBadge(idea.type)}
        <span style="font-size:0.75rem;color:var(--text-muted);">${formatDate(idea.created_at)}</span>
      </div>
      <div class="idea-card-title">${idea.name}</div>
      ${idea.venue ? `<div class="idea-card-meta">📍 ${idea.venue}</div>` : ''}
      ${idea.notes ? `<div class="idea-card-notes">${idea.notes}</div>` : ''}
      <div class="idea-card-actions">
        <button class="btn btn-outline btn-sm idea-to-lead" data-id="${idea.id}">→ Lead</button>
        <button class="btn btn-outline btn-sm idea-to-project" data-id="${idea.id}">→ Project</button>
        <button class="btn btn-ghost btn-sm idea-delete" data-id="${idea.id}" style="flex:0;">✕</button>
      </div>
    </div>
  `).join('');

  // Card action handlers
  grid.querySelectorAll('.idea-to-lead').forEach(btn => {
    btn.addEventListener('click', () => {
      const idea = DB.ideas.find(x => x.id === btn.dataset.id);
      if (!idea) return;
      // Pre-fill lead modal
      document.getElementById('lead-name').value = idea.name;
      document.getElementById('lead-type').value = idea.type;
      document.getElementById('lead-venue').value = idea.venue || '';
      document.getElementById('lead-notes').value = idea.notes || '';
      document.getElementById('lead-modal-title').textContent = 'Convert to Lead';
      document.getElementById('lead-form').dataset.editId = '';
      document.getElementById('lead-form').dataset.fromIdea = idea.id;
      openModal('lead-modal');
      document.querySelector('[data-section="leads"]').click();
    });
  });

  grid.querySelectorAll('.idea-to-project').forEach(btn => {
    btn.addEventListener('click', () => {
      const idea = DB.ideas.find(x => x.id === btn.dataset.id);
      if (!idea) return;
      document.getElementById('project-name').value = idea.name;
      document.getElementById('project-type').value = idea.type;
      document.getElementById('project-venue').value = idea.venue || '';
      document.getElementById('project-brief').value = idea.notes || '';
      document.getElementById('project-modal-title').textContent = 'Convert to Project';
      document.getElementById('project-form').dataset.editId = '';
      openModal('project-modal');
      document.querySelector('[data-section="projects"]').click();
    });
  });

  grid.querySelectorAll('.idea-delete').forEach(btn => {
    btn.addEventListener('click', () => {
      DB.ideas = DB.ideas.filter(x => x.id !== btn.dataset.id);
      renderIdeas();
      showToast('Idea removed');
    });
  });
}
