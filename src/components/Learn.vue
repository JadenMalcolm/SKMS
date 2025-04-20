<template>
  <div class="learn-page">
    <div class="page-header">
      <h1>Cybersecurity Learning Resources</h1>
    </div>

    <div class="container learn-container">
      <!-- Statistics Section -->
      <div class="section-header">
        <h2>Key Cybersecurity Statistics</h2>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-number">83%</div>
          <div class="stat-description">
            of organizations experienced more than one data breach
            <div class="stat-source">
              <a href="https://www.verizon.com/business/resources/reports/dbir/" target="_blank">Verizon DBIR 2023</a>
            </div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-number">$4.45M</div>
          <div class="stat-description">
            average total cost of a data breach
            <div class="stat-source">
              <a href="https://www.ibm.com/reports/data-breach" target="_blank">IBM Cost of a Data Breach 2023</a>
            </div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-number">74%</div>
          <div class="stat-description">
            of data breaches involved the human element
            <div class="stat-source">
              <a href="https://www.verizon.com/business/resources/reports/dbir/" target="_blank">Verizon DBIR 2023</a>
            </div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-number">277</div>
          <div class="stat-description">
            days - average time to identify and contain a breach
            <div class="stat-source">
              <a href="https://www.ibm.com/reports/data-breach" target="_blank">IBM Cost of a Data Breach 2023</a>
            </div>
          </div>
        </div>
      </div>

      <!-- Data Breach Trends Visualization -->
      <div class="section-header">
        <h2>Data Breach Trends</h2>
      </div>

      <div class="visualization-container">

          <h3 class="chart-title">Top Industries Affected by Data Breaches</h3>
          <div class="horizontal-chart">
            <div class="chart-label-axis">
              <div class="chart-label">Healthcare</div>
              <div class="chart-label">Finance</div>
              <div class="chart-label">Public Sector</div>
              <div class="chart-label">Professional</div>
              <div class="chart-label">Manufacturing</div>
              <div class="chart-label">Retail</div>
              <div class="chart-label">Education</div>
            </div>
            <div class="chart-bars">
              <div class="chart-bar-container">
                <div class="chart-bar healthcare" :style="{ width: '85%' }">
                  <span class="chart-value">28%</span>
                </div>
              </div>
              <div class="chart-bar-container">
                <div class="chart-bar finance" :style="{ width: '75%' }">
                  <span class="chart-value">25%</span>
                </div>
              </div>
              <div class="chart-bar-container">
                <div class="chart-bar public" :style="{ width: '66%' }">
                  <span class="chart-value">22%</span>
                </div>
              </div>
              <div class="chart-bar-container">
                <div class="chart-bar professional" :style="{ width: '57%' }">
                  <span class="chart-value">19%</span>
                </div>
              </div>
              <div class="chart-bar-container">
                <div class="chart-bar manufacturing" :style="{ width: '48%' }">
                  <span class="chart-value">16%</span>
                </div>
              </div>
              <div class="chart-bar-container">
                <div class="chart-bar retail" :style="{ width: '42%' }">
                  <span class="chart-value">14%</span>
                </div>
              </div>
              <div class="chart-bar-container">
                <div class="chart-bar education" :style="{ width: '36%' }">
                  <span class="chart-value">12%</span>
                </div>
              </div>
            </div>
          </div>
          <div class="chart-source">
            <a href="https://www.verizon.com/business/resources/reports/dbir/" target="_blank">
              Source: Verizon Data Breach Investigation Report 2023
            </a>
          </div>
      </div>

      <!-- Industry Regulations Section -->
      <div class="section-header">
        <h2>Industry Regulations</h2>
      </div>
      <div class="regulations-grid">
        <div class="regulation-card">
          <div class="regulation-header">
            <h3>HIPAA</h3>
          </div>
          <p>Health Insurance Portability and Accountability Act</p>
          <p>Protects sensitive patient health information from being disclosed without consent.</p>
          <a href="https://www.hhs.gov/hipaa/for-professionals/privacy/laws-regulations/index.html" target="_blank" class="button button-primary">Learn More</a>
        </div>
        <div class="regulation-card">
          <div class="regulation-header">
            <h3>PCI DSS</h3>
          </div>
          <p>Payment Card Industry Data Security Standard</p>
          <p>Set of security standards designed to ensure all companies that process, store or transmit credit card information maintain secure environments.</p>
          <a href="https://www.pcisecuritystandards.org/" target="_blank" class="button button-primary">Learn More</a>
        </div>
        <div class="regulation-card">
          <div class="regulation-header">
            <h3>GDPR</h3>
          </div>
          <p>General Data Protection Regulation</p>
          <p>Regulation on data protection and privacy in the European Union and the European Economic Area.</p>
          <a href="https://gdpr.eu/" target="_blank" class="button button-primary">Learn More</a>
        </div>
        <div class="regulation-card">
          <div class="regulation-header">
            <h3>CCPA</h3>
          </div>
          <p>California Consumer Privacy Act</p>
          <p>Enhances privacy rights and consumer protection for residents of California.</p>
          <a href="https://oag.ca.gov/privacy/ccpa" target="_blank" class="button button-primary">Learn More</a>
        </div>
      </div>

      <!-- External Resources Section -->
      <div class="section-header">
        <h2>External Resources</h2>
      </div>

      <div class="resources-list">
        <div class="resource-item">
          <div class="resource-icon sans-icon"></div>
          <div class="resource-content">
            <h3>SANS Institute</h3>
            <p>Leading provider of cybersecurity training, certifications and research</p>
            <a href="https://www.sans.org/" target="_blank" class="button button-primary">Visit Website</a>
          </div>
        </div>

        <div class="resource-item">
          <div class="resource-icon nist-icon"></div>
          <div class="resource-content">
            <h3>NIST Cybersecurity Framework</h3>
            <p>Voluntary guidance based on existing standards, guidelines, and practices for organizations to better manage and reduce cybersecurity risk</p>
            <a href="https://www.nist.gov/cyberframework" target="_blank" class="button button-primary">Visit Website</a>
          </div>
        </div>

        <div class="resource-item">
          <div class="resource-icon nsa-icon"></div>
          <div class="resource-content">
            <h3>NSA Cybersecurity Resources</h3>
            <p>Cybersecurity information and resources from the National Security Agency</p>
            <a href="https://www.nsa.gov/cybersecurity/" target="_blank" class="button button-primary">Visit Website</a>
          </div>
        </div>

        <div class="resource-item">
          <div class="resource-icon privacy-icon"></div>
          <div class="resource-content">
            <h3>Privacy Rights Clearinghouse</h3>
            <p>Nonprofit corporation focused on privacy issues and consumer rights</p>
            <a href="https://privacyrights.org/" target="_blank" class="button button-primary">Visit Website</a>
          </div>
        </div>
      </div>

      <!-- Best Practices Section -->
      <div class="section-header">
        <h2>Cybersecurity Best Practices</h2>
      </div>
      <div class="practices-list">
        <div class="practice-item">
          <div class="practice-number">01</div>
          <div class="practice-content">
            <h3>Use Strong, Unique Passwords</h3>
            <p>Create complex passwords and never reuse them across different services.</p>
          </div>
        </div>
        <div class="practice-item">
          <div class="practice-number">02</div>
          <div class="practice-content">
            <h3>Enable Multi-Factor Authentication</h3>
            <p>Add an extra layer of security beyond just passwords.</p>
          </div>
        </div>
        <div class="practice-item">
          <div class="practice-number">03</div>
          <div class="practice-content">
            <h3>Keep Software Updated</h3>
            <p>Regularly update operating systems and applications to patch security vulnerabilities.</p>
          </div>
        </div>
        <div class="practice-item">
          <div class="practice-number">04</div>
          <div class="practice-content">
            <h3>Be Cautious of Phishing Attempts</h3>
            <p>Verify email senders and don't click suspicious links or download unusual attachments.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
  <floating-chat />
  <sidebar-menu />
