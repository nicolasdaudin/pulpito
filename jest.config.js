module.exports = {
  setupFiles: ['dotenv/config'],
  collectCoverageFrom: [
    '**/*.js',
    '!public/**/*.js',
    '!*.js',
    '!coverage/**/*.js',
    '!**/node_modules/**',
    '!dev-data/**/*.js',
  ],
};
