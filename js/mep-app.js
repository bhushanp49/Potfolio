/**
 * BHUSHAN ARVIND PATIL - SENIOR MEP PROJECT ENGINEER
 * Interactive Application & BIM Coordination Engine
 */

document.addEventListener('DOMContentLoaded', () => {
  initHeroCanvas();
  initDisciplineFilter();
  initProjectFilter();
  initBimSandbox();
  initBoqCalculator();
  initContactFeatures();
  initTelemetryHUD();
  initMobileMenu();
});

/* --------------------------------------------------------------------------
   0. AUDIO FEEDBACK ENGINE (WEB AUDIO SYNTHESIZER)
   -------------------------------------------------------------------------- */
function playChime(type = 'success') {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    if (type === 'success') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.08); // A5
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } else if (type === 'alert') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      gain.gain.setValueAtTime(0.03, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } else if (type === 'click') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(700, ctx.currentTime);
      gain.gain.setValueAtTime(0.02, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    }
  } catch (e) {
    // Audio policies might require direct user gesture
  }
}

/* --------------------------------------------------------------------------
   1. HERO CANVAS: DYNAMIC MEP PIPELINE & CIRCUIT GRID (RETINA SCALED)
   -------------------------------------------------------------------------- */
function initHeroCanvas() {
  const canvas = document.getElementById('hero-cad-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width, height, dpr = 1;
  function resize() {
    const parent = canvas.parentElement;
    if (!parent) return;
    dpr = window.devicePixelRatio || 1;
    width = parent.clientWidth;
    height = parent.clientHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener('resize', resize);

  // Simulated MEP flow particles
  const particles = [];
  const colors = [
    { stroke: 'rgba(30, 107, 251, 0.7)', fill: '#1E6BFB', type: 'HVAC Chilled Water' },
    { stroke: 'rgba(245, 158, 11, 0.7)', fill: '#F59E0B', type: 'Electrical Circuit' },
    { stroke: 'rgba(239, 68, 68, 0.7)', fill: '#EF4444', type: 'Fire Sprinkler Main' },
    { stroke: 'rgba(16, 185, 129, 0.7)', fill: '#10B981', type: 'PHE Drainage/Supply' }
  ];

  for (let i = 0; i < 35; i++) {
    const isHorizontal = Math.random() > 0.5;
    const col = colors[Math.floor(Math.random() * colors.length)];
    particles.push({
      x: Math.floor(Math.random() * (width / 40)) * 40,
      y: Math.floor(Math.random() * (height / 40)) * 40,
      speed: (Math.random() * 1.5 + 0.8),
      size: Math.random() * 2 + 2,
      axis: isHorizontal ? 'x' : 'y',
      direction: Math.random() > 0.5 ? 1 : -1,
      color: col,
      history: []
    });
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);

    // Draw subtle CAD grid points
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    for (let x = 0; x < width; x += 40) {
      for (let y = 0; y < height; y += 40) {
        ctx.fillRect(x - 1, y - 1, 2, 2);
      }
    }

    // Update and draw MEP conduits
    particles.forEach(p => {
      p.history.push({ x: p.x, y: p.y });
      if (p.history.length > 12) p.history.shift();

      if (p.axis === 'x') {
        p.x += p.speed * p.direction;
        if (p.x < 0 || p.x > width) {
          p.direction *= -1;
          if (Math.random() > 0.6) {
            p.axis = 'y';
            p.y = Math.floor(p.y / 40) * 40;
          }
        }
      } else {
        p.y += p.speed * p.direction;
        if (p.y < 0 || p.y > height) {
          p.direction *= -1;
          if (Math.random() > 0.6) {
            p.axis = 'x';
            p.x = Math.floor(p.x / 40) * 40;
          }
        }
      }

      // Draw conduit trace
      if (p.history.length > 1) {
        ctx.beginPath();
        ctx.moveTo(p.history[0].x, p.history[0].y);
        for (let j = 1; j < p.history.length; j++) {
          ctx.lineTo(p.history[j].x, p.history[j].y);
        }
        ctx.strokeStyle = p.color.stroke;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // Draw active node
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = p.color.fill;
      ctx.shadowColor = p.color.fill;
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    requestAnimationFrame(animate);
  }
  animate();
}

/* --------------------------------------------------------------------------
   2. INTERACTIVE MEP DISCIPLINE FILTER
   -------------------------------------------------------------------------- */
function initDisciplineFilter() {
  const buttons = document.querySelectorAll('.discipline-btn');
  const disciplineBadges = document.querySelectorAll('[data-discipline]');
  const activeDisciplineLabel = document.getElementById('active-discipline-label');

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      playChime('click');
      buttons.forEach(b => {
        b.classList.remove('active-all', 'active-blue', 'active-yellow', 'active-green', 'active-red');
        b.classList.add('bg-slate-900', 'text-slate-400', 'border-slate-800');
      });

      const discipline = btn.dataset.disciplineFilter;
      btn.classList.remove('bg-slate-900', 'text-slate-400', 'border-slate-800');

      if (discipline === 'all') {
        btn.classList.add('active-all');
        if (activeDisciplineLabel) activeDisciplineLabel.textContent = 'All MEP Systems (Integrated LOD 400 BIM)';
      } else if (discipline === 'mech') {
        btn.classList.add('active-blue');
        if (activeDisciplineLabel) activeDisciplineLabel.textContent = 'Mechanical / HVAC Systems (Blue)';
      } else if (discipline === 'elec') {
        btn.classList.add('active-yellow');
        if (activeDisciplineLabel) activeDisciplineLabel.textContent = 'Electrical & Power Systems (Yellow)';
      } else if (discipline === 'plumb') {
        btn.classList.add('active-green');
        if (activeDisciplineLabel) activeDisciplineLabel.textContent = 'Plumbing, PHE & Sustainable Drainage (Green)';
      } else if (discipline === 'fire') {
        btn.classList.add('active-red');
        if (activeDisciplineLabel) activeDisciplineLabel.textContent = 'Fire Protection & NFPA Life Safety (Red)';
      }

      // Filter or highlight matching items across cards & badges
      disciplineBadges.forEach(el => {
        const itemDisc = el.dataset.discipline;
        if (!itemDisc) return;
        if (discipline === 'all' || itemDisc === discipline || itemDisc.includes(discipline)) {
          el.style.opacity = '1';
          el.style.transform = 'scale(1)';
          el.classList.remove('grayscale', 'opacity-40');
        } else {
          el.style.opacity = '0.35';
          el.classList.add('grayscale', 'opacity-40');
        }
      });

      showToast(`Switched view to ${activeDisciplineLabel ? activeDisciplineLabel.textContent : discipline}`);
    });
  });
}

