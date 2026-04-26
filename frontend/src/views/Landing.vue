<template>
  <div class="landing">
    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-bg"></div>
      <div class="hero-content">
        <div class="hero-badge">☀️ Solar Energy Made Simple</div>
        <h1 class="hero-title">
          Take Control of Your
          <span class="hero-highlight">Solar Energy</span>
        </h1>
        <p class="hero-description">
          Monitor performance, explore marketplace options, assess financial viability,
          and manage contracts — all in one powerful platform.
        </p>
        <div class="hero-actions">
          <router-link to="/signup" class="btn-hero-primary">
            Get Started Free →
          </router-link>
          <router-link to="/login" class="btn-hero-secondary">
            Sign In
          </router-link>
        </div>
        <div class="hero-stats-row">
          <div class="hero-stat-item">
            <span class="stat-number">10K+</span>
            <span class="stat-label">Active Users</span>
          </div>
          <div class="hero-stat-divider"></div>
          <div class="hero-stat-item">
            <span class="stat-number">1M+</span>
            <span class="stat-label">Data Points/Day</span>
          </div>
          <div class="hero-stat-divider"></div>
          <div class="hero-stat-item">
            <span class="stat-number">99.95%</span>
            <span class="stat-label">Uptime</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features-section">
      <div class="section-container">
        <div class="section-header-center">
          <h2>Everything You Need for Solar Success</h2>
          <p>Powerful tools designed for homeowners, businesses, and environmental advocates.</p>
        </div>

        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">📊</div>
            <h3>Real-Time Monitoring</h3>
            <p>Track power generation, voltage, frequency, and efficiency with live dashboards and interactive charts.</p>
            <ul class="feature-list">
              <li>Live power output (kW)</li>
              <li>Daily/monthly/yearly stats</li>
              <li>System efficiency tracking</li>
              <li>Automated alerts</li>
            </ul>
          </div>

          <div class="feature-card featured">
            <div class="feature-badge">Most Popular</div>
            <div class="feature-icon">🛒</div>
            <h3>Solar Marketplace</h3>
            <p>Browse panels, inverters, batteries, and providers. Compare products side-by-side with real user reviews.</p>
            <ul class="feature-list">
              <li>Product catalog & specs</li>
              <li>Provider directory</li>
              <li>Reviews & ratings</li>
              <li>Comparison tool</li>
            </ul>
          </div>

          <div class="feature-card">
            <div class="feature-icon">💰</div>
            <h3>Financial Assessment</h3>
            <p>Calculate ROI, payback period, and 20-year projections. Explore financing options and tax incentives.</p>
            <ul class="feature-list">
              <li>ROI calculator</li>
              <li>Tax incentive database</li>
              <li>Financing simulator</li>
              <li>Savings projections</li>
            </ul>
          </div>

          <div class="feature-card">
            <div class="feature-icon">📄</div>
            <h3>Contract Management</h3>
            <p>Create, review, and e-sign solar contracts. Track status and maintain a full audit trail.</p>
            <ul class="feature-list">
              <li>E-signature support</li>
              <li>Status tracking</li>
              <li>Document management</li>
              <li>Reminder notifications</li>
            </ul>
          </div>

          <div class="feature-card">
            <div class="feature-icon">⚡</div>
            <h3>Installation Management</h3>
            <p>Add, edit, and manage all your solar installations. Track system details, location, and performance.</p>
            <ul class="feature-list">
              <li>Multi-system support</li>
              <li>Location tracking</li>
              <li>Maintenance logs</li>
              <li>Performance metrics</li>
            </ul>
          </div>

          <div class="feature-card">
            <div class="feature-icon">🌱</div>
            <h3>Environmental Impact</h3>
            <p>Track your carbon offset and environmental contribution. See the real impact of your solar investment.</p>
            <ul class="feature-list">
              <li>CO₂ offset tracking</li>
              <li>Environmental reports</li>
              <li>Sustainability metrics</li>
              <li>Community impact</li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- How It Works Section -->
    <section class="how-it-works">
      <div class="section-container">
        <div class="section-header-center">
          <h2>Get Started in Minutes</h2>
          <p>Three simple steps to begin your solar journey.</p>
        </div>

        <div class="steps-grid">
          <div class="step-card">
            <div class="step-number">1</div>
            <h3>Create Your Account</h3>
            <p>Sign up with your email in seconds. Set up your profile with your location and energy details.</p>
          </div>
          <div class="step-connector">→</div>
          <div class="step-card">
            <div class="step-number">2</div>
            <h3>Add Your System</h3>
            <p>Register your solar installation or explore marketplace options to find the perfect setup.</p>
          </div>
          <div class="step-connector">→</div>
          <div class="step-card">
            <div class="step-number">3</div>
            <h3>Monitor & Optimize</h3>
            <p>Track real-time performance, manage contracts, and maximize your solar investment returns.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Testimonials Section -->
    <section class="testimonials-section">
      <div class="section-container">
        <div class="section-header-center">
          <h2>Trusted by Solar Users</h2>
          <p>See what our community has to say about Apolaki Solar.</p>
        </div>

        <div class="testimonials-grid">
          <div class="testimonial-card">
            <div class="testimonial-stars">★★★★★</div>
            <p class="testimonial-text">"Apolaki made it incredibly easy to understand my solar ROI. I signed my contract and started monitoring within a day."</p>
            <div class="testimonial-author">
              <div class="testimonial-avatar">MR</div>
              <div>
                <p class="testimonial-name">Maria Rodriguez</p>
                <p class="testimonial-role">Homeowner, San Francisco</p>
              </div>
            </div>
          </div>

          <div class="testimonial-card">
            <div class="testimonial-stars">★★★★★</div>
            <p class="testimonial-text">"The real-time monitoring dashboard is fantastic. I can see exactly how much energy my panels generate every minute."</p>
            <div class="testimonial-author">
              <div class="testimonial-avatar">JC</div>
              <div>
                <p class="testimonial-name">James Chen</p>
                <p class="testimonial-role">Business Owner, Austin</p>
              </div>
            </div>
          </div>

          <div class="testimonial-card">
            <div class="testimonial-stars">★★★★★</div>
            <p class="testimonial-text">"The marketplace comparison tool saved me thousands. I found the best panels at the best price in minutes."</p>
            <div class="testimonial-author">
              <div class="testimonial-avatar">SK</div>
              <div>
                <p class="testimonial-name">Sarah Kim</p>
                <p class="testimonial-role">Environmental Advocate, Portland</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta-section">
      <div class="section-container">
        <div class="cta-content">
          <h2>Ready to Harness the Power of the Sun?</h2>
          <p>Join thousands of users who are saving money and protecting the environment with Apolaki Solar.</p>
          <div class="cta-actions">
            <router-link to="/signup" class="btn-cta-primary">
              Create Free Account
            </router-link>
            <router-link to="/about" class="btn-cta-secondary">
              Learn More
            </router-link>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
