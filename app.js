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
      { data: ideas },
      { data: tasks },
    ] = await Promise.all([
      sb.from('leads').select('*').order('created_at', { ascending: false }),
      sb.from('proposals').select('*').order('created_at', { ascending: false }),
      sb.from('clients').select('*').order('name'),
      sb.from('contacts').select('*').order('last'),
      sb.from('projects').select('*').order('name'),
      sb.from('ideas').select('*').order('created_at', { ascending: false }),
      sb.from('tasks').select('*').order('created_at', { ascending: false }),
    ]);

    if (leads)     DB.leads     = leads;
    if (proposals) DB.proposals = proposals;
    if (clients)   DB.clients   = clients;
    if (contacts)  DB.contacts  = contacts;
    if (projects)  DB.projects  = projects;
    if (ideas)     DB.ideas     = ideas;
    if (tasks)     DB.tasks     = tasks;

    // Seed if empty (first run)
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
  document.querySelectorAll('.tab-item').forEach(i => i.classList.toggle('active', i.dataset.section === section));
  document.querySelectorAll('.section').forEach(s => s.classList.toggle('active', s.id === `section-${section}`));
}

// ── MOBILE TAB BAR ────────────────────────────────────
document.querySelectorAll('.tab-item').forEach(item => {
  item.addEventListener('click', (e) => {
    e.preventDefault();
    navigateTo(item.dataset.section);
  });
});

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
    <div class="lead-card" data-id="${lead.id}" onclick="editLead('${lead.id}')" style="cursor:pointer;">
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
        <td data-label="Title"><strong>${p.title}</strong></td>
        <td data-label="Client">${p.client || '—'}</td>
        <td data-label="Lead">${lead ? lead.name : '—'}</td>
        <td data-label="Value">${formatCurrency(total)}</td>
        <td data-label="Status">${statusBadge(p.status || 'Draft')}</td>
        <td data-label="Sent">${formatDate(p.sent_date)}</td>
        <td data-label="Actions">
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
  setTimeout(() => renderLinkedTasks('client', id, 'client-tasks-list', 'client-add-task-btn'), 0);
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
  navigateTo('ideas');
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
  persist('ideas', record);
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
      navigateTo('leads');
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
      navigateTo('projects');
    });
  });

  grid.querySelectorAll('.idea-delete').forEach(btn => {
    btn.addEventListener('click', () => {
      const ideaId = btn.dataset.id;
      DB.ideas = DB.ideas.filter(x => x.id !== ideaId);
      remove('ideas', ideaId);
      renderIdeas();
      showToast('Idea removed');
    });
  });
}

// ── FLOATING ACTION BUTTON ─────────────────────────────
const fabMain = document.getElementById('fab-main');
const fabMenu = document.getElementById('fab-menu');

fabMain.addEventListener('click', () => {
  const open = fabMenu.classList.toggle('open');
  fabMain.classList.toggle('open', open);
});

// Close on outside click
document.addEventListener('click', (e) => {
  if (!e.target.closest('#fab-container')) {
    fabMenu.classList.remove('open');
    fabMain.classList.remove('open');
  }
});

const fabActions = {
  'fab-new-idea':     () => { navigateTo('ideas');     document.getElementById('idea-form').reset(); document.getElementById('idea-form').dataset.editId = ''; document.getElementById('idea-modal-title').textContent = 'New Idea'; openModal('idea-modal'); },
  'fab-new-lead':     () => { navigateTo('leads');     document.getElementById('lead-form').reset(); document.getElementById('lead-form').dataset.editId = ''; document.getElementById('lead-modal-title').textContent = 'New Lead'; openModal('lead-modal'); },
  'fab-new-proposal': () => { navigateTo('proposals'); document.getElementById('proposal-form').reset(); document.getElementById('proposal-form').dataset.editId = ''; document.getElementById('proposal-modal-title').textContent = 'New Proposal'; openModal('proposal-modal'); },
  'fab-new-client':   () => { navigateTo('clients');   document.getElementById('client-form').reset(); document.getElementById('client-form').dataset.editId = ''; document.getElementById('client-modal-title').textContent = 'New Company'; openModal('client-modal'); },
  'fab-new-project':  () => { navigateTo('projects');  document.getElementById('project-form').reset(); document.getElementById('project-form').dataset.editId = ''; document.getElementById('project-modal-title').textContent = 'New Project'; openModal('project-modal'); },
};

Object.entries(fabActions).forEach(([id, fn]) => {
  document.getElementById(id).addEventListener('click', () => {
    fabMenu.classList.remove('open');
    fabMain.classList.remove('open');
    fn();
  });
});


// ══════════════════════════════════════════════════════
// TASKS
// ══════════════════════════════════════════════════════

// Add tasks to the DB
DB.tasks = [];

