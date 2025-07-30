/**
 * Documentação dos endpoints: Credits
 */

/**
 * @swagger
 * /api/v1/credits/balance:
 *   get:
 *     tags: [Credits]
 *     summary: Consultar saldo de créditos
 *     description: Retorna o saldo atual de créditos do usuário
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Saldo de créditos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 balance:
 *                   type: integer
 *                   description: Saldo atual em créditos
 *                 pending:
 *                   type: integer
 *                   description: Créditos pendentes de liberação
 *                 total_earned:
 *                   type: integer
 *                   description: Total de créditos ganhos
 *                 total_spent:
 *                   type: integer
 *                   description: Total de créditos gastos
 */

/**
 * @swagger
 * /api/v1/credits/packages:
 *   get:
 *     tags: [Credits]
 *     summary: Listar pacotes de créditos
 *     description: Retorna pacotes disponíveis para compra com preços e bônus
 *     responses:
 *       200:
 *         description: Lista de pacotes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 packages:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       credits:
 *                         type: integer
 *                         description: Quantidade de créditos
 *                       price:
 *                         type: number
 *                         description: Preço em R$
 *                       bonus_percentage:
 *                         type: integer
 *                         description: Percentual de bônus
 *                       popular:
 *                         type: boolean
 *                         description: Se é o mais vendido
 *                       savings:
 *                         type: string
 *                         description: Economia comparado ao menor pacote
 */

/**
 * @swagger
 * /api/v1/credits/purchase:
 *   post:
 *     tags: [Credits]
 *     summary: Comprar créditos
 *     description: Inicia processo de compra de créditos
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - package_id
 *               - payment_method
 *             properties:
 *               package_id:
 *                 type: string
 *                 description: ID do pacote de créditos
 *               payment_method:
 *                 type: string
 *                 enum: [card, pix]
 *     responses:
 *       200:
 *         description: Processo de pagamento iniciado
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - type: object
 *                   properties:
 *                     payment_method:
 *                       type: string
 *                       enum: [card]
 *                     checkout_url:
 *                       type: string
 *                       format: uri
 *                 - type: object
 *                   properties:
 *                     payment_method:
 *                       type: string
 *                       enum: [pix]
 *                     qr_code:
 *                       type: string
 *                     qr_code_image:
 *                       type: string
 *                       format: uri
 *                     payment_id:
 *                       type: string
 *                     expires_at:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Pacote inválido
 */

/**
 * @swagger
 * /api/v1/credits/transactions:
 *   get:
 *     tags: [Credits]
 *     summary: Histórico de transações
 *     description: Lista todas as transações de créditos do usuário
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
 *         name: type
 *         schema:
 *           type: string
 *           enum: [purchase, spent, earned, refund]
 *         description: Filtrar por tipo de transação
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de transações
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 transactions:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       type:
 *                         type: string
 *                         enum: [purchase, story_boost, profile_seal, feed_boost, refund]
 *                       amount:
 *                         type: integer
 *                         description: Quantidade de créditos (positivo = entrada, negativo = saída)
 *                       description:
 *                         type: string
 *                       balance_after:
 *                         type: integer
 *                         description: Saldo após transação
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                       metadata:
 *                         type: object
 *                         description: Dados adicionais da transação
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 */

/**
 * @swagger
 * /api/v1/credits/spend:
 *   post:
 *     tags: [Credits]
 *     summary: Gastar créditos
 *     description: |
 *       Endpoint interno para consumir créditos em features.
 *       Usado pelos sistemas de boost, selos, etc.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - type
 *               - description
 *             properties:
 *               amount:
 *                 type: integer
 *                 minimum: 1
 *                 description: Quantidade a gastar
 *               type:
 *                 type: string
 *                 enum: [story_boost, profile_seal, feed_boost]
 *               description:
 *                 type: string
 *               metadata:
 *                 type: object
 *                 description: Dados relacionados ao gasto
 *     responses:
 *       200:
 *         description: Créditos debitados
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 transaction_id:
 *                   type: string
 *                   format: uuid
 *                 new_balance:
 *                   type: integer
 *       400:
 *         description: Saldo insuficiente
 */

export {};