// Landing page — no logic needed, purely presentational
</script>

<style scoped>
/* ── Hero ─────────────────────────────────────────────── */
.hero {
  position: relative;
  min-height: 90vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  color: white;
  text-align: center;
  padding: 2rem;
}

.hero-bg {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 30% 50%, rgba(255, 184, 28, 0.15) 0%, transparent 50%),
              radial-gradient(circle at 70% 30%, rgba(0, 102, 204, 0.1) 0%, transparent 50%);
}

.hero-content {
  position: relative;
  z-index: 1;
  max-width: 800px;
}

.hero-badge {
  display: inline-block;
  padding: 0.5rem 1.25rem;
  background: rgba(255, 184, 28, 0.15);
  border: 1px solid rgba(255, 184, 28, 0.3);
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 600;
  color: #FFB81C;
  margin-bottom: 1.5rem;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 800;
  line-height: 1.1;
  margin-bottom: 1.5rem;
  letter-spacing: -0.02em;
}

.hero-highlight {
  background: linear-gradient(135deg, #FFB81C 0%, #FF9500 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-description {
  font-size: 1.25rem;
  color: #94a3b8;
  line-height: 1.7;
  margin-bottom: 2.5rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 3rem;
}

.btn-hero-primary {
  padding: 1rem 2.5rem;
  background: linear-gradient(135deg, #FFB81C 0%, #FF9500 100%);
  color: #1a1a2e;
  font-weight: 700;
  font-size: 1.1rem;
  border-radius: 0.75rem;
  text-decoration: none;
  transition: transform 0.2s, box-shadow 0.2s;
}

.btn-hero-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(255, 184, 28, 0.4);
}

.btn-hero-secondary {
  padding: 1rem 2.5rem;
  border: 2px solid rgba(255, 255, 255, 0.2);
  color: white;
  font-weight: 600;
  font-size: 1.1rem;
  border-radius: 0.75rem;
  text-decoration: none;
  transition: border-color 0.2s, background-color 0.2s;
}

.btn-hero-secondary:hover {
  border-color: rgba(255, 255, 255, 0.5);
  background-color: rgba(255, 255, 255, 0.05);
}

.hero-stats-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2rem;
}