// Seed tasks
const SEED_TASKS = [
  {
    id: 'task-1',
    title: 'Chase Barbican on Silk Road contract sign-off',
    type: 'Chase',
    due_date: new Date(Date.now() - 2 * 86400000).toISOString().slice(0, 10),
    due_time: '',
    linked_type: 'lead',
    linked_id: 'lead-5',
    status: 'Pending',
    notes: 'GM agreement should have been signed by Oct 1. Follow up with Mei-Lin.',
    created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
  },
  {
    id: 'task-2',
    title: 'Meeting — Midnight Carnival programme review',
    type: 'Meeting',
    due_date: new Date().toISOString().slice(0, 10),
    due_time: '14:00',
    linked_type: 'project',
    linked_id: 'proj-1',
    status: 'Pending',
    notes: 'Review headliner shortlist with Jamie. Edinburgh office.',
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: 'task-3',
    title: 'Follow up — Brighton Dome initial interest',
    type: 'Follow-up',
    due_date: new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10),
    due_time: '',
    linked_type: 'lead',
    linked_id: 'lead-4',
    status: 'Pending',
    notes: 'Cressida mentioned decision in 2 weeks from 15 Sep.',
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: 'task-4',
    title: 'Send Northern Stage tour budget draft',
    type: 'Follow-up',
    due_date: new Date(Date.now() + 5 * 86400000).toISOString().slice(0, 10),
    due_time: '',
    linked_type: 'lead',
    linked_id: 'lead-6',
    status: 'Pending',
    notes: 'Patrick waiting on a rough budget before Levelling Up application.',
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'task-5',
    title: 'Call — VAULT Festival 2028 internal review',
    type: 'Call',
    due_date: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
    due_time: '11:00',
    linked_type: 'lead',
    linked_id: 'lead-7',
    status: 'Pending',
    notes: 'Internal call before responding to Simone.',
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: 'task-6',
    title: 'Reminder — Silk Road creative team contract deadline',
    type: 'Reminder',
    due_date: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
    due_time: '',
    linked_type: 'project',
    linked_id: 'proj-2',
    status: 'Pending',
    notes: 'Deadline is 1 Nov per plan.',
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
];

// Init tasks from seed (only if empty)
if (!DB.tasks.length) DB.tasks = JSON.parse(JSON.stringify(SEED_TASKS));

// ── Active task filter ──
let activeTaskFilter = 'all';

// ── Date helpers ──
function isToday(dateStr) {
  if (!dateStr) return false;
  return dateStr === new Date().toISOString().slice(0, 10);
}

function isOverdue(dateStr, status) {
  if (!dateStr || status === 'Done') return false;
  return dateStr < new Date().toISOString().slice(0, 10);
}

function taskDueLabel(task) {
  const d = task.due_date;
  if (!d) return '';
  const today = new Date().toISOString().slice(0, 10);
  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  if (d === today) return 'Today' + (task.due_time ? ' ' + task.due_time : '');
  if (d === tomorrow) return 'Tomorrow' + (task.due_time ? ' ' + task.due_time : '');
  return formatDate(d) + (task.due_time ? ' ' + task.due_time : '');
}

function linkedRecordName(task) {
  if (!task.linked_type || !task.linked_id) return '';
  const maps = {
    lead:     { arr: DB.leads,     key: 'name' },
    proposal: { arr: DB.proposals, key: 'title' },
    client:   { arr: DB.clients,   key: 'name' },
    project:  { arr: DB.projects,  key: 'name' },
  };
  const m = maps[task.linked_type];
  if (!m) return '';
  const rec = m.arr.find(r => r.id === task.linked_id);
  return rec ? rec[m.key] : '';
}

function taskTypeBadgeClass(type) {
  const map = {
    'Meeting':   'type-meeting',
    'Follow-up': 'type-follow-up',
    'Chase':     'type-chase',
    'Call':      'type-call',
    'Reminder':  'type-reminder',
  };
  return map[type] || '';
}