/* --------------------------------------------------------------------------
   3. KEY PROJECTS FILTER & MODAL DEEP DIVE
   -------------------------------------------------------------------------- */
const PROJECT_DETAILS = {
  'google-datacenter': {
    title: 'Google Goldeneye Datacenter',
    location: 'USA (Mission-Critical Deployment)',
    role: 'Senior Project Engineer (Turner International)',
    value: 'Confidential / Multi-Million USD Tier IV Facility',
    category: 'Mission-Critical US Data Centers',
    metrics: '20% Design Conflict Reduction | 100% Client Spec Compliance',
    disciplines: ['mech', 'elec', 'fire'],
    description: 'Spearheaded pre-construction activities and multi-disciplinary constructability reviews for Google Goldeneye mission-critical hyperscale data center.',
    keyTasks: [
      'Conducted exhaustive clash detection reviews across high-density chilled water CRAC loops and medium-voltage electrical busduct risers.',
      'Vetted 50+ vendor equipment submittals and technical datasheets for chillers, CRAH units, generators, and clean-agent fire suppression.',
      'Enforced strict US and international standards (ASHRAE TC 9.9 for data center thermal guidelines, NFPA 75/76 for IT equipment protection).',
      'Collaborated with US-based designers and trade contractors to fast-track technical RFI resolutions by 15%.'
    ]
  },
  'apple-datacenter': {
    title: 'Apple Waukee Datacenter',
    location: 'Waukee, Iowa, USA',
    role: 'Senior Project Engineer (Turner International)',
    value: 'Mega-Scale Hyperscale Cloud Center',
    category: 'Mission-Critical US Data Centers',
    metrics: 'Zero Audit Non-Compliances | Automated Quantity Takeoffs',
    disciplines: ['mech', 'elec', 'fire', 'plumb'],
    description: 'Pre-construction constructability validation, spatial coordination, and quantity takeoffs for Apple Waukee hyperscale data facility.',
    keyTasks: [
      'Constructability reviews of primary mechanical galleries, electrical power distribution routes, and dual-interlocked pre-action sprinkler systems.',
      'Comprehensive quantity takeoffs using PlanSwift and Bluebeam, verifying vendor rate analyses to secure an average 10% cost savings.',
      'Standardized project tracking protocols with BIM 360 and Autodesk Construction Cloud across a 10-engineer team.'
    ]
  },
  'memphis-airport': {
    title: 'Memphis International Airport Modernization',
    location: 'Memphis, Tennessee, USA',
    role: 'Senior Project Engineer (Turner International)',
    value: 'Major Aviation Terminal Concourse',
    category: 'Aviation & Transportation Infrastructure',
    metrics: 'Seamless Passenger Concourse HVAC & NFPA 130 Compliance',
    disciplines: ['mech', 'fire', 'elec'],
    description: 'Pre-construction MEP reviews and technical submittal evaluations for airport modernization, central utility plant coordination, and passenger terminal life safety.',
    keyTasks: [
      'Validation of large CFM variable-air-volume (VAV) distribution systems, smoke evacuation routing, and seismic bracing for MEP headers.',
      'Rate analysis and vendor compliance assessments for aviation-grade air handling units and switchgear packages.'
    ]
  },
  'cleveland-clinic': {
    title: 'Cleveland Clinic Healthcare Expansion',
    location: 'Cleveland, Ohio, USA',
    role: 'Senior Project Engineer (Turner International)',
    value: 'World-Class Specialized Healthcare Facility',
    category: 'Healthcare & Critical Facilities',
    metrics: 'Medical Gas, Positive Air Pressure & Cleanroom Isolation',
    disciplines: ['mech', 'plumb', 'elec'],
    description: 'Engineering validation for hospital operating suites, medical vacuum/gas piping, laminar flow HVAC units, and emergency power failover systems.',
    keyTasks: [
      'Strict adherence to AIA Healthcare Guidelines and NFPA 99 for Health Care Facilities.',
      'Coordinated complex ceiling plenum clearances with structural engineers and medical equipment specialists.'
    ]
  },
  'cidco-pmay': {
    title: 'CIDCO PMAY Mass Housing Mega Project',
    location: 'Navi Mumbai, Maharashtra, India',
    role: 'MEP Project Engineer (Sandeep Shikre & Associates)',
    value: '\u20B94,256 Crores | 7 Sites | Approx. 21,825 Residents',
    category: 'Government & Township Developments',
    metrics: 'Largest Mass Housing Scheme in Western India | 7 Distinct Sites',
    disciplines: ['mech', 'elec', 'plumb', 'fire'],
    description: 'Comprehensive MEP infrastructure coordination for the prestigious CIDCO Pradhan Mantri Awas Yojana (PMAY) mega mass housing project spanning 7 large development sectors.',
    keyTasks: [
      'Engineered and reviewed Public Health Engineering (PHE) layouts, gravity water supply networks, storm water drainage, and decentralized Sewage Treatment Plants (STP).',
      'Generated extensive Bill of Quantities (BOQs) and tender package estimates, maintaining budget variance below 5%.',
      'Coordinated substation layouts, transformer ratings, busduct installations, and external lighting infrastructure across all 7 sites.',
      'Implemented IGBC green building strategies for water conservation and rainwater harvesting systems.'
    ]
  },
  'bdd-chawl': {
    title: 'BDD Chawl Historic Redevelopment',
    location: 'Worli & Naigaon, Mumbai, India',
    role: 'Assistant Senior Engineer - MEP (Sandeep Shikre & Associates)',
    value: 'Multi-Billion Rupee Urban Renewal',
    category: 'Government & Township Developments',
    metrics: '20 Rehab Towers (Up to 24 Floors) + 67-Floor Luxury Sales Towers',
    disciplines: ['mech', 'elec', 'plumb', 'fire'],
    description: 'High-rise MEP coordination covering 20 rehabilitation high-rises and towering 67-floor sales skyscraper structures in central Mumbai.',
    keyTasks: [
      'Executed clash resolution between high-pressure hydro-pneumatic pumping risers, electrical shaft busbars, and wet riser firefighting headers.',
      'Prevented over \u20B915 Lakhs in potential field rework through early 3D spatial conflict detection using Revit and AutoCAD.',
      'Reviewed and approved mechanical ventilation for basement carparks (jet fan systems) and staircase pressurization fans.'
    ]
  },
  'tcs-olympus': {
    title: 'TCS Olympus A & B Campuses',
    location: 'Hiranandani Estate, Thane, India',
    role: 'Assistant Engineer - MEP (Sandeep Shikre & Associates)',
    value: 'Tier-1 IT Corporate Headquarters (15 & 20 Floors)',
    category: 'Commercial & IT Centers',
    metrics: '100% First-Pass Design Approval | High-Density Office Floorplates',
    disciplines: ['mech', 'elec', 'fire'],
    description: 'End-to-end design validation and MEP site coordination for Tata Consultancy Services prime software engineering campus.',
    keyTasks: [
      'Chilled water pumping distribution, floor-by-floor AHU ducting, and energy-efficient LED lighting integration.',
      'Prepared detailed BOQs and supported successful commercial tender bids totaling over \u20B950 Crores.'
    ]
  },
  'hiranandani-solus': {
    title: 'Hiranandani Solus Commercial Tower',
    location: 'Thane, Mumbai MMR, India',
    role: 'Assistant Engineer - MEP',
    value: '26-Floor High-End Commercial Skyscraper',
    category: 'Commercial & IT Centers',
    metrics: 'Fast-Track Execution | 18% Installation Error Reduction',
    disciplines: ['mech', 'elec', 'plumb'],
    description: 'Directed on-site execution team of 8\u201310 MEP engineers, ensuring strict compliance with architectural clearances and structural penetration rules.',
    keyTasks: [
      'Supervised the installation of central chiller headers, precision cooling, and electrical feeder distribution boards.',
      'Reduced material wastage by 10% through precise rebar clash avoidance and pre-fabricated pipe spools.'
    ]
  },
  'drfms-hospital': {
    title: 'DRFMS Multi-Speciality Hospital',
    location: 'Maharashtra, India',
    role: 'Assistant Senior Engineer - MEP',
    value: '\u20B9170 Crores',
    category: 'Healthcare & Public Facilities',
    metrics: 'Critical Life-Safety Compliance | Zero Audit Violations',
    disciplines: ['mech', 'plumb', 'elec', 'fire'],
    description: 'Comprehensive MEP infrastructure for a modern 300+ bed multi-speciality tertiary care medical facility.',
    keyTasks: [
      'Engineered medical gas pipeline systems (MGPS), central vacuum, surgical air, and oxygen manifold rooms.',
      'Specialized isolation room HVAC systems with HEPA 14 filtration and pressure differential monitoring.'
    ]
  },
  'shirdi-sansthan': {
    title: 'Shirdi Sai Baba Sansthan Darshan Queue Complex',
    location: 'Shirdi, Maharashtra, India',
    role: 'MEP Project Engineer',
    value: 'Mega Public Pilgrimage Facility (G+3 Commercial/Hall)',
    category: 'Healthcare & Public Facilities',
    metrics: 'Crowd Thermal Comfort & Ultra-High Volume Fresh Air Ventilation',
    disciplines: ['mech', 'fire', 'plumb', 'elec'],
    description: 'High-density public assembly complex designed to accommodate tens of thousands of pilgrims simultaneously with automated safety and thermal conditioning.',
    keyTasks: [
      'Large-scale displacement ventilation, massive air wash units, and dedicated smoke management systems.',
      'Public address life safety interlocks, multi-tiered fire hydrant loops, and automated sanitization plumbing.'
    ]
  },
  'bluegrass-edge': {
    title: 'Bluegrass Business Park & The Edge',
    location: 'Pune / Mumbai, India',
    role: 'MEP Engineer (Sandeep Shikre & Associates)',
    value: 'Bluegrass (\u20B960 Cr) & The Edge (\u20B925 Cr)',
    category: 'Commercial & IT Centers',
    metrics: '\u20B985 Cr Combined Portfolio Execution',
    disciplines: ['mech', 'elec', 'plumb'],
    description: 'Corporate business parks featuring smart energy metering, intelligent BMS integration, and optimized chilled water pumping loops.',
    keyTasks: [
      'Reviewed mechanical calculations using Carrier HAP, verifying building envelope thermal resistance.',
      'Controlled engineering operations and ensured contractor progress billings aligned exactly with measured site quantities.'
    ]
  },
  'monorail-transit': {
    title: 'Urban Transit Monorail Stations (5 Stations)',
    location: 'Mumbai Monorail Network, India',
    role: 'Junior Station Controller (Urban Transit Pvt Ltd)',
    value: 'Public Rail Transit Infrastructure',
    category: 'Transportation Infrastructure',
    metrics: '100% Commission of Railway Safety (CRS) Compliance',
    disciplines: ['elec', 'fire', 'mech'],
    description: 'MEP testing, commissioning, and operations monitoring across 5 elevated monorail transit passenger stations.',
    keyTasks: [
      'Executed CRS safety audits and statutory testing for emergency track evacuation, deluge fire systems, and traction power substations.',
      'Managed station service measurement books and contractor payment certifications.'
    ]
  }
};