.hero-stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-number {
  font-size: 1.75rem;
  font-weight: 800;
  color: #FFB81C;
}

.stat-label {
  font-size: 0.8rem;
  color: #94a3b8;
  margin-top: 0.25rem;
}

.hero-stat-divider {
  width: 1px;
  height: 2.5rem;
  background: rgba(255, 255, 255, 0.1);
}

/* ── Sections common ──────────────────────────────────── */
.section-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.section-header-center {
  text-align: center;
  margin-bottom: 3rem;
}

.section-header-center h2 {
  font-size: 2.25rem;
  font-weight: 800;
  color: #1a1a2e;
  margin-bottom: 0.75rem;
}

.section-header-center p {
  font-size: 1.1rem;
  color: #64748b;
  max-width: 550px;
  margin: 0 auto;
}

/* ── Features ─────────────────────────────────────────── */
.features-section {
  padding: 6rem 0;
  background: #f8fafc;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
}

.feature-card {
  position: relative;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 1rem;
  padding: 2rem;
  transition: transform 0.2s, box-shadow 0.2s;
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.08);
}

.feature-card.featured {
  border-color: #FFB81C;
  box-shadow: 0 0 0 1px #FFB81C;
}

.feature-badge {
  position: absolute;
  top: -0.75rem;
  right: 1.5rem;
  background: linear-gradient(135deg, #FFB81C, #FF9500);
  color: white;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0.35rem 0.75rem;
  border-radius: 9999px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.feature-icon {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.feature-card h3 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0.5rem;
}

.feature-card > p {
  color: #64748b;
  font-size: 0.95rem;
  line-height: 1.6;
  margin-bottom: 1rem;
}

.feature-list {
  list-style: disc;
  padding-left: 1rem;
}

.feature-list li {
  padding: 0.35rem 0;
  font-size: 0.875rem;
  color: #475569;
}

/* ── How It Works ─────────────────────────────────────── */
.how-it-works {
  padding: 6rem 0;
  background: white;
}

.steps-grid {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
}

.step-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 1rem;
  padding: 2rem;
  text-align: center;
  max-width: 280px;
  flex: 1;
}

.step-number {
  width: 3rem;
  height: 3rem;
  background: linear-gradient(135deg, #FFB81C, #FF9500);
  color: white;
  font-weight: 800;
  font-size: 1.25rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
}

.step-card h3 {
  font-size: 1.1rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0.5rem;
}

.step-card p {
  color: #64748b;
  font-size: 0.9rem;
  line-height: 1.6;
}

.step-connector {
  font-size: 1.5rem;
  color: #FFB81C;
  font-weight: 700;
}

/* ── Testimonials ─────────────────────────────────────── */
.testimonials-section {
  padding: 6rem 0;
  background: #f8fafc;
}

.testimonials-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
}

.testimonial-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 1rem;
  padding: 2rem;
}

.testimonial-stars {
  color: #FFB81C;
  font-size: 1.25rem;
  margin-bottom: 1rem;
}

.testimonial-text {
  color: #334155;
  font-size: 0.95rem;
  line-height: 1.7;
  margin-bottom: 1.5rem;
  font-style: italic;
}

