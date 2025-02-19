'use strict';

const Path = require('path');
const Hoek = require('@hapi/hoek');
const Manifest = require('./server/manifest');
const PluginConfig = require('./lib/plugins/@hapipal.schwifty');

// Récupérer l'option knex de l'enregistrement schwifty
// mais spécifier le répertoire des migrations du plugin

module.exports = Hoek.applyToDefaults(
    {
        migrations: {
            directory: Path.relative(process.cwd(), PluginConfig.options.migrationsDir)
        }
    },
    Manifest.get('/register/plugins', process.env)
        .find(({ plugin }) => plugin === '@hapipal/schwifty')
        .options.knex
);
