'use strict';

module.exports = {
    async up(knex) {
        await knex.schema.createTable('favorite', (table) => {
            table.increments('id').primary();
            table.integer('userId').unsigned().notNull();
            table.integer('movieId').unsigned().notNull();
            table.timestamp('createdAt').defaultTo(knex.fn.now());
            table.timestamp('updatedAt').defaultTo(knex.fn.now());

            // Foreign keys
            table.foreign('userId').references('user.id').onDelete('CASCADE');
            table.foreign('movieId').references('movie.id').onDelete('CASCADE');

            // Unique constraint to prevent duplicate favorites
            table.unique(['userId', 'movieId']);
        });
    },

    async down(knex) {
        await knex.schema.dropTableIfExists('favorite');
    }
};