// ── Render ──
function renderTasks() {
  const container = document.getElementById('tasks-list');
  if (!container) return;

  const today = new Date().toISOString().slice(0, 10);

  let tasks = DB.tasks.slice();

  // Filter
  if (activeTaskFilter === 'today') {
    tasks = tasks.filter(t => t.due_date === today && t.status !== 'Done');
  } else if (activeTaskFilter === 'overdue') {
    tasks = tasks.filter(t => isOverdue(t.due_date, t.status));
  }

  // Sort: overdue first, then by date asc, done last
  tasks.sort((a, b) => {
    if (a.status === 'Done' && b.status !== 'Done') return 1;
    if (b.status === 'Done' && a.status !== 'Done') return -1;
    return (a.due_date || '').localeCompare(b.due_date || '');
  });

  if (!tasks.length) {
    container.innerHTML = `<div class="tasks-empty"><div class="tasks-empty-icon">✓</div><p>${activeTaskFilter === 'overdue' ? 'No overdue tasks' : activeTaskFilter === 'today' ? 'Nothing due today' : 'No tasks yet'}</p></div>`;
    return;
  }

  // Group into sections
  const groups = [];
  if (activeTaskFilter === 'all') {
    const overdue   = tasks.filter(t => isOverdue(t.due_date, t.status));
    const todayT    = tasks.filter(t => t.due_date === today && t.status !== 'Done');
    const upcoming  = tasks.filter(t => t.due_date > today && t.status !== 'Done');
    const done      = tasks.filter(t => t.status === 'Done');
    if (overdue.length)  groups.push({ label: 'Overdue',  cls: 'overdue', items: overdue });
    if (todayT.length)   groups.push({ label: 'Today',    cls: 'today',   items: todayT });
    if (upcoming.length) groups.push({ label: 'Upcoming', cls: '',        items: upcoming });
    if (done.length)     groups.push({ label: 'Done',     cls: '',        items: done });
  } else {
    groups.push({ label: activeTaskFilter === 'overdue' ? 'Overdue' : 'Today', cls: activeTaskFilter, items: tasks });
  }

  container.innerHTML = groups.map(group => `
    <div class="tasks-group">
      <div class="tasks-group-header">
        <span class="tasks-group-title ${group.cls}">${group.label}</span>
        <span class="tasks-group-count">${group.items.length}</span>
      </div>
      ${group.items.map(task => taskRowHTML(task)).join('')}
    </div>
  `).join('');

  // Bind checkboxes
  container.querySelectorAll('.task-checkbox').forEach(cb => {
    cb.addEventListener('click', () => {
      const id = cb.dataset.id;
      const task = DB.tasks.find(t => t.id === id);
      if (!task) return;
      task.status = task.status === 'Done' ? 'Pending' : 'Done';
      renderTasks();
      updateTasksCount();
      showToast(task.status === 'Done' ? 'Task marked done' : 'Task reopened');
    });
  });

  // Bind edit buttons
  container.querySelectorAll('.task-edit-btn').forEach(btn => {
    btn.addEventListener('click', () => openTaskModal(btn.dataset.id));
  });

  // Bind delete buttons
  container.querySelectorAll('.task-delete-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      DB.tasks = DB.tasks.filter(t => t.id !== btn.dataset.id);
      renderTasks();
      updateTasksCount();
      showToast('Task deleted');
    });
  });
}

function taskRowHTML(task) {
  const done    = task.status === 'Done';
  const overdue = isOverdue(task.due_date, task.status);
  const todayT  = isToday(task.due_date) && !done;
  const linked  = linkedRecordName(task);
  const dueLabel = taskDueLabel(task);

  let rowCls = 'task-row';
  if (done) rowCls += ' done';
  else if (overdue) rowCls += ' overdue';

  let dueCls = 'task-due';
  if (overdue) dueCls += ' overdue';
  else if (todayT) dueCls += ' today';

  return `
    <div class="${rowCls}" data-id="${task.id}">
      <div class="task-checkbox ${done ? 'checked' : ''}" data-id="${task.id}" title="${done ? 'Reopen' : 'Mark done'}"></div>
      <div class="task-body">
        <div class="task-title">${task.title}</div>
        <div class="task-meta">
          <span class="task-type-badge ${taskTypeBadgeClass(task.type)}">${task.type}</span>
          ${linked ? `<span class="task-linked">↳ ${linked}</span>` : ''}
        </div>
      </div>
      <span class="${dueCls}">${dueLabel}</span>
      <div class="task-actions">
        <button class="task-action-btn task-edit-btn" data-id="${task.id}" title="Edit">Edit</button>
        <button class="task-action-btn delete task-delete-btn" data-id="${task.id}" title="Delete">✕</button>
      </div>
    </div>
  `;
}

function updateTasksCount() {
  const pending = DB.tasks.filter(t => t.status !== 'Done').length;
  const el = document.getElementById('tasks-count');
  if (el) el.textContent = pending;
}

// ── Task filter buttons ──
document.querySelectorAll('.tasks-filter').forEach(btn => {
  btn.addEventListener('click', () => {
    activeTaskFilter = btn.dataset.filter;
    document.querySelectorAll('.tasks-filter').forEach(b => b.classList.toggle('active', b === btn));
    renderTasks();
  });
});

// ── Task modal ──
let editingTaskId = null;

