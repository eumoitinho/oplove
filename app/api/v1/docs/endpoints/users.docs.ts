/**
 * Documentação dos endpoints: Users
 */

/**
 * @swagger
 * /api/v1/users:
 *   get:
 *     tags: [Users]
 *     summary: Buscar usuários
 *     description: Busca usuários por nome ou username
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *           minLength: 2
 *         description: Termo de busca
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
 *     responses:
 *       200:
 *         description: Lista de usuários encontrados
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 */

/**
 * @swagger
 * /api/v1/users/{id}:
 *   get:
 *     tags: [Users]
 *     summary: Obter perfil do usuário
 *     description: Retorna informações públicas do perfil
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do usuário
 *     responses:
 *       200:
 *         description: Dados do usuário
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   allOf:
 *                     - $ref: '#/components/schemas/User'
 *                     - type: object
 *                       properties:
 *                         followers_count:
 *                           type: integer
 *                         following_count:
 *                           type: integer
 *                         posts_count:
 *                           type: integer
 *                         is_following:
 *                           type: boolean
 *                         is_blocked:
 *                           type: boolean
 *                         website:
 *                           type: string
 *                           format: uri
 *                         location:
 *                           type: string
 *       404:
 *         description: Usuário não encontrado
 *   patch:
 *     tags: [Users]
 *     summary: Atualizar perfil
 *     description: Atualiza informações do próprio perfil
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
 *             properties:
 *               full_name:
 *                 type: string
 *                 maxLength: 100
 *               bio:
 *                 type: string
 *                 maxLength: 500
 *               website:
 *                 type: string
 *                 format: uri
 *               location:
 *                 type: string
 *               avatar:
 *                 type: string
 *                 format: binary
 *                 description: Nova foto de perfil
 *               cover:
 *                 type: string
 *                 format: binary
 *                 description: Nova foto de capa
 *     responses:
 *       200:
 *         description: Perfil atualizado
 *       403:
 *         description: Sem permissão para editar este perfil
 *       413:
 *         description: Arquivo muito grande
 */

/**
 * @swagger
 * /api/v1/users/{id}/follow:
 *   post:
 *     tags: [Users]
 *     summary: Seguir/deixar de seguir usuário
 *     description: Alterna o status de seguir um usuário
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
 *         description: Status alterado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 following:
 *                   type: boolean
 *                 followers_count:
 *                   type: integer
 *       404:
 *         description: Usuário não encontrado
 *       400:
 *         description: Não pode seguir a si mesmo
 */

/**
 * @swagger
 * /api/v1/users/{id}/block:
 *   post:
 *     tags: [Users]
 *     summary: Bloquear/desbloquear usuário
 *     description: |
 *       Alterna o status de bloqueio de um usuário.
 *       Usuários bloqueados não podem ver conteúdo ou enviar mensagens.
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
 *         description: Status alterado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 blocked:
 *                   type: boolean
 *       404:
 *         description: Usuário não encontrado
 */

/**
 * @swagger
 * /api/v1/users/{id}/followers:
 *   get:
 *     tags: [Users]
 *     summary: Listar seguidores
 *     description: Retorna lista paginada de seguidores do usuário
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
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
 *     responses:
 *       200:
 *         description: Lista de seguidores
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 followers:
 *                   type: array
 *                   items:
 *                     allOf:
 *                       - $ref: '#/components/schemas/User'
 *                       - type: object
 *                         properties:
 *                           followed_at:
 *                             type: string
 *                             format: date-time
 *                           is_mutual:
 *                             type: boolean
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 */

/**
 * @swagger
 * /api/v1/users/{id}/following:
 *   get:
 *     tags: [Users]
 *     summary: Listar seguindo
 *     description: Retorna lista de usuários que o perfil segue
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
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
 *     responses:
 *       200:
 *         description: Lista de usuários seguidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 following:
 *                   type: array
 *                   items:
 *                     allOf:
 *                       - $ref: '#/components/schemas/User'
 *                       - type: object
 *                         properties:
 *                           followed_at:
 *                             type: string
 *                             format: date-time
 *                           is_mutual:
 *                             type: boolean
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 */

/**
 * @swagger
 * /api/v1/users/{id}/report:
 *   post:
 *     tags: [Users]
 *     summary: Denunciar usuário
 *     description: Reporta um usuário por violação dos termos
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
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reason
 *             properties:
 *               reason:
 *                 type: string
 *                 enum: [spam, harassment, fake_account, inappropriate_content, violence, other]
 *               description:
 *                 type: string
 *                 maxLength: 1000
 *                 description: Detalhes adicionais
 *               evidence_urls:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uri
 *                 description: Links para evidências
 *     responses:
 *       201:
 *         description: Denúncia registrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 report_id:
 *                   type: string
 *                   format: uuid
 *                 message:
 *                   type: string
 *       400:
 *         description: Dados inválidos
 *       429:
 *         description: Muitas denúncias em pouco tempo
 */

/**
 * @swagger
 * /api/v1/users/blocked:
 *   get:
 *     tags: [Users]
 *     summary: Listar usuários bloqueados
 *     description: Retorna lista de usuários que você bloqueou
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de bloqueados
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 blocked_users:
 *                   type: array
 *                   items:
 *                     allOf:
 *                       - $ref: '#/components/schemas/User'
 *                       - type: object
 *                         properties:
 *                           blocked_at:
 *                             type: string
 *                             format: date-time
 */

export {};