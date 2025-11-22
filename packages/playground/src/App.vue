<template>
  <nav class="nav-bar">
    <div class="nav-brand">Vorm Playground</div>
    <div class="nav-links">
      <router-link to="/getting-started">Getting Started</router-link>
      <router-link to="/autovorm">AutoVorm</router-link>
      <router-link to="/validation">Validation</router-link>
      <router-link to="/reactive">Reactive</router-link>
      <span class="nav-divider">|</span>
      <router-link to="/repeater">Repeater</router-link>
      <router-link to="/form-state">Form State</router-link>
      <span class="nav-divider">|</span>
      <router-link to="/performance">Performance</router-link>
      <router-link to="/comparison">Comparison</router-link>
    </div>
  </nav>
  <main class="main-content">
    <router-view />
  </main>
</template>

<style>
.nav-bar {
  display: flex;
  align-items: center;
  gap: 2rem;
  padding: 0.75rem 1.5rem;
  background: #1e293b;
  border-bottom: 1px solid #334155;
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-brand {
  font-weight: 700;
  font-size: 1.1rem;
  color: #f8fafc;
}

.nav-links {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
}

.nav-links a {
  color: #94a3b8;
  text-decoration: none;
  font-size: 0.9rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  transition: all 0.2s;
}

.nav-links a:hover {
  color: #f8fafc;
  background: #334155;
}

.nav-links a.router-link-active {
  color: #f8fafc;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.nav-divider {
  color: #475569;
}

.main-content {
  min-height: calc(100vh - 60px);
}
</style>
