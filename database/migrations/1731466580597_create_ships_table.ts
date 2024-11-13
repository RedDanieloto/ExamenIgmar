import { BaseSchema } from '@adonisjs/lucid/schema'

export default class Ships extends BaseSchema {
  protected tableName = 'ships'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('game_id').unsigned().notNullable()
      table.integer('player_id').unsigned().notNullable()
      table.integer('coordinate_x').notNullable()
      table.integer('coordinate_y').notNullable()
      table.boolean('is_sunk').defaultTo(false)
      table.foreign('game_id').references('games.id').onDelete('CASCADE') // Solo referencia a `games`
      // Elimina esta línea si no tienes `users`:
      // table.foreign('player_id').references('users.id').onDelete('CASCADE')

      table.timestamps(true, true)
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
