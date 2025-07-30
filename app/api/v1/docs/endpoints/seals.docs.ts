/**
 * Documentação dos endpoints: Seals (Selos de Perfil)
 */

/**
 * @swagger
 * /api/v1/seals:
 *   get:
 *     tags: [Credits]
 *     summary: Listar selos disponíveis
 *     description: Retorna todos os selos que podem ser presenteados
 *     responses:
 *       200:
 *         description: Lista de selos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 seals:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       name:
 *                         type: string
 *                         example: Coração de Ouro
 *                       description:
 *                         type: string
 *                         example: Para perfis que conquistam corações
 *                       icon_url:
 *                         type: string
 *                         format: uri
 *                       price_credits:
 *                         type: integer
 *                         example: 50
 *                       rarity:
 *                         type: string
 *                         enum: [common, rare, epic, legendary]
 *                       category:
 *                         type: string
 *                         enum: [love, friendship, support, fun, special]
 *                       available:
 *                         type: boolean
 *                       limited_edition:
 *                         type: boolean
 */

/**
 * @swagger
 * /api/v1/seals/gift:
 *   post:
 *     tags: [Credits]
 *     summary: Presentear selo
 *     description: |
 *       Envia um selo de presente para outro usuário.
 *       O selo aparece no perfil do usuário por 30 dias.
 *       
 *       **Preços dos selos:**
 *       - Comuns: 15-30 créditos
 *       - Raros: 40-60 créditos
 *       - Épicos: 70-90 créditos
 *       - Lendários: 100+ créditos
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - seal_id
 *               - recipient_id
 *             properties:
 *               seal_id:
 *                 type: string
 *                 format: uuid
 *                 description: ID do selo a presentear
 *               recipient_id:
 *                 type: string
 *                 format: uuid
 *                 description: ID do usuário que receberá
 *               message:
 *                 type: string
 *                 maxLength: 200
 *                 description: Mensagem opcional com o presente
 *     responses:
 *       201:
 *         description: Selo enviado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 gift_id:
 *                   type: string
 *                   format: uuid
 *                 expires_at:
 *                   type: string
 *                   format: date-time
 *                   description: Quando o selo expira no perfil
 *                 credits_remaining:
 *                   type: integer
 *       400:
 *         description: Créditos insuficientes
 *       404:
 *         description: Selo ou usuário não encontrado
 */

/**
 * @swagger
 * /api/v1/users/{id}/seals:
 *   get:
 *     tags: [Credits]
 *     summary: Selos do usuário
 *     description: Lista todos os selos ativos no perfil de um usuário
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Lista de selos ativos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 seals:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       seal:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           icon_url:
 *                             type: string
 *                           rarity:
 *                             type: string
 *                       gifted_by:
 *                         $ref: '#/components/schemas/User'
 *                       gifted_at:
 *                         type: string
 *                         format: date-time
 *                       expires_at:
 *                         type: string
 *                         format: date-time
 *                       message:
 *                         type: string
 *                         nullable: true
 *                 total_seals_received:
 *                   type: integer
 */

export {};