module.exports = {
    apps: [{
      name: 'alanya-admin',
      script: 'npm',
      args: 'start',
      cwd: '/var/www/alanya-admin',
      env: { NODE_ENV: 'production', PORT: 3002 },
    }],
  };