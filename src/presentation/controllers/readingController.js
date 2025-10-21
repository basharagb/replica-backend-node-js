// ==============================
// 📦 Imports
// ==============================
import { ReadingRepository } from '../../infrastructure/repositories/ReadingRepository.js';
import { ReportsReadingRepository } from '../../infrastructure/repositories/ReportsReadingRepository.js';
import { responseFormatter } from '../../infrastructure/utils/responseFormatter.js';
import { handleError } from '../../infrastructure/utils/errorHandler.js';
import { 
  formatLevelsRow, 
  flattenRowsPerSilo,
  formatSensorRowFromRaw,
  formatSensorRowFromReading 
} from '../../infrastructure/utils/responseFormatters.js';

const readingRepo = new ReadingRepository(); // For latest (readings_raw)
const reportsRepo = new ReportsReadingRepository(); // For reports (readings)

// ==============================
// 🏗️ Reading Controller Class
// ==============================
export class ReadingController {

  // 🔹 جلب القراءات حسب معرف المستشعر (Reports - from readings table)
  async getBySensorId(req, res) {
    try {
      const sensorIds = Array.isArray(req.query.sensor_id) 
        ? req.query.sensor_id.map(id => parseInt(id))
        : [parseInt(req.query.sensor_id)];
      
      const { start, end } = req.query;
      const readings = await reportsRepo.findBySensorId(sensorIds, start, end);
      res.json(readings);
    } catch (err) {
      handleError(res, err);
    }
  }

  // 🔹 جلب أحدث القراءات حسب معرف المستشعر (Latest - from readings_raw table)
  async getLatestBySensorId(req, res) {
    try {
      const sensorIds = Array.isArray(req.query.sensor_id) 
        ? req.query.sensor_id.map(id => parseInt(id))
        : [parseInt(req.query.sensor_id)];
      
      const { start, end } = req.query;
      const readings = await readingRepo.findLatestBySensorId(sensorIds, start, end);
      res.json(readings);
    } catch (err) {
      handleError(res, err);
    }
  }

  // 🔹 جلب أعلى القراءات حسب معرف المستشعر (Reports - from readings table)
  async getMaxBySensorId(req, res) {
    try {
      const sensorIds = Array.isArray(req.query.sensor_id) 
        ? req.query.sensor_id.map(id => parseInt(id))
        : [parseInt(req.query.sensor_id)];
      
      const { start, end } = req.query;
      const readings = await reportsRepo.findBySensorId(sensorIds, start, end); // Use reports for max
      res.json(readings);
    } catch (err) {
      handleError(res, err);
    }
  }

  // 🔹 جلب القراءات حسب معرف الكابل (Reports - from readings table)
  async getByCableId(req, res) {
    try {
      const cableIds = Array.isArray(req.query.cable_id) 
        ? req.query.cable_id.map(id => parseInt(id))
        : [parseInt(req.query.cable_id)];
      
      const { start, end } = req.query;
      const readings = await reportsRepo.findByCableId(cableIds, start, end);
      res.json(readings);
    } catch (err) {
      handleError(res, err);
    }
  }

  // 🔹 جلب أحدث القراءات حسب معرف الكابل (Latest - from readings_raw table)
  async getLatestByCableId(req, res) {
    try {
      const cableIds = Array.isArray(req.query.cable_id) 
        ? req.query.cable_id.map(id => parseInt(id))
        : [parseInt(req.query.cable_id)];
      
      const { start, end } = req.query;
      const readings = await readingRepo.findLatestByCableId(cableIds, start, end);
      res.json(readings);
    } catch (err) {
      handleError(res, err);
    }
  }

  // 🔹 جلب أعلى القراءات حسب معرف الكابل (Reports - from readings table)
  async getMaxByCableId(req, res) {
    try {
      const cableIds = Array.isArray(req.query.cable_id) 
        ? req.query.cable_id.map(id => parseInt(id))
        : [parseInt(req.query.cable_id)];
      
      const { start, end } = req.query;
      const readings = await reportsRepo.findByCableId(cableIds, start, end);
      res.json(readings);
    } catch (err) {
      handleError(res, err);
    }
  }

  // 🔹 جلب القراءات حسب معرف الصومعة (Reports - from readings table)
  async getBySiloId(req, res) {
    try {
      const siloIds = Array.isArray(req.query.silo_id) 
        ? req.query.silo_id.map(id => parseInt(id))
        : [parseInt(req.query.silo_id)];
      
      const { start, end } = req.query;
      const readings = await reportsRepo.findBySiloId(siloIds, start, end);
      res.json(readings);
    } catch (err) {
      handleError(res, err);
    }
  }

  // 🔹 جلب أحدث القراءات حسب معرف الصومعة (Latest - from readings_raw table)
  async getLatestBySiloId(req, res) {
    try {
      const siloIds = Array.isArray(req.query.silo_id) 
        ? req.query.silo_id.map(id => parseInt(id))
        : [parseInt(req.query.silo_id)];
      
      const { start, end } = req.query;
      const readings = await readingRepo.findLatestBySiloId(siloIds, start, end);
      res.json(readings);
    } catch (err) {
      handleError(res, err);
    }
  }

