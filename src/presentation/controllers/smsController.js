// ==============================
// 📦 Imports
// ==============================
import { responseFormatter } from '../../infrastructure/utils/responseFormatter.js';
import { handleError } from '../../infrastructure/utils/errorHandler.js';
import { logger } from '../../infrastructure/config/logger.js';

// ==============================
// 🏗️ SMS Controller Class
// ==============================
export class SmsController {

  // 🔹 إرسال رسالة SMS
  async sendMessage(req, res) {
    try {
      const { to, message } = req.body;

      if (!to || !message) {
        return res.status(400).json(
          responseFormatter.error('رقم الهاتف والرسالة مطلوبان', 400)
        );
      }

      // التحقق من صحة رقم الهاتف
      if (!this._isValidPhoneNumber(to)) {
        return res.status(400).json(
          responseFormatter.error('رقم الهاتف غير صحيح', 400)
        );
      }

      // محاكاة إرسال SMS (في التطبيق الحقيقي، استخدم خدمة SMS حقيقية)
      const smsResult = await this._sendSmsMessage(to, message);

      if (smsResult.success) {
        logger.info(`SMS sent successfully to ${to}: ${message}`);
        res.json(responseFormatter.success(
          {
            messageId: smsResult.messageId,
            to: to,
            message: message,
            sentAt: new Date().toISOString(),
            status: 'sent'
          },
          'تم إرسال الرسالة بنجاح'
        ));
      } else {
        logger.error(`Failed to send SMS to ${to}: ${smsResult.error}`);
        res.status(500).json(
          responseFormatter.error('فشل في إرسال الرسالة', 500)
        );
      }
    } catch (err) {
      handleError(res, err);
    }
  }

  // 🔹 فحص حالة خدمة GSM
  async getGsmHealth(req, res) {
    try {
      // محاكاة فحص حالة GSM
      const healthStatus = await this._checkGsmHealth();

      res.json(responseFormatter.success(
        {
          status: healthStatus.status,
          signalStrength: healthStatus.signalStrength,
          networkOperator: healthStatus.networkOperator,
          lastChecked: new Date().toISOString(),
          isOnline: healthStatus.isOnline
        },
        'تم فحص حالة GSM بنجاح'
      ));
    } catch (err) {
      handleError(res, err);
    }
  }

