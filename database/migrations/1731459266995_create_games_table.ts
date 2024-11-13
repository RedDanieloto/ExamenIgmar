import { BaseSchema } from '@adonisjs/lucid/schema'
export default class Games extends BaseSchema {
  protected tableName = 'games'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('player_1_id').unsigned().notNullable()
      table.integer('player_2_id').unsigned().nullable()
      table.enum('status', ['waiting', 'in_progress', 'completed']).defaultTo('waiting')
      table.integer('winner_id').unsigned().nullable()
      table.timestamp('created_at', { useTz: true }).nullable()
      table.timestamp('updated_at', { useTz: true }).nullable()
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}