  // 🔹 جلب أعلى القراءات حسب معرف الصومعة (Reports - from readings table)
  async getMaxBySiloId(req, res) {
    try {
      const siloIds = Array.isArray(req.query.silo_id) 
        ? req.query.silo_id.map(id => parseInt(id))
        : [parseInt(req.query.silo_id)];
      
      const { start, end } = req.query;
      const readings = await reportsRepo.findBySiloId(siloIds, start, end);
      res.json(readings);
    } catch (err) {
      handleError(res, err);
    }
  }

  // 🔹 جلب القراءات المتوسطة حسب معرف الصومعة (Reports - from readings table)
  async getAvgBySiloId(req, res) {
    try {
      const siloIds = Array.isArray(req.query.silo_id) 
        ? req.query.silo_id.map(id => parseInt(id))
        : [parseInt(req.query.silo_id)];
      
      const { start, end } = req.query;
      const readings = await reportsRepo.findBySiloId(siloIds, start, end); // Use basic method for now
      res.json(readings);
    } catch (err) {
      handleError(res, err);
    }
  }

  // 🔹 جلب أحدث القراءات المتوسطة حسب معرف الصومعة (Latest - from readings_raw table)
  async getLatestAvgBySiloId(req, res) {
    try {
      const siloIds = Array.isArray(req.query.silo_id) 
        ? req.query.silo_id.map(id => parseInt(id))
        : [parseInt(req.query.silo_id)];
      
      const { start, end } = req.query;
      const readings = await readingRepo.findLatestAvgBySiloId(siloIds, start, end);
      res.json(readings);
    } catch (err) {
      handleError(res, err);
    }
  }

  // 🔹 جلب أعلى القراءات المتوسطة حسب معرف الصومعة (Reports - from readings table)
  async getMaxAvgBySiloId(req, res) {
    try {
      const siloIds = Array.isArray(req.query.silo_id) 
        ? req.query.silo_id.map(id => parseInt(id))
        : [parseInt(req.query.silo_id)];
      
      const { start, end } = req.query;
      const readings = await reportsRepo.findBySiloId(siloIds, start, end);
      res.json(readings);
    } catch (err) {
      handleError(res, err);
    }
  }

  // 🔹 جلب القراءات حسب رقم الصومعة (Reports - from readings table)
  async getBySiloNumber(req, res) {
    try {
      const siloNumbers = Array.isArray(req.query.silo_number) 
        ? req.query.silo_number.map(num => parseInt(num))
        : [parseInt(req.query.silo_number)];
      
      const { start, end } = req.query;
      const readings = await reportsRepo.findBySiloNumber(siloNumbers, start, end);
      res.json(readings);
    } catch (err) {
      handleError(res, err);
    }
  }

  // 🔹 جلب أحدث القراءات حسب رقم الصومعة (Latest - from readings_raw table)
  async getLatestBySiloNumber(req, res) {
    try {
      const siloNumbers = Array.isArray(req.query.silo_number) 
        ? req.query.silo_number.map(num => parseInt(num))
        : [parseInt(req.query.silo_number)];
      
      const { start, end } = req.query;
      const rawData = await readingRepo.findLatestBySiloNumber(siloNumbers, start, end);
      
      // Format data using the old Python system structure
      const formattedRows = rawData.map(data => 
        formatLevelsRow(
          data.silo, 
          data.cable_number, 
          data.timestamp.toISOString(), 
          data.levels
        )
      );
      
      // Flatten to combine multiple cables per silo into single rows
      const flattened = flattenRowsPerSilo(formattedRows);
      res.json(flattened);
    } catch (err) {
      handleError(res, err);
    }
  }

  // 🔹 جلب أعلى القراءات حسب رقم الصومعة (Reports - from readings table)
  async getMaxBySiloNumber(req, res) {
    try {
      const siloNumbers = Array.isArray(req.query.silo_number) 
        ? req.query.silo_number.map(num => parseInt(num))
        : [parseInt(req.query.silo_number)];
      
      const { start, end } = req.query;
      const readings = await reportsRepo.findBySiloNumber(siloNumbers, start, end);
      res.json(readings);
    } catch (err) {
      handleError(res, err);
    }
  }

  // 🔹 جلب القراءات المتوسطة حسب رقم الصومعة (Reports - from readings table)
  async getAvgBySiloNumber(req, res) {
    try {
      const siloNumbers = Array.isArray(req.query.silo_number) 
        ? req.query.silo_number.map(num => parseInt(num))
        : [parseInt(req.query.silo_number)];
      
      const { start, end } = req.query;
      const readings = await reportsRepo.findBySiloNumber(siloNumbers, start, end);
      res.json(readings);
    } catch (err) {
      handleError(res, err);
    }
  }

