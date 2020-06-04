import { Request, Response } from 'express';
import knex from '../database/connection';

class ItemController {
	async index(req: Request, res: Response) {
		try {
			//Consulta no banco para trazer os items
			const items = await knex('items').select('*');

			//Faz um novo objeto trocando a imagem pela URL completa
			const serializedItems = items.map(item => {
				return {
					title: item.title,
					image_url: `http://localhost:3333/uploads/${item.image}`,
				};
			});

			//Retornando o objeto completo
			return res.json(serializedItems);
		} catch (error) {
			//Realizando o rettorno do erro caso aconteça
			return res.json({ error: error.message });
		}
	}
}

export default ItemController;
