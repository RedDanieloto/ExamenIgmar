import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import Game from '#models/game'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

export default class Ship extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare gameId: number

  @column()
  declare playerId: number

  @column()
  declare coordinateX: number

  @column()
  declare coordinateY: number

  @column()
  declare isSunk: boolean

  @belongsTo(() => Game)
  declare game: BelongsTo<typeof Game>
}