</template>

<script setup lang="ts">
// Component logic can be added here if needed
</script>

<style scoped>
.learn-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.learn-container {
  margin-bottom: 40px;
}

/* Statistics Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: linear-gradient(135deg, var(--vt-c-white), #f0f6ff);
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  padding: 20px;
  display: flex;
  flex-direction: column;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border-left: 4px solid #4c95e8;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

.stat-number {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1976d2;
  margin-bottom: 10px;
}

.stat-description {
  color: #444;
  font-size: 0.95rem;
  line-height: 1.4;
}

.stat-source {
  font-size: 0.75rem;
  color: #666;
  margin-top: 10px;
  font-style: italic;
}

.stat-source a {
  color: #666;
  text-decoration: none;
  transition: color 0.2s ease;
  border-bottom: 1px dotted #999;
}

.stat-source a:hover {
  color: #1976d2;
  border-bottom-color: #1976d2;
}

/* Visualization Container */
.visualization-container {
  margin-bottom: 30px;
}

/* Chart Styling Updates */


.chart-title {
  font-size: 1.2rem;
  color: #1976d2;
  margin-bottom: 15px;
}

.horizontal-chart {
  display: flex;
  gap: 15px;
  margin-top: 20px;
}

.chart-label-axis {
  display: flex;
  flex-direction: column;
  gap: 18px;
  font-size: 0.9rem;
  color: #555;
  width: 100px;
}

