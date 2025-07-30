/**
 * Documentação dos endpoints: Payments
 */

/**
 * @swagger
 * /api/v1/payments/plans:
 *   get:
 *     tags: [Payments]
 *     summary: Listar planos disponíveis
 *     description: Retorna todos os planos de assinatura com preços e benefícios
 *     responses:
 *       200:
 *         description: Lista de planos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 plans:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         enum: [free, gold, diamond, couple]
 *                       name:
 *                         type: string
 *                       price:
 *                         type: number
 *                         description: Preço em R$
 *                       interval:
 *                         type: string
 *                         enum: [month, year]
 *                       features:
 *                         type: array
 *                         items:
 *                           type: string
 *                       limits:
 *                         type: object
 *                         properties:
 *                           messages_per_day:
 *                             type: integer
 *                           stories_per_day:
 *                             type: integer
 *                           images_per_post:
 *                             type: integer
 *                           events_per_month:
 *                             type: integer
 *                       popular:
 *                         type: boolean
 */

/**
 * @swagger
 * /api/v1/payments/subscribe:
 *   post:
 *     tags: [Payments]
 *     summary: Criar assinatura
 *     description: |
 *       Inicia processo de assinatura de um plano.
 *       Retorna URL de pagamento ou QR Code PIX.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - plan_id
 *               - payment_method
 *             properties:
 *               plan_id:
 *                 type: string
 *                 enum: [gold, diamond, couple]
 *               payment_method:
 *                 type: string
 *                 enum: [card, pix]
 *               interval:
 *                 type: string
 *                 enum: [month, year]
 *                 default: month
 *     responses:
 *       200:
 *         description: Sessão de pagamento criada
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
 *                       description: URL do Stripe Checkout
 *                     session_id:
 *                       type: string
 *                 - type: object
 *                   properties:
 *                     payment_method:
 *                       type: string
 *                       enum: [pix]
 *                     qr_code:
 *                       type: string
 *                       description: Código PIX copia e cola
 *                     qr_code_image:
 *                       type: string
 *                       format: uri
 *                       description: URL da imagem QR Code
 *                     payment_id:
 *                       type: string
 *                     expires_at:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Dados inválidos
 *       409:
 *         description: Usuário já possui assinatura ativa
 */

/**
 * @swagger
 * /api/v1/payments/subscription:
 *   get:
 *     tags: [Payments]
 *     summary: Obter assinatura atual
 *     description: Retorna detalhes da assinatura ativa do usuário
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Detalhes da assinatura
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 subscription:
 *                   type: object
 *                   nullable: true
 *                   properties:
 *                     id:
 *                       type: string
 *                     plan_id:
 *                       type: string
 *                       enum: [gold, diamond, couple]
 *                     status:
 *                       type: string
 *                       enum: [active, cancelled, past_due, expired]
 *                     current_period_start:
 *                       type: string
 *                       format: date-time
 *                     current_period_end:
 *                       type: string
 *                       format: date-time
 *                     cancel_at_period_end:
 *                       type: boolean
 *                     payment_method:
 *                       type: string
 *                       enum: [card, pix]
 *   delete:
 *     tags: [Payments]
 *     summary: Cancelar assinatura
 *     description: Cancela assinatura no final do período atual
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Assinatura marcada para cancelamento
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 cancel_at:
 *                   type: string
 *                   format: date-time
 *       404:
 *         description: Sem assinatura ativa
 */

/**
 * @swagger
 * /api/v1/payments/status/{payment_id}:
 *   get:
 *     tags: [Payments]
 *     summary: Verificar status do pagamento
 *     description: Verifica se um pagamento PIX foi processado
 *     parameters:
 *       - in: path
 *         name: payment_id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do pagamento PIX
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Status do pagamento
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [pending, paid, expired, failed]
 *                 paid_at:
 *                   type: string
 *                   format: date-time
 *                   nullable: true
 *                 expires_at:
 *                   type: string
 *                   format: date-time
 *       404:
 *         description: Pagamento não encontrado
 */

/**
 * @swagger
 * /api/v1/payments/webhook:
 *   post:
 *     tags: [Payments]
 *     summary: Webhook Stripe
 *     description: |
 *       Endpoint para receber eventos do Stripe.
 *       **APENAS para uso interno do Stripe**
 *     parameters:
 *       - in: header
 *         name: stripe-signature
 *         required: true
 *         schema:
 *           type: string
 *         description: Assinatura do webhook Stripe
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Payload do evento Stripe
 *     responses:
 *       200:
 *         description: Evento processado
 *       400:
 *         description: Assinatura inválida
 */

/**
 * @swagger
 * /api/v1/payments/webhook/abacatepay:
 *   post:
 *     tags: [Payments]
 *     summary: Webhook AbacatePay
 *     description: |
 *       Endpoint para receber notificações de pagamento PIX.
 *       **APENAS para uso interno do AbacatePay**
 *     parameters:
 *       - in: header
 *         name: x-webhook-signature
 *         required: true
 *         schema:
 *           type: string
 *         description: Assinatura do webhook
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               event:
 *                 type: string
 *                 enum: [payment.paid, payment.expired]
 *               payment:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   status:
 *                     type: string
 *                   value:
 *                     type: number
 *                   metadata:
 *                     type: object
 *     responses:
 *       200:
 *         description: Webhook processado
 *       401:
 *         description: Assinatura inválida
 */

/**
 * @swagger
 * /api/v1/payments/history:
 *   get:
 *     tags: [Payments]
 *     summary: Histórico de pagamentos
 *     description: Lista todos os pagamentos do usuário
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
 *         name: status
 *         schema:
 *           type: string
 *           enum: [paid, pending, failed]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de pagamentos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 payments:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       amount:
 *                         type: number
 *                         description: Valor em R$
 *                       description:
 *                         type: string
 *                       status:
 *                         type: string
 *                         enum: [paid, pending, failed, refunded]
 *                       payment_method:
 *                         type: string
 *                         enum: [card, pix]
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                       paid_at:
 *                         type: string
 *                         format: date-time
 *                         nullable: true
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 */

export {};