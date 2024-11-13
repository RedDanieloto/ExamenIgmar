import router from '@adonisjs/core/services/router'

router.group(() => {
  router.post('/games', async (ctx) => {
    const module = await import('#controllers/games_controller');
    return module.default.createGame(ctx); // Pasa el contexto completo
  });
  router.post('/games/:id/join', async (ctx) => {
    const module = await import('#controllers/games_controller');
    return module.default.joinGame(ctx);
  });

  router.get('/games/available', async (ctx) => {
    const module = await import('#controllers/games_controller');
    return module.default.listAvailableGames(ctx);
  });

  router.post('/games/:id/move', async (ctx) => {
    const module = await import('#controllers/moves_controller');
    return module.default.makeMove(ctx);
  });

  router.get('/games/:id/moves', async (ctx) => {
    const module = await import('#controllers/moves_controller');
    return module.default.listMoves(ctx);
  });
  router.get('/games/:id/ships', () => import('#controllers/games_controller').then(module => module.default.getRemainingShips))

}).prefix('/api')