.chart-label {
  font-size: 0.9rem;
  color: #555;
  text-align: right;
  padding: 5px 0;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.chart-bars {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.chart-bar-container {
  height: 30px;
}

.chart-bar {
  height: 30px;
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 10px;
  color: white;
  font-size: 0.9rem;
  font-weight: 700;
  transition: transform 0.2s ease;
}

.chart-bar:hover {
  transform: scaleX(1.01);
}

.chart-value {
  text-shadow: 0 0 3px rgba(0, 0, 0, 0.3);
}

.chart-bar.healthcare {
  background-color: #4caf50;
}

.chart-bar.finance {
  background-color: #ff9800;
}

.chart-bar.public {
  background-color: #f44336;
}

.chart-bar.professional {
  background-color: #2196f3;
}

.chart-bar.manufacturing {
  background-color: #9c27b0;
}

.chart-bar.retail {
  background-color: #3f51b5;
}

.chart-bar.education {
  background-color: #00bcd4;
}

.chart-source {
  font-size: 0.8rem;
  color: #666;
  margin-top: 15px;
  text-align: right;
}

.chart-source a {
  color: #1976d2;
  text-decoration: none;
  border-bottom: 1px dotted #999;
}

.chart-source a:hover {
  color: #0056b3;
  border-bottom-color: #0056b3;
}

/* Using existing container styles and modifying just what's needed */
.regulations-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.regulation-card {
  background-color: var(--vt-c-white);
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  transition: transform 0.3s ease;
  border-top: 4px solid #4c95e8;
}

.regulation-card:hover {
  transform: translateY(-5px);
}

.regulation-header h3 {
  margin: 0;
  color: #1976d2;
  font-size: 1.2rem;
}

.regulation-card p {
  color: #555;
  font-size: 0.9rem;
  margin-bottom: 15px;
}

.regulation-card .button {
  margin-top: auto;
  align-self: flex-start;
  /* Button styles from base.css will be applied */
}

/* Resources List */
.resources-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 30px;
}

.resource-item {
  display: flex;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.resource-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.12);
}

.resource-icon {
  width: 80px;
  min-height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sans-icon {
  background: #1976d2 url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='white' viewBox='0 0 24 24'%3E%3Cpath d='M12 3L1 9l11 6l9-4.91V17h2V9M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z'/%3E%3C/svg%3E") no-repeat center;
  background-size: 40px;
}

.nist-icon {
  background: #1976d2 url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='white' viewBox='0 0 24 24'%3E%3Cpath d='M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z'/%3E%3C/svg%3E") no-repeat center;
  background-size: 40px;
}

.nsa-icon {
  background: #1976d2 url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='white' viewBox='0 0 24 24'%3E%3Cpath d='M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z'/%3E%3C/svg%3E") no-repeat center;
  background-size: 40px;
}

.privacy-icon {
  background: #1976d2 url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='white' viewBox='0 0 24 24'%3E%3Cpath d='M12 17c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm6-9h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6h1.9c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm0 12H6V10h12v10z'/%3E%3C/svg%3E") no-repeat center;
  background-size: 40px;
}

.resource-content {
  padding: 20px;
  flex-grow: 1;
}

.resource-content h3 {
  margin-top: 0;
  color: #1976d2;
}

.resource-content p {
  margin-bottom: 15px;
  color: #555;
}

/* Best Practices */
.practices-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.practice-item {
  display: flex;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  transition: transform 0.2s ease;
}

.practice-item:hover {
  transform: translateX(5px);
}

.practice-number {
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #2196f3, #1565c0);
  color: white;
  font-size: 1.5rem;
  font-weight: 700;
  width: 70px;
  padding: 20px 0;
}

.practice-content {
  padding: 15px 20px;
}

.practice-content h3 {
  margin-top: 0;
  margin-bottom: 5px;
  color: #333;
}

.practice-content p {
  margin: 0;
  color: #666;
}

@media (max-width: 768px) {
  .stats-grid,
  .regulations-grid {
    grid-template-columns: 1fr;
  }

  .resource-item {
    flex-direction: column;
  }

  .resource-icon {
    width: 100%;
    height: 60px;
  }
}
</style>
