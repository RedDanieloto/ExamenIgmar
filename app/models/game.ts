import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import Move from '#models/move'

export default class Game extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare player_1_id: number

  @column()
  declare player_2_id: number | null

  @column()
  declare status: 'waiting' | 'in_progress' | 'completed'

  @column()
  declare winner_id: number | null

  @hasMany(() => Move)
  declare moves: HasMany<typeof Move>
}