function openTaskModal(taskId = null, preLinkedType = null, preLinkedId = null) {
  editingTaskId = taskId;
  const form = document.getElementById('task-form');
  form.reset();

  document.getElementById('task-modal-title').textContent = taskId ? 'Edit Task' : 'New Task';

  // Populate linked-type dropdown handler
  const linkedTypeEl = document.getElementById('task-linked-type');
  const linkedIdGroup = document.getElementById('task-linked-id-group');
  const linkedIdEl = document.getElementById('task-linked-id');

  linkedTypeEl.onchange = () => {
    const type = linkedTypeEl.value;
    linkedIdGroup.style.display = type ? 'flex' : 'none';
    if (type) {
      const records = {
        lead:     DB.leads.map(r => ({ id: r.id, name: r.name })),
        proposal: DB.proposals.map(r => ({ id: r.id, name: r.title })),
        client:   DB.clients.map(r => ({ id: r.id, name: r.name })),
        project:  DB.projects.map(r => ({ id: r.id, name: r.name })),
      }[type] || [];
      linkedIdEl.innerHTML = records.map(r => `<option value="${r.id}">${r.name}</option>`).join('');
    }
  };

  if (taskId) {
    const task = DB.tasks.find(t => t.id === taskId);
    if (task) {
      document.getElementById('task-title').value    = task.title;
      document.getElementById('task-type').value     = task.type;
      document.getElementById('task-due-date').value = task.due_date;
      document.getElementById('task-due-time').value = task.due_time || '';
      document.getElementById('task-notes').value    = task.notes || '';
      linkedTypeEl.value = task.linked_type || '';
      linkedTypeEl.onchange();
      if (task.linked_id) linkedIdEl.value = task.linked_id;
    }
  } else {
    // Default due date to today
    document.getElementById('task-due-date').value = new Date().toISOString().slice(0, 10);
    if (preLinkedType) {
      linkedTypeEl.value = preLinkedType;
      linkedTypeEl.onchange();
      if (preLinkedId) {
        // Wait for options to be populated
        linkedIdEl.value = preLinkedId;
      }
    } else {
      linkedTypeEl.value = '';
      linkedIdGroup.style.display = 'none';
    }
  }

  openModal('task-modal');
}

document.getElementById('new-task-btn').addEventListener('click', () => openTaskModal());

document.getElementById('task-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const title = document.getElementById('task-title').value.trim();
  const dueDate = document.getElementById('task-due-date').value;
  if (!title || !dueDate) { showToast('Please fill in title and due date', 'error'); return; }

  const task = {
    id:           editingTaskId || uid(),
    title,
    type:         document.getElementById('task-type').value,
    due_date:     dueDate,
    due_time:     document.getElementById('task-due-time').value,
    linked_type:  document.getElementById('task-linked-type').value,
    linked_id:    document.getElementById('task-linked-id').value,
    status:       editingTaskId ? (DB.tasks.find(t => t.id === editingTaskId)?.status || 'Pending') : 'Pending',
    notes:        document.getElementById('task-notes').value.trim(),
    created_at:   editingTaskId ? (DB.tasks.find(t => t.id === editingTaskId)?.created_at || new Date().toISOString()) : new Date().toISOString(),
  };

  if (editingTaskId) {
    DB.tasks = DB.tasks.map(t => t.id === editingTaskId ? task : t);
    showToast('Task updated');
  } else {
    DB.tasks.unshift(task);
    showToast('Task added');
  }

  closeModal('task-modal');
  renderTasks();
  updateTasksCount();
});

// ── FAB: New Task ──
const fabNewTask = document.getElementById('fab-new-task');
if (fabNewTask) {
  fabNewTask.addEventListener('click', () => {
    fabMenu.classList.remove('open');
    fabMain.classList.remove('open');
    navigateTo('tasks');
    openTaskModal();
  });
}

// ── Hook into renderAll ──
const _origRenderAll = renderAll;
renderAll = function() {
  _origRenderAll();
  renderTasks();
  updateTasksCount();
};

// Init tasks now if DB already loaded
if (DB.leads.length) {
  renderTasks();
  updateTasksCount();
}


// ══════════════════════════════════════════════════════
// PHASE 2 — RECORD-LINKED TASKS
// ══════════════════════════════════════════════════════

function taskCountChip(linkedType, linkedId) {
  const count = DB.tasks.filter(t => t.linked_type === linkedType && t.linked_id === linkedId && t.status !== 'Done').length;
  if (!count) return '';
  return `<span class="task-count-chip">${count} task${count > 1 ? 's' : ''}</span>`;
}

function linkedTaskRowHTML(task) {
  const overdue = isOverdue(task.due_date, task.status);
  const today   = isToday(task.due_date);
  const dueClass = overdue ? 'due-overdue' : today ? 'due-today' : '';
  return `
    <div class="linked-task-row ${task.status === 'Done' ? 'is-done' : ''}" data-id="${task.id}">
      <input type="checkbox" class="linked-task-check" data-id="${task.id}" ${task.status === 'Done' ? 'checked' : ''}>
      <div class="linked-task-body">
        <div class="linked-task-title">${task.title}</div>
        <div class="linked-task-meta">
          <span class="${taskTypeBadgeClass(task.type)}">${task.type}</span>
          ${task.due_date ? `<span class="linked-task-due ${dueClass}">${taskDueLabel(task)}</span>` : ''}
        </div>
      </div>
      <button class="linked-task-edit" data-id="${task.id}" title="Edit">✎</button>
    </div>`;
}

