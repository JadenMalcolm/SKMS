<template>
  <div class="policy-container">
    <header class="page-header">
      <h1>Security Policies</h1>
    </header>

    <div class="policy-navigation container">
      <button
        v-for="section in sections"
        :key="section.id"
        :class="['button', activeSection === section.id ? 'button-primary' : 'button-secondary']"
        @click="activeSection = section.id"
      >
        {{ section.title }}
      </button>
    </div>

    <div class="policy-content container">
      <!-- Enterprise Information Security Program Policy -->
      <div v-if="activeSection === 'enterprise'" class="policy-section">
        <div class="subsection-header">Enterprise Information Security Program Policy</div>
        <p class="policy-definition">
          The Enterprise Information Security Program Policy serves as the foundation for an
          organization's information security program. It defines the security goals, roles and
          responsibilities, and the organization's approach to risk management. This high-level
          policy establishes the framework from which all other security policies and procedures
          derive.
        </p>
        <div class="policy-items">
          <ul class="user-list">
            <li>Security governance structure and roles</li>
            <li>Risk assessment and management approach</li>
            <li>Compliance requirements and legal obligations</li>
            <li>Security awareness and training</li>
            <li>Security incident management</li>
          </ul>
        </div>
      </div>

      <!-- Issue-Specific Information Security Policies -->
      <div v-if="activeSection === 'issue'" class="policy-section">
        <div class="subsection-header">Issue-Specific Information Security Policies</div>
        <p class="policy-definition">
          Issue-Specific Security Policies address particular areas of technology or security
          controls. These policies provide detailed guidance on specific security concerns and are
          typically more detailed than the enterprise policy. They address functional aspects of
          information security across systems and applications.
        </p>
        <div class="policy-items">
          <ul class="user-list">
            <li>Acceptable use policy</li>
            <li>Password management policy</li>
            <li>Data classification and handling policy</li>
            <li>Remote access policy</li>
            <li>Encryption policy</li>
            <li>Mobile device policy</li>
          </ul>
        </div>
      </div>

      <!-- System-Specific Information Security Policies -->
      <div v-if="activeSection === 'system'" class="policy-section">
        <div class="subsection-header">System-Specific Information Security Policies</div>
        <p class="policy-definition">
          System-Specific Security Policies focus on security requirements for individual
          information systems or applications. They define the operational security procedures and
          configurations necessary to protect specific systems. These policies typically include
          implementation guidelines tailored to the unique requirements of each system.
        </p>
        <div class="policy-items">
          <ul class="user-list">
            <li>Database security configurations</li>
            <li>Network device security settings</li>
            <li>Web application security requirements</li>
            <li>Cloud service security controls</li>
            <li>IoT device security standards</li>
          </ul>
        </div>
      </div>

      <!-- Security Policy Revision and Update Process -->
      <div v-if="activeSection === 'revision'" class="policy-section">
        <div class="subsection-header">Security Policy Revision and Update Process</div>
        <p class="policy-definition">
          The Security Policy Revision and Update Process ensures that security policies remain
          current and effective. This process defines how and when policies are reviewed, who has
          authority to approve changes, and how updates are communicated to the organization.
          Regular reviews help address emerging threats and incorporate lessons learned from
          security incidents.
        </p>
        <div class="policy-items">
          <ul class="user-list">
            <li>Annual policy review schedule</li>
            <li>Change approval workflow</li>
            <li>Version control procedures</li>
            <li>Policy exception management</li>
            <li>Communication and distribution methods</li>
            <li>Effectiveness measurement criteria</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
  <floating-chat />
  <sidebar-menu />
</template>

<script setup lang="ts">
import { ref } from 'vue'

const activeSection = ref('enterprise')

const sections = [
  { id: 'enterprise', title: 'Enterprise Information Security Program Policy' },
  { id: 'issue', title: 'Issue-Specific Information Security Policies' },
  { id: 'system', title: 'System-Specific Information Security Policies' },
  { id: 'revision', title: 'Security Policy Revision and Update Process' },
]
</script>

<style scoped>
.policy-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.policy-navigation {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 20px;
  justify-content: center;
}

.policy-definition {
  background-color: rgba(76, 149, 232, 0.05);
  padding: 15px;
  border-left: 3px solid #4c95e8;
  margin-bottom: 20px;
  border-radius: 4px;
}

.policy-items {
  margin-top: 20px;
}

.button-secondary {
  background: linear-gradient(90deg, #9e9e9e, #757575);
}

.button-secondary:hover {
  background: linear-gradient(90deg, #757575, #616161);
  transform: scale(1.05);
}
</style>