.testimonial-author {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.testimonial-avatar {
  width: 2.5rem;
  height: 2.5rem;
  background: linear-gradient(135deg, #FFB81C, #FF9500);
  color: white;
  font-weight: 700;
  font-size: 0.8rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.testimonial-name {
  font-weight: 600;
  color: #1e293b;
  font-size: 0.9rem;
  margin: 0;
}

.testimonial-role {
  color: #94a3b8;
  font-size: 0.8rem;
  margin: 0;
}

/* ── CTA ──────────────────────────────────────────────── */
.cta-section {
  padding: 6rem 0;
  background: linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%);
  color: white;
  text-align: center;
}

.cta-content h2 {
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 1rem;
  color: white;
}

.cta-content p {
  font-size: 1.15rem;
  color: #94a3b8;
  margin-bottom: 2rem;
  max-width: 550px;
  margin-left: auto;
  margin-right: auto;
}

.cta-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.btn-cta-primary {
  padding: 1rem 2.5rem;
  background: linear-gradient(135deg, #FFB81C, #FF9500);
  color: #1a1a2e;
  font-weight: 700;
  font-size: 1.1rem;
  border-radius: 0.75rem;
  text-decoration: none;
  transition: transform 0.2s, box-shadow 0.2s;
}

.btn-cta-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(255, 184, 28, 0.4);
}

.btn-cta-secondary {
  padding: 1rem 2.5rem;
  border: 2px solid rgba(255, 255, 255, 0.2);
  color: white;
  font-weight: 600;
  font-size: 1.1rem;
  border-radius: 0.75rem;
  text-decoration: none;
  transition: border-color 0.2s;
}

.btn-cta-secondary:hover {
  border-color: rgba(255, 255, 255, 0.5);
}

/* ── Responsive ───────────────────────────────────────── */
@media (max-width: 768px) {
  .hero-title {
    font-size: 2.25rem;
  }

  .hero-description {
    font-size: 1rem;
  }

  .hero-actions {
    flex-direction: column;
    align-items: center;
  }

  .hero-stats-row {
    flex-direction: column;
    gap: 1rem;
  }

  .hero-stat-divider {
    width: 3rem;
    height: 1px;
  }

  .features-grid,
  .testimonials-grid {
    grid-template-columns: 1fr;
  }

  .steps-grid {
    flex-direction: column;
  }

  .step-connector {
    transform: rotate(90deg);
  }

  .cta-content h2 {
    font-size: 1.75rem;
  }

  .cta-actions {
    flex-direction: column;
    align-items: center;
  }
}

/* ── Dark Theme Overrides ── */
:global(.dark-theme) .features-section {
  background: #0F172A;
}

:global(.dark-theme) .section-header-center h2 {
  color: #F1F5F9;
}

:global(.dark-theme) .section-header-center p {
  color: #94A3B8;
}

:global(.dark-theme) .feature-card {
  background: #1E293B;
  border-color: #334155;
}

:global(.dark-theme) .feature-card:hover {
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
}

:global(.dark-theme) .feature-card.featured {
  border-color: #FFCA4F;
  box-shadow: 0 0 0 1px #FFCA4F;
}

:global(.dark-theme) .feature-card h3 {
  color: #F1F5F9;
}

:global(.dark-theme) .feature-card > p {
  color: #94A3B8;
}

:global(.dark-theme) .feature-list li {
  color: #CBD5E1;
}

:global(.dark-theme) .how-it-works {
  background: #1E293B;
}

:global(.dark-theme) .step-card {
  background: #0F172A;
  border-color: #334155;
}

:global(.dark-theme) .step-card h3 {
  color: #F1F5F9;
}

:global(.dark-theme) .step-card p {
  color: #94A3B8;
}

:global(.dark-theme) .testimonials-section {
  background: #0F172A;
}

:global(.dark-theme) .testimonial-card {
  background: #1E293B;
  border-color: #334155;
}

:global(.dark-theme) .testimonial-text {
  color: #CBD5E1;
}

:global(.dark-theme) .testimonial-name {
  color: #F1F5F9;
}

:global(.dark-theme) .testimonial-role {
  color: #64748B;
}
</style>