function initProjectFilter() {
  const filterBtns = document.querySelectorAll('.project-filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      playChime('click');
      filterBtns.forEach(b => {
        b.classList.remove('bg-blue-600', 'text-white');
        b.classList.add('bg-slate-900', 'text-slate-400');
      });
      btn.classList.remove('bg-slate-900', 'text-slate-400');
      btn.classList.add('bg-blue-600', 'text-white');

      const filter = btn.dataset.projectFilter;

      projectCards.forEach(card => {
        const cat = card.dataset.projectCategory;
        if (filter === 'all' || cat === filter) {
          card.style.display = 'flex';
          card.classList.remove('hidden');
        } else {
          card.style.display = 'none';
          card.classList.add('hidden');
        }
      });
    });
  });

  // Modal open triggers
  document.querySelectorAll('[data-open-project]').forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      playChime('click');
      const projId = trigger.dataset.openProject;
      openProjectModal(projId);
    });
  });

  const modalClose = document.getElementById('modal-close-btn');
  const modalBackdrop = document.getElementById('modal-backdrop');

  if (modalClose) {
    modalClose.addEventListener('click', closeProjectModal);
  }
  if (modalBackdrop) {
    modalBackdrop.addEventListener('click', closeProjectModal);
  }

  // Keyboard Escape listener
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeProjectModal();
  });

  window.closeProjectModal = closeProjectModal;
  window.openProjectModal = openProjectModal;
}