  // 🔹 جلب أحدث القراءات المتوسطة حسب رقم الصومعة (Latest - from readings_raw table)
  async getLatestAvgBySiloNumber(req, res) {
    try {
      const siloNumbers = Array.isArray(req.query.silo_number) 
        ? req.query.silo_number.map(num => parseInt(num))
        : [parseInt(req.query.silo_number)];
      
      const { start, end } = req.query;
      
      // Use repository method that matches Python logic
      const avgData = await readingRepo.findLatestAvgBySiloNumber(siloNumbers, start, end);
      
      // Format each silo's data using formatLevelsRow (matching Python format_levels_row)
      const formattedRows = avgData.map(siloData => {
        const silo = {
          silo_number: siloData.silo_number,
          group_name: siloData.group_name
        };
        
        return formatLevelsRow(
          silo,
          null, // No specific cable for averaged data
          siloData.timestamp.toISOString(),
          siloData.levels
        );
      });
      
      res.json(formattedRows);
    } catch (err) {
      handleError(res, err);
    }
  }

  // 🔹 جلب أعلى القراءات المتوسطة حسب رقم الصومعة (Reports - from readings table)
  async getMaxAvgBySiloNumber(req, res) {
    try {
      const siloNumbers = Array.isArray(req.query.silo_number) 
        ? req.query.silo_number.map(num => parseInt(num))
        : [parseInt(req.query.silo_number)];
      
      const { start, end } = req.query;
      const readings = await reportsRepo.findBySiloNumber(siloNumbers, start, end);
      res.json(readings);
    } catch (err) {
      handleError(res, err);
    }
  }

  // 🔹 جلب القراءات حسب معرف مجموعة الصوامع (Reports - from readings table)
  async getBySiloGroupId(req, res) {
    try {
      const siloGroupIds = Array.isArray(req.query.silo_group_id) 
        ? req.query.silo_group_id.map(id => parseInt(id))
        : [parseInt(req.query.silo_group_id)];
      
      const { start, end } = req.query;
      const readings = await reportsRepo.findBySiloGroupId(siloGroupIds, start, end);
      res.json(readings);
    } catch (err) {
      handleError(res, err);
    }
  }

  // 🔹 جلب أحدث القراءات حسب معرف مجموعة الصوامع (Latest - from readings_raw table)
  async getLatestBySiloGroupId(req, res) {
    try {
      const siloGroupIds = Array.isArray(req.query.silo_group_id) 
        ? req.query.silo_group_id.map(id => parseInt(id))
        : [parseInt(req.query.silo_group_id)];
      
      const { start, end } = req.query;
      const readings = await readingRepo.findBySiloGroupId(siloGroupIds, start, end);
      res.json(readings);
    } catch (err) {
      handleError(res, err);
    }
  }

  // 🔹 جلب أعلى القراءات حسب معرف مجموعة الصوامع (Reports - from readings table)
  async getMaxBySiloGroupId(req, res) {
    try {
      const siloGroupIds = Array.isArray(req.query.silo_group_id) 
        ? req.query.silo_group_id.map(id => parseInt(id))
        : [parseInt(req.query.silo_group_id)];
      
      const { start, end } = req.query;
      const readings = await reportsRepo.findBySiloGroupId(siloGroupIds, start, end);
      res.json(readings);
    } catch (err) {
      handleError(res, err);
    }
  }

  // 🔹 جلب القراءات المتوسطة حسب معرف مجموعة الصوامع (Reports - from readings table)
  async getAvgBySiloGroupId(req, res) {
    try {
      const siloGroupIds = Array.isArray(req.query.silo_group_id) 
        ? req.query.silo_group_id.map(id => parseInt(id))
        : [parseInt(req.query.silo_group_id)];
      
      const { start, end } = req.query;
      const readings = await reportsRepo.findBySiloGroupId(siloGroupIds, start, end);
      res.json(readings);
    } catch (err) {
      handleError(res, err);
    }
  }

  // 🔹 جلب أحدث القراءات المتوسطة حسب معرف مجموعة الصوامع (Latest - from readings_raw table)
  async getLatestAvgBySiloGroupId(req, res) {
    try {
      const siloGroupIds = Array.isArray(req.query.silo_group_id) 
        ? req.query.silo_group_id.map(id => parseInt(id))
        : [parseInt(req.query.silo_group_id)];
      
      const { start, end } = req.query;
      const readings = await readingRepo.findBySiloGroupId(siloGroupIds, start, end);
      res.json(readings);
    } catch (err) {
      handleError(res, err);
    }
  }

  // 🔹 جلب أعلى القراءات المتوسطة حسب معرف مجموعة الصوامع (Reports - from readings table)
  async getMaxAvgBySiloGroupId(req, res) {
    try {
      const siloGroupIds = Array.isArray(req.query.silo_group_id) 
        ? req.query.silo_group_id.map(id => parseInt(id))
        : [parseInt(req.query.silo_group_id)];
      
      const { start, end } = req.query;
      const readings = await reportsRepo.findBySiloGroupId(siloGroupIds, start, end);
      res.json(readings);
    } catch (err) {
      handleError(res, err);
    }
  }
}