function renderLinkedTasks(linkedType, linkedId, listElId, addBtnId) {
  const listEl = document.getElementById(listElId);
  const addBtn = document.getElementById(addBtnId);
  if (!listEl) return;

  const tasks = DB.tasks.filter(t => t.linked_type === linkedType && t.linked_id === linkedId);
  if (!tasks.length) {
    listEl.innerHTML = '<div class="linked-tasks-empty">No tasks yet</div>';
  } else {
    listEl.innerHTML = tasks.map(linkedTaskRowHTML).join('');
  }

  // Checkbox toggle
  listEl.querySelectorAll('.linked-task-check').forEach(cb => {
    cb.addEventListener('change', async () => {
      const task = DB.tasks.find(t => t.id === cb.dataset.id);
      if (!task) return;
      task.status = cb.checked ? 'Done' : 'Pending';
      await persist('tasks', task);
      renderLinkedTasks(linkedType, linkedId, listElId, addBtnId);
      renderTasks();
      updateTasksCount();
    });
  });

  // Edit buttons
  listEl.querySelectorAll('.linked-task-edit').forEach(btn => {
    btn.addEventListener('click', () => openTaskModal(btn.dataset.id));
  });

  // Add task button
  if (addBtn) {
    // Remove old listener by replacing node
    const newBtn = addBtn.cloneNode(true);
    addBtn.parentNode.replaceChild(newBtn, addBtn);
    newBtn.addEventListener('click', () => {
      openTaskModal(null, linkedType, linkedId);
      // After modal closes, re-render — we hook via a one-time callback
      const origClose = window._taskModalCallback;
      window._taskModalCallback = () => {
        renderLinkedTasks(linkedType, linkedId, listElId, newBtn.id);
        if (origClose) origClose();
      };
    });
  }
}

// ── Lead drawer ─────────────────────────────────────────────────────────────

let activeLeadId = null;

window.openLeadDrawer = function(id) {
  activeLeadId = id;
  const lead = DB.leads.find(l => l.id === id);
  if (!lead) return;

  document.getElementById('lead-drawer-name').textContent = lead.name;
  document.getElementById('lead-drawer-meta').innerHTML =
    `${typeBadge(lead.type)} <span style="color:var(--text-muted)">${lead.venue || ''}</span>`;

  // Notes tab
  const notesEl = document.getElementById('lead-drawer-notes');
  notesEl.textContent = lead.notes || '';
  notesEl.style.color = lead.notes ? '' : 'var(--text-muted)';

  // Tasks tab
  renderLinkedTasks('lead', id, 'lead-tasks-list', 'lead-add-task-btn');

  // Switch to notes tab by default
  switchLeadDrawerTab('lead-notes');

  document.getElementById('lead-drawer').classList.remove('hidden');
};

function switchLeadDrawerTab(tab) {
  document.querySelectorAll('#lead-drawer .drawer-tab').forEach(t =>
    t.classList.toggle('active', t.dataset.tab === tab));
  document.querySelectorAll('#lead-drawer .drawer-tab-panel').forEach(p =>
    p.classList.toggle('active', p.id === `tab-${tab}`));
}

document.querySelectorAll('#lead-drawer .drawer-tab').forEach(tab => {
  tab.addEventListener('click', () => switchLeadDrawerTab(tab.dataset.tab));
});

document.getElementById('lead-drawer-close-btn').addEventListener('click', () => {
  document.getElementById('lead-drawer').classList.add('hidden');
  activeLeadId = null;
});

document.getElementById('lead-drawer').addEventListener('click', (e) => {
  if (e.target === document.getElementById('lead-drawer')) {
    document.getElementById('lead-drawer').classList.add('hidden');
    activeLeadId = null;
  }
});

document.getElementById('lead-drawer-edit-btn').addEventListener('click', () => {
  if (activeLeadId) editLead(activeLeadId);
});

// ── Task modal callback hook ─────────────────────────────────────────────────
// Re-render linked tasks after task save
// Patch task form submit to fire callback
const taskForm = document.getElementById('task-form');
const _origTaskSubmit = taskForm.onsubmit;
taskForm.addEventListener('submit', () => {
  setTimeout(() => {
    if (window._taskModalCallback) {
      window._taskModalCallback();
    }
    // Re-render linked tasks in open drawers/modals
    if (activeLeadId) renderLinkedTasks('lead', activeLeadId, 'lead-tasks-list', 'lead-add-task-btn');
    if (activeProjectId) renderLinkedTasks('project', activeProjectId, 'project-tasks-list', 'project-add-task-btn');
  }, 50);
});


// ══════════════════════════════════════════════════════
// PHASE 3 — CALENDAR VIEW
// ══════════════════════════════════════════════════════

let activeTasksView = 'list'; // 'list' | 'calendar'
let calYear  = new Date().getFullYear();
let calMonth = new Date().getMonth(); // 0-indexed
let calSelectedDate = null;

