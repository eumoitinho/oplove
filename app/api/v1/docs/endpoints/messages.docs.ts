/**
 * Documentação dos endpoints: Messages
 */

/**
 * @swagger
 * /api/v1/messages/conversations:
 *   get:
 *     tags: [Messages]
 *     summary: Listar conversas
 *     description: |
 *       Retorna lista de conversas do usuário ordenadas por última mensagem.
 *       
 *       **Restrições por plano:**
 *       - Free: Só vê conversas iniciadas por premium
 *       - Gold+: Vê todas as conversas
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
 *           default: 20
 *       - in: query
 *         name: unread_only
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Filtrar apenas conversas não lidas
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de conversas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 conversations:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       participants:
 *                         type: array
 *                         items:
 *                           $ref: '#/components/schemas/User'
 *                       last_message:
 *                         type: object
 *                         properties:
 *                           content:
 *                             type: string
 *                           created_at:
 *                             type: string
 *                             format: date-time
 *                           sender_id:
 *                             type: string
 *                             format: uuid
 *                       unread_count:
 *                         type: integer
 *                       is_group:
 *                         type: boolean
 *                       group_name:
 *                         type: string
 *                         nullable: true
 *   post:
 *     tags: [Messages]
 *     summary: Iniciar nova conversa
 *     description: |
 *       Cria uma nova conversa com outro usuário.
 *       
 *       **Restrições:**
 *       - Free: NÃO pode iniciar conversas
 *       - Gold+: Pode iniciar conversas (com limites diários)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - participant_id
 *               - message
 *             properties:
 *               participant_id:
 *                 type: string
 *                 format: uuid
 *                 description: ID do usuário para conversar
 *               message:
 *                 type: string
 *                 maxLength: 1000
 *                 description: Primeira mensagem
 *     responses:
 *       201:
 *         description: Conversa criada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 conversation_id:
 *                   type: string
 *                   format: uuid
 *                 message_id:
 *                   type: string
 *                   format: uuid
 *       403:
 *         description: Plano não permite ou limite diário atingido
 *       404:
 *         description: Usuário não encontrado
 */

/**
 * @swagger
 * /api/v1/messages/conversations/{id}/messages:
 *   get:
 *     tags: [Messages]
 *     summary: Listar mensagens da conversa
 *     description: Retorna mensagens paginadas de uma conversa específica
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID da conversa
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
 *       - in: query
 *         name: before
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Buscar mensagens antes desta data
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de mensagens
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 messages:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       content:
 *                         type: string
 *                       sender:
 *                         $ref: '#/components/schemas/User'
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                       read_at:
 *                         type: string
 *                         format: date-time
 *                         nullable: true
 *                       media_urls:
 *                         type: array
 *                         items:
 *                           type: string
 *                           format: uri
 *                       is_deleted:
 *                         type: boolean
 *                 has_more:
 *                   type: boolean
 *       403:
 *         description: Sem permissão para acessar conversa
 *       404:
 *         description: Conversa não encontrada
 *   post:
 *     tags: [Messages]
 *     summary: Enviar mensagem
 *     description: |
 *       Envia uma nova mensagem na conversa.
 *       
 *       **Limites diários:**
 *       - Free: Só pode responder se premium iniciou
 *       - Gold não verificado: 10 mensagens/dia
 *       - Gold verificado: Ilimitado
 *       - Diamond+: Ilimitado
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 maxLength: 1000
 *               media:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Imagens/vídeos anexos (Diamond+)
 *     responses:
 *       201:
 *         description: Mensagem enviada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     content:
 *                       type: string
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                 remaining_today:
 *                   type: integer
 *                   nullable: true
 *                   description: Mensagens restantes hoje (Gold não verificado)
 *       403:
 *         description: Limite atingido ou sem permissão
 *       413:
 *         description: Arquivo muito grande
 */

/**
 * @swagger
 * /api/v1/messages/conversations/{id}:
 *   get:
 *     tags: [Messages]
 *     summary: Obter detalhes da conversa
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Detalhes da conversa
 *       403:
 *         description: Sem acesso à conversa
 *   delete:
 *     tags: [Messages]
 *     summary: Deletar conversa
 *     description: Remove a conversa do usuário (não deleta para outros participantes)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Conversa removida
 *   patch:
 *     tags: [Messages]
 *     summary: Marcar como lida
 *     description: Marca todas mensagens da conversa como lidas
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Mensagens marcadas como lidas
 */

/**
 * @swagger
 * /api/v1/messages/groups:
 *   post:
 *     tags: [Messages]
 *     summary: Criar grupo
 *     description: |
 *       Cria um novo grupo de conversa.
 *       
 *       **Restrições:**
 *       - Apenas Diamond+ pode criar grupos
 *       - Máximo 50 membros por grupo
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - participants
 *             properties:
 *               name:
 *                 type: string
 *                 maxLength: 100
 *                 description: Nome do grupo
 *               description:
 *                 type: string
 *                 maxLength: 500
 *                 description: Descrição opcional
 *               participants:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *                 minItems: 2
 *                 maxItems: 49
 *                 description: IDs dos participantes (sem incluir criador)
 *               avatar:
 *                 type: string
 *                 format: binary
 *                 description: Imagem do grupo
 *     responses:
 *       201:
 *         description: Grupo criado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 group_id:
 *                   type: string
 *                   format: uuid
 *                 invite_link:
 *                   type: string
 *                   format: uri
 *       403:
 *         description: Apenas Diamond+ pode criar grupos
 *       400:
 *         description: Dados inválidos ou limite excedido
 */

export {};