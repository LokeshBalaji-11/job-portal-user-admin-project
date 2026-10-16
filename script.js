/**
 * ==========================================================================
 * CareerSphere - Complete Job Portal Logic
 * Pure Vanilla JavaScript (No outside libraries)
 * Features:
 *  - 1. User must Log In or Sign Up first.
 *  - 2. Job Seekers browse jobs and apply.
 *  - 3. When any user applies, the Admin receives ALL applications in real time!
 *  - 4. Admin can Shortlist or Reject applicants, updating their status.
 *  - 5. All data persists in browser LocalStorage.
 * ==========================================================================
 */

// --- Initial Seed Data ---
const INITIAL_USERS = [
  { id: "u1", name: "Alex Candidate", email: "user@jobportal.com", password: "user123", role: "user" },
  { id: "u2", name: "Sarah Admin (HR)", email: "admin@jobportal.com", password: "admin123", role: "admin" }
];

const INITIAL_JOBS = [
  {
    id: "job-101",
    title: "Frontend Web Developer",
    company: "Google / TechCorp",
    dept: "Engineering",
    type: "Full-Time",
    location: "New York, NY",
    salary: "$90,000 - $120,000 / year",
    description: "Build clean, responsive, and interactive user interfaces using pure HTML, CSS, and modern JavaScript."
  },
  {
    id: "job-102",
    title: "UI/UX Product Designer",
    company: "Creative Studio",
    dept: "Design",
    type: "Remote",
    location: "Remote",
    salary: "$85,000 - $110,000 / year",
    description: "Design clean wireframes and modern visual layouts for mobile and web platforms."
  },
  {
    id: "job-103",
    title: "Associate Product Manager",
    company: "CloudSolutions",
    dept: "Product",
    type: "Full-Time",
    location: "San Francisco, CA",
    salary: "$100,000 - $130,000 / year",
    description: "Lead product development sprints and translate business needs into engineering tasks."
  }
];

const INITIAL_APPLICATIONS = [
  {
    id: "app-101",
    jobId: "job-101",
    jobTitle: "Frontend Web Developer",
    company: "Google / TechCorp",
    applicantName: "Alex Candidate",
    applicantEmail: "user@jobportal.com",
    applicantPhone: "+1 555-0182",
    experience: "1-3 Years",
    resumeName: "Alex_Resume.pdf",
    status: "Shortlisted"
  }
];

// --- LocalStorage Keys ---
const STORAGE_KEYS = {
  USERS: "portal_users",
  ACTIVE_USER: "portal_active_user",
  JOBS: "portal_jobs",
  APPLICATIONS: "portal_applications"
};

// ==========================================================================
// Main Application State & Methods
// ==========================================================================
class JobPortal {
  constructor() {
    this.users = [];
    this.currentUser = null;
    this.jobs = [];
    this.applications = [];

    this.init();
  }

  init() {
    this.loadData();
    this.bindEvents();
    this.render();
  }

  // --- Load & Save Data in LocalStorage ---
  loadData() {
    // 1. Users
    const storedUsers = localStorage.getItem(STORAGE_KEYS.USERS);
    this.users = storedUsers ? JSON.parse(storedUsers) : [...INITIAL_USERS];
    if (!storedUsers) localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(this.users));

    // 2. Current Logged-in User Session
    const storedActiveUser = localStorage.getItem(STORAGE_KEYS.ACTIVE_USER);
    this.currentUser = storedActiveUser ? JSON.parse(storedActiveUser) : null;

