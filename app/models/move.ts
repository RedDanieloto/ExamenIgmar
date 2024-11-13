import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import Game from '#models/game'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

export default class Move extends BaseModel {
  @column({ isPrimary: true })
  public id!: number

  @column()
  public gameId!: number

  @column()
  public playerId!: number

  @column()
  public coordinateX!: number

  @column()
  public coordinateY!: number

  @column()
  public hit!: boolean

  @belongsTo(() => Game)
  public game!: BelongsTo<typeof Game>
}