// ── View toggle ──────────────────────────────────────
document.querySelectorAll('.tasks-view-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    activeTasksView = btn.dataset.view;
    document.querySelectorAll('.tasks-view-btn').forEach(b =>
      b.classList.toggle('active', b === btn));

    const listEl     = document.getElementById('tasks-list');
    const calEl      = document.getElementById('tasks-calendar');
    const filterGrp  = document.getElementById('tasks-filter-group');

    if (activeTasksView === 'calendar') {
      listEl.classList.add('hidden');
      calEl.classList.remove('hidden');
      filterGrp.style.visibility = 'hidden';
      renderCalendar();
    } else {
      listEl.classList.remove('hidden');
      calEl.classList.add('hidden');
      filterGrp.style.visibility = '';
      renderTasks();
    }
  });
});

// ── Month navigation ─────────────────────────────────
document.getElementById('cal-prev').addEventListener('click', () => {
  calMonth--;
  if (calMonth < 0) { calMonth = 11; calYear--; }
  calSelectedDate = null;
  document.getElementById('cal-day-panel').classList.add('hidden');
  renderCalendar();
});

document.getElementById('cal-next').addEventListener('click', () => {
  calMonth++;
  if (calMonth > 11) { calMonth = 0; calYear++; }
  calSelectedDate = null;
  document.getElementById('cal-day-panel').classList.add('hidden');
  renderCalendar();
});

document.getElementById('cal-day-panel-close').addEventListener('click', () => {
  calSelectedDate = null;
  document.getElementById('cal-day-panel').classList.add('hidden');
  document.querySelectorAll('.cal-day.selected').forEach(d => d.classList.remove('selected'));
});

document.getElementById('cal-add-task-btn').addEventListener('click', () => {
  if (!calSelectedDate) return;
  openTaskModal(null);
  // Pre-fill the date after modal opens
  setTimeout(() => {
    document.getElementById('task-due-date').value = calSelectedDate;
  }, 50);
});

// ── Core render ──────────────────────────────────────
function renderCalendar() {
  const MONTHS = ['January','February','March','April','May','June',
                  'July','August','September','October','November','December'];
  document.getElementById('cal-month-label').textContent = `${MONTHS[calMonth]} ${calYear}`;

  const today = new Date().toISOString().slice(0, 10);
  const grid  = document.getElementById('cal-grid');

  // First day of month (Mon=0 offset)
  const firstDay = new Date(calYear, calMonth, 1);
  const lastDay  = new Date(calYear, calMonth + 1, 0);
  // Monday-first offset (0=Mon ... 6=Sun)
  let startOffset = firstDay.getDay() - 1;
  if (startOffset < 0) startOffset = 6;

  // Build index: dateStr -> tasks[]
  const tasksByDate = {};
  DB.tasks.forEach(t => {
    if (!t.due_date) return;
    if (!tasksByDate[t.due_date]) tasksByDate[t.due_date] = [];
    tasksByDate[t.due_date].push(t);
  });

  let cells = '';

  // Leading empty cells
  for (let i = 0; i < startOffset; i++) {
    cells += `<div class="cal-day cal-day--empty"></div>`;
  }

  // Day cells
  for (let d = 1; d <= lastDay.getDate(); d++) {
    const mm     = String(calMonth + 1).padStart(2, '0');
    const dd     = String(d).padStart(2, '0');
    const dateStr = `${calYear}-${mm}-${dd}`;
    const dayTasks = tasksByDate[dateStr] || [];
    const isToday  = dateStr === today;
    const isSelected = dateStr === calSelectedDate;

    const pending  = dayTasks.filter(t => t.status !== 'Done');
    const done     = dayTasks.filter(t => t.status === 'Done');
    const overdue  = pending.filter(t => isOverdue(t.due_date, t.status));

    let dayCls = 'cal-day';
    if (isToday)    dayCls += ' cal-day--today';
    if (isSelected) dayCls += ' selected';
    if (overdue.length && !isToday) dayCls += ' cal-day--overdue';

    // Up to 3 dots
    const dots = pending.slice(0, 3).map(t => {
      const dotCls = isOverdue(t.due_date, t.status) ? 'cal-dot cal-dot--overdue'
                   : isToday ? 'cal-dot cal-dot--today'
                   : `cal-dot cal-dot--${t.type.toLowerCase().replace(/[^a-z]/g,'-')}`;
      return `<span class="${dotCls}"></span>`;
    }).join('');
    const overflow = pending.length > 3
      ? `<span class="cal-overflow">+${pending.length - 3}</span>` : '';

    cells += `
      <div class="${dayCls}" data-date="${dateStr}">
        <span class="cal-day-num">${d}</span>
        <div class="cal-dots">${dots}${overflow}</div>
      </div>`;
  }

  grid.innerHTML = cells;

  // Click handler on day cells
  grid.querySelectorAll('.cal-day:not(.cal-day--empty)').forEach(cell => {
    cell.addEventListener('click', () => {
      const date = cell.dataset.date;
      grid.querySelectorAll('.cal-day.selected').forEach(d => d.classList.remove('selected'));

      if (calSelectedDate === date) {
        // Toggle off
        calSelectedDate = null;
        document.getElementById('cal-day-panel').classList.add('hidden');
      } else {
        calSelectedDate = date;
        cell.classList.add('selected');
        renderCalDayPanel(date);
        document.getElementById('cal-day-panel').classList.remove('hidden');
      }
    });
  });
}

