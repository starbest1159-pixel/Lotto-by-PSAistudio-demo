import { ErrorHandler, Injectable, Injector, NgZone, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Notifier } from './notifier';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private injector = inject(Injector);

  handleError(error: unknown): void {
    // 1. Always log error to the browser console for debugging
    console.error('🚨 [Global Handled Exception]:', error);

    // 2. Resolve Notifier lazily to prevent circular dependency or bootstrap errors
    let notifier: Notifier | null = null;
    try {
      notifier = this.injector.get(Notifier);
    } catch (e) {
      console.warn('Could not inject Notifier in GlobalErrorHandler:', e);
    }

    if (!notifier) {
      return;
    }

    // 3. Extract readable details from the error
    let userMessage = 'ขออภัย เกิดข้อผิดพลาดไม่คาดคิดในการทำงานของระบบ';
    let techDetail = '';

    if (error instanceof HttpErrorResponse) {
      if (error.status === 0) {
        userMessage = 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาตรวจสอบอินเทอร์เน็ตของคุณ';
      } else {
        userMessage = `เซิร์ฟเวอร์ตอบกลับด้วยรหัสสถานะผิดพลาด (${error.status})`;
      }
      techDetail = `HTTP ${error.status}: ${error.statusText}\nURL: ${error.url}\nResponse: ${typeof error.error === 'object' ? JSON.stringify(error.error) : error.error}`;
    } else if (error instanceof Error) {
      userMessage = this.translateErrorMessage(error.message);
      techDetail = `${error.name}: ${error.message}\n\nStack Trace:\n${error.stack || 'ไม่มีข้อมูล Stack Trace'}`;
    } else if (typeof error === 'string') {
      userMessage = error;
      techDetail = error;
    } else {
      try {
        techDetail = JSON.stringify(error);
        userMessage = 'เกิดข้อผิดพลาดของออบเจกต์ในระบบ';
      } catch {
        techDetail = String(error);
      }
    }

    // 4. Force state update inside Angular Zone context for safe view updates
    try {
      const ngZone = this.injector.get(NgZone);
      ngZone.run(() => {
        notifier!.showError(userMessage, 'เกิดข้อผิดพลาดในการทำงาน', techDetail);
      });
    } catch {
      notifier.showError(userMessage, 'เกิดข้อผิดพลาดในการทำงาน', techDetail);
    }
  }

  private translateErrorMessage(message: string): string {
    if (!message) return 'เกิดข้อผิดพลาดภายในแอปพลิเคชัน';

    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('cannot read properties of undefined') || lowerMessage.includes('is undefined') || lowerMessage.includes('is null') || lowerMessage.includes('null reading')) {
      if (lowerMessage.includes('totalbets')) {
        return 'ไม่สามารถอ่านสถิติหวยยอดรวมได้เนื่องจากข้อมูลผิดพลาดจากเซิร์ฟเวอร์';
      }
      return 'ระบบขัดข้องเนื่องจากการเข้าถึงตัวแปรล่วงที่ยังไม่ได้กำหนดค่าเริ่มต้น';
    }

    if (lowerMessage.includes('network') || lowerMessage.includes('failed to fetch') || lowerMessage.includes('xmlhttprequest')) {
      return 'โครงข่ายเชื่อมต่อมีปัญหา ไม่สามารถส่งหรือรับข้อมูลรางวัลกับเซิร์ฟเวอร์ได้';
    }

    if (lowerMessage.includes('timeout')) {
      return 'การตอบสนองของระบบหวยช้าผิดปกติ กรุณารอระบบประมวลผลสักครู่';
    }

    if (lowerMessage.includes('auth') || lowerMessage.includes('unauthorized') || lowerMessage.includes('jwt') || lowerMessage.includes('token')) {
      return 'เซสชันการยืนยันตัวตนของคุณไม่ถูกต้อง กรุณาเข้าสู่ระบบใหม่อีกครั้ง';
    }

    if (lowerMessage.includes('permission') || lowerMessage.includes('forbidden') || lowerMessage.includes('access denied')) {
      return 'คุณไม่มีสิทธิ์เพียงพอในการเปิดใช้งานหรือรับชมข้อมูลส่วนนี้';
    }

    return `พบข้อผิดพลาดประมวลผล: ${message}`;
  }
}
