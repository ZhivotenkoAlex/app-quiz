<template>
  <div class="about-page">
    <div class="container">
      <div class="about-header">
        <h1>{{ $t("about.title") }}</h1>
        <p>{{ $t("about.subtitle") }}</p>
      </div>

      <div class="about-content">
        <!-- Game Description -->
        <div class="card">
          <div class="section-icon">🎮</div>
          <h2>{{ $t("about.whatIsTitle") }}</h2>
          <p>{{ $t("about.whatIsDesc") }}</p>

          <div class="features-grid">
            <div class="feature-item">
              <div class="feature-icon">❓</div>
              <h3>{{ $t("about.createQuestionsTitle") }}</h3>
              <p>{{ $t("about.createQuestionsDesc") }}</p>
            </div>

            <div class="feature-item">
              <div class="feature-icon">👥</div>
              <h3>{{ $t("about.assignUsersTitle") }}</h3>
              <p>{{ $t("about.assignUsersDesc") }}</p>
            </div>

            <div class="feature-item">
              <div class="feature-icon">🎯</div>
              <h3>{{ $t("about.playGameTitle") }}</h3>
              <p>{{ $t("about.playGameDesc") }}</p>
            </div>
          </div>
        </div>

        <!-- How to Play -->
        <div class="card">
          <div class="section-icon">📋</div>
          <h2>{{ $t("about.howToPlayTitle") }}</h2>

          <div class="steps-list">
            <div class="step-item">
              <div class="step-number">1</div>
              <div class="step-content">
                <h3>{{ $t("about.step1Title") }}</h3>
                <p>{{ $t("about.step1Desc") }}</p>
              </div>
            </div>

            <div class="step-item">
              <div class="step-number">2</div>
              <div class="step-content">
                <h3>{{ $t("about.step2Title") }}</h3>
                <p>{{ $t("about.step2Desc") }}</p>
              </div>
            </div>

            <div class="step-item">
              <div class="step-number">3</div>
              <div class="step-content">
                <h3>{{ $t("about.step3Title") }}</h3>
                <p>{{ $t("about.step3Desc") }}</p>
              </div>
            </div>

            <div class="step-item">
              <div class="step-number">4</div>
              <div class="step-content">
                <h3>{{ $t("about.step4Title") }}</h3>
                <p>{{ $t("about.step4Desc") }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Game Rules -->
        <div class="card">
          <div class="section-icon">⚖️</div>
          <h2>{{ $t("about.rulesTitle") }}</h2>

          <div class="rules-list">
            <div class="rule-item">
              <div class="rule-icon">✅</div>
              <p>{{ $t("about.rule1") }}</p>
            </div>

            <div class="rule-item">
              <div class="rule-icon">🔄</div>
              <p>{{ $t("about.rule2") }}</p>
            </div>

            <div class="rule-item">
              <div class="rule-icon">👤</div>
              <p>{{ $t("about.rule3") }}</p>
            </div>

            <div class="rule-item">
              <div class="rule-icon">🎲</div>
              <p>{{ $t("about.rule4") }}</p>
            </div>

            <div class="rule-item">
              <div class="rule-icon">🏆</div>
              <p>{{ $t("about.rule5") }}</p>
            </div>
          </div>
        </div>

        <!-- Tips -->
        <div class="card">
          <div class="section-icon">💡</div>
          <h2>{{ $t("about.tipsTitle") }}</h2>

          <div class="tips-grid">
            <div class="tip-item">
              <div class="tip-icon">💭</div>
              <h3>{{ $t("about.tip1Title") }}</h3>
              <p>{{ $t("about.tip1Desc") }}</p>
            </div>

            <div class="tip-item">
              <div class="tip-icon">🎨</div>
              <h3>{{ $t("about.tip2Title") }}</h3>
              <p>{{ $t("about.tip2Desc") }}</p>
            </div>

            <div class="tip-item">
              <div class="tip-icon">🤝</div>
              <h3>{{ $t("about.tip3Title") }}</h3>
              <p>{{ $t("about.tip3Desc") }}</p>
            </div>
          </div>
        </div>

        <!-- Get Started -->
        <div class="card cta-card">
          <div class="cta-content">
            <h2>{{ $t("about.getStartedTitle") }}</h2>
            <p>{{ $t("about.getStartedDesc") }}</p>
            <div class="cta-actions">
              <router-link to="/questions" class="btn btn-primary btn-large">
                {{ $t("about.createFirstQuestion") }}
              </router-link>
              <router-link to="/dashboard" class="btn btn-secondary">
                {{ $t("about.goToDashboard") }}
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "About",
}
</script>

<style scoped>
.about-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 2rem 0;
}

.about-header {
  text-align: center;
  margin-bottom: 3rem;
}

.about-header h1 {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--text-color);
  margin-bottom: 0.5rem;
}

.about-header p {
  font-size: 1.1rem;
  color: var(--text-light);
}

.about-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  max-width: 900px;
  margin: 0 auto;
}

.section-icon {
  font-size: 3rem;
  text-align: center;
  margin-bottom: 1rem;
}

.card h2 {
  color: var(--text-color);
  margin-bottom: 1.5rem;
  text-align: center;
  font-size: 1.8rem;
}

.card p {
  color: var(--text-light);
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

/* Features Grid */
.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
}

.feature-item {
  text-align: center;
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 12px;
  border: 2px solid #e9ecef;
  transition: all 0.3s ease;
}

.feature-item:hover {
  border-color: var(--primary-color);
  transform: translateY(-2px);
}

.feature-icon {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.feature-item h3 {
  color: var(--text-color);
  margin-bottom: 0.5rem;
  font-size: 1.1rem;
}

.feature-item p {
  color: var(--text-light);
  font-size: 0.9rem;
  margin: 0;
}

/* Steps List */
.steps-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.step-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 12px;
  border-left: 4px solid var(--primary-color);
}

.step-number {
  background: var(--primary-color);
  color: white;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1.1rem;
  flex-shrink: 0;
}

.step-content h3 {
  color: var(--text-color);
  margin-bottom: 0.5rem;
  font-size: 1.1rem;
}

.step-content p {
  color: var(--text-light);
  margin: 0;
  font-size: 0.95rem;
}

/* Rules List */
.rules-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.rule-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.rule-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.rule-item p {
  margin: 0;
  color: var(--text-color);
  font-size: 0.95rem;
}

/* Tips Grid */
.tips-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.tip-item {
  padding: 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  color: white;
  text-align: center;
}

.tip-icon {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.tip-item h3 {
  color: white;
  margin-bottom: 0.5rem;
  font-size: 1.1rem;
}

.tip-item p {
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
  font-size: 0.9rem;
}

/* CTA Card */
.cta-card {
  background: linear-gradient(
    135deg,
    var(--primary-color) 0%,
    var(--secondary-color) 100%
  );
  color: white;
  text-align: center;
}

.cta-content h2 {
  color: white;
  margin-bottom: 1rem;
}

.cta-content p {
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 2rem;
}

.cta-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.btn-large {
  padding: 1rem 2rem;
  font-size: 1.1rem;
  font-weight: 600;
}

@media (max-width: 768px) {
  .about-header h1 {
    font-size: 2rem;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }

  .step-item {
    flex-direction: column;
    text-align: center;
    gap: 0.5rem;
  }

  .tips-grid {
    grid-template-columns: 1fr;
  }

  .cta-actions {
    flex-direction: column;
    align-items: center;
  }
}
</style>