  // 🔹 إرسال تنبيه طوارئ
  async sendEmergencyAlert(req, res) {
    try {
      const { recipients, message, alertLevel } = req.body;

      if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
        return res.status(400).json(
          responseFormatter.error('قائمة المستلمين مطلوبة', 400)
        );
      }

      if (!message) {
        return res.status(400).json(
          responseFormatter.error('نص الرسالة مطلوب', 400)
        );
      }

      const results = [];
      const emergencyPrefix = this._getEmergencyPrefix(alertLevel || 'high');
      const fullMessage = `${emergencyPrefix} ${message}`;

      // إرسال الرسالة لجميع المستلمين
      for (const recipient of recipients) {
        if (this._isValidPhoneNumber(recipient)) {
          try {
            const smsResult = await this._sendSmsMessage(recipient, fullMessage);
            results.push({
              recipient: recipient,
              success: smsResult.success,
              messageId: smsResult.messageId,
              error: smsResult.error
            });
          } catch (error) {
            results.push({
              recipient: recipient,
              success: false,
              error: error.message
            });
          }
        } else {
          results.push({
            recipient: recipient,
            success: false,
            error: 'رقم هاتف غير صحيح'
          });
        }
      }

      const successCount = results.filter(r => r.success).length;
      const failureCount = results.length - successCount;

      logger.info(`Emergency alert sent: ${successCount} successful, ${failureCount} failed`);

      res.json(responseFormatter.success(
        {
          totalRecipients: recipients.length,
          successCount: successCount,
          failureCount: failureCount,
          results: results,
          alertLevel: alertLevel || 'high',
          sentAt: new Date().toISOString()
        },
        `تم إرسال تنبيه الطوارئ: ${successCount} نجح، ${failureCount} فشل`
      ));
    } catch (err) {
      handleError(res, err);
    }
  }

  // 🔹 جلب سجل الرسائل المرسلة
  async getMessageHistory(req, res) {
    try {
      const { limit = 50, offset = 0, from_date, to_date } = req.query;

      // في التطبيق الحقيقي، يجب جلب البيانات من قاعدة البيانات
      const history = await this._getMessageHistory(
        parseInt(limit), 
        parseInt(offset), 
        from_date, 
        to_date
      );

      res.json(responseFormatter.success(
        {
          messages: history.messages,
          total: history.total,
          limit: parseInt(limit),
          offset: parseInt(offset)
        },
        'تم جلب سجل الرسائل بنجاح'
      ));
    } catch (err) {
      handleError(res, err);
    }
  }

  // 🔹 إحصائيات الرسائل
  async getMessageStats(req, res) {
    try {
      const { period = '24h' } = req.query;
      
      const stats = await this._getMessageStats(period);

      res.json(responseFormatter.success(
        {
          period: period,
          totalSent: stats.totalSent,
          totalFailed: stats.totalFailed,
          successRate: stats.successRate,
          averagePerHour: stats.averagePerHour,
          lastMessage: stats.lastMessage
        },
        'تم جلب إحصائيات الرسائل بنجاح'
      ));
    } catch (err) {
      handleError(res, err);
    }
  }

  // ==============================
  // 🔧 Private Helper Methods
  // ==============================

  // التحقق من صحة رقم الهاتف
  _isValidPhoneNumber(phoneNumber) {
    // تحقق بسيط من رقم الهاتف (يمكن تحسينه)
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phoneNumber.replace(/\s+/g, ''));
  }

  // محاكاة إرسال رسالة SMS
  async _sendSmsMessage(to, message) {
    try {
      // محاكاة تأخير الشبكة
      await new Promise(resolve => setTimeout(resolve, 100));

      // محاكاة نجاح/فشل الإرسال (90% نجاح)
      const success = Math.random() > 0.1;

      if (success) {
        return {
          success: true,
          messageId: `sms_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        };
      } else {
        return {
          success: false,
          error: 'Network timeout or GSM module error'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // محاكاة فحص حالة GSM
  async _checkGsmHealth() {
    // محاكاة بيانات حالة GSM
    return {
      status: 'online',
      signalStrength: Math.floor(Math.random() * 31) + 1, // 1-31
      networkOperator: 'Orange JO',
      isOnline: true
    };
  }

  // الحصول على بادئة تنبيه الطوارئ
  _getEmergencyPrefix(alertLevel) {
    const prefixes = {
      low: '⚠️ تنبيه:',
      medium: '🔶 تحذير:',
      high: '🚨 طوارئ:',
      critical: '🔴 حالة طوارئ قصوى:'
    };
    return prefixes[alertLevel] || prefixes.high;
  }

  // محاكاة جلب سجل الرسائل
  async _getMessageHistory(limit, offset, fromDate, toDate) {
    // في التطبيق الحقيقي، يجب جلب البيانات من قاعدة البيانات
    const mockMessages = [];
    const total = 150; // إجمالي وهمي

    for (let i = 0; i < Math.min(limit, 20); i++) {
      mockMessages.push({
        id: offset + i + 1,
        to: `+96279${String(Math.floor(Math.random() * 1000000)).padStart(6, '0')}`,
        message: `رسالة تجريبية رقم ${offset + i + 1}`,
        status: Math.random() > 0.1 ? 'sent' : 'failed',
        sentAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        messageId: `sms_${Date.now() - i * 1000}_${Math.random().toString(36).substr(2, 9)}`
      });
    }

    return {
      messages: mockMessages,
      total: total
    };
  }

  // محاكاة إحصائيات الرسائل
  async _getMessageStats(period) {
    // محاكاة إحصائيات
    const totalSent = Math.floor(Math.random() * 1000) + 100;
    const totalFailed = Math.floor(totalSent * 0.05); // 5% فشل
    const successRate = ((totalSent - totalFailed) / totalSent * 100).toFixed(2);

    return {
      totalSent: totalSent,
      totalFailed: totalFailed,
      successRate: parseFloat(successRate),
      averagePerHour: Math.floor(totalSent / 24),
      lastMessage: new Date(Date.now() - Math.random() * 60 * 60 * 1000).toISOString()
    };
  }
}
