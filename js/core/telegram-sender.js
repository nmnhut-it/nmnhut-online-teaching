/**
 * Telegram Sender for English Grammar Games
 * Automatically sends student results to Telegram when exercises are completed
 */

const TelegramSender = {
  // Telegram Bot Configuration
  BOT_TOKEN: '8460628830:AAG_4Q8EJKGaFc9upOfywuWbEhBylc62cJ4',
  CHAT_ID: '-4901265629',
  API_BASE_URL: 'https://api.telegram.org/bot',

  /**
   * Send student results to Telegram
   * @param {Object} resultData - Complete result data
   * @returns {Promise<boolean>} - True if sent successfully
   */
  async sendResults(resultData) {
    try {
      const message = this.formatResultMessage(resultData);
      const url = `${this.API_BASE_URL}${this.BOT_TOKEN}/sendMessage`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          chat_id: this.CHAT_ID,
          text: message,
          parse_mode: 'HTML'
        })
      });

      if (!response.ok) {
        console.error('Telegram API error:', response.status, response.statusText);
        return false;
      }

      const data = await response.json();
      console.log('Results sent to Telegram successfully:', data);
      return true;

    } catch (error) {
      console.error('Failed to send results to Telegram:', error);
      return false;
    }
  },

  /**
   * Format result data into readable message
   * @param {Object} resultData - Result data object
   * @returns {string} - Formatted message
   */
  formatResultMessage(resultData) {
    const {
      studentName,
      teacherName,
      unitTitle,
      grammarTopics,
      score,
      correctAnswers,
      totalQuestions,
      percentage,
      stars,
      timeSpent,
      hintsUsed,
      timeBonusEarned,
      comboBonusEarned,
      answerHistory,
      completedAt
    } = resultData;

    // Header section
    let message = `<b>📊 BÁO CÁO KẾT QUẢ HỌC TẬP</b>\n\n`;
    message += `<b>👨‍🎓 Học sinh:</b> ${studentName}\n`;
    message += `<b>👩‍🏫 Giáo viên:</b> ${teacherName}\n`;
    message += `<b>📚 Bài học:</b> ${unitTitle}\n`;

    if (grammarTopics && grammarTopics.length > 0) {
      message += `<b>📖 Chủ đề:</b> ${grammarTopics.join(', ')}\n`;
    }

    message += `<b>🕐 Thời gian hoàn thành:</b> ${completedAt}\n`;
    message += `\n`;

    // Score summary section
    message += `<b>━━━━━━━━━━━━━━━━━━</b>\n`;
    message += `<b>⭐ BẢNG ĐIỂM TỔNG KẾT</b>\n`;
    message += `<b>━━━━━━━━━━━━━━━━━━</b>\n\n`;
    message += `<b>🎯 Tổng điểm:</b> ${score} điểm\n`;
    message += `<b>✅ Số câu đúng:</b> ${correctAnswers}/${totalQuestions} (${percentage}%)\n`;
    message += `<b>⏱️ Thời gian:</b> ${this.formatTime(timeSpent)}\n`;
    message += `<b>💡 Gợi ý sử dụng:</b> ${hintsUsed} lần (-${hintsUsed * 2} điểm)\n`;
    message += `<b>🔥 Điểm combo:</b> +${comboBonusEarned} điểm\n`;
    message += `<b>⚡ Điểm thời gian:</b> +${timeBonusEarned} điểm\n`;
    message += `<b>⭐ Xếp hạng:</b> ${'★'.repeat(stars)}${'☆'.repeat(3 - stars)} (${stars}/3)\n`;
    message += `\n`;

    // Detailed answer history
    message += `<b>━━━━━━━━━━━━━━━━━━</b>\n`;
    message += `<b>📝 CHI TIẾT CÂU TRẢ LỜI</b>\n`;
    message += `<b>━━━━━━━━━━━━━━━━━━</b>\n\n`;

    answerHistory.forEach((record, index) => {
      const questionNum = index + 1;
      const statusIcon = record.isCorrect ? '✅' : '❌';
      const statusText = record.isCorrect ? 'ĐÚNG' : 'SAI';

      message += `<b>Câu ${questionNum}:</b> ${this.escapeHtml(record.questionText)}\n`;
      message += `${statusIcon} <b>${statusText}</b> (+${record.points} điểm)\n`;
      message += `📤 Câu trả lời: <code>${this.escapeHtml(this.formatAnswer(record.userAnswer))}</code>\n`;

      if (!record.isCorrect) {
        message += `✓ Đáp án đúng: <code>${this.escapeHtml(this.formatAnswer(record.correctAnswer))}</code>\n`;
      }

      message += `\n`;
    });

    // Footer
    message += `<b>━━━━━━━━━━━━━━━━━━</b>\n`;
    message += `<i>🤖 Báo cáo tự động từ hệ thống English Grammar Games</i>`;

    return message;
  },

  /**
   * Format answer for display
   * @param {any} answer - Answer to format
   * @returns {string} - Formatted answer string
   */
  formatAnswer(answer) {
    if (Array.isArray(answer)) {
      return answer.join(', ');
    }
    if (typeof answer === 'object' && answer !== null) {
      return JSON.stringify(answer);
    }
    return String(answer || '(không trả lời)');
  },

  /**
   * Format time in seconds to readable format
   * @param {number} seconds - Time in seconds
   * @returns {string} - Formatted time string
   */
  formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    if (minutes > 0) {
      return `${minutes} phút ${remainingSeconds} giây`;
    }
    return `${seconds} giây`;
  },

  /**
   * Escape HTML special characters
   * @param {string} text - Text to escape
   * @returns {string} - Escaped text
   */
  escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return String(text).replace(/[&<>"']/g, char => map[char]);
  },

  /**
   * Extract student name from StudentNameManager or page header
   * @returns {string} - Student name or default
   */
  getStudentName() {
    // Try to get from StudentNameManager first
    if (typeof StudentNameManager !== 'undefined') {
      const name = StudentNameManager.getStudentName();
      if (name) return name;
    }

    // Fallback: extract from DOM
    const studentValueElements = document.querySelectorAll('.game-info__value');
    if (studentValueElements.length >= 2) {
      const name = studentValueElements[1].textContent.trim();
      if (name) return name;
    }

    return 'Học sinh';
  },

  /**
   * Extract teacher name from page header
   * @returns {string} - Teacher name or default
   */
  getTeacherName() {
    const teacherElement = document.querySelector('.game-info__value');
    if (teacherElement) {
      return teacherElement.textContent.trim();
    }
    return 'Unknown Teacher';
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TelegramSender;
}