function renderCalDayPanel(dateStr) {
  const [y, m, d] = dateStr.split('-');
  const label = new Date(+y, +m - 1, +d).toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long'
  });
  document.getElementById('cal-day-panel-title').textContent = label;

  const tasks = DB.tasks.filter(t => t.due_date === dateStr);
  const el = document.getElementById('cal-day-tasks');

  if (!tasks.length) {
    el.innerHTML = '<div class="cal-day-empty">No tasks</div>';
    return;
  }

  el.innerHTML = tasks.map(task => {
    const done = task.status === 'Done';
    const linked = linkedRecordName(task);
    return `
      <div class="cal-task-row ${done ? 'is-done' : ''}" data-id="${task.id}">
        <input type="checkbox" class="cal-task-check" data-id="${task.id}" ${done ? 'checked' : ''}>
        <div class="cal-task-body">
          <div class="cal-task-title">${task.title}</div>
          <div class="cal-task-meta">
            <span class="${taskTypeBadgeClass(task.type)}">${task.type}</span>
            ${task.due_time ? `<span class="cal-task-time">${task.due_time}</span>` : ''}
            ${linked ? `<span class="linked-task-linked">↳ ${linked}</span>` : ''}
          </div>
        </div>
        <button class="linked-task-edit cal-task-edit" data-id="${task.id}" title="Edit">✎</button>
      </div>`;
  }).join('');

  el.querySelectorAll('.cal-task-check').forEach(cb => {
    cb.addEventListener('change', async () => {
      const task = DB.tasks.find(t => t.id === cb.dataset.id);
      if (!task) return;
      task.status = cb.checked ? 'Done' : 'Pending';
      await persist('tasks', task);
      renderCalDayPanel(dateStr);
      renderCalendar();
      updateTasksCount();
    });
  });

  el.querySelectorAll('.cal-task-edit').forEach(btn => {
    btn.addEventListener('click', () => openTaskModal(btn.dataset.id));
  });
}

// Re-render calendar when tasks change (if calendar is active)
const _origRenderTasksForCal = renderTasks;
function renderTasksAndCal() {
  _origRenderTasksForCal();
  if (activeTasksView === 'calendar') {
    renderCalendar();
    if (calSelectedDate) renderCalDayPanel(calSelectedDate);
  }
}


// ══════════════════════════════════════════════════════
// EASTER EGG — Spin the Wheel
// ══════════════════════════════════════════════════════
const EGG_CONCEPTS = [
  'Late-night jazz festival',
  'Immersive theatre season',
  'Rooftop comedy club',
  'Underground drag cabaret',
  'Multi-day folk festival',
  'Street food & live music market',
  'Classic film & live score event',
  'Midnight circus spectacular',
  'Open-air opera',
  'Spoken word & poetry slam',
  'Electronic music weekender',
  'Site-specific dance festival',
  'International puppetry festival',
  'Comedy & craft beer festival',
  'One-night immersive rave',
  'Family circus festival',
  'Outdoor Shakespeare season',
  'Dark tourism theatre trail',
  'Improv & sketch comedy marathon',
  'Night-time botanical garden experience',
  'Experimental noise & art festival',
  'Burlesque & variety show',
  'Floating stage river festival',
  'Secret supper club with live performance',
  'Winter light & fire festival',
];

const EGG_PLACES = [
  'in Reykjavik', 'on a rooftop in Lisbon', 'in a Glasgow car park',
  'in a Belfast shipyard', 'under the arches in Manchester',
  'on a ferry in Stockholm', 'in a decommissioned power station in Berlin',
  'in a vineyard in the Douro Valley', 'on a beach in Thessaloniki',
  'in a converted warehouse in Rotterdam', 'in a castle in Kraków',
  'in the middle of a cornfield in Iowa', 'on the roof of a multi-storey in Bristol',
  'in a quarry in Wales', 'in a brutalist car park in Peckham',
  'in a botanical garden in Singapore', 'on a barge in Amsterdam',
  'in a desert canyon in New Mexico', 'in an abandoned factory in Detroit',
  'on a Croatian island', 'in a forest in Scandinavia',
  'in a salt flat in Bolivia', 'in a cathedral crypt in Vienna',
  'on a rooftop in Seoul', 'in a lido in South London',
  'in a lighthouse on the Scottish coast',
];

function spinWheel() {
  const concept = EGG_CONCEPTS[Math.floor(Math.random() * EGG_CONCEPTS.length)];
  const place   = EGG_PLACES[Math.floor(Math.random() * EGG_PLACES.length)];

  const conceptEl = document.getElementById('egg-concept');
  const whereEl   = document.getElementById('egg-where');

  // quick flash animation
  conceptEl.classList.remove('spinning');
  whereEl.classList.remove('spinning');
  void conceptEl.offsetWidth; // reflow
  conceptEl.classList.add('spinning');
  whereEl.classList.add('spinning');

  conceptEl.textContent = concept;
  whereEl.textContent   = place;
}

