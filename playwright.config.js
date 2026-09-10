import {defineConfig,devices} from '@playwright/test';
export default defineConfig({
 testDir:'./tests',
 testMatch:['e2e/**/*.spec.js','visual/**/*.spec.js'],
 fullyParallel:true,
 workers:2,
 retries:0,
 reporter:[['list'],['html',{open:'never'}]],
 timeout:30000,
 expect:{timeout:5000,toHaveScreenshot:{maxDiffPixelRatio:0.002,animations:'disabled'}},
 use:{...devices['Desktop Chrome'],viewport:{width:1440,height:900},baseURL:'http://127.0.0.1:5173',trace:'retain-on-failure'},
 webServer:{command:'npm run dev -- --port 5173 --strictPort',url:'http://127.0.0.1:5173',reuseExistingServer:!process.env.CI,timeout:30000},
});
