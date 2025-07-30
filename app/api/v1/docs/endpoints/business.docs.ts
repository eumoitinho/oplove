/**
 * Documentação dos endpoints: Business
 */

/**
 * @swagger
 * /api/v1/business/register:
 *   post:
 *     tags: [Business]
 *     summary: Registrar conta business
 *     description: |
 *       Converte conta pessoal em conta business ou cria nova.
 *       
 *       **Benefícios Business:**
 *       - Analytics avançado
 *       - API dedicada
 *       - Suporte prioritário
 *       - Campanhas publicitárias
 *       - Menor comissão (10%)
 *       - Limite de 5000 req/hora
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - business_name
 *               - cnpj
 *               - category
 *               - phone
 *               - address
 *             properties:
 *               business_name:
 *                 type: string
 *                 maxLength: 200
 *               cnpj:
 *                 type: string
 *                 pattern: ^\d{14}$
 *               category:
 *                 type: string
 *                 enum: [agency, studio, influencer, brand, other]
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               website:
 *                 type: string
 *                 format: uri
 *               address:
 *                 type: object
 *                 required:
 *                   - street
 *                   - city
 *                   - state
 *                   - zip
 *                 properties:
 *                   street:
 *                     type: string
 *                   number:
 *                     type: string
 *                   complement:
 *                     type: string
 *                   city:
 *                     type: string
 *                   state:
 *                     type: string
 *                   zip:
 *                     type: string
 *     responses:
 *       201:
 *         description: Conta business criada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 business_id:
 *                   type: string
 *                   format: uuid
 *                 api_key:
 *                   type: string
 *                   description: Chave de API para integrações
 *                 verification_required:
 *                   type: boolean
 *                   description: Se precisa verificar CNPJ
 *       400:
 *         description: Dados inválidos ou CNPJ já cadastrado
 */

/**
 * @swagger
 * /api/v1/business/ads/campaigns:
 *   get:
 *     tags: [Business]
 *     summary: Listar campanhas
 *     description: Lista todas as campanhas publicitárias da conta
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, paused, completed, draft]
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de campanhas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 campaigns:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       name:
 *                         type: string
 *                       status:
 *                         type: string
 *                         enum: [active, paused, completed, draft]
 *                       budget:
 *                         type: number
 *                         description: Orçamento total em R$
 *                       spent:
 *                         type: number
 *                         description: Valor gasto em R$
 *                       impressions:
 *                         type: integer
 *                       clicks:
 *                         type: integer
 *                       ctr:
 *                         type: number
 *                         description: Click-through rate
 *                       start_date:
 *                         type: string
 *                         format: date
 *                       end_date:
 *                         type: string
 *                         format: date
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *   post:
 *     tags: [Business]
 *     summary: Criar campanha
 *     description: Cria nova campanha publicitária
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
 *               - objective
 *               - budget
 *               - start_date
 *               - end_date
 *               - target_audience
 *             properties:
 *               name:
 *                 type: string
 *               objective:
 *                 type: string
 *                 enum: [awareness, traffic, engagement, conversions]
 *               budget:
 *                 type: number
 *                 minimum: 100
 *                 description: Orçamento mínimo R$ 100
 *               daily_budget:
 *                 type: number
 *                 description: Limite diário opcional
 *               start_date:
 *                 type: string
 *                 format: date
 *               end_date:
 *                 type: string
 *                 format: date
 *               target_audience:
 *                 type: object
 *                 properties:
 *                   age_min:
 *                     type: integer
 *                     minimum: 18
 *                   age_max:
 *                     type: integer
 *                   genders:
 *                     type: array
 *                     items:
 *                       type: string
 *                       enum: [male, female, other]
 *                   locations:
 *                     type: array
 *                     items:
 *                       type: string
 *                   interests:
 *                     type: array
 *                     items:
 *                       type: string
 *     responses:
 *       201:
 *         description: Campanha criada
 *       400:
 *         description: Dados inválidos ou orçamento insuficiente
 */

/**
 * @swagger
 * /api/v1/business/analytics:
 *   get:
 *     tags: [Business]
 *     summary: Analytics da conta
 *     description: Retorna métricas detalhadas da conta business
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [7d, 30d, 90d, custom]
 *           default: 30d
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Requerido se period=custom
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Requerido se period=custom
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dados analíticos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 overview:
 *                   type: object
 *                   properties:
 *                     total_followers:
 *                       type: integer
 *                     new_followers:
 *                       type: integer
 *                     total_views:
 *                       type: integer
 *                     engagement_rate:
 *                       type: number
 *                     revenue:
 *                       type: number
 *                       description: Receita total em R$
 *                 demographics:
 *                   type: object
 *                   properties:
 *                     age_groups:
 *                       type: object
 *                     gender_distribution:
 *                       type: object
 *                     top_locations:
 *                       type: array
 *                       items:
 *                         type: object
 *                 content_performance:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       post_id:
 *                         type: string
 *                       impressions:
 *                         type: integer
 *                       engagement:
 *                         type: integer
 *                       revenue:
 *                         type: number
 *       403:
 *         description: Apenas contas business
 */

/**
 * @swagger
 * /api/v1/business/credits/purchase:
 *   post:
 *     tags: [Business]
 *     summary: Comprar créditos em massa
 *     description: |
 *       Compra de créditos com desconto para contas business.
 *       
 *       **Descontos Business:**
 *       - 1000+ créditos: 10% desconto
 *       - 5000+ créditos: 20% desconto
 *       - 10000+ créditos: 30% desconto
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
 *               - payment_method
 *             properties:
 *               amount:
 *                 type: integer
 *                 minimum: 1000
 *                 description: Mínimo 1000 créditos
 *               payment_method:
 *                 type: string
 *                 enum: [invoice, bank_transfer, credit]
 *               po_number:
 *                 type: string
 *                 description: Número da ordem de compra
 *     responses:
 *       200:
 *         description: Pedido criado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 order_id:
 *                   type: string
 *                   format: uuid
 *                 amount:
 *                   type: integer
 *                 total_price:
 *                   type: number
 *                 discount:
 *                   type: number
 *                 payment_instructions:
 *                   type: object
 *       403:
 *         description: Apenas contas business verificadas
 */

export {};