function openEgg() {
  spinWheel();
  document.getElementById('egg-overlay').classList.remove('hidden');
}

function closeEgg() {
  document.getElementById('egg-overlay').classList.add('hidden');
}

document.getElementById('cowhead-btn').addEventListener('click', openEgg);

// Also close on Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeEgg();
});

// ══════════════════════════════════════════════════════
// MOBILE TOP BAR + GROUPED TAB BAR WITH TRAYS
// ══════════════════════════════════════════════════════
const SECTION_TITLES = {
  ideas: 'Ideas Park', leads: 'Leads', proposals: 'Proposals',
  clients: 'Clients', projects: 'Projects', tasks: 'Tasks',
};
const DEVELOP_SECTIONS = ['ideas', 'leads', 'proposals'];
const MANAGE_SECTIONS  = ['clients', 'projects', 'tasks'];

function updateMobileTopBar(section) {
  const titleEl = document.getElementById('mobile-top-title');
  if (titleEl) titleEl.textContent = SECTION_TITLES[section] || section;

  // Highlight active group button
  const devBtn = document.getElementById('tab-develop-btn');
  const mngBtn = document.getElementById('tab-manage-btn');
  if (devBtn) devBtn.classList.toggle('active', DEVELOP_SECTIONS.includes(section));
  if (mngBtn) mngBtn.classList.toggle('active', MANAGE_SECTIONS.includes(section));
}

function closeAllTrays() {
  ['tray-develop', 'tray-manage', 'tray-quick-add'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.add('hidden');
  });
  const addBtn = document.getElementById('tab-quick-add-btn');
  if (addBtn) addBtn.classList.remove('open');
  const backdrop = document.getElementById('tray-backdrop');
  if (backdrop) backdrop.classList.remove('active');
}

function openTray(trayId) {
  closeAllTrays();
  const tray = document.getElementById(trayId);
  if (tray) {
    tray.classList.remove('hidden');
    const backdrop = document.getElementById('tray-backdrop');
    if (backdrop) backdrop.classList.add('active');
  }
}

// Tray backdrop closes all trays
const trayBackdrop = document.getElementById('tray-backdrop');
if (trayBackdrop) trayBackdrop.addEventListener('click', closeAllTrays);

// Develop button
const devBtn = document.getElementById('tab-develop-btn');
if (devBtn) devBtn.addEventListener('click', () => {
  const tray = document.getElementById('tray-develop');
  if (tray && !tray.classList.contains('hidden')) { closeAllTrays(); return; }
  openTray('tray-develop');
});

// Manage button
const mngBtn = document.getElementById('tab-manage-btn');
if (mngBtn) mngBtn.addEventListener('click', () => {
  const tray = document.getElementById('tray-manage');
  if (tray && !tray.classList.contains('hidden')) { closeAllTrays(); return; }
  openTray('tray-manage');
});

// Quick Add button
const qaBtn = document.getElementById('tab-quick-add-btn');
if (qaBtn) qaBtn.addEventListener('click', () => {
  const tray = document.getElementById('tray-quick-add');
  if (tray && !tray.classList.contains('hidden')) { closeAllTrays(); return; }
  openTray('tray-quick-add');
  qaBtn.classList.add('open');
});

// Tray navigation items
document.querySelectorAll('.tray-item[data-section]').forEach(item => {
  item.addEventListener('click', (e) => {
    e.preventDefault();
    navigateTo(item.dataset.section);
    closeAllTrays();
  });
});

// Quick Add tray actions
const QA_MAP = {
  'qa-idea':     () => document.getElementById('new-idea-btn')?.click(),
  'qa-lead':     () => document.getElementById('new-lead-btn')?.click(),
  'qa-proposal': () => document.getElementById('new-proposal-btn')?.click(),
  'qa-task':     () => document.getElementById('new-task-btn')?.click(),
};
Object.entries(QA_MAP).forEach(([id, fn]) => {
  const el = document.getElementById(id);
  if (el) el.addEventListener('click', (e) => {
    e.preventDefault();
    closeAllTrays();
    fn();
  });
});

// Hook into navigateTo to update top bar title
const _origNavigateTo = navigateTo;
// patch: extend navigateTo to also update top bar
const _navigateToPatched = (section) => {
  _origNavigateTo(section);
  updateMobileTopBar(section);
};
// override global
window.navigateTo = _navigateToPatched;
// update on first load
updateMobileTopBar(activeSection);

// Cowhead in mobile top bar → Easter egg
const cowMobileBtn = document.getElementById('cowhead-mobile-btn');
if (cowMobileBtn) cowMobileBtn.addEventListener('click', openEgg);