function openProjectModal(id) {
  const data = PROJECT_DETAILS[id];
  if (!data) return;

  const modal = document.getElementById('project-modal');
  document.getElementById('modal-title').textContent = data.title;
  document.getElementById('modal-location').textContent = data.location;
  document.getElementById('modal-role').textContent = data.role;
  document.getElementById('modal-value').textContent = data.value;
  document.getElementById('modal-metrics').textContent = data.metrics;
  document.getElementById('modal-description').textContent = data.description;

  const tasksList = document.getElementById('modal-tasks');
  tasksList.innerHTML = '';
  data.keyTasks.forEach(task => {
    const li = document.createElement('li');
    li.className = 'flex items-start gap-2 text-slate-300 text-sm';
    li.innerHTML = '<span class="text-blue-400 font-bold mt-1">&#9656;</span> <span>' + task + '</span>';
    tasksList.appendChild(li);
  });

  // Tags
  const tagsContainer = document.getElementById('modal-discipline-tags');
  tagsContainer.innerHTML = '';
  const discMap = {
    mech: { name: 'HVAC / Mechanical', color: 'bg-blue-900/60 text-blue-300 border-blue-600' },
    elec: { name: 'Electrical Systems', color: 'bg-amber-900/60 text-amber-300 border-amber-600' },
    plumb: { name: 'Plumbing & PHE', color: 'bg-emerald-900/60 text-emerald-300 border-emerald-600' },
    fire: { name: 'Fire Protection / NFPA', color: 'bg-red-900/60 text-red-300 border-red-600' }
  };

  data.disciplines.forEach(d => {
    const tagInfo = discMap[d];
    if (tagInfo) {
      const span = document.createElement('span');
      span.className = `px-2.5 py-1 text-xs font-mono font-semibold rounded border ${tagInfo.color}`;
      span.textContent = tagInfo.name;
      tagsContainer.appendChild(span);
    }
  });

  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeProjectModal() {
  const modal = document.getElementById('project-modal');
  if (modal) modal.classList.add('hidden');
  document.body.style.overflow = 'auto';
}

/* --------------------------------------------------------------------------
   4. INTERACTIVE 2.5D BIM CLASH & SPATIAL COORDINATION SANDBOX
   -------------------------------------------------------------------------- */
function initBimSandbox() {
  const layerToggles = {
    duct: document.getElementById('layer-duct'),
    tray: document.getElementById('layer-tray'),
    sprinkler: document.getElementById('layer-sprinkler'),
    drain: document.getElementById('layer-drain'),
  };

  const svgLayers = {
    duct: document.getElementById('svg-layer-duct'),
    tray: document.getElementById('svg-layer-tray'),
    sprinkler: document.getElementById('svg-layer-sprinkler'),
    drain: document.getElementById('svg-layer-drain'),
  };

  const clashMarker = document.getElementById('sandbox-clash-marker');
  const clashStatus = document.getElementById('clash-status-box');
  const resolveBtn = document.getElementById('sandbox-resolve-btn');
  const runTestBtn = document.getElementById('sandbox-test-btn');
  const trayRungs = document.getElementById('svg-tray-rungs');

  let isClashActive = true;
  let isResolved = false;

  function updateLayerVisibility() {
    playChime('click');
    Object.keys(layerToggles).forEach(k => {
      const checkbox = layerToggles[k];
      const svg = svgLayers[k];
      if (checkbox && svg) {
        svg.style.display = checkbox.checked ? 'block' : 'none';
      }
    });
    evaluateClashes();
  }

  function evaluateClashes() {
    const ductOn = layerToggles.duct ? layerToggles.duct.checked : true;
    const trayOn = layerToggles.tray ? layerToggles.tray.checked : true;

    if (ductOn && trayOn && !isResolved) {
      isClashActive = true;
      if (clashMarker) clashMarker.style.display = 'inline';
      if (clashStatus) {
        clashStatus.className = 'p-4 rounded-xl border border-red-500/50 bg-red-950/40 text-slate-200';
        clashStatus.innerHTML = `
          <div class="flex items-center gap-2 text-red-400 font-bold mb-1">
            <span class="w-3 h-3 rounded-full bg-red-500 animate-ping"></span>
            HARD CLASH DETECTED: Zone 3B Plenum Intersection
          </div>
          <p class="text-xs text-slate-300">
            <strong>Conflict:</strong> 900x450mm Chilled Water Supply Duct (Blue) physically collides with 600mm Medium Voltage Cable Tray (Yellow) at elevation +3.450m.
          </p>
          <div class="mt-2 text-xs font-mono text-red-300">
            Field Rework Risk: <strong>\u20B915+ Lakhs</strong> | Schedule Delay: <strong>2 Weeks</strong>
          </div>
        `;
      }
      if (resolveBtn) {
        resolveBtn.disabled = false;
        resolveBtn.classList.remove('opacity-50', 'cursor-not-allowed');
      }
    } else {
      isClashActive = false;
      if (clashMarker) clashMarker.style.display = 'none';
      if (clashStatus) {
        clashStatus.className = 'p-4 rounded-xl border border-emerald-500/50 bg-emerald-950/40 text-slate-200';
        clashStatus.innerHTML = `
          <div class="flex items-center gap-2 text-emerald-400 font-bold mb-1">
            <svg class="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
            0 SPATIAL CLASHES (Bhushan's Constructability Model Approved)
          </div>
          <p class="text-xs text-slate-300">
            Vertical offset +300mm applied to cable ladder. Duct transitions fitted with aerodynamic acoustic vanes. All NFPA clearances and structural beam buffers verified (LOD 400).
          </p>
          <div class="mt-2 text-xs font-mono text-emerald-300">
            Project Delivery: <strong>100% On-Time</strong> | Tolerance: <strong>Zero Field Cutting</strong>
          </div>
        `;
      }
    }
  }

  Object.values(layerToggles).forEach(cb => {
    if (cb) cb.addEventListener('change', updateLayerVisibility);
  });

  if (resolveBtn) {
    resolveBtn.addEventListener('click', () => {
      isResolved = true;
      playChime('success');
      // Animate duct/tray SVG to clear clearance
      const trayPath = document.getElementById('path-tray-main');
      if (trayPath) {
        trayPath.setAttribute('d', 'M 50 180 Q 250 180 320 130 T 480 130 T 550 180 H 750');
      }
      if (trayRungs) {
        trayRungs.style.display = 'none';
      }
      evaluateClashes();
      showToast("Bhushan's Spatial Reroute Applied: 0 Clashes, \u20B915L Saved!");
    });
  }

  if (runTestBtn) {
    runTestBtn.addEventListener('click', () => {
      isResolved = false;
      playChime('alert');
      const trayPath = document.getElementById('path-tray-main');
      if (trayPath) {
        trayPath.setAttribute('d', 'M 50 180 H 750');
      }
      if (trayRungs) {
        trayRungs.style.display = 'inline';
      }
      evaluateClashes();
      showToast('Navisworks / BIM 360 clash matrix test re-executed');
    });
  }

  if (clashMarker) {
    clashMarker.addEventListener('click', () => {
      playChime('alert');
      showToast('Clash ID: #CL-0482 - Primary HVAC Duct intersects MV Busduct Ladder');
    });
  }
}

/* --------------------------------------------------------------------------
   5. INTERACTIVE BOQ & RATE ANALYSIS ESTIMATION CALCULATOR
   -------------------------------------------------------------------------- */
function initBoqCalculator() {
  const facilitySelect = document.getElementById('boq-facility-type');
  const areaSlider = document.getElementById('boq-area-slider');
  const areaDisplay = document.getElementById('boq-area-val');

  const metricHvac = document.getElementById('metric-hvac-tr');
  const metricPower = document.getElementById('metric-power-kva');
  const metricSprinklers = document.getElementById('metric-sprinkler-heads');
  const metricCost = document.getElementById('metric-estimated-budget');
  const copyBoqBtn = document.getElementById('copy-boq-btn');

  if (!facilitySelect || !areaSlider) return;

  function calculateTakeoff() {
    const area = parseFloat(areaSlider.value);
    const facility = facilitySelect.value;
    if (areaDisplay) areaDisplay.textContent = area.toLocaleString() + ' sq.ft';

    let trFactor = 0.0035;    // standard office: ~300 sqft / TR
    let kvaFactor = 0.012;    // ~12 VA / sqft
    let headFactor = 0.009;   // 1 sprinkler per 110-130 sqft
    let costPerSqFt = 950;    // INR per sq ft MEP

    if (facility === 'datacenter') {
      trFactor = 0.015;       // High density IT heat load
      kvaFactor = 0.095;      // High power density
      headFactor = 0.012;     // Clean agent / Preaction
      costPerSqFt = 3800;
    } else if (facility === 'hospital') {
      trFactor = 0.0065;      // 100% fresh air operating theaters
      kvaFactor = 0.024;      // Medical diagnostics & UPS
      headFactor = 0.010;
      costPerSqFt = 1950;
    } else if (facility === 'township') {
      trFactor = 0.0028;      // Residential mass housing
      kvaFactor = 0.008;
      headFactor = 0.007;
      costPerSqFt = 580;
    }

    const calculatedTR = Math.round(area * trFactor);
    const calculatedKVA = Math.round(area * kvaFactor);
    const calculatedHeads = Math.round(area * headFactor);
    const totalCostINR = (area * costPerSqFt) / 10000000; // in Crores

    if (metricHvac) metricHvac.textContent = calculatedTR.toLocaleString() + ' TR';
    if (metricPower) metricPower.textContent = calculatedKVA.toLocaleString() + ' kVA';
    if (metricSprinklers) metricSprinklers.textContent = calculatedHeads.toLocaleString() + ' Nos';
    if (metricCost) metricCost.textContent = '\u20B9' + totalCostINR.toFixed(2) + ' Cr';
  }

  facilitySelect.addEventListener('change', () => {
    playChime('click');
    calculateTakeoff();
  });
  areaSlider.addEventListener('input', calculateTakeoff);
  calculateTakeoff();

  if (copyBoqBtn) {
    copyBoqBtn.addEventListener('click', () => {
      const summaryText = [
        '=========================================',
        'PRELIMINARY MEP BOQ ESTIMATE (Bhushan A. Patil)',
        '=========================================',
        `Facility: ${facilitySelect.options[facilitySelect.selectedIndex].text}`,
        `Gross Area: ${areaSlider.value} sq.ft`,
        `HVAC Capacity: ${metricHvac ? metricHvac.textContent : ''}`,
        `Electrical Connected Load: ${metricPower ? metricPower.textContent : ''}`,
        `Fire Sprinkler Heads: ${metricSprinklers ? metricSprinklers.textContent : ''}`,
        `Estimated Budget: ${metricCost ? metricCost.textContent : ''}`,
        'Variance: <5% Tolerance (Revit & SAP MM Aligned)',
        'Prepared by: Bhushan Arvind Patil, Chartered Engineer & IGBC-AP'
      ].join('\n');

      navigator.clipboard.writeText(summaryText).then(() => {
        playChime('success');
        showToast('Preliminary BOQ summary copied to clipboard!');
      });
    });
  }
}

/* --------------------------------------------------------------------------
   6. CONTACT FEATURES: VCARD, CLIPBOARD, PRINT RESUME
   -------------------------------------------------------------------------- */
function initContactFeatures() {
  // Download vCard
  const vcardBtn = document.getElementById('download-vcard-btn');
  if (vcardBtn) {
    vcardBtn.addEventListener('click', (e) => {
      e.preventDefault();
      playChime('click');
      generateAndDownloadVCard();
    });
  }

  // Print Clean Resume
  const printBtns = document.querySelectorAll('.print-resume-btn');
  printBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      playChime('click');
      window.print();
    });
  });

  // Copy Email Button
  const copyEmailBtn = document.getElementById('copy-email-btn');
  if (copyEmailBtn) {
    copyEmailBtn.addEventListener('click', () => {
      navigator.clipboard.writeText('bhushanp49@gmail.com').then(() => {
        playChime('success');
        showToast('Email (bhushanp49@gmail.com) copied to clipboard!');
      });
    });
  }

  // Copy Phone Button
  const copyPhoneBtn = document.getElementById('copy-phone-btn');
  if (copyPhoneBtn) {
    copyPhoneBtn.addEventListener('click', () => {
      navigator.clipboard.writeText('+91 8928213665').then(() => {
        playChime('success');
        showToast('Phone number (+91 8928213665) copied to clipboard!');
      });
    });
  }

  // Quick Inquiry Form Submission
  const contactForm = document.getElementById('mep-contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      playChime('success');
      const name = document.getElementById('contact-name').value;
      const email = document.getElementById('contact-email').value;
      const projectType = document.getElementById('contact-project-type').value;
      const message = document.getElementById('contact-message').value;

      const subject = encodeURIComponent(`MEP Project Inquiry: ${projectType} from ${name}`);
      const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\nProject Type: ${projectType}\n\nProject Scope & Requirements:\n${message}\n\nSent via Bhushan Arvind Patil MEP Portfolio.`);

      window.location.href = `mailto:bhushanp49@gmail.com?subject=${subject}&body=${body}`;
      showToast('Opening your default email client to send message to Bhushan...');
    });
  }
}

function generateAndDownloadVCard() {
  const vcardContent = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    'N:Patil;Bhushan;Arvind;;',
    'FN:Bhushan Arvind Patil',
    'ORG:Turner International / Chartered Mechanical Engineer (IEI)',
    'TITLE:Senior MEP Project Engineer | IGBC AP',
    'TEL;TYPE=CELL,VOICE:+918928213665',
    'EMAIL;TYPE=PREF,INTERNET:bhushanp49@gmail.com',
    'ADR;TYPE=HOME:;;Neel Kunj Plot No. 1&2 Flat No. 301, Sector-4;New Panvel;Maharashtra;410206;India',
    'NOTE:Chartered Mechanical Engineer (IEI 2022) | IGBC Accredited Professional (2026) | Amnear MEP Certified | Expertise in US Datacenters (Google, Apple) & INR 4256Cr Mass Housing Developments.',
    'URL:https://bhushanpatil-mep.github.io',
    'END:VCARD'
  ].join('\r\n');

  const blob = new Blob([vcardContent], { type: 'text/vcard;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.setAttribute('download', 'Bhushan_Arvind_Patil_MEP_Engineer.vcf');
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  showToast('vCard downloaded successfully!');
}

/* --------------------------------------------------------------------------
   7. HUD TELEMETRY & COORDINATES TRACKER
   -------------------------------------------------------------------------- */
function initTelemetryHUD() {
  const coordDisplay = document.getElementById('hud-coordinates');
  if (!coordDisplay) return;

  window.addEventListener('mousemove', (e) => {
    const xRatio = (e.clientX / window.innerWidth).toFixed(3);
    const yRatio = (e.clientY / window.innerHeight).toFixed(3);
    coordDisplay.textContent = `GRID: X ${xRatio} | Y ${yRatio} | LOD 400`;
  });
}

/* --------------------------------------------------------------------------
   8. MOBILE NAVIGATION MENU TOGGLE
   -------------------------------------------------------------------------- */
function initMobileMenu() {
  const btn = document.getElementById('mobile-menu-btn');
  const menu = document.getElementById('mobile-menu');
  if (!btn || !menu) return;

  btn.addEventListener('click', () => {
    playChime('click');
    menu.classList.toggle('hidden');
  });

  menu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      menu.classList.add('hidden');
    });
  });
}

/* --------------------------------------------------------------------------
   TOAST NOTIFICATION ENGINE
   -------------------------------------------------------------------------- */
function showToast(message) {
  let toast = document.getElementById('mep-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'mep-toast';
    toast.className = 'fixed bottom-6 right-6 z-50 px-4 py-3 rounded-lg shadow-2xl bg-slate-900 border border-blue-500 text-slate-100 text-sm font-mono flex items-center gap-3 transition-all duration-300 transform translate-y-20 opacity-0 pointer-events-none';
    toast.innerHTML = `
      <span class="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></span>
      <span id="toast-text">${message}</span>
    `;
    document.body.appendChild(toast);
  }

  const toastText = document.getElementById('toast-text');
  if (toastText) toastText.textContent = message;

  toast.classList.remove('translate-y-20', 'opacity-0', 'pointer-events-none');
  toast.classList.add('translate-y-0', 'opacity-100');

  clearTimeout(window._toastTimeout);
  window._toastTimeout = setTimeout(() => {
    toast.classList.add('translate-y-20', 'opacity-0', 'pointer-events-none');
    toast.classList.remove('translate-y-0', 'opacity-100');
  }, 3500);
}
