import { Request, Response } from 'express';
import knex from '../database/connection';

class PointController {
	async index(req: Request, res: Response) {
		const { city, uf, items } = req.query;

		const parsedItems = String(items)
			.split(',')
			.map(item => Number(item.trim()));

		const points = await knex('points')
			.join('point_items', 'points.id', '=', 'point_items.point_id')
			.whereIn('point_items.item_id', parsedItems)
			.where('city', String(city))
			.where('uf', String(uf))
			.distinct()
			.select('points.*');

		return res.json(points);
	}

	async create(req: Request, res: Response) {
		try {
			//Pegando os dados do Body com desestruturação
			const { name, email, whatsapp, latitude, longitude, city, uf, items } = req.body;

			//Variavel que realiza a transação
			const trx = await knex.transaction();

			//Criando o Point para ser gravado
			const point = {
				image:
					'https://images.unsplash.com/photo-1591159221879-be4e0e5026a0?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=600&q=60',
				name,
				email,
				whatsapp,
				latitude,
				longitude,
				city,
				uf,
			};
			//Realizando o Insert e obtendo o ID do insert
			const insertedIds = await trx('points').insert(point);

			//Fazendo o insert da outra tabela mxm
			const point_id = insertedIds[0];
			const pointItems = items.map((item_id: number) => {
				return {
					item_id,
					point_id,
				};
			});
			//Gravando os items
			await trx('point_items').insert(pointItems);

			//realizando o commit
			trx.commit();

			//Realizando o rettorno agregando o ID
			return res.json({ id: point_id, ...point });
		} catch (error) {
			//Realizando o rettorno do erro caso aconteça
			return res.json({ error: error.message });
		}
	}

	async show(req: Request, res: Response) {
		//Pegando o ID da rota
		const { id } = req.params;

		//Tentando achar o ponto com o ID
		const point = await knex('points').where('id', id).first();

		//Caso não encontre retorne um erro
		if (!point) return res.status(400).json('Ponto não encontrado!');

		//Caso encontre complementa com os items
		const items = await knex('items')
			.join('point_items', 'items.id', '=', 'point_items.id')
			.where('point_items.point_id', id);

		//Retorna o Ponto e Items
		return res.json({ point, items });
	}
}

export default PointController;
