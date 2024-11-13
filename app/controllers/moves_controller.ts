import { HttpContext } from '@adonisjs/core/http';
import Game from '#models/game';
import Move from '#models/move';
import Ship from '#models/ship';
import { sendSlackNotification } from '../../helpers/slack.js';

export default class MovesController {
  public static async makeMove({ params, request, response }: HttpContext) {
    try {
      const { player_id, coordinate_x, coordinate_y } = request.only(['player_id', 'coordinate_x', 'coordinate_y']);
      const game = await Game.findOrFail(params.id);

      // Validar si el juego está activo
      if (game.status !== 'in_progress') {
        await sendSlackNotification(`⚠️ El jugador ${player_id} intentó jugar, pero la partida ${game.id} no está activa.`);
        return response.status(400).json({ message: 'La partida no está activa' });
      }

      const opponentId = game.player_1_id === player_id ? game.player_2_id : game.player_1_id;

      // Validar si existe un oponente
      if (!opponentId) {
        await sendSlackNotification(`⚠️ El jugador ${player_id} intentó jugar, pero no hay un oponente en la partida ${game.id}.`);
        return response.status(400).json({ message: 'No hay un oponente válido en esta partida' });
      }

      // Verificar si es el turno del jugador
      const lastMove = await Move.query()
        .where('game_id', game.id)
        .orderBy('id', 'desc')
        .first();

      if (lastMove && lastMove.playerId === player_id) {
        await sendSlackNotification(`⚠️ El jugador ${player_id} intentó jugar fuera de turno en la partida ${game.id}.`);
        return response.status(400).json({ message: 'No es tu turno' });
      }

      // Verificar si las coordenadas están dentro del tablero
      if (coordinate_x < 1 || coordinate_x > 6 || coordinate_y < 1 || coordinate_y > 6) {
        await sendSlackNotification(
          `⚠️ El jugador ${player_id} intentó jugar en coordenadas fuera del tablero (${coordinate_x}, ${coordinate_y}) en la partida ${game.id}.`
        );
        return response.status(400).json({ message: 'Las coordenadas están fuera del tablero (1-6)' });
      }

      // Verificar si el jugador ya atacó las mismas coordenadas
      const existingMove = await Move.query()
        .where('game_id', game.id)
        .andWhere('player_id', player_id) // Verifica solo los movimientos del jugador actual
        .andWhere('coordinate_x', coordinate_x)
        .andWhere('coordinate_y', coordinate_y)
        .first();

      if (existingMove) {
        await sendSlackNotification(
          `⚠️ El jugador ${player_id} intentó jugar en coordenadas repetidas (${coordinate_x}, ${coordinate_y}) en la partida ${game.id}.`
        );
        return response.status(400).json({ message: 'Ya realizaste un ataque en estas coordenadas' });
      }

      // Verificar si el movimiento impacta un barco en el tablero del oponente
      const ship = await Ship.query()
        .where('game_id', game.id)
        .andWhere('player_id', opponentId) // Barcos del oponente
        .andWhere('coordinate_x', coordinate_x)
        .andWhere('coordinate_y', coordinate_y)
        .first();

      let hit = false;
      if (ship) {
        ship.isSunk = true; // Marcar el barco como hundido
        await ship.save();
        hit = true;
      }

      // Registrar el movimiento
      const move = await Move.create({
        gameId: game.id,
        playerId: player_id,
        coordinateX: coordinate_x,
        coordinateY: coordinate_y,
        hit,
      });

      // Verificar si quedan barcos en el tablero del oponente
      const remainingShips = await Ship.query()
        .where('game_id', game.id)
        .andWhere('player_id', opponentId) // Barcos del oponente
        .andWhere('is_sunk', false)
        .count('* as total');

      const totalRemainingShips = remainingShips[0].$extras.total as number;

      // Si no quedan barcos, el juego termina
      if (totalRemainingShips === 0) {
        game.status = 'completed';
        game.winner_id = player_id;
        await game.save();

        await sendSlackNotification(`🎉 ¡El jugador ${player_id} ganó el juego en la partida ${game.id}! 🏆`);
      }

      // Notificar a Slack sobre el resultado del movimiento
      if (hit) {
        await sendSlackNotification(
          `🔥 El jugador ${player_id} impactó un barco del oponente en la coordenada (${coordinate_x}, ${coordinate_y}) en la partida ${game.id}.`
        );
      } else {
        await sendSlackNotification(
          `💨 El jugador ${player_id} falló el ataque en la coordenada (${coordinate_x}, ${coordinate_y}) en la partida ${game.id}.`
        );
      }

      return response.json({ move, hit, remainingShips: totalRemainingShips });
    } catch (error) {
      return response.status(500).json({ message: 'Error interno del servidor', error });
    }
  }

  public static async listMoves({ params, response }: HttpContext) {
    try {
      const game = await Game.findOrFail(params.id);
      const moves = await Move.query().where('game_id', game.id);
      return response.json(moves);
    } catch (error) {
      return response.status(500).json({ message: 'Error interno del servidor', error });
    }
  }
}
