'use strict';

exports.up = async (knex) => {
    await knex.schema.createTable('movie', (table) => {
        table.increments('id').primary();
        table.string('title').notNullable();
        table.text('description').notNullable();
        table.string('filmmaker').notNullable();
        table.date('realisedAt').notNullable();
        table.timestamp('createdAt').defaultTo(knex.fn.now());
        table.timestamp('updatedAt').defaultTo(knex.fn.now());
    });
};

exports.down = async (knex) => {
    await knex.schema.dropTable('movie');
};