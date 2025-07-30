/**
 * Documentação dos endpoints: Stories
 */

/**
 * @swagger
 * /api/v1/stories:
 *   get:
 *     tags: [Stories]
 *     summary: Listar stories disponíveis
 *     description: |
 *       Retorna stories ativos (últimas 24h) de usuários seguidos e boosted.
 *       Stories boosted aparecem primeiro na lista.
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de stories agrupados por usuário
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 stories:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       user:
 *                         $ref: '#/components/schemas/User'
 *                       stories:
 *                         type: array
 *                         items:
 *                           $ref: '#/components/schemas/Story'
 *                       has_unviewed:
 *                         type: boolean
 *   post:
 *     tags: [Stories]
 *     summary: Criar novo story
 *     description: |
 *       Cria um story que expira em 24 horas.
 *       
 *       **Limites diários por plano:**
 *       - Free: 0 (3 se verificado)
 *       - Gold: 5 (10 se verificado)
 *       - Diamond: 10 (ilimitado se verificado)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - media
 *             properties:
 *               media:
 *                 type: string
 *                 format: binary
 *                 description: Imagem ou vídeo (max 100MB)
 *               caption:
 *                 type: string
 *                 maxLength: 200
 *                 description: Legenda opcional
 *     responses:
 *       201:
 *         description: Story criado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 story:
 *                   $ref: '#/components/schemas/Story'
 *                 remaining_today:
 *                   type: integer
 *                   description: Quantos stories ainda pode postar hoje
 *       403:
 *         description: Limite diário atingido ou plano não permite
 *       413:
 *         description: Arquivo muito grande
 */

/**
 * @swagger
 * /api/v1/stories/{storyId}:
 *   get:
 *     tags: [Stories]
 *     summary: Obter story específico
 *     parameters:
 *       - in: path
 *         name: storyId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Detalhes do story
 *       404:
 *         description: Story não encontrado ou expirado
 *   delete:
 *     tags: [Stories]
 *     summary: Deletar story
 *     description: Remove um story (apenas o autor)
 *     parameters:
 *       - in: path
 *         name: storyId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Story deletado
 *       403:
 *         description: Sem permissão
 */

/**
 * @swagger
 * /api/v1/stories/{storyId}/view:
 *   post:
 *     tags: [Stories]
 *     summary: Marcar story como visualizado
 *     description: Registra visualização e retorna próximo story não visto do mesmo usuário
 *     parameters:
 *       - in: path
 *         name: storyId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Visualização registrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 viewed:
 *                   type: boolean
 *                 next_story_id:
 *                   type: string
 *                   format: uuid
 *                   nullable: true
 */

/**
 * @swagger
 * /api/v1/stories/{storyId}/react:
 *   post:
 *     tags: [Stories]
 *     summary: Reagir ao story
 *     description: Adiciona uma reação emoji ao story
 *     parameters:
 *       - in: path
 *         name: storyId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reaction
 *             properties:
 *               reaction:
 *                 type: string
 *                 enum: [like, love, fire, wow, sad, angry]
 *     responses:
 *       200:
 *         description: Reação adicionada/atualizada
 */

/**
 * @swagger
 * /api/v1/stories/{storyId}/reply:
 *   post:
 *     tags: [Stories]
 *     summary: Responder story via DM
 *     description: Envia mensagem privada como resposta ao story
 *     parameters:
 *       - in: path
 *         name: storyId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *                 maxLength: 500
 *     responses:
 *       201:
 *         description: Resposta enviada
 *       403:
 *         description: Plano não permite enviar mensagens
 */

/**
 * @swagger
 * /api/v1/stories/{storyId}/boost:
 *   post:
 *     tags: [Stories]
 *     summary: Impulsionar story
 *     description: |
 *       Usa créditos para dar mais visibilidade ao story.
 *       Story boosted aparece no topo da lista para todos usuários.
 *       
 *       **Preços:**
 *       - 6 horas: 50 créditos
 *       - 12 horas: 90 créditos
 *       - 24 horas: 150 créditos
 *     parameters:
 *       - in: path
 *         name: storyId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - duration
 *             properties:
 *               duration:
 *                 type: integer
 *                 enum: [6, 12, 24]
 *                 description: Duração do boost em horas
 *     responses:
 *       200:
 *         description: Boost aplicado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 boost_expires_at:
 *                   type: string
 *                   format: date-time
 *                 credits_remaining:
 *                   type: integer
 *       400:
 *         description: Créditos insuficientes
 *       403:
 *         description: Apenas Diamond+ pode boostar
 */

/**
 * @swagger
 * /api/v1/stories/{storyId}/viewers:
 *   get:
 *     tags: [Stories]
 *     summary: Listar visualizadores
 *     description: Lista quem visualizou o story (apenas o autor)
 *     parameters:
 *       - in: path
 *         name: storyId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de visualizadores
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 viewers:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       user:
 *                         $ref: '#/components/schemas/User'
 *                       viewed_at:
 *                         type: string
 *                         format: date-time
 *                       reaction:
 *                         type: string
 *                         enum: [like, love, fire, wow, sad, angry]
 *                         nullable: true
 *                 total:
 *                   type: integer
 *       403:
 *         description: Sem permissão
 */

/**
 * @swagger
 * /api/v1/stories/limits:
 *   get:
 *     tags: [Stories]
 *     summary: Verificar limites de postagem
 *     description: Retorna quantos stories o usuário ainda pode postar hoje
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Informações de limite
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 posted_today:
 *                   type: integer
 *                 daily_limit:
 *                   type: integer
 *                 remaining:
 *                   type: integer
 *                 resets_at:
 *                   type: string
 *                   format: date-time
 *                   description: Quando o limite reseta (meia-noite local)
 */

export {};