    // 3. Jobs
    const storedJobs = localStorage.getItem(STORAGE_KEYS.JOBS);
    this.jobs = storedJobs ? JSON.parse(storedJobs) : [...INITIAL_JOBS];
    if (!storedJobs) localStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(this.jobs));

    // 4. Applications (Sent by users, received by Admin)
    const storedApps = localStorage.getItem(STORAGE_KEYS.APPLICATIONS);
    this.applications = storedApps ? JSON.parse(storedApps) : [...INITIAL_APPLICATIONS];
    if (!storedApps) localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(this.applications));
  }

  saveUsers() { localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(this.users)); }
  saveJobs() { localStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(this.jobs)); }
  saveApplications() { localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(this.applications)); }

  saveActiveUser(user) {
    this.currentUser = user;
    if (user) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_USER);
    }
  }

  // ========================================================================
  // Event Listeners
  // ========================================================================
  bindEvents() {
    // --- Login & Signup Tabs ---
    document.getElementById("tab-login-mode").addEventListener("click", () => this.switchAuthMode("login"));
    document.getElementById("tab-signup-mode").addEventListener("click", () => this.switchAuthMode("signup"));

    // --- Quick Demo Login Buttons ---
    document.getElementById("demo-user-btn").addEventListener("click", () => {
      document.getElementById("login-email").value = "user@jobportal.com";
      document.getElementById("login-password").value = "user123";
      document.getElementById("login-role").value = "user";
      this.login("user@jobportal.com", "user123", "user");
    });

    document.getElementById("demo-admin-btn").addEventListener("click", () => {
      document.getElementById("login-email").value = "admin@jobportal.com";
      document.getElementById("login-password").value = "admin123";
      document.getElementById("login-role").value = "admin";
      this.login("admin@jobportal.com", "admin123", "admin");
    });

    // --- Form Submits ---
    document.getElementById("login-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const email = document.getElementById("login-email").value.trim();
      const pass = document.getElementById("login-password").value;
      const role = document.getElementById("login-role").value;
      this.login(email, pass, role);
    });

    document.getElementById("signup-form").addEventListener("submit", (e) => {
      e.preventDefault();
      this.signup();
    });

    // --- Logout ---
    document.getElementById("btn-logout").addEventListener("click", () => this.logout());

    // --- User Navigation Links ---
    document.getElementById("btn-nav-browse").addEventListener("click", () => this.showUserSubView("browse"));
    document.getElementById("btn-nav-my-apps").addEventListener("click", () => this.showUserSubView("my-apps"));
    document.getElementById("btn-back-to-browse").addEventListener("click", () => this.showUserSubView("browse"));
    document.getElementById("btn-empty-browse").addEventListener("click", () => this.showUserSubView("browse"));

    // --- Search & Filters ---
    document.getElementById("job-search-input").addEventListener("input", () => this.renderJobs());
    document.getElementById("filter-type").addEventListener("change", () => this.renderJobs());
    document.getElementById("filter-dept").addEventListener("change", () => this.renderJobs());
    document.getElementById("btn-clear-filters").addEventListener("click", () => {
      document.getElementById("job-search-input").value = "";
      document.getElementById("filter-type").value = "all";
      document.getElementById("filter-dept").value = "all";
      this.renderJobs();
    });

    // --- Apply Modal Events ---
    document.getElementById("close-apply-modal").addEventListener("click", () => this.closeModal("apply-modal"));
    document.getElementById("btn-cancel-apply").addEventListener("click", () => this.closeModal("apply-modal"));
    document.getElementById("apply-job-form").addEventListener("submit", (e) => this.handleApplySubmit(e));

    // --- Admin Navigation & Actions ---
    document.getElementById("btn-nav-admin-apps").addEventListener("click", () => this.showAdminSubView("apps"));
    document.getElementById("btn-nav-admin-jobs").addEventListener("click", () => this.showAdminSubView("jobs"));
    document.getElementById("btn-admin-post-job").addEventListener("click", () => this.openModal("post-job-modal"));
    document.getElementById("close-post-job-modal").addEventListener("click", () => this.closeModal("post-job-modal"));
    document.getElementById("btn-cancel-post-job").addEventListener("click", () => this.closeModal("post-job-modal"));
    document.getElementById("new-job-form").addEventListener("submit", (e) => this.handlePostNewJob(e));

    // Close modal on outside click
    window.addEventListener("click", (e) => {
      if (e.target.classList.contains("modal-overlay")) {
        e.target.classList.add("hidden");
      }
    });
  }

  // ========================================================================
  // Authentication (Signup & Login with LocalStorage)
  // ========================================================================
  switchAuthMode(mode) {
    const isLogin = mode === "login";
    document.getElementById("tab-login-mode").classList.toggle("active", isLogin);
    document.getElementById("tab-signup-mode").classList.toggle("active", !isLogin);
    document.getElementById("login-form").classList.toggle("hidden", !isLogin);
    document.getElementById("signup-form").classList.toggle("hidden", isLogin);

    document.getElementById("login-error").classList.add("hidden");
    document.getElementById("signup-error").classList.add("hidden");
  }

  login(email, password, role) {
    const errorEl = document.getElementById("login-error");
    errorEl.classList.add("hidden");

    // Check credentials in LocalStorage
    const matchedUser = this.users.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password && u.role === role
    );

    if (!matchedUser) {
      errorEl.textContent = "Incorrect email, password, or role. Please try again.";
      errorEl.classList.remove("hidden");
      return;
    }

    // Save active session in LocalStorage
    this.saveActiveUser(matchedUser);
    this.showToast(`Logged in successfully as ${matchedUser.name}!`);
    this.render();
  }

  signup() {
    const name = document.getElementById("signup-name").value.trim();
    const email = document.getElementById("signup-email").value.trim().toLowerCase();
    const role = document.getElementById("signup-role").value;
    const password = document.getElementById("signup-password").value;
    const errorEl = document.getElementById("signup-error");

    errorEl.classList.add("hidden");

    if (password.length < 6) {
      errorEl.textContent = "Password must be at least 6 characters.";
      errorEl.classList.remove("hidden");
      return;
    }

    // Check if email already exists
    if (this.users.some(u => u.email.toLowerCase() === email)) {
      errorEl.textContent = "An account with this email already exists.";
      errorEl.classList.remove("hidden");
      return;
    }

    // Create new user & save to LocalStorage
    const newUser = { id: "u-" + Date.now(), name, email, password, role };
    this.users.push(newUser);
    this.saveUsers();

    // Auto login
    this.saveActiveUser(newUser);
    this.showToast(`Account created! Welcome, ${newUser.name}.`);
    this.render();
  }

  logout() {
    this.saveActiveUser(null);
    this.showToast("Logged out successfully.");
    this.render();
  }

  // ========================================================================
  // Core View Controller
  // ========================================================================
  render() {
    const authScreen = document.getElementById("auth-screen");
    const mainApp = document.getElementById("main-app");

    // 1. If not logged in -> Show Login Screen
    if (!this.currentUser) {
      authScreen.classList.remove("hidden");
      mainApp.classList.add("hidden");
      return;
    }

    // 2. If logged in -> Show App
    authScreen.classList.add("hidden");
    mainApp.classList.remove("hidden");

    document.getElementById("display-user-name").textContent = 
      `👤 ${this.currentUser.name} (${this.currentUser.role === 'admin' ? 'Admin' : 'Job Seeker'})`;

    const isAdmin = this.currentUser.role === "admin";

    // Toggle navigation based on role
    document.getElementById("user-nav-links").classList.toggle("hidden", isAdmin);
    document.getElementById("admin-nav-links").classList.toggle("hidden", !isAdmin);

    // Toggle modules based on role
    document.getElementById("user-section").classList.toggle("hidden", isAdmin);
    document.getElementById("admin-section").classList.toggle("hidden", !isAdmin);

    if (!isAdmin) {
      // User Module
      this.showUserSubView("browse");
      this.updateUserAppCount();
    } else {
      // Admin Module: Shows ALL applications
      this.showAdminSubView("apps");
      this.renderAdminAllApplications();
      this.renderAdminJobs();
      this.renderAdminStats();
    }
  }

  // ========================================================================
  // USER MODULE: Browse Jobs & Apply
  // ========================================================================
  showUserSubView(view) {
    const isBrowse = view === "browse";
    document.getElementById("user-browse-view").classList.toggle("hidden", !isBrowse);
    document.getElementById("user-applications-view").classList.toggle("hidden", isBrowse);

    document.getElementById("btn-nav-browse").classList.toggle("active", isBrowse);
    document.getElementById("btn-nav-my-apps").classList.toggle("active", !isBrowse);

    if (isBrowse) {
      this.renderJobs();
    } else {
      this.renderUserApplications();
    }
  }

  renderJobs() {
    const container = document.getElementById("jobs-container");
    const searchVal = document.getElementById("job-search-input").value.toLowerCase().trim();
    const typeVal = document.getElementById("filter-type").value;
    const deptVal = document.getElementById("filter-dept").value;

    const filtered = this.jobs.filter(job => {
      const matchSearch = !searchVal || 
        job.title.toLowerCase().includes(searchVal) ||
        job.company.toLowerCase().includes(searchVal) ||
        job.description.toLowerCase().includes(searchVal);

      const matchType = typeVal === "all" || job.type === typeVal;
      const matchDept = deptVal === "all" || job.dept === deptVal;

      return matchSearch && matchType && matchDept;
    });

    if (filtered.length === 0) {
      container.innerHTML = `<div class="empty-box"><p>No jobs found matching your filters.</p></div>`;
      return;
    }

    container.innerHTML = filtered.map(job => `
      <div class="job-card">
        <div>
          <div class="job-header">
            <div>
              <span class="company-name">${this.escape(job.company)}</span>
              <h3 class="job-title">${this.escape(job.title)}</h3>
            </div>
            <span class="badge">${this.escape(job.type)}</span>
          </div>

          <p class="job-body-desc">${this.escape(job.description)}</p>

          <div class="job-tags">
            <span>📍 ${this.escape(job.location)}</span>
            <span>🏷️ ${this.escape(job.dept)}</span>
          </div>
        </div>

        <div class="job-footer">
          <span class="job-salary-text">${this.escape(job.salary)}</span>
          <button class="btn btn-primary btn-sm" onclick="portal.openApplyModal('${job.id}')">Apply Now</button>
        </div>
      </div>
    `).join("");
  }

  openApplyModal(jobId) {
    const job = this.jobs.find(j => j.id === jobId);
    if (!job) return;

    document.getElementById("apply-job-id").value = job.id;
    document.getElementById("apply-job-title-display").textContent = `${job.title} at ${job.company}`;

    // Auto-fill logged in user info
    if (this.currentUser) {
      document.getElementById("applicant-name").value = this.currentUser.name;
      document.getElementById("applicant-email").value = this.currentUser.email;
    }

    this.openModal("apply-modal");
  }

  // --- SUBMITTING APPLICATION (Saved so Admin receives it) ---
  handleApplySubmit(e) {
    e.preventDefault();

    const jobId = document.getElementById("apply-job-id").value;
    const job = this.jobs.find(j => j.id === jobId);
    if (!job) return;

    const name = document.getElementById("applicant-name").value.trim();
    const email = document.getElementById("applicant-email").value.trim();
    const phone = document.getElementById("applicant-phone").value.trim();
    const experience = document.getElementById("applicant-exp").value;
    const resume = document.getElementById("applicant-resume").value.trim();

    // Create application object
    const newApplication = {
      id: "app-" + Date.now(),
      jobId: job.id,
      jobTitle: job.title,
      company: job.company,
      applicantName: name,
      applicantEmail: email,
      applicantPhone: phone,
      experience: experience,
      resumeName: resume,
      status: "Pending" // Initial status
    };

    // Save to LocalStorage
    this.applications.unshift(newApplication);
    this.saveApplications();

    this.closeModal("apply-modal");
    this.showToast(`Application submitted! The Admin has received your application.`);

    // Automatically navigate to My Applications so the user can see it
    this.updateUserAppCount();
    this.showUserSubView("my-apps");
  }

  // --- User "My Applications" View ---
  renderUserApplications() {
    const list = document.getElementById("my-apps-list");
    const emptyMsg = document.getElementById("no-apps-msg");

    // Filter only applications submitted by this logged in user
    const myApps = this.applications.filter(
      a => a.applicantEmail.toLowerCase() === this.currentUser.email.toLowerCase()
    );

    if (myApps.length === 0) {
      list.innerHTML = "";
      emptyMsg.classList.remove("hidden");
      return;
    }

    emptyMsg.classList.add("hidden");
    list.innerHTML = myApps.map(a => `
      <div class="app-item-card">
        <div>
          <h3>${this.escape(a.jobTitle)}</h3>
          <p style="color:#64748b; font-size:0.88rem;">${this.escape(a.company)} &bull; Resume: ${this.escape(a.resumeName)}</p>
        </div>
        <div>
          <span class="status-pill status-${a.status.toLowerCase()}">${this.escape(a.status)}</span>
        </div>
      </div>
    `).join("");
  }

  updateUserAppCount() {
    if (!this.currentUser) return;
    const count = this.applications.filter(
      a => a.applicantEmail.toLowerCase() === this.currentUser.email.toLowerCase()
    ).length;
    document.getElementById("user-apps-badge").textContent = count;
  }

  // ========================================================================
  // ADMIN MODULE: Receives ALL Candidate Applications
  // ========================================================================
  showAdminSubView(view) {
    const isApps = view === "apps";
    document.getElementById("admin-applications-view").classList.toggle("hidden", !isApps);
    document.getElementById("admin-jobs-view").classList.toggle("hidden", isApps);

    document.getElementById("btn-nav-admin-apps").classList.toggle("active", isApps);
    document.getElementById("btn-nav-admin-jobs").classList.toggle("active", !isApps);
  }

  renderAdminAllApplications() {
    const tbody = document.getElementById("admin-applications-tbody");
    const emptyBox = document.getElementById("no-admin-apps");

    document.getElementById("admin-apps-badge").textContent = this.applications.length;

    // If no applications received yet
    if (this.applications.length === 0) {
      tbody.innerHTML = "";
      emptyBox.classList.remove("hidden");
      return;
    }

    emptyBox.classList.add("hidden");

    // Display EVERY application received across all users
    tbody.innerHTML = this.applications.map(app => `
      <tr>
        <td><strong>${this.escape(app.applicantName)}</strong></td>
        <td>${this.escape(app.jobTitle)}<br><small style="color:#64748b;">${this.escape(app.company)}</small></td>
        <td>${this.escape(app.applicantEmail)}<br><small style="color:#64748b;">${this.escape(app.applicantPhone)}</small></td>
        <td>${this.escape(app.experience)}</td>
        <td>📄 ${this.escape(app.resumeName)}</td>
        <td>
          <span class="status-pill status-${app.status.toLowerCase()}">${this.escape(app.status)}</span>
        </td>
        <td>
          <div style="display:flex; gap:0.4rem;">
            <button class="btn btn-sm btn-primary" onclick="portal.updateAppStatus('${app.id}', 'Shortlisted')" title="Shortlist this candidate">Shortlist</button>
            <button class="btn btn-sm btn-danger" onclick="portal.updateAppStatus('${app.id}', 'Rejected')" title="Reject this candidate">Reject</button>
          </div>
        </td>
      </tr>
    `).join("");
  }

  // Admin updates candidate status
  updateAppStatus(appId, newStatus) {
    const app = this.applications.find(a => a.id === appId);
    if (!app) return;

    app.status = newStatus;
    this.saveApplications();
    this.renderAdminAllApplications();
    this.renderAdminStats();
    this.showToast(`Candidate status updated to "${newStatus}"!`);
  }

  // --- Admin: Manage Jobs & Post New Job ---
  renderAdminJobs() {
    const tbody = document.getElementById("admin-jobs-tbody");

    tbody.innerHTML = this.jobs.map(job => `
      <tr>
        <td><strong>${this.escape(job.title)}</strong></td>
        <td>${this.escape(job.company)}</td>
        <td>${this.escape(job.dept)}</td>
        <td><span class="badge">${this.escape(job.type)}</span></td>
        <td>${this.escape(job.salary)}</td>
        <td>
          <button class="btn btn-sm btn-danger" onclick="portal.deleteJob('${job.id}')">Delete</button>
        </td>
      </tr>
    `).join("");
  }

  handlePostNewJob(e) {
    e.preventDefault();

    const title = document.getElementById("new-job-title").value.trim();
    const company = document.getElementById("new-job-company").value.trim();
    const dept = document.getElementById("new-job-dept").value;
    const type = document.getElementById("new-job-type").value;
    const location = document.getElementById("new-job-location").value.trim();
    const salary = document.getElementById("new-job-salary").value.trim();
    const description = document.getElementById("new-job-description").value.trim();

    const newJob = {
      id: "job-" + Date.now(),
      title, company, dept, type, location, salary, description
    };

    this.jobs.unshift(newJob);
    this.saveJobs();

    document.getElementById("new-job-form").reset();
    this.closeModal("post-job-modal");
    this.showToast(`New job "${newJob.title}" posted!`);

    this.renderAdminJobs();
    this.renderAdminStats();
  }

  deleteJob(jobId) {
    if (confirm("Are you sure you want to delete this job opening?")) {
      this.jobs = this.jobs.filter(j => j.id !== jobId);
      this.saveJobs();
      this.renderAdminJobs();
      this.renderAdminStats();
      this.showToast("Job opening removed.");
    }
  }

  renderAdminStats() {
    document.getElementById("admin-total-jobs-count").textContent = this.jobs.length;
    document.getElementById("admin-total-apps-count").textContent = this.applications.length;
    document.getElementById("admin-shortlisted-count").textContent = 
      this.applications.filter(a => a.status === "Shortlisted").length;
  }

  // ========================================================================
  // Helpers & Modals
  // ========================================================================
  openModal(id) { document.getElementById(id).classList.remove("hidden"); }
  closeModal(id) { document.getElementById(id).classList.add("hidden"); }

  escape(str) {
    if (!str) return "";
    return String(str).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m]);
  }

  showToast(msg) {
    const toast = document.getElementById("toast-msg");
    toast.textContent = msg;
    toast.classList.remove("hidden");
    setTimeout(() => toast.classList.add("hidden"), 3000);
  }
}

// Start Portal
let portal;
document.addEventListener("DOMContentLoaded", () => {
  portal = new JobPortal();
});