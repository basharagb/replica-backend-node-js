import { SiloRepository } from '../../infrastructure/repositories/SiloRepository.js';
import { responseFormatter } from '../../infrastructure/utils/responseFormatter.js';
import { handleError } from '../../infrastructure/utils/errorHandler.js';

const siloRepo = new SiloRepository();

export class SiloController {
  // 🔹 جلب جميع الصوامع
  async getAll(req, res) {
    try {
      const silos = await siloRepo.findAll();
      res.json(responseFormatter.success(silos, 'Silos fetched successfully'));
    } catch (err) {
      handleError(res, err);
    }
  }

  // 🔹 جلب صومعة واحدة حسب الـID
  async getById(req, res) {
    try {
      const { id } = req.params;
      const silo = await siloRepo.findById(id);

      if (!silo) {
        return res.status(404).json(responseFormatter.error('Silo not found', 404));
      }

      res.json(responseFormatter.success(silo, 'Silo fetched successfully'));
    } catch (err) {
      handleError(res, err);
    }
  }

  // 🔹 جلب صومعة حسب رقمها
  async getByNumber(req, res) {
    try {
      const { number } = req.params;
      const silo = await siloRepo.findByNumber(number);

      if (!silo) {
        return res.status(404).json(responseFormatter.error('Silo not found', 404));
      }

      res.json(responseFormatter.success(silo, 'Silo fetched successfully'));
    } catch (err) {
      handleError(res, err);
    }
  }
}