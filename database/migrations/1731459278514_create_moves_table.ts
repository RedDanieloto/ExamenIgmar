import { BaseSchema } from '@adonisjs/lucid/schema'

export default class Moves extends BaseSchema {
  protected tableName = 'moves';

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary(); // Llave primaria
      table.integer('game_id').unsigned().notNullable().references('id').inTable('games').onDelete('CASCADE'); // Llave foránea hacia la tabla games
      table.integer('player_id').unsigned().notNullable(); // Player ID sin llave foránea
      table.integer('coordinate_x').notNullable();
      table.integer('coordinate_y').notNullable();
      table.boolean('hit').defaultTo(false); // Indica si hubo impacto
      table.timestamp('created_at', { useTz: true }).defaultTo(this.now()); // Define un valor por defecto
      table.timestamp('updated_at', { useTz: true }).defaultTo(this.now()); // Define un valor por defecto
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
