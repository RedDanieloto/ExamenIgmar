import { HttpContext } from '@adonisjs/core/http'
import Game from '#models/game'
import Ship from '#models/ship'

export default class GamesController {
  public static async createGame({ request, response }: HttpContext) {
    const { player_id } = request.only(['player_id']); // Recibes el ID del jugador en el cuerpo

    if (!player_id) {
      return response.status(400).json({ message: 'Falta el identificador del jugador' });
    }

    const game = await Game.create({
      player_1_id: player_id, // Asigna el ID del jugador al creador de la partida
      status: 'waiting',
    });

    // Generar barcos para el jugador 1
    const ships = [];
    for (let i = 0; i < 10; i++) {
      ships.push({
        gameId: game.id,
        playerId: player_id,
        coordinateX: Math.floor(Math.random() * 6) + 1,
        coordinateY: Math.floor(Math.random() * 6) + 1,
        isSunk: false,
      });
    }
    await Ship.createMany(ships);

    return response.status(201).json(game);
  }

  public static async joinGame({ params, request, response }: HttpContext) {
    const { player_id } = request.only(['player_id']); // Recibes el ID del jugador en el cuerpo
    const game = await Game.findOrFail(params.id);

    if (game.status !== 'waiting') {
      return response.status(400).json({ message: 'No se puede unir a esta partida' });
    }

    game.player_2_id = player_id; // Asigna el ID del jugador como contrincante
    game.status = 'in_progress';
    await game.save();

    // Generar barcos para el jugador 2
    const ships = [];
    for (let i = 0; i < 10; i++) {
      ships.push({
        gameId: game.id,
        playerId: player_id,
        coordinateX: Math.floor(Math.random() * 6) + 1,
        coordinateY: Math.floor(Math.random() * 6) + 1,
        isSunk: false,
      });
    }
    await Ship.createMany(ships);

    return response.json(game);
  }

  public static async listAvailableGames({ response }: HttpContext) {
    const games = await Game.query().where('status', 'waiting');
    return response.json(games);
  }

  // NUEVO ENDPOINT PARA VER LOS BARCOS RESTANTES
  public static async getRemainingShips({ params, response }: HttpContext) {
    try {
      const ships = await Ship.query()
        .where('game_id', params.id)
        .andWhere('is_sunk', false);

      return response.json({ remainingShips: ships });
    } catch (error) {
      return response.status(500).json({ message: 'Error al obtener los barcos restantes', error });
    }
  }
}
