import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir:'./tests/browser',fullyParallel:false,workers:1,timeout:90000,
  outputDir:process.env.CASTOR_EVIDENCE ? `${process.env.CASTOR_EVIDENCE}/playwright-results` : 'test-results',
  reporter:[['list']],
  use:{baseURL:'http://127.0.0.1:3210',browserName:'chromium',headless:true,trace:'retain-on-failure',screenshot:'only-on-failure',actionTimeout:15000,navigationTimeout:20000},
  projects:[{name:'desktop',use:{viewport:{width:1440,height:1000}}},{name:'mobile',use:{viewport:{width:390,height:844},isMobile:true,hasTouch:true}}],
});
